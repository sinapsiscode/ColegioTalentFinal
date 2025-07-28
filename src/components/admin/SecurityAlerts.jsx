import React from 'react'
import { motion } from 'framer-motion'
import {
  FiShield,
  FiAlertTriangle,
  FiInfo,
  FiCheckCircle,
  FiClock,
  FiX,
  FiEye
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const SecurityAlerts = ({ alertas, onMarcarComoLeida, loading = false, onAlertClick }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'warning': return FiAlertTriangle
      case 'info': return FiInfo
      case 'success': return FiCheckCircle
      case 'error': return FiX
      default: return FiInfo
    }
  }

  const getAlertColor = (tipo) => {
    switch (tipo) {
      case 'warning': return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: 'bg-yellow-100 text-yellow-600',
        text: 'text-yellow-800'
      }
      case 'info': return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'bg-blue-100 text-blue-600',
        text: 'text-blue-800'
      }
      case 'success': return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'bg-green-100 text-green-600',
        text: 'text-green-800'
      }
      case 'error': return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'bg-red-100 text-red-600',
        text: 'text-red-800'
      }
      default: return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: 'bg-gray-100 text-gray-600',
        text: 'text-gray-800'
      }
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

  const alertasNoLeidas = alertas.filter(alerta => !alerta.leida)
  const alertasLeidas = alertas.filter(alerta => alerta.leida)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FiShield className="w-5 h-5 text-talentos-primary" />
          <span>Alertas de Seguridad</span>
        </h3>
        
        <div className="flex items-center space-x-2">
          {alertasNoLeidas.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {alertasNoLeidas.length} nueva{alertasNoLeidas.length > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-xs text-gray-500">{alertas.length} total</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {/* Alertas no leídas */}
        {alertasNoLeidas.map((alerta, index) => {
          const IconComponent = getAlertIcon(alerta.tipo)
          const colors = getAlertColor(alerta.tipo)

          return (
            <motion.div
              key={alerta.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                if (onAlertClick) {
                  onAlertClick(alerta)
                }
              }}
              className={`${colors.bg} border ${colors.border} rounded-lg p-3 transition-all duration-200 cursor-pointer`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full ${colors.icon} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${colors.text} mb-1`}>
                    {alerta.mensaje}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                      {format(new Date(alerta.fecha), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(alerta.fecha)}
                    </span>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onMarcarComoLeida(alerta.id)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  title="Marcar como leída"
                >
                  <FiEye className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )
        })}

        {/* Alertas leídas */}
        {alertasLeidas.length > 0 && alertasNoLeidas.length > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs font-medium text-gray-600 mb-2">Alertas anteriores</p>
          </div>
        )}

        {alertasLeidas.map((alerta, index) => {
          const IconComponent = getAlertIcon(alerta.tipo)
          const colors = getAlertColor(alerta.tipo)

          return (
            <motion.div
              key={alerta.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (alertasNoLeidas.length + index) * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                if (onAlertClick) {
                  onAlertClick(alerta)
                }
              }}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 opacity-60 cursor-pointer hover:opacity-80 transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 mb-1">
                    {alerta.mensaje}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {format(new Date(alerta.fecha), 'dd MMM yyyy, HH:mm', { locale: es })}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(alerta.fecha)}
                    </span>
                  </div>
                </div>
                
                <div className="p-1">
                  <FiCheckCircle className="w-4 h-4 text-green-500" title="Leída" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {alertas.length === 0 && (
        <div className="text-center py-8">
          <FiShield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No hay alertas de seguridad</p>
          <p className="text-xs text-gray-500 mt-1">El sistema está funcionando correctamente</p>
        </div>
      )}
    </div>
  )
}

export default SecurityAlerts