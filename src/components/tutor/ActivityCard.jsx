import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiClock, 
  FiAlertTriangle, 
  FiCheck, 
  FiEdit3,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiMessageSquare
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ActivityCard = ({ actividad, onComplete, onUpdateProgress, onClick }) => {
  const getTipoIcon = (tipo) => {
    const icons = {
      calificacion: FiEdit3,
      reunion: FiUsers,
      planificacion: FiFileText,
      reporte: FiCalendar,
      comunicacion: FiMessageSquare
    }
    return icons[tipo] || FiFileText
  }

  const getTipoColor = (tipo) => {
    const colors = {
      calificacion: 'bg-blue-100 text-blue-600',
      reunion: 'bg-purple-100 text-purple-600',
      planificacion: 'bg-green-100 text-green-600',
      reporte: 'bg-orange-100 text-orange-600',
      comunicacion: 'bg-pink-100 text-pink-600'
    }
    return colors[tipo] || 'bg-gray-100 text-gray-600'
  }

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'text-red-600 bg-red-100'
      case 'media': return 'text-yellow-600 bg-yellow-100'
      case 'baja': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTiempoRestante = (fechaVencimiento) => {
    const ahora = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diferencia = vencimiento - ahora
    
    if (diferencia < 0) return { texto: 'Vencida', color: 'text-red-600', urgente: true }
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60))
    const dias = Math.floor(horas / 24)
    
    if (dias > 1) return { texto: `${dias} días`, color: 'text-gray-600', urgente: false }
    if (horas > 1) return { texto: `${horas} horas`, color: 'text-yellow-600', urgente: horas <= 6 }
    
    const minutos = Math.floor(diferencia / (1000 * 60))
    return { texto: `${minutos} min`, color: 'text-red-600', urgente: true }
  }

  const TipoIcon = getTipoIcon(actividad.tipo)
  const tiempoRestante = getTiempoRestante(actividad.fechaVencimiento)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={() => onClick && onClick(actividad)}
      className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md p-4 ${
        actividad.completado ? 'border-green-200 bg-green-50' : 'border-gray-200'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTipoColor(actividad.tipo)}`}>
            <TipoIcon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-semibold ${actividad.completado ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
              {actividad.titulo}
            </h3>
            <p className="text-xs text-gray-600 mt-1">{actividad.descripcion}</p>
          </div>
        </div>
        
        {!actividad.completado && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(actividad.prioridad)}`}>
            {actividad.prioridad === 'alta' && <FiAlertTriangle className="w-3 h-3" />}
            <span className="capitalize">{actividad.prioridad}</span>
          </div>
        )}
        
        {actividad.completado && (
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
            <FiCheck className="w-3 h-3" />
            <span>Completada</span>
          </div>
        )}
      </div>

      {/* Fecha y tiempo restante */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <FiClock className="w-3 h-3" />
          <span>
            Vence: {format(new Date(actividad.fechaVencimiento), 'dd MMM, HH:mm', { locale: es })}
          </span>
        </div>
        
        {!actividad.completado && (
          <div className={`flex items-center space-x-1 ${tiempoRestante.color}`}>
            {tiempoRestante.urgente && <FiAlertTriangle className="w-3 h-3" />}
            <span className="text-xs font-medium">{tiempoRestante.texto}</span>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      {!actividad.completado && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{actividad.progreso}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${actividad.progreso}%` }}
              transition={{ duration: 0.8 }}
              className="bg-talentos-primary h-2 rounded-full"
            ></motion.div>
          </div>
        </div>
      )}

      {/* Acciones */}
      {!actividad.completado && (
        <div className="flex items-center space-x-2">
          {actividad.progreso < 100 && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdateProgress(actividad.id, Math.min(100, actividad.progreso + 25))
                }}
                className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors duration-200"
              >
                +25%
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdateProgress(actividad.id, Math.min(100, actividad.progreso + 50))
                }}
                className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors duration-200"
              >
                +50%
              </motion.button>
            </>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              onComplete(actividad.id)
            }}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors duration-200"
          >
            <FiCheck className="w-3 h-3" />
            <span>Completar</span>
          </motion.button>
        </div>
      )}

      {/* Indicador de urgencia */}
      {!actividad.completado && tiempoRestante.urgente && (
        <div className="mt-2 flex items-center justify-center">
          <div className="flex items-center space-x-1 text-xs text-red-600">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
            <span>Requiere atención urgente</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ActivityCard