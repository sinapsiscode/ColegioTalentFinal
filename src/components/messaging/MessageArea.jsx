import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiMessageSquare } from 'react-icons/fi'
import MessageBubble from './MessageBubble'
import { format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

const MessageArea = ({ conversacion, currentUser = 'Carlos Rodríguez' }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversacion?.mensajes])

  if (!conversacion) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
          <p className="text-gray-600">Elige una conversación de la lista para comenzar a chatear</p>
        </div>
      </div>
    )
  }

  const groupMessagesByDate = (mensajes) => {
    const groups = {}
    
    mensajes.forEach(mensaje => {
      const dateKey = format(new Date(mensaje.fecha), 'yyyy-MM-dd')
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(mensaje)
    })
    
    return groups
  }

  const messageGroups = groupMessagesByDate(conversacion.mensajes)

  const renderDateSeparator = (date) => {
    const messageDate = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let dateText
    if (isSameDay(messageDate, today)) {
      dateText = 'Hoy'
    } else if (isSameDay(messageDate, yesterday)) {
      dateText = 'Ayer'
    } else {
      dateText = format(messageDate, 'EEEE, d MMMM', { locale: es })
    }

    return (
      <div className="flex items-center justify-center my-4">
        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
          {dateText}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {Object.entries(messageGroups).map(([date, messages]) => (
          <div key={date}>
            {renderDateSeparator(date)}
            {messages.map((mensaje, index) => {
              const isOwnMessage = mensaje.remitente === currentUser
              const prevMessage = messages[index - 1]
              const showAvatar = !prevMessage || prevMessage.remitente !== mensaje.remitente
              
              return (
                <MessageBubble
                  key={mensaje.id}
                  mensaje={mensaje}
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                />
              )
            })}
          </div>
        ))}
        
        {/* Indicador de mensajes no leídos */}
        {conversacion.mensajes.some(msg => !msg.leido && msg.remitente !== currentUser) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center my-4"
          >
            <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
              Mensajes no leídos
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default MessageArea