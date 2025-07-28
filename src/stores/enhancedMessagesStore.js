import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import useAuthStore from './authStore'
import useNotificationsStore from './notificationsStore'

const useEnhancedMessagesStore = create(
  persist(
    (set, get) => ({
      conversaciones: [],
      mensajes: {},
      mensajesNoLeidos: 0,
      conversacionesArchivadas: [],
      estadosTiempo: {}, // { conversacionId: { escribiendo: boolean, ultimaActividad: Date } }
      busquedaReciente: [],
      configuracion: {
        notificacionesSonoras: true,
        notificacionesDesktop: true,
        autoArchivar: 30, // días
        confirmacionLectura: true
      },
      cargando: false,
      enviando: false,

      // Inicializar store
      inicializar: () => {
        const { usuario } = useAuthStore.getState()
        if (!usuario) return

        // Cargar conversaciones simuladas
        const conversacionesBase = [
          {
            id: 1,
            otroUsuario: {
              id: usuario.rol === 'padre' ? 101 : 1,
              nombre: usuario.rol === 'padre' ? 'Prof. María García' : 'Carlos Rodríguez',
              rol: usuario.rol === 'padre' ? 'tutor' : 'padre',
              avatar: null
            },
            ultimoMensaje: {
              texto: 'Gracias por la información',
              fecha: new Date(Date.now() - 3600000),
              leido: true
            },
            mensajesNoLeidos: 0,
            archivada: false,
            fechaInicio: new Date(Date.now() - 86400000 * 7),
            bloqueada: false,
            importante: false
          },
          {
            id: 2,
            otroUsuario: {
              id: usuario.rol === 'padre' ? 102 : 2,
              nombre: usuario.rol === 'padre' ? 'Admin. Juan Pérez' : 'Elena Vargas',
              rol: usuario.rol === 'padre' ? 'admin' : 'padre',
              avatar: null
            },
            ultimoMensaje: {
              texto: 'Por favor revise el documento adjunto',
              fecha: new Date(Date.now() - 7200000),
              leido: false
            },
            mensajesNoLeidos: 2,
            archivada: false,
            fechaInicio: new Date(Date.now() - 86400000 * 14),
            bloqueada: false,
            importante: true
          }
        ]

        // Generar mensajes para cada conversación
        const mensajesGenerados = {}
        conversacionesBase.forEach(conv => {
          mensajesGenerados[conv.id] = generarMensajesSimulados(conv, usuario)
        })

        set({
          conversaciones: conversacionesBase,
          mensajes: mensajesGenerados,
          mensajesNoLeidos: conversacionesBase.reduce((total, conv) => total + conv.mensajesNoLeidos, 0)
        })
      },

      // Cargar conversaciones
      cargarConversaciones: async () => {
        set({ cargando: true })
        
        // Simular carga desde API
        setTimeout(() => {
          const { conversaciones } = get()
          if (conversaciones.length === 0) {
            get().inicializar()
          }
          set({ cargando: false })
        }, 500)
      },

      // Cargar mensajes de una conversación
      cargarMensajes: async (conversacionId) => {
        const { mensajes } = get()
        return mensajes[conversacionId] || []
      },

      // Enviar mensaje mejorado
      enviarMensaje: async (conversacionId, mensaje) => {
        set({ enviando: true })
        const { usuario } = useAuthStore.getState()
        
        const nuevoMensaje = {
          id: Date.now(),
          texto: mensaje.texto,
          adjunto: mensaje.adjunto,
          remitente: {
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol
          },
          fecha: new Date(),
          leido: false,
          estado: 'enviando', // enviando, enviado, entregado, leido
          editado: false,
          reaccion: null
        }

        // Agregar mensaje optimistamente
        set(state => ({
          mensajes: {
            ...state.mensajes,
            [conversacionId]: [...(state.mensajes[conversacionId] || []), nuevoMensaje]
          },
          conversaciones: state.conversaciones.map(conv => {
            if (conv.id === conversacionId) {
              return {
                ...conv,
                ultimoMensaje: {
                  texto: nuevoMensaje.texto,
                  fecha: nuevoMensaje.fecha,
                  leido: false
                }
              }
            }
            return conv
          })
        }))

        // Simular envío
        setTimeout(() => {
          // Cambiar estado a enviado
          set(state => ({
            mensajes: {
              ...state.mensajes,
              [conversacionId]: state.mensajes[conversacionId].map(msg =>
                msg.id === nuevoMensaje.id ? { ...msg, estado: 'enviado' } : msg
              )
            },
            enviando: false
          }))

          // Simular entrega
          setTimeout(() => {
            set(state => ({
              mensajes: {
                ...state.mensajes,
                [conversacionId]: state.mensajes[conversacionId].map(msg =>
                  msg.id === nuevoMensaje.id ? { ...msg, estado: 'entregado' } : msg
                )
              }
            }))

            // Notificar al destinatario
            const conversacion = get().conversaciones.find(c => c.id === conversacionId)
            if (conversacion) {
              useNotificationsStore.getState().agregarNotificacion({
                tipo: 'mensaje',
                titulo: `Nuevo mensaje de ${usuario.nombre}`,
                mensaje: mensaje.texto.substring(0, 50) + (mensaje.texto.length > 50 ? '...' : ''),
                destinatarioId: conversacion.otroUsuario.id
              })
            }

            // Simular respuesta automática
            if (Math.random() > 0.5) {
              setTimeout(() => {
                get().recibirMensaje(conversacionId, generarRespuestaAutomatica())
              }, 3000 + Math.random() * 4000)
            }
          }, 1000)
        }, 500)

        return { success: true, mensaje: nuevoMensaje }
      },

      // Recibir mensaje
      recibirMensaje: (conversacionId, texto) => {
        const conversacion = get().conversaciones.find(c => c.id === conversacionId)
        if (!conversacion) return

        const nuevoMensaje = {
          id: Date.now(),
          texto,
          remitente: conversacion.otroUsuario,
          fecha: new Date(),
          leido: false,
          estado: 'entregado'
        }

        set(state => ({
          mensajes: {
            ...state.mensajes,
            [conversacionId]: [...(state.mensajes[conversacionId] || []), nuevoMensaje]
          },
          conversaciones: state.conversaciones.map(conv => {
            if (conv.id === conversacionId) {
              return {
                ...conv,
                ultimoMensaje: {
                  texto: nuevoMensaje.texto,
                  fecha: nuevoMensaje.fecha,
                  leido: false
                },
                mensajesNoLeidos: conv.mensajesNoLeidos + 1
              }
            }
            return conv
          }),
          mensajesNoLeidos: state.mensajesNoLeidos + 1
        }))

        // Reproducir sonido si está habilitado
        const { configuracion } = get()
        if (configuracion.notificacionesSonoras) {
          // new Audio('/notification.mp3').play()
        }
      },

      // Marcar conversación como leída
      marcarComoLeido: (conversacionId) => {
        set(state => {
          const conversacion = state.conversaciones.find(c => c.id === conversacionId)
          const mensajesNoLeidosAntes = conversacion?.mensajesNoLeidos || 0

          return {
            conversaciones: state.conversaciones.map(conv => {
              if (conv.id === conversacionId) {
                return { ...conv, mensajesNoLeidos: 0 }
              }
              return conv
            }),
            mensajes: {
              ...state.mensajes,
              [conversacionId]: (state.mensajes[conversacionId] || []).map(msg => ({
                ...msg,
                leido: true,
                estado: msg.estado === 'entregado' ? 'leido' : msg.estado
              }))
            },
            mensajesNoLeidos: Math.max(0, state.mensajesNoLeidos - mensajesNoLeidosAntes)
          }
        })
      },

      // Marcar mensaje específico como leído
      marcarMensajeComoLeido: (mensajeId) => {
        set(state => {
          const nuevosMensajes = { ...state.mensajes }
          let encontrado = false

          Object.keys(nuevosMensajes).forEach(convId => {
            nuevosMensajes[convId] = nuevosMensajes[convId].map(msg => {
              if (msg.id === mensajeId && !msg.leido) {
                encontrado = true
                return { ...msg, leido: true, estado: 'leido' }
              }
              return msg
            })
          })

          return {
            mensajes: nuevosMensajes,
            mensajesNoLeidos: encontrado ? Math.max(0, state.mensajesNoLeidos - 1) : state.mensajesNoLeidos
          }
        })
      },

      // Archivar conversación
      archivarConversacion: (conversacionId) => {
        set(state => ({
          conversaciones: state.conversaciones.map(conv => {
            if (conv.id === conversacionId) {
              return { ...conv, archivada: true }
            }
            return conv
          }),
          conversacionesArchivadas: [
            ...state.conversacionesArchivadas,
            state.conversaciones.find(c => c.id === conversacionId)
          ]
        }))
      },

      // Desarchivar conversación
      desarchivarConversacion: (conversacionId) => {
        set(state => ({
          conversaciones: state.conversaciones.map(conv => {
            if (conv.id === conversacionId) {
              return { ...conv, archivada: false }
            }
            return conv
          }),
          conversacionesArchivadas: state.conversacionesArchivadas.filter(c => c.id !== conversacionId)
        }))
      },

      // Eliminar conversación
      eliminarConversacion: (conversacionId) => {
        set(state => ({
          conversaciones: state.conversaciones.filter(conv => conv.id !== conversacionId),
          mensajes: {
            ...state.mensajes,
            [conversacionId]: undefined
          },
          conversacionesArchivadas: state.conversacionesArchivadas.filter(c => c.id !== conversacionId)
        }))
      },

      // Buscar mensajes
      buscarMensajes: (termino) => {
        if (!termino.trim()) return []
        
        const { mensajes } = get()
        const resultados = []
        const terminoLower = termino.toLowerCase()

        Object.entries(mensajes).forEach(([conversacionId, mensajesConv]) => {
          mensajesConv.forEach(mensaje => {
            if (mensaje.texto.toLowerCase().includes(terminoLower)) {
              resultados.push({
                ...mensaje,
                conversacionId: parseInt(conversacionId)
              })
            }
          })
        })

        // Actualizar búsquedas recientes
        set(state => ({
          busquedaReciente: [termino, ...state.busquedaReciente.filter(t => t !== termino)].slice(0, 5)
        }))

        return resultados.sort((a, b) => b.fecha - a.fecha)
      },

      // Marcar conversación como importante
      marcarComoImportante: (conversacionId) => {
        set(state => ({
          conversaciones: state.conversaciones.map(conv => {
            if (conv.id === conversacionId) {
              return { ...conv, importante: !conv.importante }
            }
            return conv
          })
        }))
      },

      // Actualizar estado de escritura
      actualizarEstadoEscritura: (conversacionId, escribiendo) => {
        set(state => ({
          estadosTiempo: {
            ...state.estadosTiempo,
            [conversacionId]: {
              escribiendo,
              ultimaActividad: new Date()
            }
          }
        }))

        // Limpiar estado después de 3 segundos
        if (escribiendo) {
          setTimeout(() => {
            set(state => ({
              estadosTiempo: {
                ...state.estadosTiempo,
                [conversacionId]: {
                  escribiendo: false,
                  ultimaActividad: state.estadosTiempo[conversacionId]?.ultimaActividad
                }
              }
            }))
          }, 3000)
        }
      },

      // Actualizar configuración
      actualizarConfiguracion: (nuevaConfig) => {
        set(state => ({
          configuracion: {
            ...state.configuracion,
            ...nuevaConfig
          }
        }))
      },

      // Obtener estadísticas
      obtenerEstadisticas: () => {
        const { conversaciones, mensajes } = get()
        
        let totalMensajes = 0
        let mensajesEnviados = 0
        let mensajesRecibidos = 0
        let archivosCompartidos = 0
        
        const { usuario } = useAuthStore.getState()

        Object.values(mensajes).forEach(mensajesConv => {
          mensajesConv.forEach(msg => {
            totalMensajes++
            if (msg.remitente.id === usuario.id) {
              mensajesEnviados++
            } else {
              mensajesRecibidos++
            }
            if (msg.adjunto) {
              archivosCompartidos++
            }
          })
        })

        return {
          totalConversaciones: conversaciones.length,
          conversacionesActivas: conversaciones.filter(c => !c.archivada).length,
          conversacionesArchivadas: conversaciones.filter(c => c.archivada).length,
          totalMensajes,
          mensajesEnviados,
          mensajesRecibidos,
          mensajesNoLeidos: get().mensajesNoLeidos,
          archivosCompartidos
        }
      }
    }),
    {
      name: 'enhanced-messages-storage',
      partialize: (state) => ({
        conversacionesArchivadas: state.conversacionesArchivadas,
        configuracion: state.configuracion,
        busquedaReciente: state.busquedaReciente
      })
    }
  )
)

