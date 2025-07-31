import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiAlertTriangle, 
  FiX, 
  FiRefreshCw, 
  FiAlertCircle,
  FiRadio,
  FiCloud
} from 'react-icons/fi'
import { Button } from '../ui'

const ErrorToast = ({
  error,
  onClose,
  onRetry,
  autoClose = true,
  duration = 5000,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (!autoClose) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          setIsVisible(false)
          setTimeout(onClose, 500)
          return 0
        }
        return prev - 100
      })
    }, 100)

    return () => clearInterval(timer)
  }, [autoClose, duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 500)
  }

  const getErrorType = (error) => {
    if (!navigator.onLine) return 'network'
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) return 'network'
    if (error?.response?.status >= 500) return 'server'
    if (error?.response?.status === 404) return 'notFound'
    if (error?.response?.status >= 400) return 'client'
    return 'generic'
  }

  const getErrorConfig = (type) => {
    const configs = {
      network: {
        icon: FiCloud,
        title: 'Sin conexión',
        message: 'Verifica tu conexión a internet',
        color: 'orange',
        canRetry: true
      },
      server: {
        icon: FiAlertTriangle,
        title: 'Error del servidor',
        message: 'Problema en nuestros servidores',
        color: 'red',
        canRetry: true
      },
      notFound: {
        icon: FiAlertCircle,
        title: 'No encontrado',
        message: 'El recurso solicitado no existe',
        color: 'yellow',
        canRetry: false
      },
      client: {
        icon: FiAlertCircle,
        title: 'Error de solicitud',
        message: 'Verifica los datos enviados',
        color: 'red',
        canRetry: false
      },
      generic: {
        icon: FiAlertTriangle,
        title: 'Error',
        message: 'Ha ocurrido un error inesperado',
        color: 'red',
        canRetry: true
      }
    }
    return configs[type] || configs.generic
  }

  const errorType = getErrorType(error)
  const config = getErrorConfig(errorType)
  const Icon = config.icon

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  const colorClasses = {
    red: 'border-red-200 bg-red-50',
    orange: 'border-orange-200 bg-orange-50',
    yellow: 'border-yellow-200 bg-yellow-50'
  }

  const iconColorClasses = {
    red: 'text-red-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className={`fixed ${positions[position]} z-50 max-w-sm w-full mx-4`}
        >
          <div className={`rounded-lg border-2 ${colorClasses[config.color]} shadow-lg overflow-hidden`}>
            {/* Progress bar */}
            {autoClose && (
              <div className="h-1 bg-gray-200">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / duration) * 100}%` }}
                  className={`h-full ${config.color === 'red' ? 'bg-red-500' : config.color === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'}`}
                />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Icon className={`w-5 h-5 ${iconColorClasses[config.color]}`} />
                </div>
                
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {config.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {error?.message || config.message}
                  </p>

                  {/* Actions */}
                  {(config.canRetry && onRetry) && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={FiRefreshCw}
                        onClick={() => {
                          onRetry()
                          handleClose()
                        }}
                      >
                        Reintentar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 ml-4">
                  <button
                    onClick={handleClose}
                    className="inline-flex text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Provider para manejar múltiples toasts
export class ErrorToastManager {
  constructor() {
    this.toasts = []
    this.listeners = []
  }

  addToast(error, options = {}) {
    const toast = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      error,
      ...options
    }

    this.toasts.push(toast)
    this.notifyListeners()

    return toast.id
  }

  removeToast(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notifyListeners()
  }

  clearAll() {
    this.toasts = []
    this.notifyListeners()
  }

  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.toasts))
  }
}

// Instancia global del manager
export const errorToastManager = new ErrorToastManager()

// Hook para usar el toast manager
export const useErrorToasts = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const unsubscribe = errorToastManager.subscribe(setToasts)
    return unsubscribe
  }, [])

  const showErrorToast = (error, options) => {
    return errorToastManager.addToast(error, options)
  }

  const removeErrorToast = (id) => {
    errorToastManager.removeToast(id)
  }

  const clearAllToasts = () => {
    errorToastManager.clearAll()
  }

  return {
    toasts,
    showErrorToast,
    removeErrorToast,
    clearAllToasts
  }
}

export default ErrorToast