import * as XLSX from 'xlsx'

// Configuración de estilos para Excel
const styles = {
  header: {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: 'FF6B6B' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  },
  subheader: {
    font: { bold: true },
    fill: { fgColor: { rgb: 'F3F4F6' } },
    alignment: { horizontal: 'left' }
  },
  cell: {
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'E5E7EB' } },
      bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
      left: { style: 'thin', color: { rgb: 'E5E7EB' } },
      right: { style: 'thin', color: { rgb: 'E5E7EB' } }
    }
  },
  number: {
    alignment: { horizontal: 'right' },
    numFmt: '#,##0.00'
  },
  percentage: {
    alignment: { horizontal: 'center' },
    numFmt: '0.00%'
  },
  date: {
    alignment: { horizontal: 'center' },
    numFmt: 'dd/mm/yyyy'
  },
  currency: {
    alignment: { horizontal: 'right' },
    numFmt: '"S/." #,##0.00'
  },
  success: {
    font: { color: { rgb: '16A34A' } },
    fill: { fgColor: { rgb: 'D1FAE5' } }
  },
  warning: {
    font: { color: { rgb: 'CA8A04' } },
    fill: { fgColor: { rgb: 'FEF3C7' } }
  },
  danger: {
    font: { color: { rgb: 'DC2626' } },
    fill: { fgColor: { rgb: 'FEE2E2' } }
  }
}

class AdvancedExcelExporter {
  constructor() {
    this.workbook = XLSX.utils.book_new()
    this.sheets = {}
  }

  // Crear hoja con encabezados personalizados
  createSheet(sheetName, options = {}) {
    const sheet = {
      name: sheetName,
      data: [],
      merges: [],
      cols: options.columns || [],
      conditionalFormatting: [],
      charts: [],
      images: []
    }
    
    this.sheets[sheetName] = sheet
    return this
  }

