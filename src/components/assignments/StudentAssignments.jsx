import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUsers,
  FiBookOpen,
  FiMapPin,
  FiSearch,
  FiFilter,
  FiUser,
  FiHome,
  FiCheck,
  FiX,
  FiEye,
  FiEdit3,
  FiUserCheck,
  FiUserX,
  FiPlus
} from 'react-icons/fi'
import LoadingSpinner from '../common/LoadingSpinner'
import AnimatedButton from '../common/AnimatedButton'
import SearchInput from '../common/SearchInput'
import FilterDropdown from '../common/FilterDropdown'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'
import getDatabase from '../../data/DatabaseManager'

const StudentAssignments = () => {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [sections, setSections] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [viewMode, setViewMode] = useState('list') // list, detail
  
  useEffect(() => {
    loadStudentAssignments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [students, searchTerm, statusFilter])

  const loadStudentAssignments = async () => {
    setLoading(true)
    try {
      const db = getDatabase()
      const studentsData = db.select('students') || []
      const sectionsData = db.select('sections') || []
      const users = db.select('users') || []

      // Enriquecer estudiantes con información de sección
      const enrichedStudents = studentsData.map(student => {
        const assignedSection = sectionsData.find(section => section.id === student.seccionId)
        
        // Obtener tutor de la sección si existe
        let sectionTutor = null
        if (assignedSection && assignedSection.tutorId) {
          sectionTutor = users.find(user => user.id === assignedSection.tutorId)
        }

        return {
          ...student,
          assignedSection,
          sectionTutor,
          hasSection: !!assignedSection,
          sectionName: assignedSection ? assignedSection.nombre : null,
          sectionGrade: assignedSection ? assignedSection.grado : null,
          sectionClassroom: assignedSection ? assignedSection.aula : null
        }
      })

      setStudents(enrichedStudents)
      setSections(sectionsData)
    } catch (error) {
      console.error('Error cargando asignaciones de estudiantes:', error)
      showError('Error', 'No se pudieron cargar las asignaciones de estudiantes')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...students]

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.sectionName && student.sectionName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => {
        switch (statusFilter) {
          case 'assigned':
            return student.hasSection
          case 'unassigned':
            return !student.hasSection
          case 'grade_1':
            return student.sectionGrade && student.sectionGrade.includes('1ro')
          case 'grade_2':
            return student.sectionGrade && student.sectionGrade.includes('2do')
          case 'grade_3':
            return student.sectionGrade && student.sectionGrade.includes('3ro')
          case 'grade_4':
            return student.sectionGrade && student.sectionGrade.includes('4to')
          case 'grade_5':
            return student.sectionGrade && student.sectionGrade.includes('5to')
          case 'grade_6':
            return student.sectionGrade && student.sectionGrade.includes('6to')
          default:
            return true
        }
      })
    }

    setFilteredStudents(filtered)
  }

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedStudent(null)
  }

  const handleAssignSection = async (student, sectionId) => {
    try {
      const db = getDatabase()
      
      // Actualizar estudiante con nueva sección
      db.update('students', record => record.id === student.id, {
        ...student,
        seccionId: sectionId
      })
      
      await loadStudentAssignments()
      showSuccess('Estudiante asignado', 'El estudiante ha sido asignado a la sección correctamente')
    } catch (error) {
      showError('Error', 'No se pudo asignar el estudiante a la sección')
    }
  }

  const handleRemoveFromSection = async (student) => {
    const confirmed = await showConfirm(
      'Remover de Sección',
      `¿Estás seguro de que quieres remover a ${student.nombre} ${student.apellidos} de la sección ${student.sectionName}?`,
      'warning'
    )

    if (confirmed.isConfirmed) {
      try {
        const db = getDatabase()
        
        // Remover sección del estudiante
        db.update('students', record => record.id === student.id, {
          ...student,
          seccionId: null
        })
        
        await loadStudentAssignments()
        showSuccess('Estudiante removido', 'El estudiante ha sido removido de la sección correctamente')
      } catch (error) {
        showError('Error', 'No se pudo remover el estudiante de la sección')
      }
    }
  }

  const getStatusOptions = () => [
    { value: 'all', label: 'Todos los estudiantes' },
    { value: 'assigned', label: 'Asignados a sección' },
    { value: 'unassigned', label: 'Sin sección asignada' },
    { value: 'grade_1', label: '1ro Primaria' },
    { value: 'grade_2', label: '2do Primaria' },
    { value: 'grade_3', label: '3ro Primaria' },
    { value: 'grade_4', label: '4to Primaria' },
    { value: 'grade_5', label: '5to Primaria' },
    { value: 'grade_6', label: '6to Primaria' }
  ]

  const getStats = () => {
    const totalStudents = students.length
    const assigned = students.filter(s => s.hasSection).length
    const unassigned = totalStudents - assigned
    const totalSections = sections.length
    const sectionsWithStudents = sections.filter(section => 
      students.some(student => student.seccionId === section.id)
    ).length

    return { totalStudents, assigned, unassigned, totalSections, sectionsWithStudents }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiUsers className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-green-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiUserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Asignados</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.assigned}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-red-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FiUserX className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sin Sección</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.unassigned}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiBookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Secciones</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalSections}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-orange-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FiHome className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Secciones Activas</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.sectionsWithStudents}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClear={() => setSearchTerm('')}
                  placeholder="Buscar estudiantes..."
                />
                
                <FilterDropdown
                  label="Filtrar por estado/grado"
                  options={getStatusOptions()}
                  selectedValue={statusFilter}
                  onSelect={setStatusFilter}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {filteredStudents.length} de {students.length} estudiantes
                </span>
              </div>
            </div>

            {/* Students List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estudiante
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sección Asignada
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aula
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tutor
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredStudents.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.nombre} {student.apellidos}
                            </div>
                            <div className="text-sm text-gray-500">
                              Código: {student.codigo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {student.hasSection ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{student.sectionName}</div>
                            <div className="text-gray-500">{student.sectionGrade}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Sin sección</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {student.sectionClassroom ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <FiMapPin className="w-3 h-3 mr-1 text-gray-400" />
                            <span>Aula {student.sectionClassroom}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {student.sectionTutor ? (
                          <div className="text-sm text-gray-900">
                            {student.sectionTutor.nombre} {student.sectionTutor.apellidos}
                          </div>
                        ) : (
                          <span className="text-gray-500">Sin tutor</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {student.hasSection ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Asignado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Sin sección
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Ver detalles"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-600 hover:text-green-600 transition-colors"
                            title="Asignar sección"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          {student.hasSection && (
                            <button
                              onClick={() => handleRemoveFromSection(student)}
                              className="p-1.5 text-gray-600 hover:text-red-600 transition-colors"
                              title="Remover de sección"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron estudiantes
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay estudiantes registrados en el sistema'}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          // Vista de detalle del estudiante
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {selectedStudent && (
              <>
                <button
                  onClick={handleBackToList}
                  className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiUsers className="w-5 h-5 mr-1" />
                  <span>Volver a la lista</span>
                </button>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 mb-6">
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-6">
                      <h2 className="text-2xl font-bold text-white">
                        {selectedStudent.nombre} {selectedStudent.apellidos}
                      </h2>
                      <p className="text-purple-100">
                        Código: {selectedStudent.codigo}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Información del estudiante */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Información del Estudiante
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Nombre Completo:</span>
                        <p className="text-gray-900">{selectedStudent.nombre} {selectedStudent.apellidos}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Código:</span>
                        <p className="text-gray-900">{selectedStudent.codigo}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Estado:</span>
                        <p className="text-gray-900">{selectedStudent.estado || 'Activo'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Información de sección */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Asignación de Sección
                    </h3>
                    {selectedStudent.hasSection ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Sección:</span>
                          <p className="text-gray-900">{selectedStudent.sectionName}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Grado:</span>
                          <p className="text-gray-900">{selectedStudent.sectionGrade}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Aula:</span>
                          <p className="text-gray-900">Aula {selectedStudent.sectionClassroom}</p>
                        </div>
                        {selectedStudent.sectionTutor && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Tutor:</span>
                            <p className="text-gray-900">
                              {selectedStudent.sectionTutor.nombre} {selectedStudent.sectionTutor.apellidos}
                            </p>
                          </div>
                        )}
                        <div className="pt-2">
                          <AnimatedButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFromSection(selectedStudent)}
                          >
                            Remover de sección
                          </AnimatedButton>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <FiBookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4">
                          Este estudiante no está asignado a ninguna sección
                        </p>
                        <AnimatedButton
                          variant="primary"
                          size="sm"
                          icon={FiPlus}
                        >
                          Asignar a sección
                        </AnimatedButton>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StudentAssignments