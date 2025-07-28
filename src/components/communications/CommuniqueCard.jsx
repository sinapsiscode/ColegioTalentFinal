import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiCalendar, 
  FiUser, 
  FiTag, 
  FiPaperclip, 
  FiEye, 
  FiEyeOff,
  FiAlertCircle,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CommuniqueCard = ({ comunicado, onMarkAsRead, onMarkAsUnread, onViewDetails }) => {
  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baja': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (prioridad) => {
    switch (prioridad) {
      case 'alta': return <FiAlertCircle className="w-3 h-3" />
      case 'media': return <FiClock className="w-3 h-3" />
      case 'baja': return <FiCheckCircle className="w-3 h-3" />
      default: return null
    }
  }

  const getCategoryColor = (categoria) => {
    const colors = {
      reuniones: 'bg-blue-100 text-blue-800',
      horarios: 'bg-purple-100 text-purple-800',
      eventos: 'bg-pink-100 text-pink-800',
      seguridad: 'bg-red-100 text-red-800',
      actividades: 'bg-green-100 text-green-800',
      resultados: 'bg-indigo-100 text-indigo-800',
      talleres: 'bg-orange-100 text-orange-800',
      academico: 'bg-cyan-100 text-cyan-800'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800'
  }

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
        !comunicado.leido ? 'border-l-4 border-l-talentos-primary' : 'border-gray-200'
      }`}
    >
      <div className="p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              {!comunicado.leido && (
                <div className="w-2 h-2 bg-talentos-primary rounded-full flex-shrink-0"></div>
              )}
              <h3 className={`text-base sm:text-lg font-semibold truncate ${
                !comunicado.leido ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {comunicado.titulo}
              </h3>
            </div>
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate max-w-[120px] sm:max-w-none">{comunicado.autor}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <FiCalendar className="w-4 h-4" />
                <span>{format(new Date(comunicado.fecha), 'dd MMM yyyy, HH:mm', { locale: es })}</span>
              </div>
              
              {comunicado.adjuntos && comunicado.adjuntos.length > 0 && (
                <div className="flex items-center space-x-1">
                  <FiPaperclip className="w-4 h-4" />
                  <span>{comunicado.adjuntos.length} adjunto{comunicado.adjuntos.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Priority badge */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(comunicado.prioridad)}`}>
            {getPriorityIcon(comunicado.prioridad)}
            <span className="capitalize">{comunicado.prioridad}</span>
          </div>
        </div>

        {/* Content preview */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">
            {truncateText(comunicado.contenido)}
          </p>
        </div>

        {/* Tags */}
        {comunicado.etiquetas && comunicado.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {comunicado.etiquetas.slice(0, 3).map((etiqueta, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                <FiTag className="w-3 h-3" />
                <span>{etiqueta}</span>
              </span>
            ))}
            {comunicado.etiquetas.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{comunicado.etiquetas.length - 3} más
              </span>
            )}
          </div>
        )}

        {/* Category and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${getCategoryColor(comunicado.categoria)}`}>
            {comunicado.categoria.charAt(0).toUpperCase() + comunicado.categoria.slice(1)}
          </span>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => comunicado.leido ? onMarkAsUnread(comunicado.id) : onMarkAsRead(comunicado.id)}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200 rounded-md hover:bg-gray-100 flex-shrink-0"
              title={comunicado.leido ? 'Marcar como no leído' : 'Marcar como leído'}
            >
              {comunicado.leido ? <FiEyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewDetails(comunicado)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 bg-talentos-primary text-white text-xs sm:text-sm font-medium rounded-md sm:rounded-lg hover:bg-talentos-secondary transition-colors duration-200 whitespace-nowrap flex-shrink-0"
            >
              <span className="hidden sm:inline">Ver completo</span>
              <span className="sm:hidden">Ver</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CommuniqueCard