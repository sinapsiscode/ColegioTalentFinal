// Capa de abstracción de datos
// Este servicio maneja la lógica de usar datos mock o la API real
// basándose en la configuración

import { config, log } from '../config'
import DatabaseManager from '../data/DatabaseManager'
import { alumnosMock, usuariosMock, comunicadosMock, notasMock } from '../data/mockData'
import apiService from './apiService'
import { DATA_GENERATION } from '../utils/constants'

// Generar datos de asistencia para los últimos días configurados
const generateAsistencia = () => {
  const asistencia = []
  const today = new Date()
  
  alumnosMock.forEach(alumno => {
    for (let i = 0; i < DATA_GENERATION.ATTENDANCE_HISTORY_DAYS; i++) {
      const fecha = new Date(today)
      fecha.setDate(fecha.getDate() - i)
      
      // No generar para fines de semana
      if (fecha.getDay() === 0 || fecha.getDay() === 6) continue
      
      // 90% asistencia, 5% tardanza, 5% falta
      const random = Math.random()
      const asistio = random > 0.05
      const tarde = random > 0.95
      
      asistencia.push({
        id: `${alumno.id}-${fecha.toISOString().split('T')[0]}`,
        estudianteId: alumno.id,
        nombreEstudiante: alumno.nombreCompleto,
        fecha: fecha.toISOString().split('T')[0],
        horaEntrada: asistio ? (tarde ? '08:15:00' : '07:50:00') : null,
        horaSalida: asistio ? '14:00:00' : null,
        estado: asistio ? (tarde ? 'tardanza' : 'presente') : 'falta',
        observaciones: tarde ? 'Llegó 15 minutos tarde' : ''
      })
    }
  })
  
  return asistencia
}

// Generar datos de pagos
const generatePagos = () => {
  const pagos = []
  let pagoId = 1
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo']
  
  alumnosMock.forEach(alumno => {
    meses.forEach((mes, index) => {
      const vencimiento = new Date(2024, index, 28)
      const pagado = Math.random() > 0.2 // 80% pagados
      
      pagos.push({
        id: pagoId++,
        estudianteId: alumno.id,
        nombreEstudiante: alumno.nombreCompleto,
        padreEmail: alumno.email,
        concepto: `Pensión ${mes} 2024`,
        monto: 350.00,
        fechaVencimiento: vencimiento.toISOString().split('T')[0],
        fechaPago: pagado ? new Date(2024, index, 15).toISOString().split('T')[0] : null,
        estado: pagado ? 'aprobado' : 'pendiente_pago',
        metodoPago: pagado ? 'transferencia' : null,
        numeroOperacion: pagado ? `TR${String(pagoId).padStart(6, '0')}` : null,
        voucher: pagado ? `voucher_${alumno.nombre.toLowerCase()}_${mes.toLowerCase()}.jpg` : null,
        fechaSubida: pagado ? new Date(2024, index, 14).toISOString() : null,
        fechaAprobacion: pagado ? new Date(2024, index, 15).toISOString() : null,
        aprobadoPor: pagado ? 'admin@talentos.edu' : null,
        observaciones: pagado ? 'Pago verificado correctamente' : null
      })
    })
  })
  
  return pagos
}

// Generar mensajes de ejemplo
const generateMensajes = () => {
  return [
    {
      id: 1,
      conversacionId: 1,
      remitenteId: 'padre1@email.com',
      remitente: 'Carlos Rodríguez',
      destinatarioId: 'tutor1@email.com',
      destinatario: 'María García',
      mensaje: 'Buenos días profesora, quisiera saber cómo va Ana en matemáticas.',
      fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      leido: true,
      tipo: 'texto'
    },
    {
      id: 2,
      conversacionId: 1,
      remitenteId: 'tutor1@email.com',
      remitente: 'María García',
      destinatarioId: 'padre1@email.com',
      destinatario: 'Carlos Rodríguez',
      mensaje: 'Buenas tardes Sr. Rodríguez. Ana está progresando muy bien en matemáticas. Ha mejorado mucho en las últimas semanas.',
      fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      leido: true,
      tipo: 'texto'
    },
    {
      id: 3,
      conversacionId: 2,
      remitenteId: 'padre2@email.com',
      remitente: 'Miguel Martinez',
      destinatarioId: 'tutor2@email.com',
      destinatario: 'Roberto López',
      mensaje: 'Profesor, Sofia mencionó que hay una tarea de ciencias para mañana. ¿Podría confirmar?',
      fecha: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      leido: false,
      tipo: 'texto'
    }
  ]
}

