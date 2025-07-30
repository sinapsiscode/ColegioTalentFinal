import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiBookOpen,
  FiSave,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi'

import AnimatedButton from '../common/AnimatedButton'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'
import useGradesStore from '../../stores/gradesStore'
import useAuthStore from '../../stores/authStore'

const QuickGradeInput = ({ estudiantes, onComplete }) => {
  const { usuario } = useAuthStore()
  const { crearCalificacion } = useGradesStore()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedEvaluation, setSelectedEvaluation] = useState('')
  const [grades, setGrades] = useState({})
  const [saving, setSaving] = useState(false)
  
  const materias = [
    'Matemáticas',
    'Comunicación',
    'Ciencias',
    'Personal Social',
    'Inglés',
    'Arte',
    'Educación Física',
    'Computación',
    'Religión'
  ]
  
  const tiposEvaluacion = [
    { value: 'parcial', label: 'Evaluación Parcial' },
    { value: 'final', label: 'Evaluación Final' },
    { value: 'practica', label: 'Práctica Calificada' },
    { value: 'trabajo', label: 'Trabajo' },
    { value: 'examen_mensual', label: 'Examen Mensual' }
  ]
  
  const handleGradeChange = (studentId, value) => {
    const nota = parseFloat(value)
    if (value === '' || (nota >= 0 && nota <= 20)) {
      setGrades(prev => ({
        ...prev,
        [studentId]: value
      }))
    }
  }
  
  const handleSaveGrades = async () => {
    if (!selectedSubject || !selectedEvaluation) {
      showError('Error', 'Seleccione materia y tipo de evaluación')
      return
    }
    
    const gradesToSave = Object.entries(grades).filter(([_, value]) => value !== '')
    
    if (gradesToSave.length === 0) {
      showError('Error', 'Ingrese al menos una calificación')
      return
    }
    
    const result = await showConfirm(
      'Confirmar Calificaciones',
      `¿Guardar ${gradesToSave.length} calificaciones para ${selectedSubject}?`,
      'Guardar',
      'Cancelar'
    )
    
    if (!result.isConfirmed) return
    
    setSaving(true)
    try {
      const promises = gradesToSave.map(([studentId, grade]) => 
        crearCalificacion({
          estudianteId: parseInt(studentId),
          materia: selectedSubject,
          evaluacion: selectedEvaluation,
          nota: parseFloat(grade),
          fecha: new Date().toISOString(),
          tutorId: usuario.id,
          periodo: '2024-1'
        })
      )
      
      await Promise.all(promises)
      
      showSuccess(
        'Calificaciones Guardadas',
        `Se guardaron ${gradesToSave.length} calificaciones exitosamente`
      )
      
      // Limpiar formulario
      setGrades({})
      setSelectedSubject('')
      setSelectedEvaluation('')
      setIsExpanded(false)
      
      // Llamar onComplete si existe
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Error guardando calificaciones:', error)
      showError('Error', 'No se pudieron guardar las calificaciones')
    } finally {
      setSaving(false)
    }
  }
  
  const getGradeStats = () => {
    const validGrades = Object.values(grades)
      .filter(g => g !== '')
      .map(g => parseFloat(g))
    
    if (validGrades.length === 0) return null
    
    const average = (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1)
    const highest = Math.max(...validGrades)
    const lowest = Math.min(...validGrades)
    const approved = validGrades.filter(g => g >= 14).length
    
    return { average, highest, lowest, approved, total: validGrades.length }
  }
  
  const stats = getGradeStats()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FiBookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
          <span className="truncate">Ingreso Rápido de Calificaciones</span>
        </h3>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-purple-600 hover:text-purple-700 transition-colors duration-200 flex-shrink-0"
        >
          {isExpanded ? 'Ocultar' : 'Expandir'}
        </button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Selección de materia y evaluación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materia
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleccionar materia</option>
                  {materias.map(materia => (
                    <option key={materia} value={materia}>{materia}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evaluación
                </label>
                <select
                  value={selectedEvaluation}
                  onChange={(e) => setSelectedEvaluation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposEvaluacion.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Tabla de calificaciones */}
            {selectedSubject && selectedEvaluation && (
              <>
                <div className="overflow-x-auto mb-4 -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estudiante
                          </th>
                          <th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nota
                          </th>
                          <th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Estado
                          </th>
                        </tr>
                      </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estudiantes.map(estudiante => {
                        const grade = grades[estudiante.id] || ''
                        const gradeValue = parseFloat(grade)
                        const isApproved = gradeValue >= 14
                        
                        return (
                          <tr key={estudiante.id} className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2 sm:mr-3 flex-shrink-0">
                                  {estudiante.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                    {estudiante.nombre} {estudiante.apellidos}
                                  </p>
                                  <p className="text-xs text-gray-500 sm:hidden">
                                    {grade !== '' && (
                                      <span className={`inline-flex items-center ${
                                        isApproved ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {isApproved ? (
                                          <FiCheckCircle className="w-3 h-3 mr-1" />
                                        ) : (
                                          <FiAlertCircle className="w-3 h-3 mr-1" />
                                        )}
                                        {isApproved ? 'Aprobado' : 'Desaprobado'}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-3">
                              <div className="flex justify-center">
                                <input
                                  type="number"
                                  value={grade}
                                  onChange={(e) => handleGradeChange(estudiante.id, e.target.value)}
                                  min="0"
                                  max="20"
                                  step="0.5"
                                  placeholder="0-20"
                                  className="w-16 sm:w-20 px-1 sm:px-2 py-1 text-center text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-center hidden sm:table-cell">
                              {grade !== '' && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  isApproved 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {isApproved ? (
                                    <>
                                      <FiCheckCircle className="w-3 h-3 mr-1" />
                                      Aprobado
                                    </>
                                  ) : (
                                    <>
                                      <FiAlertCircle className="w-3 h-3 mr-1" />
                                      Desaprobado
                                    </>
                                  )}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Estadísticas */}
                {stats && (
                  <div className="bg-purple-50 rounded-lg p-3 sm:p-4 mb-4">
                    <h4 className="text-sm font-medium text-purple-900 mb-3">
                      Resumen de Calificaciones
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
                      <div>
                        <p className="text-xs text-purple-600">Ingresadas</p>
                        <p className="text-base sm:text-lg font-bold text-purple-900">{stats.total}</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600">Promedio</p>
                        <p className="text-base sm:text-lg font-bold text-purple-900">{stats.average}</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600">Más alta</p>
                        <p className="text-base sm:text-lg font-bold text-green-600">{stats.highest}</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600">Más baja</p>
                        <p className="text-base sm:text-lg font-bold text-red-600">{stats.lowest}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-xs text-purple-600">Aprobados</p>
                        <p className="text-base sm:text-lg font-bold text-green-600">
                          {stats.approved}/{stats.total}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
                  <AnimatedButton
                    variant="outline"
                    icon={FiX}
                    onClick={() => {
                      setGrades({})
                      setSelectedSubject('')
                      setSelectedEvaluation('')
                      setIsExpanded(false)
                    }}
                    disabled={saving}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </AnimatedButton>
                  
                  <AnimatedButton
                    variant="primary"
                    icon={FiSave}
                    onClick={handleSaveGrades}
                    loading={saving}
                    disabled={saving || Object.keys(grades).length === 0}
                    className="w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Guardar Calificaciones</span>
                    <span className="sm:hidden">Guardar</span>
                  </AnimatedButton>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Indicador cuando está colapsado */}
      {!isExpanded && (
        <div className="text-xs sm:text-sm text-gray-600">
          Haz clic en "Expandir" para ingresar calificaciones rápidamente
        </div>
      )}
    </motion.div>
  )
}

export default QuickGradeInput