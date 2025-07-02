import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiMail, 
  FiInbox, 
  FiAlertCircle, 
  FiClock, 
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
  FiCalendar
} from 'react-icons/fi'

const CommuniqueStats = ({ estadisticas, loading = false }) => {
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
      title: 'Total Comunicados',
      value: estadisticas.total,
      icon: FiMail,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+2 esta semana'
    },
    {
      title: 'No Leídos',
      value: estadisticas.noLeidos,
      icon: FiInbox,
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-50',
      change: `${estadisticas.noLeidos > 0 ? 'Pendientes' : 'Al día'}`
    },
    {
      title: 'Alta Prioridad',
      value: estadisticas.porPrioridad.alta,
      icon: FiAlertCircle,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'Requieren atención'
    },
    {
      title: 'Esta Semana',
      value: Math.floor(estadisticas.total * 0.3), // Simulación
      icon: FiCalendar,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      change: 'Comunicados recientes'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
  )
}

export default CommuniqueStats