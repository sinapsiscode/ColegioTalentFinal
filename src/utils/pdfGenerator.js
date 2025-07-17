import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Crear PDF profesional sin html2canvas para mejor rendimiento
export const generatePhotocheckPDFDirect = (student, qrCode, type = 'student') => {
  try {
    // Crear PDF en formato A5 (148mm x 210mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    })

    const pageWidth = 148
    const pageHeight = 210
    const margin = 12
    const contentWidth = pageWidth - (margin * 2)

    // Colores
    const primaryColor = [30, 64, 175] // #1e40af
    const grayColor = [107, 114, 128] // #6b7280
    const darkColor = [17, 24, 39] // #111827

    // Header con fondo azul
    pdf.setFillColor(...primaryColor)
    pdf.rect(margin, margin, contentWidth, 35, 'F')
    
    // Título en header
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('COLEGIO TALENTOS', pageWidth / 2, margin + 15, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const subtitleText = type === 'tutor' ? 'FOTOCHECK DOCENTE' : 'FOTOCHECK ESTUDIANTIL'
    pdf.text(subtitleText, pageWidth / 2, margin + 25, { align: 'center' })

    // Logo circular en esquina
    pdf.setFillColor(255, 255, 255)
    pdf.circle(pageWidth - 20, margin + 12, 8, 'F')
    pdf.setTextColor(...primaryColor)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CT', pageWidth - 20, margin + 15, { align: 'center' })

    // Sección de foto centrada
    let currentY = margin + 45
    pdf.setFillColor(249, 250, 251) // #f9fafb
    pdf.rect(margin, currentY, contentWidth, 45, 'F')
    
    // Marco para foto
    const photoSize = 38
    const photoX = margin + 15
    const photoY = currentY + 4
    pdf.setFillColor(209, 213, 219) // #d1d5db
    pdf.rect(photoX, photoY, photoSize, photoSize, 'F')
    pdf.setDrawColor(156, 163, 175) // #9ca3af
    pdf.setLineWidth(0.8)
    pdf.rect(photoX, photoY, photoSize, photoSize, 'S')
    
    // Texto placeholder para foto
    pdf.setTextColor(...grayColor)
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.text('FOTO', photoX + photoSize/2, photoY + photoSize/2 - 2, { align: 'center' })
    const photoLabel = type === 'tutor' ? 'DOCENTE' : 'ESTUDIANTE'
    pdf.text(photoLabel, photoX + photoSize/2, photoY + photoSize/2 + 3, { align: 'center' })

    // QR Code (lado derecho de la foto)
    if (qrCode?.dataURL) {
      try {
        const qrSize = 37
        const qrX = pageWidth - margin - qrSize - 15
        const qrY = currentY + 4
        
        // Marco para QR
        pdf.setFillColor(255, 255, 255)
        pdf.rect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 'F')
        pdf.setDrawColor(30, 64, 175) // azul
        pdf.setLineWidth(0.5)
        pdf.rect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 'S')
        
        pdf.addImage(qrCode.dataURL, 'PNG', qrX, qrY, qrSize, qrSize)
        
        // Código de seguridad bajo el QR
        pdf.setTextColor(...grayColor)
        pdf.setFontSize(6)
        pdf.setFont('courier', 'normal')
        const codePrefix = type === 'tutor' ? 'T' : 'ST'
        const securityCode = student?.codigoQR || `${codePrefix}${student?.id?.toString().padStart(6, '0')}`
        pdf.text(securityCode, qrX + qrSize/2, qrY + qrSize + 5, { align: 'center' })
      } catch (error) {
        console.warn('Error adding QR code to PDF:', error)
      }
    }

    // Nombre del estudiante (sección completa centrada)
    currentY += 50
    pdf.setFillColor(239, 246, 255) // #eff6ff
    pdf.rect(margin + 10, currentY, contentWidth - 20, 25, 'F')
    pdf.setDrawColor(219, 234, 254) // #dbeafe
    pdf.setLineWidth(0.5)
    pdf.rect(margin + 10, currentY, contentWidth - 20, 25, 'S')
    
    pdf.setTextColor(...darkColor)
    pdf.setFontSize(13)
    pdf.setFont('helvetica', 'bold')
    const nombreCompleto = `${student?.nombre || 'NOMBRE'} ${student?.apellidos || 'APELLIDOS'}`
    pdf.text(nombreCompleto, pageWidth / 2, currentY + 16, { align: 'center' })

    // Información académica/profesional en grid de 2 columnas
    currentY += 30
    const codePrefix = type === 'tutor' ? 'T' : 'ST'
    const defaultCode = `${codePrefix}${student?.id?.toString().padStart(6, '0')}`
    
    let infoData
    if (type === 'tutor') {
      infoData = [
        ['Especialidad:', student?.especialidad || 'N/A'],
        ['Grado/Sección:', `${student?.grado || 'N/A'} - ${student?.seccion || 'N/A'}`],
        ['Código:', student?.codigoQR || defaultCode],
        ['Emisión:', new Date().toLocaleDateString('es-PE')],
        ['Válido hasta:', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE')]
      ]
    } else {
      infoData = [
        ['Grado:', student?.grado || 'N/A'],
        ['Sección:', student?.seccion || 'N/A'],
        ['Código:', student?.codigoQR || defaultCode],
        ['Emisión:', new Date().toLocaleDateString('es-PE')],
        ['Válido hasta:', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE')]
      ]
    }

    // Grid de información 2x3
    const gridCols = 2
    const gridRows = Math.ceil(infoData.length / gridCols)
    const cellWidth = (contentWidth - 20) / gridCols
    const cellHeight = 8

    pdf.setFontSize(9)
    infoData.forEach(([label, value], index) => {
      const col = index % gridCols
      const row = Math.floor(index / gridCols)
      const x = margin + 10 + (col * cellWidth)
      const y = currentY + (row * cellHeight)
      
      pdf.setTextColor(...grayColor)
      pdf.setFont('helvetica', 'normal')
      pdf.text(label, x + 3, y)
      
      pdf.setTextColor(...darkColor)
      pdf.setFont('helvetica', 'bold')
      pdf.text(value, x + cellWidth - 3, y, { align: 'right' })
    })

    currentY += (gridRows * cellHeight) + 10

    // Badge de validez - usar currentY dinámico para evitar superposición
    const validityY = Math.max(currentY + 10, pageHeight - 50)
    pdf.setFillColor(220, 252, 231) // #dcfce7
    pdf.rect(margin + 8, validityY, contentWidth - 16, 12, 'F')
    pdf.setDrawColor(34, 197, 94) // #22c55e
    pdf.setLineWidth(0.3)
    pdf.rect(margin + 8, validityY, contentWidth - 16, 12, 'S')
    
    pdf.setTextColor(21, 128, 61) // #15803d
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('✓ DOCUMENTO OFICIAL', pageWidth / 2, validityY + 8, { align: 'center' })

    // Footer - asegurar que esté en la parte inferior
    const footerY = pageHeight - 20
    pdf.setFillColor(243, 244, 246) // #f3f4f6
    pdf.rect(margin, footerY, contentWidth, 15, 'F')
    
    pdf.setTextColor(...grayColor)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Colegio Talentos • Lima, Perú', pageWidth / 2, footerY + 8, { align: 'center' })
    pdf.text('Válido únicamente con fotografía • No transferible', pageWidth / 2, footerY + 13, { align: 'center' })

    return pdf
  } catch (error) {
    console.error('Error generando PDF directo:', error)
    throw new Error('No se pudo generar el PDF del fotocheck')
  }
}

export const generatePhotocheckPDF = async (photocheckElement, student) => {
  try {
    if (!photocheckElement) {
      throw new Error('Elemento del fotocheck no encontrado')
    }

    // Crear canvas del elemento
    const canvas = await html2canvas(photocheckElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 340,
      height: 540,
      scrollX: 0,
      scrollY: 0
    })

    // Crear PDF en formato A5 (148mm x 210mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    })

    // Agregar imagen del fotocheck centrada
    const imgData = canvas.toDataURL('image/png')
    
    // Calcular dimensiones para A5 (148mm x 210mm)
    const pageWidth = 148
    const pageHeight = 210
    const imgWidth = 120  // mm
    const imgHeight = 180 // mm
    
    // Centrar la imagen
    const x = (pageWidth - imgWidth) / 2
    const y = (pageHeight - imgHeight) / 2
    
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)

    // Agregar información básica en la parte inferior
    pdf.setFontSize(6)
    pdf.setFont(undefined, 'normal')
    pdf.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, 5, pageHeight - 3)

    return pdf
  } catch (error) {
    console.error('Error generando PDF:', error)
    throw new Error('No se pudo generar el PDF del fotocheck')
  }
}

