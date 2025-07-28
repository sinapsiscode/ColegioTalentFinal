import React from 'react'
import { motion } from 'framer-motion'

const StudentDistributionChart = ({ data, type = 'bar' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  // Gráfico de pastel para distribución por género
  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + (item.value || item.count || 0), 0)
    let currentAngle = -90
    
    const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b']
    
    return (
      <div className="relative h-full flex items-center justify-center">
        <svg className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48" viewBox="-1 -1 2 2">
          {data.map((item, index) => {
            const value = item.value || item.count || 0
            const percentage = (value / total) * 100
            const angle = (percentage / 100) * 360
            const startAngle = currentAngle
            currentAngle += angle
            
            const startAngleRad = (startAngle * Math.PI) / 180
            const endAngleRad = (currentAngle * Math.PI) / 180
            
            const x1 = Math.cos(startAngleRad)
            const y1 = Math.sin(startAngleRad)
            const x2 = Math.cos(endAngleRad)
            const y2 = Math.sin(endAngleRad)
            
            const largeArcFlag = angle > 180 ? 1 : 0
            
            const pathData = [
              `M 0 0`,
              `L ${x1} ${y1}`,
              `A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ')
            
            return (
              <motion.path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            )
          })}
        </svg>
        
        {/* Leyenda */}
        <div className="absolute right-0 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div>
                <p className="text-sm text-gray-700">{item.label || item.grade}</p>
                <p className="text-xs text-gray-500">
                  {item.value || item.count} ({item.percentage || percentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Gráfico de barras con porcentajes
  const maxCount = Math.max(...data.map(item => item.count || 0))
  
  return (
    <div className="space-y-4">
      {/* Barras */}
      <div className="h-48 flex items-end justify-between space-x-2">
        {data.map((item, index) => {
          const height = ((item.count || 0) / maxCount) * 100
          const colorIndex = index % 7
          const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-yellow-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-red-500'
          ]
          
          return (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className={`w-full ${colors[colorIndex]} rounded-t-lg relative group hover:opacity-80 transition-opacity`}>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.count} estudiantes
                </div>
                
                {/* Mostrar el número dentro de la barra si hay espacio */}
                {height > 20 && (
                  <div className="absolute top-2 left-0 right-0 text-center">
                    <p className="text-white font-semibold text-sm">{item.count}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
      
      {/* Etiquetas */}
      <div className="flex justify-between">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <p className="text-xs font-medium text-gray-700">{item.grade}</p>
            <p className="text-xs text-gray-500">{item.percentage}%</p>
          </div>
        ))}
      </div>
      
      {/* Resumen total */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total de estudiantes:</span>
          <span className="font-semibold text-gray-900">
            {data.reduce((sum, item) => sum + (item.count || 0), 0)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default StudentDistributionChart