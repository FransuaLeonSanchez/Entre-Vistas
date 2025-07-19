# 🤖 Entrevistador IA - API

Sistema inteligente de generación de preguntas para entrevistas laborales, construido con FastAPI y OpenAI GPT-4.

## 🚀 Características

- **Análisis de Propuestas Laborales**: Sube una descripción de trabajo y obtén preguntas específicas para validar competencias
- **Análisis de CVs**: Analiza currículums y genera preguntas para validar experiencia real
- **IA Inteligente**: Usa OpenAI GPT-4 para generar preguntas contextuales y relevantes
- **API REST**: Endpoints fáciles de integrar en cualquier aplicación
- **Documentación Automática**: Swagger UI incluido

## 📋 Requisitos

- Python 3.8+
- Clave API de OpenAI
- Dependencias listadas en `requirements.txt`

## 🛠️ Instalación

1. **Clonar el proyecto**
```bash
git clone <repo-url>
cd Entre-Vistas
```

2. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

3. **Configurar variables de entorno**

**Opción A: Usar el template incluido (recomendado)**
```bash
# Windows
copy config.env.template .env

# Linux/Mac  
cp config.env.template .env
```
Luego edita el archivo `.env` y reemplaza `tu_clave_de_openai_aqui` con tu clave real de OpenAI.

**Opción B: Configurar directamente en terminal**
```bash
# Windows PowerShell
$env:OPENAI_API_KEY = "tu_clave_real_aqui"

# Linux/Mac
export OPENAI_API_KEY="tu_clave_real_aqui"
```

4. **Ejecutar la aplicación**
```bash
python main.py
```

La API estará disponible en: `http://localhost:8000`

## 📡 Endpoints

### 1. Análisis de Propuesta Laboral
**POST** `/api/analyze-job-proposal`

Analiza una propuesta laboral y genera preguntas para entrevistas.

**Request:**
```json
{
  "job_description": "Buscamos un desarrollador Full Stack con experiencia en React, Node.js y bases de datos SQL. Debe manejar APIs REST, tener conocimientos de AWS y trabajar en metodologías ágiles..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preguntas generadas exitosamente",
  "job_summary": "Posición de desarrollador Full Stack con enfoque en tecnologías modernas...",
  "required_skills": ["React", "Node.js", "SQL", "APIs REST", "AWS"],
  "questions": [
    {
      "type": "pregunta",
      "content": "¿Podrías explicar la diferencia entre componentes funcionales y de clase en React?",
      "skills_evaluated": ["React"],
      "difficulty": "intermedio"
    },
    {
      "type": "actividad",
      "content": "Diseña la estructura de una API REST para un sistema de gestión de usuarios",
      "skills_evaluated": ["APIs REST", "Node.js"],
      "difficulty": "avanzado"
    }
  ]
}
```

### 2. Análisis de CV
**POST** `/api/analyze-cv`

Analiza un CV y genera preguntas para validar experiencia.

**Request:**
```json
{
  "cv_text": "Juan Pérez - Desarrollador Full Stack. 5 años de experiencia en desarrollo web. Ha trabajado con React, Angular, Node.js, Express, MongoDB y PostgreSQL. Experiencia en empresas como TechCorp y StartupXYZ..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Análisis de CV completado exitosamente",
  "cv_summary": "Desarrollador con 5 años de experiencia en tecnologías frontend y backend...",
  "identified_skills": ["React", "Angular", "Node.js", "MongoDB", "PostgreSQL"],
  "experience_level": "mid",
  "questions": [
    {
      "type": "pregunta",
      "content": "En tu experiencia en TechCorp, ¿cuál fue el proyecto más desafiante que desarrollaste?",
      "skills_evaluated": ["Experiencia práctica"],
      "difficulty": "intermedio"
    }
  ]
}
```

## 🧪 Ejemplos de Uso

### Con cURL

**Analizar propuesta laboral:**
```bash
curl -X POST "http://localhost:8000/api/analyze-job-proposal" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Desarrollador Python Senior con experiencia en Django, PostgreSQL y Docker..."
  }'
```

**Analizar CV:**
```bash
curl -X POST "http://localhost:8000/api/analyze-cv" \
  -H "Content-Type: application/json" \
  -d '{
    "cv_text": "María González, Desarrolladora Python con 3 años de experiencia..."
  }'
```

### Con Python

```python
import requests

# Analizar propuesta laboral
response = requests.post(
    "http://localhost:8000/api/analyze-job-proposal",
    json={
        "job_description": "Buscamos un Data Scientist con experiencia en Python, Machine Learning y SQL..."
    }
)
result = response.json()
print(f"Preguntas generadas: {len(result['questions'])}")
```

## 📚 Documentación API

Visita `http://localhost:8000/docs` para ver la documentación interactiva de Swagger UI.

## 🔧 Configuración Avanzada

### Variables de Entorno

**Archivo .env (recomendado):**
```env
# Configuración principal
OPENAI_API_KEY=sk-tu-clave-real-de-openai

# Configuración opcional del servidor
HOST=0.0.0.0
PORT=8000
```

**Variables disponibles:**
- `OPENAI_API_KEY`: Tu clave de API de OpenAI (requerida)
- `HOST`: Dirección IP del servidor (opcional, por defecto: 0.0.0.0)
- `PORT`: Puerto del servidor (opcional, por defecto: 8000)

### Personalización
- Modifica los prompts en `openai_service.py` para ajustar el estilo de preguntas
- Ajusta la temperatura del modelo para mayor creatividad o consistencia
- Cambia el modelo de OpenAI (gpt-3.5-turbo, gpt-4, etc.)

## 🛡️ Seguridad

- En producción, configura CORS apropiadamente
- Usa HTTPS en producción
- Considera implementar autenticación/autorización
- Limita el tamaño de las peticiones

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🙋‍♂️ Soporte

Si tienes preguntas o problemas:
1. Revisa la documentación en `/docs`
2. Verifica que tu clave de OpenAI esté configurada
3. Consulta los logs del servidor para errores específicos 