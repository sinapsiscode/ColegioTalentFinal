import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiClock, 
  FiMapPin, 
  FiUsers, 
  FiBook,
  FiPlay,
  FiCheck,
  FiPause
} from 'react-icons/fi'

const ClassCard = ({ clase, onStartClass, onViewDetails }) => {
  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'completada':
        return {
          color: 'bg-green-100 text-green-800',
          icon: FiCheck,
          iconColor: 'text-green-600',
          label: 'Completada'
        }
      case 'en_curso':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: FiPlay,
          iconColor: 'text-blue-600',
          label: 'En Curso'
        }
      case 'pendiente':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: FiPause,
          iconColor: 'text-yellow-600',
          label: 'Pendiente'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: FiClock,
          iconColor: 'text-gray-600',
          label: 'Programada'
        }
    }
  }

  const estadoConfig = getEstadoConfig(clase.estado)
  const EstadoIcon = estadoConfig.icon

  const asistenciaPercentage = Math.round((clase.asistentes / clase.totalEstudiantes) * 100)

  const getAsistenciaColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-talentos-primary to-talentos-secondary rounded-lg flex items-center justify-center text-white">
            <FiBook className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{clase.materia}</h3>
            <p className="text-sm text-gray-600">{clase.grado}</p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${estadoConfig.color}`}>
          <EstadoIcon className="w-3 h-3" />
          <span>{estadoConfig.label}</span>
        </div>
      </div>

      {/* Detalles de la clase */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FiClock className="w-4 h-4" />
          <span>{clase.hora}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FiMapPin className="w-4 h-4" />
          <span>Aula {clase.aula}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FiUsers className="w-4 h-4" />
          <span>
            {clase.asistentes}/{clase.totalEstudiantes} estudiantes
            <span className={`ml-2 font-medium ${getAsistenciaColor(asistenciaPercentage)}`}>
              ({asistenciaPercentage}%)
            </span>
          </span>
        </div>
      </div>

      {/* Tema de la clase */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-1">Tema de la clase</h4>
        <p className="text-sm text-gray-700">{clase.tema}</p>
      </div>

      {/* Barra de asistencia */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Asistencia</span>
          <span>{asistenciaPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${asistenciaPercentage}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={`h-2 rounded-full ${
              asistenciaPercentage >= 90 
                ? 'bg-green-500' 
                : asistenciaPercentage >= 75 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}
          ></motion.div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center space-x-2">
        {clase.estado === 'pendiente' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStartClass(clase)}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <FiPlay className="w-3 h-3" />
            <span>Iniciar Clase</span>
          </motion.button>
        )}
        
        {clase.estado === 'en_curso' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewDetails(clase)}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiPlay className="w-3 h-3" />
            <span>Continuar</span>
          </motion.button>
        )}
        
        {clase.estado === 'completada' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewDetails(clase)}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <FiCheck className="w-3 h-3" />
            <span>Ver Resumen</span>
          </motion.button>
        )}
      </div>

      {/* Indicadores adicionales */}
      {clase.estado === 'en_curso' && (
        <div className="mt-3 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-xs text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Clase en progreso</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ClassCard