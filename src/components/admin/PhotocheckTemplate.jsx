import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import {
  FiDownload,
  FiPrinter,
  FiX,
  FiUser,
  FiBook,
  FiMail,
  FiPhone,
  FiFileText
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AnimatedButton from '../common/AnimatedButton'
import { downloadPhotocheckPDF, downloadPhotocheckPDFDirect } from '../../utils/pdfGenerator'
import { showSuccess, showError } from '../../utils/sweetAlert'

const PhotocheckTemplate = ({ student, qrCode, onClose, isOpen }) => {
  const photocheckRef = useRef(null)

  if (!isOpen || !student) return null

  const handleDownload = () => {
    if (photocheckRef.current) {
      // Create a canvas to convert the photocheck to image
      const element = photocheckRef.current
      
      // Use html2canvas or similar library would be ideal here
      // For now, we'll use a simpler approach
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Set canvas size to match photocheck dimensions
      canvas.width = 340
      canvas.height = 540
      
      // Draw background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw border
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 2
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
      
      // Draw header
      ctx.fillStyle = '#1e40af'
      ctx.fillRect(20, 20, canvas.width - 40, 80)
      
      // Add text content
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('COLEGIO TALENTOS', canvas.width / 2, 50)
      ctx.font = '14px Arial'
      ctx.fillText('FOTOCHECK ESTUDIANTIL', canvas.width / 2, 75)
      
      // Student info
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(student.nombre, 30, 140)
      ctx.fillText(student.apellidos, 30, 165)
      
      ctx.font = '14px Arial'
      ctx.fillText(`${student.grado} - Sección ${student.seccion}`, 30, 190)
      ctx.fillText(`Código: ${student.codigoQR || `ST${student.id.toString().padStart(6, '0')}`}`, 30, 215)
      
      // Create download link
      const link = document.createElement('a')
      link.download = `fotocheck-${student.nombre.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showSuccess('Descarga iniciada', 'El fotocheck se está descargando')
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const photocheckHTML = photocheckRef.current.innerHTML
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fotocheck - ${student.nombre} ${student.apellidos}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .photocheck { 
              width: 85mm; 
              height: 135mm; 
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            @media print {
              body { margin: 0; padding: 0; }
              .photocheck { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="photocheck">${photocheckHTML}</div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  const currentDate = format(new Date(), 'dd/MM/yyyy', { locale: es })
  const validUntil = format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy', { locale: es })
  
  const generatePDFFilename = () => {
    const nombre = (student?.nombre || 'estudiante').replace(/\s+/g, '-')
    const apellidos = (student?.apellidos || '').replace(/\s+/g, '-')
    return `fotocheck-${nombre}-${apellidos}.pdf`
  }

  const handleDownloadDirectPDF = () => {
    try {
      downloadPhotocheckPDFDirect(student, qrCode)
      showSuccess('PDF descargado', 'El fotocheck PDF A5 se ha descargado correctamente')
    } catch (error) {
      console.error('Error:', error)
      showError('Error', 'No se pudo generar el PDF')
    }
  }

  const handleDownloadAlternatePDF = async () => {
    try {
      if (photocheckRef.current) {
        await downloadPhotocheckPDF(photocheckRef.current, student)
        showSuccess('PDF descargado', 'El fotocheck PDF se ha descargado correctamente')
      }
    } catch (error) {
      showError('Error', 'No se pudo generar el PDF alternativo')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Fotocheck del Estudiante</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Vista previa del fotocheck para {student.nombre} {student.apellidos}
            </p>
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

        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            {/* Photocheck Preview */}
            <div className="flex-1 flex justify-center">
              <div 
                ref={photocheckRef}
                className="w-full max-w-[340px] mx-auto lg:mx-0 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden relative"
                style={{ aspectRatio: '340/540' }}
              >
                {/* Header with Logo */}
                <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white p-4 text-center relative">
                  <div className="absolute inset-0 bg-black opacity-10"></div>
                  <div className="relative z-10">
                    <img 
                      src="/logo-talentos.jpeg" 
                      alt="Colegio Talentos" 
                      className="h-16 mx-auto mb-2 filter brightness-0 invert"
                    />
                    <h1 className="text-xl font-bold tracking-wide">COLEGIO TALENTOS</h1>
                    <p className="text-sm opacity-90 mt-1">FOTOCHECK ESTUDIANTIL</p>
                    <div className="w-16 h-0.5 bg-white opacity-60 mx-auto mt-2"></div>
                  </div>
                </div>

                {/* Student Photo Section */}
                <div className="p-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-24 h-32 bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg border-2 border-gray-300 shadow-inner flex items-center justify-center overflow-hidden">
                        {student?.foto ? (
                          <img 
                            src={student.foto} 
                            alt={`${student?.nombre} ${student?.apellidos}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <FiUser className="w-8 h-8 text-gray-500 mx-auto mb-1" />
                            <span className="text-xs text-gray-500">FOTO</span>
                          </div>
                        )}
                      </div>
                      {/* Photo frame decoration */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg -z-10 opacity-20"></div>
                    </div>
                  </div>
                </div>

                {/* Student Information */}
                <div className="p-4 space-y-3 flex-1">
                  {/* Name Section */}
                  <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                      {student?.nombre || 'NOMBRE'}
                    </h2>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {student?.apellidos || 'APELLIDOS'}
                    </h3>
                  </div>

                  {/* Academic Info */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white rounded p-2 shadow-sm">
                        <span className="text-gray-500 text-xs block">Grado</span>
                        <span className="font-semibold text-gray-900">{student?.grado || 'N/A'}</span>
                      </div>
                      <div className="bg-white rounded p-2 shadow-sm">
                        <span className="text-gray-500 text-xs block">Sección</span>
                        <span className="font-semibold text-gray-900">{student?.seccion || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-500">Código ID:</span>
                      <span className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {student?.codigoQR || `ST${student?.id?.toString().padStart(6, '0')}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-500">Emisión:</span>
                      <span className="font-medium text-gray-700">{currentDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500">Válido hasta:</span>
                      <span className="font-medium text-green-700">{validUntil}</span>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  {qrCode && (
                    <div className="flex justify-center pt-2">
                      <div className="bg-white p-2 rounded-lg border-2 border-blue-100 shadow-sm">
                        <img 
                          src={qrCode.dataURL} 
                          alt="QR Code" 
                          className="w-16 h-16"
                        />
                        <div className="text-center mt-1">
                          <span className="text-xs text-gray-500 font-mono">
                            {(student?.codigoQR || `ST${student?.id?.toString().padStart(6, '0')}`).slice(-6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Validity Badge */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-700 font-medium">DOCUMENTO OFICIAL</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-2 text-center border-t">
                  <p className="text-xs text-gray-600 font-medium">
                    Colegio Talentos • Lima, Perú
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Válido únicamente con fotografía • No transferible
                  </p>
                </div>

                {/* Security Pattern */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full opacity-5">
                    <div className="grid grid-cols-8 grid-rows-12 h-full">
                      {Array.from({ length: 96 }).map((_, i) => (
                        <div key={i} className="border border-blue-200"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Panel */}
            <div className="w-full lg:w-80 space-y-3 sm:space-y-4">
              {/* Student Details */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center space-x-2">
                  <FiUser className="w-5 h-5 text-blue-600" />
                  <span>Información del Estudiante</span>
                </h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-600">Nombre completo:</span>
                    <p className="font-medium">{student.nombre} {student.apellidos}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Grado y sección:</span>
                    <p className="font-medium">{student.grado} - Sección {student.seccion}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Padre/Tutor:</span>
                    <p className="font-medium">{student.padre}</p>
                  </div>
                  {student.telefono && (
                    <div>
                      <span className="text-gray-600">Teléfono:</span>
                      <p className="font-medium">{student.telefono}</p>
                    </div>
                  )}
                  {student.fechaNacimiento && (
                    <div>
                      <span className="text-gray-600">Fecha de nacimiento:</span>
                      <p className="font-medium">
                        {format(new Date(student.fechaNacimiento), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Information */}
              {qrCode && (
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">Información del QR</h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <p className="text-gray-600 text-xs sm:text-sm">
                      El código QR contiene información encriptada del estudiante para verificación de identidad y control de acceso.
                    </p>
                    <div className="bg-white p-2 rounded border text-xs font-mono text-gray-700">
                      Código: {qrCode.qrData.codigo}
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">Instrucciones de uso</h3>
                <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                  <li>• Usar todos los días de clases</li>
                  <li>• Presentar en portería del colegio</li>
                  <li>• No doblar ni maltratar</li>
                  <li>• Reportar inmediatamente si se pierde</li>
                  <li>• Válido solo con foto visible</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-2 sm:space-y-3">
                <AnimatedButton
                  variant="primary"
                  icon={FiFileText}
                  onClick={handleDownloadDirectPDF}
                  className="w-full min-h-[44px] sm:min-h-auto text-sm sm:text-base"
                >
                  PDF A5 Profesional (Recomendado)
                </AnimatedButton>

                <AnimatedButton
                  variant="secondary"
                  icon={FiFileText}
                  onClick={handleDownloadAlternatePDF}
                  className="w-full min-h-[44px] sm:min-h-auto text-sm sm:text-base"
                >
                  PDF Captura Visual
                </AnimatedButton>

                <AnimatedButton
                  variant="outline"
                  icon={FiDownload}
                  onClick={handleDownload}
                  className="w-full min-h-[44px] sm:min-h-auto text-sm sm:text-base"
                >
                  Descargar PNG
                </AnimatedButton>
                
                <AnimatedButton
                  variant="outline"
                  icon={FiPrinter}
                  onClick={handlePrint}
                  className="w-full min-h-[44px] sm:min-h-auto text-sm sm:text-base"
                >
                  Imprimir Vista Previa
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200">
          <AnimatedButton
            variant="outline"
            onClick={onClose}
            className="min-h-[44px] sm:min-h-auto"
          >
            Cerrar
          </AnimatedButton>
        </div>
      </motion.div>
    </div>
  )
}

export default PhotocheckTemplate