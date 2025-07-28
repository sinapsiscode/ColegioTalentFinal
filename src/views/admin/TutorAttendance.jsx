import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiUsers, 
  FiCalendar, 
  FiList, 
  FiClock,
  FiRefreshCw,
  FiDownload,
  FiFilter,
  FiSettings,
  FiMapPin,
  FiEye,
  FiGrid
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import Header from '../../components/common/Header'
import useTutorAttendanceStore from '../../stores/tutorAttendanceStore'
import useAuthStore from '../../stores/authStore'

import LoadingSpinner from '../../components/common/LoadingSpinner'
import AnimatedButton from '../../components/common/AnimatedButton'
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar'
import AttendanceStats from '../../components/attendance/AttendanceStats'
import FilterDropdown from '../../components/common/FilterDropdown'
import TutorPhotocheckTemplate from '../../components/admin/TutorPhotocheckTemplate'
import { showSuccess, showError, showInfo } from '../../utils/sweetAlert'
import { generateTutorPhotocheckQR } from '../../utils/qrGenerator'

const TutorAttendance = () => {
  const { usuario } = useAuthStore()
  const {
    registrosAsistencia,
    tutoresPresentes,
    estadisticasDelDia,
    configuracion,
    cargando,
    cargarRegistrosAsistencia,
    obtenerTutores,
    obtenerAsistenciaTutor,
    obtenerEstadisticasAsistencia,
    generarReporte,
    actualizarConfiguracion
  } = useTutorAttendanceStore()

  const [vistaActual, setVistaActual] = useState('calendario') // 'calendario' o 'lista'
  const [tutorSeleccionado, setTutorSeleccionado] = useState(null)
  const [filtroFecha, setFiltroFecha] = useState('mes')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date())
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false)
  const [tutorFotocheck, setTutorFotocheck] = useState(null)
  const [qrGenerado, setQrGenerado] = useState(null)
  const [mostrarFotocheck, setMostrarFotocheck] = useState(false)

  // Obtener datos iniciales
  useEffect(() => {
    cargarRegistrosAsistencia()
  }, [cargarRegistrosAsistencia])

  // Obtener tutores mock
  const tutores = obtenerTutores()

  // Filtrar registros según criterios
  const registrosFiltrados = registrosAsistencia.filter(registro => {
    const tutor = tutores.find(t => t.id === registro.tutorId)
    if (!tutor) return false

    // Filtro por tutor seleccionado
    if (tutorSeleccionado && registro.tutorId !== tutorSeleccionado) return false

    // Filtro por estado
    if (filtroEstado !== 'todos' && registro.estado !== filtroEstado) return false

    return true
  })

  // Handlers
  const handleTutorChange = (tutorId) => {
    setTutorSeleccionado(tutorId === 'todos' ? null : parseInt(tutorId))
  }

  const handleVerDetalle = (registro) => {
    const tutor = tutores.find(t => t.id === registro.tutorId)
    const coordenadas = registro.coordenadasEntrada || registro.coordenadasSalida

    const detalles = []
    
    // INFORMACIÓN DEL TUTOR
    detalles.push("═══════════════════════════════")
    detalles.push("👤  INFORMACIÓN DEL TUTOR")
    detalles.push("═══════════════════════════════")
    detalles.push(`Nombre:        ${tutor.nombre}`)
    detalles.push(`Especialidad:  ${tutor.especialidad}`)
    detalles.push(`Grado:         ${tutor.grado}`)
    detalles.push("")
    
    // REGISTRO DE ASISTENCIA
    detalles.push("═══════════════════════════════")
    detalles.push("📋  REGISTRO DE ASISTENCIA")
    detalles.push("═══════════════════════════════")
    detalles.push(`Fecha:         ${format(new Date(registro.fecha), 'dd/MM/yyyy', { locale: es })}`)
    detalles.push(`Estado:        ${registro.estado.charAt(0).toUpperCase() + registro.estado.slice(1)}`)
    
    if (registro.horaEntrada) {
      detalles.push(`Entrada:       ${format(new Date(registro.horaEntrada), 'HH:mm')} hrs`)
    } else {
      detalles.push(`Entrada:       No registrada`)
    }
    
    if (registro.horaSalida) {
      detalles.push(`Salida:        ${format(new Date(registro.horaSalida), 'HH:mm')} hrs`)
    } else if (registro.horaEntrada) {
      detalles.push(`Salida:        ⏳ Pendiente`)
    } else {
      detalles.push(`Salida:        No registrada`)
    }
    
    // VERIFICACIÓN GPS
    if (coordenadas) {
      detalles.push("")
      detalles.push("═══════════════════════════════")
      detalles.push("📍  VERIFICACIÓN DE UBICACIÓN")
      detalles.push("═══════════════════════════════")
      detalles.push(`Latitud:       ${coordenadas.latitud.toFixed(6)}°`)
      detalles.push(`Longitud:      ${coordenadas.longitud.toFixed(6)}°`)
      detalles.push(`Precisión:     ${coordenadas.precision.toFixed(0)} metros`)
      detalles.push(`Estado:        ✅ Verificada`)
    }
    
    // OBSERVACIONES
    if (registro.observaciones) {
      detalles.push("")
      detalles.push("═══════════════════════════════")
      detalles.push("📝  OBSERVACIONES")
      detalles.push("═══════════════════════════════")
      detalles.push(registro.observaciones)
    }

    const mensaje = detalles.join('\n')
    
    showInfo('📊 Detalles de Asistencia', mensaje)
  }

  const handleGenerarReporte = async () => {
    try {
      const reporte = await generarReporte('mes')
      showSuccess(
        'Reporte generado',
        `Se han exportado ${reporte.totalRegistros} registros del mes`
      )
    } catch (error) {
      showError('Error', 'No se pudo generar el reporte')
    }
  }

  const handleActualizar = () => {
    cargarRegistrosAsistencia()
    showSuccess('Datos actualizados', 'La información ha sido actualizada')
  }

  const handleConfiguracion = () => {
    setMostrarConfiguracion(!mostrarConfiguracion)
  }

  const handleSaveConfig = (nuevaConfig) => {
    actualizarConfiguracion(nuevaConfig)
    setMostrarConfiguracion(false)
    showSuccess('Configuración actualizada', 'Los cambios han sido guardados')
  }

  const handleGenerarQR = async () => {
    try {
      // Si hay un tutor seleccionado, generar QR para ese tutor
      if (tutorSeleccionado) {
        const tutor = tutores.find(t => t.id === tutorSeleccionado)
        if (tutor) {
          const qrResult = await generateTutorPhotocheckQR(tutor)
          setTutorFotocheck(tutor)
          setQrGenerado(qrResult)
          setMostrarFotocheck(true)
          return
        }
      }
      
      // Si no hay tutor seleccionado, mostrar información
      showInfo(
        'Generar Fotocheck QR', 
        'Selecciona un tutor específico del filtro para generar su código QR de fotocheck.\n\n' +
        'Los fotochecks incluyen:\n' +
        '• Código QR único del tutor\n' +
        '• Información profesional\n' +
        '• Múltiples formatos de exportación\n' +
        '• Válido por 1 año'
      )
    } catch (error) {
      showError('Error', 'No se pudo generar el código QR: ' + error.message)
    }
  }

  // Preparar datos para el calendario
  const datosCalendario = registrosFiltrados.map(registro => ({
    id: registro.id,
    fecha: new Date(registro.fecha),
    estado: registro.estado,
    tutorId: registro.tutorId,
    horaEntrada: registro.horaEntrada,
    horaSalida: registro.horaSalida,
    observaciones: registro.observaciones
  }))

  // Preparar estadísticas
  const estadisticasActuales = tutorSeleccionado 
    ? obtenerEstadisticasAsistencia(tutorSeleccionado)
    : estadisticasDelDia

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
      
      <main className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Asistencia de Tutores</h1>
            <p className="text-gray-600 mt-1">
              Control y seguimiento de asistencia del personal docente
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <AnimatedButton
              variant="outline"
              icon={FiRefreshCw}
              onClick={handleActualizar}
              size="sm"
            >
              Actualizar
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              icon={FiDownload}
              onClick={handleGenerarReporte}
              size="sm"
            >
              Reporte
            </AnimatedButton>

            <AnimatedButton
              variant="outline"
              icon={FiGrid}
              onClick={handleGenerarQR}
              size="sm"
            >
              QR Codes
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              icon={FiSettings}
              onClick={handleConfiguracion}
              size="sm"
            >
              Configurar
            </AnimatedButton>
          </div>
        </div>

        {/* Configuración */}
        {mostrarConfiguracion && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Asistencia</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Ingreso Regular
                </label>
                <input
                  type="time"
                  value={configuracion.horaIngresoRegular}
                  onChange={(e) => handleSaveConfig({ horaIngresoRegular: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minutos de Tolerancia
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={configuracion.minutosTolerancia}
                  onChange={(e) => handleSaveConfig({ minutosTolerancia: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Radio de Ubicación (metros)
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={configuracion.coordenadasColegio.radio}
                  onChange={(e) => handleSaveConfig({ 
                    coordenadasColegio: { 
                      ...configuracion.coordenadasColegio, 
                      radio: parseInt(e.target.value) 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Controles */}
        <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setVistaActual('calendario')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    vistaActual === 'calendario'
                      ? 'bg-talentos-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiCalendar className="w-4 h-4" />
                  <span>Calendario</span>
                </button>
                
                <button
                  onClick={() => setVistaActual('lista')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    vistaActual === 'lista'
                      ? 'bg-talentos-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                  <span>Lista</span>
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Tutor:
                  </label>
                  <div className="w-full sm:min-w-64">
                    <FilterDropdown
                      selectedValue={tutorSeleccionado || 'todos'}
                      onSelect={handleTutorChange}
                      label="Seleccionar tutor"
                      options={[
                        { value: 'todos', label: 'Todos los tutores' },
                        ...tutores.map(tutor => ({
                          value: tutor.id,
                          label: `${tutor.nombre} - ${tutor.especialidad} (${tutor.grado})`
                        }))
                      ]}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Estado:
                  </label>
                  <FilterDropdown
                    selectedValue={filtroEstado}
                    onSelect={setFiltroEstado}
                    label="Filtrar por estado"
                    options={[
                      { value: 'todos', label: 'Todos los estados' },
                      { value: 'presente', label: 'Presente' },
                      { value: 'tarde', label: 'Tarde' },
                      { value: 'falta', label: 'Falta' }
                    ]}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiUsers className="w-4 h-4" />
                <span>{tutoresPresentes.length} tutores presentes</span>
              </div>
              
              {tutorSeleccionado && (
                <div className="flex items-center space-x-2 text-sm text-talentos-primary">
                  <FiFilter className="w-4 h-4" />
                  <span>
                    Mostrando: {tutores.find(t => t.id === tutorSeleccionado)?.nombre}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mb-4 sm:mb-6">
          <AttendanceStats 
            estadisticas={estadisticasActuales} 
            loading={cargando}
            tipo="tutores"
          />
        </div>

        {/* Contenido Principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {vistaActual === 'calendario' ? (
            <div className="p-4 sm:p-6">
              <AttendanceCalendar
                registros={datosCalendario}
                onDateSelect={setFechaSeleccionada}
                onRecordClick={handleVerDetalle}
                selectedDate={fechaSeleccionada}
                tutorSeleccionado={tutorSeleccionado}
                tutores={tutores}
              />
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {registrosFiltrados.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No se encontraron registros de asistencia</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {registrosFiltrados.map((registro) => {
                      const tutor = tutores.find(t => t.id === registro.tutorId)
                      
                      return (
                        <motion.div
                          key={registro.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => handleVerDetalle(registro)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 gap-4 sm:gap-0 cursor-pointer"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                              <img
                                src={tutor.foto}
                                alt={tutor.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium hidden">
                                {tutor.nombre.charAt(0)}
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-gray-900">{tutor.nombre}</h3>
                              <p className="text-sm text-gray-600">{tutor.especialidad} - {tutor.grado}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="text-left sm:text-right">
                              <p className="text-sm text-gray-900">
                                {format(new Date(registro.fecha), 'dd/MM/yyyy', { locale: es })}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                {registro.horaEntrada && (
                                  <span>Entrada: {format(new Date(registro.horaEntrada), 'HH:mm')}</span>
                                )}
                                {registro.horaSalida && (
                                  <span>Salida: {format(new Date(registro.horaSalida), 'HH:mm')}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                registro.estado === 'presente' ? 'bg-green-100 text-green-800' :
                                registro.estado === 'tarde' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {registro.estado.charAt(0).toUpperCase() + registro.estado.slice(1)}
                              </span>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleVerDetalle(registro)
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Fotocheck */}
      {mostrarFotocheck && (
        <TutorPhotocheckTemplate
          tutor={tutorFotocheck}
          qrCode={qrGenerado}
          onClose={() => {
            setMostrarFotocheck(false)
            setTutorFotocheck(null)
            setQrGenerado(null)
          }}
          isVisible={mostrarFotocheck}
        />
      )}
    </div>
  )
}

export default TutorAttendance