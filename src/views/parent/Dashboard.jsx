import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  FiUsers, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock,
  FiMessageSquare,
  FiFileText,
  FiBarChart,
  FiCalendar
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import useAuthStore from '../../stores/authStore'
import useStudentsStore from '../../stores/studentsStore'
import useAttendanceStore from '../../stores/attendanceStore'
import useMessagesStore from '../../stores/messagesStore'
import useNotificationsStore from '../../stores/notificationsStore'
import { alumnosMock } from '../../data/mockData'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import StaggeredList from '../../components/common/StaggeredList'
import CountUpNumber from '../../components/common/CountUpNumber'
// import RealTimeCounter from '../../components/common/RealTimeCounter' // Comentado - requiere react-countup
// import useRealTimeUpdates from '../../hooks/useRealTimeUpdates' // Comentado temporalmente

const Dashboard = () => {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { alumnos, cargarAlumnos, obtenerAlumnosPorPadreId } = useStudentsStore()
  const { registrosAsistencia, cargarRegistrosAsistencia, obtenerEstadisticasAsistencia } = useAttendanceStore()
  const { mensajesNoLeidos, cargarConversaciones } = useMessagesStore()
  const { comunicadosNoLeidos } = useNotificationsStore()
  
  // Estado para valores anteriores (para mostrar tendencias)
  const [previousValues, setPreviousValues] = useState({
    asistencia: 0,
    mensajes: 0,
    comunicados: 0
  })
  
  // Hook para actualizaciones en tiempo real
  // const { lastUpdate, isUpdating, forceUpdate } = useRealTimeUpdates(20000) // Actualizar cada 20 segundos
  
  useEffect(() => {
    cargarAlumnos()
    cargarRegistrosAsistencia()
    cargarConversaciones()
    
    // Solicitar permisos de notificación al cargar
    const notificationsStore = useNotificationsStore.getState()
    notificationsStore.requestNotificationPermission()
    
    // Simular mensaje entrante después de 5 segundos (solo para demo)
    const timer = setTimeout(() => {
      // Simular mensaje de la tutora
      notificationsStore.agregarNotificacion({
        tipo: 'mensaje',
        titulo: '💬 Nueva mensaje de María García',
        mensaje: 'Buenos días, quería informarle sobre el excelente desempeño de Ana...',
        priority: 'media',
        actionUrl: '/parent/messages'
      })
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [cargarAlumnos, cargarRegistrosAsistencia, cargarConversaciones])
  
  // Actualizar valores anteriores cuando cambien los actuales
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousValues({
        asistencia: resumenAsistencia.porcentaje,
        mensajes: mensajesNoLeidos,
        comunicados: parseInt(comunicadosNoLeidos) || 5
      })
    }, 10000) // Actualizar valores anteriores después de 10 segundos
    
    return () => clearTimeout(timer)
  }, []) // Removido lastUpdate de las dependencias
  
  // Obtener hijos del padre usando ID (arquitectura profesional)
  const hijosDelPadre = usuario?.id ? obtenerAlumnosPorPadreId(usuario.id) : []
  
  const obtenerResumenAsistencia = () => {
    let totalPresentes = 0
    let totalClases = 0
    
    hijosDelPadre.forEach(hijo => {
      const stats = obtenerEstadisticasAsistencia(hijo.id)
      totalPresentes += stats.presentes + stats.tardes
      totalClases += stats.total
    })
    
    return {
      porcentaje: totalClases > 0 ? Math.round((totalPresentes / totalClases) * 100) : 0,
      presentes: totalPresentes,
      total: totalClases
    }
  }
  
  const resumenAsistencia = obtenerResumenAsistencia()
  
  const tarjetas = [
    {
      titulo: 'Mis Hijos',
      valor: hijosDelPadre.length,
      icono: FiUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      accion: () => {
        console.log('🖱️ Navegando a Mis Hijos...')
        navigate('/parent/students')
      }
    },
    {
      titulo: 'Asistencia',
      valor: `${resumenAsistencia.porcentaje}%`,
      icono: FiCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      accion: () => navigate('/parent/attendance')
    },
    {
      titulo: 'Mensajes',
      valor: mensajesNoLeidos,
      icono: FiMessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      accion: () => navigate('/parent/messages')
    },
    {
      titulo: 'Comunicados',
      valor: '5 nuevos',
      icono: FiFileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      accion: () => navigate('/parent/communiques')
    }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, {usuario?.nombre}
          </h1>
          <p className="text-gray-600">
            Resumen del progreso académico de tus hijos
          </p>
        </motion.div>
        
        {/* Tarjetas de resumen con actualizaciones en tiempo real */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Mis Hijos */}
          <AnimatedCard delay={0} onClick={() => navigate('/parent/students')}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mis Hijos</p>
                  <CountUpNumber value={hijosDelPadre.length} className="text-2xl font-bold text-gray-900 mt-1" />
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>
          
          {/* Asistencia */}
          <AnimatedCard delay={0.1} onClick={() => navigate('/parent/attendance')}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Asistencia</p>
                  <CountUpNumber value={resumenAsistencia.porcentaje} className="text-2xl font-bold text-gray-900 mt-1" suffix="%" />
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>
          
          {/* Mensajes */}
          <AnimatedCard delay={0.2} onClick={() => navigate('/parent/messages')}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mensajes sin leer</p>
                  <CountUpNumber value={mensajesNoLeidos} className="text-2xl font-bold text-gray-900 mt-1" />
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiMessageSquare className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>
          
          {/* Comunicados */}
          <AnimatedCard delay={0.3} onClick={() => navigate('/parent/communiques')}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Comunicados nuevos</p>
                  <CountUpNumber value={5} className="text-2xl font-bold text-gray-900 mt-1" />
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FiFileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        {/* Indicador de última actualización */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-end mb-4 text-xs text-gray-500"
        >
          {/* Comentado - requiere useRealTimeUpdates
          {isUpdating && (
            <div className="flex items-center space-x-2 mr-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <span>Actualizando...</span>
            </div>
          )}
          */}
          <span>Última actualización: {new Date().toLocaleTimeString()}</span>
          {/* Comentado - requiere forceUpdate
          <button
            onClick={forceUpdate}
            className="ml-2 text-talentos-primary hover:text-talentos-secondary transition-colors"
          >
            Actualizar ahora
          </button>
          */}
        </motion.div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Lista de hijos */}
          <AnimatedCard delay={0.4}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Hijos</h2>
            <div className="space-y-4">
              {hijosDelPadre.map((hijo, index) => {
                const stats = obtenerEstadisticasAsistencia(hijo.id)
                return (
                  <motion.div
                    key={hijo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onClick={() => navigate(`/parent/profile/${hijo.id}`)}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  >
                    <div className="w-12 h-12 bg-talentos-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {hijo.nombre.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{hijo.nombreCompleto}</h3>
                      <p className="text-sm text-gray-600">{hijo.grado} - Sección {hijo.seccion}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stats.porcentajeAsistencia >= 90 
                          ? 'bg-green-100 text-green-800'
                          : stats.porcentajeAsistencia >= 80
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {stats.porcentajeAsistencia}% asistencia
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatedCard>
          
          {/* Actividad reciente */}
          <AnimatedCard delay={0.6}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              <motion.div 
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                whileHover={{ x: 5 }}
                onClick={() => navigate('/parent/attendance')}
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Ana llegó al colegio</p>
                  <p className="text-xs text-gray-500">Hoy a las 7:45 AM</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                whileHover={{ x: 5 }}
                onClick={() => navigate('/parent/messages')}
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FiMessageSquare className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nuevo mensaje de la profesora María</p>
                  <p className="text-xs text-gray-500">Hace 2 horas</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                whileHover={{ x: 5 }}
                onClick={() => navigate('/parent/grades')}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiBarChart className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nuevas calificaciones disponibles</p>
                  <p className="text-xs text-gray-500">Ayer a las 3:30 PM</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                whileHover={{ x: 5 }}
                onClick={() => navigate('/parent/communiques')}
              >
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <FiFileText className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Comunicado sobre reunión de padres</p>
                  <p className="text-xs text-gray-500">Hace 3 días</p>
                </div>
              </motion.div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <AnimatedButton 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/parent/notifications')}
              >
                Ver toda la actividad
              </AnimatedButton>
            </div>
          </AnimatedCard>
        </div>
        
        {/* Accesos rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { titulo: 'Ver Asistencia', icono: FiCalendar, ruta: '/parent/attendance' },
              { titulo: 'Mensajes', icono: FiMessageSquare, ruta: '/parent/messages' },
              { titulo: 'Calificaciones', icono: FiBarChart, ruta: '/parent/grades' },
              { titulo: 'Comunicados', icono: FiFileText, ruta: '/parent/communiques' }
            ].map((acceso, index) => {
              const Icono = acceso.icono
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(acceso.ruta)}
                  className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <Icono className="w-8 h-8 text-talentos-primary mb-2" />
                  <span className="text-sm font-medium text-gray-900">{acceso.titulo}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Dashboard