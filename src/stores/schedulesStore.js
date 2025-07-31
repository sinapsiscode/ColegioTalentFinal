import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import getDatabase from '../data/DatabaseManager'

const db = getDatabase()

// La tabla se manejará automáticamente por el DatabaseManager
// No es necesario crear la tabla explícitamente

// Configuración de días y horas
export const DAYS_OF_WEEK = [
  { id: 0, name: 'Lunes', short: 'Lun' },
  { id: 1, name: 'Martes', short: 'Mar' },
  { id: 2, name: 'Miércoles', short: 'Mié' },
  { id: 3, name: 'Jueves', short: 'Jue' },
  { id: 4, name: 'Viernes', short: 'Vie' },
  { id: 5, name: 'Sábado', short: 'Sáb' }
]

export const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
]

const useSchedulesStore = create(
  persist(
    (set, get) => ({
      schedules: [],
      loading: false,
      error: null,
      filters: {
        teacherId: '',
        courseId: '',
        sectionId: '',
        dayOfWeek: null,
        classroom: ''
      },

      // Cargar horarios
      loadSchedules: async () => {
        set({ loading: true, error: null })
        try {
          // Obtener todos los registros de horarios
          const allData = db.select('schedules')
          const schedules = allData || []
          set({ schedules, loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },

      // Obtener horarios filtrados
      getFilteredSchedules: () => {
        const { schedules, filters } = get()
        
        return schedules.filter(schedule => {
          if (filters.teacherId && schedule.teacherId !== filters.teacherId) return false
          if (filters.courseId && schedule.courseId !== filters.courseId) return false
          if (filters.sectionId && schedule.sectionId !== filters.sectionId) return false
          if (filters.dayOfWeek !== null && schedule.dayOfWeek !== filters.dayOfWeek) return false
          if (filters.classroom && !schedule.classroom.toLowerCase().includes(filters.classroom.toLowerCase())) return false
          
          return true
        })
      },

      // Obtener horarios por profesor
      getSchedulesByTeacher: (teacherId) => {
        const { schedules } = get()
        return schedules.filter(schedule => schedule.teacherId === teacherId)
      },

      // Obtener horarios por sección
      getSchedulesBySection: (sectionId) => {
        const { schedules } = get()
        return schedules.filter(schedule => schedule.sectionId === sectionId)
      },

      // Obtener horarios por aula
      getSchedulesByClassroom: (classroom) => {
        const { schedules } = get()
        return schedules.filter(schedule => schedule.classroom === classroom)
      },

      // Crear horario
      createSchedule: async (scheduleData) => {
        set({ loading: true, error: null })
        try {
          // Validar conflictos
          const conflict = get().checkConflicts(scheduleData)
          if (conflict) {
            throw new Error(conflict)
          }

          const newSchedule = {
            ...scheduleData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          const result = db.insert('schedules', newSchedule)
          if (!result) throw new Error('Error al crear horario')
          
          set(state => ({
            schedules: [...state.schedules, newSchedule],
            loading: false
          }))

          return newSchedule
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Actualizar horario
      updateSchedule: async (id, updates) => {
        set({ loading: true, error: null })
        try {
          const schedule = get().schedules.find(s => s.id === id)
          if (!schedule) throw new Error('Horario no encontrado')

          // Validar conflictos (excluyendo el horario actual)
          const conflict = get().checkConflicts({ ...schedule, ...updates }, id)
          if (conflict) {
            throw new Error(conflict)
          }

          const updatedSchedule = {
            ...schedule,
            ...updates,
            updatedAt: new Date().toISOString()
          }

          const result = db.update('schedules', (s) => s.id === id, updatedSchedule)
          if (!result || result.length === 0) throw new Error('Error al actualizar horario')
          
          set(state => ({
            schedules: state.schedules.map(s => 
              s.id === id ? updatedSchedule : s
            ),
            loading: false
          }))

          return updatedSchedule
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Eliminar horario
      deleteSchedule: async (id) => {
        set({ loading: true, error: null })
        try {
          const result = db.delete('schedules', (s) => s.id === id)
          if (result === 0) throw new Error('Horario no encontrado')
          
          set(state => ({
            schedules: state.schedules.filter(s => s.id !== id),
            loading: false
          }))
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Verificar conflictos
      checkConflicts: (scheduleData, excludeId = null) => {
        const { schedules } = get()
        
        for (const schedule of schedules) {
          // Excluir el horario actual si se está editando
          if (excludeId && schedule.id === excludeId) continue

          // Mismo día
          if (schedule.dayOfWeek === scheduleData.dayOfWeek) {
            // Conflicto de profesor
            if (schedule.teacherId === scheduleData.teacherId) {
              if (isTimeOverlap(schedule, scheduleData)) {
                return `El profesor ya tiene una clase programada en ese horario`
              }
            }

            // Conflicto de aula
            if (schedule.classroom === scheduleData.classroom) {
              if (isTimeOverlap(schedule, scheduleData)) {
                return `El aula ${scheduleData.classroom} ya está ocupada en ese horario`
              }
            }

            // Conflicto de sección
            if (schedule.sectionId === scheduleData.sectionId) {
              if (isTimeOverlap(schedule, scheduleData)) {
                return `La sección ya tiene una clase programada en ese horario`
              }
            }
          }
        }

        return null
      },

      // Copiar horarios de una semana a otra
      copyWeekSchedule: async (fromWeek, toWeek) => {
        set({ loading: true, error: null })
        try {
          const { schedules } = get()
          const weekSchedules = schedules.filter(s => {
            // Filtrar por semana (implementar lógica según necesidad)
            return true
          })

          const copiedSchedules = weekSchedules.map(schedule => ({
            ...schedule,
            id: Date.now().toString() + Math.random(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))

          copiedSchedules.forEach(schedule => {
            const result = db.insert('schedules', schedule)
            if (!result) {
              console.error('Error al copiar horario:', schedule)
            }
          })

          set(state => ({
            schedules: [...state.schedules, ...copiedSchedules],
            loading: false
          }))
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Exportar horarios
      exportSchedules: (format = 'json') => {
        const { schedules } = get()
        
        if (format === 'json') {
          return JSON.stringify(schedules, null, 2)
        }
        
        // Implementar otros formatos según necesidad
        return schedules
      },

      // Aplicar filtros
      setFilter: (filterName, value) => {
        set(state => ({
          filters: {
            ...state.filters,
            [filterName]: value
          }
        }))
      },

      // Limpiar filtros
      clearFilters: () => {
        set({
          filters: {
            teacherId: '',
            courseId: '',
            sectionId: '',
            dayOfWeek: null,
            classroom: ''
          }
        })
      },

      // Obtener resumen de horarios
      getScheduleSummary: () => {
        const { schedules } = get()
        
        return {
          totalClasses: schedules.length,
          classesPerDay: DAYS_OF_WEEK.map(day => ({
            day: day.name,
            count: schedules.filter(s => s.dayOfWeek === day.id).length
          })),
          teacherLoad: schedules.reduce((acc, schedule) => {
            acc[schedule.teacherId] = (acc[schedule.teacherId] || 0) + 1
            return acc
          }, {}),
          classroomUsage: schedules.reduce((acc, schedule) => {
            acc[schedule.classroom] = (acc[schedule.classroom] || 0) + 1
            return acc
          }, {})
        }
      }
    }),
    {
      name: 'schedules-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        schedules: state.schedules,
        filters: state.filters
      })
    }
  )
)

// Función auxiliar para verificar superposición de horarios
function isTimeOverlap(schedule1, schedule2) {
  const start1 = timeToMinutes(schedule1.startTime)
  const end1 = timeToMinutes(schedule1.endTime)
  const start2 = timeToMinutes(schedule2.startTime)
  const end2 = timeToMinutes(schedule2.endTime)

  return (start1 < end2 && start2 < end1)
}

// Convertir tiempo HH:MM a minutos
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export default useSchedulesStore