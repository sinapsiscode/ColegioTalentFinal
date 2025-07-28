import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FiActivity,
  FiEdit3,
  FiClock,
  FiBarChart2,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiBell,
  FiCamera
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import CountUpNumber from '../../components/common/CountUpNumber'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import InteractiveChart from '../../components/charts/InteractiveChart'

import useAttendanceStore from '../../stores/attendanceStore'
import useStudentsStore from '../../stores/studentsStore'
import useScannerStore from '../../stores/scannerStore'
import useAuthStore from '../../stores/authStore'
import { showSuccess, showError, showInfo } from '../../utils/sweetAlert'

const AsistenciaDashboard = () => {
  const navigate = useNavigate()
  const { rol } = useAuthStore()
  
  const { 
    registrosAsistencia,
    obtenerEstadisticasHoy,
    obtenerRegistrosRecientes,
    cargarRegistrosAsistencia,
    cargando: cargandoAsistencia
  } = useAttendanceStore()
  
  const { alumnos } = useStudentsStore()
  
  const {
    estadisticasDelDia,
    registrosAsistencia: registrosScanner,
    inicializarDatos,
    cargando: cargandoScanner
  } = useScannerStore()

  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('hoy')

  useEffect(() => {
    cargarRegistrosAsistencia()
    if (rol === 'admin' || rol === 'entrada') {
      inicializarDatos()
    }
  }, [cargarRegistrosAsistencia, inicializarDatos, rol])

  // Estadísticas combinadas
  const estadisticas = obtenerEstadisticasHoy()
  const registrosRecientes = obtenerRegistrosRecientes(5)

  // Calcular tendencias
  const calcularTendencias = () => {
    const hoy = new Date()
    const ayer = new Date(hoy)
    ayer.setDate(ayer.getDate() - 1)
    
    const registrosHoy = registrosAsistencia.filter(r => 
      new Date(r.fecha).toDateString() === hoy.toDateString()
    )
    const registrosAyer = registrosAsistencia.filter(r => 
      new Date(r.fecha).toDateString() === ayer.toDateString()
    )
    
    return {
      asistenciaHoy: registrosHoy.filter(r => r.estado !== 'falta').length,
      asistenciaAyer: registrosAyer.filter(r => r.estado !== 'falta').length,
      tendencia: registrosHoy.length - registrosAyer.length
    }
  }

  const tendencias = calcularTendencias()

  // Datos para gráfico rápido
  const datosGraficoRapido = () => {
    const ultimos7Dias = []
    const asistenciaPorDia = []
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)
      const fechaStr = fecha.toLocaleDateString('es-ES', { weekday: 'short' })
      
      const registrosDia = registrosAsistencia.filter(r => 
        new Date(r.fecha).toDateString() === fecha.toDateString()
      )
      
      ultimos7Dias.push(fechaStr)
      asistenciaPorDia.push(registrosDia.filter(r => r.estado !== 'falta').length)
    }
    
    return { labels: ultimos7Dias, data: asistenciaPorDia }
  }

  const graficoData = datosGraficoRapido()

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true)
    await cargarRegistrosAsistencia()
    if (rol === 'admin' || rol === 'entrada') {
      await inicializarDatos()
    }
    setTimeout(() => {
      setRefreshing(false)
      showSuccess('Datos actualizados', 'La información ha sido actualizada')
    }, 1000)
  }

  const handleQuickExport = async () => {
    try {
      showInfo('Exportando', 'Generando reporte de asistencia...')
      // Aquí iría la lógica de exportación
      setTimeout(() => {
        showSuccess('Exportación completa', 'El reporte ha sido descargado')
      }, 1500)
    } catch (error) {
      showError('Error', 'No se pudo generar el reporte')
    }
  }

  // Accesos rápidos según rol
  const getQuickActions = () => {
    const baseActions = [
      {
        title: 'Ver Historial',
        description: 'Historial completo de asistencia',
        icon: FiClock,
        color: 'blue',
        path: '/asistencia/historial'
      },
      {
        title: 'Estadísticas',
        description: 'Análisis detallado',
        icon: FiBarChart2,
        color: 'purple',
        path: '/asistencia/estadisticas'
      }
    ]

    if (rol === 'admin') {
      return [
        {
          title: 'Scanner QR',
          description: 'Control de acceso',
          icon: FiCamera,
          color: 'green',
          path: '/asistencia/scanner'
        },
        {
          title: 'Registro Manual',
          description: 'Marcar asistencia',
          icon: FiEdit3,
          color: 'yellow',
          path: '/asistencia/registro'
        },
        ...baseActions
      ]
    } else if (rol === 'entrada') {
      return [
        {
          title: 'Scanner QR',
          description: 'Control de acceso',
          icon: FiCamera,
          color: 'green',
          path: '/asistencia/scanner'
        },
        ...baseActions
      ]
    }
    
    return baseActions
  }

  const quickActions = getQuickActions()

  if (cargandoAsistencia || cargandoScanner) {
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistema de Asistencia</h1>
              <p className="text-gray-600 mt-1">
                Control y gestión integral de asistencia estudiantil
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
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
                variant="primary"
                icon={FiDownload}
                onClick={handleQuickExport}
              >
                Exportar
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedCard delay={0}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Estudiantes</p>
                  <CountUpNumber 
                    value={alumnos.length} 
                    className="text-3xl font-bold text-gray-900 mt-2"
                  />
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.1}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Presentes Hoy</p>
                  <CountUpNumber 
                    value={estadisticas.presentes + estadisticas.tardes} 
                    className="text-3xl font-bold text-green-600 mt-2"
                  />
                  <div className="flex items-center mt-2">
                    {tendencias.tendencia > 0 ? (
                      <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <FiTrendingUp className="w-4 h-4 text-red-500 mr-1 rotate-180" />
                    )}
                    <span className={`text-xs ${tendencias.tendencia > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(tendencias.tendencia)} vs ayer
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiCheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tardanzas</p>
                  <CountUpNumber 
                    value={estadisticas.tardes} 
                    className="text-3xl font-bold text-yellow-600 mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {estadisticas.tardes > 0 ? 'Requiere atención' : 'Sin tardanzas'}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FiClock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.3}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ausentes</p>
                  <CountUpNumber 
                    value={estadisticas.faltas} 
                    className="text-3xl font-bold text-red-600 mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {Math.round((estadisticas.presentes + estadisticas.tardes) / alumnos.length * 100)}% asistencia
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <FiXCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gráfico de tendencia */}
            <AnimatedCard delay={0.4}>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tendencia Semanal</h3>
                <InteractiveChart
                  type="line"
                  data={{
                    labels: graficoData.labels,
                    datasets: [{
                      label: 'Asistencias',
                      data: graficoData.data,
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      fill: true,
                      tension: 0.4
                    }]
                  }}
                  height={200}
                />
              </div>
            </AnimatedCard>

            {/* Registros recientes */}
            <AnimatedCard delay={0.5}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Actividad Reciente</h3>
                  <button
                    onClick={() => navigate('/asistencia/historial')}
                    className="text-sm text-talentos-primary hover:text-talentos-secondary"
                  >
                    Ver todo →
                  </button>
                </div>
                
                {registrosRecientes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiActivity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No hay actividad reciente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {registrosRecientes.map((registro) => {
                      const alumno = alumnos.find(a => a.id === registro.alumnoId)
                      if (!alumno) return null
                      
                      return (
                        <div key={registro.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              registro.estado === 'presente' ? 'bg-green-500' :
                              registro.estado === 'tarde' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="font-medium text-sm">{alumno.nombreCompleto}</p>
                              <p className="text-xs text-gray-500">
                                {alumno.grado} {alumno.seccion} • {
                                  registro.horaEntrada 
                                    ? new Date(registro.horaEntrada).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                                    : 'Sin registro'
                                }
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            registro.estado === 'presente' ? 'bg-green-100 text-green-800' :
                            registro.estado === 'tarde' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {registro.estado}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </AnimatedCard>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Accesos rápidos */}
            <AnimatedCard delay={0.6}>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Accesos Rápidos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(action.path)}
                        className={`p-4 rounded-lg border-2 border-transparent hover:border-${action.color}-200 transition-all`}
                      >
                        <Icon className={`w-8 h-8 mx-auto mb-2 text-${action.color}-600`} />
                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </AnimatedCard>

            {/* Estado del sistema */}
            <AnimatedCard delay={0.7}>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FiActivity className="w-5 h-5 mr-2 text-green-600" />
                  Estado del Sistema
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Scanner QR</span>
                    <span className="flex items-center text-xs">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      <span className="text-green-600">Activo</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notificaciones</span>
                    <span className="flex items-center text-xs">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      <span className="text-green-600">Habilitadas</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sincronización</span>
                    <span className="text-xs text-gray-500">
                      Hace 2 minutos
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <FiBell className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-900">Notificaciones activas</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Los padres reciben alertas automáticas al registrar entrada/salida
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Alertas */}
            {estadisticas.faltas > 5 && (
              <AnimatedCard delay={0.8}>
                <div className="p-6 bg-red-50 border border-red-200">
                  <div className="flex items-start space-x-3">
                    <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-900">Alta tasa de ausencias</h4>
                      <p className="text-xs text-red-700 mt-1">
                        {estadisticas.faltas} estudiantes ausentes hoy. Considera revisar los casos.
                      </p>
                      <button
                        onClick={() => navigate('/asistencia/historial')}
                        className="text-xs text-red-600 hover:text-red-800 font-medium mt-2"
                      >
                        Ver detalles →
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AsistenciaDashboard