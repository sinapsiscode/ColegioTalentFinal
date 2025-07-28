import { create } from 'zustand'

const usePaymentsStore = create((set, get) => ({
  pagos: [
    {
      id: 1,
      estudianteId: 1,
      nombreEstudiante: 'Ana Rodríguez González',
      padreEmail: 'padre1@email.com',
      concepto: 'Pensión Enero 2024',
      monto: 350.00,
      fechaVencimiento: '2024-01-31',
      fechaPago: '2024-01-28',
      estado: 'aprobado',
      metodoPago: 'transferencia',
      numeroOperacion: 'TR001234567',
      voucher: 'voucher_ana_enero.jpg',
      fechaSubida: '2024-01-28T10:30:00',
      fechaAprobacion: '2024-01-28T14:45:00',
      aprobadoPor: 'admin@talentos.edu',
      observaciones: 'Pago realizado dentro del plazo'
    },
    {
      id: 2,
      estudianteId: 2,
      nombreEstudiante: 'Luis Rodríguez González',
      padreEmail: 'padre1@email.com',
      concepto: 'Pensión Enero 2024',
      monto: 350.00,
      fechaVencimiento: '2024-01-31',
      fechaPago: '2024-01-29',
      estado: 'pendiente',
      metodoPago: 'deposito',
      numeroOperacion: 'DEP987654321',
      voucher: 'voucher_luis_enero.jpg',
      fechaSubida: '2024-01-29T16:20:00',
      fechaAprobacion: null,
      aprobadoPor: null,
      observaciones: null
    },
    {
      id: 3,
      estudianteId: 3,
      nombreEstudiante: 'Sofia Martinez López',
      padreEmail: 'padre2@email.com',
      concepto: 'Pensión Enero 2024',
      monto: 350.00,
      fechaVencimiento: '2024-01-31',
      fechaPago: null,
      estado: 'pendiente_pago',
      metodoPago: null,
      numeroOperacion: null,
      voucher: null,
      fechaSubida: null,
      fechaAprobacion: null,
      aprobadoPor: null,
      observaciones: null
    }
  ],

  filtros: {
    estado: 'todos',
    mes: '',
    estudiante: ''
  },

  getPagosPorPadre: (padreEmail) => {
    const { pagos } = get()
    return pagos.filter(pago => pago.padreEmail === padreEmail)
  },

  getPagosPorEstudiante: (estudianteId) => {
    const { pagos } = get()
    return pagos.filter(pago => pago.estudianteId === estudianteId)
  },

  getPagosPendientes: () => {
    const { pagos } = get()
    return pagos.filter(pago => pago.estado === 'pendiente')
  },

  getPagosAprobados: () => {
    const { pagos } = get()
    return pagos.filter(pago => pago.estado === 'aprobado')
  },

  getPagosRechazados: () => {
    const { pagos } = get()
    return pagos.filter(pago => pago.estado === 'rechazado')
  },

  subirVoucher: (pagoData) => {
    const { pagos } = get()
    const nuevoPago = {
      id: Date.now(),
      ...pagoData,
      estado: 'pendiente',
      fechaSubida: new Date().toISOString(),
      fechaAprobacion: null,
      aprobadoPor: null
    }
    
    set({ pagos: [...pagos, nuevoPago] })
    return nuevoPago
  },

  aprobarPago: (pagoId, aprobadoPor, observaciones = '') => {
    const { pagos } = get()
    const pagosActualizados = pagos.map(pago => 
      pago.id === pagoId 
        ? {
            ...pago,
            estado: 'aprobado',
            fechaAprobacion: new Date().toISOString(),
            aprobadoPor,
            observaciones
          }
        : pago
    )
    
    set({ pagos: pagosActualizados })
    
    // Retornar el pago actualizado
    return pagosActualizados.find(p => p.id === pagoId)
  },

  rechazarPago: (pagoId, aprobadoPor, observaciones) => {
    const { pagos } = get()
    const pagosActualizados = pagos.map(pago => 
      pago.id === pagoId 
        ? {
            ...pago,
            estado: 'rechazado',
            fechaAprobacion: new Date().toISOString(),
            aprobadoPor,
            observaciones
          }
        : pago
    )
    
    set({ pagos: pagosActualizados })
  },

  setFiltros: (nuevosFiltros) => {
    const { filtros } = get()
    set({ filtros: { ...filtros, ...nuevosFiltros } })
  },

  getPagosFiltrados: () => {
    const { pagos, filtros } = get()
    
    return pagos.filter(pago => {
      const cumpleEstado = filtros.estado === 'todos' || pago.estado === filtros.estado
      const cumpleMes = !filtros.mes || (pago.fechaPago && pago.fechaPago.includes(filtros.mes))
      const cumpleEstudiante = !filtros.estudiante || pago.nombreEstudiante.toLowerCase().includes(filtros.estudiante.toLowerCase())
      
      return cumpleEstado && cumpleMes && cumpleEstudiante
    })
  },

  getEstadisticasPagos: () => {
    const { pagos } = get()
    
    const total = pagos.length
    const aprobados = pagos.filter(p => p.estado === 'aprobado').length
    const pendientes = pagos.filter(p => p.estado === 'pendiente').length
    const rechazados = pagos.filter(p => p.estado === 'rechazado').length
    const pendientesPago = pagos.filter(p => p.estado === 'pendiente_pago').length
    
    const montoTotal = pagos
      .filter(p => p.estado === 'aprobado')
      .reduce((sum, pago) => sum + pago.monto, 0)
    
    return {
      total,
      aprobados,
      pendientes,
      rechazados,
      pendientesPago,
      montoTotal,
      porcentajeAprobados: total > 0 ? Math.round((aprobados / total) * 100) : 0
    }
  }
}))

export default usePaymentsStore