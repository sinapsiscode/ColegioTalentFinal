// Test para verificar el sistema de mensajes
import { DatabaseQueries } from '../data/databaseSchema'
import useMessagesStore from '../stores/messagesStore'
import useAuthStore from '../stores/authStore'

export const testMessages = () => {
  console.log('🧪 INICIANDO TEST DE MENSAJES')
  
  // 1. Verificar usuario actual
  const authState = useAuthStore.getState()
  console.log('Usuario actual:', authState.usuario)
  
  if (!authState.usuario) {
    console.error('❌ No hay usuario autenticado')
    return
  }
  
  // 2. Verificar funciones de DatabaseQueries
  console.log('\n📋 VERIFICANDO FUNCIONES DE DATABASE:')
  const funcionesRequeridas = [
    'getUserById',
    'getUsersByRole',
    'getConversationsByUserId',
    'getMessagesByConversationId',
    'createMessage',
    'createConversation',
    'getConversationBetweenUsers',
    'markMessagesAsRead',
    'getUnreadMessagesCount',
    'searchConversations'
  ]
  
  funcionesRequeridas.forEach(func => {
    if (typeof DatabaseQueries[func] === 'function') {
      console.log(`✅ ${func} existe`)
    } else {
      console.error(`❌ ${func} NO existe`)
    }
  })
  
  // 3. Test de obtener usuarios disponibles
  console.log('\n👥 USUARIOS DISPONIBLES:')
  const messagesState = useMessagesStore.getState()
  const disponibles = messagesState.obtenerUsuariosDisponibles()
  console.log('Con conversación:', disponibles.conConversacion)
  console.log('Sin conversación:', disponibles.sinConversacion)
  
  // 4. Test de conversaciones
  console.log('\n💬 CONVERSACIONES:')
  const conversaciones = DatabaseQueries.getConversationsByUserId(authState.usuario.id)
  console.log('Total conversaciones:', conversaciones.length)
  conversaciones.forEach(conv => {
    console.log(`- Conv ${conv.id}: ${conv.participants.join(', ')}`)
  })
  
  // 5. Test de usuarios por rol
  console.log('\n👤 USUARIOS POR ROL:')
  const roles = ['padre', 'tutor', 'admin']
  roles.forEach(rol => {
    const usuarios = DatabaseQueries.getUsersByRole(rol)
    console.log(`${rol}: ${usuarios.length} usuarios`)
  })
  
  return {
    usuario: authState.usuario,
    disponibles,
    conversaciones,
    funcionesOK: funcionesRequeridas.every(f => typeof DatabaseQueries[f] === 'function')
  }
}

// Hacer disponible globalmente
window.testMessages = testMessages