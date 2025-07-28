import React from 'react'
import { motion } from 'framer-motion'

const GradesChart = ({ data, type = 'bar' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  // Gráfico de pastel
  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + (item.count || item.value || 0), 0)
    let currentAngle = -90 // Empezar desde arriba
    
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    
    return (
      <div className="relative h-64 flex items-center justify-center">
        <svg className="w-48 h-48" viewBox="-1 -1 2 2">
          {data.map((item, index) => {
            const value = item.count || item.value || 0
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
        <div className="absolute -right-2 sm:right-0 space-y-1 sm:space-y-2 text-xs sm:text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-1 sm:space-x-2">
              <div 
                className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-gray-700">
                <span className="hidden sm:inline">{item.range || item.label}: </span>
                <span className="sm:hidden">{(item.range || item.label || '').substring(0, 3)}: </span>
                {item.percentage || ((item.count || item.value || 0) / total * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Gráfico de barras horizontales
  if (type === 'horizontal-bar') {
    const maxValue = Math.max(...data.map(item => item.rate || item.average || 0))
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const value = item.rate || item.average || 0
          const percentage = (value / maxValue) * 100
          const color = value >= 90 ? 'bg-green-500' : value >= 80 ? 'bg-yellow-500' : 'bg-red-500'
          
          return (
            <div key={index} className="flex items-center space-x-2 sm:space-x-3">
              <p className="text-xs sm:text-sm text-gray-700 w-16 sm:w-24 text-right truncate">
                {item.grade || item.subject}
              </p>
              <div className="flex-1 bg-gray-200 rounded-full h-5 sm:h-6 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`h-full rounded-full ${color}`}
                />
                <span className="absolute right-1 sm:right-2 top-0 h-full flex items-center text-xs font-medium text-gray-700">
                  {value.toFixed(1)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Gráfico de radar
  if (type === 'radar') {
    const maxValue = 20 // Nota máxima
    const angleStep = (360 / data.length) * (Math.PI / 180)
    
    const points = data.map((item, index) => {
      const value = item.average || 0
      const radius = (value / maxValue) * 40
      const angle = index * angleStep - Math.PI / 2
      
      return {
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
        value,
        label: item.subject
      }
    })
    
    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z'
    
    return (
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Círculos de fondo */}
          {[10, 20, 30, 40].map(radius => (
            <circle
              key={radius}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Líneas radiales */}
          {data.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2
            const x = 50 + 40 * Math.cos(angle)
            const y = 50 + 40 * Math.sin(angle)
            
            return (
              <line
                key={index}
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
            )
          })}
          
          {/* Área del gráfico */}
          <motion.path
            d={pathData}
            fill="#3b82f6"
            fillOpacity="0.3"
            stroke="#3b82f6"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Puntos de datos */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#3b82f6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            />
          ))}
          
          {/* Etiquetas */}
          {points.map((point, index) => {
            const angle = index * angleStep - Math.PI / 2
            const labelX = 50 + 48 * Math.cos(angle)
            const labelY = 50 + 48 * Math.sin(angle)
            
            return (
              <text
                key={index}
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-gray-700"
              >
                {point.label}
              </text>
            )
          })}
        </svg>
      </div>
    )
  }

  // Gráfico de barras estándar
  const maxValue = Math.max(...data.map(item => item.average || item.value || 0))
  
  return (
    <div className="h-64 flex items-end justify-between space-x-2">
      {data.map((item, index) => {
        const value = item.average || item.value || 0
        const height = (value / maxValue) * 100
        const color = value >= 17 ? 'bg-green-500' : value >= 14 ? 'bg-blue-500' : value >= 11 ? 'bg-yellow-500' : 'bg-red-500'
        
        return (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className={`w-full ${color} rounded-t-lg relative group hover:opacity-80 transition-opacity`}>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {value.toFixed(1)}
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              {item.subject || item.label}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}

export default GradesChart