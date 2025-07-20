from openai import OpenAI
from typing import Optional, List
from config import settings
import io
import re
import asyncio
import concurrent.futures
import base64


class TTSService:
    def __init__(self):
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY no configurada")
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.tts_model
        self.voice = settings.tts_voice
        self.min_words = settings.min_words_per_chunk
        self.max_concurrent = settings.max_concurrent_tts
        
        # Instrucciones emocionales para entrevistadora de BCP
        self.system_prompt = """Eres María, entrevistadora virtual oficial del Banco de Crédito del Perú (BCP). 

Instrucciones de voz:
- Tono profesional institucional representando a BCP
- Confiable, competente y seria pero amigable
- Energía positiva pero corporativa
- Pronunciación clara y profesional
- Ritmo pausado y seguro, como una ejecutiva de banco
- Transmite la solidez y prestigio de BCP
- Sonríe sutilmente para generar confianza
- Pausa estratégicamente para dar peso a las preguntas importantes

Eres la imagen vocal de BCP en el proceso de selección para Analista de Datos."""
    
    def _split_text_into_chunks(self, text: str) -> List[str]:
        """Divide el texto en oraciones y agrupa las muy cortas"""
        # Limpiar prefijo "Asistente:" si existe
        text = re.sub(r'^Asistente:\s*', '', text.strip())
        
        # Dividir por puntos, signos de interrogación y exclamación
        sentences = re.split(r'[.!?]+', text)
        
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            word_count = len(sentence.split())
            
            # Si la oración actual es muy corta, acumularla
            if word_count < self.min_words:
                if current_chunk:
                    current_chunk += ". " + sentence
                else:
                    current_chunk = sentence
            else:
                # Si tenemos algo acumulado, agregarlo primero
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""
                
                # Agregar la oración actual
                chunks.append(sentence.strip())
        
        # Agregar cualquier resto acumulado
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return [chunk for chunk in chunks if chunk.strip()]
    
    def _generate_speech_sync(self, text: str) -> Optional[bytes]:
        """Genera audio usando gpt-4o-mini-audio-preview con instrucciones emocionales"""
        try:
            # Para el mensaje inicial, usar un prompt más simple
            if text == "¡Hola! Soy María del BCP. Vamos a iniciar la entrevista para Analista de Datos. ¿Cuál es tu nombre completo?":
                messages = [
                    {
                        "role": "user",
                        "content": text  # Solo el texto, sin instrucciones adicionales
                    }
                ]
            else:
                messages = [
                    {
                        "role": "system",
                        "content": self.system_prompt
                    },
                    {
                        "role": "user",
                        "content": f"Lee esto en voz alta con el estilo indicado: {text}"
                    }
                ]
            
            # Usar chat completions API con modelo audio preview según documentación
            response = self.client.chat.completions.create(
                model=self.model,
                modalities=["text", "audio"],
                audio={
                    "voice": self.voice,
                    "format": "mp3"
                },
                messages=messages,
                max_tokens=1000
            )
            
            # Verificar si hay texto en la respuesta (NO debería haberlo)
            if response.choices[0].message.content:
                print(f"[TTS WARNING] Se generó texto adicional: {response.choices[0].message.content}")
            
            # Extraer el audio base64 de la respuesta
            if (response.choices[0].message.audio and 
                hasattr(response.choices[0].message.audio, 'data') and 
                response.choices[0].message.audio.data):
                audio_data = base64.b64decode(response.choices[0].message.audio.data)
                return audio_data
            else:
                print("No se generó audio en la respuesta")
                return None
            
        except Exception as e:
            print(f"Error generando audio para fragmento: {e}")
            return None
    
    async def generate_speech(self, text: str) -> Optional[bytes]:
        """Genera audio dividiendo el texto en fragmentos procesados en paralelo"""
        try:
            chunks = self._split_text_into_chunks(text)
            
            if not chunks:
                return None
            
            # Si solo hay un fragmento, procesarlo directamente
            if len(chunks) == 1:
                return await self._generate_single_chunk(chunks[0])
            
            print(f"Procesando {len(chunks)} fragmentos en paralelo...")
            
            # Procesar múltiples fragmentos en paralelo
            with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_concurrent) as executor:
                loop = asyncio.get_event_loop()
                tasks = [
                    loop.run_in_executor(executor, self._generate_speech_sync, chunk)
                    for chunk in chunks
                ]
                
                audio_chunks = await asyncio.gather(*tasks)
            
            # Filtrar chunks nulos y combinar
            valid_chunks = [chunk for chunk in audio_chunks if chunk is not None]
            
            if not valid_chunks:
                return None
            
            return self._combine_audio_chunks(valid_chunks)
            
        except Exception as e:
            print(f"Error en generación paralela de audio: {e}")
            return None
    
    async def _generate_single_chunk(self, text: str) -> Optional[bytes]:
        """Genera audio para un solo fragmento de forma asíncrona"""
        loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            return await loop.run_in_executor(executor, self._generate_speech_sync, text)
    
    def _combine_audio_chunks(self, audio_chunks: List[bytes]) -> bytes:
        """Combina múltiples chunks de audio en uno solo"""
        combined = io.BytesIO()
        for chunk in audio_chunks:
            combined.write(chunk)
        
        combined.seek(0)
        return combined.read() 