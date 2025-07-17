import QRCode from 'qrcode'

export const generateStudentQR = async (studentData) => {
  try {
    const qrData = {
      id: studentData.id,
      codigo: studentData.codigoQR || `ST${studentData.id.toString().padStart(6, '0')}`,
      nombre: studentData.nombre,
      apellidos: studentData.apellidos,
      grado: studentData.grado,
      seccion: studentData.seccion,
      tipo: 'estudiante',
      timestamp: new Date().toISOString()
    }

    const qrString = JSON.stringify(qrData)
    
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000FF',
        light: '#FFFFFFFF'
      },
      width: 200,
      rendererOpts: {
        quality: 0.9
      }
    })

    return {
      dataURL: qrCodeDataURL,
      qrData: qrData,
      qrString: qrString
    }
  } catch (error) {
    console.error('Error generando código QR:', error)
    throw new Error('No se pudo generar el código QR del estudiante')
  }
}

export const generatePhotocheckQR = async (studentData, options = {}) => {
  try {
    const defaultOptions = {
      includePhoto: true,
      includeContactInfo: false,
      validUntil: null,
      ...options
    }

    const qrData = {
      id: studentData.id,
      codigo: studentData.codigoQR || `ST${studentData.id.toString().padStart(6, '0')}`,
      nombre: studentData.nombre,
      apellidos: studentData.apellidos,
      nombreCompleto: `${studentData.nombre} ${studentData.apellidos}`,
      grado: studentData.grado,
      seccion: studentData.seccion,
      padre: studentData.padre,
      telefono: defaultOptions.includeContactInfo ? studentData.telefono : null,
      tipo: 'fotocheck_estudiante',
      validUntil: defaultOptions.validUntil,
      generatedAt: new Date().toISOString(),
      school: 'Colegio Talentos'
    }

    const qrString = JSON.stringify(qrData)
    
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      color: {
        dark: '#1a365dFF',
        light: '#FFFFFFFF'
      },
      width: 150,
      rendererOpts: {
        quality: 0.95
      }
    })

    return {
      dataURL: qrCodeDataURL,
      qrData: qrData,
      qrString: qrString
    }
  } catch (error) {
    console.error('Error generando código QR para fotocheck:', error)
    throw new Error('No se pudo generar el código QR para el fotocheck')
  }
}

export const generateTutorQR = async (tutorData) => {
  try {
    const qrData = {
      id: tutorData.id,
      codigo: tutorData.codigoFotocheck || `T${tutorData.id.toString().padStart(3, '0')}234567890`,
      nombre: tutorData.nombre,
      especialidad: tutorData.especialidad,
      grado: tutorData.grado,
      tipo: 'tutor',
      timestamp: new Date().toISOString()
    }

    // Usar directamente el código de fotocheck para el QR (formato simple)
    const qrString = qrData.codigo
    
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000FF',
        light: '#FFFFFFFF'
      },
      width: 200,
      rendererOpts: {
        quality: 0.9
      }
    })

    return {
      dataURL: qrCodeDataURL,
      qrData: qrData,
      qrString: qrString
    }
  } catch (error) {
    console.error('Error generando código QR de tutor:', error)
    throw new Error('No se pudo generar el código QR del tutor')
  }
}

export const generateTutorPhotocheckQR = async (tutorData, options = {}) => {
  try {
    const defaultOptions = {
      includePhoto: true,
      includeContactInfo: false,
      validUntil: null,
      ...options
    }

    const qrData = {
      id: tutorData.id,
      codigo: tutorData.codigoFotocheck || `T${tutorData.id.toString().padStart(3, '0')}234567890`,
      nombre: tutorData.nombre,
      especialidad: tutorData.especialidad,
      grado: tutorData.grado,
      telefono: defaultOptions.includeContactInfo ? tutorData.telefono : null,
      tipo: 'fotocheck_tutor',
      validUntil: defaultOptions.validUntil,
      generatedAt: new Date().toISOString(),
      school: 'Colegio Talentos'
    }

    // Usar directamente el código de fotocheck para el QR (formato simple)
    const qrString = qrData.codigo
    
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      color: {
        dark: '#1a365dFF',
        light: '#FFFFFFFF'
      },
      width: 150,
      rendererOpts: {
        quality: 0.95
      }
    })

    return {
      dataURL: qrCodeDataURL,
      qrData: qrData,
      qrString: qrString
    }
  } catch (error) {
    console.error('Error generando código QR para fotocheck de tutor:', error)
    throw new Error('No se pudo generar el código QR para el fotocheck del tutor')
  }
}

export const generateBulkQRCodes = async (studentsArray) => {
  try {
    const results = []
    
    for (const student of studentsArray) {
      try {
        const qrResult = await generatePhotocheckQR(student)
        results.push({
          student: student,
          qr: qrResult,
          success: true,
          error: null
        })
      } catch (error) {
        results.push({
          student: student,
          qr: null,
          success: false,
          error: error.message
        })
      }
    }

    return {
      results: results,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      total: results.length
    }
  } catch (error) {
    console.error('Error generando códigos QR en lote:', error)
    throw new Error('No se pudieron generar los códigos QR')
  }
}

export const generateBulkTutorQRCodes = async (tutorsArray) => {
  try {
    const results = []
    
    for (const tutor of tutorsArray) {
      try {
        const qrResult = await generateTutorPhotocheckQR(tutor)
        results.push({
          tutor: tutor,
          qr: qrResult,
          success: true,
          error: null
        })
      } catch (error) {
        results.push({
          tutor: tutor,
          qr: null,
          success: false,
          error: error.message
        })
      }
    }

    return {
      results: results,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      total: results.length
    }
  } catch (error) {
    console.error('Error generando códigos QR de tutores en lote:', error)
    throw new Error('No se pudieron generar los códigos QR de tutores')
  }
}

export const downloadQRCode = (dataURL, filename = 'qr-code.png') => {
  try {
    // Crear un canvas para asegurar compatibilidad
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = function() {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      // Convertir a blob y descargar
      canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = filename
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png', 0.95)
    }
    
    img.onerror = function() {
      // Fallback al método original
      const link = document.createElement('a')
      link.download = filename
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    img.src = dataURL
  } catch (error) {
    console.error('Error descargando código QR:', error)
    throw new Error('No se pudo descargar el código QR')
  }
}

export const validateQRData = (qrString) => {
  try {
    // Verificar si es un código simple (formato T001234567890 o E001234567890)
    if (typeof qrString === 'string' && qrString.match(/^[TE]\d{12}$/)) {
      const tipo = qrString.startsWith('T') ? 'tutor' : 'estudiante'
      return {
        valid: true,
        data: {
          codigo: qrString,
          tipo: tipo
        },
        error: null
      }
    }

    // Intentar parsear como JSON para formato completo
    const data = JSON.parse(qrString)
    
    const requiredFields = ['id', 'codigo', 'nombre', 'tipo']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`)
    }

    if (!['estudiante', 'fotocheck_estudiante', 'tutor', 'fotocheck_tutor'].includes(data.tipo)) {
      throw new Error('Tipo de código QR no válido')
    }

    if (data.validUntil && new Date(data.validUntil) < new Date()) {
      throw new Error('Código QR expirado')
    }

    return {
      valid: true,
      data: data,
      error: null
    }
  } catch (error) {
    return {
      valid: false,
      data: null,
      error: error.message
    }
  }
}