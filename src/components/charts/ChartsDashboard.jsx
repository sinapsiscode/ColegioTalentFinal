import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import InteractiveChart from './InteractiveChart'
import DateRangeFilter from '../common/DateRangeFilter'
import FilterDropdown from '../common/FilterDropdown'
import AnimatedCard from '../common/AnimatedCard'

const ChartsDashboard = ({ 
  data, 
  filters = {},
  onFilterChange,
  title = 'Dashboard de Análisis'
}) => {
  const [activeTab, setActiveTab] = useState('general')
  
  // Colores corporativos
  const colors = {
    primary: 'rgb(255, 107, 107)',
    secondary: 'rgb(255, 159, 64)',
    success: 'rgb(34, 197, 94)',
    warning: 'rgb(251, 191, 36)',
    danger: 'rgb(239, 68, 68)',
    info: 'rgb(59, 130, 246)',
    purple: 'rgb(139, 92, 246)'
  }

  // Datos para gráficos
  const chartData = useMemo(() => {
    // Gráfico de asistencia mensual
    const attendanceData = {
      labels: data?.monthlyAttendance?.map(item => item.month) || [],
      datasets: [{
        label: 'Asistencia %',
        data: data?.monthlyAttendance?.map(item => item.percentage) || [],
        borderColor: colors.success,
        backgroundColor: `${colors.success}20`,
        fill: true,
        tension: 0.4
      }]
    }

    // Gráfico de rendimiento por materia
    const performanceData = {
      labels: data?.subjectPerformance?.map(item => item.subject) || [],
      datasets: [{
        label: 'Promedio',
        data: data?.subjectPerformance?.map(item => item.average) || [],
        backgroundColor: [
          colors.primary,
          colors.secondary,
          colors.info,
          colors.purple,
          colors.success
        ]
      }]
    }

    // Gráfico de distribución de calificaciones
    const gradesDistribution = {
      labels: ['AD (18-20)', 'A (14-17)', 'B (11-13)', 'C (0-10)'],
      datasets: [{
        label: 'Estudiantes',
        data: [
          data?.gradeDistribution?.ad || 0,
          data?.gradeDistribution?.a || 0,
          data?.gradeDistribution?.b || 0,
          data?.gradeDistribution?.c || 0
        ],
        backgroundColor: [colors.success, colors.info, colors.warning, colors.danger]
      }]
    }

    // Gráfico de tendencia de comunicados
    const communicationsData = {
      labels: data?.communicationsTrend?.map(item => item.date) || [],
      datasets: [
        {
          label: 'Enviados',
          data: data?.communicationsTrend?.map(item => item.sent) || [],
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}20`,
          fill: false
        },
        {
          label: 'Leídos',
          data: data?.communicationsTrend?.map(item => item.read) || [],
          borderColor: colors.success,
          backgroundColor: `${colors.success}20`,
          fill: false
        }
      ]
    }

    // Gráfico de pagos
    const paymentsData = {
      labels: ['Pagados', 'Pendientes', 'Vencidos'],
      datasets: [{
        data: [
          data?.paymentStatus?.paid || 0,
          data?.paymentStatus?.pending || 0,
          data?.paymentStatus?.overdue || 0
        ],
        backgroundColor: [colors.success, colors.warning, colors.danger],
        borderWidth: 0
      }]
    }

    // Gráfico comparativo
    const comparativeData = {
      labels: data?.comparativeAnalysis?.labels || [],
      datasets: [
        {
          label: 'Período Actual',
          data: data?.comparativeAnalysis?.current || [],
          backgroundColor: colors.primary
        },
        {
          label: 'Período Anterior',
          data: data?.comparativeAnalysis?.previous || [],
          backgroundColor: colors.secondary
        }
      ]
    }

    return {
      attendance: attendanceData,
      performance: performanceData,
      grades: gradesDistribution,
      communications: communicationsData,
      payments: paymentsData,
      comparative: comparativeData
    }
  }, [data])

  const tabs = [
    { id: 'general', label: 'Vista General', icon: '📊' },
    { id: 'academic', label: 'Académico', icon: '📚' },
    { id: 'attendance', label: 'Asistencia', icon: '📅' },
    { id: 'financial', label: 'Financiero', icon: '💰' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <DateRangeFilter
            startDate={filters.startDate}
            endDate={filters.endDate}
            onDateChange={({ startDate, endDate }) => 
              onFilterChange({ ...filters, startDate, endDate })
            }
          />
          
          <FilterDropdown
            label="Grado"
            options={[
              { value: 'all', label: 'Todos los grados' },
              { value: '1', label: '1° Primaria' },
              { value: '2', label: '2° Primaria' },
              { value: '3', label: '3° Primaria' },
              { value: '4', label: '4° Primaria' },
              { value: '5', label: '5° Primaria' },
              { value: '6', label: '6° Primaria' }
            ]}
            selectedValue={filters.grade || 'all'}
            onSelect={(value) => onFilterChange({ ...filters, grade: value })}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${activeTab === tab.id
                  ? 'border-talentos-primary text-talentos-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="mt-6">
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencia de Asistencia */}
            <AnimatedCard>
              <h3 className="text-lg font-semibold mb-4">Tendencia de Asistencia</h3>
              <InteractiveChart
                type="line"
                data={chartData.attendance}
                height={300}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%'
                        }
                      }
                    }
                  }
                }}
              />
            </AnimatedCard>

            {/* Distribución de Calificaciones */}
            <AnimatedCard>
              <h3 className="text-lg font-semibold mb-4">Distribución de Calificaciones</h3>
              <InteractiveChart
                type="doughnut"
                data={chartData.grades}
                height={300}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </AnimatedCard>

            {/* Comunicados */}
            <AnimatedCard>
              <h3 className="text-lg font-semibold mb-4">Comunicados - Enviados vs Leídos</h3>
              <InteractiveChart
                type="line"
                data={chartData.communications}
                height={300}
              />
            </AnimatedCard>

            {/* Estado de Pagos */}
            <AnimatedCard>
              <h3 className="text-lg font-semibold mb-4">Estado de Pagos</h3>
              <InteractiveChart
                type="pie"
                data={chartData.payments}
                height={300}
                options={{
                  plugins: {
                    legend: {
                      position: 'right'
                    }
                  }
                }}
              />
            </AnimatedCard>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rendimiento por Materia */}
            <AnimatedCard className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Rendimiento por Materia</h3>
              <InteractiveChart
                type="bar"
                data={chartData.performance}
                height={350}
                options={{
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      max: 20
                    }
                  }
                }}
              />
            </AnimatedCard>

            {/* Análisis Comparativo */}
            <AnimatedCard className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Análisis Comparativo</h3>
              <InteractiveChart
                type="bar"
                data={chartData.comparative}
                height={300}
              />
            </AnimatedCard>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Gráfico principal de asistencia */}
            <AnimatedCard>
              <h3 className="text-lg font-semibold mb-4">Asistencia Mensual Detallada</h3>
              <InteractiveChart
                type="line"
                data={chartData.attendance}
                height={400}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%'
                        }
                      }
                    }
                  },
                  plugins: {
                    annotation: {
                      annotations: {
                        line1: {
                          type: 'line',
                          yMin: 75,
                          yMax: 75,
                          borderColor: colors.danger,
                          borderWidth: 2,
                          borderDash: [5, 5],
                          label: {
                            content: 'Mínimo requerido: 75%',
                            enabled: true,
                            position: 'end'
                          }
                        }
                      }
                    }
                  }
                }}
              />
            </AnimatedCard>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Asistencia Perfecta</p>
                    <p className="text-2xl font-bold text-green-700">
                      {data?.perfectAttendance || 0} estudiantes
                    </p>
                  </div>
                  <div className="text-3xl">🏆</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">En Riesgo</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {data?.atRisk || 0} estudiantes
                    </p>
                  </div>
                  <div className="text-3xl">⚠️</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Crítico</p>
                    <p className="text-2xl font-bold text-red-700">
                      {data?.critical || 0} estudiantes
                    </p>
                  </div>
                  <div className="text-3xl">🚨</div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Estado de Pagos Detallado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatedCard>
                <h3 className="text-lg font-semibold mb-4">Estado de Pagos</h3>
                <InteractiveChart
                  type="doughnut"
                  data={chartData.payments}
                  height={300}
                />
              </AnimatedCard>

              <AnimatedCard>
                <h3 className="text-lg font-semibold mb-4">Métricas Financieras</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Recaudado</span>
                    <span className="text-xl font-bold text-green-600">
                      S/. {data?.totalCollected?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Por Cobrar</span>
                    <span className="text-xl font-bold text-yellow-600">
                      S/. {data?.totalPending?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Vencidos</span>
                    <span className="text-xl font-bold text-red-600">
                      S/. {data?.totalOverdue?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Tasa de Pago Puntual</span>
                    <span className="text-xl font-bold text-blue-600">
                      {data?.punctualPaymentRate || 0}%
                    </span>
                  </div>
                </div>
              </AnimatedCard>
            </div>

            {/* Tendencia de Ingresos */}
            <AnimatedCard>
              <h3 className="text-lg font-semibold mb-4">Tendencia de Ingresos Mensuales</h3>
              <InteractiveChart
                type="bar"
                data={{
                  labels: data?.monthlyRevenue?.map(item => item.month) || [],
                  datasets: [{
                    label: 'Ingresos (S/.)',
                    data: data?.monthlyRevenue?.map(item => item.amount) || [],
                    backgroundColor: colors.primary
                  }]
                }}
                height={300}
                options={{
                  scales: {
                    y: {
                      ticks: {
                        callback: function(value) {
                          return 'S/. ' + value.toLocaleString()
                        }
                      }
                    }
                  }
                }}
              />
            </AnimatedCard>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChartsDashboard