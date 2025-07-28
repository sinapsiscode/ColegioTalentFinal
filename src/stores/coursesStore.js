import { create } from 'zustand'
import { getDatabase } from '../data/DatabaseManager'

const db = getDatabase()

const useCoursesStore = create((set, get) => ({
  // Estado
  courses: [],
  teacherAssignments: [],
  loading: false,
  error: null,
  selectedCourse: null,
  filters: {
    grado: 'todos',
    materia: 'todas',
    estado: 'activo',
    searchTerm: ''
  },

  // Cargar todos los cursos
  loadCourses: async () => {
    set({ loading: true, error: null })
    try {
      const courses = db.select('courses')
      const assignments = db.select('teacher_course_assignments')
      
      // Enriquecer cursos con información del profesor
      const enrichedCourses = courses.map(course => {
        const assignment = assignments.find(a => a.cursoId === course.id && a.estado === 'activo')
        if (assignment) {
          const profesor = db.select('users', u => u.id === assignment.profesorId)[0]
          return {
            ...course,
            profesor: profesor ? {
              id: profesor.id,
              nombre: `${profesor.nombre} ${profesor.apellidos}`,
              email: profesor.email
            } : null
          }
        }
        return { ...course, profesor: null }
      })
      
      set({ 
        courses: enrichedCourses,
        teacherAssignments: assignments,
        loading: false 
      })
    } catch (error) {
      console.error('Error cargando cursos:', error)
      set({ error: 'Error al cargar cursos', loading: false })
    }
  },

  // Cargar cursos de un profesor específico
  loadTeacherCourses: async (profesorId) => {
    set({ loading: true, error: null })
    try {
      const assignments = db.select('teacher_course_assignments', a => 
        a.profesorId === profesorId && a.estado === 'activo'
      )
      
      const courseIds = assignments.map(a => a.cursoId)
      const courses = db.select('courses', c => courseIds.includes(c.id))
      
      set({ 
        courses: courses,
        teacherAssignments: assignments,
        loading: false 
      })
    } catch (error) {
      console.error('Error cargando cursos del profesor:', error)
      set({ error: 'Error al cargar cursos', loading: false })
    }
  },

  // Crear nuevo curso
  createCourse: async (courseData) => {
    set({ loading: true, error: null })
    try {
      // Crear el curso
      const newCourse = db.insert('courses', {
        ...courseData,
        estudiantesInscritos: 0,
        estado: 'activo'
      })
      
      if (!newCourse) throw new Error('Error al crear curso')
      
      // Si se especificó un profesor, crear la asignación
      if (courseData.profesorId) {
        const assignment = db.insert('teacher_course_assignments', {
          profesorId: courseData.profesorId,
          cursoId: newCourse.id,
          rol: 'titular',
          fechaAsignacion: new Date().toISOString().split('T')[0],
          estado: 'activo'
        })
        
        if (!assignment) {
          console.error('Error al asignar profesor al curso')
        }
      }
      
      // Recargar cursos
      await get().loadCourses()
      
      set({ loading: false })
      return { success: true, course: newCourse }
    } catch (error) {
      console.error('Error creando curso:', error)
      set({ error: 'Error al crear curso', loading: false })
      return { success: false, error: error.message }
    }
  },

  // Actualizar curso
  updateCourse: async (courseId, updateData) => {
    set({ loading: true, error: null })
    try {
      const updated = db.update('courses', c => c.id === courseId, updateData)
      
      if (updated.length === 0) throw new Error('Curso no encontrado')
      
      // Si se cambió el profesor, actualizar asignación
      if (updateData.profesorId !== undefined) {
        // Desactivar asignación anterior
        db.update('teacher_course_assignments', 
          a => a.cursoId === courseId && a.estado === 'activo',
          { estado: 'inactivo' }
        )
        
        // Crear nueva asignación si se especificó profesor
        if (updateData.profesorId) {
          db.insert('teacher_course_assignments', {
            profesorId: updateData.profesorId,
            cursoId: courseId,
            rol: 'titular',
            fechaAsignacion: new Date().toISOString().split('T')[0],
            estado: 'activo'
          })
        }
      }
      
      await get().loadCourses()
      set({ loading: false })
      return { success: true }
    } catch (error) {
      console.error('Error actualizando curso:', error)
      set({ error: 'Error al actualizar curso', loading: false })
      return { success: false, error: error.message }
    }
  },

  // Eliminar curso (cambiar estado a inactivo)
  deleteCourse: async (courseId) => {
    set({ loading: true, error: null })
    try {
      // Cambiar estado del curso
      const updated = db.update('courses', c => c.id === courseId, { estado: 'inactivo' })
      
      if (updated.length === 0) throw new Error('Curso no encontrado')
      
      // Desactivar asignaciones de profesores
      db.update('teacher_course_assignments', 
        a => a.cursoId === courseId,
        { estado: 'inactivo' }
      )
      
      await get().loadCourses()
      set({ loading: false })
      return { success: true }
    } catch (error) {
      console.error('Error eliminando curso:', error)
      set({ error: 'Error al eliminar curso', loading: false })
      return { success: false, error: error.message }
    }
  },

  // Asignar profesor a curso
  assignTeacher: async (courseId, profesorId) => {
    set({ loading: true, error: null })
    try {
      // Desactivar asignación anterior
      db.update('teacher_course_assignments', 
        a => a.cursoId === courseId && a.estado === 'activo',
        { estado: 'inactivo' }
      )
      
      // Crear nueva asignación
      const assignment = db.insert('teacher_course_assignments', {
        profesorId,
        cursoId: courseId,
        rol: 'titular',
        fechaAsignacion: new Date().toISOString().split('T')[0],
        estado: 'activo'
      })
      
      if (!assignment) throw new Error('Error al asignar profesor')
      
      await get().loadCourses()
      set({ loading: false })
      return { success: true }
    } catch (error) {
      console.error('Error asignando profesor:', error)
      set({ error: 'Error al asignar profesor', loading: false })
      return { success: false, error: error.message }
    }
  },

  // Remover profesor de curso
  removeTeacher: async (courseId) => {
    set({ loading: true, error: null })
    try {
      // Desactivar asignación
      const updated = db.update('teacher_course_assignments', 
        a => a.cursoId === courseId && a.estado === 'activo',
        { estado: 'inactivo' }
      )
      
      if (updated.length === 0) throw new Error('No hay profesor asignado')
      
      await get().loadCourses()
      set({ loading: false })
      return { success: true }
    } catch (error) {
      console.error('Error removiendo profesor:', error)
      set({ error: 'Error al remover profesor', loading: false })
      return { success: false, error: error.message }
    }
  },

  // Filtros
  setFilter: (filterType, value) => {
    set(state => ({
      filters: {
        ...state.filters,
        [filterType]: value
      }
    }))
  },

  // Obtener cursos filtrados
  getFilteredCourses: () => {
    const { courses, filters } = get()
    
    return courses.filter(course => {
      // Filtro por grado
      if (filters.grado !== 'todos' && course.grado !== filters.grado) {
        return false
      }
      
      // Filtro por materia
      if (filters.materia !== 'todas' && course.materia !== filters.materia) {
        return false
      }
      
      // Filtro por estado
      if (filters.estado !== 'todos' && course.estado !== filters.estado) {
        return false
      }
      
      // Filtro por búsqueda
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase()
        return (
          course.nombre.toLowerCase().includes(search) ||
          course.codigo.toLowerCase().includes(search) ||
          course.descripcion.toLowerCase().includes(search) ||
          (course.profesor?.nombre.toLowerCase().includes(search))
        )
      }
      
      return true
    })
  },

  // Estadísticas
  getStats: () => {
    const { courses } = get()
    const activeCourses = courses.filter(c => c.estado === 'activo')
    
    return {
      totalCursos: courses.length,
      cursosActivos: activeCourses.length,
      totalEstudiantes: activeCourses.reduce((sum, c) => sum + c.estudiantesInscritos, 0),
      capacidadTotal: activeCourses.reduce((sum, c) => sum + c.capacidad, 0),
      porGrado: courses.reduce((acc, course) => {
        acc[course.grado] = (acc[course.grado] || 0) + 1
        return acc
      }, {}),
      porMateria: courses.reduce((acc, course) => {
        acc[course.materia] = (acc[course.materia] || 0) + 1
        return acc
      }, {})
    }
  },

  // Seleccionar curso
  selectCourse: (course) => set({ selectedCourse: course }),
  
  // Limpiar selección
  clearSelection: () => set({ selectedCourse: null })
}))

export default useCoursesStore