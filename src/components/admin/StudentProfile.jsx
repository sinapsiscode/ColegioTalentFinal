import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  FiPrinter,
  FiGrid,
  FiHome,
  FiPhone,
  FiMail
} from 'react-icons/fi'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import useStudentsStore from '../../stores/studentsStore'
import useAttendanceStore from '../../stores/attendanceStore'
import useGradesStore from '../../stores/gradesStore'
import useTutorStore from '../../stores/tutorStore'
import useAdminUsersStore from '../../stores/adminUsersStore'
import AnimatedButton from '../common/AnimatedButton'
import GradeDetail from '../grades/GradeDetail'
import { generatePhotocheckPDFDirect } from '../../utils/pdfGenerator'
import { showSuccess, showError } from '../../utils/sweetAlert'

const StudentProfile = ({ studentId, onClose }) => {
  const [activeTab, setActiveTab] = useState('general')
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [showGradeDetail, setShowGradeDetail] = useState(false)
  const [attendanceFilter, setAttendanceFilter] = useState('all')
  const [qrCode, setQrCode] = useState(null)

  // Obtener estudiante del adminUsersStore primero
  const adminStudent = useAdminUsersStore(state => state.usuarios?.find(u => u.id === studentId))
  
  // Buscar estudiante correspondiente en studentsStore por nombre
  const student = useStudentsStore(state => {
    if (!adminStudent) return null
    return state.alumnos?.find(s => 
      s.nombre.toLowerCase().includes(adminStudent.nombre.split(' ')[0].toLowerCase())
    )
  })
  
  // Combinar datos de ambos stores
  const studentData = student ? {
    ...student,
    ...adminStudent,
    nombre: student.nombre,
    apellidos: student.apellidos || adminStudent?.nombre?.split(' ').slice(1).join(' ') || '',
    grado: student.grado || adminStudent?.grado,
    seccion: student.seccion || adminStudent?.seccion || 'A',
    email: adminStudent?.email || student.email,
    activo: adminStudent?.estado === 'activo'
  } : adminStudent ? {
    ...adminStudent,
    nombre: adminStudent.nombre.split(' ')[0],
    apellidos: adminStudent.nombre.split(' ').slice(1).join(' '),
    codigoQR: `ST${adminStudent.id.toString().padStart(6, '0')}`,
    padre: adminStudent.tutor || 'No registrado',
    telefono: adminStudent.telefono || 'No registrado',
    seccion: adminStudent.seccion || 'A',
    activo: adminStudent.estado === 'activo'
  } : null
  
  // Usar el ID del estudiante encontrado o el original
  const effectiveStudentId = student?.id || studentId
  console.log("id student {}",effectiveStudentId);
  const attendanceRecords = useAttendanceStore(state => state.getStudentAttendance?.(effectiveStudentId) || [])
  const studentGrades = useGradesStore(state => state.getGradesByStudent?.(effectiveStudentId) || [])
  const tutorObservations = useTutorStore(state => 
    state.students?.find(s => s.id === effectiveStudentId)?.observations || []
  )

  // Generar QR code para el estudiante
  useEffect(() => {
    if (studentData) {
      generateQRCode()
    }
  }, [studentData])

  const generateQRCode = async () => {
    try {
      const QRCode = (await import('qrcode')).default
      const qrData = {
        id: studentData.id,
        codigo: studentData.codigoQR || `ST${studentData.id.toString().padStart(6, '0')}`,
        nombre: studentData.nombre,
        apellidos: studentData.apellidos,
        grado: studentData.grado,
        seccion: studentData.seccion
      }

      const dataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      })

      setQrCode({ dataURL, qrData })
    } catch (error) {
      console.error('Error generando QR:', error)
    }
  }

  // Calcular estadísticas de asistencia
  const attendanceStats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.estado === 'presente').length,
    late: attendanceRecords.filter(r => r.estado === 'tarde').length,
    absent: attendanceRecords.filter(r => r.estado === 'ausente').length,
    percentage: attendanceRecords.length > 0 
      ? ((attendanceRecords.filter(r => r.estado === 'presente' || r.estado === 'tarde').length / attendanceRecords.length) * 100).toFixed(1)
      : 0
  }

  // Calcular promedio general
  const generalAverage = studentGrades.length > 0
    ? (studentGrades.reduce((sum, grade) => sum + grade.promedio, 0) / studentGrades.length).toFixed(1)
    : 'N/A'

  // Filtrar registros de asistencia
  const filteredAttendance = attendanceRecords.filter(record => {
    if (attendanceFilter === 'all') return true
    return record.estado === attendanceFilter
  })

  const handleDownloadFotocheck = () => {
    try {
      if (studentData && qrCode) {
        generatePhotocheckPDFDirect(studentData, qrCode)
        showSuccess('Descarga exitosa', 'El fotocheck se ha descargado correctamente')
      }
    } catch (error) {
      showError('Error', 'No se pudo generar el fotocheck')
    }
  }

  if (!studentData) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 text-white bg-gradient-to-r from-blue-700 to-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full">
                <FiUser className="w-8 h-8 text-blue-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{studentData.nombre} {studentData.apellidos}</h2>
                <p className="text-blue-100">{studentData.grado} - Sección {studentData.seccion}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white transition-colors hover:text-gray-200"
            >
              <FiXCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-6 space-x-1">
            {['general', 'asistencia', 'notas', 'observaciones'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Tab General */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Información Personal */}
              <div className="space-y-6 lg:col-span-2">
                <div className="p-6 rounded-lg bg-gray-50">
                  <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                    <FiUser className="mr-2" /> Información Personal
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Código de estudiante</p>
                      <p className="font-medium">{studentData.codigoQR || `ST${studentData.id.toString().padStart(6, '0')}`}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de nacimiento</p>
                      <p className="font-medium">
                        {studentData.fechaNacimiento 
                          ? format(new Date(studentData.fechaNacimiento), 'dd/MM/yyyy')
                          : 'No registrada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        studentData.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {studentData.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Promedio General</p>
                      <p className="text-lg font-medium">{generalAverage}</p>
                    </div>
                  </div>
                </div>

                {/* Información del Padre/Tutor */}
                <div className="p-6 rounded-lg bg-gray-50">
                  <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                    <FiHome className="mr-2" /> Información del Padre/Tutor
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FiUser className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Nombre</p>
                        <p className="font-medium">{studentData.padre || 'No registrado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FiPhone className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-medium">{studentData.telefono || 'No registrado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FiMail className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{studentData.email || 'No registrado'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas Rápidas */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 text-center rounded-lg bg-blue-50">
                    <FiCalendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-900">{attendanceStats.percentage}%</p>
                    <p className="text-sm text-blue-700">Asistencia</p>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-green-50">
                    <FiBook className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-900">{studentGrades.length}</p>
                    <p className="text-sm text-green-700">Cursos</p>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-purple-50">
                    <FiTrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold text-purple-900">{generalAverage}</p>
                    <p className="text-sm text-purple-700">Promedio</p>
                  </div>
                </div>
              </div>

              {/* QR Code y Acciones */}
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-gray-50">
                  <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                    <FiGrid className="mr-2" /> Código QR
                  </h3>
                  {qrCode && (
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <img src={qrCode.dataURL} alt="QR Code" className="w-48 h-48" />
                      </div>
                      <p className="mt-2 font-mono text-sm text-gray-600">
                        {qrCode.qrData.codigo}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <AnimatedButton
                    variant="primary"
                    icon={FiDownload}
                    onClick={handleDownloadFotocheck}
                    className="w-full"
                  >
                    Descargar Fotocheck
                  </AnimatedButton>
                  <AnimatedButton
                    variant="outline"
                    icon={FiPrinter}
                    className="w-full"
                  >
                    Imprimir Perfil
                  </AnimatedButton>
                </div>
              </div>
            </div>
          )}

          {/* Tab Asistencia */}
          {activeTab === 'asistencia' && (
            <div>
              {/* Estadísticas de Asistencia */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold text-green-900">{attendanceStats.present}</p>
                      <p className="text-sm text-green-700">Presente</p>
                    </div>
                    <FiCheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold text-yellow-900">{attendanceStats.late}</p>
                      <p className="text-sm text-yellow-700">Tarde</p>
                    </div>
                    <FiClock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold text-red-900">{attendanceStats.absent}</p>
                      <p className="text-sm text-red-700">Ausente</p>
                    </div>
                    <FiXCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold text-blue-900">{attendanceStats.percentage}%</p>
                      <p className="text-sm text-blue-700">Asistencia</p>
                    </div>
                    <FiTrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex mb-4 space-x-2">
                <button
                  onClick={() => setAttendanceFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    attendanceFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setAttendanceFilter('presente')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    attendanceFilter === 'presente'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Presente
                </button>
                <button
                  onClick={() => setAttendanceFilter('tarde')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    attendanceFilter === 'tarde'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tarde
                </button>
                <button
                  onClick={() => setAttendanceFilter('ausente')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    attendanceFilter === 'ausente'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ausente
                </button>
              </div>

              {/* Lista de Asistencias */}
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Historial de Asistencia</h3>
                <div className="space-y-3 overflow-y-auto max-h-96">
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record) => (
                      <div key={record.id} className="p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              record.estado === 'presente' ? 'bg-green-500' :
                              record.estado === 'tarde' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                            <div>
                              <p className="font-medium">
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
                          <p className="mt-2 text-sm italic text-gray-600">
                            {record.observaciones}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="py-8 text-center text-gray-500">
                      No hay registros de asistencia para mostrar
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab Notas */}
          {activeTab === 'notas' && (
            <div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {studentGrades.length > 0 ? (
                  studentGrades.map((grade) => (
                    <div
                      key={grade.id}
                      className="transition-shadow bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md"
                      onClick={() => {
                        setSelectedGrade(grade)
                        setShowGradeDetail(true)
                      }}
                    >
                      <div className="p-4">
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
                        <p className="mb-2 text-sm text-gray-600">
                          Profesor: {grade.profesor}
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Evaluaciones:</span>
                            <span className="font-medium">{grade.evaluaciones.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Bimestre:</span>
                            <span className="font-medium">{grade.bimestre}</span>
                          </div>
                        </div>
                        <div className="pt-3 mt-3 border-t">
                          <div className="w-full h-2 bg-gray-200 rounded-full">
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
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center col-span-full">
                    <FiBook className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500">No hay notas registradas para este estudiante</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Observaciones */}
          {activeTab === 'observaciones' && (
            <div className="space-y-4">
              {tutorObservations.length > 0 ? (
                tutorObservations.map((observation, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900">{observation.texto}</p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                          <span>Por: {observation.autor}</span>
                          <span>•</span>
                          <span>{format(parseISO(observation.fecha), 'dd/MM/yyyy', { locale: es })}</span>
                        </div>
                      </div>
                      <FiAlertCircle className="w-5 h-5 ml-3 text-gray-400" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <FiAlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No hay observaciones registradas para este estudiante</p>
                </div>
              )}
            </div>
          )}
        </div>

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
      </motion.div>
    </div>
  )
}

export default StudentProfile