  // Agregar encabezado principal con logo y título
  addMainHeader(sheetName, title, subtitle = '') {
    const sheet = this.sheets[sheetName]
    if (!sheet) throw new Error(`Hoja ${sheetName} no existe`)
    
    // Título principal (fusionar celdas A1:H1)
    sheet.data.push([title, '', '', '', '', '', '', ''])
    sheet.merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } })
    
    // Subtítulo (fusionar celdas A2:H2)
    if (subtitle) {
      sheet.data.push([subtitle, '', '', '', '', '', '', ''])
      sheet.merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 7 } })
    }
    
    // Línea en blanco
    sheet.data.push([''])
    
    return this
  }

  // Agregar tabla de datos con formato
  addDataTable(sheetName, headers, data, options = {}) {
    const sheet = this.sheets[sheetName]
    if (!sheet) throw new Error(`Hoja ${sheetName} no existe`)
    
    const startRow = sheet.data.length
    
    // Agregar encabezados
    sheet.data.push(headers)
    
    // Agregar datos
    data.forEach(row => {
      sheet.data.push(row)
    })
    
    // Aplicar formato condicional si se especifica
    if (options.conditionalFormatting) {
      options.conditionalFormatting.forEach(rule => {
        sheet.conditionalFormatting.push({
          ...rule,
          range: {
            s: { r: startRow + 1, c: rule.column },
            e: { r: startRow + data.length, c: rule.column }
          }
        })
      })
    }
    
    // Agregar totales si se especifica
    if (options.showTotals) {
      const totalsRow = ['TOTAL']
      for (let i = 1; i < headers.length; i++) {
        if (options.totalColumns && options.totalColumns.includes(i)) {
          const sum = data.reduce((acc, row) => acc + (parseFloat(row[i]) || 0), 0)
          totalsRow.push(sum)
        } else {
          totalsRow.push('')
        }
      }
      sheet.data.push(totalsRow)
    }
    
    return this
  }

  // Agregar hoja de resumen ejecutivo
  addSummarySheet(summaryData) {
    this.createSheet('Resumen Ejecutivo')
      .addMainHeader('Resumen Ejecutivo', 'Reporte Integral del Sistema', 
        `Generado el ${new Date().toLocaleDateString('es-PE')}`)
    
    const sheet = this.sheets['Resumen Ejecutivo']
    
    // Sección de métricas clave
    sheet.data.push(['MÉTRICAS CLAVE', '', '', ''])
    sheet.merges.push({ 
      s: { r: sheet.data.length - 1, c: 0 }, 
      e: { r: sheet.data.length - 1, c: 3 } 
    })
    
    summaryData.metrics.forEach(metric => {
      sheet.data.push([metric.label, metric.value, metric.change || '', metric.status || ''])
    })
    
    sheet.data.push(['']) // Línea en blanco
    
    // Sección de insights
    sheet.data.push(['INSIGHTS PRINCIPALES', '', '', ''])
    sheet.merges.push({ 
      s: { r: sheet.data.length - 1, c: 0 }, 
      e: { r: sheet.data.length - 1, c: 3 } 
    })
    
    summaryData.insights.forEach((insight, index) => {
      sheet.data.push([`${index + 1}. ${insight}`, '', '', ''])
      sheet.merges.push({ 
        s: { r: sheet.data.length - 1, c: 0 }, 
        e: { r: sheet.data.length - 1, c: 3 } 
      })
    })
    
    return this
  }

  // Agregar gráfico de datos
  addChart(sheetName, chartOptions) {
    const sheet = this.sheets[sheetName]
    if (!sheet) throw new Error(`Hoja ${sheetName} no existe`)
    
    sheet.charts.push({
      type: chartOptions.type,
      title: chartOptions.title,
      dataRange: chartOptions.dataRange,
      position: chartOptions.position || { row: sheet.data.length + 2, col: 0 },
      size: chartOptions.size || { width: 600, height: 400 }
    })
    
    return this
  }

  // Agregar tabla dinámica
  addPivotTable(sheetName, sourceData, pivotOptions) {
    const pivotSheetName = `Pivot_${sheetName}`
    this.createSheet(pivotSheetName)
    
    const pivotData = this.generatePivotData(sourceData, pivotOptions)
    
    this.addDataTable(
      pivotSheetName,
      pivotData.headers,
      pivotData.data,
      { showTotals: true, totalColumns: pivotOptions.valueColumns }
    )
    
    return this
  }

  // Generar datos de tabla dinámica
  generatePivotData(sourceData, options) {
    const { rowField, columnField, valueField, aggregation = 'sum' } = options
    
    // Agrupar datos
    const grouped = {}
    sourceData.forEach(row => {
      const rowKey = row[rowField]
      const colKey = row[columnField]
      const value = parseFloat(row[valueField]) || 0
      
      if (!grouped[rowKey]) grouped[rowKey] = {}
      if (!grouped[rowKey][colKey]) grouped[rowKey][colKey] = []
      
      grouped[rowKey][colKey].push(value)
    })
    
    // Obtener columnas únicas
    const columns = [...new Set(sourceData.map(row => row[columnField]))].sort()
    
    // Generar encabezados
    const headers = [rowField, ...columns, 'Total']
    
    // Generar datos
    const data = []
    Object.entries(grouped).forEach(([rowKey, cols]) => {
      const row = [rowKey]
      let rowTotal = 0
      
      columns.forEach(col => {
        const values = cols[col] || []
        let cellValue = 0
        
        switch (aggregation) {
          case 'sum':
            cellValue = values.reduce((a, b) => a + b, 0)
            break
          case 'avg':
            cellValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
            break
          case 'count':
            cellValue = values.length
            break
          case 'max':
            cellValue = values.length > 0 ? Math.max(...values) : 0
            break
          case 'min':
            cellValue = values.length > 0 ? Math.min(...values) : 0
            break
        }
        
        row.push(cellValue)
        rowTotal += cellValue
      })
      
      row.push(rowTotal)
      data.push(row)
    })
    
    return { headers, data }
  }

  // Aplicar validación de datos
  addDataValidation(sheetName, validationRules) {
    const sheet = this.sheets[sheetName]
    if (!sheet) throw new Error(`Hoja ${sheetName} no existe`)
    
    sheet.dataValidation = validationRules
    return this
  }

  // Agregar comentarios
  addComments(sheetName, comments) {
    const sheet = this.sheets[sheetName]
    if (!sheet) throw new Error(`Hoja ${sheetName} no existe`)
    
    sheet.comments = comments
    return this
  }

  // Proteger hoja
  protectSheet(sheetName, password, allowedActions = []) {
    const sheet = this.sheets[sheetName]
    if (!sheet) throw new Error(`Hoja ${sheetName} no existe`)
    
    sheet.protection = {
      password,
      allowedActions
    }
    
    return this
  }

  // Exportar el libro de trabajo
  export(filename) {
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new()
    
    // Propiedades del libro
    wb.Props = {
      Title: filename,
      Author: 'Sistema Colegio Talentos',
      CreatedDate: new Date(),
      Company: 'Colegio Talentos'
    }
    
    // Agregar cada hoja
    Object.entries(this.sheets).forEach(([sheetName, sheet]) => {
      // Convertir datos a hoja de trabajo
      const ws = XLSX.utils.aoa_to_sheet(sheet.data)
      
      // Aplicar fusiones de celdas
      if (sheet.merges.length > 0) {
        ws['!merges'] = sheet.merges
      }
      
      // Aplicar anchos de columna
      if (sheet.cols.length > 0) {
        ws['!cols'] = sheet.cols.map(width => ({ width }))
      }
      
      // Aplicar estilos (nota: XLSX Community Edition tiene soporte limitado de estilos)
      // Para estilos completos, considerar usar ExcelJS o una versión Pro de SheetJS
      
      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    })
    
    // Guardar el archivo
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  // Obtener el libro como blob
  getBlob() {
    const wb = this.generateWorkbook()
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    return new Blob([wbout], { type: 'application/octet-stream' })
  }

  // Generar libro de trabajo interno
  generateWorkbook() {
    const wb = XLSX.utils.book_new()
    
    Object.entries(this.sheets).forEach(([sheetName, sheet]) => {
      const ws = XLSX.utils.aoa_to_sheet(sheet.data)
      if (sheet.merges.length > 0) ws['!merges'] = sheet.merges
      if (sheet.cols.length > 0) ws['!cols'] = sheet.cols.map(width => ({ width }))
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    })
    
    return wb
  }
}

