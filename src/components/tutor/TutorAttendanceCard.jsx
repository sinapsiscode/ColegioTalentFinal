import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiCheckCircle, 
  FiClock, 
  FiXCircle, 
  FiMapPin,
  FiCalendar
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AnimatedCard from '../common/AnimatedCard'

const TutorAttendanceCard = ({ registro, onClick }) => {
  if (!registro) {
    return (
      <AnimatedCard className="border-l-4 border-l-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <FiXCircle className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sin Registro</h3>
              <p className="text-sm text-gray-600">No has marcado asistencia hoy</p>
            </div>
          </div>
          
          <button
            onClick={onClick}
            className="text-sm text-talentos-primary hover:text-talentos-secondary font-medium transition-colors duration-200"
          >
            Ver Detalles
          </button>
        </div>
      </AnimatedCard>
    )
  }

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'presente':
        return {
          icon: FiCheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-l-green-500',
          text: 'Presente'
        }
      case 'tarde':
        return {
          icon: FiClock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-l-yellow-500',
          text: 'Tardanza'
        }
      case 'falta':
        return {
          icon: FiXCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-l-red-500',
          text: 'Falta'
        }
      default:
        return {
          icon: FiXCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-l-gray-500',
          text: 'Sin Estado'
        }
    }
  }

  const estadoConfig = getEstadoConfig(registro.estado)
  const IconoEstado = estadoConfig.icon

  return (
    <AnimatedCard className={`border-l-4 ${estadoConfig.borderColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${estadoConfig.bgColor} rounded-full`}>
            <IconoEstado className={`w-5 h-5 ${estadoConfig.color}`} />
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{estadoConfig.text}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${estadoConfig.bgColor} ${estadoConfig.color}`}>
                {estadoConfig.text}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              {registro.horaEntrada && (
                <div className="flex items-center space-x-1">
                  <FiCalendar className="w-3 h-3" />
                  <span>Entrada: {format(new Date(registro.horaEntrada), 'HH:mm')}</span>
                </div>
              )}
              
              {registro.horaSalida && (
                <div className="flex items-center space-x-1">
                  <FiCalendar className="w-3 h-3" />
                  <span>Salida: {format(new Date(registro.horaSalida), 'HH:mm')}</span>
                </div>
              )}
              
              {!registro.horaSalida && registro.horaEntrada && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <FiClock className="w-3 h-3" />
                  <span>Salida pendiente</span>
                </div>
              )}
            </div>
            
            {(registro.coordenadasEntrada || registro.coordenadasSalida) && (
              <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                <FiMapPin className="w-3 h-3" />
                <span>Ubicación verificada</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={onClick}
            className="text-sm text-talentos-primary hover:text-talentos-secondary font-medium transition-colors duration-200"
          >
            Ver Detalles
          </button>
          
          <div className="text-xs text-gray-500 text-right">
            <p>{format(new Date(registro.fecha), 'dd/MM/yyyy', { locale: es })}</p>
          </div>
        </div>
      </div>
      
      {registro.observaciones && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-gray-200"
        >
          <p className="text-sm text-gray-600">
            <span className="font-medium">Observaciones:</span> {registro.observaciones}
          </p>
        </motion.div>
      )}
    </AnimatedCard>
  )
}

export default TutorAttendanceCard