import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiFileText, 
  FiSend, 
  FiEdit3, 
  FiEye,
  FiMessageCircle,
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi'

const TutorCommuniqueStats = ({ estadisticas, analytics, loading = false }) => {
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
      value: estadisticas.total,
      icon: FiFileText,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
      change: `${estadisticas.publicados} publicados`
    },
    {
      title: 'Borradores',
      value: estadisticas.borradores,
      icon: FiEdit3,
      color: 'bg-gray-100 text-gray-600',
      bgColor: 'bg-gray-50',
      change: 'En edición'
    },
    {
      title: 'Total Vistas',
      value: estadisticas.totalVistas,
      icon: FiEye,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
      change: analytics ? `${analytics.promedioVistas} promedio` : 'Sin datos'
    },
    {
      title: 'Respuestas',
      value: estadisticas.totalRespuestas,
      icon: FiMessageCircle,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
      change: analytics ? `${analytics.engagementRate}% engagement` : 'Sin datos'
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Distribución por categoría */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiTarget className="w-5 h-5 text-blue-600" />
            <span>Por Categoría</span>
          </h3>
          
          <div className="space-y-2">
            {Object.entries(estadisticas.porCategoria).map(([categoria, cantidad]) => (
              cantidad > 0 && (
                <div key={categoria} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{categoria}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(cantidad / estadisticas.total) * 100}%` }}
                        transition={{ duration: 1 }}
                        className="bg-blue-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-6">{cantidad}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </motion.div>

        {/* Estado y prioridad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiCheckCircle className="w-5 h-5 text-green-600" />
            <span>Estado</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiSend className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Publicados</span>
              </div>
              <span className="text-sm font-medium text-green-600">{estadisticas.publicados}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiEdit3 className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Borradores</span>
              </div>
              <span className="text-sm font-medium text-gray-600">{estadisticas.borradores}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiClock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Programados</span>
              </div>
              <span className="text-sm font-medium text-blue-600">{estadisticas.programados}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Por Prioridad</h4>
            <div className="flex justify-between text-xs">
              <div className="text-center">
                <div className="text-red-600 font-medium">{estadisticas.porPrioridad.alta}</div>
                <div className="text-gray-500">Alta</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-600 font-medium">{estadisticas.porPrioridad.media}</div>
                <div className="text-gray-500">Media</div>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-medium">{estadisticas.porPrioridad.baja}</div>
                <div className="text-gray-500">Baja</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analytics y rendimiento */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FiTrendingUp className="w-5 h-5 text-purple-600" />
            <span>Rendimiento</span>
          </h3>
          
          {analytics ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">
                  📈 Más visto: {analytics.masVisto.titulo}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {analytics.masVisto.vistas} vistas
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium">
                  💬 Más respondido: {analytics.masRespondido.titulo}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {analytics.masRespondido.respuestas} respuestas
                </p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800 font-medium">
                  Tasa de engagement: {analytics.engagementRate}%
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Promedio: {analytics.promedioVistas.toFixed(1)} vistas
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Publica comunicados para ver analytics
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recomendaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-talentos-primary/10 to-talentos-secondary/10 rounded-lg border border-talentos-primary/20 p-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <FiTarget className="w-5 h-5 text-talentos-primary" />
          <span>Recomendaciones</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {estadisticas.borradores > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-800 font-medium">
                📝 Tienes {estadisticas.borradores} borrador{estadisticas.borradores > 1 ? 'es' : ''}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Considera completar y publicar tus comunicados pendientes
              </p>
            </div>
          )}
          
          {analytics && analytics.engagementRate > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-800 font-medium">
                🎯 Engagement: {analytics.engagementRate}%
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {analytics.engagementRate >= 10 ? 'Excelente interacción' : 'Considera preguntas para más interacción'}
              </p>
            </div>
          )}
          
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-sm text-gray-800 font-medium">
              ✨ Tip del día
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Usa etiquetas relevantes para mejor organización
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default TutorCommuniqueStats