import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiArrowLeft, 
  FiUser, 
  FiCalendar, 
  FiMapPin, 
  FiPhone,
  FiMail,
  FiActivity,
  FiAward,
  FiBookOpen,
  FiClock,
  FiFileText,
  FiDownload,
  FiAlertCircle,
  FiHeart,
  FiTarget,
  FiTrendingUp,
  FiEdit3
} from 'react-icons/fi'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

import Header from '../../components/common/Header'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useStudentsStore from '../../stores/studentsStore'
import useGradesStore from '../../stores/gradesStore'
import useAttendanceStore from '../../stores/attendanceStore'
import useAuthStore from '../../stores/authStore'
import { showSuccess, showError } from '../../utils/sweetAlert'
import { generateStudentProfilePDF } from '../../utils/pdfGenerator'

const StudentProfile = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  
  const { alumnos, obtenerAlumnoPorId } = useStudentsStore()
  const { calificaciones, cargarCalificacionesPorAlumno } = useGradesStore()
  const { registros, obtenerEstadisticasAsistencia } = useAttendanceStore()
  
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [studentData, setStudentData] = useState(null)
  
  // Cargar datos del estudiante
  useEffect(() => {
    const loadStudentData = async () => {
      setLoading(true)
      try {
        const student = obtenerAlumnoPorId(parseInt(studentId))
        if (!student) {
          showError('Error', 'Estudiante no encontrado')
          navigate('/parent/students')
          return
        }
        
        // Cargar calificaciones
        await cargarCalificacionesPorAlumno(student.id)
        
        setStudentData(student)
      } catch (error) {
        console.error('Error cargando datos:', error)
        showError('Error', 'No se pudieron cargar los datos del estudiante')
      } finally {
        setLoading(false)
      }
    }
    
    loadStudentData()
  }, [studentId])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }
  
  if (!studentData) {
    return null
  }
  
  // Calcular estadísticas
  const attendanceStats = obtenerEstadisticasAsistencia(studentData.id)
  const studentGrades = calificaciones.filter(c => c.alumnoId === studentData.id)
  const averageGrade = studentGrades.length > 0 
    ? (studentGrades.reduce((sum, g) => sum + g.nota, 0) / studentGrades.length).toFixed(1)
    : 0
    
  // Datos para gráficos
  const gradesBySubject = [
    { subject: 'Matemáticas', grade: 18, average: 16 },
    { subject: 'Comunicación', grade: 17, average: 15 },
    { subject: 'Ciencias', grade: 19, average: 17 },
    { subject: 'Historia', grade: 16, average: 15 },
    { subject: 'Ed. Física', grade: 20, average: 18 },
    { subject: 'Arte', grade: 18, average: 16 }
  ]
  
  const attendanceByMonth = [
    { month: 'Ene', attendance: 95 },
    { month: 'Feb', attendance: 98 },
    { month: 'Mar', attendance: 92 },
    { month: 'Abr', attendance: 100 },
    { month: 'May', attendance: 96 },
    { month: 'Jun', attendance: 94 }
  ]
  
  const skillsData = [
    { skill: 'Responsabilidad', value: 90 },
    { skill: 'Participación', value: 85 },
    { skill: 'Trabajo en equipo', value: 95 },
    { skill: 'Creatividad', value: 80 },
    { skill: 'Liderazgo', value: 75 },
    { skill: 'Comunicación', value: 88 }
  ]
  
  // Información médica (mock)
  const medicalInfo = {
    bloodType: 'O+',
    allergies: ['Polen', 'Maní'],
    medications: ['Ninguno'],
    emergencyContact: {
      name: 'María Rodríguez',
      relation: 'Madre',
      phone: '+51 987 654 321'
    },
    lastCheckup: '2024-01-15',
    vaccines: [
      { name: 'COVID-19', date: '2023-12-01', status: 'Completa' },
      { name: 'Influenza', date: '2024-03-15', status: 'Completa' },
      { name: 'Hepatitis B', date: '2023-06-20', status: 'Completa' }
    ]
  }
  
  // Timeline de actividades
  const timeline = [
    {
      date: '2024-07-24',
      type: 'achievement',
      title: 'Premio al Mejor Estudiante',
      description: 'Reconocimiento por excelente rendimiento académico'
    },
    {
      date: '2024-07-20',
      type: 'academic',
      title: 'Examen de Matemáticas',
      description: 'Calificación: 19/20'
    },
    {
      date: '2024-07-15',
      type: 'activity',
      title: 'Participación en Feria de Ciencias',
      description: 'Proyecto sobre energías renovables'
    },
    {
      date: '2024-07-10',
      type: 'attendance',
      title: 'Asistencia Perfecta',
      description: 'Completó un mes sin faltas ni tardanzas'
    }
  ]
  
  const handleExportProfile = async () => {
    try {
      await generateStudentProfilePDF({
        student: studentData,
        grades: studentGrades,
        attendance: attendanceStats,
        medical: medicalInfo,
        timeline: timeline
      })
      showSuccess('Perfil exportado', 'El perfil se ha descargado en PDF')
    } catch (error) {
      showError('Error', 'No se pudo exportar el perfil')
    }
  }
  
  const renderGeneralTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Información Personal */}
      <div className="lg:col-span-1">
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-4">
              {studentData.foto ? (
                <img src={studentData.foto} alt={studentData.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiUser className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {studentData.nombre} {studentData.apellidos}
            </h2>
            <p className="text-gray-600">{studentData.grado} - Sección {studentData.seccion}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <FiCalendar className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {new Date(studentData.fecha_nacimiento).toLocaleDateString('es-PE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <FiMapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{studentData.direccion}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <FiUser className="w-4 h-4 mr-2" />
              <span className="text-sm">Código: {studentData.codigo_qr}</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-gray-700 mb-3">Contacto de Emergencia</h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">{medicalInfo.emergencyContact.name}</span>
                <span className="text-gray-500"> ({medicalInfo.emergencyContact.relation})</span>
              </p>
              <div className="flex items-center text-gray-600">
                <FiPhone className="w-4 h-4 mr-2" />
                <span>{medicalInfo.emergencyContact.phone}</span>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
      
      {/* Estadísticas y Gráficos */}
      <div className="lg:col-span-2 space-y-6">
        {/* Resumen de Rendimiento */}
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Rendimiento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{averageGrade}</div>
              <p className="text-sm text-gray-600">Promedio General</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{attendanceStats.porcentajeAsistencia}%</div>
              <p className="text-sm text-gray-600">Asistencia</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">5</div>
              <p className="text-sm text-gray-600">Reconocimientos</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">A+</div>
              <p className="text-sm text-gray-600">Conducta</p>
            </div>
          </div>
          
          {/* Gráfico de Calificaciones por Materia */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Calificaciones por Materia</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gradesBySubject}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Bar dataKey="grade" fill="#3B82F6" name="Calificación" />
                <Bar dataKey="average" fill="#E5E7EB" name="Promedio Salón" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>
        
        {/* Habilidades */}
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Evaluación de Habilidades</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillsData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Habilidades"
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </AnimatedCard>
      </div>
    </div>
  )
  
  const renderAcademicTab = () => (
    <div className="space-y-6">
      {/* Historial de Calificaciones */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Calificaciones</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materia
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  I Bim
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  II Bim
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  III Bim
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IV Bim
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promedio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gradesBySubject.map((subject) => (
                <tr key={subject.subject}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subject.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                    17
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                    18
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                    {subject.grade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-900">
                    {((17 + 18 + subject.grade) / 3).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
      
      {/* Progreso Académico */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Progreso Académico</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[
            { bimestre: 'I Bim', promedio: 16.5 },
            { bimestre: 'II Bim', promedio: 17.2 },
            { bimestre: 'III Bim', promedio: 18.1 },
            { bimestre: 'IV Bim', promedio: null }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bimestre" />
            <YAxis domain={[10, 20]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="promedio"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </AnimatedCard>
    </div>
  )
  
  const renderAttendanceTab = () => (
    <div className="space-y-6">
      {/* Estadísticas de Asistencia */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedCard className="p-6 text-center">
          <FiClock className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{attendanceStats.presentes}</div>
          <p className="text-sm text-gray-600">Días Presentes</p>
        </AnimatedCard>
        
        <AnimatedCard className="p-6 text-center">
          <FiAlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{attendanceStats.tardes}</div>
          <p className="text-sm text-gray-600">Tardanzas</p>
        </AnimatedCard>
        
        <AnimatedCard className="p-6 text-center">
          <FiCalendar className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{attendanceStats.faltas}</div>
          <p className="text-sm text-gray-600">Faltas</p>
        </AnimatedCard>
        
        <AnimatedCard className="p-6 text-center">
          <FiTrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{attendanceStats.porcentajeAsistencia}%</div>
          <p className="text-sm text-gray-600">Asistencia Total</p>
        </AnimatedCard>
      </div>
      
      {/* Gráfico de Asistencia por Mes */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Asistencia por Mes</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={attendanceByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[80, 100]} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </AnimatedCard>
      
      {/* Calendario de Asistencia */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Registro Detallado - Julio 2024</h3>
        <div className="grid grid-cols-7 gap-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1
            const isWeekend = (i + 1) % 7 === 0 || (i + 2) % 7 === 0
            const status = isWeekend ? 'weekend' : day === 15 ? 'absent' : day === 8 ? 'late' : 'present'
            
            return (
              <div
                key={i}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-sm
                  ${status === 'present' ? 'bg-green-100 text-green-800' :
                    status === 'absent' ? 'bg-red-100 text-red-800' :
                    status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-50 text-gray-400'}
                `}
              >
                {day}
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
            <span className="text-gray-600">Presente</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 rounded mr-2"></div>
            <span className="text-gray-600">Tardanza</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
            <span className="text-gray-600">Falta</span>
          </div>
        </div>
      </AnimatedCard>
    </div>
  )
  
  const renderMedicalTab = () => (
    <div className="space-y-6">
      {/* Información Médica Básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiHeart className="w-5 h-5 mr-2 text-red-500" />
            Información Médica
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Tipo de Sangre</p>
              <p className="text-lg font-medium text-gray-800">{medicalInfo.bloodType}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Alergias</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {medicalInfo.allergies.map((allergy) => (
                  <span key={allergy} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Medicamentos</p>
              <p className="text-gray-800">{medicalInfo.medications.join(', ')}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Último Chequeo</p>
              <p className="text-gray-800">
                {new Date(medicalInfo.lastCheckup).toLocaleDateString('es-PE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </AnimatedCard>
        
        {/* Historial de Vacunas */}
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiActivity className="w-5 h-5 mr-2 text-green-500" />
            Vacunas
          </h3>
          
          <div className="space-y-3">
            {medicalInfo.vaccines.map((vaccine) => (
              <div key={vaccine.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{vaccine.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(vaccine.date).toLocaleDateString('es-PE')}
                  </p>
                </div>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${vaccine.status === 'Completa' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                `}>
                  {vaccine.status}
                </span>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>
      
      {/* Notas Médicas */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Observaciones Médicas</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota importante:</strong> El estudiante es alérgico al maní. 
            Por favor, tener precaución con los alimentos en actividades escolares.
          </p>
        </div>
      </AnimatedCard>
    </div>
  )
  
  const renderTimelineTab = () => (
    <div className="space-y-6">
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Línea de Tiempo - Actividades Recientes</h3>
        
        <div className="space-y-6">
          {timeline.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex space-x-4"
            >
              <div className="flex-shrink-0">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${event.type === 'achievement' ? 'bg-yellow-100' :
                    event.type === 'academic' ? 'bg-blue-100' :
                    event.type === 'activity' ? 'bg-green-100' :
                    'bg-purple-100'}
                `}>
                  {event.type === 'achievement' ? <FiAward className="w-5 h-5 text-yellow-600" /> :
                   event.type === 'academic' ? <FiBookOpen className="w-5 h-5 text-blue-600" /> :
                   event.type === 'activity' ? <FiActivity className="w-5 h-5 text-green-600" /> :
                   <FiClock className="w-5 h-5 text-purple-600" />}
                </div>
              </div>
              
              <div className="flex-1 pb-6 border-l-2 border-gray-200 pl-4 ml-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{event.title}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedCard>
      
      {/* Logros y Reconocimientos */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Logros y Reconocimientos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-3">
              <FiAward className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-800">Mejor Estudiante del Mes</p>
                <p className="text-sm text-gray-600">Julio 2024</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <FiTarget className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-800">Excelencia Académica</p>
                <p className="text-sm text-gray-600">II Bimestre 2024</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <FiActivity className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-gray-800">Participación Destacada</p>
                <p className="text-sm text-gray-600">Feria de Ciencias 2024</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-3">
              <FiHeart className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-medium text-gray-800">Compañerismo</p>
                <p className="text-sm text-gray-600">Reconocimiento especial</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  )
  
  const tabs = [
    { id: 'general', label: 'General', icon: FiUser },
    { id: 'academic', label: 'Académico', icon: FiBookOpen },
    { id: 'attendance', label: 'Asistencia', icon: FiCalendar },
    { id: 'medical', label: 'Salud', icon: FiHeart },
    { id: 'timeline', label: 'Actividades', icon: FiActivity }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header con navegación */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/parent/students')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Volver a Estudiantes
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Perfil de {studentData.nombre} {studentData.apellidos}
              </h1>
              <p className="text-gray-600">Vista completa del estudiante</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <AnimatedButton
                onClick={handleExportProfile}
                icon={FiDownload}
                variant="primary"
              >
                Exportar Perfil PDF
              </AnimatedButton>
            </div>
          </div>
        </div>
        
        {/* Tabs de navegación */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap
                      border-b-2 transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* Contenido de las tabs */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'academic' && renderAcademicTab()}
          {activeTab === 'attendance' && renderAttendanceTab()}
          {activeTab === 'medical' && renderMedicalTab()}
          {activeTab === 'timeline' && renderTimelineTab()}
        </motion.div>
      </div>
    </div>
  )
}

export default StudentProfile