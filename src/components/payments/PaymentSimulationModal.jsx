import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiCreditCard, 
  FiDollarSign, 
  FiCheck, 
  FiX,
  FiLoader,
  FiCopy,
  FiInfo,
  FiAlertCircle
} from 'react-icons/fi'
import AnimatedButton from '../common/AnimatedButton'
import { showSuccess, showError } from '../../utils/sweetAlert'
import usePaymentsStore from '../../stores/paymentsStore'
import useNotificationsStore from '../../stores/notificationsStore'

const PaymentSimulationModal = ({ isOpen, onClose, concepto, estudiante }) => {
  const [step, setStep] = useState(1) // 1: método, 2: proceso, 3: confirmación
  const [paymentMethod, setPaymentMethod] = useState('')
  const [processing, setProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState({
    numeroOperacion: '',
    banco: '',
    titular: ''
  })
  
  const { subirVoucher } = usePaymentsStore()
  const { agregarNotificacion } = useNotificationsStore()

  const paymentMethods = [
    {
      id: 'transferencia',
      name: 'Transferencia Bancaria',
      icon: '🏦',
      description: 'Transfiere desde tu banco',
      accounts: [
        { banco: 'BCP', cuenta: '123-456789-0-12', cci: '00212300456789012' },
        { banco: 'BBVA', cuenta: '0011-0123-0100123456', cci: '01101230100123456' }
      ]
    },
    {
      id: 'yape',
      name: 'Yape',
      icon: '📱',
      description: 'Pago rápido con Yape',
      numero: '999 888 777'
    },
    {
      id: 'plin',
      name: 'Plin',
      icon: '💜',
      description: 'Pago instantáneo con Plin',
      numero: '999 888 777'
    },
    {
      id: 'tarjeta',
      name: 'Tarjeta de Crédito/Débito',
      icon: '💳',
      description: 'Paga con tu tarjeta',
      comingSoon: true
    }
  ]

  const handlePaymentMethodSelect = (method) => {
    if (method.comingSoon) {
      showError('Método no disponible', 'Este método de pago estará disponible próximamente')
      return
    }
    setPaymentMethod(method.id)
    setStep(2)
  }

  const simulatePayment = async () => {
    setProcessing(true)
    
    // Simular proceso de pago
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generar número de operación simulado
    const numeroOperacion = `${paymentMethod.toUpperCase()}-${Date.now().toString().slice(-8)}`
    
    // Registrar el pago
    const pagoData = {
      estudianteId: estudiante.id,
      nombreEstudiante: estudiante.nombreCompleto,
      padreEmail: estudiante.padreEmail,
      concepto: concepto.nombre,
      monto: concepto.monto,
      fechaVencimiento: concepto.fechaVencimiento,
      fechaPago: new Date().toISOString().split('T')[0],
      metodoPago: paymentMethod,
      numeroOperacion,
      voucher: 'simulacion_' + numeroOperacion + '.jpg',
      banco: paymentData.banco || paymentMethod,
      titular: paymentData.titular || 'Simulación de Pago'
    }
    
    const nuevoPago = subirVoucher(pagoData)
    
    // Agregar notificación
    agregarNotificacion({
      tipo: 'pago',
      titulo: '✅ Pago Procesado',
      mensaje: `Su pago de ${concepto.nombre} ha sido procesado exitosamente`,
      priority: 'media',
      actionUrl: '/parent/payments'
    })
    
    setPaymentData({ ...paymentData, numeroOperacion })
    setProcessing(false)
    setStep(3)
    
    // Simular aprobación automática después de 2 segundos
    setTimeout(() => {
      const { aprobarPago } = usePaymentsStore.getState()
      aprobarPago(nuevoPago.id, 'sistema@talentos.edu', 'Pago aprobado automáticamente (simulación)')
      
      agregarNotificacion({
        tipo: 'pago',
        titulo: '✅ Pago Aprobado',
        mensaje: `Su pago ha sido aprobado y registrado en el sistema`,
        priority: 'alta',
        actionUrl: '/parent/payments'
      })
    }, 2000)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showSuccess('Copiado', 'Información copiada al portapapeles')
  }

  const resetModal = () => {
    setStep(1)
    setPaymentMethod('')
    setPaymentData({ numeroOperacion: '', banco: '', titular: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {step === 1 && 'Selecciona método de pago'}
              {step === 2 && 'Procesar pago'}
              {step === 3 && 'Pago completado'}
            </h3>
            <button
              onClick={resetModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Información del pago */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-800 font-medium">{concepto.nombre}</p>
                <p className="text-xs text-blue-600 mt-1">{estudiante.nombreCompleto}</p>
              </div>
              <p className="text-xl font-bold text-blue-900">S/. {concepto.monto.toFixed(2)}</p>
            </div>
          </div>

          {/* Step 1: Selección de método */}
          {step === 1 && (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePaymentMethodSelect(method)}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    method.comingSoon 
                      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
                      : 'border-gray-300 hover:border-blue-500 hover:shadow-md'
                  }`}
                  disabled={method.comingSoon}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                    {method.comingSoon && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Próximamente
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Step 2: Proceso de pago */}
          {step === 2 && (
            <div className="space-y-6">
              {paymentMethod === 'transferencia' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Cuentas disponibles:</h4>
                    {paymentMethods.find(m => m.id === 'transferencia').accounts.map((account, idx) => (
                      <div key={idx} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium text-gray-700">{account.banco}</p>
                          <button
                            onClick={() => copyToClipboard(account.cuenta)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Cuenta: {account.cuenta}</p>
                        <p className="text-sm text-gray-600">CCI: {account.cci}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <FiInfo className="text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">
                        Titular: TALENTOS COLLEGE S.A.C.<br />
                        RUC: 20123456789
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(paymentMethod === 'yape' || paymentMethod === 'plin') && (
                <div className="text-center space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">Número de teléfono:</p>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-2xl font-bold text-gray-800">
                        {paymentMethods.find(m => m.id === paymentMethod).numero}
                      </p>
                      <button
                        onClick={() => copyToClipboard(paymentMethods.find(m => m.id === paymentMethod).numero)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FiCopy className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">TALENTOS COLLEGE</p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center mb-3">
                      <span className="text-6xl">
                        {paymentMethod === 'yape' ? '📱' : '💜'}
                      </span>
                    </div>
                    <p className="text-sm text-purple-800">
                      Escanea el código QR o usa el número
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del titular de la cuenta
                  </label>
                  <input
                    type="text"
                    value={paymentData.titular}
                    onChange={(e) => setPaymentData({ ...paymentData, titular: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese el nombre del titular"
                  />
                </div>

                <AnimatedButton
                  onClick={simulatePayment}
                  disabled={processing || !paymentData.titular}
                  className="w-full"
                  variant="primary"
                >
                  {processing ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="mr-2" />
                      Confirmar pago
                    </>
                  )}
                </AnimatedButton>
              </div>
            </div>
          )}

          {/* Step 3: Confirmación */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <FiCheck className="w-10 h-10 text-green-600" />
              </motion.div>
              
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">¡Pago procesado!</h4>
                <p className="text-gray-600">
                  Tu pago ha sido registrado exitosamente
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">N° Operación:</span>
                  <span className="font-medium">{paymentData.numeroOperacion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Método:</span>
                  <span className="font-medium capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monto:</span>
                  <span className="font-medium">S/. {concepto.monto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className="text-yellow-600 font-medium">En revisión</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <FiInfo className="inline mr-1" />
                  Recibirás una notificación cuando tu pago sea aprobado
                </p>
              </div>

              <AnimatedButton
                onClick={resetModal}
                className="w-full"
                variant="primary"
              >
                Finalizar
              </AnimatedButton>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PaymentSimulationModal