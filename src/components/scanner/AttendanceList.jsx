import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  FiUser,
  FiClock,
  FiMapPin,
  FiLogIn,
  FiLogOut,
  FiMoreVertical,
  FiEye,
  FiEdit3,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'

const AttendanceList = ({ 
  registros = [], 
  loading = false, 
  onVerDetalle,
  onEditarRegistro,
  onExportarDatos,
  onActualizar 
}) => {
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [registrosPorPagina] = useState(10)
  const [mostrarMenu, setMostrarMenu] = useState(null)

  // Filtrar registros
  const registrosFiltrados = registros.filter(registro => {
    const cumpleTipo = filtroTipo === 'todos' || registro.tipo === filtroTipo
    const cumpleBusqueda = searchTerm === '' || 
      registro.estudiante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.estudiante.grado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.estudiante.codigo.includes(searchTerm)
    
    return cumpleTipo && cumpleBusqueda
  })

  // Paginación
  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina)
  const indiceInicio = (paginaActual - 1) * registrosPorPagina
  const registrosPaginados = registrosFiltrados.slice(indiceInicio, indiceInicio + registrosPorPagina)

  const formatearFecha = (fecha) => {
    return format(new Date(fecha), 'HH:mm:ss', { locale: es })
  }

  const formatearFechaCompleta = (fecha) => {
    return format(new Date(fecha), 'dd/MM/yyyy HH:mm:ss', { locale: es })
  }

  const getTipoIcon = (tipo) => {
    return tipo === 'entrada' ? FiLogIn : FiLogOut
  }

  const getTipoColor = (tipo) => {
    return tipo === 'entrada' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-orange-100 text-orange-800'
  }

  const getMetodoLabel = (metodo) => {
    return metodo === 'qr' ? 'QR' : 'Manual'
  }

  const getMetodoColor = (metodo) => {
    return metodo === 'qr' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Registros de Asistencia</h3>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onActualizar}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Actualizar"
            >
              <FiRefreshCw className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExportarDatos}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Exportar"
            >
              <FiDownload className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Controles de filtro */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, grado o código..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="entrada">Solo Entradas</option>
              <option value="salida">Solo Salidas</option>
            </select>
          </div>
        </div>

        {/* Información de resultados */}
        <div className="mt-3 text-sm text-gray-600">
          Mostrando {registrosPaginados.length} de {registrosFiltrados.length} registros
          {searchTerm && (
            <span className="ml-2">
              para "<span className="font-medium">{searchTerm}</span>"
            </span>
          )}
        </div>
      </div>

      {/* Lista de registros */}
      <div className="divide-y divide-gray-200">
        <AnimatePresence>
          {registrosPaginados.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filtroTipo !== 'todos' ? 'No se encontraron registros' : 'No hay registros'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filtroTipo !== 'todos'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Los registros de asistencia aparecerán aquí'
                }
              </p>
            </motion.div>
          ) : (
            registrosPaginados.map((registro, index) => {
              const TipoIcon = getTipoIcon(registro.tipo)
              
              return (
                <motion.div
                  key={registro.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar/Foto */}
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                          <img
                            src={registro.estudiante.fotoUrl}
                            alt={registro.estudiante.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-lg font-medium hidden">
                            {registro.estudiante.nombre.charAt(0)}
                          </div>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getTipoColor(registro.tipo)} rounded-full flex items-center justify-center`}>
                          <TipoIcon className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Información del estudiante */}
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {registro.estudiante.nombre}
                        </h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                          <span>{registro.estudiante.grado}</span>
                          <span>•</span>
                          <span>Código: {registro.estudiante.codigo}</span>
                        </div>
                      </div>

                      {/* Información del registro */}
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(registro.tipo)}`}>
                            <TipoIcon className="w-3 h-3 mr-1" />
                            {registro.tipo.charAt(0).toUpperCase() + registro.tipo.slice(1)}
                          </span>
                          
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMetodoColor(registro.metodo)}`}>
                            {getMetodoLabel(registro.metodo)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-600">
                          <FiClock className="w-3 h-3 mr-1" />
                          <span>{formatearFecha(registro.fecha)}</span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-600 mt-1">
                          <FiMapPin className="w-3 h-3 mr-1" />
                          <span>{registro.ubicacion}</span>
                        </div>
                      </div>
                    </div>

                    {/* Menú de acciones */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMostrarMenu(mostrarMenu === registro.id ? null : registro.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </motion.button>

                      <AnimatePresence>
                        {mostrarMenu === registro.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                          >
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onVerDetalle && onVerDetalle(registro)
                                  setMostrarMenu(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FiEye className="w-4 h-4 mr-2" />
                                Ver detalles
                              </button>
                              
                              <button
                                onClick={() => {
                                  onEditarRegistro && onEditarRegistro(registro)
                                  setMostrarMenu(null)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FiEdit3 className="w-4 h-4 mr-2" />
                                Editar registro
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Observaciones (si las hay) */}
                  {registro.observaciones && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Observaciones:</span> {registro.observaciones}
                      </p>
                    </div>
                  )}
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {paginaActual} de {totalPaginas}
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
              disabled={paginaActual === 1}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-4 h-4" />
            </motion.button>
            
            <span className="px-3 py-1 bg-gray-100 rounded text-sm">
              {paginaActual}
            </span>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
              disabled={paginaActual === totalPaginas}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Click outside para cerrar menú */}
      {mostrarMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setMostrarMenu(null)}
        />
      )}
    </div>
  )
}

export default AttendanceList