// Generar cursos básicos
const generateCursos = () => {
  const grados = ['3ro Primaria', '4to Primaria', '5to Primaria', '6to Primaria']
  const materias = ['Matemáticas', 'Comunicación', 'Ciencias', 'Personal Social', 'Inglés']
  const cursos = []
  let cursoId = 1
  
  grados.forEach(grado => {
    materias.forEach(materia => {
      cursos.push({
        id: cursoId++,
        nombre: materia,
        grado: grado,
        profesor: cursoId % 2 === 0 ? 'María García' : 'Roberto López',
        aula: `Aula ${grado.charAt(0)}`,
        horario: 'Lun-Vie 8:00-14:00',
        estudiantes: alumnosMock.filter(a => a.grado === grado).length
      })
    })
  })
  
  return cursos
}

// Adaptador temporal inline para hacer funcionar la app
const mockData = {
  estudiantes: alumnosMock || [],
  usuarios: usuariosMock ? Object.entries(usuariosMock).map(([email, user], index) => ({
    id: index + 1,
    email,
    ...user,
    password_hash: 'hashed_123456',
    estado: 'activo'
  })) : [],
  comunicados: comunicadosMock || [],
  calificaciones: notasMock || [],
  asistencia: generateAsistencia(),
  pagos: generatePagos(),
  mensajes: generateMensajes(),
  cursos: generateCursos(),
  asignacionesTutor: [
    { id: 1, tutorId: 'tutor1@email.com', cursoId: 1, grado: '5to Primaria' },
    { id: 2, tutorId: 'tutor2@email.com', cursoId: 2, grado: '3ro Primaria' }
  ],
  relaciones: [
    { id: 1, parentEmail: 'padre1@email.com', studentId: 1, relationshipType: 'padre' },
    { id: 2, parentEmail: 'padre1@email.com', studentId: 2, relationshipType: 'padre' },
    { id: 3, parentEmail: 'padre2@email.com', studentId: 3, relationshipType: 'padre' }
  ]
}

class DataService {
  constructor() {
    this.useMockData = config.features.useMockData
    this.db = DatabaseManager()
    
    // Inicializar con datos mock si está habilitado
    if (this.useMockData) {
      this.initializeMockData()
    }
  }

  initializeMockData() {
    try {
      // Solo inicializar si no hay datos
      const existingUsers = this.db.select('users')
      if (!existingUsers || existingUsers.length === 0) {
        log.info('Inicializando datos mock...')
        
        // Usuarios
        if (mockData.usuarios) {
          // Convertir objeto de usuarios a array
          const usuarios = Object.values(mockData.usuarios).flat()
          usuarios.forEach(user => {
            this.db.insert('users', user)
          })
        }
        
        // Estudiantes
        if (mockData.estudiantes) {
          mockData.estudiantes.forEach(student => {
            this.db.insert('students', student)
          })
        }
        
        // Relaciones padre-estudiante
        // Crear relaciones basadas en los datos de estudiantes
        if (mockData.estudiantes) {
          // Crear relaciones automáticamente basadas en el email del padre
          const padres = new Map()
          mockData.estudiantes.forEach(student => {
            if (student.email) {
              if (!padres.has(student.email)) {
                padres.set(student.email, [])
              }
              padres.get(student.email).push(student.id)
            }
          })
          
          // Crear relaciones
          let relId = 1
          padres.forEach((studentIds, parentEmail) => {
            studentIds.forEach(studentId => {
              this.db.insert('parent_student_relationships', {
                id: relId++,
                parentEmail,
                studentId,
                relationshipType: 'padre',
                createdAt: new Date().toISOString()
              })
            })
          })
        }
        
        log.info('Datos mock inicializados correctamente')
      }
    } catch (error) {
      log.error('Error inicializando datos mock:', error)
    }
  }

