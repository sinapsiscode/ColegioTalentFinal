import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiActivity,
  FiUsers,
  FiMessageSquare,
  FiCalendar,
  FiBook,
  FiClock,
  FiTrendingUp,
  FiMoreHorizontal,
  FiRefreshCw
} from 'react-icons/fi'

const ActivityWidget = ({ 
  title = "Actividad Reciente",
  maxItems = 5,
  showTimestamps = true,
  size = "normal", // "small", "normal", "large"
  autoRefresh = true,
  refreshInterval = 30000 // 30 segundos
}) => {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Mock data generator
  const generateMockActivities = () => {
    const activityTypes = [
      {
        type: 'user_login',
        icon: FiUsers,
        color: 'text-blue-600 bg-blue-100',
        messages: [
          'María García se conectó al sistema',
          'Juan Pérez inició sesión',
          'Ana López accedió al dashboard',
          'Carlos Ruiz se autenticó'
        ]
      },
      {
        type: 'message_sent',
        icon: FiMessageSquare,
        color: 'text-purple-600 bg-purple-100',
        messages: [
          'Nuevo comunicado enviado a 5° Primaria',
          'Mensaje de reunión de padres',
          'Notificación de calificaciones disponible',
          'Recordatorio de evento escolar'
        ]
      },
      {
        type: 'attendance',
        icon: FiCalendar,
        color: 'text-green-600 bg-green-100',
        messages: [
          'Asistencia registrada para 4° A',
          'Estudiante marcó entrada tardía',
          'Profesor registró asistencia',
          'Sistema actualizó estadísticas'
        ]
      },
      {
        type: 'grade_updated',
        icon: FiBook,
        color: 'text-orange-600 bg-orange-100',
        messages: [
          'Calificaciones actualizadas en Matemáticas',
          'Nuevas notas disponibles',
          'Promedio recalculado para estudiante',
          'Reporte de calificaciones generado'
        ]
      }
    ]

    return Array.from({ length: maxItems + 2 }, (_, i) => {
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)]
      const message = activityType.messages[Math.floor(Math.random() * activityType.messages.length)]
      
      const timestamp = new Date()
      timestamp.setMinutes(timestamp.getMinutes() - (i * Math.floor(Math.random() * 60)))

      return {
        id: `activity-${i}-${Date.now()}`,
        type: activityType.type,
        icon: activityType.icon,
        color: activityType.color,
        message,
        timestamp,
        isNew: i < 2 && Math.random() > 0.5
      }
    }).slice(0, maxItems)
  }

  useEffect(() => {
    const loadActivities = () => {
      setIsLoading(true)
      // Simular carga de datos
      setTimeout(() => {
        setActivities(generateMockActivities())
        setLastUpdate(new Date())
        setIsLoading(false)
      }, 800)
    }

    loadActivities()

    if (autoRefresh) {
      const interval = setInterval(loadActivities, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [maxItems, autoRefresh, refreshInterval])

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `hace ${days}d`
    if (hours > 0) return `hace ${hours}h`
    if (minutes > 0) return `hace ${minutes}m`
    return 'ahora'
  }

  const sizeClasses = {
    small: {
      container: 'text-xs',
      item: 'p-2',
      icon: 'w-3 h-3 p-1',
      title: 'text-sm',
      message: 'text-xs'
    },
    normal: {
      container: 'text-sm',
      item: 'p-3',
      icon: 'w-4 h-4 p-1.5',
      title: 'text-base',
      message: 'text-sm'
    },
    large: {
      container: 'text-base',
      item: 'p-4',
      icon: 'w-5 h-5 p-2',
      title: 'text-lg',
      message: 'text-base'
    }
  }

  const currentSizeClass = sizeClasses[size] || sizeClasses.normal

  const handleRefresh = () => {
    setActivities(generateMockActivities())
    setLastUpdate(new Date())
  }

  if (isLoading) {
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="p-1.5 bg-gray-100 rounded-lg"
            >
              <FiRefreshCw className="w-4 h-4" />
            </motion.div>
            <h3 className={`font-semibold text-gray-900 ${currentSizeClass.title}`}>
              {title}
            </h3>
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <FiActivity className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className={`font-semibold text-gray-900 ${currentSizeClass.title}`}>
            {title}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {showTimestamps && (
            <span className="text-xs text-gray-500">
              {lastUpdate.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiRefreshCw className="w-3 h-3" />
          </motion.button>
        </div>
      </div>

      {/* Activities List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {activities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-gray-500 p-6"
            >
              <FiActivity className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm text-center">No hay actividad reciente</p>
            </motion.div>
          ) : (
            <div className="p-2">
              {activities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex items-start space-x-3 ${currentSizeClass.item} rounded-lg hover:bg-gray-50 transition-colors group`}
                  >
                    {/* New indicator */}
                    {activity.isNew && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full"
                      />
                    )}

                    {/* Icon */}
                    <motion.div 
                      className={`${currentSizeClass.icon} rounded-lg ${activity.color} flex-shrink-0`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icon className="w-full h-full" />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`${currentSizeClass.message} text-gray-800 group-hover:text-gray-900 transition-colors`}>
                        {activity.message}
                      </p>
                      
                      {showTimestamps && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      )}
                    </div>

                    {/* Trending indicator for important activities */}
                    {activity.isNew && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-1 text-green-500"
                      >
                        <FiTrendingUp className="w-3 h-3" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <motion.div 
          className="p-3 border-t border-gray-100 bg-gray-50 flex-shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 transition-colors">
            <span>Ver toda la actividad</span>
            <FiMoreHorizontal className="w-3 h-3" />
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ActivityWidget