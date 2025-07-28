import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiBook, 
  FiUsers, 
  FiFilter,
  FiDownload,
  FiUpload,
  FiEdit3,
  FiTrendingUp,
  FiAward,
  FiAlertCircle,
  FiBarChart2,
  FiGrid,
  FiList,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiCalendar,
  FiClock,
  FiCheck,
  FiX
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import Header from '../../components/common/Header'
import PageTransition from '../../components/common/PageTransition'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import SearchInput from '../../components/common/SearchInput'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import CountUpNumber from '../../components/common/CountUpNumber'

import useTutorStore from '../../stores/tutorStore'
import useGradesStore from '../../stores/gradesStore'
import useAuthStore from '../../stores/authStore'

import GradeManagementModal from '../../components/tutor/GradeManagementModal'
import QuickGradeInput from '../../components/tutor/QuickGradeInput'
import ExcelGradeImport from '../../components/tutor/ExcelGradeImport'

import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'
import { exportToPDF, exportToExcel } from '../../utils/exportUtilsSimple'

// Helper para formatear fechas de manera segura
const formatDateSafe = (date, formatStr = 'dd/MM', defaultValue = 'N/A') => {
  try {
    if (!date) return defaultValue
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return defaultValue
    return format(dateObj, formatStr, { locale: es })
  } catch (error) {
    console.warn('Error formateando fecha:', error)
    return defaultValue
  }
}

