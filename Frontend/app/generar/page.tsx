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
  Zap
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
    deepResearch: false,
    recruiterSearch: false,
    similarPositions: false,
    deepTechnology: false,
    recruiterProfile: false
  })

  const [recruiterName, setRecruiterName] = useState('')

  const tools = [
    {
      key: 'skillValidation',
      title: 'Validación de Competencias',
      description: 'Genera preguntas específicas para validar habilidades técnicas',
      icon: Search,
      color: 'primary'
    },
    {
      key: 'behavioralQuestions',
      title: 'Preguntas Conductuales',
      description: 'Crea preguntas para evaluar competencias blandas y comportamiento',
      icon: Users,
      color: 'secondary'
    },
    {
      key: 'industrySpecific',
      title: 'Específico por Industria',
      description: 'Preguntas especializadas según el sector de la empresa',
      icon: Building,
      color: 'primary'
    },
    {
      key: 'experienceLevel',
      title: 'Nivel de Experiencia',
      description: 'Ajusta la complejidad según el nivel del candidato',
      icon: Cpu,
      color: 'secondary'
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Analysis Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Análisis
              </label>
              <div className="relative">
                <select
                  value={formData.analysisType}
                  onChange={(e) => setFormData(prev => ({ ...prev, analysisType: e.target.value }))}
                  className="input-field appearance-none pr-10"
                >
                  <option value="job-proposal">Propuesta Laboral</option>
                  <option value="cv-analysis">Análisis de CV</option>
                  <option value="mixed">Análisis Combinado</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nivel de Dificultad
              </label>
              <div className="relative">
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="input-field appearance-none pr-10"
                >
                  <option value="junior">Junior</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="senior">Senior</option>
                  <option value="experto">Experto</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cantidad de Preguntas
              </label>
              <div className="relative">
                <select
                  value={formData.questionCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, questionCount: e.target.value }))}
                  className="input-field appearance-none pr-10"
                >
                  <option value="5">5 preguntas</option>
                  <option value="8">8 preguntas</option>
                  <option value="10">10 preguntas</option>
                  <option value="15">15 preguntas</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

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
        <motion.div variants={fadeInUp} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Herramientas Adicionales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.key}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className={`card cursor-pointer transition-all duration-200 ${
                  activeTools[tool.key as keyof typeof activeTools]
                    ? `ring-2 ring-${tool.color}-500 bg-${tool.color}-50`
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleToolToggle(tool.key)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-${tool.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <tool.icon className={`w-6 h-6 text-${tool.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{tool.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                    

                  </div>
                  <div className="flex-shrink-0">
                    <motion.div
                      animate={{
                        scale: activeTools[tool.key as keyof typeof activeTools] ? 1.1 : 1,
                        backgroundColor: activeTools[tool.key as keyof typeof activeTools] 
                          ? (tool.color === 'primary' ? '#3b82f6' : '#8b5cf6')
                          : '#e5e7eb'
                      }}
                      className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center"
                    >
                      {activeTools[tool.key as keyof typeof activeTools] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 bg-white rounded-full"
                        />
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 