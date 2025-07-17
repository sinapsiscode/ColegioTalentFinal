import React from 'react'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import AnimatedCard from '../common/AnimatedCard'

const AttendanceCalendar = ({ 
  registros, 
  mesActual = new Date(), 
  onDateSelect,
  onRecordClick,
  selectedDate,
  tutorSeleccionado,
  tutores = [],
  tipo = 'estudiantes'
}) => {
  const inicioMes = startOfMonth(mesActual)
  const finMes = endOfMonth(mesActual)
  const diasDelMes = eachDayOfInterval({ start: inicioMes, end: finMes })
  
  const obtenerRegistroPorDia = (dia) => {
    return registros.find(registro => 
      isSameDay(new Date(registro.fecha), dia)
    )
  }

  const obtenerRegistrosPorDia = (dia) => {
    return registros.filter(registro => 
      isSameDay(new Date(registro.fecha), dia)
    )
  }

  const obtenerTutorPorId = (tutorId) => {
    return tutores.find(tutor => tutor.id === tutorId)
  }
  
  const obtenerEstiloDia = (dia, registrosDelDia) => {
    let baseClasses = "w-full h-14 flex flex-col items-center justify-center text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer relative"
    
    if (isToday(dia)) {
      baseClasses += " ring-2 ring-talentos-primary"
    }
    
    if (selectedDate && isSameDay(selectedDate, dia)) {
      baseClasses += " ring-2 ring-blue-400 bg-blue-50"
    }
    
    if (!registrosDelDia || registrosDelDia.length === 0) {
      return `${baseClasses} bg-gray-50 text-gray-400 hover:bg-gray-100`
    }
    
    // Para tutores, puede haber múltiples registros en un día
    if (tipo === 'tutores' && !tutorSeleccionado) {
      // Mostrar resumen de todos los tutores
      const presentes = registrosDelDia.filter(r => r.estado === 'presente').length
      const tardanzas = registrosDelDia.filter(r => r.estado === 'tarde').length
      const faltas = registrosDelDia.filter(r => r.estado === 'falta').length
      
      if (presentes > tardanzas && presentes > faltas) {
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`
      } else if (tardanzas > 0) {
        return `${baseClasses} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`
      } else {
        return `${baseClasses} bg-red-100 text-red-800 hover:bg-red-200`
      }
    }
    
    // Para un tutor específico o estudiantes
    const registro = registrosDelDia[0]
    switch (registro.estado) {
      case 'presente':
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`
      case 'tarde':
        return `${baseClasses} bg-yellow-100 text-yellow-800 hover:bg-yellow-200`
      case 'falta':
        return `${baseClasses} bg-red-100 text-red-800 hover:bg-red-200`
      default:
        return `${baseClasses} bg-gray-50 text-gray-400 hover:bg-gray-100`
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
          Calendario de Asistencia {tipo === 'tutores' ? 'de Tutores' : ''} - {format(mesActual, 'MMMM yyyy', { locale: es })}
        </h3>
        {tutorSeleccionado && tutores.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            Mostrando registros de: {obtenerTutorPorId(tutorSeleccionado)?.nombre}
          </p>
        )}
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
          const registrosDelDia = obtenerRegistrosPorDia(dia)
          const registro = obtenerRegistroPorDia(dia)
          const numeroDia = format(dia, 'd')
          
          const handleClick = () => {
            if (onDateSelect) {
              onDateSelect(dia)
            }
            if (onRecordClick && registrosDelDia.length > 0) {
              // Si hay múltiples registros, enviar el primero o todos
              onRecordClick(registrosDelDia.length === 1 ? registrosDelDia[0] : registrosDelDia)
            }
          }

          const getTooltip = () => {
            if (registrosDelDia.length === 0) {
              return format(dia, 'dd/MM/yyyy')
            }
            
            if (tipo === 'tutores' && !tutorSeleccionado && registrosDelDia.length > 1) {
              const presentes = registrosDelDia.filter(r => r.estado === 'presente').length
              const tardanzas = registrosDelDia.filter(r => r.estado === 'tarde').length
              const faltas = registrosDelDia.filter(r => r.estado === 'falta').length
              return `${format(dia, 'dd/MM/yyyy')} - Presentes: ${presentes}, Tardanzas: ${tardanzas}, Faltas: ${faltas}`
            }
            
            return `${registro?.estado || 'Sin datos'} - ${format(dia, 'dd/MM/yyyy')}`
          }
          
          return (
            <motion.div
              key={dia.toISOString()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={obtenerEstiloDia(dia, registrosDelDia)}
              title={getTooltip()}
              onClick={handleClick}
            >
              <div className="flex flex-col items-center">
                <span className="text-xs mb-1">{numeroDia}</span>
                {registro && obtenerIconoEstado(registro.estado)}
                {tipo === 'tutores' && !tutorSeleccionado && registrosDelDia.length > 1 && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {registrosDelDia.length}
                  </div>
                )}
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
          {tipo === 'tutores' && !tutorSeleccionado && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                #
              </div>
              <span className="text-gray-600">Múltiples registros</span>
            </div>
          )}
        </div>
        
        {tipo === 'tutores' && (
          <div className="mt-2 text-xs text-gray-500">
            <p>💡 Tip: Haz clic en un día para ver los detalles de asistencia</p>
            {!tutorSeleccionado && (
              <p>📊 Los días con múltiples tutores muestran el resumen general</p>
            )}
          </div>
        )}
      </div>
    </AnimatedCard>
  )
}

export default AttendanceCalendar