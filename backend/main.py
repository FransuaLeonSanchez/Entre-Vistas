from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from websocket.handler import WebSocketHandler
from config import settings
from services import search_service
import uvicorn
import json
import os

app = FastAPI(
    title="Entre-Vistas API",
    description="Simulador de entrevistas laborales con IA",
    version="2.0.0",
)

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
    return {
        "mensaje": "API de Entre-Vistas",
        "version": "2.0.0",
        "servicios": [
            "Simulador de entrevistas",
            "Generación de preguntas contextualizadas",
        ],
    }


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "services": {
            "groq_api": bool(settings.groq_api_key),
            "openai_api": bool(settings.openai_api_key),
        },
    }


@app.get("/api/preguntas")
async def get_preguntas():
    """Obtener las preguntas de entrevista desde el archivo JSON"""
    try:
        json_path = os.path.join(os.path.dirname(__file__), "preguntas.json")
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data["preguntas_entrevista"]
    except Exception as e:
        return {"error": f"Error al cargar preguntas: {str(e)}"}


@app.post("/api/generar-entrevista", response_model=search_service.RespuestaEntrevista)
async def generar_entrevista(propuesta_texto: search_service.PropuestaLaboralTexto):
    """Generar preguntas de entrevista desde texto libre"""

    try:
        # Extraer información del texto
        propuesta = search_service.extraer_informacion_propuesta(propuesta_texto.texto)

        # Buscar información de la empresa
        query_empresa = search_service.crear_prompt_empresa(
            propuesta.empresa, propuesta.puesto
        )
        info_empresa = search_service.buscar_con_sonar(query_empresa)

        # Generar preguntas
        resultado = search_service.generar_preguntas(propuesta, info_empresa.contenido)
        preguntas = resultado.get("preguntas", [])

        # Construir respuesta
        respuesta = search_service.RespuestaEntrevista(
            preguntas=preguntas,
            consejos_conexion=[],
            informacion_empresa={
                "nombre": propuesta.empresa,
                "informacion_encontrada": (
                    info_empresa.contenido[:500] + "..."
                    if len(info_empresa.contenido) > 500
                    else info_empresa.contenido
                ),
                "fuentes_consultadas": len(info_empresa.fuentes),
            },
            propuesta_extraida={
                "empresa": propuesta.empresa,
                "puesto": propuesta.puesto,
                "descripcion": propuesta.descripcion,
                "requisitos": propuesta.requisitos,
            },
        )

        return respuesta

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error procesando solicitud: {str(e)}"
        )


@app.post(
    "/api/generar-entrevista-con-opciones",
    response_model=search_service.RespuestaEntrevista,
)
async def generar_entrevista_con_opciones(
    propuesta_opciones: search_service.PropuestaLaboralConOpciones,
):
    """Generar preguntas con opciones de búsqueda específicas"""

    try:
        # Extraer información del texto
        propuesta = search_service.extraer_informacion_propuesta(
            propuesta_opciones.texto
        )

        # Inicializar información
        info_empresa = ""
        info_mercado = ""
        info_entrevistador = ""

        # Buscar según opciones
        if propuesta_opciones.buscar_empresa:
            query_empresa = search_service.crear_prompt_empresa(
                propuesta.empresa, propuesta.puesto
            )
            resultado_empresa = search_service.buscar_con_sonar(query_empresa)
            info_empresa = resultado_empresa.contenido

        if propuesta_opciones.buscar_puesto_mercado:
            query_mercado = search_service.crear_prompt_mercado(propuesta.puesto)
            resultado_mercado = search_service.buscar_con_sonar(query_mercado)
            info_mercado = resultado_mercado.contenido

        if (
            propuesta_opciones.buscar_entrevistador
            and propuesta_opciones.nombre_entrevistador
        ):
            query_entrevistador = search_service.crear_prompt_entrevistador(
                propuesta_opciones.nombre_entrevistador
            )
            resultado_entrevistador = search_service.buscar_con_sonar(
                query_entrevistador
            )
            info_entrevistador = resultado_entrevistador.contenido

        # Generar preguntas contextualizadas
        resultado = search_service.generar_preguntas_contextualizadas(
            propuesta, info_empresa, info_mercado, info_entrevistador
        )

        preguntas = resultado.get("preguntas", [])
        consejos_conexion = resultado.get("consejos_conexion", [])

        # Construir respuesta
        respuesta = search_service.RespuestaEntrevista(
            preguntas=preguntas,
            consejos_conexion=consejos_conexion,
            informacion_empresa={
                "nombre": propuesta.empresa,
                "informacion_encontrada": (
                    info_empresa[:500] + "..."
                    if len(info_empresa) > 500
                    else info_empresa
                ),
                "fuentes_consultadas": 1 if info_empresa else 0,
            },
            propuesta_extraida={
                "empresa": propuesta.empresa,
                "puesto": propuesta.puesto,
                "descripcion": propuesta.descripcion,
                "requisitos": propuesta.requisitos,
            },
        )

        return respuesta

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error procesando solicitud: {str(e)}"
        )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    session_id_param = websocket.query_params.get("session_id")
    session_id = await ws_handler.connect(websocket, session_id_param)
    await ws_handler.handle_message(websocket, session_id)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
