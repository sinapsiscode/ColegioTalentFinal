import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiFileText, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw,
  FiArrowLeft,
  FiGrid,
  FiList,
  FiPlus,
  FiDownload,
  FiEdit3,
  FiSend
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import Header from '../../components/common/Header'
import useTutorCommunicationsStore from '../../stores/tutorCommunicationsStore'
import useAuthStore from '../../stores/authStore'

import TutorCommuniqueCard from '../../components/tutor/TutorCommuniqueCard'
import TutorCommuniqueStats from '../../components/tutor/TutorCommuniqueStats'
import CommuniqueDetail from '../../components/communications/CommuniqueDetail'
import SearchInput from '../../components/common/SearchInput'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import { showSuccess, showError, showConfirm, showInput } from '../../utils/sweetAlert'

const Communiques = () => {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { 
    comunicados, 
    cargando, 
    filtros,
    cargarComunicados, 
    crearComunicado,
    editarComunicado,
    eliminarComunicado,
    publicarComunicado,
    duplicarComunicado,
    obtenerComunicadosPorFiltros,
    buscarComunicados,
    actualizarFiltros,
    obtenerEstadisticas,
    obtenerAnalytics
  } = useTutorCommunicationsStore()

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
  const handleCreateNew = async () => {
    try {
      const result = await showInput(
        'Nuevo Comunicado',
        'Ingresa el título del comunicado:',
        {
          showCancelButton: true,
          confirmButtonText: 'Crear',
          cancelButtonText: 'Cancelar',
          inputPlaceholder: 'Ej: Cronograma de evaluaciones...'
        }
      )

      if (result.isConfirmed && result.value.trim()) {
        const nuevoComunicado = {
          titulo: result.value.trim(),
          contenido: 'Escriba aquí el contenido del comunicado...',
          categoria: 'informacion',
          prioridad: 'media',
          estado: 'borrador',
          audiencia: '5to-a',
          dirigidoA: ['Padres de 5to A'],
          etiquetas: [],
          adjuntos: []
        }
        
        const nuevoId = crearComunicado(nuevoComunicado)
        showSuccess('Comunicado creado', 'El borrador ha sido creado exitosamente')
        
        // Abrir para editar
        const comunicadoCreado = comunicados.find(c => c.id === nuevoId)
        if (comunicadoCreado) {
          handleEdit(comunicadoCreado)
        }
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  const handleEdit = (comunicado) => {
    showSuccess('Editar Comunicado', 'Función de edición próximamente disponible')
    // Aquí se abriría el editor de comunicados
  }

  const handleDelete = async (comunicadoId) => {
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

  const handleDuplicate = (comunicadoId) => {
    const nuevoId = duplicarComunicado(comunicadoId)
    if (nuevoId) {
      showSuccess('Comunicado duplicado', 'Se ha creado una copia del comunicado')
    }
  }

  const handlePublish = async (comunicadoId) => {
    try {
      const result = await showConfirm(
        '¿Publicar comunicado?',
        'El comunicado será visible para los destinatarios',
        'Sí, publicar',
        'Cancelar'
      )

      if (result.isConfirmed) {
        publicarComunicado(comunicadoId)
        showSuccess('Comunicado publicado', 'El comunicado ha sido publicado exitosamente')
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  const handleViewDetails = (comunicado) => {
    setSelectedCommunique(comunicado)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedCommunique(null)
  }

  const handleRefresh = () => {
    cargarComunicados()
    showSuccess('Comunicados actualizados', 'Los datos han sido actualizados')
  }

  const handleExportAll = () => {
    showSuccess('Exportar', 'Función de exportación próximamente disponible')
  }

  // Opciones de filtro
  const categoriaOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'academico', label: 'Académico' },
    { value: 'reunion', label: 'Reuniones' },
    { value: 'proyecto', label: 'Proyectos' },
    { value: 'apoyo', label: 'Apoyo' },
    { value: 'reconocimiento', label: 'Reconocimientos' },
    { value: 'material', label: 'Material' },
    { value: 'informacion', label: 'Información' },
    { value: 'evento', label: 'Eventos' }
  ]

  const prioridadOptions = [
    { value: 'all', label: 'Todas las prioridades' },
    { value: 'alta', label: 'Alta prioridad' },
    { value: 'media', label: 'Media prioridad' },
    { value: 'baja', label: 'Baja prioridad' }
  ]

  const estadoOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'publicado', label: 'Solo publicados' },
    { value: 'borrador', label: 'Solo borradores' },
    { value: 'programado', label: 'Solo programados' }
  ]

  const audienciaOptions = [
    { value: 'all', label: 'Todas las audiencias' },
    { value: '5to-a', label: '5to Grado A' },
    { value: 'especifico', label: 'Específico' }
  ]

  const estadisticas = obtenerEstadisticas()
  const analytics = obtenerAnalytics()

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
              onClick={() => navigate('/tutor/dashboard')}
              className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200 lg:hidden"
            >
              <FiArrowLeft className="w-5 h-5" />
            </motion.button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comunicados del Tutor</h1>
              <p className="text-gray-600 mt-1">
                Gestiona y publica comunicados para tus estudiantes y padres de familia
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
              variant="outline"
              icon={FiDownload}
              onClick={handleExportAll}
              size="sm"
            >
              Exportar
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              icon={FiPlus}
              onClick={handleCreateNew}
              size="sm"
            >
              Nuevo Comunicado
            </AnimatedButton>
          </div>
        </div>

        {/* Estadísticas */}
        <TutorCommuniqueStats 
          estadisticas={estadisticas} 
          analytics={analytics}
          loading={cargando} 
        />

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              label="Estado"
              options={estadoOptions}
              selectedValue={filtros.estado}
              onSelect={(value) => actualizarFiltros({ estado: value })}
            />
            
            <FilterDropdown
              label="Prioridad"
              options={prioridadOptions}
              selectedValue={filtros.prioridad}
              onSelect={(value) => actualizarFiltros({ prioridad: value })}
            />
            
            <FilterDropdown
              label="Audiencia"
              options={audienciaOptions}
              selectedValue={filtros.audiencia}
              onSelect={(value) => actualizarFiltros({ audiencia: value })}
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
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || Object.values(filtros).some(f => f !== 'all')
                ? 'No se encontraron comunicados'
                : 'No hay comunicados creados'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(filtros).some(f => f !== 'all')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea tu primer comunicado para comenzar'
              }
            </p>
            {!searchTerm && !Object.values(filtros).some(f => f !== 'all') && (
              <AnimatedButton
                variant="primary"
                icon={FiPlus}
                onClick={handleCreateNew}
              >
                Crear Primer Comunicado
              </AnimatedButton>
            )}
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {comunicadosFiltrados.map((comunicado, index) => (
              <motion.div
                key={comunicado.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TutorCommuniqueCard
                  comunicado={comunicado}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onPublish={handlePublish}
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
        onMarkAsRead={() => {}}
        onShare={() => showSuccess('Compartir', 'Función próximamente disponible')}
        onPrint={() => showSuccess('Imprimir', 'Función próximamente disponible')}
      />
    </div>
  )
}

export default Communiques