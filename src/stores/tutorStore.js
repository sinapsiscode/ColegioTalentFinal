import { create } from 'zustand'
import { DatabaseQueries } from '../data/databaseSchema'

const useTutorStore = create((set, get) => ({
  // Datos del tutor (se cargarán dinámicamente)
  tutor: {},

  // Estudiantes a cargo
  estudiantes: [],
  
  // Clases del día
  clasesHoy: [],
  
  // Actividades pendientes
  actividades: [],
  
  // Mensajes no leídos
  mensajesNoLeidos: 0,
  
  // Estado de carga
  cargando: false,

  // Cargar datos del dashboard
  cargarDashboard: (tutorId) => {
    set({ cargando: true })
    
    setTimeout(() => {
      // Obtener información del tutor actual
      const tutorActual = tutorId ? DatabaseQueries.getUserById(tutorId) : {
        id: 2001,
        nombre: 'María',
        apellidos: 'García',
        especialidad: 'Matemáticas',
        avatar: '/avatar-teacher.jpg'
      }
      
      // Obtener estudiantes asignados al tutor directamente - Siempre actualizado
      const estudiantesAsignados = tutorId ? DatabaseQueries.getStudentsByTeacherId(tutorId) : []
      
      // Obtener grados únicos
      const gradosUnicos = [...new Set(estudiantesAsignados.map(e => e.grado))]
      
      // Mapear estudiantes asignados al formato del dashboard o usar datos por defecto
      const estudiantes = estudiantesAsignados.length > 0 ? estudiantesAsignados.map((est, index) => ({
        id: est.id,
        nombre: `${est.nombre} ${est.apellidos}`,
        foto: est.foto || '/avatar-student.jpg',
        promedio: null, // Las calificaciones se cargarían del store de grades
        asistencia: 90 + Math.floor(Math.random() * 10), // Simulado
        estado: index === 5 ? 'necesita_atencion' : 'activo',
        ultimaClase: new Date(),
        observaciones: 'Sin observaciones registradas',
        grado: est.grado,
        seccion: est.seccion,
        codigo: est.codigo_qr
      })) : [
        {
          id: 1,
          nombre: 'Ana Sofía Rodríguez',
          foto: '/avatar-student1.jpg',
          promedio: 18.5,
          asistencia: 96,
          estado: 'activo',
          ultimaClase: new Date('2024-01-22T10:00:00'),
          observaciones: 'Estudiante destacada, muy participativa'
        },
        {
          id: 2,
          nombre: 'Carlos Alberto Mendoza',
          foto: '/avatar-student2.jpg',
          promedio: null, // Sin calificaciones asignadas por profesor
          asistencia: 92,
          estado: 'activo',
          ultimaClase: new Date('2024-01-22T10:00:00'),
          observaciones: 'Buen rendimiento, necesita refuerzo en geometría'
        },
        {
          id: 3,
          nombre: 'Lucía Fernanda Torres',
          foto: '/avatar-student3.jpg',
          promedio: null, // Sin calificaciones asignadas por profesor
          asistencia: 98,
          estado: 'activo',
          ultimaClase: new Date('2024-01-22T10:00:00'),
          observaciones: 'Excelente participación y responsabilidad'
        },
        {
          id: 4,
          nombre: 'Diego Alexander Vargas',
          foto: '/avatar-student4.jpg',
          promedio: null, // Sin calificaciones asignadas por profesor
          asistencia: 88,
          estado: 'activo',
          ultimaClase: new Date('2024-01-22T10:00:00'),
          observaciones: 'Necesita mejorar puntualidad y concentración'
        },
        {
          id: 5,
          nombre: 'Isabella María Santos',
          foto: '/avatar-student5.jpg',
          promedio: null, // Sin calificaciones asignadas por profesor
          asistencia: 100,
          estado: 'activo',
          ultimaClase: new Date('2024-01-22T10:00:00'),
          observaciones: 'Estudiante sobresaliente en todas las áreas'
        },
        {
          id: 6,
          nombre: 'Sebastián José Morales',
          foto: '/avatar-student6.jpg',
          promedio: null, // Sin calificaciones asignadas por profesor
          asistencia: 85,
          estado: 'necesita_atencion',
          ultimaClase: new Date('2024-01-22T10:00:00'),
          observaciones: 'Requiere apoyo adicional y seguimiento personalizado'
        }
      ]

      // Clases programadas para hoy - Actualizado con múltiples secciones
      const clasesHoy = [
        {
          id: 1,
          materia: 'Comunicación',
          grado: '3ro A',
          hora: '07:30 - 08:15',
          aula: 'A-101',
          tema: 'Comprensión Lectora',
          estado: 'completada',
          asistentes: 25,
          totalEstudiantes: 25
        },
        {
          id: 2,
          materia: 'Comunicación',
          grado: '3ro C',
          hora: '08:15 - 09:00',
          aula: 'A-103',
          tema: 'Comprensión Lectora',
          estado: 'completada',
          asistentes: 24,
          totalEstudiantes: 26
        },
        {
          id: 3,
          materia: 'Matemáticas',
          grado: '4to B',
          hora: '09:30 - 10:15',
          aula: 'A-204',
          tema: 'Fracciones',
          estado: 'completada',
          asistentes: 28,
          totalEstudiantes: 28
        },
        {
          id: 4,
          materia: 'Matemáticas',
          grado: '4to C',
          hora: '10:15 - 11:00',
          aula: 'A-205',
          tema: 'Fracciones',
          estado: 'en_curso',
          asistentes: 26,
          totalEstudiantes: 27
        },
        {
          id: 5,
          materia: 'Matemáticas',
          grado: '5to A',
          hora: '11:30 - 12:15',
          aula: 'A-301',
          tema: 'Decimales',
          estado: 'pendiente',
          asistentes: 0,
          totalEstudiantes: 29
        },
        {
          id: 6,
          materia: 'Matemáticas',
          grado: '5to B',
          hora: '12:15 - 13:00',
          aula: 'A-302',
          tema: 'Decimales',
          estado: 'pendiente',
          asistentes: 0,
          totalEstudiantes: 28
        },
        {
          id: 7,
          materia: 'Matemáticas',
          grado: '6to A',
          hora: '14:00 - 14:45',
          aula: 'A-401',
          tema: 'Geometría',
          estado: 'pendiente',
          asistentes: 0,
          totalEstudiantes: 30
        },
        {
          id: 8,
          materia: 'Matemáticas',
          grado: '6to B',
          hora: '14:45 - 15:30',
          aula: 'A-402',
          tema: 'Geometría',
          estado: 'pendiente',
          asistentes: 0,
          totalEstudiantes: 28
        }
      ]

      // Actividades y tareas pendientes
      const actividades = [
        {
          id: 1,
          tipo: 'calificacion',
          titulo: 'Revisar exámenes del II Bimestre',
          descripcion: 'Pendiente revisar y calificar 26 exámenes de matemáticas',
          fechaVencimiento: new Date('2024-01-25T23:59:59'),
          prioridad: 'alta',
          completado: false,
          progreso: 60
        },
        {
          id: 2,
          tipo: 'reunion',
          titulo: 'Reunión con padres de Diego Vargas',
          descripcion: 'Coordinar estrategias de apoyo académico',
          fechaVencimiento: new Date('2024-01-24T16:00:00'),
          prioridad: 'alta',
          completado: false,
          progreso: 0
        },
        {
          id: 3,
          tipo: 'planificacion',
          titulo: 'Preparar material para clase de geometría',
          descripcion: 'Crear presentación y ejercicios prácticos',
          fechaVencimiento: new Date('2024-01-26T08:00:00'),
          prioridad: 'media',
          completado: false,
          progreso: 30
        },
        {
          id: 4,
          tipo: 'reporte',
          titulo: 'Completar informe mensual de progreso',
          descripcion: 'Elaborar reporte de rendimiento de todos los estudiantes',
          fechaVencimiento: new Date('2024-01-30T17:00:00'),
          prioridad: 'media',
          completado: false,
          progreso: 10
        },
        {
          id: 5,
          tipo: 'comunicacion',
          titulo: 'Responder mensajes de padres de familia',
          descripcion: '3 mensajes pendientes de respuesta',
          fechaVencimiento: new Date('2024-01-23T18:00:00'),
          prioridad: 'alta',
          completado: false,
          progreso: 0
        }
      ]

      set({
        tutor: {
          id: tutorActual.id,
          nombre: tutorActual.nombre,
          apellidos: tutorActual.apellidos,
          especialidad: 'Matemáticas y Comunicación', // Actualizado para reflejar ambas materias
          grado: gradosUnicos.length > 0 ? gradosUnicos.join(', ') : '3ro, 4to, 5to, 6to',
          seccion: [...new Set(estudiantesAsignados.map(e => e.seccion))].join(', ') || 'A, B, C',
          foto: tutorActual.avatar || '/avatar-teacher.jpg'
        },
        estudiantes,
        clasesHoy,
        actividades,
        mensajesNoLeidos: Math.floor(Math.random() * 10),
        cargando: false
      })
    }, 800)
  },

  // Marcar actividad como completada
  completarActividad: (actividadId) => {
    const { actividades } = get()
    const nuevasActividades = actividades.map(actividad =>
      actividad.id === actividadId 
        ? { ...actividad, completado: true, progreso: 100 }
        : actividad
    )
    set({ actividades: nuevasActividades })
  },

  // Actualizar progreso de actividad
  actualizarProgreso: (actividadId, progreso) => {
    const { actividades } = get()
    const nuevasActividades = actividades.map(actividad =>
      actividad.id === actividadId 
        ? { ...actividad, progreso: Math.min(100, Math.max(0, progreso)) }
        : actividad
    )
    set({ actividades: nuevasActividades })
  },

  // Refrescar estudiantes del tutor (útil después de cambios en asignaciones)
  refrescarEstudiantes: (tutorId) => {
    try {
      // Obtener estudiantes actualizados
      const estudiantesAsignados = tutorId ? DatabaseQueries.getStudentsByTeacherId(tutorId) : []
      
      // Mapear al formato del dashboard
      const estudiantes = estudiantesAsignados.map((est, index) => ({
        id: est.id,
        nombre: `${est.nombre} ${est.apellidos}`,
        foto: est.foto || '/avatar-student.jpg',
        promedio: null,
        asistencia: 90 + Math.floor(Math.random() * 10),
        estado: index === 5 ? 'necesita_atencion' : 'activo',
        grado: est.grado,
        seccion: est.seccion,
        email: est.email || 'estudiante@example.com'
      }))
      
      set({ estudiantes })
      
      console.log(`✅ Estudiantes del tutor ${tutorId} actualizados: ${estudiantes.length} estudiantes`)
      return true
    } catch (error) {
      console.error('Error refrescando estudiantes:', error)
      return false
    }
  },

  // Obtener estadísticas del dashboard
  obtenerEstadisticas: () => {
    const { estudiantes, clasesHoy, actividades } = get()
    
    const totalEstudiantes = estudiantes.length
    const estudiantesActivos = estudiantes.filter(est => est.estado === 'activo').length
    const estudiantesNecesitanAtencion = estudiantes.filter(est => est.estado === 'necesita_atencion').length
    
    const estudiantesConPromedio = estudiantes.filter(est => est.promedio !== null)
    const promedioGeneral = estudiantesConPromedio.length > 0 
      ? estudiantesConPromedio.reduce((sum, est) => sum + est.promedio, 0) / estudiantesConPromedio.length 
      : 0
    
    const asistenciaPromedio = estudiantes.length > 0
      ? estudiantes.reduce((sum, est) => sum + est.asistencia, 0) / estudiantes.length
      : 0

    const clasesCompletadas = clasesHoy.filter(clase => clase.estado === 'completada').length
    const clasesPendientes = clasesHoy.filter(clase => clase.estado === 'pendiente').length
    
    const actividadesPendientes = actividades.filter(act => !act.completado).length
    const actividadesUrgentes = actividades.filter(act => 
      !act.completado && 
      act.prioridad === 'alta' && 
      new Date(act.fechaVencimiento) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
    ).length

    return {
      estudiantes: {
        total: totalEstudiantes,
        activos: estudiantesActivos,
        necesitanAtencion: estudiantesNecesitanAtencion,
        promedioGeneral: Math.round(promedioGeneral * 100) / 100,
        asistenciaPromedio: Math.round(asistenciaPromedio * 100) / 100
      },
      clases: {
        total: clasesHoy.length,
        completadas: clasesCompletadas,
        pendientes: clasesPendientes,
        enCurso: clasesHoy.filter(clase => clase.estado === 'en_curso').length
      },
      actividades: {
        total: actividades.length,
        pendientes: actividadesPendientes,
        urgentes: actividadesUrgentes,
        completadas: actividades.filter(act => act.completado).length
      }
    }
  },

  // Obtener estudiante por ID
  obtenerEstudiante: (estudianteId) => {
    const { estudiantes } = get()
    return estudiantes.find(est => est.id === estudianteId)
  },

  // Actualizar observaciones de estudiante
  actualizarObservaciones: (estudianteId, observaciones) => {
    const { estudiantes } = get()
    const nuevosEstudiantes = estudiantes.map(estudiante =>
      estudiante.id === estudianteId 
        ? { ...estudiante, observaciones }
        : estudiante
    )
    set({ estudiantes: nuevosEstudiantes })
  },

  // Cambiar estado de estudiante
  cambiarEstadoEstudiante: (estudianteId, nuevoEstado) => {
    const { estudiantes } = get()
    const nuevosEstudiantes = estudiantes.map(estudiante =>
      estudiante.id === estudianteId 
        ? { ...estudiante, estado: nuevoEstado }
        : estudiante
    )
    set({ estudiantes: nuevosEstudiantes })
  },

  // Obtener actividades por prioridad
  obtenerActividadesPorPrioridad: (prioridad) => {
    const { actividades } = get()
    return actividades.filter(act => act.prioridad === prioridad && !act.completado)
  },

  // Obtener próximas clases
  obtenerProximasClases: () => {
    const { clasesHoy } = get()
    return clasesHoy.filter(clase => clase.estado === 'pendiente' || clase.estado === 'en_curso')
      .sort((a, b) => a.hora.localeCompare(b.hora))
  }
}))

export default useTutorStore