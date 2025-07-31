import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiActivity,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiWifi,
  FiWifiOff,
  FiRefreshCw,
  FiZap,
  FiEye,
  FiClock
} from 'react-icons/fi'
import CountUpNumber from '../common/CountUpNumber'
import { SIMULATION } from '../../utils/constants'

const RealTimeStats = ({ estadisticasAsistencia, onRefresh }) => {
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [pulseAnimation, setPulseAnimation] = useState(false)

  // Simulador de actualizaciones en tiempo real
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setLastUpdate(new Date())
      setPulseAnimation(true)
      setTimeout(() => setPulseAnimation(false), 1000)
      
      // Trigger refresh si hay callback
      if (onRefresh && Math.random() > 0.7) {
        onRefresh()
      }
    }, 5000) // Actualiza cada 5 segundos

    return () => clearInterval(interval)
  }, [isLive, onRefresh])

  const toggleLiveMode = () => {
    setIsLive(!isLive)
  }

  // Datos en tiempo real con animaciones
  const realTimeData = [
    {
      id: 'conexiones',
      title: 'Conexiones Activas',
      value: 45,
      change: Math.floor(Math.random() * 10) - 5,
      icon: FiWifi,
      color: 'emerald',
      unit: '',
      description: 'Usuarios conectados ahora'
    },
    {
      id: 'presente_ahora',
      title: 'En el Colegio Ahora',
      value: estadisticasAsistencia?.consolidado?.totalPresentes || 87,
      change: Math.floor(Math.random() * 6) - 3,
      icon: FiUsers,
      color: 'blue',
      unit: '',
      description: 'Estudiantes y profesores'
    },
    {
      id: 'actividad',
      title: 'Actividad del Sistema',
      value: Math.floor(Math.random() * SIMULATION.ACTIVITY_RANGE) + SIMULATION.ACTIVITY_BASE,
      change: Math.floor(Math.random() * 8) - 4,
      icon: FiActivity,
      color: 'purple',
      unit: '%',
      description: 'Nivel de uso actual'
    },
    {
      id: 'respuesta',
      title: 'Tiempo de Respuesta',
      value: Math.floor(Math.random() * 50) + 120,
      change: Math.floor(Math.random() * 20) - 10,
      icon: FiZap,
      color: 'yellow',
      unit: 'ms',
      description: 'Latencia del servidor'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header con control de tiempo real */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-slate-200"
      >
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ 
              scale: pulseAnimation ? 1.2 : 1,
              rotate: pulseAnimation ? 180 : 0 
            }}
            transition={{ duration: 0.5 }}
            className="p-2 bg-blue-500 rounded-xl"
          >
            <FiActivity className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Estadísticas en Tiempo Real
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FiClock className="w-4 h-4" />
              <span>Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLiveMode}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              isLive 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {isLive ? <FiWifi className="w-4 h-4" /> : <FiWifiOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isLive ? 'En Vivo' : 'Pausado'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setPulseAnimation(true)
              setTimeout(() => setPulseAnimation(false), 1000)
              onRefresh && onRefresh()
            }}
            className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 hover:text-blue-600"
          >
            <FiRefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Grid de estadísticas en tiempo real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence>
          {realTimeData.map((stat, index) => {
            const Icon = stat.icon
            const isPositive = stat.change >= 0
            
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  ...(pulseAnimation && { scale: [1, 1.05, 1] })
                }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.5,
                  ...(pulseAnimation && { duration: 0.3 })
                }}
                className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                {/* Animated background gradient */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  initial={false}
                  animate={{ opacity: pulseAnimation ? 0.3 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Live indicator */}
                {isLive && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full"
                  />
                )}

                <div className="relative z-10">
                  {/* Icon and change indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div 
                      className={`p-3 rounded-xl bg-${stat.color}-100 group-hover:bg-${stat.color}-200 transition-colors duration-200`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </motion.div>

                    <AnimatePresence>
                      {stat.change !== 0 && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
                            isPositive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {isPositive ? (
                            <FiTrendingUp className="w-3 h-3" />
                          ) : (
                            <FiTrendingDown className="w-3 h-3" />
                          )}
                          <span>{isPositive ? '+' : ''}{stat.change}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Value */}
                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-1">
                      <CountUpNumber 
                        value={stat.value} 
                        className="text-2xl sm:text-3xl font-bold text-gray-900"
                        duration={1000}
                      />
                      {stat.unit && (
                        <span className="text-lg font-medium text-gray-500">{stat.unit}</span>
                      )}
                    </div>
                    
                    <h3 className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                      {stat.title}
                    </h3>
                    
                    <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                      {stat.description}
                    </p>
                  </div>

                  {/* Progress bar for activity */}
                  {stat.id === 'actividad' && (
                    <motion.div 
                      className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    >
                      <motion.div
                        className={`h-full bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  initial={false}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: isLive ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 1.5, repeat: isLive ? Infinity : 0 }}
              className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <span className="text-sm font-medium text-gray-700">
              {isLive ? 'Sistema conectado' : 'Modo offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <FiEye className="w-4 h-4" />
            <span>Monitoreo activo</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiZap className="w-4 h-4" />
            <span>Actualización: {isLive ? '5s' : 'Manual'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default RealTimeStats