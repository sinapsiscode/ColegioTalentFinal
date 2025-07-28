import React from 'react'
import { motion } from 'framer-motion'

const AttendanceChart = ({ data, type = 'line' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  // Encontrar el valor máximo para escalar las barras
  const maxValue = Math.max(...data.map(item => item.value || item.attendance || 100))
  const scale = 100 / maxValue

  if (type === 'bar') {
    return (
      <div className="h-64 flex items-end justify-between space-x-2">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${(item.attendance || item.value || 0) * scale}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="w-full bg-blue-500 rounded-t-lg relative group hover:bg-blue-600 transition-colors">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {item.attendance || item.value}%
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">{item.day || item.label}</p>
          </motion.div>
        ))}
      </div>
    )
  }

  // Gráfico de línea
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((item.value || 0) * scale)
    return { x, y, value: item.value }
  })

  const pathData = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    return `${path} L ${point.x} ${point.y}`
  }, '')

  return (
    <div className="relative w-full h-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Líneas de cuadrícula */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        ))}

        {/* Línea del gráfico */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Área bajo la línea */}
        <motion.path
          d={`${pathData} L 100 100 L 0 100 Z`}
          fill="url(#gradient)"
          opacity="0.3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.5, duration: 1 }}
        />

        {/* Gradiente */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Puntos de datos */}
        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="1.5"
            fill="#3b82f6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="hover:r-2"
          />
        ))}
      </svg>

      {/* Etiquetas del eje X */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        {data.map((item, index) => (
          <span key={index} className="text-xs text-gray-600">
            {item.label}
          </span>
        ))}
      </div>

      {/* Etiquetas del eje Y */}
      <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between py-2">
        {[100, 75, 50, 25, 0].map(value => (
          <span key={value} className="text-xs text-gray-500">
            {value}%
          </span>
        ))}
      </div>
    </div>
  )
}

export default AttendanceChart