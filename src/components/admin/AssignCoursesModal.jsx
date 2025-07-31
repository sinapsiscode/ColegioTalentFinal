import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX,
  FiSave,
  FiBook,
  FiSearch,
  FiFilter,
  FiUser,
  FiBookOpen,
  FiClock,
  FiCheck,
  FiPlus,
  FiMinus
} from 'react-icons/fi'
import AnimatedButton from '../common/AnimatedButton'
import SearchInput from '../common/SearchInput'
import FilterDropdown from '../common/FilterDropdown'
import { showSuccess, showError } from '../../utils/sweetAlert'
import getDatabase from '../../data/DatabaseManager'

const AssignCoursesModal = ({ isOpen, onClose, teacher = null, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [selectedCourses, setSelectedCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')

  useEffect(() => {
    if (isOpen && teacher) {
      loadCourses()
    }
  }, [isOpen, teacher])

  useEffect(() => {
    applyFilters()
  }, [courses, searchTerm, gradeFilter, subjectFilter])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const db = getDatabase()
      const allCourses = db.select('courses') || []
      
      // Obtener cursos ya asignados al profesor
      const assignedCourseIds = allCourses
        .filter(course => course.profesorId === teacher.id)
        .map(course => course.id)

      setCourses(allCourses)
      setSelectedCourses(assignedCourseIds)
    } catch (error) {
      console.error('Error cargando cursos:', error)
      showError('Error', 'No se pudieron cargar los cursos')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...courses]

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(course => course.grado === gradeFilter)
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(course => course.materia === subjectFilter)
    }

    setFilteredCourses(filtered)
  }

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId)
      } else {
        return [...prev, courseId]
      }
    })
  }

  const handleSelectAll = () => {
    const allIds = filteredCourses.map(course => course.id)
    setSelectedCourses(prev => {
      const hasAll = allIds.every(id => prev.includes(id))
      if (hasAll) {
        // Remover todos los cursos filtrados
        return prev.filter(id => !allIds.includes(id))
      } else {
        // Agregar todos los cursos filtrados
        return [...new Set([...prev, ...allIds])]
      }
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const db = getDatabase()
      
      // Obtener todos los cursos para actualizar
      const allCourses = db.select('courses') || []
      
      // Actualizar asignaciones
      allCourses.forEach(course => {
        const shouldBeAssigned = selectedCourses.includes(course.id)
        const isCurrentlyAssigned = course.profesorId === teacher.id
        
        if (shouldBeAssigned && !isCurrentlyAssigned) {
          // Asignar curso al profesor
          db.update('courses', record => record.id === course.id, {
            profesorId: teacher.id
          })
        } else if (!shouldBeAssigned && isCurrentlyAssigned) {
          // Desasignar curso del profesor
          db.update('courses', record => record.id === course.id, {
            profesorId: null
          })
        }
      })

      showSuccess(
        'Asignaciones actualizadas',
        `Se han actualizado las asignaciones de cursos para ${teacher.nombre} ${teacher.apellidos}`
      )
      
      onSave && onSave()
      onClose()
    } catch (error) {
      console.error('Error guardando asignaciones:', error)
      showError('Error', 'No se pudieron guardar las asignaciones')
    } finally {
      setLoading(false)
    }
  }

  // Obtener opciones únicas para filtros
  const getGradeOptions = () => {
    const grades = [...new Set(courses.map(course => course.grado))].filter(Boolean)
    return [
      { value: 'all', label: 'Todos los grados' },
      ...grades.map(grade => ({ value: grade, label: grade }))
    ]
  }

  const getSubjectOptions = () => {
    const subjects = [...new Set(courses.map(course => course.materia))].filter(Boolean)
    return [
      { value: 'all', label: 'Todas las materias' },
      ...subjects.map(subject => ({ value: subject, label: subject }))
    ]
  }

  const getStats = () => {
    const totalCourses = courses.length
    const assignedCourses = selectedCourses.length
    const availableCourses = totalCourses - assignedCourses
    const filteredAssigned = filteredCourses.filter(course => 
      selectedCourses.includes(course.id)
    ).length

    return { totalCourses, assignedCourses, availableCourses, filteredAssigned }
  }

  const stats = getStats()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUser className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                Asignar Cursos
              </h2>
              <p className="text-blue-100">
                {teacher?.nombre} {teacher?.apellidos}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white transition-colors duration-200"
          >
            <FiX className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
            <div className="text-sm text-gray-600">Total Cursos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.assignedCourses}</div>
            <div className="text-sm text-gray-600">Asignados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.availableCourses}</div>
            <div className="text-sm text-gray-600">Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.filteredAssigned}</div>
            <div className="text-sm text-gray-600">Seleccionados</div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar cursos..."
            />
            
            <FilterDropdown
              label="Filtrar por grado"
              options={getGradeOptions()}
              selectedValue={gradeFilter}
              onSelect={setGradeFilter}
            />

            <FilterDropdown
              label="Filtrar por materia"
              options={getSubjectOptions()}
              selectedValue={subjectFilter}
              onSelect={setSubjectFilter}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredCourses.length} de {courses.length} cursos mostrados
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {filteredCourses.every(course => selectedCourses.includes(course.id))
                  ? 'Deseleccionar todos'
                  : 'Seleccionar todos'
                }
              </button>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="p-6 space-y-3">
              {filteredCourses.map((course, index) => {
                const isSelected = selectedCourses.includes(course.id)
                const isCurrentlyAssigned = course.profesorId === teacher?.id
                const isAssignedToOther = course.profesorId && course.profesorId !== teacher?.id

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`
                      p-4 border rounded-lg transition-all duration-200 cursor-pointer
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : isAssignedToOther
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => !isAssignedToOther && handleCourseToggle(course.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : isAssignedToOther
                            ? 'border-red-300 bg-red-100'
                            : 'border-gray-300'
                          }
                        `}>
                          {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                          {isAssignedToOther && <FiX className="w-3 h-3 text-red-500" />}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <FiBookOpen className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {course.nombre}
                            </div>
                            <div className="text-sm text-gray-600">
                              {course.materia} • {course.grado} • {course.codigo}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FiClock className="w-3 h-3" />
                          <span>{course.horasSemanales}h/sem</span>
                        </div>
                        
                        {isAssignedToOther && (
                          <span className="text-red-600 text-xs font-medium">
                            Asignado a otro profesor
                          </span>
                        )}
                        
                        {isCurrentlyAssigned && (
                          <span className="text-blue-600 text-xs font-medium">
                            Ya asignado
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <FiBook className="w-12 h-12 mb-2" />
              <p>No se encontraron cursos</p>
              {(searchTerm || gradeFilter !== 'all' || subjectFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setGradeFilter('all')
                    setSubjectFilter('all')
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedCourses.length} curso(s) seleccionado(s)
          </div>
          
          <div className="flex items-center space-x-3">
            <AnimatedButton
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              icon={FiSave}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Asignaciones'}
            </AnimatedButton>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AssignCoursesModal