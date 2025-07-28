import useAuthStore from '../stores/authStore'
import { DatabaseQueries } from '../data/databaseSchema'

export const usePermissions = () => {
  const { usuario, rol } = useAuthStore()
  
  // Verificar si un usuario puede ver un estudiante específico
  const canViewStudent = (studentId) => {
    if (!usuario || !studentId) return false
    
    // Admin puede ver todos
    if (rol === 'admin') return true
    
    // Padre solo puede ver sus hijos
    if (rol === 'padre') {
      const hijos = DatabaseQueries.getChildrenByParentId(usuario.id)
      return hijos.some(h => h.id === parseInt(studentId))
    }
    
    // Tutor solo puede ver sus estudiantes asignados
    if (rol === 'tutor') {
      const estudiantes = DatabaseQueries.getStudentsByTutorId(usuario.id)
      return estudiantes.some(e => e.id === parseInt(studentId))
    }
    
    return false
  }
  
  // Verificar si puede ver calificaciones
  const canViewGrades = (studentId) => {
    return canViewStudent(studentId)
  }
  
  // Verificar si puede ver asistencia
  const canViewAttendance = (studentId) => {
    return canViewStudent(studentId)
  }
  
  // Verificar si puede editar estudiante
  const canEditStudent = (studentId) => {
    if (rol === 'admin') return true
    if (rol === 'tutor') {
      const estudiantes = DatabaseQueries.getStudentsByTutorId(usuario.id)
      return estudiantes.some(e => e.id === parseInt(studentId))
    }
    return false
  }
  
  // Verificar si puede ver mensajes de un usuario
  const canViewMessages = (userId) => {
    if (rol === 'admin') return true
    return usuario.id === userId
  }
  
  return {
    canViewStudent,
    canViewGrades,
    canViewAttendance,
    canEditStudent,
    canViewMessages,
    usuario,
    rol
  }
}

export default usePermissions