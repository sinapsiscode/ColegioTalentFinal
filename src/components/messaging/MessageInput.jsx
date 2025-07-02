import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi'
import AnimatedButton from '../common/AnimatedButton'

const MessageInput = ({ onSendMessage, disabled = false, placeholder = "Escribe tu mensaje..." }) => {
  const [mensaje, setMensaje] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (mensaje.trim() && !disabled) {
      onSendMessage(mensaje.trim())
      setMensaje('')
      
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

  const handleTextareaChange = (e) => {
    setMensaje(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-t border-gray-200 p-4"
    >
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Botón de adjuntos */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-gray-500 hover:text-talentos-primary transition-colors duration-200 flex-shrink-0"
          title="Adjuntar archivo"
        >
          <FiPaperclip className="w-5 h-5" />
        </motion.button>
        
        {/* Campo de texto */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={mensaje}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-talentos-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          
          {/* Botón de emoji */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 bottom-2 p-1 text-gray-500 hover:text-talentos-primary transition-colors duration-200"
            title="Añadir emoji"
          >
            <FiSmile className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Botón de enviar */}
        <AnimatedButton
          type="submit"
          variant="primary"
          size="sm"
          disabled={!mensaje.trim() || disabled}
          className="flex-shrink-0 rounded-full w-10 h-10 p-0 flex items-center justify-center"
        >
          <FiSend className="w-4 h-4" />
        </AnimatedButton>
      </form>
      
      {/* Indicador de escritura */}
      {disabled && (
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
          <span>El profesor está escribiendo...</span>
        </motion.div>
      )}
    </motion.div>
  )
}

export default MessageInput