import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiCamera, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiRefreshCw,
  FiUser,
  FiClock,
  FiArrowRight,
  FiArrowLeft,
  FiUpload
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import LoadingSpinner from '../common/LoadingSpinner'
import { showSuccess, showError, showInfo } from '../../utils/sweetAlert'
import { DatabaseQueries } from '../../data/databaseSchema'

const QRScannerSimple = ({ onScanComplete }) => {
  const [scanResult, setScanResult] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [scanHistory, setScanHistory] = useState([])
  const [showUploadOption, setShowUploadOption] = useState(false)
  const fileInputRef = useRef(null)
  
  // Simular escaneo con entrada manual (para desarrollo)
  const [manualCode, setManualCode] = useState('')
  
  useEffect(() => {
    loadTodayHistory()
  }, [])
  
  const loadTodayHistory = () => {
    const history = JSON.parse(localStorage.getItem('scanHistory') || '[]')
    const todayHistory = history.filter(scan => {
      const scanDate = new Date(scan.timestamp)
      const today = new Date()
      return scanDate.toDateString() === today.toDateString()
    })
    setScanHistory(todayHistory.slice(-5))
  }
  
  // Procesar código QR (manual o desde archivo)
  const processQRCode = async (qrText) => {
    setProcessing(true)
    
    try {
      // Parsear el código QR
      let qrData
      try {
        qrData = JSON.parse(qrText)
      } catch {
        qrData = { codigo: qrText }
      }
      
      // Buscar estudiante
      const estudiante = DatabaseQueries.getAllStudents().find(
        s => s.codigo_qr === qrData.codigo || s.codigo_qr === qrText
      )
      
      if (!estudiante) {
        throw new Error('Código QR no válido')
      }
      
      // Determinar entrada/salida
      const lastEntry = scanHistory.find(h => h.studentId === estudiante.id)
      const isEntry = !lastEntry || lastEntry.type === 'salida'
      
      // Crear registro
      const attendanceRecord = {
        studentId: estudiante.id,
        studentName: `${estudiante.nombre} ${estudiante.apellidos}`,
        grado: estudiante.grado,
        seccion: estudiante.seccion,
        timestamp: new Date().toISOString(),
        type: isEntry ? 'entrada' : 'salida',
        scannerUser: 'Usuario Scanner'
      }
      
      // Guardar en historial
      const history = JSON.parse(localStorage.getItem('scanHistory') || '[]')
      history.push(attendanceRecord)
      localStorage.setItem('scanHistory', JSON.stringify(history))
      
      // Actualizar UI
      setScanResult({
        success: true,
        student: estudiante,
        type: attendanceRecord.type,
        time: new Date()
      })
      
      showSuccess(
        `${attendanceRecord.type === 'entrada' ? 'Entrada' : 'Salida'} registrada`,
        `${estudiante.nombre} ${estudiante.apellidos} - ${estudiante.grado}`
      )
      
      setScanHistory(prev => [...prev, attendanceRecord].slice(-5))
      
      if (onScanComplete) {
        onScanComplete(attendanceRecord)
      }
      
      setTimeout(() => {
        setScanResult(null)
        setManualCode('')
      }, 3000)
      
    } catch (error) {
      setScanResult({
        success: false,
        error: error.message || 'Error al procesar el código QR'
      })
      showError('Error', error.message || 'Código QR inválido')
      
      setTimeout(() => {
        setScanResult(null)
      }, 2000)
    } finally {
      setProcessing(false)
    }
  }
  
  // Manejar entrada manual
  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualCode.trim()) {
      processQRCode(manualCode.trim())
    }
  }
  
  // Manejar archivo de imagen
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // En producción, aquí procesarías la imagen para extraer el QR
    // Por ahora, simularemos con un código de prueba
    showInfo(
      'Función en desarrollo', 
      'La lectura de QR desde imágenes estará disponible próximamente'
    )
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiCamera className="w-6 h-6" />
              Escáner QR
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Ingresa el código QR del estudiante
            </p>
          </div>
          
          <div className="p-6">
            {/* Opciones de entrada */}
            <div className="space-y-4">
              {/* Entrada manual */}
              <form onSubmit={handleManualSubmit}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código QR Manual
                  <span className="text-xs text-gray-500 ml-2">(Ingresa o selecciona de la lista)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ej: E001234567890 o T001"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={processing}
                  />
                  <button
                    type="submit"
                    disabled={processing || !manualCode.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Escanear
                  </button>
                </div>
              </form>
              
              {/* Opción de archivo */}
              <div>
                <button
                  onClick={() => setShowUploadOption(!showUploadOption)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  <FiUpload className="w-4 h-4" />
                  {showUploadOption ? 'Ocultar' : 'Subir'} imagen con QR
                </button>
                
                {showUploadOption && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </motion.div>
                )}
              </div>
              
              {/* Mensaje informativo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Modo de desarrollo</p>
                    <p className="mb-3">
                      Para usar la cámara real, se requiere HTTPS o localhost con certificado válido.
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="font-medium text-blue-900 mb-2">Códigos de prueba disponibles:</p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Estudiantes:</p>
                          <div className="space-y-1">
                            <code className="block bg-blue-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-200" onClick={() => setManualCode('E001234567890')}>E001234567890</code>
                            <code className="block bg-blue-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-200" onClick={() => setManualCode('E002345678901')}>E002345678901</code>
                            <code className="block bg-blue-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-200" onClick={() => setManualCode('E003456789012')}>E003456789012</code>
                            <code className="block bg-blue-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-200" onClick={() => setManualCode('E004567890123')}>E004567890123</code>
                            <code className="block bg-blue-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-200" onClick={() => setManualCode('E005678901234')}>E005678901234</code>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Tutores:</p>
                          <div className="space-y-1">
                            <code className="block bg-green-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-green-200" onClick={() => setManualCode('T001')}>T001</code>
                            <code className="block bg-green-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-green-200" onClick={() => setManualCode('T002')}>T002</code>
                            <code className="block bg-green-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-green-200" onClick={() => setManualCode('T003')}>T003</code>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-blue-700">💡 Haz clic en cualquier código para usarlo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Estado de procesamiento */}
            <AnimatePresence>
              {processing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-center"
                >
                  <LoadingSpinner size="lg" className="mx-auto mb-2" />
                  <p className="text-gray-600">Procesando...</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Resultado del escaneo */}
            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="mt-6"
                >
                  {scanResult.success ? (
                    <div className="text-center bg-green-50 rounded-lg p-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                      >
                        <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      </motion.div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {scanResult.type === 'entrada' ? 'Entrada Registrada' : 'Salida Registrada'}
                      </h3>
                      
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="font-semibold">{scanResult.student.nombre} {scanResult.student.apellidos}</p>
                        <p className="text-gray-600">{scanResult.student.grado} - Sección {scanResult.student.seccion}</p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <FiClock className="w-5 h-5" />
                        <span>{format(scanResult.time, 'HH:mm:ss', { locale: es })}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center bg-red-50 rounded-lg p-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                      >
                        <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      </motion.div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
                      <p className="text-gray-600">{scanResult.error}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Historial Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiClock className="w-6 h-6" />
              Últimos Registros
            </h2>
            <p className="text-gray-100 text-sm mt-1">
              Registros del día de hoy
            </p>
          </div>
          
          <div className="p-4">
            {scanHistory.length > 0 ? (
              <div className="space-y-3">
                {scanHistory.map((scan, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      scan.type === 'entrada' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          scan.type === 'entrada' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {scan.type === 'entrada' ? <FiArrowRight /> : <FiArrowLeft />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{scan.studentName}</p>
                          <p className="text-sm text-gray-600">{scan.grado} - {scan.seccion}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(scan.timestamp), 'HH:mm', { locale: es })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {scan.type === 'entrada' ? 'Entrada' : 'Salida'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiUser className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay registros del día</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Estadísticas del día */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Día</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {scanHistory.filter(s => s.type === 'entrada').length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Entradas</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {scanHistory.filter(s => s.type === 'salida').length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Salidas</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {[...new Set(scanHistory.map(s => s.studentId))].length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Estudiantes</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {scanHistory.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Escaneos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScannerSimple