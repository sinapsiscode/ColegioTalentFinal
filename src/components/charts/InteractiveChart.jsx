import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import { motion } from 'framer-motion'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Configuración global de Chart.js
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 12
        },
        padding: 15,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      },
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('es-PE').format(context.parsed.y)
          }
          return label
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  }
}

const chartComponents = {
  line: Line,
  bar: Bar,
  pie: Pie,
  doughnut: Doughnut
}

const InteractiveChart = ({ 
  type = 'bar',
  data,
  options = {},
  title,
  height = 300,
  className = '',
  showDownload = true,
  showFullscreen = true,
  animationDelay = 0
}) => {
  const chartRef = React.useRef(null)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // Combinar opciones por defecto con las opciones personalizadas
  const chartOptions = React.useMemo(() => {
    const baseOptions = type === 'pie' || type === 'doughnut' 
      ? { ...defaultOptions, scales: undefined }
      : defaultOptions

    return {
      ...baseOptions,
      ...options,
      plugins: {
        ...baseOptions.plugins,
        ...options.plugins,
        title: {
          display: !!title,
          text: title,
          font: {
            size: 16,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif'
          },
          padding: { bottom: 20 }
        }
      }
    }
  }, [type, options, title])

  // Descargar gráfico como imagen
  const handleDownload = () => {
    if (chartRef.current) {
      const link = document.createElement('a')
      link.download = `grafico-${type}-${new Date().getTime()}.png`
      link.href = chartRef.current.toBase64Image()
      link.click()
    }
  }

  // Toggle pantalla completa
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const ChartComponent = chartComponents[type] || Bar

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className={`relative ${className}`}
    >
      {/* Controles del gráfico */}
      <div className="absolute top-2 right-2 flex space-x-2 z-10">
        {showDownload && (
          <button
            onClick={handleDownload}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            title="Descargar gráfico"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        )}
        {showFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Contenedor del gráfico */}
      <div 
        className={`${isFullscreen ? 'fixed inset-0 bg-white z-50 p-8' : ''}`}
        style={{ height: isFullscreen ? '100vh' : height }}
      >
        <ChartComponent
          ref={chartRef}
          data={data}
          options={chartOptions}
        />
      </div>

      {/* Botón para cerrar pantalla completa */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-50 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  )
}

export default InteractiveChart