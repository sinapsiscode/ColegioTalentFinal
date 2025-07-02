import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiUsers, 
  FiBookOpen, 
  FiCalendar, 
  FiMessageSquare,
  FiClock,
  FiRefreshCw,
  FiPlus,
  FiEye
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import Header from '../../components/common/Header'
import useTutorStore from '../../stores/tutorStore'
import useAuthStore from '../../stores/authStore'

import StudentCard from '../../components/tutor/StudentCard'
import ClassCard from '../../components/tutor/ClassCard'
import ActivityCard from '../../components/tutor/ActivityCard'
import TutorStats from '../../components/tutor/TutorStats'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import AnimatedButton from '../../components/common/AnimatedButton'
import { showSuccess, showError, showInput } from '../../utils/sweetAlert'

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

  const [filtroEstudiantes, setFiltroEstudiantes] = useState('todos')
  const [mostrarTodasActividades, setMostrarTodasActividades] = useState(false)

  // Cargar datos al montar
  useEffect(() => {
    cargarDashboard()
  }, [cargarDashboard])

  // Handlers
  const handleViewStudentDetails = (estudiante) => {
    showSuccess('Ver Perfil', `Abriendo perfil de ${estudiante.nombre}`)
    // Aquí se abriría el modal o vista de detalles del estudiante
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
    showSuccess('Iniciar Clase', `Iniciando clase de ${clase.materia} - ${clase.grado}`)
    // Aquí se abriría la interfaz de gestión de clase
  }

  const handleViewClassDetails = (clase) => {
    showSuccess('Detalles de Clase', `Mostrando detalles de ${clase.materia}`)
    // Aquí se abriría el modal de detalles de la clase
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
    cargarDashboard()
    showSuccess('Dashboard actualizado', 'Los datos han sido actualizados')
  }

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter(estudiante => {
    if (filtroEstudiantes === 'activos') return estudiante.estado === 'activo'
    if (filtroEstudiantes === 'atencion') return estudiante.estado === 'necesita_atencion'
    return true
  })

  // Obtener estadísticas
  const estadisticas = obtenerEstadisticas()
  const actividadesUrgentes = obtenerActividadesPorPrioridad('alta')
  const proximasClases = obtenerProximasClases()

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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del dashboard */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard del Tutor</h1>
            <p className="text-gray-600 mt-1">
              Bienvenido {tutor.nombre} - {tutor.especialidad} | {tutor.grado} Sección {tutor.seccion}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
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
        <TutorStats estadisticas={estadisticas} loading={cargando} />

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Columna izquierda - Estudiantes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mis Estudiantes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <FiUsers className="w-5 h-5" />
                  <span>Mis Estudiantes ({estudiantesFiltrados.length})</span>
                </h2>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={filtroEstudiantes}
                    onChange={(e) => setFiltroEstudiantes(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                  >
                    <option value="todos">Todos</option>
                    <option value="activos">Activos</option>
                    <option value="atencion">Necesitan Atención</option>
                  </select>
                </div>
              </div>
              
              {estudiantesFiltrados.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay estudiantes que mostrar</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Clases de Hoy */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FiBookOpen className="w-5 h-5" />
                <span>Clases de Hoy ({clasesHoy.length})</span>
              </h2>
              
              {clasesHoy.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay clases programadas para hoy</p>
                </div>
              ) : (
                <div className="space-y-4">
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <FiClock className="w-5 h-5" />
                <span>Actividades Pendientes</span>
              </h2>
              
              <button
                onClick={() => setMostrarTodasActividades(!mostrarTodasActividades)}
                className="text-sm text-talentos-primary hover:text-talentos-secondary transition-colors duration-200"
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
                <div className="space-y-3">
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
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Todas las actividades */}
            <div className="space-y-3">
              {(mostrarTodasActividades ? actividades : actividades.slice(0, 3))
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
            
            {actividades.filter(act => !act.completado).length === 0 && (
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
          className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnimatedButton
              variant="outline"
              icon={FiMessageSquare}
              onClick={() => navigate('/tutor/messages')}
              className="justify-center"
            >
              Mensajes
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              icon={FiCalendar}
              onClick={() => navigate('/tutor/communiques')}
              className="justify-center"
            >
              Comunicados
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              icon={FiUsers}
              onClick={() => showSuccess('Próximamente', 'Función en desarrollo')}
              className="justify-center"
            >
              Reportes
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              icon={FiPlus}
              onClick={() => showSuccess('Próximamente', 'Función en desarrollo')}
              className="justify-center"
            >
              Nueva Actividad
            </AnimatedButton>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Dashboard