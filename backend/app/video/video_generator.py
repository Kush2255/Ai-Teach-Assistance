from typing import Dict, Any
from app.video.voice_provider import voice_provider
from app.video.avatar_provider import avatar_provider

class VideoGenerator:
    """Full Video Generation Pipeline: Script -> Voice -> Avatar -> Visual Sync."""

    def generate_section_video(self, script: str, language: str = "English") -> Dict[str, Any]:
        audio_url = voice_provider.generate_speech_audio(script, language)
        avatar_payload = avatar_provider.generate_avatar_stream(script, audio_url)

        return {
            "script": script,
            "audio_url": audio_url,
            "avatar": avatar_payload
        }

video_generator = VideoGenerator()
