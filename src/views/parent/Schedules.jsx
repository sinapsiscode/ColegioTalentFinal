import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiCalendar, FiClock, FiMapPin, FiDownload, FiPrinter,
  FiBook, FiUser, FiChevronDown
} from 'react-icons/fi'
import PageTransition from '../../components/common/PageTransition'
import AnimatedButton from '../../components/common/AnimatedButton'
import ScheduleGrid from '../../components/schedules/ScheduleGrid'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useSchedulesStore from '../../stores/schedulesStore'
import useCoursesStore from '../../stores/coursesStore'
import useAuthStore from '../../stores/authStore'
import useFamilyStore from '../../stores/familyStore'
import useAdminUsersStore from '../../stores/adminUsersStore'
import { DAYS_OF_WEEK } from '../../stores/schedulesStore'

const ParentSchedules = () => {
  const { user } = useAuthStore()
  const { children, loadChildren } = useFamilyStore()
  const { usuarios, cargarUsuarios } = useAdminUsersStore()
  const { schedules, loading, loadSchedules, getSchedulesBySection } = useSchedulesStore()
  const { courses, sections, loadCourses } = useCoursesStore()
  
  const [selectedChildId, setSelectedChildId] = useState('')
  const [viewMode, setViewMode] = useState('week') // week, compact
  const [showChildDropdown, setShowChildDropdown] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      loadSchedules(),
      loadCourses(),
      loadChildren(),
      cargarUsuarios()
    ])
  }, [])

  // Seleccionar primer hijo por defecto
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id)
    }
  }, [children, selectedChildId])

  // Obtener información del hijo seleccionado
  const selectedChild = children.find(child => child.id === selectedChildId)
  const childSection = selectedChild ? sections.find(s => s.id === selectedChild.sectionId) : null

  // Obtener horarios del hijo seleccionado
  const childSchedules = selectedChild && childSection 
    ? getSchedulesBySection(childSection.id)
    : []

  // Obtener profesores únicos
  const getTeachers = () => {
    const teacherIds = [...new Set(childSchedules.map(s => s.teacherId))]
    return teacherIds.map(id => usuarios.find(u => u.id === id)).filter(Boolean)
  }

  const teachers = getTeachers()

  // Estadísticas del estudiante
  const stats = {
    totalClasses: childSchedules.length,
    totalHours: childSchedules.reduce((acc, schedule) => {
      const start = timeToMinutes(schedule.startTime)
      const end = timeToMinutes(schedule.endTime)
      return acc + (end - start) / 60
    }, 0),
    uniqueSubjects: [...new Set(childSchedules.map(s => s.courseId))].length,
    teachers: teachers.length
  }

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    // Implementar exportación
    console.log('Exportar horario')
  }

  if (loading) {
    return <LoadingSpinner message="Cargando horarios..." />
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiCalendar className="w-8 h-8 text-talentos-primary" />
                Horario de Clases
              </h1>
              <p className="text-gray-600 mt-2">
                Visualiza el horario semanal de tus hijos
              </p>
            </div>

            {/* Selector de hijo */}
            {children.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowChildDropdown(!showChildDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  <FiUser className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">
                    {selectedChild?.name || 'Seleccionar hijo'}
                  </span>
                  <FiChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${
                    showChildDropdown ? 'rotate-180' : ''
                  }`} />
                </button>

                {showChildDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                  >
                    {children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setSelectedChildId(child.id)
                          setShowChildDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                          selectedChildId === child.id ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-gray-600">
                          {sections.find(s => s.id === child.sectionId)?.name || 'Sin sección'}
                        </p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedChild ? (
          <>
            {/* Información del estudiante */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedChild.name}</h3>
                  <p className="text-blue-100 mt-1">
                    {childSection?.grade}° Grado - Sección {childSection?.name}
                  </p>
                </div>
                <div className="flex gap-3">
                  <AnimatedButton
                    variant="secondary"
                    icon={FiDownload}
                    onClick={handleExport}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Exportar
                  </AnimatedButton>
                  <AnimatedButton
                    variant="secondary"
                    icon={FiPrinter}
                    onClick={handlePrint}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Imprimir
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Clases</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                    <p className="text-xs text-gray-500 mt-1">Por semana</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiClock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Horas Semanales</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
                    <p className="text-xs text-gray-500 mt-1">Horas académicas</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiCalendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Materias</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.uniqueSubjects}</p>
                    <p className="text-xs text-gray-500 mt-1">Diferentes</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FiBook className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Profesores</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.teachers}</p>
                    <p className="text-xs text-gray-500 mt-1">Asignados</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FiUser className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Controles de vista */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Horario Semanal</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      viewMode === 'week'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Vista Semanal
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      viewMode === 'compact'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Vista Compacta
                  </button>
                </div>
              </div>
            </div>

            {/* Horario */}
            {viewMode === 'week' ? (
              <ScheduleGrid
                schedules={childSchedules}
                courses={courses}
                sections={sections}
                teachers={teachers}
                viewMode="section"
                readOnly
              />
            ) : (
              // Vista compacta
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {DAYS_OF_WEEK.map(day => {
                  const daySchedules = childSchedules
                    .filter(s => s.dayOfWeek === day.id)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))

                  if (daySchedules.length === 0) return null

                  return (
                    <div key={day.id} className="border-b border-gray-200 last:border-b-0">
                      <div className="bg-gray-50 px-4 py-2">
                        <h4 className="font-semibold text-gray-900">{day.name}</h4>
                      </div>
                      <div className="p-4 space-y-2">
                        {daySchedules.map(schedule => {
                          const course = courses.find(c => c.id === schedule.courseId)
                          const teacher = usuarios.find(u => u.id === schedule.teacherId)

                          return (
                            <div
                              key={schedule.id}
                              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-shrink-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {schedule.startTime}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {schedule.endTime}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {course?.name || 'Sin curso'}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                  Prof. {teacher ? `${teacher.nombre} ${teacher.apellidos}` : 'Sin asignar'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <FiMapPin className="w-4 h-4" />
                                <span>{schedule.classroom}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Lista de profesores */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Profesores Asignados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map(teacher => {
                  const teacherCourses = childSchedules
                    .filter(s => s.teacherId === teacher.id)
                    .map(s => courses.find(c => c.id === s.courseId))
                    .filter(Boolean)
                  
                  const uniqueCourses = [...new Set(teacherCourses.map(c => c.name))]

                  return (
                    <div key={teacher.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-full">
                        <FiUser className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{teacher.nombre} {teacher.apellidos}</p>
                        <p className="text-sm text-gray-600 truncate">{teacher.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {uniqueCourses.join(', ')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tienes hijos registrados</p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export default ParentSchedules