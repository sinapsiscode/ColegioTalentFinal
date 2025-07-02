import QRCode from 'qrcode'

// Configuración segura para QR
const secureQRConfig = {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  quality: 0.98,
  margin: 3,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  width: 200,
  rendererOpts: {
    quality: 0.98
  }
}

export const generateSecureQR = async (data, options = {}) => {
  try {
    const config = { ...secureQRConfig, ...options }
    
    // Validar y limpiar los datos
    const cleanData = typeof data === 'string' ? data : JSON.stringify(data)
    
    // Generar QR usando canvas (más seguro)
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, cleanData, config)
    
    // Convertir canvas a data URL
    const dataURL = canvas.toDataURL('image/png', 0.98)
    
    return {
      dataURL,
      canvas,
      data: cleanData
    }
  } catch (error) {
    console.error('Error generando QR seguro:', error)
    
    // Fallback usando el método original
    try {
      const dataURL = await QRCode.toDataURL(data, secureQRConfig)
      return {
        dataURL,
        canvas: null,
        data: typeof data === 'string' ? data : JSON.stringify(data)
      }
    } catch (fallbackError) {
      throw new Error('No se pudo generar el código QR')
    }
  }
}

export const generateStudentQRSecure = async (studentData) => {
  try {
    const qrData = {
      id: studentData.id,
      codigo: studentData.codigoQR || `ST${studentData.id.toString().padStart(6, '0')}`,
      nombre: studentData.nombre || '',
      apellidos: studentData.apellidos || '',
      grado: studentData.grado || '',
      seccion: studentData.seccion || '',
      tipo: 'fotocheck_estudiante',
      timestamp: new Date().toISOString(),
      school: 'Colegio Talentos',
      version: '1.0'
    }

    const result = await generateSecureQR(qrData, {
      width: 180,
      color: {
        dark: '#1e40af',
        light: '#ffffff'
      }
    })

    return {
      ...result,
      qrData
    }
  } catch (error) {
    console.error('Error generando QR del estudiante:', error)
    throw new Error('No se pudo generar el código QR del estudiante')
  }
}

export const downloadSecureQR = (canvas, filename = 'qr-code.png') => {
  try {
    if (canvas && canvas.toBlob) {
      // Usar canvas si está disponible
      canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = filename
        link.href = url
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Limpiar URL después de un tiempo
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }, 'image/png', 0.98)
    } else {
      throw new Error('Canvas no disponible')
    }
  } catch (error) {
    console.error('Error descargando QR:', error)
    throw new Error('No se pudo descargar el código QR')
  }
}

export const createQRBlob = async (dataURL) => {
  try {
    const response = await fetch(dataURL)
    const blob = await response.blob()
    return blob
  } catch (error) {
    console.error('Error creando blob:', error)
    throw new Error('No se pudo procesar el código QR')
  }
}