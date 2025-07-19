'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Video, 
  Users, 
  BarChart3, 
  Menu,
  X 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Generar', href: '/generar', icon: Sparkles },
  { name: 'Reunión Virtual', href: '/reunion', icon: Video },
  { name: 'Catálogo de Agentes', href: '/catalogo', icon: Users },
  { name: 'Dashboard Empresas', href: '/dashboard', icon: BarChart3 },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  // Listen for sidebar collapse events from other components
  useEffect(() => {
    const handleCollapseSidebar = () => {
      setIsCollapsed(true)
    }

    window.addEventListener('collapseSidebar', handleCollapseSidebar)
    return () => window.removeEventListener('collapseSidebar', handleCollapseSidebar)
  }, [])

  return (
    <>
      {/* Mobile backdrop */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 256,
          x: 0 
        }}
        className="fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-200 shadow-sm"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Entre Vistas
                </span>
              </motion.div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (pathname === '/' && item.href === '/generar')
              
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'sidebar-item',
                      isActive && 'active',
                      isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-gray-500 text-center"
              >
                <p>© 2025 Entre Vistas</p>

              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
} 