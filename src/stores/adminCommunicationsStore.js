import { create } from 'zustand'

const useAdminCommunicationsStore = create((set, get) => ({
  cargando: false,
  comunicados: [],
  filtros: {
    categoria: 'all',
    prioridad: 'all',
    estado: 'all',
    autor: 'all',
    audiencia: 'all'
  },
  paginacion: {
    pagina: 1,
    totalPaginas: 1,
    elementosPorPagina: 12,
    total: 0
  },
  configuraciones: {},
  
  cargarComunicados: () => {
    set({ cargando: true })
    
    setTimeout(() => {
      const comunicados = [
        {
          id: 1,
          titulo: 'Protocolo de Seguridad Actualizado - COVID-19',
          contenido: 'Estimada comunidad educativa,\\n\\nCon el objetivo de mantener la seguridad y bienestar de todos los miembros de nuestra institución, hemos actualizado nuestros protocolos de seguridad siguiendo las últimas recomendaciones del Ministerio de Salud.\\n\\nNUEVAS MEDIDAS IMPLEMENTADAS:\\n\\n1. INGRESO AL PLANTEL:\\n   • Control de temperatura obligatorio en todas las entradas\\n   • Uso de mascarilla obligatorio en espacios cerrados\\n   • Desinfección de manos al ingresar\\n   • Distanciamiento social de 1 metro en filas\\n\\n2. DURANTE LAS CLASES:\\n   • Ventilación cruzada constante en todas las aulas\\n   • Capacidad reducida al 80% en aulas\\n   • Desinfección de superficies cada 2 horas\\n   • Recreos escalonados por grados\\n\\n3. ALIMENTACIÓN:\\n   • Servicio de cafetería con medidas sanitarias reforzadas\\n   • Espacios de alimentación ampliados\\n   • Turnos diferenciados para evitar aglomeraciones\\n\\n4. ACTIVIDADES EXTRACURRICULARES:\\n   • Deportes al aire libre prioritariamente\\n   • Grupos reducidos en actividades artísticas\\n   • Eventos masivos suspendidos temporalmente\\n\\nESTAS MEDIDAS SON DE CUMPLIMIENTO OBLIGATORIO para toda la comunidad educativa. El incumplimiento podrá resultar en medidas disciplinarias.\\n\\nContamos con su comprensión y colaboración para mantener un ambiente seguro para el aprendizaje.',
          categoria: 'salud',
          prioridad: 'alta',
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
          autor: 'Dirección General',
          autorId: 'admin',
          estado: 'publicado',
          audiencia: 'toda_comunidad',
          dirigidoA: ['Toda la comunidad educativa'],
          grados: ['todos'],
          etiquetas: ['seguridad', 'covid-19', 'protocolo', 'salud'],
          adjuntos: [
            { nombre: 'protocolo_seguridad_actualizado.pdf', tipo: 'pdf', tamaño: '2.1 MB' },
            { nombre: 'infografia_medidas.png', tipo: 'imagen', tamaño: '456 KB' }
          ],
          fechaPublicacion: new Date(Date.now() - 2 * 60 * 60 * 1000),
          fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          vistas: 347,
          respuestas: 45,
          confirmacionLectura: true,
          lecturas: 289,
          prioridad_sistema: 'critica'
        },
        {
          id: 2,
          titulo: 'Convocatoria: Reunión General de Padres de Familia',
          contenido: 'Estimados padres de familia,\\n\\nTenemos el agrado de invitarlos a la REUNIÓN GENERAL DE PADRES DE FAMILIA que se realizará el próximo viernes 2 de febrero de 2024.\\n\\nDETALLES DEL EVENTO:\\n\\n📅 FECHA: Viernes 2 de febrero de 2024\\n🕕 HORA: 6:00 PM - 8:00 PM\\n📍 LUGAR: Auditorio Principal (Capacidad: 300 personas)\\n\\nAGENDA PRINCIPAL:\\n\\n1. SALUDO E INTRODUCCIÓN (15 min)\\n   • Bienvenida a cargo de la Dirección\\n   • Presentación de la agenda\\n\\n2. INFORME ACADÉMICO (30 min)\\n   • Resultados del I Bimestre 2024\\n   • Estadísticas de rendimiento por grados\\n   • Programas de refuerzo académico\\n\\n3. INFORME ADMINISTRATIVO (20 min)\\n   • Estado financiero de la institución\\n   • Inversiones en infraestructura\\n   • Proyectos para el 2024\\n\\n4. NUEVOS PROYECTOS EDUCATIVOS (25 min)\\n   • Programa de Inglés Intensivo\\n   • Talleres de Robótica y Programación\\n   • Club de Debate y Oratoria\\n\\n5. ESPACIO PARA PREGUNTAS Y SUGERENCIAS (20 min)\\n   • Intervenciones de padres de familia\\n   • Propuestas y observaciones\\n\\n6. COMPROMISOS Y CIERRE (10 min)\\n\\nIMPORTANTE:\\n• Por favor confirmar asistencia respondiendo a este comunicado\\n• Se proporcionará material informativo impreso\\n• Habrá servicio de cafetería disponible\\n• Se habilitará estacionamiento adicional\\n\\n¡Su participación es fundamental para el desarrollo de nuestra comunidad educativa!',
          categoria: 'reunion',
          prioridad: 'alta',
          fecha: new Date(Date.now() - 6 * 60 * 60 * 1000),
          autor: 'Coordinación Académica',
          autorId: 'coord_academica',
          estado: 'publicado',
          audiencia: 'padres',
          dirigidoA: ['Padres de familia'],
          grados: ['todos'],
          etiquetas: ['reunión', 'padres', 'académico', 'febrero'],
          adjuntos: [
            { nombre: 'agenda_reunion_padres.pdf', tipo: 'pdf', tamaño: '890 KB' },
            { nombre: 'informe_academico_I_bimestre.pdf', tipo: 'pdf', tamaño: '1.2 MB' }
          ],
          fechaPublicacion: new Date(Date.now() - 6 * 60 * 60 * 1000),
          fechaVencimiento: new Date('2024-02-02'),
          vistas: 156,
          respuestas: 87,
          confirmacionLectura: true,
          lecturas: 134,
          evento: {
            fecha: new Date('2024-02-02T18:00:00'),
            lugar: 'Auditorio Principal',
            confirmados: 87
          }
        },
        {
          id: 3,
          titulo: 'Cronograma de Evaluaciones - II Bimestre 2024',
          contenido: 'Estimados estudiantes, padres de familia y docentes,\\n\\nPonemos en conocimiento el CRONOGRAMA OFICIAL DE EVALUACIONES correspondiente al II Bimestre del año académico 2024.\\n\\nFECHAS IMPORTANTES:\\n\\n📚 SEMANA 1: Del 5 al 9 de febrero\\n\\n• LUNES 5 DE FEBRERO:\\n  - 1er Grado: Evaluación de Matemáticas (8:00 AM)\\n  - 3er Grado: Evaluación de Ciencias (10:00 AM)\\n  - 5to Grado: Evaluación de Comunicación (2:00 PM)\\n\\n• MARTES 6 DE FEBRERO:\\n  - 2do Grado: Evaluación de Comunicación (8:00 AM)\\n  - 4to Grado: Evaluación de Matemáticas (10:00 AM)\\n  - 1er Grado: Evaluación de Personal Social (2:00 PM)\\n\\n• MIÉRCOLES 7 DE FEBRERO:\\n  - 3er Grado: Evaluación de Matemáticas (8:00 AM)\\n  - 5to Grado: Evaluación de Ciencias (10:00 AM)\\n  - 2do Grado: Evaluación de Arte (2:00 PM)\\n\\n• JUEVES 8 DE FEBRERO:\\n  - 4to Grado: Evaluación de Ciencias (8:00 AM)\\n  - 1er Grado: Evaluación de Ciencias (10:00 AM)\\n  - 3er Grado: Evaluación de Inglés (2:00 PM)\\n\\n• VIERNES 9 DE FEBRERO:\\n  - 2do Grado: Evaluación de Matemáticas (8:00 AM)\\n  - 5to Grado: Evaluación de Personal Social (10:00 AM)\\n  - 4to Grado: Evaluación de Comunicación (2:00 PM)\\n\\n📚 SEMANA 2: Del 12 al 16 de febrero\\n\\n• EVALUACIONES ORALES Y PRÁCTICAS\\n• PRESENTACIÓN DE PROYECTOS\\n• EVALUACIONES DE EDUCACIÓN FÍSICA\\n\\nRECOMENDACIONES PARA LOS ESTUDIANTES:\\n\\n✓ Revisar todos los temas vistos durante el bimestre\\n✓ Practicar con ejercicios similares a los desarrollados en clase\\n✓ Descansar adecuadamente la noche anterior\\n✓ Llegar puntualmente el día de la evaluación\\n✓ Traer todos los materiales necesarios (lápices, borradores, etc.)\\n\\nRECOMendaciones PARA LOS PADRES:\\n\\n✓ Acompañar a sus hijos en el proceso de preparación\\n✓ Verificar que tengan todos los materiales necesarios\\n✓ Mantener una rutina de estudio organizada\\n✓ Evitar presión excesiva, generar un ambiente de confianza\\n\\nQualquier consulta adicional puede dirigirse a los tutores de cada grado o a la Coordinación Académica.',
          categoria: 'academico',
          prioridad: 'alta',
          fecha: new Date(Date.now() - 12 * 60 * 60 * 1000),
          autor: 'Coordinación Académica',
          autorId: 'coord_academica',
          estado: 'publicado',
          audiencia: 'estudiantes_padres',
          dirigidoA: ['Estudiantes', 'Padres de familia', 'Docentes'],
          grados: ['1ro A', '1ro B', '2do A', '2do B', '3ro A', '3ro B', '4to A', '4to B', '5to A', '5to B'],
          etiquetas: ['evaluaciones', 'cronograma', 'II bimestre', 'académico'],
          adjuntos: [
            { nombre: 'cronograma_evaluaciones_II_bimestre.pdf', tipo: 'pdf', tamaño: '1.8 MB' },
            { nombre: 'temarios_por_grado.pdf', tipo: 'pdf', tamaño: '2.3 MB' }
          ],
          fechaPublicacion: new Date(Date.now() - 12 * 60 * 60 * 1000),
          fechaVencimiento: new Date('2024-02-16'),
          vistas: 234,
          respuestas: 23,
          confirmacionLectura: true,
          lecturas: 198
        },
        {
          id: 4,
          titulo: 'Implementación de Nuevos Talleres Extracurriculares',
          contenido: 'Estimada comunidad educativa,\\n\\nNos complace anunciar la implementación de NUEVOS TALLERES EXTRACURRICULARES que enriquecerán la formación integral de nuestros estudiantes.\\n\\nTALLERES DISPONIBLES A PARTIR DE MARZO 2024:\\n\\n🤖 ROBÓTICA Y PROGRAMACIÓN\\n• Dirigido a: 3ro, 4to y 5to grado\\n• Horario: Martes y jueves 3:30 - 5:00 PM\\n• Instructor: Ing. Carlos Mendoza\\n• Cupos: 20 estudiantes por nivel\\n• Costo mensual: S/. 120\\n\\n🎭 TEATRO Y EXPRESIÓN CORPORAL\\n• Dirigido a: Todos los grados\\n• Horario: Lunes y miércoles 3:30 - 5:00 PM\\n• Instructora: Lic. Ana Rodríguez\\n• Cupos: 15 estudiantes por grupo\\n• Costo mensual: S/. 100\\n\\n🎵 CORO INSTITUCIONAL\\n• Dirigido a: 2do, 3ro, 4to y 5to grado\\n• Horario: Martes y viernes 3:30 - 5:00 PM\\n• Instructor: Prof. Miguel Torres\\n• Cupos: 30 estudiantes\\n• Costo mensual: S/. 80\\n\\n🏃‍♂️ ATLETISMO Y DEPORTES\\n• Dirigido a: Todos los grados\\n• Horario: Lunes, miércoles y viernes 3:30 - 5:00 PM\\n• Instructor: Prof. Roberto Silva\\n• Cupos: 25 estudiantes por categoría\\n• Costo mensual: S/. 90\\n\\n🎨 ARTE Y MANUALIDADES\\n• Dirigido a: 1ro, 2do y 3er grado\\n• Horario: Martes y jueves 3:30 - 4:30 PM\\n• Instructora: Prof. Carmen Flores\\n• Cupos: 18 estudiantes por grupo\\n• Costo mensual: S/. 85\\n\\n♟️ AJEDREZ ESTRATÉGICO\\n• Dirigido a: Todos los grados\\n• Horario: Miércoles y sábados 9:00 - 10:30 AM\\n• Instructor: Maestro Jorge Vega\\n• Cupos: 20 estudiantes\\n• Costo mensual: S/. 95\\n\\nBENEFICIOS DE LOS TALLERES:\\n\\n✓ Desarrollo de habilidades específicas\\n✓ Estimulación de la creatividad\\n✓ Fortalecimiento de la autoestima\\n✓ Socialización e integración\\n✓ Preparación para competencias\\n\\nINSCRIPCIONES:\\n\\n📅 Fecha de inicio: 4 de marzo de 2024\\n📝 Inscripciones: Del 12 al 23 de febrero\\n💰 Forma de pago: Mensual o bimestral\\n📋 Requisitos: Ficha de inscripción y autorización de padres\\n\\nPara mayor información e inscripciones, dirigirse a la Coordinación de Actividades Extracurriculares en horario de oficina.',
          categoria: 'extracurricular',
          prioridad: 'media',
          fecha: new Date(Date.now() - 18 * 60 * 60 * 1000),
          autor: 'Coordinación Extracurricular',
          autorId: 'coord_extra',
          estado: 'publicado',
          audiencia: 'estudiantes_padres',
          dirigidoA: ['Estudiantes', 'Padres de familia'],
          grados: ['todos'],
          etiquetas: ['talleres', 'extracurricular', 'inscripciones', 'marzo'],
          adjuntos: [
            { nombre: 'catalogo_talleres_2024.pdf', tipo: 'pdf', tamaño: '3.2 MB' },
            { nombre: 'ficha_inscripcion.pdf', tipo: 'pdf', tamaño: '567 KB' }
          ],
          fechaPublicacion: new Date(Date.now() - 18 * 60 * 60 * 1000),
          fechaVencimiento: new Date('2024-02-23'),
          vistas: 89,
          respuestas: 34,
          confirmacionLectura: false,
          lecturas: 67
        },
        {
          id: 5,
          titulo: 'Actualización de Cuotas y Aranceles 2024',
          contenido: 'Estimados padres de familia,\\n\\nDe acuerdo con la Resolución de Costos Educativos aprobada por el Ministerio de Educación y considerando los incrementos en servicios básicos y mantenimiento de infraestructura, informamos la ACTUALIZACIÓN DE CUOTAS Y ARANCELES para el año académico 2024.\\n\\nNUEVAS TARIFAS VIGENTES A PARTIR DE MARZO 2024:\\n\\n📚 PENSIÓN DE ENSEÑANZA:\\n\\n• 1er y 2do Grado: S/. 380 mensuales\\n• 3er y 4to Grado: S/. 420 mensuales\\n• 5to Grado: S/. 450 mensuales\\n\\n📋 SERVICIOS ADICIONALES:\\n\\n• Matrícula anual: S/. 350 (por estudiante)\\n• Seguro escolar: S/. 45 anuales\\n• Agenda institucional: S/. 25\\n• Carné estudiantil: S/. 15\\n• Certificados de estudios: S/. 35 c/u\\n• Constancias: S/. 25 c/u\\n\\n🍽️ SERVICIO DE ALIMENTACIÓN:\\n\\n• Desayuno: S/. 8 diarios\\n• Almuerzo: S/. 12 diarios\\n• Lonchera saludable: S/. 6 diarios\\n• Paquete completo: S/. 22 diarios\\n\\n🚌 TRANSPORTE ESCOLAR:\\n\\n• Servicio completo (ida y vuelta): S/. 180 mensuales\\n• Servicio parcial (solo ida o vuelta): S/. 120 mensuales\\n\\n📚 SERVICIOS ACADÉMICOS ESPECIALES:\\n\\n• Tutorías individuales: S/. 35 por sesión\\n• Clases de refuerzo: S/. 25 por sesión\\n• Evaluaciones de recuperación: S/. 45 c/u\\n• Cursos de verano: S/. 220 por curso\\n\\nFORMAS DE PAGO:\\n\\n✓ Pago mensual: Del 1 al 10 de cada mes\\n✓ Pago bimestral: 5% de descuento\\n✓ Pago semestral: 8% de descuento\\n✓ Pago anual: 12% de descuento\\n\\nCANALES DE PAGO:\\n\\n• Caja de la institución (8:00 AM - 4:00 PM)\\n• Transferencia bancaria\\n• Pago en línea (próximamente)\\n\\nIMPORTANTE:\\n\\n⚠️ Los pagos realizados después del día 10 tendrán un recargo del 3%\\n⚠️ Estudiantes con 3 cuotas vencidas no podrán rendir evaluaciones\\n⚠️ La mora de 4 cuotas implica suspensión del servicio educativo\\n\\nEsta actualización nos permite mantener la calidad educativa y continuar con las mejoras en infraestructura y servicios.\\n\\nPara consultas sobre becas, facilidades de pago o cualquier inquietud, pueden acercarse al Departamento Administrativo.',
          categoria: 'administrativo',
          prioridad: 'alta',
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000),
          autor: 'Administración',
          autorId: 'admin',
          estado: 'publicado',
          audiencia: 'padres',
          dirigidoA: ['Padres de familia'],
          grados: ['todos'],
          etiquetas: ['cuotas', 'aranceles', 'pagos', '2024'],
          adjuntos: [
            { nombre: 'tarifario_2024.pdf', tipo: 'pdf', tamaño: '1.1 MB' },
            { nombre: 'cronograma_pagos.pdf', tipo: 'pdf', tamaño: '445 KB' }
          ],
          fechaPublicacion: new Date(Date.now() - 24 * 60 * 60 * 1000),
          fechaVencimiento: null,
          vistas: 267,
          respuestas: 56,
          confirmacionLectura: true,
          lecturas: 201
        },
        {
          id: 6,
          titulo: 'BORRADOR - Celebración del Día del Maestro',
          contenido: 'Estimada comunidad educativa,\\n\\nEn reconocimiento a la invaluable labor de nuestros docentes, tenemos el agrado de invitarlos a participar en la celebración del DÍA DEL MAESTRO.\\n\\n[BORRADOR EN DESARROLLO]\\n\\nActividades propuestas:\\n- Ceremonia de reconocimiento\\n- Almuerzo de confraternidad\\n- Presentaciones artísticas de estudiantes\\n- Entrega de reconocimientos\\n\\nEste comunicado será completado y publicado próximamente con todos los detalles del evento.',
          categoria: 'evento',
          prioridad: 'media',
          fecha: new Date(Date.now() - 30 * 60 * 60 * 1000),
          autor: 'Coordinación de Eventos',
          autorId: 'coord_eventos',
          estado: 'borrador',
          audiencia: 'toda_comunidad',
          dirigidoA: ['Toda la comunidad educativa'],
          grados: ['todos'],
          etiquetas: ['día del maestro', 'celebración', 'evento', 'borrador'],
          adjuntos: [],
          fechaPublicacion: null,
          fechaVencimiento: null,
          vistas: 0,
          respuestas: 0,
          confirmacionLectura: false,
          lecturas: 0
        },
        {
          id: 7,
          titulo: 'Mantenimiento de Infraestructura - Aulas Renovadas',
          contenido: 'Estimada comunidad educativa,\\n\\nNos complace informar sobre las mejoras de infraestructura realizadas durante las vacaciones de enero para brindar un mejor ambiente de aprendizaje.\\n\\nTRABAJOS COMPLETADOS:\\n\\n🏗️ RENOVACIÓN DE AULAS:\\n• Aulas 201, 202, 203 - Segundo piso\\n• Pintura completa con colores educativos\\n• Instalación de nuevos sistemas de iluminación LED\\n• Reparación y mantenimiento de carpetas\\n• Instalación de cortinas blackout\\n\\n💡 SISTEMA ELÉCTRICO:\\n• Renovación completa del cableado eléctrico\\n• Instalación de tomacorrientes adicionales\\n• Sistema de respaldo eléctrico mejorado\\n• Iluminación de emergencia actualizada\\n\\n🌐 CONECTIVIDAD:\\n• Ampliación de la red WiFi institucional\\n• Velocidad de internet aumentada a 200 Mbps\\n• Puntos de acceso en todas las aulas\\n• Sistema de control parental implementado\\n\\n🚿 SERVICIOS HIGIÉNICOS:\\n• Renovación completa de baños del segundo piso\\n• Instalación de grifería automática\\n• Sistema de secado de manos eléctrico\\n• Mejoras en ventilación y extractores\\n\\n🌳 ÁREAS VERDES:\\n• Implementación de jardines en el patio central\\n• Sistema de riego automático\\n• Mobiliario ecológico para descanso\\n• Tachos de reciclaje diferenciado\\n\\nPRÓXIMAS MEJORAS PROGRAMADAS:\\n\\n📅 FEBRERO 2024:\\n• Renovación de la biblioteca\\n• Ampliación del laboratorio de ciencias\\n\\n📅 MARZO 2024:\\n• Mejoras en el auditorio\\n• Renovación de la sala de profesores\\n\\n📅 ABRIL 2024:\\n• Implementación de aula virtual\\n• Renovación del patio de recreo\\n\\nINVERSIÓN TOTAL: S/. 180,000\\n\\nEstas mejoras forman parte de nuestro compromiso permanente con la excelencia educativa y el bienestar de nuestra comunidad.',
          categoria: 'infraestructura',
          prioridad: 'media',
          fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          autor: 'Administración',
          autorId: 'admin',
          estado: 'publicado',
          audiencia: 'toda_comunidad',
          dirigidoA: ['Toda la comunidad educativa'],
          grados: ['todos'],
          etiquetas: ['infraestructura', 'mejoras', 'aulas', 'mantenimiento'],
          adjuntos: [
            { nombre: 'fotos_mejoras_infraestructura.pdf', tipo: 'pdf', tamaño: '4.2 MB' },
            { nombre: 'cronograma_proximas_mejoras.pdf', tipo: 'pdf', tamaño: '678 KB' }
          ],
          fechaPublicacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          fechaVencimiento: null,
          vistas: 123,
          respuestas: 18,
          confirmacionLectura: false,
          lecturas: 98
        }
      ]
      
      const configuraciones = {
        categorias: {
          'academico': 'Académico',
          'administrativo': 'Administrativo',
          'reunion': 'Reuniones',
          'evento': 'Eventos',
          'salud': 'Salud y Seguridad',
          'extracurricular': 'Actividades Extracurriculares',
          'infraestructura': 'Infraestructura',
          'financiero': 'Financiero',
          'tecnologia': 'Tecnología',
          'deportes': 'Deportes'
        },
        prioridades: {
          'baja': 'Baja',
          'media': 'Media',
          'alta': 'Alta',
          'critica': 'Crítica'
        },
        estados: {
          'borrador': 'Borrador',
          'revision': 'En Revisión',
          'programado': 'Programado',
          'publicado': 'Publicado',
          'archivado': 'Archivado'
        },
        audiencias: {
          'toda_comunidad': 'Toda la comunidad',
          'estudiantes': 'Solo estudiantes',
          'padres': 'Solo padres',
          'docentes': 'Solo docentes',
          'administrativos': 'Personal administrativo',
          'estudiantes_padres': 'Estudiantes y padres',
          'personal_interno': 'Personal interno'
        },
        grados: [
          '1ro A', '1ro B',
          '2do A', '2do B', 
          '3ro A', '3ro B',
          '4to A', '4to B',
          '5to A', '5to B',
          'todos'
        ],
        autores: {
          'admin': 'Administración',
          'direccion': 'Dirección General',
          'coord_academica': 'Coordinación Académica',
          'coord_extra': 'Coordinación Extracurricular',
          'coord_eventos': 'Coordinación de Eventos',
          'secretaria': 'Secretaría Académica'
        },
        plantillas: {
          'comunicado_general': 'Comunicado General',
          'convocatoria': 'Convocatoria',
          'cronograma': 'Cronograma',
          'urgente': 'Comunicado Urgente',
          'evento': 'Evento/Actividad',
          'academico': 'Comunicado Académico'
        }
      }
      
      set({
        comunicados,
        configuraciones,
        cargando: false,
        paginacion: {
          ...get().paginacion,
          total: comunicados.length,
          totalPaginas: Math.ceil(comunicados.length / get().paginacion.elementosPorPagina)
        }
      })
    }, 800)
  },
  
  crearComunicado: (nuevoComunicado) => {
    const { comunicados } = get()
    const comunicado = {
      id: Date.now(),
      ...nuevoComunicado,
      fecha: new Date(),
      autor: 'Administración',
      autorId: 'admin',
      vistas: 0,
      respuestas: 0,
      lecturas: 0,
      fechaPublicacion: nuevoComunicado.estado === 'publicado' ? new Date() : null
    }
    
    set({ comunicados: [comunicado, ...comunicados] })
    return comunicado.id
  },
  
  editarComunicado: (comunicadoId, cambios) => {
    const { comunicados } = get()
    const nuevosComunicados = comunicados.map(com =>
      com.id === comunicadoId
        ? {
            ...com,
            ...cambios,
            fechaPublicacion: cambios.estado === 'publicado' && !com.fechaPublicacion ? new Date() : com.fechaPublicacion
          }
        : com
    )
    set({ comunicados: nuevosComunicados })
  },
  
  eliminarComunicado: (comunicadoId) => {
    const { comunicados } = get()
    const nuevosComunicados = comunicados.filter(com => com.id !== comunicadoId)
    set({ comunicados: nuevosComunicados })
  },
  
  publicarComunicado: (comunicadoId) => {
    const { comunicados } = get()
    const nuevosComunicados = comunicados.map(com =>
      com.id === comunicadoId
        ? { ...com, estado: 'publicado', fechaPublicacion: new Date() }
        : com
    )
    set({ comunicados: nuevosComunicados })
  },
  
  archivarComunicado: (comunicadoId) => {
    const { comunicados } = get()
    const nuevosComunicados = comunicados.map(com =>
      com.id === comunicadoId
        ? { ...com, estado: 'archivado' }
        : com
    )
    set({ comunicados: nuevosComunicados })
  },
  
  duplicarComunicado: (comunicadoId) => {
    const { comunicados } = get()
    const comunicadoOriginal = comunicados.find(com => com.id === comunicadoId)
    
    if (comunicadoOriginal) {
      const comunicadoDuplicado = {
        ...comunicadoOriginal,
        id: Date.now(),
        titulo: `Copia de ${comunicadoOriginal.titulo}`,
        estado: 'borrador',
        fecha: new Date(),
        fechaPublicacion: null,
        vistas: 0,
        respuestas: 0,
        lecturas: 0
      }
      
      set({ comunicados: [comunicadoDuplicado, ...comunicados] })
      return comunicadoDuplicado.id
    }
  },
  
  programarComunicado: (comunicadoId, fechaProgramada) => {
    const { comunicados } = get()
    const nuevosComunicados = comunicados.map(com =>
      com.id === comunicadoId
        ? { 
            ...com, 
            estado: 'programado',
            fechaPublicacion: fechaProgramada
          }
        : com
    )
    set({ comunicados: nuevosComunicados })
  },
  
  obtenerComunicadosPorFiltros: () => {
    const { comunicados, filtros, paginacion } = get()
    let resultado = [...comunicados]
    
    // Filtrar por categoría
    if (filtros.categoria !== 'all') {
      resultado = resultado.filter(com => com.categoria === filtros.categoria)
    }
    
    // Filtrar por prioridad
    if (filtros.prioridad !== 'all') {
      resultado = resultado.filter(com => com.prioridad === filtros.prioridad)
    }
    
    // Filtrar por estado
    if (filtros.estado !== 'all') {
      resultado = resultado.filter(com => com.estado === filtros.estado)
    }
    
    // Filtrar por autor
    if (filtros.autor !== 'all') {
      resultado = resultado.filter(com => com.autorId === filtros.autor)
    }
    
    // Filtrar por audiencia
    if (filtros.audiencia !== 'all') {
      resultado = resultado.filter(com => com.audiencia === filtros.audiencia)
    }
    
    // Ordenar por fecha (más reciente primero)
    resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    
    // Paginación
    const inicio = (paginacion.pagina - 1) * paginacion.elementosPorPagina
    const fin = inicio + paginacion.elementosPorPagina
    
    return {
      comunicados: resultado.slice(inicio, fin),
      total: resultado.length,
      totalPaginas: Math.ceil(resultado.length / paginacion.elementosPorPagina)
    }
  },
  
  buscarComunicados: (termino) => {
    const { comunicados } = get()
    if (!termino.trim()) return comunicados
    
    const terminoLower = termino.toLowerCase()
    return comunicados.filter(com =>
      com.titulo.toLowerCase().includes(terminoLower) ||
      com.contenido.toLowerCase().includes(terminoLower) ||
      com.etiquetas.some(tag => tag.toLowerCase().includes(terminoLower)) ||
      com.autor.toLowerCase().includes(terminoLower)
    )
  },
  
  actualizarFiltros: (nuevosFiltros) => {
    set({ 
      filtros: { ...get().filtros, ...nuevosFiltros },
      paginacion: { ...get().paginacion, pagina: 1 }
    })
  },
  
  cambiarPagina: (nuevaPagina) => {
    set({ 
      paginacion: { ...get().paginacion, pagina: nuevaPagina }
    })
  },
  
  obtenerEstadisticas: () => {
    const { comunicados } = get()
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const esteMes = comunicados.filter(com => new Date(com.fecha) >= inicioMes).length
    
    return {
      total: comunicados.length,
      publicados: comunicados.filter(com => com.estado === 'publicado').length,
      borradores: comunicados.filter(com => com.estado === 'borrador').length,
      programados: comunicados.filter(com => com.estado === 'programado').length,
      archivados: comunicados.filter(com => com.estado === 'archivado').length,
      esteMes,
      totalVistas: comunicados.reduce((sum, com) => sum + com.vistas, 0),
      totalRespuestas: comunicados.reduce((sum, com) => sum + com.respuestas, 0),
      totalLecturas: comunicados.reduce((sum, com) => sum + com.lecturas, 0),
      porCategoria: {
        academico: comunicados.filter(com => com.categoria === 'academico').length,
        administrativo: comunicados.filter(com => com.categoria === 'administrativo').length,
        reunion: comunicados.filter(com => com.categoria === 'reunion').length,
        evento: comunicados.filter(com => com.categoria === 'evento').length,
        salud: comunicados.filter(com => com.categoria === 'salud').length,
        extracurricular: comunicados.filter(com => com.categoria === 'extracurricular').length,
        infraestructura: comunicados.filter(com => com.categoria === 'infraestructura').length
      },
      porPrioridad: {
        baja: comunicados.filter(com => com.prioridad === 'baja').length,
        media: comunicados.filter(com => com.prioridad === 'media').length,
        alta: comunicados.filter(com => com.prioridad === 'alta').length,
        critica: comunicados.filter(com => com.prioridad === 'critica').length
      },
      efectividad: {
        promedioVistas: comunicados.length > 0 ? Math.round(comunicados.reduce((sum, com) => sum + com.vistas, 0) / comunicados.length) : 0,
        tasaRespuesta: comunicados.length > 0 ? Math.round((comunicados.reduce((sum, com) => sum + com.respuestas, 0) / comunicados.reduce((sum, com) => sum + com.vistas, 0)) * 100) || 0 : 0,
        tasaLectura: comunicados.length > 0 ? Math.round((comunicados.reduce((sum, com) => sum + com.lecturas, 0) / comunicados.reduce((sum, com) => sum + com.vistas, 0)) * 100) || 0 : 0
      }
    }
  },
  
  exportarComunicados: (formato = 'excel') => {
    const { comunicados } = get()
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          archivo: `comunicados_${new Date().toISOString().split('T')[0]}.${formato}`,
          registros: comunicados.length,
          url: '#'
        })
      }, 1500)
    })
  },
  
  obtenerAnalytics: () => {
    const { comunicados } = get()
    const publicados = comunicados.filter(com => com.estado === 'publicado')
    
    if (publicados.length === 0) return null
    
    const promedioVistas = publicados.reduce((sum, com) => sum + com.vistas, 0) / publicados.length
    const promedioRespuestas = publicados.reduce((sum, com) => sum + com.respuestas, 0) / publicados.length
    
    const masVisto = publicados.reduce((max, com) => com.vistas > max.vistas ? com : max)
    const masRespondido = publicados.reduce((max, com) => com.respuestas > max.respuestas ? com : max)
    
    return {
      promedioVistas: Math.round(promedioVistas * 100) / 100,
      promedioRespuestas: Math.round(promedioRespuestas * 100) / 100,
      masVisto,
      masRespondido,
      engagementRate: publicados.length > 0 ? Math.round((promedioRespuestas / promedioVistas) * 100) || 0 : 0,
      tendencia: 'ascendente'
    }
  }
}))

export default useAdminCommunicationsStore