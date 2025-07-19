from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from openai import OpenAI
import requests
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar clientes API
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
SONAR_API_KEY = os.getenv("SONAR_API_KEY")

# Modelos de datos
class PropuestaLaboralTexto(BaseModel):
    texto: str

class PropuestaLaboral(BaseModel):
    empresa: str
    puesto: str
    descripcion: str
    requisitos: str

class RespuestaEntrevista(BaseModel):
    preguntas: List[str]
    actividades: List[str]
    informacion_empresa: Dict
    propuesta_extraida: Dict

# Función para extraer información de la propuesta
def extraer_informacion_propuesta(texto: str) -> PropuestaLaboral:
    """Extrae información estructurada de un texto de propuesta laboral usando OpenAI"""
    
    prompt = f"""
    Analiza el siguiente texto de una propuesta laboral y extrae la información estructurada.
    
    Texto de la propuesta:
    {texto}
    
    Extrae y responde en formato JSON con las siguientes claves:
    - "empresa": nombre de la empresa
    - "puesto": título del puesto
    - "descripcion": descripción del trabajo y responsabilidades
    - "requisitos": concatena toda la información de requisitos, formación, experiencia y competencias en un solo texto
    
    Para el campo "requisitos", incluye toda la información relevante en un párrafo continuo.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un experto en análisis de propuestas laborales. Siempre responde en formato JSON válido con los campos exactos solicitados."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        import json
        datos = json.loads(response.choices[0].message.content)
        
        print(f"Datos extraídos: {datos}")  # Debug
        
        return PropuestaLaboral(**datos)
    except Exception as e:
        print(f"Error extrayendo información: {e}")
        # Valores por defecto si falla
        return PropuestaLaboral(
            empresa="Empresa no identificada",
            puesto="Puesto no identificado", 
            descripcion=texto[:200],
            requisitos="No especificados"
        )

# Función para buscar información con Sonar
def buscar_con_sonar(query: str, search_type: str = "basic") -> str:
    """Busca información usando la API de Sonar de Perplexity con prompts optimizados"""
    url = "https://api.perplexity.ai/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {SONAR_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Seleccionar modelo según el tipo de búsqueda
    model = "sonar" if search_type == "basic" else "sonar-pro"
    
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "Proporciona información precisa, actualizada y bien estructurada basada en fuentes confiables. Si no encuentras información suficiente, indícalo claramente."
            },
            {
                "role": "user", 
                "content": query
            }
        ],
        "max_tokens": 1500,
        "temperature": 0.2,
        "return_citations": True,
        "search_domain_filter": ["linkedin.com", "crunchbase.com", "wikipedia.org", "forbes.com", "bloomberg.com", "reuters.com", "glassdoor.com", "indeed.com"]
    }
    
    try:
        if not SONAR_API_KEY:
            print("SONAR_API_KEY no configurada")
            return "Información no disponible - API key no configurada"
            
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Agregar información de citas si están disponibles
            if "citations" in data:
                citations = data["citations"][:3]  # Primeras 3 citas
                content += f"\n\nFuentes principales: {', '.join([c.get('url', 'N/A') for c in citations])}"
            
            return content
        else:
            print(f"Error en Sonar - Status: {response.status_code}, Response: {response.text}")
            return "Información no disponible en este momento"
            
    except requests.exceptions.Timeout:
        print("Timeout en Sonar API")
        return "Información no disponible - timeout"
    except Exception as e:
        print(f"Error en Sonar: {e}")
        return "Información no disponible"

# Prompts especializados para investigación de empresas
def crear_prompt_empresa(empresa: str) -> str:
    """Crea un prompt optimizado para buscar información sobre una empresa"""
    return f"""Busca información actualizada y específica sobre la empresa {empresa}:

1. Descripción de la empresa y sector de actividad
2. Cultura organizacional y valores corporativos
3. Tecnologías principales que utilizan (stack tecnológico)
4. Estructura organizacional y equipos de trabajo
5. Proyectos recientes o noticias relevantes
6. Beneficios y ambiente laboral
7. Presencia en el mercado peruano/latinoamericano

Enfócate en información que sea útil para un candidato que va a una entrevista laboral."""

def crear_prompt_puesto(puesto: str, empresa: str) -> str:
    """Crea un prompt optimizado para buscar información sobre un puesto específico"""
    return f"""Investigar sobre el puesto de {puesto} en {empresa} y en general:

1. Responsabilidades típicas y tareas principales
2. Habilidades técnicas más demandadas actualmente
3. Tendencias del mercado para este rol
4. Rangos salariales en el mercado peruano
5. Certificaciones o conocimientos valorados
6. Retos comunes que enfrenta este rol
7. Oportunidades de crecimiento profesional

Proporciona información actualizada del mercado laboral y mejores prácticas."""

def crear_prompt_contexto_entrevista(empresa: str, puesto: str) -> str:
    """Crea un prompt para obtener contexto específico para la entrevista"""
    return f"""Proporciona contexto específico para una entrevista de {puesto} en {empresa}:

1. Preguntas frecuentes que hace {empresa} en entrevistas
2. Metodologías de trabajo utilizadas en {empresa}
3. Competidores principales de {empresa}
4. Retos actuales del sector donde opera {empresa}
5. Noticias recientes sobre {empresa} (últimos 6 meses)
6. Perfil típico de empleados en {empresa}
7. Procesos de selección conocidos de {empresa}

Enfócate en información práctica para preparar la entrevista."""

# Función para generar preguntas con OpenAI
def generar_preguntas_actividades(propuesta: PropuestaLaboral, info_empresa: str) -> dict:
    """Genera preguntas y actividades usando OpenAI"""
    
    prompt = f"""
    Eres un experto en recursos humanos y entrevistas técnicas.
    
    Propuesta laboral:
    - Empresa: {propuesta.empresa}
    - Puesto: {propuesta.puesto}
    - Descripción: {propuesta.descripcion}
    - Requisitos: {propuesta.requisitos}
    
    Información adicional sobre la empresa:
    {info_empresa}
    
    Genera:
    1. 5-7 preguntas técnicas y conductuales específicas para este puesto
    2. 2-3 actividades prácticas o ejercicios técnicos
    
    Las preguntas deben evaluar tanto habilidades técnicas como culturales.
    Las actividades deben ser prácticas y relacionadas con el trabajo real.
    
    Responde en formato JSON con las siguientes claves:
    - "preguntas": lista de preguntas
    - "actividades": lista de actividades
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un experto en RRHH que genera preguntas de entrevista específicas y relevantes. Siempre responde en formato JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        import json
        resultado = json.loads(response.choices[0].message.content)
        
        print(f"Preguntas y actividades generadas: {resultado}")  # Debug
        
        return resultado
    except Exception as e:
        print(f"Error en OpenAI: {e}")
        return {"preguntas": [], "actividades": []}

@app.get("/")
async def root():
    return {"mensaje": "API de Entrevistas - Entre-Vistas"}

@app.post("/test")
async def test(data: PropuestaLaboralTexto):
    """Endpoint de prueba para verificar que los datos se reciben correctamente"""
    return {"recibido": data.texto, "longitud": len(data.texto)}

