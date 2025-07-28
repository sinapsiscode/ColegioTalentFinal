import { create } from 'zustand'
import { DatabaseQueries } from '../data/databaseSchema'

const useAdminDashboardStore = create((set, get) => ({
  cargando: false,
  estadisticasGenerales: {},
  usuariosActivos: [],
  comunicadosRecientes: [],
  actividadReciente: [],
  reportes: {},
  alertasSeguridad: [],
  configuracionAsistencia: {
    horaIngresoRegular: '08:00',
    minutosTolerancia: 15,
    coordenadasColegio: {
      latitud: -12.046373,
      longitud: -77.042754,
      radio: 100 // metros
    },
    diasLaborales: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    horariosEspeciales: {
      'lunes': { inicio: '08:00', fin: '16:00' },
      'martes': { inicio: '08:00', fin: '16:00' },
      'miercoles': { inicio: '08:00', fin: '16:00' },
      'jueves': { inicio: '08:00', fin: '16:00' },
      'viernes': { inicio: '08:00', fin: '15:00' }
    },
    notificaciones: {
      alertaTardanza: true,
      alertaFalta: true,
      reporteDiario: true,
      reporteSemanal: true
    },
    validacionGPS: true,
    backupAutomatico: true
  },
  
  cargarDashboard: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      try {
        // Obtener datos dinámicos reales de la base de datos
        console.log('🔍 AdminDashboard: Cargando datos...')
        const todosLosUsuarios = DatabaseQueries.getAllUsers()
        const todosLosEstudiantes = DatabaseQueries.getAllStudents()
        const todasLasRelaciones = DatabaseQueries.getAllParentStudentRelationships()
        
        console.log('📊 AdminDashboard datos:', {
          usuarios: todosLosUsuarios.length,
          estudiantes: todosLosEstudiantes.length,
          relaciones: todasLasRelaciones.length
        })
      
      // Calcular estadísticas dinámicamente
      const usuariosPorRol = todosLosUsuarios.reduce((acc, user) => {
        acc[user.rol] = (acc[user.rol] || 0) + 1
        return acc
      }, {})
      
      const usuariosActivos = todosLosUsuarios.filter(user => 
        user.estado === 'activo' && 
        user.ultimoAcceso && 
        new Date(user.ultimoAcceso) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // últimos 7 días
      ).length
      
      // Estadísticas de asistencia simuladas (evitamos dependencias circulares)
      const estadisticasAsistenciaEstudiantes = {
        porcentajeAsistencia: 92.5,
        conEntrada: Math.floor(todosLosEstudiantes.length * 0.925),
        ausentes: Math.floor(todosLosEstudiantes.length * 0.075)
      }
      
      const estadisticasTutores = {
        porcentajeAsistencia: 96.2,
        entradas: Math.floor(usuariosPorRol.tutor * 0.962),
        faltas: Math.floor(usuariosPorRol.tutor * 0.038)
      }
      
      const promedioAsistenciaGeneral = (
        estadisticasAsistenciaEstudiantes.porcentajeAsistencia + 
        estadisticasTutores.porcentajeAsistencia
      ) / 2
      
      const estadisticasGenerales = {
        totalUsuarios: todosLosUsuarios.length,
        usuariosActivos: usuariosActivos,
        totalEstudiantes: todosLosEstudiantes.length,
        totalProfesores: usuariosPorRol.tutor || 0,
        totalPadres: usuariosPorRol.padre || 0,
        totalAdministrativos: (usuariosPorRol.admin || 0) + (usuariosPorRol.entrada || 0),
        comunicadosEnviados: 47, // TODO: Implementar contador dinámico
        comunicadosHoy: 8, // TODO: Implementar contador dinámico
        promedioCalificaciones: 16.8, // TODO: Calcular desde notas reales
        asistenciaPromedio: Math.round(promedioAsistenciaGeneral * 10) / 10,
        satisfaccionPadres: 4.6, // TODO: Implementar sistema de satisfacción
        relacionesPadreHijo: todasLasRelaciones.length,
        estudiantesSinPadres: todosLosEstudiantes.filter(estudiante => 
          !todasLasRelaciones.some(rel => rel.student_id === estudiante.id)
        ).length
      }
      
      // Obtener usuarios más activos basado en datos reales
      const usuariosRecentementeActivos = todosLosUsuarios
        .filter(user => user.estado === 'activo')
        .map(user => {
          // Simular última actividad basada en datos del usuario
          const horasDesdeUltimaActividad = Math.floor(Math.random() * 48) // Entre 0 y 48 horas
          const ultimaActividad = new Date(Date.now() - horasDesdeUltimaActividad * 60 * 60 * 1000)
          
          const baseUser = {
            id: user.id,
            nombre: user.nombre,
            tipo: user.rol,
            estado: user.estado,
            ultimaActividad,
            email: user.email
          }
          
          // Agregar información específica por rol
          if (user.rol === 'tutor') {
            const estudiantesAsignados = DatabaseQueries.getStudentsByTeacherId(user.id)
            return {
              ...baseUser,
              grado: estudiantesAsignados.length > 0 ? estudiantesAsignados[0].grado : 'Sin asignar',
              estudiantesAsignados: estudiantesAsignados.length,
              comunicadosEnviados: Math.floor(Math.random() * 20) + 5
            }
          } else if (user.rol === 'padre') {
            const hijosAsignados = DatabaseQueries.getChildrenByParentId(user.id)
            return {
              ...baseUser,
              hijos: hijosAsignados.map(h => h.nombre).join(', ') || 'Sin hijos asignados',
              cantidadHijos: hijosAsignados.length,
              mensajesLeidos: Math.floor(Math.random() * 30) + 5
            }
          } else if (user.rol === 'admin') {
            return {
              ...baseUser,
              cargo: 'Administrador',
              tareasPendientes: Math.floor(Math.random() * 10) + 1,
              reportesGenerados: Math.floor(Math.random() * 15) + 5
            }
          } else {
            return {
              ...baseUser,
              cargo: 'Personal de Entrada',
              escaneosDiarios: Math.floor(Math.random() * 100) + 50
            }
          }
        })
        .sort((a, b) => b.ultimaActividad - a.ultimaActividad)
        .slice(0, 8) // Top 8 usuarios más activos
      
      const comunicadosRecientes = [
        {
          id: 1,
          titulo: 'Cronograma de Evaluaciones - III Bimestre',
          autor: 'María García',
          destinatarios: 24,
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
          estado: 'enviado',
          vistas: 18,
          respuestas: 3,
          prioridad: 'alta'
        },
        {
          id: 2,
          titulo: 'Reunión de Coordinación Académica',
          autor: 'Administración',
          destinatarios: 18,
          fecha: new Date(Date.now() - 4 * 60 * 60 * 1000),
          estado: 'enviado',
          vistas: 15,
          respuestas: 8,
          prioridad: 'alta'
        },
        {
          id: 3,
          titulo: 'Actualización del Sistema de Notas',
          autor: 'Soporte Técnico',
          destinatarios: 347,
          fecha: new Date(Date.now() - 6 * 60 * 60 * 1000),
          estado: 'enviado',
          vistas: 234,
          respuestas: 12,
          prioridad: 'media'
        },
        {
          id: 4,
          titulo: 'Protocolo de Seguridad Actualizado',
          autor: 'Dirección',
          destinatarios: 347,
          fecha: new Date(Date.now() - 12 * 60 * 60 * 1000),
          estado: 'enviado',
          vistas: 298,
          respuestas: 45,
          prioridad: 'alta'
        },
        {
          id: 5,
          titulo: 'Evento Cultural - Día del Idioma',
          autor: 'Coordinación Académica',
          destinatarios: 285,
          fecha: new Date(Date.now() - 18 * 60 * 60 * 1000),
          estado: 'programado',
          vistas: 0,
          respuestas: 0,
          prioridad: 'media'
        }
      ]
      
      // Generar actividad reciente basada en usuarios reales
      const actividadReciente = []
      let actividadId = 1
      
      // Actividades de tutores
      todosLosUsuarios.filter(u => u.rol === 'tutor').slice(0, 2).forEach(tutor => {
        const estudiantesAsignados = DatabaseQueries.getStudentsByTeacherId(tutor.id)
        if (estudiantesAsignados.length > 0) {
          actividadReciente.push({
            id: actividadId++,
            usuario: tutor.nombre,
            accion: 'revisó asistencia',
            detalle: `${estudiantesAsignados[0].grado} - ${estudiantesAsignados.length} estudiantes`,
            fecha: new Date(Date.now() - Math.floor(Math.random() * 4) * 60 * 60 * 1000),
            tipo: 'asistencia'
          })
        }
      })
      
      // Actividades de padres
      todosLosUsuarios.filter(u => u.rol === 'padre').slice(0, 2).forEach(padre => {
        const hijos = DatabaseQueries.getChildrenByParentId(padre.id)
        if (hijos.length > 0) {
          actividadReciente.push({
            id: actividadId++,
            usuario: padre.nombre,
            accion: 'consultó notas',
            detalle: `Revisó calificaciones de ${hijos[0].nombre}`,
            fecha: new Date(Date.now() - Math.floor(Math.random() * 6) * 60 * 60 * 1000),
            tipo: 'consulta'
          })
        }
      })
      
      // Actividades del sistema
      actividadReciente.push(
        {
          id: actividadId++,
          usuario: 'Sistema',
          accion: 'backup automático',
          detalle: `${todosLosUsuarios.length} usuarios y ${todosLosEstudiantes.length} estudiantes respaldados`,
          fecha: new Date(Date.now() - 6 * 60 * 60 * 1000),
          tipo: 'sistema'
        },
        {
          id: actividadId++,
          usuario: 'Sistema',
          accion: 'sincronización',
          detalle: `${todasLasRelaciones.length} relaciones padre-hijo actualizadas`,
          fecha: new Date(Date.now() - 12 * 60 * 60 * 1000),
          tipo: 'sistema'
        }
      )
      
      // Ordenar por fecha más reciente
      actividadReciente.sort((a, b) => b.fecha - a.fecha)
      
      const reportes = {
        rendimientoAcademico: {
          promedioGeneral: 16.8, // TODO: Calcular desde notas reales
          mejorGrado: '5to A',
          promedioMejorGrado: 17.4,
          estudiantesDestacados: Math.floor(todosLosEstudiantes.length * 0.15), // 15% destacados
          estudiantesEnRiesgo: Math.floor(todosLosEstudiantes.length * 0.05), // 5% en riesgo
          materiasMejorRendimiento: ['Matemáticas', 'Comunicación'],
          materiasMenorRendimiento: ['Ciencias', 'Inglés']
        },
        asistencia: {
          promedioGeneral: Math.round(promedioAsistenciaGeneral * 10) / 10,
          estudiantesPresentes: estadisticasAsistenciaEstudiantes.conEntrada,
          estudiantesAusentes: estadisticasAsistenciaEstudiantes.ausentes,
          tutoresPresentes: estadisticasTutores.entradas,
          tutoresAusentes: estadisticasTutores.faltas,
          tendencia: promedioAsistenciaGeneral > 90 ? 'excelente' : promedioAsistenciaGeneral > 80 ? 'buena' : 'requiere_atencion'
        },
        comunicaciones: {
          totalEnviados: 47,
          promedioVistas: 78.5,
          tasaRespuesta: 15.2,
          comunicadosMasVistos: [
            'Protocolo de Seguridad Actualizado',
            'Cronograma Evaluaciones'
          ]
        },
        satisfaccion: {
          padres: 4.6,
          estudiantes: 4.3,
          profesores: 4.5,
          comentariosPositivos: 187,
          sugerenciasMejora: 23
        }
      }
      
      const alertasSeguridad = [
        {
          id: 1,
          tipo: 'info',
          mensaje: 'Backup automático programado para las 2:00 AM',
          fecha: new Date(Date.now() - 30 * 60 * 1000),
          leida: false
        },
        {
          id: 2,
          tipo: 'warning',
          mensaje: '3 intentos de acceso fallidos para usuario "prof_martinez"',
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
          leida: false
        },
        {
          id: 3,
          tipo: 'success',
          mensaje: 'Actualización de seguridad instalada correctamente',
          fecha: new Date(Date.now() - 4 * 60 * 60 * 1000),
          leida: true
        }
      ]
      
      set({
        estadisticasGenerales,
        usuariosActivos: usuariosRecentementeActivos,
        comunicadosRecientes,
        actividadReciente,
        reportes,
        alertasSeguridad,
        cargando: false
      })
      
      } catch (error) {
        console.error('❌ Error al cargar admin dashboard:', error)
        set({
          cargando: false,
          estadisticasGenerales: {
            totalUsuarios: 0,
            usuariosActivos: 0,
            totalEstudiantes: 0,
            totalProfesores: 0,
            totalPadres: 0,
            totalAdministrativos: 0,
            comunicadosEnviados: 0,
            comunicadosHoy: 0,
            promedioCalificaciones: 0,
            asistenciaPromedio: 0,
            satisfaccionPadres: 0,
            relacionesPadreHijo: 0,
            estudiantesSinPadres: 0
          },
          usuariosActivos: [],
          comunicadosRecientes: [],
          actividadReciente: [],
          reportes: {},
          alertasSeguridad: []
        })
      }
    }, 800)
  },
  
  marcarAlertaComoLeida: (alertaId) => {
    const { alertasSeguridad } = get()
    const nuevasAlertas = alertasSeguridad.map(alerta =>
      alerta.id === alertaId ? { ...alerta, leida: true } : alerta
    )
    set({ alertasSeguridad: nuevasAlertas })
  },
  
  obtenerResumenRapido: () => {
    const { estadisticasGenerales, alertasSeguridad, comunicadosRecientes } = get()
    
    return {
      usuariosConectados: estadisticasGenerales.usuariosActivos,
      comunicadosHoy: estadisticasGenerales.comunicadosHoy,
      alertasPendientes: alertasSeguridad.filter(a => !a.leida).length,
      ultimoComunicado: comunicadosRecientes[0],
      rendimientoGeneral: estadisticasGenerales.promedioCalificaciones
    }
  },
  
  obtenerEstadisticasPorPeriodo: (periodo) => {
    // Simulación de estadísticas por período
    const baseStats = get().estadisticasGenerales
    
    const multiplicadores = {
      'hoy': 0.1,
      'semana': 0.7,
      'mes': 1,
      'trimestre': 3
    }
    
    const mult = multiplicadores[periodo] || 1
    
    return {
      comunicadosEnviados: Math.round(baseStats.comunicadosEnviados * mult),
      usuariosActivos: Math.round(baseStats.usuariosActivos * mult),
      promedioVistas: Math.round(78.5 * mult),
      tasaParticipacion: Math.round(85.2 * mult) / 100
    }
  },
  
  generarReporte: (tipo) => {
    const { reportes } = get()
    
    // Simular generación de reporte
    setTimeout(() => {
      console.log(`Reporte ${tipo} generado:`, reportes[tipo] || reportes)
    }, 500)
    
    return reportes[tipo] || reportes
  },
  
  actualizarConfiguracion: (nuevaConfig) => {
    // Simular actualización de configuración
    console.log('Configuración actualizada:', nuevaConfig)
  },

  // Métodos específicos para configuración de asistencia
  obtenerConfiguracionAsistencia: () => {
    return get().configuracionAsistencia
  },

  actualizarConfiguracionAsistencia: (nuevaConfig) => {
    const { configuracionAsistencia } = get()
    const configActualizada = { ...configuracionAsistencia, ...nuevaConfig }
    
    set({ configuracionAsistencia: configActualizada })
    
    // Simular guardado en backend
    setTimeout(() => {
      console.log('Configuración de asistencia guardada:', configActualizada)
    }, 500)
    
    return configActualizada
  },

  actualizarHorarioIngreso: (nuevaHora) => {
    const { configuracionAsistencia } = get()
    const configActualizada = {
      ...configuracionAsistencia,
      horaIngresoRegular: nuevaHora
    }
    
    set({ configuracionAsistencia: configActualizada })
    return configActualizada
  },

  actualizarTolerancia: (minutos) => {
    const { configuracionAsistencia } = get()
    const configActualizada = {
      ...configuracionAsistencia,
      minutosTolerancia: minutos
    }
    
    set({ configuracionAsistencia: configActualizada })
    return configActualizada
  },

  actualizarCoordenadasColegio: (coordenadas) => {
    const { configuracionAsistencia } = get()
    const configActualizada = {
      ...configuracionAsistencia,
      coordenadasColegio: { ...configuracionAsistencia.coordenadasColegio, ...coordenadas }
    }
    
    set({ configuracionAsistencia: configActualizada })
    return configActualizada
  },

  toggleValidacionGPS: () => {
    const { configuracionAsistencia } = get()
    const configActualizada = {
      ...configuracionAsistencia,
      validacionGPS: !configuracionAsistencia.validacionGPS
    }
    
    set({ configuracionAsistencia: configActualizada })
    return configActualizada
  },

  actualizarNotificaciones: (tipoNotificacion, estado) => {
    const { configuracionAsistencia } = get()
    const configActualizada = {
      ...configuracionAsistencia,
      notificaciones: {
        ...configuracionAsistencia.notificaciones,
        [tipoNotificacion]: estado
      }
    }
    
    set({ configuracionAsistencia: configActualizada })
    return configActualizada
  },

  validarConfiguracion: () => {
    const { configuracionAsistencia } = get()
    const errores = []

    // Validar hora de ingreso
    if (!configuracionAsistencia.horaIngresoRegular) {
      errores.push('La hora de ingreso es requerida')
    }

    // Validar tolerancia
    if (configuracionAsistencia.minutosTolerancia < 0 || configuracionAsistencia.minutosTolerancia > 60) {
      errores.push('La tolerancia debe estar entre 0 y 60 minutos')
    }

    // Validar coordenadas
    if (!configuracionAsistencia.coordenadasColegio.latitud || !configuracionAsistencia.coordenadasColegio.longitud) {
      errores.push('Las coordenadas del colegio son requeridas')
    }

    // Validar radio
    if (configuracionAsistencia.coordenadasColegio.radio < 10 || configuracionAsistencia.coordenadasColegio.radio > 1000) {
      errores.push('El radio debe estar entre 10 y 1000 metros')
    }

    return {
      esValida: errores.length === 0,
      errores
    }
  }
}))

export default useAdminDashboardStore