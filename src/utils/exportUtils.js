import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
// Importar autoTable como plugin
import('jspdf-autotable').then(() => {
  // Plugin se auto-registra
})

/**
 * Utilidades para exportación de datos con buenas prácticas
 * - Manejo de errores centralizado
 * - Validación de datos
 * - Formatos estandarizados
 * - Nombres de archivo descriptivos
 */

// =====================================================
// CONFIGURACIONES Y CONSTANTES
// =====================================================

const EXPORT_CONFIG = {
  pdf: {
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    fontSize: 12,
    headerFontSize: 16,
    footerFontSize: 10,
    lineHeight: 1.5
  },
  excel: {
    sheetName: 'Datos',
    defaultColumnWidth: 15
  },
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm:ss'
}

// =====================================================
// FUNCIONES DE VALIDACIÓN
// =====================================================

/**
 * Valida los datos antes de exportar
 * @param {Array} data - Datos a validar
 * @param {Array} headers - Headers esperados
 * @returns {Object} Resultado de la validación
 */
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

/**
 * Sanitiza el nombre del archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} Nombre sanitizado
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
}

/**
 * Genera un nombre de archivo con timestamp
 * @param {string} baseName - Nombre base
 * @param {string} extension - Extensión del archivo
 * @returns {string} Nombre completo del archivo
 */
const generateFilename = (baseName, extension) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const sanitizedName = sanitizeFilename(baseName)
  return `${sanitizedName}_${timestamp}.${extension}`
}

// =====================================================
// EXPORTACIÓN A EXCEL
// =====================================================

/**
 * Convierte datos a formato Excel y descarga
 * @param {Array} data - Datos a exportar
 * @param {Array} headers - Headers de las columnas
 * @param {string} filename - Nombre del archivo
 * @param {Object} options - Opciones adicionales
 */
export const exportToExcel = async (data, headers, filename, options = {}) => {
  try {
    // Validar datos
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

    // Estilo para headers (primera fila)
    const headerRange = XLSX.utils.decode_range(ws['!ref'])
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "E2E8F0" } },
          alignment: { horizontal: "center" }
        }
      }
    }

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
// EXPORTACIÓN A PDF
// =====================================================

/**
 * Convierte datos a formato PDF y descarga
 * @param {Array} data - Datos a exportar
 * @param {Array} headers - Headers de las columnas
 * @param {string} filename - Nombre del archivo
 * @param {Object} options - Opciones adicionales
 */
export const exportToPDF = async (data, headers, filename, options = {}) => {
  try {
    // Validar datos
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
    doc.setFontSize(EXPORT_CONFIG.pdf.footerFontSize)
    doc.setFont('helvetica', 'normal')
    const currentDate = new Date().toLocaleDateString('es-ES')
    const currentTime = new Date().toLocaleTimeString('es-ES')
    doc.text(`Generado el ${currentDate} a las ${currentTime}`, pageWidth / 2, 40, { align: 'center' })

    // Preparar datos para la tabla
    const tableData = data.map(row => 
      headers.map(header => {
        const value = row[header] || row[header.toLowerCase()] || ''
        return typeof value === 'object' ? JSON.stringify(value) : String(value)
      })
    )

    // Verificar que autoTable esté disponible
    if (typeof doc.autoTable !== 'function') {
      throw new Error('jsPDF autoTable plugin no está disponible')
    }

    // Configurar la tabla
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 50,
      margin: EXPORT_CONFIG.pdf.margin,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [59, 130, 246], // bg-blue-500
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // bg-gray-50
      },
      columnStyles: options.columnStyles || {},
      didDrawPage: function (data) {
        // Footer
        doc.setFontSize(EXPORT_CONFIG.pdf.footerFontSize)
        doc.setFont('helvetica', 'normal')
        doc.text(
          `Página ${data.pageNumber} de ${doc.internal.getNumberOfPages()}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }
    })

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

/**
 * Exporta datos específicos para padres (solo PDF)
 * @param {Array} data - Datos del estudiante/hijo
 * @param {Object} options - Opciones de exportación
 */
export const exportForParents = async (data, options = {}) => {
  const defaultOptions = {
    title: 'Reporte Académico del Estudiante',
    filename: 'reporte_estudiante',
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 40 }
    }
  }

  const mergedOptions = { ...defaultOptions, ...options }
  
  // Solo permitir PDF para padres
  return await exportToPDF(
    data,
    ['Materia', 'Calificación', 'Fecha', 'Observaciones'],
    mergedOptions.filename,
    mergedOptions
  )
}

/**
 * Exporta datos para administradores (Excel o PDF según preferencia)
 * @param {Array} data - Datos a exportar
 * @param {Array} headers - Headers de las columnas
 * @param {string} format - Formato de exportación ('excel' | 'pdf')
 * @param {Object} options - Opciones de exportación
 */
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
// FUNCIÓN PRINCIPAL DE EXPORTACIÓN
// =====================================================

/**
 * Función principal que maneja la exportación según el rol del usuario
 * @param {Object} params - Parámetros de exportación
 * @param {Array} params.data - Datos a exportar
 * @param {Array} params.headers - Headers de las columnas
 * @param {string} params.userRole - Rol del usuario ('parent' | 'admin' | 'tutor')
 * @param {string} params.format - Formato preferido ('excel' | 'pdf')
 * @param {Object} params.options - Opciones adicionales
 */
export const handleExport = async ({ data, headers, userRole, format, options = {} }) => {
  try {
    if (!data || !headers || !userRole) {
      throw new Error('Parámetros requeridos faltantes')
    }

    switch (userRole) {
      case 'parent':
        // Padres solo pueden exportar a PDF
        return await exportForParents(data, options)
        
      case 'admin':
        // Administradores pueden elegir formato
        return await exportForAdmins(data, headers, format || 'pdf', options)
        
      case 'tutor':
        // Tutores pueden exportar a PDF por defecto
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