// Funciones de utilidad para generar reportes específicos
export const generateAdvancedExcelReport = (type, data) => {
  const exporter = new AdvancedExcelExporter()
  
  switch (type) {
    case 'REPORTE_COMPLETO':
      return generateCompleteReport(exporter, data)
    case 'ASISTENCIA_DETALLADA':
      return generateDetailedAttendanceReport(exporter, data)
    case 'RENDIMIENTO_ACADEMICO':
      return generateAcademicPerformanceReport(exporter, data)
    case 'ANALISIS_FINANCIERO':
      return generateFinancialAnalysisReport(exporter, data)
    default:
      return generateStandardReport(exporter, data)
  }
}

// Reporte completo con múltiples hojas
const generateCompleteReport = (exporter, data) => {
  // Hoja de resumen ejecutivo
  exporter.addSummarySheet({
    metrics: [
      { label: 'Total Estudiantes', value: data.totalStudents, change: '+5%', status: '✅' },
      { label: 'Asistencia Promedio', value: `${data.avgAttendance}%`, change: '+2%', status: '✅' },
      { label: 'Promedio Académico', value: data.avgGrade, change: '-0.5', status: '⚠️' },
      { label: 'Satisfacción General', value: `${data.satisfaction}%`, change: '+8%', status: '✅' }
    ],
    insights: [
      'La asistencia ha mejorado un 2% respecto al período anterior',
      'Se identificaron 15 estudiantes que requieren apoyo académico adicional',
      'El índice de satisfacción de padres aumentó significativamente',
      'Los pagos puntuales incrementaron en un 12%'
    ]
  })
  
  // Hoja de estudiantes
  exporter.createSheet('Estudiantes', { columns: [20, 15, 10, 15, 15, 20] })
    .addMainHeader('Estudiantes', 'Listado Completo de Estudiantes')
    .addDataTable(
      'Estudiantes',
      ['Nombre Completo', 'Grado', 'Sección', 'Promedio', 'Asistencia %', 'Estado'],
      data.students,
      {
        conditionalFormatting: [
          {
            column: 3,
            type: 'cell',
            operator: 'greaterThan',
            value: 16,
            format: styles.success
          },
          {
            column: 4,
            type: 'cell',
            operator: 'lessThan',
            value: 75,
            format: styles.danger
          }
        ]
      }
    )
  
  // Hoja de asistencia
  exporter.createSheet('Asistencia')
    .addMainHeader('Asistencia', 'Reporte Detallado de Asistencia')
    .addDataTable(
      'Asistencia',
      ['Fecha', 'Total Presente', 'Total Tarde', 'Total Falta', '% Asistencia'],
      data.attendance
    )
  
  // Hoja de calificaciones
  exporter.createSheet('Calificaciones')
    .addMainHeader('Calificaciones', 'Reporte de Rendimiento Académico')
    .addDataTable(
      'Calificaciones',
      ['Estudiante', 'Matemática', 'Comunicación', 'Ciencias', 'Historia', 'Promedio'],
      data.grades,
      {
        showTotals: true,
        totalColumns: [1, 2, 3, 4, 5]
      }
    )
  
  // Hoja de análisis con tabla dinámica
  exporter.addPivotTable('Estudiantes', data.students, {
    rowField: 'Grado',
    columnField: 'Estado',
    valueField: 'Promedio',
    aggregation: 'avg'
  })
  
  // Exportar
  exporter.export(`reporte-completo-${new Date().toISOString().split('T')[0]}`)
}

// Reporte estándar
const generateStandardReport = (exporter, data) => {
  exporter.createSheet('Datos')
    .addMainHeader('Datos', data.title || 'Reporte', data.subtitle || '')
    .addDataTable(
      'Datos',
      data.headers,
      data.rows,
      data.options || {}
    )
    
  exporter.export(data.filename || 'reporte')
}

export default AdvancedExcelExporter