import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiBell, 
  FiVolume2, 
  FiVolumeX, 
  FiMonitor,
  FiSmartphone,
  FiSettings,
  FiCheck,
  FiX,
  FiRefreshCw
} from 'react-icons/fi'
import useNotificationsStore from '../../stores/notificationsStore'
import useAuthStore from '../../stores/authStore'
import { showSuccess, showError } from '../../utils/sweetAlert'

/**
 * ⚙️ Módulo de Preferencias de Notificaciones
 * Permite configurar qué notificaciones recibir por rol
 */
const NotificationPreferences = ({ isModal = false, onClose }) => {
  const { usuario, rol } = useAuthStore()
  const {
    preferences,
    actualizarPreferencias,
    esTipoHabilitado,
    generarNotificacionesPrueba,
    limpiarNotificaciones
  } = useNotificationsStore()
  
  const [localPreferences, setLocalPreferences] = useState(preferences)
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setLocalPreferences(preferences)
  }, [preferences])

  // Detectar cambios
  useEffect(() => {
    const hasChanges = JSON.stringify(localPreferences) !== JSON.stringify(preferences)
    setHasChanges(hasChanges)
  }, [localPreferences, preferences])

  // Configuración de tipos de notificaciones por rol
  const getNotificationTypes = () => {
    const allTypes = [
      {
        key: 'academico',
        title: '📊 Académicas',
        description: 'Nuevas calificaciones, notas y reportes académicos',
        roles: ['padre', 'tutor', 'admin']
      },
      {
        key: 'asistencia',
        title: '👥 Asistencia',
        description: 'Entradas, salidas, tardanzas y ausencias',
        roles: ['padre', 'tutor', 'admin']
      },
      {
        key: 'comunicado',
        title: '📢 Comunicados',
        description: 'Anuncios importantes y circulares del colegio',
        roles: ['padre', 'tutor', 'admin']
      },
      {
        key: 'mensaje',
        title: '💬 Mensajes',
        description: 'Mensajes privados de profesores y administradores',
        roles: ['padre', 'tutor', 'admin']
      },
      {
        key: 'sistema',
        title: '⚙️ Sistema',
        description: 'Actualizaciones del sistema y mantenimientos',
        roles: ['admin', 'tutor']
      },
      {
        key: 'pago',
        title: '💳 Pagos',
        description: 'Recordatorios de pagos y mensualidades',
        roles: ['padre', 'admin']
      },
      {
        key: 'usuario',
        title: '👤 Usuarios',
        description: 'Nuevos registros y cambios de usuarios',
        roles: ['admin']
      },
      {
        key: 'evento',
        title: '📅 Eventos',
        description: 'Eventos escolares, reuniones y actividades',
        roles: ['padre', 'tutor', 'admin']
      },
      {
        key: 'tarea',
        title: '📝 Tareas',
        description: 'Recordatorios de tareas y proyectos',
        roles: ['padre', 'tutor']
      },
      {
        key: 'salud',
        title: '💊 Salud',
        description: 'Recordatorios médicos y de vacunación',
        roles: ['padre']
      }
    ]

    return allTypes.filter(type => type.roles.includes(rol))
  }

  const notificationTypes = getNotificationTypes()

  // Manejar cambios de preferencias
  const handlePreferenceChange = (key, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Guardar cambios
  const handleSave = async () => {
    setIsLoading(true)
    try {
      actualizarPreferencias(localPreferences)
      showSuccess('Preferencias guardadas', 'Tus preferencias de notificaciones han sido actualizadas')
      setHasChanges(false)
    } catch (error) {
      showError('Error', 'No se pudieron guardar las preferencias')
    } finally {
      setIsLoading(false)
    }
  }

  // Restaurar valores por defecto
  const handleReset = () => {
    setLocalPreferences(preferences)
    setHasChanges(false)
  }

  // Probar notificaciones
  const handleTestNotifications = () => {
    generarNotificacionesPrueba(usuario?.id, rol)
    showSuccess('Notificaciones de prueba enviadas', 'Revisa las notificaciones que aparecen')
  }

  // Limpiar todas las notificaciones
  const handleClearAll = () => {
    limpiarNotificaciones()
    showSuccess('Notificaciones limpiadas', 'Se han eliminado todas las notificaciones')
  }

  const containerClass = isModal 
    ? "bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
    : "bg-white rounded-xl shadow-sm border border-gray-200"

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiBell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Preferencias de Notificaciones
            </h2>
            <p className="text-sm text-gray-600">
              Configura qué notificaciones quieres recibir
            </p>
          </div>
        </div>
        
        {isModal && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 max-h-[60vh] overflow-y-auto">
        {/* Configuraciones generales */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración General</h3>
          <div className="space-y-4">
            {/* Toast habilitado */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FiMonitor className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Notificaciones emergentes</p>
                  <p className="text-sm text-gray-600">Mostrar toast notifications en pantalla</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.toastEnabled || false}
                  onChange={(e) => handlePreferenceChange('toastEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Sonido habilitado */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {localPreferences.soundEnabled ? (
                  <FiVolume2 className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiVolumeX className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">Sonidos de notificación</p>
                  <p className="text-sm text-gray-600">Reproducir sonido al recibir notificaciones</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.soundEnabled || false}
                  onChange={(e) => handlePreferenceChange('soundEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Tipos de notificaciones */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tipos de Notificaciones 
            <span className="text-sm font-normal text-gray-600 ml-2">
              (Disponibles para {rol})
            </span>
          </h3>
          <div className="space-y-3">
            {notificationTypes.map((type) => (
              <motion.div
                key={type.key}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl mt-1">
                    {type.title.split(' ')[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{type.title.split(' ').slice(1).join(' ')}</p>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={localPreferences[type.key] || false}
                    onChange={(e) => handlePreferenceChange(type.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Acciones de prueba */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Pruebas y Mantenimiento</h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleTestNotifications}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiBell className="w-4 h-4" />
              <span>Probar Notificaciones</span>
            </button>
            
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiX className="w-4 h-4" />
              <span>Limpiar Todo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          {hasChanges && (
            <span className="text-orange-600 font-medium">
              ⚠️ Tienes cambios sin guardar
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4 inline mr-2" />
              Revertir
            </button>
          )}
          
          <button
            onClick={hasChanges ? handleSave : (isModal ? onClose : undefined)}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
              hasChanges 
                ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : hasChanges ? (
              <>
                <FiCheck className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            ) : (
              <>
                <FiSettings className="w-4 h-4" />
                <span>{isModal ? 'Cerrar' : 'Todo listo'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationPreferences