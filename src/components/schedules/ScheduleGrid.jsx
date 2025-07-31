import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2, FiClock, FiMapPin } from 'react-icons/fi'
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../stores/schedulesStore'
import LoadingSpinner from '../common/LoadingSpinner'

const ScheduleGrid = ({ 
  schedules = [], 
  courses = [], 
  sections = [], 
  teachers = [],
  viewMode = 'section', // 'section', 'teacher', 'classroom'
  onEdit,
  onDelete,
  loading = false,
  readOnly = false
}) => {
  // Colores para diferentes cursos
  const courseColors = [
    'bg-blue-100 border-blue-300 text-blue-900',
    'bg-green-100 border-green-300 text-green-900',
    'bg-purple-100 border-purple-300 text-purple-900',
    'bg-yellow-100 border-yellow-300 text-yellow-900',
    'bg-pink-100 border-pink-300 text-pink-900',
    'bg-indigo-100 border-indigo-300 text-indigo-900',
    'bg-red-100 border-red-300 text-red-900',
    'bg-orange-100 border-orange-300 text-orange-900'
  ]

  // Crear mapa de colores por curso
  const courseColorMap = useMemo(() => {
    const map = {}
    courses.forEach((course, index) => {
      map[course.id] = courseColors[index % courseColors.length]
    })
    return map
  }, [courses])

  // Organizar horarios por día y hora
  const scheduleGrid = useMemo(() => {
    const grid = {}
    
    DAYS_OF_WEEK.forEach(day => {
      grid[day.id] = {}
      TIME_SLOTS.forEach(time => {
        grid[day.id][time] = []
      })
    })

    schedules.forEach(schedule => {
      if (grid[schedule.dayOfWeek] && grid[schedule.dayOfWeek][schedule.startTime]) {
        grid[schedule.dayOfWeek][schedule.startTime].push(schedule)
      }
    })

    return grid
  }, [schedules])

  // Obtener información del curso/profesor/sección
  const getScheduleInfo = (schedule) => {
    const course = courses.find(c => c.id === schedule.courseId)
    const section = sections.find(s => s.id === schedule.sectionId)
    const teacher = teachers.find(t => t.id === schedule.teacherId)

    return { course, section, teacher }
  }

  if (loading) {
    return <LoadingSpinner message="Cargando horarios..." />
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Encabezado con días */}
      <div className="grid grid-cols-7 bg-gradient-to-r from-talentos-primary to-talentos-secondary text-white">
        <div className="p-4 text-center font-semibold text-sm sm:text-base">
          Hora
        </div>
        {DAYS_OF_WEEK.map(day => (
          <div key={day.id} className="p-4 text-center font-semibold text-sm sm:text-base border-l border-white/20">
            <span className="hidden sm:inline">{day.name}</span>
            <span className="sm:hidden">{day.short}</span>
          </div>
        ))}
      </div>

      {/* Grid de horarios */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {TIME_SLOTS.map((time, timeIndex) => (
            <div key={time} className={`grid grid-cols-7 ${timeIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              {/* Columna de hora */}
              <div className="p-3 text-center font-medium text-gray-700 text-xs sm:text-sm border-r border-gray-200">
                {time}
              </div>

              {/* Celdas de horario para cada día */}
              {DAYS_OF_WEEK.map(day => {
                const schedulesAtTime = scheduleGrid[day.id][time] || []
                
                return (
                  <div 
                    key={`${day.id}-${time}`} 
                    className="p-2 border-r border-gray-200 min-h-[80px] relative group"
                  >
                    {schedulesAtTime.map((schedule, index) => {
                      const { course, section, teacher } = getScheduleInfo(schedule)
                      const colorClass = courseColorMap[schedule.courseId] || courseColors[0]
                      
                      return (
                        <motion.div
                          key={schedule.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`${colorClass} rounded-lg p-2 mb-1 border-2 cursor-pointer hover:shadow-md transition-all duration-200 relative`}
                          onClick={() => !readOnly && onEdit && onEdit(schedule)}
                        >
                          {/* Contenido según el modo de vista */}
                          <div className="text-xs">
                            <div className="font-semibold truncate">
                              {course?.name || 'Sin curso'}
                            </div>
                            <div className="text-opacity-80 truncate">
                              {section?.name || 'Sin sección'}
                            </div>
                            {viewMode !== 'teacher' && (
                              <div className="text-opacity-70 truncate text-[10px]">
                                {teacher ? `${teacher.nombre} ${teacher.apellidos}` : 'Sin profesor'}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-1 text-[10px]">
                              <FiMapPin className="w-3 h-3" />
                              <span>{schedule.classroom}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px]">
                              <FiClock className="w-3 h-3" />
                              <span>{schedule.startTime} - {schedule.endTime}</span>
                            </div>
                          </div>

                          {/* Botones de acción */}
                          {!readOnly && (
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              {onEdit && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(schedule)
                                  }}
                                  className="p-1 bg-white rounded hover:bg-gray-100 shadow-sm"
                                  title="Editar"
                                >
                                  <FiEdit2 className="w-3 h-3 text-blue-600" />
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(schedule.id)
                                  }}
                                  className="p-1 bg-white rounded hover:bg-gray-100 shadow-sm"
                                  title="Eliminar"
                                >
                                  <FiTrash2 className="w-3 h-3 text-red-600" />
                                </button>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )
                    })}

                    {/* Indicador de celda vacía para agregar */}
                    {!readOnly && schedulesAtTime.length === 0 && (
                      <div 
                        className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => onEdit && onEdit({ dayOfWeek: day.id, startTime: time })}
                      >
                        <div className="text-gray-400 text-xs text-center">
                          <div className="w-8 h-8 mx-auto mb-1 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                            +
                          </div>
                          <span>Agregar</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Leyenda de Cursos:</h4>
        <div className="flex flex-wrap gap-2">
          {courses.map((course, index) => (
            <div key={course.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${courseColorMap[course.id]} border-2`} />
              <span className="text-xs text-gray-600">{course.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ScheduleGrid