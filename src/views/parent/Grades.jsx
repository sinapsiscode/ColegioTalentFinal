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
import { useNavigate } from 'react-router-dom'

import Header from '../../components/common/Header'
import useGradesStore from '../../stores/gradesStore'
import useAuthStore from '../../stores/authStore'

import GradeCard from '../../components/grades/GradeCard'
import GradeDetail from '../../components/grades/GradeDetail'
import GradeStats from '../../components/grades/GradeStats'
import SubjectRanking from '../../components/grades/SubjectRanking'
import SearchInput from '../../components/common/SearchInput'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import { showSuccess, showError } from '../../utils/sweetAlert'

const Grades = () => {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
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
  const [selectedStudent, setSelectedStudent] = useState('1') // Ana Sofía por defecto

  // Cargar calificaciones al montar
  useEffect(() => {
    cargarCalificaciones()
  }, [cargarCalificaciones])

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

  const handleDownload = (calificacion) => {
    showSuccess('Descargar', 'Función de descarga próximamente disponible')
  }

  const handlePrint = (calificacion) => {
    showSuccess('Imprimir', 'Función de impresión próximamente disponible')
  }

  const handleExportAll = () => {
    showSuccess('Exportar', 'Función de exportación próximamente disponible')
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

  const estudianteOptions = [
    { value: 'all', label: 'Todos los estudiantes' },
    { value: '1', label: 'Ana Sofía Rodríguez' },
    { value: '2', label: 'Luis Miguel Rodríguez' }
  ]

  const estadisticas = obtenerEstadisticas()
  const ranking = obtenerRankingMaterias(parseInt(selectedStudent))
  const selectedStudentName = estudianteOptions.find(est => est.value === selectedStudent)?.label || 'Estudiante'

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
              <h1 className="text-3xl font-bold text-gray-900">Calificaciones</h1>
              <p className="text-gray-600 mt-1">
                Seguimiento del rendimiento académico de tus hijos
              </p>
            </div>
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
              variant="primary"
              icon={FiDownload}
              onClick={handleExportAll}
              size="sm"
            >
              Exportar
            </AnimatedButton>
          </div>
        </div>

        {/* Estadísticas */}
        <GradeStats estadisticas={estadisticas} loading={cargando} />

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-sm text-gray-600">
              Mostrando {calificacionesFiltradas.length} de {calificaciones.length} calificaciones
              {searchTerm && (
                <span className="ml-2">
                  para "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de calificaciones */}
          <div className="lg:col-span-2">
            {calificacionesFiltradas.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filtros.bimestre !== 'all' || filtros.materia !== 'all' || filtros.estudiante !== 'all'
                    ? 'No se encontraron calificaciones'
                    : 'No hay calificaciones disponibles'
                  }
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filtros.bimestre !== 'all' || filtros.materia !== 'all' || filtros.estudiante !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Las calificaciones aparecerán aquí cuando estén disponibles'
                  }
                </p>
              </div>
            ) : (
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 xl:grid-cols-2 gap-4' 
                  : 'space-y-4'
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