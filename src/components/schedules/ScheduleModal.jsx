import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiClock, FiMapPin, FiBook, FiUsers, FiUser, FiAlertCircle } from 'react-icons/fi'
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../stores/schedulesStore'
import AnimatedButton from '../common/AnimatedButton'
import useCoursesStore from '../../stores/coursesStore'
import useAdminUsersStore from '../../stores/adminUsersStore'

const ScheduleModal = ({ 
  isOpen, 
  onClose, 
  schedule = null, 
  onSave,
  defaultDay = null,
  defaultTime = null
}) => {
  const { courses, sections, loadCourses } = useCoursesStore()
  const { usuarios, cargarUsuarios } = useAdminUsersStore()
  
  const [formData, setFormData] = useState({
    courseId: '',
    sectionId: '',
    teacherId: '',
    dayOfWeek: defaultDay ?? 0,
    startTime: defaultTime ?? '08:00',
    endTime: '09:00',
    classroom: '',
    academicYear: new Date().getFullYear().toString()
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadCourses()
      cargarUsuarios()
    }
  }, [isOpen])

  // Cargar datos del horario si está editando
  useEffect(() => {
    if (schedule) {
      setFormData({
        courseId: schedule.courseId || '',
        sectionId: schedule.sectionId || '',
        teacherId: schedule.teacherId || '',
        dayOfWeek: schedule.dayOfWeek ?? 0,
        startTime: schedule.startTime || '08:00',
        endTime: schedule.endTime || '09:00',
        classroom: schedule.classroom || '',
        academicYear: schedule.academicYear || new Date().getFullYear().toString()
      })
    } else if (defaultDay !== null || defaultTime !== null) {
      setFormData(prev => ({
        ...prev,
        dayOfWeek: defaultDay ?? prev.dayOfWeek,
        startTime: defaultTime ?? prev.startTime
      }))
    }
  }, [schedule, defaultDay, defaultTime])

  // Filtrar profesores
  const teachers = usuarios ? usuarios.filter(user => user.rol === 'tutor') : []

  // Filtrar secciones por curso seleccionado
  const availableSections = sections.filter(section => 
    section.courseId === formData.courseId
  )

  // Calcular hora de fin automáticamente (1 hora después)
  useEffect(() => {
    if (formData.startTime) {
      const [hours, minutes] = formData.startTime.split(':').map(Number)
      const endHours = hours + 1
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      
      if (TIME_SLOTS.includes(endTime)) {
        setFormData(prev => ({ ...prev, endTime }))
      }
    }
  }, [formData.startTime])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      
      // Si cambia el curso, resetear la sección
      if (name === 'courseId') {
        updated.sectionId = ''
      }
      
      return updated
    })
    
    // Limpiar error del campo
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.courseId) newErrors.courseId = 'Selecciona un curso'
    if (!formData.sectionId) newErrors.sectionId = 'Selecciona una sección'
    if (!formData.teacherId) newErrors.teacherId = 'Selecciona un profesor'
    if (!formData.classroom) newErrors.classroom = 'Ingresa el aula'
    if (!formData.startTime) newErrors.startTime = 'Selecciona hora de inicio'
    if (!formData.endTime) newErrors.endTime = 'Selecciona hora de fin'

    // Validar que la hora de fin sea posterior a la de inicio
    if (formData.startTime && formData.endTime) {
      const startMinutes = timeToMinutes(formData.startTime)
      const endMinutes = timeToMinutes(formData.endTime)
      
      if (endMinutes <= startMinutes) {
        newErrors.endTime = 'La hora de fin debe ser posterior a la de inicio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)
    try {
      await onSave(formData)
      onClose()
      
      // Reset form
      setFormData({
        courseId: '',
        sectionId: '',
        teacherId: '',
        dayOfWeek: 0,
        startTime: '08:00',
        endTime: '09:00',
        classroom: '',
        academicYear: new Date().getFullYear().toString()
      })
      setErrors({})
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setSaving(false)
    }
  }

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary text-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FiClock className="w-6 h-6" />
                {schedule ? 'Editar Horario' : 'Nuevo Horario'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Error general */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{errors.submit}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Día de la semana */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Día de la Semana
                </label>
                <select
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day.id} value={day.id}>
                      {day.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aula */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="inline w-4 h-4 mr-1" />
                  Aula / Salón
                </label>
                <input
                  type="text"
                  name="classroom"
                  value={formData.classroom}
                  onChange={handleChange}
                  placeholder="Ej: A-101, Lab 2, Gimnasio"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.classroom ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.classroom && (
                  <p className="mt-1 text-sm text-red-600">{errors.classroom}</p>
                )}
              </div>

              {/* Hora de inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Inicio
                </label>
                <select
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.startTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar hora</option>
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                )}
              </div>

              {/* Hora de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Fin
                </label>
                <select
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.endTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar hora</option>
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                )}
              </div>

              {/* Curso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiBook className="inline w-4 h-4 mr-1" />
                  Curso
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.courseId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {errors.courseId && (
                  <p className="mt-1 text-sm text-red-600">{errors.courseId}</p>
                )}
              </div>

              {/* Sección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUsers className="inline w-4 h-4 mr-1" />
                  Sección
                </label>
                <select
                  name="sectionId"
                  value={formData.sectionId}
                  onChange={handleChange}
                  disabled={!formData.courseId}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.sectionId ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.courseId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {formData.courseId ? 'Seleccionar sección' : 'Primero selecciona un curso'}
                  </option>
                  {availableSections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
                {errors.sectionId && (
                  <p className="mt-1 text-sm text-red-600">{errors.sectionId}</p>
                )}
              </div>

              {/* Profesor */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline w-4 h-4 mr-1" />
                  Profesor
                </label>
                <select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.teacherId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar profesor</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.nombre} {teacher.apellidos} - {teacher.email}
                    </option>
                  ))}
                </select>
                {errors.teacherId && (
                  <p className="mt-1 text-sm text-red-600">{errors.teacherId}</p>
                )}
              </div>
            </div>

            {/* Resumen visual */}
            {formData.courseId && formData.sectionId && formData.teacherId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Resumen del Horario:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    <span className="font-medium">Día:</span> {DAYS_OF_WEEK.find(d => d.id === formData.dayOfWeek)?.name}
                  </p>
                  <p>
                    <span className="font-medium">Horario:</span> {formData.startTime} - {formData.endTime}
                  </p>
                  <p>
                    <span className="font-medium">Curso:</span> {courses.find(c => c.id === formData.courseId)?.name}
                  </p>
                  <p>
                    <span className="font-medium">Sección:</span> {availableSections.find(s => s.id === formData.sectionId)?.name}
                  </p>
                  <p>
                    <span className="font-medium">Profesor:</span> {teachers.find(t => t.id === formData.teacherId)?.nombre} {teachers.find(t => t.id === formData.teacherId)?.apellidos}
                  </p>
                  <p>
                    <span className="font-medium">Aula:</span> {formData.classroom || 'Por definir'}
                  </p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <AnimatedButton
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </AnimatedButton>
              <AnimatedButton
                type="submit"
                variant="primary"
                loading={saving}
                disabled={saving}
              >
                {schedule ? 'Actualizar Horario' : 'Crear Horario'}
              </AnimatedButton>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ScheduleModal