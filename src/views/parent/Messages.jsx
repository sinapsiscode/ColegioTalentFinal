import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiMessageSquare, 
  FiSearch, 
  FiEdit3, 
  FiRefreshCw,
  FiFilter,
  FiArrowLeft,
  FiUsers,
  FiUser,
  FiSend,
  FiDownload
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import Header from '../../components/common/Header'
import useMessagesStore from '../../stores/messagesStore'
import useAuthStore from '../../stores/authStore'

import SearchInput from '../../components/common/SearchInput'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { showSuccess, showError } from '../../utils/sweetAlert'
import NewConversationModal from '../../components/messaging/NewConversationModal'
import { debugMessages } from '../../utils/debugMessages'
import { testMessages } from '../../utils/testMessages'
import { exportForParents } from '../../utils/exportUtilsSimple'

const Messages = () => {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { 
    conversaciones, 
    mensajesActuales,
    mensajesNoLeidos,
    cargando,
    enviando,
    cargarConversaciones,
    cargarMensajes,
    enviarMensaje,
    buscarConversaciones,
    obtenerUsuariosDisponibles
  } = useMessagesStore()

  // Estados locales
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)

  // Cargar conversaciones al montar
  useEffect(() => {
    cargarConversaciones()
    // Debug mejorado
    console.log('🔍 Debug desde Messages.jsx:')
    console.log('Usuario actual:', usuario)
    console.log('Conversaciones:', conversaciones)
    console.log('Cargando:', cargando)
    console.log('Usuarios disponibles:', obtenerUsuariosDisponibles())
    
    // Ejecutar test completo
    testMessages()
  }, [cargarConversaciones])

  // Filtrar conversaciones por búsqueda
  const conversacionesFiltradas = searchTerm 
    ? buscarConversaciones(searchTerm)
    : conversaciones

  // Handlers
  const handleSelectConversation = async (conversacion) => {
    setSelectedConversation(conversacion)
    setShowMobileChat(true)
    
    // Cargar mensajes de la conversación
    await cargarMensajes(conversacion.id)
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
    setSelectedConversation(null)
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    const result = await enviarMensaje(
      selectedConversation.id,
      messageInput.trim(),
      selectedConversation.otroParticipante.id
    )

    if (result.success) {
      setMessageInput('')
    } else {
      showError('Error', 'No se pudo enviar el mensaje')
    }
  }

  const handleRefresh = () => {
    cargarConversaciones()
    showSuccess('Mensajes actualizados', 'Se han cargado los mensajes más recientes')
  }

  const handleExport = async () => {
    if (conversaciones.length === 0) {
      showError('Sin Datos', 'No hay conversaciones para exportar')
      return
    }

    try {
      // Preparar datos para exportación (padres solo reciben PDF)
      const exportData = conversaciones.map(conv => ({
        'Conversación con': conv.receptor?.nombre || 'Desconocido',
        'Rol': conv.receptor?.rol === 'tutor' ? 'Profesor' : conv.receptor?.rol || 'N/A',
        'Último mensaje': conv.ultimoMensaje || 'Sin mensajes',
        'Fecha': new Date(conv.fecha).toLocaleDateString('es-PE'),
        'Hora': new Date(conv.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        'Mensajes no leídos': conv.noLeidos || 0,
        'Total mensajes': conv.totalMensajes || 0,
        'Estado': conv.noLeidos > 0 ? 'Pendiente' : 'Leído'
      }))

      const result = await exportForParents(exportData, {
        title: `Conversaciones - ${usuario?.nombre || 'Padre de Familia'}`,
        filename: 'conversaciones_mensajes'
      })
      
      if (result) {
        showSuccess('Exportación exitosa', 'Las conversaciones han sido exportadas en PDF')
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      showError('Error', 'No se pudo exportar las conversaciones')
    }
  }

  const handleNewMessage = () => {
    setShowNewConversationModal(true)
  }

  const handleSelectRecipient = async (recipient) => {
    try {
      // Buscar si ya existe una conversación con este usuario
      const conversacionExistente = conversaciones.find(conv => 
        conv.participants.includes(recipient.id)
      )
      
      if (conversacionExistente) {
        // Si ya existe, seleccionarla
        handleSelectConversation(conversacionExistente)
        setShowNewConversationModal(false)
        showSuccess('Conversación existente', `Ya tienes una conversación con ${recipient.name}`)
      } else {
        // Si no existe, crear una nueva conversación vacía
        const { iniciarConversacion } = useMessagesStore.getState()
        const result = await iniciarConversacion(recipient.id)
        
        if (result.success) {
          // Recargar conversaciones
          await cargarConversaciones()
          
          // Buscar la nueva conversación
          const nuevaConversacion = conversaciones.find(conv => 
            conv.id === result.conversacionId
          )
          
          if (nuevaConversacion) {
            handleSelectConversation(nuevaConversacion)
          }
          
          setShowNewConversationModal(false)
          showSuccess('¡Listo!', `Ahora puedes enviar mensajes a ${recipient.name}`)
        } else {
          showError('Error', 'No se pudo crear la conversación')
        }
      }
    } catch (error) {
      console.error('Error al seleccionar destinatario:', error)
      showError('Error', 'Ocurrió un error al procesar la solicitud')
    }
  }

  // Renderizar mensaje individual
  const renderMessage = (mensaje) => {
    const isOwnMessage = mensaje.senderId === usuario?.id
    
    return (
      <div key={mensaje.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : ''}`}>
          <div className={`rounded-lg px-4 py-2 ${
            isOwnMessage 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}>
            <p className="text-sm">{mensaje.content}</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(mensaje.timestamp).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    )
  }

  if (cargando && conversaciones.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header de mensajes */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mensajes</h1>
          <p className="text-gray-600">
            {mensajesNoLeidos > 0 
              ? `Tienes ${mensajesNoLeidos} mensajes sin leer`
              : 'Todos los mensajes leídos'
            }
          </p>
        </div>

        {/* Layout principal */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Lista de conversaciones - Desktop y Mobile */}
            <div className={`${showMobileChat ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-gray-200`}>
              {/* Barra de búsqueda y acciones */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex gap-2 mb-3">
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar conversación..."
                    className="flex-1"
                  />
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={handleRefresh}
                    icon={FiRefreshCw}
                  />
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    icon={FiDownload}
                    title="Exportar conversaciones"
                  />
                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    onClick={handleNewMessage}
                    icon={FiEdit3}
                    title="Nuevo mensaje"
                  >
                    Nuevo
                  </AnimatedButton>
                </div>
              </div>

              {/* Lista de conversaciones */}
              <div className="overflow-y-auto h-[calc(100%-80px)]">
                {conversacionesFiltradas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiMessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-lg mb-2">No hay conversaciones</p>
                    <p className="text-sm">Haz clic en "Nuevo" para iniciar una conversación</p>
                  </div>
                ) : (
                  conversacionesFiltradas.map((conv) => (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelectConversation(conv)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {conv.nombreParticipante}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-xs text-gray-500">
                            {new Date(conv.lastMessageTime).toLocaleDateString()}
                          </p>
                          {conv.unreadCount?.[usuario?.id] > 0 && (
                            <span className="inline-block bg-blue-600 text-white text-xs rounded-full px-2 py-1 mt-1">
                              {conv.unreadCount[usuario.id]}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Área de chat */}
            <div className={`${showMobileChat ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
              {selectedConversation ? (
                <>
                  {/* Header del chat */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={handleBackToList}
                          className="md:hidden mr-3 text-gray-600 hover:text-gray-800"
                        >
                          <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <FiUser className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {selectedConversation.nombreParticipante}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.otroParticipante?.rol}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Área de mensajes */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {mensajesActuales.map(renderMessage)}
                  </div>

                  {/* Input de mensaje */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={enviando}
                      />
                      <AnimatedButton
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || enviando}
                        icon={FiSend}
                      >
                        {enviando ? 'Enviando...' : 'Enviar'}
                      </AnimatedButton>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FiMessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Selecciona una conversación</p>
                    <p className="text-sm text-gray-400 mb-4">O inicia una nueva conversación</p>
                    <AnimatedButton
                      variant="primary"
                      size="md"
                      onClick={handleNewMessage}
                      icon={FiEdit3}
                    >
                      Nueva Conversación
                    </AnimatedButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de nueva conversación */}
      {showNewConversationModal && (
        <NewConversationModal
          isOpen={showNewConversationModal}
          onClose={() => setShowNewConversationModal(false)}
          onSelectRecipient={handleSelectRecipient}
          availableUsers={obtenerUsuariosDisponibles()}
        />
      )}
    </div>
  )
}

export default Messages