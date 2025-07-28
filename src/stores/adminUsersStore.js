import { create } from 'zustand'

const useAdminUsersStore = create((set, get) => ({
  cargando: false,
  usuarios: [],
  filtros: {
    tipo: 'all',
    estado: 'all',
    grado: 'all',
    departamento: 'all'
  },
  paginacion: {
    pagina: 1,
    totalPaginas: 1,
    elementosPorPagina: 12,
    total: 0
  },
  configuraciones: {},
  
  cargarUsuarios: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const usuarios = [
        // PROFESORES
        {
          id: 1,
          nombre: 'María García',
          email: 'maria.garcia@talentoscolegio.edu',
          tipo: 'profesor',
          estado: 'activo',
          avatar: null,
          fechaRegistro: new Date('2023-02-15'),
          ultimaActividad: new Date(Date.now() - 15 * 60 * 1000),
          grado: '5to A',
          materia: 'Matemáticas',
          telefono: '+51 999 123 456',
          documento: '12345678',
          direccion: 'Av. Los Álamos 123, San Isidro',
          experiencia: 8,
          certificaciones: ['Matemáticas Avanzadas', 'Pedagogía Moderna'],
          horario: 'Mañana',
          comunicadosEnviados: 47,
          calificacionPromedio: 4.8,
          permisos: ['dashboard', 'estudiantes', 'calificaciones', 'comunicados']
        },
        {
          id: 2,
          nombre: 'Roberto Silva',
          email: 'roberto.silva@talentoscolegio.edu',
          tipo: 'profesor',
          estado: 'activo',
          avatar: null,
          fechaRegistro: new Date('2022-08-10'),
          ultimaActividad: new Date(Date.now() - 32 * 60 * 1000),
          grado: 'Todos',
          materia: 'Educación Física',
          telefono: '+51 999 234 567',
          documento: '23456789',
          direccion: 'Jr. Las Flores 456, Miraflores',
          experiencia: 12,
          certificaciones: ['Entrenamiento Deportivo', 'Primeros Auxilios'],
          horario: 'Completo',
          comunicadosEnviados: 23,
          calificacionPromedio: 4.7,
          permisos: ['dashboard', 'estudiantes', 'actividades', 'comunicados']
        },
        {
          id: 3,
          nombre: 'José López',
          email: 'jose.lopez@talentoscolegio.edu',
          tipo: 'profesor',
          estado: 'activo',
          avatar: null,
          fechaRegistro: new Date('2023-01-20'),
          ultimaActividad: new Date(Date.now() - 2 * 60 * 60 * 1000),
          grado: '4to B',
          materia: 'Comunicación',
          telefono: '+51 999 345 678',
          documento: '34567890',
          direccion: 'Av. Universitaria 789, Los Olivos',
          experiencia: 10,
          certificaciones: ['Literatura Moderna', 'Redacción Académica'],
          horario: 'Mañana',
          comunicadosEnviados: 31,
          calificacionPromedio: 4.6,
          permisos: ['dashboard', 'estudiantes', 'calificaciones', 'comunicados']
        },
        
        // PADRES DE FAMILIA
        {
          id: 4,
          nombre: 'Ana Torres',
          email: 'ana.torres@gmail.com',
          tipo: 'padre',
          estado: 'activo',
          avatar: null,
          fechaRegistro: new Date('2023-03-05'),
          ultimaActividad: new Date(Date.now() - 45 * 60 * 1000),
          estudiante: 'Isabella Santos Torres',
          grado: '5to A',
          telefono: '+51 999 456 789',
          documento: '45678901',
          direccion: 'Calle Los Rosales 321, San Borja',
          ocupacion: 'Ingeniera de Sistemas',
          empresa: 'TechSolutions SAC',
          mensajesEnviados: 15,
          reunionesAsistidas: 8,
          satisfaccion: 4.7,
          permisos: ['dashboard', 'calificaciones', 'mensajes', 'comunicados']
        },
        {
          id: 5,
          nombre: 'Carlos Mendoza',
          email: 'carlos.mendoza@outlook.com',
          tipo: 'padre',
          estado: 'activo',
          avatar: null,
          fechaRegistro: new Date('2023-02-28'),
          ultimaActividad: new Date(Date.now() - 2 * 60 * 60 * 1000),
          estudiante: 'Diego Vargas Mendoza',
          grado: '5to A',
          telefono: '+51 999 567 890',
          documento: '56789012',
          direccion: 'Av. Javier Prado 654, La Molina',
          ocupacion: 'Contador',
          empresa: 'Consultora Financiera',
          mensajesEnviados: 8,
          reunionesAsistidas: 5,
          satisfaccion: 4.2,
          permisos: ['dashboard', 'calificaciones', 'mensajes', 'comunicados']
        },
        
        // ADMINISTRATIVOS
        {
          id: 6,
          nombre: 'Patricia López',
          email: 'patricia.lopez@talentoscolegio.edu',
          tipo: 'administrativo',
          estado: 'activo',
          avatar: null,
          fechaRegistro: new Date('2022-05-15'),
          ultimaActividad: new Date(Date.now() - 20 * 60 * 1000),
          cargo: 'Secretaria Académica',
          departamento: 'Administración',
          telefono: '+51 999 678 901',
          documento: '67890123',
          direccion: 'Jr. Independencia 987, Pueblo Libre',
          experiencia: 15,
          horario: 'Completo',
          tareasPendientes: 5,
          eficiencia: 95,
          permisos: ['dashboard', 'usuarios', 'reportes', 'configuracion']
        },
        {
          id: 7,
          nombre: 'Miguel Ramírez',
          email: 'miguel.ramirez@talentoscolegio.edu',
          tipo: 'administrativo',
          estado: 'activo',
          avatar: null,
          fechaRegistro: new Date('2023-01-10'),
          ultimaActividad: new Date(Date.now() - 1 * 60 * 60 * 1000),
          cargo: 'Coordinador Académico',
          departamento: 'Coordinación',
          telefono: '+51 999 789 012',
          documento: '78901234',
          direccion: 'Av. Benavides 147, Surco',
          experiencia: 7,
          horario: 'Mañana',
          tareasPendientes: 12,
          eficiencia: 88,
          permisos: ['dashboard', 'profesores', 'estudiantes', 'reportes', 'comunicados']
        },
        
        // ESTUDIANTES (MUESTRA)
        {
          id: 8,
          nombre: 'Isabella Santos Torres',
          email: 'isabella.santos@estudiante.talentoscolegio.edu',
          tipo: 'estudiante',
          estado: 'activo',
          avatar: null,
          fechaRegistro: new Date('2023-03-01'),
          ultimaActividad: new Date(Date.now() - 3 * 60 * 60 * 1000),
          grado: '5to A',
          seccion: 'A',
          padre: 'Ana Torres',
          telefono: '+51 999 456 789',
          documento: '98765432',
          direccion: 'Calle Los Rosales 321, San Borja',
          fechaNacimiento: new Date('2013-05-15'),
          promedioGeneral: 18.5,
          asistencia: 96,
          comportamiento: 'Excelente',
          permisos: ['dashboard', 'tareas', 'calificaciones']
        },
        {
          id: 9,
          nombre: 'Diego Vargas Mendoza',
          email: 'diego.vargas@estudiante.talentoscolegio.edu',
          tipo: 'estudiante',
          estado: 'activo',
          avatar: null,
          fechaRegistro: new Date('2023-03-01'),
          ultimaActividad: new Date(Date.now() - 5 * 60 * 60 * 1000),
          grado: '5to A',
          seccion: 'A',
          padre: 'Carlos Mendoza',
          telefono: '+51 999 567 890',
          documento: '87654321',
          direccion: 'Av. Javier Prado 654, La Molina',
          fechaNacimiento: new Date('2013-08-22'),
          promedioGeneral: 15.8,
          asistencia: 89,
          comportamiento: 'Bueno',
          permisos: ['dashboard', 'tareas', 'calificaciones']
        },
        
        // USUARIOS INACTIVOS/SUSPENDIDOS
        {
          id: 10,
          nombre: 'Carmen Flores',
          email: 'carmen.flores@talentoscolegio.edu',
          tipo: 'profesor',
          estado: 'suspendido',
          avatar: null,
          fechaRegistro: new Date('2022-11-01'),
          ultimaActividad: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          grado: '3er B',
          materia: 'Ciencias',
          telefono: '+51 999 890 123',
          documento: '89012345',
          direccion: 'Av. Larco 258, Miraflores',
          experiencia: 6,
          motivoSuspension: 'Ausencias injustificadas',
          fechaSuspension: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          permisos: []
        }
      ]
      
      const configuraciones = {
        tiposUsuario: {
          'profesor': 'Profesor',
          'padre': 'Padre de Familia',
          'administrativo': 'Administrativo',
          'estudiante': 'Estudiante'
        },
        estados: {
          'activo': 'Activo',
          'inactivo': 'Inactivo',
          'suspendido': 'Suspendido',
          'pendiente': 'Pendiente'
        },
        grados: [
          '1er A', '1er B',
          '2do A', '2do B',
          '3er A', '3er B',
          '4to A', '4to B',
          '5to A', '5to B',
          'Todos'
        ],
        departamentos: [
          'Administración',
          'Coordinación',
          'Dirección',
          'Soporte',
          'Mantenimiento'
        ],
        permisos: {
          'dashboard': 'Panel Principal',
          'usuarios': 'Gestión de Usuarios',
          'estudiantes': 'Gestión de Estudiantes',
          'profesores': 'Gestión de Profesores',
          'calificaciones': 'Calificaciones',
          'comunicados': 'Comunicados',
          'mensajes': 'Mensajes',
          'reportes': 'Reportes',
          'configuracion': 'Configuración',
          'tareas': 'Tareas',
          'actividades': 'Actividades'
        },
        rolesPermitidos: {
          'profesor': ['dashboard', 'estudiantes', 'calificaciones', 'comunicados', 'mensajes', 'actividades'],
          'padre': ['dashboard', 'calificaciones', 'mensajes', 'comunicados'],
          'administrativo': ['dashboard', 'usuarios', 'profesores', 'estudiantes', 'reportes', 'configuracion', 'comunicados'],
          'estudiante': ['dashboard', 'tareas', 'calificaciones'],
          'admin': ['*'] // Todos los permisos
        }
      }
      
      set({
        usuarios,
        configuraciones,
        cargando: false,
        paginacion: {
          ...get().paginacion,
          total: usuarios.length,
          totalPaginas: Math.ceil(usuarios.length / get().paginacion.elementosPorPagina)
        }
      })
    }, 800)
  },
  
  crearUsuario: (nuevoUsuario) => {
    const { usuarios } = get()
    const usuario = {
      id: Date.now(),
      ...nuevoUsuario,
      fechaRegistro: new Date(),
      ultimaActividad: new Date(),
      estado: 'activo',
      avatar: null
    }
    
    set({ usuarios: [usuario, ...usuarios] })
    return usuario.id
  },
  
  editarUsuario: (usuarioId, cambios) => {
    const { usuarios } = get()
    const nuevosUsuarios = usuarios.map(usuario =>
      usuario.id === usuarioId
        ? { ...usuario, ...cambios }
        : usuario
    )
    set({ usuarios: nuevosUsuarios })
  },
  
  eliminarUsuario: (usuarioId) => {
    const { usuarios } = get()
    const nuevosUsuarios = usuarios.filter(usuario => usuario.id !== usuarioId)
    set({ usuarios: nuevosUsuarios })
  },
  
  cambiarEstadoUsuario: (usuarioId, nuevoEstado, motivo = '') => {
    const { usuarios } = get()
    const nuevosUsuarios = usuarios.map(usuario =>
      usuario.id === usuarioId
        ? { 
            ...usuario, 
            estado: nuevoEstado,
            motivoSuspension: nuevoEstado === 'suspendido' ? motivo : undefined,
            fechaSuspension: nuevoEstado === 'suspendido' ? new Date() : undefined
          }
        : usuario
    )
    set({ usuarios: nuevosUsuarios })
  },
  
  actualizarPermisos: (usuarioId, nuevosPermisos) => {
    const { usuarios } = get()
    const nuevosUsuarios = usuarios.map(usuario =>
      usuario.id === usuarioId
        ? { ...usuario, permisos: nuevosPermisos }
        : usuario
    )
    set({ usuarios: nuevosUsuarios })
  },
  
  obtenerUsuariosPorFiltros: () => {
    const { usuarios, filtros, paginacion } = get()
    let resultado = [...usuarios]
    
    // Filtrar por tipo
    if (filtros.tipo !== 'all') {
      resultado = resultado.filter(u => u.tipo === filtros.tipo)
    }
    
    // Filtrar por estado
    if (filtros.estado !== 'all') {
      resultado = resultado.filter(u => u.estado === filtros.estado)
    }
    
    // Filtrar por grado
    if (filtros.grado !== 'all') {
      resultado = resultado.filter(u => u.grado === filtros.grado)
    }
    
    // Filtrar por departamento (administrativos)
    if (filtros.departamento !== 'all') {
      resultado = resultado.filter(u => u.departamento === filtros.departamento)
    }
    
    // Ordenar por fecha de registro (más reciente primero)
    resultado.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    
    // Paginación
    const inicio = (paginacion.pagina - 1) * paginacion.elementosPorPagina
    const fin = inicio + paginacion.elementosPorPagina
    
    return {
      usuarios: resultado.slice(inicio, fin),
      total: resultado.length,
      totalPaginas: Math.ceil(resultado.length / paginacion.elementosPorPagina)
    }
  },
  
  buscarUsuarios: (termino) => {
    const { usuarios } = get()
    if (!termino.trim()) return usuarios
    
    const terminoLower = termino.toLowerCase()
    return usuarios.filter(usuario =>
      usuario.nombre.toLowerCase().includes(terminoLower) ||
      usuario.email.toLowerCase().includes(terminoLower) ||
      usuario.documento?.includes(termino) ||
      usuario.telefono?.includes(termino) ||
      usuario.tipo.toLowerCase().includes(terminoLower)
    )
  },
  
  actualizarFiltros: (nuevosFiltros) => {
    set({ 
      filtros: { ...get().filtros, ...nuevosFiltros },
      paginacion: { ...get().paginacion, pagina: 1 } // Reset página al filtrar
    })
  },
  
  cambiarPagina: (nuevaPagina) => {
    set({ 
      paginacion: { ...get().paginacion, pagina: nuevaPagina }
    })
  },
  
  obtenerEstadisticas: () => {
    const { usuarios } = get()
    
    return {
      total: usuarios.length,
      activos: usuarios.filter(u => u.estado === 'activo').length,
      inactivos: usuarios.filter(u => u.estado === 'inactivo').length,
      suspendidos: usuarios.filter(u => u.estado === 'suspendido').length,
      porTipo: {
        profesores: usuarios.filter(u => u.tipo === 'profesor').length,
        padres: usuarios.filter(u => u.tipo === 'padre').length,
        administrativos: usuarios.filter(u => u.tipo === 'administrativo').length,
        estudiantes: usuarios.filter(u => u.tipo === 'estudiante').length
      },
      nuevosEstesMes: usuarios.filter(u => {
        const fechaRegistro = new Date(u.fechaRegistro)
        const haceUnMes = new Date()
        haceUnMes.setMonth(haceUnMes.getMonth() - 1)
        return fechaRegistro > haceUnMes
      }).length,
      conectadosHoy: usuarios.filter(u => {
        const ultimaActividad = new Date(u.ultimaActividad)
        const hoy = new Date()
        return ultimaActividad.toDateString() === hoy.toDateString()
      }).length
    }
  },
  
  exportarUsuarios: async (formato = 'excel') => {
    const { usuarios } = get()
    
    try {
      // Importar dinámicamente el exportador
      const { ExcelExporter } = await import('../utils/excelExporter')
      
      // Exportar con formato real
      const resultado = ExcelExporter.exportarUsuarios(usuarios)
      
      if (resultado.success) {
        // Mostrar notificación de éxito
        return resultado
      } else {
        throw new Error(resultado.error)
      }
      
    } catch (error) {
      console.error('Error en exportación:', error)
      return {
        success: false,
        error: error.message || 'Error al exportar usuarios',
        mensaje: 'No se pudo completar la exportación'
      }
    }
  },
  
  importarUsuarios: (archivo) => {
    // Simular importación
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (archivo.type.includes('excel') || archivo.type.includes('csv')) {
          const nuevosUsuarios = [
            // Ejemplo de usuarios importados
            {
              id: Date.now(),
              nombre: 'Usuario Importado',
              email: 'importado@ejemplo.com',
              tipo: 'profesor',
              estado: 'pendiente',
              fechaRegistro: new Date()
            }
          ]
          
          const { usuarios } = get()
          set({ usuarios: [...nuevosUsuarios, ...usuarios] })
          
          resolve({
            success: true,
            procesados: nuevosUsuarios.length,
            errores: 0
          })
        } else {
          reject(new Error('Formato de archivo no válido'))
        }
      }, 2000)
    })
  },
  
  duplicarUsuario: (usuarioId) => {
    const { usuarios } = get()
    const usuarioOriginal = usuarios.find(u => u.id === usuarioId)
    
    if (usuarioOriginal) {
      const usuarioDuplicado = {
        ...usuarioOriginal,
        id: Date.now(),
        nombre: `Copia de ${usuarioOriginal.nombre}`,
        email: `copia_${usuarioOriginal.email}`,
        estado: 'pendiente',
        fechaRegistro: new Date(),
        ultimaActividad: new Date()
      }
      
      set({ usuarios: [usuarioDuplicado, ...usuarios] })
      return usuarioDuplicado.id
    }
  }
}))

export default useAdminUsersStore