from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    # APIs
    groq_api_key: Optional[str] = Field(default=None, env="GROQ_API_KEY")
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    
    # Modelos
    whisper_model: str = "whisper-large-v3-turbo"
    chat_model: str = "gpt-4.1-mini"
    tts_model: str = "gpt-4o-mini-audio-preview"  # Cambiado para soportar emociones
    tts_voice: str = "nova"
    
    # Configuración TTS paralelo
    max_concurrent_tts: int = Field(default=10, env="MAX_CONCURRENT_TTS")
    min_words_per_chunk: int = Field(default=4, env="MIN_WORDS_PER_CHUNK")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

# Ejemplo de archivo .env:
"""
GROQ_API_KEY=tu_clave_api_groq_aqui
OPENAI_API_KEY=tu_clave_api_openai_aqui

# Configuración opcional de procesamiento paralelo
MAX_CONCURRENT_TTS=10
MIN_WORDS_PER_CHUNK=4
""" 