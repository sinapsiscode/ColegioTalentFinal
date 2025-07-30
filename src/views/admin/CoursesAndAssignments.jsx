import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiAlertCircle,
  FiBook,
  FiClock,
  FiMapPin,
  FiUser,
  FiMoreVertical,
  FiCalendar,
  FiChevronRight,
  FiCheck,
  FiX
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import AnimatedButton from '../../components/common/AnimatedButton'
import PageTransition from '../../components/common/PageTransition'
import CourseModal from '../../components/admin/CourseModal'
import AssignTeacherModal from '../../components/admin/AssignTeacherModal'
import { showSuccess, showError, showConfirm, showInfo } from '../../utils/sweetAlert'
import { DatabaseQueries } from '../../data/databaseSchema'
import useAuthStore from '../../stores/authStore'
import useCoursesStore from '../../stores/coursesStore'

const CoursesAndAssignments = () => {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courses') // 'courses' o 'assignments'
  const [tutores, setTutores] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [selectedTutor, setSelectedTutor] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGrade, setFilterGrade] = useState('all')
  const [editingCourse, setEditingCourse] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  
  const { usuario } = useAuthStore()
  const {
    courses,
    loadCourses,
    getFilteredCourses,
    deleteCourse,
    getStats
  } = useCoursesStore()

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar tutores
      const allUsers = DatabaseQueries.getAllUsers()
      const tutorUsers = allUsers.filter(u => u.rol === 'tutor')
      setTutores(tutorUsers)

      // Cargar todos los estudiantes
      const allStudents = DatabaseQueries.getAllStudents()
      setEstudiantes(allStudents)

      // Cargar asignaciones - obtener todas las asignaciones
      const allAssignments = []
      tutorUsers.forEach(tutor => {
        const assignments = DatabaseQueries.getAssignmentsByTeacherId(tutor.id)
        allAssignments.push(...assignments)
      })
      setAsignaciones(allAssignments)

      // Cargar cursos
      await loadCourses()
    } catch (error) {
      console.error('Error cargando datos:', error)
      showError('Error', 'No se pudieron cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  // Obtener estudiantes asignados a un tutor
  const getEstudiantesAsignados = (tutorId) => {
    const studentIds = asignaciones
      .filter(a => a.teacher_user_id === tutorId)
      .map(a => a.student_id)
    
    return estudiantes.filter(e => studentIds.includes(e.id))
  }

  // Obtener información del tutor
  const getTutorInfo = (tutorId) => {
    const estudiantesAsignados = getEstudiantesAsignados(tutorId)
    const materias = [...new Set(asignaciones
      .filter(a => a.teacher_user_id === tutorId)
      .map(a => a.subject)
    )]
    
    const gradosSet = new Set()
    const seccionesSet = new Set()
    
    estudiantesAsignados.forEach(e => {
      if (e.grado) gradosSet.add(e.grado)
      if (e.seccion) seccionesSet.add(e.seccion)
    })
    
    return {
      totalEstudiantes: estudiantesAsignados.length,
      materias,
      grados: Array.from(gradosSet).sort(),
      secciones: Array.from(seccionesSet).sort()
    }
  }

  // Handlers para cursos
  const handleCreateCourse = () => {
    setEditingCourse(null)
    setShowCourseModal(true)
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
    setShowCourseModal(true)
  }

  const handleDeleteCourse = async (courseId) => {
    const result = await showConfirm(
      '¿Eliminar curso?',
      'Esta acción no se puede deshacer'
    )
    
    if (result.isConfirmed) {
      try {
        await deleteCourse(courseId)
        showSuccess('¡Éxito!', 'Curso eliminado correctamente')
      } catch (error) {
        showError('Error', 'No se pudo eliminar el curso')
      }
    }
  }

  const handleAssignTeacher = (course) => {
    setSelectedCourse(course)
    setShowAssignTeacherModal(true)
  }

  // Obtener estadísticas
  const stats = {
    totalCursos: courses.length,
    totalTutores: tutores.length,
    totalEstudiantes: estudiantes.length,
    totalAsignaciones: asignaciones.length,
    cursosActivos: courses.filter(c => c.status === 'active').length,
    tutoresConAsignaciones: [...new Set(asignaciones.map(a => a.teacher_user_id))].length
  }

  // Filtrar tutores
  const filteredTutores = tutores.filter(tutor => {
    const matchesSearch = searchTerm === '' || 
      tutor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterGrade === 'all') return matchesSearch
    
    const estudiantesAsignados = getEstudiantesAsignados(tutor.id)
    const tieneGrado = estudiantesAsignados.some(e => e.grado === filterGrade)
    
    return matchesSearch && tieneGrado
  })

  // Filtrar cursos
  const filteredCourses = getFilteredCourses()

  // Obtener grados únicos
  const uniqueGrades = [...new Set(estudiantes.map(e => e.grado).filter(Boolean))].sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <PageTransition>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Asignaciones
            </h1>
            <p className="text-gray-600">
              Administra cursos, materias y asignaciones de tutores a estudiantes
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cursos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCursos}</p>
                </div>
                <FiBookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cursosActivos}</p>
                </div>
                <FiCheck className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tutores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTutores}</p>
                </div>
                <FiUser className="w-8 h-8 text-purple-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Con Asignación</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tutoresConAsignaciones}</p>
                </div>
                <FiUserCheck className="w-8 h-8 text-orange-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEstudiantes}</p>
                </div>
                <FiUsers className="w-8 h-8 text-indigo-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Asignaciones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAsignaciones}</p>
                </div>
                <FiBookOpen className="w-8 h-8 text-teal-500" />
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`py-3 px-6 text-sm font-medium transition-colors ${
                    activeTab === 'courses'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiBook className="w-4 h-4" />
                    Cursos y Materias
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`py-3 px-6 text-sm font-medium transition-colors ${
                    activeTab === 'assignments'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiUserCheck className="w-4 h-4" />
                    Asignación de Tutores
                  </div>
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'courses' ? (
                <>
                  {/* Toolbar de Cursos */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar cursos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <AnimatedButton
                      variant="primary"
                      icon={FiPlus}
                      onClick={handleCreateCourse}
                    >
                      Nuevo Curso
                    </AnimatedButton>
                  </div>

                  {/* Lista de Cursos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FiBook className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{course.name}</h3>
                              <p className="text-sm text-gray-500">{course.code}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            course.status === 'active' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {course.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiUsers className="w-4 h-4" />
                            <span>{course.grade} - {course.section || 'Todas las secciones'}</span>
                          </div>
                          {course.teacher && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiUser className="w-4 h-4" />
                              <span>{course.teacher.name}</span>
                            </div>
                          )}
                          {course.schedule && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiClock className="w-4 h-4" />
                              <span>{course.schedule}</span>
                            </div>
                          )}
                          {course.classroom && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiMapPin className="w-4 h-4" />
                              <span>Aula {course.classroom}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAssignTeacher(course)}
                            className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Asignar Tutor
                          </button>
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {filteredCourses.length === 0 && (
                    <div className="text-center py-12">
                      <FiBook className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No se encontraron cursos</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Toolbar de Asignaciones */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar tutores..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <select
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos los grados</option>
                      {uniqueGrades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${
                          viewMode === 'grid' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <FiGrid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${
                          viewMode === 'list' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <FiList className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Lista de Tutores */}
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTutores.map((tutor, index) => {
                        const info = getTutorInfo(tutor.id)
                        
                        return (
                          <motion.div
                            key={tutor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                  <FiUser className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {tutor.nombre} {tutor.apellidos}
                                  </h3>
                                  <p className="text-sm text-gray-500">{tutor.email}</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Estudiantes asignados:</span>
                                <span className="font-semibold text-gray-900">{info.totalEstudiantes}</span>
                              </div>
                              
                              {info.materias.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Materias:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {info.materias.map(materia => (
                                      <span 
                                        key={materia}
                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                                      >
                                        {materia}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {info.grados.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Grados:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {info.grados.map(grado => (
                                      <span 
                                        key={grado}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                      >
                                        {grado}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <AnimatedButton
                              variant="primary"
                              icon={FiPlus}
                              onClick={() => {
                                setSelectedTutor(tutor)
                                setShowAssignModal(true)
                              }}
                              className="w-full"
                            >
                              Asignar Estudiantes
                            </AnimatedButton>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Tutor</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Estudiantes</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Materias</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Grados</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTutores.map((tutor, index) => {
                            const info = getTutorInfo(tutor.id)
                            
                            return (
                              <motion.tr
                                key={tutor.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                      <FiUser className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {tutor.nombre} {tutor.apellidos}
                                      </p>
                                      <p className="text-sm text-gray-500">{tutor.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium">
                                    {info.totalEstudiantes}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-wrap gap-1">
                                    {info.materias.map(materia => (
                                      <span 
                                        key={materia}
                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                                      >
                                        {materia}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-wrap gap-1">
                                    {info.grados.map(grado => (
                                      <span 
                                        key={grado}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                      >
                                        {grado}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <AnimatedButton
                                    variant="secondary"
                                    size="sm"
                                    icon={FiPlus}
                                    onClick={() => {
                                      setSelectedTutor(tutor)
                                      setShowAssignModal(true)
                                    }}
                                  >
                                    Asignar
                                  </AnimatedButton>
                                </td>
                              </motion.tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {filteredTutores.length === 0 && (
                    <div className="text-center py-12">
                      <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No se encontraron tutores</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </PageTransition>

      {/* Modales */}
      {showCourseModal && (
        <CourseModal
          isOpen={showCourseModal}
          onClose={() => {
            setShowCourseModal(false)
            setEditingCourse(null)
          }}
          course={editingCourse}
          onSuccess={() => {
            loadData()
            setShowCourseModal(false)
            setEditingCourse(null)
          }}
        />
      )}

      {showAssignTeacherModal && selectedCourse && (
        <AssignTeacherModal
          isOpen={showAssignTeacherModal}
          onClose={() => {
            setShowAssignTeacherModal(false)
            setSelectedCourse(null)
          }}
          course={selectedCourse}
          onSuccess={() => {
            loadData()
            setShowAssignTeacherModal(false)
            setSelectedCourse(null)
          }}
        />
      )}

      {showAssignModal && selectedTutor && (
        <AssignmentModal
          tutor={selectedTutor}
          onClose={() => {
            setShowAssignModal(false)
            setSelectedTutor(null)
          }}
          onSave={() => {
            loadData()
            setShowAssignModal(false)
            setSelectedTutor(null)
          }}
          estudiantes={estudiantes}
          asignaciones={asignaciones}
          getEstudiantesAsignados={getEstudiantesAsignados}
        />
      )}
    </div>
  )
}

// Modal de asignación de estudiantes (reutilizado del componente original)
const AssignmentModal = ({ tutor, onClose, onSave, estudiantes, asignaciones, getEstudiantesAsignados }) => {
  const [selectedStudents, setSelectedStudents] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('Matemáticas')
  const [filterModalGrade, setFilterModalGrade] = useState('all')
  const [filterModalSection, setFilterModalSection] = useState('all')
  
  // Estudiantes ya asignados al tutor
  const estudiantesAsignados = getEstudiantesAsignados(tutor.id)
  const estudianteIdsAsignados = estudiantesAsignados.map(e => e.id)
  
  // Estudiantes disponibles (no asignados a este tutor)
  const estudiantesDisponibles = estudiantes.filter(e => !estudianteIdsAsignados.includes(e.id))
  
  // Filtrar estudiantes en el modal
  const estudiantesFiltrados = estudiantesDisponibles.filter(e => {
    if (filterModalGrade !== 'all' && e.grado !== filterModalGrade) return false
    if (filterModalSection !== 'all' && e.seccion !== filterModalSection) return false
    return true
  })
  
  // Obtener grados únicos
  const uniqueGrades = [...new Set(estudiantes.map(e => e.grado).filter(Boolean))].sort()
  
  // Obtener secciones únicas del grado seleccionado
  const getSeccionesPorGrado = () => {
    if (filterModalGrade === 'all') return []
    const secciones = [...new Set(
      estudiantes
        .filter(e => e.grado === filterModalGrade)
        .map(e => e.seccion || 'Sin sección')
    )]
    return secciones.sort()
  }
  
  const handleToggleStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId))
    } else {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }
  
  const handleSelectAll = () => {
    const allIds = estudiantesFiltrados.map(e => e.id)
    setSelectedStudents(allIds)
  }
  
  const handleDeselectAll = () => {
    setSelectedStudents([])
  }
  
  const handleSave = async () => {
    if (selectedStudents.length === 0) {
      showError('Error', 'Selecciona al menos un estudiante')
      return
    }
    
    try {
      // Crear asignaciones para cada estudiante
      const newAssignments = selectedStudents.map(studentId => ({
        teacher_user_id: tutor.id,
        student_id: studentId,
        subject: selectedSubject,
        academic_year: new Date().getFullYear().toString()
      }))
      
      // Guardar en la base de datos
      newAssignments.forEach(assignment => {
        DatabaseQueries.createTeacherAssignment(assignment)
      })
      
      showSuccess('¡Éxito!', `Se asignaron ${selectedStudents.length} estudiantes al tutor`)
      onSave()
    } catch (error) {
      console.error('Error al guardar asignaciones:', error)
      showError('Error', 'No se pudieron guardar las asignaciones')
    }
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Asignar Estudiantes a {tutor.nombre} {tutor.apellidos}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materia
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Matemáticas">Matemáticas</option>
                  <option value="Comunicación">Comunicación</option>
                  <option value="Ciencias">Ciencias</option>
                  <option value="Historia">Historia</option>
                  <option value="Inglés">Inglés</option>
                  <option value="Arte">Arte</option>
                  <option value="Educación Física">Educación Física</option>
                </select>
              </div>
              
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grado
                </label>
                <select
                  value={filterModalGrade}
                  onChange={(e) => {
                    setFilterModalGrade(e.target.value)
                    setFilterModalSection('all')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  {uniqueGrades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              
              {filterModalGrade !== 'all' && getSeccionesPorGrado().length > 0 && (
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sección
                  </label>
                  <select
                    value={filterModalSection}
                    onChange={(e) => setFilterModalSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas</option>
                    {getSeccionesPorGrado().map(seccion => (
                      <option key={seccion} value={seccion}>{seccion}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                {estudiantesFiltrados.length} estudiantes disponibles
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Seleccionar todos
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Limpiar selección
                </button>
              </div>
            </div>
          </div>
          
          {/* Lista de estudiantes */}
          <div className="px-6 py-4 overflow-y-auto max-h-[400px]">
            {estudiantesFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {estudiantesFiltrados.map(estudiante => (
                  <label
                    key={estudiante.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStudents.includes(estudiante.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(estudiante.id)}
                      onChange={() => handleToggleStudent(estudiante.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {estudiante.nombre} {estudiante.apellidos}
                      </p>
                      <p className="text-sm text-gray-500">
                        {estudiante.grado} {estudiante.seccion && `- ${estudiante.seccion}`}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No hay estudiantes disponibles con los filtros seleccionados
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {selectedStudents.length} estudiantes seleccionados
              </p>
              <div className="flex gap-3">
                <AnimatedButton
                  variant="secondary"
                  onClick={onClose}
                >
                  Cancelar
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  icon={FiCheck}
                  onClick={handleSave}
                  disabled={selectedStudents.length === 0}
                >
                  Asignar Estudiantes
                </AnimatedButton>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CoursesAndAssignments