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

  // Estados locales
  const [selectedPeriod, setSelectedPeriod] = useState('mes')
  const [showReports, setShowReports] = useState(false)

  // Cargar dashboard al montar
  useEffect(() => {
    cargarDashboard()
  }, [cargarDashboard])

  // Handlers
  const handleRefresh = () => {
    cargarDashboard()
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