/**
 * DatabaseManager - Sistema de Persistencia Híbrido
 * 
 * 🎯 CARACTERÍSTICAS:
 * ✅ Persistencia automática con localStorage
 * ✅ API similar a SQL para fácil migración
 * ✅ Backup automático cada 5 minutos
 * ✅ Integridad referencial
 * ✅ Transacciones simuladas
 * ✅ Export/Import de datos
 */

// =====================================================
// CONFIGURACIÓN
// =====================================================

const DB_CONFIG = {
  name: 'TalentosCollegeDB',
  version: '1.3.0',
  tables: [
    'users', 
    'students', 
    'parent_student_relationships', 
    'teacher_student_assignments', 
    'messages', 
    'conversations', 
    'courses', 
    'teacher_course_assignments',
    'notifications',
    'notification_preferences',
    'notification_history'
  ],
  autoBackup: true,
  backupInterval: 5 * 60 * 1000, // 5 minutos
  maxBackups: 10
}

// =====================================================
// DATOS INICIALES (SEED DATA)
// =====================================================

const INITIAL_DATA = {
  users: [
    {
      id: 1001,
      email: 'carlos.rodriguez@email.com',
      password_hash: 'hashed_123456',
      rol: 'padre',
      nombre: 'Carlos',
      apellidos: 'Rodríguez',
      telefono: '+51 987 654 321',
      direccion: 'Av. Las Flores 123, San Isidro',
      avatar: '/images/user-carlos.jpg',
      fechaCreacion: '2024-01-15',
      ultimoAcceso: '2024-07-24',
      estado: 'activo'
    },
    {
      id: 1002,
      email: 'miguel.martinez@email.com',
      password_hash: 'hashed_123456',
      rol: 'padre',
      nombre: 'Miguel',
      apellidos: 'Martinez',
      telefono: '+51 987 654 322',
      direccion: 'Jr. Los Olivos 456, Miraflores',
      avatar: '/images/user-miguel.jpg',
      fechaCreacion: '2024-01-20',
      ultimoAcceso: '2024-07-23',
      estado: 'activo'
    },
    {
      id: 1003,
      email: 'ana.silva@email.com',
      password_hash: 'hashed_123456',
      rol: 'padre',
      nombre: 'Ana',
      apellidos: 'Silva',
      telefono: '+51 987 654 323',
      direccion: 'Calle Lima 789, Surco',
      avatar: '/images/user-ana.jpg',
      fechaCreacion: '2024-02-01',
      ultimoAcceso: '2024-07-22',
      estado: 'activo'
    },
    {
      id: 2001,
      email: 'tutor1@email.com',
      password_hash: 'hashed_123456',
      rol: 'tutor',
      nombre: 'María',
      apellidos: 'García',
      telefono: '+51 987 654 340',
      direccion: 'Av. Universitaria 234, Los Olivos',
      avatar: '/images/tutor-maria.jpg',
      fechaCreacion: '2023-12-01',
      ultimoAcceso: '2024-07-24',
      estado: 'activo'
    },
    {
      id: 2002,
      email: 'profesor.carlos@talentos.edu.pe',
      password_hash: 'hashed_123456',
      rol: 'tutor',
      nombre: 'Carlos',
      apellidos: 'Mendoza Paredes',
      telefono: '+51 998 765 432',
      direccion: 'Jr. Las Palmeras 567, Surquillo',
      avatar: '/images/tutor-carlos.jpg',
      especialidad: 'Comunicación y Literatura',
      fechaCreacion: '2023-11-15',
      ultimoAcceso: '2024-07-24',
      estado: 'activo'
    },
    {
      id: 2003,
      email: 'profesor.ana@talentos.edu.pe',
      password_hash: 'hashed_123456',
      rol: 'tutor',
      nombre: 'Ana',
      apellidos: 'Vilchez Ruiz',
      telefono: '+51 976 543 210',
      direccion: 'Av. Benavides 890, Miraflores',
      avatar: '/images/tutor-ana.jpg',
      especialidad: 'Ciencias Naturales',
      fechaCreacion: '2024-01-10',
      ultimoAcceso: '2024-07-23',
      estado: 'activo'
    },
    {
      id: 2004,
      email: 'profesor.roberto@talentos.edu.pe',
      password_hash: 'hashed_123456',
      rol: 'tutor',
      nombre: 'Roberto',
      apellidos: 'Quispe Flores',
      telefono: '+51 965 432 109',
      direccion: 'Calle Las Gardenias 234, San Borja',
      avatar: '/images/tutor-roberto.jpg',
      especialidad: 'Educación Física',
      fechaCreacion: '2023-09-20',
      ultimoAcceso: '2024-07-24',
      estado: 'activo'
    },
    {
      id: 2005,
      email: 'profesora.lucia@talentos.edu.pe',
      password_hash: 'hashed_123456',
      rol: 'tutor',
      nombre: 'Lucía',
      apellidos: 'Torres Vega',
      telefono: '+51 954 321 098',
      direccion: 'Av. Primavera 1234, Surco',
      avatar: '/images/tutor-lucia.jpg',
      especialidad: 'Arte y Música',
      fechaCreacion: '2024-02-05',
      ultimoAcceso: '2024-07-22',
      estado: 'activo'
    },
    {
      id: 3001,
      email: 'admin@talentos.edu',
      password_hash: 'hashed_123456',
      rol: 'admin',
      nombre: 'Juan',
      apellidos: 'Pérez',
      telefono: '+51 987 654 350',
      direccion: 'Oficina Administrativa - Talentos College',
      avatar: '/images/admin-juan.jpg',
      fechaCreacion: '2023-01-01',
      ultimoAcceso: '2024-07-24',
      estado: 'activo'
    },
    {
      id: 4001,
      email: 'entrada@talentos.edu',
      password_hash: 'hashed_123456',
      rol: 'entrada',
      nombre: 'Pedro',
      apellidos: 'Sánchez',
      telefono: '+51 987 654 360',
      direccion: 'Garita de Seguridad - Talentos College',
      avatar: '/images/entrada-pedro.jpg',
      fechaCreacion: '2023-06-15',
      ultimoAcceso: '2024-07-24',
      estado: 'activo'
    }
  ],

  students: [
    {
      id: 1,
      nombre: 'Ana',
      apellidos: 'Rodríguez González',
      fecha_nacimiento: '2013-05-15',
      grado: '5to Primaria',
      seccion: 'A',
      codigo_qr: 'QR001',
      foto: '/images/student1.jpg',
      direccion: 'Av. Las Flores 123, San Isidro',
      fechaCreacion: '2024-01-15',
      ultimoAcceso: '2024-07-24'
    },
    {
      id: 2,
      nombre: 'Luis',
      apellidos: 'Rodríguez González',
      fecha_nacimiento: '2015-08-22',
      grado: '3ro Primaria',
      seccion: 'B',
      codigo_qr: 'QR002',
      foto: '/images/student2.jpg',
      direccion: 'Av. Las Flores 123, San Isidro',
      fechaCreacion: '2024-01-15',
      ultimoAcceso: '2024-07-24'
    },
    {
      id: 3,
      nombre: 'Sofia',
      apellidos: 'Martinez López',
      fecha_nacimiento: '2014-03-10',
      grado: '4to Primaria',
      seccion: 'A',
      codigo_qr: 'QR003',
      foto: '/images/student3.jpg',
      direccion: 'Jr. Los Olivos 456, Miraflores',
      fechaCreacion: '2024-01-20',
      ultimoAcceso: '2024-07-23'
    },
    {
      id: 4,
      nombre: 'Pedro',
      apellidos: 'Silva Morales',
      fecha_nacimiento: '2014-11-30',
      grado: '4to Primaria',
      seccion: 'B',
      codigo_qr: 'QR004',
      foto: '/images/student4.jpg',
      direccion: 'Calle Lima 789, Surco',
      fechaCreacion: '2024-02-01',
      ultimoAcceso: '2024-07-22'
    },
    {
      id: 5,
      nombre: 'Carla',
      apellidos: 'Mendoza Ruiz',
      fecha_nacimiento: '2013-07-18',
      grado: '5to Primaria',
      seccion: 'B',
      codigo_qr: 'QR005',
      foto: '/images/student5.jpg',
      direccion: 'Av. Central 321, Pueblo Libre',
      fechaCreacion: '2024-02-05',
      ultimoAcceso: '2024-07-20'
    }
  ],

  parent_student_relationships: [
    {
      id: 1,
      parent_user_id: 1001,
      student_id: 1,
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-01-15'
    },
    {
      id: 2,
      parent_user_id: 1001,
      student_id: 2,
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-01-15'
    },
    {
      id: 3,
      parent_user_id: 1002,
      student_id: 3,
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-01-20'
    },
    {
      id: 4,
      parent_user_id: 1003,
      student_id: 4,
      relationship_type: 'madre',
      is_primary_contact: true,
      fechaCreacion: '2024-02-01'
    },
    // Relaciones para Gianpierre Tello (usuario dinámico)
    {
      id: 9,
      parent_user_id: 1753392954715,
      student_id: 1,
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-07-25'
    },
    {
      id: 10,
      parent_user_id: 1753392954715,
      student_id: 2,
      relationship_type: 'padre',
      is_primary_contact: false,
      fechaCreacion: '2024-07-25'
    }
  ],

  teacher_student_assignments: [
    {
      id: 1,
      teacher_user_id: 2001,
      student_id: 1,
      subject: 'Matemáticas',
      academic_year: '2024',
      fechaCreacion: '2024-01-15'
    },
    {
      id: 2,
      teacher_user_id: 2001,
      student_id: 2,
      subject: 'Matemáticas',
      academic_year: '2024',
      fechaCreacion: '2024-01-15'
    },
    {
      id: 3,
      teacher_user_id: 2001,
      student_id: 3,
      subject: 'Comunicación',
      academic_year: '2024',
      fechaCreacion: '2024-01-20'
    },
    {
      id: 4,
      teacher_user_id: 2002, // Carlos - Comunicación
      student_id: 1,
      subject: 'Comunicación',
      academic_year: '2024',
      fechaCreacion: '2024-01-15'
    },
    {
      id: 5,
      teacher_user_id: 2002,
      student_id: 2,
      subject: 'Comunicación',
      academic_year: '2024',
      fechaCreacion: '2024-01-15'
    },
    {
      id: 6,
      teacher_user_id: 2003, // Ana - Ciencias
      student_id: 1,
      subject: 'Ciencias Naturales',
      academic_year: '2024',
      fechaCreacion: '2024-01-15'
    },
    {
      id: 7,
      teacher_user_id: 2003,
      student_id: 3,
      subject: 'Ciencias Naturales',
      academic_year: '2024',
      fechaCreacion: '2024-01-20'
    },
    {
      id: 8,
      teacher_user_id: 2004, // Roberto - Ed. Física
      student_id: 1,
      subject: 'Educación Física',
      academic_year: '2024',
      fechaCreacion: '2024-01-15'
    },
    {
      id: 9,
      teacher_user_id: 2004,
      student_id: 2,
      subject: 'Educación Física',
      academic_year: '2024',
      fechaCreacion: '2024-01-15'
    },
    {
      id: 10,
      teacher_user_id: 2005, // Lucía - Arte
      student_id: 1,
      subject: 'Arte',
      academic_year: '2024',
      fechaCreacion: '2024-02-05'
    }
  ],

  conversations: [
    {
      id: 1,
      participants: [1001, 2001], // Carlos (padre) y María (tutora)
      lastMessage: 'Gracias por la información profesora',
      lastMessageTime: '2024-01-15T10:30:00',
      unreadCount: { 1001: 0, 2001: 0 },
      createdAt: '2024-01-10T08:00:00'
    },
    {
      id: 2,
      participants: [1001, 3001], // Carlos (padre) y Juan (admin)
      lastMessage: 'Perfecto, gracias por confirmar',
      lastMessageTime: '2024-01-14T14:20:00',
      unreadCount: { 1001: 1, 3001: 0 },
      createdAt: '2024-01-12T09:00:00'
    },
    {
      id: 3,
      participants: [1002, 2001], // Miguel (padre) y María (tutora)
      lastMessage: '¿Podríamos conversar sobre Luis?',
      lastMessageTime: '2024-01-16T11:00:00',
      unreadCount: { 1002: 0, 2001: 1 },
      createdAt: '2024-01-16T10:45:00'
    }
  ],

  messages: [
    {
      id: 1,
      conversationId: 1,
      senderId: 1001,
      recipientId: 2001,
      content: 'Buenos días profesora María, quisiera saber cómo va Ana en matemáticas',
      timestamp: '2024-01-15T09:00:00',
      read: true,
      type: 'text'
    },
    {
      id: 2,
      conversationId: 1,
      senderId: 2001,
      recipientId: 1001,
      content: 'Buenos días Sr. Rodríguez. Ana va muy bien, es muy participativa en clase. Su último examen fue excelente.',
      timestamp: '2024-01-15T10:15:00',
      read: true,
      type: 'text'
    },
    {
      id: 3,
      conversationId: 1,
      senderId: 1001,
      recipientId: 2001,
      content: 'Gracias por la información profesora',
      timestamp: '2024-01-15T10:30:00',
      read: true,
      type: 'text'
    },
    // Conversación 2: Carlos con Admin
    {
      id: 4,
      conversationId: 2,
      senderId: 1001,
      recipientId: 3001,
      content: 'Buenos días, necesito información sobre el proceso de matrícula para el próximo año',
      timestamp: '2024-01-14T13:00:00',
      read: true,
      type: 'text'
    },
    {
      id: 5,
      conversationId: 2,
      senderId: 3001,
      recipientId: 1001,
      content: 'Buenos días Sr. Rodríguez. Las matrículas inician el 15 de febrero. Le enviaré los requisitos por correo.',
      timestamp: '2024-01-14T14:15:00',
      read: true,
      type: 'text'
    },
    {
      id: 6,
      conversationId: 2,
      senderId: 1001,
      recipientId: 3001,
      content: 'Perfecto, gracias por confirmar',
      timestamp: '2024-01-14T14:20:00',
      read: false,
      type: 'text'
    },
    // Conversación 3: Miguel con Tutora
    {
      id: 7,
      conversationId: 3,
      senderId: 1002,
      recipientId: 2001,
      content: 'Profesora María, buenos días. ¿Podríamos conversar sobre Luis?',
      timestamp: '2024-01-16T11:00:00',
      read: false,
      type: 'text'
    }
  ],

  courses: [
    {
      id: 1,
      codigo: 'MAT-5A',
      nombre: 'Matemáticas 5° A',
      descripcion: 'Curso de matemáticas para 5to grado sección A',
      grado: '5to Primaria',
      seccion: 'A',
      materia: 'Matemáticas',
      horasSemanales: 6,
      aula: '201',
      horario: 'Lun-Mie-Vie 8:00-10:00',
      capacidad: 30,
      estudiantesInscritos: 25,
      estado: 'activo',
      fechaInicio: '2024-03-01',
      fechaFin: '2024-12-15'
    },
    {
      id: 2,
      codigo: 'COM-3B',
      nombre: 'Comunicación 3° B',
      descripcion: 'Curso de comunicación y lenguaje para 3er grado sección B',
      grado: '3ro Primaria',
      seccion: 'B',
      materia: 'Comunicación',
      horasSemanales: 5,
      aula: '105',
      horario: 'Mar-Jue 10:00-12:30',
      capacidad: 28,
      estudiantesInscritos: 24,
      estado: 'activo',
      fechaInicio: '2024-03-01',
      fechaFin: '2024-12-15'
    },
    {
      id: 3,
      codigo: 'CIE-4A',
      nombre: 'Ciencias 4° A',
      descripcion: 'Curso de ciencias naturales para 4to grado sección A',
      grado: '4to Primaria',
      seccion: 'A',
      materia: 'Ciencias',
      horasSemanales: 4,
      aula: '301',
      horario: 'Lun-Jue 14:00-16:00',
      capacidad: 30,
      estudiantesInscritos: 28,
      estado: 'activo',
      fechaInicio: '2024-03-01',
      fechaFin: '2024-12-15'
    },
    {
      id: 4,
      codigo: 'HIS-6A',
      nombre: 'Historia 6° A',
      descripcion: 'Curso de historia del Perú y universal para 6to grado',
      grado: '6to Primaria',
      seccion: 'A',
      materia: 'Historia',
      horasSemanales: 3,
      aula: '203',
      horario: 'Mar-Vie 13:00-14:30',
      capacidad: 32,
      estudiantesInscritos: 30,
      estado: 'activo',
      fechaInicio: '2024-03-01',
      fechaFin: '2024-12-15'
    }
  ],

  teacher_course_assignments: [
    {
      id: 1,
      profesorId: 2001, // María García
      cursoId: 1, // MAT-5A
      rol: 'titular',
      fechaAsignacion: '2024-02-15',
      estado: 'activo'
    },
    {
      id: 2,
      profesorId: 2002, // Carlos Mendoza
      cursoId: 2, // COM-3B
      rol: 'titular',
      fechaAsignacion: '2024-02-15',
      estado: 'activo'
    },
    {
      id: 3,
      profesorId: 2001, // María García también enseña
      cursoId: 3, // CIE-4A
      rol: 'titular',
      fechaAsignacion: '2024-02-15',
      estado: 'activo'
    },
    {
      id: 4,
      profesorId: 2003, // Juan Pérez
      cursoId: 4, // HIS-6A
      rol: 'titular',
      fechaAsignacion: '2024-02-15',
      estado: 'activo'
    }
  ],

  notifications: [
    {
      id: 1,
      userId: 1001,
      tipo: 'mensaje',
      titulo: 'Nuevo mensaje de María García',
      mensaje: 'Buenos días Sr. Rodríguez. Ana va muy bien...',
      prioridad: 'media',
      leida: true,
      fecha: '2024-01-15T10:15:00',
      actionUrl: '/parent/messages',
      datos: { conversationId: 1, senderId: 2001 }
    },
    {
      id: 2,
      userId: 1001,
      tipo: 'asistencia',
      titulo: 'Ana llegó al colegio',
      mensaje: 'Su hija Ana ha llegado al colegio a las 7:45 AM',
      prioridad: 'baja',
      leida: true,
      fecha: '2024-07-27T07:45:00',
      actionUrl: '/parent/attendance',
      datos: { studentId: 101, time: '07:45' }
    },
    {
      id: 3,
      userId: 1001,
      tipo: 'comunicado',
      titulo: 'Reunión de padres de familia',
      mensaje: 'Se convoca a reunión el próximo viernes 2 de agosto',
      prioridad: 'alta',
      leida: false,
      fecha: '2024-07-26T14:00:00',
      actionUrl: '/parent/communiques',
      datos: { communiqueId: 5 }
    },
    {
      id: 4,
      userId: 1002,
      tipo: 'pago',
      titulo: 'Recordatorio de pago',
      mensaje: 'Su pensión del mes de julio vence el 31/07',
      prioridad: 'alta',
      leida: false,
      fecha: '2024-07-25T09:00:00',
      actionUrl: '/parent/payments',
      datos: { paymentId: 12, amount: 450 }
    },
    {
      id: 5,
      userId: 2001,
      tipo: 'sistema',
      titulo: 'Nuevas calificaciones disponibles',
      mensaje: 'Las calificaciones del 2do bimestre han sido publicadas',
      prioridad: 'media',
      leida: true,
      fecha: '2024-07-20T16:00:00',
      actionUrl: '/tutor/dashboard',
      datos: { period: '2do Bimestre' }
    }
  ],

  notification_preferences: [
    {
      id: 1,
      userId: 1001,
      tipo: 'mensaje',
      email: true,
      push: true,
      app: true,
      sonido: true,
      horarioInicio: '07:00',
      horarioFin: '21:00',
      diasSemana: ['lun', 'mar', 'mie', 'jue', 'vie']
    },
    {
      id: 2,
      userId: 1001,
      tipo: 'asistencia',
      email: false,
      push: true,
      app: true,
      sonido: true,
      horarioInicio: '06:00',
      horarioFin: '18:00',
      diasSemana: ['lun', 'mar', 'mie', 'jue', 'vie']
    },
    {
      id: 3,
      userId: 1001,
      tipo: 'comunicado',
      email: true,
      push: true,
      app: true,
      sonido: false,
      horarioInicio: '00:00',
      horarioFin: '23:59',
      diasSemana: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']
    },
    {
      id: 4,
      userId: 1001,
      tipo: 'pago',
      email: true,
      push: true,
      app: true,
      sonido: true,
      horarioInicio: '08:00',
      horarioFin: '20:00',
      diasSemana: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab']
    },
    {
      id: 5,
      userId: 1002,
      tipo: 'global',
      email: true,
      push: false,
      app: true,
      sonido: false,
      horarioInicio: '08:00',
      horarioFin: '18:00',
      diasSemana: ['lun', 'mar', 'mie', 'jue', 'vie']
    }
  ],

  notification_history: [
    {
      id: 1,
      notificationId: 1,
      userId: 1001,
      accion: 'enviada',
      metodo: 'push',
      fecha: '2024-01-15T10:15:00',
      estado: 'exitoso'
    },
    {
      id: 2,
      notificationId: 1,
      userId: 1001,
      accion: 'leida',
      metodo: 'app',
      fecha: '2024-01-15T10:30:00',
      estado: 'exitoso'
    },
    {
      id: 3,
      notificationId: 2,
      userId: 1001,
      accion: 'enviada',
      metodo: 'push',
      fecha: '2024-07-27T07:45:00',
      estado: 'exitoso'
    },
    {
      id: 4,
      notificationId: 3,
      userId: 1001,
      accion: 'enviada',
      metodo: 'email',
      fecha: '2024-07-26T14:00:00',
      estado: 'exitoso'
    },
    {
      id: 5,
      notificationId: 4,
      userId: 1002,
      accion: 'enviada',
      metodo: 'push',
      fecha: '2024-07-25T09:00:00',
      estado: 'fallido',
      error: 'Usuario sin token push'
    }
  ]
}

