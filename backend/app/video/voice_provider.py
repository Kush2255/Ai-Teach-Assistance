import os
import uuid
import logging
from gtts import gTTS
from app.config import settings

logger = logging.getLogger(__name__)

class VoiceProvider:
    """TTS Voice generation supporting local gTTS and audio file caching."""

    def __init__(self):
        self.audio_dir = os.path.join(settings.DATA_DIR, "audio")
        os.makedirs(self.audio_dir, exist_ok=True)

    def generate_speech_audio(self, text: str, language: str = "English") -> str:
        lang_code = "en"
        if language == "Hindi":
            lang_code = "hi"
        elif language == "Telugu":
            lang_code = "te"
        elif language == "Hinglish":
            lang_code = "hi"

        filename = f"voice_{uuid.uuid4().hex[:8]}.mp3"
        filepath = os.path.join(self.audio_dir, filename)

        try:
            tts = gTTS(text=text, lang=lang_code, slow=False)
            tts.save(filepath)
            return f"/static/audio/{filename}"
        except Exception as e:
            logger.warning(f"gTTS audio generation failed: {e}")
            return "/static/audio/sample_teacher_voice.mp3"

voice_provider = VoiceProvider()
