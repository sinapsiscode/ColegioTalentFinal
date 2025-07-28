import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiUsers, 
  FiBookOpen, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
  FiTarget,
  FiActivity
} from 'react-icons/fi'

const TutorStats = ({ estadisticas, loading = false, onStatClick }) => {
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
      title: 'Estudiantes Activos',
      value: estadisticas.estudiantes.activos,
      total: estadisticas.estudiantes.total,
      icon: FiUsers,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      change: `${estadisticas.estudiantes.total} total`,
      trend: 'neutral'
    },
    {
      title: 'Clases Completadas',
      value: estadisticas.clases.completadas,
      total: estadisticas.clases.total,
      icon: FiBookOpen,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      change: `${estadisticas.clases.pendientes} pendientes`,
      trend: 'up'
    },
    {
      title: 'Actividades Urgentes',
      value: estadisticas.actividades.urgentes,
      total: estadisticas.actividades.pendientes,
      icon: FiAlertTriangle,
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-50',
      change: `${estadisticas.actividades.pendientes} pendientes`,
      trend: estadisticas.actividades.urgentes > 0 ? 'down' : 'up'
    },
    {
      title: 'Promedio General',
      value: estadisticas.estudiantes.promedioGeneral.toFixed(1),
      icon: FiTarget,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
      change: `${estadisticas.estudiantes.asistenciaPromedio.toFixed(0)}% asistencia`,
      trend: estadisticas.estudiantes.promedioGeneral >= 16 ? 'up' : 'neutral'
    }
  ]

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return FiTrendingUp
      case 'down': return FiAlertTriangle
      default: return FiActivity
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const TrendIcon = getTrendIcon(stat.trend)
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              onClick={() => {
                if (onStatClick) {
                  onStatClick(stat.title)
                }
              }}
              className={`${stat.bgColor} rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 cursor-pointer hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{stat.title}</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.total && (
                      <p className="text-sm text-gray-600">/ {stat.total}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendIcon className={`w-3 h-3 ${getTrendColor(stat.trend)}`} />
                    <p className="text-xs text-gray-600">{stat.change}</p>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estudiantes breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            if (onStatClick) {
              onStatClick('estudiantes-detalle')
            }
          }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiUsers className="w-5 h-5 text-blue-600" />
            <span>Estado de Estudiantes</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Activos</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(estadisticas.estudiantes.activos / estadisticas.estudiantes.total) * 100}%` }}
                    transition={{ duration: 1 }}
                    className="bg-green-500 h-2 rounded-full"
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-gray-900">{estadisticas.estudiantes.activos}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Necesitan Atención</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(estadisticas.estudiantes.necesitanAtencion / estadisticas.estudiantes.total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="bg-red-500 h-2 rounded-full"
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-gray-900">{estadisticas.estudiantes.necesitanAtencion}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Clases breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            if (onStatClick) {
              onStatClick('clases-detalle')
            }
          }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiBookOpen className="w-5 h-5 text-green-600" />
            <span>Clases de Hoy</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completadas</span>
              <span className="text-sm font-medium text-green-600">{estadisticas.clases.completadas}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En Curso</span>
              <span className="text-sm font-medium text-blue-600">{estadisticas.clases.enCurso}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pendientes</span>
              <span className="text-sm font-medium text-yellow-600">{estadisticas.clases.pendientes}</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progreso del día</span>
              <span>{Math.round((estadisticas.clases.completadas / estadisticas.clases.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(estadisticas.clases.completadas / estadisticas.clases.total) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-green-500 h-2 rounded-full"
              ></motion.div>
            </div>
          </div>
        </motion.div>

        {/* Actividades breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            if (onStatClick) {
              onStatClick('actividades-detalle')
            }
          }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiCheckCircle className="w-5 h-5 text-purple-600" />
            <span>Actividades</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completadas</span>
              <span className="text-sm font-medium text-green-600">{estadisticas.actividades.completadas}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pendientes</span>
              <span className="text-sm font-medium text-yellow-600">{estadisticas.actividades.pendientes}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Urgentes</span>
              <div className="flex items-center space-x-1">
                {estadisticas.actividades.urgentes > 0 && (
                  <FiClock className="w-3 h-3 text-red-600" />
                )}
                <span className="text-sm font-medium text-red-600">{estadisticas.actividades.urgentes}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progreso general</span>
              <span>{Math.round((estadisticas.actividades.completadas / estadisticas.actividades.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(estadisticas.actividades.completadas / estadisticas.actividades.total) * 100}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="bg-purple-500 h-2 rounded-full"
              ></motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TutorStats