import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Configuración de colores corporativos
const colors = {
  primary: [255, 107, 107], // #FF6B6B
  primaryDark: [255, 93, 93], // #FF5D5D
  secondary: [255, 159, 64], // #FF9F40
  success: [34, 197, 94], // #22C55E
  warning: [251, 191, 36], // #FBF24
  danger: [239, 68, 68], // #EF4444
  info: [59, 130, 246], // #3B82F6
  gray: {
    light: [249, 250, 251], // #F9FAFB
    medium: [156, 163, 175], // #9CA3AF
    dark: [31, 41, 55] // #1F2937
  }
}

// Configuración de fuentes
const fonts = {
  title: { size: 20, style: 'bold' },
  subtitle: { size: 14, style: 'normal' },
  heading: { size: 12, style: 'bold' },
  normal: { size: 10, style: 'normal' },
  small: { size: 8, style: 'normal' }
}

class AdvancedPDFGenerator {
  constructor() {
    this.doc = null
    this.pageWidth = 0
    this.pageHeight = 0
    this.margin = 20
    this.currentY = 0
  }

  // Inicializar documento
  init(orientation = 'portrait', format = 'a4') {
    this.doc = new jsPDF({
      orientation,
      unit: 'mm',
      format
    })
    
    this.pageWidth = this.doc.internal.pageSize.width
    this.pageHeight = this.doc.internal.pageSize.height
    this.currentY = this.margin
    
    return this
  }

  // Agregar encabezado con logo
  addHeader(title, subtitle = '', logoPath = null) {
    // Fondo del header
    this.doc.setFillColor(...colors.primary)
    this.doc.rect(0, 0, this.pageWidth, 40, 'F')
    
    // Patrón decorativo
    this.doc.setDrawColor(...colors.primaryDark)
    this.doc.setLineWidth(0.1)
    for (let i = 0; i < 10; i++) {
      this.doc.line(i * 20, 0, i * 20 + 10, 40)
    }
    
    // Logo
    if (logoPath) {
      try {
        this.doc.addImage(logoPath, 'JPEG', this.margin, 10, 20, 20)
      } catch (error) {
        console.warn('Error agregando logo:', error)
      }
    }
    
    // Título
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(fonts.title.size)
    this.doc.setFont('helvetica', fonts.title.style)
    this.doc.text(title, this.pageWidth / 2, 18, { align: 'center' })
    
    // Subtítulo
    if (subtitle) {
      this.doc.setFontSize(fonts.subtitle.size)
      this.doc.setFont('helvetica', fonts.subtitle.style)
      this.doc.text(subtitle, this.pageWidth / 2, 28, { align: 'center' })
    }
    
    // Fecha y hora
    this.doc.setFontSize(fonts.small.size)
    this.doc.text(
      new Date().toLocaleString('es-PE'),
      this.pageWidth - this.margin,
      35,
      { align: 'right' }
    )
    
    this.currentY = 50
    return this
  }

  // Agregar sección con título
  addSection(title, icon = null) {
    // Verificar si necesitamos nueva página
    if (this.currentY > this.pageHeight - 40) {
      this.addPage()
    }
    
    // Línea decorativa
    this.doc.setDrawColor(...colors.primary)
    this.doc.setLineWidth(2)
    this.doc.line(this.margin, this.currentY, this.margin + 30, this.currentY)
    
    // Título de sección
    this.doc.setTextColor(...colors.gray.dark)
    this.doc.setFontSize(fonts.heading.size)
    this.doc.setFont('helvetica', fonts.heading.style)
    this.doc.text(title, this.margin + 35, this.currentY)
    
    this.currentY += 10
    return this
  }

  // Agregar tabla de datos con estilos avanzados
  addDataTable(headers, data, options = {}) {
    const defaultOptions = {
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: colors.gray.light
      },
      columnStyles: options.columnStyles || {},
      didDrawPage: (data) => {
        // Agregar pie de página en cada página
        this.addFooter()
      }
    }
    
