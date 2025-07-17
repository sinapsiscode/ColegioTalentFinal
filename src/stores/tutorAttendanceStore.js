import { create } from 'zustand'
import { subDays, format } from 'date-fns'
import { es } from 'date-fns/locale'

// Datos mock de tutores para el desarrollo
const tutoresMock = [
  {
    id: 1,
    nombre: 'María García',
    especialidad: 'Matemáticas',
    grado: '5to Grado',
    foto: '/avatar-teacher.jpg',
    codigoFotocheck: 'T001234567890'
  },
  {
    id: 2,
    nombre: 'Carlos Mendoza',
    especialidad: 'Ciencias',
    grado: '4to Grado',
    foto: '/avatar-teacher2.jpg',
    codigoFotocheck: 'T002345678901'
  },
  {
    id: 3,
    nombre: 'Ana Torres',
    especialidad: 'Literatura',
    grado: '3er Grado',
    foto: '/avatar-teacher3.jpg',
    codigoFotocheck: 'T003456789012'
  },
  {
    id: 4,
    nombre: 'Luis Vargas',
    especialidad: 'Historia',
    grado: '6to Grado',
    foto: '/avatar-teacher4.jpg',
    codigoFotocheck: 'T004567890123'
  },
  {
    id: 5,
    nombre: 'Sofia Santos',
    especialidad: 'Inglés',
    grado: '2do Grado',
    foto: '/avatar-teacher5.jpg',
    codigoFotocheck: 'T005678901234'
  }
]

