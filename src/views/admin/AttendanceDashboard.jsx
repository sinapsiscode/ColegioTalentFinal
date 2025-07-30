import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiFilter,
  FiBarChart2,
  FiPieChart,
  FiActivity
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import InteractiveChart from '../../components/charts/InteractiveChart'
import DateRangeFilter from '../../components/common/DateRangeFilter'
import FilterDropdown from '../../components/common/FilterDropdown'
import CountUpNumber from '../../components/common/CountUpNumber'
import LoadingSpinner from '../../components/common/LoadingSpinner'

import useAttendanceStore from '../../stores/attendanceStore'
import useStudentsStore from '../../stores/studentsStore'
import { showSuccess, showError } from '../../utils/sweetAlert'
import { generateAdvancedExcelReport } from '../../utils/advancedExcelExporter'
import { generateAdvancedReport } from '../../utils/advancedPdfGenerator'
import UnifiedExcelButton from '../../components/common/UnifiedExcelButton'

const AttendanceDashboard = () => {
  const navigate = useNavigate()
  const { 
    registrosAsistencia,
    cargando,
    cargarRegistrosAsistencia,
    obtenerEstadisticasGenerales
  } = useAttendanceStore()
  
  const { alumnos } = useStudentsStore()

  // Estados
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedSection, setSelectedSection] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    cargarRegistrosAsistencia()
  }, [cargarRegistrosAsistencia])

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const hoy = new Date().toISOString().split('T')[0]
    const registrosHoy = registrosAsistencia.filter(r => 
      r.fecha.split('T')[0] === hoy
    )

    const totalEstudiantes = alumnos.length
    const presentes = new Set(registrosHoy.filter(r => 
      r.estado === 'presente' || r.estado === 'tarde'
    ).map(r => r.alumnoId)).size
    
    const ausentes = totalEstudiantes - presentes
    const tardes = registrosHoy.filter(r => r.estado === 'tarde').length

    // Calcular tendencia (comparar con ayer)
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    const ayerStr = ayer.toISOString().split('T')[0]
    const registrosAyer = registrosAsistencia.filter(r => 
      r.fecha.split('T')[0] === ayerStr
    )
    const presentesAyer = new Set(registrosAyer.filter(r => 
      r.estado === 'presente' || r.estado === 'tarde'
    ).map(r => r.alumnoId)).size

    const tendencia = presentes - presentesAyer

    return {
      totalEstudiantes,
      presentes,
      ausentes,
      tardes,
      porcentajeAsistencia: totalEstudiantes > 0 
        ? Math.round((presentes / totalEstudiantes) * 100) 
        : 0,
      tendencia
    }
  }

  // Datos para gráficos
  const prepararDatosGraficos = () => {
    // Asistencia por día (últimos 7 días)
    const diasSemana = []
    const asistenciaPorDia = []
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)
      const fechaStr = fecha.toISOString().split('T')[0]
      const diaNombre = fecha.toLocaleDateString('es-ES', { weekday: 'short' })
      
      const registrosDia = registrosAsistencia.filter(r => 
        r.fecha.split('T')[0] === fechaStr
      )
      const presentes = new Set(registrosDia.filter(r => 
        r.estado === 'presente' || r.estado === 'tarde'
      ).map(r => r.alumnoId)).size
      
      diasSemana.push(diaNombre)
      asistenciaPorDia.push(presentes)
    }

    // Distribución por estado (hoy)
    const hoy = new Date().toISOString().split('T')[0]
    const registrosHoy = registrosAsistencia.filter(r => 
      r.fecha.split('T')[0] === hoy
    )
    
    const estados = {
      presentes: registrosHoy.filter(r => r.estado === 'presente').length,
      tardes: registrosHoy.filter(r => r.estado === 'tarde').length,
      faltas: alumnos.length - new Set(registrosHoy.map(r => r.alumnoId)).size
    }

    // Asistencia por grado
    const asistenciaPorGrado = {}
    const grados = ['1°', '2°', '3°', '4°', '5°', '6°']
    
    grados.forEach(grado => {
      const alumnosGrado = alumnos.filter(a => a.grado === grado)
      const presentesGrado = registrosHoy.filter(r => {
        const alumno = alumnos.find(a => a.id === r.alumnoId)
        return alumno?.grado === grado && (r.estado === 'presente' || r.estado === 'tarde')
      }).length
      
      asistenciaPorGrado[grado] = alumnosGrado.length > 0
        ? Math.round((presentesGrado / alumnosGrado.length) * 100)
        : 0
    })

    return {
      diasSemana,
      asistenciaPorDia,
      estados,
      asistenciaPorGrado
    }
  }

  const stats = calcularEstadisticas()
  const chartData = prepararDatosGraficos()

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true)
    await cargarRegistrosAsistencia()
    setTimeout(() => {
      setRefreshing(false)
      showSuccess('Datos actualizados', 'La información ha sido actualizada')
    }, 1000)
  }

  const handleExportReport = async (format) => {
    try {
      const data = {
        title: 'Reporte de Asistencia',
        period: `${dateRange.startDate} - ${dateRange.endDate}`,
        stats: {
          totalStudents: stats.totalEstudiantes,
          averageAttendance: stats.porcentajeAsistencia,
          criticalStudents: stats.ausentes,
          schoolDays: chartData.diasSemana.length,
          totalAbsences: stats.ausentes,
          totalTardiness: stats.tardes
        },
        distribution: {
          present: stats.presentes,
          late: stats.tardes,
          absent: stats.ausentes
        },
        monthlyTrend: chartData.diasSemana.map((dia, idx) => ({
          month: dia,
          attendance: Math.round((chartData.asistenciaPorDia[idx] / stats.totalEstudiantes) * 100)
        })),
        lowAttendanceStudents: alumnos
          .filter(alumno => {
            const registrosAlumno = registrosAsistencia.filter(r => r.alumnoId === alumno.id)
            const asistencias = registrosAlumno.filter(r => r.estado === 'presente' || r.estado === 'tarde').length
            const porcentaje = registrosAlumno.length > 0 ? (asistencias / registrosAlumno.length) * 100 : 0
            return porcentaje < 75
          })
          .map(alumno => {
            const registrosAlumno = registrosAsistencia.filter(r => r.alumnoId === alumno.id)
            const asistencias = registrosAlumno.filter(r => r.estado === 'presente' || r.estado === 'tarde').length
            const faltas = registrosAlumno.filter(r => r.estado === 'falta').length
            const porcentaje = registrosAlumno.length > 0 ? Math.round((asistencias / registrosAlumno.length) * 100) : 0
            
            return [
              alumno.nombreCompleto,
              `${alumno.grado} ${alumno.seccion}`,
              `${porcentaje}%`,
              faltas.toString(),
              porcentaje < 50 ? 'Crítico' : porcentaje < 75 ? 'En riesgo' : 'Regular'
            ]
          })
      }

      if (format === 'pdf') {
        generateAdvancedReport('ASISTENCIA_GENERAL', data)
      } else {
        generateAdvancedExcelReport('ASISTENCIA_DETALLADA', data)
      }
      
      showSuccess('Reporte generado', `El reporte se ha descargado en formato ${format.toUpperCase()}`)
    } catch (error) {
      showError('Error', 'No se pudo generar el reporte')
    }
  }

  // Estudiantes en riesgo
  const estudiantesEnRiesgo = alumnos.filter(alumno => {
    const registrosAlumno = registrosAsistencia.filter(r => r.alumnoId === alumno.id)
    const asistencias = registrosAlumno.filter(r => r.estado === 'presente' || r.estado === 'tarde').length
    const porcentaje = registrosAlumno.length > 0 ? (asistencias / registrosAlumno.length) * 100 : 0
    return porcentaje < 75 && porcentaje > 0
  })

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Asistencia</h1>
              <p className="text-gray-600 mt-1">
                Control y análisis de asistencia estudiantil
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <AnimatedButton
                variant="outline"
                icon={FiRefreshCw}
                onClick={handleRefresh}
                className={refreshing ? 'animate-spin' : ''}
                disabled={refreshing}
              >
                Actualizar
              </AnimatedButton>
              
              <AnimatedButton
                variant="outline"
                icon={FiCalendar}
                onClick={() => navigate('/admin/attendance/register')}
              >
                Registro Manual
              </AnimatedButton>
              
              <AnimatedButton
                variant="outline"
                icon={FiActivity}
                onClick={() => navigate('/admin/attendance/history')}
              >
                Ver Historial
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
                    onClick={() => handleExportReport('pdf')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    Descargar PDF
                  </button>
                  <button
                    onClick={() => handleExportReport('excel')}
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
        <AnimatedCard className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DateRangeFilter
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={setDateRange}
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
            
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600">
                Última actualización: {new Date().toLocaleTimeString('es-PE')}
              </span>
            </div>
          </div>
        </AnimatedCard>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Estudiantes */}
          <AnimatedCard delay={0}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Estudiantes</p>
                  <CountUpNumber 
                    value={stats.totalEstudiantes} 
                    className="text-3xl font-bold text-gray-900 mt-2"
                  />
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Presentes Hoy */}
          <AnimatedCard delay={0.1}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Presentes Hoy</p>
                  <CountUpNumber 
                    value={stats.presentes} 
                    className="text-3xl font-bold text-green-600 mt-2"
                  />
                  <div className="flex items-center mt-2">
                    {stats.tendencia > 0 ? (
                      <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${stats.tendencia > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(stats.tendencia)} vs ayer
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiUserCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Ausentes */}
          <AnimatedCard delay={0.2}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ausentes</p>
                  <CountUpNumber 
                    value={stats.ausentes} 
                    className="text-3xl font-bold text-red-600 mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.porcentajeAsistencia}% asistencia
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <FiUserX className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Tardanzas */}
          <AnimatedCard delay={0.3}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tardanzas</p>
                  <CountUpNumber 
                    value={stats.tardes} 
                    className="text-3xl font-bold text-yellow-600 mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Llegaron tarde hoy
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FiClock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tendencia semanal */}
          <AnimatedCard delay={0.4}>
            <h3 className="text-lg font-semibold mb-4">Tendencia Semanal</h3>
            <InteractiveChart
              type="line"
              data={{
                labels: chartData.diasSemana,
                datasets: [{
                  label: 'Estudiantes Presentes',
                  data: chartData.asistenciaPorDia,
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  fill: true,
                  tension: 0.4
                }]
              }}
              height={250}
            />
          </AnimatedCard>

          {/* Distribución de estados */}
          <AnimatedCard delay={0.5}>
            <h3 className="text-lg font-semibold mb-4">Distribución de Asistencia Hoy</h3>
            <InteractiveChart
              type="doughnut"
              data={{
                labels: ['Presentes', 'Tardanzas', 'Ausentes'],
                datasets: [{
                  data: [
                    chartData.estados.presentes,
                    chartData.estados.tardes,
                    chartData.estados.faltas
                  ],
                  backgroundColor: [
                    'rgb(34, 197, 94)',
                    'rgb(251, 191, 36)',
                    'rgb(239, 68, 68)'
                  ]
                }]
              }}
              height={250}
            />
          </AnimatedCard>

          {/* Asistencia por grado */}
          <AnimatedCard delay={0.6} className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Porcentaje de Asistencia por Grado</h3>
            <InteractiveChart
              type="bar"
              data={{
                labels: Object.keys(chartData.asistenciaPorGrado),
                datasets: [{
                  label: 'Porcentaje de Asistencia',
                  data: Object.values(chartData.asistenciaPorGrado),
                  backgroundColor: Object.values(chartData.asistenciaPorGrado).map(porcentaje =>
                    porcentaje >= 90 ? 'rgb(34, 197, 94)' :
                    porcentaje >= 75 ? 'rgb(251, 191, 36)' :
                    'rgb(239, 68, 68)'
                  )
                }]
              }}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value) {
                        return value + '%'
                      }
                    }
                  }
                }
              }}
              height={300}
            />
          </AnimatedCard>
        </div>

        {/* Estudiantes en riesgo */}
        {estudiantesEnRiesgo.length > 0 && (
          <AnimatedCard delay={0.7}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FiAlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                Estudiantes en Riesgo
              </h3>
              <span className="text-sm text-gray-500">
                {estudiantesEnRiesgo.length} estudiantes con menos del 75% de asistencia
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asistencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faltas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estudiantesEnRiesgo.slice(0, 5).map((alumno) => {
                    const registrosAlumno = registrosAsistencia.filter(r => r.alumnoId === alumno.id)
                    const asistencias = registrosAlumno.filter(r => r.estado === 'presente' || r.estado === 'tarde').length
                    const faltas = registrosAlumno.filter(r => r.estado === 'falta').length
                    const porcentaje = registrosAlumno.length > 0 
                      ? Math.round((asistencias / registrosAlumno.length) * 100) 
                      : 0
                    
                    return (
                      <tr key={alumno.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {alumno.nombreCompleto}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {alumno.grado} {alumno.seccion}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {porcentaje}%
                            </div>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  porcentaje >= 75 ? 'bg-green-500' :
                                  porcentaje >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {faltas}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/admin/attendance/student/${alumno.id}`)}
                            className="text-talentos-primary hover:text-talentos-secondary"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {estudiantesEnRiesgo.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/admin/attendance/at-risk')}
                  className="text-sm text-talentos-primary hover:text-talentos-secondary font-medium"
                >
                  Ver todos los estudiantes en riesgo →
                </button>
              </div>
            )}
          </AnimatedCard>
        )}

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/scanner')}
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <FiActivity className="w-8 h-8 text-talentos-primary mb-3" />
            <h3 className="font-semibold text-gray-900">Scanner QR</h3>
            <p className="text-sm text-gray-600 mt-1">Registro con código QR</p>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/attendance/reports')}
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <FiBarChart2 className="w-8 h-8 text-talentos-primary mb-3" />
            <h3 className="font-semibold text-gray-900">Reportes</h3>
            <p className="text-sm text-gray-600 mt-1">Análisis detallados</p>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin/tutor-attendance')}
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <FiUserCheck className="w-8 h-8 text-talentos-primary mb-3" />
            <h3 className="font-semibold text-gray-900">Asistencia Docente</h3>
            <p className="text-sm text-gray-600 mt-1">Control de profesores</p>
          </motion.button>
        </div>
      </main>
    </div>
  )
}

export default AttendanceDashboard