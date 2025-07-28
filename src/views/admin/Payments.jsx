import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiX, FiEye, FiFilter, FiDownload, FiDollarSign, FiClock, FiUsers } from 'react-icons/fi'
import Header from '../../components/common/Header'
import usePaymentsStore from '../../stores/paymentsStore'
import useAuthStore from '../../stores/authStore'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import FilterDropdown from '../../components/common/FilterDropdown'
import Swal from 'sweetalert2'

const PaymentsAdmin = () => {
  const { usuario } = useAuthStore()
  const { 
    pagos,
    getPagosPendientes,
    getPagosAprobados,
    getPagosRechazados,
    aprobarPago,
    rechazarPago,
    filtros,
    setFiltros,
    getPagosFiltrados,
    getEstadisticasPagos
  } = usePaymentsStore()

  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const pagosFiltrados = getPagosFiltrados()
  const estadisticas = getEstadisticasPagos()

  const handleApprove = async (pagoId) => {
    const result = await Swal.fire({
      title: '¿Aprobar este pago?',
      text: 'Esta acción no se puede deshacer',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      aprobarPago(pagoId, usuario?.email || 'admin@talentos.edu', 'Pago aprobado por administrador')
      Swal.fire('Aprobado', 'El pago ha sido aprobado correctamente', 'success')
    }
  }

  const handleReject = (pagoId) => {
    setSelectedPayment(pagoId)
    setShowRejectModal(true)
  }

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      Swal.fire('Error', 'Debe especificar el motivo del rechazo', 'error')
      return
    }

    rechazarPago(selectedPayment, usuario?.email || 'admin@talentos.edu', rejectReason)
    setShowRejectModal(false)
    setRejectReason('')
    setSelectedPayment(null)
    
    Swal.fire('Rechazado', 'El pago ha sido rechazado', 'info')
  }

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'aprobado': return 'text-green-600 bg-green-100'
      case 'pendiente': return 'text-yellow-600 bg-yellow-100'
      case 'rechazado': return 'text-red-600 bg-red-100'
      case 'pendiente_pago': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'aprobado': return <FiCheck className="w-4 h-4" />
      case 'pendiente': return <FiClock className="w-4 h-4" />
      case 'rechazado': return <FiX className="w-4 h-4" />
      default: return <FiClock className="w-4 h-4" />
    }
  }

  const exportToCSV = () => {
    const headers = ['Estudiante', 'Concepto', 'Monto', 'Fecha Pago', 'Estado', 'Método', 'N° Operación']
    const csvContent = [
      headers.join(','),
      ...pagosFiltrados.map(pago => [
        pago.nombreEstudiante,
        pago.concepto,
        pago.monto,
        pago.fechaPago || '',
        pago.estado,
        pago.metodoPago || '',
        pago.numeroOperacion || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_pagos_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-4 sm:py-6 px-4 sm:px-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Pagos</h1>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <AnimatedButton
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <FiDownload className="mr-2" />
            Exportar
          </AnimatedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AnimatedCard className="bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Pagos</p>
              <p className="text-2xl font-bold text-blue-800">{estadisticas.total}</p>
            </div>
            <FiDollarSign className="text-blue-500 text-2xl" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-800">{estadisticas.pendientes}</p>
            </div>
            <FiClock className="text-yellow-500 text-2xl" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Aprobados</p>
              <p className="text-2xl font-bold text-green-800">{estadisticas.aprobados}</p>
            </div>
            <FiCheck className="text-green-500 text-2xl" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-purple-50 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Monto Total</p>
              <p className="text-2xl font-bold text-purple-800">S/. {estadisticas.montoTotal.toFixed(2)}</p>
            </div>
            <FiDollarSign className="text-purple-500 text-2xl" />
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 sm:mb-6 gap-4 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Validación de Pagos</h2>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <FilterDropdown
              label="Estado"
              value={filtros.estado}
              onChange={(value) => setFiltros({ estado: value })}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'pendiente', label: 'Pendientes' },
                { value: 'aprobado', label: 'Aprobados' },
                { value: 'rechazado', label: 'Rechazados' }
              ]}
            />
            
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={filtros.estudiante}
              onChange={(e) => setFiltros({ estudiante: e.target.value })}
              className="w-full sm:max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-sm font-medium text-gray-600">Estudiante</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-sm font-medium text-gray-600">Concepto</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-sm font-medium text-gray-600">Monto</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-sm font-medium text-gray-600">Método</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-sm font-medium text-gray-600">N° Operación</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-sm font-medium text-gray-600">Estado</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-sm font-medium text-gray-600">Fecha Subida</th>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagosFiltrados.map((pago) => (
                <motion.tr
                  key={pago.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-800">{pago.nombreEstudiante}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-600">{pago.concepto}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-800">S/. {pago.monto.toFixed(2)}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 capitalize">{pago.metodoPago}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-600">{pago.numeroOperacion}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pago.estado)}`}>
                      {getStatusIcon(pago.estado)}
                      <span className="ml-1 capitalize">{pago.estado.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-600">
                    {pago.fechaSubida ? new Date(pago.fechaSubida).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <button
                        onClick={() => setSelectedPayment(pago)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Ver detalles"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      
                      {pago.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleApprove(pago.id)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Aprobar"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(pago.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Rechazar"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>

      {selectedPayment && typeof selectedPayment === 'object' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Detalle del Pago</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Estudiante:</span>
                <span>{selectedPayment.nombreEstudiante}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Padre:</span>
                <span>{selectedPayment.padreEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Concepto:</span>
                <span>{selectedPayment.concepto}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Monto:</span>
                <span>S/. {selectedPayment.monto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Método:</span>
                <span className="capitalize">{selectedPayment.metodoPago}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">N° Operación:</span>
                <span>{selectedPayment.numeroOperacion}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Voucher:</span>
                <span className="text-blue-600">{selectedPayment.voucher}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPayment.estado)}`}>
                  {selectedPayment.estado.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Fecha Subida:</span>
                <span>{new Date(selectedPayment.fechaSubida).toLocaleString()}</span>
              </div>
              {selectedPayment.fechaAprobacion && (
                <div className="flex justify-between">
                  <span className="font-medium">Fecha Aprobación:</span>
                  <span>{new Date(selectedPayment.fechaAprobacion).toLocaleString()}</span>
                </div>
              )}
              {selectedPayment.aprobadoPor && (
                <div className="flex justify-between">
                  <span className="font-medium">Aprobado por:</span>
                  <span>{selectedPayment.aprobadoPor}</span>
                </div>
              )}
              {selectedPayment.observaciones && (
                <div>
                  <span className="font-medium">Observaciones:</span>
                  <p className="text-gray-600 mt-1">{selectedPayment.observaciones}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {selectedPayment.estado === 'pendiente' && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedPayment.id)
                      setSelectedPayment(null)
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedPayment.id)
                      setSelectedPayment(null)
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Rechazar
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedPayment(null)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">Rechazar Pago</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                rows="4"
                placeholder="Especifique el motivo del rechazo..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                  setSelectedPayment(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Rechazar
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  )
}

export default PaymentsAdmin