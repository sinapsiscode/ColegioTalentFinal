import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  FiTrendingUp,
  FiUsers,
  FiBookOpen,
  FiMessageSquare,
  FiCalendar,
  FiActivity,
  FiEye,
  FiChevronUp,
  FiChevronDown
} from 'react-icons/fi'
import CountUpNumber from '../common/CountUpNumber'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const InteractiveDashboard = ({ estadisticasGenerales, estadisticasAsistencia }) => {
  const [selectedMetric, setSelectedMetric] = useState('asistencia')
  const [timeRange, setTimeRange] = useState('7d')
  const [animateCharts, setAnimateCharts] = useState(false)

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setAnimateCharts(true), 500)
    return () => clearTimeout(timer)
  }, [])

  // Datos mock para los gráficos (en producción vendrían de los stores)
  const generateTrendData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    })

    return {
      labels,
      datasets: [
        {
          label: 'Asistencia Estudiantes',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 20) + 80),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Asistencia Profesores',
          data: Array.from({ length: days }, () => Math.floor(Math.random() * 15) + 85),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ]
    }
  }

  const getActivityData = () => ({
    labels: ['Comunicados', 'Mensajes', 'Reportes', 'Calificaciones', 'Asistencia'],
    datasets: [{
      label: 'Actividad del Sistema',
      data: [45, 78, 23, 67, 89],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(139, 92, 246, 1)',
      ],
      borderWidth: 2,
    }]
  })

  const getGradeDistribution = () => ({
    labels: ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'],
    datasets: [{
      label: 'Estudiantes por Grado',
      data: [42, 38, 45, 41, 39, 44],
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
      borderRadius: 8,
    }]
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
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
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    animation: {
      duration: animateCharts ? 2000 : 0,
      easing: 'easeInOutQuart'
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
      }
    },
    animation: {
      duration: animateCharts ? 2000 : 0,
      easing: 'easeInOutQuart'
    }
  }

  // Métricas principales con animaciones
  const mainMetrics = [
    {
      id: 'usuarios',
      title: 'Usuarios Activos',
      value: estadisticasGenerales?.totalUsuarios || 245,
      change: '+12%',
      changeType: 'positive',
      icon: FiUsers,
      color: 'blue',
      description: 'Usuarios conectados hoy'
    },
    {
      id: 'estudiantes',
      title: 'Estudiantes',
      value: estadisticasGenerales?.totalEstudiantes || 189,
      change: '+5%',
      changeType: 'positive',
      icon: FiBookOpen,
      color: 'emerald',
      description: 'Total de estudiantes'
    },
    {
      id: 'comunicados',
      title: 'Comunicados',
      value: estadisticasGenerales?.totalComunicados || 67,
      change: '+23%',
      changeType: 'positive',
      icon: FiMessageSquare,
      color: 'purple',
      description: 'Enviados esta semana'
    },
    {
      id: 'asistencia',
      title: 'Asistencia Promedio',
      value: Math.round(estadisticasAsistencia?.consolidado?.promedioAsistencia || 87),
      change: '+3%',
      changeType: 'positive',
      icon: FiCalendar,
      color: 'orange',
      description: 'Promedio semanal'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Métricas principales con animaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {mainMetrics.map((metric, index) => {
          const Icon = metric.icon
          const isSelected = selectedMetric === metric.id
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => setSelectedMetric(metric.id)}
              className={`relative overflow-hidden rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? 'bg-gradient-to-br from-white to-gray-50 shadow-lg ring-2 ring-blue-500 ring-opacity-50' 
                  : 'bg-white hover:shadow-md shadow-sm'
              }`}
            >
              {/* Background gradient effect */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-${metric.color}-100 to-${metric.color}-200 rounded-full opacity-20 transform translate-x-8 -translate-y-8`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 sm:p-3 rounded-xl bg-${metric.color}-100`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${metric.color}-600`} />
                  </div>
                  <motion.div 
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      metric.changeType === 'positive' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                  >
                    {metric.changeType === 'positive' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
                    <span>{metric.change}</span>
                  </motion.div>
                </div>
                
                <div className="space-y-1">
                  <CountUpNumber 
                    value={metric.value} 
                    className="text-2xl sm:text-3xl font-bold text-gray-900"
                    suffix={metric.id === 'asistencia' ? '%' : ''}
                  />
                  <h3 className="text-sm font-semibold text-gray-700">{metric.title}</h3>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              </div>
              
              {isSelected && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-5 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.05 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Controles de tiempo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm"
      >
        <div className="flex items-center space-x-2">
          <FiActivity className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Panel de Análisis</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {[
            { key: '7d', label: '7 días' },
            { key: '30d', label: '30 días' },
            { key: '90d', label: '90 días' }
          ].map((option) => (
            <motion.button
              key={option.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeRange(option.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === option.key
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tendencias */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tendencia de Asistencia</h3>
              <p className="text-sm text-gray-500">Últimos {timeRange === '7d' ? '7 días' : timeRange === '30d' ? '30 días' : '90 días'}</p>
            </div>
            <motion.div
              animate={{ rotate: animateCharts ? 360 : 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <FiTrendingUp className="w-6 h-6 text-blue-500" />
            </motion.div>
          </div>
          <div className="h-64">
            <Line data={generateTrendData()} options={chartOptions} />
          </div>
        </motion.div>

        {/* Gráfico de actividad del sistema */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Actividad del Sistema</h3>
              <p className="text-sm text-gray-500">Distribución de uso</p>
            </div>
            <FiEye className="w-6 h-6 text-purple-500" />
          </div>
          <div className="h-64">
            <Doughnut data={getActivityData()} options={doughnutOptions} />
          </div>
        </motion.div>
      </div>

      {/* Gráfico de distribución por grados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Distribución de Estudiantes por Grado</h3>
            <p className="text-sm text-gray-500">Total de estudiantes matriculados</p>
          </div>
          <FiBookOpen className="w-6 h-6 text-emerald-500" />
        </div>
        <div className="h-64">
          <Bar data={getGradeDistribution()} options={chartOptions} />
        </div>
      </motion.div>
    </div>
  )
}

export default InteractiveDashboard