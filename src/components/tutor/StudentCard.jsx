import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { 
  FiUser, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCalendar,
  FiEdit3,
  FiEye,
  FiAlertTriangle,
  FiCheck,
  FiBookOpen
} from 'react-icons/fi'

const StudentCard = memo(({ estudiante, onViewDetails, onEditObservations, onManageGrades }) => {
  const getPromedioColor = (promedio) => {
    if (promedio >= 18) return 'text-green-600 bg-green-100'
    if (promedio >= 16) return 'text-blue-600 bg-blue-100'
    if (promedio >= 14) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getAsistenciaColor = (asistencia) => {
    if (asistencia >= 95) return 'text-green-600'
    if (asistencia >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'activo': return { icon: FiCheck, color: 'text-green-600', bg: 'bg-green-100' }
      case 'necesita_atencion': return { icon: FiAlertTriangle, color: 'text-red-600', bg: 'bg-red-100' }
      default: return { icon: FiUser, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const estadoConfig = getEstadoIcon(estudiante.estado)
  const EstadoIcon = estadoConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => onViewDetails(estudiante)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md cursor-pointer"
    >
      {/* Header con foto y estado */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-talentos-primary to-talentos-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
            {estudiante.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{estudiante.nombre}</h3>
            <p className="text-sm text-gray-600">Estudiante ID: {estudiante.id.toString().padStart(3, '0')}</p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${estadoConfig.bg} ${estadoConfig.color}`}>
          <EstadoIcon className="w-3 h-3" />
          <span>{estudiante.estado === 'activo' ? 'Activo' : 'Necesita Atención'}</span>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold mb-1 ${typeof estudiante.promedio === 'number' ? getPromedioColor(estudiante.promedio).split(' ')[0] : 'text-gray-500'}`}>
            {typeof estudiante.promedio === 'number' ? estudiante.promedio.toFixed(1) : 'N/A'}
          </div>
          <div className="text-xs text-gray-600">Promedio</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold mb-1 ${getAsistenciaColor(estudiante.asistencia)}`}>
            {estudiante.asistencia}%
          </div>
          <div className="text-xs text-gray-600">Asistencia</div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Observaciones</h4>
        <p className="text-sm text-gray-700 line-clamp-2">
          {estudiante.observaciones || 'Sin observaciones registradas'}
        </p>
      </div>

      {/* Última clase */}
      <div className="flex items-center space-x-2 text-xs text-gray-600 mb-4">
        <FiCalendar className="w-3 h-3" />
        <span>
          Última clase: {new Date(estudiante.ultimaClase).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {/* Indicadores de rendimiento */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">Rendimiento:</span>
          {typeof estudiante.promedio === 'number' ? (
            estudiante.promedio >= 16 ? (
              <div className="flex items-center space-x-1 text-green-600">
                <FiTrendingUp className="w-3 h-3" />
                <span className="text-xs font-medium">Excelente</span>
              </div>
            ) : estudiante.promedio >= 14 ? (
              <div className="flex items-center space-x-1 text-yellow-600">
                <FiTrendingUp className="w-3 h-3" />
                <span className="text-xs font-medium">Bueno</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <FiTrendingDown className="w-3 h-3" />
                <span className="text-xs font-medium">Necesita apoyo</span>
              </div>
            )
          ) : (
            <div className="flex items-center space-x-1 text-gray-500">
              <FiUser className="w-3 h-3" />
              <span className="text-xs font-medium">Sin calificaciones</span>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(estudiante)
          }}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-talentos-primary text-white text-sm font-medium rounded-lg hover:bg-talentos-secondary transition-colors duration-200"
        >
          <FiEye className="w-3 h-3" />
          <span>Ver Perfil</span>
        </motion.button>
        
        {onManageGrades && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              onManageGrades(estudiante)
            }}
            className="flex items-center justify-center px-3 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors duration-200"
            title="Gestionar calificaciones"
          >
            <FiBookOpen className="w-3 h-3" />
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation()
            onEditObservations(estudiante)
          }}
          className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
          title="Editar observaciones"
        >
          <FiEdit3 className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.div>
  )
})

StudentCard.displayName = 'StudentCard'

export default StudentCard