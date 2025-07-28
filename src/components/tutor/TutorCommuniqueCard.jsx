import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiCalendar, 
  FiUser, 
  FiTag, 
  FiPaperclip, 
  FiEye, 
  FiMessageCircle,
  FiEdit3,
  FiMoreVertical,
  FiCopy,
  FiTrash2,
  FiSend,
  FiFileText,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const TutorCommuniqueCard = ({ 
  comunicado, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onPublish, 
  onViewDetails 
}) => {
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
      case 'alta': return <FiAlertTriangle className="w-3 h-3" />
      case 'media': return <FiClock className="w-3 h-3" />
      case 'baja': return <FiCheckCircle className="w-3 h-3" />
      default: return null
    }
  }

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'publicado': return 'bg-green-100 text-green-800'
      case 'borrador': return 'bg-gray-100 text-gray-800'
      case 'programado': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'publicado': return <FiSend className="w-3 h-3" />
      case 'borrador': return <FiFileText className="w-3 h-3" />
      case 'programado': return <FiClock className="w-3 h-3" />
      default: return <FiFileText className="w-3 h-3" />
    }
  }

  const getCategoryColor = (categoria) => {
    const colors = {
      academico: 'bg-blue-100 text-blue-800',
      reunion: 'bg-purple-100 text-purple-800',
      proyecto: 'bg-green-100 text-green-800',
      apoyo: 'bg-orange-100 text-orange-800',
      reconocimiento: 'bg-pink-100 text-pink-800',
      material: 'bg-indigo-100 text-indigo-800',
      informacion: 'bg-cyan-100 text-cyan-800',
      evento: 'bg-red-100 text-red-800'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (categoria) => {
    switch (categoria) {
      case 'academico': return '📚'
      case 'reunion': return '👥'
      case 'proyecto': return '🎯'
      case 'apoyo': return '🤝'
      case 'reconocimiento': return '🏆'
      case 'material': return '📄'
      case 'informacion': return 'ℹ️'
      case 'evento': return '🎉'
      default: return '📝'
    }
  }

  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
        comunicado.estado === 'borrador' ? 'border-l-4 border-l-gray-400' : 
        comunicado.estado === 'publicado' ? 'border-l-4 border-l-green-500' :
        'border-gray-200'
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-lg">{getCategoryIcon(comunicado.categoria)}</div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {comunicado.titulo}
              </h3>
            </div>
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(comunicado.categoria)}`}>
                {comunicado.categoria.charAt(0).toUpperCase() + comunicado.categoria.slice(1)}
              </span>
              
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(comunicado.prioridad)}`}>
                {getPriorityIcon(comunicado.prioridad)}
                <span className="capitalize">{comunicado.prioridad}</span>
              </div>
              
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comunicado.estado)}`}>
                {getStatusIcon(comunicado.estado)}
                <span className="capitalize">{comunicado.estado}</span>
              </div>
            </div>
          </div>
          
          {/* Actions menu */}
          <div className="flex items-center space-x-2">
            {comunicado.estado === 'borrador' && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onPublish(comunicado.id)}
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                title="Publicar"
              >
                <FiSend className="w-4 h-4" />
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(comunicado)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              title="Editar"
            >
              <FiEdit3 className="w-4 h-4" />
            </motion.button>
            
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Más opciones"
              >
                <FiMoreVertical className="w-4 h-4" />
              </motion.button>
              
              {/* Dropdown menu (simplificado para demo) */}
              <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32 z-10">
                <button
                  onClick={() => onDuplicate(comunicado.id)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiCopy className="w-3 h-3" />
                  <span>Duplicar</span>
                </button>
                <button
                  onClick={() => onDelete(comunicado.id)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <FiTrash2 className="w-3 h-3" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content preview */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed text-sm">
            {truncateText(comunicado.contenido)}
          </p>
        </div>

        {/* Dirigido a */}
        <div className="flex items-center space-x-2 mb-4">
          <FiUser className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Dirigido a: {comunicado.dirigidoA.join(', ')}
          </span>
        </div>

        {/* Tags */}
        {comunicado.etiquetas && comunicado.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
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
                +{comunicado.etiquetas.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FiCalendar className="w-4 h-4" />
              <span>{format(new Date(comunicado.fecha), 'dd MMM yyyy', { locale: es })}</span>
            </div>
            
            {comunicado.adjuntos && comunicado.adjuntos.length > 0 && (
              <div className="flex items-center space-x-1">
                <FiPaperclip className="w-4 h-4" />
                <span>{comunicado.adjuntos.length}</span>
              </div>
            )}
            
            {comunicado.estado === 'publicado' && (
              <>
                <div className="flex items-center space-x-1">
                  <FiEye className="w-4 h-4" />
                  <span>{comunicado.vistas}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <FiMessageCircle className="w-4 h-4" />
                  <span>{comunicado.respuestas}</span>
                </div>
              </>
            )}
          </div>
          
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
    </motion.div>
  )
}

export default TutorCommuniqueCard