@app.post("/test-sonar")
async def test_sonar(data: dict):
    """Endpoint de prueba para verificar las búsquedas de Sonar"""
    empresa = data.get("empresa", "Entel Perú")
    puesto = data.get("puesto", "IA Engineer")
    tipo_busqueda = data.get("tipo", "empresa")  # empresa, puesto, contexto
    
    try:
        if tipo_busqueda == "empresa":
            query = crear_prompt_empresa(empresa)
            resultado = buscar_con_sonar(query, "basic")
        elif tipo_busqueda == "puesto":
            query = crear_prompt_puesto(puesto, empresa)
            resultado = buscar_con_sonar(query, "advanced")
        elif tipo_busqueda == "contexto":
            query = crear_prompt_contexto_entrevista(empresa, puesto)
            resultado = buscar_con_sonar(query, "advanced")
        else:
            return {"error": "Tipo de búsqueda no válido. Use: empresa, puesto, contexto"}
        
        return {
            "tipo_busqueda": tipo_busqueda,
            "empresa": empresa,
            "puesto": puesto,
            "query_enviado": query,
            "resultado": resultado,
            "longitud_resultado": len(resultado)
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/generar-entrevista", response_model=RespuestaEntrevista)
async def generar_entrevista(propuesta_texto: PropuestaLaboralTexto):
    """Endpoint principal para generar preguntas de entrevista desde texto libre"""
    
    print(f"Texto recibido: {propuesta_texto.texto[:100]}...")
    
    try:
        # 1. Extraer información estructurada del texto con OpenAI
        propuesta = extraer_informacion_propuesta(propuesta_texto.texto)
        print(f"Propuesta extraída exitosamente: {propuesta.empresa} - {propuesta.puesto}")
        
        # 2. Búsquedas especializadas con Sonar
        print("Iniciando búsquedas especializadas...")
        
        # Búsqueda de información de la empresa (básica)
        query_empresa = crear_prompt_empresa(propuesta.empresa)
        info_empresa = buscar_con_sonar(query_empresa, "basic")
        print(f"Info empresa obtenida: {len(info_empresa)} caracteres")
        
        # Búsqueda de información del puesto (avanzada)
        query_puesto = crear_prompt_puesto(propuesta.puesto, propuesta.empresa)
        info_puesto = buscar_con_sonar(query_puesto, "advanced")
        print(f"Info puesto obtenida: {len(info_puesto)} caracteres")
        
        # Búsqueda de contexto específico para entrevista (avanzada)
        query_contexto = crear_prompt_contexto_entrevista(propuesta.empresa, propuesta.puesto)
        info_contexto = buscar_con_sonar(query_contexto, "advanced")
        print(f"Info contexto obtenida: {len(info_contexto)} caracteres")
        
        # 3. Combinar toda la información en un contexto enriquecido
        contexto_enriquecido = f"""
INFORMACIÓN DE LA EMPRESA:
{info_empresa}

INFORMACIÓN DEL PUESTO:
{info_puesto}

CONTEXTO PARA ENTREVISTA:
{info_contexto}
"""
        
        print(f"Contexto total: {len(contexto_enriquecido)} caracteres")
        
        # 4. Generar preguntas y actividades con OpenAI usando el contexto enriquecido
        resultado = generar_preguntas_actividades(propuesta, contexto_enriquecido)
        
        # 5. Extraer preguntas y actividades del resultado
        preguntas = []
        actividades = []
        
        if isinstance(resultado.get("preguntas"), list):
            for pregunta in resultado["preguntas"]:
                if isinstance(pregunta, dict) and "pregunta" in pregunta:
                    preguntas.append(pregunta["pregunta"])
                elif isinstance(pregunta, str):
                    preguntas.append(pregunta)
        
        if isinstance(resultado.get("actividades"), list):
            for actividad in resultado["actividades"]:
                if isinstance(actividad, dict) and "descripcion" in actividad:
                    actividades.append(actividad["descripcion"])
                elif isinstance(actividad, str):
                    actividades.append(actividad)
        
        # 6. Construir respuesta con información enriquecida
        respuesta = RespuestaEntrevista(
            preguntas=preguntas,
            actividades=actividades,
            informacion_empresa={
                "nombre": propuesta.empresa,
                "informacion_encontrada": f"""EMPRESA: {info_empresa[:400]}...

PUESTO: {info_puesto[:400]}...

CONTEXTO ENTREVISTA: {info_contexto[:400]}...""" if info_empresa else "Información no disponible"
            },
            propuesta_extraida={
                "empresa": propuesta.empresa,
                "puesto": propuesta.puesto,
                "descripcion": propuesta.descripcion,
                "requisitos": propuesta.requisitos
            }
        )
        
        print(f"Respuesta construida exitosamente con {len(preguntas)} preguntas y {len(actividades)} actividades")
        return respuesta
        
    except Exception as e:
        print(f"Error en generar_entrevista: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error procesando la solicitud: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 