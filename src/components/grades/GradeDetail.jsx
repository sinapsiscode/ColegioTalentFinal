import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, 
  FiUser, 
  FiBook, 
  FiCalendar, 
  FiFileText,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiCheck,
  FiAlertCircle,
  FiDownload,
  FiPrinter
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const GradeDetail = ({ calificacion, isOpen, onClose, onDownload, onPrint }) => {
  if (!calificacion) return null

  const getGradeColor = (nota) => {
    if (nota >= 17) return 'text-green-600 bg-green-100'
    if (nota >= 15) return 'text-blue-600 bg-blue-100'
    if (nota >= 13) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getEvaluationIcon = (tipo) => {
    const icons = {
      'Examen': '📝',
      'Práctica': '📋',
      'Tarea': '📚',
      'Participación': '🗣️',
      'Proyecto': '📊'
    }
    return icons[tipo] || '📖'
  }

  const getGradeStatus = (promedio) => {
    if (promedio >= 17) return { icon: FiCheck, color: 'text-green-600', label: 'Excelente', desc: 'Logros destacados' }
    if (promedio >= 15) return { icon: FiTrendingUp, color: 'text-blue-600', label: 'Bueno', desc: 'Logros esperados' }
    if (promedio >= 13) return { icon: FiMinus, color: 'text-yellow-600', label: 'Regular', desc: 'En proceso' }
    return { icon: FiAlertCircle, color: 'text-red-600', label: 'Necesita refuerzo', desc: 'En inicio' }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const status = getGradeStatus(calificacion.promedio)
  const StatusIcon = status.icon

  // Calcular estadísticas de evaluaciones
  const evaluacionesStats = {
    total: calificacion.evaluaciones.length,
    aprobadas: calificacion.evaluaciones.filter(evaluacion => evaluacion.nota >= 13).length,
    promedio: calificacion.promedio,
    notaMasAlta: Math.max(...calificacion.evaluaciones.map(evaluacion => evaluacion.nota)),
    notaMasBaja: Math.min(...calificacion.evaluaciones.map(evaluacion => evaluacion.nota))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary text-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">{getEvaluationIcon(calificacion.materia)}</div>
                    <div>
                      <h2 className="text-2xl font-bold">{calificacion.materia}</h2>
                      <p className="text-white/90">{calificacion.profesor}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4" />
                      <span>{calificacion.estudiante}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FiBook className="w-4 h-4" />
                      <span>{calificacion.grado} - Sección {calificacion.seccion}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>{calificacion.bimestre}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{calificacion.promedio.toFixed(1)}</div>
                    <div className={`flex items-center space-x-1 ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm">{status.label}</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                  >
                    <FiX className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{evaluacionesStats.total}</div>
                  <div className="text-sm text-blue-800">Total Evaluaciones</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{evaluacionesStats.aprobadas}</div>
                  <div className="text-sm text-green-800">Aprobadas</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{evaluacionesStats.notaMasAlta}</div>
                  <div className="text-sm text-purple-800">Nota Más Alta</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{evaluacionesStats.notaMasBaja}</div>
                  <div className="text-sm text-orange-800">Nota Más Baja</div>
                </div>
              </div>

              {/* Evaluations detail */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Evaluaciones</h3>
                <div className="space-y-3">
                  {calificacion.evaluaciones.map((evaluacion, index) => (
                    <motion.div
                      key={evaluacion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{getEvaluationIcon(evaluacion.tipo)}</div>
                        <div>
                          <h4 className="font-medium text-gray-900">{evaluacion.descripcion}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                            <span className="font-medium">{evaluacion.tipo}</span>
                            <span>•</span>
                            <span>Peso: {(evaluacion.peso * 100).toFixed(0)}%</span>
                            <span>•</span>
                            <span>{format(new Date(evaluacion.fecha), 'dd MMM yyyy', { locale: es })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold ${getGradeColor(evaluacion.nota)}`}>
                          {evaluacion.nota}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {evaluacion.nota >= 13 ? 'Aprobado' : 'Desaprobado'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Observations */}
              {calificacion.observaciones && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Observaciones del Profesor</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <FiFileText className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <p className="text-gray-700 italic">"{calificacion.observaciones}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance analysis */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Análisis de Rendimiento</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Estado Académico</h4>
                      <div className={`flex items-center space-x-2 ${status.color}`}>
                        <StatusIcon className="w-5 h-5" />
                        <span className="font-medium">{status.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{status.desc}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recomendaciones</h4>
                      <div className="text-sm text-gray-600">
                        {calificacion.promedio >= 17 ? (
                          <p>Mantener el excelente nivel de trabajo y seguir participando activamente.</p>
                        ) : calificacion.promedio >= 15 ? (
                          <p>Buen rendimiento. Continuar con el esfuerzo para alcanzar la excelencia.</p>
                        ) : calificacion.promedio >= 13 ? (
                          <p>Revisar métodos de estudio y solicitar apoyo adicional del profesor.</p>
                        ) : (
                          <p>Urgente: Requiere refuerzo académico y apoyo personalizado.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Última actualización: {format(new Date(calificacion.fechaActualizacion), 'dd MMM yyyy - HH:mm', { locale: es })}
                </div>
                
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDownload(calificacion)}
                    className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
                    title="Descargar reporte"
                  >
                    <FiDownload className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onPrint(calificacion)}
                    className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
                    title="Imprimir"
                  >
                    <FiPrinter className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GradeDetail