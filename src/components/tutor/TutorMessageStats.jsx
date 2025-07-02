import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiMessageSquare, 
  FiUsers, 
  FiShield,
  FiUserCheck,
  FiClock,
  FiTrendingUp
} from 'react-icons/fi'

const TutorMessageStats = ({ estadisticas, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Conversaciones',
      value: estadisticas.total,
      icon: FiMessageSquare,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      change: `${estadisticas.activas} activas`
    },
    {
      title: 'Mensajes No Leídos',
      value: estadisticas.noLeidos,
      icon: FiClock,
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-50',
      change: estadisticas.noLeidos === 0 ? 'Al día' : 'Pendientes'
    },
    {
      title: 'Padres de Familia',
      value: estadisticas.padres,
      icon: FiUsers,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      change: 'Comunicación familiar'
    },
    {
      title: 'Administración',
      value: estadisticas.administracion,
      icon: FiShield,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Gestión académica'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className={`${stat.bgColor} rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600 mt-1">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Distribución por tipo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiTrendingUp className="w-5 h-5 text-blue-600" />
            <span>Distribución de Conversaciones</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiUsers className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Padres de Familia</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(estadisticas.padres / estadisticas.total) * 100}%` }}
                    transition={{ duration: 1 }}
                    className="bg-green-500 h-2 rounded-full"
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-gray-900">{estadisticas.padres}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiShield className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Administración</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(estadisticas.administracion / estadisticas.total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="bg-purple-500 h-2 rounded-full"
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-gray-900">{estadisticas.administracion}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiUserCheck className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Colegas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(estadisticas.colegas / estadisticas.total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="bg-blue-500 h-2 rounded-full"
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-gray-900">{estadisticas.colegas}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Estado de conversaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiClock className="w-5 h-5 text-orange-600" />
            <span>Estado de Actividad</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversaciones Activas</span>
              <span className="text-sm font-medium text-green-600">{estadisticas.activas}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mensajes Pendientes</span>
              <span className="text-sm font-medium text-red-600">{estadisticas.noLeidos}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total de Chats</span>
              <span className="text-sm font-medium text-gray-900">{estadisticas.total}</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Tasa de respuesta</span>
              <span>{Math.round((estadisticas.activas / estadisticas.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(estadisticas.activas / estadisticas.total) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-green-500 h-2 rounded-full"
              ></motion.div>
            </div>
          </div>
        </motion.div>

        {/* Consejos de comunicación */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiMessageSquare className="w-5 h-5 text-green-600" />
            <span>Resumen</span>
          </h3>
          
          <div className="space-y-3">
            {estadisticas.noLeidos > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium">
                  Tienes {estadisticas.noLeidos} mensaje{estadisticas.noLeidos > 1 ? 's' : ''} sin leer
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Revisar y responder para mantener buena comunicación
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">
                  ¡Excelente! Estás al día con todos los mensajes
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Mantén esta comunicación fluida con padres y colegas
                </p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                {estadisticas.activas} conversación{estadisticas.activas !== 1 ? 'es' : ''} activa{estadisticas.activas !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Comunicación frecuente con la comunidad educativa
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TutorMessageStats