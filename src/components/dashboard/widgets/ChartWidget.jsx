import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { 
  FiTrendingUp, 
  FiBarChart, 
  FiPieChart, 
  FiMaximize2,
  FiRefreshCw,
  FiDownload
} from 'react-icons/fi'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const ChartWidget = ({ 
  title = "Gráfico",
  type = "line", // "line", "bar", "doughnut"
  data,
  color = "blue",
  showControls = true,
  size = "normal", // "small", "normal", "large"
  animated = true
}) => {
  const [chartData, setChartData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLegend, setShowLegend] = useState(size !== "small")

  const colorPalettes = {
    blue: {
      primary: 'rgb(59, 130, 246)',
      secondary: 'rgba(59, 130, 246, 0.1)',
      gradient: ['rgba(59, 130, 246, 0.8)', 'rgba(147, 197, 253, 0.8)']
    },
    green: {
      primary: 'rgb(16, 185, 129)',
      secondary: 'rgba(16, 185, 129, 0.1)',
      gradient: ['rgba(16, 185, 129, 0.8)', 'rgba(110, 231, 183, 0.8)']
    },
    purple: {
      primary: 'rgb(139, 92, 246)',
      secondary: 'rgba(139, 92, 246, 0.1)',
      gradient: ['rgba(139, 92, 246, 0.8)', 'rgba(196, 181, 253, 0.8)']
    },
    orange: {
      primary: 'rgb(245, 158, 11)',
      secondary: 'rgba(245, 158, 11, 0.1)',
      gradient: ['rgba(245, 158, 11, 0.8)', 'rgba(252, 211, 77, 0.8)']
    }
  }

  const currentPalette = colorPalettes[color] || colorPalettes.blue

  // Generar datos mock si no se proporcionan
  useEffect(() => {
    const generateMockData = () => {
      const labels = type === 'doughnut' 
        ? ['Presentes', 'Tardanzas', 'Faltas']
        : Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            return date.toLocaleDateString('es-ES', { weekday: 'short' })
          })

      const mockData = {
        labels,
        datasets: type === 'doughnut' ? [{
          data: [75, 15, 10],
          backgroundColor: [
            currentPalette.primary,
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            currentPalette.primary,
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2,
        }] : [{
          label: title,
          data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 50),
          borderColor: currentPalette.primary,
          backgroundColor: type === 'line' ? currentPalette.secondary : currentPalette.primary,
          tension: type === 'line' ? 0.4 : 0,
          fill: type === 'line',
          borderWidth: 2,
          borderRadius: type === 'bar' ? 6 : 0,
        }]
      }

      setChartData(data || mockData)
      setIsLoading(false)
    }

    // Simular carga de datos
    const timer = setTimeout(generateMockData, 500)
    return () => clearTimeout(timer)
  }, [data, type, title, color])

  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend && size !== "small",
        position: size === "large" ? 'top' : 'bottom',
        labels: {
          usePointStyle: true,
          padding: size === "large" ? 20 : 10,
          font: {
            size: size === "large" ? 12 : 10,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || ''
            const value = context.parsed.y || context.parsed
            return `${label}: ${value}${type === 'doughnut' ? '%' : ''}`
          }
        }
      }
    },
    scales: type === 'doughnut' ? {} : {
      x: {
        display: size !== "small",
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: size === "large" ? 11 : 9
          }
        }
      },
      y: {
        display: size !== "small",
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: size === "large" ? 11 : 9
          }
        }
      }
    },
    animation: {
      duration: animated ? 2000 : 0,
      easing: 'easeInOutQuart'
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  })

  const renderChart = () => {
    if (isLoading || !chartData) {
      return (
        <div className="flex items-center justify-center h-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FiRefreshCw className="w-6 h-6 text-gray-400" />
          </motion.div>
        </div>
      )
    }

    const ChartComponent = {
      line: Line,
      bar: Bar,
      doughnut: Doughnut
    }[type] || Line

    return (
      <div className="h-full">
        <ChartComponent data={chartData} options={getChartOptions()} />
      </div>
    )
  }

  const getIcon = () => {
    const icons = {
      line: FiTrendingUp,
      bar: FiBarChart,
      doughnut: FiPieChart
    }
    const IconComponent = icons[type] || FiTrendingUp
    return <IconComponent className="w-4 h-4" />
  }

  const heightClasses = {
    small: 'h-32',
    normal: 'h-48',
    large: 'h-64'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      {(title || showControls) && (
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              {getIcon()}
            </div>
            <h3 className={`font-semibold text-gray-900 ${
              size === "small" ? "text-sm" : "text-base"
            }`}>
              {title}
            </h3>
          </div>

          {showControls && size !== "small" && (
            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLegend(!showLegend)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Toggle Legend"
              >
                <FiMaximize2 className="w-3 h-3" />
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Chart Content */}
      <div className={`relative ${heightClasses[size]} p-2`}>
        {renderChart()}
      </div>

      {/* Footer stats para gráficos pequeños */}
      {size === "small" && chartData && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Promedio</span>
            <span className="font-medium">
              {type === 'doughnut' 
                ? `${chartData.datasets[0].data[0]}%`
                : Math.round(chartData.datasets[0].data.reduce((a, b) => a + b, 0) / chartData.datasets[0].data.length)
              }
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ChartWidget