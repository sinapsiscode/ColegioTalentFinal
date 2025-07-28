import { create } from 'zustand'
import useAuthStore from './authStore'
import { DatabaseQueries } from '../data/databaseSchema'
import useNotificationsStore from './notificationsStore'

const useMessagesStore = create((set, get) => ({
  conversaciones: [],
  mensajesNoLeidos: 0,
  conversacionActual: null,
  mensajesActuales: [],
  cargando: false,
  enviando: false,
  
  // Cargar todas las conversaciones del usuario
  cargarConversaciones: async () => {
    set({ cargando: true })
    
    try {
      const authStore = useAuthStore.getState()
      const { usuario } = authStore
      
      if (!usuario) {
        set({ conversaciones: [], cargando: false })
        return
      }
      
      // Obtener conversaciones del usuario actual
      const conversaciones = DatabaseQueries.getConversationsByUserId(usuario.id)
      
      // Enriquecer con datos de participantes
      const conversacionesEnriquecidas = conversaciones.map(conv => {
        const otroParticipanteId = conv.participants.find(id => id !== usuario.id)
        const otroParticipante = DatabaseQueries.getUserById(otroParticipanteId)
        
        return {
          ...conv,
          otroParticipante,
          nombreParticipante: otroParticipante ? 
            `${otroParticipante.nombre} ${otroParticipante.apellidos}` : 
            'Usuario desconocido'
        }
      })
      
      // Calcular mensajes no leídos totales
      const mensajesNoLeidos = DatabaseQueries.getUnreadMessagesCount(usuario.id)
      
      set({ 
        conversaciones: conversacionesEnriquecidas,
        mensajesNoLeidos,
        cargando: false 
      })
    } catch (error) {
      console.error('Error cargando conversaciones:', error)
      set({ cargando: false })
    }
  },
  
  // Cargar mensajes de una conversación
  cargarMensajes: async (conversacionId) => {
    set({ cargando: true })
    
    try {
      const mensajes = DatabaseQueries.getMessagesByConversationId(conversacionId)
      const authStore = useAuthStore.getState()
      const { usuario } = authStore
      
      // Marcar mensajes como leídos
      DatabaseQueries.markMessagesAsRead(conversacionId, usuario.id)
      
      // Actualizar mensajes no leídos
      await get().cargarConversaciones()
      
      set({ 
        mensajesActuales: mensajes,
        conversacionActual: conversacionId,
        cargando: false 
      })
    } catch (error) {
      console.error('Error cargando mensajes:', error)
      set({ cargando: false })
    }
  },
  
  // Enviar nuevo mensaje
  enviarMensaje: async (conversacionId, contenido, recipientId) => {
    set({ enviando: true })
    
    try {
      const authStore = useAuthStore.getState()
      const { usuario } = authStore
      
      if (!usuario) {
        throw new Error('Usuario no autenticado')
      }
      
      // Si no existe conversación, crearla
      let convId = conversacionId
      if (!convId) {
        // Verificar si ya existe conversación entre estos usuarios
        let conversacion = DatabaseQueries.getConversationBetweenUsers(usuario.id, recipientId)
        
        if (!conversacion) {
          // Crear nueva conversación
          conversacion = DatabaseQueries.createConversation(usuario.id, recipientId)
        }
        
        convId = conversacion.id
      }
      
      // Enviar mensaje
      const mensaje = DatabaseQueries.sendMessage({
        conversationId: convId,
        senderId: usuario.id,
        recipientId: recipientId,
        content: contenido
      })
      
      // Notificar al destinatario
      const notificationsStore = useNotificationsStore.getState()
      const remitente = DatabaseQueries.getUserById(usuario.id)
      
      // Crear notificación para el destinatario
      notificationsStore.agregarNotificacion({
        tipo: 'mensaje',
        titulo: `💬 Nuevo mensaje de ${remitente.nombre} ${remitente.apellidos}`,
        mensaje: contenido.length > 50 ? contenido.substring(0, 50) + '...' : contenido,
        priority: 'media',
        userId: recipientId,
        actionUrl: '/messages'
      })
      
      // Recargar mensajes y conversaciones
      await get().cargarMensajes(convId)
      await get().cargarConversaciones()
      
      set({ enviando: false })
      
      return { success: true, mensaje }
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      set({ enviando: false })
      return { success: false, error: error.message }
    }
  },
  
  // Buscar conversaciones
  buscarConversaciones: (termino) => {
    const authStore = useAuthStore.getState()
    const { usuario } = authStore
    
    if (!usuario || !termino) {
      return get().conversaciones
    }
    
    return DatabaseQueries.searchConversations(usuario.id, termino)
  },
  
  // Iniciar nueva conversación
  iniciarConversacion: async (receptorId) => {
    try {
      const authStore = useAuthStore.getState()
      const { usuario } = authStore
      
      if (!usuario) {
        throw new Error('Usuario no autenticado')
      }
      
      // Verificar si ya existe conversación
      let conversacion = DatabaseQueries.getConversationBetweenUsers(usuario.id, receptorId)
      
      if (!conversacion) {
        // Crear nueva conversación
        conversacion = DatabaseQueries.createConversation(usuario.id, receptorId)
      }
      
      // Cargar conversaciones actualizadas
      await get().cargarConversaciones()
      
      return { success: true, conversacionId: conversacion.id }
    } catch (error) {
      console.error('Error iniciando conversación:', error)
      return { success: false, error: error.message }
    }
  },
  
  // Obtener usuarios disponibles para mensajear
  obtenerUsuariosDisponibles: () => {
    const authStore = useAuthStore.getState()
    const { usuario, rol } = authStore
    
    if (!usuario) return []
    
    let usuariosDisponibles = []
    
    if (rol === 'padre') {
      // Los padres pueden mensajear a tutores y administración
      usuariosDisponibles = [
        ...DatabaseQueries.getUsersByRole('tutor'),
        ...DatabaseQueries.getUsersByRole('admin')
      ]
    } else if (rol === 'tutor') {
      // Los tutores pueden mensajear a padres y administración
      const estudiantes = DatabaseQueries.getStudentsByTeacherId(usuario.id)
      const padresIds = new Set()
      
      // Obtener padres de los estudiantes asignados
      estudiantes.forEach(estudiante => {
        const relaciones = DatabaseQueries.getParentsByStudentId(estudiante.id)
        relaciones.forEach(rel => padresIds.add(rel.parent_user_id))
      })
      
      const padres = Array.from(padresIds).map(id => DatabaseQueries.getUserById(id)).filter(Boolean)
      usuariosDisponibles = [
        ...padres,
        ...DatabaseQueries.getUsersByRole('admin')
      ]
    } else if (rol === 'admin') {
      // Admin puede mensajear a todos
      usuariosDisponibles = DatabaseQueries.getAllUsers().filter(u => u.id !== usuario.id)
    }
    
    // Filtrar conversaciones existentes para mostrar con quién ya has hablado
    const conversacionesExistentes = get().conversaciones
    const idsEnConversaciones = new Set(
      conversacionesExistentes.map(conv => 
        conv.participants.find(id => id !== usuario.id)
      )
    )
    
    return {
      conConversacion: usuariosDisponibles.filter(u => idsEnConversaciones.has(u.id)),
      sinConversacion: usuariosDisponibles.filter(u => !idsEnConversaciones.has(u.id))
    }
  },
  
  // Limpiar estado
  limpiarMensajes: () => {
    set({
      conversaciones: [],
      mensajesNoLeidos: 0,
      conversacionActual: null,
      mensajesActuales: [],
      cargando: false,
      enviando: false
    })
  }
}))

export default useMessagesStore