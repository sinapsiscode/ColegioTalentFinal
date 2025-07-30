import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  FiZap,
  FiEye
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import PageTransition from '../../components/common/PageTransition'
import useAdminDashboardStore from '../../stores/adminDashboardStore'
import useTutorAttendanceStore from '../../stores/tutorAttendanceStore'
import useAttendanceStore from '../../stores/attendanceStore'
import useAuthStore from '../../stores/authStore'

import AdminStats from '../../components/admin/AdminStats'
import RecentActivity from '../../components/admin/RecentActivity'
import ActiveUsers from '../../components/admin/ActiveUsers'
import RecentCommuniques from '../../components/admin/RecentCommuniques'
import SecurityAlerts from '../../components/admin/SecurityAlerts'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import InteractiveChart from '../../components/common/InteractiveChart'
import EnhancedUserDistributionChart from '../../components/charts/EnhancedUserDistributionChart'
import InteractiveDashboard from '../../components/charts/InteractiveDashboard'
import RealTimeStats from '../../components/admin/RealTimeStats'
import { showSuccess, showError, showInfo } from '../../utils/sweetAlert'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
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

  // Estadísticas de asistencia de tutores y estudiantes
  const { 
    obtenerEstadisticasHoy: obtenerEstadisticasTutores,
    obtenerTutoresEnColegio,
    obtenerEstadisticasAsistencia: obtenerEstadisticasAsistenciaTutores
  } = useTutorAttendanceStore()

  const { 
    obtenerEstadisticasHoy: obtenerEstadisticasEstudiantes,
    obtenerEstudiantesEnEscuela
  } = useAttendanceStore()

  // Estados locales
  const [selectedPeriod, setSelectedPeriod] = useState('mes')
  const [showReports, setShowReports] = useState(false)
  const [estadisticasAsistencia, setEstadisticasAsistencia] = useState(null)
  const [interactiveMode, setInteractiveMode] = useState(false)

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

  // Handlers
  const handleRefresh = () => {
    cargarDashboard()
    cargarEstadisticasAsistencia()
    showSuccess('Dashboard actualizado', 'Los datos han sido actualizados exitosamente')
  }

  const handleExportReport = async () => {
    try {
      const reporte = generarReporte('completo')
      
      // Importar XLSX dinámicamente
      const XLSX = await import('xlsx')
      
      // Crear un nuevo workbook
      const wb = XLSX.utils.book_new()
      
      // Hoja 1: Resumen General
      const resumenData = [
        ['REPORTE GENERAL DEL SISTEMA'],
        ['Fecha de generación:', new Date().toLocaleDateString('es-PE')],
        [''],
        ['INDICADORES CLAVE'],
        ['Usuarios activos:', resumenRapido.usuariosActivos],
        ['Estudiantes totales:', resumenRapido.totalEstudiantes],
        ['Asistencia promedio:', `${resumenRapido.asistenciaPromedio}%`],
        ['Comunicados enviados:', resumenRapido.comunicadosEnviados]
      ]
      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')
      
      // Hoja 2: Rendimiento Académico (si existe)
      if (reporte.rendimientoAcademico) {
        const rendimientoData = [
          ['RENDIMIENTO ACADÉMICO'],
          [''],
          ['Indicador', 'Valor'],
          ['Promedio general', reporte.rendimientoAcademico.promedioGeneral || 'N/A'],
          ['Estudiantes aprobados', reporte.rendimientoAcademico.aprobados || 0],
          ['Estudiantes desaprobados', reporte.rendimientoAcademico.desaprobados || 0],
          ['Tasa de aprobación', `${reporte.rendimientoAcademico.tasaAprobacion || 0}%`]
        ]
        const wsRendimiento = XLSX.utils.aoa_to_sheet(rendimientoData)
        XLSX.utils.book_append_sheet(wb, wsRendimiento, 'Rendimiento')
      }
      
      // Hoja 3: Asistencia (si existe)
      if (reporte.asistencia) {
        const asistenciaData = [
          ['REPORTE DE ASISTENCIA'],
          [''],
          ['Indicador', 'Valor'],
          ['Asistencia promedio', `${reporte.asistencia.promedio || 0}%`],
          ['Total presentes', reporte.asistencia.totalPresentes || 0],
          ['Total tardanzas', reporte.asistencia.totalTardanzas || 0],
          ['Total faltas', reporte.asistencia.totalFaltas || 0]
        ]
        const wsAsistencia = XLSX.utils.aoa_to_sheet(asistenciaData)
        XLSX.utils.book_append_sheet(wb, wsAsistencia, 'Asistencia')
      }
      
      // Hoja 4: Comunicaciones (si existe)
      if (reporte.comunicaciones) {
        const comunicacionesData = [
          ['REPORTE DE COMUNICACIONES'],
          [''],
          ['Indicador', 'Valor'],
          ['Total comunicados', reporte.comunicaciones.total || 0],
          ['Comunicados leídos', reporte.comunicaciones.leidos || 0],
          ['Tasa de lectura', `${reporte.comunicaciones.tasaLectura || 0}%`],
          ['Promedio respuestas', reporte.comunicaciones.promedioRespuestas || 0]
        ]
        const wsComunicaciones = XLSX.utils.aoa_to_sheet(comunicacionesData)
        XLSX.utils.book_append_sheet(wb, wsComunicaciones, 'Comunicaciones')
      }
      
      // Aplicar estilos básicos a todas las hojas
      const sheets = wb.SheetNames
      sheets.forEach(sheetName => {
        const ws = wb.Sheets[sheetName]
        const range = XLSX.utils.decode_range(ws['!ref'])
        
        // Ajustar ancho de columnas
        ws['!cols'] = [
          { wch: 30 }, // Columna A
          { wch: 20 }  // Columna B
        ]
      })
      
      // Generar y descargar el archivo
      const fileName = `reporte_general_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)
      
      showSuccess('Reporte exportado', 'El reporte se ha descargado exitosamente')
    } catch (error) {
      console.error('Error al exportar reporte:', error)
      showError('Error', 'No se pudo exportar el reporte')
    }
  }

  const handleAlertRead = (alertaId) => {
    marcarAlertaComoLeida(alertaId)
  }

  const resumenRapido = obtenerResumenRapido()

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner size="xl" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <PageTransition>
        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {/* Header de la página - Completamente responsive */}
        <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Panel de Administración
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mt-1 max-w-2xl">
              Gestión integral del Colegio Talentos
            </p>
          </div>
          
          <div className="flex flex-row sm:flex-col md:flex-row items-stretch gap-2 sm:gap-2 md:gap-3">
            <AnimatedButton
              variant="outline"
              icon={FiRefreshCw}
              onClick={handleRefresh}
              size="sm"
              className="flex-1 sm:flex-none justify-center text-xs sm:text-sm"
            >
              <span className="hidden xs:inline">Actualizar</span>
              <span className="xs:hidden">
                <FiRefreshCw className="w-4 h-4" />
              </span>
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              icon={FiDownload}
              onClick={handleExportReport}
              size="sm"
              className="flex-1 sm:flex-none justify-center text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Exportar</span>
              <span className="sm:hidden">
                <FiDownload className="w-4 h-4" />
              </span>
            </AnimatedButton>
            
            <AnimatedButton
              variant={interactiveMode ? "secondary" : "outline"}
              icon={interactiveMode ? FiEye : FiZap}
              onClick={() => setInteractiveMode(!interactiveMode)}
              size="sm"
              className="flex-1 sm:flex-none justify-center text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">
                {interactiveMode ? 'Clásico' : 'Interactivo'}
              </span>
              <span className="sm:hidden">
                {interactiveMode ? <FiEye className="w-4 h-4" /> : <FiZap className="w-4 h-4" />}
              </span>
            </AnimatedButton>
          </div>
        </div>

        {/* Resumen rápido - Completamente responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-talentos-primary via-talentos-secondary to-talentos-accent rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 text-white overflow-hidden relative"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12"></div>
          
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center md:text-left"
              >
                <div className="flex items-center justify-center md:justify-start w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-xl mx-auto md:mx-0 mb-2 sm:mb-3">
                  <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                </div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-none">{resumenRapido.usuariosConectados}</p>
                <p className="text-xs sm:text-sm md:text-base opacity-90 mt-1">
                  <span className="hidden sm:inline">Usuarios</span>
                  <span className="sm:hidden">Users</span>
                  <span className="hidden md:inline"> Conectados</span>
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center md:text-left"
              >
                <div className="flex items-center justify-center md:justify-start w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-xl mx-auto md:mx-0 mb-2 sm:mb-3">
                  <FiMessageSquare className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                </div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-none">{resumenRapido.comunicadosHoy}</p>
                <p className="text-xs sm:text-sm md:text-base opacity-90 mt-1">
                  <span className="hidden sm:inline">Comunicados</span>
                  <span className="sm:hidden">Msgs</span>
                  <span className="hidden md:inline"> Hoy</span>
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center md:text-left"
              >
                <div className="flex items-center justify-center md:justify-start w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-xl mx-auto md:mx-0 mb-2 sm:mb-3">
                  <FiShield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                </div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-none">{resumenRapido.alertasPendientes}</p>
                <p className="text-xs sm:text-sm md:text-base opacity-90 mt-1">
                  <span className="hidden sm:inline">Alertas</span>
                  <span className="sm:hidden">Alerts</span>
                  <span className="hidden md:inline"> Pendientes</span>
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center md:text-left"
              >
                <div className="flex items-center justify-center md:justify-start w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-xl mx-auto md:mx-0 mb-2 sm:mb-3">
                  <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                </div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-none">{resumenRapido.rendimientoGeneral}</p>
                <p className="text-xs sm:text-sm md:text-base opacity-90 mt-1">
                  <span className="hidden sm:inline">Rendimiento</span>
                  <span className="sm:hidden">Perf</span>
                  <span className="hidden md:inline"> General</span>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Contenido condicional basado en el modo */}
        {interactiveMode ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Estadísticas en tiempo real */}
            <RealTimeStats 
              estadisticasAsistencia={estadisticasAsistencia}
              onRefresh={handleRefresh}
            />
            
            {/* Dashboard interactivo */}
            <div className="mt-8">
              <InteractiveDashboard 
                estadisticasGenerales={estadisticasGenerales}
                estadisticasAsistencia={estadisticasAsistencia}
              />
            </div>
          </motion.div>
        ) : (
          <>
            {/* Dashboard clásico */}
            <AdminStats estadisticas={estadisticasGenerales} loading={cargando} />

        {/* Estadísticas de Asistencia */}
        {estadisticasAsistencia && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 sm:mb-6"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 md:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 md:mb-6 gap-3">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-talentos-primary flex-shrink-0" />
                  <span className="truncate">
                    <span className="hidden md:inline">Asistencia de Hoy - Resumen General</span>
                    <span className="md:hidden">Asistencia Hoy</span>
                  </span>
                </h3>
                <AnimatedButton
                  variant="outline"
                  icon={FiRefreshCw}
                  onClick={cargarEstadisticasAsistencia}
                  size="sm"
                  className="text-xs sm:text-sm flex-shrink-0"
                >
                  <span className="hidden sm:inline">Actualizar</span>
                  <span className="sm:hidden">Refresh</span>
                </AnimatedButton>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {/* Estadísticas de Tutores */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-5 md:p-6 border border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <h4 className="font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-200 rounded-lg">
                      <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-sm sm:text-base">Tutores</span>
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-blue-700">Total:</span>
                      <span className="font-bold text-blue-900 bg-blue-200 px-2 py-1 rounded-lg">{estadisticasAsistencia.tutores.total}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-blue-700">Presentes:</span>
                      <span className="font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">{estadisticasAsistencia.tutores.presentes}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-blue-700">Tardanzas:</span>
                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">{estadisticasAsistencia.tutores.tardanzas}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-blue-700">Faltas:</span>
                      <span className="font-bold text-red-700 bg-red-100 px-2 py-1 rounded-lg">{estadisticasAsistencia.tutores.faltas}</span>
                    </div>
                    <div className="pt-2 sm:pt-3 border-t border-blue-300">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-800 font-semibold text-xs sm:text-sm">Asistencia:</span>
                        <span className="font-bold text-base sm:text-lg text-blue-900">{estadisticasAsistencia.tutores.porcentajeAsistencia.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Estadísticas de Estudiantes */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 sm:p-5 md:p-6 border border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <h4 className="font-semibold text-green-900 mb-3 sm:mb-4 flex items-center space-x-2">
                    <div className="p-1.5 bg-green-200 rounded-lg">
                      <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-sm sm:text-base">Estudiantes</span>
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-green-700">Total:</span>
                      <span className="font-bold text-green-900 bg-green-200 px-2 py-1 rounded-lg">{estadisticasAsistencia.estudiantes.total}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-green-700">Presentes:</span>
                      <span className="font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">{estadisticasAsistencia.estudiantes.presentes}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-green-700">Tardanzas:</span>
                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">{estadisticasAsistencia.estudiantes.tardanzas}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-green-700">Faltas:</span>
                      <span className="font-bold text-red-700 bg-red-100 px-2 py-1 rounded-lg">{estadisticasAsistencia.estudiantes.faltas}</span>
                    </div>
                    <div className="pt-2 sm:pt-3 border-t border-green-300">
                      <div className="flex justify-between items-center">
                        <span className="text-green-800 font-semibold text-xs sm:text-sm">Asistencia:</span>
                        <span className="font-bold text-base sm:text-lg text-green-900">{estadisticasAsistencia.estudiantes.porcentajeAsistencia.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Resumen Consolidado */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 sm:p-5 md:p-6 border border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1"
                >
                  <h4 className="font-semibold text-purple-900 mb-3 sm:mb-4 flex items-center space-x-2">
                    <div className="p-1.5 bg-purple-200 rounded-lg">
                      <FiBarChart className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <span className="text-sm sm:text-base">Resumen General</span>
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-purple-700">Total personas:</span>
                      <span className="font-bold text-purple-900 bg-purple-200 px-2 py-1 rounded-lg">{estadisticasAsistencia.consolidado.totalPersonas}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-purple-700">Presentes:</span>
                      <span className="font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">{estadisticasAsistencia.consolidado.totalPresentes}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-purple-700">Tardanzas:</span>
                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">{estadisticasAsistencia.consolidado.totalTardanzas}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-purple-700">Faltas:</span>
                      <span className="font-bold text-red-700 bg-red-100 px-2 py-1 rounded-lg">{estadisticasAsistencia.consolidado.totalFaltas}</span>
                    </div>
                    <div className="pt-2 sm:pt-3 border-t border-purple-300">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-800 font-semibold text-xs sm:text-sm">Promedio:</span>
                        <span className="font-bold text-base sm:text-lg text-purple-900">{estadisticasAsistencia.consolidado.promedioAsistencia.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Acciones rápidas */}
              <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <AnimatedButton
                    variant="outline"
                    onClick={() => navigate('/asistencia')}
                    size="sm"
                    className="flex-1 sm:flex-none text-xs sm:text-sm justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                  >
                    <span className="hidden sm:inline">Ver Asistencia Estudiantes</span>
                    <span className="sm:hidden">Asistencia Estudiantes</span>
                  </AnimatedButton>
                  <AnimatedButton
                    variant="outline"
                    onClick={() => navigate('/admin/tutor-attendance')}
                    size="sm"
                    className="flex-1 sm:flex-none text-xs sm:text-sm justify-center bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                  >
                    <span className="hidden sm:inline">Ver Asistencia Tutores</span>
                    <span className="sm:hidden">Asistencia Tutores</span>
                  </AnimatedButton>
                  <AnimatedButton
                    variant="outline"
                    onClick={() => navigate('/scanner')}
                    size="sm"
                    className="flex-1 sm:flex-none text-xs sm:text-sm justify-center bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                  >
                    Ir al Escáner
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-4 sm:mb-6">
          {/* Actividad reciente */}
          <div className="lg:col-span-1">
            <RecentActivity 
              actividades={actividadReciente} 
              loading={cargando}
              onActivityClick={(actividad) => {
                // Manejar click en actividad
                let mensaje = `${actividad.accion}`
                if (actividad.detalle) {
                  mensaje += `: ${actividad.detalle}`
                }
                
                // Navegar según el tipo de actividad
                switch(actividad.tipo) {
                  case 'comunicado':
                    navigate('/admin/communiques')
                    break
                  case 'mensaje':
                    navigate('/admin/users')
                    break
                  case 'calificacion':
                    navigate('/admin/reports')
                    break
                  case 'asistencia':
                    navigate('/admin/attendance') 
                    break
                  default:
                    showInfo('Actividad', mensaje)
                }
              }}
            />
          </div>
          
          {/* Usuarios activos */}
          <div className="lg:col-span-1">
            <ActiveUsers 
              usuarios={usuariosActivos} 
              loading={cargando}
              onUserClick={(usuario) => {
                navigate('/admin/users')
              }}
            />
          </div>
          
          {/* Alertas de seguridad */}
          <div className="lg:col-span-1">
            <SecurityAlerts 
              alertas={alertasSeguridad} 
              onMarcarComoLeida={handleAlertRead}
              loading={cargando}
              onAlertClick={(alerta) => {
                // Navegar según el tipo de alerta
                switch(alerta.tipo) {
                  case 'acceso':
                    navigate('/admin/users')
                    break
                  case 'actualizacion':
                    navigate('/admin/settings')
                    break
                  case 'comportamiento':
                    navigate('/admin/reports')
                    break
                  default:
                    showInfo('Alerta de Seguridad', alerta.mensaje)
                }
              }}
            />
          </div>
        </div>

        {/* Comunicados recientes */}
        <div className="mb-6">
          <RecentCommuniques 
            comunicados={comunicadosRecientes} 
            loading={cargando}
            onCommuniqueClick={(comunicado) => {
              navigate('/admin/communiques')
            }}
          />
        </div>

        {/* Gráficos interactivos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-4 sm:mb-6">
          {/* Gráfico de asistencia por día */}
          <div className="order-2 lg:order-1">
            <InteractiveChart
              type="line"
              title="Tendencia de Asistencia"
              subtitle="Últimos 7 días"
              data={[
                { label: 'Lun', value: 92 },
                { label: 'Mar', value: 88 },
                { label: 'Mie', value: 95 },
                { label: 'Jue', value: 91 },
                { label: 'Vie', value: 87 },
                { label: 'Sáb', value: 85 },
                { label: 'Hoy', value: estadisticasAsistencia?.consolidado.promedioAsistencia || 90 }
              ]}
              height={280}
              onDataPointClick={(data) => {
                showInfo('Detalles del día', `Asistencia: ${data.value}%`)
              }}
            />
          </div>
          
          {/* Gráfico de distribución de usuarios mejorado */}
          <div className="order-1 lg:order-2">
            <EnhancedUserDistributionChart
              data={[
                { label: 'Estudiantes', value: estadisticasGenerales.totalEstudiantes || 450 },
                { label: 'Padres', value: estadisticasGenerales.totalPadres || 380 },
                { label: 'Tutores', value: estadisticasGenerales.totalTutores || 25 },
                { label: 'Administrativos', value: 5 }
              ]}
              height={280}
              onUserTypeClick={(data) => {
                navigate('/admin/users')
              }}
            />
          </div>
        </div>

        {/* Reportes y métricas adicionales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Rendimiento académico */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/admin/reports')}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border border-blue-200 p-4 sm:p-5 md:p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-blue-900 flex items-center space-x-2">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <FiBarChart className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="truncate">Rendimiento Académico</span>
              </h3>
            </div>
            
            {reportes.rendimientoAcademico && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-blue-700">Promedio General:</span>
                  <span className="text-xs sm:text-sm font-bold text-blue-900 bg-blue-200 px-2 py-1 rounded-lg">{reportes.rendimientoAcademico.promedioGeneral}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-blue-700">Mejor Grado:</span>
                  <span className="text-xs sm:text-sm font-bold text-blue-900 bg-blue-200 px-2 py-1 rounded-lg">{reportes.rendimientoAcademico.mejorGrado}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-blue-700">Destacados:</span>
                  <span className="text-xs sm:text-sm font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">{reportes.rendimientoAcademico.estudiantesDestacados}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-blue-700">En Riesgo:</span>
                  <span className="text-xs sm:text-sm font-bold text-red-700 bg-red-100 px-2 py-1 rounded-lg">{reportes.rendimientoAcademico.estudiantesEnRiesgo}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Comunicaciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/admin/communiques')}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg border border-purple-200 p-4 sm:p-5 md:p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-purple-900 flex items-center space-x-2">
                <div className="p-2 bg-purple-200 rounded-lg">
                  <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="truncate">Comunicaciones</span>
              </h3>
            </div>
            
            {reportes.comunicaciones && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-purple-700">Total Enviados:</span>
                  <span className="text-xs sm:text-sm font-bold text-purple-900 bg-purple-200 px-2 py-1 rounded-lg">{reportes.comunicaciones.totalEnviados}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-purple-700">Promedio Vistas:</span>
                  <span className="text-xs sm:text-sm font-bold text-purple-900 bg-purple-200 px-2 py-1 rounded-lg">{reportes.comunicaciones.promedioVistas}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-purple-700">Tasa Respuesta:</span>
                  <span className="text-xs sm:text-sm font-bold text-purple-900 bg-purple-200 px-2 py-1 rounded-lg">{reportes.comunicaciones.tasaRespuesta}%</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Satisfacción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/admin/users')}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg border border-green-200 p-4 sm:p-5 md:p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-green-900 flex items-center space-x-2">
                <div className="p-2 bg-green-200 rounded-lg">
                  <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="truncate">Satisfacción</span>
              </h3>
            </div>
            
            {reportes.satisfaccion && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-green-700">Padres:</span>
                  <span className="text-xs sm:text-sm font-bold text-green-900 bg-green-200 px-2 py-1 rounded-lg">{reportes.satisfaccion.padres}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-green-700">Estudiantes:</span>
                  <span className="text-xs sm:text-sm font-bold text-green-900 bg-green-200 px-2 py-1 rounded-lg">{reportes.satisfaccion.estudiantes}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-green-700">Profesores:</span>
                  <span className="text-xs sm:text-sm font-bold text-green-900 bg-green-200 px-2 py-1 rounded-lg">{reportes.satisfaccion.profesores}/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-green-700">Comentarios +:</span>
                  <span className="text-xs sm:text-sm font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">{reportes.satisfaccion.comentariosPositivos}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
          </>
        )}
      </main>
    </PageTransition>
    </div>
  )
}

export default Dashboard