export const downloadPhotocheckPDFDirect = (student, qrCode, type = 'student') => {
  try {
    const pdf = generatePhotocheckPDFDirect(student, qrCode, type)
    const nombre = (student?.nombre || (type === 'tutor' ? 'tutor' : 'estudiante')).replace(/\s+/g, '-')
    const apellidos = (student?.apellidos || '').replace(/\s+/g, '-')
    const prefix = type === 'tutor' ? 'fotocheck-tutor' : 'fotocheck'
    const filename = `${prefix}-${nombre}-${apellidos}.pdf`
    
    pdf.save(filename)
    return true
  } catch (error) {
    console.error('Error descargando PDF directo:', error)
    throw error
  }
}

export const downloadPhotocheckPDF = async (photocheckElement, student, type = 'student') => {
  try {
    const pdf = await generatePhotocheckPDF(photocheckElement, student)
    const nombre = (student?.nombre || (type === 'tutor' ? 'tutor' : 'estudiante')).replace(/\s+/g, '-')
    const apellidos = (student?.apellidos || '').replace(/\s+/g, '-')
    const prefix = type === 'tutor' ? 'fotocheck-tutor' : 'fotocheck'
    const filename = `${prefix}-${nombre}-${apellidos}.pdf`
    
    pdf.save(filename)
    return true
  } catch (error) {
    console.error('Error descargando PDF:', error)
    throw error
  }
}

export const printPhotocheckPDF = async (photocheckElement, student) => {
  try {
    const pdf = await generatePhotocheckPDF(photocheckElement, student)
    
    // Abrir PDF en nueva ventana para imprimir
    const pdfBlob = pdf.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    
    const printWindow = window.open(pdfUrl, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
        printWindow.onafterprint = () => {
          printWindow.close()
          URL.revokeObjectURL(pdfUrl)
        }
      }
    } else {
      // Fallback: descargar si no se puede abrir
      pdf.save(`fotocheck-${student?.nombre || 'estudiante'}.pdf`)
    }
    
    return true
  } catch (error) {
    console.error('Error imprimiendo PDF:', error)
    throw error
  }
}