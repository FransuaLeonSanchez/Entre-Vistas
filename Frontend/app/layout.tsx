import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins' 
})

export const metadata: Metadata = {
  title: 'Entre Vistas - Sistema Inteligente de Entrevistas IA',
  description: 'Plataforma avanzada de IA para generar preguntas de entrevistas laborales personalizadas con GPT-4',
  keywords: 'entrevistas, IA, reclutamiento, preguntas técnicas, selección personal',
  authors: [{ name: 'Entre Vistas Team' }],
  openGraph: {
    title: 'Entre Vistas - Sistema Inteligente de Entrevistas IA',
    description: 'Revoluciona tus procesos de selección con IA avanzada',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.className} ${poppins.variable}`}>
      <body className="bg-gray-50">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
            <div className="min-h-screen">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
} 