// Funciones auxiliares
function generarMensajesSimulados(conversacion, usuario) {
  const mensajes = []
  const ahora = Date.now()
  const cantidadMensajes = 5 + Math.floor(Math.random() * 10)

  for (let i = 0; i < cantidadMensajes; i++) {
    const esPropio = Math.random() > 0.5
    mensajes.push({
      id: i + 1,
      texto: obtenerMensajeAleatorio(conversacion.otroUsuario.rol),
      remitente: esPropio ? {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
      } : conversacion.otroUsuario,
      fecha: new Date(ahora - (cantidadMensajes - i) * 3600000),
      leido: true,
      estado: 'leido',
      adjunto: Math.random() > 0.9 ? {
        name: 'documento.pdf',
        size: 1024 * 512,
        type: 'application/pdf'
      } : null
    })
  }

  return mensajes
}

function obtenerMensajeAleatorio(rol) {
  const mensajes = {
    tutor: [
      'Buenos días, le informo sobre el progreso de su hijo/a',
      'Ha tenido un excelente desempeño esta semana',
      'Por favor revisar la tarea enviada',
      'Mañana tenemos evaluación de matemáticas',
      'Su participación en clase ha mejorado notablemente'
    ],
    padre: [
      'Gracias por la información',
      'Mi hijo/a estará ausente mañana por cita médica',
      '¿Podría enviarme el material de la clase?',
      'Estoy de acuerdo con su observación',
      '¿Cuándo podríamos tener una reunión?'
    ],
    admin: [
      'Recordatorio: Reunión de padres el próximo viernes',
      'Se ha actualizado el calendario escolar',
      'Por favor completar la encuesta de satisfacción',
      'Información importante sobre el evento escolar',
      'Nuevo protocolo de seguridad implementado'
    ]
  }

  const mensajesRol = mensajes[rol] || mensajes.admin
  return mensajesRol[Math.floor(Math.random() * mensajesRol.length)]
}

function generarRespuestaAutomatica() {
  const respuestas = [
    'Gracias por su mensaje, le responderé a la brevedad',
    'He recibido su mensaje',
    'Entendido, tomaré nota',
    'De acuerdo, gracias por informarme',
    'Perfecto, seguimos en contacto'
  ]
  return respuestas[Math.floor(Math.random() * respuestas.length)]
}

export default useEnhancedMessagesStore