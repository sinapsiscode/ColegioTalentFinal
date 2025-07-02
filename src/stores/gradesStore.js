import { create } from 'zustand'

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

      // Estudiantes de la familia (Carlos Rodríguez tiene 2 hijos)
      const estudiantes = [
        { id: 1, nombre: 'Ana Sofía Rodríguez', grado: '5to Grado', seccion: 'A' },
        { id: 2, nombre: 'Luis Miguel Rodríguez', grado: '3er Grado', seccion: 'B' }
      ]

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
  }
}))

export default useGradesStore