  // ==================== USUARIOS ====================
  async getUsers() {
    if (this.useMockData) {
      return this.db.select('users')
    }
    return await apiService.users.getAll()
  }

  async getUserById(id) {
    if (this.useMockData) {
      const users = this.db.select('users', { id })
      return users[0] || null
    }
    return await apiService.users.getById(id)
  }

  async getUserByEmail(email) {
    if (this.useMockData) {
      // Usar directamente mockData sin base de datos intermedia
      const { usuariosMock } = await import('../data/mockData')
      const user = usuariosMock[email]
      
      if (user) {
        return {
          id: email === 'admin@talentos.edu' ? 3001 : 
              email === 'entrada@talentos.edu' ? 4001 :
              email.includes('tutor') ? 2001 : 1001,
          email,
          nombre: user.nombre,
          apellidos: '',
          rol: user.rol,
          telefono: user.telefono || '',
          direccion: '',
          avatar: user.avatar || '',
          password_hash: 'hashed_123456',
          estado: 'activo'
        }
      }
      return null
    }
    return await apiService.users.getByEmail(email)
  }

  async createUser(userData) {
    if (this.useMockData) {
      const newUser = {
        ...userData,
        id: Date.now(),
        fechaCreacion: new Date().toISOString(),
        activo: true
      }
      this.db.insert('users', newUser)
      return newUser
    }
    return await apiService.users.create(userData)
  }

  async updateUser(id, userData) {
    if (this.useMockData) {
      const updated = this.db.update('users', record => record.id === id, userData)
      return updated
    }
    return await apiService.users.update(id, userData)
  }

  async deleteUser(id) {
    if (this.useMockData) {
      this.db.delete('users', record => record.id === id)
      return { success: true }
    }
    return await apiService.users.delete(id)
  }

  // ==================== ESTUDIANTES ====================
  async getStudents() {
    if (this.useMockData) {
      return this.db.select('students')
    }
    return await apiService.students.getAll()
  }

  async getStudentById(id) {
    if (this.useMockData) {
      const students = this.db.select('students', { id })
      return students[0] || null
    }
    return await apiService.students.getById(id)
  }

  async getStudentsByParent(parentEmail) {
    if (this.useMockData) {
      // Obtener relaciones del padre
      const relationships = this.db.select('parent_student_relationships', { parentEmail })
      
      // Obtener estudiantes asociados
      const studentIds = relationships.map(rel => rel.studentId)
      const students = this.db.select('students')
      
      return students.filter(student => studentIds.includes(student.id))
    }
    return await apiService.students.getByParent(parentEmail)
  }

  async createStudent(studentData) {
    if (this.useMockData) {
      const newStudent = {
        ...studentData,
        id: Date.now(),
        fechaRegistro: new Date().toISOString()
      }
      this.db.insert('students', newStudent)
      return newStudent
    }
    return await apiService.students.create(studentData)
  }

  async updateStudent(id, studentData) {
    if (this.useMockData) {
      const updated = this.db.update('students', id, studentData)
      return updated
    }
    return await apiService.students.update(id, studentData)
  }

  async deleteStudent(id) {
    if (this.useMockData) {
      // También eliminar relaciones
      const relationships = this.db.select('parent_student_relationships', { studentId: id })
      relationships.forEach(rel => {
        this.db.delete('parent_student_relationships', rel.id)
      })
      
      this.db.delete('students', id)
      return { success: true }
    }
    return await apiService.students.delete(id)
  }

