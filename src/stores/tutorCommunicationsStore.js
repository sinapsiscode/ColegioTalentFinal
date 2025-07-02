import { create } from 'zustand'

const useTutorCommunicationsStore = create((set, get) => ({
  comunicados: [],
  cargando: false,
  filtros: {
    categoria: 'all',
    prioridad: 'all',
    estado: 'all',
    audiencia: 'all'
  },
  
  cargarComunicados: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const comunicados = [
        {
          id: 1,
          titulo: 'Cronograma de Evaluaciones - III Bimestre',
          contenido: 'Estimados padres de familia de 5to Grado Sección A, espero se encuentren muy bien. Por medio del presente les informo el cronograma de evaluaciones correspondiente al III Bimestre: \n\nSemana del 29 enero al 2 febrero:\n- Martes 30: Examen de Fracciones Decimales\n- Jueves 1: Práctica calificada de Geometría\n\nSemana del 5 al 9 febrero:\n- Martes 7: Examen de Resolución de Problemas\n- Viernes 9: Presentación de Proyecto Matemático\n\nPor favor asegurar que los estudiantes repasen los temas vistos en clase. Cualquier consulta, estaré disponible en horario de tutoría.',
          categoria: 'academico',
          prioridad: 'alta',
          fecha: new Date('2024-01-23T08:00:00'),
          autor: 'María García',
          estado: 'publicado',
          audiencia: '5to-a',
          dirigidoA: ['Padres de 5to A'],
          etiquetas: ['evaluaciones', 'cronograma', 'matemáticas', 'III bimestre'],
          adjuntos: [
            { nombre: 'cronograma_evaluaciones_5toA.pdf', tipo: 'pdf', tamaño: '156 KB' }
          ],
          leido: true,
          fechaPublicacion: new Date('2024-01-23T08:00:00'),
          vistas: 24,
          respuestas: 3
        },
        {
          id: 2,
          titulo: 'Reunión de Padres - Seguimiento Académico',
          contenido: 'Estimados padres de familia, los invito cordialmente a la reunión de seguimiento académico que se realizará el próximo viernes 26 de enero a las 6:00 PM en el aula 205. \n\nTemas a tratar:\n1. Avances del II Bimestre\n2. Estrategias de refuerzo para estudiantes con dificultades\n3. Preparación para el III Bimestre\n4. Proyecto interdisciplinario con Educación Física\n5. Espacio para preguntas y sugerencias\n\nEs muy importante su asistencia para coordinar el apoyo que necesitan nuestros estudiantes. Por favor confirmar su asistencia respondiendo a este comunicado.',
          categoria: 'reunion',
          prioridad: 'alta',
          fecha: new Date('2024-01-22T16:30:00'),
          autor: 'María García',
          estado: 'publicado',
          audiencia: '5to-a',
          dirigidoA: ['Padres de 5to A'],
          etiquetas: ['reunión', 'seguimiento', 'padres', 'académico'],
          adjuntos: [],
          leido: true,
          fechaPublicacion: new Date('2024-01-22T16:30:00'),
          vistas: 26,
          respuestas: 18
        },
        {
          id: 3,
          titulo: 'Proyecto de Matemáticas y Deportes',
          contenido: 'Queridos estudiantes y padres de familia, me complace informarles sobre un emocionante proyecto interdisciplinario que realizaremos en colaboración con el profesor Roberto Silva de Educación Física.\n\nEl proyecto "Matemáticas en el Deporte" consistirá en:\n- Recolección de datos deportivos de los estudiantes\n- Análisis estadístico de rendimiento\n- Creación de gráficos y promedios\n- Presentación final con conclusiones\n\nObjetivos:\n✓ Aplicar matemáticas en situaciones reales\n✓ Fomentar el trabajo en equipo\n✓ Desarrollar habilidades de análisis\n✓ Conectar diferentes áreas del conocimiento\n\nEl proyecto iniciará la primera semana de febrero. ¡Estamos muy emocionados!',
          categoria: 'proyecto',
          prioridad: 'media',
          fecha: new Date('2024-01-21T10:15:00'),
          autor: 'María García',
          estado: 'publicado',
          audiencia: '5to-a',
          dirigidoA: ['Estudiantes de 5to A', 'Padres de 5to A'],
          etiquetas: ['proyecto', 'interdisciplinario', 'matemáticas', 'deportes'],
          adjuntos: [
            { nombre: 'proyecto_matematicas_deportes.pdf', tipo: 'pdf', tamaño: '234 KB' },
            { nombre: 'rubrica_evaluacion.pdf', tipo: 'pdf', tamaño: '123 KB' }
          ],
          leido: true,
          fechaPublicacion: new Date('2024-01-21T10:15:00'),
          vistas: 28,
          respuestas: 8
        },
        {
          id: 4,
          titulo: 'Refuerzo Académico - Estudiantes con Dificultades',
          contenido: 'Estimados padres de familia, como parte de nuestro compromiso con la excelencia académica, he implementado un programa de refuerzo para estudiantes que necesitan apoyo adicional en matemáticas.\n\nEstrategia de refuerzo:\n• Clases de tutoría los miércoles de 3:30 a 4:30 PM\n• Ejercicios personalizados según las necesidades\n• Seguimiento semanal del progreso\n• Comunicación constante con los padres\n• Material de apoyo adicional\n\nEstudiantes convocados:\n- Diego Alexander Vargas\n- Sebastián José Morales\n\nSolicito el apoyo de los padres para garantizar la asistencia y el compromiso de los estudiantes. Juntos lograremos que alcancen su máximo potencial.',
          categoria: 'apoyo',
          prioridad: 'alta',
          fecha: new Date('2024-01-20T14:20:00'),
          autor: 'María García',
          estado: 'publicado',
          audiencia: 'especifico',
          dirigidoA: ['Patricia Mendoza', 'Carmen Morales'],
          etiquetas: ['refuerzo', 'tutoría', 'apoyo académico', 'matemáticas'],
          adjuntos: [
            { nombre: 'plan_refuerzo_academico.pdf', tipo: 'pdf', tamaño: '198 KB' }
          ],
          leido: true,
          fechaPublicacion: new Date('2024-01-20T14:20:00'),
          vistas: 6,
          respuestas: 2
        },
        {
          id: 5,
          titulo: 'Felicitaciones - Estudiantes Destacados',
          contenido: 'Es un gran placer para mí felicitar públicamente a los estudiantes que han demostrado un rendimiento excepcional durante el II Bimestre:\n\n🏆 RENDIMIENTO SOBRESALIENTE:\n• Isabella María Santos - Promedio: 19.1\n• Ana Sofía Rodríguez - Promedio: 18.5\n• Carlos Alberto Mendoza - Promedio: 16.8\n\n⭐ MEJOR PARTICIPACIÓN EN CLASE:\n• Lucía Fernanda Torres\n• Ana Sofía Rodríguez\n\n🎯 MAYOR PROGRESO:\n• Juan Pablo Vega\n• María José Herrera\n\n¡Felicitaciones a estos estudiantes ejemplares y a sus familias! Su dedicación y esfuerzo son un ejemplo para toda la clase. Sigamos trabajando juntos para mantener este excelente nivel académico.',
          categoria: 'reconocimiento',
          prioridad: 'media',
          fecha: new Date('2024-01-19T11:45:00'),
          autor: 'María García',
          estado: 'publicado',
          audiencia: '5to-a',
          dirigidoA: ['Estudiantes de 5to A', 'Padres de 5to A'],
          etiquetas: ['felicitaciones', 'reconocimiento', 'rendimiento', 'destacados'],
          adjuntos: [],
          leido: true,
          fechaPublicacion: new Date('2024-01-19T11:45:00'),
          vistas: 32,
          respuestas: 12
        },
        {
          id: 6,
          titulo: 'Material de Apoyo - Geometría Básica',
          contenido: 'Queridos estudiantes y padres, adjunto material complementario para reforzar los conceptos de geometría que estamos trabajando en clase.\n\nContenido del material:\n📐 Conceptos básicos de figuras geométricas\n📏 Cálculo de perímetros y áreas\n🔺 Propiedades de triángulos y cuadriláteros\n🎯 Ejercicios prácticos con soluciones\n📊 Problemas de aplicación\n\nRecomendaciones:\n• Revisar el material antes de cada clase\n• Practicar los ejercicios propuestos\n• Consultar dudas en horario de tutoría\n• Usar los materiales manipulables en casa\n\nRecuerden que la geometría está presente en nuestra vida diaria. ¡Observen las formas geométricas a su alrededor!',
          categoria: 'material',
          prioridad: 'media',
          fecha: new Date('2024-01-18T13:30:00'),
          autor: 'María García',
          estado: 'publicado',
          audiencia: '5to-a',
          dirigidoA: ['Estudiantes de 5to A', 'Padres de 5to A'],
          etiquetas: ['material', 'geometría', 'ejercicios', 'apoyo'],
          adjuntos: [
            { nombre: 'geometria_basica_5to.pdf', tipo: 'pdf', tamaño: '445 KB' },
            { nombre: 'ejercicios_geometria.pdf', tipo: 'pdf', tamaño: '234 KB' },
            { nombre: 'plantillas_figuras.pdf', tipo: 'pdf', tamaño: '189 KB' }
          ],
          leido: true,
          fechaPublicacion: new Date('2024-01-18T13:30:00'),
          vistas: 25,
          respuestas: 5
        },
        {
          id: 7,
          titulo: 'Horario de Tutorías - Enero 2024',
          contenido: 'Estimados padres y estudiantes, les informo mi horario de tutorías para el mes de enero, donde podrán acercarse para resolver dudas académicas o coordinar temas relacionados con el rendimiento escolar.\n\n📅 HORARIO DE TUTORÍAS:\nLunes: 3:30 - 4:30 PM - Consultas generales\nMiércoles: 3:30 - 4:30 PM - Refuerzo académico\nViernes: 3:30 - 4:30 PM - Reuniones con padres\n\n📝 MODALIDADES:\n• Tutoría individual para estudiantes\n• Reuniones con padres (previa cita)\n• Refuerzo grupal (máximo 4 estudiantes)\n• Consultas académicas\n\n📞 COORDINACIÓN:\nPara agendar citas, por favor escribir al WhatsApp institucional o enviar mensaje por la plataforma. Las tutorías son gratuitas y parte del compromiso educativo.',
          categoria: 'informacion',
          prioridad: 'baja',
          fecha: new Date('2024-01-17T09:00:00'),
          autor: 'María García',
          estado: 'publicado',
          audiencia: '5to-a',
          dirigidoA: ['Padres de 5to A', 'Estudiantes de 5to A'],
          etiquetas: ['tutoría', 'horarios', 'consultas', 'apoyo'],
          adjuntos: [],
          leido: true,
          fechaPublicacion: new Date('2024-01-17T09:00:00'),
          vistas: 20,
          respuestas: 4
        },
        {
          id: 8,
          titulo: 'BORRADOR - Comunicado sobre Feria de Ciencias',
          contenido: 'Estimados padres y estudiantes, me complace informarles que participaremos en la Feria de Ciencias Integrada que se realizará en marzo...\n\n[BORRADOR EN DESARROLLO]\n\nTemas propuestos:\n- Matemáticas aplicadas en la vida cotidiana\n- Estadísticas deportivas\n- Geometría en la arquitectura\n\nEste comunicado será completado y publicado próximamente.',
          categoria: 'evento',
          prioridad: 'media',
          fecha: new Date('2024-01-23T15:45:00'),
          autor: 'María García',
          estado: 'borrador',
          audiencia: '5to-a',
          dirigidoA: ['Estudiantes de 5to A', 'Padres de 5to A'],
          etiquetas: ['feria', 'ciencias', 'marzo', 'borrador'],
          adjuntos: [],
          leido: false,
          fechaPublicacion: null,
          vistas: 0,
          respuestas: 0
        }
      ]
      
      set({ 
        comunicados,
        cargando: false 
      })
    }, 600)
  },
  
  crearComunicado: (nuevoComunicado) => {
    const { comunicados } = get()
    const comunicado = {
      id: Date.now(),
      ...nuevoComunicado,
      fecha: new Date(),
      autor: 'María García',
      vistas: 0,
      respuestas: 0,
      leido: false,
      fechaPublicacion: nuevoComunicado.estado === 'publicado' ? new Date() : null
    }
    
    set({ comunicados: [comunicado, ...comunicados] })
    return comunicado.id
  },
  
  editarComunicado: (comunicadoId, cambios) => {
    const { comunicados } = get()
    const nuevosComunicados = comunicados.map(com => 
      com.id === comunicadoId 
        ? { 
            ...com, 
            ...cambios,
            fechaPublicacion: cambios.estado === 'publicado' && !com.fechaPublicacion ? new Date() : com.fechaPublicacion
          }
        : com
    )
    set({ comunicados: nuevosComunicados })
  },
  
  eliminarComunicado: (comunicadoId) => {
    const { comunicados } = get()
    const nuevosComunicados = comunicados.filter(com => com.id !== comunicadoId)
    set({ comunicados: nuevosComunicados })
  },
  
  publicarComunicado: (comunicadoId) => {
    const { comunicados } = get()
    const nuevosComunicados = comunicados.map(com => 
      com.id === comunicadoId 
        ? { ...com, estado: 'publicado', fechaPublicacion: new Date() }
        : com
    )
    set({ comunicados: nuevosComunicados })
  },
  
  marcarComoLeido: (comunicadoId) => {
    const { comunicados } = get()
    const nuevosComunicados = comunicados.map(com => 
      com.id === comunicadoId ? { ...com, leido: true } : com
    )
    set({ comunicados: nuevosComunicados })
  },
  
  obtenerComunicadosPorFiltros: () => {
    const { comunicados, filtros } = get()
    let resultado = [...comunicados]
    
    // Filtrar por categoría
    if (filtros.categoria !== 'all') {
      resultado = resultado.filter(com => com.categoria === filtros.categoria)
    }
    
    // Filtrar por prioridad
    if (filtros.prioridad !== 'all') {
      resultado = resultado.filter(com => com.prioridad === filtros.prioridad)
    }
    
    // Filtrar por estado
    if (filtros.estado !== 'all') {
      resultado = resultado.filter(com => com.estado === filtros.estado)
    }
    
    // Filtrar por audiencia
    if (filtros.audiencia !== 'all') {
      resultado = resultado.filter(com => com.audiencia === filtros.audiencia)
    }
    
    // Ordenar por fecha (más reciente primero)
    resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    
    return resultado
  },
  
  buscarComunicados: (termino) => {
    const { comunicados } = get()
    if (!termino.trim()) return comunicados
    
    const terminoLower = termino.toLowerCase()
    return comunicados.filter(com =>
      com.titulo.toLowerCase().includes(terminoLower) ||
      com.contenido.toLowerCase().includes(terminoLower) ||
      com.etiquetas.some(tag => tag.toLowerCase().includes(terminoLower))
    )
  },
  
  actualizarFiltros: (nuevosFiltros) => {
    set({ filtros: { ...get().filtros, ...nuevosFiltros } })
  },
  
  obtenerEstadisticas: () => {
    const { comunicados } = get()
    
    return {
      total: comunicados.length,
      publicados: comunicados.filter(com => com.estado === 'publicado').length,
      borradores: comunicados.filter(com => com.estado === 'borrador').length,
      programados: comunicados.filter(com => com.estado === 'programado').length,
      totalVistas: comunicados.reduce((sum, com) => sum + com.vistas, 0),
      totalRespuestas: comunicados.reduce((sum, com) => sum + com.respuestas, 0),
      porCategoria: {
        academico: comunicados.filter(com => com.categoria === 'academico').length,
        reunion: comunicados.filter(com => com.categoria === 'reunion').length,
        proyecto: comunicados.filter(com => com.categoria === 'proyecto').length,
        apoyo: comunicados.filter(com => com.categoria === 'apoyo').length,
        reconocimiento: comunicados.filter(com => com.categoria === 'reconocimiento').length,
        material: comunicados.filter(com => com.categoria === 'material').length,
        informacion: comunicados.filter(com => com.categoria === 'informacion').length,
        evento: comunicados.filter(com => com.categoria === 'evento').length
      },
      porPrioridad: {
        alta: comunicados.filter(com => com.prioridad === 'alta').length,
        media: comunicados.filter(com => com.prioridad === 'media').length,
        baja: comunicados.filter(com => com.prioridad === 'baja').length
      }
    }
  },
  
  duplicarComunicado: (comunicadoId) => {
    const { comunicados } = get()
    const comunicadoOriginal = comunicados.find(com => com.id === comunicadoId)
    
    if (comunicadoOriginal) {
      const comunicadoDuplicado = {
        ...comunicadoOriginal,
        id: Date.now(),
        titulo: `Copia de ${comunicadoOriginal.titulo}`,
        estado: 'borrador',
        fecha: new Date(),
        fechaPublicacion: null,
        vistas: 0,
        respuestas: 0,
        leido: false
      }
      
      set({ comunicados: [comunicadoDuplicado, ...comunicados] })
      return comunicadoDuplicado.id
    }
  },
  
  obtenerAnalytics: () => {
    const { comunicados } = get()
    const publicados = comunicados.filter(com => com.estado === 'publicado')
    
    if (publicados.length === 0) return null
    
    const promedioVistas = publicados.reduce((sum, com) => sum + com.vistas, 0) / publicados.length
    const promedioRespuestas = publicados.reduce((sum, com) => sum + com.respuestas, 0) / publicados.length
    
    const masVisto = publicados.reduce((max, com) => com.vistas > max.vistas ? com : max)
    const masRespondido = publicados.reduce((max, com) => com.respuestas > max.respuestas ? com : max)
    
    return {
      promedioVistas: Math.round(promedioVistas * 100) / 100,
      promedioRespuestas: Math.round(promedioRespuestas * 100) / 100,
      masVisto,
      masRespondido,
      engagementRate: publicados.length > 0 ? Math.round((promedioRespuestas / promedioVistas) * 100) : 0
    }
  }
}))

export default useTutorCommunicationsStore