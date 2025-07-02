import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiMinus,
  FiAward,
  FiTarget,
  FiUser
} from 'react-icons/fi'

const SubjectRanking = ({ ranking, estudiante, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                <div className="w-12 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getGradeColor = (promedio) => {
    if (promedio >= 17) return 'text-green-600 bg-green-100'
    if (promedio >= 15) return 'text-blue-600 bg-blue-100'
    if (promedio >= 13) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRankIcon = (position) => {
    if (position === 0) return { icon: FiAward, color: 'text-yellow-500' }
    if (position === 1) return { icon: FiTarget, color: 'text-gray-400' }
    if (position === 2) return { icon: FiTarget, color: 'text-orange-500' }
    return { icon: FiTarget, color: 'text-gray-400' }
  }

  const getTrendIcon = (promedio) => {
    if (promedio >= 17) return { icon: FiTrendingUp, color: 'text-green-500' }
    if (promedio >= 13) return { icon: FiMinus, color: 'text-yellow-500' }
    return { icon: FiTrendingDown, color: 'text-red-500' }
  }

  const getSubjectIcon = (materia) => {
    const icons = {
      'Matemáticas': '📊',
      'Comunicación': '📚',
      'Ciencia y Tecnología': '🔬',
      'Ciencias Sociales': '🌍',
      'Arte y Cultura': '🎨',
      'Educación Física': '⚽',
      'Inglés': '🌎',
      'Educación Religiosa': '📿'
    }
    return icons[materia] || '📖'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FiUser className="w-5 h-5 text-talentos-primary" />
        <h3 className="text-lg font-semibold text-gray-900">
          Ranking de Materias - {estudiante}
        </h3>
      </div>

      <div className="space-y-3">
        {ranking.map((item, index) => {
          const rankIcon = getRankIcon(index)
          const trendIcon = getTrendIcon(item.promedio)
          const RankIcon = rankIcon.icon
          const TrendIcon = trendIcon.icon

          return (
            <motion.div
              key={item.materia}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                index === 0 
                  ? 'border-yellow-200 bg-yellow-50' 
                  : index === 1 
                    ? 'border-gray-200 bg-gray-50'
                    : index === 2
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Rank position */}
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 
                      ? 'bg-yellow-500 text-white' 
                      : index === 1 
                        ? 'bg-gray-400 text-white'
                        : index === 2
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <RankIcon className={`w-4 h-4 ${rankIcon.color}`} />
                </div>

                {/* Subject info */}
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getSubjectIcon(item.materia)}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.materia}</h4>
                    <p className="text-sm text-gray-600">{item.profesor}</p>
                  </div>
                </div>
              </div>

              {/* Grade and status */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${getGradeColor(item.promedio)}`}>
                    {item.promedio > 0 ? item.promedio.toFixed(1) : '-'}
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    <TrendIcon className={`w-3 h-3 ${trendIcon.color}`} />
                  </div>
                </div>

                {/* Status badge */}
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.estado === 'aprobado' 
                    ? 'bg-green-100 text-green-800'
                    : item.estado === 'desaprobado'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.estado === 'aprobado' ? 'Aprobado' : 
                   item.estado === 'desaprobado' ? 'Desaprobado' : 'Pendiente'}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">
              {ranking.filter(item => item.estado === 'aprobado').length}
            </div>
            <div className="text-xs text-gray-600">Aprobadas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {ranking.filter(item => item.estado === 'desaprobado').length}
            </div>
            <div className="text-xs text-gray-600">Desaprobadas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-600">
              {ranking.filter(item => item.estado === 'pendiente').length}
            </div>
            <div className="text-xs text-gray-600">Pendientes</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-1">Recomendación</h4>
        <p className="text-sm text-blue-800">
          {ranking.filter(item => item.promedio < 13).length > 0
            ? 'Enfocarse en las materias con calificaciones bajas para mejorar el promedio general.'
            : ranking.filter(item => item.promedio >= 17).length >= 4
              ? '¡Excelente rendimiento! Mantener el nivel de dedicación en todas las materias.'
              : 'Buen rendimiento general. Continuar con el esfuerzo para alcanzar la excelencia.'
          }
        </p>
      </div>
    </div>
  )
}

export default SubjectRanking