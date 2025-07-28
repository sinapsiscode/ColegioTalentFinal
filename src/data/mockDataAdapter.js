// Adaptador para convertir los datos mock existentes a la estructura esperada por el backend
// Este archivo será eliminado cuando el backend esté listo

import { alumnosMock, usuariosMock, comunicadosMock, notasMock } from './mockData'

// Convertir estructura de usuarios (objeto con emails como keys) a array plano
const convertUsuarios = () => {
  const usuarios = []
  let userId = 1
  
  if (usuariosMock) {
    Object.entries(usuariosMock).forEach(([email, usuario]) => {
      usuarios.push({
        id: userId++,
        email: email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        telefono: usuario.telefono || '',
        avatar: usuario.avatar || '',
        hijos: usuario.hijos || [],
        // Agregar campos que esperará el backend
        password_hash: 'hashed_123456', // Mock password
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estado: 'activo',
        isActive: true,
        permissions: getPermissionsByRole(usuario.rol)
      })
    })
  }
  
  return usuarios
}

// Convertir alumnos a estructura de estudiantes del backend
const convertEstudiantes = () => {
  return alumnosMock.map(alumno => ({
    id: alumno.id,
    firstName: alumno.nombre,
    lastName: alumno.apellidos,
    fullName: alumno.nombreCompleto,
    grade: alumno.grado,
    section: alumno.seccion,
    qrCode: alumno.codigoQR || alumno.codigo_qr,
    // Información del padre/tutor
    parentName: alumno.padre,
    parentPhone: alumno.telefono,
    parentEmail: alumno.email,
    // Datos adicionales
    photo: alumno.foto,
    birthDate: alumno.fechaNacimiento,
    address: alumno.direccion,
    // Campos del backend
    enrollmentDate: new Date().toISOString(),
    status: 'active',
    academicYear: new Date().getFullYear()
  }))
}

