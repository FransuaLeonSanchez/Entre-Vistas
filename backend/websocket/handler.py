import asyncio
import base64
import io
import json
import uuid
from typing import Dict
import time

from fastapi import WebSocket
from services.stt_service import STTService
from services.chat_service import ChatService
from services.tts_service import TTSService


class WebSocketHandler:
    def __init__(self):
        self.stt_service = STTService()
        self.chat_service = ChatService()
        self.tts_service = TTSService()
        self.active_sessions: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket) -> str:
        await websocket.accept()
        session_id = str(uuid.uuid4())
        self.active_sessions[session_id] = websocket
        print("connection open")
        
        # María se presenta automáticamente al conectarse
        await self._send_initial_presentation(websocket, session_id)
        
        return session_id
    
    async def _send_initial_presentation(self, websocket: WebSocket, session_id: str):
        """Envía la presentación inicial de María automáticamente"""
        try:
            # Obtener la presentación inicial (mensaje vacío para activar la presentación)
            initial_message = await self.chat_service.get_response("", session_id)
            
            if initial_message:
                # Enviar el mensaje de chat inmediatamente
                await websocket.send_text(json.dumps({
                    "type": "chat_response",
                    "data": initial_message,
                    "timestamp": time.time()
                }))
                
                # Generar y enviar el audio en paralelo
                asyncio.create_task(self._process_and_send_tts(
                    websocket, initial_message, session_id
                ))
                
        except Exception as e:
            print(f"Error en presentación inicial: {e}")
    
    async def disconnect(self, session_id: str):
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            self.chat_service.clear_conversation(session_id)
        print("connection closed")
    
    async def handle_message(self, websocket: WebSocket, session_id: str):
        try:
            while True:
                message = await websocket.receive_text()
                data = json.loads(message)
                
                message_type = data.get("type")
                
                if message_type == "audio":
                    await self._process_audio_message(websocket, data, session_id)
                elif message_type == "text":
                    await self._process_text_message(websocket, data, session_id)
                
        except Exception as e:
            print(f"Error manejando mensaje: {e}")
            await self.disconnect(session_id)
    
    async def _process_audio_message(self, websocket: WebSocket, data: dict, session_id: str):
        try:
            # Procesar STT
            audio_data = base64.b64decode(data["data"])
            
            await websocket.send_text(json.dumps({
                "type": "stt_start",
                "timestamp": time.time()
            }))
            
            print("Transcribiendo con whisper-large-v3-turbo...")
            transcription = await self.stt_service.transcribe_audio(audio_data)
            
            if transcription:
                print(f"Tú: {transcription}")
                
                await websocket.send_text(json.dumps({
                    "type": "stt_result", 
                    "data": transcription,
                    "timestamp": time.time()
                }))
                
                # Procesar chat y TTS en paralelo
                await self._process_chat_and_tts(websocket, transcription, session_id)
            else:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "data": "No se pudo transcribir el audio",
                    "timestamp": time.time()
                }))
                
        except Exception as e:
            print(f"Error procesando audio: {e}")
            await websocket.send_text(json.dumps({
                "type": "error",
                "data": f"Error procesando audio: {str(e)}",
                "timestamp": time.time()
            }))
    
    async def _process_text_message(self, websocket: WebSocket, data: dict, session_id: str):
        try:
            text = data.get("data", "")
            print(f"Tú: {text}")
            
            # Procesar chat y TTS
            await self._process_chat_and_tts(websocket, text, session_id)
            
        except Exception as e:
            print(f"Error procesando texto: {e}")
            await websocket.send_text(json.dumps({
                "type": "error", 
                "data": f"Error procesando texto: {str(e)}",
                "timestamp": time.time()
            }))
    
    async def _process_chat_and_tts(self, websocket: WebSocket, user_message: str, session_id: str):
        """Procesa chat y TTS, enviando respuestas inmediatamente cuando estén listas"""
        
        # Iniciar procesamiento de chat
        await websocket.send_text(json.dumps({
            "type": "chat_start",
            "timestamp": time.time()
        }))
        
        print("Generando respuesta con gpt-4.1-mini...")
        chat_response = await self.chat_service.get_response(user_message, session_id)
        
        if chat_response:
            print(f"María: {chat_response}")
            
            # Enviar respuesta de chat inmediatamente
            await websocket.send_text(json.dumps({
                "type": "chat_response",
                "data": chat_response,
                "timestamp": time.time()
            }))
            
            # Procesar TTS en paralelo (no bloqueante)
            asyncio.create_task(self._process_and_send_tts(
                websocket, chat_response, session_id
            ))
        else:
            await websocket.send_text(json.dumps({
                "type": "error",
                "data": "Error al generar respuesta",
                "timestamp": time.time()
            }))
    
    async def _process_and_send_tts(self, websocket: WebSocket, text: str, session_id: str):
        """Procesa TTS y envía el audio cuando esté listo"""
        try:
            await websocket.send_text(json.dumps({
                "type": "tts_start",
                "timestamp": time.time()
            }))
            
            chunks = self.tts_service._split_text_into_chunks(text)
            print(f"Generando audio ({len(chunks)} fragmentos paralelos)...")
            
            audio_data = await self.tts_service.generate_speech(text)
            
            if audio_data:
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                
                await websocket.send_text(json.dumps({
                    "type": "tts_result",
                    "data": audio_base64,
                    "timestamp": time.time()
                }))
            else:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "data": "Error al generar audio",
                    "timestamp": time.time()
                }))
                
        except Exception as e:
            print(f"Error en TTS: {e}")
            await websocket.send_text(json.dumps({
                "type": "error",
                "data": f"Error al generar audio: {str(e)}",
                "timestamp": time.time()
            })) 