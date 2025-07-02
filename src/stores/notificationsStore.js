import { create } from 'zustand'

const useNotificationsStore = create((set, get) => ({
  notificaciones: [],
  notificacionesNoLeidas: 0,
  simulacionActiva: false,
  intervaloSimulacion: null,
  
  agregarNotificacion: (notificacion) => {
    const nuevaNotificacion = {
      id: Date.now(),
      ...notificacion,
      fecha: new Date(),
      leida: false
    }
    
    set(state => ({
      notificaciones: [nuevaNotificacion, ...state.notificaciones],
      notificacionesNoLeidas: state.notificacionesNoLeidas + 1
    }))
  },
  
  marcarComoLeida: (id) => {
    set(state => ({
      notificaciones: state.notificaciones.map(notif => 
        notif.id === id ? { ...notif, leida: true } : notif
      ),
      notificacionesNoLeidas: Math.max(0, state.notificacionesNoLeidas - 1)
    }))
  },
  
  marcarTodasComoLeidas: () => {
    set(state => ({
      notificaciones: state.notificaciones.map(notif => ({ ...notif, leida: true })),
      notificacionesNoLeidas: 0
    }))
  },
  
  eliminarNotificacion: (id) => {
    set(state => {
      const notificacion = state.notificaciones.find(n => n.id === id)
      const esNoLeida = notificacion && !notificacion.leida
      
      return {
        notificaciones: state.notificaciones.filter(notif => notif.id !== id),
        notificacionesNoLeidas: esNoLeida 
          ? Math.max(0, state.notificacionesNoLeidas - 1)
          : state.notificacionesNoLeidas
      }
    })
  },
  
  limpiarNotificaciones: () => {
    set({
      notificaciones: [],
      notificacionesNoLeidas: 0
    })
  },
  
  iniciarSimulacion: () => {
    const { simulacionActiva } = get()
    
    if (simulacionActiva) return
    
    set({ simulacionActiva: true })
    
    const notificacionesEjemplo = [
      {
        tipo: 'asistencia',
        titulo: 'Registro de Entrada',
        mensaje: 'Ana Rodríguez ha llegado al colegio',
        icono: '🏫'
      },
      {
        tipo: 'mensaje',
        titulo: 'Nuevo Mensaje',
        mensaje: 'Tienes un nuevo mensaje de la profesora María',
        icono: '💬'
      },
      {
        tipo: 'comunicado',
        titulo: 'Comunicado Importante',
        mensaje: 'Nueva circular informativa disponible',
        icono: '📢'
      },
      {
        tipo: 'asistencia',
        titulo: 'Registro de Salida',
        mensaje: 'Luis Rodríguez ha salido del colegio',
        icono: '🚪'
      },
      {
        tipo: 'academico',
        titulo: 'Calificación Registrada',
        mensaje: 'Nueva nota disponible en Matemáticas',
        icono: '📊'
      },
      {
        tipo: 'evento',
        titulo: 'Evento Próximo',
        mensaje: 'Reunión de padres programada para mañana',
        icono: '📅'
      },
      {
        tipo: 'tarea',
        titulo: 'Tarea Pendiente',
        mensaje: 'Recordatorio: Entrega de proyecto de ciencias',
        icono: '📝'
      },
      {
        tipo: 'salud',
        titulo: 'Recordatorio Médico',
        mensaje: 'Vacunación programada para esta semana',
        icono: '💊'
      }
    ]
    
    // Agregar notificación inicial
    const notificacionInicial = {
      tipo: 'sistema',
      titulo: 'Sistema Iniciado',
      mensaje: 'Notificaciones automáticas activadas',
      icono: '🔔'
    }
    get().agregarNotificacion(notificacionInicial)
    
    const intervalo = setInterval(() => {
      const { simulacionActiva } = get()
      
      if (!simulacionActiva) {
        clearInterval(intervalo)
        return
      }
      
      // Probability check to not overwhelm with notifications
      if (Math.random() > 0.7) {
        const notificacionAleatoria = notificacionesEjemplo[
          Math.floor(Math.random() * notificacionesEjemplo.length)
        ]
        
        get().agregarNotificacion(notificacionAleatoria)
        
        // Show toast notification if available
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification(notificacionAleatoria.mensaje, 'info')
        }
      }
    }, 30000) // Cada 30 segundos
    
    // Store interval reference for cleanup
    set({ intervaloSimulacion: intervalo })
    
    return intervalo
  },
  
  detenerSimulacion: () => {
    const { intervaloSimulacion } = get()
    
    if (intervaloSimulacion) {
      clearInterval(intervaloSimulacion)
    }
    
    set({ 
      simulacionActiva: false,
      intervaloSimulacion: null
    })
  },
  
  obtenerNotificacionesPorTipo: (tipo) => {
    const { notificaciones } = get()
    return notificaciones.filter(notif => notif.tipo === tipo)
  }
}))

export default useNotificationsStore