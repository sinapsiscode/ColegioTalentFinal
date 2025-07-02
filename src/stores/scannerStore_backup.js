import { create } from 'zustand'
import useAttendanceStore from './attendanceStore'
import { alumnosMock } from '../data/mockData'

const useScannerStore = create((set, get) => ({
  // Estados principales
  cargando: false,
  escaneando: false,
  registrosAsistencia: [],
  estudiantesPresentes: [],
  estudiantesAusentes: [],
  configuracionEscaner: {
    modoOperacion: 'entrada', // entrada, salida, ambos
    sonidoActivado: true,
    vibracionActivada: true,
    autoRegistro: true,
    tiempoEspera: 3000,
    formatoFecha: 'dd/MM/yyyy HH:mm:ss'
  },
  estadisticasDelDia: {
    totalEscaneos: 0,
    estudiantes: 0,
    profesores: 0,
    personal: 0,
    visitantes: 0,
    entradas: 0,
    salidas: 0,
    primeraEntrada: null,
    ultimaEntrada: null
  },
  errorEscaner: null,

  // Inicializar datos del día
  inicializarDatos: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const ahora = new Date()
      const hoy = ahora.toDateString()
      
      // Simular datos de estudiantes registrados
      const estudiantesRegistrados = [
        {
          id: 'EST001',
          codigo: 'E001234567890',
          nombre: 'Ana María García López',
          grado: '5to A',
          seccion: 'A',
          fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
          estado: 'activo',
          telefono: '+51 987 654 321',
          correo: 'ana.garcia@talentos.edu.pe',
          fechaNacimiento: '2010-05-15',
          direccion: 'Av. Principal 123, San Miguel'
        },
        {
          id: 'EST002',
          codigo: 'E002345678901',
          nombre: 'Carlos Eduardo Mendoza Silva',
          grado: '4to B',
          seccion: 'B',
          fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
          estado: 'activo',
          telefono: '+51 987 654 322',
          correo: 'carlos.mendoza@talentos.edu.pe',
          fechaNacimiento: '2011-08-22',
          direccion: 'Jr. Los Alamos 456, Pueblo Libre'
        },
        {
          id: 'EST003',
          codigo: 'E003456789012',
          nombre: 'María José Rodríguez Vargas',
          grado: '3ro C',
          seccion: 'C',
          fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
          estado: 'activo',
          telefono: '+51 987 654 323',
          correo: 'maria.rodriguez@talentos.edu.pe',
          fechaNacimiento: '2012-03-10',
          direccion: 'Calle Las Flores 789, Magdalena'
        },
        {
          id: 'EST004',
          codigo: 'E004567890123',
          nombre: 'Diego Alexander Fernández Castro',
          grado: '2do A',
          seccion: 'A',
          fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
          estado: 'activo',
          telefono: '+51 987 654 324',
          correo: 'diego.fernandez@talentos.edu.pe',
          fechaNacimiento: '2013-12-05',
          direccion: 'Av. Universitaria 321, San Martín'
        },
        {
          id: 'EST005',
          codigo: 'E005678901234',
          nombre: 'Sofía Isabella Torres Morales',
          grado: '1ro B',
          seccion: 'B',
          fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
          estado: 'activo',
          telefono: '+51 987 654 325',
          correo: 'sofia.torres@talentos.edu.pe',
          fechaNacimiento: '2014-07-18',
          direccion: 'Jr. 28 de Julio 654, Jesús María'
        }
      ]

      // Simular registros de asistencia del día
      const registrosHoy = [
        {
          id: 'REG001',
          estudiante: estudiantesRegistrados[0],
          tipo: 'entrada',
          fecha: new Date(ahora.getTime() - 2 * 60 * 60 * 1000), // 2 horas atrás
          metodo: 'qr',
          ubicacion: 'Puerta Principal',
          usuario: 'Personal de Entrada',
          observaciones: '',
          estado: 'confirmado'
        },
        {
          id: 'REG002',
          estudiante: estudiantesRegistrados[1],
          tipo: 'entrada',
          fecha: new Date(ahora.getTime() - 1.5 * 60 * 60 * 1000), // 1.5 horas atrás
          metodo: 'qr',
          ubicacion: 'Puerta Principal',
          usuario: 'Personal de Entrada',
          observaciones: '',
          estado: 'confirmado'
        },
        {
          id: 'REG003',
          estudiante: estudiantesRegistrados[2],
          tipo: 'entrada',
          fecha: new Date(ahora.getTime() - 1 * 60 * 60 * 1000), // 1 hora atrás
          metodo: 'qr',
          ubicacion: 'Puerta Principal',
          usuario: 'Personal de Entrada',
          observaciones: '',
          estado: 'confirmado'
        }
      ]

      const presentes = registrosHoy.filter(r => r.tipo === 'entrada').map(r => r.estudiante)
      const ausentes = estudiantesRegistrados.filter(e => !presentes.find(p => p.id === e.id))

      const estadisticas = {
        totalEscaneos: registrosHoy.length,
        estudiantes: presentes.length,
        profesores: 0,
        personal: 0,
        visitantes: 0,
        entradas: registrosHoy.filter(r => r.tipo === 'entrada').length,
        salidas: registrosHoy.filter(r => r.tipo === 'salida').length,
        primeraEntrada: registrosHoy.length > 0 ? Math.min(...registrosHoy.map(r => r.fecha.getTime())) : null,
        ultimaEntrada: registrosHoy.length > 0 ? Math.max(...registrosHoy.map(r => r.fecha.getTime())) : null
      }

      set({
        registrosAsistencia: registrosHoy,
        estudiantesPresentes: presentes,
        estudiantesAusentes: ausentes,
        estadisticasDelDia: estadisticas,
        cargando: false
      })
    }, 1000)
  },

  // Iniciar escáner
  iniciarEscaner: () => {
    set({ escaneando: true, errorEscaner: null })
    
    // Simular tiempo de inicialización del escáner
    setTimeout(() => {
      console.log('Escáner QR iniciado')
    }, 500)
  },

  // Detener escáner
  detenerEscaner: () => {
    set({ escaneando: false })
    console.log('Escáner QR detenido')
  },

  // Procesar código QR escaneado
  procesarCodigoQR: (codigoQR) => {
    const { configuracionEscaner } = get()
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Mapear códigos QR a IDs de estudiantes del mockData
          const codigoToId = {
            'E001234567890': 1,
            'E002345678901': 2, 
            'E003456789012': 3,
            'E004567890123': 4,
            'E005678901234': 5,
            'E006789012345': 6
          }

          const alumnoId = codigoToId[codigoQR]
          if (!alumnoId) {
            throw new Error('Código QR no válido o estudiante no encontrado')
          }

          const estudiante = alumnosMock.find(a => a.id === alumnoId)
          if (!estudiante) {
            throw new Error('Estudiante no encontrado en el sistema')
          }

          // Obtener registro actual del estudiante
          const { obtenerRegistroHoy } = useAttendanceStore.getState()
          const registroHoy = obtenerRegistroHoy(alumnoId)

          // Determinar tipo de registro basado en configuración
          let tipoRegistro = configuracionEscaner.modoOperacion
          
          if (configuracionEscaner.modoOperacion === 'ambos') {
            // Si ya tiene entrada y no tiene salida, entonces es salida
            if (registroHoy?.horaEntrada && !registroHoy?.horaSalida) {
              tipoRegistro = 'salida'
            } else {
              tipoRegistro = 'entrada'
            }
          } else if (configuracionEscaner.modoOperacion === 'entrada' && registroHoy?.horaEntrada) {
            throw new Error('Ya se registró la entrada de este estudiante hoy')
          } else if (configuracionEscaner.modoOperacion === 'salida' && !registroHoy?.horaEntrada) {
            throw new Error('No se puede registrar salida sin haber registrado entrada')
          }

          // Registrar en attendanceStore
          const { registrarAsistencia } = useAttendanceStore.getState()
          const resultado = registrarAsistencia(alumnoId, tipoRegistro)

          if (!resultado.success) {
            throw new Error(resultado.mensaje)
          }

          // Crear registro para scanner
          const nuevoRegistro = {
            id: `REG${Date.now()}`,
            estudiante: {
              id: estudiante.id,
              codigo: codigoQR,
              nombre: estudiante.nombreCompleto,
              grado: estudiante.grado,
              seccion: estudiante.seccion,
              fotoUrl: estudiante.foto || '/images/default-avatar.jpg'
            },
            tipo: tipoRegistro,
            fecha: new Date(),
            metodo: 'qr',
            ubicacion: 'Puerta Principal',
            usuario: 'Personal de Entrada',
            observaciones: '',
            estado: 'confirmado'
          }

          // Actualizar registros del scanner
          const { registrosAsistencia } = get()
          const nuevosRegistros = [...registrosAsistencia, nuevoRegistro]

          // Actualizar estadísticas del scanner
          const { obtenerEstadisticasHoy, obtenerEstudiantesEnEscuela } = useAttendanceStore.getState()
          const estadisticasAttendance = obtenerEstadisticasHoy()
          const estudiantesEnEscuela = obtenerEstudiantesEnEscuela()

          const estadisticas = {
            totalEscaneos: nuevosRegistros.length,
            estudiantes: estadisticasAttendance.conEntrada,
            profesores: 0,
            personal: 0,
            visitantes: 0,
            entradas: estadisticasAttendance.conEntrada,
            salidas: estadisticasAttendance.conSalida,
            primeraEntrada: nuevosRegistros.length > 0 ? Math.min(...nuevosRegistros.map(r => r.fecha.getTime())) : null,
            ultimaEntrada: nuevosRegistros.length > 0 ? Math.max(...nuevosRegistros.map(r => r.fecha.getTime())) : null
          }

          // Convertir estudiantes en escuela para el formato del scanner
          const estudiantesPresentes = estudiantesEnEscuela.map(reg => {
            const alumno = alumnosMock.find(a => a.id === reg.alumnoId)
            return {
              id: alumno.id,
              codigo: `E00${alumno.id}234567890`,
              nombre: alumno.nombreCompleto,
              grado: alumno.grado,
              seccion: alumno.seccion,
              fotoUrl: alumno.foto || '/images/default-avatar.jpg'
            }
          })

          set({
            registrosAsistencia: nuevosRegistros,
            estudiantesPresentes,
            estadisticasDelDia: estadisticas,
            errorEscaner: null
          })

          // Reproducir sonido y vibración si están activados
          if (configuracionEscaner.sonidoActivado) {
            console.log('🔊 Sonido de éxito')
          }

          if (configuracionEscaner.vibracionActivada && navigator.vibrate) {
            navigator.vibrate([100, 50, 100])
          }

          resolve(nuevoRegistro)
        } catch (error) {
          set({ errorEscaner: error.message })
          reject(error)
        }
      }, 800)
    })
  },
            {
              id: 'EST001',
              codigo: 'E001234567890',
              nombre: 'Ana María García López',
              grado: '5to A',
              seccion: 'A',
              fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
              estado: 'activo',
              telefono: '+51 987 654 321',
              correo: 'ana.garcia@talentos.edu.pe',
              fechaNacimiento: '2010-05-15',
              direccion: 'Av. Principal 123, San Miguel'
            },
            {
              id: 'EST002',
              codigo: 'E002345678901',
              nombre: 'Carlos Eduardo Mendoza Silva',
              grado: '4to B',
              seccion: 'B',
              fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
              estado: 'activo',
              telefono: '+51 987 654 322',
              correo: 'carlos.mendoza@talentos.edu.pe',
              fechaNacimiento: '2011-08-22',
              direccion: 'Jr. Los Alamos 456, Pueblo Libre'
            },
            {
              id: 'EST003',
              codigo: 'E003456789012',
              nombre: 'María José Rodríguez Vargas',
              grado: '3ro C',
              seccion: 'C',
              fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
              estado: 'activo',
              telefono: '+51 987 654 323',
              correo: 'maria.rodriguez@talentos.edu.pe',
              fechaNacimiento: '2012-03-10',
              direccion: 'Calle Las Flores 789, Magdalena'
            },
            {
              id: 'EST004',
              codigo: 'E004567890123',
              nombre: 'Diego Alexander Fernández Castro',
              grado: '2do A',
              seccion: 'A',
              fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
              estado: 'activo',
              telefono: '+51 987 654 324',
              correo: 'diego.fernandez@talentos.edu.pe',
              fechaNacimiento: '2013-12-05',
              direccion: 'Av. Universitaria 321, San Martín'
            },
            {
              id: 'EST005',
              codigo: 'E005678901234',
              nombre: 'Sofía Isabella Torres Morales',
              grado: '1ro B',
              seccion: 'B',
              fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
              estado: 'activo',
              telefono: '+51 987 654 325',
              correo: 'sofia.torres@talentos.edu.pe',
              fechaNacimiento: '2014-07-18',
              direccion: 'Jr. 28 de Julio 654, Jesús María'
            },
            {
              id: 'EST006',
              codigo: 'E006789012345',
              nombre: 'Alejandro Raúl Huamán Quispe',
              grado: '5to B',
              seccion: 'B',
              fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
              estado: 'activo',
              telefono: '+51 987 654 326',
              correo: 'alejandro.huaman@talentos.edu.pe',
              fechaNacimiento: '2010-11-30',
              direccion: 'Av. Brasil 987, Breña'
            }
          ]

          const estudiante = estudiantesRegistrados.find(e => e.codigo === codigoQR)
          
          if (!estudiante) {
            throw new Error('Código QR no válido o estudiante no encontrado')
          }

          if (estudiante.estado !== 'activo') {
            throw new Error('El estudiante no está activo en el sistema')
          }

          // Verificar si ya está presente
          const yaPresente = estudiantesPresentes.find(e => e.id === estudiante.id)
          
          let tipoRegistro = configuracionEscaner.modoOperacion
          if (configuracionEscaner.modoOperacion === 'ambos') {
            tipoRegistro = yaPresente ? 'salida' : 'entrada'
          }

          // Crear nuevo registro
          const nuevoRegistro = {
            id: `REG${Date.now()}`,
            estudiante,
            tipo: tipoRegistro,
            fecha: new Date(),
            metodo: 'qr',
            ubicacion: 'Puerta Principal',
            usuario: 'Personal de Entrada',
            observaciones: '',
            estado: 'confirmado'
          }

          // Actualizar registros
          const nuevosRegistros = [...registrosAsistencia, nuevoRegistro]

          // Actualizar listas de presentes/ausentes
          let nuevosPresentes = [...estudiantesPresentes]
          let nuevosAusentes = get().estudiantesAusentes

          if (tipoRegistro === 'entrada') {
            if (!yaPresente) {
              nuevosPresentes.push(estudiante)
              nuevosAusentes = nuevosAusentes.filter(e => e.id !== estudiante.id)
            }
          } else if (tipoRegistro === 'salida') {
            nuevosPresentes = nuevosPresentes.filter(e => e.id !== estudiante.id)
            if (!nuevosAusentes.find(e => e.id === estudiante.id)) {
              nuevosAusentes.push(estudiante)
            }
          }

          // Actualizar estadísticas
          const estadisticas = {
            totalEscaneos: nuevosRegistros.length,
            estudiantes: nuevosPresentes.length,
            profesores: 0,
            personal: 0,
            visitantes: 0,
            entradas: nuevosRegistros.filter(r => r.tipo === 'entrada').length,
            salidas: nuevosRegistros.filter(r => r.tipo === 'salida').length,
            primeraEntrada: nuevosRegistros.length > 0 ? Math.min(...nuevosRegistros.map(r => r.fecha.getTime())) : null,
            ultimaEntrada: nuevosRegistros.length > 0 ? Math.max(...nuevosRegistros.map(r => r.fecha.getTime())) : null
          }

          set({
            registrosAsistencia: nuevosRegistros,
            estudiantesPresentes: nuevosPresentes,
            estudiantesAusentes: nuevosAusentes,
            estadisticasDelDia: estadisticas,
            errorEscaner: null
          })

          // Reproducir sonido y vibración si están activados
          if (configuracionEscaner.sonidoActivado) {
            // Simular sonido de éxito
            console.log('🔊 Sonido de éxito')
          }

          if (configuracionEscaner.vibracionActivada && navigator.vibrate) {
            navigator.vibrate([100, 50, 100])
          }

          resolve(nuevoRegistro)
        } catch (error) {
          set({ errorEscaner: error.message })
          reject(error)
        }
      }, 800) // Simular tiempo de procesamiento
    })
  },

  // Registrar manualmente (para casos especiales)
  registrarManualmente: (estudianteId, tipo, observaciones = '') => {
    const { registrosAsistencia, estudiantesPresentes, estudiantesAusentes } = get()
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // En un caso real, buscarías el estudiante en la base de datos
        const estudiante = {
          id: estudianteId,
          codigo: 'MANUAL',
          nombre: 'Registro Manual',
          grado: 'N/A',
          seccion: 'N/A',
          fotoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjIwIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0zNSAxMjBDMzUgMTA0LjUzNiA0Ny41MzYgOTIgNjMgOTJIODdDMTAyLjQ2NCA5MiAxMTUgMTA0LjUzNiAxMTUgMTIwVjEzMEgzNVYxMjBaIiBmaWxsPSIjOUM5Qzk5Ii8+Cjwvc3ZnPgo=',
          estado: 'activo'
        }

        const nuevoRegistro = {
          id: `REG${Date.now()}`,
          estudiante,
          tipo,
          fecha: new Date(),
          metodo: 'manual',
          ubicacion: 'Puerta Principal',
          usuario: 'Personal de Entrada',
          observaciones,
          estado: 'confirmado'
        }

        const nuevosRegistros = [...registrosAsistencia, nuevoRegistro]

        set({
          registrosAsistencia: nuevosRegistros,
          estadisticasDelDia: {
            ...get().estadisticasDelDia,
            totalEscaneos: nuevosRegistros.length
          }
        })

        resolve(nuevoRegistro)
      }, 500)
    })
  },

  // Actualizar configuración del escáner
  actualizarConfiguracion: (nuevaConfiguracion) => {
    set({
      configuracionEscaner: {
        ...get().configuracionEscaner,
        ...nuevaConfiguracion
      }
    })
  },

  // Generar reporte de asistencia
  generarReporte: (periodo = 'hoy') => {
    const { registrosAsistencia } = get()
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const reporte = {
          periodo,
          fechaGeneracion: new Date(),
          totalRegistros: registrosAsistencia.length,
          registros: registrosAsistencia,
          resumen: {
            entradas: registrosAsistencia.filter(r => r.tipo === 'entrada').length,
            salidas: registrosAsistencia.filter(r => r.tipo === 'salida').length,
            estudiantesUnicos: [...new Set(registrosAsistencia.map(r => r.estudiante.id))].length
          }
        }
        
        resolve(reporte)
      }, 1000)
    })
  },

  // Obtener historial de registros
  obtenerHistorial: (fechaInicio, fechaFin) => {
    const { registrosAsistencia } = get()
    
    return registrosAsistencia.filter(registro => {
      const fechaRegistro = new Date(registro.fecha)
      return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin
    })
  },

  // Buscar estudiante por código o nombre
  buscarEstudiante: (termino) => {
    // En un caso real, esto haría una consulta a la API
    const estudiantesEjemplo = [
      {
        id: 'EST001',
        codigo: 'E001234567890',
        nombre: 'Ana María García López',
        grado: '5to A',
        seccion: 'A',
        fotoUrl: 'https://via.placeholder.com/150',
        estado: 'activo'
      },
      {
        id: 'EST002',
        codigo: 'E002345678901',
        nombre: 'Carlos Eduardo Mendoza Silva',
        grado: '4to B',
        seccion: 'B',
        fotoUrl: 'https://via.placeholder.com/150',
        estado: 'activo'
      }
    ]

    return estudiantesEjemplo.filter(e => 
      e.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      e.codigo.includes(termino) ||
      e.grado.toLowerCase().includes(termino.toLowerCase())
    )
  },

  // Limpiar error
  limpiarError: () => {
    set({ errorEscaner: null })
  },

  // Resetear datos del día
  resetearDia: () => {
    set({
      registrosAsistencia: [],
      estudiantesPresentes: [],
      estudiantesAusentes: [],
      estadisticasDelDia: {
        totalEscaneos: 0,
        estudiantes: 0,
        profesores: 0,
        personal: 0,
        visitantes: 0,
        entradas: 0,
        salidas: 0,
        primeraEntrada: null,
        ultimaEntrada: null
      }
    })
  }
}))

export default useScannerStore