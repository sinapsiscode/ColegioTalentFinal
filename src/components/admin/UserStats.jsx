import React from 'react'
import { motion } from 'framer-motion'
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiUserPlus,
  FiBook,
  FiSettings,
  FiTrendingUp,
  FiClock
} from 'react-icons/fi'

const UserStats = ({ estadisticas, loading = false }) => {
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
      title: 'Total Usuarios',
      value: estadisticas.total,
      icon: FiUsers,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      change: `${estadisticas.activos} activos`
    },
    {
      title: 'Usuarios Activos',
      value: estadisticas.activos,
      icon: FiUserCheck,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      change: `${Math.round((estadisticas.activos / estadisticas.total) * 100)}% del total`
    },
    {
      title: 'Nuevos Este Mes',
      value: estadisticas.nuevosEstesMes,
      icon: FiUserPlus,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Registros recientes'
    },
    {
      title: 'Conectados Hoy',
      value: estadisticas.conectadosHoy,
      icon: FiClock,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'Actividad diaria'
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distribución por tipo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiUsers className="w-5 h-5 text-blue-600" />
            <span>Por Tipo de Usuario</span>
          </h3>
          
          <div className="space-y-3">
            {Object.entries(estadisticas.porTipo).map(([tipo, cantidad]) => {
              const percentage = Math.round((cantidad / estadisticas.total) * 100)
              
              const tipoConfig = {
                profesores: { icon: FiBook, color: 'bg-blue-500', label: 'Profesores' },
                padres: { icon: FiUsers, color: 'bg-green-500', label: 'Padres' },
                administrativos: { icon: FiSettings, color: 'bg-purple-500', label: 'Administrativos' },
                estudiantes: { icon: FiUserCheck, color: 'bg-orange-500', label: 'Estudiantes' }
              }
              
              const config = tipoConfig[tipo] || { icon: FiUsers, color: 'bg-gray-500', label: tipo }
              
              return (
                <div key={tipo} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <config.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{config.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1 }}
                        className={`${config.color} h-2 rounded-full`}
                      ></motion.div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{cantidad}</span>
                    <span className="text-xs text-gray-500 w-10">{percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Estados y tendencias */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            <span>Estados de Usuario</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiUserCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Activos</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-green-600">{estadisticas.activos}</span>
                <span className="text-xs text-gray-500">
                  {Math.round((estadisticas.activos / estadisticas.total) * 100)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Inactivos</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-600">{estadisticas.inactivos}</span>
                <span className="text-xs text-gray-500">
                  {Math.round((estadisticas.inactivos / estadisticas.total) * 100)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiUserX className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600">Suspendidos</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-red-600">{estadisticas.suspendidos}</span>
                <span className="text-xs text-gray-500">
                  {Math.round((estadisticas.suspendidos / estadisticas.total) * 100)}%
                </span>
              </div>
            </div>
            
            {/* Progreso general */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Usuarios Saludables</span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.round(((estadisticas.activos + estadisticas.inactivos) / estadisticas.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((estadisticas.activos + estadisticas.inactivos) / estadisticas.total) * 100}%` }}
                  transition={{ duration: 1.5 }}
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                ></motion.div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Porcentaje de usuarios activos e inactivos (sin suspensiones)
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recomendaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-talentos-primary/10 to-talentos-secondary/10 rounded-lg border border-talentos-primary/20 p-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <FiTrendingUp className="w-5 h-5 text-talentos-primary" />
          <span>Análisis y Recomendaciones</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {estadisticas.suspendidos > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-800 font-medium">
                ⚠️ {estadisticas.suspendidos} usuario{estadisticas.suspendidos > 1 ? 's' : ''} suspendido{estadisticas.suspendidos > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Revisa los motivos y considera reactivaciones
              </p>
            </div>
          )}
          
          {estadisticas.nuevosEstesMes > 5 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-800 font-medium">
                📈 {estadisticas.nuevosEstesMes} nuevos registros este mes
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Crecimiento positivo en la comunidad
              </p>
            </div>
          )}
          
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm text-gray-800 font-medium">
              💡 Gestión eficiente
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round((estadisticas.activos / estadisticas.total) * 100)}% de usuarios activos indica una buena gestión
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default UserStats