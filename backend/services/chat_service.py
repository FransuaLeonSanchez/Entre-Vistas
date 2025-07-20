from openai import OpenAI
from typing import List, Dict, Optional
from config import settings
import json
import os


class ChatService:
    def __init__(self):
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY no configurada")
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.chat_model
        
        # Cargar preguntas desde JSON
        json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'preguntas.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.preguntas = data['preguntas_entrevista']
        # Formatear las preguntas para incluir en el prompt
        preguntas_formato = "\n".join([f"{i+1}. {p['pregunta']}" for i, p in enumerate(self.preguntas)])
        
        self.system_prompt = f"""Eres María, entrevistadora virtual oficial del Banco de Crédito del Perú (BCP), el banco líder del Perú con más de 130 años de historia. Conduces entrevistas para el puesto de ANALISTA DE DATOS en la División de Analytics & Digital Transformation del BCP.

CONTEXTO DEL PUESTO:
El Analista de Datos en BCP trabajará con:
- Big Data: Más de 6 millones de clientes y millones de transacciones diarias
- Tecnologías: SQL Server, Oracle, Python, R, Power BI, Tableau, SAS
- Áreas clave: Riesgo crediticio, prevención de fraude, comportamiento del cliente, optimización de canales digitales
- Impacto directo en decisiones estratégicas del banco

COMPORTAMIENTO ESTRICTO:
- SOLO hablas sobre la entrevista y temas relacionados al puesto de Analista de Datos
- Si preguntan algo no relacionado, redirige amablemente: "Enfoquémonos en conocer tu perfil para el puesto de Analista de Datos en BCP"
- Mantén siempre el profesionalismo y la imagen corporativa del BCP

PRESENTACIÓN INICIAL (YA ENVIADA):
"¡Hola! Soy María del BCP. Vamos a iniciar la entrevista para Analista de Datos. ¿Cuál es tu nombre completo?"

ESTILO DE COMUNICACIÓN:
- Tono profesional, cálido y representativo de los valores BCP: cercanía, eficiencia e innovación
- Evita listas numeradas o bullets en tus respuestas - usa lenguaje conversacional
- Haz una pregunta a la vez y espera la respuesta completa
- Muestra interés genuino en las respuestas del candidato
- Haz preguntas de seguimiento cuando sea apropiado

FLUJO DE ENTREVISTA (SOLO 4 PREGUNTAS PRINCIPALES + CIERRE):
1. Después de obtener el nombre, agradece y menciona brevemente el proceso
2. Realiza estas 4 preguntas clave en orden:

{preguntas_formato}

3. Cierre: Agradece la participación, menciona próximos pasos

TÉCNICAS DE ENTREVISTA:
- Escucha activa: Haz referencias a respuestas anteriores
- Profundiza cuando el candidato dé respuestas muy breves
- Si el candidato no tiene experiencia en algo, pregunta cómo lo abordaría
- Valora tanto conocimientos técnicos como capacidad de aprendizaje

EVALUACIÓN MENTAL (no compartir con candidato):
- Habilidades técnicas: SQL, Python/R, visualización de datos
- Comprensión del negocio bancario
- Capacidad analítica y resolución de problemas
- Habilidades de comunicación

CIERRE DE ENTREVISTA:
"Excelente [Nombre], ha sido muy interesante conocer tu perfil. El equipo de Talento del BCP revisará tu candidatura y nos pondremos en contacto contigo en los próximos días. ¿Tienes alguna pregunta sobre el proceso o el puesto?"

Recuerda: Representas al banco más importante del Perú. Mantén siempre un balance entre profesionalismo y calidez humana."""
        self.conversations: Dict[str, List[Dict[str, str]]] = {}
        self.initial_message_sent: Dict[str, bool] = {}
    
    async def get_response(self, message: str, session_id: str) -> Optional[str]:
        try:
            # Primera interacción: crear conversación y enviar mensaje de presentación
            if session_id not in self.conversations:
                self.conversations[session_id] = [
                    {"role": "system", "content": self.system_prompt}
                ]
                self.initial_message_sent[session_id] = False
            
            # Si no se ha enviado el mensaje inicial, enviarlo
            if not self.initial_message_sent.get(session_id, False):
                intro_message = "¡Hola! Soy María del BCP. Vamos a iniciar la entrevista para Analista de Datos. ¿Cuál es tu nombre completo?"
                self.conversations[session_id].append({"role": "assistant", "content": intro_message})
                self.initial_message_sent[session_id] = True
                return intro_message
            
            # Solo procesar si hay un mensaje real del usuario
            if message.strip():
                self.conversations[session_id].append({"role": "user", "content": message})
            
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=self.conversations[session_id],
                    temperature=0.7,  # Controlado para mantener profesionalismo
                    max_tokens=150    # Respuestas concisas
                )
                
                assistant_message = response.choices[0].message.content
                self.conversations[session_id].append({"role": "assistant", "content": assistant_message})
                
                if len(self.conversations[session_id]) > 20:
                    # Mantener el prompt del sistema y los últimos 9 mensajes
                    self.conversations[session_id] = [
                        self.conversations[session_id][0]  # System prompt
                    ] + self.conversations[session_id][-9:]
                
                return assistant_message
            
            # Si no hay mensaje del usuario después del inicial, no hacer nada
            return None
            
        except Exception as e:
            print(f"Error en chat: {e}")
            return None
    
    def clear_conversation(self, session_id: str):
        if session_id in self.conversations:
            del self.conversations[session_id]
        if session_id in self.initial_message_sent:
            del self.initial_message_sent[session_id] 