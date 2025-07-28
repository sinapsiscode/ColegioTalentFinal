import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// Import icons from react-icons/fi
import { 
  FiUsers, 
  FiBookOpen,
  FiCalendar, 
  FiMessageSquare,
  FiClock,
  FiRefreshCw,
  FiPlus,
  FiEye,
  FiGrid,
  FiDownload,
  FiX,
  FiBook,
  FiEdit3,
  FiCheckCircle,
  FiSend,
  FiBarChart
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import Header from '../../components/common/Header'
import useTutorStore from '../../stores/tutorStore'
import useTutorAttendanceStore from '../../stores/tutorAttendanceStore'
import useAuthStore from '../../stores/authStore'

import StudentCard from '../../components/tutor/StudentCard'
import ClassCard from '../../components/tutor/ClassCard'
import ActivityCard from '../../components/tutor/ActivityCard'
import TutorStats from '../../components/tutor/TutorStats'
import TutorAttendanceCard from '../../components/tutor/TutorAttendanceCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import AnimatedButton from '../../components/common/AnimatedButton'
import TutorPhotocheckTemplate from '../../components/admin/TutorPhotocheckTemplate'
import ClassManagementModal from '../../components/tutor/ClassManagementModal'
import StudentDetailModal from '../../components/tutor/StudentDetailModal'
import ActivityManagementModal from '../../components/tutor/ActivityManagementModal'
import GradeManagementModal from '../../components/tutor/GradeManagementModal'
import QuickGradeInput from '../../components/tutor/QuickGradeInput'
import MyClassroomsView from '../../components/tutor/MyClassroomsView'
import TeacherDayView from '../../components/tutor/TeacherDayView'
import { showSuccess, showError, showInput, showInfo, showConfirm } from '../../utils/sweetAlert'
import { generateTutorPhotocheckQR, downloadQRCode } from '../../utils/qrGenerator'
import { exportToPDF, exportToExcel } from '../../utils/exportUtilsSimple'

const Dashboard = () => {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { 
    tutor,
    estudiantes, 
    clasesHoy,
    actividades,
    mensajesNoLeidos,
    cargando, 
    cargarDashboard,
    completarActividad,
    actualizarProgreso,
    actualizarObservaciones,
    cambiarEstadoEstudiante,
    obtenerEstadisticas,
    obtenerActividadesPorPrioridad,
    obtenerProximasClases
  } = useTutorStore()

  const { obtenerRegistroHoy, cargarRegistrosAsistencia } = useTutorAttendanceStore()

  const [filtroEstudiantes, setFiltroEstudiantes] = useState('todos')
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [mostrarTodasActividades, setMostrarTodasActividades] = useState(false)
  const [qrGenerado, setQrGenerado] = useState(null)
  const [mostrarQR, setMostrarQR] = useState(false)
  const [mostrarFotocheck, setMostrarFotocheck] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [showClassModal, setShowClassModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [showQuickInput, setShowQuickInput] = useState(false)
  const [localActividades, setLocalActividades] = useState([])

  // Cargar datos al montar
  useEffect(() => {
    cargarDashboard(usuario?.id) // Pasar ID del tutor actual
    cargarRegistrosAsistencia() // Inicializar datos de asistencia de tutores
  }, [cargarDashboard, cargarRegistrosAsistencia, usuario?.id])

  // Sincronizar actividades locales con las del store
  useEffect(() => {
    setLocalActividades(actividades)
  }, [actividades])

  // Handlers
  const handleViewStudentDetails = (estudiante) => {
    setSelectedStudent(estudiante)
    setShowStudentModal(true)
  }

  const handleEditObservations = async (estudiante) => {
    try {
      const result = await showInput(
        'Editar Observaciones',
        'Actualiza las observaciones del estudiante:',
        {
          inputValue: estudiante.observaciones,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          cancelButtonText: 'Cancelar'
        }
      )

      if (result.isConfirmed) {
        actualizarObservaciones(estudiante.id, result.value)
        showSuccess('Observaciones actualizadas', 'Los cambios han sido guardados correctamente')
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  const handleStartClass = (clase) => {
    setSelectedClass(clase)
    setShowClassModal(true)
  }

  const handleViewClassDetails = (clase) => {
    setSelectedClass(clase)
    setShowClassModal(true)
  }

  const handleUpdateClass = (updatedClass) => {
    // Aquí se actualizaría la clase en el store
    showSuccess('Clase actualizada', 'Los cambios han sido guardados')
  }

  const handleUpdateStudent = (updatedStudent) => {
    // Actualizar estudiante en el store
    cambiarEstadoEstudiante(updatedStudent.id, updatedStudent.estado)
    actualizarObservaciones(updatedStudent.id, updatedStudent.observaciones)
    showSuccess('Estudiante actualizado', 'Los cambios han sido guardados')
  }

  const handleCreateActivity = (newActivity) => {
    setLocalActividades([...localActividades, newActivity])
    // En producción, esto se guardaría en el store/backend
  }

  const handleUpdateActivity = (updatedActivity) => {
    setLocalActividades(localActividades.map(act => 
      act.id === updatedActivity.id ? updatedActivity : act
    ))
    if (updatedActivity.completado) {
      completarActividad(updatedActivity.id)
    } else if (updatedActivity.progreso !== undefined) {
      actualizarProgreso(updatedActivity.id, updatedActivity.progreso)
    }
  }

  const handleDeleteActivity = (activityId) => {
    setLocalActividades(localActividades.filter(act => act.id !== activityId))
  }

  const handleCompleteActivity = (actividadId) => {
    completarActividad(actividadId)
    showSuccess('Actividad Completada', 'La actividad ha sido marcada como completada')
  }

  const handleUpdateProgress = (actividadId, progreso) => {
    actualizarProgreso(actividadId, progreso)
    showSuccess('Progreso Actualizado', `Progreso actualizado a ${progreso}%`)
  }

  const handleRefresh = () => {
    cargarDashboard(usuario?.id)
    showSuccess('Dashboard actualizado', 'Los datos han sido actualizados')
  }

  const handleExportStudentList = async () => {
    try {
      const result = await showConfirm(
        'Exportar Lista de Alumnos',
        '¿En qué formato deseas descargar la lista?',
        'PDF',
        'Excel',
        {
          showCancelButton: true,
          confirmButtonText: 'PDF',
          denyButtonText: 'Excel',
          cancelButtonText: 'Cancelar'
        }
      )

      if (result.isConfirmed || result.isDenied) {
        const formato = result.isConfirmed ? 'pdf' : 'excel'
        
        // Preparar datos de estudiantes
        const estudiantesParaExportar = seccionSeleccionada === 'todas' 
          ? estudiantes 
          : estudiantes.filter(e => `${e.grado} ${e.seccion || ''}`.trim() === seccionSeleccionada)
          
        const datosEstudiantes = estudiantesParaExportar.map((est, index) => ({
          'N°': index + 1,
          'Apellidos': est.apellidos || '',
          'Nombres': est.nombre,
          'DNI': est.dni || 'Sin DNI',
          'Grado': est.grado,
          'Sección': est.seccion || tutor.seccion,
          'Estado': est.estado === 'activo' ? 'Activo' : 'Necesita Atención',
          'Promedio': est.promedio ? est.promedio.toFixed(1) : 'N/A',
          'Asistencia': `${est.asistencia || 0}%`
        }))

        const headers = ['N°', 'Apellidos', 'Nombres', 'DNI', 'Grado', 'Sección', 'Estado', 'Promedio', 'Asistencia']
        
        if (formato === 'pdf') {
          const rows = datosEstudiantes.map(est => Object.values(est))
          await exportToPDF(rows, headers, `lista_alumnos_${tutor.grado}_${tutor.seccion}`, {
            title: `Lista de Alumnos - ${tutor.grado} ${tutor.seccion}`,
            subtitle: `Tutor: ${tutor.nombre} ${tutor.apellidos || ''} - ${format(new Date(), 'dd/MM/yyyy')}`
          })
        } else {
          const rows = datosEstudiantes.map(est => Object.values(est))
          await exportToExcel(rows, headers, `lista_alumnos_${tutor.grado}_${tutor.seccion}`)
        }
        
        showSuccess('Lista Exportada', `La lista de alumnos ha sido descargada en formato ${formato.toUpperCase()}`)
      }
    } catch (error) {
      console.error('Error exportando lista:', error)
      showError('Error', 'No se pudo exportar la lista de alumnos')
    }
  }

  const handleGenerarQR = async () => {
    try {
      const qrResult = await generateTutorPhotocheckQR(tutor)
      setQrGenerado(qrResult)
      setMostrarQR(true)
      showSuccess('QR Generado', 'Tu código QR de fotocheck ha sido generado exitosamente')
    } catch (error) {
      showError('Error', 'No se pudo generar el código QR: ' + error.message)
    }
  }

  const handleVerFotocheck = async () => {
    try {
      if (!qrGenerado) {
        const qrResult = await generateTutorPhotocheckQR(tutor)
        setQrGenerado(qrResult)
      }
      setMostrarFotocheck(true)
    } catch (error) {
      showError('Error', 'No se pudo generar el código QR para el fotocheck: ' + error.message)
    }
  }

  const handleDescargarQR = () => {
    if (qrGenerado) {
      downloadQRCode(qrGenerado.dataURL, `fotocheck-${tutor.nombre.replace(/\s+/g, '_')}.png`)
      showSuccess('QR Descargado', 'El código QR ha sido descargado exitosamente')
    }
  }

  const handleVerAsistencia = () => {
    const registroHoy = obtenerRegistroHoy(tutor.id)
    
    if (registroHoy) {
      const detalles = []
      
      // ESTADO ACTUAL
      detalles.push("═══════════════════════════════")
      detalles.push("📋  MI REGISTRO DE HOY")
      detalles.push("═══════════════════════════════")
      detalles.push(`Fecha:         ${format(new Date(registroHoy.fecha), 'dd/MM/yyyy', { locale: es })}`)
      detalles.push(`Estado:        ${registroHoy.estado.charAt(0).toUpperCase() + registroHoy.estado.slice(1)}`)
      detalles.push("")
      
      // HORARIOS
      detalles.push("═══════════════════════════════")
      detalles.push("🕐  HORARIOS")
      detalles.push("═══════════════════════════════")
      
      if (registroHoy.horaEntrada) {
        detalles.push(`Entrada:       ${format(new Date(registroHoy.horaEntrada), 'HH:mm')} hrs`)
      } else {
        detalles.push(`Entrada:       No registrada`)
      }
      
      if (registroHoy.horaSalida) {
        detalles.push(`Salida:        ${format(new Date(registroHoy.horaSalida), 'HH:mm')} hrs`)
      } else if (registroHoy.horaEntrada) {
        detalles.push(`Salida:        ⏳ Pendiente`)
      } else {
        detalles.push(`Salida:        No registrada`)
      }
      
      // VERIFICACIÓN
      if (registroHoy.coordenadasEntrada) {
        detalles.push("")
        detalles.push("═══════════════════════════════")
        detalles.push("📍  VERIFICACIÓN")
        detalles.push("═══════════════════════════════")
        detalles.push(`Ubicación:     ✅ Verificada`)
        detalles.push(`Precisión:     ${registroHoy.coordenadasEntrada.precision.toFixed(0)} metros`)
      }
      
      // OBSERVACIONES
      if (registroHoy.observaciones) {
        detalles.push("")
        detalles.push("═══════════════════════════════")
        detalles.push("📝  OBSERVACIONES")
        detalles.push("═══════════════════════════════")
        detalles.push(registroHoy.observaciones)
      }

      const mensaje = detalles.join('\n')
      showInfo('📊 Mi Asistencia de Hoy', mensaje)
    } else {
      const mensaje = [
        "═══════════════════════════════",
        "❌  SIN REGISTRO",
        "═══════════════════════════════",
        "",
        "No has marcado asistencia hoy.",
        "",
        "Para registrar tu asistencia:",
        "• Genera tu código QR",
        "• Escanealo en la entrada del colegio",
        "• El sistema verificará tu ubicación",
        "",
        "¡Recuerda llegar a tiempo! ⏰"
      ].join('\n')
      
      showInfo('📱 Asistencia Pendiente', mensaje)
    }
  }

  // Obtener secciones únicas
  const getSeccionesUnicas = () => {
    const secciones = estudiantes.map(e => `${e.grado} ${e.seccion || ''}`.trim())
    return [...new Set(secciones)].sort()
  }

  // Filtrar estudiantes con múltiples criterios
  const estudiantesFiltrados = estudiantes.filter(estudiante => {
    // Filtro por estado
    let matchEstado = true
    if (filtroEstudiantes === 'activos') matchEstado = estudiante.estado === 'activo'
    if (filtroEstudiantes === 'atencion') matchEstado = estudiante.estado === 'necesita_atencion'
    
    // Filtro por sección
    let matchSeccion = true
    if (seccionSeleccionada !== 'todas') {
      const seccionEstudiante = `${estudiante.grado} ${estudiante.seccion || ''}`.trim()
      matchSeccion = seccionEstudiante === seccionSeleccionada
    }
    
    // Filtro por búsqueda
    let matchBusqueda = true
    if (busqueda) {
      const searchLower = busqueda.toLowerCase()
      matchBusqueda = estudiante.nombre.toLowerCase().includes(searchLower) ||
                     (estudiante.apellidos && estudiante.apellidos.toLowerCase().includes(searchLower)) ||
                     estudiante.grado.toLowerCase().includes(searchLower)
    }
    
    return matchEstado && matchSeccion && matchBusqueda
  })

  // Obtener estadísticas
  const estadisticas = obtenerEstadisticas()
  const actividadesUrgentes = obtenerActividadesPorPrioridad('alta')
  const proximasClases = obtenerProximasClases()

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
        {/* Header del dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard del Tutor</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Bienvenido {tutor.nombre} - {tutor.especialidad}
            </p>
            {getSeccionesUnicas().length > 0 && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Secciones asignadas: {getSeccionesUnicas().join(', ')}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            {mensajesNoLeidos > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/tutor/messages')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                <FiMessageSquare className="w-4 h-4" />
                <span>{mensajesNoLeidos} mensajes</span>
              </motion.button>
            )}
            
            <AnimatedButton
              variant="outline"
              icon={FiRefreshCw}
              onClick={handleRefresh}
              size="sm"
            >
              Actualizar
            </AnimatedButton>
          </div>
        </div>

        {/* Estadísticas */}
        <TutorStats 
          estadisticas={estadisticas} 
          loading={cargando}
          onStatClick={(tipo) => {
            // Navegar según el tipo de estadística
            switch(tipo) {
              case 'Estudiantes Activos':
              case 'estudiantes-detalle':
                navigate('/tutor/students')
                break
              case 'Clases Completadas':
              case 'clases-detalle':
                setShowClassModal(true)
                break
              case 'Actividades Urgentes':
              case 'actividades-detalle':
                setShowActivityModal(true)
                break
              case 'Promedio General':
                navigate('/tutor/grades')
                break
              default:
                break
            }
          }}
        />

        {/* Panel de Acciones Rápidas del Profesor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            ⚡ Acciones Rápidas del Día
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Botón 1: MIS AULAS - NUEVO */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.getElementById('mis-aulas-section')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiGrid className="w-6 h-6" />
                </div>
                <h4 className="font-medium text-gray-900">Mis Aulas</h4>
                <p className="text-xs text-gray-600 mt-1">{getSeccionesUnicas().length} secciones</p>
              </div>
            </motion.button>

            {/* Botón 2: Lista de Alumnos */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExportStudentList()}
              className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiDownload className="w-6 h-6" />
                </div>
                <h4 className="font-medium text-gray-900">Lista de Alumnos</h4>
                <p className="text-xs text-gray-600 mt-1">Descargar PDF/Excel</p>
              </div>
            </motion.button>

            {/* Botón 3: Ver Asistencias */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate('/tutor/reports')
              }}
              className="p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiBarChart className="w-6 h-6" />
                </div>
                <h4 className="font-medium text-gray-900">Ver Asistencias</h4>
                <p className="text-xs text-gray-600 mt-1">Reportes y estadísticas</p>
              </div>
            </motion.button>

            {/* Botón 4: Ingresar Notas */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuickInput(true)}
              className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiEdit3 className="w-6 h-6" />
                </div>
                <h4 className="font-medium text-gray-900">Ingresar Notas</h4>
                <p className="text-xs text-gray-600 mt-1">Calificar evaluaciones</p>
              </div>
            </motion.button>

            {/* Botón 5: Enviar Comunicado */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tutor/communiques')}
              className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiSend className="w-6 h-6" />
                </div>
                <h4 className="font-medium text-gray-900">Enviar Comunicado</h4>
                <p className="text-xs text-gray-600 mt-1">Avisos a padres</p>
              </div>
            </motion.button>

            {/* Botón 6: Ver Mensajes */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tutor/messages')}
              className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-all duration-200 relative"
            >
              {mensajesNoLeidos > 0 && (
                <span className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {mensajesNoLeidos}
                </span>
              )}
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiMessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-medium text-gray-900">Ver Mensajes</h4>
                <p className="text-xs text-gray-600 mt-1">
                  {mensajesNoLeidos > 0 ? `${mensajesNoLeidos} sin leer` : 'Chat con padres'}
                </p>
              </div>
            </motion.button>
          </div>

          {/* Acciones secundarias */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/tutor/grades')}
                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
              >
                📊 Ver todas las notas
              </button>
              <button
                onClick={() => navigate('/tutor/reports')}
                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
              >
                📈 Generar reportes
              </button>
              <button
                onClick={() => navigate('/tutor/students')}
                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
              >
                👥 Lista completa de alumnos
              </button>
              <button
                onClick={handleVerFotocheck}
                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
              >
                🆔 Mi fotocheck
              </button>
            </div>
          </div>
        </motion.div>

        {/* Vista del día del profesor */}
        <div className="mb-6">
          <TeacherDayView
            clasesHoy={clasesHoy}
            estudiantesPresentes={estudiantes.filter(e => e.estado === 'activo')}
            onStartClass={handleStartClass}
            onEndClass={(clase) => console.log('Clase terminada:', clase)}
          />
        </div>

        {/* Vista de mis aulas */}
        <div id="mis-aulas-section" className="mb-6 scroll-mt-20">
          <MyClassroomsView
            estudiantes={estudiantes}
            clasesHoy={clasesHoy}
            tutor={tutor}
          />
        </div>

        {/* Sección de Asistencia y QR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Mi Asistencia Hoy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <FiClock className="w-5 h-5 text-talentos-primary" />
              <span>Mi Asistencia de Hoy</span>
            </h3>
            
            <TutorAttendanceCard 
              registro={obtenerRegistroHoy(tutor.id)}
              onClick={handleVerAsistencia}
            />
          </motion.div>

          {/* Mi Fotocheck Digital */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <FiGrid className="w-5 h-5 text-talentos-primary" />
              <span>Mi Fotocheck Digital</span>
            </h3>
            
            {!mostrarQR ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                  <AnimatedButton
                    variant="primary"
                    icon={FiGrid}
                    onClick={handleGenerarQR}
                    size="sm"
                  >
                    Generar mi QR
                  </AnimatedButton>
                  
                  {qrGenerado && (
                    <>
                      <AnimatedButton
                        variant="outline"
                        icon={FiDownload}
                        onClick={handleDescargarQR}
                        size="sm"
                      >
                        Descargar QR
                      </AnimatedButton>
                      
                      <AnimatedButton
                        variant="secondary"
                        icon={FiEye}
                        onClick={handleVerFotocheck}
                        size="sm"
                      >
                        Ver Fotocheck
                      </AnimatedButton>
                    </>
                  )}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Genera tu código QR de fotocheck</li>
                    <li>• Descárgalo e imprímelo en tu credencial</li>
                    <li>• Escanéalo en la entrada y salida del colegio</li>
                    <li>• El sistema registrará tu ubicación automáticamente</li>
                  </ul>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">
                  <img
                    src={qrGenerado.dataURL}
                    alt="QR Code del Tutor"
                    className="w-40 h-40"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{tutor.nombre}</p>
                  <p className="text-xs text-gray-600">{tutor.especialidad} - {tutor.grado}</p>
                  <p className="text-xs text-gray-500 mt-1">Código: {qrGenerado.qrData.codigo}</p>
                </div>
                
                <div className="flex gap-2">
                  <AnimatedButton
                    variant="outline"
                    icon={FiDownload}
                    onClick={handleDescargarQR}
                    size="sm"
                  >
                    Descargar
                  </AnimatedButton>
                  
                  <button
                    onClick={() => setMostrarQR(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 px-3 py-1"
                  >
                    Ocultar
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {/* Columna izquierda - Estudiantes */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Mis Estudiantes con búsqueda mejorada */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex flex-col gap-3">
                  {/* Header principal */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center space-x-2">
                      <FiUsers className="w-5 h-5" />
                      <span>Mis Estudiantes ({estudiantesFiltrados.length})</span>
                    </h2>
                    
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                      <input
                        type="text"
                        placeholder="Buscar alumno..."
                        value={busqueda}
                        className="flex-1 sm:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                        onChange={(e) => setBusqueda(e.target.value)}
                      />
                      <select
                        value={filtroEstudiantes}
                        onChange={(e) => setFiltroEstudiantes(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                      >
                        <option value="todos">Todos</option>
                        <option value="activos">Activos</option>
                        <option value="atencion">Necesitan Atención</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Selector de secciones si el tutor tiene múltiples */}
                  {getSeccionesUnicas().length > 1 && (
                    <div className="flex flex-wrap gap-2 border-t pt-3">
                      <span className="text-sm font-medium text-gray-700">Secciones:</span>
                      <button
                        onClick={() => setSeccionSeleccionada('todas')}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          seccionSeleccionada === 'todas' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Todas ({estudiantes.length})
                      </button>
                      {getSeccionesUnicas().map(seccion => {
                        const count = estudiantes.filter(e => `${e.grado} ${e.seccion || ''}`.trim() === seccion).length
                        return (
                          <button
                            key={seccion}
                            onClick={() => setSeccionSeleccionada(seccion)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                              seccionSeleccionada === seccion 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {seccion} ({count})
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {estudiantesFiltrados.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay estudiantes que mostrar</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {estudiantesFiltrados.map((estudiante, index) => (
                    <motion.div
                      key={estudiante.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <StudentCard
                        estudiante={estudiante}
                        onViewDetails={handleViewStudentDetails}
                        onEditObservations={handleEditObservations}
                        onManageGrades={(estudiante) => {
                          setSelectedStudent(estudiante)
                          setShowGradeModal(true)
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Clases de Hoy */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <FiBookOpen className="w-5 h-5" />
                <span>Clases de Hoy ({clasesHoy.length})</span>
              </h2>
              
              {clasesHoy.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay clases programadas para hoy</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {clasesHoy.map((clase, index) => (
                    <motion.div
                      key={clase.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ClassCard
                        clase={clase}
                        onStartClass={handleStartClass}
                        onViewDetails={handleViewClassDetails}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Actividades */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <FiClock className="w-5 h-5" />
                <span>Actividades Pendientes</span>
              </h2>
              
              <button
                onClick={() => setMostrarTodasActividades(!mostrarTodasActividades)}
                className="text-xs sm:text-sm text-talentos-primary hover:text-talentos-secondary transition-colors duration-200 self-start sm:self-auto"
              >
                {mostrarTodasActividades ? 'Mostrar menos' : 'Ver todas'}
              </button>
            </div>
            
            {/* Actividades urgentes primero */}
            {actividadesUrgentes.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-red-600 mb-2 flex items-center space-x-1">
                  <FiClock className="w-3 h-3" />
                  <span>Urgentes ({actividadesUrgentes.length})</span>
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {actividadesUrgentes.map((actividad, index) => (
                    <motion.div
                      key={actividad.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ActivityCard
                        actividad={actividad}
                        onComplete={handleCompleteActivity}
                        onUpdateProgress={handleUpdateProgress}
                        onClick={() => setShowActivityModal(true)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Botón para gestionar actividades */}
            <div className="mb-4">
              <AnimatedButton
                variant="outline"
                icon={FiPlus}
                onClick={() => setShowActivityModal(true)}
                size="sm"
                className="w-full"
              >
                Gestionar Actividades
              </AnimatedButton>
            </div>
            
            {/* Todas las actividades */}
            <div className="space-y-2 sm:space-y-3">
              {(mostrarTodasActividades ? localActividades : localActividades.slice(0, 3))
                .filter(act => !act.completado)
                .map((actividad, index) => (
                  <motion.div
                    key={actividad.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ActivityCard
                      actividad={actividad}
                      onComplete={handleCompleteActivity}
                      onUpdateProgress={handleUpdateProgress}
                    />
                  </motion.div>
                ))
              }
            </div>
            
            {localActividades.filter(act => !act.completado).length === 0 && (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <FiClock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No hay actividades pendientes</p>
                <p className="text-green-600 text-sm mt-1">¡Excelente trabajo!</p>
              </div>
            )}
          </div>
        </div>

        {/* Accesos rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatedButton
                variant="outline"
                icon={FiMessageSquare}
                onClick={() => navigate('/tutor/messages')}
                className="justify-center w-full"
              >
                Mensajes
              </AnimatedButton>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatedButton
                variant="outline"
                icon={FiCalendar}
                onClick={() => navigate('/tutor/communiques')}
                className="justify-center w-full"
              >
                Comunicados
              </AnimatedButton>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatedButton
                variant="outline"
                icon={FiBook}
                onClick={() => navigate('/tutor/grades')}
                className="justify-center w-full"
              >
                Calificaciones
              </AnimatedButton>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatedButton
                variant="outline"
                icon={FiUsers}
                onClick={() => navigate('/tutor/reports')}
                className="justify-center w-full"
              >
                Reportes
              </AnimatedButton>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatedButton
                variant="outline"
                icon={FiGrid}
                onClick={handleVerFotocheck}
                className="justify-center w-full"
              >
                Mi Fotocheck
              </AnimatedButton>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Modal de Fotocheck */}
      {mostrarFotocheck && (
        <TutorPhotocheckTemplate
          tutor={tutor}
          qrCode={qrGenerado}
          onClose={() => setMostrarFotocheck(false)}
          isVisible={mostrarFotocheck}
        />
      )}

      {/* Modal de Gestión de Clase */}
      {showClassModal && selectedClass && (
        <ClassManagementModal
          clase={{
            ...selectedClass,
            estudiantes: estudiantes
          }}
          isOpen={showClassModal}
          onClose={() => {
            setShowClassModal(false)
            setSelectedClass(null)
          }}
          onUpdateClass={handleUpdateClass}
        />
      )}

      {/* Modal de Perfil del Estudiante */}
      {showStudentModal && selectedStudent && (
        <StudentDetailModal
          estudiante={selectedStudent}
          isOpen={showStudentModal}
          onClose={() => {
            setShowStudentModal(false)
            setSelectedStudent(null)
          }}
          onUpdateStudent={handleUpdateStudent}
        />
      )}

      {/* Modal de Gestión de Actividades */}
      {showActivityModal && (
        <ActivityManagementModal
          isOpen={showActivityModal}
          onClose={() => setShowActivityModal(false)}
          actividades={localActividades}
          onCreateActivity={handleCreateActivity}
          onUpdateActivity={handleUpdateActivity}
          onDeleteActivity={handleDeleteActivity}
        />
      )}

      {/* Modal de Gestión de Calificaciones */}
      {showGradeModal && selectedStudent && (
        <GradeManagementModal
          isOpen={showGradeModal}
          onClose={() => {
            setShowGradeModal(false)
            setSelectedStudent(null)
          }}
          estudiante={selectedStudent}
          onGradeUpdate={() => {
            // Recargar datos si es necesario
            cargarDashboard(usuario?.id)
          }}
        />
      )}

      {/* Modal de Ingreso Rápido de Calificaciones */}
      {showQuickInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h2 className="text-xl font-semibold">Ingreso Rápido de Calificaciones</h2>
              <button
                onClick={() => setShowQuickInput(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <QuickGradeInput 
                estudiantes={estudiantes}
                onComplete={() => {
                  setShowQuickInput(false)
                  cargarDashboard(usuario?.id)
                  showSuccess('Calificaciones guardadas', 'Las notas se han registrado exitosamente')
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Dashboard