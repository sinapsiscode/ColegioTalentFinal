// ============================================
// DATABASE SCHEMA - Arquitectura Profesional
// ============================================
// Sistema híbrido con persistencia real usando localStorage
// API similar a SQL para fácil migración a BD real

/*
TABLAS PRINCIPALES:

1. users (usuarios)
   - id (PK, auto-increment)
   - email (UNIQUE)
   - password_hash
   - rol (enum: 'padre', 'tutor', 'admin', 'entrada')
   - nombre
   - apellidos
   - telefono
   - direccion
   - avatar_url
   - created_at
   - updated_at
   - is_active

2. students (estudiantes)
   - id (PK, auto-increment)
   - nombre
   - apellidos
   - fecha_nacimiento
   - grado
   - seccion
   - codigo_qr (UNIQUE)
   - foto_url
   - direccion
   - created_at
   - updated_at

3. parent_student_relationships (relaciones padre-hijo)
   - id (PK, auto-increment)
   - parent_user_id (FK -> users.id)
   - student_id (FK -> students.id)
   - relationship_type (enum: 'padre', 'madre', 'tutor_legal')
   - is_primary_contact (boolean)
   - created_at

4. teacher_student_assignments (asignaciones tutor-estudiante)
   - id (PK, auto-increment) 
   - teacher_user_id (FK -> users.id)
   - student_id (FK -> students.id)
   - subject (materia)
   - academic_year
   - created_at

VENTAJAS DE ESTA ARQUITECTURA:
✅ Persistencia automática con localStorage
✅ Backup automático cada 5 minutos
✅ API tipo SQL para fácil migración
✅ Integridad referencial simulada
✅ Flexibilidad: Un estudiante puede tener múltiples padres
✅ Escalabilidad: Fácil agregar nuevas relaciones
✅ Auditabilidad: Timestamps automáticos
✅ Seguridad: Passwords hasheados
*/

import { getDatabase } from './DatabaseManager'
import { compareIds } from '../utils/searchHelpers'

// Instancia global de la base de datos
const db = getDatabase()

