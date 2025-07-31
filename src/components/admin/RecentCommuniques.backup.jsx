import React from 'react'
import { motion } from 'framer-motion'
import {
  FiMessageSquare,
  FiEye,
  FiMessageCircle,
  FiSend,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiUser
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const RecentCommuniques = ({ comunicados, loading = false, onCommuniqueClick }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="border-b border-gray-200 py-3">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="flex space-x-4">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

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
      case 'enviado': return 'bg-green-100 text-green-800'
      case 'programado': return 'bg-blue-100 text-blue-800'
      case 'borrador': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'enviado': return <FiSend className="w-3 h-3" />
      case 'programado': return <FiClock className="w-3 h-3" />
      case 'borrador': return <FiMessageSquare className="w-3 h-3" />
      default: return <FiMessageSquare className="w-3 h-3" />
    }
  }

  const formatTimeAgo = (fecha) => {
    const now = new Date()
    const diff = now - new Date(fecha)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 24) {
      return `hace ${hours}h`
    } else {
      return `hace ${days}d`
    }
  }

  const truncateText = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-talentos-primary" />
          <span className="text-sm sm:text-base">Comunicados Recientes</span>
        </h3>
        <span className="text-xs text-gray-500 hidden sm:inline">{comunicados.length} comunicados</span>
      </div>

      <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
        {comunicados.map((comunicado, index) => (
          <motion.div
            key={comunicado.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => {
              if (onCommuniqueClick) {
                onCommuniqueClick(comunicado)
              }
            }}
            className="border-b border-gray-200 pb-2 sm:pb-3 last:border-b-0 hover:bg-gray-50 rounded-lg px-2 py-3 sm:p-3 transition-colors duration-200 cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 mb-1 pr-2">
                  {comunicado.titulo}
                </h4>
                
                {/* Metadatos */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                  <div className={`flex items-center space-x-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(comunicado.estado)}`}>
                    {getStatusIcon(comunicado.estado)}
                    <span className="capitalize">{comunicado.estado}</span>
                  </div>
                  
                  <div className={`flex items-center space-x-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${getPriorityColor(comunicado.prioridad)}`}>
                    {getPriorityIcon(comunicado.prioridad)}
                    <span className="capitalize">{comunicado.prioridad}</span>
                  </div>
                </div>
              </div>
              
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">
                {formatTimeAgo(comunicado.fecha)}
              </span>
            </div>

            {/* Autor - Solo en desktop */}
            <div className="hidden sm:flex items-center space-x-1 mb-2">
              <FiUser className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-600">{comunicado.autor}</span>
            </div>

            {/* Estadísticas */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <FiUser className="w-3 h-3" />
                <span className="hidden sm:inline">{comunicado.destinatarios} destinatarios</span>
                <span className="sm:hidden">{comunicado.destinatarios}</span>
              </div>
              
              {comunicado.estado === 'enviado' && (
                <>
                  <div className="flex items-center space-x-1">
                    <FiEye className="w-3 h-3" />
                    <span className="hidden sm:inline">{comunicado.vistas} vistas</span>
                    <span className="sm:hidden">{comunicado.vistas}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <FiMessageCircle className="w-3 h-3" />
                    <span className="hidden sm:inline">{comunicado.respuestas} respuestas</span>
                    <span className="sm:hidden">{comunicado.respuestas}</span>
                  </div>
                </>
              )}
            </div>

            {/* Fecha completa - Solo desktop */}
            <div className="mt-2 hidden sm:block">
              <p className="text-xs text-gray-500">
                {format(new Date(comunicado.fecha), 'dd MMM yyyy, HH:mm', { locale: es })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {comunicados.length === 0 && (
        <div className="text-center py-8">
          <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No hay comunicados recientes</p>
        </div>
      )}
    </div>
  )
}

export default RecentCommuniques