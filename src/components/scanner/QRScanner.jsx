import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiCamera,
  FiStopCircle,
  FiPlay,
  FiSettings,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiMaximize,
  FiMinimize
} from 'react-icons/fi'
import useScannerStore from '../../stores/scannerStore'
import { showSuccess, showError } from '../../utils/sweetAlert'

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const {
    escaneando,
    errorEscaner,
    configuracionEscaner,
    iniciarEscaner,
    detenerEscaner,
    procesarCodigoQR,
    limpiarError,
    actualizarConfiguracion
  } = useScannerStore()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [simulatedCamera, setSimulatedCamera] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [lastScanTime, setLastScanTime] = useState(0)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const scannerRef = useRef(null)

  // Simular entrada de QR para demostración
  const codigosEjemplo = [
    'E001234567890',
    'E006789012345',
    'E002345678901',
    'E003456789012',
    'E004567890123',
    'E005678901234'
  ]

  useEffect(() => {
    if (escaneando && simulatedCamera) {
      startSimulatedCamera()
    } else {
      stopSimulatedCamera()
    }

    return () => stopSimulatedCamera()
  }, [escaneando, simulatedCamera])

  const startSimulatedCamera = () => {
    if (videoRef.current) {
      // Simular video stream con un canvas
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      const drawCameraView = () => {
        if (!escaneando) return
        
        // Limpiar canvas
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Dibujar área de escaneo
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const size = 200
        
        // Marco de escaneo
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 3
        ctx.setLineDash([10, 5])
        ctx.strokeRect(centerX - size/2, centerY - size/2, size, size)
        
        // Línea de escaneo animada
        const scanLine = (Date.now() % 2000) / 2000 * size
        ctx.setLineDash([])
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(centerX - size/2, centerY - size/2 + scanLine)
        ctx.lineTo(centerX + size/2, centerY - size/2 + scanLine)
        ctx.stroke()
        
        // Texto de instrucciones
        ctx.fillStyle = '#ffffff'
        ctx.font = '16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Coloca el código QR en el área marcada', centerX, centerY + size/2 + 30)
        ctx.fillText('Presiona "Simular Escaneo" para probar', centerX, centerY + size/2 + 50)
        
        requestAnimationFrame(drawCameraView)
      }
      
      drawCameraView()
    }
  }

  const stopSimulatedCamera = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.fillStyle = '#374151'
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.fillStyle = '#9ca3af'
      ctx.font = '18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Cámara desactivada', canvasRef.current.width / 2, canvasRef.current.height / 2)
    }
  }

  const handleStartScanning = async () => {
    try {
      iniciarEscaner()
      setSimulatedCamera(true)
      showSuccess('Escáner iniciado', 'El escáner QR está listo para funcionar')
    } catch (error) {
      showError('Error', 'No se pudo iniciar el escáner')
    }
  }

  const handleStopScanning = () => {
    detenerEscaner()
    setSimulatedCamera(false)
    stopSimulatedCamera()
  }

  const handleSimulateScan = async () => {
    const now = Date.now()
    if (now - lastScanTime < configuracionEscaner.tiempoEspera) {
      showError('Espera un momento', 'Debes esperar antes del siguiente escaneo')
      return
    }

    const randomCode = codigosEjemplo[Math.floor(Math.random() * codigosEjemplo.length)]
    await procesarEscaneo(randomCode)
    setLastScanTime(now)
  }

  const handleManualInput = async () => {
    if (!manualCode.trim()) {
      showError('Código requerido', 'Ingresa un código QR para procesar')
      return
    }

    await procesarEscaneo(manualCode)
    setManualCode('')
  }

  const procesarEscaneo = async (codigo) => {
    try {
      const registro = await procesarCodigoQR(codigo)
      
      showSuccess(
        `${registro.tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada`,
        `${registro.estudiante.nombre} - ${registro.estudiante.grado}`
      )
      
      if (onScanSuccess) {
        onScanSuccess(registro)
      }
    } catch (error) {
      showError('Error de escaneo', error.message)
      
      if (onScanError) {
        onScanError(error)
      }
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const updateSetting = (key, value) => {
    actualizarConfiguracion({ [key]: value })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FiCamera className="w-5 h-5 text-talentos-primary" />
          <h3 className="text-lg font-semibold text-gray-900">Escáner QR</h3>
          {escaneando && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-3 h-3 bg-green-500 rounded-full"
            />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Configuración"
          >
            <FiSettings className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title={isFullscreen ? "Minimizar" : "Pantalla completa"}
          >
            {isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 bg-gray-50"
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modo de operación
                  </label>
                  <select
                    value={configuracionEscaner.modoOperacion}
                    onChange={(e) => updateSetting('modoOperacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  >
                    <option value="entrada">Solo Entrada</option>
                    <option value="salida">Solo Salida</option>
                    <option value="ambos">Entrada y Salida</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de espera (ms)
                  </label>
                  <input
                    type="number"
                    value={configuracionEscaner.tiempoEspera}
                    onChange={(e) => updateSetting('tiempoEspera', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                    min="1000"
                    max="10000"
                    step="500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configuracionEscaner.sonidoActivado}
                    onChange={(e) => updateSetting('sonidoActivado', e.target.checked)}
                    className="w-4 h-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Sonido activado</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configuracionEscaner.vibracionActivada}
                    onChange={(e) => updateSetting('vibracionActivada', e.target.checked)}
                    className="w-4 h-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Vibración activada</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configuracionEscaner.autoRegistro}
                    onChange={(e) => updateSetting('autoRegistro', e.target.checked)}
                    className="w-4 h-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Auto registro</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner View */}
      <div className={`relative ${isFullscreen ? 'h-96' : 'h-64'}`}>
        <canvas
          ref={canvasRef}
          width={600}
          height={isFullscreen ? 384 : 256}
          className="w-full h-full object-cover bg-gray-900"
        />
        
        {/* Overlay controls */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!escaneando ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartScanning}
              className="bg-talentos-primary text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-lg"
            >
              <FiPlay className="w-5 h-5" />
              <span>Iniciar Escáner</span>
            </motion.button>
          ) : (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSimulateScan}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FiCheckCircle className="w-4 h-4" />
                <span>Simular Escaneo</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStopScanning}
                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FiStopCircle className="w-4 h-4" />
                <span>Detener</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Error overlay */}
        <AnimatePresence>
          {errorEscaner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-4 right-4 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <FiAlertCircle className="w-5 h-5" />
                <span>{errorEscaner}</span>
              </div>
              <button
                onClick={limpiarError}
                className="text-red-600 hover:text-red-800"
              >
                <FiX className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ingresa código QR manualmente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManualInput}
            disabled={!manualCode.trim()}
            className="bg-talentos-primary text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Procesar
          </motion.button>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-600">Códigos de ejemplo:</span>
          {codigosEjemplo.slice(0, 3).map((codigo) => (
            <button
              key={codigo}
              onClick={() => setManualCode(codigo)}
              className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors duration-200"
            >
              {codigo}
            </button>
          ))}
        </div>
      </div>

      {/* Status info */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Modo: {configuracionEscaner.modoOperacion}</span>
            <span>•</span>
            <span>Espera: {configuracionEscaner.tiempoEspera}ms</span>
          </div>
          <div className="flex items-center space-x-2">
            {configuracionEscaner.sonidoActivado && <span>🔊</span>}
            {configuracionEscaner.vibracionActivada && <span>📳</span>}
            {configuracionEscaner.autoRegistro && <span>⚡</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner