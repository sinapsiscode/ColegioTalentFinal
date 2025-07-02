import { create } from 'zustand'

const usePaymentConceptsStore = create((set, get) => ({
  conceptos: [
    {
      id: 1,
      nombre: 'Pensión Enero 2024',
      categoria: 'pension',
      monto: 350.00,
      activo: true,
      obligatorio: true,
      fechaVencimiento: '2024-01-31',
      descripcion: 'Pago de pensión correspondiente al mes de enero',
      fechaCreacion: '2024-01-01T00:00:00'
    },
    {
      id: 2,
      nombre: 'Pensión Febrero 2024',
      categoria: 'pension',
      monto: 350.00,
      activo: true,
      obligatorio: true,
      fechaVencimiento: '2024-02-29',
      descripcion: 'Pago de pensión correspondiente al mes de febrero',
      fechaCreacion: '2024-01-15T00:00:00'
    },
    {
      id: 3,
      nombre: 'Matrícula 2024',
      categoria: 'matricula',
      monto: 200.00,
      activo: true,
      obligatorio: true,
      fechaVencimiento: '2024-03-15',
      descripcion: 'Pago de matrícula para el año escolar 2024',
      fechaCreacion: '2024-01-01T00:00:00'
    },
    {
      id: 4,
      nombre: 'Uniforme Escolar',
      categoria: 'articulo',
      monto: 120.00,
      activo: true,
      obligatorio: false,
      fechaVencimiento: null,
      descripcion: 'Compra de uniforme escolar completo',
      fechaCreacion: '2024-01-10T00:00:00'
    },
    {
      id: 5,
      nombre: 'Salida Pedagógica - Museo',
      categoria: 'actividad',
      monto: 45.00,
      activo: true,
      obligatorio: false,
      fechaVencimiento: '2024-02-15',
      descripcion: 'Visita educativa al Museo Nacional de Historia',
      fechaCreacion: '2024-01-20T00:00:00'
    },
    {
      id: 6,
      nombre: 'Material Didáctico',
      categoria: 'articulo',
      monto: 80.00,
      activo: true,
      obligatorio: false,
      fechaVencimiento: '2024-02-28',
      descripcion: 'Kit de materiales didácticos para el primer bimestre',
      fechaCreacion: '2024-01-15T00:00:00'
    },
    {
      id: 7,
      nombre: 'Festival de Talentos 2024',
      categoria: 'evento',
      monto: 25.00,
      activo: true,
      obligatorio: false,
      fechaVencimiento: '2024-02-10',
      descripcion: 'Participación en el Festival de Talentos anual',
      fechaCreacion: '2024-01-18T00:00:00'
    },
    {
      id: 8,
      nombre: 'Desayuno Escolar',
      categoria: 'alimentacion',
      monto: 15.00,
      activo: false,
      obligatorio: false,
      fechaVencimiento: null,
      descripcion: 'Servicio de desayuno escolar diario',
      fechaCreacion: '2024-01-05T00:00:00'
    }
  ],

  filtros: {
    categoria: 'todos',
    activo: 'todos',
    obligatorio: 'todos'
  },

  getConceptosActivos: () => {
    const { conceptos } = get()
    return conceptos.filter(concepto => concepto.activo)
  },

  getConceptosPorCategoria: (categoria) => {
    const { conceptos } = get()
    if (categoria === 'todos') return conceptos
    return conceptos.filter(concepto => concepto.categoria === categoria)
  },

  getConceptosObligatorios: () => {
    const { conceptos } = get()
    return conceptos.filter(concepto => concepto.activo && concepto.obligatorio)
  },

  getConceptosVencidos: () => {
    const { conceptos } = get()
    const hoy = new Date().toISOString().split('T')[0]
    return conceptos.filter(concepto => 
      concepto.activo && 
      concepto.fechaVencimiento && 
      concepto.fechaVencimiento < hoy
    )
  },

  crearConcepto: (conceptoData) => {
    const { conceptos } = get()
    const nuevoConcepto = {
      id: Date.now(),
      ...conceptoData,
      fechaCreacion: new Date().toISOString(),
      activo: true
    }
    
    set({ conceptos: [...conceptos, nuevoConcepto] })
    return nuevoConcepto
  },

  actualizarConcepto: (id, conceptoData) => {
    const { conceptos } = get()
    const conceptosActualizados = conceptos.map(concepto =>
      concepto.id === id ? { ...concepto, ...conceptoData } : concepto
    )
    
    set({ conceptos: conceptosActualizados })
  },

  activarConcepto: (id) => {
    const { actualizarConcepto } = get()
    actualizarConcepto(id, { activo: true })
  },

  desactivarConcepto: (id) => {
    const { actualizarConcepto } = get()
    actualizarConcepto(id, { activo: false })
  },

  eliminarConcepto: (id) => {
    const { conceptos } = get()
    const conceptosActualizados = conceptos.filter(concepto => concepto.id !== id)
    set({ conceptos: conceptosActualizados })
  },

  setFiltros: (nuevosFiltros) => {
    const { filtros } = get()
    set({ filtros: { ...filtros, ...nuevosFiltros } })
  },

  getConceptosFiltrados: () => {
    const { conceptos, filtros } = get()
    
    return conceptos.filter(concepto => {
      const cumpleCategoria = filtros.categoria === 'todos' || concepto.categoria === filtros.categoria
      const cumpleActivo = filtros.activo === 'todos' || 
        (filtros.activo === 'activo' && concepto.activo) ||
        (filtros.activo === 'inactivo' && !concepto.activo)
      const cumpleObligatorio = filtros.obligatorio === 'todos' ||
        (filtros.obligatorio === 'obligatorio' && concepto.obligatorio) ||
        (filtros.obligatorio === 'opcional' && !concepto.obligatorio)
      
      return cumpleCategoria && cumpleActivo && cumpleObligatorio
    })
  },

  getEstadisticasConceptos: () => {
    const { conceptos } = get()
    
    const total = conceptos.length
    const activos = conceptos.filter(c => c.activo).length
    const obligatorios = conceptos.filter(c => c.obligatorio).length
    const vencidos = get().getConceptosVencidos().length
    
    const categorias = {}
    conceptos.forEach(concepto => {
      if (!categorias[concepto.categoria]) {
        categorias[concepto.categoria] = 0
      }
      categorias[concepto.categoria]++
    })
    
    return {
      total,
      activos,
      obligatorios,
      vencidos,
      categorias,
      porcentajeActivos: total > 0 ? Math.round((activos / total) * 100) : 0
    }
  }
}))

export default usePaymentConceptsStore