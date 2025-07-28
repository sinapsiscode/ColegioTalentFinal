import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi'

const RealTimeCounter = ({ 
  value, 
  previousValue = null, 
  label, 
  icon: Icon, 
  color = 'blue',
  format = 'number', // 'number', 'percentage', 'currency'
  showTrend = true,
  animationDuration = 2,
  onClick
}) => {
  const [currentValue, setCurrentValue] = useState(value)
  const [lastValue, setLastValue] = useState(previousValue || value)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Actualizar valor cuando cambie
  useEffect(() => {
    if (value !== currentValue) {
      setIsUpdating(true)
      setLastValue(currentValue)
      setCurrentValue(value)
      
      setTimeout(() => {
        setIsUpdating(false)
      }, animationDuration * 1000)
    }
  }, [value])
  
  // Calcular tendencia
  const getTrend = () => {
    if (!showTrend || lastValue === null) return null
    
    const difference = currentValue - lastValue
    if (difference > 0) return { type: 'up', value: difference }
    if (difference < 0) return { type: 'down', value: Math.abs(difference) }
    return { type: 'neutral', value: 0 }
  }
  
  const trend = getTrend()
  
  // Colores según el tipo
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-900'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200', 
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-900'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'bg-purple-100 text-purple-600', 
      text: 'text-purple-900'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'bg-orange-100 text-orange-600',
      text: 'text-orange-900'
    }
  }
  
  const colors = colorClasses[color] || colorClasses.blue
  
  // Formatear valor
  const formatValue = (val) => {
    switch (format) {
      case 'percentage':
        return `${val}%`
      case 'currency':
        return `S/. ${val.toFixed(2)}`
      default:
        return val
    }
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        relative overflow-hidden
        ${colors.bg} ${colors.border} border
        rounded-xl shadow-sm hover:shadow-md
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        p-4 sm:p-6
      `}
    >
      {/* Indicador de actualización */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-2 right-2"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Contenido principal */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Label */}
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          
          {/* Valor con animación */}
          <div className="flex items-baseline space-x-2">
            <CountUp
              start={lastValue}
              end={currentValue}
              duration={animationDuration}
              separator=","
              decimals={format === 'currency' ? 2 : 0}
              decimal="."
              prefix={format === 'currency' ? 'S/. ' : ''}
              suffix={format === 'percentage' ? '%' : ''}
              className={`text-2xl sm:text-3xl font-bold ${colors.text}`}
            />
            
            {/* Indicador de tendencia */}
            {showTrend && trend && trend.type !== 'neutral' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center space-x-1 text-sm ${
                  trend.type === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.type === 'up' ? (
                  <FiTrendingUp className="w-4 h-4" />
                ) : (
                  <FiTrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {format === 'percentage' ? `${trend.value}%` : trend.value}
                </span>
              </motion.div>
            )}
          </div>
          
          {/* Subtítulo adicional */}
          {trend && (
            <p className="text-xs text-gray-500 mt-1">
              {trend.type === 'up' ? 'Incremento' : 
               trend.type === 'down' ? 'Decremento' : 
               'Sin cambios'} desde la última actualización
            </p>
          )}
        </div>
        
        {/* Icono */}
        {Icon && (
          <div className={`p-3 rounded-full ${colors.icon}`}>
            <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        )}
      </div>
      
      {/* Barra de progreso opcional */}
      {format === 'percentage' && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentValue}%` }}
              transition={{ duration: animationDuration }}
              className={`h-2 rounded-full ${
                currentValue >= 80 ? 'bg-green-500' :
                currentValue >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
            />
          </div>
        </div>
      )}
      
      {/* Efecto de brillo al actualizar */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default RealTimeCounter