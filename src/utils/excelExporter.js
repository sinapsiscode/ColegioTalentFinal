import * as XLSX from 'xlsx'

// Utilidad para exportar datos a Excel con formato profesional
export class ExcelExporter {
  
  // Exportar usuarios a Excel
  static exportarUsuarios(usuarios) {
    try {
      // Preparar datos con headers en español
      const datosFormateados = usuarios.map(usuario => ({
        'ID': usuario.id,
        'Nombre Completo': `${usuario.nombre} ${usuario.apellidos || ''}`.trim(),
        'Email': usuario.email,
        'Rol': this.formatearRol(usuario.rol),
        'Teléfono': usuario.telefono || 'N/A',
        'Estado': usuario.estado === 'activo' ? 'Activo' : 'Inactivo',
        'Fecha Creación': usuario.fechaCreacion ? new Date(usuario.fechaCreacion).toLocaleDateString('es-PE') : 'N/A',
        'Último Acceso': usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso).toLocaleDateString('es-PE') : 'Nunca'
      }))

      // Crear workbook y worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(datosFormateados)

      // Configurar ancho de columnas
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 25 },  // Nombre Completo
        { wch: 30 },  // Email
        { wch: 15 },  // Rol
        { wch: 15 },  // Teléfono
        { wch: 12 },  // Estado
        { wch: 15 },  // Fecha Creación
        { wch: 15 }   // Último Acceso
      ]
      ws['!cols'] = colWidths

      // Aplicar estilos a headers
      const headerRange = XLSX.utils.decode_range(ws['!ref'])
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
        if (ws[cellRef]) {
          ws[cellRef].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } },
            alignment: { horizontal: "center" }
          }
        }
      }

      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(wb, ws, "Usuarios")

      // Generar archivo
      const nombreArchivo = `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, nombreArchivo)

      return {
        success: true,
        archivo: nombreArchivo,
        registros: usuarios.length,
        mensaje: `Se exportaron ${usuarios.length} usuarios exitosamente`
      }

    } catch (error) {
      console.error('Error al exportar usuarios:', error)
      return {
        success: false,
        error: 'Error al generar el archivo Excel',
        mensaje: 'No se pudo completar la exportación'
      }
    }
  }

  // Exportar comunicados a Excel
  static exportarComunicados(comunicados) {
    try {
      const datosFormateados = comunicados.map(comunicado => ({
        'ID': comunicado.id,
        'Título': comunicado.titulo,
        'Categoría': this.formatearCategoria(comunicado.categoria),
        'Prioridad': this.formatearPrioridad(comunicado.prioridad),
        'Estado': this.formatearEstado(comunicado.estado),
        'Autor': comunicado.autor,
        'Dirigido A': Array.isArray(comunicado.dirigidoA) ? comunicado.dirigidoA.join(', ') : comunicado.dirigidoA,
        'Fecha Creación': new Date(comunicado.fecha).toLocaleDateString('es-PE'),
        'Fecha Publicación': comunicado.fechaPublicacion ? new Date(comunicado.fechaPublicacion).toLocaleDateString('es-PE') : 'No publicado',
        'Vistas': comunicado.vistas || 0,
        'Respuestas': comunicado.respuestas || 0,
        'Etiquetas': Array.isArray(comunicado.etiquetas) ? comunicado.etiquetas.join(', ') : 'Sin etiquetas'
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(datosFormateados)

      // Configurar ancho de columnas
      ws['!cols'] = [
        { wch: 8 },   // ID
        { wch: 35 },  // Título
        { wch: 15 },  // Categoría
        { wch: 12 },  // Prioridad
        { wch: 12 },  // Estado
        { wch: 20 },  // Autor
        { wch: 15 },  // Dirigido A
        { wch: 15 },  // Fecha Creación
        { wch: 15 },  // Fecha Publicación
        { wch: 8 },   // Vistas
        { wch: 10 },  // Respuestas
        { wch: 25 }   // Etiquetas
      ]

      // Aplicar estilos a headers
      this.aplicarEstilosHeader(ws)

      XLSX.utils.book_append_sheet(wb, ws, "Comunicados")

      const nombreArchivo = `comunicados_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, nombreArchivo)

      return {
        success: true,
        archivo: nombreArchivo,
        registros: comunicados.length,
        mensaje: `Se exportaron ${comunicados.length} comunicados exitosamente`
      }

    } catch (error) {
      console.error('Error al exportar comunicados:', error)
      return {
        success: false,
        error: 'Error al generar el archivo Excel',
        mensaje: 'No se pudo completar la exportación'
      }
    }
  }

  // Exportar estudiantes a Excel
  static exportarEstudiantes(estudiantes) {
    try {
      const datosFormateados = estudiantes.map(estudiante => ({
        'ID': estudiante.id,
        'Nombre Completo': `${estudiante.nombre} ${estudiante.apellidos}`,
        'Grado': estudiante.grado,
        'Sección': estudiante.seccion,
        'Código QR': estudiante.codigoQR,
        'Padre/Tutor': estudiante.padre,
        'Email Padre': estudiante.email,
        'Teléfono': estudiante.telefono,
        'Fecha Nacimiento': estudiante.fechaNacimiento ? new Date(estudiante.fechaNacimiento).toLocaleDateString('es-PE') : 'N/A',
        'Dirección': estudiante.direccion || 'N/A',
        'Estado': estudiante.estado || 'Activo'
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(datosFormateados)

      // Configurar ancho de columnas
      ws['!cols'] = [
        { wch: 8 },   // ID
        { wch: 25 },  // Nombre Completo
        { wch: 15 },  // Grado
        { wch: 10 },  // Sección
        { wch: 12 },  // Código QR
        { wch: 25 },  // Padre/Tutor
        { wch: 30 },  // Email Padre
        { wch: 15 },  // Teléfono
        { wch: 15 },  // Fecha Nacimiento
        { wch: 30 },  // Dirección
        { wch: 12 }   // Estado
      ]

      this.aplicarEstilosHeader(ws)
      XLSX.utils.book_append_sheet(wb, ws, "Estudiantes")

      const nombreArchivo = `estudiantes_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, nombreArchivo)

      return {
        success: true,
        archivo: nombreArchivo,
        registros: estudiantes.length,
        mensaje: `Se exportaron ${estudiantes.length} estudiantes exitosamente`
      }

    } catch (error) {
      console.error('Error al exportar estudiantes:', error)
      return {
        success: false,
        error: 'Error al generar el archivo Excel',
        mensaje: 'No se pudo completar la exportación'
      }
    }
  }

  // Exportar calificaciones a Excel
  static exportarCalificaciones(calificaciones) {
    try {
      const datosFormateados = calificaciones.map(calificacion => ({
        'ID': calificacion.id,
        'Estudiante': calificacion.nombreEstudiante,
        'Materia': calificacion.materia,
        'Bimestre': calificacion.bimestre,
        'Tipo Evaluación': calificacion.tipoEvaluacion,
        'Descripción': calificacion.descripcion,
        'Nota': calificacion.nota,
        'Peso (%)': `${(calificacion.peso * 100).toFixed(0)}%`,
        'Fecha': new Date(calificacion.fecha).toLocaleDateString('es-PE'),
        'Estado': calificacion.nota >= 11 ? 'Aprobado' : 'Desaprobado',
        'Observaciones': calificacion.observaciones || 'Sin observaciones'
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(datosFormateados)

      // Configurar ancho de columnas
      ws['!cols'] = [
        { wch: 8 },   // ID
        { wch: 25 },  // Estudiante
        { wch: 15 },  // Materia
        { wch: 12 },  // Bimestre
        { wch: 15 },  // Tipo Evaluación
        { wch: 25 },  // Descripción
        { wch: 8 },   // Nota
        { wch: 10 },  // Peso
        { wch: 12 },  // Fecha
        { wch: 12 },  // Estado
        { wch: 30 }   // Observaciones
      ]

      // Aplicar formato condicional para notas
      this.aplicarFormatoCondicionalNotas(ws, datosFormateados.length)
      this.aplicarEstilosHeader(ws)

      XLSX.utils.book_append_sheet(wb, ws, "Calificaciones")

      const nombreArchivo = `calificaciones_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, nombreArchivo)

      return {
        success: true,
        archivo: nombreArchivo,
        registros: calificaciones.length,
        mensaje: `Se exportaron ${calificaciones.length} calificaciones exitosamente`
      }

    } catch (error) {
      console.error('Error al exportar calificaciones:', error)
      return {
        success: false,
        error: 'Error al generar el archivo Excel',
        mensaje: 'No se pudo completar la exportación'
      }
    }
  }

  // Exportar asistencia a Excel
  static exportarAsistencia(asistencias) {
    try {
      const datosFormateados = asistencias.map(asistencia => ({
        'ID': asistencia.id,
        'Estudiante': asistencia.nombreEstudiante,
        'Grado': asistencia.grado,
        'Fecha': new Date(asistencia.fecha).toLocaleDateString('es-PE'),
        'Día Semana': new Date(asistencia.fecha).toLocaleDateString('es-PE', { weekday: 'long' }),
        'Hora Entrada': asistencia.horaEntrada || 'N/A',
        'Hora Salida': asistencia.horaSalida || 'N/A',
        'Estado': this.formatearEstadoAsistencia(asistencia.estado),
        'Observaciones': asistencia.observaciones || 'Sin observaciones',
        'Registrado Por': asistencia.registradoPor || 'Sistema'
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(datosFormateados)

      ws['!cols'] = [
        { wch: 8 },   // ID
        { wch: 25 },  // Estudiante
        { wch: 12 },  // Grado
        { wch: 12 },  // Fecha
        { wch: 15 },  // Día Semana
        { wch: 12 },  // Hora Entrada
        { wch: 12 },  // Hora Salida
        { wch: 12 },  // Estado
        { wch: 25 },  // Observaciones
        { wch: 15 }   // Registrado Por
      ]

      // Aplicar formato condicional para estados de asistencia
      this.aplicarFormatoCondicionalAsistencia(ws, datosFormateados.length)
      this.aplicarEstilosHeader(ws)

      XLSX.utils.book_append_sheet(wb, ws, "Asistencia")

      const nombreArchivo = `asistencia_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, nombreArchivo)

      return {
        success: true,
        archivo: nombreArchivo,
        registros: asistencias.length,
        mensaje: `Se exportaron ${asistencias.length} registros de asistencia exitosamente`
      }

    } catch (error) {
      console.error('Error al exportar asistencia:', error)
      return {
        success: false,
        error: 'Error al generar el archivo Excel',
        mensaje: 'No se pudo completar la exportación'
      }
    }
  }

  // Exportar cronograma de pagos a Excel
  static exportarCronogramaPagos(cronogramas, filtros = {}) {
    try {
      const datosFormateados = []
      
      cronogramas.forEach(cronograma => {
        cronograma.cronograma.forEach(pago => {
          // Aplicar filtros si existen
          if (filtros.estado && pago.estado !== filtros.estado) return
          if (filtros.estudianteId && cronograma.estudianteId !== filtros.estudianteId) return
          
          datosFormateados.push({
            'ID Estudiante': cronograma.estudianteId,
            'Estudiante': cronograma.nombreEstudiante,
            'Año': cronograma.año,
            'Mes': pago.mes,
            'Monto': `S/ ${pago.monto.toFixed(2)}`,
            'Fecha Vencimiento': new Date(pago.fechaVencimiento).toLocaleDateString('es-PE'),
            'Estado': this.formatearEstadoPago(pago.estado),
            'Fecha Pago': pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-PE') : 'Pendiente',
            'Días Restantes': this.calcularDiasRestantes(pago.fechaVencimiento, pago.estado),
            'Observaciones': this.getObservacionesPago(pago)
          })
        })
      })

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(datosFormateados)

      // Configurar ancho de columnas
      ws['!cols'] = [
        { wch: 12 },  // ID Estudiante
        { wch: 25 },  // Estudiante
        { wch: 8 },   // Año
        { wch: 12 },  // Mes
        { wch: 12 },  // Monto
        { wch: 15 },  // Fecha Vencimiento
        { wch: 12 },  // Estado
        { wch: 15 },  // Fecha Pago
        { wch: 15 },  // Días Restantes
        { wch: 30 }   // Observaciones
      ]

      // Aplicar formato condicional para estados de pago
      this.aplicarFormatoCondicionalPagos(ws, datosFormateados.length)
      this.aplicarEstilosHeader(ws)

      XLSX.utils.book_append_sheet(wb, ws, "Cronograma de Pagos")

      // Agregar hoja de resumen
      this.agregarHojaResumenPagos(wb, cronogramas)

      const nombreArchivo = `cronograma_pagos_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, nombreArchivo)

      return {
        success: true,
        archivo: nombreArchivo,
        registros: datosFormateados.length,
        mensaje: `Se exportaron ${datosFormateados.length} registros de pagos exitosamente`
      }

    } catch (error) {
      console.error('Error al exportar cronograma de pagos:', error)
      return {
        success: false,
        error: 'Error al generar el archivo Excel',
        mensaje: 'No se pudo completar la exportación'
      }
    }
  }

  // Métodos auxiliares para formateo
  static formatearRol(rol) {
    const roles = {
      'admin': 'Administrador',
      'tutor': 'Tutor',
      'padre': 'Padre de Familia',
      'entrada': 'Personal de Entrada'
    }
    return roles[rol] || rol
  }

  static formatearCategoria(categoria) {
    const categorias = {
      'general': 'General',
      'academico': 'Académico',
      'evento': 'Evento',
      'reunion': 'Reunión',
      'emergencia': 'Emergencia'
    }
    return categorias[categoria] || categoria
  }

  static formatearPrioridad(prioridad) {
    const prioridades = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta',
      'urgente': 'Urgente'
    }
    return prioridades[prioridad] || prioridad
  }

  static formatearEstado(estado) {
    const estados = {
      'borrador': 'Borrador',
      'publicado': 'Publicado',
      'programado': 'Programado',
      'archivado': 'Archivado'
    }
    return estados[estado] || estado
  }

  static formatearEstadoAsistencia(estado) {
    const estados = {
      'presente': 'Presente',
      'tarde': 'Tardanza',
      'falta': 'Falta',
      'justificado': 'Justificado'
    }
    return estados[estado] || estado
  }

  static formatearEstadoPago(estado) {
    const estados = {
      'pagado': 'Pagado',
      'pendiente': 'Pendiente',
      'vencido': 'Vencido'
    }
    return estados[estado] || estado
  }

  static calcularDiasRestantes(fechaVencimiento, estado) {
    if (estado === 'pagado') return 'N/A'
    
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diffTime = vencimiento - hoy
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `Vencido hace ${Math.abs(diffDays)} días`
    if (diffDays === 0) return 'Vence hoy'
    return `${diffDays} días`
  }

  static getObservacionesPago(pago) {
    if (pago.estado === 'pagado') {
      return `Pagado el ${new Date(pago.fechaPago).toLocaleDateString('es-PE')}`
    }
    
    const hoy = new Date()
    const vencimiento = new Date(pago.fechaVencimiento)
    const diffDays = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Pago vencido - Requiere atención inmediata'
    if (diffDays <= 7) return 'Próximo a vencer - Recordar al padre'
    return 'En fecha normal'
  }

  // Aplicar estilos a headers
  static aplicarEstilosHeader(ws) {
    const headerRange = XLSX.utils.decode_range(ws['!ref'])
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        }
      }
    }
  }

  // Aplicar formato condicional para notas
  static aplicarFormatoCondicionalNotas(ws, numRows) {
    const notaCol = 6 // Columna G (nota)
    for (let row = 1; row <= numRows; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: notaCol })
      if (ws[cellRef]) {
        const nota = parseFloat(ws[cellRef].v)
        if (nota >= 14) {
          ws[cellRef].s = { fill: { fgColor: { rgb: "D4EDDA" } } } // Verde claro
        } else if (nota >= 11) {
          ws[cellRef].s = { fill: { fgColor: { rgb: "FFF3CD" } } } // Amarillo claro
        } else {
          ws[cellRef].s = { fill: { fgColor: { rgb: "F8D7DA" } } } // Rojo claro
        }
      }
    }
  }

  // Aplicar formato condicional para asistencia
  static aplicarFormatoCondicionalAsistencia(ws, numRows) {
    const estadoCol = 7 // Columna H (estado)
    for (let row = 1; row <= numRows; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: estadoCol })
      if (ws[cellRef]) {
        const estado = ws[cellRef].v
        if (estado === 'Presente') {
          ws[cellRef].s = { fill: { fgColor: { rgb: "D4EDDA" } } } // Verde claro
        } else if (estado === 'Tardanza') {
          ws[cellRef].s = { fill: { fgColor: { rgb: "FFF3CD" } } } // Amarillo claro
        } else if (estado === 'Falta') {
          ws[cellRef].s = { fill: { fgColor: { rgb: "F8D7DA" } } } // Rojo claro
        }
      }
    }
  }

  // Aplicar formato condicional para estados de pago
  static aplicarFormatoCondicionalPagos(ws, numRows) {
    const estadoCol = 6 // Columna G (estado)
    for (let row = 1; row <= numRows; row++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: estadoCol })
      if (ws[cellRef]) {
        const estado = ws[cellRef].v
        if (estado === 'Pagado') {
          ws[cellRef].s = { fill: { fgColor: { rgb: "D4EDDA" } } } // Verde claro
        } else if (estado === 'Pendiente') {
          ws[cellRef].s = { fill: { fgColor: { rgb: "FFF3CD" } } } // Amarillo claro
        } else if (estado === 'Vencido') {
          ws[cellRef].s = { fill: { fgColor: { rgb: "F8D7DA" } } } // Rojo claro
        }
      }
    }
  }

  // Agregar hoja de resumen de pagos
  static agregarHojaResumenPagos(wb, cronogramas) {
    const resumen = {
      totalEstudiantes: cronogramas.length,
      totalPagos: 0,
      pagosPagados: 0,
      pagosPendientes: 0,
      pagosVencidos: 0,
      montoTotal: 0,
      montoPagado: 0,
      montoPendiente: 0
    }

    cronogramas.forEach(cronograma => {
      cronograma.cronograma.forEach(pago => {
        resumen.totalPagos++
        resumen.montoTotal += pago.monto
        
        if (pago.estado === 'pagado') {
          resumen.pagosPagados++
          resumen.montoPagado += pago.monto
        } else if (pago.estado === 'pendiente') {
          resumen.pagosPendientes++
          resumen.montoPendiente += pago.monto
        } else if (pago.estado === 'vencido') {
          resumen.pagosVencidos++
          resumen.montoPendiente += pago.monto
        }
      })
    })

    const datosResumen = [
      { 'Concepto': 'Total de Estudiantes', 'Valor': resumen.totalEstudiantes },
      { 'Concepto': 'Total de Pagos', 'Valor': resumen.totalPagos },
      { 'Concepto': '', 'Valor': '' }, // Separador
      { 'Concepto': 'Pagos Realizados', 'Valor': resumen.pagosPagados },
      { 'Concepto': 'Pagos Pendientes', 'Valor': resumen.pagosPendientes },
      { 'Concepto': 'Pagos Vencidos', 'Valor': resumen.pagosVencidos },
      { 'Concepto': '', 'Valor': '' }, // Separador
      { 'Concepto': 'Monto Total', 'Valor': `S/ ${resumen.montoTotal.toFixed(2)}` },
      { 'Concepto': 'Monto Pagado', 'Valor': `S/ ${resumen.montoPagado.toFixed(2)}` },
      { 'Concepto': 'Monto Pendiente', 'Valor': `S/ ${resumen.montoPendiente.toFixed(2)}` },
      { 'Concepto': '', 'Valor': '' }, // Separador
      { 'Concepto': 'Porcentaje Pagado', 'Valor': `${((resumen.pagosPagados / resumen.totalPagos) * 100).toFixed(1)}%` },
      { 'Concepto': 'Eficiencia de Cobranza', 'Valor': `${((resumen.montoPagado / resumen.montoTotal) * 100).toFixed(1)}%` }
    ]

    const wsResumen = XLSX.utils.json_to_sheet(datosResumen)
    wsResumen['!cols'] = [
      { wch: 25 }, // Concepto
      { wch: 20 }  // Valor
    ]

    this.aplicarEstilosHeader(wsResumen)
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen")
  }
}

export default ExcelExporter