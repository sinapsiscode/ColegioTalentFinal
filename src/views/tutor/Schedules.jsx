import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiCalendar, FiClock, FiMapPin, FiDownload, FiPrinter,
  FiBook, FiUsers, FiFilter
} from 'react-icons/fi'
import PageTransition from '../../components/common/PageTransition'
import AnimatedButton from '../../components/common/AnimatedButton'
import ScheduleGrid from '../../components/schedules/ScheduleGrid'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useSchedulesStore from '../../stores/schedulesStore'
import useCoursesStore from '../../stores/coursesStore'
import useAuthStore from '../../stores/authStore'
import useAdminUsersStore from '../../stores/adminUsersStore'
import { DAYS_OF_WEEK } from '../../stores/schedulesStore'

const TutorSchedules = () => {
  const { user } = useAuthStore()
  const { schedules, loading, loadSchedules, getSchedulesByTeacher } = useSchedulesStore()
  const { courses, sections, loadCourses } = useCoursesStore()
  
  const [viewFilter, setViewFilter] = useState('week') // week, today, tomorrow
  const [selectedDay, setSelectedDay] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      loadSchedules(),
      loadCourses()
    ])
  }, [])

  // Obtener horarios del tutor
  const mySchedules = getSchedulesByTeacher(user.id)

  // Filtrar horarios según vista seleccionada
  const getFilteredSchedules = () => {
    const today = new Date().getDay()
    const adjustedToday = today === 0 ? 6 : today - 1 // Ajustar domingo

    switch (viewFilter) {
      case 'today':
        return mySchedules.filter(s => s.dayOfWeek === adjustedToday)
      case 'tomorrow':
        const tomorrow = (adjustedToday + 1) % 7
        return mySchedules.filter(s => s.dayOfWeek === tomorrow)
      case 'day':
        return selectedDay !== null 
          ? mySchedules.filter(s => s.dayOfWeek === selectedDay)
          : mySchedules
      default:
        return mySchedules
    }
  }

  const filteredSchedules = getFilteredSchedules()

  // Estadísticas del tutor
  const stats = {
    totalClasses: mySchedules.length,
    todayClasses: mySchedules.filter(s => {
      const today = new Date().getDay()
      const adjustedToday = today === 0 ? 6 : today - 1
      return s.dayOfWeek === adjustedToday
    }).length,
    uniqueCourses: [...new Set(mySchedules.map(s => s.courseId))].length,
    uniqueClassrooms: [...new Set(mySchedules.map(s => s.classroom))].length
  }

  // Próxima clase
  const getNextClass = () => {
    const now = new Date()
    const currentDay = now.getDay()
    const adjustedDay = currentDay === 0 ? 6 : currentDay - 1
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    // Clases de hoy
    const todayClasses = mySchedules
      .filter(s => s.dayOfWeek === adjustedDay && s.startTime > currentTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    if (todayClasses.length > 0) {
      return { ...todayClasses[0], isToday: true }
    }

    // Si no hay más clases hoy, buscar en los próximos días
    for (let i = 1; i <= 7; i++) {
      const nextDay = (adjustedDay + i) % 7
      const nextDayClasses = mySchedules
        .filter(s => s.dayOfWeek === nextDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))

      if (nextDayClasses.length > 0) {
        return { ...nextDayClasses[0], isToday: false, daysUntil: i }
      }
    }

    return null
  }

  const nextClass = getNextClass()

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    // Implementar exportación
    console.log('Exportar horarios')
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiCalendar className="w-8 h-8 text-talentos-primary" />
            Mi Horario de Clases
          </h1>
          <p className="text-gray-600 mt-2">
            Visualiza tu horario semanal y próximas clases
          </p>
        </div>

        {/* Próxima clase */}
        {nextClass && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-6"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FiClock className="w-5 h-5" />
              {nextClass.isToday ? 'Próxima Clase Hoy' : `Próxima Clase en ${nextClass.daysUntil} día${nextClass.daysUntil > 1 ? 's' : ''}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-blue-100 text-sm">Curso</p>
                <p className="font-semibold">
                  {courses.find(c => c.id === nextClass.courseId)?.name || 'Sin curso'}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Horario</p>
                <p className="font-semibold">
                  {DAYS_OF_WEEK.find(d => d.id === nextClass.dayOfWeek)?.name} {nextClass.startTime} - {nextClass.endTime}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Aula</p>
                <p className="font-semibold flex items-center gap-1">
                  <FiMapPin className="w-4 h-4" />
                  {nextClass.classroom}
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
                <p className="text-gray-600 text-sm">Clases Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayClasses}</p>
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
                <p className="text-gray-600 text-sm">Cursos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueCourses}</p>
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
                <p className="text-gray-600 text-sm">Aulas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueClassrooms}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiMapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Filtros de vista */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewFilter('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewFilter === 'week'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semana Completa
              </button>
              <button
                onClick={() => setViewFilter('today')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewFilter === 'today'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setViewFilter('tomorrow')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewFilter === 'tomorrow'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mañana
              </button>

              {/* Selector de día */}
              <select
                value={selectedDay ?? ''}
                onChange={(e) => {
                  const value = e.target.value
                  setSelectedDay(value === '' ? null : parseInt(value))
                  setViewFilter('day')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar día</option>
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.id} value={day.id}>
                    {day.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <AnimatedButton
                variant="outline"
                icon={FiDownload}
                onClick={handleExport}
                size="sm"
              >
                Exportar
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                icon={FiPrinter}
                onClick={handlePrint}
                size="sm"
              >
                Imprimir
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Grid de horarios */}
        {loading ? (
          <LoadingSpinner message="Cargando horario..." />
        ) : (
          <div className="print:break-inside-avoid">
            <ScheduleGrid
              schedules={viewFilter === 'week' ? mySchedules : filteredSchedules}
              courses={courses}
              sections={sections}
              teachers={[user]}
              viewMode="teacher"
              readOnly
            />

            {/* Lista detallada para vistas de día */}
            {viewFilter !== 'week' && filteredSchedules.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalle de Clases
                </h3>
                {filteredSchedules
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(schedule => {
                    const course = courses.find(c => c.id === schedule.courseId)
                    const section = sections.find(s => s.id === schedule.sectionId)
                    
                    return (
                      <motion.div
                        key={schedule.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {course?.name || 'Sin curso'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Sección: {section?.name || 'Sin sección'}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FiClock className="w-4 h-4" />
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiMapPin className="w-4 h-4" />
                                {schedule.classroom}
                              </span>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            schedule.dayOfWeek === new Date().getDay() - 1
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {DAYS_OF_WEEK.find(d => d.id === schedule.dayOfWeek)?.name}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            )}

            {filteredSchedules.length === 0 && (
              <div className="text-center py-12">
                <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No tienes clases programadas para {
                    viewFilter === 'today' ? 'hoy' :
                    viewFilter === 'tomorrow' ? 'mañana' :
                    viewFilter === 'day' && selectedDay !== null 
                      ? DAYS_OF_WEEK.find(d => d.id === selectedDay)?.name.toLowerCase()
                      : 'este período'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export default TutorSchedules