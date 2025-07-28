import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import 'jspdf-autotable'

// Crear PDF profesional sin html2canvas para mejor rendimiento
const generatePhotocheckPDFDirect = (student, qrCode, type = 'student') => {
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

const generatePhotocheckPDF = async (photocheckElement, student) => {
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

const downloadPhotocheckPDFDirect = (student, qrCode, type = 'student') => {
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

const downloadPhotocheckPDF = async (photocheckElement, student, type = 'student') => {
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

const printPhotocheckPDF = async (photocheckElement, student) => {
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

// Generar reporte de estudiantes
const generateReportPDF = async ({ title, subtitle, date, students }) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = 210
    const pageHeight = 297
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)

    // Colores
    const primaryColor = [30, 64, 175] // #1e40af
    const grayColor = [107, 114, 128] // #6b7280
    const darkColor = [17, 24, 39] // #111827

    // Header
    pdf.setFillColor(...primaryColor)
    pdf.rect(0, 0, pageWidth, 40, 'F')

    // Logo del colegio (si tienes una imagen base64)
    // pdf.addImage(logoBase64, 'JPEG', margin, 10, 30, 20)

    // Título del reporte
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, pageWidth / 2, 20, { align: 'center' })

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(subtitle, pageWidth / 2, 30, { align: 'center' })

    // Fecha
    pdf.setTextColor(...darkColor)
    pdf.setFontSize(10)
    pdf.text(`Fecha: ${new Date(date).toLocaleDateString('es-PE')}`, margin, 50)

    // Tabla de estudiantes
    let currentY = 60

    // Encabezados de tabla
    pdf.setFillColor(245, 247, 250) // #f5f7fa
    pdf.rect(margin, currentY, contentWidth, 10, 'F')
    
    pdf.setTextColor(...darkColor)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    
    // Columnas
    const columns = [
      { text: 'Nombre', x: margin + 5, width: 60 },
      { text: 'Grado', x: margin + 70, width: 30 },
      { text: 'Promedio', x: margin + 105, width: 25 },
      { text: 'Asistencia', x: margin + 135, width: 25 },
      { text: 'Estado', x: margin + 165, width: 30 }
    ]

    columns.forEach(col => {
      pdf.text(col.text, col.x, currentY + 7)
    })

    currentY += 15

    // Filas de estudiantes
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)

    students.forEach((student, index) => {
      // Verificar si necesitamos una nueva página
      if (currentY > pageHeight - 30) {
        pdf.addPage()
        currentY = 20
        
        // Repetir encabezados en nueva página
        pdf.setFillColor(245, 247, 250)
        pdf.rect(margin, currentY, contentWidth, 10, 'F')
        
        pdf.setFont('helvetica', 'bold')
        columns.forEach(col => {
          pdf.text(col.text, col.x, currentY + 7)
        })
        
        pdf.setFont('helvetica', 'normal')
        currentY += 15
      }

      // Alternar color de fondo de filas
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251) // #f9fafb
        pdf.rect(margin, currentY - 5, contentWidth, 10, 'F')
      }

      pdf.setTextColor(...darkColor)
      pdf.text(student.nombre, columns[0].x, currentY)
      pdf.text(student.grado, columns[1].x, currentY)
      
      // Color del promedio según valor
      const promedio = parseFloat(student.promedio)
      if (!isNaN(promedio)) {
        if (promedio >= 16) pdf.setTextColor(34, 197, 94) // green
        else if (promedio >= 11) pdf.setTextColor(250, 204, 21) // yellow
        else pdf.setTextColor(239, 68, 68) // red
      }
      pdf.text(student.promedio.toString(), columns[2].x, currentY)
      
      pdf.setTextColor(...darkColor)
      pdf.text(student.asistencia, columns[3].x, currentY)
      
      // Color del estado
      if (student.estado === 'Excelente') pdf.setTextColor(34, 197, 94)
      else if (student.estado === 'Regular') pdf.setTextColor(250, 204, 21)
      else pdf.setTextColor(239, 68, 68)
      pdf.text(student.estado, columns[4].x, currentY)

      currentY += 10
    })

    // Footer
    const totalPages = pdf.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setTextColor(...grayColor)
      pdf.setFontSize(8)
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
      pdf.text(
        'Colegio Talentos - Sistema de Gestión Académica',
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      )
    }

    // Descargar PDF
    pdf.save(`reporte-estudiantes-${new Date().toISOString().split('T')[0]}.pdf`)
    return true
  } catch (error) {
    console.error('Error generando reporte PDF:', error)
    throw error
  }
}

