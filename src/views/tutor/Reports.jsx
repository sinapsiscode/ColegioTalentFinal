import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiFileText,
  FiDownload,
  FiFilter,
  FiCalendar,
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiBarChart,
  FiPrinter
} from 'react-icons/fi'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

import Header from '../../components/common/Header'
import useAuthStore from '../../stores/authStore'
import useTutorStore from '../../stores/tutorStore'
import useAttendanceStore from '../../stores/attendanceStore'
import useGradesStore from '../../stores/gradesStore'

import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import CountUpNumber from '../../components/common/CountUpNumber'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'
import { exportToPDF, exportToExcel } from '../../utils/exportUtilsSimple'

const Reports = () => {
  const { usuario } = useAuthStore()
  const { tutor, estudiantes, cargarDashboard } = useTutorStore()
  const { registrosAsistencia, obtenerEstadisticasAsistencia } = useAttendanceStore()
  const { calificaciones, cargarCalificaciones } = useGradesStore()

  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState('asistencia')
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  })
  const [selectedStudent, setSelectedStudent] = useState('todos')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        cargarDashboard(usuario?.id),
        cargarCalificaciones()
      ])
      setLoading(false)
    }
    loadData()
  }, [cargarDashboard, cargarCalificaciones, usuario?.id])

  // Calcular estadísticas generales
  const getGeneralStats = () => {
    const totalEstudiantes = estudiantes.length
    const estudiantesActivos = estudiantes.filter(e => e.estado === 'activo').length
    const necesitanAtencion = estudiantes.filter(e => e.estado === 'necesita_atencion').length
    
    // Estadísticas de asistencia
    let totalAsistencias = 0
    let totalClases = 0
    
    estudiantes.forEach(estudiante => {
      const stats = obtenerEstadisticasAsistencia(estudiante.id)
      totalAsistencias += stats.presentes + stats.tardes
      totalClases += stats.total
    })
    
    const promedioAsistencia = totalClases > 0 ? Math.round((totalAsistencias / totalClases) * 100) : 0

    // Estadísticas de calificaciones
    const calificacionesEstudiantes = estudiantes.map(est => {
      const cals = calificaciones.filter(c => c.estudianteId === est.id)
      const promedio = cals.length > 0 
        ? cals.reduce((sum, c) => sum + c.nota, 0) / cals.length 
        : 0
      return promedio
    })
    
    const promedioGeneral = calificacionesEstudiantes.length > 0
      ? (calificacionesEstudiantes.reduce((sum, p) => sum + p, 0) / calificacionesEstudiantes.length).toFixed(1)
      : 0

    return {
      totalEstudiantes,
      estudiantesActivos,
      necesitanAtencion,
      promedioAsistencia,
      promedioGeneral
    }
  }

  // Obtener datos del reporte seleccionado
  const getReportData = () => {
    const studentFilter = selectedStudent === 'todos' 
      ? estudiantes 
      : estudiantes.filter(e => e.id === parseInt(selectedStudent))

    switch(selectedReport) {
      case 'asistencia':
        return studentFilter.map(estudiante => {
          const stats = obtenerEstadisticasAsistencia(estudiante.id)
          return {
            estudiante: `${estudiante.nombre} ${estudiante.apellidos}`,
            grado: estudiante.grado,
            presentes: stats.presentes,
            tardes: stats.tardes,
            faltas: stats.faltas,
            total: stats.total,
            porcentaje: stats.total > 0 ? Math.round(((stats.presentes + stats.tardes) / stats.total) * 100) : 0
          }
        })

      case 'calificaciones':
        return studentFilter.map(estudiante => {
          const cals = calificaciones.filter(c => c.estudianteId === estudiante.id)
          const materias = [...new Set(cals.map(c => c.materia))]
          
          const promediosPorMateria = materias.map(materia => {
            const calsMat = cals.filter(c => c.materia === materia)
            const promedio = calsMat.reduce((sum, c) => sum + c.nota, 0) / calsMat.length
            return { materia, promedio }
          })

          const promedioGeneral = cals.length > 0
            ? (cals.reduce((sum, c) => sum + c.nota, 0) / cals.length).toFixed(1)
            : 0

          return {
            estudiante: `${estudiante.nombre} ${estudiante.apellidos}`,
            grado: estudiante.grado,
            promedioGeneral,
            promedios: promediosPorMateria,
            estado: promedioGeneral >= 14 ? 'Aprobado' : 'Necesita apoyo'
          }
        })

      case 'progreso':
        return studentFilter.map(estudiante => {
          const stats = obtenerEstadisticasAsistencia(estudiante.id)
          const cals = calificaciones.filter(c => c.estudianteId === estudiante.id)
          const promedio = cals.length > 0
            ? (cals.reduce((sum, c) => sum + c.nota, 0) / cals.length).toFixed(1)
            : 0

          return {
            estudiante: `${estudiante.nombre} ${estudiante.apellidos}`,
            grado: estudiante.grado,
            asistencia: stats.total > 0 ? Math.round(((stats.presentes + stats.tardes) / stats.total) * 100) : 0,
            promedioNotas: promedio,
            estado: estudiante.estado,
            observaciones: estudiante.observaciones || 'Sin observaciones'
          }
        })

      default:
        return []
    }
  }

  // Exportar reporte
  const handleExportReport = async (exportFormat) => {
    try {
      const data = getReportData()
      
      if (!data || data.length === 0) {
        showError('Sin datos', 'No hay datos para exportar en este reporte')
        return
      }

      const headers = getReportHeaders()
      const rows = formatDataForExport(data)
      const filename = `Reporte_${selectedReport}_${format(new Date(), 'dd-MM-yyyy')}`

      if (exportFormat === 'pdf') {
        await exportToPDF(rows, headers, filename, {
          title: getReportTitle(),
          subtitle: `Tutor: ${tutor?.nombre || ''} - ${format(new Date(), 'dd/MM/yyyy')}`
        })
        showSuccess('Reporte exportado', 'El PDF se ha descargado correctamente')
      } else {
        await exportToExcel(rows, headers, filename)
        showSuccess('Reporte exportado', 'El archivo Excel se ha descargado correctamente')
      }
    } catch (error) {
      console.error('Error exportando:', error)
      showError('Error', 'No se pudo exportar el reporte')
    }
  }

  // Obtener título del reporte
  const getReportTitle = () => {
    switch(selectedReport) {
      case 'asistencia':
        return 'Reporte de Asistencia'
      case 'calificaciones':
        return 'Reporte de Calificaciones'
      case 'progreso':
        return 'Reporte de Progreso General'
      default:
        return 'Reporte'
    }
  }

  // Obtener headers según el tipo de reporte
  const getReportHeaders = () => {
    switch(selectedReport) {
      case 'asistencia':
        return ['Estudiante', 'Grado', 'Presentes', 'Tardes', 'Faltas', 'Total', 'Asistencia %']
      case 'calificaciones':
        return ['Estudiante', 'Grado', 'Promedio General', 'Estado']
      case 'progreso':
        return ['Estudiante', 'Grado', 'Asistencia %', 'Promedio', 'Estado', 'Observaciones']
      default:
        return []
    }
  }

  // Formatear datos para exportación
  const formatDataForExport = (data) => {
    return data.map(row => {
      switch(selectedReport) {
        case 'asistencia':
          return [
            row.estudiante,
            row.grado,
            row.presentes,
            row.tardes,
            row.faltas,
            row.total,
            `${row.porcentaje}%`
          ]
        case 'calificaciones':
          return [
            row.estudiante,
            row.grado,
            row.promedioGeneral,
            row.estado
          ]
        case 'progreso':
          return [
            row.estudiante,
            row.grado,
            `${row.asistencia}%`,
            row.promedioNotas,
            row.estado,
            row.observaciones
          ]
        default:
          return []
      }
    })
  }

  const stats = getGeneralStats()

  if (loading) {
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes del Tutor</h1>
          <p className="text-gray-600 mt-1">
            Genera y descarga reportes de tus estudiantes
          </p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <AnimatedCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    <CountUpNumber value={stats.totalEstudiantes} />
                  </p>
                </div>
                <FiUsers className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estudiantes Activos</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    <CountUpNumber value={stats.estudiantesActivos} />
                  </p>
                </div>
                <FiCheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Necesitan Atención</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    <CountUpNumber value={stats.necesitanAtencion} />
                  </p>
                </div>
                <FiXCircle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio Asistencia</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    <CountUpNumber value={stats.promedioAsistencia} suffix="%" />
                  </p>
                </div>
                <FiCalendar className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio General</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {stats.promedioGeneral}
                  </p>
                </div>
                <FiTrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Selector de reportes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generar Reporte</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Tipo de reporte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
              >
                <option value="asistencia">Reporte de Asistencia</option>
                <option value="calificaciones">Reporte de Calificaciones</option>
                <option value="progreso">Reporte de Progreso General</option>
              </select>
            </div>

            {/* Estudiante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estudiante
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
              >
                <option value="todos">Todos los estudiantes</option>
                {estudiantes.map(est => (
                  <option key={est.id} value={est.id}>
                    {est.nombre} {est.apellidos}
                  </option>
                ))}
              </select>
            </div>

            {/* Acciones */}
            <div className="flex items-end">
              <div className="flex gap-2 w-full">
                <AnimatedButton
                  variant="primary"
                  icon={FiDownload}
                  onClick={() => handleExportReport('pdf')}
                  className="flex-1"
                >
                  Descargar PDF
                </AnimatedButton>
                <AnimatedButton
                  variant="secondary"
                  icon={FiFileText}
                  onClick={() => handleExportReport('excel')}
                  className="flex-1"
                >
                  Descargar Excel
                </AnimatedButton>
              </div>
            </div>
          </div>

          {/* Vista previa del reporte */}
          <div className="border-t pt-4">
            <h3 className="text-md font-medium text-gray-900 mb-3">Vista Previa</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {getReportHeaders().map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getReportData().slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {formatDataForExport([row])[0].map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {getReportData().length > 5 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                ... y {getReportData().length - 5} filas más
              </p>
            )}
          </div>
        </div>

        {/* Reportes recientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reportes Recientes</h2>
          <div className="space-y-3">
            {[
              { tipo: 'Asistencia', fecha: new Date(), estudiantes: 'Todos' },
              { tipo: 'Calificaciones', fecha: subMonths(new Date(), 1), estudiantes: 'Ana Rodríguez' },
              { tipo: 'Progreso', fecha: subMonths(new Date(), 2), estudiantes: 'Todos' }
            ].map((reporte, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <FiFileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Reporte de {reporte.tipo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(reporte.fecha, 'dd/MM/yyyy')} - {reporte.estudiantes}
                    </p>
                  </div>
                </div>
                <button className="text-talentos-primary hover:text-talentos-secondary transition-colors duration-200">
                  <FiDownload className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Reports