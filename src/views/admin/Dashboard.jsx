import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiRefreshCw,
  FiDownload,
  FiSettings,
  FiBarChart,
  FiTrendingUp,
  FiUsers,
  FiMessageSquare,
  FiShield,
  FiCalendar,
  FiFileText
} from 'react-icons/fi'

import Header from '../../components/common/Header'
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
import { showSuccess, showError } from '../../utils/sweetAlert'

const Dashboard = () => {
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

  const handleExportReport = () => {
    const reporte = generarReporte('completo')
    showSuccess('Reporte generado', 'El reporte ha sido preparado para descarga')
  }

  const handleAlertRead = (alertaId) => {
    marcarAlertaComoLeida(alertaId)
  }

  const resumenRapido = obtenerResumenRapido()

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600 mt-1">
              Gestión integral del Colegio Talentos - Vista general del sistema
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <AnimatedButton
              variant="outline"
              icon={FiRefreshCw}
              onClick={handleRefresh}
              size="sm"
            >
              Actualizar
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              icon={FiDownload}
              onClick={handleExportReport}
              size="sm"
            >
              Exportar Reporte
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              icon={FiSettings}
              onClick={() => showSuccess('Configuración', 'Panel de configuración próximamente')}
              size="sm"
            >
              Configuración
            </AnimatedButton>
          </div>
        </div>

        {/* Resumen rápido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-talentos-primary to-talentos-secondary rounded-lg shadow-sm p-6 mb-6 text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mx-auto mb-2">
                <FiUsers className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">{resumenRapido.usuariosConectados}</p>
              <p className="text-sm opacity-90">Usuarios Conectados</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mx-auto mb-2">
                <FiMessageSquare className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">{resumenRapido.comunicadosHoy}</p>
              <p className="text-sm opacity-90">Comunicados Hoy</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mx-auto mb-2">
                <FiShield className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">{resumenRapido.alertasPendientes}</p>
              <p className="text-sm opacity-90">Alertas Pendientes</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mx-auto mb-2">
                <FiTrendingUp className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">{resumenRapido.rendimientoGeneral}</p>
              <p className="text-sm opacity-90">Rendimiento General</p>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas principales */}
        <AdminStats estadisticas={estadisticasGenerales} loading={cargando} />

        {/* Estadísticas de Asistencia */}
        {estadisticasAsistencia && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FiCalendar className="w-5 h-5 text-talentos-primary" />
                  <span>Asistencia de Hoy - Resumen General</span>
                </h3>
                <button
                  onClick={cargarEstadisticasAsistencia}
                  className="text-sm text-talentos-primary hover:text-talentos-secondary transition-colors duration-200"
                >
                  <FiRefreshCw className="w-4 h-4 inline mr-1" />
                  Actualizar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Estadísticas de Tutores */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                    <FiUsers className="w-4 h-4" />
                    <span>Tutores</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Total:</span>
                      <span className="font-medium text-blue-900">{estadisticasAsistencia.tutores.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Presentes:</span>
                      <span className="font-medium text-green-600">{estadisticasAsistencia.tutores.presentes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Tardanzas:</span>
                      <span className="font-medium text-yellow-600">{estadisticasAsistencia.tutores.tardanzas}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Faltas:</span>
                      <span className="font-medium text-red-600">{estadisticasAsistencia.tutores.faltas}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Asistencia:</span>
                        <span className="font-bold text-blue-900">{estadisticasAsistencia.tutores.porcentajeAsistencia.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas de Estudiantes */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-green-900 mb-3 flex items-center space-x-2">
                    <FiUsers className="w-4 h-4" />
                    <span>Estudiantes</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Total:</span>
                      <span className="font-medium text-green-900">{estadisticasAsistencia.estudiantes.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Presentes:</span>
                      <span className="font-medium text-green-600">{estadisticasAsistencia.estudiantes.presentes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Tardanzas:</span>
                      <span className="font-medium text-yellow-600">{estadisticasAsistencia.estudiantes.tardanzas}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Faltas:</span>
                      <span className="font-medium text-red-600">{estadisticasAsistencia.estudiantes.faltas}</span>
                    </div>
                    <div className="pt-2 border-t border-green-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Asistencia:</span>
                        <span className="font-bold text-green-900">{estadisticasAsistencia.estudiantes.porcentajeAsistencia.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen Consolidado */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-3 flex items-center space-x-2">
                    <FiBarChart className="w-4 h-4" />
                    <span>Resumen General</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Total personas:</span>
                      <span className="font-medium text-purple-900">{estadisticasAsistencia.consolidado.totalPersonas}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Presentes:</span>
                      <span className="font-medium text-green-600">{estadisticasAsistencia.consolidado.totalPresentes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Tardanzas:</span>
                      <span className="font-medium text-yellow-600">{estadisticasAsistencia.consolidado.totalTardanzas}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Faltas:</span>
                      <span className="font-medium text-red-600">{estadisticasAsistencia.consolidado.totalFaltas}</span>
                    </div>
                    <div className="pt-2 border-t border-purple-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-700">Promedio:</span>
                        <span className="font-bold text-purple-900">{estadisticasAsistencia.consolidado.promedioAsistencia.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => window.location.href = '/admin/attendance'}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors duration-200"
                  >
                    Ver Asistencia Estudiantes
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin/tutor-attendance'}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors duration-200"
                  >
                    Ver Asistencia Tutores
                  </button>
                  <button
                    onClick={() => window.location.href = '/scanner'}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors duration-200"
                  >
                    Ir al Escáner
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Actividad reciente */}
          <div className="lg:col-span-1">
            <RecentActivity actividades={actividadReciente} loading={cargando} />
          </div>
          
          {/* Usuarios activos */}
          <div className="lg:col-span-1">
            <ActiveUsers usuarios={usuariosActivos} loading={cargando} />
          </div>
          
          {/* Alertas de seguridad */}
          <div className="lg:col-span-1">
            <SecurityAlerts 
              alertas={alertasSeguridad} 
              onMarcarComoLeida={handleAlertRead}
              loading={cargando} 
            />
          </div>
        </div>

        {/* Comunicados recientes */}
        <div className="mb-6">
          <RecentCommuniques comunicados={comunicadosRecientes} loading={cargando} />
        </div>

        {/* Reportes y métricas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rendimiento académico */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FiBarChart className="w-5 h-5 text-blue-600" />
                <span>Rendimiento Académico</span>
              </h3>
            </div>
            
            {reportes.rendimientoAcademico && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Promedio General:</span>
                  <span className="text-sm font-medium">{reportes.rendimientoAcademico.promedioGeneral}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mejor Grado:</span>
                  <span className="text-sm font-medium">{reportes.rendimientoAcademico.mejorGrado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Destacados:</span>
                  <span className="text-sm font-medium text-green-600">{reportes.rendimientoAcademico.estudiantesDestacados}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">En Riesgo:</span>
                  <span className="text-sm font-medium text-red-600">{reportes.rendimientoAcademico.estudiantesEnRiesgo}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Comunicaciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FiMessageSquare className="w-5 h-5 text-purple-600" />
                <span>Comunicaciones</span>
              </h3>
            </div>
            
            {reportes.comunicaciones && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Enviados:</span>
                  <span className="text-sm font-medium">{reportes.comunicaciones.totalEnviados}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Promedio Vistas:</span>
                  <span className="text-sm font-medium">{reportes.comunicaciones.promedioVistas}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tasa Respuesta:</span>
                  <span className="text-sm font-medium">{reportes.comunicaciones.tasaRespuesta}%</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Satisfacción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FiTrendingUp className="w-5 h-5 text-green-600" />
                <span>Satisfacción</span>
              </h3>
            </div>
            
            {reportes.satisfaccion && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Padres:</span>
                  <span className="text-sm font-medium">{reportes.satisfaccion.padres}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estudiantes:</span>
                  <span className="text-sm font-medium">{reportes.satisfaccion.estudiantes}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Profesores:</span>
                  <span className="text-sm font-medium">{reportes.satisfaccion.profesores}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Comentarios +:</span>
                  <span className="text-sm font-medium text-green-600">{reportes.satisfaccion.comentariosPositivos}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard