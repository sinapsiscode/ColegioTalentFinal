import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiBell, 
  FiX, 
  FiCheck, 
  FiArchive, 
  FiSettings,
  FiFilter,
  FiTrash2,
  FiExternalLink,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import useNotificationsStore from '../../stores/notificationsStore'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * 🔔 Centro de Notificaciones
 * Componente principal para mostrar y gestionar notificaciones
 */
const NotificationCenter = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('todas') // todas, no_leidas, archivadas
  const [filterType, setFilterType] = useState('all')
  
  const {
    notificaciones,
    notificacionesNoLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    archivarNotificacion,
    obtenerNoLeidas,
    obtenerNotificacionesPorTipo,
    obtenerEstadisticas,
    limpiarNotificaciones
  } = useNotificationsStore()

  // Filtrar notificaciones según tab activo
  const getFilteredNotifications = () => {
    let filtered = []
    
    switch (activeTab) {
      case 'no_leidas':
        filtered = obtenerNoLeidas()
        break
      case 'archivadas':
        filtered = notificaciones.filter(n => n.status === 'archivada')
        break
      default:
        filtered = notificaciones.filter(n => n.status !== 'archivada')
    }

    // Aplicar filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.tipo === filterType)
    }

    return filtered.sort((a, b) => new Date(b.timestamp || b.fecha) - new Date(a.timestamp || a.fecha))
  }

  const filteredNotifications = getFilteredNotifications()
  const stats = obtenerEstadisticas()

  // Manejar click en notificación
  const handleNotificationClick = (notification) => {
    // Marcar como leída si no lo está
    if (!notification.leida) {
      marcarComoLeida(notification.id)
    }

    // Navegar si tiene URL de acción
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      onClose()
    }
  }

  // Obtener color de prioridad
  const getPriorityColor = (priority) => {
    const colors = {
      'baja': 'border-l-blue-500 bg-blue-50',
      'media': 'border-l-yellow-500 bg-yellow-50', 
      'alta': 'border-l-orange-500 bg-orange-50',
      'urgente': 'border-l-red-500 bg-red-50'
    }
    return colors[priority] || colors.media
  }

  // Obtener icono de tipo
  const getTypeIcon = (tipo) => {
    const icons = {
      'academico': '📊',
      'asistencia': '👥',
      'comunicado': '📢',
      'mensaje': '💬',
      'sistema': '⚙️',
      'pago': '💳',
      'usuario': '👤',
      'evento': '📅',
      'tarea': '📝',
      'salud': '💊'
    }
    return icons[tipo] || '🔔'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-25"
        onClick={onClose}
      />

      {/* Panel de Notificaciones */}
      <motion.div
        initial={{ opacity: 0, x: 400, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 400, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden border border-gray-200"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiBell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificaciones
                </h3>
                <p className="text-sm text-gray-600">
                  {stats.unread} sin leer de {stats.total}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {notificacionesNoLeidas > 0 && (
                <button
                  onClick={marcarTodasComoLeidas}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Marcar todas como leídas"
                >
                  <FiCheckCircle className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'todas', label: 'Todas', count: stats.total },
              { key: 'no_leidas', label: 'Sin leer', count: stats.unread },
              { key: 'archivadas', label: 'Archivadas', count: notificaciones.filter(n => n.status === 'archivada').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filtro por tipo */}
          <div className="mt-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="academico">📊 Académicas</option>
              <option value="asistencia">👥 Asistencia</option>
              <option value="comunicado">📢 Comunicados</option>
              <option value="mensaje">💬 Mensajes</option>
              <option value="sistema">⚙️ Sistema</option>
              <option value="pago">💳 Pagos</option>
              <option value="evento">📅 Eventos</option>
            </select>
          </div>
        </div>

        {/* Lista de Notificaciones */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <FiBell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'no_leidas' ? 'Todo al día' : 'Sin notificaciones'}
                </h4>
                <p className="text-gray-600">
                  {activeTab === 'no_leidas' 
                    ? 'No tienes notificaciones sin leer' 
                    : 'No hay notificaciones para mostrar'
                  }
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative border-l-4 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    getPriorityColor(notification.priority)
                  } ${!notification.leida ? 'ring-2 ring-blue-100' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Badge de no leída */}
                  {!notification.leida && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}

                  {/* Contenido */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-2xl">
                      {notification.icono || getTypeIcon(notification.tipo)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium text-gray-900 truncate ${
                          !notification.leida ? 'font-semibold' : ''
                        }`}>
                          {notification.titulo}
                        </h4>
                        
                        {/* Indicador de prioridad urgente */}
                        {notification.priority === 'urgente' && (
                          <span className="ml-2 px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded-full">
                            URGENTE
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.mensaje}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <FiClock className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(
                              new Date(notification.timestamp || notification.fecha), 
                              { addSuffix: true, locale: es }
                            )}
                          </span>
                        </div>
                        
                        {notification.actionUrl && (
                          <FiExternalLink className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
                    {!notification.leida && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          marcarComoLeida(notification.id)
                        }}
                        className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                        title="Marcar como leída"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        archivarNotificacion(notification.id)
                      }}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Archivar"
                    >
                      <FiArchive className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        eliminarNotificacion(notification.id)
                      }}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/configuracion?tab=notifications')}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiSettings className="w-4 h-4" />
              <span>Configurar</span>
            </button>
            
            {filteredNotifications.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres limpiar todas las notificaciones?')) {
                    limpiarNotificaciones()
                  }
                }}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                Limpiar todo
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default NotificationCenter