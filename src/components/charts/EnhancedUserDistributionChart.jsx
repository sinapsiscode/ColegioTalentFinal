import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiUsers, 
  FiTrendingUp,
  FiInfo,
  FiMaximize2,
  FiMinimize2,
  FiDownload
} from 'react-icons/fi'

const EnhancedUserDistributionChart = ({ 
  data,
  height = 400,
  onUserTypeClick,
  className = ''
}) => {
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  // Calcular total
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Colores mejorados con gradientes
  const colorMap = {
    'Estudiantes': {
      primary: '#10B981',
      secondary: '#059669',
      gradient: 'from-emerald-400 to-green-600',
      shadow: 'shadow-green-500/30'
    },
    'Padres': {
      primary: '#3B82F6', 
      secondary: '#2563EB',
      gradient: 'from-blue-400 to-blue-600',
      shadow: 'shadow-blue-500/30'
    },
    'Tutores': {
      primary: '#8B5CF6',
      secondary: '#7C3AED', 
      gradient: 'from-purple-400 to-purple-600',
      shadow: 'shadow-purple-500/30'
    },
    'Administrativos': {
      primary: '#F59E0B',
      secondary: '#D97706',
      gradient: 'from-amber-400 to-orange-600', 
      shadow: 'shadow-orange-500/30'
    }
  }

  // Preparar datos con colores y ángulos
  let currentAngle = -90
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100
    const angle = (percentage / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const colors = colorMap[item.label] || {
      primary: '#6B7280',
      secondary: '#4B5563',
      gradient: 'from-gray-400 to-gray-600',
      shadow: 'shadow-gray-500/30'
    }

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      colors
    }
  })

  // Generar path SVG para segmentos
  const createSegmentPath = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180
    
    const x1 = 150 + outerRadius * Math.cos(startAngleRad)
    const y1 = 150 + outerRadius * Math.sin(startAngleRad)
    const x2 = 150 + outerRadius * Math.cos(endAngleRad)
    const y2 = 150 + outerRadius * Math.sin(endAngleRad)
    
    const x3 = 150 + innerRadius * Math.cos(startAngleRad)
    const y3 = 150 + innerRadius * Math.sin(startAngleRad)
    const x4 = 150 + innerRadius * Math.cos(endAngleRad)
    const y4 = 150 + innerRadius * Math.sin(endAngleRad)
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    
    return `
      M ${x3} ${y3}
      L ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x3} ${y3}
    `
  }

  // Manejador de descarga
  const handleDownload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 800
    canvas.height = 600
    
    // Fondo blanco
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Título
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Distribución de Usuarios', 400, 40)
    
    // Dibujar gráfico
    const centerX = 400
    const centerY = 300
    const radius = 120
    const innerRadius = 60
    
    segments.forEach((segment) => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 
        (segment.startAngle * Math.PI) / 180,
        (segment.endAngle * Math.PI) / 180
      )
      ctx.arc(centerX, centerY, innerRadius,
        (segment.endAngle * Math.PI) / 180,
        (segment.startAngle * Math.PI) / 180,
        true
      )
      ctx.fillStyle = segment.colors.primary
      ctx.fill()
    })
    
    // Total en el centro
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(total.toString(), centerX, centerY)
    ctx.font = '16px sans-serif'
    ctx.fillText('USUARIOS', centerX, centerY + 25)
    
    // Descargar
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `distribucion_usuarios_${new Date().toISOString().split('T')[0]}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${
        isExpanded ? 'fixed inset-4 z-50' : ''
      } ${className}`}
    >
      {/* Header mejorado */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
              <FiUsers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Distribución de Usuarios</h3>
              <p className="text-sm text-gray-500 mt-0.5">Por tipo de rol en el sistema</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              title="Descargar imagen"
            >
              <FiDownload className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              title={isExpanded ? "Minimizar" : "Expandir"}
            >
              {isExpanded ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6" style={{ height: isExpanded ? 'calc(100vh - 200px)' : height }}>
        <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-8">
          
          {/* Gráfico SVG mejorado */}
          <div className="relative">
            <svg 
              width="300" 
              height="300" 
              viewBox="0 0 300 300"
              className="transform hover:scale-105 transition-transform duration-300"
            >
              {/* Sombra del gráfico */}
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                  <feOffset dx="0" dy="4" result="offsetblur"/>
                  <feFlood floodColor="#000000" floodOpacity="0.1"/>
                  <feComposite in2="offsetblur" operator="in"/>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                {/* Gradientes para cada segmento */}
                {segments.map((segment, index) => (
                  <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={segment.colors.primary} />
                    <stop offset="100%" stopColor={segment.colors.secondary} />
                  </linearGradient>
                ))}
              </defs>

              {/* Círculo de fondo */}
              <circle
                cx="150"
                cy="150"
                r="120"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="2"
              />

              {/* Segmentos del gráfico */}
              <g filter="url(#shadow)">
                {segments.map((segment, index) => {
                  const isHovered = hoveredSegment === index
                  const isSelected = selectedSegment === index
                  const scale = isHovered || isSelected ? 1.05 : 1
                  const opacity = hoveredSegment !== null && hoveredSegment !== index ? 0.6 : 1

                  return (
                    <motion.g key={index}>
                      <motion.path
                        d={createSegmentPath(
                          segment.startAngle,
                          segment.endAngle,
                          60,
                          isHovered || isSelected ? 125 : 120
                        )}
                        fill={`url(#gradient-${index})`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: animationComplete ? scale : 1,
                          opacity: animationComplete ? opacity : 1
                        }}
                        transition={{ 
                          duration: 0.8,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        style={{ transformOrigin: '150px 150px' }}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredSegment(index)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        onClick={() => {
                          setSelectedSegment(index)
                          onUserTypeClick && onUserTypeClick(segment)
                        }}
                      />

                      {/* Etiqueta de porcentaje en el segmento */}
                      {(isHovered || isSelected) && animationComplete && (
                        <motion.g
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <rect
                            x="120"
                            y="140"
                            width="60"
                            height="24"
                            rx="12"
                            fill="rgba(0, 0, 0, 0.8)"
                          />
                          <text
                            x="150"
                            y="156"
                            textAnchor="middle"
                            className="text-xs font-semibold fill-white"
                          >
                            {segment.percentage.toFixed(1)}%
                          </text>
                        </motion.g>
                      )}
                    </motion.g>
                  )
                })}
              </g>

              {/* Centro del donut con animación */}
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <circle
                  cx="150"
                  cy="150"
                  r="58"
                  fill="white"
                  stroke="#f3f4f6"
                  strokeWidth="2"
                />
                <text
                  x="150"
                  y="145"
                  textAnchor="middle"
                  className="text-4xl font-bold fill-gray-900"
                >
                  {total}
                </text>
                <text
                  x="150"
                  y="165"
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-500 uppercase tracking-wider"
                >
                  Usuarios
                </text>
              </motion.g>
            </svg>

            {/* Indicador de tendencia */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1"
            >
              <FiTrendingUp className="w-4 h-4" />
              <span>+12% este mes</span>
            </motion.div>
          </div>

          {/* Leyenda mejorada */}
          <div className="space-y-4">
            {segments.map((segment, index) => {
              const isHovered = hoveredSegment === index
              const isSelected = selectedSegment === index

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => {
                    setSelectedSegment(index)
                    onUserTypeClick && onUserTypeClick(segment)
                  }}
                  className={`
                    relative p-4 rounded-xl cursor-pointer transition-all duration-300
                    ${isHovered || isSelected ? 'scale-105 shadow-lg' : 'hover:shadow-md'}
                    ${isHovered || isSelected ? segment.colors.shadow : ''}
                  `}
                  style={{
                    backgroundColor: isHovered || isSelected ? `${segment.colors.primary}10` : '#f9fafb'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-4 h-4 rounded-full bg-gradient-to-br ${segment.colors.gradient}`}
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{segment.label}</p>
                        <p className="text-sm text-gray-500">{segment.value} usuarios</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: segment.colors.primary }}>
                        {segment.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${segment.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.8 }}
                      className={`h-full bg-gradient-to-r ${segment.colors.gradient}`}
                    />
                  </div>
                </motion.div>
              )
            })}

            {/* Información adicional */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start space-x-2"
            >
              <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Tip:</p>
                <p>Haz clic en cualquier segmento para ver más detalles sobre ese tipo de usuario.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Backdrop para modo expandido */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </motion.div>
  )
}

export default EnhancedUserDistributionChart