'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Crear partículas
    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = Math.min(50, window.innerWidth / 20)
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          color: Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6'
        })
      }
      
      particlesRef.current = particles
    }

    // Animar partículas
    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particlesRef.current.forEach((particle) => {
        // Actualizar posición
        particle.x += particle.speedX
        particle.y += particle.speedY
        
        // Rebotar en los bordes
        if (particle.x <= 0 || particle.x >= canvas.width) particle.speedX *= -1
        if (particle.y <= 0 || particle.y >= canvas.height) particle.speedY *= -1
        
        // Dibujar partícula
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`
        ctx.fill()
        
        // Efecto de pulsación
        particle.opacity = 0.1 + Math.abs(Math.sin(Date.now() * 0.001 + particle.x * 0.01)) * 0.4
      })
      
      animationFrameRef.current = requestAnimationFrame(animateParticles)
    }

    // Inicializar
    resizeCanvas()
    createParticles()
    animateParticles()

    // Event listeners
    window.addEventListener('resize', () => {
      resizeCanvas()
      createParticles()
    })

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Canvas con partículas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
      />
      
      {/* Formas geométricas flotantes */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Círculos grandes animados */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary-500/10 to-transparent rounded-full blur-xl"
        />
        
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute top-60 right-32 w-48 h-48 bg-gradient-to-l from-secondary-500/10 to-transparent rounded-full blur-xl"
        />
        
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, -80, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
          className="absolute bottom-32 left-1/3 w-24 h-24 bg-gradient-to-tr from-primary-400/15 to-secondary-400/15 rounded-lg blur-lg"
        />
        
        {/* Líneas onduladas */}
        <motion.svg
          className="absolute top-1/4 left-0 w-full h-96 opacity-20"
          animate={{
            x: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <path
            d="M0,100 Q250,50 500,100 T1000,100 T1500,100 T2000,100"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </motion.svg>
        
        <motion.svg
          className="absolute bottom-1/4 right-0 w-full h-96 opacity-20"
          animate={{
            x: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 7
          }}
        >
          <path
            d="M2000,200 Q1750,150 1500,200 T1000,200 T500,200 T0,200"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
          />
          <defs>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>
      
      {/* Gradiente de fondo base */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-primary-50/30 to-secondary-50/30 -z-10" />
    </>
  )
} 