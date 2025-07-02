import React from 'react'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import AnimatedCard from '../common/AnimatedCard'

const AttendanceCalendar = ({ registros, mesActual = new Date() }) => {
  const inicioMes = startOfMonth(mesActual)
  const finMes = endOfMonth(mesActual)
  const diasDelMes = eachDayOfInterval({ start: inicioMes, end: finMes })
  
  const obtenerRegistroPorDia = (dia) => {
    return registros.find(registro => 
      isSameDay(new Date(registro.fecha), dia)
    )
  }
  
  const obtenerEstiloDia = (dia, registro) => {
    let baseClasses = "w-full h-12 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200"
    
    if (isToday(dia)) {
      baseClasses += " ring-2 ring-talentos-primary"
    }
    
    if (!registro) {
      return `${baseClasses} bg-gray-50 text-gray-400`
    }
    
    switch (registro.estado) {
      case 'presente':
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`
      case 'tarde':
        return `${baseClasses} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`
      case 'falta':
        return `${baseClasses} bg-red-100 text-red-800 hover:bg-red-200`
      default:
        return `${baseClasses} bg-gray-50 text-gray-400`
    }
  }
  
  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'presente':
        return <FiCheckCircle className="w-4 h-4" />
      case 'tarde':
        return <FiClock className="w-4 h-4" />
      case 'falta':
        return <FiXCircle className="w-4 h-4" />
      default:
        return null
    }
  }
  
  return (
    <AnimatedCard>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Calendario de Asistencia - {format(mesActual, 'MMMM yyyy', { locale: es })}
        </h3>
      </div>
      
      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
          <div key={dia} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {dia}
          </div>
        ))}
      </div>
      
      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {diasDelMes.map(dia => {
          const registro = obtenerRegistroPorDia(dia)
          const numeroDia = format(dia, 'd')
          
          return (
            <motion.div
              key={dia.toISOString()}
              whileHover={{ scale: 1.05 }}
              className={obtenerEstiloDia(dia, registro)}
              title={registro ? `${registro.estado} - ${format(dia, 'dd/MM/yyyy')}` : format(dia, 'dd/MM/yyyy')}
            >
              <div className="flex flex-col items-center">
                <span className="text-xs mb-1">{numeroDia}</span>
                {registro && obtenerIconoEstado(registro.estado)}
              </div>
            </motion.div>
          )
        })}
      </div>
      
      {/* Leyenda */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Leyenda:</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <FiCheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-gray-600">Presente</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiClock className="w-3 h-3 text-yellow-600" />
            <span className="text-gray-600">Tardanza</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiXCircle className="w-3 h-3 text-red-600" />
            <span className="text-gray-600">Falta</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-gray-600">Sin datos</span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}

export default AttendanceCalendar