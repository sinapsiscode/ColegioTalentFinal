import { create } from 'zustand'
import { DatabaseQueries } from '../data/databaseSchema'
import useAuthStore from './authStore'

const useFamilyStore = create((set, get) => ({
  // Estados
  relaciones: [],
  familiasCompletas: [],
  loading: false,
  error: null,

  // Cargar todas las relaciones familiares
  cargarRelacionesFamiliares: () => {
    set({ loading: true, error: null })
    
    try {
      const todasLasRelaciones = DatabaseQueries.getAllParentStudentRelationships()
      const relacionesEnriquecidas = todasLasRelaciones.map(rel => {
        const padre = DatabaseQueries.getUserById(rel.parent_user_id)
        const hijo = DatabaseQueries.getStudentById(rel.student_id)
        
        return {
          ...rel,
          padre: padre ? {
            id: padre.id,
            nombre: padre.nombre,
            apellidos: padre.apellidos,
            email: padre.email,
            telefono: padre.telefono
          } : null,
          hijo: hijo ? {
            id: hijo.id,
            nombre: hijo.nombre,
            apellidos: hijo.apellidos,
            grado: hijo.grado,
            seccion: hijo.seccion
          } : null
        }
      }).filter(rel => rel.padre && rel.hijo) // Solo relaciones válidas
      
      set({ 
        relaciones: relacionesEnriquecidas,
        loading: false 
      })
    } catch (error) {
      set({ 
        error: error.message,
        loading: false 
      })
    }
  },

  // Obtener familia completa de un padre
  getFamiliaCompleta: (parentId) => {
    const { relaciones } = get()
    const relacionesPadre = relaciones.filter(rel => rel.parent_user_id === parentId)
    
    if (relacionesPadre.length === 0) return null
    
    return {
      padre: relacionesPadre[0].padre,
      hijos: relacionesPadre.map(rel => rel.hijo),
      relaciones: relacionesPadre
    }
  },

  // Obtener padres de un estudiante
  getPadresDeEstudiante: (studentId) => {
    const { relaciones } = get()
    return relaciones
      .filter(rel => rel.student_id === studentId)
      .map(rel => rel.padre)
  },

  // Crear nueva relación padre-hijo
  crearRelacionFamiliar: (parentId, studentId, relationshipType = 'padre') => {
    try {
      const nuevaRelacion = {
        id: Date.now(),
        parent_user_id: parentId,
        student_id: studentId,
        relationship_type: relationshipType,
        is_primary_contact: true,
        fechaCreacion: new Date().toISOString().split('T')[0]
      }
      
      // En un app real esto sería una llamada API
      const relacionCreada = DatabaseQueries.assignParentToStudent(parentId, studentId, relationshipType)
      
      // Recargar relaciones
      get().cargarRelacionesFamiliares()
      
      return { success: true, relacion: relacionCreada }
    } catch (error) {
      set({ error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Eliminar relación familiar
  eliminarRelacionFamiliar: (relationId) => {
    try {
      const { relaciones } = get()
      const relacion = relaciones.find(r => r.id === relationId)
      
      if (!relacion) {
        throw new Error('Relación no encontrada')
      }
      
      // En un app real esto sería una llamada API
      DatabaseQueries.unassignParentFromStudent(relacion.parent_user_id, relacion.student_id)
      
      // Recargar relaciones
      get().cargarRelacionesFamiliares()
      
      return { success: true }
    } catch (error) {
      set({ error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Validar si un padre puede ver a un estudiante
  puedeVerEstudiante: (parentId, studentId) => {
    const { relaciones } = get()
    return relaciones.some(rel => 
      rel.parent_user_id === parentId && rel.student_id === studentId
    )
  },

  // Obtener estadísticas familiares
  getEstadisticasFamiliares: () => {
    const { relaciones } = get()
    
    const totalFamilias = new Set(relaciones.map(r => r.parent_user_id)).size
    const totalEstudiantes = new Set(relaciones.map(r => r.student_id)).size
    const padresSolteros = relaciones.filter(r => r.is_primary_contact).length
    
    return {
      totalFamilias,
      totalEstudiantes,
      padresSolteros,
      promedioHijosPorFamilia: totalEstudiantes / totalFamilias || 0
    }
  },

  // Limpiar errores
  limpiarError: () => set({ error: null })
}))

export default useFamilyStore