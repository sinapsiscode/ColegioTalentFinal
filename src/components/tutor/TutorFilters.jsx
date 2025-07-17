import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiFilter, 
  FiX, 
  FiCalendar, 
  FiUsers, 
  FiClock,
  FiSearch,
  FiRefreshCw
} from 'react-icons/fi'
import FilterDropdown from '../common/FilterDropdown'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const TutorFilters = ({
  tutores = [],
  filtros = {},
  onFiltrosChange,
  onLimpiarFiltros,
  onBuscar,
  className = ""
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [busqueda, setBusqueda] = useState(filtros.busqueda || '')

  const handleFiltroChange = (campo, valor) => {
    const nuevosFiltros = { ...filtros, [campo]: valor }
    onFiltrosChange(nuevosFiltros)
  }

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value)
    handleFiltroChange('busqueda', e.target.value)
  }

  const handleLimpiarTodo = () => {
    setBusqueda('')
    onLimpiarFiltros()
    setMostrarFiltros(false)
  }

  const contarFiltrosActivos = () => {
    let count = 0
    if (filtros.tutorId && filtros.tutorId !== 'todos') count++
    if (filtros.especialidad && filtros.especialidad !== 'todas') count++
    if (filtros.grado && filtros.grado !== 'todos') count++
    if (filtros.estado && filtros.estado !== 'todos') count++
    if (filtros.fechaDesde) count++
    if (filtros.fechaHasta) count++
    if (filtros.busqueda && filtros.busqueda.trim()) count++
    return count
  }

  const opcionesTutores = [
    { value: 'todos', label: 'Todos los tutores' },
    ...tutores.map(tutor => ({
      value: tutor.id,
      label: `${tutor.nombre} - ${tutor.especialidad}`
    }))
  ]

  const opcionesEspecialidades = [
    { value: 'todas', label: 'Todas las especialidades' },
    ...Array.from(new Set(tutores.map(t => t.especialidad))).map(esp => ({
      value: esp,
      label: esp
    }))
  ]

  const opcionesGrados = [
    { value: 'todos', label: 'Todos los grados' },
    ...Array.from(new Set(tutores.map(t => t.grado))).map(grado => ({
      value: grado,
      label: grado
    }))
  ]

  const opcionesEstado = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'presente', label: 'Presente' },
    { value: 'tarde', label: 'Tardanza' },
    { value: 'falta', label: 'Falta' },
    { value: 'sin_registro', label: 'Sin registro' }
  ]

  const filtrosActivos = contarFiltrosActivos()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de búsqueda y controles principales */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, especialidad o grado..."
              value={busqueda}
              onChange={handleBusquedaChange}
              className="input-field pl-10 w-full"
            />
            {busqueda && (
              <button
                onClick={() => {
                  setBusqueda('')
                  handleFiltroChange('busqueda', '')
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Controles de filtros */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${
              mostrarFiltros || filtrosActivos > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            <span>Filtros</span>
            {filtrosActivos > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filtrosActivos}
              </span>
            )}
          </button>

          {filtrosActivos > 0 && (
            <button
              onClick={handleLimpiarTodo}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Limpiar todos los filtros"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          )}

          {onBuscar && (
            <button
              onClick={() => onBuscar(filtros)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FiSearch className="w-4 h-4" />
              <span>Buscar</span>
            </button>
          )}
        </div>
      </div>

      {/* Panel de filtros expandido */}
      <AnimatePresence>
        {mostrarFiltros && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 rounded-lg p-6 border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro por tutor específico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUsers className="inline w-4 h-4 mr-1" />
                  Tutor específico
                </label>
                <FilterDropdown
                  selectedValue={filtros.tutorId || 'todos'}
                  onSelect={(valor) => handleFiltroChange('tutorId', valor)}
                  label="Seleccionar tutor"
                  options={opcionesTutores}
                />
              </div>

              {/* Filtro por especialidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidad
                </label>
                <FilterDropdown
                  selectedValue={filtros.especialidad || 'todas'}
                  onSelect={(valor) => handleFiltroChange('especialidad', valor)}
                  label="Seleccionar especialidad"
                  options={opcionesEspecialidades}
                />
              </div>

              {/* Filtro por grado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grado asignado
                </label>
                <FilterDropdown
                  selectedValue={filtros.grado || 'todos'}
                  onSelect={(valor) => handleFiltroChange('grado', valor)}
                  label="Seleccionar grado"
                  options={opcionesGrados}
                />
              </div>

              {/* Filtro por estado de asistencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiClock className="inline w-4 h-4 mr-1" />
                  Estado de asistencia
                </label>
                <FilterDropdown
                  selectedValue={filtros.estado || 'todos'}
                  onSelect={(valor) => handleFiltroChange('estado', valor)}
                  label="Seleccionar estado"
                  options={opcionesEstado}
                />
              </div>

              {/* Fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline w-4 h-4 mr-1" />
                  Desde
                </label>
                <input
                  type="date"
                  value={filtros.fechaDesde || ''}
                  onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              {/* Fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline w-4 h-4 mr-1" />
                  Hasta
                </label>
                <input
                  type="date"
                  value={filtros.fechaHasta || ''}
                  onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Filtros rápidos:</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFiltroChange('fechaDesde', format(new Date(), 'yyyy-MM-dd'))}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors duration-200"
                >
                  Hoy
                </button>
                <button
                  onClick={() => {
                    const hace7dias = new Date()
                    hace7dias.setDate(hace7dias.getDate() - 7)
                    handleFiltroChange('fechaDesde', format(hace7dias, 'yyyy-MM-dd'))
                    handleFiltroChange('fechaHasta', format(new Date(), 'yyyy-MM-dd'))
                  }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors duration-200"
                >
                  Última semana
                </button>
                <button
                  onClick={() => {
                    const hace30dias = new Date()
                    hace30dias.setDate(hace30dias.getDate() - 30)
                    handleFiltroChange('fechaDesde', format(hace30dias, 'yyyy-MM-dd'))
                    handleFiltroChange('fechaHasta', format(new Date(), 'yyyy-MM-dd'))
                  }}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors duration-200"
                >
                  Último mes
                </button>
                <button
                  onClick={() => handleFiltroChange('estado', 'tarde')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm hover:bg-yellow-200 transition-colors duration-200"
                >
                  Solo tardanzas
                </button>
                <button
                  onClick={() => handleFiltroChange('estado', 'falta')}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors duration-200"
                >
                  Solo faltas
                </button>
              </div>
            </div>

            {/* Resumen de filtros aplicados */}
            {filtrosActivos > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Filtros aplicados:</h4>
                <div className="flex flex-wrap gap-2">
                  {filtros.tutorId && filtros.tutorId !== 'todos' && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Tutor: {opcionesTutores.find(t => t.value === parseInt(filtros.tutorId))?.label}
                      <button
                        onClick={() => handleFiltroChange('tutorId', 'todos')}
                        className="ml-1 hover:text-blue-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filtros.especialidad && filtros.especialidad !== 'todas' && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      Especialidad: {filtros.especialidad}
                      <button
                        onClick={() => handleFiltroChange('especialidad', 'todas')}
                        className="ml-1 hover:text-green-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filtros.grado && filtros.grado !== 'todos' && (
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      Grado: {filtros.grado}
                      <button
                        onClick={() => handleFiltroChange('grado', 'todos')}
                        className="ml-1 hover:text-purple-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filtros.estado && filtros.estado !== 'todos' && (
                    <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      Estado: {opcionesEstado.find(e => e.value === filtros.estado)?.label}
                      <button
                        onClick={() => handleFiltroChange('estado', 'todos')}
                        className="ml-1 hover:text-yellow-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filtros.fechaDesde && (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      Desde: {format(new Date(filtros.fechaDesde), 'dd/MM/yyyy', { locale: es })}
                      <button
                        onClick={() => handleFiltroChange('fechaDesde', '')}
                        className="ml-1 hover:text-gray-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filtros.fechaHasta && (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      Hasta: {format(new Date(filtros.fechaHasta), 'dd/MM/yyyy', { locale: es })}
                      <button
                        onClick={() => handleFiltroChange('fechaHasta', '')}
                        className="ml-1 hover:text-gray-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TutorFilters