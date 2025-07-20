'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Upload,
  FileText,
  CheckCircle,
  Circle,
  User,
  X,
  Volume2,
  Camera,
  Send,
  Play
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const interactiveQuestions = [
  {
    id: 1,
    question: "Cuéntame sobre tu experiencia con React",
    answered: false,
    alternatives: [
      { text: "Tengo 2-3 años de experiencia", followUp: "¿Qué proyectos has desarrollado con React?" },
      { text: "Soy principiante, menos de 1 año", followUp: "¿Qué te motivó a aprender React?" },
      { text: "Tengo más de 4 años de experiencia", followUp: "¿Has trabajado con SSR o frameworks como Next.js?" }
    ]
  },
  {
    id: 2,
    question: "¿Cómo manejas el estado en aplicaciones grandes?",
    answered: false,
    alternatives: [
      { text: "Uso Redux o Zustand", followUp: "¿Puedes explicar cuándo prefieres cada uno?" },
      { text: "Context API principalmente", followUp: "¿Has enfrentado problemas de rendimiento con Context?" },
      { text: "Estado local con hooks", followUp: "¿Cómo organizas el estado compartido entre componentes?" }
    ]
  },
  {
    id: 3,
    question: "Describe tu experiencia con testing en frontend",
    answered: false,
    alternatives: [
      { text: "Uso Jest y React Testing Library", followUp: "¿Qué tipos de tests priorizas más?" },
      { text: "Principalmente testing manual", followUp: "¿Te interesaría aprender testing automatizado?" },
      { text: "Cypress para E2E y unit tests", followUp: "¿Cómo estructuras tu suite de tests?" }
    ]
  },
  {
    id: 4,
    question: "¿Cómo optimizas el rendimiento en React?",
    answered: false,
    alternatives: [
      { text: "Memo, useMemo, useCallback", followUp: "¿Puedes dar un ejemplo específico de cuándo los usas?" },
      { text: "Code splitting y lazy loading", followUp: "¿Qué estrategias usas para el bundle splitting?" },
      { text: "Virtualización para listas grandes", followUp: "¿Has usado react-window o react-virtualized?" }
    ]
  }
]

