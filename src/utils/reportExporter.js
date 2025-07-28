import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const exportReportToPDF = async ({ title, data, dateRange, generatedBy }) => {
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.width
    const pageHeight = pdf.internal.pageSize.height
    const margin = 15

    // Colores
    const primaryColor = [30, 64, 175] // #1e40af
    const grayColor = [107, 114, 128] // #6b7280

    // Header
    pdf.setFillColor(...primaryColor)
    pdf.rect(0, 0, pageWidth, 40, 'F')

    // Logo y título
    pdf.setFillColor(255, 255, 255)
    pdf.circle(25, 20, 12, 'F')
    pdf.setTextColor(...primaryColor)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CT', 25, 24, { align: 'center' })

    // Título del reporte
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(20)
    pdf.text(title.toUpperCase(), pageWidth / 2, 20, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Período: ${formatDateRange(dateRange)}`, pageWidth / 2, 30, { align: 'center' })

    let currentY = 50

    // Información general
    pdf.setTextColor(...grayColor)
    pdf.setFontSize(10)
    pdf.text(`Generado por: ${generatedBy}`, margin, currentY)
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, pageWidth - margin - 50, currentY, { align: 'left' })

    currentY += 10

    // Resumen de KPIs
    if (data.totalStudents !== undefined) {
      pdf.setTextColor(...primaryColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RESUMEN EJECUTIVO', margin, currentY)
      
      currentY += 10
      
      // Cuadro de KPIs
      const kpis = [
        { label: 'Total Estudiantes', value: data.totalStudents },
        { label: 'Asistencia Promedio', value: `${data.averageAttendance || 0}%` },
        { label: 'Promedio Académico', value: data.academicAverage || 0 },
        { label: 'Recaudación', value: `S/. ${(data.monthlyRevenue || 0).toLocaleString()}` }
      ]

      const kpiWidth = (pageWidth - margin * 2) / 4
      kpis.forEach((kpi, index) => {
        const x = margin + (index * kpiWidth)
        
        pdf.setFillColor(249, 250, 251)
        pdf.rect(x, currentY - 5, kpiWidth - 5, 20, 'F')
        
        pdf.setTextColor(...grayColor)
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.text(kpi.label, x + 5, currentY)
        
        pdf.setTextColor(...primaryColor)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(String(kpi.value), x + 5, currentY + 10)
      })

      currentY += 30
    }

    // Detalles según el tipo de reporte
    if (data.attendanceByDay) {
      // Tabla de asistencia
      pdf.setTextColor(...primaryColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('DETALLE DE ASISTENCIA', margin, currentY)
      
      currentY += 10

      const tableData = data.attendanceByDay.map(item => [
        item.day,
        `${item.attendance}%`,
        item.tardiness,
        item.absences
      ])

      pdf.autoTable({
        head: [['Día', 'Asistencia', 'Tardanzas', 'Inasistencias']],
        body: tableData,
        startY: currentY,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' }
        }
      })

      currentY = pdf.lastAutoTable.finalY + 10
    }

    if (data.performanceBySubject) {
      // Tabla de rendimiento académico
      pdf.setTextColor(...primaryColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RENDIMIENTO POR MATERIA', margin, currentY)
      
      currentY += 10

      const tableData = data.performanceBySubject.map(item => [
        item.subject,
        item.average.toFixed(1),
        item.average >= 14 ? 'Logro esperado' : item.average >= 11 ? 'En proceso' : 'En inicio'
      ])

      pdf.autoTable({
        head: [['Materia', 'Promedio', 'Nivel']],
        body: tableData,
        startY: currentY,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        didDrawCell: (data) => {
          // Colorear según el promedio
          if (data.section === 'body' && data.column.index === 1) {
            const value = parseFloat(data.cell.text[0])
            if (value >= 17) {
              data.cell.styles.textColor = [34, 197, 94]
            } else if (value >= 14) {
              data.cell.styles.textColor = [59, 130, 246]
            } else if (value >= 11) {
              data.cell.styles.textColor = [251, 191, 36]
            } else {
              data.cell.styles.textColor = [239, 68, 68]
            }
          }
        }
      })
    }

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
    }

    // Guardar PDF
    pdf.save(`reporte_${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`)
    return true
  } catch (error) {
    console.error('Error generando PDF:', error)
    throw error
  }
}

export const exportReportToExcel = async ({ title, data, dateRange }) => {
  try {
    const wb = XLSX.utils.book_new()
    
    // Hoja de resumen
    const summaryData = [
      ['REPORTE DE ' + title.toUpperCase()],
      [''],
      ['Período:', formatDateRange(dateRange)],
      ['Fecha de generación:', new Date().toLocaleDateString('es-PE')],
      [''],
      ['RESUMEN EJECUTIVO'],
      ['']
    ]

    // Agregar KPIs si existen
    if (data.totalStudents !== undefined) {
      summaryData.push(
        ['Indicador', 'Valor'],
        ['Total Estudiantes', data.totalStudents],
        ['Asistencia Promedio', `${data.averageAttendance || 0}%`],
        ['Promedio Académico', data.academicAverage || 0],
        ['Recaudación Mensual', `S/. ${(data.monthlyRevenue || 0).toLocaleString()}`]
      )
    }

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen')

    // Hojas de detalle según el tipo de datos
    if (data.attendanceByDay && data.attendanceByDay.length > 0) {
      const attendanceData = [
        ['Día', 'Asistencia %', 'Tardanzas', 'Inasistencias'],
        ...data.attendanceByDay.map(item => [
          item.day,
          item.attendance,
          item.tardiness,
          item.absences
        ])
      ]
      
      const wsAttendance = XLSX.utils.aoa_to_sheet(attendanceData)
      XLSX.utils.book_append_sheet(wb, wsAttendance, 'Asistencia')
    }

    if (data.performanceBySubject && data.performanceBySubject.length > 0) {
      const academicData = [
        ['Materia', 'Promedio', 'Nivel de Logro'],
        ...data.performanceBySubject.map(item => [
          item.subject,
          item.average,
          item.average >= 14 ? 'Logro esperado' : item.average >= 11 ? 'En proceso' : 'En inicio'
        ])
      ]
      
      const wsAcademic = XLSX.utils.aoa_to_sheet(academicData)
      XLSX.utils.book_append_sheet(wb, wsAcademic, 'Rendimiento Académico')
    }

    if (data.revenueByCategory && data.revenueByCategory.length > 0) {
      const financialData = [
        ['Categoría', 'Monto (S/.)', 'Porcentaje'],
        ...data.revenueByCategory.map(item => [
          item.category,
          item.amount,
          `${item.percentage}%`
        ])
      ]
      
      const wsFinancial = XLSX.utils.aoa_to_sheet(financialData)
      XLSX.utils.book_append_sheet(wb, wsFinancial, 'Ingresos')
    }

    if (data.studentDistribution && data.studentDistribution.length > 0) {
      const distributionData = [
        ['Grado', 'Cantidad', 'Porcentaje'],
        ...data.studentDistribution.map(item => [
          item.grade,
          item.count,
          `${item.percentage}%`
        ])
      ]
      
      const wsDistribution = XLSX.utils.aoa_to_sheet(distributionData)
      XLSX.utils.book_append_sheet(wb, wsDistribution, 'Distribución Estudiantes')
    }

    // Agregar datos en bruto si están disponibles
    if (data.monthlyTrends && data.monthlyTrends.datasets) {
      const trendsData = [
        ['Mes', ...data.monthlyTrends.datasets.map(d => d.label)],
        ...data.monthlyTrends.labels.map((label, index) => [
          label,
          ...data.monthlyTrends.datasets.map(d => d.data[index])
        ])
      ]
      
      const wsTrends = XLSX.utils.aoa_to_sheet(trendsData)
      XLSX.utils.book_append_sheet(wb, wsTrends, 'Tendencias')
    }

    // Guardar archivo
    XLSX.writeFile(wb, `reporte_${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`)
    return true
  } catch (error) {
    console.error('Error generando Excel:', error)
    throw error
  }
}

// Función auxiliar para formatear el rango de fechas
const formatDateRange = (dateRange) => {
  const today = new Date()
  
  switch (dateRange) {
    case 'week':
      return 'Última Semana'
    case 'month':
      return `${today.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}`
    case 'bimester':
      return 'Bimestre Actual'
    case 'year':
      return `Año ${today.getFullYear()}`
    default:
      return 'Período Personalizado'
  }
}