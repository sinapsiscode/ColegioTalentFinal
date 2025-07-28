// Versión mejorada del procesarCodigoQR
procesarCodigoQR: (codigoQR) => {
  const { configuracionEscaner } = get()
  
  return new Promise(async (resolve, reject) => {
    set({ cargando: true })
    
    try {
      // 1. Decodificar datos del QR
      const decodedData = decodeQRData(codigoQR)
      
      if (!decodedData.valid) {
        throw new Error(decodedData.error || 'Código QR inválido')
      }
      
      // 2. Validar ubicación si está habilitado
      const validacionUbicacion = await get().validarUbicacionEnColegio()
      if (!validacionUbicacion.valida && configuracionEscaner.validacionGPS) {
        throw new Error(validacionUbicacion.mensaje)
      }
      
      let registro = null
      
      // 3. Procesar según el tipo de persona
      if (decodedData.type === 'estudiante' || (decodedData.format === 'simple' && codigoQR.startsWith('E'))) {
        // Procesar estudiante
        registro = await procesarEstudiante(codigoQR, decodedData, validacionUbicacion)
      } else if (decodedData.type === 'tutor' || decodedData.type === 'teacher_id' || (decodedData.format === 'simple' && codigoQR.startsWith('T'))) {
        // Procesar tutor
        registro = await procesarTutor(codigoQR, decodedData, validacionUbicacion)
      } else if (decodedData.type === 'personal' || decodedData.type === 'staff_id' || (decodedData.format === 'simple' && codigoQR.startsWith('P'))) {
        // Procesar personal
        registro = await procesarPersonal(codigoQR, decodedData, validacionUbicacion)
      } else {
        throw new Error('Tipo de código QR no reconocido')
      }
      
      // 4. Actualizar registros y estadísticas
      const { registrosAsistencia } = get()
      const nuevosRegistros = [...registrosAsistencia, registro]
      
      set({
        registrosAsistencia: nuevosRegistros,
        cargando: false,
        errorEscaner: null
      })
      
      // 5. Actualizar estadísticas
      get().actualizarEstadisticas()
      
      // 6. Reproducir sonido y vibración si están activados
      if (configuracionEscaner.sonidoActivado) {
        playBeepSound()
      }
      
      if (configuracionEscaner.vibracionActivada && navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
      
      resolve(registro)
    } catch (error) {
      set({ 
        errorEscaner: error.message,
        cargando: false
      })
      reject(error)
    }
  })
}

// Funciones auxiliares
const procesarEstudiante = async (codigoQR, decodedData, validacionUbicacion) => {
  // Buscar estudiante
  const estudiantes = DatabaseQueries.getAllStudents()
  let estudiante = null
  
  if (decodedData.id) {
    estudiante = estudiantes.find(e => e.id === decodedData.id)
  }
  
  if (!estudiante && codigoQR) {
    // Buscar por código QR o por patrón antiguo
    estudiante = estudiantes.find(e => 
      e.codigo_qr === codigoQR ||
      e.id === parseInt(codigoQR.match(/E00(\d+)/)?.[1] || '0')
    )
  }
  
  if (!estudiante) {
    throw new Error('Estudiante no registrado en el sistema')
  }
  
  // Determinar tipo de registro (entrada/salida)
  const { registrarAsistencia, obtenerRegistroHoy } = useAttendanceStore.getState()
  const registroExistente = obtenerRegistroHoy(estudiante.id)
  const tipoRegistro = !registroExistente || registroExistente.salida ? 'entrada' : 'salida'
  
  // Verificar modo de operación
  const { configuracionEscaner } = get()
  if (configuracionEscaner.modoOperacion !== 'ambos' && configuracionEscaner.modoOperacion !== tipoRegistro) {
    throw new Error(`Solo se permite registrar ${configuracionEscaner.modoOperacion}s`)
  }
  
  // Registrar asistencia
  const resultado = registrarAsistencia(estudiante.id, tipoRegistro)
  
  if (!resultado.success) {
    throw new Error(resultado.mensaje)
  }
  
  // Crear registro para scanner
  const nuevoRegistro = {
    id: `REG${Date.now()}`,
    tipoPersona: 'estudiante',
    persona: {
      id: estudiante.id,
      codigo: estudiante.codigo_qr || codigoQR,
      nombre: `${estudiante.nombre} ${estudiante.apellidos || ''}`.trim(),
      grado: estudiante.grado,
      seccion: estudiante.seccion,
      fotoUrl: estudiante.foto || '/images/default-avatar.jpg'
    },
    tipo: tipoRegistro,
    fecha: new Date(),
    metodo: 'qr',
    ubicacion: 'Puerta Principal',
    usuario: 'Sistema Scanner',
    observaciones: validacionUbicacion.mensaje,
    estado: 'confirmado',
    coordenadas: validacionUbicacion.ubicacionActual,
    distanciaColegio: validacionUbicacion.distancia
  }
  
  // Notificar a padres
  try {
    const { notificarAsistenciaEnTiempoReal } = await import('../stores/notificationsStore').then(m => m.default.getState())
    notificarAsistenciaEnTiempoReal(estudiante.id, tipoRegistro, 'Puerta Principal')
  } catch (error) {
    console.warn('No se pudo enviar notificación:', error)
  }
  
  return nuevoRegistro
}

const procesarTutor = async (codigoQR, decodedData, validacionUbicacion) => {
  const { procesarCodigoQRTutor } = useTutorAttendanceStore.getState()
  const registroTutor = await procesarCodigoQRTutor(codigoQR)
  
  // Adaptar el formato del registro para el scanner
  return {
    ...registroTutor,
    tipoPersona: 'tutor',
    persona: registroTutor.tutor,
    coordenadas: validacionUbicacion.ubicacionActual,
    distanciaColegio: validacionUbicacion.distancia
  }
}

const procesarPersonal = async (codigoQR, decodedData, validacionUbicacion) => {
  // TODO: Implementar procesamiento de personal
  throw new Error('Procesamiento de personal no implementado aún')
}

const playBeepSound = () => {
  try {
    const audio = new Audio('/sounds/beep.mp3')
    audio.volume = 0.5
    audio.play().catch(() => {
      // Fallback: usar Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      gainNode.gain.value = 0.1
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    })
  } catch (error) {
    console.log('No se pudo reproducir sonido:', error)
  }
}