import { create } from 'zustand'

const useAdminReportsStore = create((set, get) => ({
  cargando: false,
  reportes: [],
  filtros: {
    tipo: 'all',
    periodo: 'mes',
    grado: 'all',
    estado: 'all'
  },
  datosReportes: {},
  configuraciones: {},
  
  cargarReportes: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const reportes = [
        {
          id: 1,
          nombre: 'Rendimiento Académico General',
          tipo: 'academico',
          descripcion: 'Análisis completo del rendimiento académico por grados y materias',
          ultimaActualizacion: new Date(Date.now() - 2 * 60 * 60 * 1000),
          estado: 'actualizado',
          frecuencia: 'semanal',
          tamaño: '2.4 MB',
          formato: 'PDF',
          accesos: 45,
          categoria: 'academico'
        },
        {
          id: 2,
          nombre: 'Asistencia Estudiantil',
          tipo: 'asistencia',
          descripcion: 'Reporte detallado de asistencia por estudiante y grado',
          ultimaActualizacion: new Date(Date.now() - 24 * 60 * 60 * 1000),
          estado: 'actualizado',
          frecuencia: 'diaria',
          tamaño: '856 KB',
          formato: 'Excel',
          accesos: 28,
          categoria: 'asistencia'
        },
        {
          id: 3,
          nombre: 'Comunicaciones Enviadas',
          tipo: 'comunicaciones',
          descripcion: 'Estadísticas de comunicados enviados y su efectividad',
          ultimaActualizacion: new Date(Date.now() - 4 * 60 * 60 * 1000),
          estado: 'actualizado',
          frecuencia: 'semanal',
          tamaño: '1.2 MB',
          formato: 'PDF',
          accesos: 67,
          categoria: 'comunicaciones'
        },
        {
          id: 4,
          nombre: 'Satisfacción de Padres',
          tipo: 'satisfaccion',
          descripcion: 'Encuestas y evaluaciones de satisfacción de padres de familia',
          ultimaActualizacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          estado: 'pendiente',
          frecuencia: 'mensual',
          tamaño: '3.1 MB',
          formato: 'PDF',
          accesos: 23,
          categoria: 'satisfaccion'
        },
        {
          id: 5,
          nombre: 'Desempeño Docente',
          tipo: 'docente',
          descripcion: 'Evaluación del desempeño y actividades de los profesores',
          ultimaActualizacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          estado: 'generando',
          frecuencia: 'mensual',
          tamaño: '1.8 MB',
          formato: 'Excel',
          accesos: 12,
          categoria: 'recursos_humanos'
        },
        {
          id: 6,
          nombre: 'Finanzas Institucionales',
          tipo: 'finanzas',
          descripcion: 'Reporte financiero de ingresos, gastos y presupuesto',
          ultimaActualizacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          estado: 'actualizado',
          frecuencia: 'mensual',
          tamaño: '4.2 MB',
          formato: 'Excel',
          accesos: 8,
          categoria: 'finanzas'
        },
        {
          id: 7,
          nombre: 'Uso de Tecnología',
          tipo: 'tecnologia',
          descripcion: 'Análisis del uso de plataformas digitales y herramientas tecnológicas',
          ultimaActualizacion: new Date(Date.now() - 6 * 60 * 60 * 1000),
          estado: 'actualizado',
          frecuencia: 'semanal',
          tamaño: '750 KB',
          formato: 'PDF',
          accesos: 34,
          categoria: 'tecnologia'
        },
        {
          id: 8,
          nombre: 'Actividades Extracurriculares',
          tipo: 'actividades',
          descripcion: 'Participación y resultados en actividades extracurriculares',
          ultimaActualizacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          estado: 'actualizado',
          frecuencia: 'quincenal',
          tamaño: '1.5 MB',
          formato: 'PDF',
          accesos: 19,
          categoria: 'actividades'
        }
      ]
      
      const datosReportes = {
        academico: {
          promedioGeneral: 16.8,
          estudiantesPorGrado: {
            '1ro': { total: 45, promedio: 16.2, destacados: 8, enRiesgo: 3 },
            '2do': { total: 48, promedio: 16.5, destacados: 10, enRiesgo: 2 },
            '3ro': { total: 42, promedio: 17.1, destacados: 12, enRiesgo: 1 },
            '4to': { total: 46, promedio: 16.9, destacados: 9, enRiesgo: 4 },
            '5to': { total: 44, promedio: 17.3, destacados: 11, enRiesgo: 2 }
          },
          materias: {
            'Matemáticas': { promedio: 17.2, aprobados: 92, destacados: 25 },
            'Comunicación': { promedio: 16.8, aprobados: 94, destacados: 22 },
            'Ciencias': { promedio: 16.3, aprobados: 88, destacados: 18 },
            'Educación Física': { promedio: 18.1, aprobados: 98, destacados: 35 },
            'Inglés': { promedio: 15.9, aprobados: 85, destacados: 15 }
          },
          tendencia: 'ascendente',
          variacionMensual: +0.3
        },
        
        asistencia: {
          promedioGeneral: 94.2,
          porGrado: {
            '1ro': 93.8,
            '2do': 94.5,
            '3ro': 95.1,
            '4to': 93.9,
            '5to': 94.2
          },
          ausentismoAlto: ['Diego Vargas', 'Luis Mendoza', 'Sofia Torres'],
          mejorAsistencia: ['Ana Rodriguez', 'Carlos Mendoza', 'Isabella Santos'],
          tendencia: 'estable',
          variacionSemanal: +0.1
        },
        
        comunicaciones: {
          totalEnviados: 127,
          promedioVistas: 78.5,
          tasaRespuesta: 15.2,
          porTipo: {
            'academico': { cantidad: 45, vistas: 82.3, respuestas: 18.1 },
            'administrativo': { cantidad: 32, vistas: 75.8, respuestas: 12.4 },
            'eventos': { cantidad: 28, vistas: 79.2, respuestas: 16.8 },
            'urgente': { cantidad: 22, vistas: 95.1, respuestas: 28.3 }
          },
          efectividad: 'alta',
          comunicadoMasVisto: 'Protocolo de Seguridad Actualizado',
          tendencia: 'ascendente'
        },
        
        satisfaccion: {
          padres: {
            calificacion: 4.6,
            aspectos: {
              'enseñanza': 4.7,
              'comunicacion': 4.5,
              'instalaciones': 4.4,
              'actividades': 4.8,
              'administracion': 4.3
            },
            comentarios: 187,
            sugerencias: 23
          },
          estudiantes: {
            calificacion: 4.3,
            aspectos: {
              'profesores': 4.4,
              'materias': 4.2,
              'ambiente': 4.5,
              'tecnologia': 4.1,
              'actividades': 4.6
            }
          },
          tendencia: 'positiva'
        },
        
        docente: {
          totalProfesores: 18,
          evaluacionPromedio: 4.5,
          porProfesor: {
            'María García': { calificacion: 4.8, materias: ['Matemáticas'], experiencia: 8 },
            'Roberto Silva': { calificacion: 4.7, materias: ['Educación Física'], experiencia: 12 },
            'José López': { calificacion: 4.6, materias: ['Comunicación'], experiencia: 10 },
            'Ana Martínez': { calificacion: 4.4, materias: ['Ciencias'], experiencia: 6 },
            'Carlos Torres': { calificacion: 4.5, materias: ['Inglés'], experiencia: 9 }
          },
          capacitaciones: 24,
          certificaciones: 15,
          satisfaccionDocente: 4.2
        },
        
        finanzas: {
          ingresosMensual: 185000,
          gastosMensual: 142000,
          utilidad: 43000,
          presupuestoAnual: 2200000,
          ejecucionPresupuesto: 67.5,
          principalesIngresos: {
            'pensiones': 75,
            'matriculas': 15,
            'actividades': 7,
            'otros': 3
          },
          principalesGastos: {
            'personal': 65,
            'servicios': 20,
            'materiales': 10,
            'infraestructura': 5
          }
        }
      }
      
      const configuraciones = {
        formatosDisponibles: ['PDF', 'Excel', 'CSV', 'Word'],
        frecuencias: ['diaria', 'semanal', 'quincenal', 'mensual', 'trimestral'],
        destinatarios: {
          'direccion': 'Dirección',
          'coordinacion': 'Coordinación Académica',
          'administracion': 'Administración',
          'profesores': 'Profesores',
          'padres': 'Padres de Familia'
        },
        plantillas: {
          'basico': 'Reporte Básico',
          'detallado': 'Reporte Detallado',
          'ejecutivo': 'Resumen Ejecutivo',
          'grafico': 'Reporte con Gráficos'
        }
      }
      
      set({
        reportes,
        datosReportes,
        configuraciones,
        cargando: false
      })
    }, 800)
  },
  
  generarReporte: (tipoReporte, configuracion = {}) => {
    const { datosReportes } = get()
    
    return new Promise((resolve) => {
      set({ cargando: true })
      
      setTimeout(() => {
        const reporte = {
          id: Date.now(),
          tipo: tipoReporte,
          datos: datosReportes[tipoReporte],
          configuracion,
          fechaGeneracion: new Date(),
          estado: 'generado'
        }
        
        set({ cargando: false })
        resolve(reporte)
      }, 2000)
    })
  },
  
  exportarReporte: (reporteId, formato) => {
    const { reportes } = get()
    const reporte = reportes.find(r => r.id === reporteId)
    
    if (reporte) {
      // Simular exportación
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            archivo: `${reporte.nombre}.${formato.toLowerCase()}`,
            tamaño: reporte.tamaño,
            url: '#'
          })
        }, 1500)
      })
    }
    
    return Promise.reject('Reporte no encontrado')
  },
  
  programarReporte: (reporteId, configuracion) => {
    const { reportes } = get()
    const nuevosReportes = reportes.map(reporte =>
      reporte.id === reporteId
        ? { ...reporte, configuracion, estado: 'programado' }
        : reporte
    )
    set({ reportes: nuevosReportes })
  },
  
  obtenerReportesPorFiltros: () => {
    const { reportes, filtros } = get()
    let resultado = [...reportes]
    
    if (filtros.tipo !== 'all') {
      resultado = resultado.filter(r => r.categoria === filtros.tipo)
    }
    
    if (filtros.estado !== 'all') {
      resultado = resultado.filter(r => r.estado === filtros.estado)
    }
    
    // Ordenar por última actualización
    resultado.sort((a, b) => new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion))
    
    return resultado
  },
  
  buscarReportes: (termino) => {
    const { reportes } = get()
    if (!termino.trim()) return reportes
    
    const terminoLower = termino.toLowerCase()
    return reportes.filter(reporte =>
      reporte.nombre.toLowerCase().includes(terminoLower) ||
      reporte.descripcion.toLowerCase().includes(terminoLower) ||
      reporte.categoria.toLowerCase().includes(terminoLower)
    )
  },
  
  actualizarFiltros: (nuevosFiltros) => {
    set({ filtros: { ...get().filtros, ...nuevosFiltros } })
  },
  
  obtenerEstadisticas: () => {
    const { reportes } = get()
    
    return {
      total: reportes.length,
      actualizados: reportes.filter(r => r.estado === 'actualizado').length,
      pendientes: reportes.filter(r => r.estado === 'pendiente').length,
      generando: reportes.filter(r => r.estado === 'generando').length,
      totalAccesos: reportes.reduce((sum, r) => sum + r.accesos, 0),
      promedioAccesos: Math.round(reportes.reduce((sum, r) => sum + r.accesos, 0) / reportes.length),
      porCategoria: {
        academico: reportes.filter(r => r.categoria === 'academico').length,
        asistencia: reportes.filter(r => r.categoria === 'asistencia').length,
        comunicaciones: reportes.filter(r => r.categoria === 'comunicaciones').length,
        satisfaccion: reportes.filter(r => r.categoria === 'satisfaccion').length,
        recursos_humanos: reportes.filter(r => r.categoria === 'recursos_humanos').length,
        finanzas: reportes.filter(r => r.categoria === 'finanzas').length,
        tecnologia: reportes.filter(r => r.categoria === 'tecnologia').length,
        actividades: reportes.filter(r => r.categoria === 'actividades').length
      }
    }
  },
  
  eliminarReporte: (reporteId) => {
    const { reportes } = get()
    const nuevosReportes = reportes.filter(r => r.id !== reporteId)
    set({ reportes: nuevosReportes })
  },
  
  duplicarReporte: (reporteId) => {
    const { reportes } = get()
    const reporteOriginal = reportes.find(r => r.id === reporteId)
    
    if (reporteOriginal) {
      const reporteDuplicado = {
        ...reporteOriginal,
        id: Date.now(),
        nombre: `Copia de ${reporteOriginal.nombre}`,
        ultimaActualizacion: new Date(),
        estado: 'pendiente',
        accesos: 0
      }
      
      set({ reportes: [reporteDuplicado, ...reportes] })
      return reporteDuplicado.id
    }
  }
}))

export default useAdminReportsStore