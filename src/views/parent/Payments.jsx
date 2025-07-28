import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiUpload, 
  FiDollarSign, 
  FiCalendar, 
  FiCheck, 
  FiClock, 
  FiX, 
  FiEye,
  FiCreditCard,
  FiDownload,
  FiPrinter
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import usePaymentsStore from '../../stores/paymentsStore'
import usePaymentConceptsStore from '../../stores/paymentConceptsStore'
import useAuthStore from '../../stores/authStore'
import useStudentsStore from '../../stores/studentsStore'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import PaymentSchedule from '../../components/payments/PaymentSchedule'
import PaymentSimulationModal from '../../components/payments/PaymentSimulationModal'
import Swal from 'sweetalert2'
import { exportForParents } from '../../utils/exportUtilsSimple'

const Payments = () => {
  const { usuario } = useAuthStore()
  const { 
    getPagosPorPadre, 
    subirVoucher, 
    getEstadisticasPagos 
  } = usePaymentsStore()
  const { getConceptosActivos } = usePaymentConceptsStore()
  const { obtenerAlumnosPorPadreId } = useStudentsStore()
  
  const [activeTab, setActiveTab] = useState('cronograma')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedConcept, setSelectedConcept] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [uploadData, setUploadData] = useState({
    conceptoId: '',
    metodoPago: 'transferencia',
    numeroOperacion: '',
    voucher: null
  })

  const pagos = getPagosPorPadre(usuario?.email || 'padre1@email.com')
  const estadisticas = getEstadisticasPagos()
  const conceptosActivos = getConceptosActivos()
  const hijosDelPadre = usuario?.id ? obtenerAlumnosPorPadreId(usuario.id) : []

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

  const handleUpload = async () => {
    if (!uploadData.conceptoId || !uploadData.numeroOperacion) {
      Swal.fire('Error', 'Concepto y número de operación son obligatorios', 'error')
      return
    }

    const conceptoSeleccionado = conceptosActivos.find(c => c.id === parseInt(uploadData.conceptoId))
    if (!conceptoSeleccionado) {
      Swal.fire('Error', 'Concepto no encontrado', 'error')
      return
    }

    const pagoData = {
      estudianteId: usuario?.hijos?.[0] || 1,
      nombreEstudiante: 'Ana Rodríguez González',
      padreEmail: usuario?.email || 'padre1@email.com',
      concepto: conceptoSeleccionado.nombre,
      monto: conceptoSeleccionado.monto,
      fechaVencimiento: conceptoSeleccionado.fechaVencimiento || new Date().toISOString().split('T')[0],
      fechaPago: new Date().toISOString().split('T')[0],
      metodoPago: uploadData.metodoPago,
      numeroOperacion: uploadData.numeroOperacion,
      voucher: uploadData.voucher?.name || 'voucher_uploaded.jpg'
    }

    subirVoucher(pagoData)
    
    Swal.fire({
      title: 'Voucher Subido',
      text: 'Su voucher ha sido enviado para validación',
      icon: 'success'
    })

    setShowUploadModal(false)
    setUploadData({
      conceptoId: '',
      metodoPago: 'transferencia',
      numeroOperacion: '',
      voucher: null
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadData({ ...uploadData, voucher: file })
    }
  }

  const getConceptoInfo = (conceptoId) => {
    const concepto = conceptosActivos.find(c => c.id === parseInt(conceptoId))
    return concepto || null
  }

  const handlePayConcept = (concepto) => {
    if (hijosDelPadre.length === 0) {
      Swal.fire('Error', 'No se encontraron estudiantes asociados', 'error')
      return
    }
    
    setSelectedConcept(concepto)
    setSelectedStudent(hijosDelPadre[0]) // Por defecto el primer hijo
    setShowPaymentModal(true)
  }

  const handleExportPayments = async () => {
    try {
      const allPayments = []
      let totalPagado = 0
      let totalPendiente = 0
      
      // Obtener pagos de todos los hijos
      hijosDelPadre.forEach(hijo => {
        const pagosHijo = getPagosPorPadre(usuario.id, hijo.id)
        pagosHijo.forEach(pago => {
          // Calcular totales
          if (pago.estado === 'pagado' || pago.estado === 'Pagado') {
            totalPagado += pago.monto
          } else if (pago.estado === 'pendiente' || pago.estado === 'Pendiente') {
            totalPendiente += pago.monto
          }
          
          allPayments.push({
            'Estudiante': hijo.nombre + ' ' + hijo.apellidos,
            'Grado': `${hijo.grado} - ${hijo.seccion}`,
            'Concepto': pago.concepto,
            'Descripción': pago.descripcion || 'N/A',
            'Monto': `S/. ${pago.monto.toFixed(2)}`,
            'Fecha de Pago': new Date(pago.fecha).toLocaleDateString('es-PE'),
            'Fecha Vencimiento': pago.fechaVencimiento ? new Date(pago.fechaVencimiento).toLocaleDateString('es-PE') : 'N/A',
            'Estado': pago.estado,
            'Método de Pago': pago.metodoPago || 'N/A',
            'Número de Operación': pago.numeroOperacion || 'N/A',
            'Banco/Entidad': pago.banco || 'N/A'
          })
        })
      })

      if (allPayments.length === 0) {
        Swal.fire('Sin datos', 'No hay pagos registrados para exportar', 'info')
        return
      }

      // Agregar resumen al título
      const summary = `\n\nResumen: Total Pagado: S/. ${totalPagado.toFixed(2)} | Total Pendiente: S/. ${totalPendiente.toFixed(2)}`
      
      const result = await exportForParents(allPayments, {
        title: `Historial de Pagos - ${usuario?.nombre || 'Padre de Familia'}${summary}`,
        filename: 'historial_pagos_detallado'
      })
      
      if (result) {
        Swal.fire('Exportación exitosa', 'El historial de pagos ha sido exportado en PDF con todos los detalles', 'success')
      }
    } catch (error) {
      console.error('Error al exportar pagos:', error)
      Swal.fire('Error', 'No se pudo exportar el historial de pagos', 'error')
    }
  }

  const downloadReceipt = (pago) => {
    // Simulación de descarga de recibo
    const receiptData = `
TALENTOS COLLEGE
RUC: 20123456789
Av. Educación 123, Lima

RECIBO DE PAGO
===============================
N° Operación: ${pago.numeroOperacion}
Fecha: ${new Date(pago.fechaPago).toLocaleDateString()}

Estudiante: ${pago.nombreEstudiante}
Concepto: ${pago.concepto}
Monto: S/. ${pago.monto.toFixed(2)}
Método: ${pago.metodoPago}
Estado: ${pago.estado}

===============================
Este es un recibo electrónico
    `
    
    const blob = new Blob([receiptData], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recibo_${pago.numeroOperacion}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
    
    Swal.fire('Descarga iniciada', 'El recibo se está descargando', 'success')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-4 sm:py-6 px-4 sm:px-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Control de Pagos</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Gestione sus pagos y consulte el cronograma de mensualidades</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('cronograma')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'cronograma'
                  ? 'bg-white text-talentos-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiCalendar className="w-4 h-4 mr-1 sm:mr-2 inline" />
              <span className="hidden sm:inline">Cronograma</span>
              <span className="sm:hidden">Crono</span>
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'historial'
                  ? 'bg-white text-talentos-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiDollarSign className="w-4 h-4 mr-1 sm:mr-2 inline" />
              <span className="hidden sm:inline">Historial</span>
              <span className="sm:hidden">Hist</span>
            </button>
          </div>
          <div className="flex gap-2">
            <AnimatedButton
              onClick={() => {
                if (conceptosActivos.length > 0) {
                  handlePayConcept(conceptosActivos[0])
                } else {
                  Swal.fire('Info', 'No hay conceptos de pago disponibles', 'info')
                }
              }}
              className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700"
            >
              <FiCreditCard className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Pagar</span>
              <span className="sm:hidden">Pagar</span>
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => setShowUploadModal(true)}
              className="bg-talentos-primary text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-talentos-primary/90"
            >
              <FiUpload className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Subir Voucher</span>
              <span className="sm:hidden">Voucher</span>
            </AnimatedButton>
            
            <AnimatedButton
              onClick={handleExportPayments}
              className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              <FiDownload className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Exportar</span>
              <span className="sm:hidden">PDF</span>
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Contenido dinámico basado en la pestaña activa */}
      {activeTab === 'cronograma' && (
        <PaymentSchedule padreEmail={usuario?.email || 'padre1@email.com'} />
      )}

      {activeTab === 'historial' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatedCard className="bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-xs sm:text-sm font-medium">Total Pagos</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-800">{pagos.length}</p>
                </div>
                <FiDollarSign className="text-blue-500 text-xl sm:text-2xl" />
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-xs sm:text-sm font-medium">Aprobados</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-800">
                    {pagos.filter(p => p.estado === 'aprobado').length}
                  </p>
                </div>
                <FiCheck className="text-green-500 text-xl sm:text-2xl" />
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-yellow-50 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-xs sm:text-sm font-medium">Pendientes</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-800">
                    {pagos.filter(p => p.estado === 'pendiente').length}
                  </p>
                </div>
                <FiClock className="text-yellow-500 text-xl sm:text-2xl" />
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-purple-50 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-xs sm:text-sm font-medium">Monto Total</p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-purple-800">
                    S/. {pagos.filter(p => p.estado === 'aprobado').reduce((sum, p) => sum + p.monto, 0).toFixed(2)}
                  </p>
                </div>
                <FiDollarSign className="text-purple-500 text-xl sm:text-2xl" />
              </div>
            </AnimatedCard>
          </div>

          <AnimatedCard>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Historial de Pagos</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600">Estudiante</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600">Concepto</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600">Monto</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600">Fecha</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600">Estado</th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pagos.map((pago) => (
                    <motion.tr
                      key={pago.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-800">{pago.nombreEstudiante}</td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600">{pago.concepto}</td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-800">S/. {pago.monto.toFixed(2)}</td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600">
                        {pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pago.estado)}`}>
                          {getStatusIcon(pago.estado)}
                          <span className="ml-1 capitalize hidden sm:inline">{pago.estado.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedPayment(pago)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            title="Ver detalles"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          {pago.estado === 'aprobado' && (
                            <>
                              <button
                                onClick={() => downloadReceipt(pago)}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                                title="Descargar recibo"
                              >
                                <FiDownload className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  window.print()
                                  Swal.fire('Imprimir', 'Preparando impresión del recibo', 'info')
                                }}
                                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                                title="Imprimir"
                              >
                                <FiPrinter className="w-4 h-4" />
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
        </>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-4">Subir Voucher de Pago</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Concepto de Pago</label>
                <select
                  value={uploadData.conceptoId}
                  onChange={(e) => setUploadData({...uploadData, conceptoId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione un concepto</option>
                  {conceptosActivos.map(concepto => (
                    <option key={concepto.id} value={concepto.id}>
                      {concepto.nombre} - S/. {concepto.monto.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {uploadData.conceptoId && getConceptoInfo(uploadData.conceptoId) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Monto:</strong> S/. {getConceptoInfo(uploadData.conceptoId).monto.toFixed(2)}
                  </p>
                  {getConceptoInfo(uploadData.conceptoId).fechaVencimiento && (
                    <p className="text-xs sm:text-sm text-blue-800">
                      <strong>Vencimiento:</strong> {new Date(getConceptoInfo(uploadData.conceptoId).fechaVencimiento).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-blue-600 mt-1">
                    {getConceptoInfo(uploadData.conceptoId).descripcion}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                <select
                  value={uploadData.metodoPago}
                  onChange={(e) => setUploadData({...uploadData, metodoPago: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="transferencia">Transferencia</option>
                  <option value="deposito">Depósito</option>
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Número de Operación</label>
                <input
                  type="text"
                  value={uploadData.numeroOperacion}
                  onChange={(e) => setUploadData({...uploadData, numeroOperacion: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: TR001234567"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Voucher</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadData({
                    conceptoId: '',
                    metodoPago: 'transferencia',
                    numeroOperacion: '',
                    voucher: null
                  })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Subir Voucher
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {selectedPayment && (
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
                <span className="font-medium">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPayment.estado)}`}>
                  {selectedPayment.estado.replace('_', ' ')}
                </span>
              </div>
              {selectedPayment.observaciones && (
                <div>
                  <span className="font-medium">Observaciones:</span>
                  <p className="text-gray-600 mt-1">{selectedPayment.observaciones}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPayment(null)}
              className="w-full mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </motion.div>
        </div>
      )}

      {/* Modal de simulación de pago */}
      {showPaymentModal && selectedConcept && selectedStudent && (
        <PaymentSimulationModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedConcept(null)
            setSelectedStudent(null)
          }}
          concepto={selectedConcept}
          estudiante={{
            id: selectedStudent.id,
            nombreCompleto: selectedStudent.nombreCompleto,
            padreEmail: usuario?.email || 'padre1@email.com'
          }}
        />
      )}
      </div>
    </div>
  )
}

export default Payments