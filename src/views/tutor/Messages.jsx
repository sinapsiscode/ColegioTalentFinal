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
  FiPlus,
  FiSend
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import Header from '../../components/common/Header'
import useTutorMessagesStore from '../../stores/tutorMessagesStore'
import useAuthStore from '../../stores/authStore'

import TutorConversationCard from '../../components/tutor/TutorConversationCard'
import TutorMessageStats from '../../components/tutor/TutorMessageStats'
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
    simularRespuestaAutomatica,
    obtenerEstadisticas,
    crearNuevaConversacion
  } = useTutorMessagesStore()

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
      remitente: 'María García'
    }

    enviarMensaje(selectedConversation.id, mensaje)
    
    // Simular respuesta automática ocasional
    if (Math.random() > 0.6) {
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
        'Nueva Conversación',
        'Selecciona el destinatario:',
        {
          input: 'select',
          inputOptions: {
            'Carlos Rodríguez': 'Carlos Rodríguez (Padre de Ana Sofía)',
            'Patricia Mendoza': 'Patricia Mendoza (Madre de Diego)',
            'Ana Torres': 'Ana Torres (Madre de Isabella)',
            'Administración': 'Administración del Colegio',
            'Roberto Silva': 'Roberto Silva (Profesor de Ed. Física)',
            'José López': 'José López (Profesor de Comunicación)'
          },
          showCancelButton: true,
          confirmButtonText: 'Continuar',
          cancelButtonText: 'Cancelar'
        }
      )

      if (result.isConfirmed) {
        // Determinar tipo de conversación
        let tipo = 'tutor-padre'
        if (result.value === 'Administración') tipo = 'tutor-admin'
        if (result.value.includes('Profesor')) tipo = 'tutor-colega'
        
        // Crear nueva conversación
        const nuevaConversacionId = crearNuevaConversacion(
          result.value,
          tipo,
          'Nueva conversación',
          tipo === 'tutor-padre' ? 'Estudiante relacionado' : null
        )
        
        // Seleccionar la nueva conversación
        const nuevaConversacion = conversaciones.find(c => c.id === nuevaConversacionId)
        if (nuevaConversacion) {
          handleSelectConversation(nuevaConversacion)
        }
        
        showSuccess('Conversación creada', `Nueva conversación iniciada con ${result.value}`)
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  // Opciones de filtro
  const filterOptions = [
    { value: 'all', label: 'Todas las conversaciones' },
    { value: 'tutor-padre', label: 'Solo padres de familia' },
    { value: 'tutor-admin', label: 'Solo administración' },
    { value: 'tutor-colega', label: 'Solo colegas' }
  ]

  const estadisticas = obtenerEstadisticas()

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
                onClick={() => navigate('/tutor/dashboard')}
                className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200 lg:hidden"
              >
                <FiArrowLeft className="w-5 h-5" />
              </motion.button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mensajes del Tutor</h1>
                <p className="text-gray-600 mt-1">
                  Comunicación con padres, administración y colegas
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
                icon={FiPlus}
                onClick={handleNewMessage}
                size="sm"
              >
                Nueva Conversación
              </AnimatedButton>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <TutorMessageStats estadisticas={estadisticas} loading={cargando} />

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
                      <span>{conversacionesFiltradas.filter(c => c.tipo === 'tutor-padre').length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiMessageSquare className="w-4 h-4" />
                      <span>{estadisticas.noLeidos}</span>
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
                        : 'Inicia una conversación con padres o colegas'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversacionesFiltradas.map((conversacion, index) => (
                      <motion.div
                        key={conversacion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TutorConversationCard
                          conversacion={conversacion}
                          isSelected={selectedConversation?.id === conversacion.id}
                          onClick={() => handleSelectConversation(conversacion)}
                        />
                      </motion.div>
                    ))}
                  </div>
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
                    onShowInfo={() => showSuccess('Información', 'Detalles de la conversación')}
                  />
                  
                  <MessageArea
                    conversacion={selectedConversation}
                    currentUser="María García"
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
                      icon={FiPlus}
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
                <h3 className="text-sm font-medium text-gray-900">Padres de Familia</h3>
                <p className="text-xs text-gray-600">Comunicación sobre estudiantes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiMessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Administración</h3>
                <p className="text-xs text-gray-600">Coordinación académica</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiSend className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Colegas</h3>
                <p className="text-xs text-gray-600">Colaboración interdisciplinaria</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Messages