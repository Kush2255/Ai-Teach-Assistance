"""
AI Teacher Avatar Provider Layer (Workflow 4)

Provides an extensible abstraction for AI-generated human teachers:
- AITeacherProvider (Abstract Base Class)
  ├── MockAITeacherProvider (Default development/hackathon demo with realistic stream simulation)
  ├── HeyGenAvatarProvider (HeyGen Video/Streaming API integration)
  └── DIDAvatarProvider (D-ID Talks API integration)

Never exposes API keys to frontend; handles provider failovers gracefully.
"""

import os
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


class TeacherVideoPayload:
    def __init__(
        self,
        provider: str,
        video_url: Optional[str] = None,
        stream_url: Optional[str] = None,
        voice_url: Optional[str] = None,
        duration_seconds: float = 45.0,
        status: str = "ready",
        avatar_persona: Optional[Dict[str, Any]] = None,
        timed_captions: Optional[List[Dict[str, Any]]] = None,
    ):
        self.provider = provider
        self.video_url = video_url
        self.stream_url = stream_url
        self.voice_url = voice_url
        self.duration_seconds = duration_seconds
        self.status = status
        self.avatar_persona = avatar_persona or {
            "name": "Dr. Sarah",
            "title": "AI Master Instructor",
            "style": "Empathetic & Structured",
            "avatar_type": "Realistic Human Digital Educator"
        }
        self.timed_captions = timed_captions or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "provider": self.provider,
            "video_url": self.video_url,
            "stream_url": self.stream_url,
            "voice_url": self.voice_url,
            "duration_seconds": self.duration_seconds,
            "status": self.status,
            "avatar_persona": self.avatar_persona,
            "timed_captions": self.timed_captions,
        }


