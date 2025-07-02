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
    modoOperacion: 'ambos', // entrada, salida, ambos
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
      // Obtener estadísticas desde attendanceStore
      const { obtenerEstadisticasHoy, obtenerEstudiantesEnEscuela } = useAttendanceStore.getState()
      const estadisticasAttendance = obtenerEstadisticasHoy()
      const estudiantesEnEscuela = obtenerEstudiantesEnEscuela()

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

      const estadisticas = {
        totalEscaneos: estadisticasAttendance.conEntrada + estadisticasAttendance.conSalida,
        estudiantes: estadisticasAttendance.conEntrada,
        profesores: 0,
        personal: 0,
        visitantes: 0,
        entradas: estadisticasAttendance.conEntrada,
        salidas: estadisticasAttendance.conSalida,
        primeraEntrada: null,
        ultimaEntrada: null
      }

      set({
        registrosAsistencia: [],
        estudiantesPresentes,
        estudiantesAusentes: [],
        estadisticasDelDia: estadisticas,
        cargando: false
      })
    }, 1000)
  },

  // Iniciar escáner
  iniciarEscaner: () => {
    set({ escaneando: true, errorEscaner: null })
    console.log('Escáner QR iniciado')
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