export default function ReunionPage() {
  const [isMicOn, setIsMicOn] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [questionsOpen, setQuestionsOpen] = useState(true)
  const [documentsOpen, setDocumentsOpen] = useState(true)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [questions, setQuestions] = useState(interactiveQuestions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [conversationHistory, setConversationHistory] = useState<Array<{question: string, answer: string, followUp?: string}>>([])
  
  // Backend integration states
  const [isConnected, setIsConnected] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Auto-collapse sidebar on mount
  useEffect(() => {
    // Dispatch event to collapse sidebar
    window.dispatchEvent(new CustomEvent('collapseSidebar'))
  }, [])

  // Connect to WebSocket
  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws')
    
    ws.onopen = () => {
      console.log('WebSocket conectado')
      setIsConnected(true)
      // María se presenta automáticamente al conectarse
    }
    
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'chat_response':
          // Mostrar que está hablando
          setIsSpeaking(true)
          setIsProcessing(false)
          break
          
        case 'tts_result':
          // Reproducir audio cuando esté listo
          if (data.data) {
            playAudio(data.data)
          }
          break
          
        case 'stt_result':
          // Transcripción recibida
          console.log('Transcripción:', data.data)
          break
          
        case 'chat_start':
        case 'tts_start':
        case 'stt_start':
          // Indicadores de progreso
          setIsProcessing(true)
          break
          
        case 'error':
          console.error('Error del servidor:', data.data)
          setIsProcessing(false)
          setIsSpeaking(false)
          break
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }
    
    ws.onclose = () => {
      console.log('WebSocket desconectado')
      setIsConnected(false)
      setIsStarted(false)
    }
    
    wsRef.current = ws
  }

  // Play audio from base64
  const playAudio = (base64Audio: string) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`)
    audio.onended = () => {
      setIsSpeaking(false)
    }
    audio.play()
    audioRef.current = audio
  }

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        audioChunksRef.current = []
        
        // Convert to base64 and send
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Audio = reader.result?.toString().split(',')[1]
          if (base64Audio && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'audio',
              data: base64Audio
            }))
          }
        }
        reader.readAsDataURL(audioBlob)
      }
      
      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
    } catch (error) {
      console.error('Error al iniciar grabación:', error)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  // Handle push-to-talk
  const handleMicToggle = () => {
    if (!isStarted || isProcessing) return
    
    if (isRecording) {
      // Stop recording and send
      stopRecording()
      setIsMicOn(false)
    } else {
      // Start recording
      startRecording()
      setIsMicOn(true)
    }
  }

  // Start interview
  const startInterview = () => {
    setIsStarted(true)
    connectWebSocket()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const handleAnswerSelect = (answer: string, followUp: string) => {
    setSelectedAnswer(answer)
    
    // Add to conversation history
    const currentQuestion = questions[currentQuestionIndex]
    const newEntry = {
      question: currentQuestion.question,
      answer: answer,
      followUp: followUp
    }
    
    setConversationHistory(prev => [...prev, newEntry])
    
    // Mark question as answered
    const updatedQuestions = questions.map((q, index) => 
      index === currentQuestionIndex ? { ...q, answered: true } : q
    )
    setQuestions(updatedQuestions)
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setSelectedAnswer(null)
      }
    }, 2000)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => file.name)
      setUploadedFiles(prev => [...prev, ...files])
    }
  }

  const resetInterview = () => {
    setQuestions(interactiveQuestions)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setConversationHistory([])
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Main Content Area */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Central Avatar Area */}
        <div className="relative">
          {/* Voice Waves Background */}
          <AnimatePresence>
            {isSpeaking && (
              <>
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ 
                      scale: [1, 1.5 + i * 0.2, 1],
                      opacity: [0.8, 0.2, 0]
                    }}
                    exit={{ scale: 1, opacity: 0 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut"
                    }}
                    className="absolute inset-0 border-4 border-white/30 rounded-full"
                    style={{
                      width: `${200 + i * 40}px`,
                      height: `${200 + i * 40}px`,
                      left: `${-20 - i * 20}px`,
                      top: `${-20 - i * 20}px`
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Main Avatar */}
          <motion.div
            animate={{ 
              scale: isSpeaking ? [1, 1.1, 1] : 1,
              boxShadow: isSpeaking 
                ? ["0 0 0 0 rgba(59, 130, 246, 0.7)", "0 0 0 20px rgba(59, 130, 246, 0)", "0 0 0 0 rgba(59, 130, 246, 0)"]
                : "0 0 20px rgba(59, 130, 246, 0.3)"
            }}
            transition={{ 
              duration: isSpeaking ? 1.5 : 0.5, 
              repeat: isSpeaking ? Infinity : 0,
              ease: "easeInOut" 
            }}
            className="relative right-5 w-48 h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-white/20 backdrop-blur-sm"
          >
            <User className="w-20 h-20 text-white" />
            
            {/* Speaking indicator */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-2 border-white"
                >
                  <Volume2 className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* AI Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-150 transform -translate-x-1/2 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-1">EntrevistaIA</h2>
            <p className="text-blue-200 text-sm">Entrevistador Virtual</p>
            <motion.div
              animate={{ opacity: isSpeaking ? [1, 0.5, 1] : 0.7 }}
              transition={{ duration: 1, repeat: isSpeaking ? Infinity : 0 }}
              className="flex items-center justify-center gap-1 mt-2"
            >
              <div className="w-1 h-1 bg-green-400 rounded-full" />
              <span className="text-green-400 text-xs">
                {isSpeaking ? 'Hablando...' : isConnected ? 'Listo para conversar' : 'Desconectado'}
              </span>
            </motion.div>
          </motion.div>

          {/* Start Interview Button */}
          {!isStarted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-80 transform -translate-x-1/2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startInterview}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold shadow-lg flex items-center gap-3"
              >
                <Play className="w-5 h-5" />
                Iniciar Entrevista
              </motion.button>
            </motion.div>
          )}

          {/* Controls positioned relative to avatar */}
          {isStarted && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-80 transform -translate-x-1/2 flex items-center gap-4"
            >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMicToggle}
              disabled={isProcessing}
              className={`p-4 rounded-full transition-all duration-200 backdrop-blur-sm border-2 relative ${
                isRecording 
                  ? 'bg-red-500/80 border-red-400 hover:bg-red-600/80' 
                  : isProcessing
                  ? 'bg-gray-500/50 border-gray-400 cursor-not-allowed'
                  : 'bg-white/20 border-white/30 hover:bg-white/30'
              }`}
            >
              {isRecording ? (
                <>
                  <Mic className="w-6 h-6 text-white animate-pulse" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </>
              ) : (
                <Mic className={`w-6 h-6 ${isProcessing ? 'text-gray-300' : 'text-white'}`} />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`p-4 rounded-full transition-all duration-200 backdrop-blur-sm border-2 ${
                isCameraOn 
                  ? 'bg-white/20 border-white/30 hover:bg-white/30' 
                  : 'bg-red-500/80 border-red-400 hover:bg-red-600/80'
              }`}
            >
              {isCameraOn ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </motion.button>
          </motion.div>
          )}
        </div>

        {/* User Camera (Bigger and more to the right) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-4 left-40 w-64 h-48 bg-gray-800 rounded-xl overflow-hidden border-2 border-white/20"
        >
          {isCameraOn ? (
            <div className="relative w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded px-3 py-1">
                <span className="text-white text-sm">Tú</span>
              </div>
              <div className="absolute top-3 right-3 bg-green-500 w-3 h-3 rounded-full" />
            </div>
          ) : (
            <div className="w-full h-full bg-black flex items-center justify-center">
              <div className="text-center text-white">
                <VideoOff className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Cámara desactivada</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Questions Panel - Interactive */}
      <AnimatePresence>
        {questionsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="absolute top-6 right-6 w-96 max-h-[80vh] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary-500" />
                Preguntas de Entrevista
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetInterview}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Reiniciar
                </button>
                <button
                  onClick={() => setQuestionsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {/* Progress */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Progreso: {currentQuestionIndex + 1}/{questions.length}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current Question */}
              {currentQuestionIndex < questions.length && (
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <h4 className="font-medium text-gray-800 mb-3">
                    {questions[currentQuestionIndex].question}
                  </h4>
                  
                  <div className="space-y-2">
                    {questions[currentQuestionIndex].alternatives.map((alt, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(alt.text, alt.followUp)}
                        disabled={selectedAnswer !== null}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedAnswer === alt.text
                            ? 'bg-primary-100 border-primary-300 text-primary-700'
                            : selectedAnswer
                            ? 'bg-gray-100 border-gray-200 text-gray-500'
                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{alt.text}</span>
                          {selectedAnswer === alt.text && (
                            <CheckCircle className="w-4 h-4 text-primary-500" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {selectedAnswer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <p className="text-sm text-green-700">
                        <strong>Seguimiento:</strong> {questions[currentQuestionIndex].alternatives.find(alt => alt.text === selectedAnswer)?.followUp}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Completed Questions History */}
              {conversationHistory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Preguntas Completadas:</h4>
                  {conversationHistory.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <p className="text-sm font-medium text-gray-800 mb-1">{entry.question}</p>
                      <p className="text-xs text-blue-600 mb-1">✓ {entry.answer}</p>
                      {entry.followUp && (
                        <p className="text-xs text-gray-600">→ {entry.followUp}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Interview Complete */}
              {currentQuestionIndex >= questions.length && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-6 bg-green-50 border border-green-200 rounded-lg"
                >
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-green-800 mb-2">¡Entrevista Completada!</h4>
                  <p className="text-sm text-green-600 mb-4">
                    Has respondido todas las preguntas. Excelente trabajo.
                  </p>
                  <button
                    onClick={resetInterview}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Comenzar Nueva Entrevista
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Documents Panel - Same width */}
      <AnimatePresence>
        {documentsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="absolute bottom-6 right-6 w-96 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary-500" />
                Documentos
              </h3>
              <button
                onClick={() => setDocumentsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Sube CVs o documentos
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-3 py-1 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 cursor-pointer transition-colors"
                >
                  Subir Archivos
                </label>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Archivos:</h4>
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 truncate">{file}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel Toggle Buttons (when closed) */}
      <AnimatePresence>
        {!questionsOpen && (
          <motion.button
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            onClick={() => setQuestionsOpen(true)}
            className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-colors"
          >
            <CheckCircle className="w-6 h-6 text-primary-500" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!documentsOpen && (
          <motion.button
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            onClick={() => setDocumentsOpen(true)}
            className="absolute bottom-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-colors"
          >
            <FileText className="w-6 h-6 text-secondary-500" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
} 