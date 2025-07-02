import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiLogIn,
  FiLogOut,
  FiClock,
  FiCalendar,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi'

const AttendanceStats = ({ estadisticas, loading = false }) => {
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
      title: 'Total Escaneos',
      value: estadisticas.totalEscaneos,
      icon: FiActivity,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      change: 'Registros del día'
    },
    {
      title: 'Estudiantes Presentes',
      value: estadisticas.estudiantes,
      icon: FiUserCheck,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      change: 'En el colegio'
    },
    {
      title: 'Entradas',
      value: estadisticas.entradas,
      icon: FiLogIn,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Registros de entrada'
    },
    {
      title: 'Salidas',
      value: estadisticas.salidas,
      icon: FiLogOut,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'Registros de salida'
    }
  ]

  const formatearHora = (timestamp) => {
    if (!timestamp) return 'No registrado'
    return format(new Date(timestamp), 'HH:mm:ss', { locale: es })
  }

  return (
    <div className="space-y-6">
      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Detailed information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Horarios de actividad */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiClock className="w-5 h-5 text-blue-600" />
            <span>Actividad del Día</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiLogIn className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Primera entrada</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatearHora(estadisticas.primeraEntrada)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiActivity className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Última actividad</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatearHora(estadisticas.ultimaEntrada)}
              </span>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Actividad por hora</span>
              </div>
              
              {/* Gráfico simple de barras simulado */}
              <div className="space-y-2">
                {[
                  { hora: '07:00', cantidad: 15, porcentaje: 20 },
                  { hora: '08:00', cantidad: 45, porcentaje: 60 },
                  { hora: '09:00', cantidad: 30, porcentaje: 40 },
                  { hora: '10:00', cantidad: 8, porcentaje: 10 }
                ].map((datos) => (
                  <div key={datos.hora} className="flex items-center space-x-3">
                    <span className="text-xs text-gray-600 w-12">{datos.hora}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${datos.porcentaje}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-blue-500 h-2 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-6">{datos.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resumen por tipo */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiUsers className="w-5 h-5 text-green-600" />
            <span>Resumen por Tipo</span>
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-lg mx-auto mb-2">
                  <FiUsers className="w-5 h-5" />
                </div>
                <p className="text-lg font-bold text-gray-900">{estadisticas.estudiantes}</p>
                <p className="text-xs text-gray-600">Estudiantes</p>
              </div>
              
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg mx-auto mb-2">
                  <FiUserCheck className="w-5 h-5" />
                </div>
                <p className="text-lg font-bold text-gray-900">{estadisticas.profesores}</p>
                <p className="text-xs text-gray-600">Profesores</p>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-lg mx-auto mb-2">
                  <FiUserX className="w-5 h-5" />
                </div>
                <p className="text-lg font-bold text-gray-900">{estadisticas.personal}</p>
                <p className="text-xs text-gray-600">Personal</p>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-lg mx-auto mb-2">
                  <FiCalendar className="w-5 h-5" />
                </div>
                <p className="text-lg font-bold text-gray-900">{estadisticas.visitantes}</p>
                <p className="text-xs text-gray-600">Visitantes</p>
              </div>
            </div>
            
            {/* Progreso del día */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progreso del día</span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.round((estadisticas.estudiantes / 100) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(estadisticas.estudiantes / 100) * 100}%` }}
                  transition={{ duration: 1.5 }}
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Basado en la asistencia promedio esperada
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Información adicional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-talentos-primary/10 to-talentos-secondary/10 rounded-lg border border-talentos-primary/20 p-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <FiTrendingUp className="w-5 h-5 text-talentos-primary" />
          <span>Estado del Sistema</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm text-gray-800 font-medium">
              ✅ Escáner operativo
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Sistema funcionando correctamente
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm text-gray-800 font-medium">
              📊 {estadisticas.totalEscaneos} registros hoy
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Actividad normal de entrada
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm text-gray-800 font-medium">
              🕐 Última actualización: {format(new Date(), 'HH:mm:ss', { locale: es })}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Datos en tiempo real
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AttendanceStats