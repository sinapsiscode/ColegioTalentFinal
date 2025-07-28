import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiSend, 
  FiPaperclip, 
  FiSmile, 
  FiX, 
  FiFile, 
  FiImage,
  FiMic,
  FiStopCircle
} from 'react-icons/fi'
import AnimatedButton from '../common/AnimatedButton'
import { showError } from '../../utils/sweetAlert'

const MessageInputEnhanced = ({ 
  value,
  onChange,
  onSend,
  onAttachment,
  attachment,
  onRemoveAttachment,
  isTyping,
  showEmojiPicker,
  onToggleEmojiPicker,
  disabled = false,
  placeholder = "Escribe tu mensaje..."
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const recordingInterval = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [value])

  // Limpiar intervalo de grabación
  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if ((value.trim() || attachment) && !disabled) {
      onSend()
      
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && onAttachment) {
      // Validar tamaño
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        showError('Archivo muy grande', 'El tamaño máximo permitido es 10MB')
        return
      }
      
      onAttachment(file)
    }
    
    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
    
    // En producción aquí iniciarías la grabación real
    console.log('Iniciando grabación de audio...')
  }

  const stopRecording = () => {
    setIsRecording(false)
    setRecordingTime(0)
    
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current)
    }
    
    // En producción aquí detendrías la grabación y enviarías el audio
    console.log('Deteniendo grabación de audio...')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const emojis = ['😊', '😄', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️', '🎉', '🙏', '👋']

  return (
    <div className="bg-white border-t border-gray-200">
      {/* Vista previa del adjunto */}
      <AnimatePresence>
        {attachment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-4"
          >
            <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {attachment.type?.startsWith('image/') ? (
                  <FiImage className="w-5 h-5 text-blue-600" />
                ) : (
                  <FiFile className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                  <p className="text-xs text-gray-500">
                    {(attachment.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={onRemoveAttachment}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <FiX className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selector de emojis */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2 border-b border-gray-100"
          >
            <div className="flex flex-wrap gap-2">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onChange(value + emoji)
                    if (onToggleEmojiPicker) onToggleEmojiPicker()
                  }}
                  className="text-xl hover:scale-110 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input principal */}
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end space-x-2">
            {/* Botones de acción */}
            <div className="flex space-x-1">
              {/* Adjuntar archivo */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-talentos-primary transition-colors duration-200"
                title="Adjuntar archivo"
              >
                <FiPaperclip className="w-5 h-5" />
              </motion.button>
              
              {/* Grabar audio */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 transition-colors duration-200 ${
                  isRecording ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-talentos-primary'
                }`}
                title={isRecording ? "Detener grabación" : "Grabar audio"}
              >
                {isRecording ? <FiStopCircle className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
              </motion.button>
            </div>
            
            {/* Campo de texto o indicador de grabación */}
            {isRecording ? (
              <div className="flex-1 bg-red-50 rounded-2xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-700">Grabando...</span>
                </div>
                <span className="text-sm text-red-600 font-mono">{formatTime(recordingTime)}</span>
              </div>
            ) : (
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  disabled={disabled}
                  rows={1}
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-talentos-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                
                {/* Botón de emoji */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleEmojiPicker}
                  className="absolute right-3 bottom-2 p-1 text-gray-500 hover:text-talentos-primary transition-colors duration-200"
                  title="Añadir emoji"
                >
                  <FiSmile className="w-4 h-4" />
                </motion.button>
              </div>
            )}
            
            {/* Botón de enviar */}
            <AnimatedButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={(!value.trim() && !attachment && !isRecording) || disabled}
              className="flex-shrink-0 rounded-full w-10 h-10 p-0 flex items-center justify-center"
            >
              <FiSend className="w-4 h-4" />
            </AnimatedButton>
          </div>
        </form>
        
        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        
        {/* Indicador de escritura */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-xs text-gray-500 flex items-center space-x-1"
          >
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>está escribiendo...</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MessageInputEnhanced