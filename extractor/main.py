import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn

from models import (
    JobProposalRequest, JobProposalResponse,
    CVAnalysisRequest, CVAnalysisResponse,
    ErrorResponse, Question
)
from openai_service import openai_service

# Cargar variables de entorno
load_dotenv()

# Crear aplicación FastAPI
app = FastAPI(
    title="Entrevistador IA API",
    description="APIs para generar preguntas inteligentes de entrevistas basadas en propuestas laborales y CVs",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Endpoint de bienvenida"""
    return {
        "message": "¡Bienvenido al Entrevistador IA!",
        "version": "1.0.0",
        "endpoints": {
            "analyze_job_proposal": "/api/analyze-job-proposal",
            "analyze_cv": "/api/analyze-cv",
            "docs": "/docs"
        }
    }

@app.post("/api/analyze-job-proposal", response_model=JobProposalResponse)
async def analyze_job_proposal(request: JobProposalRequest):
    """
    Analiza una propuesta laboral y genera preguntas para validar competencias
    
    - **job_description**: Texto de la propuesta laboral
    - **return**: Preguntas y actividades generadas por IA
    """
    try:
        if not request.job_description or len(request.job_description.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="La descripción del trabajo debe tener al menos 50 caracteres"
            )
        
        # Generar preguntas usando OpenAI
        result = openai_service.generate_job_questions(request.job_description)
        
        # Convertir preguntas a objetos Question
        questions = []
        for q in result.get("questions", []):
            questions.append(Question(
                type=q.get("type", "pregunta"),
                content=q.get("content", ""),
                skills_evaluated=q.get("skills_evaluated", []),
                difficulty=q.get("difficulty", "intermedio")
            ))
        
        return JobProposalResponse(
            success=True,
            message="Preguntas generadas exitosamente",
            questions=questions,
            job_summary=result.get("job_summary", ""),
            required_skills=result.get("required_skills", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )

@app.post("/api/analyze-cv", response_model=CVAnalysisResponse)
async def analyze_cv(request: CVAnalysisRequest):
    """
    Analiza un CV y genera preguntas para validar experiencia
    
    - **cv_text**: Texto del CV del candidato
    - **return**: Preguntas para validar experiencia real
    """
    try:
        if not request.cv_text or len(request.cv_text.strip()) < 100:
            raise HTTPException(
                status_code=400,
                detail="El CV debe tener al menos 100 caracteres"
            )
        
        # Generar preguntas usando OpenAI
        result = openai_service.generate_cv_questions(request.cv_text)
        
        # Convertir preguntas a objetos Question
        questions = []
        for q in result.get("questions", []):
            questions.append(Question(
                type=q.get("type", "pregunta"),
                content=q.get("content", ""),
                skills_evaluated=q.get("skills_evaluated", []),
                difficulty=q.get("difficulty", "intermedio")
            ))
        
        return CVAnalysisResponse(
            success=True,
            message="Análisis de CV completado exitosamente",
            questions=questions,
            cv_summary=result.get("cv_summary", ""),
            identified_skills=result.get("identified_skills", []),
            experience_level=result.get("experience_level", "mid")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Verificación de salud del servicio"""
    return {"status": "healthy", "service": "Entrevistador IA"}

if __name__ == "__main__":
    # Verificar que la clave de OpenAI esté configurada
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  ADVERTENCIA: OPENAI_API_KEY no está configurada")
        print("   Por favor, configura tu clave de OpenAI en las variables de entorno")
        print("   Ejemplo: export OPENAI_API_KEY='tu-clave-aqui'")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 