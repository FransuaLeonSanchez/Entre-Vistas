from pydantic import BaseModel
from typing import List, Dict, Optional
from openai import OpenAI
import requests
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configurar cliente OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
SONAR_API_KEY = os.getenv("SONAR_API_KEY")


# Modelos de datos básicos
class PropuestaLaboralTexto(BaseModel):
    texto: str


class PropuestaLaboralConOpciones(BaseModel):
    texto: str
    buscar_empresa: bool = True
    buscar_puesto_mercado: bool = False
    buscar_entrevistador: bool = False
    nombre_entrevistador: Optional[str] = None


class PropuestaLaboral(BaseModel):
    empresa: str
    puesto: str
    descripcion: str
    requisitos: str


class SonarResponse(BaseModel):
    contenido: str
    fuentes: List[Dict] = []


class RespuestaEntrevista(BaseModel):
    preguntas: List[str]
    consejos_conexion: List[str] = []
    informacion_empresa: Dict
    propuesta_extraida: Dict


def extraer_informacion_propuesta(texto: str) -> PropuestaLaboral:
    """Extrae información básica de un texto de propuesta laboral"""

    prompt = f"""
    Analiza el siguiente texto y extrae en formato JSON:
    
    Texto: {texto}
    
    Responde con:
    {{
        "empresa": "nombre de la empresa",
        "puesto": "título del puesto", 
        "descripcion": "descripción del trabajo",
        "requisitos": "requisitos del puesto como texto corrido, separados por punto y coma"
    }}
    
    IMPORTANTE: El campo "requisitos" debe ser un string simple, no un objeto JSON.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Extrae información de propuestas laborales en formato JSON.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )

        import json

        datos = json.loads(response.choices[0].message.content)

        # Manejar el caso donde requisitos es un diccionario
        if isinstance(datos.get("requisitos"), dict):
            requisitos_dict = datos["requisitos"]
            requisitos_text = []
            for categoria, contenido in requisitos_dict.items():
                requisitos_text.append(f"{categoria.capitalize()}: {contenido}")
            datos["requisitos"] = "; ".join(requisitos_text)

        return PropuestaLaboral(**datos)

    except Exception as e:
        print(f"Error: {e}")
        return PropuestaLaboral(
            empresa="Empresa no identificada",
            puesto="Puesto no identificado",
            descripcion=texto[:200],
            requisitos="No especificados",
        )


def buscar_con_sonar(query: str) -> SonarResponse:
    """Busca información usando Sonar de Perplexity de forma básica"""

    if not SONAR_API_KEY:
        return SonarResponse(contenido="API key no configurada", fuentes=[])

    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {SONAR_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "sonar-pro",
        "messages": [{"role": "user", "content": query}],
        "max_tokens": 1500,
        "temperature": 0.3,
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)

        if response.status_code == 200:
            data = response.json()
            content = data["choices"][0]["message"]["content"]

            # Extraer fuentes básicas si existen
            fuentes = []
            if "search_results" in data:
                for i, result in enumerate(data["search_results"][:2]):
                    fuentes.append(
                        {
                            "titulo": result.get("title", "Sin título"),
                            "url": result.get("url", "Sin URL"),
                        }
                    )

            return SonarResponse(contenido=content, fuentes=fuentes)
        else:
            return SonarResponse(contenido="Error en la búsqueda", fuentes=[])

    except Exception as e:
        print(f"Error en Sonar: {e}")
        return SonarResponse(contenido="Información no disponible", fuentes=[])


# Prompts optimizados para búsquedas específicas
def crear_prompt_empresa(empresa: str, puesto: str) -> str:
    """Prompt optimizado para buscar información de la empresa"""
    return f"""Busca información específica sobre {empresa} enfocada en entrevistas para {puesto}:

INFORMACIÓN CLAVE:
- Historia y operaciones de {empresa}
- Tecnologías y herramientas que usa {empresa}
- Cultura organizacional y valores
- Proyectos actuales y desarrollos recientes
- Metodologías de trabajo (ágil, remoto, etc.)
- Beneficios y ambiente laboral

CONTEXTO DEL PUESTO {puesto}:
- Responsabilidades específicas en {empresa}
- Stack tecnológico para {puesto}
- Perfil buscado y competencias valoradas

