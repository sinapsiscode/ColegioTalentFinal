import React from 'react'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiXCircle, FiClock, FiTrendingUp } from 'react-icons/fi'
import AnimatedCard from '../common/AnimatedCard'
import CountUpNumber from '../common/CountUpNumber'

const AttendanceStats = ({ estadisticas }) => {
  const stats = [
    {
      titulo: 'Total Clases',
      valor: estadisticas.total,
      icono: FiTrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      titulo: 'Presentes',
      valor: estadisticas.presentes,
      icono: FiCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      titulo: 'Tardanzas',
      valor: estadisticas.tardes,
      icono: FiClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      titulo: 'Faltas',
      valor: estadisticas.faltas,
      icono: FiXCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icono = stat.icono
        return (
          <AnimatedCard key={stat.titulo} delay={index * 0.1}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.titulo}</p>
                <CountUpNumber 
                  value={stat.valor}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icono className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </AnimatedCard>
        )
      })}
    </div>
  )
}

export default AttendanceStats