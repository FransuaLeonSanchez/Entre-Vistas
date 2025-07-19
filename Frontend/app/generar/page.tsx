'use client'

import { useState } from 'react'
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
  TrendingUp
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

export default function GenerarPage() {
  const [formData, setFormData] = useState({
    analysisType: 'job-proposal',
    difficulty: 'intermedio',
    questionCount: '8',
    jobDescription: '',
    cvText: ''
  })

  const [activeTools, setActiveTools] = useState({
    companyInfo: false,
    marketAnalysis: false,
    recruiterInfo: false
  })

  const [recruiterName, setRecruiterName] = useState('')

  const tools = [
    {
      key: 'companyInfo',
      title: 'Información de la Empresa en Perú',
      description: 'Contexto específico, tecnologías, cultura organizacional y proyectos actuales',
      icon: Building,
      color: 'primary',
      premium: true
    },
    {
      key: 'marketAnalysis',
      title: 'Análisis del Mercado Laboral del Puesto',
      description: 'Puestos similares en otras empresas, tecnologías demandadas, rangos salariales',
      icon: TrendingUp,
      color: 'secondary',
      premium: true
    },
    {
      key: 'recruiterInfo',
      title: 'Información del Reclutador',
      description: 'Perfil profesional, estilo de entrevistas, criterios de evaluación',
      icon: UserCheck,
      color: 'primary',
      premium: true
    }
  ]

  const handleToolToggle = (toolKey: string) => {
    setActiveTools(prev => ({
      ...prev,
      [toolKey]: !prev[toolKey as keyof typeof prev]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData, activeTools)
    // Aquí implementarías la lógica de envío
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
              Generar
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">
            Genera preguntas inteligentes para tus entrevistas laborales
          </p>
        </motion.div>

        {/* Main Form */}
        <motion.form
          variants={fadeInUp}
          onSubmit={handleSubmit}
          className="card space-y-6"
        >


          {/* Job Description / CV Text */}
          {formData.analysisType === 'job-proposal' || formData.analysisType === 'mixed' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Descripción del Puesto de Trabajo
              </label>
              <textarea
                value={formData.jobDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                placeholder="Pega aquí la descripción completa del puesto de trabajo. Incluye requisitos, responsabilidades, tecnologías necesarias, etc..."
                rows={6}
                className="input-field resize-none"
              />
            </div>
          ) : null}

          {formData.analysisType === 'cv-analysis' || formData.analysisType === 'mixed' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Texto del CV / Currículum
              </label>
              <textarea
                value={formData.cvText}
                onChange={(e) => setFormData(prev => ({ ...prev, cvText: e.target.value }))}
                placeholder="Pega aquí el contenido del CV del candidato. Incluye experiencia laboral, educación, habilidades, proyectos, etc..."
                rows={6}
                className="input-field resize-none"
              />
            </div>
          ) : null}

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generar Preguntas de Entrevista
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                className={`relative card cursor-pointer transition-all duration-300 overflow-hidden ${
                  activeTools[tool.key as keyof typeof activeTools]
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
                        scale: activeTools[tool.key as keyof typeof activeTools] ? 1.1 : 1,
                        rotate: activeTools[tool.key as keyof typeof activeTools] ? 5 : 0
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
                        scale: activeTools[tool.key as keyof typeof activeTools] ? 1.2 : 1,
                        backgroundColor: activeTools[tool.key as keyof typeof activeTools] 
                          ? (tool.color === 'primary' ? '#3b82f6' : '#8b5cf6')
                          : '#e5e7eb'
                      }}
                      className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center shadow-sm"
                    >
                      {activeTools[tool.key as keyof typeof activeTools] && (
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
                      activeTools[tool.key as keyof typeof activeTools] 
                        ? 'bg-green-400 animate-pulse' 
                        : 'bg-gray-300'
                    }`} />
                    <span className={`text-xs font-medium ${
                      activeTools[tool.key as keyof typeof activeTools] 
                        ? 'text-green-600' 
                        : 'text-gray-500'
                    }`}>
                      {activeTools[tool.key as keyof typeof activeTools] ? 'Activado' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {/* Activation Effect */}
                {activeTools[tool.key as keyof typeof activeTools] && (
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
          {Object.values(activeTools).some(Boolean) && (
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
                    {Object.values(activeTools).filter(Boolean).length} herramienta(s) activada(s)
                  </h4>
                  <p className="text-sm text-green-600">
                    Las funciones avanzadas de IA están listas para generar preguntas más precisas
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
} 