  // ==================== COMUNICADOS ====================
  async getCommuniques() {
    if (this.useMockData) {
      return mockData.comunicados || []
    }
    return await apiService.communiques.getAll()
  }

  async getCommuniqueById(id) {
    if (this.useMockData) {
      const communiques = mockData.comunicados || []
      return communiques.find(c => c.id === id) || null
    }
    return await apiService.communiques.getById(id)
  }

  async createCommunique(data) {
    if (this.useMockData) {
      const newCommunique = {
        ...data,
        id: Date.now(),
        fecha: new Date().toISOString(),
        vistas: 0
      }
      mockData.comunicados = mockData.comunicados || []
      mockData.comunicados.push(newCommunique)
      return newCommunique
    }
    return await apiService.communiques.create(data)
  }

  // ==================== ASISTENCIA ====================
  async getAttendance(filters = {}) {
    if (this.useMockData) {
      let attendance = mockData.asistencia || []
      
      // Aplicar filtros
      if (filters.studentId) {
        attendance = attendance.filter(a => a.estudianteId === filters.studentId)
      }
      if (filters.date) {
        attendance = attendance.filter(a => a.fecha === filters.date)
      }
      if (filters.dateFrom && filters.dateTo) {
        attendance = attendance.filter(a => 
          a.fecha >= filters.dateFrom && a.fecha <= filters.dateTo
        )
      }
      
      return attendance
    }
    return await apiService.attendance.getAll(filters)
  }

  async recordAttendance(data) {
    if (this.useMockData) {
      const newRecord = {
        ...data,
        id: Date.now(),
        fechaRegistro: new Date().toISOString()
      }
      mockData.asistencia = mockData.asistencia || []
      mockData.asistencia.push(newRecord)
      return newRecord
    }
    return await apiService.attendance.record(data)
  }

  // ==================== PAGOS ====================
  async getPayments(filters = {}) {
    if (this.useMockData) {
      let payments = mockData.pagos || []
      
      // Aplicar filtros
      if (filters.parentEmail) {
        payments = payments.filter(p => p.padreEmail === filters.parentEmail)
      }
      if (filters.status) {
        payments = payments.filter(p => p.estado === filters.status)
      }
      if (filters.studentId) {
        payments = payments.filter(p => p.estudianteId === filters.studentId)
      }
      
      return payments
    }
    return await apiService.payments.getAll(filters)
  }

  async createPayment(paymentData) {
    if (this.useMockData) {
      const newPayment = {
        ...paymentData,
        id: Date.now(),
        fechaSubida: new Date().toISOString(),
        estado: 'pendiente'
      }
      mockData.pagos = mockData.pagos || []
      mockData.pagos.push(newPayment)
      return newPayment
    }
    return await apiService.payments.create(paymentData)
  }

  async approvePayment(id, approverEmail, observations) {
    if (this.useMockData) {
      const payments = mockData.pagos || []
      const payment = payments.find(p => p.id === id)
      
      if (payment) {
        payment.estado = 'aprobado'
        payment.fechaAprobacion = new Date().toISOString()
        payment.aprobadoPor = approverEmail
        payment.observaciones = observations
      }
      
      return payment
    }
    return await apiService.payments.approve(id, { approverEmail, observations })
  }

  async rejectPayment(id, approverEmail, observations) {
    if (this.useMockData) {
      const payments = mockData.pagos || []
      const payment = payments.find(p => p.id === id)
      
      if (payment) {
        payment.estado = 'rechazado'
        payment.fechaAprobacion = new Date().toISOString()
        payment.aprobadoPor = approverEmail
        payment.observaciones = observations
      }
      
      return payment
    }
    return await apiService.payments.reject(id, { approverEmail, observations })
  }

  // ==================== CALIFICACIONES ====================
  async getGrades(filters = {}) {
    if (this.useMockData) {
      let grades = mockData.calificaciones || []
      
      // Aplicar filtros
      if (filters.studentId) {
        grades = grades.filter(g => g.estudianteId === filters.studentId)
      }
      if (filters.teacherId) {
        grades = grades.filter(g => g.profesorId === filters.teacherId)
      }
      if (filters.subject) {
        grades = grades.filter(g => g.materia === filters.subject)
      }
      
      return grades
    }
    return await apiService.grades.getAll(filters)
  }

