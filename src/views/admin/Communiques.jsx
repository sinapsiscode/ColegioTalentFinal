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
  FiChevronLeft,
  FiChevronRight,
  FiSend,
  FiArchive,
  FiEdit3,
  FiTrash2
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import useAdminCommunicationsStore from '../../stores/adminCommunicationsStore'
import useAuthStore from '../../stores/authStore'

import CommuniqueCard from '../../components/admin/CommuniqueCard'
import CommuniqueStats from '../../components/admin/CommuniqueStats'
import CommuniqueForm from '../../components/admin/CommuniqueForm'
import SearchInput from '../../components/common/SearchInput'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'

const Communiques = () => {
  const { usuario } = useAuthStore()
  const {
    cargando,
    comunicados,
    filtros,
    paginacion,
    configuraciones,
    cargarComunicados,
    crearComunicado,
    editarComunicado,
    eliminarComunicado,
    publicarComunicado,
    archivarComunicado,
    obtenerComunicadosPorFiltros,
    buscarComunicados,
    actualizarFiltros,
    cambiarPagina,
    obtenerEstadisticas,
    exportarComunicados
  } = useAdminCommunicationsStore()

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showForm, setShowForm] = useState(false)
  const [selectedComunicado, setSelectedComunicado] = useState(null)
  const [comunicadosFiltrados, setComunicadosFiltrados] = useState([])
  const [totalPaginas, setTotalPaginas] = useState(1)

  // Cargar comunicados al montar
  useEffect(() => {
    cargarComunicados()
  }, [cargarComunicados])

  // Filtrar comunicados
  useEffect(() => {
    let resultado
    
    if (searchTerm) {
      resultado = {
        comunicados: buscarComunicados(searchTerm),
        total: buscarComunicados(searchTerm).length,
        totalPaginas: 1
      }
    } else {
      resultado = obtenerComunicadosPorFiltros()
    }
    
    setComunicadosFiltrados(resultado.comunicados)
    setTotalPaginas(resultado.totalPaginas)
  }, [comunicados, searchTerm, filtros, paginacion.pagina, buscarComunicados, obtenerComunicadosPorFiltros])

  // Handlers
  const handleCreateCommunique = async (comunicadoData) => {
    try {
      const nuevoId = crearComunicado(comunicadoData)
      showSuccess(
        'Comunicado creado', 
        comunicadoData.estado === 'publicado' ? 'El comunicado ha sido publicado exitosamente' : 'El comunicado ha sido guardado como borrador'
      )
      return nuevoId
    } catch (error) {
      showError('Error', 'No se pudo crear el comunicado')
      throw error
    }
  }

  const handleEditCommunique = async (comunicadoData) => {
    try {
      editarComunicado(selectedComunicado.id, comunicadoData)
      showSuccess(
        'Comunicado actualizado', 
        'Los cambios han sido guardados exitosamente'
      )
    } catch (error) {
      showError('Error', 'No se pudo actualizar el comunicado')
      throw error
    }
  }

  const handleDeleteCommunique = async (comunicadoId) => {
    try {
      const result = await showConfirm(
        '¿Eliminar comunicado?',
        'Esta acción no se puede deshacer',
        'Sí, eliminar',
        'Cancelar'
      )

      if (result.isConfirmed) {
        eliminarComunicado(comunicadoId)
        showSuccess('Comunicado eliminado', 'El comunicado ha sido eliminado exitosamente')
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  const handlePublishCommunique = async (comunicado) => {
    try {
      const result = await showConfirm(
        '¿Publicar comunicado?',
        `El comunicado "${comunicado.titulo}" será visible para toda la comunidad`,
        'Sí, publicar',
        'Cancelar'
      )

      if (result.isConfirmed) {
        publicarComunicado(comunicado.id)
        showSuccess('Comunicado publicado', 'El comunicado ha sido publicado exitosamente')
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  const handleArchiveCommunique = async (comunicado) => {
    try {
      const result = await showConfirm(
        '¿Archivar comunicado?',
        `El comunicado "${comunicado.titulo}" se moverá al archivo`,
        'Sí, archivar',
        'Cancelar'
      )

      if (result.isConfirmed) {
        archivarComunicado(comunicado.id)
        showSuccess('Comunicado archivado', 'El comunicado ha sido archivado exitosamente')
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  const handleViewDetails = (comunicado) => {
    showSuccess('Ver Detalles', `Mostrando información de "${comunicado.titulo}"`)
  }

  const handleRefresh = () => {
    cargarComunicados()
    showSuccess('Comunicados actualizados', 'Los datos han sido actualizados')
  }

  const handleExport = async () => {
    try {
      const resultado = await exportarComunicados('excel')
      
      if (resultado.success) {
        showSuccess('¡Exportación Exitosa!', resultado.mensaje)
      } else {
        showError('Error al Exportar', resultado.error || 'No se pudo completar la exportación')
      }
    } catch (error) {
      showError('Error', 'No se pudo exportar la lista de comunicados')
    }
  }

  const openForm = (comunicado = null) => {
    setSelectedComunicado(comunicado)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setSelectedComunicado(null)
  }

  const handleSaveCommunique = async (comunicadoData) => {
    if (selectedComunicado) {
      await handleEditCommunique(comunicadoData)
    } else {
      await handleCreateCommunique(comunicadoData)
    }
  }

  // Opciones de filtro
  const categoriaOptions = [
    { value: 'all', label: 'Todas las categorías' },
    ...(configuraciones.categorias ? Object.entries(configuraciones.categorias).map(([key, label]) => ({
      value: key,
      label
    })) : [])
  ]

  const prioridadOptions = [
    { value: 'all', label: 'Todas las prioridades' },
    ...(configuraciones.prioridades ? Object.entries(configuraciones.prioridades).map(([key, label]) => ({
      value: key,
      label
    })) : [])
  ]

  const estadoOptions = [
    { value: 'all', label: 'Todos los estados' },
    ...(configuraciones.estados ? Object.entries(configuraciones.estados).map(([key, label]) => ({
      value: key,
      label
    })) : [])
  ]

  const audienciaOptions = [
    { value: 'all', label: 'Todas las audiencias' },
    ...(configuraciones.audiencias ? Object.entries(configuraciones.audiencias).map(([key, config]) => ({
      value: key,
      label: config.label
    })) : [])
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
      
      <main className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Header de la página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Comunicados</h1>
            <p className="text-gray-600 mt-1">
              Administra comunicados institucionales y mensajes a la comunidad
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
              onClick={handleExport}
              size="sm"
            >
              Exportar
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              icon={FiPlus}
              onClick={() => openForm()}
              size="sm"
            >
              Nuevo Comunicado
            </AnimatedButton>
          </div>
        </div>

        {/* Estadísticas */}
        <CommuniqueStats estadisticas={estadisticas} loading={cargando} />

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              options={estadoOptions}
              selectedValue={filtros.estado}
              onSelect={(value) => actualizarFiltros({ estado: value })}
            />
            
            <FilterDropdown
              label="Audiencia"
              options={audienciaOptions}
              selectedValue={filtros.audiencia}
              onSelect={(value) => actualizarFiltros({ audiencia: value })}
            />
          </div>
          
          {/* Contador de resultados */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <p className="text-sm text-gray-600">
              Mostrando {comunicadosFiltrados.length} de {comunicados.length} comunicados
              {searchTerm && (
                <span className="ml-2">
                  para "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
            </p>
            
            {/* Paginación */}
            {totalPaginas > 1 && !searchTerm && (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => cambiarPagina(paginacion.pagina - 1)}
                  disabled={paginacion.pagina === 1}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </motion.button>
                
                <span className="text-sm text-gray-600">
                  Página {paginacion.pagina} de {totalPaginas}
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => cambiarPagina(paginacion.pagina + 1)}
                  disabled={paginacion.pagina === totalPaginas}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de comunicados */}
        {comunicadosFiltrados.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200">
            <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || Object.values(filtros).some(f => f !== 'all')
                ? 'No se encontraron comunicados'
                : 'No hay comunicados registrados'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(filtros).some(f => f !== 'all')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea el primer comunicado para comenzar'
              }
            </p>
            {!searchTerm && !Object.values(filtros).some(f => f !== 'all') && (
              <AnimatedButton
                variant="primary"
                icon={FiPlus}
                onClick={() => openForm()}
              >
                Crear Primer Comunicado
              </AnimatedButton>
            )}
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6' 
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
                  onEdit={(com) => openForm(com)}
                  onDelete={handleDeleteCommunique}
                  onPublish={handlePublishCommunique}
                  onArchive={handleArchiveCommunique}
                  onViewDetails={handleViewDetails}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de formulario */}
      <CommuniqueForm
        isOpen={showForm}
        onClose={closeForm}
        onSave={handleSaveCommunique}
        comunicado={selectedComunicado}
        configuraciones={configuraciones}
      />
    </div>
  )
}

export default Communiques