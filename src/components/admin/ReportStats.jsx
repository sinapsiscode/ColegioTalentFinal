import React from 'react'
import { motion } from 'framer-motion'
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiTrendingUp,
  FiBarChart,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi'

const ReportStats = ({ estadisticas, loading = false }) => {
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
      title: 'Total Reportes',
      value: estadisticas.total,
      icon: FiFileText,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      change: `${estadisticas.actualizados} actualizados`
    },
    {
      title: 'Actualizados',
      value: estadisticas.actualizados,
      icon: FiCheckCircle,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      change: 'Estados al día'
    },
    {
      title: 'Pendientes',
      value: estadisticas.pendientes,
      icon: FiClock,
      color: 'bg-yellow-100 text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: `${estadisticas.generando} generando`
    },
    {
      title: 'Total Accesos',
      value: estadisticas.totalAccesos,
      icon: FiEye,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
      change: `${estadisticas.promedioAccesos} promedio`
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
        {/* Distribución por categoría */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiBarChart className="w-5 h-5 text-blue-600" />
            <span>Por Categoría</span>
          </h3>
          
          <div className="space-y-3">
            {Object.entries(estadisticas.porCategoria).map(([categoria, cantidad]) => (
              cantidad > 0 && (
                <div key={categoria} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {categoria.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(cantidad / estadisticas.total) * 100}%` }}
                        transition={{ duration: 1 }}
                        className="bg-blue-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-6">{cantidad}</span>
                  </div>
                </div>
              )
            ))}
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
            <span>Estados</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiCheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Actualizados</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-green-600">{estadisticas.actualizados}</span>
                <span className="text-xs text-gray-500">
                  {Math.round((estadisticas.actualizados / estadisticas.total) * 100)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-600">Pendientes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-yellow-600">{estadisticas.pendientes}</span>
                <span className="text-xs text-gray-500">
                  {Math.round((estadisticas.pendientes / estadisticas.total) * 100)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiRefreshCw className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Generando</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-blue-600">{estadisticas.generando}</span>
                <span className="text-xs text-gray-500">
                  {Math.round((estadisticas.generando / estadisticas.total) * 100)}%
                </span>
              </div>
            </div>
            
            {/* Progreso general */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completitud General</span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.round((estadisticas.actualizados / estadisticas.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(estadisticas.actualizados / estadisticas.total) * 100}%` }}
                  transition={{ duration: 1.5 }}
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                ></motion.div>
              </div>
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
          {estadisticas.pendientes > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-800 font-medium">
                📊 {estadisticas.pendientes} reporte{estadisticas.pendientes > 1 ? 's' : ''} pendiente{estadisticas.pendientes > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Considera programar la generación automática
              </p>
            </div>
          )}
          
          {estadisticas.promedioAccesos > 20 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-800 font-medium">
                📈 Alta demanda: {estadisticas.promedioAccesos} accesos promedio
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Los reportes son muy consultados
              </p>
            </div>
          )}
          
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm text-gray-800 font-medium">
              💡 Optimización sugerida
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Automatiza reportes frecuentes para mejor eficiencia
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ReportStats