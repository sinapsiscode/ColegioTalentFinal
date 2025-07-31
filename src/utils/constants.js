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
  MAX_STUDENTS_PER_SECTION: 50,
  DEFAULT_SECTION_CAPACITY: 30,
  MIN_PASSWORD_LENGTH: 6,
  MAX_FILE_SIZE_MB: 5,
  SESSION_TIMEOUT_MINUTES: 30,
  MAX_SECTION_CAPACITY: 50
}

// MENSAJES COMUNES
export const MESSAGES = {
  SUCCESS: {
    SAVE: 'Guardado exitosamente',
    DELETE: 'Eliminado correctamente',
    UPDATE: 'Actualizado correctamente',
    CREATE: 'Creado correctamente',
    EXPORT: 'Exportado exitosamente',
    SEND: 'Enviado correctamente',
    LOAD: 'Cargado correctamente'
  },
  ERROR: {
    GENERIC: 'Ocurrió un error',
    NETWORK: 'Error de conexión',
    UNAUTHORIZED: 'No autorizado',
    SAVE: 'No se pudo guardar',
    DELETE: 'No se pudo eliminar',
    UPDATE: 'No se pudo actualizar',
    CREATE: 'No se pudo crear',
    EXPORT: 'No se pudo exportar',
    LOAD: 'No se pudieron cargar los datos',
    INVALID_FILE: 'Archivo no válido',
    FILE_TOO_LARGE: 'El archivo es demasiado grande'
  },
  CONFIRM: {
    DELETE: '¿Estás seguro de eliminar?',
    LOGOUT: '¿Deseas cerrar sesión?',
    SAVE: '¿Deseas guardar los cambios?',
    CANCEL: '¿Deseas cancelar la operación?'
  },
  LOADING: {
    SAVING: 'Guardando...',
    LOADING: 'Cargando...',
    DELETING: 'Eliminando...',
    EXPORTING: 'Exportando...',
    SENDING: 'Enviando...',
    PROCESSING: 'Procesando...'
  },
  TITLES: {
    SUCCESS: 'Éxito',
    ERROR: 'Error',
    WARNING: 'Advertencia',
    INFO: 'Información',
    CONFIRM: 'Confirmar'
  }
}

// CONFIGURACIÓN POR DEFECTO
export const DEFAULTS = {
  PASSWORD: '123456',
  ITEMS_PER_PAGE: 10,
  CURRENCY: 'S/',
  DATE_FORMAT: 'DD/MM/YYYY'
}

// Z-INDEX LAYERS
export const Z_INDEX = {
  DROPDOWN_BACKDROP: 30,
  DROPDOWN_MENU: 40,
  MOBILE_MENU: 50,
  MODAL: 100
}

// ANIMATION SETTINGS
export const ANIMATIONS = {
  SPRING_DAMPING: 30,
  SPRING_STIFFNESS: 300
}

// SIMULATION RANGES (for mock/demo data)
export const SIMULATION = {
  ACTIVITY_RANGE: 30,        // Random activity percentage range
  ACTIVITY_BASE: 70,         // Base activity percentage
  USER_CHANGE_RANGE: 6,      // User count change range
  ACTIVITY_CHANGE_RANGE: 8,  // Activity change range
  RESPONSE_TIME_RANGE: 50,   // Response time range in ms
  RESPONSE_TIME_BASE: 120    // Base response time in ms
}

// EXCEL EXPORT SETTINGS
export const EXCEL_SETTINGS = {
  COLUMN_WIDTH: {
    DEFAULT: 20,
    WIDE: 30,
    NARROW: 10,
    EXTRA_WIDE: 40
  }
}

// DATA GENERATION SETTINGS
export const DATA_GENERATION = {
  ATTENDANCE_HISTORY_DAYS: 30,  // Days of attendance history to generate
  DEFAULT_PAGE_SIZE: 10
}