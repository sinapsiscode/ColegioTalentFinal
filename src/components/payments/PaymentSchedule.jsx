import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, isAfter, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiDownload,
  FiEye,
  FiCreditCard,
  FiTrendingUp,
  FiBarChart,
  FiGrid,
  FiList,
  FiSearch,
  FiMoreHorizontal,
  FiArrowRight,
  FiInfo
} from 'react-icons/fi'
import usePaymentScheduleStore from '../../stores/paymentScheduleStore'
import PaymentModal from './PaymentModal'

const PaymentSchedule = ({ padreEmail, estudianteId = null }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const {
    getCronogramaPorPadre,
    getCronogramaPorEstudiante,
    getPagosPendientes,
    getPagosVencidos,
    getProximosVencimientos,
    getEstadisticasPorEstudiante,
    actualizarEstadosPagos
  } = usePaymentScheduleStore()

  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(estudianteId)
  const [vistaActual, setVistaActual] = useState('calendario') // calendario, lista
  const [mesSeleccionado, setMesSeleccionado] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [selectedPayments, setSelectedPayments] = useState(new Set())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentToShow, setPaymentToShow] = useState(null)
  const [showPayModal, setShowPayModal] = useState(false)
  const [paymentToPay, setPaymentToPay] = useState(null)

  useEffect(() => {
    actualizarEstadosPagos()
    // Marcar que la carga inicial ha terminado después de un pequeño delay
    const timer = setTimeout(() => setIsInitialLoad(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const cronogramas = getCronogramaPorPadre(padreEmail)
  const pagosPendientes = getPagosPendientes(padreEmail)
  const pagosVencidos = getPagosVencidos(padreEmail)
  const proximosVencimientos = getProximosVencimientos(padreEmail, 15)

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pagado':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
          border: 'border-green-200',
          text: 'text-green-800',
          dot: 'bg-green-500',
          icon: 'text-green-600'
        }
      case 'pendiente':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-sky-100',
          border: 'border-blue-200',
          text: 'text-blue-800',
          dot: 'bg-blue-500',
          icon: 'text-blue-600'
        }
      case 'vencido':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-rose-100',
          border: 'border-red-200',
          text: 'text-red-800',
          dot: 'bg-red-500',
          icon: 'text-red-600'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-slate-100',
          border: 'border-gray-200',
          text: 'text-gray-800',
          dot: 'bg-gray-500',
          icon: 'text-gray-600'
        }
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pagado': return FiCheck
      case 'pendiente': return FiClock
      case 'vencido': return FiX
      default: return FiClock
    }
  }

  const formatearFecha = (fecha) => {
    return format(new Date(fecha), 'dd MMM yyyy', { locale: es })
  }

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto)
  }

  const cronogramaFiltrado = estudianteSeleccionado 
    ? [getCronogramaPorEstudiante(estudianteSeleccionado)]
    : cronogramas

  const pagosFiltrados = useMemo(() => 
    cronogramaFiltrado.flatMap(cronograma => 
      cronograma?.cronograma.filter(pago => {
        const cumpleEstado = filtroEstado === 'todos' || pago.estado === filtroEstado
        const cumpleBusqueda = searchTerm === '' || 
          pago.mes.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cronograma.nombreEstudiante.toLowerCase().includes(searchTerm.toLowerCase())
        return cumpleEstado && cumpleBusqueda
      }).map(pago => ({
        ...pago,
        estudianteId: cronograma.estudianteId,
        nombreEstudiante: cronograma.nombreEstudiante,
        año: cronograma.año
      })) || []
    ), [cronogramaFiltrado, filtroEstado, searchTerm]
  )

  const estadisticasGenerales = {
    totalPagos: pagosFiltrados.length,
    pagados: pagosFiltrados.filter(p => p.estado === 'pagado').length,
    pendientes: pagosFiltrados.filter(p => p.estado === 'pendiente').length,
    vencidos: pagosFiltrados.filter(p => p.estado === 'vencido').length,
    montoTotal: pagosFiltrados.reduce((sum, p) => sum + p.monto, 0),
    montoPagado: pagosFiltrados.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0),
    montoPendiente: pagosFiltrados.filter(p => p.estado !== 'pagado').reduce((sum, p) => sum + p.monto, 0)
  }

  const getDiasRestantes = (fechaVencimiento) => {
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diffTime = vencimiento - hoy
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const togglePaymentSelection = useCallback((paymentId) => {
    setSelectedPayments(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(paymentId)) {
        newSelection.delete(paymentId)
      } else {
        newSelection.add(paymentId)
      }
      return newSelection
    })
  }, [])

  const handlePaymentClick = useCallback((pago) => {
    setPaymentToShow(pago)
    setShowPaymentModal(true)
  }, [])

  const handlePayNow = useCallback((pago, event) => {
    if (event) {
      event.stopPropagation()
    }
    setPaymentToPay(pago)
    setShowPayModal(true)
  }, [])

  const handlePaymentSuccess = useCallback((payment) => {
    // Actualizar estado local o refrescar datos
    console.log('Pago exitoso:', payment)
    // Aquí podrías actualizar el estado del cronograma
  }, [])

  const CardHeader = ({ title, subtitle, action }) => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )

  const StatsCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`${color.bg} ${color.border} border-2 rounded-xl p-6 relative overflow-hidden`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${color.icon} bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className="flex items-center space-x-1 text-xs font-medium">
              <FiTrendingUp className="w-3 h-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div>
          <p className={`text-sm font-medium ${color.text} opacity-80`}>{title}</p>
          <p className={`text-2xl font-bold ${color.text} mt-1`}>{value}</p>
          {subtitle && <p className={`text-xs ${color.text} opacity-70 mt-1`}>{subtitle}</p>}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
    </motion.div>
  )

  const PaymentCard = React.memo(({ pago, index, isInitialLoad = false }) => {
    const estadoColors = getEstadoColor(pago.estado)
    const EstadoIcon = getEstadoIcon(pago.estado)
    const diasRestantes = getDiasRestantes(pago.fechaVencimiento)
    const isSelected = selectedPayments.has(`${pago.estudianteId}-${pago.mes}`)
    const isUrgent = pago.estado === 'vencido' || (pago.estado === 'pendiente' && diasRestantes <= 7)

    return (
      <motion.div
        initial={isInitialLoad ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={isInitialLoad ? { delay: index * 0.05 } : { duration: 0.2 }}
        whileHover={{ y: -2, scale: 1.01 }}
        layout
        className={`
          ${estadoColors.bg} ${estadoColors.border} border-2 rounded-xl p-6 cursor-pointer
          transition-all duration-300 relative overflow-hidden
          ${isSelected ? 'ring-2 ring-talentos-primary ring-offset-2' : ''}
          ${isUrgent ? 'shadow-lg shadow-red-100' : 'shadow-sm hover:shadow-md'}
        `}
        onClick={() => handlePaymentClick(pago)}
      >
        {/* Urgency indicator */}
        {isUrgent && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${estadoColors.bg} ${estadoColors.border} border rounded-lg flex items-center justify-center`}>
              <EstadoIcon className={`w-5 h-5 ${estadoColors.icon}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${estadoColors.text}`}>
                {pago.mes} {pago.año}
              </h3>
              {cronogramas.length > 1 && (
                <p className="text-xs text-gray-600">{pago.nombreEstudiante}</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className={`text-lg font-bold ${estadoColors.text}`}>
              {formatearMonto(pago.monto)}
            </p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estadoColors.bg} ${estadoColors.text} border ${estadoColors.border}`}>
              {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Vencimiento:</span>
            <span className={`font-medium ${estadoColors.text}`}>
              {formatearFecha(pago.fechaVencimiento)}
            </span>
          </div>
          
          {pago.fechaPago && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Fecha de pago:</span>
              <span className="font-medium text-green-700">
                {formatearFecha(pago.fechaPago)}
              </span>
            </div>
          )}

          {pago.estado === 'pendiente' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Días restantes:</span>
              <span className={`font-medium ${diasRestantes <= 7 ? 'text-red-600' : 'text-blue-600'}`}>
                {diasRestantes > 0 ? `${diasRestantes} días` : 'Vencido'}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar for visual indicator */}
        {pago.estado === 'pendiente' && diasRestantes > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Tiempo restante</span>
              <span>{Math.max(0, Math.min(100, ((30 - diasRestantes) / 30) * 100)).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, ((30 - diasRestantes) / 30) * 100))}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-2 rounded-full ${diasRestantes <= 7 ? 'bg-red-500' : 'bg-blue-500'}`}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/30">
          <div className="flex items-center space-x-2">
            {pago.estado !== 'pagado' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handlePayNow(pago, e)}
                className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                <FiCreditCard className="w-3 h-3" />
                <span>Pagar</span>
              </motion.button>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePaymentSelection(`${pago.estudianteId}-${pago.mes}`)
            }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-talentos-primary border-talentos-primary text-white' 
                : 'border-gray-300 hover:border-talentos-primary'
            }`}
          >
            {isSelected && <FiCheck className="w-3 h-3" />}
          </button>
        </div>
      </motion.div>
    )
  }, (prevProps, nextProps) => {
    // Solo re-renderizar si cambian estas propiedades específicas
    return (
      prevProps.pago.estado === nextProps.pago.estado &&
      prevProps.isInitialLoad === nextProps.isInitialLoad &&
      prevProps.index === nextProps.index &&
      JSON.stringify(prevProps.pago) === JSON.stringify(nextProps.pago)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary rounded-xl p-6 text-white">
        <CardHeader
          title="Cronograma de Pensiones 2024"
          subtitle="Gestione y monitoree todos sus pagos de manera inteligente"
          action={
            <div className="flex items-center space-x-2">
              <div className="flex bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => setVistaActual('calendario')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    vistaActual === 'calendario'
                      ? 'bg-white text-talentos-primary'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <FiGrid className="w-4 h-4 mr-2 inline" />
                  Tarjetas
                </button>
                <button
                  onClick={() => setVistaActual('lista')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    vistaActual === 'lista'
                      ? 'bg-white text-talentos-primary'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <FiList className="w-4 h-4 mr-2 inline" />
                  Lista
                </button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Exportar cronograma"
              >
                <FiDownload className="w-4 h-4" />
              </motion.button>
            </div>
          }
        />
      </div>

      {/* Estadísticas mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={FiBarChart}
          title="Total de Pagos"
          value={estadisticasGenerales.totalPagos}
          subtitle="Cronograma completo"
          color={getEstadoColor('pendiente')}
          trend="+12%"
        />
        <StatsCard
          icon={FiCheck}
          title="Pagos Realizados"
          value={estadisticasGenerales.pagados}
          subtitle={`${Math.round((estadisticasGenerales.pagados / estadisticasGenerales.totalPagos) * 100)}% completado`}
          color={getEstadoColor('pagado')}
        />
        <StatsCard
          icon={FiClock}
          title="Pagos Pendientes"
          value={estadisticasGenerales.pendientes}
          subtitle={formatearMonto(estadisticasGenerales.montoPendiente)}
          color={getEstadoColor('pendiente')}
        />
        <StatsCard
          icon={FiAlertTriangle}
          title="Pagos Vencidos"
          value={estadisticasGenerales.vencidos}
          subtitle={estadisticasGenerales.vencidos > 0 ? "Requiere atención" : "Todo al día"}
          color={getEstadoColor('vencido')}
        />
      </div>

      {/* Alertas importantes mejoradas */}
      {(pagosVencidos.length > 0 || proximosVencimientos.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pagosVencidos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-red-50 to-rose-100 border-2 border-red-200 rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <FiAlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Pagos Vencidos</h3>
                  <p className="text-sm text-red-600">Requieren atención inmediata</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-red-800">{pagosVencidos.length}</p>
                <p className="text-sm text-red-600">
                  Total: {formatearMonto(pagosVencidos.reduce((sum, p) => sum + p.monto, 0))}
                </p>
                <button className="flex items-center space-x-1 text-red-700 hover:text-red-800 text-sm font-medium">
                  <span>Ver detalles</span>
                  <FiArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {proximosVencimientos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-yellow-200 rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800">Próximos Vencimientos</h3>
                  <p className="text-sm text-yellow-600">Siguientes 15 días</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-yellow-800">{proximosVencimientos.length}</p>
                <p className="text-sm text-yellow-600">
                  Próximo: {proximosVencimientos[0]?.diasRestantes} días
                </p>
                <button className="flex items-center space-x-1 text-yellow-700 hover:text-yellow-800 text-sm font-medium">
                  <span>Programar pagos</span>
                  <FiArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Controles mejorados */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Búsqueda */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por mes o estudiante..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent min-w-64"
              />
            </div>

            {/* Filtros */}
            {cronogramas.length > 1 && (
              <select
                value={estudianteSeleccionado || ''}
                onChange={(e) => setEstudianteSeleccionado(e.target.value ? parseInt(e.target.value) : null)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
              >
                <option value="">Todos los estudiantes</option>
                {cronogramas.map(cronograma => (
                  <option key={cronograma.estudianteId} value={cronograma.estudianteId}>
                    {cronograma.nombreEstudiante}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center space-x-2">
              <FiFilter className="w-4 h-4 text-gray-500" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
              >
                <option value="todos">Todos los estados</option>
                <option value="pagado">Solo pagados</option>
                <option value="pendiente">Solo pendientes</option>
                <option value="vencido">Solo vencidos</option>
              </select>
            </div>
          </div>

          {/* Acciones rápidas */}
          {selectedPayments.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2"
            >
              <span className="text-sm text-gray-600">
                {selectedPayments.size} seleccionado{selectedPayments.size !== 1 ? 's' : ''}
              </span>
              <button 
                onClick={() => {
                  // Implementar pago múltiple en el futuro
                  console.log('Pagar seleccionados:', selectedPayments)
                }}
                className="flex items-center space-x-1 bg-talentos-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-talentos-primary/90 transition-colors"
              >
                <FiCreditCard className="w-4 h-4" />
                <span>Pagar seleccionados</span>
              </button>
              <button
                onClick={() => setSelectedPayments(new Set())}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Mostrando {pagosFiltrados.length} de {estadisticasGenerales.totalPagos} pagos
          {searchTerm && (
            <span className="ml-2">
              para "<span className="font-medium">{searchTerm}</span>"
            </span>
          )}
        </div>
      </div>

      {/* Vista del cronograma */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {vistaActual === 'calendario' ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Vista de Tarjetas</h3>
            
            {pagosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay pagos para mostrar
                </h3>
                <p className="text-gray-600">
                  Ajuste los filtros para ver diferentes resultados
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {pagosFiltrados.map((pago, index) => (
                    <PaymentCard 
                      key={`${pago.estudianteId}-${pago.mes}`} 
                      pago={pago} 
                      index={index} 
                      isInitialLoad={isInitialLoad}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Vista de Lista</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPayments(new Set(pagosFiltrados.map(p => `${p.estudianteId}-${p.mes}`)))
                          } else {
                            setSelectedPayments(new Set())
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                    {cronogramas.length > 1 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {pagosFiltrados.map((pago, index) => {
                      const estadoColors = getEstadoColor(pago.estado)
                      const EstadoIcon = getEstadoIcon(pago.estado)
                      const isSelected = selectedPayments.has(`${pago.estudianteId}-${pago.mes}`)
                      
                      return (
                        <motion.tr
                          key={`${pago.estudianteId}-${pago.mes}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePaymentSelection(`${pago.estudianteId}-${pago.mes}`)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 ${estadoColors.bg} ${estadoColors.border} border rounded-lg flex items-center justify-center`}>
                                <EstadoIcon className={`w-4 h-4 ${estadoColors.icon}`} />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{pago.mes} {pago.año}</div>
                                {pago.fechaPago && (
                                  <div className="text-xs text-gray-500">Pagado: {formatearFecha(pago.fechaPago)}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          {cronogramas.length > 1 && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {pago.nombreEstudiante}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatearMonto(pago.monto)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatearFecha(pago.fechaVencimiento)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColors.bg} ${estadoColors.text} ${estadoColors.border} border`}>
                              <EstadoIcon className="w-3 h-3 mr-1" />
                              {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handlePaymentClick(pago)}
                                className="text-talentos-primary hover:text-talentos-primary/80"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              {pago.estado !== 'pagado' && (
                                <button 
                                  onClick={() => handlePayNow(pago)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Pagar ahora"
                                >
                                  <FiCreditCard className="w-4 h-4" />
                                </button>
                              )}
                              <button className="text-gray-400 hover:text-gray-600">
                                <FiMoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle de pago */}
      <AnimatePresence>
        {showPaymentModal && paymentToShow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Detalle del Pago</h3>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mes</label>
                    <p className="text-lg font-semibold text-gray-900">{paymentToShow.mes} {paymentToShow.año}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Monto</label>
                    <p className="text-lg font-semibold text-gray-900">{formatearMonto(paymentToShow.monto)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vencimiento</label>
                    <p className="text-gray-900">{formatearFecha(paymentToShow.fechaVencimiento)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(paymentToShow.estado).bg} ${getEstadoColor(paymentToShow.estado).text}`}>
                      {paymentToShow.estado.charAt(0).toUpperCase() + paymentToShow.estado.slice(1)}
                    </span>
                  </div>
                </div>

                {paymentToShow.fechaPago && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de pago</label>
                    <p className="text-gray-900">{formatearFecha(paymentToShow.fechaPago)}</p>
                  </div>
                )}

                {cronogramas.length > 1 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estudiante</label>
                    <p className="text-gray-900">{paymentToShow.nombreEstudiante}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                {paymentToShow.estado !== 'pagado' && (
                  <button 
                    onClick={() => {
                      setShowPaymentModal(false)
                      handlePayNow(paymentToShow)
                    }}
                    className="flex-1 px-4 py-2 bg-talentos-primary text-white rounded-lg hover:bg-talentos-primary/90 transition-colors"
                  >
                    Pagar ahora
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de pago */}
      <PaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        payment={paymentToPay}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

export default PaymentSchedule