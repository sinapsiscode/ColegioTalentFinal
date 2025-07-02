import React, { useState, useEffect } from 'react'
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
  FiEye
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import useAdminReportsStore from '../../stores/adminReportsStore'
import useAuthStore from '../../stores/authStore'

import ReportCard from '../../components/admin/ReportCard'
import ReportStats from '../../components/admin/ReportStats'
import ReportGenerator from '../../components/admin/ReportGenerator'
import SearchInput from '../../components/common/SearchInput'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'

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
    eliminarReporte,
    duplicarReporte
  } = useAdminReportsStore()

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportesFiltrados, setReportesFiltrados] = useState([])

  // Cargar reportes al montar
  useEffect(() => {
    cargarReportes()
  }, [cargarReportes])

  // Filtrar reportes
  useEffect(() => {
    let resultado = []
    
    if (searchTerm) {
      resultado = buscarReportes(searchTerm)
    } else {
      resultado = obtenerReportesPorFiltros()
    }
    
    setReportesFiltrados(resultado)
  }, [reportes, searchTerm, filtros, buscarReportes, obtenerReportesPorFiltros])

  // Handlers
  const handleGenerateReport = async (tipo, configuracion) => {
    try {
      const reporte = await generarReporte(tipo, configuracion)
      showSuccess('Reporte generado', 'El reporte ha sido generado exitosamente')
      return reporte
    } catch (error) {
      showError('Error', 'No se pudo generar el reporte')
      throw error
    }
  }

  const handleDownloadReport = async (reporte) => {
    try {
      const archivo = await exportarReporte(reporte.id, reporte.formato)
      showSuccess('Descarga iniciada', `Descargando ${archivo.archivo}`)
    } catch (error) {
      showError('Error', 'No se pudo descargar el reporte')
    }
  }

  const handleViewReport = (reporte) => {
    setSelectedReport(reporte)
    showSuccess('Ver Reporte', `Abriendo ${reporte.nombre}`)
  }

  const handleEditReport = (reporte) => {
    showSuccess('Editar Reporte', 'Editor de reportes próximamente disponible')
  }

  const handleDeleteReport = async (reporteId) => {
    try {
      const result = await showConfirm(
        '¿Eliminar reporte?',
        'Esta acción no se puede deshacer',
        'Sí, eliminar',
        'Cancelar'
      )

      if (result.isConfirmed) {
        eliminarReporte(reporteId)
        showSuccess('Reporte eliminado', 'El reporte ha sido eliminado exitosamente')
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  const handleDuplicateReport = (reporteId) => {
    const nuevoId = duplicarReporte(reporteId)
    if (nuevoId) {
      showSuccess('Reporte duplicado', 'Se ha creado una copia del reporte')
    }
  }

  const handleRefresh = () => {
    cargarReportes()
    showSuccess('Reportes actualizados', 'Los datos han sido actualizados')
  }

  const handleExportAll = () => {
    showSuccess('Exportar Todo', 'Función de exportación masiva próximamente disponible')
  }

  // Opciones de filtro
  const tipoOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'academico', label: 'Académico' },
    { value: 'asistencia', label: 'Asistencia' },
    { value: 'comunicaciones', label: 'Comunicaciones' },
    { value: 'satisfaccion', label: 'Satisfacción' },
    { value: 'recursos_humanos', label: 'Recursos Humanos' },
    { value: 'finanzas', label: 'Finanzas' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'actividades', label: 'Actividades' }
  ]

  const estadoOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'actualizado', label: 'Solo actualizados' },
    { value: 'pendiente', label: 'Solo pendientes' },
    { value: 'generando', label: 'Solo generando' },
    { value: 'error', label: 'Con errores' }
  ]

  const estadisticas = obtenerEstadisticas()

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
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Reportes</h1>
            <p className="text-gray-600 mt-1">
              Generación, gestión y análisis de reportes institucionales
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-talentos-primary text-white' 
                    : 'text-gray-600 hover:text-talentos-primary'
                }`}
                title="Vista en grilla"
              >
                <FiGrid className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-talentos-primary text-white' 
                    : 'text-gray-600 hover:text-talentos-primary'
                }`}
                title="Vista en lista"
              >
                <FiList className="w-4 h-4" />
              </motion.button>
            </div>
            
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
              onClick={handleExportAll}
              size="sm"
            >
              Exportar Todo
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              icon={FiPlus}
              onClick={() => setShowGenerator(true)}
              size="sm"
            >
              Nuevo Reporte
            </AnimatedButton>
          </div>
        </div>

        {/* Estadísticas */}
        <ReportStats estadisticas={estadisticas} loading={cargando} />

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar reportes..."
            />
            
            <FilterDropdown
              label="Categoría"
              options={tipoOptions}
              selectedValue={filtros.tipo}
              onSelect={(value) => actualizarFiltros({ tipo: value })}
            />
            
            <FilterDropdown
              label="Estado"
              options={estadoOptions}
              selectedValue={filtros.estado}
              onSelect={(value) => actualizarFiltros({ estado: value })}
            />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Mostrando {reportesFiltrados.length} de {reportes.length} reportes
              </span>
            </div>
          </div>
        </div>

        {/* Lista de reportes */}
        {reportesFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || Object.values(filtros).some(f => f !== 'all')
                ? 'No se encontraron reportes'
                : 'No hay reportes disponibles'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(filtros).some(f => f !== 'all')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Genera tu primer reporte para comenzar'
              }
            </p>
            {!searchTerm && !Object.values(filtros).some(f => f !== 'all') && (
              <AnimatedButton
                variant="primary"
                icon={FiPlus}
                onClick={() => setShowGenerator(true)}
              >
                Generar Primer Reporte
              </AnimatedButton>
            )}
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {reportesFiltrados.map((reporte, index) => (
              <motion.div
                key={reporte.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ReportCard
                  reporte={reporte}
                  onView={handleViewReport}
                  onDownload={handleDownloadReport}
                  onEdit={handleEditReport}
                  onDelete={handleDeleteReport}
                  onDuplicate={handleDuplicateReport}
                  onGenerate={handleGenerateReport}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de generador de reportes */}
      <ReportGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onGenerate={handleGenerateReport}
        configuraciones={configuraciones}
      />
    </div>
  )
}

export default Reports