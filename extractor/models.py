from pydantic import BaseModel
from typing import List, Optional

class JobProposalRequest(BaseModel):
    job_description: str
    
class CVAnalysisRequest(BaseModel):
    cv_text: str

class Question(BaseModel):
    type: str  # "pregunta" o "actividad"
    content: str
    skills_evaluated: List[str]
    difficulty: str  # "básico", "intermedio", "avanzado"

class JobProposalResponse(BaseModel):
    success: bool
    message: str
    questions: List[Question]
    job_summary: str
    required_skills: List[str]

class CVAnalysisResponse(BaseModel):
    success: bool
    message: str
    questions: List[Question]
    cv_summary: str
    identified_skills: List[str]
    experience_level: str

class ErrorResponse(BaseModel):
    success: bool
    error: str
    details: Optional[str] = None 