from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from openai import OpenAI
import requests
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
        print("⏱️  Esperando respuesta...")
        
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
            print("📄 CONTENIDO DE LA BÚSQUEDA:")
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

@app.get("/")
async def root():
    return {
        "mensaje": "API de Entrevistas - Entre-Vistas", 
        "version": "3.1", 
        "funcionalidades": [
            "🚀 SIEMPRE MÁXIMA CALIDAD (sonar-pro)",
            "1 Búsqueda integral ultra-completa",
            "Máximo 3 fuentes de alta calidad",
            "2500 tokens para máximo detalle en una sola consulta",
            "Información empresarial + cultura + puesto en búsqueda unificada", 
            "Contexto completo e integrado de empresa y rol",
            "10-12 preguntas potenciadas con contexto integral específico",
            "Referencias verificadas y de alta calidad",
            "Eficiencia optimizada con una sola consulta API"
        ],
        "configuracion_maxima_calidad": {
            "modelo": "sonar-pro",
            "tokens": 2500,
            "temperature": 0.1,
            "profundidad": "advanced",
            "fuentes_maximas": 3
        },
        "busqueda_integral": {
            "tipo": "Búsqueda completa unificada",
            "incluye": "Empresa + Cultura + Puesto + Contexto específico",
            "fuentes": "Máximo 3 fuentes de alta calidad",
            "eficiencia": "Una sola consulta API optimizada"
        },
        "metricas_calidad": {
            "Alta": "3 fuentes encontradas",
            "Media": "2 fuentes encontradas", 
            "Baja": "1 fuente encontrada"
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

@app.post("/generar-entrevista", response_model=RespuestaEntrevista)
async def generar_entrevista(propuesta_texto: PropuestaLaboralTexto):
    """Endpoint principal para generar preguntas de entrevista desde texto libre con investigación web integral"""
    
    print(f"📝 Texto recibido: {propuesta_texto.texto[:100]}...")
    
    try:
        # 1. Extraer información estructurada del texto con OpenAI
        propuesta = extraer_informacion_propuesta(propuesta_texto.texto)
        
        print("\n📋 PROPUESTA LABORAL EXTRAÍDA:")
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
        
        print("\n📊 RESUMEN DE LA BÚSQUEDA INTEGRAL (MÁXIMA CALIDAD):")
        print(f"{'='*80}")
        print(f"🔍 Búsqueda Integral Completa ({total_fuentes}/3 fuentes): {tiempo_total:.2f}s - {info_integral.modelo_usado}")
        print("🚀 Configuración: sonar-pro, 2500 tokens, temp=0.1")
        print("📚 Información obtenida: Empresa + Cultura + Puesto en una sola consulta")
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
        print("📊 Resultados finales:")
        print(f"   • {len(preguntas)} preguntas contextualizadas con información integral de la empresa")
        print(f"   • {total_fuentes}/3 fuentes de alta calidad consultadas en una sola búsqueda")
        print(f"   • Tiempo total: {tiempo_total:.2f} segundos")
        print("   • Configuración: sonar-pro, 2500 tokens en búsqueda integral")
        print(f"   • Calidad investigación: {'Alta' if total_fuentes >= 3 else 'Media' if total_fuentes >= 2 else 'Baja'}")
        print(f"{'='*80}")
        print(f"🚀 Respuesta construida con MÁXIMA CALIDAD: {len(preguntas)} preguntas, {total_fuentes} fuentes")
        return respuesta
        
    except Exception as e:
        print(f"❌ Error en generar_entrevista: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error procesando la solicitud: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 