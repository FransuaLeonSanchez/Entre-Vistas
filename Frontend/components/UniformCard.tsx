'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface UniformCardProps {
  children: ReactNode
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'auto'
  variant?: 'default' | 'premium' | 'glass' | 'gradient'
  hoverEffect?: boolean
  className?: string
  onClick?: () => void
}

const heightClasses = {
  sm: 'h-64',
  md: 'h-80', 
  lg: 'h-96',
  xl: 'h-[32rem]',
  auto: 'min-h-80'
}

const variantClasses = {
  default: 'bg-white border border-gray-200',
  premium: 'bg-white border border-gray-300 shadow-sm',
  glass: 'bg-white/95 backdrop-blur-sm border border-gray-200',
  gradient: 'bg-gradient-to-br from-gray-50 to-white border border-gray-200'
}

export default function UniformCard({ 
  children, 
  height = 'md',
  variant = 'default',
  hoverEffect = true,
  className = '',
  onClick
}: UniformCardProps) {
  return (
    <motion.div
      className={`
        ${heightClasses[height]}
        ${variantClasses[variant]}
        rounded-xl p-6 
        transition-all duration-200
        ${hoverEffect ? 'hover:shadow-md hover:border-gray-400' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        flex flex-col
        ${className}
      `}
      onClick={onClick}
      whileHover={hoverEffect ? { 
        y: -2,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Contenido con overflow controlado */}
      <div className="flex flex-col h-full">
        {children}
      </div>
    </motion.div>
  )
}

// Componentes auxiliares para estructura consistente
export function CardHeader({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`flex-shrink-0 mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardContent({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`flex-1 overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`flex-shrink-0 mt-4 pt-4 border-t border-white/20 ${className}`}>
      {children}
    </div>
  )
}

// Wrapper para texto que se trunca de manera elegante
export function TruncatedText({ 
  children, 
  lines = 3, 
  className = '' 
}: { 
  children: ReactNode, 
  lines?: number,
  className?: string 
}) {
  return (
    <div 
      className={`overflow-hidden ${className}`}
      style={{
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical',
        lineHeight: '1.5rem',
        maxHeight: `${lines * 1.5}rem`
      }}
    >
      {children}
    </div>
  )
} 