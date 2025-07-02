import { create } from 'zustand'

const useCommunicationsStore = create((set, get) => ({
  comunicados: [],
  cargando: false,
  filtros: {
    categoria: 'all',
    prioridad: 'all',
    leido: 'all'
  },
  
  cargarComunicados: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const comunicados = [
        {
          id: 1,
          titulo: 'Reunión de Padres de Familia - Primer Trimestre',
          contenido: 'Estimados padres de familia, les informamos que el próximo viernes 26 de enero tendremos la reunión de padres del primer trimestre. La reunión iniciará a las 7:00 PM en el auditorio principal del colegio. Se tratarán temas importantes sobre el rendimiento académico de los estudiantes y actividades del segundo trimestre.',
          categoria: 'reuniones',
          prioridad: 'alta',
          fecha: new Date('2024-01-20T14:00:00'),
          autor: 'Dirección Académica',
          leido: false,
          adjuntos: [
            { nombre: 'agenda_reunion.pdf', tipo: 'pdf', tamaño: '234 KB' }
          ],
          dirigidoA: ['padres'],
          etiquetas: ['reunión', 'primer trimestre', 'académico']
        },
        {
          id: 2,
          titulo: 'Cambio de Horarios - Semana del 22 al 26 de Enero',
          contenido: 'Debido a actividades especiales de inicio de año, informamos los siguientes cambios de horarios para la próxima semana: Lunes 22: Inicio de clases 8:30 AM (30 minutos más tarde). Martes 23: Salida temprana 2:00 PM. Miércoles 24: Horario normal. Jueves 25: Actividad especial "Día del Deporte" - Traer ropa deportiva. Viernes 26: Reunión de padres 7:00 PM.',
          categoria: 'horarios',
          prioridad: 'media',
          fecha: new Date('2024-01-19T16:30:00'),
          autor: 'Coordinación Académica',
          leido: true,
          adjuntos: [],
          dirigidoA: ['padres', 'estudiantes'],
          etiquetas: ['horarios', 'cambios', 'semana especial']
        },
        {
          id: 3,
          titulo: 'Campaña de Útiles Escolares para Estudiantes de Bajos Recursos',
          contenido: 'El colegio Talentos está organizando una campaña solidaria para recolectar útiles escolares que serán donados a estudiantes de familias de bajos recursos. Los útiles que más se necesitan son: cuadernos, lápices, colores, reglas, borradores y mochilas. La recolección se realizará del 25 de enero al 5 de febrero en la recepción del colegio.',
          categoria: 'eventos',
          prioridad: 'baja',
          fecha: new Date('2024-01-18T10:00:00'),
          autor: 'Departamento de Bienestar Estudiantil',
          leido: true,
          adjuntos: [
            { nombre: 'lista_utiles.pdf', tipo: 'pdf', tamaño: '156 KB' },
            { nombre: 'volante_campaña.jpg', tipo: 'imagen', tamaño: '89 KB' }
          ],
          dirigidoA: ['padres', 'comunidad'],
          etiquetas: ['solidaridad', 'útiles', 'campaña']
        },
        {
          id: 4,
          titulo: 'Protocolo de Seguridad y Salud - Actualización',
          contenido: 'Estimada comunidad educativa, hemos actualizado nuestros protocolos de seguridad y salud. Los principales cambios incluyen: 1) Nuevo sistema de identificación con códigos QR para el ingreso al colegio. 2) Puntos de desinfección en todas las aulas. 3) Horarios escalonados para el recreo. 4) Procedimientos actualizados en caso de emergencia. Todos los estudiantes recibirán capacitación la próxima semana.',
          categoria: 'seguridad',
          prioridad: 'alta',
          fecha: new Date('2024-01-17T09:00:00'),
          autor: 'Dirección General',
          leido: false,
          adjuntos: [
            { nombre: 'protocolo_seguridad_2024.pdf', tipo: 'pdf', tamaño: '445 KB' }
          ],
          dirigidoA: ['padres', 'estudiantes', 'personal'],
          etiquetas: ['seguridad', 'salud', 'protocolo', 'actualización']
        },
        {
          id: 5,
          titulo: 'Excursión Educativa - Museo de Ciencias Naturales',
          contenido: 'Los estudiantes de 4to y 5to grado realizarán una excursión educativa al Museo de Ciencias Naturales el próximo martes 30 de enero. La salida será a las 8:00 AM desde el colegio y el regreso está programado para las 4:00 PM. El costo de la excursión es de S/. 25 por estudiante (incluye transporte, entrada al museo y almuerzo). Por favor enviar la autorización firmada y el pago antes del viernes 26.',
          categoria: 'actividades',
          prioridad: 'media',
          fecha: new Date('2024-01-16T11:30:00'),
          autor: 'Coordinación de Ciencias',
          leido: true,
          adjuntos: [
            { nombre: 'autorizacion_excursion.pdf', tipo: 'pdf', tamaño: '187 KB' },
            { nombre: 'itinerario_museo.pdf', tipo: 'pdf', tamaño: '234 KB' }
          ],
          dirigidoA: ['padres-4to', 'padres-5to'],
          etiquetas: ['excursión', 'museo', 'ciencias', '4to grado', '5to grado']
        },
        {
          id: 6,
          titulo: 'Resultados del Concurso de Matemáticas Inter-aulas',
          contenido: 'Felicitamos a todos los estudiantes que participaron en el Concurso de Matemáticas Inter-aulas 2024. Los resultados son: 1er lugar: Aula 5-A con 285 puntos. 2do lugar: Aula 4-B con 278 puntos. 3er lugar: Aula 5-B con 271 puntos. Todos los participantes recibirán un diploma de participación y los primeros tres lugares recibirán premios especiales en la ceremonia del próximo lunes.',
          categoria: 'resultados',
          prioridad: 'baja',
          fecha: new Date('2024-01-15T15:45:00'),
          autor: 'Departamento de Matemáticas',
          leido: true,
          adjuntos: [
            { nombre: 'resultados_completos.pdf', tipo: 'pdf', tamaño: '123 KB' }
          ],
          dirigidoA: ['padres', 'estudiantes'],
          etiquetas: ['concurso', 'matemáticas', 'resultados', 'inter-aulas']
        },
        {
          id: 7,
          titulo: 'Taller de Padres: "Apoyo Emocional en Casa"',
          contenido: 'La psicóloga educativa del colegio, Dra. Carmen Vega, dictará un taller para padres de familia sobre "Cómo brindar apoyo emocional a nuestros hijos en casa". El taller se realizará el sábado 27 de enero de 9:00 AM a 12:00 PM en el aula magna. Temas a tratar: comunicación asertiva, manejo de emociones, establecimiento de límites y fortalecimiento de la autoestima. Cupos limitados.',
          categoria: 'talleres',
          prioridad: 'media',
          fecha: new Date('2024-01-14T08:00:00'),
          autor: 'Departamento de Psicología',
          leido: false,
          adjuntos: [
            { nombre: 'programa_taller.pdf', tipo: 'pdf', tamaño: '167 KB' }
          ],
          dirigidoA: ['padres'],
          etiquetas: ['taller', 'psicología', 'apoyo emocional', 'padres']
        },
        {
          id: 8,
          titulo: 'Recordatorio: Entrega de Libretas del Primer Bimestre',
          contenido: 'Recordamos a todos los padres de familia que la entrega de libretas del primer bimestre se realizará según el siguiente cronograma: Lunes 29: 1ro y 2do grado de 2:00 PM a 4:00 PM. Martes 30: 3ro y 4to grado de 2:00 PM a 4:00 PM. Miércoles 31: 5to y 6to grado de 2:00 PM a 4:00 PM. Es importante su asistencia para conocer el rendimiento académico de sus hijos.',
          categoria: 'academico',
          prioridad: 'alta',
          fecha: new Date('2024-01-13T12:00:00'),
          autor: 'Secretaría Académica',
          leido: true,
          adjuntos: [],
          dirigidoA: ['padres'],
          etiquetas: ['libretas', 'primer bimestre', 'entrega', 'cronograma']
        }
      ]
      
      set({ 
        comunicados,
        cargando: false 
      })
    }, 600)
  },
  
  marcarComoLeido: (comunicadoId) => {
    const { comunicados } = get()
    const nuevosComunicados = comunicados.map(com => 
      com.id === comunicadoId ? { ...com, leido: true } : com
    )
    set({ comunicados: nuevosComunicados })
  },
  
  marcarComoNoLeido: (comunicadoId) => {
    const { comunicados } = get()
    const nuevosComunicados = comunicados.map(com => 
      com.id === comunicadoId ? { ...com, leido: false } : com
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
    
    // Filtrar por estado de lectura
    if (filtros.leido !== 'all') {
      const esLeido = filtros.leido === 'leido'
      resultado = resultado.filter(com => com.leido === esLeido)
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
      com.autor.toLowerCase().includes(terminoLower) ||
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
      noLeidos: comunicados.filter(com => !com.leido).length,
      porCategoria: {
        reuniones: comunicados.filter(com => com.categoria === 'reuniones').length,
        horarios: comunicados.filter(com => com.categoria === 'horarios').length,
        eventos: comunicados.filter(com => com.categoria === 'eventos').length,
        seguridad: comunicados.filter(com => com.categoria === 'seguridad').length,
        actividades: comunicados.filter(com => com.categoria === 'actividades').length,
        resultados: comunicados.filter(com => com.categoria === 'resultados').length,
        talleres: comunicados.filter(com => com.categoria === 'talleres').length,
        academico: comunicados.filter(com => com.categoria === 'academico').length
      },
      porPrioridad: {
        alta: comunicados.filter(com => com.prioridad === 'alta').length,
        media: comunicados.filter(com => com.prioridad === 'media').length,
        baja: comunicados.filter(com => com.prioridad === 'baja').length
      }
    }
  }
}))

export default useCommunicationsStore