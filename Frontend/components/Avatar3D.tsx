'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Star, Sparkles, Zap, Crown, Award } from 'lucide-react'

interface Avatar3DProps {
  name: string
  specialty: string
  mood?: 'happy' | 'focused' | 'excited' | 'confident' | 'friendly'
  badge?: string
  badgeColor?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  showParticles?: boolean
}

const avatarPersonalities = {
  'Ana Vargas': {
    base: '👩‍💻',
    personality: 'bcp-frontend',
    colors: ['#003d82', '#0066cc', '#45b7d1'],
    traits: ['react-expert', 'banking-systems', 'user-focused']
  },
  'Carlos Mendoza': {
    base: '👨‍💼', 
    personality: 'bbva-backend',
    colors: ['#004481', '#0078d4', '#00a0df'],
    traits: ['microservices', 'fintech-scale', 'api-design']
  },
  'María Quispe': {
    base: '👩‍🔬',
    personality: 'ibm-data',
    colors: ['#1f70c1', '#0f62fe', '#8a3ffc'],
    traits: ['watson-ai', 'ml-expert', 'analytics']
  },
  'Diego Ramos': {
    base: '👨‍💻',
    personality: 'rappi-mobile',
    colors: ['#ff441f', '#ff6b35', '#ffa726'],
    traits: ['react-native', 'scalable-apps', 'user-growth']
  },
  'Sandra Torres': {
    base: '👩‍🚀',
    personality: 'interbank-devops',
    colors: ['#00a99d', '#26c6da', '#4fc3f7'],
    traits: ['kubernetes', 'banking-infra', 'automation']
  },
  'Luis Herrera': {
    base: '🛡️',
    personality: 'scotia-security',
    colors: ['#d32f2f', '#f44336', '#ff5722'],
    traits: ['banking-security', 'compliance', 'cyber-defense']
  },
  'Andrea Salazar': {
    base: '👩‍🎨',
    personality: 'yape-ux',
    colors: ['#722ed1', '#9c27b0', '#e91e63'],
    traits: ['fintech-ux', 'user-research', 'design-systems']
  },
  'Roberto Chávez': {
    base: '☁️',
    personality: 'falabella-cloud',
    colors: ['#2e7d32', '#388e3c', '#43a047'],
    traits: ['cloud-architecture', 'retail-systems', 'hybrid-solutions']
  }
}

const expressions = {
  happy: { scale: 1.1, rotate: [0, 5, -5, 0] },
  focused: { scale: 1.05, y: [-2, 2, -2] },
  excited: { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] },
  confident: { scale: 1.08, y: [-3, 0] },
  friendly: { scale: 1.06, rotate: [0, 3, -3, 0] }
}

export default function Avatar3D({ 
  name, 
  specialty, 
  mood = 'friendly', 
  badge, 
  badgeColor = 'blue',
  size = 'md',
  interactive = true
}: Omit<Avatar3DProps, 'showParticles'>) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentExpression, setCurrentExpression] = useState(mood)
  const personality = avatarPersonalities[name as keyof typeof avatarPersonalities] || {
    base: '👤',
    personality: 'default',
    colors: ['#74b9ff', '#0984e3', '#6c5ce7'],
    traits: ['professional', 'experienced', 'reliable']
  }

  const sizes = {
    sm: { container: 'w-12 h-12', text: 'text-xl' },
    md: { container: 'w-16 h-16', text: 'text-2xl' },
    lg: { container: 'w-20 h-20', text: 'text-3xl' },
    xl: { container: 'w-24 h-24', text: 'text-4xl' }
  }

  const badgeIcons = {
    'Experto': Crown,
    'Especialista': Star,
    'Líder': Award,
    'Popular': Sparkles,
    'Certificado': Zap
  }

  const handleInteraction = () => {
    if (!interactive) return
    
    const expressions = ['happy', 'excited', 'confident', 'focused'] as const
    const randomExpression = expressions[Math.floor(Math.random() * expressions.length)]
    setCurrentExpression(randomExpression)
    
    setTimeout(() => setCurrentExpression(mood), 2000)
  }

  const BadgeIcon = badge ? badgeIcons[badge as keyof typeof badgeIcons] : null

  return (
    <div className="relative inline-block">
      {/* Contenedor principal del avatar */}
      <motion.div
        className={`${sizes[size].container} relative cursor-pointer`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleInteraction}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Efecto sutil de fondo */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${personality.colors[1]}, transparent)`
          }}
          animate={{
            scale: isHovered ? 1.1 : 1,
            opacity: isHovered ? 0.3 : 0.2
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Avatar principal */}
        <motion.div
          className={`relative z-10 ${sizes[size].container} rounded-full flex items-center justify-center ${sizes[size].text} backdrop-blur-sm`}
          style={{
            background: `linear-gradient(135deg, ${personality.colors[0]}20, ${personality.colors[1]}30, ${personality.colors[2]}20)`,
            border: `2px solid ${personality.colors[1]}40`
          }}
          animate={expressions[currentExpression]}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.span
            animate={{
              scale: isHovered ? [1, 1.1, 1] : 1,
              filter: isHovered ? 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' : 'none'
            }}
            transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
          >
            {personality.base}
          </motion.span>

          {/* Badge flotante */}
          {badge && BadgeIcon && (
            <motion.div
              className="absolute -top-2 -right-2 z-20"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  badgeColor === 'gold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  badgeColor === 'blue' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                  badgeColor === 'purple' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                  badgeColor === 'green' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  badgeColor === 'red' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                  'bg-gradient-to-r from-orange-400 to-orange-600'
                } text-white shadow-lg`}
                whileHover={{ scale: 1.2, rotate: 15 }}
                animate={{ rotate: isHovered ? [0, 10, -10, 0] : 0 }}
                transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
              >
                <BadgeIcon className="w-4 h-4" />
              </motion.div>
            </motion.div>
          )}

          {/* Borde sutil */}
          <div className="absolute inset-[-2px] border border-white/30 rounded-full" />
        </motion.div>

        {/* Efecto hover sutil */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-full border border-white/40"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.div>

      {/* Tooltip minimalista */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-30"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
              {name}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 