import React from 'react'
import { motion } from 'framer-motion'
import {
  FiMessageSquare,
  FiEdit3,
  FiUserPlus,
  FiCalendar,
  FiSettings,
  FiBookOpen,
  FiUsers,
  FiActivity
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const RecentActivity = ({ actividades, loading = false, onActivityClick }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getActivityIcon = (tipo) => {
    switch (tipo) {
      case 'comunicado': return FiMessageSquare
      case 'calificacion': return FiEdit3
      case 'mensaje': return FiMessageSquare
      case 'reunion': return FiCalendar
      case 'sistema': return FiSettings
      case 'proyecto': return FiBookOpen
      case 'asistencia': return FiUsers
      default: return FiActivity
    }
  }

  const getActivityColor = (tipo) => {
    switch (tipo) {
      case 'comunicado': return 'bg-blue-100 text-blue-600'
      case 'calificacion': return 'bg-green-100 text-green-600'
      case 'mensaje': return 'bg-purple-100 text-purple-600'
      case 'reunion': return 'bg-orange-100 text-orange-600'
      case 'sistema': return 'bg-gray-100 text-gray-600'
      case 'proyecto': return 'bg-cyan-100 text-cyan-600'
      case 'asistencia': return 'bg-pink-100 text-pink-600'
      default: return 'bg-indigo-100 text-indigo-600'
    }
  }

  const formatTimeAgo = (fecha) => {
    const now = new Date()
    const diff = now - new Date(fecha)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) {
      return `hace ${minutes} min`
    } else if (hours < 24) {
      return `hace ${hours}h`
    } else {
      return `hace ${days}d`
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FiActivity className="w-5 h-5 text-talentos-primary" />
          <span>Actividad Reciente</span>
        </h3>
        <span className="text-xs text-gray-500 hidden sm:inline">{actividades.length} actividades</span>
      </div>

      <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
        {actividades.map((actividad, index) => {
          const IconComponent = getActivityIcon(actividad.tipo)
          const colorClass = getActivityColor(actividad.tipo)

          return (
            <motion.div
              key={actividad.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                if (onActivityClick) {
                  onActivityClick(actividad)
                }
              }}
              className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 cursor-pointer"
            >
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {actividad.usuario}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-1 sm:ml-2">
                    {formatTimeAgo(actividad.fecha)}
                  </span>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  <span className="capitalize">{actividad.accion}</span>
                  {actividad.detalle && (
                    <>
                      : <span className="font-medium">{actividad.detalle}</span>
                    </>
                  )}
                </p>
                
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {format(new Date(actividad.fecha), 'dd MMM yyyy, HH:mm', { locale: es })}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {actividades.length === 0 && (
        <div className="text-center py-6 sm:py-8">
          <FiActivity className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-xs sm:text-sm text-gray-600">No hay actividad reciente</p>
        </div>
      )}
    </div>
  )
}

export default RecentActivity