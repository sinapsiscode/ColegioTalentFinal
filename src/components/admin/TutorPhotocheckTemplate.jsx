import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, 
  FiDownload, 
  FiPrinter, 
  FiCreditCard,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiFileText,
  FiShield,
  FiGrid
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { 
  downloadPhotocheckPDF, 
  downloadPhotocheckPDFDirect 
} from '../../utils/pdfGenerator'
import { showSuccess, showError } from '../../utils/sweetAlert'

const TutorPhotocheckTemplate = ({ 
  tutor, 
  qrCode, 
  onClose, 
  isVisible = true 
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedExport, setSelectedExport] = useState('pdf-a5')
  const photocheckRef = useRef(null)

  // Datos por defecto del tutor si no están disponibles
  const tutorData = {
    id: tutor?.id || 1,
    nombre: tutor?.nombre || 'NOMBRE TUTOR',
    apellidos: tutor?.apellidos || 'APELLIDOS TUTOR',
    especialidad: tutor?.especialidad || 'Especialidad',
    grado: tutor?.grado || 'Grado',
    seccion: tutor?.seccion || 'A',
    telefono: tutor?.telefono || '+51 999 999 999',
    email: tutor?.email || 'tutor@talentos.edu.pe',
    codigoQR: tutor?.codigoQR || `T${tutor?.id?.toString().padStart(6, '0')}`,
    fechaIngreso: tutor?.fechaIngreso || new Date().toISOString(),
    foto: tutor?.foto || null,
    ...tutor
  }

  const handleDownload = () => {
    setIsGenerating(true)
    
    try {
      // Crear canvas para renderizar el fotocheck
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Configurar dimensiones (340x540px)
      canvas.width = 340
      canvas.height = 540
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Header gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 80)
      gradient.addColorStop(0, '#1e3a8a')
      gradient.addColorStop(0.5, '#1e40af')
      gradient.addColorStop(1, '#1d4ed8')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 340, 80)
      
      // Texto del header
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px Helvetica'
      ctx.textAlign = 'center'
      ctx.fillText('COLEGIO TALENTOS', 170, 30)
      
      ctx.font = '12px Helvetica'
      ctx.fillText('FOTOCHECK DOCENTE', 170, 50)
      
      // Información del tutor
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 16px Helvetica'
      ctx.textAlign = 'left'
      ctx.fillText(tutorData.nombre, 20, 120)
      ctx.fillText(tutorData.apellidos, 20, 140)
      
      ctx.font = '12px Helvetica'
      ctx.fillText(`Especialidad: ${tutorData.especialidad}`, 20, 170)
      ctx.fillText(`Grado/Sección: ${tutorData.grado} - ${tutorData.seccion}`, 20, 190)
      ctx.fillText(`Código: ${tutorData.codigoQR}`, 20, 210)
      
      // QR Code si está disponible
      if (qrCode && qrCode.dataURL) {
        const qrImg = new Image()
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 220, 100, 100, 100)
          finalizarDescarga()
        }
        qrImg.src = qrCode.dataURL
      } else {
        finalizarDescarga()
      }
      
      function finalizarDescarga() {
        // Descargar imagen
        const link = document.createElement('a')
        link.download = `fotocheck-tutor-${tutorData.nombre.replace(/\s+/g, '-')}.png`
        link.href = canvas.toDataURL()
        link.click()
        
        setIsGenerating(false)
        showSuccess('Fotocheck descargado', 'El fotocheck PNG se ha descargado correctamente')
      }
      
    } catch (error) {
      setIsGenerating(false)
      showError('Error', 'No se pudo generar el fotocheck')
    }
  }

  const handleDownloadDirectPDF = () => {
    setIsGenerating(true)
    try {
      downloadPhotocheckPDFDirect(tutorData, qrCode, 'tutor')
      showSuccess('PDF descargado', 'El fotocheck PDF A5 se ha descargado correctamente')
    } catch (error) {
      showError('Error', 'No se pudo generar el PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadAlternatePDF = async () => {
    if (!photocheckRef.current) return
    
    setIsGenerating(true)
    try {
      await downloadPhotocheckPDF(photocheckRef.current, tutorData, 'tutor')
      showSuccess('PDF descargado', 'El fotocheck PDF se ha descargado correctamente')
    } catch (error) {
      showError('Error', 'No se pudo generar el PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fotocheck - ${tutorData.nombre}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: 'Helvetica', Arial, sans-serif; 
              background: white;
            }
            .fotocheck {
              width: 85mm;
              height: 135mm;
              margin: 0 auto;
              background: white;
              border: 1px solid #ddd;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
              color: white;
              padding: 12px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 16px;
              font-weight: bold;
              letter-spacing: 1px;
            }
            .header p {
              margin: 4px 0 0 0;
              font-size: 10px;
              opacity: 0.9;
            }
            .content {
              padding: 16px;
            }
            .name-section {
              background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
              padding: 12px;
              border-radius: 8px;
              margin-bottom: 12px;
              text-align: center;
            }
            .name {
              font-size: 14px;
              font-weight: bold;
              color: #1e3a8a;
              margin: 0;
            }
            .info-grid {
              display: grid;
              gap: 8px;
              margin-bottom: 12px;
            }
            .info-item {
              background: #f8fafc;
              padding: 8px;
              border-radius: 6px;
              border-left: 3px solid #3b82f6;
            }
            .info-label {
              font-size: 8px;
              color: #6b7280;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-value {
              font-size: 10px;
              color: #1f2937;
              font-weight: 600;
              margin-top: 2px;
            }
            .qr-section {
              text-align: center;
              margin: 12px 0;
            }
            .qr-code {
              background: white;
              padding: 8px;
              border-radius: 6px;
              border: 2px solid #e5e7eb;
              display: inline-block;
            }
            .footer {
              background: #f1f5f9;
              padding: 8px;
              margin-top: auto;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .validity {
              font-size: 8px;
              color: #6b7280;
            }
            @media print {
              body { margin: 0; padding: 10mm; }
              .fotocheck { 
                width: 85mm; 
                height: 135mm; 
                box-shadow: none; 
                border: 1px solid #000;
              }
            }
          </style>
        </head>
        <body>
          <div class="fotocheck">
            <div class="header">
              <h1>COLEGIO TALENTOS</h1>
              <p>FOTOCHECK DOCENTE</p>
            </div>
            
            <div class="content">
              <div class="name-section">
                <div class="name">${tutorData.nombre}</div>
                <div class="name">${tutorData.apellidos}</div>
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Especialidad</div>
                  <div class="info-value">${tutorData.especialidad}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Grado/Sección</div>
                  <div class="info-value">${tutorData.grado} - ${tutorData.seccion}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Código Tutor</div>
                  <div class="info-value">${tutorData.codigoQR}</div>
                </div>
              </div>
              
              ${qrCode ? `
                <div class="qr-section">
                  <div class="qr-code">
                    <img src="${qrCode.dataURL}" alt="QR Code" style="width: 60px; height: 60px;">
                  </div>
                </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <div class="validity">
                Válido hasta: ${format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy', { locale: es })}
              </div>
            </div>
          </div>
        </body>
      </html>
    `
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiCreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Fotocheck Docente
                </h2>
                <p className="text-sm text-gray-600">
                  {tutorData.nombre} {tutorData.apellidos}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Fotocheck Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FiCreditCard className="w-5 h-5" />
                  <span>Vista Previa del Fotocheck</span>
                </h3>
                
                <div className="flex justify-center">
                  <div 
                    ref={photocheckRef}
                    className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
                    style={{
                      width: '340px',
                      height: '540px',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white p-4 text-center relative overflow-hidden">
                      {/* Patrón de seguridad */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="grid grid-cols-12 gap-1 h-full">
                          {Array.from({ length: 60 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-full w-1 h-1"></div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="relative z-10">
                        <img 
                          src="/logo-talentos.jpeg" 
                          alt="Colegio Talentos" 
                          className="h-16 mx-auto mb-2 filter brightness-0 invert"
                        />
                        <h1 className="text-xl font-bold tracking-wide">COLEGIO TALENTOS</h1>
                        <p className="text-sm opacity-90 mt-1">FOTOCHECK DOCENTE</p>
                      </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="p-4 space-y-4">
                      {/* Foto placeholder */}
                      <div className="flex justify-center">
                        <div className="w-24 h-32 bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg border border-gray-400 flex items-center justify-center overflow-hidden">
                          {tutorData.foto ? (
                            <img 
                              src={tutorData.foto} 
                              alt={tutorData.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-12 h-12 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {/* Nombre */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 text-center border border-blue-100">
                        <h2 className="text-lg font-bold text-gray-900">{tutorData.nombre}</h2>
                        <h3 className="text-lg font-bold text-gray-900">{tutorData.apellidos}</h3>
                      </div>

                      {/* Información */}
                      <div className="space-y-2">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <FiUser className="w-3 h-3 text-gray-600" />
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Especialidad</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{tutorData.especialidad}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <FiFileText className="w-3 h-3 text-gray-600" />
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Grado/Sección</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{tutorData.grado} - {tutorData.seccion}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <FiGrid className="w-3 h-3 text-gray-600" />
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Código Tutor</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 font-mono">{tutorData.codigoQR}</p>
                        </div>
                      </div>

                      {/* QR Code */}
                      {qrCode && (
                        <div className="flex justify-center">
                          <div className="bg-white p-2 rounded-lg border-2 border-blue-100 shadow-sm">
                            <img
                              src={qrCode.dataURL}
                              alt="QR Code"
                              className="w-16 h-16"
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="bg-gray-100 rounded-lg p-2 border border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FiShield className="w-3 h-3" />
                            <span>Documento oficial</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiCalendar className="w-3 h-3" />
                            <span>Válido hasta: {format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'dd/MM/yy', { locale: es })}</span>
                          </div>
                        </div>
                        <div className="text-center mt-1">
                          <span className="text-xs text-red-600 font-medium">INTRANSFERIBLE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de información y controles */}
              <div className="space-y-6">
                {/* Información del tutor */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <FiUser className="w-4 h-4" />
                    <span>Información del Tutor</span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Nombre completo:</span>
                      <p className="text-sm font-medium text-gray-900">{tutorData.nombre} {tutorData.apellidos}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Especialidad:</span>
                      <p className="text-sm font-medium text-gray-900">{tutorData.especialidad}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Grado asignado:</span>
                      <p className="text-sm font-medium text-gray-900">{tutorData.grado} - Sección {tutorData.seccion}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Código de tutor:</span>
                      <p className="text-sm font-medium text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                        {tutorData.codigoQR}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Fecha de ingreso:</span>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(tutorData.fechaIngreso), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                    
                    {tutorData.telefono && (
                      <div>
                        <span className="text-sm text-gray-600">Teléfono:</span>
                        <p className="text-sm font-medium text-gray-900">{tutorData.telefono}</p>
                      </div>
                    )}
                    
                    {tutorData.email && (
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <p className="text-sm font-medium text-gray-900">{tutorData.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opciones de exportación */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 flex items-center space-x-2">
                    <FiDownload className="w-4 h-4" />
                    <span>Opciones de Exportación</span>
                  </h4>

                  <div className="space-y-3">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">PDF Profesional A5</h5>
                          <p className="text-sm text-gray-600">Formato recomendado para impresión</p>
                        </div>
                        <button
                          onClick={handleDownloadDirectPDF}
                          disabled={isGenerating}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <FiDownload className="w-4 h-4" />
                          <span>{isGenerating ? 'Generando...' : 'Descargar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">PDF de Captura Visual</h5>
                          <p className="text-sm text-gray-600">Versión alternativa del diseño</p>
                        </div>
                        <button
                          onClick={handleDownloadAlternatePDF}
                          disabled={isGenerating}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <FiDownload className="w-4 h-4" />
                          <span>{isGenerating ? 'Generando...' : 'Descargar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Imagen PNG</h5>
                          <p className="text-sm text-gray-600">Para uso digital o redes sociales</p>
                        </div>
                        <button
                          onClick={handleDownload}
                          disabled={isGenerating}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <FiDownload className="w-4 h-4" />
                          <span>{isGenerating ? 'Generando...' : 'Descargar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Imprimir</h5>
                          <p className="text-sm text-gray-600">Vista previa de impresión</p>
                        </div>
                        <button
                          onClick={handlePrint}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <FiPrinter className="w-4 h-4" />
                          <span>Imprimir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del QR */}
                {qrCode && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="text-md font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                      <FiGrid className="w-4 h-4" />
                      <span>Información del QR</span>
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><span className="font-medium">Tipo:</span> Fotocheck Tutor</p>
                      <p><span className="font-medium">Código:</span> {qrCode.qrData?.codigo || tutorData.codigoQR}</p>
                      <p><span className="font-medium">Generado:</span> {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                      <p><span className="font-medium">Válido hasta:</span> {format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy', { locale: es })}</p>
                    </div>
                  </div>
                )}

                {/* Instrucciones */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="text-md font-semibold text-yellow-900 mb-2">Instrucciones de Uso</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Descarga e imprime el fotocheck en formato A5</li>
                    <li>• Plastifica el documento para mayor durabilidad</li>
                    <li>• El código QR debe estar visible para el escaneo</li>
                    <li>• Usa el fotocheck para registrar entrada y salida</li>
                    <li>• Mantén siempre visible tu identificación</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TutorPhotocheckTemplate