    this.doc.autoTable({
      head: [headers],
      body: data,
      ...defaultOptions,
      ...options
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    return this
  }

  // Agregar gráfico de barras simple
  addBarChart(data, options = {}) {
    const {
      title = '',
      width = this.pageWidth - (this.margin * 2),
      height = 60,
      maxValue = Math.max(...data.map(d => d.value))
    } = options
    
    const chartX = this.margin
    const chartY = this.currentY
    
    // Título del gráfico
    if (title) {
      this.doc.setTextColor(...colors.gray.dark)
      this.doc.setFontSize(fonts.normal.size)
      this.doc.setFont('helvetica', fonts.normal.style)
      this.doc.text(title, chartX, chartY - 5)
    }
    
    // Fondo del gráfico
    this.doc.setFillColor(...colors.gray.light)
    this.doc.rect(chartX, chartY, width, height, 'F')
    
    // Dibujar barras
    const barWidth = width / data.length * 0.7
    const spacing = width / data.length * 0.3
    
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * (height - 20)
      const x = chartX + (index * (barWidth + spacing)) + spacing / 2
      const y = chartY + height - barHeight - 10
      
      // Barra
      this.doc.setFillColor(...(item.color || colors.primary))
      this.doc.rect(x, y, barWidth, barHeight, 'F')
      
      // Valor
      this.doc.setTextColor(...colors.gray.dark)
      this.doc.setFontSize(fonts.small.size)
      this.doc.text(
        item.value.toString(),
        x + barWidth / 2,
        y - 2,
        { align: 'center' }
      )
      
      // Etiqueta
      this.doc.text(
        item.label,
        x + barWidth / 2,
        chartY + height - 5,
        { align: 'center' }
      )
    })
    
