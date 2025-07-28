import { create } from 'zustand'
import { getDatabase } from '../data/DatabaseManager'

const db = getDatabase()

/**
 * 🔔 Store de Notificaciones con Persistencia en Base de Datos
 * Sistema completo de notificaciones con historial y preferencias
 */
const useNotificationsStoreDB = create((set, get) => ({
  // Estado
  notificaciones: [],
  notificacionesNoLeidas: 0,
  preferencias: {},
  historial: [],
  cargando: false,
  error: null,

  // Tipos de notificaciones
  TIPOS: {
    MENSAJE: 'mensaje',
    ASISTENCIA: 'asistencia',
    COMUNICADO: 'comunicado',
    ACADEMICO: 'academico',
    PAGO: 'pago',
    SISTEMA: 'sistema',
    EVENTO: 'evento',
    SALUD: 'salud'
  },

  // Prioridades
  PRIORIDADES: {
    BAJA: 'baja',
    MEDIA: 'media',
    ALTA: 'alta',
    URGENTE: 'urgente'
  },

  // Inicializar notificaciones para un usuario
  inicializar: async (userId) => {
    set({ cargando: true, error: null })
    
    try {
      // Cargar notificaciones del usuario
      const notificaciones = db.select('notifications', {
        where: { userId },
        orderBy: 'fecha DESC',
        limit: 100
      })

      // Cargar preferencias
      const preferencias = db.select('notification_preferences', {
        where: { userId }
      })

      // Cargar historial reciente
      const historial = db.select('notification_history', {
        where: { userId },
        orderBy: 'fecha DESC',
        limit: 50
      })

      // Contar no leídas
      const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length

      set({
        notificaciones,
        notificacionesNoLeidas,
        preferencias: preferencias[0] || get().getPreferenciasDefault(),
        historial,
        cargando: false
      })

      // Solicitar permisos de notificación si están habilitados
      if (preferencias[0]?.push) {
        get().solicitarPermisosNavegador()
      }

    } catch (error) {
      console.error('Error inicializando notificaciones:', error)
      set({ error: error.message, cargando: false })
    }
  },

  // Obtener preferencias por defecto
  getPreferenciasDefault: () => ({
    mensaje: true,
    asistencia: true,
    comunicado: true,
    academico: true,
    pago: true,
    sistema: false,
    evento: true,
    salud: true,
    email: true,
    push: true,
    app: true,
    sonido: true,
    horarioInicio: '07:00',
    horarioFin: '21:00',
    diasSemana: ['lun', 'mar', 'mie', 'jue', 'vie']
  }),

  // Crear nueva notificación
  crearNotificacion: async (notificacion) => {
    try {
      const userId = notificacion.userId
      const preferencias = get().preferencias

      // Verificar si el tipo está habilitado
      if (!preferencias[notificacion.tipo]) {
        console.log(`Notificación tipo ${notificacion.tipo} deshabilitada para usuario ${userId}`)
        return null
      }

      // Verificar horario
      if (!get().verificarHorario(preferencias)) {
        console.log('Fuera del horario de notificaciones')
        return null
      }

      // Crear notificación
      const nuevaNotificacion = {
        id: db.generateId(),
        userId,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        prioridad: notificacion.prioridad || 'media',
        leida: false,
        fecha: new Date().toISOString(),
        actionUrl: notificacion.actionUrl || null,
        datos: notificacion.datos || {}
      }

      // Insertar en base de datos
      db.insert('notifications', nuevaNotificacion)

      // Actualizar estado local
      set(state => ({
        notificaciones: [nuevaNotificacion, ...state.notificaciones],
        notificacionesNoLeidas: state.notificacionesNoLeidas + 1
      }))

      // Registrar en historial
      get().registrarEnHistorial(nuevaNotificacion.id, userId, 'creada')

      // Enviar notificaciones según preferencias
      if (preferencias.push) {
        get().enviarNotificacionPush(nuevaNotificacion)
      }

      if (preferencias.app) {
        get().mostrarToast(nuevaNotificacion)
      }

      if (preferencias.sonido) {
        get().reproducirSonido(notificacion.tipo)
      }

      // Simular envío de email para notificaciones importantes
      if (preferencias.email && ['alta', 'urgente'].includes(notificacion.prioridad)) {
        get().simularEnvioEmail(nuevaNotificacion)
      }

      return nuevaNotificacion

    } catch (error) {
      console.error('Error creando notificación:', error)
      set({ error: error.message })
      return null
    }
  },

  // Verificar horario de notificaciones
  verificarHorario: (preferencias) => {
    const ahora = new Date()
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes()
    
    const [horaInicio, minInicio] = preferencias.horarioInicio.split(':').map(Number)
    const [horaFin, minFin] = preferencias.horarioFin.split(':').map(Number)
    
    const inicioMinutos = horaInicio * 60 + minInicio
    const finMinutos = horaFin * 60 + minFin
    
    const diasSemana = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']
    const diaActual = diasSemana[ahora.getDay()]
    
    return preferencias.diasSemana.includes(diaActual) && 
           horaActual >= inicioMinutos && 
           horaActual <= finMinutos
  },

  // Marcar notificación como leída
  marcarComoLeida: async (notificationId) => {
    try {
      // Actualizar en base de datos
      db.update('notifications', notificationId, { leida: true })

      // Actualizar estado local
      set(state => ({
        notificaciones: state.notificaciones.map(n =>
          n.id === notificationId ? { ...n, leida: true } : n
        ),
        notificacionesNoLeidas: Math.max(0, state.notificacionesNoLeidas - 1)
      }))

      // Registrar en historial
      const notificacion = get().notificaciones.find(n => n.id === notificationId)
      if (notificacion) {
        get().registrarEnHistorial(notificationId, notificacion.userId, 'leida')
      }

    } catch (error) {
      console.error('Error marcando notificación como leída:', error)
    }
  },

  // Marcar todas como leídas
  marcarTodasComoLeidas: async () => {
    try {
      const notificaciones = get().notificaciones
      const noLeidas = notificaciones.filter(n => !n.leida)

      // Actualizar en base de datos
      for (const notif of noLeidas) {
        db.update('notifications', notif.id, { leida: true })
      }

      // Actualizar estado local
      set(state => ({
        notificaciones: state.notificaciones.map(n => ({ ...n, leida: true })),
        notificacionesNoLeidas: 0
      }))

    } catch (error) {
      console.error('Error marcando todas como leídas:', error)
    }
  },

  // Eliminar notificación
  eliminarNotificacion: async (notificationId) => {
    try {
      // Eliminar de base de datos
      db.delete('notifications', notificationId)

      // Actualizar estado local
      set(state => {
        const notificacion = state.notificaciones.find(n => n.id === notificationId)
        const eraNoLeida = notificacion && !notificacion.leida

        return {
          notificaciones: state.notificaciones.filter(n => n.id !== notificationId),
          notificacionesNoLeidas: eraNoLeida 
            ? Math.max(0, state.notificacionesNoLeidas - 1)
            : state.notificacionesNoLeidas
        }
      })

    } catch (error) {
      console.error('Error eliminando notificación:', error)
    }
  },

  // Actualizar preferencias
  actualizarPreferencias: async (userId, nuevasPreferencias) => {
    try {
      const preferenciasActuales = get().preferencias
      const preferenciasActualizadas = { ...preferenciasActuales, ...nuevasPreferencias }

      // Verificar si existen preferencias
      const existentes = db.select('notification_preferences', { where: { userId } })

      if (existentes.length > 0) {
        // Actualizar
        db.update('notification_preferences', existentes[0].id, preferenciasActualizadas)
      } else {
        // Crear nuevas
        db.insert('notification_preferences', {
          id: db.generateId(),
          userId,
          ...preferenciasActualizadas
        })
      }

      set({ preferencias: preferenciasActualizadas })

      // Solicitar permisos si se activaron las push
      if (nuevasPreferencias.push && !preferenciasActuales.push) {
        get().solicitarPermisosNavegador()
      }

    } catch (error) {
      console.error('Error actualizando preferencias:', error)
    }
  },

  // Registrar en historial
  registrarEnHistorial: (notificationId, userId, accion, metodo = 'app') => {
    try {
      const registro = {
        id: db.generateId(),
        notificationId,
        userId,
        accion,
        metodo,
        fecha: new Date().toISOString(),
        estado: 'exitoso'
      }

      db.insert('notification_history', registro)

      // Actualizar historial local
      set(state => ({
        historial: [registro, ...state.historial].slice(0, 50)
      }))

    } catch (error) {
      console.error('Error registrando en historial:', error)
    }
  },

  // Obtener notificaciones por tipo
  obtenerPorTipo: (tipo) => {
    return get().notificaciones.filter(n => n.tipo === tipo)
  },

  // Obtener notificaciones por prioridad
  obtenerPorPrioridad: (prioridad) => {
    return get().notificaciones.filter(n => n.prioridad === prioridad)
  },

  // Obtener estadísticas
  obtenerEstadisticas: () => {
    const notificaciones = get().notificaciones
    const historial = get().historial

    const estadisticas = {
      total: notificaciones.length,
      noLeidas: notificaciones.filter(n => !n.leida).length,
      hoy: notificaciones.filter(n => {
        const fecha = new Date(n.fecha)
        const hoy = new Date()
        return fecha.toDateString() === hoy.toDateString()
      }).length,
      porTipo: {},
      porPrioridad: {},
      tasaLectura: 0
    }

    // Contar por tipo
    Object.values(get().TIPOS).forEach(tipo => {
      estadisticas.porTipo[tipo] = notificaciones.filter(n => n.tipo === tipo).length
    })

    // Contar por prioridad
    Object.values(get().PRIORIDADES).forEach(prioridad => {
      estadisticas.porPrioridad[prioridad] = notificaciones.filter(n => n.prioridad === prioridad).length
    })

    // Calcular tasa de lectura
    if (estadisticas.total > 0) {
      estadisticas.tasaLectura = Math.round(((estadisticas.total - estadisticas.noLeidas) / estadisticas.total) * 100)
    }

    return estadisticas
  },

  // Limpiar notificaciones antiguas
  limpiarAntiguas: async (diasAntiguedad = 30) => {
    try {
      const fechaLimite = new Date()
      fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad)

      const notificacionesAntiguas = get().notificaciones.filter(n => 
        new Date(n.fecha) < fechaLimite
      )

      // Eliminar de base de datos
      for (const notif of notificacionesAntiguas) {
        db.delete('notifications', notif.id)
      }

      // Actualizar estado local
      set(state => ({
        notificaciones: state.notificaciones.filter(n => 
          new Date(n.fecha) >= fechaLimite
        )
      }))

      return notificacionesAntiguas.length

    } catch (error) {
      console.error('Error limpiando notificaciones antiguas:', error)
      return 0
    }
  },

  // Funciones de notificación del navegador
  solicitarPermisosNavegador: async () => {
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Error solicitando permisos:', error)
      return false
    }
  },

  enviarNotificacionPush: (notificacion) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    const notification = new Notification(notificacion.titulo, {
      body: notificacion.mensaje,
      icon: '/logo-talentos.jpeg',
      badge: '/logo-talentos.jpeg',
      tag: notificacion.id,
      requireInteraction: notificacion.prioridad === 'urgente',
      silent: notificacion.prioridad === 'baja',
      data: notificacion.datos
    })

    notification.onclick = () => {
      window.focus()
      if (notificacion.actionUrl) {
        window.location.href = notificacion.actionUrl
      }
      notification.close()
    }

    // Auto cerrar después de 5 segundos (excepto urgentes)
    if (notificacion.prioridad !== 'urgente') {
      setTimeout(() => notification.close(), 5000)
    }
  },

  // Mostrar toast
  mostrarToast: (notificacion) => {
    const event = new CustomEvent('mostrarNotificacion', {
      detail: notificacion
    })
    window.dispatchEvent(event)
  },

  // Reproducir sonido
  reproducirSonido: (tipo) => {
    try {
      if (window.playNotificationSound) {
        window.playNotificationSound(tipo)
      }
    } catch (error) {
      console.log('Error reproduciendo sonido:', error)
    }
  },

  // Simular envío de email
  simularEnvioEmail: async (notificacion) => {
    console.log('📧 Simulando envío de email:', {
      para: 'usuario@email.com',
      asunto: notificacion.titulo,
      contenido: notificacion.mensaje
    })
    
    get().registrarEnHistorial(notificacion.id, notificacion.userId, 'email_enviado', 'email')
  }
}))

export default useNotificationsStoreDB