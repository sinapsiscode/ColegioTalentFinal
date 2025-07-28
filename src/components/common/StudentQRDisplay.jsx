import React from 'react'
import QRCode from 'qrcode.react'
import { motion } from 'framer-motion'
import { 
  FiDownload, 
  FiPrinter, 
  FiUser,
  FiCalendar,
  FiHash
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import AnimatedButton from './AnimatedButton'
import { showSuccess, showError } from '../../utils/sweetAlert'

const StudentQRDisplay = ({ student, onClose }) => {
  if (!student) return null
  
  // Generar datos del QR (en producción vendría del backend)
  const qrData = JSON.stringify({
    id: student.id,
    codigo: student.codigo_qr,
    nombre: student.nombre,
    apellidos: student.apellidos,
    grado: student.grado,
    seccion: student.seccion,
    timestamp: Date.now()
  })
  
  // Descargar QR como imagen
  const handleDownloadQR = () => {
    const canvas = document.getElementById('student-qr-code')
    if (canvas) {
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `QR-${student.nombre}-${student.apellidos}.png`
      link.href = url
      link.click()
      showSuccess('QR Descargado', 'El código QR ha sido descargado exitosamente')
    }
  }
  
  // Imprimir QR
  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank')
    const canvas = document.getElementById('student-qr-code')
    
    if (canvas && printWindow) {
      const imageUrl = canvas.toDataURL('image/png')
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Código QR - ${student.nombre} ${student.apellidos}</title>
          <style>
            @page { margin: 0; }
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
            }
            .container {
              text-align: center;
              padding: 20px;
              border: 2px solid #ddd;
              border-radius: 10px;
              background: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
              width: 120px;
              margin-bottom: 20px;
            }
            h1 {
              color: #1e40af;
              margin: 10px 0;
              font-size: 24px;
            }
            .student-info {
              margin: 20px 0;
              font-size: 16px;
            }
            .student-info p {
              margin: 5px 0;
            }
            .qr-container {
              margin: 20px 0;
              padding: 20px;
              background: #f9fafb;
              border-radius: 8px;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .instructions {
              margin-top: 20px;
              padding: 15px;
              background: #e5e7eb;
              border-radius: 8px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="/logo-talentos.jpeg" alt="Talentos College" class="logo">
            <h1>Código QR de Estudiante</h1>
            
            <div class="student-info">
              <p><strong>${student.nombre} ${student.apellidos}</strong></p>
              <p>Grado: ${student.grado} - Sección ${student.seccion}</p>
              <p>Código: ${student.codigo_qr}</p>
            </div>
            
            <div class="qr-container">
              <img src="${imageUrl}" alt="Código QR" style="width: 250px; height: 250px;">
            </div>
            
            <div class="instructions">
              <p><strong>Instrucciones de uso:</strong></p>
              <p>1. Este código QR es personal e intransferible</p>
              <p>2. Preséntelo al personal de entrada para registrar asistencia</p>
              <p>3. Manténgalo en buen estado para su correcto funcionamiento</p>
            </div>
            
            <div class="footer">
              <p>Válido para el año escolar ${new Date().getFullYear()}</p>
              <p>Talentos College - Sistema de Control de Acceso</p>
              <p>Impreso el ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
        </html>
      `)
      
      printWindow.document.close()
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white rounded-t-xl">
          <h2 className="text-xl font-bold">Código QR del Estudiante</h2>
          <p className="text-blue-100 text-sm mt-1">
            Código personal para control de acceso
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Student Info */}
          <div className="mb-6 text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              {student.fotoUrl ? (
                <img
                  src={student.fotoUrl}
                  alt={student.nombre}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FiUser className="w-10 h-10 text-gray-400" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {student.nombre} {student.apellidos}
            </h3>
            <p className="text-gray-600">
              {student.grado} - Sección {student.seccion}
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FiHash className="w-4 h-4" />
                <span>{student.codigo_qr}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                <span>{new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCode
                id="student-qr-code"
                value={qrData}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
          
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Instrucciones de uso:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Este código es personal e intransferible</li>
              <li>• Preséntelo en la entrada del colegio</li>
              <li>• Válido para registrar entrada y salida</li>
              <li>• Manténgalo en buen estado</li>
            </ul>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <AnimatedButton
              variant="primary"
              icon={FiDownload}
              onClick={handleDownloadQR}
              fullWidth
            >
              Descargar QR
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              icon={FiPrinter}
              onClick={handlePrintQR}
              fullWidth
            >
              Imprimir
            </AnimatedButton>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default StudentQRDisplay