    this.currentY += height + 15
    return this
  }

  // Agregar gráfico circular (pie chart)
  addPieChart(data, options = {}) {
    const {
      title = '',
      radius = 30,
      centerX = this.pageWidth / 2,
      centerY = this.currentY + radius + 10
    } = options
    
    // Título
    if (title) {
      this.doc.setTextColor(...colors.gray.dark)
      this.doc.setFontSize(fonts.normal.size)
      this.doc.setFont('helvetica', fonts.normal.style)
      this.doc.text(title, centerX, centerY - radius - 15, { align: 'center' })
    }
    
    // Calcular ángulos
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = -Math.PI / 2
    
    data.forEach((item) => {
      const angle = (item.value / total) * 2 * Math.PI
      const endAngle = currentAngle + angle
      
      // Dibujar sector
      this.doc.setFillColor(...(item.color || colors.primary))
      this.drawSector(centerX, centerY, radius, currentAngle, endAngle)
      
      // Etiqueta con porcentaje
      const labelAngle = currentAngle + angle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius + 10)
      const labelY = centerY + Math.sin(labelAngle) * (radius + 10)
      
      this.doc.setTextColor(...colors.gray.dark)
      this.doc.setFontSize(fonts.small.size)
      const percentage = ((item.value / total) * 100).toFixed(1)
      this.doc.text(`${item.label}: ${percentage}%`, labelX, labelY, { align: 'center' })
      
      currentAngle = endAngle
    })
    
    this.currentY = centerY + radius + 20
    return this
  }

  // Dibujar sector para gráfico circular
  drawSector(cx, cy, radius, startAngle, endAngle) {
    const steps = 30
    const angleStep = (endAngle - startAngle) / steps
    
    this.doc.moveTo(cx, cy)
    
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + i * angleStep
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius
      this.doc.lineTo(x, y)
    }
    
    this.doc.lineTo(cx, cy)
    this.doc.fill()
  }

  // Agregar tarjeta de estadísticas
  addStatsCard(stats, options = {}) {
    const {
      columns = 3,
      cardHeight = 25
    } = options
    
    const cardWidth = (this.pageWidth - (this.margin * 2) - ((columns - 1) * 5)) / columns
    
    stats.forEach((stat, index) => {
      const row = Math.floor(index / columns)
      const col = index % columns
      const x = this.margin + (col * (cardWidth + 5))
      const y = this.currentY + (row * (cardHeight + 5))
      
      // Fondo de la tarjeta
      this.doc.setFillColor(...colors.gray.light)
      this.doc.rect(x, y, cardWidth, cardHeight, 'F')
      
      // Borde superior con color
      this.doc.setFillColor(...(stat.color || colors.primary))
      this.doc.rect(x, y, cardWidth, 3, 'F')
      
      // Icono (simulado con un círculo)
      if (stat.icon) {
        this.doc.setFillColor(...(stat.color || colors.primary))
        this.doc.circle(x + 8, y + cardHeight / 2, 3, 'F')
      }
      
      // Título
      this.doc.setTextColor(...colors.gray.medium)
      this.doc.setFontSize(fonts.small.size)
      this.doc.setFont('helvetica', fonts.small.style)
      this.doc.text(stat.label, x + 15, y + 10)
      
      // Valor
      this.doc.setTextColor(...colors.gray.dark)
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(stat.value.toString(), x + 15, y + 18)
      
      // Tendencia
      if (stat.trend) {
        const trendX = x + cardWidth - 15
        const trendY = y + cardHeight / 2
        
        this.doc.setTextColor(...(stat.trend > 0 ? colors.success : colors.danger))
        this.doc.setFontSize(fonts.small.size)
        const trendText = stat.trend > 0 ? `↑ ${stat.trend}%` : `↓ ${Math.abs(stat.trend)}%`
        this.doc.text(trendText, trendX, trendY, { align: 'right' })
      }
    })
    
    const rows = Math.ceil(stats.length / columns)
    this.currentY += rows * (cardHeight + 5) + 10
    return this
  }

  // Agregar resumen ejecutivo
  addExecutiveSummary(summary) {
    this.addSection('Resumen Ejecutivo')
    
    // Fondo destacado
    this.doc.setFillColor(254, 243, 199) // Amarillo claro
    this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 40, 'F')
    
    // Icono de información
    this.doc.setFillColor(...colors.warning)
    this.doc.circle(this.margin + 10, this.currentY + 20, 5, 'F')
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('!', this.margin + 10, this.currentY + 22, { align: 'center' })
    
    // Texto del resumen
    this.doc.setTextColor(...colors.gray.dark)
    this.doc.setFontSize(fonts.normal.size)
    this.doc.setFont('helvetica', fonts.normal.style)
    
    const lines = this.doc.splitTextToSize(
      summary,
      this.pageWidth - (this.margin * 2) - 30
    )
    
    this.doc.text(lines, this.margin + 25, this.currentY + 15)
    
    this.currentY += 50
    return this
  }

  // Agregar línea de tiempo
  addTimeline(events) {
    this.addSection('Línea de Tiempo')
    
    const lineX = this.margin + 20
    const eventSpacing = 30
    
    events.forEach((event, index) => {
      const y = this.currentY + (index * eventSpacing)
      
      // Línea vertical
      if (index < events.length - 1) {
        this.doc.setDrawColor(...colors.gray.medium)
        this.doc.setLineWidth(1)
        this.doc.line(lineX, y, lineX, y + eventSpacing)
      }
      
      // Círculo del evento
      const circleColor = event.completed ? colors.success : colors.gray.medium
      this.doc.setFillColor(...circleColor)
      this.doc.circle(lineX, y, 3, 'F')
      
      // Fecha
      this.doc.setTextColor(...colors.gray.medium)
      this.doc.setFontSize(fonts.small.size)
      this.doc.text(event.date, lineX - 15, y, { align: 'right' })
      
      // Título del evento
      this.doc.setTextColor(...colors.gray.dark)
      this.doc.setFontSize(fonts.normal.size)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(event.title, lineX + 10, y - 2)
      
      // Descripción
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(fonts.small.size)
      const descLines = this.doc.splitTextToSize(
        event.description,
        this.pageWidth - lineX - this.margin - 10
      )
      this.doc.text(descLines, lineX + 10, y + 3)
    })
    
    this.currentY += events.length * eventSpacing + 10
    return this
  }

  // Agregar página
  addPage() {
    this.doc.addPage()
    this.currentY = this.margin
    this.addFooter()
    return this
  }

  // Agregar pie de página
  addFooter() {
    const pageNumber = this.doc.internal.getCurrentPageInfo().pageNumber
    const totalPages = this.doc.internal.getNumberOfPages()
    
    // Línea separadora
    this.doc.setDrawColor(...colors.gray.medium)
    this.doc.setLineWidth(0.5)
    this.doc.line(
      this.margin,
      this.pageHeight - 15,
      this.pageWidth - this.margin,
      this.pageHeight - 15
    )
    
    // Texto del pie
    this.doc.setTextColor(...colors.gray.medium)
    this.doc.setFontSize(fonts.small.size)
    this.doc.setFont('helvetica', fonts.small.style)
    
    // Logo y nombre del colegio
    this.doc.text(
      'Colegio Talentos - Sistema de Gestión Académica',
      this.margin,
      this.pageHeight - 8
    )
    
    // Número de página
    this.doc.text(
      `Página ${pageNumber} de ${totalPages}`,
      this.pageWidth - this.margin,
      this.pageHeight - 8,
      { align: 'right' }
    )
    
    return this
  }

  // Guardar o descargar el PDF
  save(filename) {
    // Agregar metadatos
    this.doc.setProperties({
      title: filename,
      author: 'Sistema Colegio Talentos',
      creator: 'Colegio Talentos',
      keywords: 'reporte, educación, gestión académica'
    })
    
    // Agregar pies de página a todas las páginas
    const totalPages = this.doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i)
      this.addFooter()
    }
    
    this.doc.save(`${filename}.pdf`)
  }

  // Obtener el PDF como blob
  getBlob() {
    return this.doc.output('blob')
  }

  // Obtener el PDF como data URL
  getDataURL() {
    return this.doc.output('dataurlstring')
  }
}

// Funciones de utilidad para generar reportes específicos
export const generateAdvancedReport = (type, data) => {
  const pdf = new AdvancedPDFGenerator()
  
  switch (type) {
    case 'ASISTENCIA_GENERAL':
      return generateAttendanceReport(pdf, data)
    case 'RENDIMIENTO_ACADEMICO':
      return generateAcademicReport(pdf, data)
    case 'COMUNICACIONES':
      return generateCommunicationsReport(pdf, data)
    case 'SATISFACCION':
      return generateSatisfactionReport(pdf, data)
    case 'FINANCIERO':
      return generateFinancialReport(pdf, data)
    default:
      return generateGenericReport(pdf, data)
  }
}