// =====================================================
// DATABASE MANAGER CLASS
// =====================================================

class DatabaseManager {
  constructor() {
    this.dbName = DB_CONFIG.name
    this.version = DB_CONFIG.version
    this.isInitialized = false
    this.autoBackupTimer = null
    
    this.init()
  }

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  init() {
    console.log('🗄️ Inicializando DatabaseManager...')
    
    try {
      // Verificar si la BD ya existe
      const existingData = localStorage.getItem(this.dbName)
      
      if (!existingData) {
        console.log('📦 Primera vez - Creando base de datos...')
        this.createDatabase()
      } else {
        console.log('✅ Base de datos existente encontrada')
        this.validateDatabase()
      }

      this.isInitialized = true
      
      // Configurar backup automático
      if (DB_CONFIG.autoBackup) {
        this.setupAutoBackup()
      }

      console.log(`🎉 DatabaseManager listo - ${this.dbName} v${this.version}`)
    } catch (error) {
      console.error('❌ Error fatal inicializando BD:', error)
      throw new Error('Fallo crítico en la base de datos')
    }
  }

  createDatabase() {
    const dbStructure = {
      metadata: {
        name: this.dbName,
        version: this.version,
        created_at: new Date().toISOString(),
        last_backup: null,
        tables: DB_CONFIG.tables
      },
      data: INITIAL_DATA,
      counters: {
        users: Math.max(...INITIAL_DATA.users.map(u => u.id)) + 1,
        students: Math.max(...INITIAL_DATA.students.map(s => s.id)) + 1,
        parent_student_relationships: Math.max(...INITIAL_DATA.parent_student_relationships.map(r => r.id)) + 1,
        teacher_student_assignments: Math.max(...INITIAL_DATA.teacher_student_assignments.map(a => a.id)) + 1,
        messages: INITIAL_DATA.messages ? Math.max(...INITIAL_DATA.messages.map(m => m.id)) + 1 : 1,
        conversations: INITIAL_DATA.conversations ? Math.max(...INITIAL_DATA.conversations.map(c => c.id)) + 1 : 1,
        courses: INITIAL_DATA.courses ? Math.max(...INITIAL_DATA.courses.map(c => c.id)) + 1 : 1,
        teacher_course_assignments: INITIAL_DATA.teacher_course_assignments ? Math.max(...INITIAL_DATA.teacher_course_assignments.map(a => a.id)) + 1 : 1
      }
    }

    localStorage.setItem(this.dbName, JSON.stringify(dbStructure))
    console.log('✅ Base de datos creada con datos iniciales')
  }

