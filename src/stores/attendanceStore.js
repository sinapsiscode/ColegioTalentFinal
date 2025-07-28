import { create } from 'zustand'
import { subDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import useAuthStore from './authStore'
import { DatabaseQueries } from '../data/databaseSchema'
import { compareIds } from '../utils/searchHelpers'

const useAttendanceStore = create((set, get) => ({
  registrosAsistencia: [],
  cargando: false,
  
  cargarRegistrosAsistencia: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      // FILTRAR ASISTENCIA POR ROL Y USUARIO
      const authStore = useAuthStore.getState()
      const { usuario, rol } = authStore
      
      if (!usuario) {
        set({ registrosAsistencia: [], cargando: false })
        return
      }
      
      // OBTENER IDs DE ESTUDIANTES AUTORIZADOS
      let alumnosAutorizados = []
      
      if (rol === 'padre') {
        // Padre solo ve asistencia de sus hijos
        const hijos = DatabaseQueries.getChildrenByParentId(usuario.id)
        alumnosAutorizados = hijos.map(h => h.id)
      } else if (rol === 'tutor') {
        // Tutor solo ve asistencia de sus estudiantes asignados
        const estudiantes = DatabaseQueries.getStudentsByTutorId(usuario.id)
        alumnosAutorizados = estudiantes.map(e => e.id)
      } else if (rol === 'admin' || rol === 'entrada') {
        // Admin y entrada ven todos los estudiantes
        const todosLosEstudiantes = DatabaseQueries.getAllStudents()
        alumnosAutorizados = todosLosEstudiantes.map(e => e.id)
      }
      
      // Si no hay estudiantes autorizados, no mostrar registros
      if (alumnosAutorizados.length === 0) {
        set({ registrosAsistencia: [], cargando: false })
        return
      }
      
      const registros = []
      const hoy = new Date()
      
      for (let i = 0; i < 30; i++) {
        const fecha = subDays(hoy, i)
        
        alumnosAutorizados.forEach(alumnoId => {
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
      reg => compareIds(reg.alumnoId, alumnoId) && format(reg.fecha, 'yyyy-MM-dd') === fechaHoy
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
      reg => compareIds(reg.alumnoId, alumnoId) && format(reg.fecha, 'yyyy-MM-dd') === fechaHoy
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
      
      return compareIds(reg.alumnoId, alumnoId) && 
             fechaRegistro >= inicio && 
             fechaRegistro <= fin
    })
  },
  
  obtenerEstadisticasAsistencia: (alumnoId) => {
    const { registrosAsistencia } = get()
    const registrosAlumno = registrosAsistencia.filter(reg => compareIds(reg.alumnoId, alumnoId))
    
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
      reg => compareIds(reg.alumnoId, alumnoId) && format(reg.fecha, 'yyyy-MM-dd') === hoy
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
  },

  // Función requerida por Students.jsx
  getStudentAttendance: (estudianteId) => {
    const { registrosAsistencia } = get()
    return registrosAsistencia.filter(reg => compareIds(reg.alumnoId, estudianteId))
  },

  // Exportar asistencia a Excel
  exportarAsistencia: async (formato = 'excel', filtros = {}) => {
    const { registrosAsistencia } = get()
    
    try {
      // Importar dinámicamente el exportador
      const { ExcelExporter } = await import('../utils/excelExporter')
      
      // Aplicar filtros si los hay
      let datosAExportar = registrosAsistencia
      
      if (filtros.fechaInicio && filtros.fechaFin) {
        datosAExportar = datosAExportar.filter(reg => {
          const fechaReg = new Date(reg.fecha)
          const inicio = new Date(filtros.fechaInicio)
          const fin = new Date(filtros.fechaFin)
          return fechaReg >= inicio && fechaReg <= fin
        })
      }
      
      if (filtros.grado) {
        datosAExportar = datosAExportar.filter(reg => reg.grado === filtros.grado)
      }
      
      if (filtros.estado) {
        datosAExportar = datosAExportar.filter(reg => reg.estado === filtros.estado)
      }
      
      // Preparar datos con información completa
      const datosCompletos = datosAExportar.map(reg => ({
        ...reg,
        nombreEstudiante: reg.nombreAlumno,
        registradoPor: 'Sistema'
      }))
      
      // Exportar con formato real
      const resultado = ExcelExporter.exportarAsistencia(datosCompletos)
      
      if (resultado.success) {
        return resultado
      } else {
        throw new Error(resultado.error)
      }
      
    } catch (error) {
      console.error('Error en exportación:', error)
      return {
        success: false,
        error: error.message || 'Error al exportar asistencia',
        mensaje: 'No se pudo completar la exportación'
      }
    }
  },

  // Registrar múltiples asistencias a la vez
  registrarMultiplesAsistencias: async (registros) => {
    set({ cargando: true })
    
    try {
      // Simular guardado en batch
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // En producción, esto sería una llamada API
      // const response = await apiService.post('/api/attendance/batch', { registros })
      
      // Por ahora, procesar cada registro individualmente
      const resultados = []
      const { registrosAsistencia } = get()
      let nuevosRegistros = [...registrosAsistencia]
      
      registros.forEach(registro => {
        const fechaRegistro = typeof registro.fecha === 'string' ? registro.fecha : format(registro.fecha, 'yyyy-MM-dd')
        const existingIndex = nuevosRegistros.findIndex(
          r => compareIds(r.alumnoId, registro.alumnoId) && format(r.fecha, 'yyyy-MM-dd') === fechaRegistro
        )
        
        const nuevoRegistro = {
          id: `${registro.alumnoId}-${fechaRegistro}`,
          alumnoId: registro.alumnoId,
          fecha: new Date(registro.fecha),
          horaEntrada: registro.estado !== 'falta' ? new Date() : null,
          horaSalida: null,
          estado: registro.estado,
          observaciones: registro.observaciones || null
        }
        
        if (existingIndex >= 0) {
          nuevosRegistros[existingIndex] = nuevoRegistro
        } else {
          nuevosRegistros.push(nuevoRegistro)
        }
        
        resultados.push({ success: true, alumnoId: registro.alumnoId })
      })
      
      set({ 
        registrosAsistencia: nuevosRegistros.sort((a, b) => b.fecha - a.fecha),
        cargando: false 
      })
      
      return { success: true, resultados }
    } catch (error) {
      set({ cargando: false })
      console.error('Error registrando asistencias:', error)
      return { success: false, error }
    }
  }
}))

export default useAttendanceStore