// Generar relaciones padre-estudiante basadas en email
const generateRelaciones = () => {
  const relaciones = []
  let relId = 1
  
  // Agrupar estudiantes por email del padre
  const estudiantesPorPadre = {}
  alumnosMock.forEach(alumno => {
    if (alumno.email) {
      if (!estudiantesPorPadre[alumno.email]) {
        estudiantesPorPadre[alumno.email] = []
      }
      estudiantesPorPadre[alumno.email].push(alumno.id)
    }
  })
  
  // Crear relaciones
  Object.entries(estudiantesPorPadre).forEach(([parentEmail, studentIds]) => {
    // Buscar el usuario padre correspondiente
    const padreUser = convertUsuarios().find(u => u.email === parentEmail && u.rol === 'padre')
    
    if (padreUser) {
      studentIds.forEach(studentId => {
        relaciones.push({
          id: relId++,
          parentId: padreUser.id,
          parentEmail: parentEmail,
          studentId: studentId,
          relationshipType: 'padre',
          isPrimary: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })
    }
  })
  
  return relaciones
}

// Generar datos de asistencia mock
const generateAsistencia = () => {
  const asistencia = []
  const today = new Date()
  
  // Generar asistencia para los últimos 30 días
  alumnosMock.forEach(alumno => {
    for (let i = 0; i < 30; i++) {
      const fecha = new Date(today)
      fecha.setDate(fecha.getDate() - i)
      
      // No generar asistencia para fines de semana
      if (fecha.getDay() === 0 || fecha.getDay() === 6) continue
      
      // 90% de probabilidad de asistencia
      const asistio = Math.random() > 0.1
      
      asistencia.push({
        id: `${alumno.id}-${fecha.toISOString().split('T')[0]}`,
        studentId: alumno.id,
        date: fecha.toISOString().split('T')[0],
        checkIn: asistio ? '08:00:00' : null,
        checkOut: asistio ? '14:00:00' : null,
        status: asistio ? 'present' : 'absent',
        createdAt: fecha.toISOString(),
        scannedBy: asistio ? 'entrada@talentos.edu' : null
      })
    }
  })
  
  return asistencia
}

// Generar datos de pagos mock
const generatePagos = () => {
  const pagos = []
  let pagoId = 1
  
  const conceptos = ['Pensión', 'Matrícula', 'Material Educativo']
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo']
  
  alumnosMock.forEach(alumno => {
    meses.forEach((mes, index) => {
      const vencimiento = new Date(2024, index, 28)
      const pagado = Math.random() > 0.2 // 80% pagados
      
      pagos.push({
        id: pagoId++,
        studentId: alumno.id,
        studentName: alumno.nombreCompleto,
        parentEmail: alumno.email,
        concept: `Pensión ${mes} 2024`,
        amount: 350.00,
        dueDate: vencimiento.toISOString().split('T')[0],
        paymentDate: pagado ? new Date(2024, index, 15).toISOString().split('T')[0] : null,
        status: pagado ? 'paid' : 'pending',
        paymentMethod: pagado ? 'transferencia' : null,
        transactionNumber: pagado ? `TR${String(pagoId).padStart(6, '0')}` : null,
        voucherUrl: pagado ? `/vouchers/voucher_${pagoId}.jpg` : null,
        approvedBy: pagado ? 'admin@talentos.edu' : null,
        approvedAt: pagado ? new Date(2024, index, 16).toISOString() : null,
        createdAt: new Date(2024, index, 1).toISOString()
      })
    })
  })
  
  return pagos
}

// Generar mensajes mock
const generateMensajes = () => {
  const mensajes = []
  let mensajeId = 1
  
  const usuarios = convertUsuarios()
  const padres = usuarios.filter(u => u.rol === 'padre')
  const tutores = usuarios.filter(u => u.rol === 'tutor')
  
  // Generar algunos mensajes entre padres y tutores
  padres.forEach(padre => {
    tutores.forEach(tutor => {
      if (Math.random() > 0.7) { // 30% de probabilidad
        mensajes.push({
          id: mensajeId++,
          senderId: padre.id,
          senderName: padre.nombre,
          senderRole: padre.rol,
          recipientId: tutor.id,
          recipientName: tutor.nombre,
          recipientRole: tutor.rol,
          subject: 'Consulta sobre tareas',
          message: 'Buenos días profesor, quisiera consultar sobre las tareas pendientes.',
          read: true,
          sentAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          readAt: new Date().toISOString(),
          attachments: []
        })
      }
    })
  })
  
  return mensajes
}

// Generar cursos mock
const generateCursos = () => {
  const grados = ['1ro Primaria', '2do Primaria', '3ro Primaria', '4to Primaria', '5to Primaria', '6to Primaria']
  const materias = ['Matemáticas', 'Comunicación', 'Ciencias', 'Personal Social', 'Inglés', 'Arte', 'Educación Física']
  const cursos = []
  let cursoId = 1
  
  grados.forEach(grado => {
    materias.forEach(materia => {
      cursos.push({
        id: cursoId++,
        name: materia,
        grade: grado,
        section: 'A',
        teacher: null, // Se asignará con las asignaciones
        schedule: generateSchedule(materia),
        classroom: `Aula ${grado.split(' ')[0]}`,
        academicYear: 2024,
        status: 'active',
        createdAt: new Date().toISOString()
      })
    })
  })
  
  return cursos
}

// Helper para generar horarios
const generateSchedule = (materia) => {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  const horas = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00']
  const schedule = []
  
  // 3 sesiones por semana
  for (let i = 0; i < 3; i++) {
    const dia = dias[Math.floor(Math.random() * dias.length)]
    const hora = horas[Math.floor(Math.random() * horas.length)]
    
    schedule.push({
      day: dia,
      startTime: hora,
      endTime: `${parseInt(hora.split(':')[0]) + 1}:00`,
      duration: 60
    })
  }
  
  return schedule
}

// Helper para obtener permisos por rol
const getPermissionsByRole = (rol) => {
  const permissions = {
    admin: ['*'], // Todos los permisos
    padre: [
      'view_own_children',
      'view_attendance',
      'view_grades',
      'view_communications',
      'send_messages',
      'upload_payment_vouchers'
    ],
    tutor: [
      'view_assigned_students',
      'manage_grades',
      'take_attendance',
      'send_communications',
      'send_messages'
    ],
    entrada: [
      'scan_qr',
      'register_attendance',
      'view_attendance_reports'
    ]
  }
  
  return permissions[rol] || []
}

// Exportar estructura completa que espera el backend
export default {
  // Datos principales
  usuarios: convertUsuarios(),
  estudiantes: convertEstudiantes(),
  relaciones: generateRelaciones(),
  comunicados: comunicadosMock.map(c => ({
    ...c,
    authorId: 1,
    authorName: 'Admin',
    authorRole: 'admin',
    targetAudience: c.tipo,
    attachments: [],
    readBy: [],
    createdAt: c.fecha,
    updatedAt: c.fecha
  })),
  calificaciones: notasMock.map(n => ({
    ...n,
    teacherId: 1,
    teacherName: 'Profesor Demo',
    period: 'Primer Bimestre',
    academicYear: 2024,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })),
  
  // Datos generados
  asistencia: generateAsistencia(),
  pagos: generatePagos(),
  mensajes: generateMensajes(),
  cursos: generateCursos(),
  
  // Asignaciones tutor (vacío por ahora, se puede generar si es necesario)
  asignacionesTutor: [],
  
  // Metadata
  _metadata: {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    isTestData: true,
    notice: 'Este es un adaptador temporal. Será removido cuando el backend esté listo.'
  }
}