import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiDollarSign, FiCalendar, FiCheck, FiClock, FiX, FiEye } from 'react-icons/fi'
import Header from '../../components/common/Header'
import usePaymentsStore from '../../stores/paymentsStore'
import usePaymentConceptsStore from '../../stores/paymentConceptsStore'
import useAuthStore from '../../stores/authStore'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import PaymentSchedule from '../../components/payments/PaymentSchedule'
import Swal from 'sweetalert2'

const Payments = () => {
  const { usuario } = useAuthStore()
  const { 
    getPagosPorPadre, 
    subirVoucher, 
    getEstadisticasPagos 
  } = usePaymentsStore()
  const { getConceptosActivos } = usePaymentConceptsStore()
  
  const [activeTab, setActiveTab] = useState('cronograma')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [uploadData, setUploadData] = useState({
    conceptoId: '',
    metodoPago: 'transferencia',
    numeroOperacion: '',
    voucher: null
  })

  const pagos = getPagosPorPadre(usuario?.email || 'padre1@email.com')
  const estadisticas = getEstadisticasPagos()
  const conceptosActivos = getConceptosActivos()

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Control de Pagos</h1>
          <p className="text-gray-600 mt-1">Gestione sus pagos y consulte el cronograma de mensualidades</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('cronograma')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'cronograma'
                  ? 'bg-white text-talentos-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiCalendar className="w-4 h-4 mr-2 inline" />
              Cronograma
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'historial'
                  ? 'bg-white text-talentos-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiDollarSign className="w-4 h-4 mr-2 inline" />
              Historial
            </button>
          </div>
          <AnimatedButton
            onClick={() => setShowUploadModal(true)}
            className="bg-talentos-primary text-white px-6 py-2 rounded-lg hover:bg-talentos-primary/90"
          >
            <FiUpload className="mr-2" />
            Subir Voucher
          </AnimatedButton>
        </div>
      </div>

      {/* Contenido dinámico basado en la pestaña activa */}
      {activeTab === 'cronograma' && (
        <PaymentSchedule padreEmail={usuario?.email || 'padre1@email.com'} />
      )}

      {activeTab === 'historial' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <AnimatedCard className="bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Pagos</p>
                  <p className="text-2xl font-bold text-blue-800">{pagos.length}</p>
                </div>
                <FiDollarSign className="text-blue-500 text-2xl" />
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Aprobados</p>
                  <p className="text-2xl font-bold text-green-800">
                    {pagos.filter(p => p.estado === 'aprobado').length}
                  </p>
                </div>
                <FiCheck className="text-green-500 text-2xl" />
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-yellow-50 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {pagos.filter(p => p.estado === 'pendiente').length}
                  </p>
                </div>
                <FiClock className="text-yellow-500 text-2xl" />
              </div>
            </AnimatedCard>

            <AnimatedCard className="bg-purple-50 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Monto Total</p>
                  <p className="text-2xl font-bold text-purple-800">
                    S/. {pagos.filter(p => p.estado === 'aprobado').reduce((sum, p) => sum + p.monto, 0).toFixed(2)}
                  </p>
                </div>
                <FiDollarSign className="text-purple-500 text-2xl" />
              </div>
            </AnimatedCard>
          </div>

          <AnimatedCard>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Historial de Pagos</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estudiante</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Concepto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Monto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Fecha</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Acciones</th>
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
                      <td className="px-4 py-3 text-sm text-gray-800">{pago.nombreEstudiante}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{pago.concepto}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">S/. {pago.monto.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pago.estado)}`}>
                          {getStatusIcon(pago.estado)}
                          <span className="ml-1 capitalize">{pago.estado.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedPayment(pago)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Subir Voucher de Pago</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto de Pago</label>
                <select
                  value={uploadData.conceptoId}
                  onChange={(e) => setUploadData({...uploadData, conceptoId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                  <p className="text-sm text-blue-800">
                    <strong>Monto:</strong> S/. {getConceptoInfo(uploadData.conceptoId).monto.toFixed(2)}
                  </p>
                  {getConceptoInfo(uploadData.conceptoId).fechaVencimiento && (
                    <p className="text-sm text-blue-800">
                      <strong>Vencimiento:</strong> {new Date(getConceptoInfo(uploadData.conceptoId).fechaVencimiento).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm text-blue-600 mt-1">
                    {getConceptoInfo(uploadData.conceptoId).descripcion}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                <select
                  value={uploadData.metodoPago}
                  onChange={(e) => setUploadData({...uploadData, metodoPago: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="transferencia">Transferencia</option>
                  <option value="deposito">Depósito</option>
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Operación</label>
                <input
                  type="text"
                  value={uploadData.numeroOperacion}
                  onChange={(e) => setUploadData({...uploadData, numeroOperacion: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: TR001234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voucher</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Subir Voucher
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-lg mx-4"
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
      </div>
    </div>
  )
}

export default Payments