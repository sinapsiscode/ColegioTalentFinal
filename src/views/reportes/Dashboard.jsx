import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiFileText,
  FiPrinter,
  FiUserPlus
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import CountUpNumber from '../../components/common/CountUpNumber'

// Importar gráficos
import AttendanceChart from '../../components/reports/AttendanceChart'
import GradesChart from '../../components/reports/GradesChart'
import PaymentChart from '../../components/reports/PaymentChart'
import StudentDistributionChart from '../../components/reports/StudentDistributionChart'
import MonthlyTrendChart from '../../components/reports/MonthlyTrendChart'
import ReportCard from '../../components/reports/ReportCard'

import useAuthStore from '../../stores/authStore'
import useReportsStore from '../../stores/reportsStore'
import { showSuccess, showError } from '../../utils/sweetAlert'
import { exportReportToPDF, exportReportToExcel } from '../../utils/reportExporter'

const ReportesDashboard = () => {
  const navigate = useNavigate()
  const { usuario, rol } = useAuthStore()
  
  const {
    reportData,
    loading,
    filters,
    loadReportData,
    updateFilters,
    generateReport
  } = useReportsStore()

  // Estados locales
  const [selectedReport, setSelectedReport] = useState('general')
  const [dateRange, setDateRange] = useState('month')
  const [refreshing, setRefreshing] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Opciones de filtros
  const reportTypes = [
    { value: 'general', label: 'Reporte General', icon: FiBarChart2 },
    { value: 'attendance', label: 'Asistencia', icon: FiClock },
    { value: 'academic', label: 'Académico', icon: FiTrendingUp },
    { value: 'financial', label: 'Financiero', icon: FiDollarSign },
    { value: 'students', label: 'Estudiantes', icon: FiUsers }
  ]

  const dateRanges = [
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'bimester', label: 'Este Bimestre' },
    { value: 'year', label: 'Este Año' },
    { value: 'custom', label: 'Personalizado' }
  ]

  useEffect(() => {
    loadReportData(selectedReport, dateRange)
  }, [selectedReport, dateRange, loadReportData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadReportData(selectedReport, dateRange)
    setTimeout(() => {
      setRefreshing(false)
      showSuccess('Actualizado', 'Los datos han sido actualizados')
    }, 1000)
  }

  const handleExport = async (format) => {
    try {
      const reportTitle = reportTypes.find(r => r.value === selectedReport)?.label || 'Reporte'
      const data = await generateReport(selectedReport, dateRange)
      
      if (format === 'pdf') {
        await exportReportToPDF({
          title: reportTitle,
          data: data,
          dateRange: dateRange,
          generatedBy: usuario.nombre
        })
      } else {
        await exportReportToExcel({
          title: reportTitle,
          data: data,
          dateRange: dateRange
        })
      }
      
      showSuccess('Exportación exitosa', `El reporte ha sido descargado en formato ${format.toUpperCase()}`)
    } catch (error) {
      showError('Error', 'No se pudo exportar el reporte')
    }
  }

  const renderGeneralDashboard = () => (
    <>
      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Total Estudiantes</p>
                <CountUpNumber
                  value={reportData.totalStudents || 0}
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2"
                />
                <p className="text-xs text-green-600 mt-1">
                  +{reportData.newStudentsThisMonth || 0} este mes
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Asistencia Promedio</p>
                <CountUpNumber
                  value={reportData.averageAttendance || 0}
                  decimals={1}
                  suffix="%"
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Últimos 30 días
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <FiCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Promedio Académico</p>
                <CountUpNumber
                  value={reportData.academicAverage || 0}
                  decimals={1}
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2"
                />
                <p className="text-xs text-blue-600 mt-1">
                  {reportData.academicTrend > 0 ? '↑' : '↓'} {Math.abs(reportData.academicTrend || 0)}%
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <FiTrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Recaudación Mensual</p>
                <CountUpNumber
                  value={reportData.monthlyRevenue || 0}
                  prefix="S/. "
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2"
                />
                <p className="text-xs text-yellow-600 mt-1">
                  {reportData.pendingPayments || 0} pagos pendientes
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Tendencia de Asistencia
            </h3>
            <div className="h-48 sm:h-64">
              <AttendanceChart data={reportData.attendanceTrend} />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Distribución por Grados
            </h3>
            <div className="h-48 sm:h-64">
              <StudentDistributionChart data={reportData.studentDistribution} />
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Tendencias mensuales */}
      <AnimatedCard>
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Tendencias Mensuales
          </h3>
          <div className="h-48 sm:h-64 overflow-x-auto">
            <div className="min-w-[400px] h-full">
              <MonthlyTrendChart data={reportData.monthlyTrends} />
            </div>
          </div>
        </div>
      </AnimatedCard>
    </>
  )

  const renderAttendanceReport = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <ReportCard
          title="Asistencia General"
          value={`${reportData.attendanceRate || 0}%`}
          subtitle="Promedio del período"
          icon={FiCheckCircle}
          color="green"
          trend={reportData.attendanceTrend}
        />
        
        <ReportCard
          title="Tardanzas"
          value={reportData.totalTardiness || 0}
          subtitle="Total en el período"
          icon={FiClock}
          color="yellow"
        />
        
        <ReportCard
          title="Inasistencias"
          value={reportData.totalAbsences || 0}
          subtitle="Total en el período"
          icon={FiAlertCircle}
          color="red"
        />
      </div>

      <AnimatedCard className="col-span-1 sm:col-span-2 lg:col-span-3">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Asistencia por Día de la Semana
          </h3>
          <div className="h-48 sm:h-64 overflow-x-auto">
            <div className="min-w-[400px] h-full">
              <AttendanceChart 
                data={reportData.attendanceByDay} 
                type="bar"
              />
            </div>
          </div>
        </div>
      </AnimatedCard>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Asistencia por Grado
            </h3>
            <div className="h-48 sm:h-64">
              <GradesChart 
                data={reportData.attendanceByGrade}
                type="horizontal-bar"
              />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Estudiantes con Mayor Inasistencia
            </h3>
            <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
              {reportData.studentsWithMostAbsences?.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{student.grade}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm sm:text-base font-semibold text-red-600">{student.absences} faltas</p>
                    <p className="text-xs text-gray-500">{student.percentage}% inasistencia</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </>
  )

  const renderAcademicReport = () => (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
        <ReportCard
          title="Promedio General"
          value={reportData.generalAverage || 0}
          subtitle="Todas las materias"
          icon={FiTrendingUp}
          color="blue"
          decimals={1}
        />
        
        <ReportCard
          title="Aprobados"
          value={`${reportData.approvalRate || 0}%`}
          subtitle="Tasa de aprobación"
          icon={FiCheckCircle}
          color="green"
        />
        
        <ReportCard
          title="En Proceso"
          value={reportData.inProgressCount || 0}
          subtitle="Estudiantes"
          icon={FiActivity}
          color="yellow"
        />
        
        <ReportCard
          title="Necesitan Apoyo"
          value={reportData.needSupportCount || 0}
          subtitle="Estudiantes"
          icon={FiAlertCircle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Rendimiento por Materia
            </h3>
            <div className="h-48 sm:h-64">
              <GradesChart 
                data={reportData.performanceBySubject}
                type="radar"
              />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Distribución de Calificaciones
            </h3>
            <div className="h-48 sm:h-64">
              <GradesChart 
                data={reportData.gradeDistribution}
                type="pie"
              />
            </div>
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard className="mt-6">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Evolución del Rendimiento
          </h3>
          <div className="h-48 sm:h-64 overflow-x-auto">
            <div className="min-w-[400px] h-full">
              <MonthlyTrendChart 
                data={reportData.academicEvolution}
                lines={['promedio', 'aprobados', 'desaprobados']}
              />
            </div>
          </div>
        </div>
      </AnimatedCard>
    </>
  )

  const renderFinancialReport = () => (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
        <ReportCard
          title="Ingresos Totales"
          value={reportData.totalRevenue || 0}
          prefix="S/. "
          subtitle="En el período"
          icon={FiDollarSign}
          color="green"
        />
        
        <ReportCard
          title="Por Cobrar"
          value={reportData.pendingAmount || 0}
          prefix="S/. "
          subtitle="Pagos pendientes"
          icon={FiClock}
          color="yellow"
        />
        
        <ReportCard
          title="Morosidad"
          value={`${reportData.delinquencyRate || 0}%`}
          subtitle="Tasa de morosidad"
          icon={FiAlertCircle}
          color="red"
        />
        
        <ReportCard
          title="Recaudación"
          value={`${reportData.collectionRate || 0}%`}
          subtitle="Tasa de recaudación"
          icon={FiCheckCircle}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Ingresos por Concepto
            </h3>
            <div className="h-48 sm:h-64">
              <PaymentChart 
                data={reportData.revenueByCategory}
                type="donut"
              />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Estado de Pagos por Grado
            </h3>
            <div className="h-48 sm:h-64">
              <PaymentChart 
                data={reportData.paymentStatusByGrade}
                type="stacked-bar"
              />
            </div>
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard className="mt-6">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Flujo de Caja Mensual
          </h3>
          <div className="h-48 sm:h-64 overflow-x-auto">
            <div className="min-w-[400px] h-full">
              <MonthlyTrendChart 
                data={reportData.monthlyCashFlow}
                lines={['ingresos', 'proyectado']}
                prefix="S/. "
              />
            </div>
          </div>
        </div>
      </AnimatedCard>
    </>
  )

  const renderStudentReport = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <ReportCard
          title="Total Estudiantes"
          value={reportData.totalStudents || 0}
          subtitle="Matriculados activos"
          icon={FiUsers}
          color="blue"
        />
        
        <ReportCard
          title="Nuevos Ingresos"
          value={reportData.newStudents || 0}
          subtitle="Este período"
          icon={FiUserPlus}
          color="green"
        />
        
        <ReportCard
          title="Tasa de Retención"
          value={`${reportData.retentionRate || 0}%`}
          subtitle="Comparado con año anterior"
          icon={FiActivity}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Distribución por Género
            </h3>
            <div className="h-48 sm:h-64">
              <StudentDistributionChart 
                data={reportData.genderDistribution}
                type="pie"
              />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Estudiantes por Sección
            </h3>
            <div className="h-48 sm:h-64">
              <StudentDistributionChart 
                data={reportData.studentsPerSection}
                type="bar"
              />
            </div>
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard className="mt-6">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Crecimiento de Matrícula
          </h3>
          <div className="h-48 sm:h-64 overflow-x-auto">
            <div className="min-w-[400px] h-full">
              <MonthlyTrendChart 
                data={reportData.enrollmentGrowth}
                lines={['total', 'nuevos', 'retirados']}
              />
            </div>
          </div>
        </div>
      </AnimatedCard>
    </>
  )

  const renderContent = () => {
    switch (selectedReport) {
      case 'attendance':
        return renderAttendanceReport()
      case 'academic':
        return renderAcademicReport()
      case 'financial':
        return renderFinancialReport()
      case 'students':
        return renderStudentReport()
      default:
        return renderGeneralDashboard()
    }
  }

  if (loading && !reportData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Reportes y Estadísticas
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Análisis detallado del rendimiento institucional
              </p>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
              <AnimatedButton
                variant="outline"
                icon={FiRefreshCw}
                onClick={handleRefresh}
                className={refreshing ? 'animate-spin' : ''}
                disabled={refreshing}
              >
                <span className="hidden lg:inline">Actualizar</span>
              </AnimatedButton>
              
              <AnimatedButton
                variant="outline"
                icon={FiPrinter}
                onClick={() => window.print()}
                className="hidden md:flex"
              >
                <span className="hidden lg:inline">Imprimir</span>
              </AnimatedButton>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <AnimatedButton
                  variant={exportFormat === 'pdf' ? 'primary' : 'outline'}
                  icon={FiFileText}
                  onClick={() => handleExport('pdf')}
                  size="sm"
                >
                  PDF
                </AnimatedButton>
                <AnimatedButton
                  variant={exportFormat === 'excel' ? 'primary' : 'outline'}
                  icon={FiDownload}
                  onClick={() => handleExport('excel')}
                  size="sm"
                >
                  Excel
                </AnimatedButton>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center space-x-2 w-full">
              <AnimatedButton
                variant="outline"
                icon={FiRefreshCw}
                onClick={handleRefresh}
                className={`flex-1 ${refreshing ? 'animate-spin' : ''}`}
                disabled={refreshing}
                size="sm"
              >
                Actualizar
              </AnimatedButton>
              
              <AnimatedButton
                variant="outline"
                icon={FiFilter}
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                size="sm"
              >
                Filtros
              </AnimatedButton>
              
              <AnimatedButton
                variant="primary"
                icon={FiDownload}
                onClick={() => handleExport('pdf')}
                size="sm"
              >
                Exportar
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Filtros - Desktop */}
        <div className="hidden sm:block mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tipo de reporte */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                {reportTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedReport(type.value)}
                    className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center ${
                      selectedReport === type.value
                        ? 'bg-talentos-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <type.icon className="w-4 h-4 sm:inline hidden lg:inline xl:hidden mr-1" />
                    <span className="hidden sm:inline lg:hidden xl:inline">{type.label}</span>
                    <span className="sm:hidden lg:inline xl:hidden">{type.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rango de fechas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <FilterDropdown
                options={dateRanges}
                selectedValue={dateRange}
                onSelect={setDateRange}
              />
            </div>

            {/* Filtros adicionales según el tipo de reporte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtros adicionales
              </label>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                <FiFilter className="w-4 h-4 inline mr-2" />
                Más filtros
              </button>
            </div>
          </div>
        </div>

        {/* Filtros - Mobile (collapsible) */}
        <motion.div
          initial={false}
          animate={{ height: showMobileFilters ? 'auto' : 0 }}
          className="sm:hidden overflow-hidden mb-4"
        >
          <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
            {/* Tipo de reporte - Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Período - Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Contenido del reporte */}
        <div className="print:shadow-none">
          {renderContent()}
        </div>

        {/* Footer con metadata */}
        <div className="mt-8 text-center text-sm text-gray-500 print:block hidden">
          <p>
            Reporte generado el {new Date().toLocaleDateString('es-PE')} a las {new Date().toLocaleTimeString('es-PE')}
          </p>
          <p>Por: {usuario.nombre} - Sistema de Gestión Académica Colegio Talentos</p>
        </div>
      </main>
    </div>
  )
}

export default ReportesDashboard