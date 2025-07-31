import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  FiX,
  FiCreditCard,
  FiUpload,
  FiCheck,
  FiAlertCircle,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiFileText,
  FiEye,
  FiDownload,
  FiSmartphone
} from 'react-icons/fi'
import usePaymentConceptsStore from '../../stores/paymentConceptsStore'
import usePaymentsStore from '../../stores/paymentsStore'
import useAuthStore from '../../stores/authStore'
import PaymentSimulationModal from './PaymentSimulationModal'
import Swal from 'sweetalert2'
import { LIMITS, MESSAGES } from '../../utils/constants'

const PaymentModal = ({ isOpen, onClose, payment, onPaymentSuccess }) => {
  const { usuario } = useAuthStore()
  const { subirVoucher } = usePaymentsStore()
  const { getConceptosActivos } = usePaymentConceptsStore()
  
  const [paymentMethod, setPaymentMethod] = useState('upload') // 'upload' o 'direct'
  const [showSimulationModal, setShowSimulationModal] = useState(false)
  const [step, setStep] = useState(1) // 1: resumen, 2: método de pago, 3: voucher, 4: confirmación
  const [paymentData, setPaymentData] = useState({
    metodoPago: 'transferencia',
    numeroOperacion: '',
    voucher: null,
    observaciones: ''
  })
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  if (!isOpen || !payment) return null

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto)
  }

  const formatearFecha = (fecha) => {
    return format(new Date(fecha), 'dd MMM yyyy', { locale: es })
  }

  const handleFileChange = (file) => {
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        Swal.fire(MESSAGES.TITLES.ERROR, 'Solo se permiten archivos JPG, PNG o PDF', 'error')
        return
      }
      
      // Validar tamaño (máximo configurado)
      if (file.size > LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024) {
        Swal.fire(MESSAGES.TITLES.ERROR, MESSAGES.ERROR.FILE_TOO_LARGE, 'error')
        return
      }
      
      setPaymentData(prev => ({ ...prev, voucher: file }))
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    handleFileChange(file)
  }

  const handleSubmitPayment = async () => {
    if (!paymentData.numeroOperacion.trim()) {
      Swal.fire('Error', 'El número de operación es obligatorio', 'error')
      return
    }

    if (!paymentData.voucher) {
      Swal.fire('Error', 'Debe adjuntar el voucher de pago', 'error')
      return
    }

    setLoading(true)

    try {
      // Simular envío del pago
      await new Promise(resolve => setTimeout(resolve, 2000))

      const pagoData = {
        estudianteId: payment.estudianteId,
        nombreEstudiante: payment.nombreEstudiante,
        padreEmail: usuario?.email || 'padre1@email.com',
        concepto: `Pensión ${payment.mes} ${payment.año}`,
        monto: payment.monto,
        fechaVencimiento: payment.fechaVencimiento,
        fechaPago: new Date().toISOString().split('T')[0],
        metodoPago: paymentData.metodoPago,
        numeroOperacion: paymentData.numeroOperacion,
        voucher: paymentData.voucher.name,
        observaciones: paymentData.observaciones
      }

      subirVoucher(pagoData)
      setStep(4)
      
      setTimeout(() => {
        onPaymentSuccess?.(payment)
        onClose()
        setStep(1)
        setPaymentData({
          metodoPago: 'transferencia',
          numeroOperacion: '',
          voucher: null,
          observaciones: ''
        })
      }, 3000)

    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al procesar el pago', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Opciones de pago */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowSimulationModal(true)
                  onClose()
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                    <FiCreditCard className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Pago Directo</h4>
                  <p className="text-sm text-gray-600">Paga con tarjeta, Yape o Plin</p>
                  <p className="text-xs text-green-600 mt-2">✨ Aprobación inmediata</p>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setPaymentMethod('upload')
                  setStep(2)
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                    <FiUpload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Subir Voucher</h4>
                  <p className="text-sm text-gray-600">Sube tu comprobante de pago</p>
                  <p className="text-xs text-blue-600 mt-2">📄 Validación en 24h</p>
                </div>
              </motion.button>
            </div>
            
            {/* Resumen del pago */}
            <div className="bg-gradient-to-r from-talentos-primary/10 to-talentos-secondary/10 rounded-lg p-6 border border-talentos-primary/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FiFileText className="w-5 h-5 text-talentos-primary" />
                <span>Resumen del Pago</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Concepto</label>
                  <p className="text-gray-900 font-medium">Pensión {payment.mes} {payment.año}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estudiante</label>
                  <p className="text-gray-900 font-medium">{payment.nombreEstudiante}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Monto</label>
                  <p className="text-2xl font-bold text-talentos-primary">{formatearMonto(payment.monto)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vencimiento</label>
                  <p className="text-gray-900 font-medium">{formatearFecha(payment.fechaVencimiento)}</p>
                </div>
              </div>
            </div>

            {/* Información bancaria */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Datos para el Pago</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <h5 className="font-medium text-gray-900 mb-2">Banco BCP</h5>
                  <p className="text-sm text-gray-600">Cuenta Corriente</p>
                  <p className="font-mono text-lg font-bold text-gray-900">191-12345678-90</p>
                  <p className="text-sm text-gray-600">COLEGIO TALENTOS SAC</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <h5 className="font-medium text-gray-900 mb-2">Interbank</h5>
                  <p className="text-sm text-gray-600">Cuenta Ahorros</p>
                  <p className="font-mono text-lg font-bold text-gray-900">898-87654321-09</p>
                  <p className="text-sm text-gray-600">COLEGIO TALENTOS SAC</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Importante:</p>
                    <p className="text-sm text-yellow-700">
                      Realice el pago por el monto exacto y conserve el voucher para subirlo en el siguiente paso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Método de Pago</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦' },
                { value: 'deposito', label: 'Depósito en Ventanilla', icon: '🏛️' },
                { value: 'yape', label: 'Yape', icon: '📱' },
                { value: 'plin', label: 'Plin', icon: '💳' }
              ].map((metodo) => (
                <motion.button
                  key={metodo.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentData(prev => ({ ...prev, metodoPago: metodo.value }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentData.metodoPago === metodo.value
                      ? 'border-talentos-primary bg-talentos-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{metodo.icon}</div>
                    <p className="font-medium text-gray-900">{metodo.label}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Operación *
              </label>
              <input
                type="text"
                value={paymentData.numeroOperacion}
                onChange={(e) => setPaymentData(prev => ({ ...prev, numeroOperacion: e.target.value }))}
                placeholder="Ej: 001234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                value={paymentData.observaciones}
                onChange={(e) => setPaymentData(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Alguna observación adicional..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir Voucher de Pago</h3>
            
            {/* Zona de drag & drop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-talentos-primary bg-talentos-primary/10' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {paymentData.voucher ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                    <FiCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{paymentData.voucher.name}</p>
                    <p className="text-sm text-gray-600">
                      {(paymentData.voucher.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setPaymentData(prev => ({ ...prev, voucher: null }))}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                    <span className="text-gray-300">|</span>
                    <label className="text-talentos-primary hover:text-talentos-primary/80 text-sm font-medium cursor-pointer">
                      Cambiar archivo
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto">
                    <FiUpload className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Arrastra tu voucher aquí o{' '}
                      <label className="text-talentos-primary hover:text-talentos-primary/80 cursor-pointer">
                        selecciona un archivo
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      JPG, PNG o PDF (máximo {LIMITS.MAX_FILE_SIZE_MB}MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Información del pago */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Resumen del Pago</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-medium capitalize">{paymentData.metodoPago}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">N° Operación:</span>
                  <span className="font-medium">{paymentData.numeroOperacion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-medium">{formatearMonto(payment.monto)}</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto"
            >
              <FiCheck className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Pago Enviado Exitosamente!
              </h3>
              <p className="text-gray-600">
                Tu voucher ha sido enviado para validación. Te notificaremos cuando sea aprobado.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Número de referencia:</strong> PAY-{Date.now().toString().slice(-8)}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Guarda este número para futuras consultas
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiCreditCard className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-semibold">Realizar Pago</h2>
                  <p className="text-sm opacity-90">Pensión {payment.mes} {payment.año}</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Progress indicator */}
            {step !== 4 && (
              <div className="mt-6">
                <div className="flex items-center space-x-2">
                  {[1, 2, 3].map((stepNumber) => (
                    <React.Fragment key={stepNumber}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                        step >= stepNumber ? 'bg-white text-talentos-primary' : 'bg-white/20 text-white'
                      }`}>
                        {stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div className={`flex-1 h-1 rounded ${
                          step > stepNumber ? 'bg-white' : 'bg-white/20'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span>Resumen</span>
                  <span>Método</span>
                  <span>Voucher</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {getStepContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              {step > 1 && step !== 4 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
              )}
              
              <div className="flex space-x-3 ml-auto">
                {step !== 4 && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                
                {step < 3 && (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 2 && !paymentData.numeroOperacion.trim()}
                    className="px-6 py-2 bg-talentos-primary text-white rounded-lg hover:bg-talentos-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                )}
                
                {step === 3 && (
                  <button
                    onClick={handleSubmitPayment}
                    disabled={loading || !paymentData.voucher || !paymentData.numeroOperacion.trim()}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-4 h-4" />
                        <span>Confirmar Pago</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Modal de simulación de pago */}
      {showSimulationModal && payment && (
        <PaymentSimulationModal
          isOpen={showSimulationModal}
          onClose={() => {
            setShowSimulationModal(false)
            // Reabrir el modal original si es necesario
          }}
          concepto={{
            id: payment.id || 1,
            nombre: `Pensión ${payment.mes} ${payment.año}`,
            monto: payment.monto,
            fechaVencimiento: payment.fechaVencimiento
          }}
          estudiante={{
            id: payment.estudianteId,
            nombreCompleto: payment.nombreEstudiante,
            padreEmail: usuario?.email || 'padre1@email.com'
          }}
        />
      )}
    </AnimatePresence>
  )
}

export default PaymentModal