// Generar PDF de perfil de estudiante completo
const generateStudentProfilePDF = async (data) => {
  const { student, grades, attendance, medical, timeline } = data
  
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  
  // Encabezado
  doc.setFillColor(37, 99, 235) // Azul
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Logo y título
  if (window.logoTalentos) {
    doc.addImage(window.logoTalentos, 'JPEG', 10, 5, 30, 30)
  }
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.text('Perfil del Estudiante', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(`${student.nombre} ${student.apellidos}`, pageWidth / 2, 30, { align: 'center' })
  
  // Información personal
  let yPos = 50
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Información Personal', 10, yPos)
  
  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const infoPersonal = [
    { label: 'Nombre completo:', value: `${student.nombre} ${student.apellidos}` },
    { label: 'Grado:', value: `${student.grado} - Sección ${student.seccion}` },
    { label: 'Código:', value: student.codigo_qr },
    { label: 'Fecha de nacimiento:', value: new Date(student.fecha_nacimiento).toLocaleDateString('es-PE') },
    { label: 'Dirección:', value: student.direccion }
  ]
  
  infoPersonal.forEach((info) => {
    doc.setFont('helvetica', 'bold')
    doc.text(info.label, 10, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(info.value, 60, yPos)
    yPos += 7
  })
  
  // Rendimiento académico
  yPos += 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Rendimiento Académico', 10, yPos)
  
  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Estadísticas
  const stats = [
    { label: 'Promedio general:', value: grades.length > 0 ? (grades.reduce((sum, g) => sum + g.nota, 0) / grades.length).toFixed(1) : 'N/A' },
    { label: 'Asistencia:', value: `${attendance.porcentajeAsistencia}%` },
    { label: 'Días presentes:', value: `${attendance.presentes} de ${attendance.total}` },
    { label: 'Tardanzas:', value: attendance.tardes.toString() },
    { label: 'Faltas:', value: attendance.faltas.toString() }
  ]
  
  stats.forEach((stat) => {
    doc.setFont('helvetica', 'bold')
    doc.text(stat.label, 10, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(stat.value, 60, yPos)
    yPos += 7
  })
  
  // Información médica
  if (medical) {
    yPos += 10
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Información Médica', 10, yPos)
    
    yPos += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    doc.text(`Tipo de sangre: ${medical.bloodType}`, 10, yPos)
    yPos += 7
    doc.text(`Alergias: ${medical.allergies.join(', ')}`, 10, yPos)
    yPos += 7
    doc.text(`Contacto de emergencia: ${medical.emergencyContact.name} (${medical.emergencyContact.phone})`, 10, yPos)
    yPos += 10
  }
  
  // Línea de tiempo (últimas 5 actividades)
  if (timeline && timeline.length > 0) {
    if (yPos > 230) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Actividades Recientes', 10, yPos)
    
    yPos += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    timeline.slice(0, 5).forEach((event) => {
      doc.setFont('helvetica', 'bold')
      doc.text(event.title, 10, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(` - ${new Date(event.date).toLocaleDateString('es-PE')}`, 80, yPos)
      yPos += 7
      doc.text(event.description, 10, yPos)
      yPos += 10
      
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
    })
  }
  
  // Pie de página
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-PE')} a las ${new Date().toLocaleTimeString('es-PE')}`, 10, 290)
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, 290)
  }
  
  // Guardar PDF
  doc.save(`perfil_${student.nombre}_${student.apellidos}_${new Date().getTime()}.pdf`)
}

// Generar PDF de reporte de asistencia
const generateAttendanceReportPDF = async (data) => {
  const { student, records, statistics, period } = data
  
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  
  // Encabezado
  doc.setFillColor(37, 99, 235) // Azul
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Logo y título
  if (window.logoTalentos) {
    doc.addImage(window.logoTalentos, 'JPEG', 10, 5, 30, 30)
  }
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.text('Reporte de Asistencia', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(`${student.nombre} ${student.apellidos}`, pageWidth / 2, 30, { align: 'center' })
  
  // Información del período y estudiante
  let yPos = 50
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Período: ${period}`, 10, yPos)
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, pageWidth - 70, yPos)
  
  yPos += 7
  doc.text(`Grado: ${student.grado || 'N/A'} - Sección: ${student.seccion || 'N/A'}`, 10, yPos)
  doc.text(`Código: ${student.codigo_qr || student.codigoQR || `ST${student.id?.toString().padStart(6, '0')}`}`, pageWidth - 70, yPos)
  
  // Estadísticas
  yPos += 15
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen de Asistencia', 10, yPos)
  
  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Cuadro de estadísticas con gráfico
  doc.setFillColor(249, 250, 251)
  doc.rect(10, yPos - 5, pageWidth - 20, 50, 'F')
  
  // Estadísticas en dos columnas
  const leftStats = [
    ['Total de días', statistics.total.toString()],
    ['Días presentes', statistics.presentes.toString()],
    ['Tardanzas', statistics.tardes.toString()]
  ]
  
  const rightStats = [
    ['Faltas', statistics.faltas.toString()],
    ['Porcentaje de asistencia', `${statistics.porcentajeAsistencia}%`],
    ['Estado', statistics.porcentajeAsistencia >= 90 ? 'Excelente' : 
               statistics.porcentajeAsistencia >= 80 ? 'Bueno' : 
               statistics.porcentajeAsistencia >= 70 ? 'Regular' : 'Necesita Mejorar']
  ]
  
  // Columna izquierda
  let tempY = yPos
  leftStats.forEach((stat) => {
    doc.setFont('helvetica', 'bold')
    doc.text(stat[0] + ':', 15, tempY)
    doc.setFont('helvetica', 'normal')
    doc.text(stat[1], 65, tempY)
    tempY += 8
  })
  
  // Columna derecha
  tempY = yPos
  rightStats.forEach((stat) => {
    doc.setFont('helvetica', 'bold')
    doc.text(stat[0] + ':', 110, tempY)
    doc.setFont('helvetica', 'normal')
    if (stat[0] === 'Estado') {
      const color = statistics.porcentajeAsistencia >= 90 ? [46, 125, 50] :
                   statistics.porcentajeAsistencia >= 80 ? [251, 140, 0] :
                   [211, 47, 47]
      doc.setTextColor(...color)
    }
    doc.text(stat[1], 160, tempY)
    doc.setTextColor(0, 0, 0)
    tempY += 8
  })
  
  // Barra de progreso visual del porcentaje
  const barY = yPos + 30
  const barWidth = 100
  const barHeight = 8
  const barX = 15
  
  // Fondo de la barra
  doc.setFillColor(229, 231, 235)
  doc.rect(barX, barY, barWidth, barHeight, 'F')
  
  // Progreso
  const progressWidth = (statistics.porcentajeAsistencia / 100) * barWidth
  const progressColor = statistics.porcentajeAsistencia >= 90 ? [34, 197, 94] :
                       statistics.porcentajeAsistencia >= 80 ? [251, 191, 36] :
                       [239, 68, 68]
  doc.setFillColor(...progressColor)
  doc.rect(barX, barY, progressWidth, barHeight, 'F')
  
  // Texto del porcentaje
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`${statistics.porcentajeAsistencia}%`, barX + barWidth + 5, barY + 6)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  yPos += 50
  
  // Detalle de registros
  yPos += 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalle de Registros', 10, yPos)
  
  yPos += 10
  doc.setFontSize(9)
  
  // Tabla de registros
  const headers = ['Fecha', 'Hora Entrada', 'Hora Salida', 'Estado', 'Observaciones']
  const colWidths = [35, 35, 35, 25, 50]
  let xPos = 10
  
  // Headers
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(10, yPos - 5, pageWidth - 20, 8, 'F')
  
  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos)
    xPos += colWidths[i]
  })
  
  yPos += 10
  doc.setFont('helvetica', 'normal')
  
  // Registros
  records.forEach((record) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }
    
    xPos = 10
    
    // Fecha
    doc.text(new Date(record.fecha).toLocaleDateString('es-PE'), xPos, yPos)
    xPos += colWidths[0]
    
    // Hora entrada
    doc.text(record.hora_entrada || '-', xPos, yPos)
    xPos += colWidths[1]
    
    // Hora salida
    doc.text(record.hora_salida || '-', xPos, yPos)
    xPos += colWidths[2]
    
    // Estado con color
    const statusColors = {
      presente: [46, 125, 50],
      tarde: [251, 140, 0],
      falta: [211, 47, 47]
    }
    
    const color = statusColors[record.estado] || [0, 0, 0]
    doc.setTextColor(...color)
    doc.text(record.estado.charAt(0).toUpperCase() + record.estado.slice(1), xPos, yPos)
    doc.setTextColor(0, 0, 0)
    xPos += colWidths[3]
    
    // Observaciones
    const observaciones = record.observaciones || '-'
    doc.setFontSize(8)
    const lines = doc.splitTextToSize(observaciones, colWidths[4] - 5)
    doc.text(lines[0] || '-', xPos, yPos)
    doc.setFontSize(9)
    
    yPos += 7
  })
  
  // Pie de página
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, 290)
  }
  
  // Guardar PDF
  doc.save(`asistencia_${student.nombre}_${student.apellidos}_${new Date().getTime()}.pdf`)
}

// Generar boletín de notas
const generateBoletinPDF = async (data) => {
  const { estudiante, notas, periodos, año } = data
  
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = 210
    const pageHeight = 297
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)

    // Colores
    const primaryColor = [30, 64, 175] // #1e40af
    const grayColor = [107, 114, 128] // #6b7280
    const darkColor = [17, 24, 39] // #111827

    // Header
    pdf.setFillColor(...primaryColor)
    pdf.rect(0, 0, pageWidth, 50, 'F')

    // Logo del colegio
    pdf.setFillColor(255, 255, 255)
    pdf.circle(25, 25, 15, 'F')
    pdf.setTextColor(...primaryColor)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CT', 25, 30, { align: 'center' })

    // Título
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.text('BOLETÍN DE NOTAS', pageWidth / 2, 25, { align: 'center' })
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Año Académico ${año}`, pageWidth / 2, 38, { align: 'center' })

    // Información del estudiante
    let currentY = 65
    pdf.setTextColor(...darkColor)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DATOS DEL ESTUDIANTE', margin, currentY)

    currentY += 10
    pdf.setFillColor(249, 250, 251)
    pdf.rect(margin, currentY - 5, contentWidth, 30, 'F')

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const studentInfo = [
      { label: 'Estudiante:', value: `${estudiante.nombre} ${estudiante.apellidos}` },
      { label: 'Grado:', value: `${estudiante.grado} - Sección ${estudiante.seccion}` },
      { label: 'Código:', value: estudiante.codigo || `ST${estudiante.id.toString().padStart(6, '0')}` }
    ]

    studentInfo.forEach((info, index) => {
      const yPos = currentY + (index * 8)
      pdf.setFont('helvetica', 'bold')
      pdf.text(info.label, margin + 5, yPos)
      pdf.setFont('helvetica', 'normal')
      pdf.text(info.value, margin + 35, yPos)
    })

    currentY += 40

    // Tabla de notas
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CALIFICACIONES POR BIMESTRE', margin, currentY)
    
    currentY += 10

    // Usar autoTable para crear tabla profesional
    const tableHeaders = ['Área Curricular', ...periodos.filter(p => p.id !== 'final').map(p => p.abrev), 'Prom']
    const tableData = []

    // Obtener materias únicas
    const materiasSet = new Set()
    Object.values(notas).forEach(bimestreNotas => {
      bimestreNotas.forEach(nota => {
        materiasSet.add(nota.materiaNombre)
      })
    })

    const materias = Array.from(materiasSet)

    // Construir filas de la tabla
    materias.forEach(materia => {
      const row = [materia]
      let suma = 0
      let count = 0

      periodos.filter(p => p.id !== 'final').forEach(periodo => {
        const notaBimestre = notas[periodo.id]?.find(n => n.materiaNombre === materia)
        const valor = notaBimestre?.nota || '-'
        row.push(valor)
        if (typeof valor === 'number' && valor > 0) {
          suma += valor
          count++
        }
      })

      // Promedio
      const promedio = count > 0 ? (suma / count).toFixed(1) : '-'
      row.push(promedio)
      
      tableData.push(row)
    })

    // Agregar fila de promedios generales
    const promediosRow = ['PROMEDIO GENERAL']
    let sumaGeneral = 0
    let countGeneral = 0

    periodos.filter(p => p.id !== 'final').forEach(periodo => {
      let sumaBimestre = 0
      let countBimestre = 0
      
      notas[periodo.id]?.forEach(nota => {
        if (nota.nota > 0) {
          sumaBimestre += nota.nota
          countBimestre++
        }
      })

      const promBimestre = countBimestre > 0 ? (sumaBimestre / countBimestre).toFixed(1) : '-'
      promediosRow.push(promBimestre)
      
      if (countBimestre > 0) {
        sumaGeneral += sumaBimestre / countBimestre
        countGeneral++
      }
    })

    const promedioFinal = countGeneral > 0 ? (sumaGeneral / countGeneral).toFixed(1) : '-'
    promediosRow.push(promedioFinal)
    
    // Crear tabla con autoTable
    pdf.autoTable({
      head: [tableHeaders],
      body: tableData,
      foot: [promediosRow],
      startY: currentY,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      footStyles: {
        fillColor: [249, 250, 251],
        textColor: [17, 24, 39],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 60 }
      },
      didDrawCell: (data) => {
        // Colorear notas según valor
        if (data.section === 'body' && data.column.index > 0) {
          const value = parseFloat(data.cell.text[0])
          if (!isNaN(value)) {
            if (value >= 17) {
              data.cell.styles.textColor = [34, 197, 94] // verde
            } else if (value >= 14) {
              data.cell.styles.textColor = [59, 130, 246] // azul
            } else if (value >= 11) {
              data.cell.styles.textColor = [251, 191, 36] // amarillo
            } else {
              data.cell.styles.textColor = [239, 68, 68] // rojo
            }
          }
        }
      }
    })

    currentY = pdf.lastAutoTable.finalY + 15

    // Leyenda
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ESCALA DE CALIFICACIÓN', margin, currentY)
    
    currentY += 8
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    
    const escala = [
      { rango: 'AD (18-20)', descripcion: 'Logro destacado', color: [34, 197, 94] },
      { rango: 'A (14-17)', descripcion: 'Logro esperado', color: [59, 130, 246] },
      { rango: 'B (11-13)', descripcion: 'En proceso', color: [251, 191, 36] },
      { rango: 'C (0-10)', descripcion: 'En inicio', color: [239, 68, 68] }
    ]

    escala.forEach((nivel, index) => {
      const xPos = margin + (index * 45)
      
      // Cuadro de color
      pdf.setFillColor(...nivel.color)
      pdf.rect(xPos, currentY - 3, 3, 3, 'F')
      
      // Texto
      pdf.setTextColor(...darkColor)
      pdf.text(`${nivel.rango}`, xPos + 5, currentY)
      pdf.setFontSize(8)
      pdf.setTextColor(...grayColor)
      pdf.text(nivel.descripcion, xPos + 5, currentY + 4)
      pdf.setFontSize(9)
    })

    currentY += 20

    // Observaciones y firmas
    if (currentY < pageHeight - 80) {
      // Observaciones
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...darkColor)
      pdf.text('OBSERVACIONES', margin, currentY)
      
      currentY += 8
      pdf.setDrawColor(200, 200, 200)
      pdf.rect(margin, currentY, contentWidth, 25)
      
      currentY += 40

      // Firmas
      const firmaY = pageHeight - 40
      const firmaWidth = 60
      const firmaSpacing = (contentWidth - (firmaWidth * 2)) / 3

      // Líneas para firmas
      pdf.line(margin + firmaSpacing, firmaY, margin + firmaSpacing + firmaWidth, firmaY)
      pdf.line(margin + (firmaSpacing * 2) + firmaWidth, firmaY, margin + (firmaSpacing * 2) + (firmaWidth * 2), firmaY)

      // Textos de firma
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Director(a)', margin + firmaSpacing + (firmaWidth / 2), firmaY + 7, { align: 'center' })
      pdf.text('Tutor(a)', margin + (firmaSpacing * 2) + firmaWidth + (firmaWidth / 2), firmaY + 7, { align: 'center' })
    }

    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(...grayColor)
    pdf.text(
      `Generado el ${new Date().toLocaleDateString('es-PE')} - Sistema de Gestión Académica Colegio Talentos`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    // Guardar PDF
    const nombreArchivo = `boletin_${estudiante.nombre}_${estudiante.apellidos}_${año}.pdf`.replace(/\s+/g, '_')
    pdf.save(nombreArchivo)
    
    return true
  } catch (error) {
    console.error('Error generando boletín:', error)
    throw new Error('No se pudo generar el boletín de notas')
  }
}

export { 
  generatePhotocheckPDFDirect, 
  generatePhotocheckPDF, 
  downloadPhotocheckPDFDirect, 
  downloadPhotocheckPDF, 
  printPhotocheckPDF, 
  generateReportPDF, 
  generateStudentProfilePDF,
  generateAttendanceReportPDF,
  generateBoletinPDF 
}