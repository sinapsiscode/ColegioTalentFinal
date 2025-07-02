import React from 'react'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiXCircle, FiClock, FiCalendar } from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AnimatedCard from '../common/AnimatedCard'

const AttendanceCard = ({ registro, alumno, onClick }) => {
  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'presente':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />
      case 'tarde':
        return <FiClock className="w-5 h-5 text-yellow-600" />
      case 'falta':
        return <FiXCircle className="w-5 h-5 text-red-600" />
      default:
        return <FiCalendar className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (estado) => {
    const styles = {
      presente: 'bg-green-100 text-green-800',
      tarde: 'bg-yellow-100 text-yellow-800', 
      falta: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      presente: 'Presente',
      tarde: 'Tardanza',
      falta: 'Falta'
    }

    return (
      <span className={`badge ${styles[estado]}`}>
        {labels[estado]}
      </span>
    )
  }

  const formatTime = (date) => {
    if (!date) return '--'
    return format(new Date(date), 'HH:mm', { locale: es })
  }

  return (
    <AnimatedCard 
      onClick={onClick}
      className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {getStatusIcon(registro.estado)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                {format(new Date(registro.fecha), 'EEEE, d MMMM yyyy', { locale: es })}
              </h3>
              {getStatusBadge(registro.estado)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Entrada:</span> {formatTime(registro.horaEntrada)}
              </div>
              <div>
                <span className="font-medium">Salida:</span> {formatTime(registro.horaSalida)}
              </div>
            </div>
            
            {registro.observaciones && (
              <div className="mt-2 text-sm text-gray-500">
                <span className="font-medium">Observaciones:</span> {registro.observaciones}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}

export default AttendanceCard