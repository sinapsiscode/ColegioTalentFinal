import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  FiFileText,
  FiRefreshCw,
  FiDownload,
  FiSearch,
  FiFilter,
  FiPlus,
  FiGrid,
  FiList,
  FiCalendar,
  FiEye,
  FiTrendingUp
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import useAdminReportsStore from '../../stores/adminReportsStore'
import useAuthStore from '../../stores/authStore'

// Componentes que siempre se cargan
import ReportCard from '../../components/admin/ReportCard'
import ReportStats from '../../components/admin/ReportStats'
import SearchInput from '../../components/common/SearchInput'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import DateRangeFilter from '../../components/common/DateRangeFilter'
import UnifiedExcelButton from '../../components/common/UnifiedExcelButton'

// Lazy imports para componentes pesados
import { ChartComponents, ModalComponents } from '../../utils/lazyImports'
import { LazyLoadWrapper, LazyLoadingFallback } from '../../components/common/LazyLoadWrapper'

// Utilities
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'
import { handleExport } from '../../utils/exportUtilsSimple'
import { generateAdvancedReport } from '../../utils/advancedPdfGenerator'
import { generateAdvancedExcelReport } from '../../utils/advancedExcelExporter'

// Lazy load componentes pesados
const ReportGenerator = React.lazy(() => import('../../components/admin/ReportGenerator'))
const ExportModal = React.lazy(() => import('../../components/common/ExportModal'))

