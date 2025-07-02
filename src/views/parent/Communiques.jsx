import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiMail, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw,
  FiArrowLeft,
  FiGrid,
  FiList,
  FiDownload,
  FiShare2,
  FiPrinter
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import Header from '../../components/common/Header'
import useCommunicationsStore from '../../stores/communicationsStore'
import useAuthStore from '../../stores/authStore'

import CommuniqueCard from '../../components/communications/CommuniqueCard'
import CommuniqueDetail from '../../components/communications/CommuniqueDetail'
import CommuniqueStats from '../../components/communications/CommuniqueStats'
import SearchInput from '../../components/common/SearchInput'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'

const Communiques = () => {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { 
    comunicados, 
    cargando, 
    filtros,
    cargarComunicados, 
    marcarComoLeido,
    marcarComoNoLeido,
    obtenerComunicadosPorFiltros,
    buscarComunicados,
    actualizarFiltros,
    obtenerEstadisticas
  } = useCommunicationsStore()

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' o 'list'
  const [selectedCommunique, setSelectedCommunique] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [comunicadosFiltrados, setComunicadosFiltrados] = useState([])

  // Cargar comunicados al montar
  useEffect(() => {
    cargarComunicados()
  }, [cargarComunicados])

  // Filtrar comunicados
  useEffect(() => {
    let resultado = []
    
    if (searchTerm) {
      resultado = buscarComunicados(searchTerm)
    } else {
      resultado = obtenerComunicadosPorFiltros()
    }
    
    setComunicadosFiltrados(resultado)
  }, [comunicados, searchTerm, filtros, buscarComunicados, obtenerComunicadosPorFiltros])

  // Handlers
  const handleMarkAsRead = (comunicadoId) => {
    marcarComoLeido(comunicadoId)
    showSuccess('Marcado como leído', 'El comunicado ha sido marcado como leído')
  }

  const handleMarkAsUnread = (comunicadoId) => {
    marcarComoNoLeido(comunicadoId)
    showSuccess('Marcado como no leído', 'El comunicado ha sido marcado como no leído')
  }

  const handleViewDetails = (comunicado) => {
    setSelectedCommunique(comunicado)
    setShowDetail(true)
    
    // Marcar como leído si no lo estaba
    if (!comunicado.leido) {
      marcarComoLeido(comunicado.id)
    }
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedCommunique(null)
  }

  const handleRefresh = () => {
    cargarComunicados()
    showSuccess('Comunicados actualizados', 'Se han cargado los comunicados más recientes')
  }

  const handleShare = (comunicado) => {
    showSuccess('Compartir', 'Función de compartir próximamente disponible')
  }

  const handlePrint = (comunicado) => {
    showSuccess('Imprimir', 'Función de impresión próximamente disponible')
  }

  const handleExportAll = () => {
    showSuccess('Exportar', 'Función de exportación próximamente disponible')
  }

  // Opciones de filtro
  const categoriaOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'reuniones', label: 'Reuniones' },
    { value: 'horarios', label: 'Horarios' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'actividades', label: 'Actividades' },
    { value: 'resultados', label: 'Resultados' },
    { value: 'talleres', label: 'Talleres' },
    { value: 'academico', label: 'Académico' }
  ]

  const prioridadOptions = [
    { value: 'all', label: 'Todas las prioridades' },
    { value: 'alta', label: 'Alta prioridad' },
    { value: 'media', label: 'Media prioridad' },
    { value: 'baja', label: 'Baja prioridad' }
  ]

  const leidoOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'leido', label: 'Solo leídos' },
    { value: 'no-leido', label: 'Solo no leídos' }
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
              <h1 className="text-3xl font-bold text-gray-900">Comunicados</h1>
              <p className="text-gray-600 mt-1">
                Mantente informado sobre las novedades del colegio
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
        <CommuniqueStats estadisticas={estadisticas} loading={cargando} />

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar comunicados..."
            />
            
            <FilterDropdown
              label="Categoría"
              options={categoriaOptions}
              selectedValue={filtros.categoria}
              onSelect={(value) => actualizarFiltros({ categoria: value })}
            />
            
            <FilterDropdown
              label="Prioridad"
              options={prioridadOptions}
              selectedValue={filtros.prioridad}
              onSelect={(value) => actualizarFiltros({ prioridad: value })}
            />
            
            <FilterDropdown
              label="Estado"
              options={leidoOptions}
              selectedValue={filtros.leido}
              onSelect={(value) => actualizarFiltros({ leido: value })}
            />
          </div>
          
          {/* Contador de resultados */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {comunicadosFiltrados.length} de {comunicados.length} comunicados
              {searchTerm && (
                <span className="ml-2">
                  para "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Lista de comunicados */}
        {comunicadosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <FiMail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filtros.categoria !== 'all' || filtros.prioridad !== 'all' || filtros.leido !== 'all'
                ? 'No se encontraron comunicados'
                : 'No hay comunicados disponibles'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || filtros.categoria !== 'all' || filtros.prioridad !== 'all' || filtros.leido !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Los nuevos comunicados aparecerán aquí'
              }
            </p>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
              : 'space-y-4'
          }`}>
            {comunicadosFiltrados.map((comunicado, index) => (
              <motion.div
                key={comunicado.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CommuniqueCard
                  comunicado={comunicado}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAsUnread={handleMarkAsUnread}
                  onViewDetails={handleViewDetails}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de detalle */}
      <CommuniqueDetail
        comunicado={selectedCommunique}
        isOpen={showDetail}
        onClose={handleCloseDetail}
        onMarkAsRead={handleMarkAsRead}
        onShare={handleShare}
        onPrint={handlePrint}
      />
    </div>
  )
}

export default Communiques