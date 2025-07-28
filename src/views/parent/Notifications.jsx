import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiBell, 
  FiFilter, 
  FiSearch,
  FiSettings,
  FiTrash2,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiAlertCircle,
  FiMail,
  FiSmartphone,
  FiVolume2,
  FiVolumeX
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import Header from '../../components/common/Header'
import useAuthStore from '../../stores/authStore'
import useNotificationsStore from '../../stores/notificationsStore'
import SearchInput from '../../components/common/SearchInput'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'

const Notifications = () => {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { 
    notificaciones,
    notificacionesNoLeidas,
    preferences,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    actualizarPreferencias,
    limpiarNotificacionesAntiguas
  } = useNotificationsStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Limpiar notificaciones antiguas al cargar
    limpiarNotificacionesAntiguas()
  }, [])

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter(notif => {
    // Filtro de búsqueda
    if (searchTerm && !notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notif.mensaje.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Filtro de tipo
    if (filterType !== 'all' && notif.tipo !== filterType) {
      return false
    }

    // Filtro de prioridad
    if (filterPriority !== 'all' && notif.priority !== filterPriority) {
      return false
    }

    // Filtro de estado
    if (filterStatus === 'unread' && notif.leida) {
      return false
    }
    if (filterStatus === 'read' && !notif.leida) {
      return false
    }

    return true
  })

  // Handlers
  const handleNotificationClick = async (notif) => {
    if (!notif.leida) {
      marcarComoLeida(notif.id)
    }
    
    // Simular envío de notificación por email para notificaciones urgentes
    if (notif.priority === 'urgente' && preferences.emailEnabled) {
      const { simularNotificacionEmail } = useNotificationsStore.getState()
      await simularNotificacionEmail(notif, { email: usuario?.email })
    }
    
    if (notif.actionUrl) {
      navigate(notif.actionUrl)
    }
  }

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation()
    
    const result = await showConfirm(
      '¿Eliminar notificación?',
      'Esta acción no se puede deshacer'
    )
    
    if (result.isConfirmed) {
      eliminarNotificacion(id)
      showSuccess('Notificación eliminada')
    }
  }

  const handleMarkAllAsRead = () => {
    marcarTodasComoLeidas()
    showSuccess('Todas las notificaciones marcadas como leídas')
  }

  const handleClearOld = async () => {
    const result = await showConfirm(
      '¿Limpiar notificaciones antiguas?',
      'Se eliminarán las notificaciones de más de 30 días'
    )
    
    if (result.isConfirmed) {
      limpiarNotificacionesAntiguas()
      showSuccess('Notificaciones antiguas eliminadas')
    }
  }

  const handlePreferenceChange = (key, value) => {
    actualizarPreferencias({ [key]: value })
  }

  // Iconos por tipo
  const getIcon = (tipo) => {
    const icons = {
      mensaje: FiMessageSquare,
      asistencia: FiUsers,
      academico: FiCalendar,
      pago: FiDollarSign,
      sistema: FiAlertCircle
    }
    const Icon = icons[tipo] || FiBell
    return <Icon className="w-5 h-5" />
  }

  // Colores por prioridad
  const getPriorityColor = (priority) => {
    const colors = {
      baja: 'border-gray-300 bg-gray-50',
      media: 'border-blue-300 bg-blue-50',
      alta: 'border-orange-300 bg-orange-50',
      urgente: 'border-red-300 bg-red-50'
    }
    return colors[priority] || colors.media
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Centro de Notificaciones</h1>
              <p className="text-gray-600 mt-1">
                {notificacionesNoLeidas > 0 
                  ? `${notificacionesNoLeidas} notificaciones sin leer`
                  : 'Todas las notificaciones leídas'
                }
              </p>
            </div>
            
            <div className="flex gap-2">
              <AnimatedButton
                variant="secondary"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                icon={FiSettings}
              >
                Configuración
              </AnimatedButton>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar notificaciones..."
              className="flex-1"
            />
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="mensaje">Mensajes</option>
                <option value="asistencia">Asistencia</option>
                <option value="academico">Académico</option>
                <option value="pago">Pagos</option>
                <option value="sistema">Sistema</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las prioridades</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="unread">No leídas</option>
                <option value="read">Leídas</option>
              </select>
            </div>
          </div>

          {/* Acciones rápidas */}
          {notificacionesFiltradas.length > 0 && (
            <div className="flex gap-2">
              {notificacionesNoLeidas > 0 && (
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  icon={FiCheck}
                >
                  Marcar todas como leídas
                </AnimatedButton>
              )}
              <AnimatedButton
                variant="secondary"
                size="sm"
                onClick={handleClearOld}
                icon={FiTrash2}
              >
                Limpiar antiguas
              </AnimatedButton>
            </div>
          )}
        </div>

        {/* Panel de configuración */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Configuración de Notificaciones
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuración por tipo */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Tipos de notificación</h4>
                  <div className="space-y-2">
                    {Object.entries({
                      mensaje: 'Mensajes',
                      asistencia: 'Asistencia',
                      academico: 'Académico',
                      pago: 'Pagos',
                      sistema: 'Sistema'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <span className="text-gray-700">{label}</span>
                        <input
                          type="checkbox"
                          checked={preferences[key]}
                          onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Configuración de métodos */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Métodos de notificación</h4>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FiVolume2 className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Sonido</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.soundEnabled}
                        onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FiBell className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Notificaciones emergentes</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.toastEnabled}
                        onChange={(e) => handlePreferenceChange('toastEnabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Email (próximamente)</span>
                      </div>
                      <input
                        type="checkbox"
                        disabled
                        className="w-4 h-4 text-gray-400 rounded cursor-not-allowed"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FiSmartphone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">SMS (próximamente)</span>
                      </div>
                      <input
                        type="checkbox"
                        disabled
                        className="w-4 h-4 text-gray-400 rounded cursor-not-allowed"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  💡 Las notificaciones por email y SMS estarán disponibles cuando se conecte el backend
                </p>
                
                {/* Botones de prueba para simulación */}
                <div className="flex gap-2">
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      const testNotif = {
                        titulo: '🔔 Notificación de Prueba',
                        mensaje: 'Esta es una notificación de prueba para simular el envío por email',
                        priority: 'media'
                      }
                      const { simularNotificacionEmail } = useNotificationsStore.getState()
                      await simularNotificacionEmail(testNotif, { email: usuario?.email })
                    }}
                    icon={FiMail}
                  >
                    Probar Email
                  </AnimatedButton>
                  
                  <AnimatedButton
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      const testNotif = {
                        titulo: '🚨 Alerta Urgente',
                        mensaje: 'Notificación urgente de prueba para SMS',
                        priority: 'urgente'
                      }
                      const { simularNotificacionSMS } = useNotificationsStore.getState()
                      await simularNotificacionSMS(testNotif, '+51 999 888 777')
                    }}
                    icon={FiSmartphone}
                  >
                    Probar SMS
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de notificaciones */}
        <div className="space-y-2">
          {notificacionesFiltradas.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FiBell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No hay notificaciones que mostrar</p>
            </div>
          ) : (
            notificacionesFiltradas.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md border-l-4 ${getPriorityColor(notif.priority)} ${
                  !notif.leida ? 'font-medium' : 'opacity-75'
                }`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${notif.leida ? 'bg-gray-100' : 'bg-blue-100'}`}>
                      {getIcon(notif.tipo)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-800">{notif.titulo}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notif.mensaje}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{new Date(notif.timestamp || notif.fecha).toLocaleString()}</span>
                        <span className="capitalize">{notif.tipo}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          notif.priority === 'urgente' ? 'bg-red-100 text-red-700' :
                          notif.priority === 'alta' ? 'bg-orange-100 text-orange-700' :
                          notif.priority === 'media' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {notif.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteNotification(notif.id, e)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Información adicional */}
        {notificacionesFiltradas.length > 10 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Mostrando {notificacionesFiltradas.length} notificaciones
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications