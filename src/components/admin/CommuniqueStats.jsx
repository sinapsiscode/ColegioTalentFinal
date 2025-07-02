import React from 'react'
import { motion } from 'framer-motion'
import {
  FiFileText,
  FiSend,
  FiEye,
  FiMessageSquare,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiArchive,
  FiEdit3
} from 'react-icons/fi'

const CommuniqueStats = ({ estadisticas, loading = false }) => {
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
      title: 'Total Comunicados',
      value: estadisticas.total || 0,
      icon: FiFileText,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      change: `${estadisticas.publicados || 0} publicados`
    },
    {
      title: 'Publicados',
      value: estadisticas.publicados || 0,
      icon: FiSend,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      change: `${estadisticas.total > 0 ? Math.round(((estadisticas.publicados || 0) / estadisticas.total) * 100) : 0}% del total`
    },
    {
      title: 'Total Vistas',
      value: estadisticas.totalVistas || 0,
      icon: FiEye,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Alcance general'
    },
    {
      title: 'Este Mes',
      value: estadisticas.esteMes || 0,
      icon: FiClock,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'Actividad reciente'
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

      {/* Detailed breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estados de comunicados */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiFileText className="w-5 h-5 text-blue-600" />
            <span>Por Estado</span>
          </h3>
          
          <div className="space-y-3">
            {Object.entries({
              publicados: estadisticas.publicados || 0,
              borradores: estadisticas.borradores || 0,
              programados: estadisticas.programados || 0,
              archivados: estadisticas.archivados || 0
            }).map(([estado, cantidad]) => {
              const percentage = estadisticas.total > 0 ? Math.round((cantidad / estadisticas.total) * 100) : 0
              
              const estadoConfig = {
                publicados: { icon: FiSend, color: 'bg-green-500', label: 'Publicados' },
                borradores: { icon: FiEdit3, color: 'bg-gray-500', label: 'Borradores' },
                programados: { icon: FiClock, color: 'bg-blue-500', label: 'Programados' },
                archivados: { icon: FiArchive, color: 'bg-orange-500', label: 'Archivados' }
              }
              
              const config = estadoConfig[estado] || { icon: FiFileText, color: 'bg-gray-500', label: estado }
              
              return (
                <div key={estado} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <config.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{config.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1 }}
                        className={`${config.color} h-2 rounded-full`}
                      ></motion.div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{cantidad}</span>
                    <span className="text-xs text-gray-500 w-10">{percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Categorías más utilizadas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            <span>Por Categoría</span>
          </h3>
          
          <div className="space-y-3">
            {Object.entries(estadisticas.porCategoria || {})
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([categoria, cantidad]) => {
                const percentage = estadisticas.total > 0 ? Math.round((cantidad / estadisticas.total) * 100) : 0
                
                const categoriaConfig = {
                  academico: { color: 'bg-blue-500', label: 'Académico' },
                  administrativo: { color: 'bg-purple-500', label: 'Administrativo' },
                  evento: { color: 'bg-green-500', label: 'Evento' },
                  reunion: { color: 'bg-orange-500', label: 'Reunión' },
                  salud: { color: 'bg-red-500', label: 'Salud' },
                  disciplina: { color: 'bg-gray-500', label: 'Disciplina' }
                }
                
                const config = categoriaConfig[categoria] || { color: 'bg-gray-500', label: categoria }
                
                return (
                  <div key={categoria} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 ${config.color} rounded-full`}></div>
                      <span className="text-sm text-gray-600">{config.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`${config.color} h-2 rounded-full`}
                        ></motion.div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-6">{cantidad}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </motion.div>
      </div>

      {/* Métricas de engagement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <FiUsers className="w-5 h-5 text-purple-600" />
          <span>Métricas de Engagement</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mx-auto mb-2">
              <FiEye className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.efectividad?.promedioVistas || 0}</p>
            <p className="text-sm text-gray-600">Promedio de vistas</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mx-auto mb-2">
              <FiMessageSquare className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.totalRespuestas || 0}</p>
            <p className="text-sm text-gray-600">Total respuestas</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mx-auto mb-2">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.efectividad?.tasaLectura || 0}%</p>
            <p className="text-sm text-gray-600">Tasa de lectura</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-lg mx-auto mb-2">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.efectividad?.tasaRespuesta || 0}%</p>
            <p className="text-sm text-gray-600">Engagement</p>
          </div>
        </div>
      </motion.div>

      {/* Recomendaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-talentos-primary/10 to-talentos-secondary/10 rounded-lg border border-talentos-primary/20 p-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <FiTrendingUp className="w-5 h-5 text-talentos-primary" />
          <span>Análisis y Recomendaciones</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(estadisticas.borradores || 0) > 3 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-800 font-medium">
                📝 {estadisticas.borradores} comunicados en borrador
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Considera revisar y publicar los pendientes
              </p>
            </div>
          )}
          
          {(estadisticas.efectividad?.tasaLectura || 0) < 70 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-800 font-medium">
                📊 Tasa de lectura: {estadisticas.efectividad?.tasaLectura || 0}%
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Mejora los títulos y timing de publicación
              </p>
            </div>
          )}
          
          {(estadisticas.esteMes || 0) > 10 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-800 font-medium">
                📈 {estadisticas.esteMes} comunicados este mes
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Excelente actividad de comunicación
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default CommuniqueStats