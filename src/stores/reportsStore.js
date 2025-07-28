import { create } from 'zustand'
import { DatabaseQueries } from '../data/databaseSchema'

const useReportsStore = create((set, get) => ({
  reportData: null,
  loading: false,
  filters: {
    reportType: 'general',
    dateRange: 'month',
    grade: 'all',
    section: 'all'
  },

  loadReportData: async (reportType, dateRange) => {
    set({ loading: true })
    
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 800))
      
      let data = {}
      
      switch (reportType) {
        case 'general':
          data = get().generateGeneralReport(dateRange)
          break
        case 'attendance':
          data = get().generateAttendanceReport(dateRange)
          break
        case 'academic':
          data = get().generateAcademicReport(dateRange)
          break
        case 'financial':
          data = get().generateFinancialReport(dateRange)
          break
        case 'students':
          data = get().generateStudentReport(dateRange)
          break
        default:
          data = get().generateGeneralReport(dateRange)
      }
      
      set({ reportData: data, loading: false })
    } catch (error) {
      console.error('Error loading report data:', error)
      set({ loading: false })
    }
  },

  generateGeneralReport: (dateRange) => {
    // Obtener datos de la base de datos
    const students = DatabaseQueries.getAllStudents()
    const totalStudents = students.length
    
    // Datos simulados basados en el período
    const multiplier = dateRange === 'week' ? 0.25 : dateRange === 'month' ? 1 : dateRange === 'year' ? 12 : 3
    
    return {
      // KPIs principales
      totalStudents: totalStudents,
      newStudentsThisMonth: Math.floor(5 * multiplier),
      averageAttendance: 92.5,
      academicAverage: 15.3,
      academicTrend: 2.5,
      monthlyRevenue: Math.floor(45000 * multiplier),
      pendingPayments: Math.floor(12 * multiplier),
      
      // Tendencia de asistencia (últimos 7 días/meses)
      attendanceTrend: [
        { label: 'Lun', value: 94 },
        { label: 'Mar', value: 92 },
        { label: 'Mié', value: 93 },
        { label: 'Jue', value: 91 },
        { label: 'Vie', value: 89 },
        { label: 'Sáb', value: 0 },
        { label: 'Dom', value: 0 }
      ],
      
      // Distribución por grados
      studentDistribution: [
        { grade: '1°', count: 45, percentage: 12 },
        { grade: '2°', count: 48, percentage: 13 },
        { grade: '3°', count: 52, percentage: 14 },
        { grade: '4°', count: 50, percentage: 13 },
        { grade: '5°', count: 55, percentage: 15 },
        { grade: '6°', count: 47, percentage: 13 },
        { grade: 'Secundaria', count: 78, percentage: 20 }
      ],
      
      // Tendencias mensuales
      monthlyTrends: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Asistencia %',
            data: [91, 92, 93, 92, 94, 93],
            color: 'blue'
          },
          {
            label: 'Promedio Académico',
            data: [14.8, 15.0, 15.1, 15.2, 15.3, 15.3],
            color: 'green'
          },
          {
            label: 'Pagos (miles S/.)',
            data: [42, 44, 45, 43, 46, 45],
            color: 'purple'
          }
        ]
      }
    }
  },

  generateAttendanceReport: (dateRange) => {
    const baseAttendance = 92
    const multiplier = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365
    
    return {
      attendanceRate: baseAttendance + Math.random() * 5,
      totalTardiness: Math.floor(15 * (multiplier / 30)),
      totalAbsences: Math.floor(25 * (multiplier / 30)),
      attendanceTrend: 1.5,
      
      // Asistencia por día
      attendanceByDay: [
        { day: 'Lunes', attendance: 94, tardiness: 3, absences: 3 },
        { day: 'Martes', attendance: 93, tardiness: 4, absences: 3 },
        { day: 'Miércoles', attendance: 92, tardiness: 3, absences: 5 },
        { day: 'Jueves', attendance: 91, tardiness: 5, absences: 4 },
        { day: 'Viernes', attendance: 89, tardiness: 6, absences: 5 }
      ],
      
      // Asistencia por grado
      attendanceByGrade: [
        { grade: '1° Primaria', rate: 93.5 },
        { grade: '2° Primaria', rate: 92.8 },
        { grade: '3° Primaria', rate: 94.2 },
        { grade: '4° Primaria', rate: 91.5 },
        { grade: '5° Primaria', rate: 92.0 },
        { grade: '6° Primaria', rate: 90.8 },
        { grade: 'Secundaria', rate: 88.5 }
      ],
      
      // Estudiantes con mayor inasistencia
      studentsWithMostAbsences: [
        { name: 'Juan Pérez', grade: '5° B', absences: 8, percentage: 16 },
        { name: 'María García', grade: '3° A', absences: 7, percentage: 14 },
        { name: 'Carlos López', grade: '6° C', absences: 6, percentage: 12 },
        { name: 'Ana Torres', grade: '4° B', absences: 5, percentage: 10 },
        { name: 'Luis Ramírez', grade: '2° A', absences: 5, percentage: 10 }
      ]
    }
  },

  generateAcademicReport: (dateRange) => {
    return {
      generalAverage: 15.3,
      approvalRate: 85,
      inProgressCount: 45,
      needSupportCount: 12,
      
      // Rendimiento por materia
      performanceBySubject: [
        { subject: 'Matemática', average: 14.8 },
        { subject: 'Comunicación', average: 15.5 },
        { subject: 'Ciencias', average: 16.2 },
        { subject: 'Historia', average: 15.8 },
        { subject: 'Inglés', average: 14.2 },
        { subject: 'Arte', average: 17.5 },
        { subject: 'Ed. Física', average: 18.2 }
      ],
      
      // Distribución de calificaciones
      gradeDistribution: [
        { range: 'AD (18-20)', count: 45, percentage: 15 },
        { range: 'A (14-17)', count: 120, percentage: 40 },
        { range: 'B (11-13)', count: 90, percentage: 30 },
        { range: 'C (0-10)', count: 45, percentage: 15 }
      ],
      
      // Evolución académica
      academicEvolution: {
        labels: ['Bim 1', 'Bim 2', 'Bim 3', 'Bim 4'],
        datasets: [
          {
            label: 'Promedio General',
            data: [14.5, 14.8, 15.1, 15.3],
            color: 'blue'
          },
          {
            label: 'Aprobados %',
            data: [78, 80, 83, 85],
            color: 'green'
          },
          {
            label: 'Desaprobados %',
            data: [22, 20, 17, 15],
            color: 'red'
          }
        ]
      }
    }
  },

  generateFinancialReport: (dateRange) => {
    const baseRevenue = 45000
    const multiplier = dateRange === 'week' ? 0.25 : dateRange === 'month' ? 1 : 12
    
    return {
      totalRevenue: Math.floor(baseRevenue * multiplier),
      pendingAmount: Math.floor(8500 * multiplier),
      delinquencyRate: 12.5,
      collectionRate: 87.5,
      
      // Ingresos por concepto
      revenueByCategory: [
        { category: 'Pensiones', amount: 35000, percentage: 78 },
        { category: 'Matrícula', amount: 5000, percentage: 11 },
        { category: 'Actividades', amount: 3000, percentage: 7 },
        { category: 'Otros', amount: 2000, percentage: 4 }
      ],
      
      // Estado de pagos por grado
      paymentStatusByGrade: [
        { grade: '1°', paid: 42, pending: 3, overdue: 0 },
        { grade: '2°', paid: 44, pending: 4, overdue: 0 },
        { grade: '3°', paid: 48, pending: 3, overdue: 1 },
        { grade: '4°', paid: 45, pending: 4, overdue: 1 },
        { grade: '5°', paid: 50, pending: 3, overdue: 2 },
        { grade: '6°', paid: 43, pending: 2, overdue: 2 }
      ],
      
      // Flujo de caja mensual
      monthlyCashFlow: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Ingresos Reales',
            data: [42000, 44000, 45000, 43000, 46000, 45000],
            color: 'green'
          },
          {
            label: 'Ingresos Proyectados',
            data: [45000, 45000, 45000, 45000, 45000, 45000],
            color: 'blue'
          }
        ]
      }
    }
  },

  generateStudentReport: (dateRange) => {
    const students = DatabaseQueries.getAllStudents()
    const totalStudents = students.length
    
    // Calcular distribución por género
    const maleCount = students.filter(s => s.genero === 'M').length
    const femaleCount = students.filter(s => s.genero === 'F').length
    
    return {
      totalStudents: totalStudents,
      newStudents: Math.floor(5 + Math.random() * 10),
      retentionRate: 95.5,
      
      // Distribución por género
      genderDistribution: [
        { label: 'Masculino', value: maleCount, percentage: (maleCount / totalStudents * 100).toFixed(1) },
        { label: 'Femenino', value: femaleCount, percentage: (femaleCount / totalStudents * 100).toFixed(1) }
      ],
      
      // Estudiantes por sección
      studentsPerSection: [
        { section: '1° A', count: 25 },
        { section: '1° B', count: 24 },
        { section: '2° A', count: 26 },
        { section: '2° B', count: 24 },
        { section: '3° A', count: 25 },
        { section: '3° B', count: 27 },
        { section: '4° A', count: 25 },
        { section: '4° B', count: 25 },
        { section: '5° A', count: 28 },
        { section: '5° B', count: 27 },
        { section: '6° A', count: 24 },
        { section: '6° B', count: 23 }
      ],
      
      // Crecimiento de matrícula
      enrollmentGrowth: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Total Estudiantes',
            data: [280, 285, 290, 288, 295, 300],
            color: 'blue'
          },
          {
            label: 'Nuevos Ingresos',
            data: [5, 8, 6, 2, 10, 8],
            color: 'green'
          },
          {
            label: 'Retiros',
            data: [0, 3, 1, 4, 3, 3],
            color: 'red'
          }
        ]
      }
    }
  },

  updateFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } })
  },

  generateReport: async (reportType, dateRange) => {
    // Esta función sería llamada para exportar
    set({ loading: true })
    
    try {
      let data = {}
      
      switch (reportType) {
        case 'attendance':
          data = get().generateAttendanceReport(dateRange)
          break
        case 'academic':
          data = get().generateAcademicReport(dateRange)
          break
        case 'financial':
          data = get().generateFinancialReport(dateRange)
          break
        case 'students':
          data = get().generateStudentReport(dateRange)
          break
        default:
          data = get().generateGeneralReport(dateRange)
      }
      
      set({ loading: false })
      return data
    } catch (error) {
      console.error('Error generating report:', error)
      set({ loading: false })
      throw error
    }
  }
}))

export default useReportsStore