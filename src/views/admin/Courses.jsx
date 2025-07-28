import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiBook,
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit3,
  FiTrash2,
  FiUsers,
  FiClock,
  FiMapPin,
  FiUser,
  FiMoreVertical,
  FiCalendar,
  FiBookOpen
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import AnimatedButton from '../../components/common/AnimatedButton'
import PageTransition from '../../components/common/PageTransition'
import StaggeredList from '../../components/common/StaggeredList'
import CourseModal from '../../components/admin/CourseModal'
import AssignTeacherModal from '../../components/admin/AssignTeacherModal'
import useCoursesStore from '../../stores/coursesStore'
import useAuthStore from '../../stores/authStore'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'

const Courses = () => {
  const { usuario } = useAuthStore()
  const {
    courses,
    loading,
    filters,
    loadCourses,
    setFilter,
    getFilteredCourses,
    deleteCourse,
    getStats
  } = useCoursesStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [editingCourse, setEditingCourse] = useState(null)

  // Cargar cursos al montar
  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  // Obtener cursos filtrados y estadísticas
  const filteredCourses = getFilteredCourses()
  const stats = getStats()

  // Handlers
  const handleCreateCourse = () => {
    setEditingCourse(null)
    setShowCreateModal(true)
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
    setShowCreateModal(true)
  }

  const handleDeleteCourse = async (course) => {
    const result = await showConfirm(
      '¿Eliminar curso?',
      `¿Estás seguro de eliminar el curso "${course.nombre}"?`,
      'warning'
    )

    if (result.isConfirmed) {
      const response = await deleteCourse(course.id)
      if (response.success) {
        showSuccess('Curso eliminado', 'El curso ha sido eliminado correctamente')
      } else {
        showError('Error', response.error || 'No se pudo eliminar el curso')
      }
    }
  }

  const handleAssignTeacher = (course) => {
    setSelectedCourse(course)
    setShowAssignModal(true)
  }

  // Obtener valores únicos para filtros
  const grados = [...new Set(courses.map(c => c.grado))].sort()
  const materias = [...new Set(courses.map(c => c.materia))].sort()

  if (loading && courses.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-96">
              <LoadingSpinner size="xl" />
            </div>
          </main>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header de la página */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
              <p className="text-gray-600 mt-2">
                Administra los cursos y asignaciones de profesores
              </p>
            </div>
            
            <AnimatedButton
              variant="primary"
              icon={FiPlus}
              onClick={handleCreateCourse}
              className="mt-4 sm:mt-0"
            >
              Nuevo Curso
            </AnimatedButton>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cursos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCursos}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiBook className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cursos Activos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.cursosActivos}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiBookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEstudiantes}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Capacidad Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.capacidadTotal}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilter('searchTerm', e.target.value)}
                  placeholder="Buscar curso..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                />
              </div>

              {/* Filtro por grado */}
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filters.grado}
                  onChange={(e) => setFilter('grado', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent appearance-none"
                >
                  <option value="todos">Todos los grados</option>
                  {grados.map(grado => (
                    <option key={grado} value={grado}>{grado}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por materia */}
              <div className="relative">
                <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filters.materia}
                  onChange={(e) => setFilter('materia', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent appearance-none"
                >
                  <option value="todas">Todas las materias</option>
                  {materias.map(materia => (
                    <option key={materia} value={materia}>{materia}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por estado */}
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filters.estado}
                  onChange={(e) => setFilter('estado', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent appearance-none"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de cursos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Cursos ({filteredCourses.length})
              </h2>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="p-8 text-center">
                <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron cursos</p>
                <p className="text-sm text-gray-500 mt-2">
                  Intenta ajustar los filtros o crear un nuevo curso
                </p>
              </div>
            ) : (
              <StaggeredList>
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Información principal */}
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {course.nombre}
                          </h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {course.codigo}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            course.estado === 'activo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {course.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">{course.descripcion}</p>

                        {/* Detalles del curso */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <FiBook className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{course.materia}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <FiUsers className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {course.estudiantesInscritos} / {course.capacidad} estudiantes
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <FiClock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{course.horario}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <FiCalendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{course.grado} - Sección {course.seccion}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <FiMapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Aula {course.aula}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <FiUser className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {course.profesor ? course.profesor.nombre : 'Sin profesor asignado'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center space-x-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAssignTeacher(course)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Asignar profesor"
                        >
                          <FiUser className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditCourse(course)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar curso"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteCourse(course)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar curso"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </StaggeredList>
            )}
          </div>
        </main>

        {/* Modals */}
        <CourseModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setEditingCourse(null)
          }}
          course={editingCourse}
        />

        <AssignTeacherModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false)
            setSelectedCourse(null)
          }}
          course={selectedCourse}
        />
      </div>
    </PageTransition>
  )
}

export default Courses