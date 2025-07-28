import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiUser,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFileText,
  FiTrendingUp,
  FiGrid,
  FiList,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import SearchInput from '../../components/common/SearchInput'
import DateRangeFilter from '../../components/common/DateRangeFilter'
import FilterDropdown from '../../components/common/FilterDropdown'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'

import useAttendanceStore from '../../stores/attendanceStore'
import useStudentsStore from '../../stores/studentsStore'
import useScannerStore from '../../stores/scannerStore'
import { showSuccess, showError, showInfo } from '../../utils/sweetAlert'
import { generateAdvancedExcelReport } from '../../utils/advancedExcelExporter'
import { generateAdvancedReport } from '../../utils/advancedPdfGenerator'

const HistorialAsistencia = () => {
  const navigate = useNavigate()
  
  const { 
    registrosAsistencia,
    cargarRegistrosAsistencia,
    cargando
  } = useAttendanceStore()
  
  const { alumnos } = useStudentsStore()
  
  const {
    registrosAsistencia: registrosScanner
  } = useScannerStore()

  // Estados
  const [viewMode, setViewMode] = useState('table') // table, cards
  const [showFilters, setShowFilters] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedSection, setSelectedSection] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all') // all, manual, qr
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [sortField, setSortField] = useState('fecha')
  const [sortOrder, setSortOrder] = useState('desc')
  const [expandedRows, setExpandedRows] = useState(new Set())

  useEffect(() => {
    cargarRegistrosAsistencia()
  }, [cargarRegistrosAsistencia])

  // Combinar registros de asistencia y scanner
  const todosLosRegistros = useMemo(() => {
    const registrosCombinados = [
      ...registrosAsistencia.map(r => ({ ...r, fuente: 'manual' })),
      ...registrosScanner.map(r => ({ 
        ...r, 
        alumnoId: r.estudiante?.id || r.alumnoId,
        fuente: 'qr' 
      }))
    ]
    
    // Eliminar duplicados basándose en alumnoId y fecha
    const registrosUnicos = registrosCombinados.reduce((acc, curr) => {
      const key = `${curr.alumnoId}-${new Date(curr.fecha).toDateString()}`
      if (!acc.has(key) || curr.fuente === 'qr') { // Preferir registros QR sobre manuales
        acc.set(key, curr)
      }
      return acc
    }, new Map())
    
    return Array.from(registrosUnicos.values())
  }, [registrosAsistencia, registrosScanner])

  // Filtrar registros
  const registrosFiltrados = useMemo(() => {
    let filtrados = todosLosRegistros

    // Filtro por rango de fechas
    if (dateRange.startDate && dateRange.endDate) {
      const inicio = new Date(dateRange.startDate)
      const fin = new Date(dateRange.endDate)
      fin.setHours(23, 59, 59, 999)
      
      filtrados = filtrados.filter(r => {
        const fecha = new Date(r.fecha)
        return fecha >= inicio && fecha <= fin
      })
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtrados = filtrados.filter(r => {
        const alumno = alumnos.find(a => a.id === r.alumnoId)
        return (
          alumno?.nombreCompleto.toLowerCase().includes(term) ||
          alumno?.codigo?.toLowerCase().includes(term) ||
          r.observaciones?.toLowerCase().includes(term)
        )
      })
    }

    // Filtro por grado
    if (selectedGrade !== 'all') {
      filtrados = filtrados.filter(r => {
        const alumno = alumnos.find(a => a.id === r.alumnoId)
        return alumno?.grado === selectedGrade
      })
    }

    // Filtro por sección
    if (selectedSection !== 'all') {
      filtrados = filtrados.filter(r => {
        const alumno = alumnos.find(a => a.id === r.alumnoId)
        return alumno?.seccion === selectedSection
      })
    }

    // Filtro por estado
    if (selectedStatus !== 'all') {
      filtrados = filtrados.filter(r => r.estado === selectedStatus)
    }

    // Filtro por fuente
    if (selectedSource !== 'all') {
      filtrados = filtrados.filter(r => r.fuente === selectedSource)
    }

    // Ordenar
    filtrados.sort((a, b) => {
      let aVal, bVal
      
      switch (sortField) {
        case 'fecha':
          aVal = new Date(a.fecha)
          bVal = new Date(b.fecha)
          break
        case 'nombre':
          const alumnoA = alumnos.find(al => al.id === a.alumnoId)
          const alumnoB = alumnos.find(al => al.id === b.alumnoId)
          aVal = alumnoA?.nombreCompleto || ''
          bVal = alumnoB?.nombreCompleto || ''
          break
        case 'estado':
          aVal = a.estado
          bVal = b.estado
          break
        default:
          aVal = a[sortField]
          bVal = b[sortField]
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtrados
  }, [todosLosRegistros, dateRange, searchTerm, selectedGrade, selectedSection, selectedStatus, selectedSource, sortField, sortOrder, alumnos])

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = registrosFiltrados.length
    const presentes = registrosFiltrados.filter(r => r.estado === 'presente').length
    const tardes = registrosFiltrados.filter(r => r.estado === 'tarde').length
    const faltas = registrosFiltrados.filter(r => r.estado === 'falta').length
    const porQR = registrosFiltrados.filter(r => r.fuente === 'qr').length
    const porManual = registrosFiltrados.filter(r => r.fuente === 'manual').length
    
    return {
      total,
      presentes,
      tardes,
      faltas,
      porcentajeAsistencia: total > 0 ? Math.round(((presentes + tardes) / total) * 100) : 0,
      porQR,
      porManual
    }
  }, [registrosFiltrados])

  // Paginación
  const totalPages = Math.ceil(registrosFiltrados.length / itemsPerPage)
  const registrosPaginados = registrosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleExport = async (format) => {
    try {
      const data = {
        title: 'Historial de Asistencia',
        period: `${dateRange.startDate} - ${dateRange.endDate}`,
        stats: {
          totalRecords: estadisticas.total,
          present: estadisticas.presentes,
          late: estadisticas.tardes,
          absent: estadisticas.faltas,
          attendanceRate: estadisticas.porcentajeAsistencia,
          byQR: estadisticas.porQR,
          byManual: estadisticas.porManual
        },
        records: registrosFiltrados.map(r => {
          const alumno = alumnos.find(a => a.id === r.alumnoId)
          return {
            fecha: new Date(r.fecha).toLocaleDateString('es-PE'),
            hora: r.horaEntrada ? new Date(r.horaEntrada).toLocaleTimeString('es-PE') : '-',
            estudiante: alumno?.nombreCompleto || 'Desconocido',
            grado: alumno?.grado || '-',
            seccion: alumno?.seccion || '-',
            estado: r.estado,
            fuente: r.fuente === 'qr' ? 'Scanner QR' : 'Manual',
            observaciones: r.observaciones || '-'
          }
        })
      }

      if (format === 'pdf') {
        await generateAdvancedReport('HISTORIAL_ASISTENCIA', data)
      } else {
        await generateAdvancedExcelReport('HISTORIAL_ASISTENCIA', data)
      }
      
      showSuccess('Exportación exitosa', `El historial se ha descargado en formato ${format.toUpperCase()}`)
    } catch (error) {
      showError('Error', 'No se pudo exportar el historial')
    }
  }

  const handleToggleRow = (registroId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(registroId)) {
      newExpanded.delete(registroId)
    } else {
      newExpanded.add(registroId)
    }
    setExpandedRows(newExpanded)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedGrade('all')
    setSelectedSection('all')
    setSelectedStatus('all')
    setSelectedSource('all')
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    })
    setCurrentPage(1)
  }

  // Renderizar fila de tabla
  const renderTableRow = (registro) => {
    const alumno = alumnos.find(a => a.id === registro.alumnoId)
    const isExpanded = expandedRows.has(registro.id)
    
    return (
      <React.Fragment key={registro.id}>
        <tr className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap">
            <button
              onClick={() => handleToggleRow(registro.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {new Date(registro.fecha).toLocaleDateString('es-PE')}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {registro.horaEntrada ? new Date(registro.horaEntrada).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <img
                src={alumno?.foto_url || `/avatar-student${((alumno?.id || 1) % 6) + 1}.jpg`}
                alt=""
                className="w-8 h-8 rounded-full mr-3"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {alumno?.nombreCompleto || 'Estudiante no encontrado'}
                </div>
                <div className="text-xs text-gray-500">
                  {alumno?.codigo || `ID: ${registro.alumnoId}`}
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {alumno?.grado || '-'} {alumno?.seccion || ''}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              registro.estado === 'presente'
                ? 'bg-green-100 text-green-800'
                : registro.estado === 'tarde'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {registro.estado.charAt(0).toUpperCase() + registro.estado.slice(1)}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
              registro.fuente === 'qr'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {registro.fuente === 'qr' ? (
                <>
                  <FiCalendar className="w-3 h-3 mr-1" />
                  Scanner QR
                </>
              ) : (
                <>
                  <FiFileText className="w-3 h-3 mr-1" />
                  Manual
                </>
              )}
            </span>
          </td>
        </tr>
        
        {/* Fila expandida con detalles */}
        <AnimatePresence>
          {isExpanded && (
            <tr>
              <td colSpan="7" className="px-6 py-4 bg-gray-50">
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Hora de entrada</p>
                      <p className="text-sm text-gray-900">
                        {registro.horaEntrada 
                          ? new Date(registro.horaEntrada).toLocaleString('es-PE')
                          : 'No registrada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Hora de salida</p>
                      <p className="text-sm text-gray-900">
                        {registro.horaSalida 
                          ? new Date(registro.horaSalida).toLocaleString('es-PE')
                          : 'No registrada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Registrado por</p>
                      <p className="text-sm text-gray-900">
                        {registro.usuario || registro.registradoPor || 'Sistema'}
                      </p>
                    </div>
                  </div>
                  
                  {registro.observaciones && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Observaciones</p>
                      <p className="text-sm text-gray-900">{registro.observaciones}</p>
                    </div>
                  )}
                  
                  {registro.ubicacion && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Ubicación</p>
                      <p className="text-sm text-gray-900">{registro.ubicacion}</p>
                    </div>
                  )}
                </motion.div>
              </td>
            </tr>
          )}
        </AnimatePresence>
      </React.Fragment>
    )
  }

  if (cargando) {
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/asistencia')}
              className="p-2 text-gray-600 hover:text-talentos-primary transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Historial de Asistencia</h1>
              <p className="text-gray-600 mt-1">
                Registro completo de asistencia con filtros avanzados
              </p>
            </div>
          </div>

          {/* Controles principales */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-talentos-primary text-white border-talentos-primary' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-talentos-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white text-talentos-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <AnimatedButton
                variant="outline"
                icon={FiRefreshCw}
                onClick={() => cargarRegistrosAsistencia()}
              >
                Actualizar
              </AnimatedButton>
              
              <div className="relative group">
                <AnimatedButton
                  variant="primary"
                  icon={FiDownload}
                >
                  Exportar
                </AnimatedButton>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    Descargar PDF
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    Descargar Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AnimatedCard className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar por nombre o código..."
                    className="sm:col-span-2 lg:col-span-1"
                  />
                  
                  <DateRangeFilter
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onDateChange={setDateRange}
                    className="sm:col-span-2 lg:col-span-2"
                  />
                  
                  <FilterDropdown
                    label="Grado"
                    options={[
                      { value: 'all', label: 'Todos los grados' },
                      { value: '1°', label: '1° Primaria' },
                      { value: '2°', label: '2° Primaria' },
                      { value: '3°', label: '3° Primaria' },
                      { value: '4°', label: '4° Primaria' },
                      { value: '5°', label: '5° Primaria' },
                      { value: '6°', label: '6° Primaria' }
                    ]}
                    selectedValue={selectedGrade}
                    onSelect={setSelectedGrade}
                  />
                  
                  <FilterDropdown
                    label="Sección"
                    options={[
                      { value: 'all', label: 'Todas las secciones' },
                      { value: 'A', label: 'Sección A' },
                      { value: 'B', label: 'Sección B' },
                      { value: 'C', label: 'Sección C' }
                    ]}
                    selectedValue={selectedSection}
                    onSelect={setSelectedSection}
                  />
                  
                  <FilterDropdown
                    label="Estado"
                    options={[
                      { value: 'all', label: 'Todos los estados' },
                      { value: 'presente', label: 'Presente' },
                      { value: 'tarde', label: 'Tarde' },
                      { value: 'falta', label: 'Falta' }
                    ]}
                    selectedValue={selectedStatus}
                    onSelect={setSelectedStatus}
                  />
                  
                  <FilterDropdown
                    label="Fuente"
                    options={[
                      { value: 'all', label: 'Todas las fuentes' },
                      { value: 'qr', label: 'Scanner QR' },
                      { value: 'manual', label: 'Manual' }
                    ]}
                    selectedValue={selectedSource}
                    onSelect={setSelectedSource}
                  />
                  
                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <AnimatedCard>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              <p className="text-xs text-gray-600 mt-1">Total registros</p>
            </div>
          </AnimatedCard>
          
          <AnimatedCard>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{estadisticas.presentes}</p>
              <p className="text-xs text-gray-600 mt-1">Presentes</p>
            </div>
          </AnimatedCard>
          
          <AnimatedCard>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{estadisticas.tardes}</p>
              <p className="text-xs text-gray-600 mt-1">Tardanzas</p>
            </div>
          </AnimatedCard>
          
          <AnimatedCard>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{estadisticas.faltas}</p>
              <p className="text-xs text-gray-600 mt-1">Faltas</p>
            </div>
          </AnimatedCard>
          
          <AnimatedCard>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{estadisticas.porcentajeAsistencia}%</p>
              <p className="text-xs text-gray-600 mt-1">Asistencia</p>
            </div>
          </AnimatedCard>
          
          <AnimatedCard>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{estadisticas.porQR}</p>
              <p className="text-xs text-gray-600 mt-1">Por QR</p>
            </div>
          </AnimatedCard>
        </div>

        {/* Contenido principal */}
        {registrosFiltrados.length === 0 ? (
          <AnimatedCard>
            <div className="text-center py-12">
              <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 text-talentos-primary hover:text-talentos-secondary font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          </AnimatedCard>
        ) : viewMode === 'table' ? (
          <AnimatedCard>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      
                    </th>
                    <th 
                      onClick={() => handleSort('fecha')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Fecha</span>
                        {sortField === 'fecha' && (
                          <FiChevronDown className={`w-3 h-3 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora
                    </th>
                    <th 
                      onClick={() => handleSort('nombre')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Estudiante</span>
                        {sortField === 'nombre' && (
                          <FiChevronDown className={`w-3 h-3 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grado
                    </th>
                    <th 
                      onClick={() => handleSort('estado')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Estado</span>
                        {sortField === 'estado' && (
                          <FiChevronDown className={`w-3 h-3 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fuente
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrosPaginados.map(registro => renderTableRow(registro))}
                </tbody>
              </table>
            </div>
          </AnimatedCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {registrosPaginados.map(registro => {
              const alumno = alumnos.find(a => a.id === registro.alumnoId)
              
              return (
                <AnimatedCard key={registro.id}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={alumno?.foto_url || `/avatar-student${((alumno?.id || 1) % 6) + 1}.jpg`}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {alumno?.nombreCompleto || 'Estudiante no encontrado'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {alumno?.grado || '-'} {alumno?.seccion || ''}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        registro.estado === 'presente'
                          ? 'bg-green-100 text-green-800'
                          : registro.estado === 'tarde'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {registro.estado}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Fecha:</span>
                        <span className="font-medium">
                          {new Date(registro.fecha).toLocaleDateString('es-PE')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Entrada:</span>
                        <span className="font-medium">
                          {registro.horaEntrada 
                            ? new Date(registro.horaEntrada).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Fuente:</span>
                        <span className={`inline-flex items-center text-xs font-medium ${
                          registro.fuente === 'qr' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {registro.fuente === 'qr' ? <FiCalendar className="w-3 h-3 mr-1" /> : <FiFileText className="w-3 h-3 mr-1" />}
                          {registro.fuente === 'qr' ? 'Scanner QR' : 'Manual'}
                        </span>
                      </div>
                    </div>
                    
                    {registro.observaciones && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Observaciones:</p>
                        <p className="text-sm text-gray-700 mt-1">{registro.observaciones}</p>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              )
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-600">Mostrar:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-600">registros</span>
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={registrosFiltrados.length}
            />
          </div>
        )}

        {/* Resumen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <AnimatedCard>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Resumen del período
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {dateRange.startDate} - {dateRange.endDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-talentos-primary">
                  {estadisticas.porcentajeAsistencia}%
                </p>
                <p className="text-sm text-gray-600">Asistencia general</p>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </main>
    </div>
  )
}

export default HistorialAsistencia