import React from 'react'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiUsers } from 'react-icons/fi'
import AnimatedCard from '../common/AnimatedCard'
import CountUpNumber from '../common/CountUpNumber'

const AttendanceStats = ({ estadisticas, tipo = 'estudiantes' }) => {
  // Determinar qué estadísticas mostrar según el tipo
  const getStats = () => {
    if (tipo === 'tutores') {
      return [
        {
          titulo: 'Total Tutores',
          valor: estadisticas.tutores || estadisticas.total,
          icono: FiUsers,
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
    } else if (tipo === 'scanner') {
      return [
        {
          titulo: 'Total Escaneos',
          valor: estadisticas.totalEscaneos,
          icono: FiTrendingUp,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          titulo: 'Estudiantes',
          valor: estadisticas.estudiantes,
          icono: FiUsers,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          titulo: 'Tutores',
          valor: estadisticas.tutores || estadisticas.profesores,
          icono: FiUsers,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        },
        {
          titulo: 'Entradas',
          valor: estadisticas.entradas,
          icono: FiCheckCircle,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        }
      ]
    } else {
      // Formato original para estudiantes
      return [
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
    }
  }

  const stats = getStats()

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