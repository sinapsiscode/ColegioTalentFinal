import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiUser, 
  FiBook, 
  FiCalendar, 
  FiTrendingUp, 
  FiTrendingDown,
  FiMinus,
  FiCheck,
  FiX,
  FiEye
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const GradeCard = ({ calificacion, onViewDetails }) => {
  const getGradeColor = (promedio) => {
    if (promedio >= 17) return 'text-green-600 bg-green-100'
    if (promedio >= 15) return 'text-blue-600 bg-blue-100'
    if (promedio >= 13) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getGradeStatus = (promedio) => {
    if (promedio >= 17) return { icon: FiCheck, color: 'text-green-600', label: 'Excelente' }
    if (promedio >= 15) return { icon: FiTrendingUp, color: 'text-blue-600', label: 'Bueno' }
    if (promedio >= 13) return { icon: FiMinus, color: 'text-yellow-600', label: 'Regular' }
    return { icon: FiX, color: 'text-red-600', label: 'Necesita refuerzo' }
  }

  const getSubjectIcon = (materia) => {
    const icons = {
      'Matemáticas': '📊',
      'Comunicación': '📚',
      'Ciencia y Tecnología': '🔬',
      'Ciencias Sociales': '🌍',
      'Arte y Cultura': '🎨',
      'Educación Física': '⚽',
      'Inglés': '🌎',
      'Educación Religiosa': '📿'
    }
    return icons[materia] || '📖'
  }

  const status = getGradeStatus(calificacion.promedio)
  const StatusIcon = status.icon

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
          <div className="text-2xl">{getSubjectIcon(calificacion.materia)}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{calificacion.materia}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <FiUser className="w-4 h-4" />
              <span>{calificacion.profesor}</span>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold ${getGradeColor(calificacion.promedio)}`}>
          {calificacion.promedio.toFixed(1)}
        </div>
      </div>

      {/* Student info */}
      <div className="flex items-center space-x-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <FiUser className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">{calificacion.estudiante}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FiBook className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">{calificacion.grado} - Sección {calificacion.seccion}</span>
        </div>
      </div>

      {/* Period and status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FiCalendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">{calificacion.bimestre}</span>
        </div>
        
        <div className={`flex items-center space-x-1 ${status.color}`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{status.label}</span>
        </div>
      </div>

      {/* Evaluations summary */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Evaluaciones ({calificacion.evaluaciones.length})</h4>
        <div className="grid grid-cols-2 gap-2">
          {calificacion.evaluaciones.slice(0, 4).map((evaluacion, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
              <span className="truncate">{evaluacion.tipo}</span>
              <span className={`font-medium ${getGradeColor(evaluacion.nota).split(' ')[0]}`}>
                {evaluacion.nota}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Observations */}
      {calificacion.observaciones && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 italic">"{calificacion.observaciones}"</p>
        </div>
      )}

      {/* Last update */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Actualizado: {format(new Date(calificacion.fechaActualizacion), 'dd MMM yyyy', { locale: es })}
        </span>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewDetails(calificacion)}
          className="flex items-center space-x-1 px-3 py-1 bg-talentos-primary text-white text-xs font-medium rounded-lg hover:bg-talentos-secondary transition-colors duration-200"
        >
          <FiEye className="w-3 h-3" />
          <span>Ver detalles</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default GradeCard