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
  Play,
  MessageSquare
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}



export default function ReunionPage() {
  const [isMicOn, setIsMicOn] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [questionsOpen, setQuestionsOpen] = useState(true)
  const [documentsOpen, setDocumentsOpen] = useState(true)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [interviewQuestions, setInterviewQuestions] = useState<Array<{ id: number, pregunta: string, categoria: string }>>([])
  
  // Backend integration states
  const [isConnected, setIsConnected] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Camera states
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  
  // Transcription panel states
  const [transcriptionOpen, setTranscriptionOpen] = useState(true)
  const [transcriptionMessages, setTranscriptionMessages] = useState<Array<{
    role: 'recruiter' | 'candidate'
    message: string
    timestamp: Date
  }>>([])
  
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const transcriptionEndRef = useRef<HTMLDivElement | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Auto-collapse sidebar on mount
  useEffect(() => {
    // Dispatch event to collapse sidebar
    window.dispatchEvent(new CustomEvent('collapseSidebar'))
  }, [])

  // Auto-scroll transcription when new messages arrive
  useEffect(() => {
    transcriptionEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcriptionMessages])
  
  // Initialize camera when component mounts and camera is on
  useEffect(() => {
    if (isCameraOn) {
      startCamera()
    } else {
      stopCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [isCameraOn])

  // Connect to WebSocket
  const connectWebSocket = (forceNewSession = false) => {
    // Generar nuevo session ID si es necesario
    if (forceNewSession || !sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('Nuevo session ID:', sessionIdRef.current)
    }
    
    // Incluir session ID en la URL de conexión
    const ws = new WebSocket(`ws://localhost:8000/ws?session_id=${sessionIdRef.current}`)
    
    ws.onopen = () => {
      console.log('WebSocket conectado con session:', sessionIdRef.current)
      setIsConnected(true)
      // María se presenta automáticamente al conectarse
    }
    
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      console.log('WebSocket message received:', data.type, data)
      
      switch (data.type) {
        case 'chat_response':
          // Mostrar que está hablando
          console.log('Chat response received:', data.data)
          setIsSpeaking(true)
          setIsProcessing(false)
          // Agregar mensaje de María a la transcripción
          setTranscriptionMessages(prev => [...prev, {
            role: 'recruiter',
            message: data.data,
            timestamp: new Date()
          }])
          break
          
        case 'tts_result':
          // Reproducir audio cuando esté listo
          console.log('TTS result received, has audio:', !!data.data)
          if (data.data) {
            playAudio(data.data)
          }
          // Resetear isProcessing después de recibir el audio
          setIsProcessing(false)
          break
          
        case 'stt_result':
          // Transcripción recibida
          console.log('STT result - Transcripción:', data.data)
          // Agregar mensaje del candidato a la transcripción
          if (data.data) {
            setTranscriptionMessages(prev => [...prev, {
              role: 'candidate',
              message: data.data,
              timestamp: new Date()
            }])
          }
          break
          
        case 'chat_start':
        case 'tts_start':
        case 'stt_start':
          // Indicadores de progreso
          console.log('Processing started:', data.type)
          setIsProcessing(true)
          // Timeout de seguridad para evitar bloqueos
    setTimeout(() => {
            setIsProcessing(false)
          }, 10000) // 10 segundos máximo
          break
          
        case 'error':
          console.error('Error del servidor:', data.data)
          setIsProcessing(false)
          setIsSpeaking(false)
          alert('Error: ' + data.data)
          break
          
        default:
          console.log('Unknown message type:', data.type)
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
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`)
      audio.onended = () => {
        console.log('Audio playback ended')
        setIsSpeaking(false)
        setIsProcessing(false) // Asegurar que se resetee
      }
      audio.onerror = (error) => {
        console.error('Audio playback error:', error)
        setIsSpeaking(false)
        setIsProcessing(false)
      }
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
        setIsSpeaking(false)
        setIsProcessing(false)
      })
      audioRef.current = audio
    } catch (error) {
      console.error('Error creating audio:', error)
      setIsSpeaking(false)
      setIsProcessing(false)
    }
  }

  // Start recording
  const startRecording = async () => {
    try {
      // Pausar/silenciar cualquier audio que esté reproduciéndose
      if (audioRef.current && !audioRef.current.paused) {
        console.log('Pausing current audio playback')
        audioRef.current.pause()
        setIsSpeaking(false)
      }
      
      console.log('Requesting microphone permission...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('Microphone permission granted')
      
      // Try webm first, fallback to other formats
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4'
      
      console.log('Using mimeType:', mimeType)
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size)
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, chunks:', audioChunksRef.current.length)
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        audioChunksRef.current = []
        
        console.log('Audio blob size:', audioBlob.size)
        
        // Convert to base64 and send
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Audio = reader.result?.toString().split(',')[1]
          if (base64Audio && wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('Sending audio, base64 length:', base64Audio.length)
            wsRef.current.send(JSON.stringify({
              type: 'audio',
              data: base64Audio
            }))
          } else {
            console.error('Cannot send audio - WebSocket not open or no data')
          }
        }
        reader.readAsDataURL(audioBlob)
      }
      
      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      console.log('Recording started successfully')
    } catch (error) {
      console.error('Error al iniciar grabación:', error)
      alert('Error al acceder al micrófono. Por favor, permite el acceso al micrófono.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    console.log('Stop recording called, isRecording:', isRecording)
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping MediaRecorder...')
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    } else {
      console.log('Cannot stop - no recorder or not recording')
    }
  }

  // Handle push-to-talk
  const handleMicToggle = () => {
    console.log('Mic toggle clicked, isStarted:', isStarted, 'isProcessing:', isProcessing, 'isRecording:', isRecording)
    
    if (!isStarted) {
      console.log('Cannot toggle mic - not started')
      return
    }
    
    // Permitir interrumpir incluso si está procesando, pero no si ya está grabando y procesando
    if (isProcessing && isRecording) {
      console.log('Cannot stop recording while processing')
      return
    }
    
    if (isRecording) {
      console.log('Stopping recording...')
      // Stop recording and send
      stopRecording()
      setIsMicOn(false)
    } else {
      console.log('Starting recording...')
      // Start recording
      startRecording()
      setIsMicOn(true)
    }
  }

  // Start interview
  const startInterview = async () => {
    // Cerrar conexión anterior si existe
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }
    
    // Limpiar estados anteriores
    setTranscriptionMessages([])
    setIsProcessing(false)
    setIsRecording(false)
    setIsSpeaking(false)
    setIsMicOn(false)
    
    // Cargar preguntas desde el backend
    try {
      const response = await fetch('http://localhost:8000/api/preguntas')
      const preguntas = await response.json()
      if (!response.ok || preguntas.error) {
        console.error('Error al cargar preguntas:', preguntas.error)
      } else {
        setInterviewQuestions(preguntas)
        console.log('Preguntas cargadas:', preguntas)
      }
    } catch (error) {
      console.error('Error al cargar preguntas:', error)
    }
    
    // Iniciar nueva entrevista con nueva sesión
    setIsStarted(true)
    connectWebSocket(true) // true = forzar nueva sesión
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => file.name)
      setUploadedFiles(prev => [...prev, ...files])
    }
  }

  // Start camera
  const startCamera = async () => {
    setIsCameraLoading(true)
    setIsCameraReady(false)
    
    try {
      // Reducir resolución para mejor rendimiento
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640, max: 640 },
          height: { ideal: 480, max: 480 },
          facingMode: 'user',
          frameRate: { ideal: 15, max: 30 }
        },
        audio: false 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Esperar a que el video esté listo
        videoRef.current.onloadedmetadata = () => {
          setTimeout(() => {
            setIsCameraReady(true)
            setIsCameraLoading(false)
            console.log('Cámara lista')
          }, 500) // Pequeño delay para asegurar que se muestre
        }
      }
      
      console.log('Stream de cámara obtenido')
    } catch (error) {
      console.error('Error al acceder a la cámara:', error)
      setIsCameraOn(false)
      setIsCameraLoading(false)
      setIsCameraReady(false)
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.')
    }
  }
  
  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsCameraReady(false)
    setIsCameraLoading(false)
    console.log('Cámara detenida')
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
              className="absolute top-80 transform -translate-x-1/2 flex flex-col items-center gap-4"
          >
            {/* Control buttons row */}
            <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMicToggle}
              disabled={isProcessing && isRecording}
              className={`p-4 rounded-full transition-all duration-200 backdrop-blur-sm border-2 relative ${
                isRecording 
                  ? 'bg-red-500/80 border-red-400 hover:bg-red-600/80' 
                  : isProcessing && !isSpeaking
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
                <>
                  <Mic className={`w-6 h-6 ${isProcessing ? 'text-gray-300' : 'text-white'}`} />
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/50"></div>
                    </div>
                  )}
                </>
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
            </div>
            
            {/* New Interview Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsStarted(false)
                setTimeout(() => startInterview(), 100)
              }}
              className="px-6 py-2 bg-gray-600/80 text-white rounded-lg font-medium shadow-md hover:bg-gray-700/80 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Nueva Entrevista
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
            <div className="relative w-full h-full bg-gray-800">
              {/* Video element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isCameraReady ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ transform: 'scaleX(-1)' }} // Mirror effect
              />
              
              {/* Overlay elements - Always visible */}
              {isCameraReady && (
                <>
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded px-3 py-1">
                <span className="text-white text-sm">Tú</span>
              </div>
                  <div className="absolute top-3 right-3 bg-green-500 w-3 h-3 rounded-full animate-pulse" />
                </>
              )}
              
              {/* Loading state while camera initializes */}
              {isCameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-white text-sm">Iniciando cámara...</p>
                  </div>
                </div>
              )}
              
              {/* Error state if camera fails */}
              {!isCameraLoading && !isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Cámara no disponible</p>
                  </div>
                </div>
              )}
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

      {/* Floating Transcription Panel - Left Side */}
      <AnimatePresence>
        {transcriptionOpen && (
          <motion.div
            initial={{ opacity: 0, x: -400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -400 }}
            className="absolute top-6 left-28 w-96 max-h-[80vh] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-500" />
                Transcripción en Vivo
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTranscriptionMessages([])}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setTranscriptionOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {transcriptionMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    La transcripción aparecerá aquí cuando comience la conversación
                  </p>
                </div>
              ) : (
                <>
                  {/* Contador de mensajes */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Mensajes: {transcriptionMessages.length}</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  
                  {/* Mensajes */}
                  {transcriptionMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${
                        msg.role === 'recruiter' 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-gray-50 border border-gray-200'
                      } rounded-lg p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          msg.role === 'recruiter'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-400 text-white'
                        }`}>
                          {msg.role === 'recruiter' ? 'M' : 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-gray-800 text-sm">
                              {msg.role === 'recruiter' ? 'María (BCP)' : 'Candidato'}
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 break-words">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={transcriptionEndRef} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Questions Panel - Interview Questions from Backend */}
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
                Preguntas de Entrevista BCP
              </h3>
                <button
                  onClick={() => setQuestionsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {interviewQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Las preguntas se cargarán cuando inicie la entrevista
                  </p>
                </div>
              ) : (
                <>
                  {/* Question list */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Temas de la entrevista:</h4>
                    {interviewQuestions.map((question, index) => (
                <motion.div
                        key={question.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border rounded-lg p-3 ${
                          index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{question.pregunta}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Categoría: {question.categoria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Info note */}
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      <strong>Nota:</strong> María realizará estas preguntas durante la conversación. Responde de forma natural y completa.
                    </p>
                </div>
                </>
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
        {!transcriptionOpen && (
          <motion.button
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            onClick={() => setTranscriptionOpen(true)}
            className="absolute top-6 left-28 p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-primary-500" />
          </motion.button>
        )}
      </AnimatePresence>

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