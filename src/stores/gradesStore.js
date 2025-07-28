import { create } from 'zustand'
import useAuthStore from './authStore'
import { DatabaseQueries } from '../data/databaseSchema'

const useGradesStore = create((set, get) => ({
  calificaciones: [],
  materias: [],
  bimestres: [],
  cargando: false,
  filtros: {
    bimestre: 'all',
    materia: 'all',
    estudiante: 'all'
  },
  
  cargarCalificaciones: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      // FILTRAR CALIFICACIONES POR ROL Y USUARIO
      const authStore = useAuthStore.getState()
      const { usuario, rol } = authStore
      
      if (!usuario) {
        set({ calificaciones: [], materias: [], bimestres: [], cargando: false })
        return
      }
      
      const materias = [
        { id: 1, nombre: 'Matemáticas', profesor: 'María García', color: 'bg-blue-500' },
        { id: 2, nombre: 'Comunicación', profesor: 'José López', color: 'bg-green-500' },
        { id: 3, nombre: 'Ciencia y Tecnología', profesor: 'Ana Martínez', color: 'bg-purple-500' },
        { id: 4, nombre: 'Ciencias Sociales', profesor: 'Carlos Mendez', color: 'bg-orange-500' },
        { id: 5, nombre: 'Arte y Cultura', profesor: 'Laura Vega', color: 'bg-pink-500' },
        { id: 6, nombre: 'Educación Física', profesor: 'Roberto Silva', color: 'bg-red-500' },
        { id: 7, nombre: 'Inglés', profesor: 'Patricia Rojas', color: 'bg-indigo-500' },
        { id: 8, nombre: 'Educación Religiosa', profesor: 'Miguel Torres', color: 'bg-teal-500' }
      ]

      const bimestres = [
        { id: 1, nombre: 'I Bimestre', fechaInicio: '2024-03-01', fechaFin: '2024-05-15', activo: false, finalizado: true },
        { id: 2, nombre: 'II Bimestre', fechaInicio: '2024-05-16', fechaFin: '2024-07-31', activo: false, finalizado: true },
        { id: 3, nombre: 'III Bimestre', fechaInicio: '2024-08-01', fechaFin: '2024-10-15', activo: true, finalizado: false },
        { id: 4, nombre: 'IV Bimestre', fechaInicio: '2024-10-16', fechaFin: '2024-12-20', activo: false, finalizado: false }
      ]

      // OBTENER ESTUDIANTES SEGÚN ROL
      let estudiantes = []
      
      if (rol === 'padre') {
        // Padre solo ve calificaciones de sus hijos
        estudiantes = DatabaseQueries.getChildrenByParentId(usuario.id)
      } else if (rol === 'tutor') {
        // Tutor solo ve calificaciones de sus estudiantes asignados
        estudiantes = DatabaseQueries.getStudentsByTeacherId(usuario.id)
      } else if (rol === 'admin') {
        // Admin ve todos los estudiantes
        estudiantes = DatabaseQueries.getAllStudents()
      }
      
      // Si no hay estudiantes autorizados, no mostrar calificaciones
      if (estudiantes.length === 0) {
        set({ calificaciones: [], materias, bimestres, cargando: false })
        return
      }

      const calificaciones = []

      // Generar calificaciones para cada estudiante, materia y bimestre
      estudiantes.forEach(estudiante => {
        materias.forEach(materia => {
          bimestres.forEach(bimestre => {
            if (bimestre.finalizado || bimestre.activo) {
              // Generar evaluaciones para el bimestre
              const evaluaciones = []
              
              // Evaluaciones para Ana Sofía (mejor rendimiento)
              if (estudiante.id === 1) {
                evaluaciones.push(
                  {
                    id: `${estudiante.id}-${materia.id}-${bimestre.id}-1`,
                    tipo: 'Examen',
                    descripcion: 'Examen Bimestral',
                    nota: Math.floor(Math.random() * 4) + 16, // 16-20
                    fecha: new Date(2024, bimestre.id * 2, 15),
                    peso: 0.4
                  },
                  {
                    id: `${estudiante.id}-${materia.id}-${bimestre.id}-2`,
                    tipo: 'Práctica',
                    descripcion: 'Práctica Calificada',
                    nota: Math.floor(Math.random() * 3) + 15, // 15-18
                    fecha: new Date(2024, bimestre.id * 2, 8),
                    peso: 0.3
                  },
                  {
                    id: `${estudiante.id}-${materia.id}-${bimestre.id}-3`,
                    tipo: 'Tarea',
                    descripcion: 'Trabajo de Investigación',
                    nota: Math.floor(Math.random() * 3) + 17, // 17-20
                    fecha: new Date(2024, bimestre.id * 2, 22),
                    peso: 0.2
                  },
                  {
                    id: `${estudiante.id}-${materia.id}-${bimestre.id}-4`,
                    tipo: 'Participación',
                    descripcion: 'Participación en Clase',
                    nota: Math.floor(Math.random() * 2) + 18, // 18-20
                    fecha: new Date(2024, bimestre.id * 2, 30),
                    peso: 0.1
                  }
                )
              } else {
                // Evaluaciones para Luis Miguel (rendimiento promedio)
                evaluaciones.push(
                  {
                    id: `${estudiante.id}-${materia.id}-${bimestre.id}-1`,
                    tipo: 'Examen',
                    descripcion: 'Examen Bimestral',
                    nota: Math.floor(Math.random() * 4) + 13, // 13-17
                    fecha: new Date(2024, bimestre.id * 2, 15),
                    peso: 0.4
                  },
                  {
                    id: `${estudiante.id}-${materia.id}-${bimestre.id}-2`,
                    tipo: 'Práctica',
                    descripcion: 'Práctica Calificada',
                    nota: Math.floor(Math.random() * 3) + 14, // 14-17
                    fecha: new Date(2024, bimestre.id * 2, 8),
                    peso: 0.3
                  },
                  {
                    id: `${estudiante.id}-${materia.id}-${bimestre.id}-3`,
                    tipo: 'Tarea',
                    descripcion: 'Trabajo Grupal',
                    nota: Math.floor(Math.random() * 3) + 15, // 15-18
                    fecha: new Date(2024, bimestre.id * 2, 22),
                    peso: 0.2
                  },
                  {
                    id: `${estudiante.id}-${materia.id}-${bimestre.id}-4`,
                    tipo: 'Participación',
                    descripcion: 'Participación en Clase',
                    nota: Math.floor(Math.random() * 3) + 16, // 16-19
                    fecha: new Date(2024, bimestre.id * 2, 30),
                    peso: 0.1
                  }
                )
              }

              // Calcular promedio ponderado
              const notaPromedio = evaluaciones.reduce((sum, evaluacion) => sum + (evaluacion.nota * evaluacion.peso), 0)

              calificaciones.push({
                id: `${estudiante.id}-${materia.id}-${bimestre.id}`,
                estudianteId: estudiante.id,
                estudiante: estudiante.nombre,
                grado: estudiante.grado,
                seccion: estudiante.seccion,
                materiaId: materia.id,
                materia: materia.nombre,
                profesor: materia.profesor,
                bimestreId: bimestre.id,
                bimestre: bimestre.nombre,
                evaluaciones,
                promedio: Math.round(notaPromedio * 100) / 100,
                estado: notaPromedio >= 13 ? 'aprobado' : 'desaprobado',
                observaciones: notaPromedio >= 17 ? 'Excelente rendimiento' : 
                              notaPromedio >= 15 ? 'Buen rendimiento' :
                              notaPromedio >= 13 ? 'Rendimiento regular' : 'Necesita refuerzo',
                fechaActualizacion: new Date()
              })
            }
          })
        })
      })

      set({ 
        calificaciones,
        materias,
        bimestres,
        cargando: false 
      })
    }, 800)
  },

  obtenerCalificacionesPorFiltros: () => {
    const { calificaciones, filtros } = get()
    let resultado = [...calificaciones]

    // Filtrar por bimestre
    if (filtros.bimestre !== 'all') {
      resultado = resultado.filter(cal => cal.bimestreId === parseInt(filtros.bimestre))
    }

    // Filtrar por materia
    if (filtros.materia !== 'all') {
      resultado = resultado.filter(cal => cal.materiaId === parseInt(filtros.materia))
    }

    // Filtrar por estudiante
    if (filtros.estudiante !== 'all') {
      resultado = resultado.filter(cal => cal.estudianteId === parseInt(filtros.estudiante))
    }

    return resultado
  },

  buscarCalificaciones: (termino) => {
    const { calificaciones } = get()
    if (!termino.trim()) return calificaciones

    const terminoLower = termino.toLowerCase()
    return calificaciones.filter(cal =>
      cal.estudiante.toLowerCase().includes(terminoLower) ||
      cal.materia.toLowerCase().includes(terminoLower) ||
      cal.profesor.toLowerCase().includes(terminoLower) ||
      cal.bimestre.toLowerCase().includes(terminoLower)
    )
  },

  actualizarFiltros: (nuevosFiltros) => {
    set({ filtros: { ...get().filtros, ...nuevosFiltros } })
  },

  obtenerEstadisticas: () => {
    const { calificaciones } = get()
    
    if (calificaciones.length === 0) {
      return {
        promedioGeneral: 0,
        materiasPendientes: 0,
        materiasAprobadas: 0,
        materiasDesaprobadas: 0,
        notaMasAlta: 0,
        notaMasBaja: 0,
        porEstudiante: {}
      }
    }

    const promedios = calificaciones.map(cal => cal.promedio)
    const promedioGeneral = promedios.reduce((sum, nota) => sum + nota, 0) / promedios.length

    const aprobadas = calificaciones.filter(cal => cal.promedio >= 13).length
    const desaprobadas = calificaciones.filter(cal => cal.promedio < 13).length

    // Estadísticas por estudiante
    const porEstudiante = {}
    calificaciones.forEach(cal => {
      if (!porEstudiante[cal.estudianteId]) {
        porEstudiante[cal.estudianteId] = {
          nombre: cal.estudiante,
          grado: cal.grado,
          promedio: 0,
          aprobadas: 0,
          desaprobadas: 0,
          total: 0
        }
      }
      
      const estudiante = porEstudiante[cal.estudianteId]
      estudiante.total++
      estudiante.promedio = (estudiante.promedio * (estudiante.total - 1) + cal.promedio) / estudiante.total
      
      if (cal.promedio >= 13) {
        estudiante.aprobadas++
      } else {
        estudiante.desaprobadas++
      }
    })

    return {
      promedioGeneral: Math.round(promedioGeneral * 100) / 100,
      materiasPendientes: calificaciones.filter(cal => !cal.bimestre.includes('III') && !cal.bimestre.includes('IV')).length,
      materiasAprobadas: aprobadas,
      materiasDesaprobadas: desaprobadas,
      notaMasAlta: Math.max(...promedios),
      notaMasBaja: Math.min(...promedios),
      porEstudiante
    }
  },

  obtenerProgresoMateria: (materiaId, estudianteId) => {
    const { calificaciones } = get()
    const notasMateria = calificaciones
      .filter(cal => cal.materiaId === materiaId && cal.estudianteId === estudianteId)
      .sort((a, b) => a.bimestreId - b.bimestreId)

    return {
      notas: notasMateria.map(cal => cal.promedio),
      bimestres: notasMateria.map(cal => cal.bimestre),
      tendencia: notasMateria.length > 1 ? 
        (notasMateria[notasMateria.length - 1].promedio > notasMateria[0].promedio ? 'mejorando' : 'empeorando') : 'estable'
    }
  },

  // Obtener promedio general de un estudiante específico
  obtenerPromedioEstudiante: (estudianteId) => {
    const { calificaciones } = get()
    const calificacionesEstudiante = calificaciones.filter(cal => cal.estudianteId === estudianteId)
    
    if (calificacionesEstudiante.length === 0) {
      return null // Sin calificaciones asignadas
    }
    
    const promedioTotal = calificacionesEstudiante.reduce((sum, cal) => sum + cal.promedio, 0) / calificacionesEstudiante.length
    return Math.round(promedioTotal * 100) / 100
  },

  obtenerRankingMaterias: (estudianteId) => {
    const { calificaciones, materias } = get()
    const bimestreActual = 3 // III Bimestre activo
    
    const ranking = materias.map(materia => {
      const calificacion = calificaciones.find(cal => 
        cal.materiaId === materia.id && 
        cal.estudianteId === estudianteId && 
        cal.bimestreId === bimestreActual
      )
      
      return {
        materia: materia.nombre,
        profesor: materia.profesor,
        promedio: calificacion ? calificacion.promedio : 0,
        estado: calificacion ? calificacion.estado : 'pendiente',
        color: materia.color
      }
    }).sort((a, b) => b.promedio - a.promedio)

    return ranking
  },

  // Función requerida por Students.jsx
  getGradesByStudent: (estudianteId) => {
    const { calificaciones } = get()
    // Comparar IDs como strings para evitar problemas de tipos
    return calificaciones.filter(cal => String(cal.estudianteId) === String(estudianteId))
  },

  // Obtener calificaciones por materia
  getGradesBySubject: (subject) => {
    const { calificaciones } = get()
    return calificaciones.filter(cal => cal.materia === subject)
  },

  // Obtener estadísticas de calificaciones
  getGradeStats: () => {
    const { calificaciones } = get()
    const totalGrades = calificaciones.length
    const averageGrade = totalGrades > 0 
      ? calificaciones.reduce((sum, cal) => sum + (cal.promedio || 0), 0) / totalGrades
      : 0
    
    return {
      total: totalGrades,
      average: averageGrade,
      approved: calificaciones.filter(cal => cal.promedio >= 13).length,
      failed: calificaciones.filter(cal => cal.promedio < 13).length
    }
  },

  // Crear nueva calificación
  crearCalificacion: async (calificacionData) => {
    const { calificaciones } = get()
    
    // Generar ID único
    const nuevaCalificacion = {
      id: `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...calificacionData,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    }
    
    // Agregar a las calificaciones existentes
    set({ calificaciones: [...calificaciones, nuevaCalificacion] })
    
    // En producción, aquí se guardaría en la base de datos
    return nuevaCalificacion
  },

  // Actualizar calificación existente
  actualizarCalificacion: async (calificacionId, actualizaciones) => {
    const { calificaciones } = get()
    
    const calificacionesActualizadas = calificaciones.map(cal => {
      if (cal.id === calificacionId) {
        return {
          ...cal,
          ...actualizaciones,
          fechaActualizacion: new Date().toISOString()
        }
      }
      return cal
    })
    
    set({ calificaciones: calificacionesActualizadas })
    
    // En producción, aquí se actualizaría en la base de datos
    return calificacionesActualizadas.find(cal => cal.id === calificacionId)
  },

  // Eliminar calificación
  eliminarCalificacion: async (calificacionId) => {
    const { calificaciones } = get()
    
    const calificacionesFiltradas = calificaciones.filter(cal => cal.id !== calificacionId)
    set({ calificaciones: calificacionesFiltradas })
    
    // En producción, aquí se eliminaría de la base de datos
    return true
  },

  // Obtener calificaciones por estudiante y materia
  obtenerCalificacionesPorEstudianteMateria: (estudianteId, materia) => {
    const { calificaciones } = get()
    return calificaciones.filter(cal => 
      cal.estudianteId === estudianteId && 
      cal.materia === materia
    )
  },

  // Exportar calificaciones a Excel
  exportarCalificaciones: async (formato = 'excel') => {
    const { calificaciones } = get()
    
    try {
      // Importar dinámicamente el exportador
      const { ExcelExporter } = await import('../utils/excelExporter')
      
      // Preparar datos con información completa
      const datosCompletos = calificaciones.map(cal => ({
        ...cal,
        nombreEstudiante: cal.estudiante,
        tipoEvaluacion: cal.evaluaciones?.[0]?.tipo || 'Evaluación',
        descripcion: cal.evaluaciones?.[0]?.descripcion || 'Sin descripción',
        nota: cal.evaluaciones?.[0]?.nota || cal.promedio,
        peso: cal.evaluaciones?.[0]?.peso || 1,
        fecha: cal.evaluaciones?.[0]?.fecha || cal.fecha || new Date().toISOString(),
        observaciones: cal.observaciones || 'Sin observaciones'
      }))
      
      // Exportar con formato real
      const resultado = ExcelExporter.exportarCalificaciones(datosCompletos)
      
      if (resultado.success) {
        return resultado
      } else {
        throw new Error(resultado.error)
      }
      
    } catch (error) {
      console.error('Error en exportación:', error)
      return {
        success: false,
        error: error.message || 'Error al exportar calificaciones',
        mensaje: 'No se pudo completar la exportación'
      }
    }
  },

  // Obtener calificaciones por bimestre para el nuevo dashboard
  obtenerCalificacionesPorBimestre: (estudianteId, bimestre) => {
    const { calificaciones, materias } = get()
    
    // Mapear ID de bimestre a número
    const bimestreMap = {
      'bim1': 1,
      'bim2': 2,
      'bim3': 3,
      'bim4': 4,
      'final': 'final'
    }
    
    const bimestreId = bimestreMap[bimestre]
    
    if (bimestreId === 'final') {
      // Para nota final, retornar estructura especial
      return materias.map(materia => ({
        materia: materia.id === 1 ? 'MAT' : 
                materia.id === 2 ? 'COM' :
                materia.id === 3 ? 'CYT' :
                materia.id === 4 ? 'PS' :
                materia.id === 5 ? 'ART' :
                materia.id === 6 ? 'EF' :
                materia.id === 7 ? 'ING' : 'REL',
        materiaNombre: materia.nombre,
        nota: 0, // Se calculará con calcularNotaFinal
        esFinal: true
      }))
    }
    
    // Para bimestres normales
    const calificacionesBimestre = calificaciones.filter(cal => 
      cal.estudianteId === estudianteId && 
      cal.bimestreId === bimestreId
    )
    
    return calificacionesBimestre.map(cal => ({
      materia: cal.materiaId === 1 ? 'MAT' : 
              cal.materiaId === 2 ? 'COM' :
              cal.materiaId === 3 ? 'CYT' :
              cal.materiaId === 4 ? 'PS' :
              cal.materiaId === 5 ? 'ART' :
              cal.materiaId === 6 ? 'EF' :
              cal.materiaId === 7 ? 'ING' : 'REL',
      materiaNombre: cal.materia,
      nota: cal.promedio,
      bimestre: cal.bimestre,
      evaluaciones: cal.evaluaciones
    }))
  },

  // Calcular promedio general por bimestre
  calcularPromedioGeneral: (estudianteId, bimestre) => {
    const notas = get().obtenerCalificacionesPorBimestre(estudianteId, bimestre)
    if (notas.length === 0) return 0
    
    const notasValidas = notas.filter(n => n.nota > 0)
    if (notasValidas.length === 0) return 0
    
    const suma = notasValidas.reduce((acc, n) => acc + n.nota, 0)
    return Math.round((suma / notasValidas.length) * 10) / 10
  },

  // Calcular nota final de una materia
  calcularNotaFinal: (estudianteId, materiaCode) => {
    const { calificaciones } = get()
    
    // Mapear código de materia a ID
    const materiaMap = {
      'MAT': 1, 'COM': 2, 'CYT': 3, 'PS': 4,
      'ART': 5, 'EF': 6, 'ING': 7, 'REL': 8
    }
    
    const materiaId = materiaMap[materiaCode]
    if (!materiaId) return 0
    
    // Obtener notas de todos los bimestres para esta materia
    const notasBimestres = calificaciones
      .filter(cal => 
        cal.estudianteId === estudianteId && 
        cal.materiaId === materiaId
      )
      .sort((a, b) => a.bimestreId - b.bimestreId)
    
    if (notasBimestres.length === 0) return 0
    
    // Calcular promedio simple de los bimestres
    const suma = notasBimestres.reduce((acc, cal) => acc + cal.promedio, 0)
    return Math.round((suma / notasBimestres.length) * 10) / 10
  },

  // Registrar una nueva nota
  registrarNota: async (notaData) => {
    const { calificaciones } = get()
    
    // Mapear código de materia a ID
    const materiaMap = {
      'MAT': 1, 'COM': 2, 'CYT': 3, 'PS': 4,
      'ART': 5, 'EF': 6, 'ING': 7, 'REL': 8
    }
    
    // Mapear bimestre a ID
    const bimestreMap = {
      'bim1': 1, 'bim2': 2, 'bim3': 3, 'bim4': 4
    }
    
    const materiaId = materiaMap[notaData.materia]
    const bimestreId = bimestreMap[notaData.bimestre]
    
    // Buscar si ya existe una calificación para este estudiante/materia/bimestre
    const calificacionExistente = calificaciones.find(cal =>
      cal.estudianteId === notaData.estudianteId &&
      cal.materiaId === materiaId &&
      cal.bimestreId === bimestreId
    )
    
    if (calificacionExistente) {
      // Actualizar la calificación existente
      return await get().actualizarCalificacion(calificacionExistente.id, {
        promedio: notaData.nota,
        fechaActualizacion: notaData.fecha || new Date(),
        evaluaciones: [{
          id: `eval_${Date.now()}`,
          tipo: 'Manual',
          descripcion: 'Nota registrada por profesor',
          nota: notaData.nota,
          fecha: notaData.fecha || new Date(),
          peso: 1
        }]
      })
    } else {
      // Crear nueva calificación
      const materias = get().materias
      const bimestres = get().bimestres
      const materia = materias.find(m => m.id === materiaId)
      const bimestre = bimestres.find(b => b.id === bimestreId)
      
      const estudiante = DatabaseQueries.getAllStudents().find(e => e.id === notaData.estudianteId)
      
      return await get().crearCalificacion({
        estudianteId: notaData.estudianteId,
        estudiante: estudiante?.nombre || 'Estudiante',
        grado: estudiante?.grado || '',
        seccion: estudiante?.seccion || '',
        materiaId: materiaId,
        materia: materia?.nombre || '',
        profesor: materia?.profesor || '',
        bimestreId: bimestreId,
        bimestre: bimestre?.nombre || '',
        evaluaciones: [{
          id: `eval_${Date.now()}`,
          tipo: 'Manual',
          descripcion: 'Nota registrada por profesor',
          nota: notaData.nota,
          fecha: notaData.fecha || new Date(),
          peso: 1
        }],
        promedio: notaData.nota,
        estado: notaData.nota >= 13 ? 'aprobado' : 'desaprobado',
        observaciones: notaData.nota >= 17 ? 'Excelente rendimiento' : 
                      notaData.nota >= 15 ? 'Buen rendimiento' :
                      notaData.nota >= 13 ? 'Rendimiento regular' : 'Necesita refuerzo',
        fechaActualizacion: notaData.fecha || new Date()
      })
    }
  }
}))

export default useGradesStore