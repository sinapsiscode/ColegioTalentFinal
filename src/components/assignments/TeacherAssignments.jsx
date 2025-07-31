import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiMapPin,
  FiEdit3,
  FiPlus,
  FiSearch,
  FiFilter,
  FiUser,
  FiBook,
  FiHome,
  FiClock,
  FiCheck,
  FiX,
  FiEye
} from 'react-icons/fi'
import LoadingSpinner from '../common/LoadingSpinner'
import AnimatedButton from '../common/AnimatedButton'
import SearchInput from '../common/SearchInput'
import FilterDropdown from '../common/FilterDropdown'
import AssignCoursesModal from '../admin/AssignCoursesModal'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'
import getDatabase from '../../data/DatabaseManager'
import useAdminUsersStore from '../../stores/adminUsersStore'

const TeacherAssignments = () => {
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState([])
  const [filteredTeachers, setFilteredTeachers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [showAssignCoursesModal, setShowAssignCoursesModal] = useState(false)
  const [viewMode, setViewMode] = useState('list') // list, detail
  
  const { usuarios, cargarUsuarios } = useAdminUsersStore()

  useEffect(() => {
    cargarUsuarios()
    loadTeacherAssignments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [teachers, searchTerm, statusFilter])

  const loadTeacherAssignments = async () => {
    setLoading(true)
    try {
      const db = getDatabase()
      const sections = db.select('sections') || []
      const courses = db.select('courses') || []
      const users = db.select('users') || []

      // Obtener solo profesores/tutores
      const teacherUsers = users.filter(user => user.rol === 'tutor' || user.rol === 'profesor')

      // Enriquecer profesores con sus asignaciones
      const enrichedTeachers = teacherUsers.map(teacher => {
        // Secciones donde es tutor de aula
        const assignedSections = sections.filter(section => section.tutorId === teacher.id)
        
        // Cursos que dicta
        const assignedCourses = courses.filter(course => course.profesorId === teacher.id)
        
        // Estadísticas
        const totalSections = assignedSections.length
        const totalCourses = assignedCourses.length
        const totalStudents = assignedSections.reduce((sum, section) => sum + (section.estudiantesCount || 0), 0)
        
        return {
          ...teacher,
          assignedSections,
          assignedCourses,
          totalSections,
          totalCourses,
          totalStudents,
          hasAssignments: totalSections > 0 || totalCourses > 0
        }
      })

      setTeachers(enrichedTeachers)
    } catch (error) {
      console.error('Error cargando asignaciones:', error)
      showError('Error', 'No se pudieron cargar las asignaciones')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...teachers]

    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(teacher => {
        switch (statusFilter) {
          case 'with_assignments':
            return teacher.hasAssignments
          case 'without_assignments':
            return !teacher.hasAssignments
          case 'section_tutors':
            return teacher.totalSections > 0
          case 'course_teachers':
            return teacher.totalCourses > 0
          default:
            return true
        }
      })
    }

    setFilteredTeachers(filtered)
  }

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedTeacher(null)
  }

  const handleAssignCourses = (teacher) => {
    setSelectedTeacher(teacher)
    setShowAssignCoursesModal(true)
  }

  const handleSaveAssignments = async () => {
    await loadTeacherAssignments() // Recargar datos
    setShowAssignCoursesModal(false)
    setSelectedTeacher(null)
  }

  const getStatusOptions = () => [
    { value: 'all', label: 'Todos los profesores' },
    { value: 'with_assignments', label: 'Con asignaciones' },
    { value: 'without_assignments', label: 'Sin asignaciones' },
    { value: 'section_tutors', label: 'Tutores de aula' },
    { value: 'course_teachers', label: 'Profesores de curso' }
  ]

  const getStats = () => {
    const totalTeachers = teachers.length
    const withAssignments = teachers.filter(t => t.hasAssignments).length
    const withoutAssignments = totalTeachers - withAssignments
    const sectionTutors = teachers.filter(t => t.totalSections > 0).length
    const courseTeachers = teachers.filter(t => t.totalCourses > 0).length

    return { totalTeachers, withAssignments, withoutAssignments, sectionTutors, courseTeachers }
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
                className="bg-blue-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiUsers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Profesores</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalTeachers}</p>
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
                    <FiCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Con Asignaciones</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.withAssignments}</p>
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
                    <FiX className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sin Asignaciones</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.withoutAssignments}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-purple-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiHome className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tutores de Aula</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.sectionTutors}</p>
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
                    <FiBook className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Prof. de Curso</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.courseTeachers}</p>
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
                  placeholder="Buscar profesores..."
                />
                
                <FilterDropdown
                  label="Filtrar por estado"
                  options={getStatusOptions()}
                  selectedValue={statusFilter}
                  onSelect={setStatusFilter}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {filteredTeachers.length} de {teachers.length} profesores
                </span>
              </div>
            </div>

            {/* Teachers List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Profesor
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Secciones
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Cursos
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Estudiantes
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
                  {filteredTeachers.map((teacher, index) => (
                    <motion.tr
                      key={teacher.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.nombre} {teacher.apellidos}
                            </div>
                            <div className="text-sm text-gray-500">
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {teacher.totalSections}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {teacher.totalCourses}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-gray-900">{teacher.totalStudents}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {teacher.hasAssignments ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Asignado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Sin asignar
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewTeacher(teacher)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Ver detalles"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAssignCourses(teacher)}
                            className="p-1.5 text-gray-600 hover:text-green-600 transition-colors"
                            title="Asignar cursos"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTeachers.length === 0 && (
              <div className="text-center py-12">
                <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron profesores
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay profesores registrados en el sistema'}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          // Vista de detalle del profesor
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {selectedTeacher && (
              <>
                <button
                  onClick={handleBackToList}
                  className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiUsers className="w-5 h-5 mr-1" />
                  <span>Volver a la lista</span>
                </button>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-6">
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-6">
                      <h2 className="text-2xl font-bold text-white">
                        {selectedTeacher.nombre} {selectedTeacher.apellidos}
                      </h2>
                      <p className="text-blue-100">
                        {selectedTeacher.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estadísticas del profesor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Secciones como Tutor</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {selectedTeacher.totalSections}
                        </p>
                      </div>
                      <FiHome className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Cursos que Dicta</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {selectedTeacher.totalCourses}
                        </p>
                      </div>
                      <FiBook className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Estudiantes</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {selectedTeacher.totalStudents}
                        </p>
                      </div>
                      <FiUsers className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Secciones y cursos asignados */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Secciones */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiHome className="w-5 h-5 mr-2 text-purple-600" />
                      Secciones como Tutor de Aula
                    </h3>
                    {selectedTeacher.assignedSections.length > 0 ? (
                      <div className="space-y-3">
                        {selectedTeacher.assignedSections.map(section => (
                          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900">{section.nombre}</h4>
                            <p className="text-sm text-gray-600">{section.grado}</p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <FiMapPin className="w-4 h-4 mr-1" />
                              <span>Aula {section.aula}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No tiene secciones asignadas como tutor</p>
                    )}
                  </div>

                  {/* Cursos */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiBook className="w-5 h-5 mr-2 text-orange-600" />
                      Cursos que Dicta
                    </h3>
                    {selectedTeacher.assignedCourses.length > 0 ? (
                      <div className="space-y-3">
                        {selectedTeacher.assignedCourses.map(course => (
                          <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900">{course.nombre}</h4>
                            <p className="text-sm text-gray-600">{course.materia}</p>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <FiBookOpen className="w-4 h-4 mr-1" />
                                <span>{course.grado} {course.seccion}</span>
                              </div>
                              <div className="flex items-center">
                                <FiClock className="w-4 h-4 mr-1" />
                                <span>{course.horasSemanales}h/sem</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No tiene cursos asignados</p>
                    )}
                  </div>
                </div>

                {/* Sin asignaciones */}
                {!selectedTeacher.hasAssignments && (
                  <div className="text-center py-12">
                    <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sin asignaciones
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Este profesor no tiene secciones ni cursos asignados
                    </p>
                    <AnimatedButton
                      variant="primary"
                      icon={FiPlus}
                      onClick={() => handleAssignCourses(selectedTeacher)}
                    >
                      Asignar cursos y secciones
                    </AnimatedButton>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de asignación de cursos */}
      <AnimatePresence>
        {showAssignCoursesModal && selectedTeacher && (
          <AssignCoursesModal
            isOpen={showAssignCoursesModal}
            onClose={() => setShowAssignCoursesModal(false)}
            teacher={selectedTeacher}
            onSave={handleSaveAssignments}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default TeacherAssignments