Enfócate en información verificable para generar preguntas contextualizadas."""


def crear_prompt_mercado(puesto: str) -> str:
    """Prompt optimizado para análisis de mercado del puesto"""
    return f"""Analiza el mercado laboral para {puesto} en Perú:

INFORMACIÓN DEL MERCADO:
- Principales empresas que contratan {puesto}
- Tecnologías más demandadas
- Habilidades y competencias valoradas
- Rangos salariales típicos
- Tendencias actuales del mercado

COMPETENCIAS TÉCNICAS:
- Stack tecnológico más solicitado
- Certificaciones importantes
- Metodologías y frameworks populares
- Soft skills requeridas

Esta información ayudará a entender las expectativas del mercado."""


def crear_prompt_entrevistador(nombre: str) -> str:
    """Prompt optimizado para buscar información del entrevistador"""
    return f"""Busca información profesional sobre {nombre}:

- Perfil profesional y experiencia
- Empresa actual y rol
- Especializaciones técnicas
- Presencia en LinkedIn y redes profesionales
- Artículos, charlas o contenido publicado
- Estilo de liderazgo y valores profesionales

Enfócate en información que ayude a establecer conexión profesional."""


def generar_preguntas(
    propuesta: PropuestaLaboral, informacion_empresa: str = ""
) -> dict:
    """Genera preguntas básicas de entrevista"""

    contexto = (
        f"Información de la empresa: {informacion_empresa}"
        if informacion_empresa
        else ""
    )

    prompt = f"""
    Genera 8 preguntas de entrevista para:
    
    Empresa: {propuesta.empresa}
    Puesto: {propuesta.puesto}
    Descripción: {propuesta.descripcion}
    Requisitos: {propuesta.requisitos}
    
    {contexto}
    
    Responde en formato JSON:
    {{
        "preguntas": [
            "pregunta 1",
            "pregunta 2",
            ...
        ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Genera preguntas de entrevista en formato JSON.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        import json

        resultado = json.loads(response.choices[0].message.content)
        return {"preguntas": resultado.get("preguntas", [])}

    except Exception as e:
        print(f"Error generando preguntas: {e}")
        return {"preguntas": []}


def generar_preguntas_contextualizadas(
    propuesta: PropuestaLaboral,
    info_empresa: str = "",
    info_mercado: str = "",
    info_entrevistador: str = "",
) -> dict:
    """Genera preguntas contextualizadas con múltiples fuentes de información"""

    contexto_completo = ""

    if info_empresa:
        contexto_completo += f"EMPRESA: {info_empresa}\n\n"

    if info_mercado:
        contexto_completo += f"MERCADO: {info_mercado}\n\n"

    if info_entrevistador:
        contexto_completo += f"ENTREVISTADOR: {info_entrevistador}\n\n"

    prompt = f"""
    Genera preguntas de entrevista contextualizadas para:
    
    Empresa: {propuesta.empresa}
    Puesto: {propuesta.puesto}
    Descripción: {propuesta.descripcion}
    Requisitos: {propuesta.requisitos}
    
    CONTEXTO INVESTIGADO:
    {contexto_completo}
    
    Genera 10 preguntas específicas que incorporen:
    - Tecnologías y herramientas de {propuesta.empresa}
    - Cultura y metodologías de la empresa
    - Competencias valoradas en el mercado
    - Contexto específico del puesto
    
    Si hay información del entrevistador, genera también consejos de conexión.
    
    Responde en formato JSON:
    {{
        "preguntas": [
            "pregunta contextualizada 1",
            "pregunta contextualizada 2",
            ...
        ],
        "consejos_conexion": [
            "consejo 1",
            "consejo 2",
            ...
        ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Genera preguntas contextualizadas combinando información específica. Responde en formato JSON válido.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        import json

        resultado = json.loads(response.choices[0].message.content)

        return {
            "preguntas": resultado.get("preguntas", []),
            "consejos_conexion": resultado.get("consejos_conexion", []),
        }

    except Exception as e:
        print(f"Error generando preguntas contextualizadas: {e}")
        return {"preguntas": [], "consejos_conexion": []}
