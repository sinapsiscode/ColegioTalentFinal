import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiMessageSquare,
  FiActivity,
  FiBarChart,
  FiZap,
  FiGrid,
  FiPlus,
  FiSave,
  FiRotateCcw,
  FiEye,
  FiEyeOff
} from 'react-icons/fi'

// Import widgets
import DragDropDashboard from './DragDropDashboard'
import StatsWidget from './widgets/StatsWidget'
import ChartWidget from './widgets/ChartWidget'
import ActivityWidget from './widgets/ActivityWidget'
import QuickActionsWidget from './widgets/QuickActionsWidget'
import AnimatedButton from '../common/AnimatedButton'

const DragDropAdminDashboard = ({ 
  estadisticasGenerales, 
  estadisticasAsistencia,
  onLayoutChange 
}) => {
  const [isDragMode, setIsDragMode] = useState(false)
  const [currentLayout, setCurrentLayout] = useState([])

  // Layout predeterminado
  const defaultLayout = [
    {
      id: 'stats-usuarios',
      type: 'stats',
      title: 'Usuarios Activos',
      position: { x: 0, y: 0 },
      size: { width: 3, height: 2 },
      props: {
        title: 'Usuarios Activos',
        value: estadisticasGenerales?.totalUsuarios || 245,
        change: 12,
        changeType: 'positive',
        icon: FiUsers,
        color: 'blue',
        description: 'Usuarios conectados hoy'
      }
    },
    {
      id: 'stats-estudiantes',
      type: 'stats',
      title: 'Estudiantes',
      position: { x: 3, y: 0 },
      size: { width: 3, height: 2 },
      props: {
        title: 'Estudiantes',
        value: estadisticasGenerales?.totalEstudiantes || 189,
        change: 5,
        changeType: 'positive',
        icon: FiUsers,
        color: 'green',
        description: 'Total matriculados'
      }
    },
    {
      id: 'stats-asistencia',
      type: 'stats',
      title: 'Asistencia',
      position: { x: 6, y: 0 },
      size: { width: 3, height: 2 },
      props: {
        title: 'Asistencia Promedio',
        value: Math.round(estadisticasAsistencia?.consolidado?.promedioAsistencia || 87),
        change: 3,
        changeType: 'positive',
        icon: FiCalendar,
        color: 'orange',
        unit: '%',
        description: 'Promedio semanal'
      }
    },
    {
      id: 'stats-comunicados',
      type: 'stats',
      title: 'Comunicados',
      position: { x: 9, y: 0 },
      size: { width: 3, height: 2 },
      props: {
        title: 'Comunicados',
        value: estadisticasGenerales?.totalComunicados || 67,
        change: 23,
        changeType: 'positive',
        icon: FiMessageSquare,
        color: 'purple',
        description: 'Enviados esta semana'
      }
    },
    {
      id: 'chart-tendencias',
      type: 'chart',
      title: 'Tendencias de Asistencia',
      position: { x: 0, y: 2 },
      size: { width: 6, height: 4 },
      props: {
        title: 'Tendencias de Asistencia',
        type: 'line',
        color: 'blue',
        size: 'large'
      }
    },
    {
      id: 'chart-distribucion',
      type: 'chart',
      title: 'Distribución por Grado',
      position: { x: 6, y: 2 },
      size: { width: 6, height: 4 },
      props: {
        title: 'Distribución por Grado',
        type: 'bar',
        color: 'green',
        size: 'large'
      }
    },
    {
      id: 'activity-recent',
      type: 'activity',
      title: 'Actividad Reciente',
      position: { x: 0, y: 6 },
      size: { width: 4, height: 4 },
      props: {
        title: 'Actividad Reciente',
        maxItems: 6,
        showTimestamps: true,
        size: 'normal'
      }
    },
    {
      id: 'quick-actions',
      type: 'quickActions',
      title: 'Acciones Rápidas',
      position: { x: 4, y: 6 },
      size: { width: 4, height: 4 },
      props: {
        title: 'Acciones Rápidas',
        size: 'normal',
        layout: 'grid'
      }
    },
    {
      id: 'chart-mini-1',
      type: 'chart',
      title: 'Resumen Mensual',
      position: { x: 8, y: 6 },
      size: { width: 4, height: 2 },
      props: {
        title: 'Resumen Mensual',
        type: 'doughnut',
        color: 'purple',
        size: 'small',
        showControls: false
      }
    },
    {
      id: 'stats-mini-1',
      type: 'stats',
      title: 'Conexiones',
      position: { x: 8, y: 8 },
      size: { width: 2, height: 2 },
      props: {
        title: 'Conexiones',
        value: 45,
        change: 8,
        changeType: 'positive',
        icon: FiActivity,
        color: 'blue',
        size: 'small',
        description: 'Activas ahora'
      }
    },
    {
      id: 'stats-mini-2',
      type: 'stats',
      title: 'Rendimiento',
      position: { x: 10, y: 8 },
      size: { width: 2, height: 2 },
      props: {
        title: 'Rendimiento',
        value: 98,
        change: 2,
        changeType: 'positive',
        icon: FiZap,
        color: 'green',
        unit: '%',
        size: 'small',
        description: 'Sistema'
      }
    }
  ]

  // Cargar layout desde localStorage o usar el default
  useEffect(() => {
    const savedLayout = localStorage.getItem('admin-dashboard-layout')
    if (savedLayout) {
      try {
        setCurrentLayout(JSON.parse(savedLayout))
      } catch (error) {
        console.error('Error loading saved layout:', error)
        setCurrentLayout(defaultLayout)
      }
    } else {
      setCurrentLayout(defaultLayout)
    }
  }, [])

  // Actualizar props de widgets cuando cambien los datos
  useEffect(() => {
    setCurrentLayout(prevLayout => 
      prevLayout.map(widget => {
        const updatedWidget = { ...widget }
        
        // Actualizar stats específicos
        if (widget.id === 'stats-usuarios') {
          updatedWidget.props.value = estadisticasGenerales?.totalUsuarios || 245
        } else if (widget.id === 'stats-estudiantes') {
          updatedWidget.props.value = estadisticasGenerales?.totalEstudiantes || 189
        } else if (widget.id === 'stats-asistencia') {
          updatedWidget.props.value = Math.round(estadisticasAsistencia?.consolidado?.promedioAsistencia || 87)
        } else if (widget.id === 'stats-comunicados') {
          updatedWidget.props.value = estadisticasGenerales?.totalComunicados || 67
        }
        
        return updatedWidget
      })
    )
  }, [estadisticasGenerales, estadisticasAsistencia])

  const handleLayoutChange = (newLayout) => {
    setCurrentLayout(newLayout)
    localStorage.setItem('admin-dashboard-layout', JSON.stringify(newLayout))
    onLayoutChange?.(newLayout)
  }

  const handleResetLayout = () => {
    setCurrentLayout(defaultLayout)
    localStorage.removeItem('admin-dashboard-layout')
  }

  const handleToggleDragMode = () => {
    setIsDragMode(!isDragMode)
  }

  const handleAddWidget = () => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type: 'stats',
      title: 'Nuevo Widget',
      position: { x: 0, y: 0 },
      size: { width: 3, height: 2 },
      props: {
        title: 'Nuevo Widget',
        value: 0,
        change: 0,
        icon: FiBarChart,
        color: 'blue',
        description: 'Widget personalizado'
      }
    }
    setCurrentLayout([...currentLayout, newWidget])
  }

  // Renderizar widget según su tipo
  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'stats':
        return <StatsWidget {...widget.props} />
      case 'chart':
        return <ChartWidget {...widget.props} />
      case 'activity':
        return <ActivityWidget {...widget.props} />
      case 'quickActions':
        return <QuickActionsWidget {...widget.props} />
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FiGrid className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Widget desconocido</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: isDragMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl"
            >
              <FiGrid className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Dashboard Personalizable
              </h2>
              <p className="text-sm text-gray-600">
                {isDragMode 
                  ? 'Arrastra los widgets para reorganizar tu dashboard' 
                  : 'Activa el modo edición para personalizar tu vista'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isDragMode && (
              <>
                <AnimatedButton
                  variant="outline"
                  icon={FiPlus}
                  onClick={handleAddWidget}
                  size="sm"
                  className="text-xs"
                >
                  <span className="hidden sm:inline">Agregar</span>
                </AnimatedButton>

                <AnimatedButton
                  variant="outline"
                  icon={FiRotateCcw}
                  onClick={handleResetLayout}
                  size="sm"
                  className="text-xs"
                >
                  <span className="hidden sm:inline">Reset</span>
                </AnimatedButton>
              </>
            )}

            <AnimatedButton
              variant={isDragMode ? "primary" : "outline"}
              icon={isDragMode ? FiSave : FiGrid}
              onClick={handleToggleDragMode}
              size="sm"
            >
              {isDragMode ? 'Finalizar' : 'Personalizar'}
            </AnimatedButton>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`relative transition-all duration-300 ${
          isDragMode ? 'bg-gray-50 border-2 border-dashed border-blue-300 rounded-2xl p-4' : ''
        }`}
      >
        <DragDropDashboard
          initialLayout={currentLayout}
          onLayoutChange={handleLayoutChange}
          gridSize={{ cols: 12, rows: 10 }}
          cellSize={{ width: 80, height: 80 }}
          gap={16}
          className="min-h-[800px]"
        >
          {/* Mapear widgets a sus componentes renderizados */}
          {Object.fromEntries(
            currentLayout.map(widget => [
              widget.type,
              renderWidget(widget)
            ])
          )}
        </DragDropDashboard>

        {/* Overlay de ayuda cuando está en modo edición */}
        <AnimatePresence>
          {isDragMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50"
            >
              <div className="flex items-center space-x-2">
                <FiEye className="w-4 h-4" />
                <span>Modo Edición Activo</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats de personalización */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100"
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-blue-600">
              <FiGrid className="w-4 h-4" />
              <span className="font-medium">{currentLayout.length} widgets</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600">
              <FiActivity className="w-4 h-4" />
              <span className="font-medium">
                {currentLayout.filter(w => w.type === 'stats').length} estadísticas
              </span>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <FiBarChart className="w-4 h-4" />
              <span className="font-medium">
                {currentLayout.filter(w => w.type === 'chart').length} gráficos
              </span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Última actualización: {new Date().toLocaleTimeString('es-ES')}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DragDropAdminDashboard