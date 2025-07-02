import { create } from 'zustand'

const usePaymentScheduleStore = create((set, get) => ({
  cronogramaPagos: [
    {
      id: 1,
      estudianteId: 1,
      nombreEstudiante: 'Ana Rodríguez González',
      padreEmail: 'padre1@email.com',
      año: 2024,
      cronograma: [
        { mes: 'Enero', fechaVencimiento: '2024-01-31', monto: 350.00, estado: 'pagado', fechaPago: '2024-01-28' },
        { mes: 'Febrero', fechaVencimiento: '2024-02-29', monto: 350.00, estado: 'pagado', fechaPago: '2024-02-15' },
        { mes: 'Marzo', fechaVencimiento: '2024-03-31', monto: 350.00, estado: 'pagado', fechaPago: '2024-03-20' },
        { mes: 'Abril', fechaVencimiento: '2024-04-30', monto: 350.00, estado: 'pagado', fechaPago: '2024-04-10' },
        { mes: 'Mayo', fechaVencimiento: '2024-05-31', monto: 350.00, estado: 'pagado', fechaPago: '2024-05-25' },
        { mes: 'Junio', fechaVencimiento: '2024-06-30', monto: 350.00, estado: 'vencido', fechaPago: null },
        { mes: 'Julio', fechaVencimiento: '2024-07-31', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Agosto', fechaVencimiento: '2024-08-31', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Septiembre', fechaVencimiento: '2024-09-30', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Octubre', fechaVencimiento: '2024-10-31', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Noviembre', fechaVencimiento: '2024-11-30', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Diciembre', fechaVencimiento: '2024-12-31', monto: 350.00, estado: 'pendiente', fechaPago: null }
      ]
    },
    {
      id: 2,
      estudianteId: 2,
      nombreEstudiante: 'Luis Rodríguez González',
      padreEmail: 'padre1@email.com',
      año: 2024,
      cronograma: [
        { mes: 'Enero', fechaVencimiento: '2024-01-31', monto: 350.00, estado: 'pagado', fechaPago: '2024-01-29' },
        { mes: 'Febrero', fechaVencimiento: '2024-02-29', monto: 350.00, estado: 'pagado', fechaPago: '2024-02-28' },
        { mes: 'Marzo', fechaVencimiento: '2024-03-31', monto: 350.00, estado: 'pagado', fechaPago: '2024-03-30' },
        { mes: 'Abril', fechaVencimiento: '2024-04-30', monto: 350.00, estado: 'pagado', fechaPago: '2024-04-28' },
        { mes: 'Mayo', fechaVencimiento: '2024-05-31', monto: 350.00, estado: 'vencido', fechaPago: null },
        { mes: 'Junio', fechaVencimiento: '2024-06-30', monto: 350.00, estado: 'vencido', fechaPago: null },
        { mes: 'Julio', fechaVencimiento: '2024-07-31', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Agosto', fechaVencimiento: '2024-08-31', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Septiembre', fechaVencimiento: '2024-09-30', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Octubre', fechaVencimiento: '2024-10-31', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Noviembre', fechaVencimiento: '2024-11-30', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Diciembre', fechaVencimiento: '2024-12-31', monto: 350.00, estado: 'pendiente', fechaPago: null }
      ]
    },
    {
      id: 3,
      estudianteId: 3,
      nombreEstudiante: 'Sofia Martinez López',
      padreEmail: 'padre2@email.com',
      año: 2024,
      cronograma: [
        { mes: 'Enero', fechaVencimiento: '2024-01-31', monto: 350.00, estado: 'pagado', fechaPago: '2024-01-15' },
        { mes: 'Febrero', fechaVencimiento: '2024-02-29', monto: 350.00, estado: 'pagado', fechaPago: '2024-02-10' },
        { mes: 'Marzo', fechaVencimiento: '2024-03-31', monto: 350.00, estado: 'pagado', fechaPago: '2024-03-05' },
        { mes: 'Abril', fechaVencimiento: '2024-04-30', monto: 350.00, estado: 'pagado', fechaPago: '2024-04-02' },
        { mes: 'Mayo', fechaVencimiento: '2024-05-31', monto: 350.00, estado: 'pagado', fechaPago: '2024-05-01' },
        { mes: 'Junio', fechaVencimiento: '2024-06-30', monto: 350.00, estado: 'pagado', fechaPago: '2024-06-01' },
        { mes: 'Julio', fechaVencimiento: '2024-07-31', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Agosto', fechaVencimiento: '2024-08-31', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Septiembre', fechaVencimiento: '2024-09-30', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Octubre', fechaVencimiento: '2024-10-31', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Noviembre', fechaVencimiento: '2024-11-30', monto: 350.00, estado: 'pendiente', fechaPago: null },
        { mes: 'Diciembre', fechaVencimiento: '2024-12-31', monto: 350.00, estado: 'pendiente', fechaPago: null }
      ]
    }
  ],

  getCronogramaPorPadre: (padreEmail) => {
    const { cronogramaPagos } = get()
    return cronogramaPagos.filter(cronograma => cronograma.padreEmail === padreEmail)
  },

  getCronogramaPorEstudiante: (estudianteId, año = 2024) => {
    const { cronogramaPagos } = get()
    return cronogramaPagos.find(cronograma => 
      cronograma.estudianteId === estudianteId && cronograma.año === año
    )
  },

  getPagosPendientes: (padreEmail) => {
    const cronogramas = get().getCronogramaPorPadre(padreEmail)
    const pagosPendientes = []
    
    cronogramas.forEach(cronograma => {
      cronograma.cronograma.forEach(pago => {
        if (pago.estado === 'pendiente' || pago.estado === 'vencido') {
          pagosPendientes.push({
            ...pago,
            estudianteId: cronograma.estudianteId,
            nombreEstudiante: cronograma.nombreEstudiante,
            año: cronograma.año
          })
        }
      })
    })
    
    return pagosPendientes.sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento))
  },

  getPagosVencidos: (padreEmail) => {
    const cronogramas = get().getCronogramaPorPadre(padreEmail)
    const pagosVencidos = []
    
    cronogramas.forEach(cronograma => {
      cronograma.cronograma.forEach(pago => {
        if (pago.estado === 'vencido') {
          pagosVencidos.push({
            ...pago,
            estudianteId: cronograma.estudianteId,
            nombreEstudiante: cronograma.nombreEstudiante,
            año: cronograma.año
          })
        }
      })
    })
    
    return pagosVencidos.sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento))
  },

  getProximosVencimientos: (padreEmail, diasAdelante = 30) => {
    const cronogramas = get().getCronogramaPorPadre(padreEmail)
    const proximosVencimientos = []
    const hoy = new Date()
    const fechaLimite = new Date(hoy.getTime() + (diasAdelante * 24 * 60 * 60 * 1000))
    
    cronogramas.forEach(cronograma => {
      cronograma.cronograma.forEach(pago => {
        const fechaVencimiento = new Date(pago.fechaVencimiento)
        if (pago.estado === 'pendiente' && fechaVencimiento >= hoy && fechaVencimiento <= fechaLimite) {
          proximosVencimientos.push({
            ...pago,
            estudianteId: cronograma.estudianteId,
            nombreEstudiante: cronograma.nombreEstudiante,
            año: cronograma.año,
            diasRestantes: Math.ceil((fechaVencimiento - hoy) / (24 * 60 * 60 * 1000))
          })
        }
      })
    })
    
    return proximosVencimientos.sort((a, b) => a.diasRestantes - b.diasRestantes)
  },

  marcarComoPagado: (estudianteId, mes, fechaPago) => {
    const { cronogramaPagos } = get()
    const cronogramasActualizados = cronogramaPagos.map(cronograma => {
      if (cronograma.estudianteId === estudianteId) {
        return {
          ...cronograma,
          cronograma: cronograma.cronograma.map(pago => {
            if (pago.mes === mes) {
              return {
                ...pago,
                estado: 'pagado',
                fechaPago
              }
            }
            return pago
          })
        }
      }
      return cronograma
    })
    
    set({ cronogramaPagos: cronogramasActualizados })
  },

  actualizarEstadosPagos: () => {
    const { cronogramaPagos } = get()
    const hoy = new Date()
    
    const cronogramasActualizados = cronogramaPagos.map(cronograma => ({
      ...cronograma,
      cronograma: cronograma.cronograma.map(pago => {
        const fechaVencimiento = new Date(pago.fechaVencimiento)
        
        if (pago.estado === 'pendiente' && fechaVencimiento < hoy) {
          return { ...pago, estado: 'vencido' }
        }
        
        return pago
      })
    }))
    
    set({ cronogramaPagos: cronogramasActualizados })
  },

  getEstadisticasPorEstudiante: (estudianteId, año = 2024) => {
    const cronograma = get().getCronogramaPorEstudiante(estudianteId, año)
    
    if (!cronograma) {
      return {
        totalMeses: 0,
        pagados: 0,
        pendientes: 0,
        vencidos: 0,
        montoTotal: 0,
        montoPagado: 0,
        montoPendiente: 0,
        porcentajePagado: 0
      }
    }
    
    const pagados = cronograma.cronograma.filter(p => p.estado === 'pagado').length
    const pendientes = cronograma.cronograma.filter(p => p.estado === 'pendiente').length
    const vencidos = cronograma.cronograma.filter(p => p.estado === 'vencido').length
    const montoPagado = cronograma.cronograma
      .filter(p => p.estado === 'pagado')
      .reduce((sum, p) => sum + p.monto, 0)
    const montoPendiente = cronograma.cronograma
      .filter(p => p.estado !== 'pagado')
      .reduce((sum, p) => sum + p.monto, 0)
    const montoTotal = cronograma.cronograma.reduce((sum, p) => sum + p.monto, 0)
    
    return {
      totalMeses: cronograma.cronograma.length,
      pagados,
      pendientes,
      vencidos,
      montoTotal,
      montoPagado,
      montoPendiente,
      porcentajePagado: Math.round((montoPagado / montoTotal) * 100)
    }
  }
}))

export default usePaymentScheduleStore