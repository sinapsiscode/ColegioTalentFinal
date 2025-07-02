import { create } from 'zustand'
import { subDays, format } from 'date-fns'
import { es } from 'date-fns/locale'

const useAttendanceStore = create((set, get) => ({
  registrosAsistencia: [],
  cargando: false,
  
  cargarRegistrosAsistencia: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const registros = []
      const alumnosIds = [1, 2, 3, 4, 5]
      const hoy = new Date()
      
      for (let i = 0; i < 30; i++) {
        const fecha = subDays(hoy, i)
        
        alumnosIds.forEach(alumnoId => {
          const probabilidadAsistencia = Math.random()
          
          if (probabilidadAsistencia > 0.1) {
            const horaEntrada = new Date(fecha)
            horaEntrada.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))
            
            const horaSalida = new Date(fecha)
            horaSalida.setHours(14 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))
            
            registros.push({
              id: `${alumnoId}-${format(fecha, 'yyyy-MM-dd')}`,
              alumnoId,
              fecha: fecha,
              horaEntrada: horaEntrada,
              horaSalida: probabilidadAsistencia > 0.2 ? horaSalida : null,
              estado: probabilidadAsistencia > 0.8 ? 'presente' : 
                     probabilidadAsistencia > 0.6 ? 'tarde' : 'falta',
              observaciones: probabilidadAsistencia < 0.3 ? 'Justificada por enfermedad' : null
            })
          } else {
            registros.push({
              id: `${alumnoId}-${format(fecha, 'yyyy-MM-dd')}`,
              alumnoId,
              fecha: fecha,
              horaEntrada: null,
              horaSalida: null,
              estado: 'falta',
              observaciones: 'Sin justificación'
            })
          }
        })
      }
      
      set({ 
        registrosAsistencia: registros.sort((a, b) => b.fecha - a.fecha),
        cargando: false 
      })
    }, 1000)
  },
  
  registrarAsistencia: (alumnoId, tipo) => {
    const { registrosAsistencia } = get()
    const ahora = new Date()
    const fechaHoy = format(ahora, 'yyyy-MM-dd')
    
    const registroExistente = registrosAsistencia.find(
      reg => reg.alumnoId === alumnoId && format(reg.fecha, 'yyyy-MM-dd') === fechaHoy
    )
    
    let nuevosRegistros
    let mensaje = ''
    
    if (registroExistente) {
      // Verificar si ya se registró el mismo tipo
      if (tipo === 'entrada' && registroExistente.horaEntrada) {
        return { 
          success: false, 
          mensaje: 'Ya se registró la entrada de este estudiante hoy',
          registro: registroExistente
        }
      }
      
      if (tipo === 'salida' && registroExistente.horaSalida) {
        return { 
          success: false, 
          mensaje: 'Ya se registró la salida de este estudiante hoy',
          registro: registroExistente
        }
      }
      
      // Verificar que no se registre salida sin entrada
      if (tipo === 'salida' && !registroExistente.horaEntrada) {
        return { 
          success: false, 
          mensaje: 'No se puede registrar salida sin haber registrado entrada',
          registro: registroExistente
        }
      }
      
      // Actualizar registro existente
      nuevosRegistros = registrosAsistencia.map(reg => {
        if (reg.id === registroExistente.id) {
          const registroActualizado = {
            ...reg,
            [tipo === 'entrada' ? 'horaEntrada' : 'horaSalida']: ahora
          }
          
          // Determinar estado basado en hora de entrada
          if (tipo === 'entrada') {
            const hora = ahora.getHours()
            const minutos = ahora.getMinutes()
            const horaLimite = 8 // 8:00 AM
            
            if (hora > horaLimite || (hora === horaLimite && minutos > 15)) {
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
          registro: null
        }
      }
      
      const hora = ahora.getHours()
      const minutos = ahora.getMinutes()
      const horaLimite = 8 // 8:00 AM
      
      const nuevoRegistro = {
        id: `${alumnoId}-${fechaHoy}`,
        alumnoId,
        fecha: ahora,
        horaEntrada: ahora,
        horaSalida: null,
        estado: (hora > horaLimite || (hora === horaLimite && minutos > 15)) ? 'tarde' : 'presente',
        observaciones: null
      }
      
      mensaje = nuevoRegistro.estado === 'tarde' 
        ? `Entrada registrada - Llegada tardía (${format(ahora, 'HH:mm')})`
        : `Entrada registrada - A tiempo (${format(ahora, 'HH:mm')})`
      
      nuevosRegistros = [nuevoRegistro, ...registrosAsistencia]
    }
    
    set({ registrosAsistencia: nuevosRegistros })
    
    const registroFinal = nuevosRegistros.find(
      reg => reg.alumnoId === alumnoId && format(reg.fecha, 'yyyy-MM-dd') === fechaHoy
    )
    
    return { 
      success: true, 
      mensaje,
      registro: registroFinal
    }
  },
  
  obtenerAsistenciaAlumno: (alumnoId, fechaInicio, fechaFin) => {
    const { registrosAsistencia } = get()
    
    return registrosAsistencia.filter(reg => {
      const fechaRegistro = new Date(reg.fecha)
      const inicio = new Date(fechaInicio)
      const fin = new Date(fechaFin)
      
      return reg.alumnoId === alumnoId && 
             fechaRegistro >= inicio && 
             fechaRegistro <= fin
    })
  },
  
  obtenerEstadisticasAsistencia: (alumnoId) => {
    const { registrosAsistencia } = get()
    const registrosAlumno = registrosAsistencia.filter(reg => reg.alumnoId === alumnoId)
    
    const total = registrosAlumno.length
    const presentes = registrosAlumno.filter(reg => reg.estado === 'presente').length
    const tardes = registrosAlumno.filter(reg => reg.estado === 'tarde').length
    const faltas = registrosAlumno.filter(reg => reg.estado === 'falta').length
    
    return {
      total,
      presentes,
      tardes,
      faltas,
      porcentajeAsistencia: total > 0 ? Math.round(((presentes + tardes) / total) * 100) : 0
    }
  },
  
  obtenerRegistroHoy: (alumnoId) => {
    const { registrosAsistencia } = get()
    const hoy = format(new Date(), 'yyyy-MM-dd')
    
    return registrosAsistencia.find(
      reg => reg.alumnoId === alumnoId && format(reg.fecha, 'yyyy-MM-dd') === hoy
    )
  },

  obtenerEstadisticasHoy: () => {
    const { registrosAsistencia } = get()
    const hoy = format(new Date(), 'yyyy-MM-dd')
    
    const registrosHoy = registrosAsistencia.filter(
      reg => format(reg.fecha, 'yyyy-MM-dd') === hoy
    )
    
    const totalEstudiantes = registrosHoy.length
    const conEntrada = registrosHoy.filter(reg => reg.horaEntrada).length
    const conSalida = registrosHoy.filter(reg => reg.horaSalida).length
    const sinEntrada = totalEstudiantes - conEntrada
    const sinSalida = conEntrada - conSalida
    const presentes = registrosHoy.filter(reg => reg.estado === 'presente').length
    const tardes = registrosHoy.filter(reg => reg.estado === 'tarde').length
    const faltas = registrosHoy.filter(reg => reg.estado === 'falta').length
    
    return {
      totalEstudiantes,
      conEntrada,
      conSalida,
      sinEntrada,
      sinSalida,
      presentes,
      tardes,
      faltas,
      enEscuela: conEntrada - conSalida // Estudiantes que están actualmente en la escuela
    }
  },

  obtenerRegistrosRecientes: (limite = 10) => {
    const { registrosAsistencia } = get()
    const hoy = format(new Date(), 'yyyy-MM-dd')
    
    const registrosHoy = registrosAsistencia
      .filter(reg => format(reg.fecha, 'yyyy-MM-dd') === hoy)
      .sort((a, b) => {
        // Ordenar por el último movimiento (entrada o salida)
        const ultimoA = a.horaSalida || a.horaEntrada
        const ultimoB = b.horaSalida || b.horaEntrada
        return ultimoB - ultimoA
      })
      .slice(0, limite)
    
    return registrosHoy
  },

  obtenerEstudiantesEnEscuela: () => {
    const { registrosAsistencia } = get()
    const hoy = format(new Date(), 'yyyy-MM-dd')
    
    return registrosAsistencia.filter(reg => 
      format(reg.fecha, 'yyyy-MM-dd') === hoy &&
      reg.horaEntrada && 
      !reg.horaSalida
    )
  }
}))

export default useAttendanceStore