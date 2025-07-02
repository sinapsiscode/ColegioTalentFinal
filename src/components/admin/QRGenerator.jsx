import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiGrid,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiUser,
  FiSettings,
  FiX,
  FiCreditCard
} from 'react-icons/fi'
import { generatePhotocheckQR, downloadQRCode } from '../../utils/qrGenerator'
import { generateStudentQRSecure, downloadSecureQR } from '../../utils/secureQRGenerator'
import { showSuccess, showError } from '../../utils/sweetAlert'
import AnimatedButton from '../common/AnimatedButton'
import LoadingSpinner from '../common/LoadingSpinner'
import PhotocheckTemplate from './PhotocheckTemplate'

const QRGenerator = ({ student, onClose, isOpen }) => {
  const [qrCode, setQrCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPhotocheck, setShowPhotocheck] = useState(false)
  const [options, setOptions] = useState({
    includeContactInfo: false,
    validUntil: null,
    includePhoto: true
  })

  if (!isOpen) return null

  const handleGenerateQR = async () => {
    setLoading(true)
    try {
      // Intentar generar con el método seguro primero
      let result
      try {
        result = await generateStudentQRSecure(student)
        // Formatear para compatibilidad con el componente
        result = {
          dataURL: result.dataURL,
          qrData: result.qrData,
          qrString: JSON.stringify(result.qrData),
          canvas: result.canvas
        }
      } catch (secureError) {
        console.warn('Método seguro falló, usando fallback:', secureError)
        // Fallback al método original
        result = await generatePhotocheckQR(student, options)
      }
      
      setQrCode(result)
      showSuccess('QR Generado', 'Código QR creado exitosamente')
    } catch (error) {
      showError('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQR = () => {
    if (qrCode) {
      const nombre = (student?.nombre || 'estudiante').replace(/\s+/g, '-')
      const apellidos = (student?.apellidos || '').replace(/\s+/g, '-')
      const filename = `qr-${nombre}-${apellidos}.png`
      
      try {
        // Intentar descargar usando canvas si está disponible
        if (qrCode.canvas) {
          downloadSecureQR(qrCode.canvas, filename)
        } else {
          // Fallback al método original
          downloadQRCode(qrCode.dataURL, filename)
        }
        showSuccess('Descarga iniciada', 'El código QR se está descargando')
      } catch (error) {
        showError('Error', 'No se pudo descargar el código QR')
      }
    }
  }

  const handleRegenerateQR = () => {
    setQrCode(null)
    handleGenerateQR()
  }

  const updateOption = (key, value) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleShowPhotocheck = () => {
    setShowPhotocheck(true)
  }

  const handleClosePhotocheck = () => {
    setShowPhotocheck(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiGrid className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Generar QR para Fotocheck</h2>
              <p className="text-gray-600 text-sm">
                {student.nombre} {student.apellidos} - {student.grado} {student.seccion}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FiX className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <FiUser className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Información del Estudiante</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nombre:</span>
                <span className="ml-2 font-medium">{student.nombre} {student.apellidos}</span>
              </div>
              <div>
                <span className="text-gray-600">Código:</span>
                <span className="ml-2 font-medium">{student.codigoQR || `ST${student.id.toString().padStart(6, '0')}`}</span>
              </div>
              <div>
                <span className="text-gray-600">Grado:</span>
                <span className="ml-2 font-medium">{student.grado}</span>
              </div>
              <div>
                <span className="text-gray-600">Sección:</span>
                <span className="ml-2 font-medium">{student.seccion}</span>
              </div>
              <div>
                <span className="text-gray-600">Padre/Tutor:</span>
                <span className="ml-2 font-medium">{student.padre}</span>
              </div>
              <div>
                <span className="text-gray-600">Teléfono:</span>
                <span className="ml-2 font-medium">{student.telefono}</span>
              </div>
            </div>
          </div>

          {/* QR Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-3">
              <FiSettings className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Opciones del QR</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeContactInfo}
                  onChange={(e) => updateOption('includeContactInfo', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Incluir información de contacto</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includePhoto}
                  onChange={(e) => updateOption('includePhoto', e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Incluir foto en fotocheck</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de vencimiento (opcional)
              </label>
              <input
                type="date"
                value={options.validUntil || ''}
                onChange={(e) => updateOption('validUntil', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* QR Display */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-3">Generando código QR...</p>
              </div>
            ) : qrCode ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <img 
                    src={qrCode.dataURL} 
                    alt="Código QR del estudiante" 
                    className="w-40 h-40 object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Código QR generado para: <span className="font-medium">{student.nombre} {student.apellidos}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Código: {qrCode.qrData.codigo}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <AnimatedButton
                    variant="primary"
                    icon={FiDownload}
                    onClick={handleDownloadQR}
                    size="sm"
                  >
                    Descargar QR
                  </AnimatedButton>
                  <AnimatedButton
                    variant="secondary"
                    icon={FiCreditCard}
                    onClick={handleShowPhotocheck}
                    size="sm"
                  >
                    Ver Fotocheck
                  </AnimatedButton>
                  <AnimatedButton
                    variant="outline"
                    icon={FiRefreshCw}
                    onClick={handleRegenerateQR}
                    size="sm"
                  >
                    Regenerar
                  </AnimatedButton>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiGrid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Haz clic en "Generar QR" para crear el código QR del estudiante
                </p>
                <AnimatedButton
                  variant="primary"
                  icon={FiGrid}
                  onClick={handleGenerateQR}
                  disabled={loading}
                >
                  Generar QR
                </AnimatedButton>
              </div>
            )}
          </div>

          {/* QR Data Preview */}
          {qrCode && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FiEye className="w-4 h-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Datos del QR</h4>
              </div>
              <div className="text-xs text-gray-600 bg-white p-3 rounded border font-mono">
                {JSON.stringify(qrCode.qrData, null, 2)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <AnimatedButton
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </AnimatedButton>
        </div>
      </motion.div>

      {/* Photocheck Template Modal */}
      <PhotocheckTemplate
        student={student}
        qrCode={qrCode}
        isOpen={showPhotocheck}
        onClose={handleClosePhotocheck}
      />
    </div>
  )
}

export default QRGenerator