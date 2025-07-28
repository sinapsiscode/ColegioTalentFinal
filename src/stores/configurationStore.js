import { create } from 'zustand'

const useConfigurationStore = create((set, get) => ({
  // Estado
  config: {
    general: {
      nombreColegio: 'Talentos College',
      anoEscolar: '2024',
      director: 'Dra. María González',
      telefono: '+51 999 123 456',
      direccion: 'Av. Educación 123, Lima, Perú'
    },
    usuarios: {
      politicaContrasenas: true,
      longitudMinima: 8,
      autenticacion2FA: false,
      sesionesSimultaneas: true,
      intentosMaximos: 3,
      tiempoBloqueo: 15,
      duracionSesion: 8
    },
    notificaciones: {
      enAplicacion: true,
      correoElectronico: true,
      sms: false,
      nuevosComunicados: true,
      mensajesTutores: true,
      recordatoriosPago: true,
      alertasAsistencia: true
    },
    pagos: {
      diaVencimiento: 5,
      diasGracia: 5,
      interesMora: 2,
      recordatoriosDias: 3
    },
    asistencia: {
      horaEntrada: '08:00',
      horaSalida: '15:00',
      toleranciaTardanza: 15,
      diasHabiles: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
    },
    sistema: {
      version: '1.0.0',
      modo: 'desarrollo',
      ultimaActualizacion: new Date().toISOString()
    }
  },
  loading: false,
  error: null,

  // Cargar configuración (simulado)
  loadConfiguration: async () => {
    set({ loading: true, error: null })
    try {
      // En producción, aquí se haría la llamada al API
      // await api.get('/configuration')
      
      // Por ahora devolvemos la config por defecto
      setTimeout(() => {
        set({ loading: false })
      }, 500)
    } catch (error) {
      set({ error: 'Error al cargar configuración', loading: false })
    }
  },

  // Actualizar configuración
  updateConfiguration: async (section, newConfig) => {
    set({ loading: true, error: null })
    try {
      // En producción:
      // await api.put(`/configuration/${section}`, newConfig)
      
      // Por ahora actualizamos localmente
      const currentConfig = get().config
      set({
        config: {
          ...currentConfig,
          [section]: {
            ...currentConfig[section],
            ...newConfig
          }
        },
        loading: false
      })
      
      return { success: true }
    } catch (error) {
      set({ error: 'Error al actualizar configuración', loading: false })
      return { success: false, error: error.message }
    }
  },

  // Obtener valor específico
  getConfigValue: (section, key) => {
    const { config } = get()
    return config[section]?.[key]
  },

  // Resetear a valores por defecto
  resetToDefaults: () => {
    // En producción esto debería venir del backend
    set({
      config: get().config // Por ahora mantiene los mismos valores
    })
  },

  // Validar configuración
  validateConfiguration: (section, config) => {
    switch (section) {
      case 'usuarios':
        if (config.longitudMinima < 6) {
          return { valid: false, error: 'La longitud mínima debe ser al menos 6' }
        }
        if (config.intentosMaximos < 1) {
          return { valid: false, error: 'Debe haber al menos 1 intento' }
        }
        break
        
      case 'pagos':
        if (config.diasGracia < 0) {
          return { valid: false, error: 'Los días de gracia no pueden ser negativos' }
        }
        if (config.interesMora < 0) {
          return { valid: false, error: 'El interés no puede ser negativo' }
        }
        break
        
      case 'asistencia':
        if (config.toleranciaTardanza < 0) {
          return { valid: false, error: 'La tolerancia no puede ser negativa' }
        }
        break
    }
    
    return { valid: true }
  }
}))

export default useConfigurationStore