import { create } from 'zustand'
import useAttendanceStore from './attendanceStore'
import useTutorAttendanceStore from './tutorAttendanceStore'
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
    formatoFecha: 'dd/MM/yyyy HH:mm:ss',
    validacionGPS: true,
    coordenadasColegio: {
      latitud: -12.046373,
      longitud: -77.042754,
      radio: 100 // metros
    },
    toleranciaGPS: 50, // metros adicionales de tolerancia
    registrarSinGPS: false // permite registro sin GPS en caso de error
  },
  estadisticasDelDia: {
    totalEscaneos: 0,
    estudiantes: 0,
    tutores: 0,
    profesores: 0,
    personal: 0,
    visitantes: 0,
    entradas: 0,
    salidas: 0,
    primeraEntrada: null,
    ultimaEntrada: null
  },
  errorEscaner: null,
  ubicacionActual: null,
  validandoUbicacion: false,

  // Funciones utilitarias para GPS
  calcularDistancia: (lat1, lon1, lat2, lon2) => {
    const R = 6371000 // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distancia en metros
  },

  obtenerUbicacionActual: () => {
    return new Promise((resolve, reject) => {
      set({ validandoUbicacion: true })
      
      if (!navigator.geolocation) {
        set({ validandoUbicacion: false })
        reject(new Error('Geolocalización no disponible en este dispositivo'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const ubicacion = {
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            precision: position.coords.accuracy,
            timestamp: new Date()
          }
          
          set({ 
            ubicacionActual: ubicacion,
            validandoUbicacion: false
          })
          
          resolve(ubicacion)
        },
        (error) => {
          set({ validandoUbicacion: false })
          
          let mensaje = 'Error al obtener ubicación: '
          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensaje += 'Permisos de ubicación denegados'
              break
            case error.POSITION_UNAVAILABLE:
              mensaje += 'Ubicación no disponible'
              break
            case error.TIMEOUT:
              mensaje += 'Tiempo de espera agotado'
              break
            default:
              mensaje += 'Error desconocido'
              break
          }
          
          reject(new Error(mensaje))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  },

  validarUbicacionEnColegio: async () => {
    const { configuracionEscaner, calcularDistancia } = get()
    
    if (!configuracionEscaner.validacionGPS) {
      return { valida: true, mensaje: 'Validación GPS deshabilitada' }
    }

    try {
      const ubicacionActual = await get().obtenerUbicacionActual()
      
      const distancia = calcularDistancia(
        ubicacionActual.latitud,
        ubicacionActual.longitud,
        configuracionEscaner.coordenadasColegio.latitud,
        configuracionEscaner.coordenadasColegio.longitud
      )

      const radioTotal = configuracionEscaner.coordenadasColegio.radio + configuracionEscaner.toleranciaGPS
      const estaDentroDelRango = distancia <= radioTotal

      return {
        valida: estaDentroDelRango,
        distancia: Math.round(distancia),
        radioPermitido: radioTotal,
        ubicacionActual,
        mensaje: estaDentroDelRango 
          ? `Ubicación verificada (${Math.round(distancia)}m del colegio)`
          : `Fuera del rango permitido (${Math.round(distancia)}m del colegio, máximo ${radioTotal}m)`
      }
    } catch (error) {
      if (configuracionEscaner.registrarSinGPS) {
        return {
          valida: true,
          error: error.message,
          mensaje: 'Registro permitido sin validación GPS'
        }
      } else {
        return {
          valida: false,
          error: error.message,
          mensaje: `Error de ubicación: ${error.message}`
        }
      }
    }
  },

  // Inicializar datos del día
  inicializarDatos: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      // Obtener estadísticas desde attendanceStore
      const { obtenerEstadisticasHoy, obtenerEstudiantesEnEscuela } = useAttendanceStore.getState()
      const estadisticasAttendance = obtenerEstadisticasHoy()
      const estudiantesEnEscuela = obtenerEstudiantesEnEscuela()

      // Obtener estadísticas desde tutorAttendanceStore
      const { obtenerEstadisticasHoy: obtenerEstadisticasTutores, obtenerTutoresEnColegio } = useTutorAttendanceStore.getState()
      const estadisticasTutores = obtenerEstadisticasTutores()
      const tutoresEnColegio = obtenerTutoresEnColegio()

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
        totalEscaneos: estadisticasAttendance.conEntrada + estadisticasAttendance.conSalida + estadisticasTutores.entradas + estadisticasTutores.salidas,
        estudiantes: estadisticasAttendance.conEntrada,
        tutores: estadisticasTutores.entradas,
        profesores: 0,
        personal: 0,
        visitantes: 0,
        entradas: estadisticasAttendance.conEntrada + estadisticasTutores.entradas,
        salidas: estadisticasAttendance.conSalida + estadisticasTutores.salidas,
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
      setTimeout(async () => {
        try {
          // 1. Validar ubicación antes de procesar cualquier código
          const validacionUbicacion = await get().validarUbicacionEnColegio()
          
          if (!validacionUbicacion.valida) {
            throw new Error(validacionUbicacion.mensaje)
          }

          // Verificar si es un código de tutor (comienza con T)
          if (codigoQR.startsWith('T')) {
            const { procesarCodigoQRTutor } = useTutorAttendanceStore.getState()
            const registroTutor = await procesarCodigoQRTutor(codigoQR)
            
            // Actualizar registros del scanner con el registro del tutor
            const { registrosAsistencia } = get()
            const nuevosRegistros = [...registrosAsistencia, registroTutor]
            
            // Actualizar estadísticas combinadas
            get().actualizarEstadisticas()
            
            set({ registrosAsistencia: nuevosRegistros })
            resolve(registroTutor)
            return
          }

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
            throw new Error('Código QR no válido o estudiante/tutor no encontrado')
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
            observaciones: validacionUbicacion.mensaje,
            estado: 'confirmado',
            coordenadas: validacionUbicacion.ubicacionActual,
            distanciaColegio: validacionUbicacion.distancia
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
        tutores: 0,
        profesores: 0,
        personal: 0,
        visitantes: 0,
        entradas: 0,
        salidas: 0,
        primeraEntrada: null,
        ultimaEntrada: null
      }
    })
  },

  // Actualizar estadísticas combinadas
  actualizarEstadisticas: () => {
    // Obtener estadísticas desde attendanceStore
    const { obtenerEstadisticasHoy, obtenerEstudiantesEnEscuela } = useAttendanceStore.getState()
    const estadisticasAttendance = obtenerEstadisticasHoy()

    // Obtener estadísticas desde tutorAttendanceStore  
    const { obtenerEstadisticasHoy: obtenerEstadisticasTutores } = useTutorAttendanceStore.getState()
    const estadisticasTutores = obtenerEstadisticasTutores()

    const estadisticas = {
      totalEscaneos: estadisticasAttendance.conEntrada + estadisticasAttendance.conSalida + estadisticasTutores.entradas + estadisticasTutores.salidas,
      estudiantes: estadisticasAttendance.conEntrada,
      tutores: estadisticasTutores.entradas,
      profesores: 0,
      personal: 0,
      visitantes: 0,
      entradas: estadisticasAttendance.conEntrada + estadisticasTutores.entradas,
      salidas: estadisticasAttendance.conSalida + estadisticasTutores.salidas,
      primeraEntrada: null,
      ultimaEntrada: null
    }

    set({ estadisticasDelDia: estadisticas })
  },

  // Configurar validación GPS
  configurarValidacionGPS: (config) => {
    set({
      configuracionEscaner: {
        ...get().configuracionEscaner,
        validacionGPS: config.validacionGPS,
        coordenadasColegio: config.coordenadasColegio || get().configuracionEscaner.coordenadasColegio,
        toleranciaGPS: config.toleranciaGPS || get().configuracionEscaner.toleranciaGPS,
        registrarSinGPS: config.registrarSinGPS || get().configuracionEscaner.registrarSinGPS
      }
    })
  },

  // Obtener estado de ubicación
  obtenerEstadoUbicacion: () => {
    const { ubicacionActual, validandoUbicacion, configuracionEscaner } = get()
    
    return {
      tieneUbicacion: !!ubicacionActual,
      validando: validandoUbicacion,
      ultimaActualizacion: ubicacionActual?.timestamp,
      precision: ubicacionActual?.precision,
      validacionHabilitada: configuracionEscaner.validacionGPS,
      coordenadasColegio: configuracionEscaner.coordenadasColegio
    }
  },

  // Probar validación de ubicación (para testing)
  probarValidacionUbicacion: async () => {
    try {
      const resultado = await get().validarUbicacionEnColegio()
      return {
        exito: true,
        resultado
      }
    } catch (error) {
      return {
        exito: false,
        error: error.message
      }
    }
  }
}))

export default useScannerStore