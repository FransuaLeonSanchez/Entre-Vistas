from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from openai import OpenAI
import requests
import aiohttp
import asyncio
import os
from dotenv import load_dotenv
from datetime import datetime

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
    fuentes: List[Dict]
    busquedas_realizadas: bool
    tiempo_respuesta: float
    modelo_usado: str

class RespuestaEntrevista(BaseModel):
    preguntas: List[str]
    consejos_conexion: List[str] = []
    informacion_empresa: Dict
    propuesta_extraida: Dict
    investigacion_detallada: Dict

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
        
        print(f"✅ Datos extraídos: {datos}")
        
        return PropuestaLaboral(**datos)
    except Exception as e:
        print(f"❌ Error extrayendo información: {e}")
        return PropuestaLaboral(
            empresa="Empresa no identificada",
            puesto="Puesto no identificado", 
            descripcion=texto[:200],
            requisitos="No especificados"
        )

# Función optimizada para búsquedas con Sonar - SIEMPRE MÁXIMA CALIDAD
def buscar_con_sonar(query: str, search_type: str = "pro") -> SonarResponse:
    """Busca información usando la API de Sonar de Perplexity con MÁXIMA CALIDAD siempre"""
    
    start_time = datetime.now()
    url = "https://api.perplexity.ai/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {SONAR_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Configuración SIEMPRE de máxima calidad
    modelo = "sonar-pro"
    max_tokens = 2500  # Aumentado para máxima calidad
    temperature = 0.1  # Más preciso para búsquedas específicas
    
    payload = {
        "model": modelo,
        "messages": [
            {
                "role": "system",
                "content": "Eres un investigador experto de élite que proporciona información actualizada, precisa y extremadamente detallada basada en fuentes web confiables de alta calidad. Prioriza fuentes oficiales, verificables y recientes. Incluye detalles específicos, datos concretos y contexto relevante en cada respuesta."
            },
            {
                "role": "user", 
                "content": query
            }
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
        # "search_domain_filter": []  # Permitir búsquedas en toda la web
        "search_recency_filter": "month",  # Últimas búsquedas del mes
        "return_related_questions": True,
        "search_depth_filter": "advanced",  # Búsqueda más profunda
        "enable_clarification_questions": True  # Preguntas de clarificación para mejor contexto
    }
    
    try:
        if not SONAR_API_KEY:
            print("❌ SONAR_API_KEY no configurada")
            return SonarResponse(
                contenido="Información no disponible - API key no configurada",
                fuentes=[],
                busquedas_realizadas=False,
                tiempo_respuesta=0.0,
                modelo_usado="none"
            )
            
        print(f"🔍 Iniciando búsqueda con {modelo} (MÁXIMA CALIDAD)")
        print(f"📝 Prompt enviado: {query[:150]}...")
        print(f"⚡ Configuración: {max_tokens} tokens, temp={temperature}")
        print(f"⏱️  Esperando respuesta...")
        
        response = requests.post(url, json=payload, headers=headers, timeout=45)
        tiempo_respuesta = (datetime.now() - start_time).total_seconds()
        
        if response.status_code == 200:
            data = response.json()
            print(f"🔍 Debug - Claves en respuesta: {list(data.keys())}")
            
            # Validar estructura de respuesta
            if "choices" not in data or not data["choices"]:
                print("❌ Error: Respuesta sin campo 'choices'")
                return SonarResponse(
                    contenido="Error en estructura de respuesta",
                    fuentes=[],
                    busquedas_realizadas=False,
                    tiempo_respuesta=tiempo_respuesta,
                    modelo_usado=modelo
                )
            
            content = data["choices"][0]["message"]["content"]
            
            # Mostrar el contenido de la respuesta en consola
            print(f"📄 CONTENIDO DE LA BÚSQUEDA:")
            print(f"{'='*80}")
            print(content[:500] + "..." if len(content) > 500 else content)
            print(f"{'='*80}")
            
            # Extraer fuentes/citas de la respuesta
            fuentes = []
            
            # Debug: mostrar estructura de datos adicionales (limitado a 3 fuentes)
            if "search_results" in data:
                print(f"🔍 Debug - Encontrados {len(data['search_results'])} resultados (usando máximo 3)")
                if data["search_results"]:
                    print(f"🔍 Debug - Primer tipo de resultado: {type(data['search_results'][0])}")
            
            if "citations" in data:
                print(f"🔍 Debug - Encontradas {len(data['citations'])} citas (usando máximo 3)")
                if data["citations"]:
                    print(f"🔍 Debug - Primer tipo de cita: {type(data['citations'][0])}")
            
            # Extraer fuentes de search_results (limitado a 3 fuentes)
            if "search_results" in data and data["search_results"]:
                for i, result in enumerate(data["search_results"][:3]):  # Máximo 3 fuentes
                    if isinstance(result, dict):
                        fuentes.append({
                            "numero": i + 1,
                            "titulo": result.get("title", result.get("name", "Título no disponible"))[:80] + "..." if len(result.get("title", result.get("name", ""))) > 80 else result.get("title", result.get("name", "Título no disponible")),
                            "url": result.get("url", "URL no disponible"),
                            "fecha": result.get("date", result.get("published_date", "Fecha no disponible"))
                        })
                    else:
                        # Si el resultado es un string u otro tipo
                        fuentes.append({
                            "numero": i + 1,
                            "titulo": str(result)[:80] + "..." if len(str(result)) > 80 else str(result),
                            "url": "URL no disponible",
                            "fecha": "Fecha no disponible"
                        })
            
            # Si no hay search_results, intentar con citations (limitado a 3)
            elif "citations" in data and data["citations"]:
                for i, citation in enumerate(data["citations"][:3]):  # Máximo 3 citas
                    if isinstance(citation, dict):
                        fuentes.append({
                            "numero": i + 1,
                            "titulo": citation.get("title", "Título no disponible")[:80] + "..." if len(citation.get("title", "")) > 80 else citation.get("title", "Título no disponible"),
                            "url": citation.get("url", "URL no disponible"),
                            "fecha": citation.get("date", "Fecha no disponible")
                        })
                    else:
                        # Las citas como strings suelen ser URLs
                        url_citation = str(citation)
                        fuentes.append({
                            "numero": i + 1,
                            "titulo": f"Fuente {i + 1}",
                            "url": url_citation,
                            "fecha": "Fecha no disponible"
                        })
            
            # Mostrar fuentes encontradas en detalle (máximo 3)
            if fuentes:
                print(f"📚 FUENTES ENCONTRADAS ({len(fuentes)}/3):")
                print(f"{'-'*80}")
                for fuente in fuentes:
                    print(f"  {fuente['numero']}. {fuente['titulo']}")
                    if fuente['url'] != "URL no disponible":
                        print(f"     🔗 {fuente['url']}")
                    if fuente['fecha'] != "Fecha no disponible":
                        print(f"     📅 {fuente['fecha']}")
                    print()
                print(f"{'-'*80}")
            else:
                print("⚠️  No se encontraron fuentes específicas")
            
            # Verificar si se realizaron búsquedas web
            busquedas_realizadas = len(fuentes) > 0 or "based on" in content.lower() or "according to" in content.lower()
            
            print(f"✅ Búsqueda completada en {tiempo_respuesta:.2f}s con {len(fuentes)} fuentes")
            
            return SonarResponse(
                contenido=content,
                fuentes=fuentes,
                busquedas_realizadas=busquedas_realizadas,
                tiempo_respuesta=tiempo_respuesta,
                modelo_usado=modelo
            )
        else:
            print(f"❌ Error en Sonar - Status: {response.status_code}, Response: {response.text}")
            return SonarResponse(
                contenido="Información no disponible en este momento",
                fuentes=[],
                busquedas_realizadas=False,
                tiempo_respuesta=tiempo_respuesta,
                modelo_usado=modelo
            )
            
    except requests.exceptions.Timeout:
        print("⏰ Timeout en Sonar API")
        return SonarResponse(
            contenido="Información no disponible - timeout",
            fuentes=[],
            busquedas_realizadas=False,
            tiempo_respuesta=45.0,
            modelo_usado=modelo
        )
    except Exception as e:
        print(f"❌ Error en Sonar: {e}")
        return SonarResponse(
            contenido="Información no disponible",
            fuentes=[],
            busquedas_realizadas=False,
            tiempo_respuesta=0.0,
            modelo_usado="error"
        )

# Función asíncrona para búsquedas paralelas con Sonar
async def buscar_con_sonar_async(query: str, search_type: str = "pro") -> SonarResponse:
    """Versión asíncrona de buscar_con_sonar para paralelización"""
    
    start_time = datetime.now()
    url = "https://api.perplexity.ai/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {SONAR_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Configuración SIEMPRE de máxima calidad
    modelo = "sonar-pro"
    max_tokens = 2500
    temperature = 0.1
    
    payload = {
        "model": modelo,
        "messages": [
            {
                "role": "system",
                "content": "Eres un investigador experto de élite que proporciona información actualizada, precisa y extremadamente detallada basada en fuentes web confiables de alta calidad. Prioriza fuentes oficiales, verificables y recientes. Incluye detalles específicos, datos concretos y contexto relevante en cada respuesta."
            },
            {
                "role": "user", 
                "content": query
            }
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
        "search_recency_filter": "month",
        "return_related_questions": True,
        "search_depth_filter": "advanced",
        "enable_clarification_questions": True
    }
    
    try:
        if not SONAR_API_KEY:
            print("❌ SONAR_API_KEY no configurada")
            return SonarResponse(
                contenido="Información no disponible - API key no configurada",
                fuentes=[],
                busquedas_realizadas=False,
                tiempo_respuesta=0.0,
                modelo_usado="none"
            )
            
        print(f"🔍 Iniciando búsqueda con {modelo} (MÁXIMA CALIDAD - ASYNC)")
        print(f"📝 Prompt enviado: {query[:150]}...")
        
        timeout = aiohttp.ClientTimeout(total=45)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(url, json=payload, headers=headers) as response:
                tiempo_respuesta = (datetime.now() - start_time).total_seconds()
                
                if response.status == 200:
                    data = await response.json()
                    print(f"🔍 Debug - Claves en respuesta: {list(data.keys())}")
                    
                    # Validar estructura de respuesta
                    if "choices" not in data or not data["choices"]:
                        print("❌ Error: Respuesta sin campo 'choices'")
                        return SonarResponse(
                            contenido="Error en estructura de respuesta",
                            fuentes=[],
                            busquedas_realizadas=False,
                            tiempo_respuesta=tiempo_respuesta,
                            modelo_usado=modelo
                        )
                    
                    content = data["choices"][0]["message"]["content"]
                    
                    # Extraer fuentes/citas de la respuesta
                    fuentes = []
                    
                    # Extraer fuentes de search_results (limitado a 3 fuentes)
                    if "search_results" in data and data["search_results"]:
                        for i, result in enumerate(data["search_results"][:3]):
                            if isinstance(result, dict):
                                fuentes.append({
                                    "numero": i + 1,
                                    "titulo": result.get("title", result.get("name", "Título no disponible"))[:80] + "..." if len(result.get("title", result.get("name", ""))) > 80 else result.get("title", result.get("name", "Título no disponible")),
                                    "url": result.get("url", "URL no disponible"),
                                    "fecha": result.get("date", result.get("published_date", "Fecha no disponible"))
                                })
                            else:
                                fuentes.append({
                                    "numero": i + 1,
                                    "titulo": str(result)[:80] + "..." if len(str(result)) > 80 else str(result),
                                    "url": "URL no disponible",
                                    "fecha": "Fecha no disponible"
                                })
                    
                    # Si no hay search_results, intentar con citations (limitado a 3)
                    elif "citations" in data and data["citations"]:
                        for i, citation in enumerate(data["citations"][:3]):
                            if isinstance(citation, dict):
                                fuentes.append({
                                    "numero": i + 1,
                                    "titulo": citation.get("title", "Título no disponible")[:80] + "..." if len(citation.get("title", "")) > 80 else citation.get("title", "Título no disponible"),
                                    "url": citation.get("url", "URL no disponible"),
                                    "fecha": citation.get("date", "Fecha no disponible")
                                })
                            else:
                                url_citation = str(citation)
                                fuentes.append({
                                    "numero": i + 1,
                                    "titulo": f"Fuente {i + 1}",
                                    "url": url_citation,
                                    "fecha": "Fecha no disponible"
                                })
                    
                    # Verificar si se realizaron búsquedas web
                    busquedas_realizadas = len(fuentes) > 0 or "based on" in content.lower() or "according to" in content.lower()
                    
                    print(f"✅ Búsqueda async completada en {tiempo_respuesta:.2f}s con {len(fuentes)} fuentes")
                    
                    return SonarResponse(
                        contenido=content,
                        fuentes=fuentes,
                        busquedas_realizadas=busquedas_realizadas,
                        tiempo_respuesta=tiempo_respuesta,
                        modelo_usado=modelo
                    )
                else:
                    response_text = await response.text()
                    print(f"❌ Error en Sonar - Status: {response.status}, Response: {response_text}")
                    return SonarResponse(
                        contenido="Información no disponible en este momento",
                        fuentes=[],
                        busquedas_realizadas=False,
                        tiempo_respuesta=tiempo_respuesta,
                        modelo_usado=modelo
                    )
                    
    except asyncio.TimeoutError:
        print("⏰ Timeout en Sonar API (async)")
        return SonarResponse(
            contenido="Información no disponible - timeout",
            fuentes=[],
            busquedas_realizadas=False,
            tiempo_respuesta=45.0,
            modelo_usado=modelo
        )
    except Exception as e:
        print(f"❌ Error en Sonar async: {e}")
        return SonarResponse(
            contenido="Información no disponible",
            fuentes=[],
            busquedas_realizadas=False,
            tiempo_respuesta=0.0,
            modelo_usado="error"
        )

# Función para ejecutar búsquedas en paralelo
async def ejecutar_busquedas_paralelas(busquedas: List[tuple]) -> List[SonarResponse]:
    """
    Ejecuta múltiples búsquedas de Sonar en paralelo
    busquedas: Lista de tuplas (query, nombre_busqueda)
    """
    print(f"\n⚡ EJECUTANDO {len(busquedas)} BÚSQUEDAS EN PARALELO")
    print(f"{'='*80}")
    
    start_time = datetime.now()
    
    # Crear las tareas asíncronas
    tasks = []
    for query, nombre in busquedas:
        print(f"🚀 Preparando búsqueda: {nombre}")
        task = buscar_con_sonar_async(query)
        tasks.append(task)
    
    # Ejecutar todas las búsquedas en paralelo
    print(f"⚡ Iniciando {len(tasks)} búsquedas simultáneas...")
    resultados = await asyncio.gather(*tasks)
    
    tiempo_total = (datetime.now() - start_time).total_seconds()
    print(f"✅ TODAS LAS BÚSQUEDAS COMPLETADAS EN {tiempo_total:.2f}s")
    print(f"{'='*80}")
    
    return resultados

# Prompt integral para investigación completa de empresa y puesto
def crear_prompt_integral(empresa: str, puesto: str) -> str:
    """Busca información completa sobre la empresa, cultura y puesto en una sola consulta"""
    return f"""Busca información COMPLETA y detallada sobre {empresa} y el puesto {puesto}. Incluye TODA la información necesaria para generar preguntas de entrevista contextualizadas:

INFORMACIÓN EMPRESARIAL COMPLETA:
- Historia, fundación y evolución de {empresa}
- Modelo de negocio, servicios principales y productos
- Tamaño de la empresa (empleados, facturación, presencia global)
- Tecnologías, plataformas y herramientas específicas que utiliza {empresa}
- Proyectos actuales, iniciativas importantes y desarrollos recientes
- Posición en el mercado, competidores y sector de la industria
- Noticias recientes y desarrollos estratégicos (últimos 6-12 meses)

CULTURA ORGANIZACIONAL Y AMBIENTE LABORAL:
- Valores corporativos, principios y misión de {empresa}
- Metodologías de trabajo y procesos (ágil, remoto, presencial, híbrido)
- Beneficios específicos y políticas de recursos humanos
- Programas de desarrollo profesional y crecimiento
- Estilo de liderazgo y estructura organizacional
- Ambiente de trabajo y cultura de equipo
- Testimonios de empleados y experiencias laborales

CONTEXTO ESPECÍFICO DEL PUESTO {puesto}:
- Responsabilidades exactas del {puesto} en {empresa}
- Tecnologías, herramientas y metodologías específicas para este rol
- Estructura del equipo y colaboración interdepartamental
- Proyectos típicos y retos específicos del {puesto} en {empresa}
- Perfil ideal y competencias buscadas por {empresa}
- Oportunidades de crecimiento y desarrollo profesional
- Contexto salarial y compensación en el mercado

FUENTES A CONSULTAR:
- Página web oficial de {empresa}
- LinkedIn (empresa y empleados)
- Glassdoor y plataformas de reseñas laborales
- Ofertas laborales actuales de {empresa}
- Comunicados de prensa y noticias recientes
- Entrevistas con ejecutivos y empleados
- Informes de industria y análisis de mercado

Proporciona información detallada, específica y verificable que permita generar preguntas de entrevista contextualizadas con datos reales de {empresa}."""

# Función específica para búsqueda de información de empresa
def crear_prompt_empresa(empresa: str, puesto: str) -> str:
    """Busca información específica sobre la empresa en Perú - contexto, tecnologías, cultura"""
    return f"""Busca información DETALLADA y específica sobre {empresa} en Perú, enfocándote en el contexto para entrevistas del puesto {puesto}:

INFORMACIÓN EMPRESARIAL EN PERÚ:
- Historia y presencia de {empresa} en Perú específicamente
- Operaciones, servicios y productos de {empresa} en el mercado peruano
- Tamaño de operaciones en Perú (empleados, oficinas, proyectos)
- Tecnologías, plataformas y herramientas específicas que utiliza {empresa} en Perú
- Stack tecnológico, metodologías de desarrollo y arquitectura técnica
- Proyectos actuales y desarrollos importantes en Perú
- Clientes principales y sectores que atiende en Perú

CULTURA Y AMBIENTE LABORAL EN PERÚ:
- Valores corporativos y cultura organizacional de {empresa} en Perú
- Metodologías de trabajo (ágil, DevOps, frameworks específicos)
- Modalidad de trabajo (remoto, híbrido, presencial) en oficinas peruanas
- Beneficios y políticas específicas para empleados en Perú
- Programas de capacitación y desarrollo profesional
- Ambiente de trabajo y testimonios de empleados en Perú

CONTEXTO ESPECÍFICO DEL PUESTO {puesto}:
- Cómo opera el área de {puesto} dentro de {empresa} en Perú
- Tecnologías y herramientas específicas para {puesto} en {empresa}
- Proyectos típicos y responsabilidades del {puesto} en {empresa}
- Perfil buscado y competencias valoradas por {empresa} para {puesto}

NOTICIAS Y DESARROLLOS RECIENTES:
- Noticias recientes de {empresa} en Perú (últimos 6-12 meses)
- Expansiones, nuevos proyectos o iniciativas en Perú
- Comunicados de prensa y desarrollos estratégicos

Enfócate en información verificable y específica que permita generar preguntas contextualizadas para una entrevista de {puesto} en {empresa}."""

# Función específica para búsqueda de mercado laboral del puesto
def crear_prompt_puesto_mercado(puesto: str) -> str:
    """Busca información sobre puestos similares en otras empresas de Perú para contexto de mercado"""
    return f"""Busca información sobre el mercado laboral del puesto {puesto} en Perú, incluyendo otras empresas y contexto sectorial:

ANÁLISIS DE MERCADO DEL PUESTO {puesto} EN PERÚ:
- Principales empresas en Perú que contratan para {puesto}
- Tecnologías más demandadas para {puesto} en el mercado peruano
- Habilidades y competencias más valoradas en Perú para {puesto}
- Rangos salariales y compensación típica para {puesto} en Perú
- Tendencias actuales del mercado laboral para {puesto}

EMPRESAS REFERENCIALES EN PERÚ:
- Principales empresas tecnológicas/consultoras que contratan {puesto}
- Startups y empresas emergentes con posiciones de {puesto}
- Corporaciones multinacionales con operaciones en Perú
- Modalidades de trabajo más comunes (remoto, híbrido, presencial)

COMPETENCIAS Y TECNOLOGÍAS EN DEMANDA:
- Stack tecnológico más solicitado para {puesto} en Perú
- Certificaciones y habilidades técnicas valoradas
- Soft skills y competencias blandas importantes
- Metodologías y frameworks más utilizados

CONTEXTO SECTORIAL:
- Sectores de la industria que más demandan {puesto} en Perú
- Proyectos típicos y retos comunes en {puesto}
- Oportunidades de crecimiento profesional en el mercado peruano
- Tendencias de transformación digital que afectan {puesto}

Esta información ayudará a entender el contexto competitivo y las expectativas del mercado para {puesto} en Perú."""

# Función específica para búsqueda de información del reclutador
def crear_prompt_reclutador(nombre_reclutador: str, empresa: str) -> str:
    """Busca información específica sobre el reclutador para contextualizar la entrevista"""
    return f"""Busca información profesional sobre {nombre_reclutador} de {empresa} para contextualizar la entrevista:

INFORMACIÓN PROFESIONAL DEL RECLUTADOR:
- Perfil profesional de {nombre_reclutador} en {empresa}
- Posición actual y rol dentro de {empresa}
- Experiencia profesional y trayectoria en recursos humanos o reclutamiento
- Especialización en tipos de puestos o sectores específicos
- Tiempo trabajando en {empresa} y roles anteriores

ESTILO Y ENFOQUE DE RECLUTAMIENTO:
- Metodología o estilo de entrevistas de {nombre_reclutador}
- Competencias o habilidades que típicamente evalúa
- Enfoque en entrevistas técnicas vs. competencias blandas
- Testimonios o feedback de candidatos previos

CONTEXTO EN {empresa}:
- Área o departamento donde trabaja {nombre_reclutador}
- Tipos de posiciones que típicamente maneja en {empresa}
- Proceso de selección característico que utiliza
- Criterios de evaluación que suele priorizar

PRESENCIA PROFESIONAL:
- Perfil en LinkedIn de {nombre_reclutador}
- Artículos, publicaciones o contenido profesional
- Participación en eventos o conferencias de RRHH
- Reconocimientos o logros profesionales

Esta información ayudará a adaptar la preparación de la entrevista al estilo específico del reclutador."""

# Función específica para búsqueda de información personal del entrevistador
def crear_prompt_entrevistador_personal(nombre_entrevistador: str, empresa: str) -> str:
    """Busca información personal y amplia sobre el entrevistador como persona para establecer conexión"""
    return f"""Busca información PERSONAL y completa sobre {nombre_entrevistador} que trabaja en {empresa}, enfocándote en conocer a la PERSONA detrás del profesional:

INFORMACIÓN PERSONAL Y PROFESIONAL:
- Perfil completo de {nombre_entrevistador} como persona y profesional
- Trasfondo personal, educación y formación de {nombre_entrevistador}
- Experiencia laboral, trayectoria profesional y especialización
- Posición actual en {empresa} y responsabilidades

INTERESES PERSONALES Y PASIONES:
- Hobbies, aficiones y actividades que disfruta {nombre_entrevistador}
- Deportes que practica o equipos que sigue
- Intereses en tecnología, arte, música, literatura, viajes
- Actividades de tiempo libre y entretenimiento

PRESENCIA EN REDES SOCIALES Y DIGITAL:
- Perfil en LinkedIn con contenido personal y profesional
- Presencia en Twitter, Instagram u otras redes sociales
- Publicaciones, artículos o contenido que comparte
- Opiniones, pensamientos o reflexiones que expresa públicamente

VALORES Y PERSPECTIVAS PERSONALES:
- Causas sociales o valores que defiende {nombre_entrevistador}
- Filosofía de trabajo y enfoque personal hacia el liderazgo
- Participación en comunidades, eventos o iniciativas
- Reconocimientos personales o logros destacados

ESTILO PERSONAL Y COMUNICACIÓN:
- Forma de comunicarse y expresarse públicamente
- Estilo de liderazgo o interacción con equipos
- Anécdotas, experiencias o historias personales compartidas
- Personalidad y características distintivas

CONEXIONES Y NETWORKING:
- Industrias o sectores donde tiene influencia
- Mentores, colegas o figuras que admira
- Participación en conferencias, eventos o charlas
- Colaboraciones o proyectos personales

Esta información ayudará a establecer una conexión más personal y humana durante la entrevista, conociendo los intereses, valores y personalidad de {nombre_entrevistador}."""

# Función para generar preguntas con OpenAI
def generar_preguntas(propuesta: PropuestaLaboral, informacion_integral: str) -> dict:
    """Genera preguntas usando OpenAI con contexto integral enriquecido"""
    
    # Usar la información integral obtenida de la búsqueda única
    info_completa = f"""
INFORMACIÓN INTEGRAL INVESTIGADA SOBRE {propuesta.empresa}:
{informacion_integral}
"""
    
    prompt = f"""
    Eres un experto en recursos humanos y entrevistas técnicas especializadas.
    
    PROPUESTA LABORAL:
    - Empresa: {propuesta.empresa}
    - Puesto: {propuesta.puesto}
    - Descripción: {propuesta.descripcion}
    - Requisitos: {propuesta.requisitos}
    
    CONTEXTO ESPECÍFICO INVESTIGADO:
    {info_completa}
    
    INSTRUCCIONES ESPECÍFICAS:
    Basándote DIRECTAMENTE en la información específica investigada sobre {propuesta.empresa}, genera:
    
    10-12 preguntas de EVALUACIÓN CONTEXTUALIZADAS para que el ENTREVISTADOR le haga al CANDIDATO:
    
    TIPOS DE PREGUNTAS CON CONTEXTO ESPECÍFICO:
    - 3-4 preguntas técnicas que mencionen EXPLÍCITAMENTE las tecnologías, herramientas, plataformas o metodologías específicas que usa {propuesta.empresa} según la investigación
    - 3-4 preguntas situacionales que incorporen DIRECTAMENTE los valores, cultura, metodologías de trabajo o retos específicos mencionados en la investigación sobre {propuesta.empresa}
    - 4-5 preguntas de competencias que incluyan REFERENCIAS ESPECÍFICAS a proyectos reales, productos, servicios o contexto de mercado de {propuesta.empresa} encontrado en la investigación
    
    CÓMO POTENCIAR LAS PREGUNTAS CON CONTEXTO:
    - INCLUYE nombres específicos de tecnologías, productos, plataformas que usa {propuesta.empresa}
    - MENCIONA metodologías, procesos o enfoques específicos encontrados en la investigación
    - INCORPORA retos reales, proyectos actuales o iniciativas específicas de {propuesta.empresa}
    - REFERENCIA la cultura, valores o ambiente de trabajo específico identificado
    - USA el contexto de la industria, mercado o sector donde opera {propuesta.empresa}
    
    FORMATO DE PREGUNTAS CONTEXTUALIZADAS:
    - "En {propuesta.empresa} utilizamos [tecnología específica encontrada] para [contexto específico]. ¿Cómo abordarías [situación técnica]?"
    - "Considerando que {propuesta.empresa} [contexto cultural/organizacional específico], describe cómo manejarías [situación]"
    - "Dado que {propuesta.empresa} está trabajando en [proyecto/iniciativa específica encontrada], ¿qué estrategia usarías para [competencia específica]?"
    
    REQUISITOS CRÍTICOS:
    - CADA pregunta DEBE incluir al menos UNA referencia específica de la investigación
    - EVITA preguntas genéricas - todas deben estar contextualizadas con información real de {propuesta.empresa}
    - INCORPORA datos concretos, nombres de productos, tecnologías, proyectos o metodologías encontradas
    - Las preguntas evalúan al candidato USANDO el contexto específico como marco de referencia
    
    Responde en formato JSON con las siguientes claves:
    - "preguntas": lista de strings con las preguntas específicas
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un experto en RRHH que genera preguntas de entrevista CONTEXTUALIZADAS y específicas. SIEMPRE incluyes información específica de la empresa investigada en cada pregunta. Las preguntas deben incorporar tecnologías, proyectos, cultura y contexto real de la empresa. Responde SIEMPRE en formato JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        import json
        resultado = json.loads(response.choices[0].message.content)
        
        # Mostrar preguntas generadas
        preguntas = resultado.get('preguntas', [])
        
        print(f"✅ Preguntas contextualizadas generadas: {len(preguntas)} preguntas potenciadas con información específica de {propuesta.empresa}")
        
        if preguntas:
            print(f"\n🤔 PREGUNTAS CONTEXTUALIZADAS CON INFORMACIÓN ESPECÍFICA DE {propuesta.empresa.upper()}:")
            print(f"{'='*80}")
            for i, pregunta in enumerate(preguntas, 1):
                print(f"  {i}. {pregunta}")
                print()
            print(f"{'='*80}")
        
        return resultado
    except Exception as e:
        print(f"❌ Error en OpenAI: {e}")
        return {"preguntas": []}

# Función para generar preguntas con información múltiple (empresa + mercado + entrevistador)
def generar_preguntas_con_contexto_multiple(propuesta: PropuestaLaboral, info_empresa: str = "", info_mercado: str = "", info_entrevistador: str = "") -> dict:
    """Genera preguntas usando OpenAI con múltiples contextos de información"""
    
    # Construir información contextual combinada
    contexto_completo = ""
    
    if info_empresa:
        contexto_completo += f"""
INFORMACIÓN ESPECÍFICA DE {propuesta.empresa}:
{info_empresa}

"""
    
    if info_mercado:
        contexto_completo += f"""
CONTEXTO DEL MERCADO LABORAL PARA {propuesta.puesto} EN PERÚ:
{info_mercado}

"""
    
    if info_entrevistador:
        contexto_completo += f"""
INFORMACIÓN PERSONAL DEL ENTREVISTADOR:
{info_entrevistador}

"""
    
    prompt = f"""
    Eres un experto en recursos humanos y entrevistas técnicas especializadas.
    
    PROPUESTA LABORAL:
    - Empresa: {propuesta.empresa}
    - Puesto: {propuesta.puesto}
    - Descripción: {propuesta.descripcion}
    - Requisitos: {propuesta.requisitos}
    
    CONTEXTO INVESTIGADO:
    {contexto_completo}
    
    INSTRUCCIONES ESPECÍFICAS:
    Basándote en toda la información investigada, genera 10-12 preguntas de EVALUACIÓN CONTEXTUALIZADAS:
    
    TIPOS DE PREGUNTAS:
    - 3-4 preguntas técnicas incorporando tecnologías específicas de {propuesta.empresa} y del mercado
    - 3-4 preguntas situacionales basadas en la cultura de {propuesta.empresa} y personalidad del entrevistador
    - 4-5 preguntas de competencias que combinen información de la empresa, mercado y conexión personal con el entrevistador
    
    CÓMO POTENCIAR LAS PREGUNTAS:
    - INCLUYE tecnologías y metodologías específicas de {propuesta.empresa}
    - INCORPORA tendencias del mercado laboral para {propuesta.puesto} en Perú
    - ADAPTA el enfoque para establecer conexión personal con el entrevistador (intereses, valores, personalidad)
    - MENCIONA competencias valoradas en el mercado peruano
    - REFERENCIA proyectos y retos específicos de {propuesta.empresa}
    - CREA oportunidades para conversación natural sobre intereses comunes
    
    ESTRATEGIA DE CONEXIÓN PERSONAL:
    - Si hay información del entrevistador, sugiere formas sutiles de mencionar intereses compartidos
    - Incluye preguntas que permitan mostrar conocimiento sobre la persona del entrevistador
    - Adapta el estilo comunicativo según la personalidad identificada del entrevistador
    
    REQUISITOS:
    - Cada pregunta debe estar contextualizada con información específica
    - Combina inteligentemente los diferentes tipos de información
    - Evita preguntas genéricas
    - Enfócate en evaluación práctica y específica con conexión humana
    
    Responde en formato JSON con:
    - "preguntas": lista de strings con las preguntas específicas
    - "consejos_conexion": lista de consejos para establecer conexión personal (si hay info del entrevistador)
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un experto en RRHH que genera preguntas contextualizadas combinando información de empresa, mercado y entrevistador. Creas conexiones humanas auténticas. Responde SIEMPRE en formato JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        import json
        resultado = json.loads(response.choices[0].message.content)
        
        preguntas = resultado.get('preguntas', [])
        consejos = resultado.get('consejos_conexion', [])
        print(f"✅ Preguntas contextualizadas generadas: {len(preguntas)} preguntas con contexto múltiple")
        if consejos:
            print(f"✅ Consejos de conexión personal generados: {len(consejos)} consejos")
        
        return resultado
    except Exception as e:
        print(f"❌ Error en OpenAI: {e}")
        return {"preguntas": [], "consejos_conexion": []}

@app.get("/")
async def root():
    return {
        "mensaje": "API de Entrevistas - Entre-Vistas", 
        "version": "4.0", 
        "funcionalidades": [
            "🚀 SISTEMA DE BÚSQUEDAS PARALELAS CON MÁXIMA CALIDAD",
            "⚡ Búsquedas simultáneas para máximo rendimiento",
            "3 tipos de búsquedas independientes activables por parámetros",
            "Búsqueda de empresa: contexto, tecnologías, cultura en Perú",
            "Búsqueda de mercado: puestos similares en otras empresas de Perú", 
            "Búsqueda de entrevistador: información personal para conexión humana",
            "sonar-pro con 2500 tokens para cada búsqueda activada",
            "10-12 preguntas contextualizadas con información combinada",
            "Consejos de conexión personal con el entrevistador"
        ],
        "configuracion_maxima_calidad": {
            "modelo": "sonar-pro",
            "tokens": 2500,
            "temperature": 0.1,
            "profundidad": "advanced",
            "fuentes_maximas_por_busqueda": 3
        },
        "busquedas_opcionales": {
            "buscar_empresa": "Información específica de la empresa en Perú (true/false)",
            "buscar_puesto_mercado": "Análisis del puesto en otras empresas de Perú (true/false)",
            "buscar_entrevistador": "Información personal del entrevistador para conexión (true/false)",
            "nombre_entrevistador": "Nombre del entrevistador (opcional, requerido si buscar_entrevistador=true)"
        },
        "endpoints": {
            "/generar-entrevista": "Endpoint original (búsqueda integral)",
            "/generar-entrevista-con-opciones": "Nuevo endpoint con búsquedas opcionales",
            "/test-sonar": "Endpoint de prueba para búsqueda integral",
            "/test-busquedas-opcionales": "Endpoint de prueba para búsquedas opcionales"
        },
        "ejemplo_uso": {
            "texto": "Propuesta laboral como texto",
            "buscar_empresa": True,
            "buscar_puesto_mercado": True, 
            "buscar_entrevistador": False,
            "nombre_entrevistador": None
        }
    }

@app.post("/test-sonar")
async def test_sonar(data: dict):
    """Endpoint de debug para verificar la búsqueda integral de Sonar con MÁXIMA CALIDAD"""
    empresa = data.get("empresa", "Entel Perú")
    puesto = data.get("puesto", "IA Engineer")
    
    try:
        # Búsqueda integral unificada
        query = crear_prompt_integral(empresa, puesto)
        resultado = buscar_con_sonar(query)
        
        return {
            "tipo_busqueda": "integral_completa",
            "empresa": empresa,
            "puesto": puesto,
            "query_enviado": query,
            "resultado": {
                "contenido": resultado.contenido,
                "fuentes": resultado.fuentes,
                "busquedas_web_realizadas": resultado.busquedas_realizadas,
                "tiempo_respuesta_segundos": resultado.tiempo_respuesta,
                "modelo_usado": resultado.modelo_usado,
                "numero_fuentes": len(resultado.fuentes)
            },
            "verificacion_web": {
                "tiene_fuentes": len(resultado.fuentes) > 0,
                "busquedas_confirmadas": resultado.busquedas_realizadas,
                "fuentes_obtenidas": f"{len(resultado.fuentes)}/3",
                "calidad_busqueda": "Alta" if len(resultado.fuentes) >= 3 else "Media" if len(resultado.fuentes) >= 2 else "Baja",
                "tipo": "Búsqueda Integral (Empresa + Cultura + Puesto)"
            }
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/test-busquedas-opcionales")
async def test_busquedas_opcionales(data: dict):
    """Endpoint de debug para verificar las búsquedas opcionales con MÁXIMA CALIDAD"""
    empresa = data.get("empresa", "Entel Perú")
    puesto = data.get("puesto", "IA Engineer")
    nombre_entrevistador = data.get("nombre_entrevistador", None)
    
    # Opciones de búsqueda (por defecto todas activadas para test)
    buscar_empresa = data.get("buscar_empresa", True)
    buscar_mercado = data.get("buscar_puesto_mercado", True)
    buscar_entrevistador = data.get("buscar_entrevistador", False)
    
    try:
        resultados = {}
        
        # Test búsqueda de empresa
        if buscar_empresa:
            print(f"🔍 Testing búsqueda de empresa: {empresa}")
            query_empresa = crear_prompt_empresa(empresa, puesto)
            resultado_empresa = buscar_con_sonar(query_empresa)
            resultados["empresa"] = {
                "query_enviado": query_empresa,
                "contenido": resultado_empresa.contenido,
                "fuentes": resultado_empresa.fuentes,
                "tiempo_respuesta": resultado_empresa.tiempo_respuesta,
                "modelo_usado": resultado_empresa.modelo_usado,
                "numero_fuentes": len(resultado_empresa.fuentes)
            }
        
        # Test búsqueda de mercado
        if buscar_mercado:
            print(f"🔍 Testing búsqueda de mercado: {puesto}")
            query_mercado = crear_prompt_puesto_mercado(puesto)
            resultado_mercado = buscar_con_sonar(query_mercado)
            resultados["mercado"] = {
                "query_enviado": query_mercado,
                "contenido": resultado_mercado.contenido,
                "fuentes": resultado_mercado.fuentes,
                "tiempo_respuesta": resultado_mercado.tiempo_respuesta,
                "modelo_usado": resultado_mercado.modelo_usado,
                "numero_fuentes": len(resultado_mercado.fuentes)
            }
        
        # Test búsqueda de entrevistador
        if buscar_entrevistador and nombre_entrevistador:
            print(f"🔍 Testing búsqueda de entrevistador: {nombre_entrevistador}")
            query_entrevistador = crear_prompt_entrevistador_personal(nombre_entrevistador, empresa)
            resultado_entrevistador = buscar_con_sonar(query_entrevistador)
            resultados["entrevistador"] = {
                "query_enviado": query_entrevistador,
                "contenido": resultado_entrevistador.contenido,
                "fuentes": resultado_entrevistador.fuentes,
                "tiempo_respuesta": resultado_entrevistador.tiempo_respuesta,
                "modelo_usado": resultado_entrevistador.modelo_usado,
                "numero_fuentes": len(resultado_entrevistador.fuentes)
            }
        
        # Calcular estadísticas totales
        total_fuentes = sum(resultado.get("numero_fuentes", 0) for resultado in resultados.values())
        tiempo_total = sum(resultado.get("tiempo_respuesta", 0) for resultado in resultados.values())
        
        return {
            "tipo_busqueda": "opcionales_separadas",
            "parametros": {
                "empresa": empresa,
                "puesto": puesto,
                "nombre_entrevistador": nombre_entrevistador,
                "buscar_empresa": buscar_empresa,
                "buscar_mercado": buscar_mercado,
                "buscar_entrevistador": buscar_entrevistador
            },
            "resultados": resultados,
            "estadisticas": {
                "busquedas_realizadas": len(resultados),
                "total_fuentes": total_fuentes,
                "tiempo_total": tiempo_total,
                "calidad_investigacion": "Alta" if total_fuentes >= 6 else "Media" if total_fuentes >= 3 else "Baja"
            }
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/generar-entrevista", response_model=RespuestaEntrevista)
async def generar_entrevista(propuesta_texto: PropuestaLaboralTexto):
    """Endpoint principal para generar preguntas de entrevista desde texto libre con investigación web integral"""
    
    print(f"📝 Texto recibido: {propuesta_texto.texto[:100]}...")
    
    try:
        # 1. Extraer información estructurada del texto con OpenAI
        propuesta = extraer_informacion_propuesta(propuesta_texto.texto)
        
        print(f"\n📋 PROPUESTA LABORAL EXTRAÍDA:")
        print(f"{'='*80}")
        print(f"🏢 Empresa: {propuesta.empresa}")
        print(f"💼 Puesto: {propuesta.puesto}")
        print(f"📄 Descripción: {propuesta.descripcion[:200]}...")
        print(f"⚡ Requisitos: {propuesta.requisitos[:200]}...")
        print(f"{'='*80}")
        print(f"✅ Propuesta extraída: {propuesta.empresa} - {propuesta.puesto}")
        
        # 2. Búsqueda integral con Sonar - UNA SOLA búsqueda completa con MÁXIMA CALIDAD
        print(f"\n{'='*80}")
        print("🚀 INICIANDO BÚSQUEDA INTEGRAL COMPLETA CON SONAR (MÁXIMA CALIDAD)")
        print("🔧 Configuración: sonar-pro | 2500 tokens | temp=0.1 | profundidad=advanced")
        print(f"{'='*80}")
        
        # BÚSQUEDA INTEGRAL: Información completa de empresa, cultura y puesto (MÁXIMA CALIDAD)
        print(f"\n🔍 BÚSQUEDA INTEGRAL: {propuesta.empresa} + {propuesta.puesto}")
        print(f"{'-'*80}")
        query_integral = crear_prompt_integral(propuesta.empresa, propuesta.puesto)
        info_integral = buscar_con_sonar(query_integral)
        
        # 3. Preparar información integral para generación de preguntas
        informacion_completa = info_integral.contenido
        total_fuentes = len(info_integral.fuentes)
        tiempo_total = info_integral.tiempo_respuesta
        
        print(f"\n📊 RESUMEN DE LA BÚSQUEDA INTEGRAL (MÁXIMA CALIDAD):")
        print(f"{'='*80}")
        print(f"🔍 Búsqueda Integral Completa ({total_fuentes}/3 fuentes): {tiempo_total:.2f}s - {info_integral.modelo_usado}")
        print(f"🚀 Configuración: sonar-pro, 2500 tokens, temp=0.1")
        print(f"📚 Información obtenida: Empresa + Cultura + Puesto en una sola consulta")
        print(f"📚 Total: {total_fuentes} fuentes específicas en {tiempo_total:.2f}s")
        print(f"{'='*80}")
        print(f"📚 Investigación integral completa con MÁXIMA CALIDAD: {total_fuentes} fuentes")
        
        # 4. Generar preguntas contextualizadas con OpenAI
        print(f"\n{'='*80}")
        print("💡 GENERANDO PREGUNTAS CONTEXTUALIZADAS CON INFORMACIÓN INTEGRAL DE LA EMPRESA")
        print(f"{'='*80}")
        resultado = generar_preguntas(propuesta, informacion_completa)
        
        # 5. Extraer preguntas del resultado
        preguntas = resultado.get("preguntas", [])
        
        # 6. Construir respuesta completa
        respuesta = RespuestaEntrevista(
            preguntas=preguntas,
            consejos_conexion=[],  # No aplicable en búsqueda integral
            informacion_empresa={
                "nombre": propuesta.empresa,
                "informacion_encontrada": info_integral.contenido[:800] + "..." if len(info_integral.contenido) > 800 else info_integral.contenido,
                "fuentes_consultadas": len(info_integral.fuentes),
                "busquedas_web_verificadas": info_integral.busquedas_realizadas
            },
            propuesta_extraida={
                "empresa": propuesta.empresa,
                "puesto": propuesta.puesto,
                "descripcion": propuesta.descripcion,
                "requisitos": propuesta.requisitos
            },
            investigacion_detallada={
                "resumen_fuentes": {
                    "busqueda_integral": {"total": len(info_integral.fuentes), "modelo": info_integral.modelo_usado}
                },
                "calidad_investigacion": "Alta" if total_fuentes >= 3 else "Media" if total_fuentes >= 2 else "Baja",
                "busqueda_web_realizada": info_integral.busquedas_realizadas,
                "tiempo_total": tiempo_total,
                "tipo_busqueda": "Búsqueda Integral Completa (Empresa + Cultura + Puesto)"
            }
        )
        
        print(f"\n{'='*80}")
        print("🎉 PROCESO COMPLETADO EXITOSAMENTE CON MÁXIMA CALIDAD")
        print(f"{'='*80}")
        print(f"📊 Resultados finales:")
        print(f"   • {len(preguntas)} preguntas contextualizadas con información integral de la empresa")
        print(f"   • {total_fuentes}/3 fuentes de alta calidad consultadas en una sola búsqueda")
        print(f"   • Tiempo total: {tiempo_total:.2f} segundos")
        print(f"   • Configuración: sonar-pro, 2500 tokens en búsqueda integral")
        print(f"   • Calidad investigación: {'Alta' if total_fuentes >= 3 else 'Media' if total_fuentes >= 2 else 'Baja'}")
        print(f"{'='*80}")
        print(f"🚀 Respuesta construida con MÁXIMA CALIDAD: {len(preguntas)} preguntas, {total_fuentes} fuentes")
        return respuesta
        
    except Exception as e:
        print(f"❌ Error en generar_entrevista: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error procesando la solicitud: {str(e)}")

@app.post("/generar-entrevista-con-opciones", response_model=RespuestaEntrevista)
async def generar_entrevista_con_opciones(propuesta_opciones: PropuestaLaboralConOpciones):
    """Endpoint principal con búsquedas opcionales (empresa, mercado, reclutador) usando máxima calidad"""
    
    print(f"📝 Texto recibido: {propuesta_opciones.texto[:100]}...")
    print(f"🔍 Opciones de búsqueda:")
    print(f"   • Buscar empresa: {propuesta_opciones.buscar_empresa}")
    print(f"   • Buscar mercado: {propuesta_opciones.buscar_puesto_mercado}")
    print(f"   • Buscar entrevistador: {propuesta_opciones.buscar_entrevistador}")
    if propuesta_opciones.nombre_entrevistador:
        print(f"   • Nombre entrevistador: {propuesta_opciones.nombre_entrevistador}")
    
    try:
        # 1. Extraer información estructurada del texto con OpenAI
        propuesta = extraer_informacion_propuesta(propuesta_opciones.texto)
        
        print(f"\n📋 PROPUESTA LABORAL EXTRAÍDA:")
        print(f"{'='*80}")
        print(f"🏢 Empresa: {propuesta.empresa}")
        print(f"💼 Puesto: {propuesta.puesto}")
        print(f"📄 Descripción: {propuesta.descripcion[:200]}...")
        print(f"⚡ Requisitos: {propuesta.requisitos[:200]}...")
        print(f"{'='*80}")
        
        # 2. Preparar búsquedas opcionales para paralelización
        busquedas_pendientes = []
        info_empresa = ""
        info_mercado = ""
        info_entrevistador = ""
        
        print(f"\n{'='*80}")
        print("🚀 INICIANDO BÚSQUEDAS OPCIONALES PARALELAS CON MÁXIMA CALIDAD")
        print("🔧 Configuración: sonar-pro | 2500 tokens | temp=0.1 | profundidad=advanced")
        print(f"{'='*80}")
        
        # Preparar búsquedas según configuración
        if propuesta_opciones.buscar_empresa:
            query_empresa = crear_prompt_empresa(propuesta.empresa, propuesta.puesto)
            busquedas_pendientes.append((query_empresa, f"EMPRESA ({propuesta.empresa})"))
            
        if propuesta_opciones.buscar_puesto_mercado:
            query_mercado = crear_prompt_puesto_mercado(propuesta.puesto)
            busquedas_pendientes.append((query_mercado, f"MERCADO ({propuesta.puesto})"))
            
        if propuesta_opciones.buscar_entrevistador and propuesta_opciones.nombre_entrevistador:
            query_entrevistador = crear_prompt_entrevistador_personal(propuesta_opciones.nombre_entrevistador, propuesta.empresa)
            busquedas_pendientes.append((query_entrevistador, f"ENTREVISTADOR ({propuesta_opciones.nombre_entrevistador})"))
        elif propuesta_opciones.buscar_entrevistador and not propuesta_opciones.nombre_entrevistador:
            print(f"\n⚠️  BÚSQUEDA ENTREVISTADOR ACTIVADA PERO SIN NOMBRE - OMITIDA")
        
        # Ejecutar búsquedas en paralelo
        resultados = []
        busquedas_realizadas = []
        total_fuentes = 0
        
        if busquedas_pendientes:
            resultados = await ejecutar_busquedas_paralelas(busquedas_pendientes)
            
            # Procesar resultados y asignar información
            for i, (query, nombre) in enumerate(busquedas_pendientes):
                resultado = resultados[i]
                
                if "EMPRESA" in nombre:
                    info_empresa = resultado.contenido
                    busquedas_realizadas.append({
                        "tipo": "empresa",
                        "fuentes": len(resultado.fuentes),
                        "tiempo": resultado.tiempo_respuesta,
                        "modelo": resultado.modelo_usado
                    })
                elif "MERCADO" in nombre:
                    info_mercado = resultado.contenido
                    busquedas_realizadas.append({
                        "tipo": "mercado",
                        "fuentes": len(resultado.fuentes),
                        "tiempo": resultado.tiempo_respuesta,
                        "modelo": resultado.modelo_usado
                    })
                elif "ENTREVISTADOR" in nombre:
                    info_entrevistador = resultado.contenido
                    busquedas_realizadas.append({
                        "tipo": "entrevistador",
                        "fuentes": len(resultado.fuentes),
                        "tiempo": resultado.tiempo_respuesta,
                        "modelo": resultado.modelo_usado
                    })
                
                total_fuentes += len(resultado.fuentes)
        
        # Calcular tiempo total (el tiempo real de la paralelización)
        tiempo_total = max([b["tiempo"] for b in busquedas_realizadas]) if busquedas_realizadas else 0.0
        
        # 3. Resumen de búsquedas realizadas
        print(f"\n📊 RESUMEN DE BÚSQUEDAS PARALELAS (MÁXIMA CALIDAD):")
        print(f"{'='*80}")
        tiempo_individual_total = 0.0
        for busqueda in busquedas_realizadas:
            print(f"🔍 {busqueda['tipo'].title()}: {busqueda['fuentes']}/3 fuentes - {busqueda['tiempo']:.2f}s - {busqueda['modelo']}")
            tiempo_individual_total += busqueda['tiempo']
        
        if busquedas_realizadas:
            ahorro_tiempo = tiempo_individual_total - tiempo_total
            porcentaje_ahorro = (ahorro_tiempo / tiempo_individual_total * 100) if tiempo_individual_total > 0 else 0
            print(f"📚 Total: {total_fuentes} fuentes en {tiempo_total:.2f}s ({len(busquedas_realizadas)} búsquedas PARALELAS)")
            print(f"⚡ Ahorro de tiempo: {ahorro_tiempo:.2f}s ({porcentaje_ahorro:.1f}% más rápido que secuencial)")
        print(f"{'='*80}")
        
        # 4. Generar preguntas contextualizadas con múltiple información
        print(f"\n{'='*80}")
        print("💡 GENERANDO PREGUNTAS CONTEXTUALIZADAS CON INFORMACIÓN COMBINADA")
        print(f"{'='*80}")
        resultado = generar_preguntas_con_contexto_multiple(
            propuesta, 
            info_empresa, 
            info_mercado, 
            info_entrevistador
        )
        
        # 5. Extraer preguntas y consejos del resultado
        preguntas = resultado.get("preguntas", [])
        consejos_conexion = resultado.get("consejos_conexion", [])
        
        # 6. Construir respuesta completa
        respuesta = RespuestaEntrevista(
            preguntas=preguntas,
            consejos_conexion=consejos_conexion,
            informacion_empresa={
                "nombre": propuesta.empresa,
                "informacion_encontrada": info_empresa[:800] + "..." if len(info_empresa) > 800 else info_empresa,
                "fuentes_consultadas": len([b for b in busquedas_realizadas if b["tipo"] == "empresa"]),
                "busquedas_web_verificadas": any(b["fuentes"] > 0 for b in busquedas_realizadas)
            },
            propuesta_extraida={
                "empresa": propuesta.empresa,
                "puesto": propuesta.puesto,
                "descripcion": propuesta.descripcion,
                "requisitos": propuesta.requisitos
            },
            investigacion_detallada={
                "busquedas_opcionales": {
                    "empresa": {"activada": propuesta_opciones.buscar_empresa, "fuentes": len([b for b in busquedas_realizadas if b["tipo"] == "empresa"])},
                    "mercado": {"activada": propuesta_opciones.buscar_puesto_mercado, "fuentes": len([b for b in busquedas_realizadas if b["tipo"] == "mercado"])},
                    "entrevistador": {"activada": propuesta_opciones.buscar_entrevistador, "fuentes": len([b for b in busquedas_realizadas if b["tipo"] == "entrevistador"])}
                },
                "calidad_investigacion": "Alta" if total_fuentes >= 6 else "Media" if total_fuentes >= 3 else "Baja",
                "busqueda_web_realizada": len(busquedas_realizadas) > 0,
                "tiempo_total": tiempo_total,
                "total_fuentes": total_fuentes,
                "busquedas_completadas": len(busquedas_realizadas)
            }
        )
        
        print(f"\n{'='*80}")
        print("🎉 PROCESO COMPLETADO EXITOSAMENTE CON BÚSQUEDAS PARALELAS")
        print(f"{'='*80}")
        print(f"📊 Resultados finales:")
        print(f"   • {len(preguntas)} preguntas contextualizadas con información combinada")
        print(f"   • {len(consejos_conexion)} consejos de conexión personal generados")
        print(f"   • {total_fuentes} fuentes de alta calidad consultadas en {len(busquedas_realizadas)} búsquedas PARALELAS")
        print(f"   • Tiempo total: {tiempo_total:.2f} segundos (paralelización optimizada)")
        print(f"   • Configuración: sonar-pro, 2500 tokens por búsqueda")
        print(f"   • Calidad investigación: {'Alta' if total_fuentes >= 6 else 'Media' if total_fuentes >= 3 else 'Baja'}")
        print(f"{'='*80}")
        
        return respuesta
        
    except Exception as e:
        print(f"❌ Error en generar_entrevista_con_opciones: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error procesando la solicitud: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 