  async createGrade(gradeData) {
    if (this.useMockData) {
      const newGrade = {
        ...gradeData,
        id: Date.now(),
        fechaRegistro: new Date().toISOString()
      }
      mockData.calificaciones = mockData.calificaciones || []
      mockData.calificaciones.push(newGrade)
      return newGrade
    }
    return await apiService.grades.create(gradeData)
  }

  async updateGrade(id, gradeData) {
    if (this.useMockData) {
      const grades = mockData.calificaciones || []
      const index = grades.findIndex(g => g.id === id)
      
      if (index !== -1) {
        grades[index] = { ...grades[index], ...gradeData }
        return grades[index]
      }
      
      return null
    }
    return await apiService.grades.update(id, gradeData)
  }

  // ==================== MENSAJES ====================
  async getMessages(userId) {
    if (this.useMockData) {
      const messages = mockData.mensajes || []
      return messages.filter(m => 
        m.remitenteId === userId || m.destinatarioId === userId
      )
    }
    return await apiService.messages.getByUser(userId)
  }

  async sendMessage(messageData) {
    if (this.useMockData) {
      const newMessage = {
        ...messageData,
        id: Date.now(),
        fecha: new Date().toISOString(),
        leido: false
      }
      mockData.mensajes = mockData.mensajes || []
      mockData.mensajes.push(newMessage)
      return newMessage
    }
    return await apiService.messages.send(messageData)
  }

  async markMessageAsRead(id) {
    if (this.useMockData) {
      const messages = mockData.mensajes || []
      const message = messages.find(m => m.id === id)
      
      if (message) {
        message.leido = true
        message.fechaLectura = new Date().toISOString()
      }
      
      return message
    }
    return await apiService.messages.markAsRead(id)
  }

  // ==================== CURSOS ====================
  async getCourses() {
    if (this.useMockData) {
      return mockData.cursos || []
    }
    return await apiService.courses.getAll()
  }

  async getCourseById(id) {
    if (this.useMockData) {
      const courses = mockData.cursos || []
      return courses.find(c => c.id === id) || null
    }
    return await apiService.courses.getById(id)
  }

  async createCourse(courseData) {
    if (this.useMockData) {
      const newCourse = {
        ...courseData,
        id: Date.now(),
        fechaCreacion: new Date().toISOString()
      }
      mockData.cursos = mockData.cursos || []
      mockData.cursos.push(newCourse)
      return newCourse
    }
    return await apiService.courses.create(courseData)
  }

  // ==================== ASIGNACIONES DE TUTOR ====================
  async getTeacherAssignments(teacherId) {
    if (this.useMockData) {
      return mockData.asignacionesTutor?.filter(a => a.tutorId === teacherId) || []
    }
    return await apiService.assignments.getByTeacher(teacherId)
  }

  async createTeacherAssignment(assignmentData) {
    if (this.useMockData) {
      const newAssignment = {
        ...assignmentData,
        id: Date.now(),
        fechaAsignacion: new Date().toISOString()
      }
      mockData.asignacionesTutor = mockData.asignacionesTutor || []
      mockData.asignacionesTutor.push(newAssignment)
      return newAssignment
    }
    return await apiService.assignments.create(assignmentData)
  }

  // ==================== UTILIDADES ====================
  async simulateDelay() {
    if (this.useMockData && config.dev.mockDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, config.dev.mockDelay))
    }
  }

  // Método para cambiar entre mock y API real dinámicamente
  setUseMockData(useMock) {
    this.useMockData = useMock
    log.info(`Cambiado a modo: ${useMock ? 'MOCK' : 'API REAL'}`)
  }
}

// Exportar instancia única
const dataService = new DataService()
export default dataService