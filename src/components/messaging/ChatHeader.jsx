import React from 'react'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiMoreVertical, FiPhone, FiVideo, FiInfo } from 'react-icons/fi'

const ChatHeader = ({ conversacion, onBack, onShowInfo }) => {
  if (!conversacion) return null

  const otherParticipant = conversacion.participantes.find(p => p !== 'Carlos Rodríguez') || 'Usuario'
  const isOnline = Math.random() > 0.5 // Simulación de estado en línea

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-200 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Botón de retroceso */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-1 text-gray-600 hover:text-talentos-primary transition-colors duration-200 lg:hidden"
          >
            <FiArrowLeft className="w-5 h-5" />
          </motion.button>
          
          {/* Avatar y información */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(otherParticipant)}`}>
                {otherParticipant.charAt(0).toUpperCase()}
              </div>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{otherParticipant}</h3>
              <p className="text-sm text-gray-600">
                {conversacion.tipo === 'padre-tutor' ? 'Profesor' : 'Administración'}
                {isOnline && <span className="text-green-600 ml-1">• En línea</span>}
              </p>
            </div>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200 hidden sm:block"
            title="Llamada de voz"
          >
            <FiPhone className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200 hidden sm:block"
            title="Videollamada"
          >
            <FiVideo className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onShowInfo}
            className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
            title="Información"
          >
            <FiInfo className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
            title="Más opciones"
          >
            <FiMoreVertical className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default ChatHeader