class AITeacherProvider(ABC):
    """Abstract interface for all AI teacher video/avatar providers."""

    @abstractmethod
    def generate_teacher_video(
        self,
        script: str,
        language: str = "English",
        visual_cue: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> TeacherVideoPayload:
        """Generate or retrieve a realistic video segment of the teacher explaining content."""
        pass

    @abstractmethod
    def create_live_session(self, topic: str, style: str = "Visual") -> Dict[str, Any]:
        """Initialize a live interactive teacher streaming session if supported."""
        pass

    @abstractmethod
    def get_provider_status(self) -> Dict[str, Any]:
        """Check availability, API connectivity, and quota status."""
        pass


class MockAITeacherProvider(AITeacherProvider):
    """
    Robust Mock/Development Provider for hackathons and local evaluation.
    Provides realistic video simulation, audio timing, and synchronized interactive canvas
    without incurring API costs or requiring third-party credentials.
    """

    def __init__(self):
        self.name = "mock_realistic_teacher"

    def generate_teacher_video(
        self,
        script: str,
        language: str = "English",
        visual_cue: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> TeacherVideoPayload:
        # Estimate duration based on word count (~130 words per minute for educational pacing)
        words = script.split() if script else []
        word_count = max(1, len(words))
        estimated_duration = round(max(10.0, (word_count / 130.0) * 60.0), 1)

        # Generate timed caption slices for synchronized speech rendering
        timed_captions = []
        chunk_size = 8
        time_per_chunk = estimated_duration / max(1, (len(words) // chunk_size + 1))
        for i in range(0, len(words), chunk_size):
            chunk_words = words[i:i + chunk_size]
            start_t = round((i // chunk_size) * time_per_chunk, 2)
            end_t = round(start_t + time_per_chunk, 2)
            timed_captions.append({
                "start": start_t,
                "end": end_t,
                "text": " ".join(chunk_words)
            })

        # Intelligent Topic-to-Video Resolver: Match exact video asset to subject domain
        topic_str = f"{options.get('topic', '')} {visual_cue or ''} {script[:200]}".lower() if options else f"{visual_cue or ''} {script[:200]}".lower()
        
        if any(k in topic_str for k in ["electric", "voltage", "current", "circuit", "ohm", "resistor", "physics", "charge", "ampere"]):
            selected_video = "/assets/physics_electricity.mp4"
            avatar_title = "Physics & Electronics Lead"
        elif any(k in topic_str for k in ["dna", "gene", "cell", "bio", "evolution", "protein", "organism"]):
            selected_video = "/assets/real_ai_teacher.mp4"
            avatar_title = "Biomedical & Genetics Lead"
        elif any(k in topic_str for k in ["code", "algo", "python", "binary", "data structure", "tree", "sort", "graph", "ai", "machine"]):
            selected_video = "/assets/teacher_presentation.mp4"
            avatar_title = "Computer Science & AI Lead"
        elif any(k in topic_str for k in ["math", "calculus", "equation", "algebra", "integral", "derivative", "matrix"]):
            selected_video = "/assets/teacher_lecture.mp4"
            avatar_title = "Mathematics & Calculus Lead"
        elif any(k in topic_str for k in ["chem", "atom", "molecule", "reaction", "bond", "acid"]):
            selected_video = "/assets/stem_laboratory.mp4"
            avatar_title = "Chemistry & STEM Lead"
        else:
            selected_video = "/assets/teacher_video.mp4"
            avatar_title = "AI Master Educator"

        sample_video = (options.get("sample_video_url") if options else None) or selected_video

        return TeacherVideoPayload(
            provider="mock_realistic_teacher",
            video_url=sample_video,
            stream_url=sample_video,
            voice_url=None,
            duration_seconds=estimated_duration,
            status="ready",
            avatar_persona={
                "name": "Dr. Sarah Adams",
                "title": avatar_title,
                "avatar_type": "Realistic Human AI Teacher",
                "style": options.get("teaching_style", "Visual & Structured") if options else "Visual",
                "language": language,
            },
            timed_captions=timed_captions,
        )

    def create_live_session(self, topic: str, style: str = "Visual") -> Dict[str, Any]:
        return {
            "session_id": f"mock_live_session_{topic.replace(' ', '_').lower()}",
            "status": "connected",
            "provider": "mock_realistic_teacher",
            "capabilities": ["text_to_speech", "lip_sync", "visual_cues", "interactive_canvas"]
        }

    def get_provider_status(self) -> Dict[str, Any]:
        return {
            "provider": "mock",
            "available": True,
            "mode": "development_and_demo",
            "message": "Mock AI Teacher provider is active (zero API cost, instant latency)"
        }


class HeyGenAvatarProvider(AITeacherProvider):
    """Integration for HeyGen Avatar API v2 with video segment caching & quota failover."""

    def __init__(self):
        self.api_key = settings.HEYGEN_API_KEY or os.environ.get("HEYGEN_API_KEY")
        self.avatar_id = settings.AI_TEACHER_AVATAR_ID or "default"
        self._cache: Dict[str, TeacherVideoPayload] = {}

    def generate_teacher_video(
        self,
        script: str,
        language: str = "English",
        visual_cue: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> TeacherVideoPayload:
        if not self.api_key:
            logger.info("HeyGen API key not set, failing over to mock provider.")
            return MockAITeacherProvider().generate_teacher_video(script, language, visual_cue, options)

        # Check cache to preserve HeyGen API credits
        cache_key = f"{self.avatar_id}_{language}_{hash(script)}"
        if cache_key in self._cache:
            logger.info("[HeyGen] Returning cached video payload (0 API credits used).")
            return self._cache[cache_key]

        try:
            headers = {
                "X-Api-Key": self.api_key,
                "Content-Type": "application/json"
            }
            payload = {
                "video_inputs": [
                    {
                        "character": {
                            "type": "avatar",
                            "avatar_id": self.avatar_id,
                            "avatar_style": "normal"
                        },
                        "voice": {
                            "type": "text",
                            "input_text": script[:800],
                            "voice_id": "1bd001e7e50f421d891986aad5158bc8"
                        }
                    }
                ],
                "dimension": {"width": 1280, "height": 720}
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post("https://api.heygen.com/v2/video/generate", json=payload, headers=headers)
                if res.status_code in (200, 201):
                    data = res.json()
                    video_url = data.get("data", {}).get("video_url") or data.get("data", {}).get("video_id")
                    video_payload = TeacherVideoPayload(
                        provider="heygen",
                        video_url=video_url,
                        status="ready" if video_url else "processing"
                    )
                    self._cache[cache_key] = video_payload
                    return video_payload
                elif res.status_code in (429, 402):
                    logger.warning(f"[HeyGen] Quota/credit limit reached ({res.status_code}). Automatic failover to Mock Avatar Provider.")
                else:
                    logger.warning(f"HeyGen returned {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"HeyGen generation call failed: {e}")

        # Graceful fallback to Mock Provider if HeyGen fails or reaches credit limit
        return MockAITeacherProvider().generate_teacher_video(script, language, visual_cue, options)

    def create_live_session(self, topic: str, style: str = "Visual") -> Dict[str, Any]:
        return {"provider": "heygen", "status": "fallback_to_recorded"}

    def get_provider_status(self) -> Dict[str, Any]:
        return {
            "provider": "heygen",
            "available": bool(self.api_key),
            "avatar_id": self.avatar_id,
            "cached_videos": len(self._cache)
        }


class DIDAvatarProvider(AITeacherProvider):
    """Integration for D-ID Talks API."""

    def __init__(self):
        self.api_key = settings.DID_API_KEY or os.environ.get("DID_API_KEY")

    def generate_teacher_video(
        self,
        script: str,
        language: str = "English",
        visual_cue: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> TeacherVideoPayload:
        if not self.api_key:
            logger.info("D-ID API key not set, failing over to mock provider.")
            return MockAITeacherProvider().generate_teacher_video(script, language, visual_cue, options)

        try:
            auth_header = self.api_key if self.api_key.startswith("Basic ") or self.api_key.startswith("Bearer ") else f"Basic {self.api_key}"
            headers = {
                "Authorization": auth_header,
                "Content-Type": "application/json"
            }
            payload = {
                "script": {
                    "type": "text",
                    "input": script[:600],
                    "subtitles": False,
                    "provider": {"type": "microsoft", "voice_id": "en-US-JennyNeural"}
                },
                "config": {"fluent": True, "pad_audio": 0.0},
                "source_url": "https://create-images-results.d-id.com/DefaultPresenters/Emma_f/image.jpeg"
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post("https://api.d-id.com/talks", json=payload, headers=headers)
                if res.status_code in (200, 201):
                    data = res.json()
                    video_url = data.get("result_url") or f"https://api.d-id.com/talks/{data.get('id')}"
                    return TeacherVideoPayload(
                        provider="did",
                        video_url=video_url,
                        status="ready"
                    )
                logger.warning(f"D-ID API returned {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"D-ID call failed: {e}")

        return MockAITeacherProvider().generate_teacher_video(script, language, visual_cue, options)

    def create_live_session(self, topic: str, style: str = "Visual") -> Dict[str, Any]:
        return {"provider": "did", "status": "fallback_to_talks"}

    def get_provider_status(self) -> Dict[str, Any]:
        return {
            "provider": "did",
            "available": bool(self.api_key)
        }


def get_avatar_provider() -> AITeacherProvider:
    """Factory to retrieve active AI Teacher Provider based on settings and credentials."""
    provider_name = (settings.AI_TEACHER_PROVIDER or os.environ.get("AI_TEACHER_PROVIDER", "mock")).lower()
    
    if provider_name == "heygen" and (settings.HEYGEN_API_KEY or os.environ.get("HEYGEN_API_KEY")):
        return HeyGenAvatarProvider()
    elif provider_name == "did" and (settings.DID_API_KEY or os.environ.get("DID_API_KEY")):
        return DIDAvatarProvider()
    
    # Default to MockAITeacherProvider
    return MockAITeacherProvider()


# Singleton instance
avatar_provider = get_avatar_provider()
