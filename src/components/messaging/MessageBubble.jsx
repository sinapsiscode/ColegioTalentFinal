import React from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiCheckCircle, FiClock } from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const MessageBubble = ({ mensaje, isOwnMessage, showAvatar = true }) => {
  const formatTime = (fecha) => {
    return format(new Date(fecha), 'HH:mm', { locale: es })
  }

  const getStatusIcon = () => {
    if (!isOwnMessage) return null
    
    if (mensaje.leido) {
      return <FiCheckCircle className="w-3 h-3 text-blue-500" />
    } else {
      return <FiCheck className="w-3 h-3 text-gray-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end space-x-2 mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar para mensajes recibidos */}
      {!isOwnMessage && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-talentos-primary flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          {mensaje.remitente.charAt(0).toUpperCase()}
        </div>
      )}
      
      {/* Burbuja de mensaje */}
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isOwnMessage 
          ? 'bg-talentos-primary text-white rounded-br-sm' 
          : 'bg-gray-200 text-gray-900 rounded-bl-sm'
      }`}>
        {/* Nombre del remitente (solo para mensajes recibidos en grupos) */}
        {!isOwnMessage && (
          <p className="text-xs font-medium text-gray-600 mb-1">
            {mensaje.remitente}
          </p>
        )}
        
        {/* Texto del mensaje */}
        <p className="text-sm whitespace-pre-wrap">{mensaje.texto}</p>
        
        {/* Información del mensaje */}
        <div className={`flex items-center justify-end space-x-1 mt-1 ${
          isOwnMessage ? 'text-white/70' : 'text-gray-500'
        }`}>
          <span className="text-xs">{formatTime(mensaje.fecha)}</span>
          {getStatusIcon()}
        </div>
      </div>
      
      {/* Espaciador para mensajes enviados */}
      {isOwnMessage && !showAvatar && <div className="w-8" />}
    </motion.div>
  )
}

export default MessageBubble