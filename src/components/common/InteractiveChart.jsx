import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiBarChart2, 
  FiPieChart,
  FiActivity,
  FiMaximize2,
  FiRefreshCw
} from 'react-icons/fi'

const InteractiveChart = ({ 
  data, 
  type = 'bar', // 'bar', 'line', 'pie', 'donut'
  title,
  subtitle,
  height = 300,
  animate = true,
  interactive = true,
  showLegend = true,
  showTooltip = true,
  onDataPointClick,
  className = ''
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Calcular valores máximos y totales
  const maxValue = Math.max(...data.map(d => d.value))
  const totalValue = data.reduce((sum, d) => sum + d.value, 0)
  
  // Generar colores si no están definidos
  const colors = [
    'rgb(59, 130, 246)', // blue
    'rgb(34, 197, 94)',  // green
    'rgb(168, 85, 247)', // purple
    'rgb(251, 146, 60)', // orange
    'rgb(239, 68, 68)',  // red
    'rgb(236, 72, 153)', // pink
    'rgb(20, 184, 166)', // teal
    'rgb(251, 191, 36)'  // yellow
  ]
  
  const getColor = (index) => {
    return data[index]?.color || colors[index % colors.length]
  }
  
  // Renderizar gráfico de barras
  const renderBarChart = () => {
    return (
      <div className="relative h-full flex items-end justify-between gap-2 px-4">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100
          const isHovered = hoveredIndex === index
          const isSelected = selectedIndex === index
          
          return (
            <motion.div
              key={item.label}
              className="relative flex-1 flex flex-col items-center"
              onMouseEnter={() => interactive && setHoveredIndex(index)}
              onMouseLeave={() => interactive && setHoveredIndex(null)}
              onClick={() => {
                if (interactive) {
                  setSelectedIndex(index)
                  onDataPointClick && onDataPointClick(item, index)
                }
              }}
            >
              {/* Barra */}
              <motion.div
                initial={animate ? { height: 0 } : { height: `${percentage}%` }}
                animate={{ height: `${percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`relative w-full rounded-t-lg transition-all duration-300 ${
                  interactive ? 'cursor-pointer' : ''
                } ${isHovered || isSelected ? 'opacity-100' : 'opacity-80'}`}
                style={{ 
                  backgroundColor: getColor(index),
                  minHeight: '20px'
                }}
              >
                {/* Tooltip */}
                <AnimatePresence>
                  {showTooltip && (isHovered || isSelected) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap z-10"
                    >
                      <div className="font-semibold">{item.value}</div>
                      <div className="text-xs opacity-80">{((item.value / totalValue) * 100).toFixed(1)}%</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Label */}
              <div className="mt-2 text-xs text-gray-600 text-center">
                {item.label}
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }
  
  // Renderizar gráfico de líneas
  const renderLineChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((item.value / maxValue) * 100)
      return { x, y, ...item }
    })
    
    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
      .join(' ')
    
    return (
      <div className="relative h-full">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
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
              vectorEffect="non-scaling-stroke"
            />
          ))}
          
          {/* Área bajo la línea */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 1 }}
            d={`${pathData} L 100,100 L 0,100 Z`}
            fill="url(#gradient)"
          />
          
          {/* Línea principal */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
            d={pathData}
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Puntos de datos */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              cx={point.x}
              cy={point.y}
              r="2"
              fill={colors[0]}
              className={`${interactive ? 'cursor-pointer' : ''}`}
              onMouseEnter={() => interactive && setHoveredIndex(index)}
              onMouseLeave={() => interactive && setHoveredIndex(null)}
              onClick={() => {
                if (interactive) {
                  setSelectedIndex(index)
                  onDataPointClick && onDataPointClick(data[index], index)
                }
              }}
            >
              {showTooltip && hoveredIndex === index && (
                <title>{`${point.label}: ${point.value}`}</title>
              )}
            </motion.circle>
          ))}
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    )
  }
  
  // Renderizar gráfico circular (pie/donut)
  const renderPieChart = () => {
    const centerX = 50
    const centerY = 50
    const radius = type === 'donut' ? 35 : 40
    const innerRadius = type === 'donut' ? 20 : 0
    
    let currentAngle = -90 // Empezar desde arriba
    
    const segments = data.map((item, index) => {
      const percentage = (item.value / totalValue) * 100
      const angle = (percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      
      currentAngle = endAngle
      
      const startAngleRad = (startAngle * Math.PI) / 180
      const endAngleRad = (endAngle * Math.PI) / 180
      
      const x1 = centerX + radius * Math.cos(startAngleRad)
      const y1 = centerY + radius * Math.sin(startAngleRad)
      const x2 = centerX + radius * Math.cos(endAngleRad)
      const y2 = centerY + radius * Math.sin(endAngleRad)
      
      const largeArcFlag = angle > 180 ? 1 : 0
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
      
      const donutPathData = [
        `M ${centerX + innerRadius * Math.cos(startAngleRad)} ${centerY + innerRadius * Math.sin(startAngleRad)}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${centerX + innerRadius * Math.cos(endAngleRad)} ${centerY + innerRadius * Math.sin(endAngleRad)}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${centerX + innerRadius * Math.cos(startAngleRad)} ${centerY + innerRadius * Math.sin(startAngleRad)}`
      ].join(' ')
      
      return {
        ...item,
        path: type === 'donut' ? donutPathData : pathData,
        percentage,
        color: getColor(index)
      }
    })
    
    return (
      <div className="h-full">
        <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-4">
          {/* Gráfico */}
          <div className="relative flex-1 h-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full max-w-[200px] lg:max-w-[250px]">
              {segments.map((segment, index) => (
                <motion.g key={index}>
                  <motion.path
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    d={segment.path}
                    fill={segment.color}
                    className={`${interactive ? 'cursor-pointer' : ''} transition-all duration-300`}
                    style={{
                      filter: hoveredIndex === index || selectedIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                      transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: '50px 50px'
                    }}
                    onMouseEnter={() => interactive && setHoveredIndex(index)}
                    onMouseLeave={() => interactive && setHoveredIndex(null)}
                    onClick={() => {
                      if (interactive) {
                        setSelectedIndex(index)
                        onDataPointClick && onDataPointClick(segment, index)
                      }
                    }}
                  />
                  {/* Tooltip en hover */}
                  {showTooltip && hoveredIndex === index && (
                    <g>
                      <rect
                        x="35"
                        y="45"
                        width="30"
                        height="10"
                        fill="rgba(0, 0, 0, 0.8)"
                        rx="2"
                      />
                      <text
                        x="50"
                        y="52"
                        textAnchor="middle"
                        className="text-[8px] fill-white font-medium"
                      >
                        {segment.value} ({segment.percentage.toFixed(1)}%)
                      </text>
                    </g>
                  )}
                </motion.g>
              ))}
              
              {/* Centro del donut */}
              {type === 'donut' && (
                <g>
                  <text
                    x="50"
                    y="48"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-2xl font-bold fill-gray-900"
                  >
                    {totalValue}
                  </text>
                  <text
                    x="50"
                    y="56"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[8px] fill-gray-500"
                  >
                    TOTAL
                  </text>
                </g>
              )}
            </svg>
          </div>
          
          {/* Leyenda */}
          {showLegend && (
            <div className="flex flex-row flex-wrap lg:flex-col gap-2 lg:gap-1 justify-center lg:justify-start">
              {segments.map((segment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    setSelectedIndex(index)
                    onDataPointClick && onDataPointClick(segment, index)
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                    {segment.label}
                  </span>
                  <span className="text-xs text-gray-900 font-bold">
                    {segment.percentage.toFixed(1)}%
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart()
      case 'pie':
      case 'donut':
        return renderPieChart()
      default:
        return renderBarChart()
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className} ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Actualizar"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Pantalla completa"
          >
            <FiMaximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Chart */}
      <div style={{ height: isFullscreen ? 'calc(100% - 80px)' : height }}>
        {renderChart()}
      </div>
      
      {/* Backdrop para fullscreen */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 -z-10"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </motion.div>
  )
}

export default InteractiveChart