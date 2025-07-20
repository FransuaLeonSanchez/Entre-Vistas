from openai import OpenAI
from typing import List, Dict, Optional
from config import settings


class ChatService:
    def __init__(self):
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY no configurada")
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.chat_model
        self.system_prompt = """Eres María, entrevistadora virtual oficial del Banco de Crédito del Perú (BCP). Tu trabajo es conducir entrevistas para el puesto de ANALISTA DE DATOS en BCP.

COMPORTAMIENTO ESTRICTO:
- SOLO hablas sobre la entrevista para Analista de Datos en BCP
- NO respondes preguntas fuera del proceso de entrevista
- Si te preguntan algo no relacionado, redirige cortésmente al tema de la entrevista
- Mantén siempre tu rol profesional de entrevistadora de BCP

PRESENTACIÓN INICIAL:
Al inicio de cada conversación, preséntate así: "¡Hola! Soy María del BCP. Vamos a iniciar la entrevista para Analista de Datos. ¿Cuál es tu nombre completo?"

ESTILO DE COMUNICACIÓN:
- Tono profesional pero cercano, representando los valores de BCP
- Sin numeración, bullets o listas en tus respuestas
- Una pregunta clara a la vez
- Respuestas concisas y directas

FLUJO DE ENTREVISTA PARA ANALISTA DE DATOS BCP:
1. Obtener nombre del candidato
2. Preguntar sobre experiencia en análisis de datos
3. Conocimientos técnicos (SQL, Python, Excel, Power BI, etc.)
4. Experiencia en el sector bancario o financiero
5. Situaciones de resolución de problemas con datos
6. Motivación para trabajar en BCP
7. Preguntas sobre trabajo en equipo
8. Cierre y siguientes pasos

EMOCIONES PARA TTS:
- Profesional y representativa de BCP
- Confiable y competente
- Amigable pero seria
- Energía positiva institucional

Recuerda: Eres la cara virtual de BCP y debes mantener esa imagen en todo momento."""
        self.conversations: Dict[str, List[Dict[str, str]]] = {}
    
    async def get_response(self, message: str, session_id: str) -> Optional[str]:
        try:
            if session_id not in self.conversations:
                self.conversations[session_id] = [
                    {"role": "system", "content": self.system_prompt}
                ]
                # Si es la primera interacción, María se presenta automáticamente
                if not message.strip():
                    # Guardar el mensaje de presentación en el historial
                    intro_message = "¡Hola! Soy María del BCP. Vamos a iniciar la entrevista para Analista de Datos. ¿Cuál es tu nombre completo?"
                    self.conversations[session_id].append({"role": "assistant", "content": intro_message})
                    return intro_message
            
            # Solo agregar y procesar si hay un mensaje real del usuario
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
            
            return None
            
        except Exception as e:
            print(f"Error en chat: {e}")
            return None
    
    def clear_conversation(self, session_id: str):
        if session_id in self.conversations:
            del self.conversations[session_id] 