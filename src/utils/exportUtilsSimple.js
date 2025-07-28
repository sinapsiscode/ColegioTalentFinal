import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'

/**
 * Utilidades de exportación simplificadas
 * - Sin dependencias externas complejas
 * - Funcionalidad básica pero confiable
 */

// =====================================================
// CONFIGURACIONES
// =====================================================

const EXPORT_CONFIG = {
  pdf: {
    margin: 20,
    fontSize: 10,
    headerFontSize: 16,
    lineHeight: 6
  },
  excel: {
    sheetName: 'Datos',
    defaultColumnWidth: 15
  }
}

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

const validateExportData = (data, headers) => {
  if (!Array.isArray(data)) {
    return { isValid: false, error: 'Los datos deben ser un array' }
  }

  if (data.length === 0) {
    return { isValid: false, error: 'No hay datos para exportar' }
  }

  if (!Array.isArray(headers) || headers.length === 0) {
    return { isValid: false, error: 'Headers no válidos' }
  }

  return { isValid: true }
}

const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
}

const generateFilename = (baseName, extension) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const sanitizedName = sanitizeFilename(baseName)
  return `${sanitizedName}_${timestamp}.${extension}`
}

// =====================================================
// EXPORTACIÓN A EXCEL
// =====================================================

export const exportToExcel = async (data, headers, filename, options = {}) => {
  try {
    const validation = validateExportData(data, headers)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // Crear workbook
    const wb = XLSX.utils.book_new()
    
    // Preparar datos con headers
    const worksheetData = [headers, ...data.map(row => 
      headers.map(header => {
        const value = row[header] || row[header.toLowerCase()] || ''
        return typeof value === 'object' ? JSON.stringify(value) : value
      })
    )]

    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData)
    
    // Configurar anchos de columna
    const columnWidths = headers.map(() => ({ wch: options.columnWidth || EXPORT_CONFIG.excel.defaultColumnWidth }))
    ws['!cols'] = columnWidths

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, options.sheetName || EXPORT_CONFIG.excel.sheetName)

    // Generar archivo y descargar
    const finalFilename = generateFilename(filename, 'xlsx')
    XLSX.writeFile(wb, finalFilename)

    return {
      success: true,
      filename: finalFilename,
      message: `Archivo Excel exportado exitosamente: ${finalFilename}`
    }

  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    return {
      success: false,
      error: error.message || 'Error desconocido al exportar a Excel'
    }
  }
}

// =====================================================
// EXPORTACIÓN A PDF (SIMPLIFICADA)
// =====================================================

export const exportToPDF = async (data, headers, filename, options = {}) => {
  try {
    const validation = validateExportData(data, headers)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // Crear documento PDF
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Configuración del título
    const title = options.title || filename
    doc.setFontSize(EXPORT_CONFIG.pdf.headerFontSize)
    doc.setFont('helvetica', 'bold')
    doc.text(title, pageWidth / 2, 30, { align: 'center' })

    // Información adicional
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const currentDate = new Date().toLocaleDateString('es-ES')
    const currentTime = new Date().toLocaleTimeString('es-ES')
    doc.text(`Generado el ${currentDate} a las ${currentTime}`, pageWidth / 2, 40, { align: 'center' })

    // Crear tabla manualmente (sin autoTable)
    let yPosition = 60
    const margin = EXPORT_CONFIG.pdf.margin
    const cellHeight = EXPORT_CONFIG.pdf.lineHeight
    const cellWidth = (pageWidth - 2 * margin) / headers.length

    // Dibujar headers
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(59, 130, 246) // Azul
    doc.setTextColor(255, 255, 255) // Blanco
    
    headers.forEach((header, index) => {
      const x = margin + (index * cellWidth)
      doc.rect(x, yPosition, cellWidth, cellHeight, 'F')
      doc.text(String(header), x + 2, yPosition + 4)
    })

    yPosition += cellHeight

    // Dibujar datos
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0) // Negro
    
    data.forEach((row, rowIndex) => {
      // Alternar colores de fila
      if (rowIndex % 2 === 0) {
        doc.setFillColor(249, 250, 251) // Gris claro
        doc.rect(margin, yPosition, pageWidth - 2 * margin, cellHeight, 'F')
      }

      headers.forEach((header, colIndex) => {
        const x = margin + (colIndex * cellWidth)
        const value = row[header] || row[header.toLowerCase()] || ''
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
        
        // Truncar texto si es muy largo
        const maxLength = Math.floor(cellWidth / 2)
        const truncatedValue = displayValue.length > maxLength 
          ? displayValue.substring(0, maxLength) + '...' 
          : displayValue

        doc.text(truncatedValue, x + 2, yPosition + 4)
      })

      yPosition += cellHeight

      // Nueva página si es necesario
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 30
      }
    })

    // Footer en todas las páginas
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Descargar archivo
    const finalFilename = generateFilename(filename, 'pdf')
    doc.save(finalFilename)

    return {
      success: true,
      filename: finalFilename,
      message: `Archivo PDF exportado exitosamente: ${finalFilename}`
    }

  } catch (error) {
    console.error('Error al exportar a PDF:', error)
    return {
      success: false,
      error: error.message || 'Error desconocido al exportar a PDF'
    }
  }
}

// =====================================================
// FUNCIONES ESPECIALIZADAS POR ROL
// =====================================================

export const exportForParents = async (data, options = {}) => {
  const defaultOptions = {
    title: 'Reporte Académico del Estudiante',
    filename: 'reporte_estudiante'
  }

  const mergedOptions = { ...defaultOptions, ...options }
  
  return await exportToPDF(
    data,
    ['Materia', 'Calificación', 'Fecha', 'Observaciones'],
    mergedOptions.filename,
    mergedOptions
  )
}

export const exportForAdmins = async (data, headers, format, options = {}) => {
  const defaultOptions = {
    title: 'Reporte Administrativo',
    filename: 'reporte_admin',
    sheetName: 'Datos_Administrativos'
  }

  const mergedOptions = { ...defaultOptions, ...options }

  if (format === 'excel') {
    return await exportToExcel(data, headers, mergedOptions.filename, mergedOptions)
  } else if (format === 'pdf') {
    return await exportToPDF(data, headers, mergedOptions.filename, mergedOptions)
  } else {
    return {
      success: false,
      error: 'Formato no válido. Use "excel" o "pdf"'
    }
  }
}

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

export const handleExport = async ({ data, headers, userRole, format, options = {} }) => {
  try {
    if (!data || !headers || !userRole) {
      throw new Error('Parámetros requeridos faltantes')
    }

    switch (userRole) {
      case 'parent':
        return await exportForParents(data, options)
        
      case 'admin':
        return await exportForAdmins(data, headers, format || 'pdf', options)
        
      case 'tutor':
        return await exportToPDF(data, headers, options.filename || 'reporte_tutor', options)
        
      default:
        throw new Error('Rol de usuario no válido')
    }
  } catch (error) {
    console.error('Error en handleExport:', error)
    return {
      success: false,
      error: error.message || 'Error desconocido en la exportación'
    }
  }
}

export default {
  exportToExcel,
  exportToPDF,
  exportForParents,
  exportForAdmins,
  handleExport
}