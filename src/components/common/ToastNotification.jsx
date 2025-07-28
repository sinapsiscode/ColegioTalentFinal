import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck, FiInfo, FiAlertTriangle, FiAlertCircle, FiBell } from 'react-icons/fi'

/**
 * 🍞 Sistema de Toast Notifications
 * Componente para mostrar notificaciones emergentes
 */

const ToastNotification = ({ 
  id,
  title, 
  message, 
  type = 'info', 
  priority = 'media',
  icon,
  duration = 4000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration > 0) {
      // Animación de progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100))
          if (newProgress <= 0) {
            clearInterval(progressInterval)
            return 0
          }
          return newProgress
        })
      }, 100)

      // Auto close
      const timer = setTimeout(() => {
        handleClose()
        clearInterval(progressInterval)
      }, duration)

      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
      }
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose && onClose(id), 300)
  }

  // Configuración de estilos por tipo
  const getToastConfig = () => {
    const configs = {
      academico: {
        bgColor: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-900',
        iconColor: 'text-blue-600',
        progressColor: 'bg-blue-500',
        defaultIcon: '📊'
      },
      asistencia: {
        bgColor: 'bg-green-50 border-green-200',
        textColor: 'text-green-900',
        iconColor: 'text-green-600',
        progressColor: 'bg-green-500',
        defaultIcon: '👥'
      },
      comunicado: {
        bgColor: 'bg-purple-50 border-purple-200',
        textColor: 'text-purple-900',
        iconColor: 'text-purple-600',
        progressColor: 'bg-purple-500',
        defaultIcon: '📢'
      },
      mensaje: {
        bgColor: 'bg-indigo-50 border-indigo-200',
        textColor: 'text-indigo-900',
        iconColor: 'text-indigo-600',
        progressColor: 'bg-indigo-500',
        defaultIcon: '💬'
      },
      sistema: {
        bgColor: 'bg-gray-50 border-gray-200',
        textColor: 'text-gray-900',
        iconColor: 'text-gray-600',
        progressColor: 'bg-gray-500',
        defaultIcon: '⚙️'
      },
      pago: {
        bgColor: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-900',
        iconColor: 'text-yellow-600',
        progressColor: 'bg-yellow-500',
        defaultIcon: '💳'
      },
      evento: {
        bgColor: 'bg-pink-50 border-pink-200',
        textColor: 'text-pink-900',
        iconColor: 'text-pink-600',
        progressColor: 'bg-pink-500',
        defaultIcon: '📅'
      },
      success: {
        bgColor: 'bg-green-50 border-green-200',
        textColor: 'text-green-900',
        iconColor: 'text-green-600',
        progressColor: 'bg-green-500',
        defaultIcon: <FiCheck />
      },
      error: {
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-900',
        iconColor: 'text-red-600',
        progressColor: 'bg-red-500',
        defaultIcon: <FiAlertCircle />
      },
      warning: {
        bgColor: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-900',
        iconColor: 'text-yellow-600',
        progressColor: 'bg-yellow-500',
        defaultIcon: <FiAlertTriangle />
      },
      info: {
        bgColor: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-900',
        iconColor: 'text-blue-600',
        progressColor: 'bg-blue-500',
        defaultIcon: <FiInfo />
      }
    }

    return configs[type] || configs.info
  }

  // Configuración de prioridad
  const getPriorityConfig = () => {
    const configs = {
      urgente: {
        shadowClass: 'shadow-lg shadow-red-500/25',
        borderWidth: 'border-2',
        animation: { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 1 } }
      },
      alta: {
        shadowClass: 'shadow-lg shadow-orange-500/25',
        borderWidth: 'border-2',
        animation: {}
      },
      media: {
        shadowClass: 'shadow-md',
        borderWidth: 'border',
        animation: {}
      },
      baja: {
        shadowClass: 'shadow-sm',
        borderWidth: 'border',
        animation: {}
      }
    }

    return configs[priority] || configs.media
  }

  const toastConfig = getToastConfig()
  const priorityConfig = getPriorityConfig()

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1,
        ...priorityConfig.animation
      }}
      exit={{ opacity: 0, x: 400, scale: 0.8 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`
        relative max-w-sm w-full rounded-xl overflow-hidden 
        ${toastConfig.bgColor} ${priorityConfig.borderWidth} ${priorityConfig.shadowClass}
        transform-gpu
      `}
    >
      {/* Contenido principal */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icono */}
          <div className={`flex-shrink-0 ${toastConfig.iconColor} text-lg`}>
            {typeof icon === 'string' ? (
              <span className="text-xl">{icon}</span>
            ) : (
              icon || toastConfig.defaultIcon
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`text-sm font-semibold ${toastConfig.textColor} mb-1`}>
                {title}
              </h4>
            )}
            <p className={`text-sm ${toastConfig.textColor} opacity-90`}>
              {message}
            </p>

            {/* Indicador de prioridad urgente */}
            {priority === 'urgente' && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-red-600 bg-red-100">
                  🚨 URGENTE
                </span>
              </div>
            )}
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className={`flex-shrink-0 p-1 rounded-full transition-colors ${toastConfig.iconColor} hover:bg-white hover:bg-opacity-50`}
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30">
          <motion.div
            className={`h-full ${toastConfig.progressColor}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      )}

      {/* Efecto de brillo para notificaciones urgentes */}
      {priority === 'urgente' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
          animate={{ x: [-100, 400] }}
          transition={{ 
            repeat: Infinity, 
            duration: 2, 
            repeatDelay: 1,
            ease: "easeInOut" 
          }}
        />
      )}
    </motion.div>
  )
}

/**
 * 🍞 Contenedor de Toast Notifications
 */
const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    // Escuchar eventos de toast desde el store de notificaciones
    const handleToastEvent = (event) => {
      const toastData = event.detail
      addToast(toastData)
    }

    window.addEventListener('showNotificationToast', handleToastEvent)

    return () => {
      window.removeEventListener('showNotificationToast', handleToastEvent)
    }
  }, [])

  const addToast = (toastData) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newToast = {
      id,
      ...toastData,
      duration: toastData.duration || (toastData.priority === 'urgente' ? 8000 : 4000)
    }

    setToasts(prev => {
      // Limitar a máximo 5 toasts simultáneos
      const updated = [newToast, ...prev.slice(0, 4)]
      return updated
    })
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastNotification
              {...toast}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Funciones de utilidad para crear toasts manualmente
export const showToast = {
  success: (title, message, options = {}) => {
    const event = new CustomEvent('showNotificationToast', {
      detail: { 
        title, 
        message, 
        type: 'success', 
        priority: 'media',
        ...options 
      }
    })
    window.dispatchEvent(event)
  },

  error: (title, message, options = {}) => {
    const event = new CustomEvent('showNotificationToast', {
      detail: { 
        title, 
        message, 
        type: 'error', 
        priority: 'alta',
        duration: 6000,
        ...options 
      }
    })
    window.dispatchEvent(event)
  },

  warning: (title, message, options = {}) => {
    const event = new CustomEvent('showNotificationToast', {
      detail: { 
        title, 
        message, 
        type: 'warning', 
        priority: 'media',
        ...options 
      }
    })
    window.dispatchEvent(event)
  },

  info: (title, message, options = {}) => {
    const event = new CustomEvent('showNotificationToast', {
      detail: { 
        title, 
        message, 
        type: 'info', 
        priority: 'baja',
        ...options 
      }
    })
    window.dispatchEvent(event)
  },

  notification: (notification) => {
    const event = new CustomEvent('showNotificationToast', {
      detail: notification
    })
    window.dispatchEvent(event)
  }
}

export { ToastNotification }
export default ToastContainer