// Reporte de asistencia
const generateAttendanceReport = (pdf, data) => {
  pdf.init()
    .addHeader('Reporte de Asistencia', `Período: ${data.period}`)
    .addExecutiveSummary(
      `Durante el período ${data.period}, se registró un promedio de asistencia del ${data.stats.averageAttendance}%. ` +
      `Se identificaron ${data.stats.criticalStudents} estudiantes con asistencia crítica (menor al 75%).`
    )
    .addStatsCard([
      { label: 'Asistencia Promedio', value: `${data.stats.averageAttendance}%`, color: colors.success },
      { label: 'Total Estudiantes', value: data.stats.totalStudents, color: colors.info },
      { label: 'Días Hábiles', value: data.stats.schoolDays, color: colors.primary },
      { label: 'Inasistencias', value: data.stats.totalAbsences, color: colors.danger, trend: -5 },
      { label: 'Tardanzas', value: data.stats.totalTardiness, color: colors.warning, trend: -2 },
      { label: 'Casos Críticos', value: data.stats.criticalStudents, color: colors.danger }
    ])
    .addSection('Distribución de Asistencia')
    .addPieChart([
      { label: 'Presente', value: data.distribution.present, color: colors.success },
      { label: 'Tardanza', value: data.distribution.late, color: colors.warning },
      { label: 'Falta', value: data.distribution.absent, color: colors.danger }
    ])
    .addSection('Tendencia Mensual')
    .addBarChart(data.monthlyTrend.map(item => ({
      label: item.month,
      value: item.attendance,
      color: item.attendance >= 90 ? colors.success : 
             item.attendance >= 80 ? colors.warning : colors.danger
    })))
    .addSection('Estudiantes con Baja Asistencia')
    .addDataTable(
      ['Nombre', 'Grado', 'Asistencia %', 'Faltas', 'Estado'],
      data.lowAttendanceStudents,
      {
        columnStyles: {
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' }
        }
      }
    )
    
  pdf.save(`reporte-asistencia-${data.period}`)
}

// Reporte académico
const generateAcademicReport = (pdf, data) => {
  pdf.init('landscape')
    .addHeader('Reporte de Rendimiento Académico', `${data.grade} - ${data.period}`)
    .addExecutiveSummary(
      `El promedio general del ${data.grade} durante ${data.period} fue de ${data.stats.averageGrade}. ` +
      `${data.stats.excellentStudents} estudiantes obtuvieron calificaciones excelentes (>16), ` +
      `mientras que ${data.stats.failingStudents} requieren apoyo adicional.`
    )
    .addStatsCard([
      { label: 'Promedio General', value: data.stats.averageGrade, color: colors.info },
      { label: 'Mejor Promedio', value: data.stats.highestGrade, color: colors.success },
      { label: 'Estudiantes Excelentes', value: data.stats.excellentStudents, color: colors.success },
      { label: 'Requieren Apoyo', value: data.stats.failingStudents, color: colors.danger }
    ])
    .addSection('Distribución de Calificaciones')
    .addBarChart([
      { label: 'AD (18-20)', value: data.distribution.ad, color: colors.success },
      { label: 'A (14-17)', value: data.distribution.a, color: colors.info },
      { label: 'B (11-13)', value: data.distribution.b, color: colors.warning },
      { label: 'C (0-10)', value: data.distribution.c, color: colors.danger }
    ])
    .addSection('Rendimiento por Asignatura')
    .addDataTable(
      ['Asignatura', 'Promedio', 'Aprobados', 'Desaprobados', 'Mejor Nota'],
      data.subjectPerformance
    )
    
  pdf.save(`reporte-academico-${data.grade}-${data.period}`)
}

// Reporte genérico
const generateGenericReport = (pdf, data) => {
  pdf.init()
    .addHeader(data.title || 'Reporte General', data.subtitle || '')
  
  if (data.summary) {
    pdf.addExecutiveSummary(data.summary)
  }
  
  if (data.stats) {
    pdf.addStatsCard(data.stats)
  }
  
  if (data.sections) {
    data.sections.forEach(section => {
      pdf.addSection(section.title)
      
      if (section.table) {
        pdf.addDataTable(section.table.headers, section.table.data, section.table.options)
      }
      
      if (section.chart) {
        if (section.chart.type === 'bar') {
          pdf.addBarChart(section.chart.data, section.chart.options)
        } else if (section.chart.type === 'pie') {
          pdf.addPieChart(section.chart.data, section.chart.options)
        }
      }
    })
  }
  
  pdf.save(data.filename || 'reporte-general')
}

export default AdvancedPDFGenerator