const Reports = () => {
  const { usuario } = useAuthStore()
  const { 
    cargando,
    reportes,
    filtros,
    configuraciones,
    cargarReportes,
    generarReporte,
    exportarReporte,
    obtenerReportesPorFiltros,
    buscarReportes,
    actualizarFiltros,
    obtenerEstadisticas,
    limpiarFiltros
  } = useAdminReportsStore()

  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredReports, setFilteredReports] = useState([])
  const [showGeneratorModal, setShowGeneratorModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showCharts, setShowCharts] = useState(false)

  // Cargar solo las estadísticas al inicio
  useEffect(() => {
    cargarReportes()
  }, [cargarReportes])

  // Memoizar estadísticas
  const estadisticas = useMemo(() => obtenerEstadisticas(), [reportes, obtenerEstadisticas])

  // Memoizar reportes filtrados
  const reportesFiltrados = useMemo(() => {
    if (searchTerm) {
      return buscarReportes(searchTerm)
    }
    return obtenerReportesPorFiltros()
  }, [searchTerm, reportes, filtros, buscarReportes, obtenerReportesPorFiltros])

  useEffect(() => {
    setFilteredReports(reportesFiltrados)
  }, [reportesFiltrados])

  // Callbacks optimizados
  const handleSearch = useCallback((value) => {
    setSearchTerm(value)
  }, [])

  const handleFilterChange = useCallback((filterType, value) => {
    actualizarFiltros({ [filterType]: value })
  }, [actualizarFiltros])

  const handleDateRangeChange = useCallback((startDate, endDate) => {
    actualizarFiltros({ fechaInicio: startDate, fechaFin: endDate })
  }, [actualizarFiltros])

  const handleGenerateReport = useCallback(async (reportData) => {
    try {
      const result = await generarReporte(reportData)
      if (result.success) {
        showSuccess('Reporte generado', 'El reporte se ha generado exitosamente')
        setShowGeneratorModal(false)
      } else {
        showError('Error', result.error || 'No se pudo generar el reporte')
      }
    } catch (error) {
      showError('Error', 'Error al generar el reporte')
    }
  }, [generarReporte])

  const handleExportReport = useCallback(async (report, format) => {
    setExportLoading(true)
    try {
      let result
      
      if (format === 'pdf') {
        result = await generateAdvancedReport(report, usuario)
      } else if (format === 'excel') {
        result = await generateAdvancedExcelReport(report, usuario)
      } else {
        result = await exportarReporte(report.id, format)
      }

      if (result.success) {
        showSuccess('Exportación exitosa', `Reporte exportado en formato ${format.toUpperCase()}`)
      } else {
        showError('Error', result.error || 'No se pudo exportar el reporte')
      }
    } catch (error) {
      showError('Error', 'Error al exportar el reporte')
    } finally {
      setExportLoading(false)
    }
  }, [exportarReporte, usuario])

  const handleViewReport = useCallback((report) => {
    setSelectedReport(report)
    // Aquí podrías abrir un modal o navegar a una vista detallada
    console.log('Ver reporte:', report)
  }, [])

  const handleRefresh = useCallback(() => {
    cargarReportes()
    setSearchTerm('')
    limpiarFiltros()
  }, [cargarReportes, limpiarFiltros])

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'attendance', label: 'Asistencia' },
    { value: 'grades', label: 'Calificaciones' },
    { value: 'payments', label: 'Pagos' },
    { value: 'general', label: 'General' }
  ]

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'completed', label: 'Completados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'processing', label: 'En proceso' }
  ]

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <LoadingSpinner size="xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Header />
      
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <FiFileText className="text-talentos-primary" />
                <span>Centro de Reportes</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Genera y gestiona reportes del sistema educativo
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <AnimatedButton
                onClick={() => setShowCharts(!showCharts)}
                variant={showCharts ? "secondary" : "primary"}
                icon={FiTrendingUp}
              >
                {showCharts ? 'Ocultar' : 'Ver'} Gráficos
              </AnimatedButton>
              
              <AnimatedButton
                onClick={() => setShowGeneratorModal(true)}
                variant="primary"
                icon={FiPlus}
              >
                Nuevo Reporte
              </AnimatedButton>
              
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                title="Actualizar"
              >
                <FiRefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <ReportStats estadisticas={estadisticas} />
        </motion.div>

        {/* Charts Section - Lazy Loaded */}
        {showCharts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <LazyLoadWrapper fallback={<LazyLoadingFallback message="Cargando gráficos..." />}>
              <ChartComponents.ChartsDashboard />
            </LazyLoadWrapper>
          </motion.div>
        )}

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SearchInput
              value={searchTerm}
              onChange={handleSearch}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar reportes..."
            />
            
            <FilterDropdown
              label="Tipo de reporte"
              options={typeOptions}
              selectedValue={filtros.tipo || 'all'}
              onSelect={(value) => handleFilterChange('tipo', value)}
            />
            
            <FilterDropdown
              label="Estado"
              options={statusOptions}
              selectedValue={filtros.estado || 'all'}
              onSelect={(value) => handleFilterChange('estado', value)}
            />
            
            <DateRangeFilter
              startDate={filtros.fechaInicio}
              endDate={filtros.fechaFin}
              onDateChange={handleDateRangeChange}
            />
          </div>
          
          {(searchTerm || Object.keys(filtros).length > 0) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredReports.length} reporte(s) encontrado(s)
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  limpiarFiltros()
                }}
                className="text-sm text-talentos-primary hover:text-talentos-secondary"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </motion.div>

        {/* View Mode Toggle */}
        <div className="flex justify-end mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded ${
                viewMode === 'grid'
                  ? 'bg-talentos-primary text-white'
                  : 'text-gray-600 hover:text-gray-900'
              } transition-colors flex items-center space-x-1`}
            >
              <FiGrid className="w-4 h-4" />
              <span className="text-sm">Cuadrícula</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded ${
                viewMode === 'list'
                  ? 'bg-talentos-primary text-white'
                  : 'text-gray-600 hover:text-gray-900'
              } transition-colors flex items-center space-x-1`}
            >
              <FiList className="w-4 h-4" />
              <span className="text-sm">Lista</span>
            </button>
          </div>
        </div>

        {/* Reports Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
        >
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ReportCard
                report={report}
                viewMode={viewMode}
                onView={handleViewReport}
                onExport={(format) => handleExportReport(report, format)}
              />
            </motion.div>
          ))}
        </motion.div>

        {filteredReports.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron reportes
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || Object.keys(filtros).length > 0
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Genera tu primer reporte haciendo clic en "Nuevo Reporte"'}
            </p>
            {(!searchTerm && Object.keys(filtros).length === 0) && (
              <AnimatedButton
                onClick={() => setShowGeneratorModal(true)}
                variant="primary"
                icon={FiPlus}
              >
                Generar Primer Reporte
              </AnimatedButton>
            )}
          </motion.div>
        )}

        {/* Bulk Export Section */}
        {filteredReports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Exportación Masiva
            </h3>
            <div className="flex flex-wrap gap-3">
              <UnifiedExcelButton
                data={filteredReports}
                dataType="reportes"
                customLabel="Exportar Todo a Excel"
                userRole="admin"
                showFormatModal={false}
                onExportSuccess={() => showSuccess('Éxito', 'Reportes exportados correctamente')}
              />
              
              <AnimatedButton
                onClick={() => setShowExportModal(true)}
                variant="secondary"
                icon={FiDownload}
                disabled={exportLoading}
              >
                Opciones de Exportación
              </AnimatedButton>
            </div>
          </motion.div>
        )}

        {/* Modals - Lazy Loaded */}
        {showGeneratorModal && (
          <Suspense fallback={<LoadingFallback />}>
            <ReportGenerator
              isOpen={showGeneratorModal}
              onClose={() => setShowGeneratorModal(false)}
              onGenerate={handleGenerateReport}
              configuraciones={configuraciones}
            />
          </Suspense>
        )}

        {showExportModal && (
          <Suspense fallback={<LoadingFallback />}>
            <ExportModal
              isOpen={showExportModal}
              onClose={() => setShowExportModal(false)}
              onExport={handleExport}
              data={filteredReports}
              title="Exportar Reportes"
            />
          </Suspense>
        )}
      </main>
    </div>
  )
}

export default Reports