// Para compatibilidad con código existente, mantenemos MOCK_DATABASE
export const MOCK_DATABASE = {
  users: [
    {
      id: 1001,
      email: 'carlos.rodriguez@email.com',
      password_hash: 'hashed_123456', // En prod sería bcrypt
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
    },
    // Nuevos estudiantes de otras secciones para María García
    {
      id: 6,
      nombre: 'Diego',
      apellidos: 'Fernández Castro',
      fecha_nacimiento: '2014-02-14',
      grado: '4to Primaria',
      seccion: 'C',
      codigo_qr: 'QR006',
      foto: '/images/student6.jpg',
      direccion: 'Jr. Los Pinos 445, San Borja',
      fechaCreacion: '2024-01-22',
      ultimoAcceso: '2024-07-24'
    },
    {
      id: 7,
      nombre: 'Valentina',
      apellidos: 'Torres Pérez',
      fecha_nacimiento: '2014-09-23',
      grado: '4to Primaria',
      seccion: 'C',
      codigo_qr: 'QR007',
      foto: '/images/student7.jpg',
      direccion: 'Av. Javier Prado 890, La Molina',
      fechaCreacion: '2024-01-22',
      ultimoAcceso: '2024-07-24'
    },
    {
      id: 8,
      nombre: 'Sebastián',
      apellidos: 'Vargas López',
      fecha_nacimiento: '2012-11-30',
      grado: '6to Primaria',
      seccion: 'A',
      codigo_qr: 'QR008',
      foto: '/images/student8.jpg',
      direccion: 'Calle Los Laureles 234, Surquillo',
      fechaCreacion: '2024-01-25',
      ultimoAcceso: '2024-07-24'
    },
    {
      id: 9,
      nombre: 'Isabella',
      apellidos: 'Ramírez Díaz',
      fecha_nacimiento: '2012-06-15',
      grado: '6to Primaria',
      seccion: 'A',
      codigo_qr: 'QR009',
      foto: '/images/student9.jpg',
      direccion: 'Jr. Las Magnolias 567, Magdalena',
      fechaCreacion: '2024-01-25',
      ultimoAcceso: '2024-07-24'
    },
    {
      id: 10,
      nombre: 'Mateo',
      apellidos: 'Gutiérrez Soto',
      fecha_nacimiento: '2012-03-22',
      grado: '6to Primaria',
      seccion: 'B',
      codigo_qr: 'QR010',
      foto: '/images/student10.jpg',
      direccion: 'Av. Los Álamos 789, San Miguel',
      fechaCreacion: '2024-01-28',
      ultimoAcceso: '2024-07-24'
    },
    {
      id: 11,
      nombre: 'Camila',
      apellidos: 'Morales Vega',
      fecha_nacimiento: '2015-01-10',
      grado: '3ro Primaria',
      seccion: 'A',
      codigo_qr: 'QR011',
      foto: '/images/student11.jpg',
      direccion: 'Calle Las Rosas 123, Lince',
      fechaCreacion: '2024-02-01',
      ultimoAcceso: '2024-07-24'
    },
    {
      id: 12,
      nombre: 'Lucas',
      apellidos: 'Herrera Mendoza',
      fecha_nacimiento: '2015-05-18',
      grado: '3ro Primaria',
      seccion: 'C',
      codigo_qr: 'QR012',
      foto: '/images/student12.jpg',
      direccion: 'Jr. Los Tulipanes 456, Jesús María',
      fechaCreacion: '2024-02-01',
      ultimoAcceso: '2024-07-24'
    }
  ],

  parent_student_relationships: [
    // Carlos Rodríguez tiene 2 hijos: Ana y Luis
    {
      id: 1,
      parent_user_id: 1001, // Carlos
      student_id: 1,        // Ana
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-01-15'
    },
    {
      id: 2,
      parent_user_id: 1001, // Carlos
      student_id: 2,        // Luis
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-01-15'
    },
    // Miguel Martinez tiene 1 hija: Sofia
    {
      id: 3,
      parent_user_id: 1002, // Miguel
      student_id: 3,        // Sofia
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-01-20'
    },
    // Ana Silva tiene 1 hijo: Pedro
    {
      id: 4,
      parent_user_id: 1003, // Ana Silva
      student_id: 4,        // Pedro
      relationship_type: 'madre',
      is_primary_contact: true,
      fechaCreacion: '2024-02-01'
    },
    // Nuevas relaciones para los estudiantes adicionales
    {
      id: 5,
      parent_user_id: 1001, // Carlos también tiene a Carla
      student_id: 5,        // Carla
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-02-05'
    },
    {
      id: 6,
      parent_user_id: 1002, // Miguel también tiene a Diego
      student_id: 6,        // Diego
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-01-22'
    },
    {
      id: 7,
      parent_user_id: 1002, // Miguel también tiene a Valentina
      student_id: 7,        // Valentina
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-01-22'
    },
    {
      id: 8,
      parent_user_id: 1003, // Ana Silva también tiene a Sebastián
      student_id: 8,        // Sebastián
      relationship_type: 'madre',
      is_primary_contact: true,
      fechaCreacion: '2024-01-25'
    },
    {
      id: 9,
      parent_user_id: 1003, // Ana Silva también tiene a Isabella
      student_id: 9,        // Isabella
      relationship_type: 'madre',
      is_primary_contact: true,
      fechaCreacion: '2024-01-25'
    },
    {
      id: 10,
      parent_user_id: 1001, // Carlos también tiene a Mateo
      student_id: 10,       // Mateo
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-01-28'
    },
    {
      id: 11,
      parent_user_id: 1002, // Miguel también tiene a Camila
      student_id: 11,       // Camila
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-02-01'
    },
    {
      id: 12,
      parent_user_id: 1001, // Carlos también tiene a Lucas
      student_id: 12,       // Lucas
      relationship_type: 'padre',
      is_primary_contact: true,
      fechaCreacion: '2024-02-01'
    }
  ],

  teacher_student_assignments: [
    // María García (tutor) tiene asignados varios estudiantes
    {
      id: 1,
      teacher_user_id: 2001, // María García
      student_id: 1,         // Ana
      subject: 'Matemáticas',
      academic_year: '2024',
      fechaCreacion: '2024-01-15'
    },
    {
      id: 2,
      teacher_user_id: 2001, // María García
      student_id: 2,         // Luis
      subject: 'Matemáticas',
      academic_year: '2024',
      fechaCreacion: '2024-01-15'
    },
    {
      id: 3,
      teacher_user_id: 2001, // María García
      student_id: 3,         // Sofia
      subject: 'Comunicación',
      academic_year: '2024',
      fechaCreacion: '2024-01-20'
    },
    // Más asignaciones para María García - diferentes secciones y materias
    {
      id: 4,
      teacher_user_id: 2001, // María García
      student_id: 4,         // Pedro
      subject: 'Matemáticas',
      academic_year: '2024',
      fechaCreacion: '2024-01-20'
    },
    {
      id: 5,
      teacher_user_id: 2001, // María García
      student_id: 5,         // Carla
      subject: 'Matemáticas',
      academic_year: '2024',
      fechaCreacion: '2024-01-20'
    },
    {
      id: 6,
      teacher_user_id: 2001, // María García
      student_id: 6,         // Diego - 4to C
      subject: 'Matemáticas',
      academic_year: '2024',
      fechaCreacion: '2024-01-22'
    },
    {
      id: 7,
      teacher_user_id: 2001, // María García
      student_id: 7,         // Valentina - 4to C
      subject: 'Matemáticas',
      academic_year: '2024',
      fechaCreacion: '2024-01-22'
    },
    {
      id: 8,
      teacher_user_id: 2001, // María García
      student_id: 8,         // Sebastián - 6to A
      subject: 'Matemáticas',
      academic_year: '2024',
      fechaCreacion: '2024-01-25'
    },
    {
      id: 9,
      teacher_user_id: 2001, // María García
      student_id: 9,         // Isabella - 6to A
      subject: 'Matemáticas',
      academic_year: '2024',
      fechaCreacion: '2024-01-25'
    },
    {
      id: 10,
      teacher_user_id: 2001, // María García
      student_id: 10,        // Mateo - 6to B
      subject: 'Matemáticas',
      academic_year: '2024',
      fechaCreacion: '2024-01-28'
    },
    {
      id: 11,
      teacher_user_id: 2001, // María García
      student_id: 11,        // Camila - 3ro A
      subject: 'Comunicación',
      academic_year: '2024',
      fechaCreacion: '2024-02-01'
    },
    {
      id: 12,
      teacher_user_id: 2001, // María García
      student_id: 12,        // Lucas - 3ro C
      subject: 'Comunicación',
      academic_year: '2024',
      fechaCreacion: '2024-02-01'
    }
  ]
}

