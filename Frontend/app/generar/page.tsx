'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Search, 
  ChevronDown, 
  FileText, 
  Users, 
  Building,
  Cpu,
  UserCheck,
  Zap,
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface FormData {
  texto: string
  buscar_empresa: boolean
  buscar_puesto_mercado: boolean
}

interface PropuestaExtraida {
  empresa: string
  puesto: string
  descripcion: string
  requisitos: string
}

interface BusquedaDetalle {
  contenido: string
  activada: boolean
  fuentes: number
  tiempo: number
}

interface ResultadosApi {
  preguntas: string[]
  consejos_conexion: string[]
  informacion_empresa: {
    nombre: string
    informacion_encontrada: string
    fuentes_consultadas: number
  }
  propuesta_extraida: PropuestaExtraida
  investigacion_detallada: {
    busquedas_opcionales?: {
      empresa: { activada: boolean; fuentes: number }
      mercado: { activada: boolean; fuentes: number }
    }
    resultados_busquedas?: {
      empresa: BusquedaDetalle
      mercado: BusquedaDetalle
    }
    calidad_investigacion: string
    tiempo_total: number
    total_fuentes?: number
    busquedas_completadas?: number
  }
}

export default function GenerarPage() {
  const [formData, setFormData] = useState<FormData>({
    texto: `Analista de Datos con enfoque en IA – BCP

En el BCP seguimos transformando la banca con innovación y tecnología. Buscamos un(a) Analista de Datos que diseñe, implemente y escale soluciones con capacidades de Inteligencia Artificial, generando impacto real en el negocio y en nuestros clientes.

¿Qué esperamos de ti?

Egresado(a) o bachiller en Ingeniería de Sistemas, Software, Informática o afines.

1 a 2 años de experiencia en desarrollo de software, análisis de datos o proyectos backend/APIs con componentes de IA.

Dominio de Python y buenas prácticas de desarrollo.

Conocimiento o interés en modelos de lenguaje y procesamiento de texto.

Experiencia con nube (AWS, GCP u OCI) y trabajo en equipos multidisciplinarios.

¿Por qué unirte al BCP?
Porque aquí combinamos talento, tecnología y propósito para transformar la experiencia financiera de millones de personas. Crece, innova y deja huella con nosotros.

#ÚneteAlBCP #AnalistaDeDatos #InteligenciaArtificial #Tecnología`,
    buscar_empresa: true,
    buscar_puesto_mercado: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<ResultadosApi | null>(null)

  // Expand sidebar when component mounts
  useEffect(() => {
    window.dispatchEvent(new Event('expandSidebar'))
  }, [])

  const tools = [
    {
      key: 'buscar_empresa',
      title: 'Información de la Empresa en Perú',
      description: 'Contexto específico, tecnologías, cultura organizacional y proyectos actuales',
      icon: Building,
      color: 'primary',
      premium: true
    },
    {
      key: 'buscar_puesto_mercado',
      title: 'Análisis del Mercado Laboral del Puesto',
      description: 'Puestos similares en otras empresas, tecnologías demandadas, rangos salariales',
      icon: TrendingUp,
      color: 'secondary',
      premium: true
    }
  ]

  const handleToolToggle = (toolKey: string) => {
    setFormData(prev => ({
      ...prev,
      [toolKey]: !prev[toolKey as keyof FormData]
    }))
  }

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:8001/')
      const data = await response.json()
      alert(`✅ Conexión exitosa: ${data.mensaje}`)
    } catch (err) {
      alert(`❌ Error de conexión: ${err}\n\nAsegúrate de que la API esté ejecutándose en http://localhost:8001`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.texto.trim()) {
      setError('Por favor ingresa una propuesta laboral')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const requestData = {
        texto: formData.texto,
        buscar_empresa: formData.buscar_empresa,
        buscar_puesto_mercado: formData.buscar_puesto_mercado,
        buscar_entrevistador: false,
        nombre_entrevistador: null
      }

      const response = await fetch('http://localhost:8001/generar-entrevista-con-opciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Error al generar las preguntas')
      }

      setResults(data)
    } catch (err: any) {
      console.error('Error completo:', err)
      setError(err.message || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Entre Vistas
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">
            Genera preguntas inteligentes para tus entrevistas laborales
          </p>
          <button
            onClick={testConnection}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            🔧 Probar Conexión API
          </button>
        </motion.div>

        {/* Main Form */}
        <motion.form
          variants={fadeInUp}
          onSubmit={handleSubmit}
          className="card space-y-6"
        >
          {/* Job Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Propuesta Laboral Completa
            </label>
            <textarea
              value={formData.texto}
              onChange={(e) => setFormData(prev => ({ ...prev, texto: e.target.value }))}
              placeholder="Pega aquí la descripción completa del puesto de trabajo. Incluye requisitos, responsabilidades, tecnologías necesarias, etc..."
              rows={6}
              className="input-field resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando Preguntas...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generar Preguntas de Entrevista
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Tools Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Herramientas Adicionales</h2>
            <p className="text-gray-600">Activa funciones avanzadas de investigación con IA</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                className={`relative card cursor-pointer transition-all duration-300 overflow-hidden ${
                  formData[tool.key as keyof FormData]
                    ? `ring-2 ring-${tool.color}-500 bg-gradient-to-br from-${tool.color}-50 to-white shadow-lg`
                    : 'hover:shadow-xl hover:shadow-gray-200/50'
                }`}
                onClick={() => handleToolToggle(tool.key)}
              >
                {/* Premium Badge */}
                {tool.premium && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    PRO
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {/* Icon and Toggle */}
                  <div className="flex items-center justify-between">
                    <motion.div 
                      animate={{
                        scale: formData[tool.key as keyof FormData] ? 1.1 : 1,
                        rotate: formData[tool.key as keyof FormData] ? 5 : 0
                      }}
                      className={`w-14 h-14 bg-gradient-to-br ${
                        tool.color === 'primary' 
                          ? 'from-blue-500 to-blue-600' 
                          : 'from-purple-500 to-purple-600'
                      } rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <tool.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    
                    <motion.div
                      animate={{
                        scale: formData[tool.key as keyof FormData] ? 1.2 : 1,
                        backgroundColor: formData[tool.key as keyof FormData] 
                          ? (tool.color === 'primary' ? '#3b82f6' : '#8b5cf6')
                          : '#e5e7eb'
                      }}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center shadow-sm"
                    >
                      {formData[tool.key as keyof FormData] && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="w-4 h-4 bg-white rounded-full"
                        />
                      )}
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{tool.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <div className={`w-2 h-2 rounded-full ${
                      formData[tool.key as keyof FormData] 
                        ? 'bg-green-400 animate-pulse' 
                        : 'bg-gray-300'
                    }`} />
                    <span className={`text-xs font-medium ${
                      formData[tool.key as keyof FormData] 
                        ? 'text-green-600' 
                        : 'text-gray-500'
                    }`}>
                      {formData[tool.key as keyof FormData] ? 'Activado' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {/* Activation Effect */}
                {formData[tool.key as keyof FormData] && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Active Tools Summary */}
          {Object.values(formData).some(value => typeof value === 'boolean' && value) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">
                    {Object.entries(formData).filter(([key, value]) => typeof value === 'boolean' && value).length} herramienta(s) activada(s)
                  </h4>
                  <p className="text-sm text-green-600">
                    Las funciones avanzadas de IA están listas para generar preguntas más precisas
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <h4 className="font-semibold text-red-800">Error</h4>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">📋 Resultados de la Generación</h2>
            </div>

            {/* Extracted Proposal Info */}
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-xl font-bold text-blue-800 mb-4">📄 Información Extraída de la Propuesta</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Empresa:</strong> {results.propuesta_extraida.empresa}</p>
                <p><strong>Puesto:</strong> {results.propuesta_extraida.puesto}</p>
                <p><strong>Descripción:</strong> {results.propuesta_extraida.descripcion}</p>
                <p><strong>Requisitos:</strong> {results.propuesta_extraida.requisitos}</p>
              </div>
            </div>

            {/* Search Status */}
            {results.investigacion_detallada.busquedas_opcionales && (
              <div className="card bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="text-xl font-bold text-green-800 mb-4">📊 Estado de las Búsquedas</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>🏢 Empresa: {results.investigacion_detallada.busquedas_opcionales.empresa.activada ? `✅ (${results.investigacion_detallada.busquedas_opcionales.empresa.fuentes} fuentes)` : '❌ Desactivada'}</div>
                  <div>📈 Mercado: {results.investigacion_detallada.busquedas_opcionales.mercado.activada ? `✅ (${results.investigacion_detallada.busquedas_opcionales.mercado.fuentes} fuentes)` : '❌ Desactivada'}</div>
                </div>
                <div className="mt-3 text-sm">
                  <strong>Total:</strong> {results.investigacion_detallada.total_fuentes || 0} fuentes consultadas | 
                  <strong> Calidad:</strong> {results.investigacion_detallada.calidad_investigacion} | 
                  <strong> Tiempo:</strong> {results.investigacion_detallada.tiempo_total?.toFixed(2)}s
                  {(results.investigacion_detallada.busquedas_completadas || 0) > 1 ? ' ⚡ (Paralelo)' : ''}
                </div>
              </div>
            )}

            {/* Company Information */}
            <div className="card bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 className="text-xl font-bold text-purple-800 mb-4">🔍 Información de la Empresa Encontrada</h3>
              <div className="space-y-2">
                <p><strong>{results.informacion_empresa.nombre}</strong></p>
                <p className="text-sm text-gray-700">{results.informacion_empresa.informacion_encontrada}</p>
                <p className="text-xs text-gray-500"><strong>Fuentes consultadas:</strong> {results.informacion_empresa.fuentes_consultadas}</p>
              </div>
            </div>

            {/* Detailed Search Results */}
            {results.investigacion_detallada.resultados_busquedas && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">🔍 Resultados Detallados de las Búsquedas Web</h3>
                
                {/* Company Search */}
                {results.investigacion_detallada.resultados_busquedas.empresa.activada && (
                  <div className="card bg-blue-50">
                    <h4 className="font-bold text-blue-800 mb-2">🏢 Búsqueda: Información de la Empresa</h4>
                    <p className="text-sm text-gray-700 mb-2">{results.investigacion_detallada.resultados_busquedas.empresa.contenido}</p>
                    <p className="text-xs text-gray-500">
                      📊 Estadísticas: {results.investigacion_detallada.resultados_busquedas.empresa.fuentes} fuentes | 
                      {results.investigacion_detallada.resultados_busquedas.empresa.tiempo.toFixed(2)}s | Estado: ✅ Completada
                    </p>
                  </div>
                )}

                {/* Market Search */}
                {results.investigacion_detallada.resultados_busquedas.mercado.activada && (
                  <div className="card bg-indigo-50">
                    <h4 className="font-bold text-indigo-800 mb-2">📈 Búsqueda: Análisis del Mercado Laboral</h4>
                    <p className="text-sm text-gray-700 mb-2">{results.investigacion_detallada.resultados_busquedas.mercado.contenido}</p>
                    <p className="text-xs text-gray-500">
                      📊 Estadísticas: {results.investigacion_detallada.resultados_busquedas.mercado.fuentes} fuentes | 
                      {results.investigacion_detallada.resultados_busquedas.mercado.tiempo.toFixed(2)}s | Estado: ✅ Completada
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Generated Questions */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">❓ Preguntas Contextualizadas con Información Específica</h3>
              <div className="space-y-3">
                {results.preguntas.map((pregunta, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <p className="font-medium">{index + 1}. {pregunta}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Connection Tips */}
            {results.consejos_conexion && results.consejos_conexion.length > 0 && (
              <div className="card bg-gradient-to-r from-yellow-50 to-orange-50">
                <h3 className="text-xl font-bold text-orange-800 mb-4">🤝 Consejos para Establecer Conexión</h3>
                <div className="space-y-3">
                  {results.consejos_conexion.map((consejo, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-orange-200">
                      <p className="text-sm"><strong>💡 {index + 1}.</strong> {consejo}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
} 