// Debug para sistema de mensajes
import { DatabaseQueries } from '../data/databaseSchema'
import useAuthStore from '../stores/authStore'
import useMessagesStore from '../stores/messagesStore'

export const debugMessages = () => {
  console.log('🔍 DEBUG MENSAJES:')
  
  // Estado del usuario actual
  const authState = useAuthStore.getState()
  console.log('Usuario actual:', authState.usuario)
  
  // Verificar conversaciones
  if (authState.usuario) {
    const conversaciones = DatabaseQueries.getConversationsByUserId(authState.usuario.id)
    console.log('Conversaciones del usuario:', conversaciones)
    
    // Verificar usuarios disponibles
    const messagesState = useMessagesStore.getState()
    const disponibles = messagesState.obtenerUsuariosDisponibles()
    console.log('Usuarios disponibles:', disponibles)
  }
  
  // Verificar datos en DB
  const allUsers = DatabaseQueries.getAllUsers ? DatabaseQueries.getAllUsers() : []
  console.log('Total usuarios en DB:', allUsers.length)
  
  // Contar conversaciones de todos los usuarios
  let totalConversations = 0
  let totalMessages = 0
  
  if (authState.usuario) {
    const userConversations = DatabaseQueries.getConversationsByUserId(authState.usuario.id)
    totalConversations = userConversations.length
    
    // Contar mensajes en las conversaciones del usuario
    userConversations.forEach(conv => {
      const messages = DatabaseQueries.getMessagesByConversationId(conv.id)
      totalMessages += messages.length
    })
  }
  
  console.log('Conversaciones del usuario actual:', totalConversations)
  console.log('Mensajes en conversaciones del usuario:', totalMessages)
  
  return {
    user: authState.usuario,
    conversationsCount: totalConversations,
    messagesCount: totalMessages
  }
}

// Hacer disponible globalmente
window.debugMessages = debugMessages