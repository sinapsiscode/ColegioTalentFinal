// ========================================
// CONSTANTES GLOBALES DEL PROYECTO
// ========================================

// ROLES DE USUARIO
export const USER_ROLES = {
  ADMIN: 'admin',
  TUTOR: 'tutor',
  PARENT: 'padre',
  ENTRANCE: 'entrada'
}

// LÍMITES DEL SISTEMA
export const LIMITS = {
  MAX_STUDENTS_PER_SECTION: 30,
  MIN_PASSWORD_LENGTH: 6,
  MAX_FILE_SIZE_MB: 5,
  SESSION_TIMEOUT_MINUTES: 30
}

// MENSAJES COMUNES
export const MESSAGES = {
  SUCCESS: {
    SAVE: 'Guardado exitosamente',
    DELETE: 'Eliminado correctamente',
    UPDATE: 'Actualizado correctamente'
  },
  ERROR: {
    GENERIC: 'Ocurrió un error',
    NETWORK: 'Error de conexión',
    UNAUTHORIZED: 'No autorizado'
  },
  CONFIRM: {
    DELETE: '¿Estás seguro de eliminar?',
    LOGOUT: '¿Deseas cerrar sesión?'
  }
}

// CONFIGURACIÓN POR DEFECTO
export const DEFAULTS = {
  PASSWORD: '123456',
  ITEMS_PER_PAGE: 10,
  CURRENCY: 'S/',
  DATE_FORMAT: 'DD/MM/YYYY'
}