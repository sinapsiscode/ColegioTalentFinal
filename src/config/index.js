// Configuración centralizada de la aplicación
// Este archivo maneja todas las configuraciones del sistema

const isDevelopment = import.meta.env.MODE === 'development'
const isProduction = import.meta.env.MODE === 'production'

export const config = {
  // Información de la aplicación
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Talentos College',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    academicYear: import.meta.env.VITE_ACADEMIC_YEAR || new Date().getFullYear().toString(),
    environment: import.meta.env.MODE || 'development',
  },

  // Configuración de API
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY) || 1000,
  },

  // Feature Flags
  features: {
    useMockData: import.meta.env.VITE_USE_MOCK === 'true' || isDevelopment,
    debugMode: import.meta.env.VITE_DEBUG === 'true' || isDevelopment,
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
    enablePayments: import.meta.env.VITE_ENABLE_PAYMENTS !== 'false',
    enableQRScanner: import.meta.env.VITE_ENABLE_QR_SCANNER !== 'false',
    enableExports: import.meta.env.VITE_ENABLE_EXPORTS !== 'false',
  },

  // Servicios externos
  external: {
    avatarAPI: import.meta.env.VITE_AVATAR_API || 'https://ui-avatars.com/api',
    placeholderAPI: import.meta.env.VITE_PLACEHOLDER_API || 'https://via.placeholder.com',
    qrAPI: import.meta.env.VITE_QR_API || 'https://api.qrserver.com/v1/create-qr-code',
  },

  // Configuración de autenticación
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiry: import.meta.env.VITE_JWT_EXPIRY || '1h',
    rememberMeDuration: parseInt(import.meta.env.VITE_REMEMBER_ME_DAYS) * 86400000 || 604800000, // días a ms
  },

  // Configuración de almacenamiento
  storage: {
    prefix: import.meta.env.VITE_STORAGE_PREFIX || 'talentos_',
    backupEnabled: import.meta.env.VITE_ENABLE_BACKUP !== 'false',
    backupInterval: parseInt(import.meta.env.VITE_BACKUP_INTERVAL) || 300000,
    maxBackups: parseInt(import.meta.env.VITE_MAX_BACKUPS) || 10,
  },

  // Configuración de UI
  ui: {
    theme: import.meta.env.VITE_THEME || 'default',
    primaryColor: import.meta.env.VITE_PRIMARY_COLOR || '#4F46E5',
    secondaryColor: import.meta.env.VITE_SECONDARY_COLOR || '#7C3AED',
    itemsPerPage: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 10,
    maxUploadSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5242880,
    allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'application/pdf'],
  },

  // Configuración de notificaciones
  notifications: {
    checkInterval: parseInt(import.meta.env.VITE_NOTIFICATION_INTERVAL) || 60000,
    maxNotifications: parseInt(import.meta.env.VITE_MAX_NOTIFICATIONS) || 50,
  },

  // Configuración de pagos
  payments: {
    currency: import.meta.env.VITE_CURRENCY || 'PEN',
    currencySymbol: import.meta.env.VITE_CURRENCY_SYMBOL || 'S/',
    paymentMethods: import.meta.env.VITE_PAYMENT_METHODS?.split(',') || ['transferencia', 'deposito', 'efectivo'],
    gracePeriodDays: parseInt(import.meta.env.VITE_PAYMENT_GRACE_PERIOD) || 5,
  },

  // URLs de la aplicación
  urls: {
    support: import.meta.env.VITE_SUPPORT_EMAIL || 'soporte@talentos.edu.pe',
  },

  // Configuración de desarrollo
  dev: {
    mockDelay: parseInt(import.meta.env.VITE_MOCK_DELAY) || 500,
    logLevel: import.meta.env.VITE_LOG_LEVEL || (isDevelopment ? 'debug' : 'error'),
    showDevTools: isDevelopment,
  },
}

// Función helper para obtener configuración anidada
export const getConfig = (path, defaultValue = null) => {
  const keys = path.split('.')
  let result = config
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return defaultValue
    }
  }
  
  return result
}

// Validar configuración crítica
export const validateConfig = () => {
  const criticalConfigs = [
    { path: 'api.baseURL', message: 'API URL no configurada' },
    { path: 'app.name', message: 'Nombre de la aplicación no configurado' },
  ]

  const errors = []
  
  criticalConfigs.forEach(({ path, message }) => {
    if (!getConfig(path)) {
      errors.push(message)
    }
  })

  if (errors.length > 0) {
    console.error('Errores de configuración:', errors)
    if (isProduction) {
      throw new Error('Configuración inválida: ' + errors.join(', '))
    }
  }

  return errors.length === 0
}

// Logging helper
export const log = {
  debug: (...args) => {
    if (config.dev.logLevel === 'debug') {
      console.log('[DEBUG]', ...args)
    }
  },
  info: (...args) => {
    if (['debug', 'info'].includes(config.dev.logLevel)) {
      console.info('[INFO]', ...args)
    }
  },
  warn: (...args) => {
    if (['debug', 'info', 'warn'].includes(config.dev.logLevel)) {
      console.warn('[WARN]', ...args)
    }
  },
  error: (...args) => {
    console.error('[ERROR]', ...args)
  },
}

// Exportar utilidades
export default config