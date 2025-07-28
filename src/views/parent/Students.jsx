import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiUsers, 
  FiSearch,
  FiFilter,
  FiDownload,
  FiGrid,
  FiList,
  FiUser,
  FiCalendar,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
  FiBook,
  FiAward,
  FiActivity,
  FiPrinter,
  FiFileText,
  FiRefreshCw
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Header from '../../components/common/Header'
import PageTransition from '../../components/common/PageTransition'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import SearchInput from '../../components/common/SearchInput'
import StaggeredList from '../../components/common/StaggeredList'
import CountUpNumber from '../../components/common/CountUpNumber'
import useAuthStore from '../../stores/authStore'
import useStudentsStore from '../../stores/studentsStore'
import useAttendanceStore from '../../stores/attendanceStore'
import useGradesStore from '../../stores/gradesStore'
import { DatabaseQueries } from '../../data/databaseSchema'
import { generateReportPDF } from '../../utils/pdfGenerator'
import { showSuccess, showError } from '../../utils/sweetAlert'
import { exportForParents, exportForAdmins } from '../../utils/exportUtilsSimple'
import { compareIds } from '../../utils/searchHelpers'

const Students = () => {
  console.log('🎓 Students component cargando...')
  
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('grid') // 'grid' o 'list'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('todos')
  const [showExportMenu, setShowExportMenu] = useState(false)
  
  const usuario = useAuthStore(state => state.usuario)
  const getStudentAttendance = useAttendanceStore(state => state.getStudentAttendance)
  const cargarRegistrosAsistencia = useAttendanceStore(state => state.cargarRegistrosAsistencia)
  const getGradesByStudent = useGradesStore(state => state.getGradesByStudent)
  const cargarCalificaciones = useGradesStore(state => state.cargarCalificaciones)
  const obtenerEstadisticasAsistencia = useAttendanceStore(state => state.obtenerEstadisticasAsistencia)

  // Estado local para los hijos del padre
  const [misHijos, setMisHijos] = useState([])
  const [loading, setLoading] = useState(true)

  // Función para cargar hijos (reutilizable)
  const cargarMisHijos = async (showLoadingIndicator = true) => {
    if (usuario && usuario.id) {
      if (showLoadingIndicator) setLoading(true)
      try {
        console.log(`🔍 DEBUGGING: Usuario actual ID: ${usuario.id}, Nombre: ${usuario.nombre}`)
        
        // Verificar si hay relaciones padre-hijo en la base de datos
        const todasLasRelaciones = DatabaseQueries.getAllParentStudentRelationships()
        console.log('🔗 Todas las relaciones padre-hijo en BD:', todasLasRelaciones)
        
        // Obtener solo los hijos de este padre
        const hijos = DatabaseQueries.getChildrenByParentId(usuario.id)
        setMisHijos(hijos)
        console.log(`👨‍👧‍👦 Cargados ${hijos.length} hijo(s) para ${usuario.nombre} (ID: ${usuario.id})`)
        
        // Debug: Mostrar datos de los hijos
        if (hijos.length > 0) {
          console.log('📊 Datos de hijos cargados:', hijos.map(h => ({
            id: h.id,
            nombre: h.nombre,
            apellidos: h.apellidos,
            grado: h.grado,
            seccion: h.seccion
          })))
        } else {
          console.log('⚠️ No se encontraron hijos asignados para este padre')
          console.log('🔍 Verificando si la función está devolviendo todos los estudiantes por error...')
          
          // Si no hay hijos asignados, NO mostrar nada
          setMisHijos([])
        }
      } catch (error) {
        console.error('Error cargando hijos:', error)
        showError('Error', 'No se pudieron cargar los datos de sus hijos')
      } finally {
        if (showLoadingIndicator) setLoading(false)
      }
    }
  }

  // Función para refrescar datos manualmente
  const handleRefresh = async () => {
    showSuccess('Actualizando', 'Cargando datos más recientes...')
    await cargarMisHijos(true)
  }

  // Cargar solo los hijos del padre actual
  useEffect(() => {
    cargarMisHijos()
    cargarRegistrosAsistencia()
    cargarCalificaciones()
  }, [usuario, cargarRegistrosAsistencia, cargarCalificaciones])

  // VALIDACIÓN CRÍTICA: Solo mostrar hijos REALMENTE asignados a este padre
  const validarHijosAsignados = (hijos) => {
    if (!usuario || !usuario.id) return []
    
    // Verificar cada hijo para asegurar que realmente pertenece a este padre
    return hijos.filter(hijo => {
      const relaciones = DatabaseQueries.getAllParentStudentRelationships()
      
      const esRealmenteHijo = relaciones.some(rel => 
        compareIds(rel.parent_user_id, usuario.id) && compareIds(rel.student_id, hijo.id)
      )
      
      if (!esRealmenteHijo) {
        console.warn(`❌ ALERTA: El estudiante ${hijo.nombre} ${hijo.apellidos} (ID: ${hijo.id}) NO pertenece al padre ${usuario.nombre} (ID: ${usuario.id})`)
        console.log('Debug comparación:', {
          usuarioId: usuario.id,
          usuarioIdType: typeof usuario.id,
          hijoId: hijo.id,
          hijoIdType: typeof hijo.id,
          relacionesDelPadre: relaciones.filter(r => compareIds(r.parent_user_id, usuario.id))
        })
      }
      
      return esRealmenteHijo
    })
  }

  // Debug: Mostrar información crítica
  console.log(`🔍 ESTADO ACTUAL:`)
  console.log(`- Usuario: ${usuario?.nombre} (ID: ${usuario?.id})`)
  console.log(`- misHijos.length: ${misHijos.length}`)
  console.log(`- Hijos válidos después de validación:`, validarHijosAsignados(misHijos).length)

  // Filtrar SOLO los hijos del padre según búsqueda
  const filteredStudents = validarHijosAsignados(misHijos).filter(student => {
    const matchesSearch = 
      student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grado.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    // Aplicar filtros adicionales
    if (selectedFilter === 'excelente') {
      const grades = getGradesByStudent(student.id)
      if (grades.length === 0) return false // Sin calificaciones, no puede ser excelente
      const average = grades.reduce((sum, g) => sum + g.promedio, 0) / grades.length
      return average >= 16
    }
    
    if (selectedFilter === 'regular') {
      const grades = getGradesByStudent(student.id)
      if (grades.length === 0) return false // Sin calificaciones, no puede ser regular
      const average = grades.reduce((sum, g) => sum + g.promedio, 0) / grades.length
      return average >= 11 && average < 16
    }
    
    if (selectedFilter === 'atencion') {
      const grades = getGradesByStudent(student.id)
      // Si no tiene calificaciones O su promedio es bajo, necesita atención
      if (grades.length === 0) return true
      const average = grades.reduce((sum, g) => sum + g.promedio, 0) / grades.length
      return average < 11
    }

    return true
  })

  // Calcular estadísticas generales basadas en MIS HIJOS
  const validHijos = validarHijosAsignados(misHijos)
  const stats = {
    total: validHijos.length,
    excelentes: validHijos.filter(s => {
      const grades = getGradesByStudent(s.id)
      if (grades.length === 0) return false
      const avg = grades.reduce((sum, g) => sum + g.promedio, 0) / grades.length
      return avg >= 16
    }).length,
    regulares: validHijos.filter(s => {
      const grades = getGradesByStudent(s.id)
      if (grades.length === 0) return false
      const avg = grades.reduce((sum, g) => sum + g.promedio, 0) / grades.length
      return avg >= 11 && avg < 16
    }).length,
    atencion: validHijos.filter(s => {
      const grades = getGradesByStudent(s.id)
      // Incluir estudiantes sin calificaciones en "necesita atención"
      if (grades.length === 0) return true
      const avg = grades.reduce((sum, g) => sum + g.promedio, 0) / grades.length
      return avg < 11
    }).length
  }

  // Exportar información
  const handleExport = async (format) => {
    try {
      // Para padres, solo PDF disponible
      if (format !== 'pdf') {
        showError('Formato no permitido', 'Los padres solo pueden exportar en formato PDF')
        return
      }

      // Preparar datos para el PDF
      const studentsData = filteredStudents.map(student => {
        const grades = getGradesByStudent(student.id)
        const attendance = obtenerEstadisticasAsistencia(student.id)
        const average = grades.length > 0 
          ? (grades.reduce((sum, g) => sum + g.promedio, 0) / grades.length).toFixed(1)
          : 'N/A'
        
        return {
          nombre: `${student.nombre} ${student.apellidos}`,
          grado: `${student.grado} - ${student.seccion}`,
          promedio: average,
          asistencia: `${attendance.porcentajeAsistencia}%`,
          estado: average >= 16 ? 'Excelente' : average >= 11 ? 'Regular' : 'Necesita Atención'
        }
      })

      // Generar PDF
      await generateReportPDF({
        title: 'Reporte de Estudiantes',
        subtitle: `Generado por: ${usuario.nombre}`,
        date: new Date(),
        students: studentsData
      })
      
      showSuccess('Reporte generado', 'El reporte PDF se ha descargado correctamente')
      
      setShowExportMenu(false)
    } catch (error) {
      showError('Error', 'No se pudo generar el reporte')
    }
  }

  const filters = [
    { value: 'todos', label: 'Todos', count: stats.total },
    { value: 'excelente', label: 'Excelentes', count: stats.excelentes, color: 'text-green-600' },
    { value: 'regular', label: 'Regulares', count: stats.regulares, color: 'text-yellow-600' },
    { value: 'atencion', label: 'Atención', count: stats.atencion, color: 'text-red-600' }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mis Hijos</h1>
              <p className="text-gray-600">Información académica y datos de tus hijos</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <AnimatedButton
                variant="outline"
                icon={loading ? FiClock : FiRefreshCw}
                onClick={handleRefresh}
                disabled={loading}
                size="sm"
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </AnimatedButton>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedFilter('todos')}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <CountUpNumber value={stats.total} />
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedFilter('excelente')}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Excelentes</p>
                  <p className="text-2xl font-bold text-green-600">
                    <CountUpNumber value={stats.excelentes} />
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiAward className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedFilter('regular')}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Regulares</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    <CountUpNumber value={stats.regulares} />
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedFilter('atencion')}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Requieren Atención</p>
                  <p className="text-2xl font-bold text-red-600">
                    <CountUpNumber value={stats.atencion} />
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiActivity className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controles */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Búsqueda */}
              <div className="flex-1 max-w-md">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar por nombre, apellido o grado..."
                />
              </div>

              {/* Controles de vista y exportación */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-0">
                  {filters.map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedFilter(filter.value)}
                      className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                        selectedFilter === filter.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                {/* Vista y Exportar */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Vista */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FiGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FiList className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* Exportar */}
                  <div className="relative">
                    <AnimatedButton
                      variant="outline"
                      icon={FiDownload}
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      size="sm"
                    >
                      <span className="hidden sm:inline">Exportar</span>
                      <span className="sm:hidden">Export</span>
                    </AnimatedButton>
                  
                  <AnimatePresence>
                    {showExportMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                      >
                        <button
                          onClick={() => handleExport('pdf')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <FiFileText className="w-4 h-4" />
                          <span>Exportar como PDF</span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 border-t"
                        >
                          <FiPrinter className="w-4 h-4" />
                          <span>Imprimir</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de estudiantes */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <StaggeredList>
                {filteredStudents.map((student) => {
                  // Debug: Log student data for card view
                  console.log(`🎓 Rendering student card:`, {
                    id: student.id,
                    nombre: student.nombre,
                    apellidos: student.apellidos,
                    grado: student.grado,
                    seccion: student.seccion
                  })
                  
                  const grades = getGradesByStudent(student.id)
                  const attendance = obtenerEstadisticasAsistencia(student.id)
                  const average = grades.length > 0 
                    ? (grades.reduce((sum, g) => sum + g.promedio, 0) / grades.length).toFixed(1)
                    : 'N/A'
                  
                  return (
                    <AnimatedCard
                      key={student.id}
                      onClick={() => navigate(`/parent/profile/${student.id}`)}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      {/* Header con nombre prominente */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {(student.nombre || '?').charAt(0)}{(student.apellidos || '?').charAt(0)}
                          </div>
                          <FiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-auto" />
                        </div>
                        
                        {/* NOMBRE DEL HIJO - GRANDE Y VISIBLE */}
                        <h1 className="text-xl sm:text-2xl font-extrabold text-blue-900 mb-2 leading-tight">
                          {student.nombre && student.apellidos 
                            ? `${student.nombre} ${student.apellidos}` 
                            : student.nombre 
                            ? student.nombre 
                            : 'NOMBRE NO DISPONIBLE'
                          }
                        </h1>
                        <p className="text-sm sm:text-base text-gray-700 font-medium">
                          {student.grado || 'Sin grado'}{student.seccion ? ` - Sección ${student.seccion}` : ''}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-600">Promedio</p>
                          <p className={`text-base sm:text-lg font-bold ${
                            average >= 16 ? 'text-green-600' :
                            average >= 11 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {average}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-600">Asistencia</p>
                          <p className="text-base sm:text-lg font-bold text-blue-600">
                            {attendance.porcentajeAsistencia}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs sm:text-sm text-gray-600">Cursos</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900">
                            {grades.length}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm space-y-1 sm:space-y-0">
                        <span className="text-gray-600">
                          Código: {student.codigoQR || `ST${student.id.toString().padStart(6, '0')}`}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          average >= 16 
                            ? 'bg-green-100 text-green-800' 
                            : average >= 11
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {average >= 16 ? 'Excelente' : average >= 11 ? 'Regular' : 'Atención'}
                        </span>
                      </div>
                    </AnimatedCard>
                  )
                })}
              </StaggeredList>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grado
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promedio
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asistencia
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="relative px-3 sm:px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const grades = getGradesByStudent(student.id)
                    const attendance = obtenerEstadisticasAsistencia(student.id)
                    const average = grades.length > 0 
                      ? (grades.reduce((sum, g) => sum + g.promedio, 0) / grades.length).toFixed(1)
                      : 'N/A'
                    
                    return (
                      <motion.tr 
                        key={student.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                        className="hover:bg-gray-50 cursor-pointer transition-all duration-200"
                        onClick={() => navigate(`/parent/profile/${student.id}`)}
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                              {(student.nombre || '?').charAt(0)}{(student.apellidos || '?').charAt(0)}
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <div className="text-base sm:text-lg font-bold text-blue-900">
                                {`${student.nombre || 'NOMBRE NO DISPONIBLE'} ${student.apellidos || ''}`.trim()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.codigoQR || student.codigo_qr || `ST${student.id.toString().padStart(6, '0')}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {student.grado} - {student.seccion}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className={`text-xs sm:text-sm font-medium ${
                            average >= 16 ? 'text-green-600' :
                            average >= 11 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {average}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {attendance.porcentajeAsistencia}%
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            average >= 16 
                              ? 'bg-green-100 text-green-800' 
                              : average >= 11
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <span className="hidden sm:inline">{average >= 16 ? 'Excelente' : average >= 11 ? 'Regular' : 'Atención'}</span>
                            <span className="sm:hidden">{average >= 16 ? 'Exc' : average >= 11 ? 'Reg' : 'Att'}</span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sin resultados */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cargando información de sus hijos...
              </h3>
            </div>
          ) : filteredStudents.length === 0 && misHijos.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tiene hijos asignados
              </h3>
              <p className="text-gray-600 mb-4">
                Si acaba de importar estudiantes, es posible que no se hayan asignado automáticamente a su cuenta.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Contacte al administrador para vincular a sus hijos</p>
                <p>• O haga clic en "Actualizar" para recargar los datos</p>
                <p>• Los estudiantes deben ser asignados manualmente desde el panel de administración</p>
              </div>
              <div className="mt-6">
                <AnimatedButton
                  variant="primary"
                  icon={FiRefreshCw}
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Actualizar Datos
                </AnimatedButton>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron hijos con esos criterios
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros o el término de búsqueda
              </p>
            </div>
          ) : null}
        </main>
      </div>
    </PageTransition>
  )
}

export default Students