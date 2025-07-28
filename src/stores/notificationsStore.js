import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 🔔 Store de Notificaciones Intranet Mejorado
 * Sistema completo de notificaciones internas para Talentos College
 */
const useNotificationsStore = create(
  persist(
    (set, get) => ({
      // Estado principal (mantener compatibilidad)
      notificaciones: [],
      notificacionesNoLeidas: 0,
      simulacionActiva: false,
      intervaloSimulacion: null,
      loading: false,
      
      // ===== NUEVAS CARACTERÍSTICAS =====
      
      // Tipos de notificaciones expandidos
      types: {
        ACADEMIC: 'academico',      // Nueva calificación, notas
        ATTENDANCE: 'asistencia',   // Entradas, salidas, tardanzas
        ANNOUNCEMENT: 'comunicado', // Comunicados importantes
        MESSAGE: 'mensaje',         // Mensajes privados
        SYSTEM: 'sistema',         // Alertas del sistema
        PAYMENT: 'pago',           // Recordatorios de pago
        USER: 'usuario',           // Cambios de usuarios
        EVENT: 'evento',           // Eventos escolares
        TASK: 'tarea',             // Tareas y proyectos
        HEALTH: 'salud'            // Recordatorios médicos
      },
      
      // Prioridades
      priorities: {
        LOW: 'baja',       // 🔵 Informativo
        MEDIUM: 'media',   // 🟡 Importante  
        HIGH: 'alta',      // 🟠 Muy importante
        URGENT: 'urgente'  // 🔴 Crítico
      },
      
      // Estados
      status: {
        UNREAD: 'no_leida',
        READ: 'leida',
        ARCHIVED: 'archivada'
      },
      
      // Preferencias de usuario
      preferences: {
        academico: true,
        asistencia: true,    
        comunicado: true,
        mensaje: true,
        sistema: true,
        pago: true,
        usuario: true,
        evento: true,
        tarea: true,
        salud: true,
        soundEnabled: true,
        toastEnabled: true,
        desktopEnabled: false
      },
  
      // ===== ACCIONES MEJORADAS (compatible hacia atrás) =====
      
      /**
       * Agregar nueva notificación (versión mejorada)
       */
      agregarNotificacion: (notificacion) => {
        const nuevaNotificacion = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          fecha: new Date(), // Mantener compatibilidad
          leida: false,
          status: 'no_leida',
          priority: notificacion.priority || 'media',
          userId: notificacion.userId || null,
          actionUrl: notificacion.actionUrl || null,
          ...notificacion
        }

        // Verificar preferencias antes de agregar
        const preferences = get().preferences
        if (!preferences[notificacion.tipo || 'sistema']) {
          return // No agregar si el tipo está deshabilitado
        }
        
        set(state => {
          const updatedNotifications = [nuevaNotificacion, ...state.notificaciones.slice(0, 99)] // Limitar a 100
          const unreadCount = updatedNotifications.filter(n => !n.leida).length
          
          return {
            notificaciones: updatedNotifications,
            notificacionesNoLeidas: unreadCount
          }
        })

        // Mostrar toast si está habilitado
        if (preferences.toastEnabled) {
          get().mostrarToast(nuevaNotificacion)
        }
        
        // Reproducir sonido si está habilitado
        if (preferences.soundEnabled) {
          get().reproducirSonido(notificacion.tipo)
        }
        
        return nuevaNotificacion
      },
      
      // Reproducir sonido de notificación
      reproducirSonido: (tipo) => {
        try {
          // Usar la función de sonido Web Audio API
          if (window.playNotificationSound) {
            window.playNotificationSound(tipo)
          } else {
            // Fallback: intentar reproducir archivo de audio si existe
            const audio = new Audio()
            audio.src = '/sounds/notification.mp3'
            audio.volume = 0.3
            audio.play().catch(err => console.log('No se pudo reproducir sonido:', err))
          }
        } catch (error) {
          console.log('Error con audio:', error)
        }
      },
      
      // Mostrar toast de notificación
      mostrarToast: (notificacion) => {
        const toast = document.createElement('div')
        toast.className = `
          fixed top-4 right-4 bg-white border-l-4 rounded-lg shadow-lg p-4 z-50
          transform translate-x-full transition-transform duration-300 max-w-sm
          ${notificacion.priority === 'urgente' ? 'border-red-500' : 
            notificacion.priority === 'alta' ? 'border-orange-500' :
            notificacion.priority === 'media' ? 'border-blue-500' : 'border-gray-500'}
        `
        
        toast.innerHTML = `
          <div class="flex items-start">
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 mb-1">${notificacion.titulo}</h4>
              <p class="text-sm text-gray-600">${notificacion.mensaje}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    class="ml-2 text-gray-400 hover:text-gray-600 text-xl">
              ×
            </button>
          </div>
        `
        
        document.body.appendChild(toast)
        
        // Animar entrada
        requestAnimationFrame(() => {
          toast.classList.remove('translate-x-full')
        })
        
        // Auto remover después de 5 segundos
        setTimeout(() => {
          toast.classList.add('translate-x-full')
          setTimeout(() => toast.remove(), 300)
        }, 5000)
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
      },

      // ===== NUEVAS FUNCIONALIDADES AVANZADAS =====

      /**
       * Archivar notificación
       */
      archivarNotificacion: (id) => {
        set(state => {
          const updatedNotifications = state.notificaciones.map(notification =>
            notification.id === id
              ? { ...notification, status: 'archivada', leida: true }
              : notification
          )
          
          const unreadCount = updatedNotifications.filter(n => !n.leida).length
          
          return {
            notificaciones: updatedNotifications,
            notificacionesNoLeidas: unreadCount
          }
        })
      },

      /**
       * Obtener notificaciones no leídas
       */
      obtenerNoLeidas: () => {
        return get().notificaciones.filter(n => !n.leida)
      },

      /**
       * Obtener notificaciones por prioridad
       */
      obtenerPorPrioridad: (priority) => {
        return get().notificaciones.filter(n => n.priority === priority)
      },

      /**
       * Obtener notificaciones recientes (últimas 24 horas)
       */
      obtenerRecientes: () => {
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
        
        return get().notificaciones.filter(
          n => new Date(n.timestamp || n.fecha) > twentyFourHoursAgo
        )
      },

      /**
       * Obtener estadísticas de notificaciones
       */
      obtenerEstadisticas: () => {
        const notifications = get().notificaciones
        const total = notifications.length
        const unread = notifications.filter(n => !n.leida).length
        const byType = {}
        const byPriority = {}

        notifications.forEach(n => {
          byType[n.tipo] = (byType[n.tipo] || 0) + 1
          byPriority[n.priority] = (byPriority[n.priority] || 0) + 1
        })

        return {
          total,
          unread,
          read: total - unread,
          porTipo: byType,
          porPrioridad: byPriority
        }
      },

      /**
       * Actualizar preferencias
       */
      actualizarPreferencias: (nuevasPreferencias) => {
        set(state => ({
          preferences: { ...state.preferences, ...nuevasPreferencias }
        }))
      },

      /**
       * Verificar si un tipo está habilitado
       */
      esTipoHabilitado: (tipo) => {
        return get().preferences[tipo] || false
      },

      /**
       * Mostrar toast notification
       */
      showToast: (notification) => {
        const preferences = get().preferences
        
        // Solo mostrar si está habilitado
        if (!preferences.toastEnabled || !preferences[notification.tipo]) return
        
        // Crear evento personalizado para el toast
        const toastEvent = new CustomEvent('showNotificationToast', {
          detail: {
            title: notification.titulo,
            message: notification.mensaje,
            type: notification.tipo,
            priority: notification.priority,
            icon: notification.icono,
            duration: notification.priority === 'urgente' ? 8000 : 4000
          }
        })
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(toastEvent)
        }
      },

      /**
       * Crear notificaciones automáticas del sistema
       */
      crearNotificacionSistema: (evento, userId, data = {}) => {
        const plantillas = {
          // Para padres
          'nueva_calificacion': {
            tipo: 'academico',
            priority: 'media',
            titulo: '📊 Nueva Calificación',
            mensaje: `${data.studentName} tiene una nueva calificación en ${data.subject}: ${data.grade}`,
            icono: '📊',
            actionUrl: `/parent/grades`
          },
          
          'alerta_asistencia': {
            tipo: 'asistencia',
            priority: 'alta',
            titulo: '⚠️ Alerta de Asistencia',
            mensaje: `${data.studentName} ${data.status === 'tarde' ? 'llegó tarde' : 'faltó'} hoy`,
            icono: '⚠️',
            actionUrl: `/parent/attendance`
          },
          
          'nuevo_comunicado': {
            tipo: 'comunicado',
            priority: 'media',
            titulo: '📢 Nuevo Comunicado',
            mensaje: `${data.title}`,
            icono: '📢',
            actionUrl: `/comunicados/${data.id}`
          },

          'nuevo_mensaje': {
            tipo: 'mensaje',
            priority: 'media',
            titulo: '💬 Nuevo Mensaje',
            mensaje: `Mensaje de ${data.senderName}`,
            icono: '💬',
            actionUrl: `/messages/${data.senderId}`
          },

          // Para tutores
          'estudiante_ausente': {
            tipo: 'asistencia',
            priority: 'media',
            titulo: '👥 Reporte de Asistencia',
            mensaje: `${data.absentCount} estudiantes ausentes en ${data.className}`,
            icono: '👥',
            actionUrl: `/tutor/attendance`
          },

          'recordatorio_notas': {
            tipo: 'academico',
            priority: 'alta',
            titulo: '📝 Recordatorio',
            mensaje: `Pendiente: Enviar calificaciones del bimestre`,
            icono: '📝',
            actionUrl: `/tutor/grades`
          },

          // Para admin
          'backup_sistema': {
            tipo: 'sistema',
            priority: 'baja',
            titulo: '💾 Backup Completado',
            mensaje: `Backup automático realizado exitosamente`,
            icono: '💾',
            actionUrl: `/admin/system`
          },

          'usuario_registrado': {
            tipo: 'usuario',
            priority: 'media',
            titulo: '👤 Nuevo Usuario',
            mensaje: `${data.userName} se registró como ${data.role}`,
            icono: '👤',
            actionUrl: `/admin/users`
          }
        }

        const plantilla = plantillas[evento]
        if (plantilla) {
          get().agregarNotificacion({
            ...plantilla,
            userId,
            evento,
            data
          })
        }
      },

      /**
       * Generar notificaciones de prueba mejoradas
       */
      generarNotificacionesPrueba: (userId, role) => {
        const notificacionesPorRol = {
          padre: [
            {
              tipo: 'academico',
              priority: 'media',
              titulo: '📊 Nueva Calificación',
              mensaje: 'María tiene una nueva calificación en Matemáticas: 18',
              icono: '📊',
              actionUrl: '/parent/grades'
            },
            {
              tipo: 'asistencia',
              priority: 'alta',
              titulo: '⚠️ Tardanza Registrada',
              mensaje: 'José llegó tarde hoy a las 8:15 AM',
              icono: '⚠️',
              actionUrl: '/parent/attendance'
            },
            {
              tipo: 'comunicado',
              priority: 'media',
              titulo: '📢 Reunión de Padres',
              mensaje: 'Reunión programada para el viernes a las 3 PM',
              icono: '📢',
              actionUrl: '/comunicados'
            },
            {
              tipo: 'mensaje',
              priority: 'media',
              titulo: '💬 Mensaje de Profesora',
              mensaje: 'La profesora Ana envió un mensaje sobre el proyecto',
              icono: '💬',
              actionUrl: '/messages'
            }
          ],

          tutor: [
            {
              tipo: 'asistencia',
              priority: 'media',
              titulo: '👥 Asistencia Registrada',
              mensaje: '25 de 28 estudiantes presentes hoy en 5to A',
              icono: '👥',
              actionUrl: '/tutor/attendance'
            },
            {
              tipo: 'academico',
              priority: 'alta',
              titulo: '📝 Calificaciones Pendientes',
              mensaje: 'Recordatorio: Enviar notas del segundo bimestre',
              icono: '📝',
              actionUrl: '/tutor/grades'
            },
            {
              tipo: 'mensaje',
              priority: 'media',
              titulo: '💬 Pregunta de Padre',
              mensaje: 'El Sr. García pregunta sobre la tarea de matemáticas',
              icono: '💬',
              actionUrl: '/tutor/messages'
            }
          ],

          admin: [
            {
              tipo: 'sistema',
              priority: 'baja',
              titulo: '📊 Reporte Diario',
              mensaje: 'Reporte de asistencia diario: 87% asistencia general',
              icono: '📊',
              actionUrl: '/admin/reports'
            },
            {
              tipo: 'usuario',
              priority: 'media',
              titulo: '👤 Nuevos Usuarios',
              mensaje: '3 nuevos padres registrados en el sistema',
              icono: '👤',
              actionUrl: '/admin/users'
            },
            {
              tipo: 'sistema',
              priority: 'urgente',
              titulo: '🚨 Alerta de Seguridad',
              mensaje: 'Intento de acceso no autorizado detectado',
              icono: '🚨',
              actionUrl: '/admin/security'
            }
          ]
        }

        const notificaciones = notificacionesPorRol[role] || notificacionesPorRol.padre
        
        notificaciones.forEach((notificacion, index) => {
          setTimeout(() => {
            get().agregarNotificacion({
              ...notificacion,
              userId
            })
          }, index * 2000) // Espaciar cada 2 segundos
        })
      },

      /**
       * Limpiar notificaciones antiguas (más de 30 días)
       */
      limpiarNotificacionesAntiguas: () => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        set(state => {
          const updatedNotifications = state.notificaciones.filter(
            notification => new Date(notification.timestamp || notification.fecha) > thirtyDaysAgo
          )
          const unreadCount = updatedNotifications.filter(n => !n.leida).length
          
          return {
            notificaciones: updatedNotifications,
            notificacionesNoLeidas: unreadCount
          }
        })
      },

      /**
       * Inicializar store (nuevo)
       */
      inicializar: (userId, role) => {
        // Limpiar notificaciones antiguas
        get().limpiarNotificacionesAntiguas()
        
        // Configurar preferencias por defecto según rol
        const preferenciasRol = {
          padre: {
            academico: true,
            asistencia: true,
            comunicado: true,
            mensaje: true,
            sistema: false,
            pago: true,
            usuario: false,
            evento: true,
            tarea: true,
            salud: true
          },
          tutor: {
            academico: true,
            asistencia: true,
            comunicado: true,
            mensaje: true,
            sistema: true,
            pago: false,
            usuario: false,
            evento: true,
            tarea: true,
            salud: false
          },
          admin: {
            academico: true,
            asistencia: true,
            comunicado: true,
            mensaje: true,
            sistema: true,
            pago: true,
            usuario: true,
            evento: true,
            tarea: false,
            salud: false
          }
        }

        const currentPreferences = get().preferences
        if (!currentPreferences.academico && !currentPreferences.asistencia) {
          get().actualizarPreferencias({
            ...preferenciasRol[role] || preferenciasRol.padre,
            soundEnabled: true,
            toastEnabled: true,
            desktopEnabled: false
          })
        }

        console.log(`🔔 Notificaciones inicializadas para ${role}:`, userId)
      },

      // ===== NUEVAS FUNCIONES AVANZADAS =====

      // Notificación automática cuando hijo llega/sale
      notificarAsistenciaEnTiempoReal: (estudianteId, tipo, ubicacion) => {
        const { createNotification, sendNotificationToRole } = get()
        
        // Obtener datos del estudiante
        const estudiante = window.DatabaseQueries?.getStudentById(estudianteId)
        if (!estudiante) return
        
        // Obtener padres del estudiante
        const padres = window.DatabaseQueries?.getParentsByStudentId(estudianteId) || []
        
        padres.forEach(padre => {
          const hora = new Date().toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
          
          const notificacion = createNotification({
            tipo: 'asistencia',
            prioridad: 'media',
            titulo: tipo === 'entrada' ? '✅ Llegada Confirmada' : '🚪 Salida Registrada',
            mensaje: `${estudiante.nombre} ${estudiante.apellidos} ${tipo === 'entrada' ? 'llegó al colegio' : 'salió del colegio'} a las ${hora}`,
            datos: {
              estudianteId,
              tipo,
              ubicacion,
              hora: new Date(),
              fotocheck: estudiante.foto || null
            }
          })
          
          // Enviar a cada padre específico
          get().addNotificationForUser(padre.id, notificacion)
        })
        
        // También notificar al admin
        sendNotificationToRole('admin', {
          tipo: 'asistencia',
          prioridad: 'baja',
          titulo: `📊 Registro de ${tipo}`,
          mensaje: `${estudiante.nombre} - ${tipo} registrada`,
          datos: { estudianteId, tipo, ubicacion }
        })
      },

      // Notificación cuando llega un nuevo mensaje
      notificarNuevoMensaje: (conversacionId, remitente, preview) => {
        const { createNotification } = get()
        const { usuario } = useAuthStore.getState()
        
        // No notificar si es el mismo usuario quien envía
        if (remitente.id === usuario.id) return
        
        const notificacion = createNotification({
          tipo: 'mensaje',
          prioridad: 'media',
          titulo: `💬 Nuevo mensaje de ${remitente.nombre}`,
          mensaje: preview.length > 50 ? preview.substring(0, 50) + '...' : preview,
          datos: {
            conversacionId,
            remitenteId: remitente.id,
            remitente: remitente.nombre
          },
          acciones: [
            {
              tipo: 'leer',
              texto: 'Leer mensaje',
              url: `/messages/${conversacionId}`
            },
            {
              tipo: 'responder',
              texto: 'Responder',
              action: 'openChat'
            }
          ]
        })
        
        get().addNotificationForUser(usuario.id, notificacion)
        
        // Mostrar notificación del navegador si está habilitada
        if (get().preferences.desktop) {
          get().showDesktopNotification(notificacion)
        }
      },

      // Notificación de nuevas calificaciones
      notificarNuevaCalificacion: (estudianteId, materia, nota, bimestre) => {
        const { createNotification } = get()
        
        const estudiante = window.DatabaseQueries?.getStudentById(estudianteId)
        const padres = window.DatabaseQueries?.getParentsByStudentId(estudianteId) || []
        
        padres.forEach(padre => {
          const emoji = nota >= 18 ? '🌟' : nota >= 15 ? '📈' : nota >= 11 ? '📊' : '⚠️'
          
          const notificacion = createNotification({
            tipo: 'academico',
            prioridad: nota < 11 ? 'alta' : 'media',
            titulo: `${emoji} Nueva Calificación - ${materia}`,
            mensaje: `${estudiante.nombre} obtuvo ${nota} en ${materia} (${bimestre})`,
            datos: {
              estudianteId,
              materia,
              nota,
              bimestre,
              tipo: 'calificacion'
            },
            acciones: [
              {
                tipo: 'ver',
                texto: 'Ver detalle',
                url: `/parent/grades/${estudianteId}`
              }
            ]
          })
          
          get().addNotificationForUser(padre.id, notificacion)
        })
      },

      // Notificaciones push del navegador
      requestNotificationPermission: async () => {
        if (!('Notification' in window)) {
          console.log('Este navegador no soporta notificaciones')
          return false
        }
        
        try {
          const permission = await Notification.requestPermission()
          
          if (permission === 'granted') {
            get().actualizarPreferencias({ desktopEnabled: true })
            return true
          } else {
            get().actualizarPreferencias({ desktopEnabled: false })
            return false
          }
        } catch (error) {
          console.log('Error solicitando permisos de notificación:', error)
          return false
        }
      },

      // Mostrar notificación del navegador
      showDesktopNotification: (notificacion) => {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
          return
        }
        
        const notification = new Notification(notificacion.titulo, {
          body: notificacion.mensaje,
          icon: '/logo-talentos.jpeg',
          badge: '/logo-talentos.jpeg',
          tag: notificacion.id,
          requireInteraction: notificacion.prioridad === 'urgente',
          silent: notificacion.prioridad === 'baja'
        })
        
        notification.onclick = () => {
          window.focus()
          if (notificacion.acciones && notificacion.acciones[0]) {
            const accion = notificacion.acciones[0]
            if (accion.url) {
              window.location.href = accion.url
            }
          }
          notification.close()
        }
        
        // Auto cerrar después de 5 segundos para notificaciones no urgentes
        if (notificacion.prioridad !== 'urgente') {
          setTimeout(() => notification.close(), 5000)
        }
      },
      
      // Simular envío de notificación por email
      simularNotificacionEmail: async (notificacion, destinatario) => {
        console.log('📧 Simulando envío de email...')
        
        // Simular delay de envío
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const emailData = {
          to: destinatario.email || 'usuario@email.com',
          subject: notificacion.titulo,
          body: notificacion.mensaje,
          priority: notificacion.priority,
          timestamp: new Date().toISOString()
        }
        
        console.log('✅ Email enviado:', emailData)
        
        // Mostrar confirmación
        const { showSuccess } = await import('../utils/sweetAlert')
        showSuccess(
          'Email enviado',
          `Se ha enviado un email a ${emailData.to}`
        )
        
        return { success: true, data: emailData }
      },
      
      // Simular envío de SMS
      simularNotificacionSMS: async (notificacion, telefono) => {
        console.log('📱 Simulando envío de SMS...')
        
        // Solo para notificaciones urgentes o de alta prioridad
        if (!['alta', 'urgente'].includes(notificacion.priority)) {
          return { success: false, error: 'SMS solo para notificaciones urgentes' }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const smsData = {
          to: telefono || '+51 999 888 777',
          message: `TALENTOS COLLEGE: ${notificacion.titulo.substring(0, 100)}`,
          timestamp: new Date().toISOString()
        }
        
        console.log('✅ SMS enviado:', smsData)
        
        const { showSuccess } = await import('../utils/sweetAlert')
        showSuccess(
          'SMS enviado',
          `Mensaje enviado a ${smsData.to}`
        )
        
        return { success: true, data: smsData }
      },

      // Agregar notificación para usuario específico
      addNotificationForUser: (userId, notificacion) => {
        const { usuario } = useAuthStore.getState()
        
        // Solo agregar si es para el usuario actual
        if (userId === usuario.id) {
          const { notificaciones } = get()
          set({
            notificaciones: [notificacion, ...notificaciones],
            notificacionesNoLeidas: get().notificacionesNoLeidas + 1
          })
          
          // Mostrar toast si está habilitado
          if (get().preferences.toast) {
            get().showToastNotification(notificacion)
          }
        }
      },

      // Mostrar notificación toast
      showToastNotification: (notificacion) => {
        // Crear elemento toast
        const toast = document.createElement('div')
        toast.className = `
          fixed top-4 right-4 bg-white border-l-4 rounded-lg shadow-lg p-4 z-50
          transform translate-x-full transition-transform duration-300 max-w-sm
          ${notificacion.prioridad === 'urgente' ? 'border-red-500' : 
            notificacion.prioridad === 'alta' ? 'border-orange-500' :
            notificacion.prioridad === 'media' ? 'border-blue-500' : 'border-gray-500'}
        `
        
        toast.innerHTML = `
          <div class="flex items-start">
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 mb-1">${notificacion.titulo}</h4>
              <p class="text-sm text-gray-600">${notificacion.mensaje}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    class="ml-2 text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>
        `
        
        document.body.appendChild(toast)
        
        // Animar entrada
        setTimeout(() => {
          toast.classList.remove('translate-x-full')
        }, 100)
        
        // Auto remover después de 5 segundos
        setTimeout(() => {
          toast.classList.add('translate-x-full')
          setTimeout(() => toast.remove(), 300)
        }, 5000)
      },

      // Simulación de notificaciones en tiempo real
      startRealTimeSimulation: () => {
        const { simulacionActiva } = get()
        if (simulacionActiva) return
        
        set({ simulacionActiva: true })
        
        const interval = setInterval(() => {
          const { usuario } = useAuthStore.getState()
          if (!usuario) return
          
          // Simular diferentes tipos de notificaciones
          const simulaciones = [
            () => get().notificarAsistenciaEnTiempoReal(1, 'entrada', 'Puerta Principal'),
            () => get().notificarNuevoMensaje(1, { id: 2, nombre: 'María García' }, 'Hola, ¿cómo está Ana?'),
            () => get().notificarNuevaCalificacion(1, 'Matemáticas', 18, 'III Bimestre')
          ]
          
          // Ejecutar simulación aleatoria cada 30-60 segundos
          const randomSim = simulaciones[Math.floor(Math.random() * simulaciones.length)]
          randomSim()
          
        }, 30000 + Math.random() * 30000) // 30-60 segundos
        
        set({ intervaloSimulacion: interval })
      },

      // Detener simulación
      stopRealTimeSimulation: () => {
        const { intervaloSimulacion } = get()
        if (intervaloSimulacion) {
          clearInterval(intervaloSimulacion)
          set({ 
            simulacionActiva: false,
            intervaloSimulacion: null
          })
        }
      }
    }),
    {
      name: 'talentos-notifications',
      partialize: (state) => ({
        notificaciones: state.notificaciones.slice(0, 100), // Limitar persistencia
        notificacionesNoLeidas: state.notificacionesNoLeidas,
        preferences: state.preferences
      })
    }
  )
)

export default useNotificationsStore