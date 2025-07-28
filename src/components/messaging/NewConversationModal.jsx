import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiUser, FiBookOpen, FiSettings, FiMessageCircle } from 'react-icons/fi'

const NewConversationModal = ({ isOpen, onClose, onSelectRecipient, availableUsers = {} }) => {
  // Función para obtener icono y color según el rol
  const getRoleConfig = (role) => {
    const configs = {
      padre: { icon: FiUser, color: 'bg-green-500', label: 'Padre/Madre' },
      tutor: { icon: FiBookOpen, color: 'bg-blue-500', label: 'Profesor(a)' },
      admin: { icon: FiSettings, color: 'bg-purple-500', label: 'Administración' },
      entrada: { icon: FiUser, color: 'bg-gray-500', label: 'Personal' }
    }
    return configs[role] || configs.padre
  }

  // Combinar usuarios con y sin conversación
  const allUsers = [
    ...(availableUsers.sinConversacion || []),
    ...(availableUsers.conConversacion || [])
  ]

  // Transformar usuarios para el display
  const recipients = allUsers.map(user => {
    const roleConfig = getRoleConfig(user.rol)
    return {
      id: user.id,
      name: `${user.nombre} ${user.apellidos || ''}`.trim(),
      subtitle: roleConfig.label,
      role: user.rol,
      email: user.email,
      icon: roleConfig.icon,
      color: roleConfig.color,
      hasConversation: availableUsers.conConversacion?.some(u => u.id === user.id)
    }
  })

  const handleSelect = (recipient) => {
    onSelectRecipient(recipient)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop mejorado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal con mejor diseño */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FiMessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Nueva Conversación</h3>
                    <p className="text-white/80 text-sm">Selecciona con quién conversar</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lista de contactos mejorada */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {recipients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay usuarios disponibles para mensajear</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recipients.map((recipient, index) => {
                  const IconComponent = recipient.icon
                  return (
                    <motion.button
                      key={recipient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSelect(recipient)}
                      className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl border border-gray-100 hover:border-talentos-primary/30 hover:shadow-md transition-all group"
                    >
                      {/* Avatar con icono */}
                      <div className={`w-12 h-12 ${recipient.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      
                      {/* Información del contacto */}
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-900 group-hover:text-talentos-primary transition-colors">
                          {recipient.name}
                        </h4>
                        <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                          {recipient.subtitle}
                        </p>
                      </div>

                      {/* Indicador de hover */}
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-talentos-primary group-hover:bg-talentos-primary transition-all">
                        <div className="w-full h-full rounded-full bg-talentos-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </motion.button>
                  )
                })}
                </div>
              )}
            </div>

            {/* Footer opcional */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <p className="text-xs text-gray-500 text-center">
                Haz clic en un contacto para iniciar la conversación
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default NewConversationModal