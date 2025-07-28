// ============================================
// USERS DATA - Single Source of Truth
// ============================================
// Centralizar TODOS los usuarios del sistema aquí
// Esto reemplaza la generación dinámica en authStore.js

export const usersData = [
  // PADRES DE FAMILIA
  {
    id: 1001,
    nombre: 'Carlos',
    apellidos: 'Rodríguez',
    nombreCompleto: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    telefono: '+51 987 654 321',
    direccion: 'Av. Las Flores 123, San Isidro',
    rol: 'padre',
    avatar: '/images/user-carlos.jpg',
    password: '123456', // Solo para demo
    estado: 'activo',
    fechaCreacion: '2024-01-15',
    ultimoAcceso: '2024-07-24',
    // Datos específicos del padre
    hijosIds: [1, 2], // Ana y Luis Rodríguez
    notificacionesActivas: true,
    preferencias: {
      notificacionesEmail: true,
      notificacionesPush: true,
      idioma: 'es'
    }
  },
  {
    id: 1002,
    nombre: 'Miguel',
    apellidos: 'Martinez',
    nombreCompleto: 'Miguel Martinez',
    email: 'miguel.martinez@email.com',
    telefono: '+51 987 654 322',
    direccion: 'Jr. Los Olivos 456, Miraflores',
    rol: 'padre',
    avatar: '/images/user-miguel.jpg',
    password: '123456',
    estado: 'activo',
    fechaCreacion: '2024-01-20',
    ultimoAcceso: '2024-07-23',
    hijosIds: [3], // Sofia Martinez
    notificacionesActivas: true,
    preferencias: {
      notificacionesEmail: true,
      notificacionesPush: false,
      idioma: 'es'
    }
  },
  {
    id: 1003,
    nombre: 'Ana',
    apellidos: 'Silva',
    nombreCompleto: 'Ana Silva',
    email: 'ana.silva@email.com',
    telefono: '+51 987 654 323',
    direccion: 'Calle Lima 789, Surco',
    rol: 'padre',
    avatar: '/images/user-ana.jpg',
    password: '123456',
    estado: 'activo',
    fechaCreacion: '2024-02-01',
    ultimoAcceso: '2024-07-22',
    hijosIds: [4], // Pedro Silva
    notificacionesActivas: true,
    preferencias: {
      notificacionesEmail: true,
      notificacionesPush: true,
      idioma: 'es'
    }
  },

  // TUTORES
  {
    id: 2001,
    nombre: 'María',
    apellidos: 'García',
    nombreCompleto: 'María García',
    email: 'tutor1@email.com',
    telefono: '+51 987 654 340',
    direccion: 'Av. Universitaria 234, Los Olivos',
    rol: 'tutor',
    avatar: '/images/tutor-maria.jpg',
    password: '123456',
    estado: 'activo',
    fechaCreacion: '2023-12-01',
    ultimoAcceso: '2024-07-24',
    // Datos específicos del tutor
    gradosAsignados: ['5to Primaria A', '3ro Primaria B'],
    alumnosAsignados: [1, 2, 3, 4, 5, 6, 7, 8],
    especialidad: 'Educación Primaria',
    experiencia: '8 años',
    notificacionesActivas: true,
    preferencias: {
      notificacionesEmail: true,
      notificacionesPush: true,
      idioma: 'es'
    }
  },

  // ADMINISTRADORES
  {
    id: 3001,
    nombre: 'Juan',
    apellidos: 'Pérez',
    nombreCompleto: 'Dr. Juan Pérez',
    email: 'admin@talentos.edu',
    telefono: '+51 987 654 350',
    direccion: 'Oficina Administrativa - Talentos College',
    rol: 'admin',
    avatar: '/images/admin-juan.jpg',
    password: '123456',
    estado: 'activo',
    fechaCreacion: '2023-01-01',
    ultimoAcceso: '2024-07-24',
    // Datos específicos del admin
    nivelAcceso: 'super_admin',
    departamento: 'Dirección General',
    permisos: ['gestionar_usuarios', 'ver_reportes', 'enviar_comunicados_masivos'],
    notificacionesActivas: true,
    preferencias: {
      notificacionesEmail: true,
      notificacionesPush: true,
      idioma: 'es'
    }
  },

  // PERSONAL DE ENTRADA
  {
    id: 4001,
    nombre: 'Pedro',
    apellidos: 'Sánchez',
    nombreCompleto: 'Pedro Sánchez',
    email: 'entrada@talentos.edu',
    telefono: '+51 987 654 360',
    direccion: 'Garita de Seguridad - Talentos College',
    rol: 'entrada',
    avatar: '/images/entrada-pedro.jpg',
    password: '123456',
    estado: 'activo',
    fechaCreacion: '2023-06-15',
    ultimoAcceso: '2024-07-24',
    // Datos específicos del personal de entrada
    turno: 'mañana',
    horarioInicio: '07:00',
    horarioFin: '14:00',
    notificacionesActivas: true,
    preferencias: {
      notificacionesEmail: false,
      notificacionesPush: true,
      idioma: 'es'
    }
  }
]

// Función helper para obtener usuario por email
export const getUserByEmail = (email) => {
  return usersData.find(user => user.email === email)
}

// Función helper para obtener usuario por ID
export const getUserById = (id) => {
  return usersData.find(user => user.id === id)
}

// Función helper para obtener usuarios por rol
export const getUsersByRole = (rol) => {
  return usersData.filter(user => user.rol === rol)
}

// Función helper para obtener hijos de un padre
export const getChildrenByParentEmail = (parentEmail) => {
  const parent = getUserByEmail(parentEmail)
  if (!parent || parent.rol !== 'padre') return []
  
  // Importar alumnosMock dinámicamente para evitar circular dependencies
  return parent.hijosIds || []
}

export default usersData