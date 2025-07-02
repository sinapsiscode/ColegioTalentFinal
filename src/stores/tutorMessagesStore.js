import { create } from 'zustand'

const useTutorMessagesStore = create((set, get) => ({
  conversaciones: [],
  mensajesNoLeidos: 0,
  cargando: false,
  
  cargarConversaciones: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const conversaciones = [
        {
          id: 1,
          participantes: ['María García', 'Carlos Rodríguez'],
          tipo: 'tutor-padre',
          asunto: 'Progreso de Ana Sofía',
          estudiante: 'Ana Sofía Rodríguez',
          ultimoMensaje: {
            texto: 'Profesora, ¿podrían enviarme el cronograma de evaluaciones del próximo bimestre?',
            fecha: new Date('2024-01-22T14:30:00'),
            remitente: 'Carlos Rodríguez',
            leido: false
          },
          mensajes: [
            {
              id: 1,
              texto: 'Buenos días Sr. Rodríguez, espero se encuentre bien.',
              fecha: new Date('2024-01-22T08:00:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 2,
              texto: 'Buenos días profesora María, muy bien gracias. Quería consultar sobre el progreso de Ana Sofía.',
              fecha: new Date('2024-01-22T08:15:00'),
              remitente: 'Carlos Rodríguez',
              leido: true
            },
            {
              id: 3,
              texto: 'Ana Sofía ha mostrado un excelente rendimiento este bimestre. Su promedio actual es de 18.5 y su participación en clase es destacada.',
              fecha: new Date('2024-01-22T08:30:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 4,
              texto: 'Me alegra mucho escuchar eso. En casa también hemos notado su dedicación con las tareas.',
              fecha: new Date('2024-01-22T08:45:00'),
              remitente: 'Carlos Rodríguez',
              leido: true
            },
            {
              id: 5,
              texto: 'Exactamente, es una estudiante muy responsable. Le recomiendo mantener el mismo ritmo de estudio.',
              fecha: new Date('2024-01-22T09:00:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 6,
              texto: 'Profesora, ¿podrían enviarme el cronograma de evaluaciones del próximo bimestre?',
              fecha: new Date('2024-01-22T14:30:00'),
              remitente: 'Carlos Rodríguez',
              leido: false
            }
          ]
        },
        {
          id: 2,
          participantes: ['María García', 'Administración'],
          tipo: 'tutor-admin',
          asunto: 'Reunión de coordinación académica',
          estudiante: null,
          ultimoMensaje: {
            texto: 'Perfecto, estaré presente en la reunión del viernes a las 3:00 PM.',
            fecha: new Date('2024-01-21T16:45:00'),
            remitente: 'María García',
            leido: true
          },
          mensajes: [
            {
              id: 1,
              texto: 'Estimada profesora María, le recordamos que mañana viernes tenemos reunión de coordinación académica a las 3:00 PM.',
              fecha: new Date('2024-01-21T15:00:00'),
              remitente: 'Administración',
              leido: true
            },
            {
              id: 2,
              texto: '¿Qué temas específicos se van a tratar en la reunión?',
              fecha: new Date('2024-01-21T15:30:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 3,
              texto: 'Se tratarán los siguientes puntos: 1) Evaluación del II Bimestre, 2) Planificación del III Bimestre, 3) Actividades extracurriculares.',
              fecha: new Date('2024-01-21T16:00:00'),
              remitente: 'Administración',
              leido: true
            },
            {
              id: 4,
              texto: 'Perfecto, estaré presente en la reunión del viernes a las 3:00 PM.',
              fecha: new Date('2024-01-21T16:45:00'),
              remitente: 'María García',
              leido: true
            }
          ]
        },
        {
          id: 3,
          participantes: ['María García', 'Patricia Mendoza'],
          tipo: 'tutor-padre',
          asunto: 'Comportamiento de Diego Vargas',
          estudiante: 'Diego Alexander Vargas',
          ultimoMensaje: {
            texto: 'Muchas gracias por la información profesora, estaremos más atentos en casa.',
            fecha: new Date('2024-01-20T18:20:00'),
            remitente: 'Patricia Mendoza',
            leido: true
          },
          mensajes: [
            {
              id: 1,
              texto: 'Buenas tardes Sra. Mendoza, espero se encuentre bien. Necesito hablar con usted sobre Diego.',
              fecha: new Date('2024-01-20T17:00:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 2,
              texto: 'Buenas tardes profesora, ¿ha pasado algo con Diego? Me preocupa su mensaje.',
              fecha: new Date('2024-01-20T17:15:00'),
              remitente: 'Patricia Mendoza',
              leido: true
            },
            {
              id: 3,
              texto: 'No se preocupe, no es nada grave. He notado que Diego ha estado un poco distraído en clase y su rendimiento ha bajado ligeramente.',
              fecha: new Date('2024-01-20T17:30:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 4,
              texto: 'Su promedio actual es de 14.8, lo cual no está mal, pero sé que puede dar más. ¿Ha notado algún cambio en casa?',
              fecha: new Date('2024-01-20T17:45:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 5,
              texto: 'Ahora que lo menciona, últimamente ha estado jugando más videojuegos y menos tiempo dedicado a las tareas.',
              fecha: new Date('2024-01-20T18:00:00'),
              remitente: 'Patricia Mendoza',
              leido: true
            },
            {
              id: 6,
              texto: 'Eso explicaría la situación. Le recomiendo establecer horarios específicos para estudio y limitar el tiempo de videojuegos.',
              fecha: new Date('2024-01-20T18:10:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 7,
              texto: 'Muchas gracias por la información profesora, estaremos más atentos en casa.',
              fecha: new Date('2024-01-20T18:20:00'),
              remitente: 'Patricia Mendoza',
              leido: true
            }
          ]
        },
        {
          id: 4,
          participantes: ['María García', 'Roberto Silva'],
          tipo: 'tutor-colega',
          asunto: 'Coordinación interdisciplinaria',
          estudiante: null,
          ultimoMensaje: {
            texto: 'Excelente idea María, coordinemos para la próxima semana.',
            fecha: new Date('2024-01-19T11:30:00'),
            remitente: 'Roberto Silva',
            leido: true
          },
          mensajes: [
            {
              id: 1,
              texto: 'Hola Roberto, ¿cómo estás? Quería coordinar contigo sobre el proyecto interdisciplinario.',
              fecha: new Date('2024-01-19T10:00:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 2,
              texto: 'Hola María, muy bien gracias. ¿Te refieres al proyecto de Matemáticas y Educación Física?',
              fecha: new Date('2024-01-19T10:15:00'),
              remitente: 'Roberto Silva',
              leido: true
            },
            {
              id: 3,
              texto: 'Exacto, pensaba que podríamos trabajar estadísticas deportivas con los estudiantes. Sería muy práctico.',
              fecha: new Date('2024-01-19T10:30:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 4,
              texto: 'Me parece una idea fantástica. Podríamos usar datos de los deportes que practican los chicos.',
              fecha: new Date('2024-01-19T11:00:00'),
              remitente: 'Roberto Silva',
              leido: true
            },
            {
              id: 5,
              texto: 'Perfecto, podríamos hacer gráficos de rendimiento, promedios de puntuación, etc.',
              fecha: new Date('2024-01-19T11:15:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 6,
              texto: 'Excelente idea María, coordinemos para la próxima semana.',
              fecha: new Date('2024-01-19T11:30:00'),
              remitente: 'Roberto Silva',
              leido: true
            }
          ]
        },
        {
          id: 5,
          participantes: ['María García', 'Ana Torres'],
          tipo: 'tutor-padre',
          asunto: 'Felicitaciones por Isabella',
          estudiante: 'Isabella María Santos',
          ultimoMensaje: {
            texto: 'Muchísimas gracias profesora, Isabella está muy motivada con sus clases.',
            fecha: new Date('2024-01-18T20:15:00'),
            remitente: 'Ana Torres',
            leido: true
          },
          mensajes: [
            {
              id: 1,
              texto: 'Buenas tardes Sra. Torres, espero se encuentre muy bien.',
              fecha: new Date('2024-01-18T19:00:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 2,
              texto: 'Quería felicitarla por el excelente rendimiento de Isabella. Ha obtenido la nota más alta en el último examen.',
              fecha: new Date('2024-01-18T19:05:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 3,
              texto: '¡Qué alegría profesora! Isabella llegó muy contenta a casa comentando sobre el examen.',
              fecha: new Date('2024-01-18T19:30:00'),
              remitente: 'Ana Torres',
              leido: true
            },
            {
              id: 4,
              texto: 'Su promedio actual es de 19.1, realmente excepcional. Es una estudiante muy dedicada.',
              fecha: new Date('2024-01-18T19:45:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 5,
              texto: 'Estamos muy orgullosos de ella. ¿Hay algo específico que podamos hacer para mantener este nivel?',
              fecha: new Date('2024-01-18T20:00:00'),
              remitente: 'Ana Torres',
              leido: true
            },
            {
              id: 6,
              texto: 'Solo continúen apoyándola como lo han hecho. Isabella tiene una actitud ejemplar hacia el aprendizaje.',
              fecha: new Date('2024-01-18T20:10:00'),
              remitente: 'María García',
              leido: true
            },
            {
              id: 7,
              texto: 'Muchísimas gracias profesora, Isabella está muy motivada con sus clases.',
              fecha: new Date('2024-01-18T20:15:00'),
              remitente: 'Ana Torres',
              leido: true
            }
          ]
        }
      ]
      
      const noLeidos = conversaciones.reduce((total, conv) => {
        const mensajesNoLeidos = conv.mensajes.filter(msg => !msg.leido && msg.remitente !== 'María García').length
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
      const mensajesNoLeidos = conv.mensajes.filter(msg => !msg.leido && msg.remitente !== 'María García').length
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
        const nuevosMensajes = conv.mensajes.map(msg => ({ 
          ...msg, 
          leido: msg.remitente === 'María García' ? msg.leido : true 
        }))
        return { ...conv, mensajes: nuevosMensajes }
      }
      return conv
    })
    
    const noLeidos = nuevasConversaciones.reduce((total, conv) => {
      const mensajesNoLeidos = conv.mensajes.filter(msg => !msg.leido && msg.remitente !== 'María García').length
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
      conv.asunto.toLowerCase().includes(terminoLower) ||
      (conv.estudiante && conv.estudiante.toLowerCase().includes(terminoLower)) ||
      conv.mensajes.some(msg => msg.texto.toLowerCase().includes(terminoLower))
    )
  },
  
  simularRespuestaAutomatica: (conversacionId) => {
    const respuestasAutomaticas = [
      'Gracias por su mensaje profesora, revisaremos el tema con atención.',
      'Entendido, tomaremos las medidas necesarias.',
      'Perfecto, estaremos pendientes.',
      'Muchas gracias por mantenernos informados.',
      'De acuerdo, seguiremos sus recomendaciones.',
      'Excelente, coordinemos para la próxima semana.',
      'Muy bien, estaremos en contacto.'
    ]
    
    setTimeout(() => {
      const respuesta = respuestasAutomaticas[Math.floor(Math.random() * respuestasAutomaticas.length)]
      const { conversaciones } = get()
      const conversacion = conversaciones.find(c => c.id === conversacionId)
      
      if (conversacion) {
        const otherParticipant = conversacion.participantes.find(p => p !== 'María García')
        get().enviarMensaje(conversacionId, {
          texto: respuesta,
          remitente: otherParticipant
        })
      }
    }, 3000 + Math.random() * 5000) // Entre 3-8 segundos
  },

  // Obtener estadísticas específicas del tutor
  obtenerEstadisticas: () => {
    const { conversaciones } = get()
    
    const totalConversaciones = conversaciones.length
    const conversacionesPadres = conversaciones.filter(conv => conv.tipo === 'tutor-padre').length
    const conversacionesAdmin = conversaciones.filter(conv => conv.tipo === 'tutor-admin').length
    const conversacionesColega = conversaciones.filter(conv => conv.tipo === 'tutor-colega').length
    
    const mensajesNoLeidos = conversaciones.reduce((total, conv) => {
      return total + conv.mensajes.filter(msg => !msg.leido && msg.remitente !== 'María García').length
    }, 0)
    
    const conversacionesActivas = conversaciones.filter(conv => {
      const ultimoMensaje = new Date(conv.ultimoMensaje.fecha)
      const ahora = new Date()
      const diferenciaDias = (ahora - ultimoMensaje) / (1000 * 60 * 60 * 24)
      return diferenciaDias <= 3 // Conversaciones con actividad en los últimos 3 días
    }).length

    return {
      total: totalConversaciones,
      noLeidos: mensajesNoLeidos,
      padres: conversacionesPadres,
      administracion: conversacionesAdmin,
      colegas: conversacionesColega,
      activas: conversacionesActivas
    }
  },

  // Crear nueva conversación
  crearNuevaConversacion: (participante, tipo, asunto, estudiante = null) => {
    const { conversaciones } = get()
    
    const nuevaConversacion = {
      id: Date.now(),
      participantes: ['María García', participante],
      tipo,
      asunto,
      estudiante,
      ultimoMensaje: {
        texto: 'Conversación iniciada',
        fecha: new Date(),
        remitente: 'María García',
        leido: true
      },
      mensajes: []
    }
    
    set({ conversaciones: [nuevaConversacion, ...conversaciones] })
    return nuevaConversacion.id
  }
}))

export default useTutorMessagesStore