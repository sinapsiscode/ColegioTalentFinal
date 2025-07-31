import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiBook,
  FiUsers,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiGrid,
  FiList,
  FiUserCheck,
  FiSettings,
  FiChevronRight,
  FiBookOpen
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import PageTransition from '../../components/common/PageTransition'
import AnimatedButton from '../../components/common/AnimatedButton'
import CountUpNumber from '../../components/common/CountUpNumber'
import CourseModal from '../../components/admin/CourseModal'
import SectionModal from '../../components/admin/SectionModal'
import AssignTeacherModal from '../../components/admin/AssignTeacherModal'
import useCoursesStore from '../../stores/coursesStore'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'

const CoursesManagement = () => {
  const [activeTab, setActiveTab] = useState('courses')
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [sectionModalOpen, setSectionModalOpen] = useState(false)
  const [assignTeacherModalOpen, setAssignTeacherModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)

  const { 
    courses, 
    sections, 
    getCoursesByGrade,
    getSectionsByCourse,
    getTeacherAssignments,
    createCourse,
    updateCourse,
    deleteCourse,
    createSection,
    updateSection,
    deleteSection,
    loadCourses,
    loadSections
  } = useCoursesStore()

  // Cargar datos al montar el componente
  React.useEffect(() => {
    loadCourses()
    loadSections()
  }, [loadCourses, loadSections])

  // Estadísticas - con validaciones para evitar errores
  const stats = {
    totalCourses: courses?.length || 0,
    totalSections: sections?.length || 0,
    activeTeachers: getTeacherAssignments?.()?.length || 0,
    totalStudents: sections?.reduce((sum, section) => sum + (section.estudiantes?.length || 0), 0) || 0
  }

  const handleCreateCourse = (courseData) => {
    try {
      createCourse(courseData)
      setCourseModalOpen(false)
      showSuccess('Éxito', 'Curso creado correctamente')
    } catch (error) {
      showError('Error', 'No se pudo crear el curso')
    }
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setCourseModalOpen(true)
  }

  const handleDeleteCourse = async (courseId) => {
    const result = await showConfirm(
      '¿Eliminar curso?',
      'Esta acción no se puede deshacer. Se eliminarán también todas las secciones asociadas.'
    )
    
    if (result.isConfirmed) {
      try {
        deleteCourse(courseId)
        showSuccess('Éxito', 'Curso eliminado correctamente')
      } catch (error) {
        showError('Error', 'No se pudo eliminar el curso')
      }
    }
  }

  const handleCreateSection = (sectionData) => {
    try {
      createSection(sectionData)
      setSectionModalOpen(false)
      showSuccess('Éxito', 'Sección creada correctamente')
    } catch (error) {
      showError('Error', 'No se pudo crear la sección')
    }
  }

  const handleAssignTeacher = (section) => {
    setSelectedSection(section)
    setAssignTeacherModalOpen(true)
  }

  const handleToggleCourseStatus = async (courseId) => {
    const result = await showConfirm(
      '¿Cambiar estado del curso?',
      'Esto afectará la disponibilidad del curso en el sistema.'
    )
    
    if (result.isConfirmed) {
      try {
        const course = courses.find(c => c.id === courseId)
        updateCourse(courseId, { activo: !course.activo })
        showSuccess('Éxito', `Curso ${!course.activo ? 'activado' : 'desactivado'} correctamente`)
      } catch (error) {
        showError('Error', 'No se pudo cambiar el estado del curso')
      }
    }
  }

  const handleToggleSectionStatus = async (sectionId) => {
    const result = await showConfirm(
      '¿Cambiar estado de la sección?',
      'Esto afectará la disponibilidad de la sección en el sistema.'
    )
    
    if (result.isConfirmed) {
      try {
        const section = sections.find(s => s.id === sectionId)
        updateSection(sectionId, { activa: !section.activa })
        showSuccess('Éxito', `Sección ${!section.activa ? 'activada' : 'desactivada'} correctamente`)
      } catch (error) {
        showError('Error', 'No se pudo cambiar el estado de la sección')
      }
    }
  }

  const filteredCourses = (courses || []).filter(course =>
    course?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course?.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSections = (sections || []).filter(section =>
    section?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section?.grado?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const CourseCard = ({ course }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiBook className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{course.nombre}</h3>
            <p className="text-sm text-gray-500">Código: {course.codigo}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleEditCourse(course)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCourse(course.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Grado:</span>
          <span className="font-medium">{course.grado}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Secciones:</span>
          <span className="font-medium">{getSectionsByCourse?.(course.id)?.length || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Horas/semana:</span>
          <span className="font-medium">{course.horasSemanales || 'N/A'}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 space-y-2 sm:space-y-0">
        <div className="flex items-center flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.activo 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {course.activo ? 'Activo' : 'Inactivo'}
          </span>
          <button
            onClick={() => handleToggleCourseStatus(course.id)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              course.activo
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title={course.activo ? 'Desactivar curso' : 'Activar curso'}
          >
            <span className="sm:hidden">{course.activo ? 'Des.' : 'Act.'}</span>
            <span className="hidden sm:inline">{course.activo ? 'Desactivar' : 'Activar'}</span>
          </button>
        </div>
        <button
          onClick={() => {
            setActiveTab('sections')
            setSearchTerm(course.nombre)
          }}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center sm:justify-start space-x-1 w-full sm:w-auto"
        >
          <span className="sm:hidden">Secciones</span>
          <span className="hidden sm:inline">Ver secciones</span>
          <FiChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  )

  const SectionCard = ({ section }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FiUsers className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{section.nombre}</h3>
            <p className="text-sm text-gray-500">{section.grado} - {section.nivel}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleAssignTeacher(section)}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
          >
            <FiUserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedSection(section)
              setSectionModalOpen(true)
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCourse(section.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Estudiantes:</span>
          <span className="font-medium">{section.estudiantes?.length || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Capacidad:</span>
          <span className="font-medium">{section.capacidadMaxima}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tutor:</span>
          <span className="font-medium">{section.tutorAsignado || 'Sin asignar'}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 space-y-2 sm:space-y-0">
        <div className="flex items-center flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            section.activa 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {section.activa ? 'Activa' : 'Inactiva'}
          </span>
          <button
            onClick={() => handleToggleSectionStatus(section.id)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              section.activa
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title={section.activa ? 'Desactivar sección' : 'Activar sección'}
          >
            <span className="sm:hidden">{section.activa ? 'Des.' : 'Act.'}</span>
            <span className="hidden sm:inline">{section.activa ? 'Desactivar' : 'Activar'}</span>
          </button>
          {section.estudiantes?.length >= section.capacidadMaxima && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
              Llena
            </span>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end">
          <span className="text-xs text-gray-500">
            <span className="sm:hidden">{Math.round((section.estudiantes?.length || 0) / section.capacidadMaxima * 100)}%</span>
            <span className="hidden sm:inline">{Math.round((section.estudiantes?.length || 0) / section.capacidadMaxima * 100)}% ocupada</span>
          </span>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <PageTransition>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Cursos y Secciones
            </h1>
            <p className="text-gray-600">
              Administra cursos académicos, secciones y asignaciones de tutores
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Cursos</h3>
                <FiBook className="w-5 h-5 text-blue-500" />
              </div>
              <CountUpNumber 
                value={stats.totalCourses} 
                className="text-3xl font-bold text-gray-900"
              />
              <p className="text-sm text-green-600 mt-1">Activos</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Secciones</h3>
                <FiUsers className="w-5 h-5 text-purple-500" />
              </div>
              <CountUpNumber 
                value={stats.totalSections} 
                className="text-3xl font-bold text-gray-900"
              />
              <p className="text-sm text-blue-600 mt-1">Configuradas</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Tutores Activos</h3>
                <FiUserCheck className="w-5 h-5 text-green-500" />
              </div>
              <CountUpNumber 
                value={stats.activeTeachers} 
                className="text-3xl font-bold text-gray-900"
              />
              <p className="text-sm text-purple-600 mt-1">Asignados</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Estudiantes</h3>
                <FiBookOpen className="w-5 h-5 text-orange-500" />
              </div>
              <CountUpNumber 
                value={stats.totalStudents} 
                className="text-3xl font-bold text-gray-900"
              />
              <p className="text-sm text-orange-600 mt-1">Inscritos</p>
            </motion.div>
          </div>

          {/* Tabs y controles - Completamente responsive */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="p-4 sm:p-5 md:p-6 space-y-4">
              {/* Tabs */}
              <div className="flex justify-center sm:justify-start">
                <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      activeTab === 'courses'
                        ? 'bg-white text-blue-600 shadow-md border border-blue-100'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Cursos
                  </button>
                  <button
                    onClick={() => setActiveTab('sections')}
                    className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      activeTab === 'sections'
                        ? 'bg-white text-purple-600 shadow-md border border-purple-100'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Secciones
                  </button>
                </div>
              </div>

              {/* Controles - Stack en móvil, horizontal en desktop */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Búsqueda */}
                <div className="relative flex-1 sm:max-w-xs">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Buscar ${activeTab === 'courses' ? 'cursos' : 'secciones'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>

                {/* Controles secundarios */}
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  {/* Vista - Solo visible en desktop */}
                  <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-white shadow-sm border border-gray-200 text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      title="Vista en cuadrícula"
                    >
                      <FiGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-white shadow-sm border border-gray-200 text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      title="Vista en lista"
                    >
                      <FiList className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Agregar - Botón responsive sin duplicar íconos */}
                  <AnimatedButton
                    variant="primary"
                    icon={FiPlus}
                    onClick={() => {
                      if (activeTab === 'courses') {
                        setSelectedCourse(null)
                        setCourseModalOpen(true)
                      } else {
                        setSelectedSection(null)
                        setSectionModalOpen(true)
                      }
                    }}
                    size="sm"
                    className="w-full sm:w-auto whitespace-nowrap"
                  >
                    <span className="sm:hidden">Nuevo</span>
                    <span className="hidden sm:inline">Agregar {activeTab === 'courses' ? 'Curso' : 'Sección'}</span>
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {activeTab === 'courses' 
              ? filteredCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))
              : filteredSections.map(section => (
                  <SectionCard key={section.id} section={section} />
                ))
            }
          </div>

          {/* Mensaje vacío */}
          {((activeTab === 'courses' && filteredCourses.length === 0) ||
            (activeTab === 'sections' && filteredSections.length === 0)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 mb-4">
                {activeTab === 'courses' ? <FiBook className="w-12 h-12 mx-auto" /> : <FiUsers className="w-12 h-12 mx-auto" />}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay {activeTab === 'courses' ? 'cursos' : 'secciones'} {searchTerm ? 'que coincidan' : 'registrados'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? `No se encontraron resultados para "${searchTerm}"`
                  : `Comienza agregando ${activeTab === 'courses' ? 'un curso' : 'una sección'} nuevo`
                }
              </p>
              {!searchTerm && (
                <AnimatedButton
                  variant="primary"
                  icon={FiPlus}
                  onClick={() => {
                    if (activeTab === 'courses') {
                      setSelectedCourse(null)
                      setCourseModalOpen(true)
                    } else {
                      setSelectedSection(null)
                      setSectionModalOpen(true)
                    }
                  }}
                >
                  Agregar {activeTab === 'courses' ? 'Curso' : 'Sección'}
                </AnimatedButton>
              )}
            </motion.div>
          )}
        </main>
      </PageTransition>

      {/* Modales */}
      <CourseModal
        isOpen={courseModalOpen}
        onClose={() => {
          setCourseModalOpen(false)
          setSelectedCourse(null)
        }}
        course={selectedCourse}
        onSave={handleCreateCourse}
      />

      <SectionModal
        isOpen={sectionModalOpen}
        onClose={() => {
          setSectionModalOpen(false)
          setSelectedSection(null)
        }}
        section={selectedSection}
        onSave={handleCreateSection}
      />

      <AssignTeacherModal
        isOpen={assignTeacherModalOpen}
        onClose={() => {
          setAssignTeacherModalOpen(false)
          setSelectedSection(null)
        }}
        section={selectedSection}
      />
    </div>
  )
}

export default CoursesManagement