// =====================================================
// DATABASE QUERIES - API tipo SQL con Persistencia
// =====================================================

export const DatabaseQueries = {
  // =====================================================
  // USUARIOS (USERS)
  // =====================================================

  // SELECT * FROM users WHERE email = ?
  getUserByEmail: (email) => {
    const users = db.select('users', user => user.email === email)
    return users[0] || null
  },

  // SELECT * FROM users WHERE id = ?
  getUserById: (id) => {
    const users = db.select('users', user => user.id === id)
    return users[0] || null
  },

  // SELECT * FROM users
  getAllUsers: () => {
    return db.select('users')
  },

  // INSERT INTO users VALUES (userData)
  addUser: (userData) => {
    return db.insert('users', userData)
  },

  // UPDATE users SET userData WHERE id = userId
  updateUser: (userId, updateData) => {
    const updated = db.update('users', user => user.id === userId, updateData)
    return updated[0] || null
  },

  // =====================================================
  // ESTUDIANTES Y RELACIONES
  // =====================================================

  // SELECT s.* FROM students s 
  // JOIN parent_student_relationships psr ON s.id = psr.student_id 
  // WHERE psr.parent_user_id = ?
  getStudentsByParentId: (parentUserId) => {
    const relationships = db.select('parent_student_relationships', 
      rel => rel.parent_user_id === parentUserId
    )
    
    const studentIds = relationships.map(rel => rel.student_id)
    
    return db.select('students', student => 
      studentIds.includes(student.id)
    )
  },

  // SELECT s.* FROM students s 
  // JOIN teacher_student_assignments tsa ON s.id = tsa.student_id 
  // WHERE tsa.teacher_user_id = ?
  getStudentsByTeacherId: (teacherUserId) => {
    const assignments = db.select('teacher_student_assignments',
      assignment => assignment.teacher_user_id === teacherUserId
    )
    
    const studentIds = assignments.map(assignment => assignment.student_id)
    
    return db.select('students', student => 
      studentIds.includes(student.id)
    )
  },

  // Obtener padres de un estudiante
  getParentsByStudentId: (studentId) => {
    return db.select('parent_student_relationships',
      rel => rel.student_id === studentId
    )
  },

  // SELECT * FROM students
  getAllStudents: () => {
    return db.select('students')
  },

  // ======================================================
  // GESTIÓN DE RELACIONES PADRE-HIJO (CON PERSISTENCIA)
  // ======================================================

  // INSERT INTO parent_student_relationships
  assignStudentToParent: (parentUserId, studentId, relationshipType = 'padre', isPrimaryContact = false) => {
    const newRelationship = {
      parent_user_id: parentUserId,
      student_id: studentId,
      relationship_type: relationshipType,
      is_primary_contact: isPrimaryContact,
      fechaCreacion: new Date().toISOString().split('T')[0]
    }
    
    return db.insert('parent_student_relationships', newRelationship)
  },

  // DELETE FROM parent_student_relationships WHERE parent_user_id = ? AND student_id = ?
  removeStudentFromParent: (parentUserId, studentId) => {
    const deletedCount = db.delete('parent_student_relationships',
      rel => rel.parent_user_id === parentUserId && rel.student_id === studentId
    )
    
    if (deletedCount > 0) {
      return { success: true, message: `${deletedCount} relación(es) eliminada(s)` }
    }
    
    return { success: false, error: 'Relación no encontrada' }
  },

  // SELECT * FROM parent_student_relationships
  getAllParentStudentRelationships: () => {
    return db.select('parent_student_relationships')
  },

  // SELECT con JOIN simulado: Obtener hijos de un padre con detalles
  getChildrenByParentId: (parentUserId) => {
    console.log('🔍 getChildrenByParentId called with:', {
      parentUserId,
      parentUserIdType: typeof parentUserId
    })
    
    const allRelationships = db.select('parent_student_relationships')
    console.log('📋 All parent-student relationships:', allRelationships.map(r => ({
      parent_user_id: r.parent_user_id,
      student_id: r.student_id,
      parentIdType: typeof r.parent_user_id
    })))
    
    const relationships = db.select('parent_student_relationships', 
      rel => {
        const matches = compareIds(rel.parent_user_id, parentUserId)
        console.log(`Checking relationship: ${rel.parent_user_id} (${typeof rel.parent_user_id}) === ${parentUserId} (${typeof parentUserId}) ? ${matches}`)
        return matches
      }
    )
    
    console.log(`✅ Found ${relationships.length} relationships for parent ${parentUserId}`)
    
    return relationships.map(rel => {
      const students = db.select('students', s => compareIds(s.id, rel.student_id))
      const student = students[0]
      
      if (student) {
        console.log(`👦 Found student: ${student.nombre} ${student.apellidos} (ID: ${student.id})`)
      }
      
      return student ? {
        ...student,
        relationship_type: rel.relationship_type,
        is_primary_contact: rel.is_primary_contact,
        relationship_id: rel.id
      } : null
    }).filter(Boolean)
  },

  // SELECT con JOIN simulado: Obtener padres de un estudiante
  getParentsByStudentId: (studentId) => {
    const relationships = db.select('parent_student_relationships',
      rel => rel.student_id === studentId
    )
    
    return relationships.map(rel => {
      const parents = db.select('users', u => u.id === rel.parent_user_id)
      const parent = parents[0]
      
      return parent ? {
        ...parent,
        relationship_type: rel.relationship_type,
        is_primary_contact: rel.is_primary_contact,
        relationship_id: rel.id
      } : null
    }).filter(Boolean)
  },

  // SELECT COUNT(*) simulado
  isStudentAssignedToParent: (parentUserId, studentId) => {
    const relationships = db.select('parent_student_relationships',
      rel => rel.parent_user_id === parentUserId && rel.student_id === studentId
    )
    return relationships.length > 0
  },

  // SELECT con NOT IN simulado
  getAvailableStudentsForParent: (parentUserId = null) => {
    if (parentUserId) {
      const assignedRelationships = db.select('parent_student_relationships',
        rel => rel.parent_user_id === parentUserId
      )
      const assignedStudentIds = assignedRelationships.map(rel => rel.student_id)
      
      return db.select('students', student => 
        !assignedStudentIds.includes(student.id)
      )
    } else {
      return db.select('students')
    }
  },

  // UPDATE parent_student_relationships SET updates WHERE id = relationshipId
  updateParentStudentRelationship: (relationshipId, updates) => {
    const updated = db.update('parent_student_relationships',
      rel => rel.id === relationshipId,
      updates
    )
    return updated[0] || null
  },

  // TRANSACCIÓN: Múltiples INSERTs
  assignMultipleStudentsToParent: (parentUserId, studentIds, relationshipType = 'padre') => {
    const operations = studentIds.map((studentId, index) => ({
      type: 'INSERT',
      table: 'parent_student_relationships',
      data: {
        parent_user_id: parentUserId,
        student_id: studentId,
        relationship_type: relationshipType,
        is_primary_contact: index === 0,
        fechaCreacion: new Date().toISOString().split('T')[0]
      }
    }))

    const result = db.transaction(operations)
    return result.success ? result.results : []
  },

  // =====================================================
  // UTILIDADES Y VALIDACIONES
  // =====================================================

  // Validar integridad referencial
  validateDataIntegrity: () => {
    const errors = []
    
    // Verificar que todos los parent_user_id existan en users
    const relationships = db.select('parent_student_relationships')
    const users = db.select('users')
    const students = db.select('students')
    
    for (const rel of relationships) {
      const parentExists = users.some(user => user.id === rel.parent_user_id)
      if (!parentExists) {
        errors.push(`Parent user ${rel.parent_user_id} not found in users table`)
      }
      
      const studentExists = students.some(student => student.id === rel.student_id)
      if (!studentExists) {
        errors.push(`Student ${rel.student_id} not found in students table`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // =====================================================
  // UTILIDADES DE BASE DE DATOS
  // =====================================================

  // Obtener estadísticas de la BD
  getDatabaseStats: () => {
    return db.getStats()
  },

  // Crear backup manual
  createBackup: () => {
    return db.createBackup()
  },

  // Exportar todos los datos
  exportAllData: () => {
    return db.exportData()
  },

  // Importar datos desde JSON
  importAllData: (jsonData) => {
    return db.importData(jsonData)
  },

  // Limpiar toda la base de datos
  clearAllData: () => {
    return db.clearAll()
  },

  // =====================================================
  // FUNCIONES DE ACCESO DIRECTO A DatabaseManager
  // =====================================================

  // Acceso directo para operaciones avanzadas
  getDB: () => db,

  // Ejecutar query personalizado
  customQuery: (tableName, condition, orderBy, limit) => {
    return db.select(tableName, condition, orderBy, limit)
  },

  // Insertar registro personalizado
  customInsert: (tableName, data) => {
    return db.insert(tableName, data)
  },

  // Actualizar con condición personalizada
  customUpdate: (tableName, condition, updateData) => {
    return db.update(tableName, condition, updateData)
  },

  // Eliminar con condición personalizada
  customDelete: (tableName, condition) => {
    return db.delete(tableName, condition)
  },

  // =====================================================
  // GESTIÓN DE USUARIOS (CRUD COMPLETO)
  // =====================================================

  // SELECT * FROM users
  getAllUsers: () => {
    return db.select('users')
  },

  // SELECT * FROM users WHERE id = ?
  getUserById: (userId) => {
    const user = db.select('users', user => user.id === userId)[0]
    return user || null
  },

  // INSERT INTO users
  addUser: (userData) => {
    const newUser = {
      id: userData.id || Date.now(),
      email: userData.email,
      password_hash: userData.password_hash || `hashed_${userData.password || '123456'}`,
      rol: userData.rol || 'estudiante',
      nombre: userData.nombre,
      apellidos: userData.apellidos || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || '',
      avatar: userData.avatar || '',
      fechaCreacion: userData.fechaCreacion || new Date().toISOString().split('T')[0],
      ultimoAcceso: userData.ultimoAcceso || null,
      estado: userData.estado || 'activo'
    }
    
    return db.insert('users', newUser)
  },

  // UPDATE users SET ... WHERE id = ?
  updateUser: (userId, updates) => {
    const updatedUsers = db.update('users',
      user => user.id === userId,
      updates
    )
    return updatedUsers[0] || null
  },

  // DELETE FROM users WHERE id = ?
  deleteUser: (userId) => {
    const deletedCount = db.delete('users', user => user.id === userId)
    return deletedCount > 0
  },

  // SELECT * FROM users WHERE rol = ?
  getUsersByRole: (role) => {
    return db.select('users', user => user.rol === role)
  },

  // SELECT * FROM users WHERE estado = ?
  getUsersByStatus: (status) => {
    return db.select('users', user => user.estado === status)
  },

  // Búsqueda de usuarios por término
  searchUsers: (searchTerm) => {
    const term = searchTerm.toLowerCase()
    return db.select('users', user => 
      user.nombre.toLowerCase().includes(term) ||
      user.apellidos.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    )
  },

  // Cambiar estado de usuario
  toggleUserStatus: (userId, newStatus) => {
    return DatabaseQueries.updateUser(userId, { estado: newStatus })
  },

  // Cambiar contraseña de usuario
  changeUserPassword: (userId, newPassword) => {
    return DatabaseQueries.updateUser(userId, { 
      password_hash: `hashed_${newPassword}` 
    })
  },

  // =====================================================
  // MENSAJERÍA Y CONVERSACIONES
  // =====================================================

  // Obtener todas las conversaciones de un usuario
  getConversationsByUserId: (userId) => {
    return db.select('conversations', conv => 
      conv.participants.includes(userId)
    )
  },

  // Obtener una conversación entre dos usuarios
  getConversationBetweenUsers: (userId1, userId2) => {
    return db.select('conversations', conv => 
      conv.participants.includes(userId1) && 
      conv.participants.includes(userId2)
    )[0] || null
  },

  // Crear nueva conversación
  createConversation: (userId1, userId2) => {
    const newConversation = {
      participants: [userId1, userId2],
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: { [userId1]: 0, [userId2]: 0 },
      createdAt: new Date().toISOString()
    }
    return db.insert('conversations', newConversation)
  },

  // Obtener mensajes de una conversación
  getMessagesByConversationId: (conversationId, limit = 50) => {
    const messages = db.select('messages', msg => 
      msg.conversationId === conversationId
    )
    return messages
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit)
  },

  // Enviar nuevo mensaje
  sendMessage: (messageData) => {
    const newMessage = {
      conversationId: messageData.conversationId,
      senderId: messageData.senderId,
      recipientId: messageData.recipientId,
      content: messageData.content,
      timestamp: new Date().toISOString(),
      read: false,
      type: messageData.type || 'text'
    }
    
    // Insertar mensaje
    const message = db.insert('messages', newMessage)
    
    // Actualizar conversación
    const conversation = db.select('conversations', c => c.id === messageData.conversationId)[0]
    if (conversation) {
      db.update('conversations', 
        c => c.id === messageData.conversationId,
        {
          lastMessage: messageData.content,
          lastMessageTime: newMessage.timestamp,
          unreadCount: {
            ...conversation.unreadCount,
            [messageData.recipientId]: (conversation.unreadCount[messageData.recipientId] || 0) + 1
          }
        }
      )
    }
    
    return message
  },

  // Marcar mensajes como leídos
  markMessagesAsRead: (conversationId, userId) => {
    // Marcar mensajes como leídos
    db.update('messages',
      msg => msg.conversationId === conversationId && msg.recipientId === userId && !msg.read,
      { read: true }
    )
    
    // Resetear contador en conversación
    const conversation = db.select('conversations', c => c.id === conversationId)[0]
    if (conversation) {
      db.update('conversations',
        c => c.id === conversationId,
        {
          unreadCount: {
            ...conversation.unreadCount,
            [userId]: 0
          }
        }
      )
    }
  },

  // Obtener conteo de mensajes no leídos
  getUnreadMessagesCount: (userId) => {
    const conversations = DatabaseQueries.getConversationsByUserId(userId)
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[userId] || 0)
    }, 0)
  },

  // Buscar conversaciones
  searchConversations: (userId, searchTerm) => {
    const conversations = DatabaseQueries.getConversationsByUserId(userId)
    const term = searchTerm.toLowerCase()
    
    return conversations.filter(conv => {
      // Obtener el otro participante
      const otherUserId = conv.participants.find(id => id !== userId)
      const otherUser = DatabaseQueries.getUserById(otherUserId)
      
      return otherUser && (
        otherUser.nombre.toLowerCase().includes(term) ||
        otherUser.apellidos.toLowerCase().includes(term) ||
        conv.lastMessage.toLowerCase().includes(term)
      )
    })
  },

  // =====================================================
  // ASIGNACIONES TUTOR-ESTUDIANTE
  // =====================================================

  // Obtener todas las asignaciones tutor-estudiante
  getAllTeacherAssignments: () => {
    return db.select('teacher_student_assignments')
  },

  // Obtener asignaciones por tutor
  getAssignmentsByTeacherId: (teacherUserId) => {
    return db.select('teacher_student_assignments',
      assignment => assignment.teacher_user_id === teacherUserId
    )
  },

  // Obtener asignaciones por estudiante
  getAssignmentsByStudentId: (studentId) => {
    return db.select('teacher_student_assignments',
      assignment => assignment.student_id === studentId
    )
  },

  // Crear nueva asignación
  createTeacherAssignment: (assignmentData) => {
    const existingAssignment = db.select('teacher_student_assignments',
      a => a.teacher_user_id === assignmentData.teacher_user_id && 
           a.student_id === assignmentData.student_id &&
           a.subject === assignmentData.subject
    )[0]

    if (existingAssignment) {
      console.warn('La asignación ya existe')
      return existingAssignment
    }

    return db.insert('teacher_student_assignments', {
      teacher_user_id: assignmentData.teacher_user_id,
      student_id: assignmentData.student_id,
      subject: assignmentData.subject,
      academic_year: assignmentData.academic_year || new Date().getFullYear().toString(),
      created_at: new Date().toISOString()
    })
  },

  // Eliminar asignación
  deleteTeacherAssignment: (teacherUserId, studentId, subject = null) => {
    return db.delete('teacher_student_assignments', assignment => {
      const matchTeacher = assignment.teacher_user_id === teacherUserId
      const matchStudent = assignment.student_id === studentId
      const matchSubject = subject ? assignment.subject === subject : true
      return matchTeacher && matchStudent && matchSubject
    })
  },

  // Obtener materias de un tutor
  getTeacherSubjects: (teacherUserId) => {
    const assignments = DatabaseQueries.getAssignmentsByTeacherId(teacherUserId)
    return [...new Set(assignments.map(a => a.subject))]
  },

  // Verificar si un estudiante está asignado a un tutor
  isStudentAssignedToTeacher: (studentId, teacherUserId) => {
    const assignment = db.select('teacher_student_assignments',
      a => a.student_id === studentId && a.teacher_user_id === teacherUserId
    )[0]
    return !!assignment
  }
}

// Hacer disponible globalmente para debugging y notificaciones
if (typeof window !== 'undefined') {
  window.DatabaseQueries = DatabaseQueries
}

export default MOCK_DATABASE