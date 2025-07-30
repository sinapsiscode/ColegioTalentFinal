import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiRefreshCw,
  FiDownload,
  FiBarChart,
  FiTrendingUp,
  FiUsers,
  FiMessageSquare,
  FiShield,
  FiCalendar,
  FiFileText,
  FiSettings,
  FiMaximize2,
  FiMinimize2,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiList,
  FiFilter,
  FiZap
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import PageTransition from '../../components/common/PageTransition'
import useAdminDashboardStore from '../../stores/adminDashboardStore'
import useTutorAttendanceStore from '../../stores/tutorAttendanceStore'
import useAttendanceStore from '../../stores/attendanceStore'
import useAuthStore from '../../stores/authStore'

// Nuevos componentes interactivos
import InteractiveDashboard from '../../components/charts/InteractiveDashboard'
import RealTimeStats from '../../components/admin/RealTimeStats'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { showSuccess, showError, showInfo } from '../../utils/sweetAlert'
import { useNavigate } from 'react-router-dom'

const AdminInteractiveDashboard = () => {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  
  const { 
    cargando,
    estadisticasGenerales,
    usuariosActivos,
    comunicadosRecientes,
    actividadReciente,
    reportes,
    alertasSeguridad,
    cargarDashboard,
    marcarAlertaComoLeida,
    obtenerResumenRapido,
    generarReporte
  } = useAdminDashboardStore()

  // Estadísticas de asistencia
  const { 
    obtenerEstadisticasHoy: obtenerEstadisticasTutores,
    obtenerTutoresEnColegio,
    obtenerEstadisticasAsistencia: obtenerEstadisticasAsistenciaTutores
  } = useTutorAttendanceStore()

  const { 
    obtenerEstadisticasHoy: obtenerEstadisticasEstudiantes,
    obtenerEstudiantesEnEscuela
  } = useAttendanceStore()

  // Estados locales para interactividad
  const [dashboardMode, setDashboardMode] = useState('interactive') // 'interactive' | 'classic'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [showRealTime, setShowRealTime] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedPanel, setSelectedPanel] = useState(null)
  const [estadisticasAsistencia, setEstadisticasAsistencia] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Cargar dashboard al montar
  useEffect(() => {
    cargarDashboard()
    cargarEstadisticasAsistencia()
  }, [cargarDashboard])

  // Cargar estadísticas de asistencia consolidadas
  const cargarEstadisticasAsistencia = () => {
    try {
      const estadisticasTutores = obtenerEstadisticasTutores()
      const estadisticasEstudiantes = obtenerEstadisticasEstudiantes()
      const tutoresEnColegio = obtenerTutoresEnColegio()
      const estudiantesEnEscuela = obtenerEstudiantesEnEscuela()

      const estadisticasConsolidadas = {
        tutores: {
          total: estadisticasTutores.totalTutores || 0,
          presentes: estadisticasTutores.entradas || 0,
          tardanzas: estadisticasTutores.tardanzas || 0,
          faltas: estadisticasTutores.faltas || 0,
          porcentajeAsistencia: estadisticasTutores.porcentajeAsistencia || 0,
          enColegio: tutoresEnColegio.length
        },
        estudiantes: {
          total: estadisticasEstudiantes.totalEstudiantes || 0,
          presentes: estadisticasEstudiantes.conEntrada || 0,
          tardanzas: estadisticasEstudiantes.tardanzas || 0,
          faltas: estadisticasEstudiantes.ausentes || 0,
          porcentajeAsistencia: estadisticasEstudiantes.porcentajeAsistencia || 0,
          enEscuela: estudiantesEnEscuela.length
        },
        consolidado: {
          totalPersonas: (estadisticasTutores.totalTutores || 0) + (estadisticasEstudiantes.totalEstudiantes || 0),
          totalPresentes: (estadisticasTutores.entradas || 0) + (estadisticasEstudiantes.conEntrada || 0),
          totalTardanzas: (estadisticasTutores.tardanzas || 0) + (estadisticasEstudiantes.tardanzas || 0),
          totalFaltas: (estadisticasTutores.faltas || 0) + (estadisticasEstudiantes.ausentes || 0),
          promedioAsistencia: ((estadisticasTutores.porcentajeAsistencia || 0) + (estadisticasEstudiantes.porcentajeAsistencia || 0)) / 2
        }
      }

      setEstadisticasAsistencia(estadisticasConsolidadas)
    } catch (error) {
      console.error('Error cargando estadísticas de asistencia:', error)
    }
  }

  // Handlers con animaciones
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await cargarDashboard()
      cargarEstadisticasAsistencia()
      showSuccess('¡Actualizado!', 'Dashboard actualizado exitosamente')
    } catch (error) {
      showError('Error', 'No se pudo actualizar el dashboard')
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  const handleExportReport = async () => {
    try {
      showInfo('Generando reporte...', 'Por favor espera mientras generamos tu reporte')
      const reporte = await generarReporte('completo')
      
      // Lógica de exportación simplificada
      const dataToExport = {
        fecha: new Date().toLocaleDateString('es-PE'),
        estadisticas: estadisticasGenerales,
        asistencia: estadisticasAsistencia,
        actividad: actividadReciente
      }
      
      // Crear y descargar archivo JSON como demostración
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-dashboard-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showSuccess('¡Listo!', 'Reporte exportado correctamente')
    } catch (error) {
      showError('Error', 'No se pudo exportar el reporte')
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  // Quick actions del dashboard
  const quickActions = [
    {
      label: 'Gestionar Usuarios',
      icon: FiUsers,
      color: 'blue',
      action: () => navigate('/admin/users'),
      count: estadisticasGenerales?.totalUsuarios || 0
    },
    {
      label: 'Ver Comunicados',
      icon: FiMessageSquare,
      color: 'purple',
      action: () => navigate('/admin/communiques'),
      count: comunicadosRecientes?.length || 0
    },
    {
      label: 'Control Asistencia',
      icon: FiCalendar,
      color: 'emerald',
      action: () => navigate('/admin/attendance-control'),
      count: estadisticasAsistencia?.consolidado?.totalPresentes || 0
    },
    {
      label: 'Generar Reportes',
      icon: FiFileText,
      color: 'orange',
      action: () => navigate('/admin/reports'),
      count: reportes?.length || 0
    }
  ]

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <PageTransition>
        <main className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-50 overflow-auto' : 'max-w-7xl mx-auto'} px-4 sm:px-6 lg:px-8 py-8`}>
          {/* Header interactivo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8"
          >
            <div>
              <motion.h1 
                className="text-3xl lg:text-4xl font-bold text-gray-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Dashboard Interactivo
              </motion.h1>
              <motion.p 
                className="text-gray-600 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Bienvenido de vuelta, {usuario?.nombre}. Aquí tienes tu resumen en tiempo real.
              </motion.p>
            </div>

            {/* Controles del dashboard */}
            <motion.div 
              className="flex flex-wrap items-center gap-2 sm:gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Toggle modo de vista */}
              <div className="flex items-center bg-white rounded-xl p-1 shadow-sm">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Toggle tiempo real */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRealTime(!showRealTime)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
                  showRealTime 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                }`}
              >
                {showRealTime ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">Tiempo Real</span>
              </motion.button>

              {/* Fullscreen */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullscreen}
                className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 hover:text-blue-600"
              >
                {isFullscreen ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
              </motion.button>

              {/* Refresh */}
              <AnimatedButton
                variant="outline"
                icon={refreshing ? FiZap : FiRefreshCw}
                onClick={handleRefresh}
                disabled={refreshing}
                className={refreshing ? 'animate-pulse' : ''}
              >
                <span className="hidden sm:inline">
                  {refreshing ? 'Actualizando...' : 'Actualizar'}
                </span>
              </AnimatedButton>

              {/* Export */}
              <AnimatedButton
                variant="primary"
                icon={FiDownload}
                onClick={handleExportReport}
              >
                <span className="hidden sm:inline">Exportar</span>
              </AnimatedButton>
            </motion.div>
          </motion.div>

          {/* Estadísticas en tiempo real */}
          <AnimatePresence>
            {showRealTime && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <RealTimeStats 
                  estadisticasAsistencia={estadisticasAsistencia}
                  onRefresh={handleRefresh}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={action.action}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-xl bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                        <Icon className={`w-5 h-5 text-${action.color}-600`} />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{action.count}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                      {action.label}
                    </h3>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Dashboard principal interactivo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <InteractiveDashboard 
              estadisticasGenerales={estadisticasGenerales}
              estadisticasAsistencia={estadisticasAsistencia}
            />
          </motion.div>
        </main>
      </PageTransition>
    </div>
  )
}

export default AdminInteractiveDashboard