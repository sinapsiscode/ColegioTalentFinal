import React from 'react'
import { motion } from 'framer-motion'
import {
  FiUser,
  FiBookOpen,
  FiBook,
  FiSettings,
  FiClock,
  FiMessageSquare,
  FiEdit3,
  FiCheckCircle
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ActiveUsers = ({ usuarios, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getUserIcon = (tipo) => {
    switch (tipo) {
      case 'profesor': return FiBook
      case 'padre': return FiUser
      case 'administrativo': return FiSettings
      case 'estudiante': return FiBookOpen
      default: return FiUser
    }
  }

  const getUserColor = (tipo) => {
    switch (tipo) {
      case 'profesor': return 'bg-blue-100 text-blue-600'
      case 'padre': return 'bg-green-100 text-green-600'
      case 'administrativo': return 'bg-purple-100 text-purple-600'
      case 'estudiante': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activo': return 'bg-green-500'
      case 'ausente': return 'bg-yellow-500'
      case 'inactivo': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const formatTimeAgo = (fecha) => {
    const now = new Date()
    const diff = now - new Date(fecha)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 60) {
      return `hace ${minutes} min`
    } else {
      return `hace ${hours}h`
    }
  }

  const getActivityInfo = (usuario) => {
    switch (usuario.tipo) {
      case 'profesor':
        return {
          icon: FiMessageSquare,
          text: `${usuario.comunicadosEnviados || 0} comunicados`,
          detail: usuario.grado
        }
      case 'padre':
        return {
          icon: FiEdit3,
          text: `${usuario.mensajesLeidos || 0} mensajes leídos`,
          detail: `Padre/Madre de ${usuario.estudiante}`
        }
      case 'administrativo':
        return {
          icon: FiCheckCircle,
          text: `${usuario.tareasPendientes || 0} tareas pendientes`,
          detail: usuario.cargo
        }
      default:
        return {
          icon: FiUser,
          text: 'Usuario',
          detail: 'Sin información'
        }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FiUser className="w-5 h-5 text-talentos-primary" />
          <span>Usuarios Activos</span>
        </h3>
        <span className="text-xs text-gray-500">{usuarios.length} conectados</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {usuarios.map((usuario, index) => {
          const IconComponent = getUserIcon(usuario.tipo)
          const colorClass = getUserColor(usuario.tipo)
          const statusColor = getStatusColor(usuario.estado)
          const activityInfo = getActivityInfo(usuario)
          const ActivityIcon = activityInfo.icon

          return (
            <motion.div
              key={usuario.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusColor} rounded-full border-2 border-white`}></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {usuario.nombre}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTimeAgo(usuario.ultimaActividad)}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 truncate">
                  {activityInfo.detail}
                </p>
                
                <div className="flex items-center space-x-1 mt-1">
                  <ActivityIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{activityInfo.text}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  usuario.tipo === 'profesor' ? 'bg-blue-100 text-blue-800' :
                  usuario.tipo === 'padre' ? 'bg-green-100 text-green-800' :
                  usuario.tipo === 'administrativo' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)}
                </span>
                
                <div className="flex items-center space-x-1">
                  <FiClock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {format(new Date(usuario.ultimaActividad), 'HH:mm')}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {usuarios.length === 0 && (
        <div className="text-center py-8">
          <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No hay usuarios activos</p>
        </div>
      )}
    </div>
  )
}

export default ActiveUsers