import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiBook, 
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDownload,
  FiGrid,
  FiHome,
  FiPhone,
  FiMail,
  FiChevronLeft,
  FiEdit,
  FiSave,
  FiX,
  FiShield,
  FiAward,
  FiActivity
} from 'react-icons/fi'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import Header from '../../components/common/Header'
import AnimatedButton from '../../components/common/AnimatedButton'
import PageTransition from '../../components/common/PageTransition'
import StaggeredList from '../../components/common/StaggeredList'
import CountUpNumber from '../../components/common/CountUpNumber'
import useAuthStore from '../../stores/authStore'
import useStudentsStore from '../../stores/studentsStore'
import useAttendanceStore from '../../stores/attendanceStore'
import useGradesStore from '../../stores/gradesStore'
import { DatabaseQueries } from '../../data/databaseSchema'
import { generateSecureQRCode } from '../../utils/secureQRGenerator'
import { generatePhotocheckPDFDirect } from '../../utils/pdfGenerator'
import { showSuccess, showError, showWarning } from '../../utils/sweetAlert'
import PhotocheckTemplate from '../../components/admin/PhotocheckTemplate'
import GradeDetail from '../../components/grades/GradeDetail'

const Profile = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')
  const [isEditing, setIsEditing] = useState(false)
  const [showPhotocheck, setShowPhotocheck] = useState(false)
  const [showGradeDetail, setShowGradeDetail] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [editedData, setEditedData] = useState({})
  
  const usuario = useAuthStore(state => state.usuario)
  // CRÍTICO: Solo obtener los hijos del padre actual, NO todos los estudiantes
  const [misHijos, setMisHijos] = useState([])
  const getStudentAttendance = useAttendanceStore(state => state.getStudentAttendance)
  const getGradesByStudent = useGradesStore(state => state.getGradesByStudent)
  
  // Cargar solo los hijos del padre actual
  useEffect(() => {
    if (usuario && usuario.id) {
      const hijos = DatabaseQueries.getChildrenByParentId(usuario.id)
      setMisHijos(hijos)
      console.log(`👨‍👧‍👦 Profile - Cargados ${hijos.length} hijo(s) para ${usuario.nombre}`)
    }
  }, [usuario])
  
  // Obtener el estudiante actual SOLO de los hijos del padre
  const student = studentId 
    ? misHijos.find(a => a.id === parseInt(studentId))
    : misHijos[0] // Si no hay ID, mostrar el primer hijo
    
  // DEBUG: Verificar datos
  console.log('🔍 Profile DEBUG:')
  console.log('- Usuario ID:', usuario?.id)
  console.log('- Mis hijos:', misHijos.length, misHijos.map(h => ({ id: h.id, nombre: h.nombre })))
  console.log('- StudentId param:', studentId)
  console.log('- Student seleccionado:', student ? { id: student.id, nombre: student.nombre } : 'NINGUNO')

  // Redirigir si no hay estudiante
  useEffect(() => {
    if (!student && misHijos.length === 0) {
      navigate('/parent/dashboard')
    }
  }, [student, misHijos, navigate])

  // Inicializar datos editables
  useEffect(() => {
    if (student) {
      setEditedData({
        telefono: student.telefono || '',
        email: student.email || '',
        direccion: student.direccion || ''
      })
      generateQRCode()
    }
  }, [student])

  // Generar código QR
  const generateQRCode = async () => {
    if (!student) return
    
    try {
      const qrData = await generateSecureQRCode({
        tipo: 'estudiante',
        id: student.id,
        nombre: student.nombre,
        apellidos: student.apellidos,
        grado: student.grado,
        seccion: student.seccion
      })
      setQrCode(qrData)
    } catch (error) {
      console.error('Error generando QR:', error)
    }
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">No se encontró información del estudiante</h2>
          <AnimatedButton
            variant="primary"
            icon={FiChevronLeft}
            onClick={() => navigate('/parent/dashboard')}
            className="mt-4"
          >
            Volver al inicio
          </AnimatedButton>
        </div>
      </div>
    )
  }

  // Obtener datos del estudiante
  const attendanceRecords = getStudentAttendance(student.id) || []
  const grades = getGradesByStudent(student.id) || []

  // Calcular estadísticas
  const attendanceStats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.estado === 'presente').length,
    late: attendanceRecords.filter(r => r.estado === 'tarde').length,
    absent: attendanceRecords.filter(r => r.estado === 'ausente').length,
    percentage: attendanceRecords.length > 0 
      ? ((attendanceRecords.filter(r => r.estado === 'presente' || r.estado === 'tarde').length / attendanceRecords.length) * 100).toFixed(1)
      : 0
  }

  const generalAverage = grades.length > 0
    ? (grades.reduce((sum, grade) => sum + grade.promedio, 0) / grades.length).toFixed(1)
    : 'N/A'

  // Manejar guardado de edición
  const handleSave = () => {
    // Aquí se integraría con el backend
    showSuccess('Información actualizada', 'Los datos se han guardado correctamente')
    setIsEditing(false)
  }

  // Manejar descarga de fotocheck
  const handleDownloadFotocheck = () => {
    try {
      if (student && qrCode) {
        generatePhotocheckPDFDirect(student, qrCode)
        showSuccess('Descarga exitosa', 'El fotocheck se ha descargado correctamente')
      }
    } catch (error) {
      showError('Error', 'No se pudo generar el fotocheck')
    }
  }

  const tabs = [
    { id: 'general', label: 'Información General', icon: FiUser },
    { id: 'asistencia', label: 'Asistencia', icon: FiCalendar },
    { id: 'notas', label: 'Notas', icon: FiBook },
    { id: 'actividades', label: 'Actividades', icon: FiActivity }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          {/* Navegación */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => navigate('/parent/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
            >
              <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
              <span>Volver al inicio</span>
            </button>
          </div>

          {/* Header del perfil */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 md:mb-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                  {student.nombre.charAt(0)}{student.apellidos.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {student.nombre} {student.apellidos}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {student.grado} - Sección {student.seccion}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FiCheckCircle className="w-3 h-3 mr-1" />
                      Activo
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      Código: {student.codigoQR || `ST${student.id.toString().padStart(6, '0')}`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                {!isEditing ? (
                  <>
                    <AnimatedButton
                      variant="outline"
                      icon={FiEdit}
                      onClick={() => setIsEditing(true)}
                      size="sm"
                    >
                      <span className="hidden sm:inline">Editar información</span>
                      <span className="sm:hidden">Editar</span>
                    </AnimatedButton>
                    <AnimatedButton
                      variant="primary"
                      icon={FiDownload}
                      onClick={() => {
                        console.log('🖨️ Clic en Fotocheck - Student:', student)
                        setShowPhotocheck(true)
                      }}
                      size="sm"
                    >
                      <span className="hidden sm:inline">Ver Fotocheck</span>
                      <span className="sm:hidden">Fotocheck</span>
                    </AnimatedButton>
                    
                    {/* BOTÓN DEBUG TEMPORAL */}
                    <AnimatedButton
                      variant="secondary"
                      icon={FiDownload}
                      onClick={() => {
                        console.log('🔧 DEBUG - Mis hijos:', misHijos)
                        console.log('🔧 DEBUG - Student actual:', student)
                        alert(`Hijos: ${misHijos.length}, Student: ${student ? student.nombre : 'NINGUNO'}`)
                      }}
                      size="sm"
                    >
                      DEBUG
                    </AnimatedButton>
                  </>
                ) : (
                  <>
                    <AnimatedButton
                      variant="primary"
                      icon={FiSave}
                      onClick={handleSave}
                      size="sm"
                    >
                      <span className="hidden sm:inline">Guardar cambios</span>
                      <span className="sm:hidden">Guardar</span>
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      icon={FiX}
                      onClick={() => {
                        setIsEditing(false)
                        setEditedData({
                          telefono: student.telefono || '',
                          email: student.email || '',
                          direccion: student.direccion || ''
                        })
                      }}
                      size="sm"
                    >
                      Cancelar
                    </AnimatedButton>
                  </>
                )}
              </div>
            </div>

            {/* Selector de SOLO MIS HIJOS si hay más de uno */}
            {misHijos.length > 1 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Cambiar entre mis hijos:</p>
                <div className="flex flex-wrap gap-2">
                  {misHijos.map(hijo => (
                    <button
                      key={hijo.id}
                      onClick={() => navigate(`/parent/profile/${hijo.id}`)}
                      className={`px-3 py-1 rounded-full text-xs sm:text-sm transition-colors ${
                        hijo.id === student?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hijo.nombre} {hijo.apellidos}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 sm:mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Asistencia</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    <CountUpNumber value={parseFloat(attendanceStats.percentage)} />%
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Promedio General</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {generalAverage !== 'N/A' ? <CountUpNumber value={parseFloat(generalAverage)} decimals={1} /> : generalAverage}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Cursos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    <CountUpNumber value={grades.length} />
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiBook className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">Actividades</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    <CountUpNumber value={3} />
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FiAward className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
            <div className="border-b">
              <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center space-x-1 sm:space-x-2 py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap
                        transition-colors duration-200
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">
                        {tab.id === 'general' ? 'Info' : 
                         tab.id === 'asistencia' ? 'Asist' :
                         tab.id === 'notas' ? 'Notas' : 'Act'}
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Contenido de las tabs */}
            <div className="p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {/* Información personal */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FiUser className="w-5 h-5 mr-2" />
                          Información Personal
                        </h3>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-600">Nombre completo</label>
                            <p className="font-medium text-gray-900">{student.nombre} {student.apellidos}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm text-gray-600">Fecha de nacimiento</label>
                            <p className="font-medium text-gray-900">
                              {student.fechaNacimiento 
                                ? format(new Date(student.fechaNacimiento), 'dd/MM/yyyy')
                                : 'No registrada'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm text-gray-600">Grado y sección</label>
                            <p className="font-medium text-gray-900">{student.grado} - Sección {student.seccion}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm text-gray-600">Código de estudiante</label>
                            <p className="font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                              {student.codigoQR || `ST${student.id.toString().padStart(6, '0')}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Información de contacto */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FiHome className="w-5 h-5 mr-2" />
                          Información de Contacto
                        </h3>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-600">Padre/Tutor</label>
                            <p className="font-medium text-gray-900">{student.padre || usuario?.nombre || 'No registrado'}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm text-gray-600 flex items-center">
                              <FiPhone className="w-4 h-4 mr-1" />
                              Teléfono
                            </label>
                            {isEditing ? (
                              <input
                                type="tel"
                                value={editedData.telefono}
                                onChange={(e) => setEditedData({...editedData, telefono: e.target.value})}
                                className="input-field"
                                placeholder="Ingrese teléfono"
                              />
                            ) : (
                              <p className="font-medium text-gray-900">{student.telefono || 'No registrado'}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="text-sm text-gray-600 flex items-center">
                              <FiMail className="w-4 h-4 mr-1" />
                              Email
                            </label>
                            {isEditing ? (
                              <input
                                type="email"
                                value={editedData.email}
                                onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                                className="input-field"
                                placeholder="Ingrese email"
                              />
                            ) : (
                              <p className="font-medium text-gray-900">{student.email || 'No registrado'}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="text-sm text-gray-600 flex items-center">
                              <FiHome className="w-4 h-4 mr-1" />
                              Dirección
                            </label>
                            {isEditing ? (
                              <textarea
                                value={editedData.direccion}
                                onChange={(e) => setEditedData({...editedData, direccion: e.target.value})}
                                className="input-field"
                                rows="2"
                                placeholder="Ingrese dirección"
                              />
                            ) : (
                              <p className="font-medium text-gray-900">{student.direccion || 'No registrado'}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Código QR */}
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiGrid className="w-5 h-5 mr-2" />
                        Código QR del Estudiante
                      </h3>
                      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        {qrCode && (
                          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                            <img src={qrCode.dataURL} alt="QR Code" className="w-32 h-32" />
                          </div>
                        )}
                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-gray-600 mb-3">
                            Este código QR contiene la información del estudiante para el control de acceso y asistencia.
                          </p>
                          <AnimatedButton
                            variant="primary"
                            icon={FiDownload}
                            onClick={handleDownloadFotocheck}
                            size="sm"
                          >
                            Descargar Fotocheck
                          </AnimatedButton>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'asistencia' && (
                  <motion.div
                    key="asistencia"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Resumen de asistencia */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 sm:mb-6">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-900 text-2xl font-bold">{attendanceStats.present}</p>
                            <p className="text-green-700 text-sm">Presente</p>
                          </div>
                          <FiCheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-900 text-2xl font-bold">{attendanceStats.late}</p>
                            <p className="text-yellow-700 text-sm">Tarde</p>
                          </div>
                          <FiClock className="w-8 h-8 text-yellow-600" />
                        </div>
                      </div>
                      
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-red-900 text-2xl font-bold">{attendanceStats.absent}</p>
                            <p className="text-red-700 text-sm">Ausente</p>
                          </div>
                          <FiXCircle className="w-8 h-8 text-red-600" />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-900 text-2xl font-bold">{attendanceStats.percentage}%</p>
                            <p className="text-blue-700 text-sm">Total</p>
                          </div>
                          <FiTrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    {/* Lista de asistencias */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Asistencia</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <StaggeredList>
                        {attendanceRecords.length > 0 ? (
                          attendanceRecords.map((record) => (
                            <div key={record.id} className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                    record.estado === 'presente' ? 'bg-green-500' :
                                    record.estado === 'tarde' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`} />
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {format(parseISO(record.fecha), 'EEEE, d MMMM yyyy', { locale: es })}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Entrada: {record.horaEntrada || 'No registrada'} - 
                                      Salida: {record.horaSalida || 'No registrada'}
                                    </p>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  record.estado === 'presente' 
                                    ? 'bg-green-100 text-green-800' :
                                  record.estado === 'tarde' 
                                    ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                  {record.estado.charAt(0).toUpperCase() + record.estado.slice(1)}
                                </span>
                              </div>
                              {record.observaciones && (
                                <p className="mt-2 text-sm text-gray-600 italic">
                                  {record.observaciones}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No hay registros de asistencia</p>
                          </div>
                        )}
                      </StaggeredList>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'notas' && (
                  <motion.div
                    key="notas"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Notas por Curso</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <StaggeredList>
                        {grades.length > 0 ? (
                          grades.map((grade) => (
                            <div
                              key={grade.id}
                              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => {
                                setSelectedGrade(grade)
                                setShowGradeDetail(true)
                              }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900">{grade.curso}</h4>
                                <span className={`text-2xl font-bold ${
                                  grade.promedio >= 14 ? 'text-green-600' :
                                  grade.promedio >= 11 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {grade.promedio}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Profesor: {grade.profesor}
                              </p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Evaluaciones:</span>
                                  <span className="font-medium">{grade.evaluaciones.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Bimestre:</span>
                                  <span className="font-medium">{grade.bimestre}</span>
                                </div>
                              </div>
                              <div className="mt-3 pt-3 border-t">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      grade.promedio >= 14 ? 'bg-green-600' :
                                      grade.promedio >= 11 ? 'bg-yellow-600' :
                                      'bg-red-600'
                                    }`}
                                    style={{ width: `${(grade.promedio / 20) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-8">
                            <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No hay notas registradas</p>
                          </div>
                        )}
                      </StaggeredList>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'actividades' && (
                  <motion.div
                    key="actividades"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Actividades Extracurriculares</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <StaggeredList>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiActivity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">Club de Ciencias</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Participa activamente en experimentos y proyectos científicos
                              </p>
                              <p className="text-xs text-gray-500 mt-2">Martes y Jueves - 3:00 PM</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiAward className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">Equipo de Fútbol</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Miembro titular del equipo de fútbol del colegio
                              </p>
                              <p className="text-xs text-gray-500 mt-2">Lunes, Miércoles y Viernes - 4:00 PM</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiShield className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">Brigada Escolar</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Apoyo en actividades de seguridad y orden escolar
                              </p>
                              <p className="text-xs text-gray-500 mt-2">Durante horario escolar</p>
                            </div>
                          </div>
                        </div>
                      </StaggeredList>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Modal de Fotocheck */}
        {showPhotocheck && (
          <PhotocheckTemplate
            student={student}
            qrCode={qrCode}
            onClose={() => setShowPhotocheck(false)}
            isOpen={showPhotocheck}
          />
        )}

        {/* Modal de Detalle de Nota */}
        {showGradeDetail && selectedGrade && (
          <GradeDetail
            grade={selectedGrade}
            onClose={() => {
              setShowGradeDetail(false)
              setSelectedGrade(null)
            }}
          />
        )}
      </div>
    </PageTransition>
  )
}

export default Profile