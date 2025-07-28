import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSend,
  FiPaperclip,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiInfo,
  FiArchive,
  FiVolumeX,
  FiVolume2,
  FiEdit3,
  FiCheck,
  FiCheckCheck,
  FiClock
} from 'react-icons/fi'
import useMessagesStore from '../../stores/messagesStore'
import useAuthStore from '../../stores/authStore'

const ChatEnhanced = ({ conversacionId, onClose }) => {
  const { usuario } = useAuthStore()
  const {
    obtenerConversacion,
    enviarMensaje,
    marcarComoLeido,
    setUsuarioEscribiendo,
    getUsuariosEscribiendo,
    archivarConversacion,
    silenciarConversacion
  } = useMessagesStore()

  const [mensaje, setMensaje] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [mostrarOpciones, setMostrarOpciones] = useState(false)
  const [escribiendoTimeout, setEscribiendoTimeout] = useState(null)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  const conversacion = obtenerConversacion(conversacionId)
  const usuariosEscribiendo = getUsuariosEscribiendo(conversacionId)

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversacion?.mensajes])

  // Marcar como leído al abrir
  useEffect(() => {
    if (conversacion) {
      marcarComoLeido(conversacionId)
    }
  }, [conversacionId, conversacion])

  // Manejar escritura
  const handleInputChange = (e) => {
    setMensaje(e.target.value)
    
    if (!escribiendo) {
      setEscribiendo(true)
      setUsuarioEscribiendo(conversacionId, true)
    }
    
    // Limpiar timeout anterior
    if (escribiendoTimeout) {
      clearTimeout(escribiendoTimeout)
    }
    
    // Establecer nuevo timeout
    const timeout = setTimeout(() => {
      setEscribiendo(false)
      setUsuarioEscribiendo(conversacionId, false)
    }, 1000)
    
    setEscribiendoTimeout(timeout)
  }

  const handleEnviarMensaje = async (e) => {
    e.preventDefault()
    
    if (!mensaje.trim()) return
    
    const textoMensaje = mensaje.trim()
    setMensaje('')
    setEscribiendo(false)
    setUsuarioEscribiendo(conversacionId, false)
    
    // Enviar mensaje
    await enviarMensaje(conversacionId, {
      texto: textoMensaje,
      remitente: usuario.nombre,
      remitenteId: usuario.id
    })
    
    // Focus input
    inputRef.current?.focus()
  }

  const handleArchivar = () => {
    archivarConversacion(conversacionId)
    setMostrarOpciones(false)
    onClose?.()
  }

  const handleSilenciar = () => {
    silenciarConversacion(conversacionId, !conversacion?.silenciada)
    setMostrarOpciones(false)
  }

  if (!conversacion) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Conversación no encontrada
      </div>
    )
  }

  const otherParticipant = conversacion.participantes.find(p => p !== usuario.nombre)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-talentos-primary rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
            {otherParticipant?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">{otherParticipant}</h3>
            <div className="flex items-center text-xs text-gray-500">
              {usuariosEscribiendo.length > 0 ? (
                <span className="text-talentos-primary flex items-center">
                  <span className="animate-pulse mr-1">●</span>
                  <span className="hidden sm:inline">escribiendo...</span>
                  <span className="sm:hidden">...</span>
                </span>
              ) : (
                <span className="hidden sm:inline">En línea</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 hidden sm:block">
            <FiPhone className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 hidden sm:block">
            <FiVideo className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setMostrarOpciones(!mostrarOpciones)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <FiMoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            
            <AnimatePresence>
              {mostrarOpciones && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  <button 
                    onClick={() => setMostrarOpciones(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <FiInfo className="w-4 h-4" />
                    <span>Ver información</span>
                  </button>
                  <button 
                    onClick={handleSilenciar}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    {conversacion.silenciada ? <FiVolume2 className="w-4 h-4" /> : <FiVolumeX className="w-4 h-4" />}
                    <span>{conversacion.silenciada ? 'Activar sonido' : 'Silenciar'}</span>
                  </button>
                  <button 
                    onClick={handleArchivar}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <FiArchive className="w-4 h-4" />
                    <span>Archivar</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
        <AnimatePresence>
          {conversacion.mensajes.map((msg, index) => {
            const isOwnMessage = msg.remitenteId === usuario.id || msg.remitente === usuario.nombre
            const showAvatar = index === 0 || conversacion.mensajes[index - 1]?.remitente !== msg.remitente
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
              >
                <div className={`flex items-end space-x-1 sm:space-x-2 max-w-[280px] sm:max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                  {!isOwnMessage && showAvatar && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded-full flex-shrink-0" />
                  )}
                  
                  <div className={`relative px-3 py-2 sm:px-4 rounded-2xl ${
                    isOwnMessage 
                      ? 'bg-talentos-primary text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm break-words">{msg.texto}</p>
                    
                    <div className={`flex items-center justify-end space-x-1 mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">
                        {new Date(msg.fecha).toLocaleTimeString('es-PE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      
                      {isOwnMessage && (
                        <div className="flex items-center">
                          {msg.enviando ? (
                            <FiClock className="w-3 h-3" />
                          ) : msg.error ? (
                            <span className="text-red-300">!</span>
                          ) : msg.leido ? (
                            <FiCheckCheck className="w-3 h-3" />
                          ) : (
                            <FiCheck className="w-3 h-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {/* Indicador de escritura */}
        <AnimatePresence>
          {usuariosEscribiendo.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleEnviarMensaje} className="p-3 sm:p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 flex-shrink-0 hidden sm:block"
          >
            <FiPaperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={mensaje}
              onChange={handleInputChange}
              placeholder="Escribe un mensaje..."
              className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-talentos-primary focus:bg-white transition-colors duration-200"
              aria-label="Escribir mensaje"
            />
          </div>
          
          <motion.button
            type="submit"
            disabled={!mensaje.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-1.5 sm:p-2 rounded-full transition-colors duration-200 flex-shrink-0 ${
              mensaje.trim() 
                ? 'bg-talentos-primary text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}
            aria-label="Enviar mensaje"
          >
            <FiSend className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </form>
    </div>
  )
}

export default ChatEnhanced