import { create } from 'zustand'

const useMessagesStore = create((set, get) => ({
  conversaciones: [],
  mensajesNoLeidos: 0,
  cargando: false,
  
  cargarConversaciones: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const conversaciones = [
        {
          id: 1,
          participantes: ['Carlos Rodríguez', 'María García'],
          tipo: 'padre-tutor',
          ultimoMensaje: {
            texto: 'Buenos días, ¿podemos hablar sobre el progreso de Ana?',
            fecha: new Date('2024-01-20T10:30:00'),
            remitente: 'Carlos Rodríguez',
            leido: false
          },
          mensajes: [
            {
              id: 1,
              texto: 'Buenos días profesora María',
              fecha: new Date('2024-01-20T09:00:00'),
              remitente: 'Carlos Rodríguez',
              leido: true
            },
            {
              id: 2,
              texto: 'Buenos días Sr. Rodríguez, ¿en qué puedo ayudarle?',
              fecha: new Date('2024-01-20T09:05:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 3,
              texto: 'Quería consultar sobre las tareas de Ana, ha estado un poco atrasada',
              fecha: new Date('2024-01-20T09:10:00'),
              remitente: 'Carlos Rodríguez',
              leido: true
            },
            {
              id: 4,
              texto: 'He notado eso también. Ana es muy inteligente pero creo que necesita más apoyo en casa con las matemáticas',
              fecha: new Date('2024-01-20T09:15:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 5,
              texto: 'Buenos días, ¿podemos hablar sobre el progreso de Ana?',
              fecha: new Date('2024-01-20T10:30:00'),
              remitente: 'Carlos Rodríguez',
              leido: false
            }
          ]
        },
        {
          id: 2,
          participantes: ['Administración', 'Carlos Rodríguez'],
          tipo: 'admin-padre',
          ultimoMensaje: {
            texto: 'Recordatorio: Reunión de padres este viernes a las 7:00 PM',
            fecha: new Date('2024-01-19T15:00:00'),
            remitente: 'Administración',
            leido: true
          },
          mensajes: [
            {
              id: 1,
              texto: 'Estimado padre de familia, le recordamos que mañana viernes tenemos reunión a las 7:00 PM',
              fecha: new Date('2024-01-19T14:00:00'),
              remitente: 'Administración',
              leido: true
            },
            {
              id: 2,
              texto: 'Perfecto, estaré presente. ¿Qué temas se van a tratar?',
              fecha: new Date('2024-01-19T14:30:00'),
              remitente: 'Carlos Rodríguez',
              leido: true
            },
            {
              id: 3,
              texto: 'Recordatorio: Reunión de padres este viernes a las 7:00 PM',
              fecha: new Date('2024-01-19T15:00:00'),
              remitente: 'Administración',
              leido: true
            }
          ]
        },
        {
          id: 3,
          participantes: ['José López', 'Carlos Rodríguez'],
          tipo: 'padre-tutor',
          ultimoMensaje: {
            texto: 'Gracias por su atención y seguimiento',
            fecha: new Date('2024-01-18T16:20:00'),
            remitente: 'Carlos Rodríguez',
            leido: true
          },
          mensajes: [
            {
              id: 1,
              texto: 'Buenas tardes Sr. Rodríguez, quería comentarle sobre el progreso de Luis en Comunicación',
              fecha: new Date('2024-01-18T15:00:00'),
              remitente: 'José López',
              leido: true
            },
            {
              id: 2,
              texto: 'Buenas tardes profesor, me alegra saber de sus avances. ¿Cómo está su rendimiento?',
              fecha: new Date('2024-01-18T15:15:00'),
              remitente: 'Carlos Rodríguez',
              leido: true
            },
            {
              id: 3,
              texto: 'Luis ha mostrado una mejora significativa en comprensión lectora. Sus ensayos han mejorado mucho.',
              fecha: new Date('2024-01-18T15:30:00'),
              remitente: 'José López',
              leido: true
            },
            {
              id: 4,
              texto: 'Excelente noticia! En casa también hemos notado que lee con más frecuencia.',
              fecha: new Date('2024-01-18T16:00:00'),
              remitente: 'Carlos Rodríguez',
              leido: true
            },
            {
              id: 5,
              texto: 'Gracias por su atención y seguimiento',
              fecha: new Date('2024-01-18T16:20:00'),
              remitente: 'Carlos Rodríguez',
              leido: true
            }
          ]
        }
      ]
      
      const noLeidos = conversaciones.reduce((total, conv) => {
        const mensajesNoLeidos = conv.mensajes.filter(msg => !msg.leido).length
        return total + mensajesNoLeidos
      }, 0)
      
      set({ 
        conversaciones, 
        mensajesNoLeidos: noLeidos,
        cargando: false 
      })
    }, 800)
  },
  
  enviarMensaje: (conversacionId, mensaje) => {
    const { conversaciones } = get()
    const nuevasConversaciones = conversaciones.map(conv => {
      if (conv.id === conversacionId) {
        const nuevoMensaje = {
          id: Date.now(),
          texto: mensaje.texto,
          fecha: new Date(),
          remitente: mensaje.remitente,
          leido: true
        }
        
        return {
          ...conv,
          mensajes: [...conv.mensajes, nuevoMensaje],
          ultimoMensaje: nuevoMensaje
        }
      }
      return conv
    })
    
    set({ conversaciones: nuevasConversaciones })
  },
  
  marcarComoLeido: (conversacionId, mensajeId) => {
    const { conversaciones } = get()
    const nuevasConversaciones = conversaciones.map(conv => {
      if (conv.id === conversacionId) {
        const nuevosMensajes = conv.mensajes.map(msg => {
          if (msg.id === mensajeId) {
            return { ...msg, leido: true }
          }
          return msg
        })
        
        return { ...conv, mensajes: nuevosMensajes }
      }
      return conv
    })
    
    const noLeidos = nuevasConversaciones.reduce((total, conv) => {
      const mensajesNoLeidos = conv.mensajes.filter(msg => !msg.leido).length
      return total + mensajesNoLeidos
    }, 0)
    
    set({ 
      conversaciones: nuevasConversaciones,
      mensajesNoLeidos: noLeidos
    })
  },
  
  obtenerConversacion: (id) => {
    const { conversaciones } = get()
    return conversaciones.find(conv => conv.id === id)
  },
  
  marcarConversacionComoLeida: (conversacionId) => {
    const { conversaciones } = get()
    const nuevasConversaciones = conversaciones.map(conv => {
      if (conv.id === conversacionId) {
        const nuevosMensajes = conv.mensajes.map(msg => ({ ...msg, leido: true }))
        return { ...conv, mensajes: nuevosMensajes }
      }
      return conv
    })
    
    const noLeidos = nuevasConversaciones.reduce((total, conv) => {
      const mensajesNoLeidos = conv.mensajes.filter(msg => !msg.leido && msg.remitente !== 'Carlos Rodríguez').length
      return total + mensajesNoLeidos
    }, 0)
    
    set({ 
      conversaciones: nuevasConversaciones,
      mensajesNoLeidos: noLeidos
    })
  },
  
  buscarConversaciones: (termino) => {
    const { conversaciones } = get()
    if (!termino.trim()) return conversaciones
    
    const terminoLower = termino.toLowerCase()
    return conversaciones.filter(conv => 
      conv.participantes.some(p => p.toLowerCase().includes(terminoLower)) ||
      conv.mensajes.some(msg => msg.texto.toLowerCase().includes(terminoLower))
    )
  },
  
  simularRespuestaAutomatica: (conversacionId) => {
    const respuestasAutomaticas = [
      'Gracias por su mensaje, le responderé pronto.',
      'Entendido, tomaré nota de sus observaciones.',
      'Perfecto, estaremos en contacto.',
      'De acuerdo, revisaremos el tema con atención.',
      'Gracias por mantenernos informados.'
    ]
    
    setTimeout(() => {
      const respuesta = respuestasAutomaticas[Math.floor(Math.random() * respuestasAutomaticas.length)]
      const { conversaciones } = get()
      const conversacion = conversaciones.find(c => c.id === conversacionId)
      
      if (conversacion) {
        const otherParticipant = conversacion.participantes.find(p => p !== 'Carlos Rodríguez')
        get().enviarMensaje(conversacionId, {
          texto: respuesta,
          remitente: otherParticipant
        })
      }
    }, 2000 + Math.random() * 3000) // Entre 2-5 segundos
  }
}))

export default useMessagesStore