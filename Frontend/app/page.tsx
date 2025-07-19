'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Sparkles, 
  Brain, 
  Zap, 
  ArrowRight, 
  Users, 
  Target, 
  Rocket,
  CheckCircle,
  Star,
  TrendingUp
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
}

const floatingElements = [
  { icon: Brain, delay: 0, color: 'text-primary-500' },
  { icon: Sparkles, delay: 2, color: 'text-secondary-500' },
  { icon: Zap, delay: 4, color: 'text-primary-400' },
  { icon: Target, delay: 6, color: 'text-secondary-400' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Elementos decorativos sutiles */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {floatingElements.slice(0, 2).map((element, index) => (
          <motion.div
            key={index}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: index * 2 }}
            className={`absolute ${element.color}`}
            style={{
              left: `${30 + index * 40}%`,
              top: `${40 + index * 20}%`,
            }}
          >
            <element.icon className="w-8 h-8" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero Section */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center mb-20"
        >
          {/* Logo principal simplificado */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Título principal */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold font-poppins mb-4 text-gray-900"
          >
            Entre Vistas
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Sistema inteligente para generar preguntas de entrevistas personalizadas con IA
          </motion.p>

          {/* CTAs principales */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/generar">
              <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Comenzar Ahora
              </button>
            </Link>

            <Link href="/catalogo">
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Ver Entrevistadores
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16"
        >
          {[
            {
              icon: Brain,
              title: "IA Avanzada",
              description: "Powered by GPT-4 para generar preguntas específicas y relevantes según cada puesto",
              color: "from-primary-500 to-primary-600"
            },
            {
              icon: Target,
              title: "Análisis Preciso", 
              description: "Analiza CVs y descripciones de trabajo para crear entrevistas personalizadas",
              color: "from-secondary-500 to-secondary-600"
            },
            {
              icon: TrendingUp,
              title: "Resultados Medibles",
              description: "Dashboard avanzado para trackear efectividad y mejorar procesos de selección",
              color: "from-primary-400 to-secondary-500"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {[
            { number: "1,247", label: "CVs Analizados", icon: CheckCircle },
            { number: "342", label: "Entrevistas Realizadas", icon: Users },
            { number: "89", label: "Candidatos Aprobados", icon: Star },
            { number: "92%", label: "Tasa de Éxito", icon: TrendingUp }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ scale: 1.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
                <stat.icon className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              href: "/generar",
              title: "Generar Preguntas",
              description: "Crea preguntas específicas para cualquier puesto",
              icon: Sparkles,
              color: "from-primary-500 to-primary-600"
            },
            {
              href: "/reunion",
              title: "Simulación de Entrevista",
              description: "Practica entrevistas con IA avanzada",
              icon: Users,
              color: "from-secondary-500 to-secondary-600"
            },
            {
              href: "/catalogo",
              title: "Entrevistadores Expertos",
              description: "Encuentra especialistas para tu proceso",
              icon: Target,
              color: "from-primary-400 to-secondary-500"
            },
            {
              href: "/dashboard",
              title: "Analytics & Resultados",
              description: "Monitorea la efectividad de tus procesos",
              icon: TrendingUp,
              color: "from-secondary-400 to-primary-500"
            }
          ].map((nav, index) => (
            <Link key={index} href={nav.href}>
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="card group cursor-pointer h-52 flex flex-col justify-between"
              >
                {/* Área del ícono - altura fija */}
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 mb-4 bg-gradient-to-r ${nav.color} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    <nav.icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Área de contenido - altura controlada */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-bold mb-3 text-gradient-hover h-7 flex items-center leading-tight">
                    {nav.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed h-16 overflow-hidden">
                    {nav.description}
                  </p>
                </div>

                
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  )
} 