import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiCalendar, 
  FiUser, 
  FiDownload, 
  FiRefreshCw,
  FiTrendingUp,
  FiArrowLeft
} from 'react-icons/fi'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

import Header from '../../components/common/Header'
import useAuthStore from '../../stores/authStore'
import useAttendanceStore from '../../stores/attendanceStore'
import { alumnosMock } from '../../data/mockData'

import AttendanceStats from '../../components/attendance/AttendanceStats'
import AttendanceFilter from '../../components/attendance/AttendanceFilter'
import AttendanceCard from '../../components/attendance/AttendanceCard'
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import SearchInput from '../../components/common/SearchInput'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { showSuccess, showError } from '../../utils/sweetAlert'

const Attendance = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { 
    registrosAsistencia, 
    cargando, 
    cargarRegistrosAsistencia, 
    obtenerAsistenciaAlumno,
    obtenerEstadisticasAsistencia
  } = useAttendanceStore()

  // Estados locales
  const [selectedStudent, setSelectedStudent] = useState(studentId ? parseInt(studentId) : null)
  const [dateRange, setDateRange] = useState('month')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [viewMode, setViewMode] = useState('list') // list, calendar

  // Obtener hijos del padre
  const hijosDelPadre = alumnosMock.filter(alumno => alumno.padre === usuario?.nombre)

  // Efecto para cargar datos
  useEffect(() => {
    cargarRegistrosAsistencia()
  }, [cargarRegistrosAsistencia])

  // Efecto para seleccionar primer hijo si no hay ninguno seleccionado
  useEffect(() => {
    if (!selectedStudent && hijosDelPadre.length > 0) {
      setSelectedStudent(hijosDelPadre[0].id)
    }
  }, [selectedStudent, hijosDelPadre])

  // Obtener alumno seleccionado
  const alumnoSeleccionado = hijosDelPadre.find(hijo => hijo.id === selectedStudent)

  // Calcular rango de fechas
  const calculateDateRange = (range) => {
    const today = new Date()
    switch (range) {
      case 'today':
        return { start: today, end: today }
      case 'week':
        return { start: startOfWeek(today), end: endOfWeek(today) }
      case 'month':
        return { start: startOfMonth(today), end: endOfMonth(today) }
      case 'last7':
        return { start: subDays(today, 7), end: today }
      case 'last30':
        return { start: subDays(today, 30), end: today }
      default:
        return { start: subDays(today, 365), end: today }
    }
  }

  // Registros filtrados
  const registrosFiltrados = useMemo(() => {
    if (!selectedStudent) return []
    
    const { start, end } = calculateDateRange(dateRange)
    let registros = obtenerAsistenciaAlumno(selectedStudent, start, end)
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      registros = registros.filter(registro => registro.estado === statusFilter)
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      registros = registros.filter(registro => 
        format(new Date(registro.fecha), 'dd/MM/yyyy').includes(term) ||
        registro.estado.toLowerCase().includes(term) ||
        (registro.observaciones && registro.observaciones.toLowerCase().includes(term))
      )
    }
    
    return registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [selectedStudent, dateRange, statusFilter, searchTerm, registrosAsistencia, obtenerAsistenciaAlumno])

  // Estadísticas
  const estadisticas = selectedStudent ? obtenerEstadisticasAsistencia(selectedStudent) : {
    total: 0, presentes: 0, tardes: 0, faltas: 0, porcentajeAsistencia: 0
  }

  // Paginación
  const totalPages = Math.ceil(registrosFiltrados.length / itemsPerPage)
  const registrosPaginados = registrosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handlers
  const handleStudentChange = (studentId) => {
    setSelectedStudent(parseInt(studentId))
    setCurrentPage(1)
    navigate(`/parent/attendance/${studentId}`)
  }

  const handleRefresh = () => {
    cargarRegistrosAsistencia()
    showSuccess('Datos actualizados', 'La información de asistencia ha sido actualizada')
  }

  const handleExport = () => {
    if (!alumnoSeleccionado) return
    
    // Simular exportación
    const data = {
      alumno: alumnoSeleccionado.nombreCompleto,
      periodo: dateRange,
      registros: registrosFiltrados,
      estadisticas
    }
    
    console.log('Exportando datos de asistencia:', data)
    showSuccess('Exportación exitosa', 'Los datos han sido exportados correctamente')
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }

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

  if (hijosDelPadre.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatedCard>
            <div className="text-center py-12">
              <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudiantes</h3>
              <p className="text-gray-600">No se encontraron estudiantes asociados a su cuenta.</p>
            </div>
          </AnimatedCard>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/parent/dashboard')}
              className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
            >
              <FiArrowLeft className="w-5 h-5" />
            </motion.button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asistencia</h1>
              {alumnoSeleccionado && (
                <p className="text-gray-600 mt-1">
                  {alumnoSeleccionado.nombreCompleto} - {alumnoSeleccionado.grado}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white text-talentos-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => handleViewModeChange('calendar')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'calendar' 
                    ? 'bg-white text-talentos-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Calendario
              </button>
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
              onClick={handleExport}
              size="sm"
            >
              Exportar
            </AnimatedButton>
          </div>
        </div>

        {/* Estadísticas */}
        <AttendanceStats estadisticas={estadisticas} />

        {/* Filtros */}
        <AttendanceFilter
          selectedStudent={selectedStudent}
          onStudentChange={handleStudentChange}
          students={hijosDelPadre}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Contenido principal */}
        {viewMode === 'calendar' ? (
          <AttendanceCalendar 
            registros={registrosFiltrados}
            mesActual={new Date()}
          />
        ) : (
          <>
            {/* Barra de búsqueda */}
            <div className="mb-6">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                placeholder="Buscar por fecha, estado u observaciones..."
                className="max-w-md"
              />
            </div>

            {/* Lista de registros */}
            {registrosPaginados.length === 0 ? (
              <AnimatedCard>
                <div className="text-center py-12">
                  <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay registros de asistencia
                  </h3>
                  <p className="text-gray-600">
                    No se encontraron registros para los filtros seleccionados.
                  </p>
                </div>
              </AnimatedCard>
            ) : (
              <div className="space-y-4">
                {registrosPaginados.map((registro, index) => (
                  <AttendanceCard
                    key={registro.id}
                    registro={registro}
                    alumno={alumnoSeleccionado}
                    onClick={() => {
                      console.log('Detalle del registro:', registro)
                    }}
                  />
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={registrosFiltrados.length}
                />
              </div>
            )}
          </>
        )}

        {/* Resumen inferior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <AnimatedCard>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Resumen de Asistencia
                </h3>
                <p className="text-gray-600">
                  Porcentaje de asistencia: <span className="font-semibold text-talentos-primary">
                    {estadisticas.porcentajeAsistencia}%
                  </span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <FiTrendingUp className={`w-6 h-6 ${
                  estadisticas.porcentajeAsistencia >= 90 ? 'text-green-600' :
                  estadisticas.porcentajeAsistencia >= 80 ? 'text-yellow-600' : 'text-red-600'
                }`} />
                <span className={`text-2xl font-bold ${
                  estadisticas.porcentajeAsistencia >= 90 ? 'text-green-600' :
                  estadisticas.porcentajeAsistencia >= 80 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {estadisticas.porcentajeAsistencia}%
                </span>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      </main>
    </div>
  )
}

export default Attendance