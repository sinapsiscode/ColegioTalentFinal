import { create } from 'zustand'

const useAdminDashboardStore = create((set, get) => ({
  cargando: false,
  estadisticasGenerales: {},
  usuariosActivos: [],
  comunicadosRecientes: [],
  actividadReciente: [],
  reportes: {},
  alertasSeguridad: [],
  
  cargarDashboard: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const estadisticasGenerales = {
        totalUsuarios: 347,
        usuariosActivos: 289,
        totalEstudiantes: 285,
        totalProfesores: 18,
        totalPadres: 510,
        comunicadosEnviados: 47,
        comunicadosHoy: 8,
        promedioCalificaciones: 16.8,
        asistenciaPromedio: 94.2,
        satisfaccionPadres: 4.6
      }
      
      const usuariosActivos = [
        {
          id: 1,
          nombre: 'María García',
          tipo: 'profesor',
          grado: '5to A',
          estado: 'activo',
          ultimaActividad: new Date(Date.now() - 15 * 60 * 1000),
          comunicadosEnviados: 12
        },
        {
          id: 2,
          nombre: 'Roberto Silva',
          tipo: 'profesor',
          grado: 'Educación Física',
          estado: 'activo',
          ultimaActividad: new Date(Date.now() - 32 * 60 * 1000),
          comunicadosEnviados: 8
        },
        {
          id: 3,
          nombre: 'Ana Torres',
          tipo: 'padre',
          estudiante: 'Isabella Santos',
          estado: 'activo',
          ultimaActividad: new Date(Date.now() - 45 * 60 * 1000),
          mensajesLeidos: 15
        },
        {
          id: 4,
          nombre: 'Carlos Mendoza',
          tipo: 'padre',
          estudiante: 'Diego Vargas',
          estado: 'activo',
          ultimaActividad: new Date(Date.now() - 2 * 60 * 60 * 1000),
          mensajesLeidos: 8
        },
        {
          id: 5,
          nombre: 'Patricia López',
          tipo: 'administrativo',
          cargo: 'Secretaria Académica',
          estado: 'activo',
          ultimaActividad: new Date(Date.now() - 20 * 60 * 1000),
          tareasPendientes: 5
        }
      ]
      
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
      
      const actividadReciente = [
        {
          id: 1,
          usuario: 'María García',
          accion: 'envió comunicado',
          detalle: 'Cronograma de Evaluaciones - III Bimestre',
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
          tipo: 'comunicado'
        },
        {
          id: 2,
          usuario: 'Roberto Silva',
          accion: 'actualizó calificaciones',
          detalle: '5to Grado A - Educación Física',
          fecha: new Date(Date.now() - 3 * 60 * 60 * 1000),
          tipo: 'calificacion'
        },
        {
          id: 3,
          usuario: 'Ana Torres',
          accion: 'respondió mensaje',
          detalle: 'Consulta sobre tarea de matemáticas',
          fecha: new Date(Date.now() - 4 * 60 * 60 * 1000),
          tipo: 'mensaje'
        },
        {
          id: 4,
          usuario: 'Administración',
          accion: 'programó reunión',
          detalle: 'Coordinación Académica - Viernes 2 PM',
          fecha: new Date(Date.now() - 5 * 60 * 60 * 1000),
          tipo: 'reunion'
        },
        {
          id: 5,
          usuario: 'Sistema',
          accion: 'backup automático',
          detalle: 'Respaldo de datos completado exitosamente',
          fecha: new Date(Date.now() - 6 * 60 * 60 * 1000),
          tipo: 'sistema'
        },
        {
          id: 6,
          usuario: 'José López',
          accion: 'creó proyecto',
          detalle: 'Lectura Crítica - 4to Grado',
          fecha: new Date(Date.now() - 8 * 60 * 60 * 1000),
          tipo: 'proyecto'
        },
        {
          id: 7,
          usuario: 'Patricia López',
          accion: 'registró asistencia',
          detalle: '5to Grado A - 23 de 24 estudiantes',
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000),
          tipo: 'asistencia'
        }
      ]
      
      const reportes = {
        rendimientoAcademico: {
          promedioGeneral: 16.8,
          mejorGrado: '5to A',
          promedioMejorGrado: 17.4,
          estudiantesDestacados: 45,
          estudiantesEnRiesgo: 12,
          materiasMejorRendimiento: ['Matemáticas', 'Comunicación'],
          materiasMenorRendimiento: ['Ciencias', 'Inglés']
        },
        asistencia: {
          promedioGeneral: 94.2,
          mejorAsistencia: '3er A',
          porcentajeMejor: 98.1,
          ausentismoAlto: ['1er B', '2do C'],
          tendencia: 'estable'
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
        usuariosActivos,
        comunicadosRecientes,
        actividadReciente,
        reportes,
        alertasSeguridad,
        cargando: false
      })
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
  }
}))

export default useAdminDashboardStore