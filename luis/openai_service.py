import json
import os
from typing import List, Dict
from openai import OpenAI
from models import Question

class OpenAIService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY no está configurada en las variables de entorno")
        self.client = OpenAI(api_key=api_key)
    
    def generate_job_questions(self, job_description: str) -> Dict:
        """Genera preguntas basadas en una descripción de trabajo"""
        
        prompt = f"""
        Analiza la siguiente propuesta laboral y genera:
        1. Un resumen de la propuesta
        2. Lista de habilidades requeridas
        3. 8-10 preguntas/actividades para validar competencias

        PROPUESTA LABORAL:
        {job_description}

        Responde ÚNICAMENTE en formato JSON con esta estructura:
        {{
            "job_summary": "resumen breve del trabajo",
            "required_skills": ["habilidad1", "habilidad2", ...],
            "questions": [
                {{
                    "type": "pregunta",
                    "content": "¿Pregunta específica?",
                    "skills_evaluated": ["habilidad1"],
                    "difficulty": "intermedio"
                }},
                {{
                    "type": "actividad", 
                    "content": "Describe/Implementa/Diseña algo específico",
                    "skills_evaluated": ["habilidad2"],
                    "difficulty": "avanzado"
                }}
            ]
        }}

        Tipos válidos: "pregunta" o "actividad"
        Dificultades válidas: "básico", "intermedio", "avanzado"
        Haz preguntas específicas y prácticas, no genéricas.
        Incluye tanto preguntas teóricas como actividades prácticas.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Eres un experto reclutador de tecnología que crea preguntas precisas para entrevistas."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content.strip()
            # Limpiar posibles marcadores de código
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
            return json.loads(content)
            
        except Exception as e:
            raise Exception(f"Error al generar preguntas de trabajo: {str(e)}")

    def generate_cv_questions(self, cv_text: str) -> Dict:
        """Genera preguntas basadas en un CV"""
        
        prompt = f"""
        Analiza el siguiente CV y genera:
        1. Un resumen de la experiencia
        2. Lista de habilidades identificadas  
        3. Nivel de experiencia estimado
        4. 8-10 preguntas para validar la experiencia real

        CV:
        {cv_text}

        Responde ÚNICAMENTE en formato JSON con esta estructura:
        {{
            "cv_summary": "resumen de la experiencia profesional",
            "identified_skills": ["habilidad1", "habilidad2", ...],
            "experience_level": "junior/mid/senior",
            "questions": [
                {{
                    "type": "pregunta",
                    "content": "¿Pregunta específica sobre su experiencia?",
                    "skills_evaluated": ["habilidad1"],
                    "difficulty": "intermedio"
                }},
                {{
                    "type": "actividad",
                    "content": "Describe un caso específico donde aplicaste X",
                    "skills_evaluated": ["habilidad2"], 
                    "difficulty": "avanzado"
                }}
            ]
        }}

        Tipos válidos: "pregunta" o "actividad"
        Dificultades válidas: "básico", "intermedio", "avanzado"
        Niveles de experiencia: "junior", "mid", "senior"
        Haz preguntas que validen experiencia real, no memorización.
        Incluye preguntas sobre proyectos específicos mencionados.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Eres un experto reclutador que evalúa CVs y crea preguntas para validar experiencia real."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content.strip()
            # Limpiar posibles marcadores de código
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
                
            return json.loads(content)
            
        except Exception as e:
            raise Exception(f"Error al generar preguntas de CV: {str(e)}")

# Instancia global del servicio
openai_service = OpenAIService() 