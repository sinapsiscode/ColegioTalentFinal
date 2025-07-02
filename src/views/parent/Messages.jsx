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
  FiUser
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import Header from '../../components/common/Header'
import useMessagesStore from '../../stores/messagesStore'
import useAuthStore from '../../stores/authStore'

import ConversationList from '../../components/messaging/ConversationList'
import ChatHeader from '../../components/messaging/ChatHeader'
import MessageArea from '../../components/messaging/MessageArea'
import MessageInput from '../../components/messaging/MessageInput'
import SearchInput from '../../components/common/SearchInput'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import { showSuccess, showError, showInput } from '../../utils/sweetAlert'

const Messages = () => {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { 
    conversaciones, 
    cargando, 
    cargarConversaciones, 
    enviarMensaje, 
    marcarConversacionComoLeida,
    buscarConversaciones,
    simularRespuestaAutomatica
  } = useMessagesStore()

  // Estados locales
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [conversacionesFiltradas, setConversacionesFiltradas] = useState([])

  // Cargar conversaciones al montar
  useEffect(() => {
    cargarConversaciones()
  }, [cargarConversaciones])

  // Filtrar conversaciones
  useEffect(() => {
    let resultado = conversaciones

    // Filtrar por búsqueda
    if (searchTerm) {
      resultado = buscarConversaciones(searchTerm)
    }

    // Filtrar por tipo
    if (typeFilter !== 'all') {
      resultado = resultado.filter(conv => conv.tipo === typeFilter)
    }

    // Ordenar por fecha del último mensaje
    resultado = resultado.sort((a, b) => 
      new Date(b.ultimoMensaje.fecha) - new Date(a.ultimoMensaje.fecha)
    )

    setConversacionesFiltradas(resultado)
  }, [conversaciones, searchTerm, typeFilter, buscarConversaciones])

  // Handlers
  const handleSelectConversation = (conversacion) => {
    setSelectedConversation(conversacion)
    setShowMobileChat(true)
    
    // Marcar como leída
    marcarConversacionComoLeida(conversacion.id)
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
    setSelectedConversation(null)
  }

  const handleSendMessage = (texto) => {
    if (!selectedConversation) return

    const mensaje = {
      texto,
      remitente: usuario?.nombre || 'Carlos Rodríguez'
    }

    enviarMensaje(selectedConversation.id, mensaje)
    
    // Simular respuesta automática ocasional
    if (Math.random() > 0.7) {
      simularRespuestaAutomatica(selectedConversation.id)
    }
  }

  const handleRefresh = () => {
    cargarConversaciones()
    showSuccess('Mensajes actualizados', 'Se han cargado los mensajes más recientes')
  }

  const handleNewMessage = async () => {
    try {
      const result = await showInput(
        'Nuevo Mensaje',
        'Selecciona el destinatario',
        {
          input: 'select',
          inputOptions: {
            'Maria García': 'Profesora María García',
            'José López': 'Profesor José López',
            'Administración': 'Administración del Colegio'
          },
          showCancelButton: true,
          confirmButtonText: 'Continuar',
          cancelButtonText: 'Cancelar'
        }
      )

      if (result.isConfirmed) {
        // Simular creación de nueva conversación
        showSuccess('Función próximamente', 'La creación de nuevos mensajes estará disponible pronto')
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  const handleShowInfo = () => {
    if (selectedConversation) {
      const info = {
        participantes: selectedConversation.participantes,
        tipo: selectedConversation.tipo,
        totalMensajes: selectedConversation.mensajes.length,
        ultimaActividad: selectedConversation.ultimoMensaje.fecha
      }
      
      console.log('Información de la conversación:', info)
      showSuccess('Información', `Conversación con ${selectedConversation.participantes.join(', ')}`)
    }
  }

  // Opciones de filtro
  const filterOptions = [
    { value: 'all', label: 'Todas las conversaciones' },
    { value: 'padre-tutor', label: 'Solo profesores' },
    { value: 'admin-padre', label: 'Solo administración' }
  ]

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner size="xl" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página - solo visible en móvil cuando no hay chat abierto o en desktop */}
        {(!showMobileChat || window.innerWidth >= 1024) && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/parent/dashboard')}
                className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200 lg:hidden"
              >
                <FiArrowLeft className="w-5 h-5" />
              </motion.button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mensajes</h1>
                <p className="text-gray-600 mt-1">
                  Comunicación con profesores y administración
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <AnimatedButton
                variant="outline"
                icon={FiRefreshCw}
                onClick={handleRefresh}
                size="sm"
              >
                Actualizar
              </AnimatedButton>
              
              <AnimatedButton
                variant="primary"
                icon={FiEdit3}
                onClick={handleNewMessage}
                size="sm"
              >
                Nuevo
              </AnimatedButton>
            </div>
          </div>
        )}

        {/* Contenedor principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: '70vh' }}>
          <div className="flex h-full">
            {/* Panel izquierdo - Lista de conversaciones */}
            <div className={`${showMobileChat ? 'hidden' : 'flex'} lg:flex flex-col w-full lg:w-1/3 border-r border-gray-200`}>
              {/* Controles de búsqueda y filtros */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="space-y-3">
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onClear={() => setSearchTerm('')}
                    placeholder="Buscar conversaciones..."
                  />
                  
                  <FilterDropdown
                    label="Filtrar conversaciones"
                    options={filterOptions}
                    selectedValue={typeFilter}
                    onSelect={setTypeFilter}
                  />
                </div>
                
                {/* Estadísticas */}
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span>{conversacionesFiltradas.length} conversaciones</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <FiUsers className="w-4 h-4" />
                      <span>{conversacionesFiltradas.filter(c => c.tipo === 'padre-tutor').length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiUser className="w-4 h-4" />
                      <span>{conversacionesFiltradas.filter(c => c.tipo === 'admin-padre').length}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Lista de conversaciones */}
              <div className="flex-1 overflow-y-auto p-4">
                {conversacionesFiltradas.length === 0 ? (
                  <div className="text-center py-8">
                    <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || typeFilter !== 'all' ? 'No se encontraron resultados' : 'No hay conversaciones'}
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || typeFilter !== 'all' 
                        ? 'Intenta con otros términos de búsqueda o filtros'
                        : 'Inicia una conversación con un profesor o la administración'
                      }
                    </p>
                  </div>
                ) : (
                  <ConversationList
                    conversaciones={conversacionesFiltradas}
                    selectedConversation={selectedConversation}
                    onSelectConversation={handleSelectConversation}
                  />
                )}
              </div>
            </div>

            {/* Panel derecho - Chat */}
            <div className={`${showMobileChat ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-2/3`}>
              {selectedConversation ? (
                <>
                  <ChatHeader
                    conversacion={selectedConversation}
                    onBack={handleBackToList}
                    onShowInfo={handleShowInfo}
                  />
                  
                  <MessageArea
                    conversacion={selectedConversation}
                    currentUser={usuario?.nombre || 'Carlos Rodríguez'}
                  />
                  
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    placeholder="Escribe tu mensaje..."
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecciona una conversación
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Elige una conversación de la lista para comenzar a chatear
                    </p>
                    <AnimatedButton
                      variant="primary"
                      icon={FiEdit3}
                      onClick={handleNewMessage}
                    >
                      Iniciar nueva conversación
                    </AnimatedButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Profesores</h3>
                <p className="text-xs text-gray-600">Comunicación directa con tutores</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiUser className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Administración</h3>
                <p className="text-xs text-gray-600">Consultas administrativas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiMessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Respuesta rápida</h3>
                <p className="text-xs text-gray-600">Comunicación eficiente</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Messages