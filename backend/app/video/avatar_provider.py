import os
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class AvatarProvider:
    """Avatar generation interface with HeyGen & D-ID API integration plus dynamic local fallback."""

    def __init__(self):
        self.heygen_key = settings.HEYGEN_API_KEY or os.environ.get("HEYGEN_API_KEY")
        self.did_key = settings.DID_API_KEY or os.environ.get("DID_API_KEY")

    def generate_d_id_talk(self, text: str, voice_url: Optional[str] = None) -> Optional[str]:
        """Call D-ID Talks API to generate an animated speaking presenter."""
        if not self.did_key:
            return None
        try:
            auth_header = self.did_key if self.did_key.startswith("Basic ") or self.did_key.startswith("Bearer ") else f"Basic {self.did_key}"
            headers = {
                "Authorization": auth_header,
                "Content-Type": "application/json"
            }
            payload = {
                "script": {
                    "type": "text",
                    "input": text[:500],
                    "subtitles": False,
                    "provider": {
                        "type": "microsoft",
                        "voice_id": "en-US-JennyNeural"
                    }
                },
                "config": {
                    "fluent": True,
                    "pad_audio": 0.0
                },
                "source_url": "https://create-images-results.d-id.com/DefaultPresenters/Emma_f/image.jpeg"
            }
            with httpx.Client(timeout=8.0) as client:
                res = client.post("https://api.d-id.com/talks", json=payload, headers=headers)
                if res.status_code in (200, 201):
                    data = res.json()
                    talk_id = data.get("id")
                    if talk_id:
                        return data.get("result_url") or f"https://api.d-id.com/talks/{talk_id}"
                else:
                    logger.warning(f"D-ID API response {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"D-ID video generation call failed: {e}")
        return None

    def generate_heygen_video(self, text: str) -> Optional[str]:
        """Call HeyGen API to generate a video avatar lesson."""
        if not self.heygen_key:
            return None
        try:
            headers = {
                "X-Api-Key": self.heygen_key,
                "Content-Type": "application/json"
            }
            payload = {
                "video_inputs": [
                    {
                        "character": {
                            "type": "avatar",
                            "avatar_id": "default",
                            "avatar_style": "normal"
                        },
                        "voice": {
                            "type": "text",
                            "input_text": text[:500],
                            "voice_id": "1bd001e7e50f421d891986aad5158bc8"
                        }
                    }
                ],
                "dimension": {"width": 1280, "height": 720}
            }
            with httpx.Client(timeout=8.0) as client:
                res = client.post("https://api.heygen.com/v2/video/generate", json=payload, headers=headers)
                if res.status_code in (200, 201):
                    data = res.json()
                    return data.get("data", {}).get("video_url") or data.get("data", {}).get("video_id")
                else:
                    logger.warning(f"HeyGen API response {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"HeyGen video generation call failed: {e}")
        return None

    def generate_avatar_stream(self, text: str, voice_url: str) -> Dict[str, Any]:
        """Return video stream if external provider is configured, otherwise local interactive canvas."""
        if self.did_key:
            video_url = self.generate_d_id_talk(text, voice_url)
            if video_url:
                return {
                    "provider": "did",
                    "video_url": video_url,
                    "voice_url": voice_url,
                    "status": "ready"
                }

        if self.heygen_key:
            video_url = self.generate_heygen_video(text)
            if video_url:
                return {
                    "provider": "heygen",
                    "video_url": video_url,
                    "voice_url": voice_url,
                    "status": "ready"
                }

        # Local Interactive Digital Human Canvas Avatar Fallback (Instant, Zero Latency)
        return {
            "provider": "interactive_canvas",
            "avatar_style": "female_professor",
            "expression": "explaining",
            "voice_url": voice_url,
            "status": "ready"
        }

avatar_provider = AvatarProvider()

