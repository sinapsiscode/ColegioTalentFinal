import React from 'react'
import { motion } from 'framer-motion'
import { FiMessageCircle, FiUser, FiClock } from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AnimatedCard from '../common/AnimatedCard'

const ConversationList = ({ conversaciones, selectedConversation, onSelectConversation }) => {
  const formatTime = (fecha) => {
    const now = new Date()
    const messageDate = new Date(fecha)
    const diffInHours = (now - messageDate) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return format(messageDate, 'HH:mm', { locale: es })
    } else if (diffInHours < 168) { // Una semana
      return format(messageDate, 'EEE', { locale: es })
    } else {
      return format(messageDate, 'dd/MM', { locale: es })
    }
  }

  const getParticipantName = (participantes, currentUser) => {
    return participantes.find(p => p !== currentUser) || 'Usuario'
  }

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (conversaciones.length === 0) {
    return (
      <AnimatedCard>
        <div className="text-center py-8">
          <FiMessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay conversaciones</h3>
          <p className="text-gray-600">Aún no tienes mensajes en tu bandeja de entrada.</p>
        </div>
      </AnimatedCard>
    )
  }

  return (
    <div className="space-y-2">
      {conversaciones.map((conversacion, index) => {
        const otherParticipant = getParticipantName(conversacion.participantes, 'Carlos Rodríguez')
        const isSelected = selectedConversation?.id === conversacion.id
        const hasUnread = conversacion.mensajes.some(msg => !msg.leido && msg.remitente !== 'Carlos Rodríguez')
        const unreadCount = conversacion.mensajes.filter(msg => !msg.leido && msg.remitente !== 'Carlos Rodríguez').length

        return (
          <motion.div
            key={conversacion.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectConversation(conversacion)}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              isSelected 
                ? 'bg-talentos-light border-talentos-primary shadow-md' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(otherParticipant)}`}>
                {otherParticipant.charAt(0).toUpperCase()}
              </div>
              
              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-talentos-dark' : 'text-gray-900'}`}>
                    {otherParticipant}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {formatTime(conversacion.ultimoMensaje.fecha)}
                    </span>
                    {hasUnread && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {conversacion.tipo === 'admin-padre' && (
                    <FiUser className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  )}
                  <p className={`text-sm truncate ${hasUnread && !isSelected ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {conversacion.ultimoMensaje.remitente === 'Carlos Rodríguez' && (
                      <span className="text-gray-400 mr-1">Tú:</span>
                    )}
                    {conversacion.ultimoMensaje.texto}
                  </p>
                </div>
                
                {/* Indicador de tipo de conversación */}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    conversacion.tipo === 'padre-tutor' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {conversacion.tipo === 'padre-tutor' ? 'Profesor' : 'Administración'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default ConversationList