const Grades = () => {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { estudiantes, tutor, cargarDashboard } = useTutorStore()
  const { 
    calificaciones, 
    getGradesByStudent,
    getGradesBySubject,
    getGradeStats,
    cargarCalificaciones 
  } = useGradesStore()

  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('estudiantes') // 'estudiantes', 'materias', 'estadisticas'
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('todas')
  const [selectedPeriod, setSelectedPeriod] = useState('actual')
  const [showImportModal, setShowImportModal] = useState(false)
  const [showQuickInput, setShowQuickInput] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await cargarDashboard(usuario?.id)
        await cargarCalificaciones()
        
        // Debug info
        console.log('🎓 Datos cargados:')
        console.log('- Usuario:', usuario)
        console.log('- Estudiantes del tutor:', estudiantes.length)
        console.log('- Calificaciones totales:', calificaciones.length)
      } catch (error) {
        console.error('Error cargando datos:', error)
        showError('Error', 'No se pudieron cargar los datos')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [usuario?.id, cargarDashboard, cargarCalificaciones])

  // Obtener materias únicas
  const materias = [...new Set(calificaciones.map(c => c.materia))].filter(Boolean)

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter(est => {
    const nombreCompleto = `${est.nombre} ${est.apellidos || ''}`.toLowerCase()
    return nombreCompleto.includes(searchTerm.toLowerCase())
  })

  // Calcular estadísticas generales
  const estadisticas = {
    totalEstudiantes: estudiantes.length,
    promedioGeneral: 0,
    estudiantesExcelentes: 0,
    estudiantesRegulares: 0,
    estudiantesEnRiesgo: 0,
    materiasEvaluadas: materias.length
  }

  // Calcular promedios por estudiante
  estudiantesFiltrados.forEach(est => {
    const grades = getGradesByStudent(est.id)
    if (grades.length > 0) {
      const promedio = grades.reduce((sum, g) => sum + (g.promedio || 0), 0) / grades.length
      estadisticas.promedioGeneral += promedio
      
      if (promedio >= 18) estadisticas.estudiantesExcelentes++
      else if (promedio >= 14) estadisticas.estudiantesRegulares++
      else estadisticas.estudiantesEnRiesgo++
    }
  })

  if (estadisticas.totalEstudiantes > 0) {
    estadisticas.promedioGeneral = (estadisticas.promedioGeneral / estadisticas.totalEstudiantes).toFixed(1)
  }

  // Handlers
  const handleStudentSelect = (estudiante) => {
    setSelectedStudent(estudiante)
    setShowGradeModal(true)
  }

  const handleExportGrades = async (formato) => {
    try {
      console.log('📊 Iniciando exportación...')
      console.log('Estudiantes filtrados:', estudiantesFiltrados.length)
      console.log('Todas las calificaciones:', calificaciones.length)
      
      const datosExportacion = {
        titulo: 'Reporte de Calificaciones',
        subtitulo: `Tutor: ${tutor?.nombre} - ${formatDateSafe(new Date(), 'dd/MM/yyyy')}`,
        columnas: ['Estudiante', 'Materia', 'Nota 1', 'Nota 2', 'Nota 3', 'Promedio'],
        datos: []
      }

      estudiantesFiltrados.forEach(est => {
        const grades = getGradesByStudent(est.id)
        console.log(`Calificaciones para ${est.nombre} (ID: ${est.id}):`, grades.length)
        grades.forEach(grade => {
          // Las calificaciones mock tienen evaluaciones, no nota1/nota2/nota3
          const evaluaciones = grade.evaluaciones || []
          const nota1 = evaluaciones[0]?.nota || '-'
          const nota2 = evaluaciones[1]?.nota || '-'
          const nota3 = evaluaciones[2]?.nota || '-'
          
          datosExportacion.datos.push({
            estudiante: `${est.nombre} ${est.apellidos || ''}`,
            materia: grade.materia,
            nota1: nota1,
            nota2: nota2,
            nota3: nota3,
            promedio: grade.promedio?.toFixed(1) || '-'
          })
        })
      })

      // Validar que haya datos para exportar
      if (datosExportacion.datos.length === 0) {
        showError('Sin datos', 'No hay calificaciones registradas para exportar. Por favor, ingrese algunas calificaciones primero.')
        return
      }

      if (formato === 'pdf') {
        const headers = datosExportacion.columnas
        const rows = datosExportacion.datos.map(d => [
          d.estudiante,
          d.materia,
          d.nota1,
          d.nota2,
          d.nota3,
          d.promedio
        ])
        await exportToPDF(rows, headers, 'calificaciones', {
          title: datosExportacion.titulo,
          subtitle: datosExportacion.subtitulo
        })
      } else {
        const headers = datosExportacion.columnas
        const rows = datosExportacion.datos.map(d => [
          d.estudiante,
          d.materia,
          d.nota1,
          d.nota2,
          d.nota3,
          d.promedio
        ])
        await exportToExcel(rows, headers, 'calificaciones')
      }

      showSuccess('Exportación exitosa', `Reporte generado en formato ${formato.toUpperCase()}`)
    } catch (error) {
      showError('Error', 'No se pudo generar el reporte')
    }
  }

  const handleRefresh = async () => {
    await cargarCalificaciones()
    showSuccess('Datos actualizados', 'Las calificaciones han sido actualizadas')
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-96">
              <LoadingSpinner size="xl" />
            </div>
          </main>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Calificaciones</h1>
              <p className="text-gray-600 mt-1">
                Administra las notas de tus {estudiantes.length} estudiantes
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
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
                icon={FiUpload}
                onClick={() => setShowImportModal(true)}
                size="sm"
              >
                Importar Excel
              </AnimatedButton>
              
              <AnimatedButton
                variant="primary"
                icon={FiPlus}
                onClick={() => setShowQuickInput(true)}
                size="sm"
              >
                Ingreso Rápido
              </AnimatedButton>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setViewMode('estudiantes')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    <CountUpNumber value={estadisticas.totalEstudiantes} />
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
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setViewMode('estadisticas')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Promedio General</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {estadisticas.promedioGeneral}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Excelentes</p>
                  <p className="text-2xl font-bold text-green-600">
                    <CountUpNumber value={estadisticas.estudiantesExcelentes} />
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
              className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">En Riesgo</p>
                  <p className="text-2xl font-bold text-red-600">
                    <CountUpNumber value={estadisticas.estudiantesEnRiesgo} />
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiAlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controles */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Búsqueda y filtros */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <div className="flex-1 max-w-md">
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar estudiante..."
                  />
                </div>
                
                <FilterDropdown
                  label="Materia"
                  options={[
                    { value: 'todas', label: 'Todas las materias' },
                    ...materias.map(m => ({ value: m, label: m }))
                  ]}
                  selectedValue={selectedSubject}
                  onSelect={setSelectedSubject}
                />
                
                <FilterDropdown
                  label="Periodo"
                  options={[
                    { value: 'actual', label: 'Periodo actual' },
                    { value: 'anterior', label: 'Periodo anterior' },
                    { value: 'todos', label: 'Todos los periodos' }
                  ]}
                  selectedValue={selectedPeriod}
                  onSelect={setSelectedPeriod}
                />
              </div>

              {/* Vista y exportación */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('estudiantes')}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      viewMode === 'estudiantes' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FiUsers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('materias')}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      viewMode === 'materias' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FiBook className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('estadisticas')}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      viewMode === 'estadisticas' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FiBarChart2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative group">
                  <AnimatedButton
                    variant="outline"
                    icon={FiDownload}
                    size="sm"
                  >
                    Exportar
                  </AnimatedButton>
                  
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={() => handleExportGrades('pdf')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span>Exportar PDF</span>
                    </button>
                    <button
                      onClick={() => handleExportGrades('excel')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 border-t"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span>Exportar Excel</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          {viewMode === 'estudiantes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {estudiantesFiltrados.map((estudiante) => {
                const grades = getGradesByStudent(estudiante.id)
                const promedio = grades.length > 0 
                  ? (grades.reduce((sum, g) => sum + (g.promedio || 0), 0) / grades.length).toFixed(1)
                  : 'N/A'
                
                return (
                  <AnimatedCard
                    key={estudiante.id}
                    onClick={() => handleStudentSelect(estudiante)}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {estudiante.nombre.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{estudiante.nombre}</h3>
                          <p className="text-sm text-gray-600">{estudiante.apellidos}</p>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        promedio >= 18 ? 'bg-green-100 text-green-800' :
                        promedio >= 14 ? 'bg-yellow-100 text-yellow-800' :
                        promedio === 'N/A' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {promedio === 'N/A' ? 'Sin notas' : `Promedio: ${promedio}`}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Materias evaluadas</span>
                        <span className="font-medium">{grades.length}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Última actualización</span>
                        <span className="text-gray-500">
                          {grades.length > 0 
                            ? formatDateSafe(grades[0].fecha || grades[0].fechaRegistro)
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <button className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                        <FiEdit3 className="w-4 h-4" />
                        <span>Gestionar calificaciones</span>
                      </button>
                    </div>
                  </AnimatedCard>
                )
              })}
            </div>
          )}

          {viewMode === 'materias' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vista por Materias</h2>
              {materias.map(materia => {
                const gradesBySubject = getGradesBySubject(materia)
                const avgBySubject = gradesBySubject.length > 0
                  ? (gradesBySubject.reduce((sum, g) => sum + (g.promedio || 0), 0) / gradesBySubject.length).toFixed(1)
                  : 'N/A'
                
                return (
                  <div key={materia} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{materia}</h3>
                      <span className="text-sm text-gray-600">
                        Promedio: <span className="font-semibold">{avgBySubject}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {gradesBySubject.map((grade, idx) => {
                        const student = estudiantes.find(e => e.id === grade.estudianteId)
                        return (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span className="text-sm">{student?.nombre}</span>
                            <span className={`text-sm font-medium ${
                              grade.promedio >= 18 ? 'text-green-600' :
                              grade.promedio >= 14 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {grade.promedio?.toFixed(1)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {viewMode === 'estadisticas' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Notas</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Excelentes (18-20)</span>
                      <span className="text-sm font-medium">{estadisticas.estudiantesExcelentes}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(estadisticas.estudiantesExcelentes / estadisticas.totalEstudiantes) * 100}%` }}
                        className="bg-green-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Regulares (14-17)</span>
                      <span className="text-sm font-medium">{estadisticas.estudiantesRegulares}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(estadisticas.estudiantesRegulares / estadisticas.totalEstudiantes) * 100}%` }}
                        className="bg-yellow-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">En Riesgo (&lt;14)</span>
                      <span className="text-sm font-medium">{estadisticas.estudiantesEnRiesgo}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(estadisticas.estudiantesEnRiesgo / estadisticas.totalEstudiantes) * 100}%` }}
                        className="bg-red-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Estudiantes</h3>
                <div className="space-y-3">
                  {estudiantesFiltrados
                    .map(est => {
                      const grades = getGradesByStudent(est.id)
                      const promedio = grades.length > 0 
                        ? grades.reduce((sum, g) => sum + (g.promedio || 0), 0) / grades.length
                        : 0
                      return { ...est, promedio }
                    })
                    .sort((a, b) => b.promedio - a.promedio)
                    .slice(0, 5)
                    .map((est, idx) => (
                      <div key={est.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                            {idx + 1}
                          </span>
                          <span className="font-medium">{est.nombre}</span>
                        </div>
                        <span className="font-semibold text-green-600">
                          {est.promedio.toFixed(1)}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* Sin resultados */}
          {estudiantesFiltrados.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron estudiantes
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}

          {/* Mensaje cuando no hay calificaciones */}
          {estudiantesFiltrados.length > 0 && viewMode === 'estudiantes' && !estudiantesFiltrados.some(est => getGradesByStudent(est.id).length > 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <FiAlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay calificaciones registradas
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza ingresando las primeras calificaciones de tus estudiantes
              </p>
              <div className="flex justify-center gap-3">
                <AnimatedButton
                  variant="primary"
                  icon={FiPlus}
                  onClick={() => setShowQuickInput(true)}
                >
                  Ingreso Rápido
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  icon={FiUpload}
                  onClick={() => setShowImportModal(true)}
                >
                  Importar Excel
                </AnimatedButton>
              </div>
            </div>
          )}
        </main>

        {/* Modal de gestión de calificaciones */}
        {showGradeModal && selectedStudent && (
          <GradeManagementModal
            isOpen={showGradeModal}
            onClose={() => {
              setShowGradeModal(false)
              setSelectedStudent(null)
            }}
            estudiante={selectedStudent}
            onGradeUpdate={() => {
              cargarCalificaciones()
            }}
          />
        )}

        {/* Modal de ingreso rápido */}
        {showQuickInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Ingreso Rápido de Calificaciones</h2>
                <button
                  onClick={() => setShowQuickInput(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                <QuickGradeInput 
                  estudiantes={estudiantesFiltrados}
                  onComplete={() => {
                    setShowQuickInput(false)
                    cargarCalificaciones()
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de importación Excel */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Importar Calificaciones desde Excel</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                <ExcelGradeImport 
                  estudiantes={estudiantesFiltrados}
                  onImportComplete={() => {
                    setShowImportModal(false)
                    cargarCalificaciones()
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export default Grades