import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX,
  FiSave,
  FiEdit3,
  FiCheck,
  FiAlertCircle,
  FiCalendar,
  FiFileText,
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiRefreshCw
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import AnimatedButton from '../common/AnimatedButton'
import LoadingSpinner from '../common/LoadingSpinner'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'
import useGradesStore from '../../stores/gradesStore'
import useAuthStore from '../../stores/authStore'

const GradeManagementModal = ({ isOpen, onClose, estudiante, onGradeUpdate }) => {
  const { usuario } = useAuthStore()
  const { calificaciones, crearCalificacion, actualizarCalificacion, cargarCalificaciones } = useGradesStore()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [grades, setGrades] = useState({})
  const [editingGrade, setEditingGrade] = useState(null)
  const [newGrade, setNewGrade] = useState({
    materia: '',
    evaluacion: '',
    nota: '',
    observaciones: ''
  })

  // Materias disponibles
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

  // Tipos de evaluación
  const tiposEvaluacion = [
    { value: 'parcial', label: 'Evaluación Parcial' },
    { value: 'final', label: 'Evaluación Final' },
    { value: 'practica', label: 'Práctica Calificada' },
    { value: 'trabajo', label: 'Trabajo' },
    { value: 'examen_mensual', label: 'Examen Mensual' },
    { value: 'promedio', label: 'Promedio' }
  ]

  useEffect(() => {
    if (isOpen && estudiante) {
      loadStudentGrades()
    }
  }, [isOpen, estudiante])

  const loadStudentGrades = async () => {
    setLoading(true)
    try {
      await cargarCalificaciones()
      
      // Filtrar calificaciones del estudiante
      const studentGrades = calificaciones.filter(cal => 
        cal.estudianteId === estudiante.id
      )
      
      // Organizar por materia y evaluación
      const gradesBySubject = {}
      studentGrades.forEach(cal => {
        if (!gradesBySubject[cal.materia]) {
          gradesBySubject[cal.materia] = {}
        }
        gradesBySubject[cal.materia][cal.evaluacion] = cal
      })
      
      setGrades(gradesBySubject)
    } catch (error) {
      console.error('Error cargando calificaciones:', error)
      showError('Error', 'No se pudieron cargar las calificaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleGradeChange = (materia, evaluacion, value) => {
    const nota = parseFloat(value)
    if (isNaN(nota) || nota < 0 || nota > 20) return

    setGrades(prev => ({
      ...prev,
      [materia]: {
        ...prev[materia],
        [evaluacion]: {
          ...prev[materia]?.[evaluacion],
          nota,
          modificado: true
        }
      }
    }))
  }

  const handleSaveGrade = async (materia, evaluacion) => {
    const grade = grades[materia]?.[evaluacion]
    if (!grade || !grade.modificado) return

    setSaving(true)
    try {
      const gradeData = {
        estudianteId: estudiante.id,
        materia,
        evaluacion,
        nota: grade.nota,
        fecha: new Date().toISOString(),
        tutorId: usuario.id,
        periodo: '2024-1',
        observaciones: grade.observaciones || ''
      }

      if (grade.id) {
        await actualizarCalificacion(grade.id, gradeData)
      } else {
        await crearCalificacion(gradeData)
      }

      showSuccess('Éxito', 'Calificación guardada correctamente')
      await loadStudentGrades()
      
      if (onGradeUpdate) {
        onGradeUpdate()
      }
    } catch (error) {
      console.error('Error guardando calificación:', error)
      showError('Error', 'No se pudo guardar la calificación')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNewGrade = async () => {
    if (!newGrade.materia || !newGrade.evaluacion || !newGrade.nota) {
      showError('Error', 'Complete todos los campos requeridos')
      return
    }

    const nota = parseFloat(newGrade.nota)
    if (isNaN(nota) || nota < 0 || nota > 20) {
      showError('Error', 'La nota debe estar entre 0 y 20')
      return
    }

    setSaving(true)
    try {
      await crearCalificacion({
        estudianteId: estudiante.id,
        materia: newGrade.materia,
        evaluacion: newGrade.evaluacion,
        nota,
        fecha: new Date().toISOString(),
        tutorId: usuario.id,
        periodo: '2024-1',
        observaciones: newGrade.observaciones
      })

      showSuccess('Éxito', 'Calificación creada correctamente')
      setNewGrade({ materia: '', evaluacion: '', nota: '', observaciones: '' })
      await loadStudentGrades()
      
      if (onGradeUpdate) {
        onGradeUpdate()
      }
    } catch (error) {
      console.error('Error creando calificación:', error)
      showError('Error', 'No se pudo crear la calificación')
    } finally {
      setSaving(false)
    }
  }

  const calculateAverageBySubject = (materia) => {
    const subjectGrades = grades[materia]
    if (!subjectGrades) return 0

    const validGrades = Object.values(subjectGrades)
      .filter(g => g.nota !== undefined && g.nota !== null)
      .map(g => g.nota)

    if (validGrades.length === 0) return 0
    
    const sum = validGrades.reduce((acc, nota) => acc + nota, 0)
    return (sum / validGrades.length).toFixed(1)
  }

  const calculateGeneralAverage = () => {
    const allGrades = []
    Object.values(grades).forEach(subjectGrades => {
      Object.values(subjectGrades).forEach(grade => {
        if (grade.nota !== undefined && grade.nota !== null) {
          allGrades.push(grade.nota)
        }
      })
    })

    if (allGrades.length === 0) return 0
    
    const sum = allGrades.reduce((acc, nota) => acc + nota, 0)
    return (sum / allGrades.length).toFixed(1)
  }

  const getGradeColor = (nota) => {
    if (nota >= 18) return 'text-green-600 bg-green-100'
    if (nota >= 16) return 'text-blue-600 bg-blue-100'
    if (nota >= 14) return 'text-yellow-600 bg-yellow-100'
    if (nota >= 11) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  if (!estudiante) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Gestión de Calificaciones</h2>
                    <p className="text-blue-100 mt-1">
                      {estudiante.nombre} {estudiante.apellidos} - {estudiante.grado}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Resumen de promedios */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-sm text-blue-100">Promedio General</p>
                    <p className={`text-2xl font-bold mt-1 ${calculateGeneralAverage() >= 14 ? 'text-white' : 'text-yellow-200'}`}>
                      {calculateGeneralAverage()}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-sm text-blue-100">Materias Evaluadas</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {Object.keys(grades).length}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-sm text-blue-100">Estado</p>
                    <p className={`text-lg font-medium mt-1 ${calculateGeneralAverage() >= 14 ? 'text-green-200' : 'text-yellow-200'}`}>
                      {calculateGeneralAverage() >= 14 ? 'Aprobado' : 'Necesita apoyo'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <>
                    {/* Nueva calificación */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Agregar Nueva Calificación
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select
                          value={newGrade.materia}
                          onChange={(e) => setNewGrade(prev => ({ ...prev, materia: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                        >
                          <option value="">Seleccionar materia</option>
                          {materias.map(materia => (
                            <option key={materia} value={materia}>{materia}</option>
                          ))}
                        </select>

                        <select
                          value={newGrade.evaluacion}
                          onChange={(e) => setNewGrade(prev => ({ ...prev, evaluacion: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                        >
                          <option value="">Tipo de evaluación</option>
                          {tiposEvaluacion.map(tipo => (
                            <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          placeholder="Nota (0-20)"
                          value={newGrade.nota}
                          onChange={(e) => setNewGrade(prev => ({ ...prev, nota: e.target.value }))}
                          min="0"
                          max="20"
                          step="0.5"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                        />

                        <AnimatedButton
                          variant="primary"
                          icon={FiSave}
                          onClick={handleCreateNewGrade}
                          disabled={saving || !newGrade.materia || !newGrade.evaluacion || !newGrade.nota}
                          loading={saving}
                        >
                          Guardar
                        </AnimatedButton>
                      </div>
                      <textarea
                        placeholder="Observaciones (opcional)"
                        value={newGrade.observaciones}
                        onChange={(e) => setNewGrade(prev => ({ ...prev, observaciones: e.target.value }))}
                        className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                        rows={2}
                      />
                    </div>

                    {/* Tabla de calificaciones por materia */}
                    <div className="space-y-6">
                      {materias.map(materia => {
                        const hasGrades = grades[materia] && Object.keys(grades[materia]).length > 0
                        if (!hasGrades) return null

                        return (
                          <div key={materia} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-semibold text-gray-900">{materia}</h4>
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(parseFloat(calculateAverageBySubject(materia)))}`}>
                                Promedio: {calculateAverageBySubject(materia)}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {tiposEvaluacion.map(tipo => {
                                const grade = grades[materia]?.[tipo.value]
                                const isEditing = editingGrade === `${materia}-${tipo.value}`

                                return (
                                  <div
                                    key={tipo.value}
                                    className="bg-white rounded-lg border border-gray-200 p-3"
                                  >
                                    <p className="text-sm text-gray-600 mb-2">{tipo.label}</p>
                                    <div className="flex items-center space-x-2">
                                      {isEditing ? (
                                        <>
                                          <input
                                            type="number"
                                            value={grade?.nota || ''}
                                            onChange={(e) => handleGradeChange(materia, tipo.value, e.target.value)}
                                            min="0"
                                            max="20"
                                            step="0.5"
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                                          />
                                          <button
                                            onClick={() => {
                                              handleSaveGrade(materia, tipo.value)
                                              setEditingGrade(null)
                                            }}
                                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                                            disabled={saving}
                                          >
                                            <FiCheck className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => setEditingGrade(null)}
                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                          >
                                            <FiX className="w-4 h-4" />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <span className={`text-xl font-bold ${grade ? getGradeColor(grade.nota).split(' ')[0] : 'text-gray-400'}`}>
                                            {grade?.nota ?? '-'}
                                          </span>
                                          <button
                                            onClick={() => setEditingGrade(`${materia}-${tipo.value}`)}
                                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                          >
                                            <FiEdit3 className="w-4 h-4" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                    {grade?.fecha && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {format(new Date(grade.fecha), 'dd/MM/yyyy')}
                                      </p>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Mensaje si no hay calificaciones */}
                    {Object.keys(grades).length === 0 && (
                      <div className="text-center py-12">
                        <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No hay calificaciones registradas</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Use el formulario superior para agregar la primera calificación
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiAlertCircle className="w-4 h-4" />
                    <span>Los cambios se guardan automáticamente</span>
                  </div>
                  <AnimatedButton
                    variant="secondary"
                    onClick={onClose}
                  >
                    Cerrar
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default GradeManagementModal