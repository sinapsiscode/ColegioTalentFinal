import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiBook, 
  FiUser, 
  FiCalendar, 
  FiBarChart, 
  FiDownload,
  FiRefreshCw,
  FiArrowLeft,
  FiGrid,
  FiList,
  FiTrendingUp,
  FiFilter,
  FiPrinter
} from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'

import Header from '../../components/common/Header'
import usePermissions from '../../hooks/usePermissions'
import useGradesStore from '../../stores/gradesStore'
import useAuthStore from '../../stores/authStore'
import { DatabaseQueries } from '../../data/databaseSchema'

import GradeCard from '../../components/grades/GradeCard'
import GradeDetail from '../../components/grades/GradeDetail'
import GradeStats from '../../components/grades/GradeStats'
import SubjectRanking from '../../components/grades/SubjectRanking'
import SearchInput from '../../components/common/SearchInput'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import ExportModal from '../../components/common/ExportModal'
import { showSuccess, showError } from '../../utils/sweetAlert'
import { exportForParents } from '../../utils/exportUtilsSimple'

const Grades = () => {
  const navigate = useNavigate()
  const { studentId } = useParams()
  const { usuario } = useAuthStore()
  const { canViewGrades } = usePermissions()
  
  // VALIDACIÓN DE PERMISOS
  useEffect(() => {
    if (studentId && !canViewGrades(studentId)) {
      navigate('/unauthorized')
      return
    }
  }, [studentId, canViewGrades, navigate])
  const { 
    calificaciones, 
    materias,
    bimestres,
    cargando, 
    filtros,
    cargarCalificaciones,
    obtenerCalificacionesPorFiltros,
    buscarCalificaciones,
    actualizarFiltros,
    obtenerEstadisticas,
    obtenerRankingMaterias
  } = useGradesStore()

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' o 'list'
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [calificacionesFiltradas, setCalificacionesFiltradas] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('all')
  const [misHijos, setMisHijos] = useState([])
  const [loadingHijos, setLoadingHijos] = useState(true)

  // Cargar hijos y calificaciones al montar
  useEffect(() => {
    const cargarDatos = async () => {
      if (usuario && usuario.id) {
        setLoadingHijos(true)
        try {
          // Obtener los hijos del padre
          const hijos = DatabaseQueries.getChildrenByParentId(usuario.id)
          setMisHijos(hijos)
          
          // Establecer el primer hijo como seleccionado por defecto
          if (hijos.length > 0 && selectedStudent === 'all') {
            setSelectedStudent(hijos[0].id.toString())
          }
          
          console.log(`👨‍👧‍👦 Cargados ${hijos.length} hijo(s) para calificaciones`)
        } catch (error) {
          console.error('Error cargando hijos:', error)
        } finally {
          setLoadingHijos(false)
        }
      }
    }

    cargarDatos()
    cargarCalificaciones()
  }, [usuario, cargarCalificaciones, selectedStudent])

  // Filtrar calificaciones
  useEffect(() => {
    let resultado = []
    
    if (searchTerm) {
      resultado = buscarCalificaciones(searchTerm)
    } else {
      resultado = obtenerCalificacionesPorFiltros()
    }
    
    setCalificacionesFiltradas(resultado)
  }, [calificaciones, searchTerm, filtros, buscarCalificaciones, obtenerCalificacionesPorFiltros])

  // Handlers
  const handleViewDetails = (calificacion) => {
    setSelectedGrade(calificacion)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedGrade(null)
  }

  const handleRefresh = () => {
    cargarCalificaciones()
    showSuccess('Calificaciones actualizadas', 'Se han cargado las calificaciones más recientes')
  }

  const handleDownload = async (calificacion) => {
    try {
      // Preparar datos de una sola calificación para exportar
      const exportData = [{
        'Materia': calificacion.materia,
        'Calificación': calificacion.nota,
        'Fecha': calificacion.fecha,
        'Observaciones': calificacion.observaciones || 'Sin observaciones'
      }]

      const result = await exportForParents(exportData, {
        title: `Calificación de ${calificacion.materia} - ${usuario?.nombre || 'Estudiante'}`,
        filename: `calificacion_${calificacion.materia?.toLowerCase().replace(/\s+/g, '_')}`
      })

      if (result.success) {
        showSuccess('PDF Descargado', result.message)
      } else {
        showError('Error de Exportación', result.error)
      }
    } catch (error) {
      console.error('Error al descargar:', error)
      showError('Error', 'Error inesperado durante la descarga')
    }
  }

  const handlePrint = async (calificacion) => {
    // Para imprimir, también generamos PDF (más compatible)
    try {
      const exportData = [{
        'Materia': calificacion.materia,
        'Calificación': calificacion.nota,
        'Fecha': calificacion.fecha,
        'Observaciones': calificacion.observaciones || 'Sin observaciones'
      }]

      const result = await exportForParents(exportData, {
        title: `Calificación de ${calificacion.materia} - ${usuario?.nombre || 'Estudiante'}`,
        filename: `imprimir_${calificacion.materia?.toLowerCase().replace(/\s+/g, '_')}`
      })

      if (result.success) {
        showSuccess('PDF Generado para Imprimir', 'Puedes abrir el archivo PDF e imprimirlo desde tu navegador')
      } else {
        showError('Error de Impresión', result.error)
      }
    } catch (error) {
      console.error('Error al imprimir:', error)
      showError('Error', 'Error inesperado durante la impresión')
    }
  }

  const handleExportAll = async () => {
    if (calificacionesFiltradas.length === 0) {
      showError('Sin Datos', 'No hay calificaciones para exportar')
      return
    }

    try {
      // Preparar datos para exportación (padres solo reciben PDF)
      const exportData = calificacionesFiltradas.map(calificacion => ({
        'Materia': calificacion.materia,
        'Calificación': calificacion.nota,
        'Fecha': calificacion.fecha,
        'Observaciones': calificacion.observaciones || 'Sin observaciones'
      }))

      const result = await exportForParents(exportData, {
        title: `Reporte Académico - ${usuario?.nombre || 'Estudiante'}`,
        filename: 'reporte_calificaciones_estudiante'
      })

      if (result.success) {
        showSuccess('PDF Descargado', result.message)
      } else {
        showError('Error de Exportación', result.error)
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      showError('Error', 'Error inesperado durante la exportación')
    }
  }

  // Opciones de filtro
  const bimestreOptions = [
    { value: 'all', label: 'Todos los bimestres' },
    ...bimestres.map(bim => ({ value: bim.id.toString(), label: bim.nombre }))
  ]

  const materiaOptions = [
    { value: 'all', label: 'Todas las materias' },
    ...materias.map(mat => ({ value: mat.id.toString(), label: mat.nombre }))
  ]

  // Opciones dinámicas basadas en los hijos del padre
  const estudianteOptions = [
    { value: 'all', label: 'Todos mis hijos' },
    ...misHijos.map(hijo => ({
      value: hijo.id.toString(),
      label: `${hijo.nombre} ${hijo.apellidos}`
    }))
  ]

  const estadisticas = obtenerEstadisticas()
  const ranking = obtenerRankingMaterias(parseInt(selectedStudent))
  const selectedStudentName = estudianteOptions.find(est => est.value === selectedStudent)?.label || 'Estudiante'

  if (cargando || loadingHijos) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-64 sm:min-h-96">
            <LoadingSpinner size="xl" />
            <div className="ml-4">
              <p className="text-gray-600">
                {loadingHijos ? 'Cargando información de sus hijos...' : 'Cargando calificaciones...'}
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Header de la página */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/parent/dashboard')}
              className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200 lg:hidden"
            >
              <FiArrowLeft className="w-5 h-5" />
            </motion.button>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calificaciones de Mis Hijos</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Seguimiento del rendimiento académico de tus hijos
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
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
            
            <div className="flex space-x-2 sm:space-x-3">
              <AnimatedButton
                variant="outline"
                icon={FiRefreshCw}
                onClick={handleRefresh}
                size="sm"
              >
                <span className="hidden sm:inline">Actualizar</span>
                <span className="sm:hidden">Act.</span>
              </AnimatedButton>
              
              <AnimatedButton
                variant="primary"
                icon={FiDownload}
                onClick={handleExportAll}
                size="sm"
              >
                <span className="hidden sm:inline">Exportar</span>
                <span className="sm:hidden">Exp.</span>
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <GradeStats estadisticas={estadisticas} loading={cargando} />

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar calificaciones..."
            />
            
            <FilterDropdown
              label="Estudiante"
              options={estudianteOptions}
              selectedValue={filtros.estudiante}
              onSelect={(value) => {
                actualizarFiltros({ estudiante: value })
                setSelectedStudent(value === 'all' ? '1' : value)
              }}
            />
            
            <FilterDropdown
              label="Bimestre"
              options={bimestreOptions}
              selectedValue={filtros.bimestre}
              onSelect={(value) => actualizarFiltros({ bimestre: value })}
            />
            
            <FilterDropdown
              label="Materia"
              options={materiaOptions}
              selectedValue={filtros.materia}
              onSelect={(value) => actualizarFiltros({ materia: value })}
            />
          </div>
          
          {/* Contador de resultados */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              Mostrando {calificacionesFiltradas.length} de {calificaciones.length} calificaciones
              {searchTerm && (
                <span className="ml-2 block sm:inline mt-1 sm:mt-0">
                  para "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Lista de calificaciones */}
          <div className="lg:col-span-2">
            {calificacionesFiltradas.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {misHijos.length === 0 
                    ? 'No tiene hijos asignados'
                    : searchTerm || filtros.bimestre !== 'all' || filtros.materia !== 'all' || filtros.estudiante !== 'all'
                    ? 'No se encontraron calificaciones'
                    : 'No hay calificaciones disponibles para sus hijos'
                  }
                </h3>
                <p className="text-gray-600">
                  {misHijos.length === 0
                    ? 'Contacte al administrador para vincular a sus hijos con su cuenta'
                    : searchTerm || filtros.bimestre !== 'all' || filtros.materia !== 'all' || filtros.estudiante !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Las calificaciones de sus hijos aparecerán aquí cuando estén disponibles'
                  }
                </p>
              </div>
            ) : (
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4' 
                  : 'space-y-3 sm:space-y-4'
              }`}>
                {calificacionesFiltradas.map((calificacion, index) => (
                  <motion.div
                    key={calificacion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GradeCard
                      calificacion={calificacion}
                      onViewDetails={handleViewDetails}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Ranking de materias */}
          <div className="lg:col-span-1">
            <SubjectRanking
              ranking={ranking}
              estudiante={selectedStudentName}
              loading={cargando}
            />
          </div>
        </div>
      </main>

      {/* Modal de detalle */}
      <GradeDetail
        calificacion={selectedGrade}
        isOpen={showDetail}
        onClose={handleCloseDetail}
        onDownload={handleDownload}
        onPrint={handlePrint}
      />
    </div>
  )
}

export default Grades