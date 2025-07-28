import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiMessageSquare,
  FiSend,
  FiSearch,
  FiFilter,
  FiArchive,
  FiTrash2,
  FiMoreVertical,
  FiPaperclip,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiBell,
  FiMic,
  FiImage,
  FiFile,
  FiX,
  FiChevronLeft,
  FiStar,
  FiRefreshCw
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import AnimatedCard from '../../components/common/AnimatedCard'
import SearchInput from '../../components/common/SearchInput'
import LoadingSpinner from '../../components/common/LoadingSpinner'

import ConversationList from '../../components/messaging/ConversationList'
import MessageArea from '../../components/messaging/MessageArea'
import MessageInputEnhanced from '../../components/messaging/MessageInputEnhanced'
import ChatHeader from '../../components/messaging/ChatHeader'

import useAuthStore from '../../stores/authStore'
import useEnhancedMessagesStore from '../../stores/enhancedMessagesStore'
import useNotificationsStore from '../../stores/notificationsStore'
import { showSuccess, showError, showWarning, showInfo } from '../../utils/sweetAlert'

const MensajesDashboard = () => {
  const navigate = useNavigate()
  const { usuarioId } = useParams()
  const { usuario, rol } = useAuthStore()
  
  const {
    conversaciones,
    mensajes,
    cargando,
    cargarConversaciones,
    cargarMensajes,
    enviarMensaje,
    marcarComoLeido,
    archivarConversacion,
    eliminarConversacion,
    buscarMensajes,
    marcarMensajeComoLeido,
    configuracion,
    actualizarConfiguracion,
    marcarComoImportante,
    actualizarEstadoEscritura,
    obtenerEstadisticas
  } = useEnhancedMessagesStore()

  const { agregarNotificacion } = useNotificationsStore()

  // Estados
  const [conversacionActual, setConversacionActual] = useState(null)
  const [mensajesActuales, setMensajesActuales] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [attachmentPreview, setAttachmentPreview] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [selectedMessages, setSelectedMessages] = useState(new Set())
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showConversationInfo, setShowConversationInfo] = useState(false)
  const [notificationSound] = useState(new Audio('/notification.mp3'))

  // Detectar cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cargar conversaciones
  useEffect(() => {
    cargarConversaciones()
    
    // Simular actualizaciones en tiempo real
    const interval = setInterval(() => {
      cargarConversaciones()
    }, 30000) // Cada 30 segundos
    
    return () => clearInterval(interval)
  }, [cargarConversaciones])

  // Cargar conversación específica si hay usuarioId
  useEffect(() => {
    if (usuarioId && conversaciones.length > 0) {
      const conversacion = conversaciones.find(c => 
        c.otroUsuario.id === parseInt(usuarioId)
      )
      if (conversacion) {
        handleSelectConversation(conversacion)
      }
    }
  }, [usuarioId, conversaciones])

  // Filtrar conversaciones
  const conversacionesFiltradas = conversaciones.filter(conv => {
    const matchSearch = searchTerm === '' || 
      conv.otroUsuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.ultimoMensaje?.texto.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchArchived = showArchived ? conv.archivada : !conv.archivada
    
    return matchSearch && matchArchived
  })

  // Handlers
  const handleSelectConversation = async (conversacion) => {
    setConversacionActual(conversacion)
    const mensajesCargados = await cargarMensajes(conversacion.id)
    setMensajesActuales(mensajesCargados)
    
    // Marcar mensajes como leídos
    if (conversacion.mensajesNoLeidos > 0) {
      marcarComoLeido(conversacion.id)
      
      // Marcar cada mensaje como leído
      mensajesCargados.forEach(msg => {
        if (!msg.leido && msg.remitente.id !== usuario.id) {
          marcarMensajeComoLeido(msg.id)
        }
      })
    }
    
    // En móvil, actualizar URL
    if (isMobile) {
      navigate(`/mensajes/${conversacion.otroUsuario.id}`)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() && !attachmentPreview) return
    
    try {
      const mensaje = {
        texto: messageText.trim(),
        adjunto: attachmentPreview
      }
      
      await enviarMensaje(conversacionActual.id, mensaje)
      setMessageText('')
      setAttachmentPreview(null)
      
      // Recargar mensajes
      const nuevosMensajes = await cargarMensajes(conversacionActual.id)
      setMensajesActuales(nuevosMensajes)
      
      // Notificar al otro usuario (simulado)
      agregarNotificacion({
        tipo: 'mensaje',
        titulo: 'Nuevo mensaje',
        mensaje: `${usuario.nombre} te ha enviado un mensaje`,
        destinatarioId: conversacionActual.otroUsuario.id
      })
      
    } catch (error) {
      showError('Error', 'No se pudo enviar el mensaje')
    }
  }

  const handleArchiveConversation = async (conversacionId) => {
    try {
      await archivarConversacion(conversacionId)
      showSuccess('Conversación archivada', 'La conversación ha sido archivada')
      
      if (conversacionActual?.id === conversacionId) {
        setConversacionActual(null)
        setMensajesActuales([])
      }
    } catch (error) {
      showError('Error', 'No se pudo archivar la conversación')
    }
  }

  const handleDeleteConversation = async (conversacionId) => {
    const result = await showWarning(
      '¿Eliminar conversación?',
      'Esta acción no se puede deshacer. Se eliminarán todos los mensajes.',
      true
    )
    
    if (result.isConfirmed) {
      try {
        await eliminarConversacion(conversacionId)
        showSuccess('Conversación eliminada', 'La conversación ha sido eliminada')
        
        if (conversacionActual?.id === conversacionId) {
          setConversacionActual(null)
          setMensajesActuales([])
        }
      } catch (error) {
        showError('Error', 'No se pudo eliminar la conversación')
      }
    }
  }

  const handleAttachment = (file) => {
    if (!file) return
    
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      showError('Archivo muy grande', 'El tamaño máximo es 10MB')
      return
    }
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setAttachmentPreview({
        name: file.name,
        size: file.size,
        type: file.type,
        url: reader.result
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSearch = async (term) => {
    if (!term.trim()) {
      if (conversacionActual) {
        const mensajes = await cargarMensajes(conversacionActual.id)
        setMensajesActuales(mensajes)
      }
      return
    }
    
    const resultados = await buscarMensajes(term)
    if (conversacionActual) {
      const mensajesFiltrados = resultados.filter(m => 
        m.conversacionId === conversacionActual.id
      )
      setMensajesActuales(mensajesFiltrados)
    }
  }

  const handleRefresh = async () => {
    await cargarConversaciones()
    if (conversacionActual) {
      const mensajes = await cargarMensajes(conversacionActual.id)
      setMensajesActuales(mensajes)
    }
    showSuccess('Actualizado', 'Los mensajes han sido actualizados')
  }

  // Renderizar vista móvil o desktop
  const renderMobileView = () => {
    if (conversacionActual && isMobile) {
      return (
        <div className="h-screen flex flex-col bg-gray-50">
          <Header />
          <div className="flex-1 flex flex-col">
            {/* Header del chat con botón de volver */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setConversacionActual(null)
                    navigate('/mensajes')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <ChatHeader
                  conversacion={conversacionActual}
                  onClose={() => {
                    setConversacionActual(null)
                    navigate('/mensajes')
                  }}
                  onInfo={() => setShowConversationInfo(true)}
                />
              </div>
            </div>
            
            {/* Área de mensajes */}
            <MessageArea
              mensajes={mensajesActuales}
              usuarioActual={usuario}
              onMessageSelect={(msgId) => {
                const newSelected = new Set(selectedMessages)
                if (newSelected.has(msgId)) {
                  newSelected.delete(msgId)
                } else {
                  newSelected.add(msgId)
                }
                setSelectedMessages(newSelected)
              }}
              selectedMessages={selectedMessages}
            />
            
            {/* Input de mensaje */}
            <MessageInputEnhanced
              value={messageText}
              onChange={setMessageText}
              onSend={handleSendMessage}
              onAttachment={handleAttachment}
              attachment={attachmentPreview}
              onRemoveAttachment={() => setAttachmentPreview(null)}
              isTyping={isTyping}
              showEmojiPicker={showEmojiPicker}
              onToggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
            />
          </div>
        </div>
      )
    }
    
    // Vista de lista de conversaciones en móvil
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
            <p className="text-sm text-gray-600 mt-1">
              {conversacionesFiltradas.filter(c => c.mensajesNoLeidos > 0).length} conversaciones sin leer
            </p>
          </div>
          
          <div className="mb-4 space-y-3">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar conversaciones..."
            />
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                  showArchived
                    ? 'bg-gray-200 text-gray-900'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiArchive className="w-4 h-4" />
                <span>{showArchived ? 'Archivadas' : 'Mostrar archivadas'}</span>
              </button>
              
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <ConversationList
            conversaciones={conversacionesFiltradas}
            onSelectConversation={handleSelectConversation}
            selectedId={conversacionActual?.id}
            onArchive={handleArchiveConversation}
            onDelete={handleDeleteConversation}
            currentUserId={usuario.id}
          />
        </main>
      </div>
    )
  }

  if (isMobile) {
    return renderMobileView()
  }

  // Vista desktop
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar de conversaciones */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header del sidebar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Mensajes</h2>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar conversaciones..."
              className="mb-3"
            />
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowArchived(false)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !showArchived
                    ? 'bg-talentos-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Activas ({conversaciones.filter(c => !c.archivada).length})
              </button>
              <button
                onClick={() => setShowArchived(true)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showArchived
                    ? 'bg-talentos-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiArchive className="w-4 h-4 inline mr-1" />
                Archivadas ({conversaciones.filter(c => c.archivada).length})
              </button>
            </div>
          </div>
          
          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto">
            {cargando ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            ) : conversacionesFiltradas.length === 0 ? (
              <div className="text-center py-8">
                <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {showArchived ? 'No hay conversaciones archivadas' : 'No hay conversaciones'}
                </p>
              </div>
            ) : (
              <ConversationList
                conversaciones={conversacionesFiltradas}
                onSelectConversation={handleSelectConversation}
                selectedId={conversacionActual?.id}
                onArchive={handleArchiveConversation}
                onDelete={handleDeleteConversation}
                currentUserId={usuario.id}
              />
            )}
          </div>
        </div>
        
        {/* Área principal de chat */}
        <div className="flex-1 flex flex-col">
          {conversacionActual ? (
            <>
              {/* Header del chat */}
              <ChatHeader
                conversacion={conversacionActual}
                onClose={() => setConversacionActual(null)}
                onInfo={() => setShowConversationInfo(true)}
                onArchive={() => handleArchiveConversation(conversacionActual.id)}
                onDelete={() => handleDeleteConversation(conversacionActual.id)}
              />
              
              {/* Área de mensajes */}
              <MessageArea
                mensajes={mensajesActuales}
                usuarioActual={usuario}
                onMessageSelect={(msgId) => {
                  const newSelected = new Set(selectedMessages)
                  if (newSelected.has(msgId)) {
                    newSelected.delete(msgId)
                  } else {
                    newSelected.add(msgId)
                  }
                  setSelectedMessages(newSelected)
                }}
                selectedMessages={selectedMessages}
                onSearch={handleSearch}
              />
              
              {/* Barra de acciones para mensajes seleccionados */}
              {selectedMessages.size > 0 && (
                <motion.div
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between"
                >
                  <span className="text-sm">
                    {selectedMessages.size} mensaje{selectedMessages.size !== 1 ? 's' : ''} seleccionado{selectedMessages.size !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedMessages(new Set())}
                      className="p-2 hover:bg-gray-700 rounded"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* Input de mensaje */}
              <MessageInputEnhanced
                value={messageText}
                onChange={setMessageText}
                onSend={handleSendMessage}
                onAttachment={handleAttachment}
                attachment={attachmentPreview}
                onRemoveAttachment={() => setAttachmentPreview(null)}
                isTyping={isTyping}
                showEmojiPicker={showEmojiPicker}
                onToggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-gray-600">
                  Elige una conversación de la lista para comenzar a chatear
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Panel de información de conversación */}
        <AnimatePresence>
          {showConversationInfo && conversacionActual && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="w-80 bg-white border-l border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Información</h3>
                <button
                  onClick={() => setShowConversationInfo(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Información del usuario */}
              <div className="text-center mb-6">
                <img
                  src={conversacionActual.otroUsuario.avatar || `/avatar-${conversacionActual.otroUsuario.rol}.jpg`}
                  alt={conversacionActual.otroUsuario.nombre}
                  className="w-20 h-20 rounded-full mx-auto mb-3"
                />
                <h4 className="font-medium text-gray-900">
                  {conversacionActual.otroUsuario.nombre}
                </h4>
                <p className="text-sm text-gray-600 capitalize">
                  {conversacionActual.otroUsuario.rol}
                </p>
              </div>
              
              {/* Estadísticas */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total de mensajes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mensajesActuales.length}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Conversación iniciada</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(conversacionActual.fechaInicio || Date.now()).toLocaleDateString('es-PE')}
                  </p>
                </div>
                
                {/* Archivos compartidos */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Archivos compartidos</h5>
                  <div className="space-y-2">
                    {mensajesActuales
                      .filter(m => m.adjunto)
                      .slice(-5)
                      .map(m => (
                        <div key={m.id} className="flex items-center space-x-2 text-sm">
                          <FiFile className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 truncate">
                            {m.adjunto.name}
                          </span>
                        </div>
                      ))}
                    {mensajesActuales.filter(m => m.adjunto).length === 0 && (
                      <p className="text-sm text-gray-500">No hay archivos compartidos</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MensajesDashboard