const useTutorAttendanceStore = create((set, get) => ({
  registrosAsistencia: [],
  tutoresPresentes: [],
  configuracion: {
    horaIngresoRegular: '07:30',
    minutosTolerancia: 15,
    coordenadasColegio: {
      latitud: -12.0464, // Lima, Peru - coordenadas del colegio
      longitud: -77.0428,
      radio: 100 // metros de tolerancia
    },
    modoOperacion: 'ambos', // entrada, salida, ambos
    sonidoActivado: true,
    vibracionActivada: true,
    autoRegistro: true,
    tiempoEspera: 3000
  },
  estadisticasDelDia: {
    totalEscaneos: 0,
    tutores: 0,
    entradas: 0,
    salidas: 0,
    presentes: 0,
    tardes: 0,
    faltas: 0,
    primeraEntrada: null,
    ultimaEntrada: null
  },
  cargando: false,
  errorEscaner: null,
  
  cargarRegistrosAsistencia: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const registros = []
      const hoy = new Date()
      
      for (let i = 0; i < 30; i++) {
        const fecha = subDays(hoy, i)
        
        tutoresMock.forEach(tutor => {
          const probabilidadAsistencia = Math.random()
          
          if (probabilidadAsistencia > 0.05) {
            const horaEntrada = new Date(fecha)
            horaEntrada.setHours(7 + Math.floor(Math.random() * 1.5), Math.floor(Math.random() * 60))
            
            const horaSalida = new Date(fecha)
            horaSalida.setHours(15 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))
            
            registros.push({
              id: `tutor-${tutor.id}-${format(fecha, 'yyyy-MM-dd')}`,
              tutorId: tutor.id,
              fecha: fecha,
              horaEntrada: horaEntrada,
              horaSalida: probabilidadAsistencia > 0.15 ? horaSalida : null,
              estado: probabilidadAsistencia > 0.9 ? 'presente' : 
                     probabilidadAsistencia > 0.7 ? 'tarde' : 'falta',
              observaciones: probabilidadAsistencia < 0.2 ? 'Permiso por motivos médicos' : null,
              coordenadasEntrada: {
                latitud: -12.0464 + (Math.random() - 0.5) * 0.001,
                longitud: -77.0428 + (Math.random() - 0.5) * 0.001,
                precision: Math.random() * 10 + 5
              },
              coordenadasSalida: probabilidadAsistencia > 0.15 ? {
                latitud: -12.0464 + (Math.random() - 0.5) * 0.001,
                longitud: -77.0428 + (Math.random() - 0.5) * 0.001,
                precision: Math.random() * 10 + 5
              } : null
            })
          } else {
            registros.push({
              id: `tutor-${tutor.id}-${format(fecha, 'yyyy-MM-dd')}`,
              tutorId: tutor.id,
              fecha: fecha,
              horaEntrada: null,
              horaSalida: null,
              estado: 'falta',
              observaciones: 'Sin justificación',
              coordenadasEntrada: null,
              coordenadasSalida: null
            })
          }
        })
      }
      
      // Calcular tutores presentes (con entrada y sin salida hoy)
      const hoy_str = format(new Date(), 'yyyy-MM-dd')
      const tutoresPresentes = registros
        .filter(reg => format(reg.fecha, 'yyyy-MM-dd') === hoy_str && reg.horaEntrada && !reg.horaSalida)
        .map(reg => {
          const tutor = tutoresMock.find(t => t.id === reg.tutorId)
          return {
            id: tutor.id,
            codigo: tutor.codigoFotocheck,
            nombre: tutor.nombre,
            especialidad: tutor.especialidad,
            grado: tutor.grado,
            fotoUrl: tutor.foto || '/images/default-avatar.jpg'
          }
        })
      
      // Calcular estadísticas del día
      const registrosHoy = registros.filter(reg => format(reg.fecha, 'yyyy-MM-dd') === hoy_str)
      const estadisticas = {
        totalEscaneos: registrosHoy.filter(r => r.horaEntrada || r.horaSalida).length,
        tutores: registrosHoy.length,
        entradas: registrosHoy.filter(r => r.horaEntrada).length,
        salidas: registrosHoy.filter(r => r.horaSalida).length,
        presentes: registrosHoy.filter(r => r.estado === 'presente').length,
        tardes: registrosHoy.filter(r => r.estado === 'tarde').length,
        faltas: registrosHoy.filter(r => r.estado === 'falta').length,
        primeraEntrada: registrosHoy.length > 0 ? Math.min(...registrosHoy.filter(r => r.horaEntrada).map(r => r.horaEntrada.getTime())) : null,
        ultimaEntrada: registrosHoy.length > 0 ? Math.max(...registrosHoy.filter(r => r.horaEntrada).map(r => r.horaEntrada.getTime())) : null
      }
      
      set({ 
        registrosAsistencia: registros.sort((a, b) => b.fecha - a.fecha),
        tutoresPresentes,
        estadisticasDelDia: estadisticas,
        cargando: false 
      })
    }, 1000)
  },
  
  procesarCodigoQRTutor: (codigoQR) => {
    const { configuracion } = get()
    
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Mapear códigos QR a IDs de tutores
          const codigoToId = {
            'T001234567890': 1,
            'T002345678901': 2,
            'T003456789012': 3,
            'T004567890123': 4,
            'T005678901234': 5
          }

          const tutorId = codigoToId[codigoQR]
          if (!tutorId) {
            throw new Error('Código de fotocheck no válido o tutor no encontrado')
          }

          const tutor = tutoresMock.find(t => t.id === tutorId)
          if (!tutor) {
            throw new Error('Tutor no encontrado en el sistema')
          }

          // Obtener ubicación GPS
          let coordenadasActuales = null
          try {
            const posicion = await new Promise((resolve, reject) => {
              if (!navigator.geolocation) {
                reject(new Error('La geolocalización no está soportada'))
                return
              }
              
              navigator.geolocation.getCurrentPosition(
                (position) => resolve(position),
                (error) => reject(error),
                { 
                  enableHighAccuracy: true, 
                  timeout: 10000, 
                  maximumAge: 60000 
                }
              )
            })
            
            coordenadasActuales = {
              latitud: posicion.coords.latitude,
              longitud: posicion.coords.longitude,
              precision: posicion.coords.accuracy
            }
            
            // Validar ubicación
            const distancia = calcularDistancia(
              coordenadasActuales.latitud,
              coordenadasActuales.longitud,
              configuracion.coordenadasColegio.latitud,
              configuracion.coordenadasColegio.longitud
            )
            
            if (distancia > configuracion.coordenadasColegio.radio) {
              throw new Error(`Debe estar en las instalaciones del colegio para marcar asistencia. Distancia actual: ${Math.round(distancia)}m`)
            }
          } catch (gpsError) {
            console.warn('Error GPS:', gpsError.message)
            // Continuar sin GPS en desarrollo, pero mostrar advertencia
            coordenadasActuales = {
              latitud: configuracion.coordenadasColegio.latitud,
              longitud: configuracion.coordenadasColegio.longitud,
              precision: 999 // Indicar que es una coordenada de fallback
            }
          }

          // Obtener registro actual del tutor
          const { registrosAsistencia } = get()
          const ahora = new Date()
          const fechaHoy = format(ahora, 'yyyy-MM-dd')
          
          const registroHoy = registrosAsistencia.find(
            reg => reg.tutorId === tutorId && format(reg.fecha, 'yyyy-MM-dd') === fechaHoy
          )

          // Determinar tipo de registro basado en configuración
          let tipoRegistro = configuracion.modoOperacion
          
          if (configuracion.modoOperacion === 'ambos') {
            // Si ya tiene entrada y no tiene salida, entonces es salida
            if (registroHoy?.horaEntrada && !registroHoy?.horaSalida) {
              tipoRegistro = 'salida'
            } else {
              tipoRegistro = 'entrada'
            }
          } else if (configuracion.modoOperacion === 'entrada' && registroHoy?.horaEntrada) {
            throw new Error('Ya se registró la entrada de este tutor hoy')
          } else if (configuracion.modoOperacion === 'salida' && !registroHoy?.horaEntrada) {
            throw new Error('No se puede registrar salida sin haber registrado entrada')
          }

          // Procesar el registro
          const resultado = await get().registrarAsistencia(tutorId, tipoRegistro, coordenadasActuales)
          
          if (!resultado.success) {
            throw new Error(resultado.mensaje)
          }

          // Crear registro para scanner
          const nuevoRegistroScanner = {
            id: `REG${Date.now()}`,
            tutor: {
              id: tutor.id,
              codigo: codigoQR,
              nombre: tutor.nombre,
              especialidad: tutor.especialidad,
              grado: tutor.grado,
              fotoUrl: tutor.foto || '/images/default-avatar.jpg'
            },
            tipo: tipoRegistro,
            fecha: ahora,
            metodo: 'qr',
            ubicacion: 'Puerta Principal',
            usuario: 'Personal de Entrada',
            observaciones: coordenadasActuales.precision === 999 ? 'Registrado sin GPS' : '',
            estado: 'confirmado',
            coordenadas: coordenadasActuales
          }

          // Reproducir sonido y vibración si están activados
          if (configuracion.sonidoActivado) {
            console.log('🔊 Sonido de éxito')
          }

          if (configuracion.vibracionActivada && navigator.vibrate) {
            navigator.vibrate([100, 50, 100])
          }

          resolve(nuevoRegistroScanner)
        } catch (error) {
          set({ errorEscaner: error.message })
          reject(error)
        }
      }, 800)
    })
  },
  
  registrarAsistencia: async (tutorId, tipo, coordenadas = null) => {
    const { registrosAsistencia, configuracion } = get()
    const ahora = new Date()
    const fechaHoy = format(ahora, 'yyyy-MM-dd')
    
    const registroExistente = registrosAsistencia.find(
      reg => reg.tutorId === tutorId && format(reg.fecha, 'yyyy-MM-dd') === fechaHoy
    )
    
    let nuevosRegistros
    let mensaje = ''
    
    if (registroExistente) {
      // Verificar si ya se registró el mismo tipo
      if (tipo === 'entrada' && registroExistente.horaEntrada) {
        return { 
          success: false, 
          mensaje: 'Ya se registró la entrada de este tutor hoy',
          registro: registroExistente,
          codigo: 'YA_REGISTRADO'
        }
      }
      
      if (tipo === 'salida' && registroExistente.horaSalida) {
        return { 
          success: false, 
          mensaje: 'Ya se registró la salida de este tutor hoy',
          registro: registroExistente,
          codigo: 'YA_REGISTRADO'
        }
      }
      
      // Verificar que no se registre salida sin entrada
      if (tipo === 'salida' && !registroExistente.horaEntrada) {
        return { 
          success: false, 
          mensaje: 'No se puede registrar salida sin haber registrado entrada',
          registro: registroExistente,
          codigo: 'SIN_ENTRADA'
        }
      }
      
      // Actualizar registro existente
      nuevosRegistros = registrosAsistencia.map(reg => {
        if (reg.id === registroExistente.id) {
          const registroActualizado = {
            ...reg,
            [tipo === 'entrada' ? 'horaEntrada' : 'horaSalida']: ahora,
            [tipo === 'entrada' ? 'coordenadasEntrada' : 'coordenadasSalida']: coordenadas
          }
          
          // Determinar estado basado en hora de entrada
          if (tipo === 'entrada') {
            const horaIngreso = configuracion.horaIngresoRegular.split(':')
            const horaLimite = new Date(ahora)
            horaLimite.setHours(parseInt(horaIngreso[0]), parseInt(horaIngreso[1]) + configuracion.minutosTolerancia, 0, 0)
            
            if (ahora > horaLimite) {
              registroActualizado.estado = 'tarde'
              mensaje = `Entrada registrada - Llegada tardía (${format(ahora, 'HH:mm')})`
            } else {
              registroActualizado.estado = 'presente'
              mensaje = `Entrada registrada - A tiempo (${format(ahora, 'HH:mm')})`
            }
          } else {
            mensaje = `Salida registrada (${format(ahora, 'HH:mm')})`
          }
          
          return registroActualizado
        }
        return reg
      })
    } else {
      // Crear nuevo registro solo si es entrada
      if (tipo === 'salida') {
        return { 
          success: false, 
          mensaje: 'No se puede registrar salida sin haber registrado entrada',
          registro: null,
          codigo: 'SIN_ENTRADA'
        }
      }
      
      const horaIngreso = configuracion.horaIngresoRegular.split(':')
      const horaLimite = new Date(ahora)
      horaLimite.setHours(parseInt(horaIngreso[0]), parseInt(horaIngreso[1]) + configuracion.minutosTolerancia, 0, 0)
      
      const nuevoRegistro = {
        id: `tutor-${tutorId}-${fechaHoy}`,
        tutorId,
        fecha: ahora,
        horaEntrada: ahora,
        horaSalida: null,
        estado: ahora > horaLimite ? 'tarde' : 'presente',
        observaciones: null,
        coordenadasEntrada: coordenadas,
        coordenadasSalida: null
      }
      
      mensaje = nuevoRegistro.estado === 'tarde' 
        ? `Entrada registrada - Llegada tardía (${format(ahora, 'HH:mm')})`
        : `Entrada registrada - A tiempo (${format(ahora, 'HH:mm')})`
      
      nuevosRegistros = [nuevoRegistro, ...registrosAsistencia]
    }
    
    // Recalcular tutores presentes y estadísticas
    const hoy_str = format(new Date(), 'yyyy-MM-dd')
    const tutoresPresentes = nuevosRegistros
      .filter(reg => format(reg.fecha, 'yyyy-MM-dd') === hoy_str && reg.horaEntrada && !reg.horaSalida)
      .map(reg => {
        const tutor = tutoresMock.find(t => t.id === reg.tutorId)
        return {
          id: tutor.id,
          codigo: tutor.codigoFotocheck,
          nombre: tutor.nombre,
          especialidad: tutor.especialidad,
          grado: tutor.grado,
          fotoUrl: tutor.foto || '/images/default-avatar.jpg'
        }
      })
    
    const registrosHoy = nuevosRegistros.filter(reg => format(reg.fecha, 'yyyy-MM-dd') === hoy_str)
    const estadisticas = {
      totalEscaneos: registrosHoy.filter(r => r.horaEntrada || r.horaSalida).length,
      tutores: registrosHoy.length,
      entradas: registrosHoy.filter(r => r.horaEntrada).length,
      salidas: registrosHoy.filter(r => r.horaSalida).length,
      presentes: registrosHoy.filter(r => r.estado === 'presente').length,
      tardes: registrosHoy.filter(r => r.estado === 'tarde').length,
      faltas: registrosHoy.filter(r => r.estado === 'falta').length,
      primeraEntrada: registrosHoy.length > 0 ? Math.min(...registrosHoy.filter(r => r.horaEntrada).map(r => r.horaEntrada.getTime())) : null,
      ultimaEntrada: registrosHoy.length > 0 ? Math.max(...registrosHoy.filter(r => r.horaEntrada).map(r => r.horaEntrada.getTime())) : null
    }
    
    set({ 
      registrosAsistencia: nuevosRegistros,
      tutoresPresentes,
      estadisticasDelDia: estadisticas
    })
    
    const registroFinal = nuevosRegistros.find(
      reg => reg.tutorId === tutorId && format(reg.fecha, 'yyyy-MM-dd') === fechaHoy
    )
    
    return { 
      success: true, 
      mensaje,
      registro: registroFinal,
      codigo: 'EXITO'
    }
  },
  
  obtenerAsistenciaTutor: (tutorId, fechaInicio, fechaFin) => {
    const { registrosAsistencia } = get()
    
    return registrosAsistencia.filter(reg => {
      const fechaRegistro = new Date(reg.fecha)
      const inicio = new Date(fechaInicio)
      const fin = new Date(fechaFin)
      
      return reg.tutorId === tutorId && 
             fechaRegistro >= inicio && 
             fechaRegistro <= fin
    })
  },
  
  obtenerEstadisticasAsistencia: (tutorId) => {
    const { registrosAsistencia } = get()
    const registrosTutor = registrosAsistencia.filter(reg => reg.tutorId === tutorId)
    
    const total = registrosTutor.length
    const presentes = registrosTutor.filter(reg => reg.estado === 'presente').length
    const tardes = registrosTutor.filter(reg => reg.estado === 'tarde').length
    const faltas = registrosTutor.filter(reg => reg.estado === 'falta').length
    
    return {
      total,
      presentes,
      tardes,
      faltas,
      porcentajeAsistencia: total > 0 ? Math.round(((presentes + tardes) / total) * 100) : 0
    }
  },
  
  obtenerRegistroHoy: (tutorId) => {
    const { registrosAsistencia } = get()
    const hoy = format(new Date(), 'yyyy-MM-dd')
    
    return registrosAsistencia.find(
      reg => reg.tutorId === tutorId && format(reg.fecha, 'yyyy-MM-dd') === hoy
    )
  },
  
  obtenerEstadisticasHoy: () => {
    const { estadisticasDelDia } = get()
    return estadisticasDelDia
  },
  
  obtenerTutoresEnColegio: () => {
    const { tutoresPresentes } = get()
    return tutoresPresentes
  },
  
  actualizarConfiguracion: (nuevaConfiguracion) => {
    const { configuracion } = get()
    set({ 
      configuracion: { 
        ...configuracion, 
        ...nuevaConfiguracion 
      } 
    })
  },
  
  limpiarError: () => {
    set({ errorEscaner: null })
  },
  
  // Función para obtener los tutores mock (para desarrollo)
  obtenerTutores: () => tutoresMock,
  
  // Generar reporte de asistencia de tutores
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
            entradas: registrosAsistencia.filter(r => r.horaEntrada).length,
            salidas: registrosAsistencia.filter(r => r.horaSalida).length,
            tutoresUnicos: [...new Set(registrosAsistencia.map(r => r.tutorId))].length
          }
        }
        
        resolve(reporte)
      }, 1000)
    })
  }
}))

// Función auxiliar para calcular distancia entre dos coordenadas (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000 // Radio de la Tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export default useTutorAttendanceStore