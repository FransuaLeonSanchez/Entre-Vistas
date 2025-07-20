from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from websocket.handler import WebSocketHandler
from config import settings
import uvicorn
import json
import os


app = FastAPI(
    title="Entre-Vistas API",
    description="Simulador de entrevistas laborales con IA. Plataforma que combina STT, GPT-4.1-mini y TTS emocional para crear experiencias de entrevista realistas.",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

ws_handler = WebSocketHandler()


@app.get("/")
async def root():
    return FileResponse("static/index.html")


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "services": {
            "groq_api": bool(settings.groq_api_key),
            "openai_api": bool(settings.openai_api_key)
        }
    }


@app.get("/api/preguntas")
async def get_preguntas():
    """Obtener las preguntas de entrevista desde el archivo JSON"""
    try:
        json_path = os.path.join(os.path.dirname(__file__), 'preguntas.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data['preguntas_entrevista']
    except Exception as e:
        return {"error": f"Error al cargar preguntas: {str(e)}"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Obtener session_id desde query params si está disponible
    session_id_param = websocket.query_params.get("session_id")
    session_id = await ws_handler.connect(websocket, session_id_param)
    await ws_handler.handle_message(websocket, session_id)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 