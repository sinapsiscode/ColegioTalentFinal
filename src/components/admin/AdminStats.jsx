import React from 'react'
import { motion } from 'framer-motion'
import {
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiBook,
  FiMessageSquare,
  FiTrendingUp,
  FiStar,
  FiTarget,
  FiActivity,
  FiAward
} from 'react-icons/fi'

const AdminStats = ({ estadisticas, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
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
      value: estadisticas.totalUsuarios,
      icon: FiUsers,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      change: `${estadisticas.usuariosActivos} activos`
    },
    {
      title: 'Estudiantes',
      value: estadisticas.totalEstudiantes,
      icon: FiBookOpen,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      change: `${estadisticas.asistenciaPromedio}% asistencia`
    },
    {
      title: 'Profesores',
      value: estadisticas.totalProfesores,
      icon: FiBook,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Personal docente'
    },
    {
      title: 'Padres de Familia',
      value: estadisticas.totalPadres,
      icon: FiUserCheck,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'Familias registradas'
    },
    {
      title: 'Comunicados',
      value: estadisticas.comunicadosEnviados,
      icon: FiMessageSquare,
      color: 'bg-cyan-100 text-cyan-600',
      bgColor: 'bg-cyan-50',
      change: `${estadisticas.comunicadosHoy} hoy`
    },
    {
      title: 'Promedio General',
      value: estadisticas.promedioCalificaciones,
      icon: FiTrendingUp,
      color: 'bg-indigo-100 text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: 'Rendimiento académico'
    },
    {
      title: 'Satisfacción',
      value: `${estadisticas.satisfaccionPadres}/5`,
      icon: FiStar,
      color: 'bg-yellow-100 text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: 'Evaluación padres'
    },
    {
      title: 'Asistencia',
      value: `${estadisticas.asistenciaPromedio}%`,
      icon: FiTarget,
      color: 'bg-pink-100 text-pink-600',
      bgColor: 'bg-pink-50',
      change: 'Promedio mensual'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {statsCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
          className={`${stat.bgColor} rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 transition-all duration-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">{stat.title}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{stat.change}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default AdminStats