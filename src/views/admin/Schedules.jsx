import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiCalendar, FiPlus, FiFilter, FiDownload, FiPrinter,
  FiGrid, FiList, FiUsers, FiUser, FiMapPin, FiRefreshCw,
  FiClock, FiBook
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import PageTransition from '../../components/common/PageTransition'
import AnimatedButton from '../../components/common/AnimatedButton'
import ScheduleGrid from '../../components/schedules/ScheduleGrid'
import ScheduleModal from '../../components/schedules/ScheduleModal'
import ToastNotification from '../../components/common/ToastNotification'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useSchedulesStore from '../../stores/schedulesStore'
import useCoursesStore from '../../stores/coursesStore'
import useAdminUsersStore from '../../stores/adminUsersStore'
import { showConfirm, showSuccess, showError } from '../../utils/sweetAlert'

const Schedules = () => {
  const {
    schedules,
    loading,
    filters,
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    setFilter,
    clearFilters,
    getFilteredSchedules,
    getScheduleSummary
  } = useSchedulesStore()

  const { courses, sections, loadCourses } = useCoursesStore()
  const { usuarios, cargarUsuarios } = useAdminUsersStore()

  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [viewType, setViewType] = useState('section') // section, teacher, classroom
  const [showModal, setShowModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [toast, setToast] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      loadSchedules(),
      loadCourses(),
      cargarUsuarios()
    ])
  }, [])

  // Obtener datos filtrados
  const filteredSchedules = getFilteredSchedules()
  const teachers = usuarios ? usuarios.filter(user => user.rol === 'tutor') : []
  const summary = getScheduleSummary()

  // Manejadores
  const handleCreateOrEdit = async (formData) => {
    try {
      if (selectedSchedule) {
        await updateSchedule(selectedSchedule.id, formData)
        showSuccess('Horario actualizado', 'El horario se actualizó correctamente')
      } else {
        await createSchedule(formData)
        showSuccess('Horario creado', 'El horario se creó correctamente')
      }
      setShowModal(false)
      setSelectedSchedule(null)
    } catch (error) {
      showError('Error', error.message)
    }
  }

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    const result = await showConfirm(
      '¿Eliminar horario?',
      'Esta acción no se puede deshacer'
    )

    if (result.isConfirmed) {
      try {
        await deleteSchedule(id)
        showSuccess('Horario eliminado', 'El horario se eliminó correctamente')
      } catch (error) {
        showError('Error', error.message)
      }
    }
  }

  const handleExport = () => {
    // Implementar exportación a Excel/PDF
    setToast({
      type: 'info',
      message: 'Función de exportación en desarrollo'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <PageTransition>
        <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                <FiCalendar className="w-8 h-8 text-talentos-primary" />
                Gestión de Horarios
              </h1>
              <p className="mt-2 text-gray-600">
                Administra los horarios de clases y asignaciones
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <AnimatedButton
                variant="outline"
                icon={FiRefreshCw}
                onClick={loadSchedules}
                size="sm"
              >
                Actualizar
              </AnimatedButton>
              <AnimatedButton
                variant="primary"
                icon={FiPlus}
                onClick={() => setShowModal(true)}
              >
                Nuevo Horario
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Total Clases</p>
                <p className="text-2xl font-bold">{summary.totalClasses}</p>
              </div>
              <FiClock className="w-8 h-8 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">Profesores</p>
                <p className="text-2xl font-bold">{Object.keys(summary.teacherLoad).length}</p>
              </div>
              <FiUser className="w-8 h-8 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100">Aulas en Uso</p>
                <p className="text-2xl font-bold">{Object.keys(summary.classroomUsage).length}</p>
              </div>
              <FiMapPin className="w-8 h-8 text-purple-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-100">Cursos Activos</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <FiBook className="w-8 h-8 text-orange-200" />
            </div>
          </motion.div>
        </div>

        {/* Controles y filtros */}
        <div className="mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Filtros */}
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Filtro por profesor */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Profesor
                  </label>
                  <select
                    value={filters.teacherId}
                    onChange={(e) => setFilter('teacherId', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  >
                    <option value="">Todos los profesores</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.nombre} {teacher.apellidos}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por curso */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Curso
                  </label>
                  <select
                    value={filters.courseId}
                    onChange={(e) => setFilter('courseId', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  >
                    <option value="">Todos los cursos</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por aula */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Aula
                  </label>
                  <input
                    type="text"
                    value={filters.classroom}
                    onChange={(e) => setFilter('classroom', e.target.value)}
                    placeholder="Buscar aula..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  />
                </div>

                {/* Botón limpiar filtros */}
                <div className="flex items-end">
                  <AnimatedButton
                    variant="secondary"
                    onClick={clearFilters}
                    size="sm"
                    className="w-full"
                  >
                    Limpiar Filtros
                  </AnimatedButton>
                </div>
              </div>

              {/* Controles de vista */}
              <div className="flex items-center gap-3">
                {/* Tipo de vista */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setViewType('section')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      viewType === 'section'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Por Sección
                  </button>
                  <button
                    onClick={() => setViewType('teacher')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      viewType === 'teacher'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Por Profesor
                  </button>
                  <button
                    onClick={() => setViewType('classroom')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      viewType === 'classroom'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Por Aula
                  </button>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="p-2 text-gray-600 transition-colors rounded-lg hover:text-gray-900 hover:bg-gray-100"
                    title="Exportar"
                  >
                    <FiDownload className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 text-gray-600 transition-colors rounded-lg hover:text-gray-900 hover:bg-gray-100"
                    title="Imprimir"
                  >
                    <FiPrinter className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de horarios */}
        {loading ? (
          <LoadingSpinner message="Cargando horarios..." />
        ) : (
          <ScheduleGrid
            schedules={filteredSchedules}
            courses={courses}
            sections={sections}
            teachers={teachers}
            viewMode={viewType}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Modal */}
        <ScheduleModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedSchedule(null)
          }}
          schedule={selectedSchedule}
          onSave={handleCreateOrEdit}
        />

        {/* Toast */}
        {toast && (
          <ToastNotification
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
        </main>
      </PageTransition>
    </div>
  )
}

export default Schedules