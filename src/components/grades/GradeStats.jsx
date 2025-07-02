import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCheck, 
  FiX,
  FiTarget,
  FiAward,
  FiBarChart,
  FiUsers
} from 'react-icons/fi'

const GradeStats = ({ estadisticas, loading = false }) => {
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

  const getGradeColor = (promedio) => {
    if (promedio >= 17) return 'text-green-600'
    if (promedio >= 15) return 'text-blue-600'
    if (promedio >= 13) return 'text-yellow-600'
    return 'text-red-600'
  }

  const statsCards = [
    {
      title: 'Promedio General',
      value: estadisticas.promedioGeneral.toFixed(1),
      icon: FiBarChart,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      textColor: getGradeColor(estadisticas.promedioGeneral),
      change: estadisticas.promedioGeneral >= 15 ? 'Buen rendimiento' : 'Puede mejorar'
    },
    {
      title: 'Materias Aprobadas',
      value: estadisticas.materiasAprobadas,
      icon: FiCheck,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: `${estadisticas.materiasAprobadas} de ${estadisticas.materiasAprobadas + estadisticas.materiasDesaprobadas}`
    },
    {
      title: 'Materias Desaprobadas',
      value: estadisticas.materiasDesaprobadas,
      icon: FiX,
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      change: estadisticas.materiasDesaprobadas === 0 ? '¡Excelente!' : 'Necesita atención'
    },
    {
      title: 'Nota Más Alta',
      value: estadisticas.notaMasAlta.toFixed(1),
      icon: FiAward,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: 'Mejor calificación'
    }
  ]

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
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                <p className="text-xs text-gray-600 mt-1">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Student breakdown */}
      {Object.keys(estadisticas.porEstudiante).length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FiUsers className="w-5 h-5" />
            <span>Rendimiento por Estudiante</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(estadisticas.porEstudiante).map(([id, estudiante]) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{estudiante.nombre}</h4>
                    <p className="text-sm text-gray-600">{estudiante.grado}</p>
                  </div>
                  <div className={`text-xl font-bold ${getGradeColor(estudiante.promedio)}`}>
                    {estudiante.promedio.toFixed(1)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded p-2">
                    <div className="text-sm font-medium text-gray-900">{estudiante.total}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-sm font-medium text-green-600">{estudiante.aprobadas}</div>
                    <div className="text-xs text-green-700">Aprobadas</div>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <div className="text-sm font-medium text-red-600">{estudiante.desaprobadas}</div>
                    <div className="text-xs text-red-700">Desaprobadas</div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progreso</span>
                    <span>{((estudiante.aprobadas / estudiante.total) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(estudiante.aprobadas / estudiante.total) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-talentos-primary h-2 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GradeStats