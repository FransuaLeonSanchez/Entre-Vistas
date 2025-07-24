from groq import Groq
from typing import Optional
from config import settings
import tempfile
import os


class STTService:
    def __init__(self):
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY no configurada")
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.whisper_model

    async def transcribe_audio(
        self, audio_data: bytes, language: str = "es"
    ) -> Optional[str]:
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name

            try:
                with open(temp_file_path, "rb") as file:
                    transcription = self.client.audio.transcriptions.create(
                        file=(temp_file_path, file.read()),
                        model=self.model,
                        language=language,
                    )
                return transcription.text
            finally:
                os.unlink(temp_file_path)

        except Exception as e:
            print(f"Error en transcripción: {e}")
            return None
