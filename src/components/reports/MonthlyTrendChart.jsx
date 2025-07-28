import React from 'react'
import { motion } from 'framer-motion'

const MonthlyTrendChart = ({ data, lines = ['default'], prefix = '' }) => {
  if (!data || !data.labels) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  const { labels, datasets } = data
  
  // Encontrar valores máximos y mínimos para escalar
  const allValues = datasets.flatMap(dataset => dataset.data)
  const maxValue = Math.max(...allValues)
  const minValue = Math.min(...allValues)
  const range = maxValue - minValue
  const padding = range * 0.1
  
  const adjustedMax = maxValue + padding
  const adjustedMin = Math.max(0, minValue - padding)
  const adjustedRange = adjustedMax - adjustedMin
  
  // Colores para las líneas
  const lineColors = {
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    purple: '#8b5cf6',
    yellow: '#f59e0b'
  }
  
  return (
    <div className="relative w-full h-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Líneas de cuadrícula horizontales */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        
        {/* Líneas de cuadrícula verticales */}
        {labels.map((_, index) => {
          const x = (index / (labels.length - 1)) * 100
          return (
            <line
              key={index}
              x1={x}
              y1="0"
              x2={x}
              y2="100"
              stroke="#e5e7eb"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
        
        {/* Líneas de datos */}
        {datasets.map((dataset, datasetIndex) => {
          const points = dataset.data.map((value, index) => {
            const x = (index / (labels.length - 1)) * 100
            const y = 100 - ((value - adjustedMin) / adjustedRange) * 100
            return { x, y, value }
          })
          
          const pathData = points.reduce((path, point, index) => {
            if (index === 0) return `M ${point.x} ${point.y}`
            return `${path} L ${point.x} ${point.y}`
          }, '')
          
          const color = lineColors[dataset.color] || lineColors.blue
          
          return (
            <g key={datasetIndex}>
              {/* Área bajo la línea */}
              <motion.path
                d={`${pathData} L 100 100 L 0 100 Z`}
                fill={color}
                fillOpacity="0.1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ delay: 0.5, duration: 1 }}
              />
              
              {/* Línea */}
              <motion.path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              
              {/* Puntos */}
              {points.map((point, index) => (
                <motion.circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="0.8"
                  fill={color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          )
        })}
      </svg>
      
      {/* Etiquetas del eje X */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 sm:px-2 -mb-6">
        {labels.map((label, index) => {
          // En móvil, mostrar solo etiquetas alternadas
          if (labels.length > 6 && index % 2 !== 0) {
            return <span key={index} className="text-xs text-gray-600 hidden sm:inline">{label}</span>
          }
          return (
            <span key={index} className="text-xs text-gray-600">
              {label}
            </span>
          )
        })}
      </div>
      
      {/* Etiquetas del eje Y */}
      <div className="absolute top-0 bottom-0 -left-8 sm:-left-12 flex flex-col justify-between py-2">
        {[adjustedMax, ...Array(3).fill(0).map((_, i) => 
          adjustedMax - ((i + 1) * adjustedRange / 4)
        ), adjustedMin].map((value, index) => (
          <span key={index} className="text-xs text-gray-500">
            {prefix}{value > 999 ? `${(value/1000).toFixed(0)}k` : value.toFixed(0)}
          </span>
        ))}
      </div>
      
      {/* Leyenda */}
      <div className="absolute top-0 right-0 bg-white p-1 sm:p-2 rounded shadow-sm max-w-[40%] sm:max-w-none">
        {datasets.map((dataset, index) => (
          <div key={index} className="flex items-center space-x-1 sm:space-x-2 text-xs">
            <div 
              className="w-2 sm:w-3 h-2 sm:h-3 rounded flex-shrink-0"
              style={{ backgroundColor: lineColors[dataset.color] || lineColors.blue }}
            />
            <span className="text-gray-700 truncate">{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MonthlyTrendChart