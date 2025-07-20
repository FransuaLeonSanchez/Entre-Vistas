'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  BarChart3,
  Calendar,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  MoreVertical,
  FileText,
  Target,
  UserCheck
} from 'lucide-react'
import UniformCard, { CardHeader, CardContent, CardFooter } from '@/components/UniformCard'

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

const performanceData = [
  { week: "W37", interviews: 12, successRate: 85 },
  { week: "W38", interviews: 15, successRate: 92 },
  { week: "W39", interviews: 8, successRate: 78 },
  { week: "W40", interviews: 18, successRate: 95 },
  { week: "W41", interviews: 10, successRate: 88 },
  { week: "W42", interviews: 14, successRate: 91 }
]

const weeklyTasks = [
  {
    week: "28 Ago - 3 Sep",
    interviews: 23,
    description: "Se realizaron 23 entrevistas técnicas enfocadas en desarrollo frontend y backend. Se analizaron 45 CVs y se generaron preguntas específicas para validar competencias en React, Node.js y bases de datos. La tasa de éxito fue del 87%."
  },
  {
    week: "4 Sep - 10 Sep", 
    interviews: 31,
    description: "Semana dedicada a procesos de selección para puestos senior. Se implementaron nuevas preguntas conductuales y se validaron competencias de liderazgo. Se analizaron CVs de candidatos con 5+ años de experiencia en DevOps y arquitectura de sistemas."
  },
  {
    week: "11 Sep - 17 Sep",
    interviews: 18,
    description: "Inicio de nuevo proceso de selección para equipo de Data Science. Se comenzó revisando requisitos técnicos específicos, configurando preguntas de Machine Learning, y diseñando evaluaciones prácticas de Python y estadística."
  }
]

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("This month")
  const [activeTab, setActiveTab] = useState("overview")

<<<<<<< HEAD
  // Expand sidebar when component mounts
  useEffect(() => {
    window.dispatchEvent(new Event('expandSidebar'))
  }, [])

=======
>>>>>>> 5392eb5936b6096cb28c83eae18352196e64b35b
  const maxInterviews = Math.max(...performanceData.map(d => d.interviews))

  return (
    <div className="min-h-screen p-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Dashboard de Entrevistas</h1>
            <p className="text-gray-600 mt-1">Monitorea tus procesos de selección y análisis de candidatos</p>
          </div>
          <div className="flex items-center gap-4">
                          <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-field text-sm w-auto"
              >
                <option value="This week">Esta semana</option>
                <option value="This month">Este mes</option>
                <option value="Last month">Mes pasado</option>
                <option value="This quarter">Este trimestre</option>
              </select>
            <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
                      <motion.div variants={fadeInUp} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">CVs Analizados</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+23%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </motion.div>

                      <motion.div variants={fadeInUp} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Entrevistas Realizadas</p>
                  <p className="text-2xl font-bold text-gray-900">342</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+18%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-secondary-600" />
                </div>
              </div>
            </motion.div>

                      <motion.div variants={fadeInUp} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Candidatos Aprobados</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+26%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Preguntas Generadas</p>
                  <p className="text-2xl font-bold text-gray-900">2,156</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+15%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <motion.div variants={fadeInUp} className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                Efectividad de Entrevistas
              </h3>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Ver Análisis Completo
              </button>
            </div>
            
            <div className="space-y-4">
              {performanceData.map((data, index) => (
                <motion.div
                  key={data.week}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-sm font-medium text-gray-600 w-12">{data.week}</span>
                  <div className="flex-1 flex items-center gap-4">
                                         <div className="flex-1">
                       <div className="flex justify-between text-sm mb-1">
                         <span>Entrevistas: {data.interviews}</span>
                         <span>Éxito: {data.successRate}%</span>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-2">
                         <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: `${(data.interviews / maxInterviews) * 100}%` }}
                           transition={{ duration: 1, delay: index * 0.1 }}
                           className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                         />
                       </div>
                     </div>
                     <div className="w-16 text-right">
                       <span className="text-sm font-semibold text-gray-900">{data.successRate}%</span>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team Overview */}
          <motion.div variants={fadeInUp} className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary-500" />
              Resumen de Procesos
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Sistema Activo</span>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-gray-900">92%</div>
                <div className="text-sm text-gray-600">Tasa de Éxito</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tipo de Análisis Principal</span>
                  <span className="text-sm font-medium">CVs + Descripciones</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Entrevistadores Activos</span>
                  <span className="text-sm font-medium">12 especialistas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tiempo Promedio</span>
                  <span className="text-sm font-medium">45 minutos</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Summaries */}
        <motion.div variants={fadeInUp} className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Resúmenes Semanales
          </h3>
          
          <div className="space-y-6">
            {weeklyTasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-l-4 border-primary-200 pl-6 py-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{task.interviews} entrevistas realizadas</h4>
                  <span className="text-sm text-gray-500">{task.week}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {task.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 