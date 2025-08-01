import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiCalendar, FiDollarSign, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi'
import usePaymentsStore from '../../stores/paymentsStore'
import AnimatedCard from '../common/AnimatedCard'
import AnimatedButton from '../common/AnimatedButton'

const PaymentReports = () => {
  const { pagos, getEstadisticasPagos } = usePaymentsStore()
  const [dateRange, setDateRange] = useState({
    inicio: new Date().toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  })

  const estadisticas = getEstadisticasPagos()

  const getPagosPorMes = () => {
    const pagosPorMes = {}
    pagos.filter(p => p.fechaPago).forEach(pago => {
      const mes = pago.fechaPago.substring(0, 7)
      if (!pagosPorMes[mes]) {
        pagosPorMes[mes] = { cantidad: 0, monto: 0 }
      }
      pagosPorMes[mes].cantidad++
      pagosPorMes[mes].monto += pago.monto
    })
    return pagosPorMes
  }

  const getPagosPorMetodo = () => {
    const metodos = {}
    pagos.filter(p => p.metodoPago && p.estado === 'aprobado').forEach(pago => {
      if (!metodos[pago.metodoPago]) {
        metodos[pago.metodoPago] = { cantidad: 0, monto: 0 }
      }
      metodos[pago.metodoPago].cantidad++
      metodos[pago.metodoPago].monto += pago.monto
    })
    return metodos
  }

  const getReporteMensual = () => {
    const pagosPorMes = getPagosPorMes()
    return Object.entries(pagosPorMes).map(([mes, data]) => ({
      mes,
      cantidad: data.cantidad,
      monto: data.monto,
      promedio: data.monto / data.cantidad
    }))
  }

  const exportReporteMensual = () => {
    const reporte = getReporteMensual()
    const headers = ['Mes', 'Cantidad de Pagos', 'Monto Total', 'Promedio por Pago']
    const csvContent = [
      headers.join(','),
      ...reporte.map(item => [
        item.mes,
        item.cantidad,
        item.monto.toFixed(2),
        item.promedio.toFixed(2)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_mensual_pagos_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportReporteDetallado = () => {
    const headers = [
      'ID', 'Estudiante', 'Padre', 'Concepto', 'Monto', 'Fecha Pago', 
      'Método', 'N° Operación', 'Estado', 'Fecha Subida', 'Aprobado Por'
    ]
    const csvContent = [
      headers.join(','),
      ...pagos.map(pago => [
        pago.id,
        pago.nombreEstudiante,
        pago.padreEmail,
        pago.concepto,
        pago.monto,
        pago.fechaPago || '',
        pago.metodoPago || '',
        pago.numeroOperacion || '',
        pago.estado,
        pago.fechaSubida || '',
        pago.aprobadoPor || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_detallado_pagos_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const pagosPorMes = getPagosPorMes()
  const pagosPorMetodo = getPagosPorMetodo()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Reportes de Pagos</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <AnimatedButton
            onClick={exportReporteMensual}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-blue-700 min-h-[44px] sm:min-h-auto"
          >
            <FiDownload className="mr-2" />
            Reporte Mensual
          </AnimatedButton>
          <AnimatedButton
            onClick={exportReporteDetallado}
            className="bg-green-600 text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-green-700 min-h-[44px] sm:min-h-auto"
          >
            <FiDownload className="mr-2" />
            Reporte Detallado
          </AnimatedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <AnimatedCard className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-xs sm:text-sm font-medium">Recaudación Total</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-800">S/. {estadisticas.montoTotal.toFixed(2)}</p>
            </div>
            <FiDollarSign className="text-blue-500 text-2xl sm:text-3xl" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-xs sm:text-sm font-medium">Tasa de Aprobación</p>
              <p className="text-lg sm:text-2xl font-bold text-green-800">{estadisticas.porcentajeAprobados}%</p>
            </div>
            <FiTrendingUp className="text-green-500 text-2xl sm:text-3xl" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-xs sm:text-sm font-medium">Pagos Pendientes</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-800">{estadisticas.pendientes}</p>
            </div>
            <FiBarChart2 className="text-yellow-500 text-2xl sm:text-3xl" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-purple-50 border-l-4 border-purple-500 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-xs sm:text-sm font-medium">Promedio por Pago</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-800">
                S/. {estadisticas.aprobados > 0 ? (estadisticas.montoTotal / estadisticas.aprobados).toFixed(2) : '0.00'}
              </p>
            </div>
            <FiPieChart className="text-purple-500 text-2xl sm:text-3xl" />
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AnimatedCard>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Pagos por Mes</h3>
          <div className="space-y-3">
            {Object.entries(pagosPorMes).map(([mes, data]) => (
              <motion.div
                key={mes}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <FiCalendar className="text-blue-500 mr-2 sm:mr-3" />
                  <span className="text-sm sm:text-base font-medium">{mes}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-gray-600">{data.cantidad} pagos</p>
                  <p className="text-sm sm:text-base font-semibold">S/. {data.monto.toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Métodos de Pago</h3>
          <div className="space-y-3">
            {Object.entries(pagosPorMetodo).map(([metodo, data]) => (
              <motion.div
                key={metodo}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <FiDollarSign className="text-green-500 mr-2 sm:mr-3" />
                  <span className="text-sm sm:text-base font-medium capitalize">{metodo}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-gray-600">{data.cantidad} pagos</p>
                  <p className="text-sm sm:text-base font-semibold">S/. {data.monto.toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Resumen Estadístico</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <FiBarChart2 className="text-blue-600 text-xl sm:text-2xl" />
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-800">Total de Transacciones</h4>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{estadisticas.total}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <FiTrendingUp className="text-green-600 text-xl sm:text-2xl" />
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-800">Efectividad</h4>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{estadisticas.porcentajeAprobados}%</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <FiDollarSign className="text-purple-600 text-xl sm:text-2xl" />
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-800">Ingresos</h4>
            <p className="text-lg sm:text-2xl font-bold text-purple-600">S/. {estadisticas.montoTotal.toFixed(2)}</p>
          </div>
        </div>
      </AnimatedCard>
    </div>
  )
}

export default PaymentReports