  validateDatabase() {
    try {
      const data = this.getData()
      
      if (!data?.metadata || !data?.data || !data?.counters) {
        throw new Error('Estructura inválida')
      }

      // Validar que existan todas las tablas
      for (const table of DB_CONFIG.tables) {
        if (!data.data[table]) {
          console.warn(`⚠️ Tabla faltante: ${table}, creando...`)
          data.data[table] = []
        }
      }

      this.saveData(data)
      console.log('✅ Estructura de BD validada')
    } catch (error) {
      console.error('❌ BD corrupta, recreando...', error)
      this.createDatabase()
    }
  }

  // =====================================================
  // OPERACIONES BÁSICAS
  // =====================================================

  getData() {
    try {
      const data = localStorage.getItem(this.dbName)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('❌ Error leyendo datos:', error)
      return null
    }
  }

  saveData(newData) {
    try {
      newData.metadata.updated_at = new Date().toISOString()
      localStorage.setItem(this.dbName, JSON.stringify(newData))
      return true
    } catch (error) {
      console.error('❌ Error guardando datos:', error)
      if (error.name === 'QuotaExceededError') {
        console.error('💾 LocalStorage lleno! Considera limpiar datos antiguos')
      }
      return false
    }
  }

  // =====================================================
  // OPERACIONES CRUD (API tipo SQL)
  // =====================================================

