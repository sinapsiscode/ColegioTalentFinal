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
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {!comunicado.leido && (
                <div className="w-2 h-2 bg-talentos-primary rounded-full"></div>
              )}
              <h3 className={`text-lg font-semibold ${
                !comunicado.leido ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {comunicado.titulo}
              </h3>
            </div>
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <FiUser className="w-4 h-4" />
                <span>{comunicado.autor}</span>
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
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(comunicado.categoria)}`}>
            {comunicado.categoria.charAt(0).toUpperCase() + comunicado.categoria.slice(1)}
          </span>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => comunicado.leido ? onMarkAsUnread(comunicado.id) : onMarkAsRead(comunicado.id)}
              className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
              title={comunicado.leido ? 'Marcar como no leído' : 'Marcar como leído'}
            >
              {comunicado.leido ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewDetails(comunicado)}
              className="px-4 py-2 bg-talentos-primary text-white text-sm font-medium rounded-lg hover:bg-talentos-secondary transition-colors duration-200"
            >
              Ver completo
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CommuniqueCard