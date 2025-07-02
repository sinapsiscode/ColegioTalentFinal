import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiUser, 
  FiUsers, 
  FiShield,
  FiUserCheck,
  FiClock,
  FiMessageCircle
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const TutorConversationCard = ({ conversacion, isSelected, onClick }) => {
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'tutor-padre': return FiUser
      case 'tutor-admin': return FiShield
      case 'tutor-colega': return FiUserCheck
      default: return FiUsers
    }
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'tutor-padre': return 'bg-blue-100 text-blue-600'
      case 'tutor-admin': return 'bg-purple-100 text-purple-600'
      case 'tutor-colega': return 'bg-green-100 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'tutor-padre': return 'Padre/Madre'
      case 'tutor-admin': return 'Administración'
      case 'tutor-colega': return 'Colega'
      default: return 'Otro'
    }
  }

  const getParticipanteName = () => {
    return conversacion.participantes.find(p => p !== 'María García') || 'Usuario'
  }

  const getTimeAgo = (fecha) => {
    const ahora = new Date()
    const mensaje = new Date(fecha)
    const diferencia = ahora - mensaje
    
    const minutos = Math.floor(diferencia / (1000 * 60))
    const horas = Math.floor(diferencia / (1000 * 60 * 60))
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
    
    if (dias > 0) return `${dias}d`
    if (horas > 0) return `${horas}h`
    if (minutos > 0) return `${minutos}m`
    return 'Ahora'
  }

  const mensajesNoLeidos = conversacion.mensajes.filter(
    msg => !msg.leido && msg.remitente !== 'María García'
  ).length

  const TipoIcon = getTipoIcon(conversacion.tipo)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'border-talentos-primary bg-talentos-primary/5' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar y tipo */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
            {getParticipanteName().charAt(0).toUpperCase()}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${getTipoColor(conversacion.tipo)}`}>
            <TipoIcon className="w-3 h-3" />
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {getParticipanteName()}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTipoColor(conversacion.tipo)}`}>
                {getTipoLabel(conversacion.tipo)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {getTimeAgo(conversacion.ultimoMensaje.fecha)}
              </span>
              {mensajesNoLeidos > 0 && (
                <div className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {mensajesNoLeidos > 9 ? '9+' : mensajesNoLeidos}
                </div>
              )}
            </div>
          </div>

          {/* Asunto */}
          <p className="text-sm font-medium text-gray-800 mb-1 truncate">
            {conversacion.asunto}
          </p>

          {/* Estudiante relacionado */}
          {conversacion.estudiante && (
            <p className="text-xs text-blue-600 mb-1 flex items-center space-x-1">
              <FiUser className="w-3 h-3" />
              <span>Sobre: {conversacion.estudiante}</span>
            </p>
          )}

          {/* Último mensaje */}
          <div className="flex items-center space-x-2">
            <FiMessageCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <p className={`text-xs text-gray-600 truncate ${
              !conversacion.ultimoMensaje.leido && conversacion.ultimoMensaje.remitente !== 'María García' 
                ? 'font-medium' 
                : ''
            }`}>
              {conversacion.ultimoMensaje.remitente === 'María García' ? 'Tú: ' : ''}
              {conversacion.ultimoMensaje.texto}
            </p>
          </div>

          {/* Fecha completa en hover */}
          <div className="mt-1">
            <span className="text-xs text-gray-400">
              {format(new Date(conversacion.ultimoMensaje.fecha), 'dd MMM, HH:mm', { locale: es })}
            </span>
          </div>
        </div>
      </div>

      {/* Indicador de conversación activa */}
      {isSelected && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="mt-3 h-1 bg-talentos-primary rounded-full"
        />
      )}
    </motion.div>
  )
}

export default TutorConversationCard