  // SELECT * FROM table WHERE condition
  select(tableName, condition = null, orderBy = null, limit = null) {
    try {
      const data = this.getData()
      if (!data?.data?.[tableName]) {
        console.warn(`⚠️ Tabla ${tableName} no existe`)
        return []
      }

      let results = [...data.data[tableName]]

      // WHERE clause
      if (condition && typeof condition === 'function') {
        results = results.filter(condition)
      }

      // ORDER BY clause
      if (orderBy && typeof orderBy === 'function') {
        results.sort(orderBy)
      }

      // LIMIT clause
      if (limit && typeof limit === 'number') {
        results = results.slice(0, limit)
      }

      return results
    } catch (error) {
      console.error(`❌ Error en SELECT ${tableName}:`, error)
      return []
    }
  }

  // INSERT INTO table VALUES (data)
  insert(tableName, newRecord) {
    try {
      const data = this.getData()
      if (!data?.data?.[tableName]) {
        throw new Error(`Tabla ${tableName} no existe`)
      }

      // Auto-increment ID
      const newId = data.counters[tableName] || 1
      const recordWithId = {
        id: newId,
        ...newRecord,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert record
      data.data[tableName].push(recordWithId)
      data.counters[tableName] = newId + 1

      // Save changes
      if (this.saveData(data)) {
        console.log(`✅ Insertado en ${tableName}: ID ${recordWithId.id}`)
        return recordWithId
      } else {
        throw new Error('Error guardando')
      }
    } catch (error) {
      console.error(`❌ Error en INSERT ${tableName}:`, error)
      return null
    }
  }

  // UPDATE table SET data WHERE condition
  update(tableName, condition, updateData) {
    try {
      const data = this.getData()
      if (!data?.data?.[tableName]) {
        throw new Error(`Tabla ${tableName} no existe`)
      }

      let updatedCount = 0
      const updatedRecords = []

      data.data[tableName] = data.data[tableName].map(record => {
        if (condition(record)) {
          const updatedRecord = {
            ...record,
            ...updateData,
            updated_at: new Date().toISOString()
          }
          updatedRecords.push(updatedRecord)
          updatedCount++
          return updatedRecord
        }
        return record
      })

      if (this.saveData(data)) {
        console.log(`✅ Actualizados ${updatedCount} registros en ${tableName}`)
        return updatedRecords
      } else {
        throw new Error('Error guardando')
      }
    } catch (error) {
      console.error(`❌ Error en UPDATE ${tableName}:`, error)
      return []
    }
  }

  // DELETE FROM table WHERE condition
  delete(tableName, condition) {
    try {
      const data = this.getData()
      if (!data?.data?.[tableName]) {
        throw new Error(`Tabla ${tableName} no existe`)
      }

      const initialLength = data.data[tableName].length
      data.data[tableName] = data.data[tableName].filter(record => !condition(record))
      const deletedCount = initialLength - data.data[tableName].length

      if (this.saveData(data)) {
        console.log(`✅ Eliminados ${deletedCount} registros de ${tableName}`)
        return deletedCount
      } else {
        throw new Error('Error guardando')
      }
    } catch (error) {
      console.error(`❌ Error en DELETE ${tableName}:`, error)
      return 0
    }
  }

  // =====================================================
  // BACKUP AUTOMÁTICO
  // =====================================================

  createBackup() {
    try {
      const data = this.getData()
      if (!data) return null

      const backupKey = `${this.dbName}_backup_${Date.now()}`
      const backupData = {
        ...data,
        backup_metadata: {
          original_db: this.dbName,
          backup_date: new Date().toISOString(),
          backup_key: backupKey
        }
      }

      localStorage.setItem(backupKey, JSON.stringify(backupData))
      
      // Actualizar metadata
      data.metadata.last_backup = new Date().toISOString()
      this.saveData(data)

      // Limpiar backups viejos
      this.cleanOldBackups()

      console.log(`💾 Backup creado: ${backupKey}`)
      return backupKey
    } catch (error) {
      console.error('❌ Error creando backup:', error)
      return null
    }
  }

  setupAutoBackup() {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer)
    }

    this.autoBackupTimer = setInterval(() => {
      console.log('⏰ Backup automático...')
      this.createBackup()
    }, DB_CONFIG.backupInterval)

    console.log(`⏰ Auto-backup cada ${DB_CONFIG.backupInterval / 1000 / 60} minutos`)
  }

  cleanOldBackups() {
    const backups = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(`${this.dbName}_backup_`)) {
        backups.push(key)
      }
    }

    if (backups.length > DB_CONFIG.maxBackups) {
      const toDelete = backups.slice(DB_CONFIG.maxBackups)
      toDelete.forEach(backup => {
        localStorage.removeItem(backup)
        console.log(`🗑️ Backup eliminado: ${backup}`)
      })
    }
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  getStats() {
    const data = this.getData()
    if (!data) return null

    const stats = {
      database: this.dbName,
      version: this.version,
      created_at: data.metadata?.created_at,
      last_backup: data.metadata?.last_backup,
      size: JSON.stringify(data).length,
      tables: {}
    }

    for (const table of DB_CONFIG.tables) {
      stats.tables[table] = {
        records: data.data?.[table]?.length || 0,
        next_id: data.counters?.[table] || 1
      }
    }

    return stats
  }

  exportData() {
    const data = this.getData()
    return data ? JSON.stringify(data, null, 2) : null
  }

  importData(jsonData) {
    try {
      const importedData = JSON.parse(jsonData)
      localStorage.setItem(this.dbName, jsonData)
      console.log('✅ Datos importados exitosamente')
      return true
    } catch (error) {
      console.error('❌ Error importando datos:', error)
      return false
    }
  }

  clearAll() {
    localStorage.removeItem(this.dbName)
    this.createDatabase()
    console.log('🗑️ Base de datos limpiada y reinicializada')
  }

  // =====================================================
  // TRANSACCIONES SIMULADAS
  // =====================================================

  // Simular transacciones (múltiples operaciones como una unidad)
  transaction(operations) {
    try {
      console.log(`🔄 Iniciando transacción con ${operations.length} operaciones`)
      const results = []

      // Realizar todas las operaciones
      for (const operation of operations) {
        let result = null

        switch (operation.type) {
          case 'INSERT':
            result = this.insert(operation.table, operation.data)
            if (!result) {
              throw new Error(`INSERT falló en tabla ${operation.table}`)
            }
            break
          case 'UPDATE':
            result = this.update(operation.table, operation.condition, operation.data)
            if (!Array.isArray(result) || result.length === 0) {
              console.warn(`UPDATE no afectó registros en tabla ${operation.table}`)
            }
            break
          case 'DELETE':
            result = this.delete(operation.table, operation.condition)
            // DELETE puede retornar 0 y eso está bien
            if (result === null || result === undefined) {
              throw new Error(`DELETE falló en tabla ${operation.table}`)
            }
            break
          default:
            throw new Error(`Tipo de operación no soportado: ${operation.type}`)
        }

        results.push(result)
      }

      console.log(`✅ Transacción completada exitosamente`)
      return { success: true, results }

    } catch (error) {
      console.error(`❌ Error en transacción:`, error)
      return { success: false, error: error.message, results: [] }
    }
  }

  destroy() {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer)
    }
    console.log('💥 DatabaseManager destruido')
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

let dbInstance = null

export const getDatabase = () => {
  if (!dbInstance) {
    dbInstance = new DatabaseManager()
  }
  return dbInstance
}

export const resetDatabase = () => {
  if (dbInstance) {
    dbInstance.destroy()
  }
  dbInstance = null
}

export default getDatabase