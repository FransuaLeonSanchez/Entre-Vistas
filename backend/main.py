from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from websocket.handler import WebSocketHandler
from config import settings
import uvicorn


app = FastAPI(
    title="Entre-Vistas API",
    description="Simulador de entrevistas laborales con IA. Plataforma que combina STT, GPT-4.1-mini y TTS emocional para crear experiencias de entrevista realistas.",
    version="1.0.0"
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


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    session_id = await ws_handler.connect(websocket)
    await ws_handler.handle_message(websocket, session_id)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 