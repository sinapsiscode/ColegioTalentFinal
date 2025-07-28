import { create } from 'zustand'
import { DatabaseQueries } from '../data/databaseSchema'
import useAuthStore from './authStore'

const useStudentsStore = create((set, get) => ({
  alumnos: [],
  cargando: false,
  error: null,
  
  cargarAlumnos: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      // FILTRAR POR ROL DEL USUARIO
      const authStore = useAuthStore.getState()
      const { usuario, rol } = authStore
      
      let alumnos = []
      
      if (rol === 'padre' && usuario) {
        // Padre solo ve sus hijos
        alumnos = DatabaseQueries.getChildrenByParentId(usuario.id)
      } else if (rol === 'tutor' && usuario) {
        // Tutor solo ve sus estudiantes asignados
        alumnos = DatabaseQueries.getStudentsByTeacherId(usuario.id)
      } else if (rol === 'admin') {
        // Admin ve todos
        alumnos = DatabaseQueries.getAllStudents()
      }
      
      set({ 
        alumnos, 
        cargando: false 
      })
    }, 500)
  },

  cargarAlumnosLegacy: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const alumnos = [
        {
          id: 1,
          nombre: 'Ana Rodríguez',
          apellidos: 'González',
          grado: '5to Primaria',
          seccion: 'A',
          codigoQR: 'QR001',
          padre: 'Carlos Rodríguez',
          telefono: '+51 987 654 321',
          foto: '/images/student1.jpg',
          notas: [
            { materia: 'Matemáticas', nota: 18, periodo: 'I Bimestre' },
            { materia: 'Comunicación', nota: 17, periodo: 'I Bimestre' },
            { materia: 'Ciencias', nota: 19, periodo: 'I Bimestre' }
          ]
        },
        {
          id: 2,
          nombre: 'Luis Rodríguez',
          apellidos: 'González',
          grado: '3ro Primaria',
          seccion: 'B',
          codigoQR: 'QR002',
          padre: 'Carlos Rodríguez',
          telefono: '+51 987 654 321',
          foto: '/images/student2.jpg',
          notas: [
            { materia: 'Matemáticas', nota: 16, periodo: 'I Bimestre' },
            { materia: 'Comunicación', nota: 18, periodo: 'I Bimestre' },
            { materia: 'Ciencias', nota: 17, periodo: 'I Bimestre' }
          ]
        },
        {
          id: 3,
          nombre: 'Sofia Martinez',
          apellidos: 'López',
          grado: '4to Primaria',
          seccion: 'A',
          codigoQR: 'QR003',
          padre: 'Miguel Martinez',
          telefono: '+51 987 654 322',
          foto: '/images/student3.jpg',
          notas: [
            { materia: 'Matemáticas', nota: 20, periodo: 'I Bimestre' },
            { materia: 'Comunicación', nota: 19, periodo: 'I Bimestre' },
            { materia: 'Ciencias', nota: 20, periodo: 'I Bimestre' }
          ]
        },
        {
          id: 4,
          nombre: 'Diego Fernández',
          apellidos: 'Ruiz',
          grado: '6to Primaria',
          seccion: 'B',
          codigoQR: 'QR004',
          padre: 'Roberto Fernández',
          telefono: '+51 987 654 323',
          foto: '/images/student4.jpg',
          notas: [
            { materia: 'Matemáticas', nota: 15, periodo: 'I Bimestre' },
            { materia: 'Comunicación', nota: 16, periodo: 'I Bimestre' },
            { materia: 'Ciencias', nota: 18, periodo: 'I Bimestre' }
          ]
        },
        {
          id: 5,
          nombre: 'Valentina Torres',
          apellidos: 'Méndez',
          grado: '2do Primaria',
          seccion: 'A',
          codigoQR: 'QR005',
          padre: 'Carmen Torres',
          telefono: '+51 987 654 324',
          foto: '/images/student5.jpg',
          notas: [
            { materia: 'Matemáticas', nota: 19, periodo: 'I Bimestre' },
            { materia: 'Comunicación', nota: 20, periodo: 'I Bimestre' },
            { materia: 'Ciencias', nota: 18, periodo: 'I Bimestre' }
          ]
        }
      ]
      
      set({ alumnos, cargando: false })
    }, 1000)
  },
  
  obtenerAlumnoPorId: (id) => {
    const { alumnos } = get()
    return alumnos.find(alumno => alumno.id === id)
  },
  
  obtenerAlumnosPorPadre: (nombrePadre) => {
    const { alumnos } = get()
    return alumnos.filter(alumno => alumno.padre === nombrePadre)
  },

  // Nueva función para obtener alumnos por ID del padre (arquitectura profesional)
  obtenerAlumnosPorPadreId: (padreUserId) => {
    return DatabaseQueries.getChildrenByParentId(padreUserId)
  },

  // Función legacy - mantener por compatibilidad
  obtenerAlumnosPorEmailPadre: (emailPadre) => {
    // Convertir email a user ID primero
    const padre = DatabaseQueries.getUserByEmail(emailPadre)
    if (!padre) return []
    
    return DatabaseQueries.getChildrenByParentId(padre.id)
  },
  
  buscarAlumnos: (termino) => {
    const { alumnos } = get()
    const terminoLower = termino.toLowerCase()
    
    return alumnos.filter(alumno => 
      alumno.nombre.toLowerCase().includes(terminoLower) ||
      alumno.apellidos.toLowerCase().includes(terminoLower) ||
      alumno.grado.toLowerCase().includes(terminoLower) ||
      alumno.seccion.toLowerCase().includes(terminoLower)
    )
  },

  // Exportar estudiantes a Excel
  exportarEstudiantes: async (formato = 'excel') => {
    const { alumnos } = get()
    
    try {
      // Importar dinámicamente el exportador
      const { ExcelExporter } = await import('../utils/excelExporter')
      
      // Exportar con formato real
      const resultado = ExcelExporter.exportarEstudiantes(alumnos)
      
      if (resultado.success) {
        return resultado
      } else {
        throw new Error(resultado.error)
      }
      
    } catch (error) {
      console.error('Error en exportación:', error)
      return {
        success: false,
        error: error.message || 'Error al exportar estudiantes',
        mensaje: 'No se pudo completar la exportación'
      }
    }
  }
}))

export default useStudentsStore