import { format, isValid, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea una fecha de manera segura
 * @param {Date|string|null|undefined} date - La fecha a formatear
 * @param {string} formatStr - El formato deseado (por defecto 'dd/MM/yyyy')
 * @param {string} defaultValue - Valor por defecto si la fecha no es válida
 * @param {object} options - Opciones adicionales para format (ej: { locale: es })
 * @returns {string} - La fecha formateada o el valor por defecto
 */
export const safeFormat = (date, formatStr = 'dd/MM/yyyy', defaultValue = 'No disponible', options = {}) => {
  try {
    if (!date) return defaultValue
    
    let dateObj = date
    
    // Si es string, intentar parsearla
    if (typeof date === 'string') {
      dateObj = parseISO(date)
    }
    
    // Si es un timestamp numérico
    if (typeof date === 'number') {
      dateObj = new Date(date)
    }
    
    // Verificar si es una fecha válida
    if (!isValid(dateObj)) {
      return defaultValue
    }
    
    // Formatear la fecha
    return format(dateObj, formatStr, { locale: es, ...options })
  } catch (error) {
    console.warn('Error formateando fecha:', error, date)
    return defaultValue
  }
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param {Date|string|null|undefined} birthDate - La fecha de nacimiento
 * @returns {number|null} - La edad calculada o null si no es válida
 */
export const calculateAge = (birthDate) => {
  try {
    if (!birthDate) return null
    
    let dateObj = birthDate
    
    if (typeof birthDate === 'string') {
      dateObj = parseISO(birthDate)
    }
    
    if (!isValid(dateObj)) return null
    
    const today = new Date()
    const birth = new Date(dateObj)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  } catch (error) {
    console.warn('Error calculando edad:', error, birthDate)
    return null
  }
}

/**
 * Verifica si una fecha es válida
 * @param {any} date - La fecha a verificar
 * @returns {boolean} - true si es válida, false si no
 */
export const isValidDate = (date) => {
  if (!date) return false
  
  try {
    let dateObj = date
    
    if (typeof date === 'string') {
      dateObj = parseISO(date)
    }
    
    if (typeof date === 'number') {
      dateObj = new Date(date)
    }
    
    return isValid(dateObj)
  } catch {
    return false
  }
}

/**
 * Obtiene una fecha por defecto válida
 * @returns {Date} - La fecha actual
 */
export const getDefaultDate = () => {
  return new Date()
}

/**
 * Formatea una fecha relativa (ej: "hace 2 días")
 * @param {Date|string} date - La fecha a formatear
 * @returns {string} - La fecha en formato relativo
 */
export const formatRelative = (date) => {
  try {
    if (!date) return 'Fecha desconocida'
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Fecha inválida'
    
    const now = new Date()
    const diffTime = Math.abs(now - dateObj)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    
    if (diffMinutes < 60) {
      return `hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`
    } else if (diffHours < 24) {
      return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
    } else if (diffDays < 7) {
      return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`
    } else {
      return safeFormat(dateObj, 'dd/MM/yyyy')
    }
  } catch (error) {
    console.warn('Error en formatRelative:', error)
    return 'Fecha desconocida'
  }
}

export default {
  safeFormat,
  calculateAge,
  isValidDate,
  getDefaultDate,
  formatRelative
}