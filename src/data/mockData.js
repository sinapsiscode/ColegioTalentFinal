import { subDays, addDays } from 'date-fns'

export const alumnosMock = [
  {
    id: 1,
    nombre: 'Ana',
    apellidos: 'Rodríguez González',
    nombreCompleto: 'Ana Rodríguez González',
    grado: '5to Primaria',
    seccion: 'A',
    codigoQR: 'QR001',
    codigo_qr: 'E001234567890',
    padre: 'Carlos Rodríguez',
    telefono: '+51 987 654 321',
    email: 'carlos.rodriguez@email.com',
    foto: '/images/student1.jpg',
    fechaNacimiento: '2013-05-15',
    direccion: 'Av. Las Flores 123, San Isidro'
  },
  {
    id: 2,
    nombre: 'Luis',
    apellidos: 'Rodríguez González',
    nombreCompleto: 'Luis Rodríguez González',
    grado: '3ro Primaria',
    seccion: 'B',
    codigoQR: 'QR002',
    codigo_qr: 'E002345678901',
    padre: 'Carlos Rodríguez',
    telefono: '+51 987 654 321',
    email: 'carlos.rodriguez@email.com',
    foto: '/images/student2.jpg',
    fechaNacimiento: '2015-08-22',
    direccion: 'Av. Las Flores 123, San Isidro'
  },
  {
    id: 3,
    nombre: 'Sofia',
    apellidos: 'Martinez López',
    nombreCompleto: 'Sofia Martinez López',
    grado: '4to Primaria',
    seccion: 'A',
    codigoQR: 'QR003',
    codigo_qr: 'E003456789012',
    padre: 'Miguel Martinez',
    telefono: '+51 987 654 322',
    email: 'miguel.martinez@email.com',
    foto: '/images/student3.jpg',
    fechaNacimiento: '2014-03-10',
    direccion: 'Jr. Los Olivos 456, Miraflores'
  },
  {
    id: 4,
    nombre: 'Diego',
    apellidos: 'Fernández Ruiz',
    nombreCompleto: 'Diego Fernández Ruiz',
    grado: '6to Primaria',
    seccion: 'B',
    codigoQR: 'QR004',
    codigo_qr: 'E004567890123',
    padre: 'Roberto Fernández',
    telefono: '+51 987 654 323',
    email: 'roberto.fernandez@email.com',
    foto: '/images/student4.jpg',
    fechaNacimiento: '2012-12-05',
    direccion: 'Calle Las Palmeras 789, San Borja'
  },
  {
    id: 5,
    nombre: 'Valentina',
    apellidos: 'Torres Méndez',
    nombreCompleto: 'Valentina Torres Méndez',
    grado: '2do Primaria',
    seccion: 'A',
    codigoQR: 'QR005',
    codigo_qr: 'E005678901234',
    padre: 'Carmen Torres',
    telefono: '+51 987 654 324',
    email: 'carmen.torres@email.com',
    foto: '/images/student5.jpg',
    fechaNacimiento: '2016-07-18',
    direccion: 'Av. El Sol 321, Surco'
  },
  {
    id: 6,
    nombre: 'Sebastian',
    apellidos: 'Vargas Quispe',
    nombreCompleto: 'Sebastian Vargas Quispe',
    grado: '1ro Primaria',
    seccion: 'A',
    codigoQR: 'QR006',
    padre: 'Elena Vargas',
    telefono: '+51 987 654 325',
    email: 'elena.vargas@email.com',
    foto: '/images/student6.jpg',
    fechaNacimiento: '2017-01-25',
    direccion: 'Jr. Los Cedros 654, La Molina'
  },
  {
    id: 7,
    nombre: 'Isabella',
    apellidos: 'Morales Castro',
    nombreCompleto: 'Isabella Morales Castro',
    grado: '4to Primaria',
    seccion: 'B',
    codigoQR: 'QR007',
    padre: 'Ricardo Morales',
    telefono: '+51 987 654 326',
    email: 'ricardo.morales@email.com',
    foto: '/images/student7.jpg',
    fechaNacimiento: '2014-09-12',
    direccion: 'Calle Los Laureles 987, Barranco'
  },
  {
    id: 8,
    nombre: 'Mateo',
    apellidos: 'Herrera Silva',
    nombreCompleto: 'Mateo Herrera Silva',
    grado: '5to Primaria',
    seccion: 'B',
    codigoQR: 'QR008',
    padre: 'Patricia Herrera',
    telefono: '+51 987 654 327',
    email: 'patricia.herrera@email.com',
    foto: '/images/student8.jpg',
    fechaNacimiento: '2013-11-08',
    direccion: 'Av. Los Pinos 234, Jesús María'
  },
  {
    id: 9,
    nombre: 'Camila',
    apellidos: 'Ramos Delgado',
    nombreCompleto: 'Camila Ramos Delgado',
    grado: '3ro Primaria',
    seccion: 'A',
    codigoQR: 'QR009',
    padre: 'Fernando Ramos',
    telefono: '+51 987 654 328',
    email: 'fernando.ramos@email.com',
    foto: '/images/student9.jpg',
    fechaNacimiento: '2015-04-30',
    direccion: 'Jr. Las Rosas 567, Pueblo Libre'
  },
  {
    id: 10,
    nombre: 'Joaquín',
    apellidos: 'Mendoza Paz',
    nombreCompleto: 'Joaquín Mendoza Paz',
    grado: '6to Primaria',
    seccion: 'A',
    codigoQR: 'QR010',
    padre: 'Gloria Mendoza',
    telefono: '+51 987 654 329',
    email: 'gloria.mendoza@email.com',
    foto: '/images/student10.jpg',
    fechaNacimiento: '2012-06-14',
    direccion: 'Calle Los Jazmines 890, Magdalena'
  },
  {
    id: 11,
    nombre: 'Ximena',
    apellidos: 'Gutiérrez Rojas',
    nombreCompleto: 'Ximena Gutiérrez Rojas',
    grado: '2do Primaria',
    seccion: 'B',
    codigoQR: 'QR011',
    padre: 'Daniel Gutiérrez',
    telefono: '+51 987 654 330',
    email: 'daniel.gutierrez@email.com',
    foto: '/images/student11.jpg',
    fechaNacimiento: '2016-02-28',
    direccion: 'Av. Los Álamos 345, San Miguel'
  },
  {
    id: 12,
    nombre: 'Adrián',
    apellidos: 'Flores Vega',
    nombreCompleto: 'Adrián Flores Vega',
    grado: '1ro Primaria',
    seccion: 'B',
    codigoQR: 'QR012',
    padre: 'Lucia Flores',
    telefono: '+51 987 654 331',
    email: 'lucia.flores@email.com',
    foto: '/images/student12.jpg',
    fechaNacimiento: '2017-10-15',
    direccion: 'Jr. Los Sauces 678, Lince'
  },
  {
    id: 13,
    nombre: 'Antonella',
    apellidos: 'Jiménez Paredes',
    nombreCompleto: 'Antonella Jiménez Paredes',
    grado: '5to Primaria',
    seccion: 'A',
    codigoQR: 'QR013',
    padre: 'Andrés Jiménez',
    telefono: '+51 987 654 332',
    email: 'andres.jimenez@email.com',
    foto: '/images/student13.jpg',
    fechaNacimiento: '2013-08-03',
    direccion: 'Calle Los Eucaliptos 123, Breña'
  },
  {
    id: 14,
    nombre: 'Leonardo',
    apellidos: 'Castillo Núñez',
    nombreCompleto: 'Leonardo Castillo Núñez',
    grado: '3ro Primaria',
    seccion: 'A',
    codigoQR: 'QR014',
    padre: 'Mónica Castillo',
    telefono: '+51 987 654 333',
    email: 'monica.castillo@email.com',
    foto: '/images/student14.jpg',
    fechaNacimiento: '2015-12-20',
    direccion: 'Av. Las Magnolias 456, Chorrillos'
  },
  {
    id: 15,
    nombre: 'Valeria',
    apellidos: 'Peña Soto',
    nombreCompleto: 'Valeria Peña Soto',
    grado: '4to Primaria',
    seccion: 'A',
    codigoQR: 'QR015',
    padre: 'Jorge Peña',
    telefono: '+51 987 654 334',
    email: 'jorge.pena@email.com',
    foto: '/images/student15.jpg',
    fechaNacimiento: '2014-05-07',
    direccion: 'Jr. Los Nogales 789, Villa El Salvador'
  },
  {
    id: 16,
    nombre: 'Emilio',
    apellidos: 'Aguilar Ramírez',
    nombreCompleto: 'Emilio Aguilar Ramírez',
    grado: '6to Primaria',
    seccion: 'B',
    codigoQR: 'QR016',
    padre: 'Sandra Aguilar',
    telefono: '+51 987 654 335',
    email: 'sandra.aguilar@email.com',
    foto: '/images/student16.jpg',
    fechaNacimiento: '2012-01-16',
    direccion: 'Calle Los Cipreses 234, San Juan de Miraflores'
  },
  {
    id: 17,
    nombre: 'Daniela',
    apellidos: 'Cruz Medina',
    nombreCompleto: 'Daniela Cruz Medina',
    grado: '2do Primaria',
    seccion: 'A',
    codigoQR: 'QR017',
    padre: 'Manuel Cruz',
    telefono: '+51 987 654 336',
    email: 'manuel.cruz@email.com',
    foto: '/images/student17.jpg',
    fechaNacimiento: '2016-09-11',
    direccion: 'Av. Los Olmos 567, Villa María del Triunfo'
  },
  {
    id: 18,
    nombre: 'Rodrigo',
    apellidos: 'Salinas Ortega',
    nombreCompleto: 'Rodrigo Salinas Ortega',
    grado: '1ro Primaria',
    seccion: 'A',
    codigoQR: 'QR018',
    padre: 'Carla Salinas',
    telefono: '+51 987 654 337',
    email: 'carla.salinas@email.com',
    foto: '/images/student18.jpg',
    fechaNacimiento: '2017-03-24',
    direccion: 'Jr. Los Tulipanes 890, Los Olivos'
  },
  {
    id: 19,
    nombre: 'Renata',
    apellidos: 'León Espinoza',
    nombreCompleto: 'Renata León Espinoza',
    grado: '4to Primaria',
    seccion: 'B',
    codigoQR: 'QR019',
    padre: 'Raúl León',
    telefono: '+51 987 654 338',
    email: 'raul.leon@email.com',
    foto: '/images/student19.jpg',
    fechaNacimiento: '2014-11-02',
    direccion: 'Calle Las Orquídeas 345, Independencia'
  },
  {
    id: 20,
    nombre: 'Gabriel',
    apellidos: 'Santana Velasco',
    nombreCompleto: 'Gabriel Santana Velasco',
    grado: '5to Primaria',
    seccion: 'B',
    codigoQR: 'QR020',
    padre: 'Teresa Santana',
    telefono: '+51 987 654 339',
    email: 'teresa.santana@email.com',
    foto: '/images/student20.jpg',
    fechaNacimiento: '2013-07-29',
    direccion: 'Av. Los Ficus 678, San Martín de Porres'
  }
]

export const notasMock = [
  // Ana Rodríguez (ID: 1)
  { alumnoId: 1, materia: 'Matemáticas', nota: 18, periodo: 'I Bimestre', tipo: 'examen' },
  { alumnoId: 1, materia: 'Comunicación', nota: 17, periodo: 'I Bimestre', tipo: 'tarea' },
  { alumnoId: 1, materia: 'Ciencias', nota: 19, periodo: 'I Bimestre', tipo: 'proyecto' },
  { alumnoId: 1, materia: 'Historia', nota: 16, periodo: 'I Bimestre', tipo: 'examen' },
  { alumnoId: 1, materia: 'Inglés', nota: 20, periodo: 'I Bimestre', tipo: 'oral' },
  
  // Luis Rodríguez (ID: 2)
  { alumnoId: 2, materia: 'Matemáticas', nota: 16, periodo: 'I Bimestre', tipo: 'examen' },
  { alumnoId: 2, materia: 'Comunicación', nota: 18, periodo: 'I Bimestre', tipo: 'tarea' },
  { alumnoId: 2, materia: 'Ciencias', nota: 17, periodo: 'I Bimestre', tipo: 'proyecto' },
  { alumnoId: 2, materia: 'Arte', nota: 19, periodo: 'I Bimestre', tipo: 'práctica' },
  { alumnoId: 2, materia: 'Educación Física', nota: 20, periodo: 'I Bimestre', tipo: 'práctica' },
  
  // Sofia Martinez (ID: 3)
  { alumnoId: 3, materia: 'Matemáticas', nota: 20, periodo: 'I Bimestre', tipo: 'examen' },
  { alumnoId: 3, materia: 'Comunicación', nota: 19, periodo: 'I Bimestre', tipo: 'tarea' },
  { alumnoId: 3, materia: 'Ciencias', nota: 20, periodo: 'I Bimestre', tipo: 'proyecto' },
  { alumnoId: 3, materia: 'Historia', nota: 18, periodo: 'I Bimestre', tipo: 'examen' },
  { alumnoId: 3, materia: 'Inglés', nota: 19, periodo: 'I Bimestre', tipo: 'oral' }
]

export const comunicadosMock = [
  {
    id: 1,
    titulo: 'Reunión de Padres de Familia',
    contenido: 'Se convoca a todos los padres de familia a la reunión informativa que se realizará el próximo viernes 26 de enero a las 7:00 PM en el auditorio principal.',
    fecha: new Date('2024-01-22T10:00:00'),
    autor: 'Dirección General',
    tipo: 'reunion',
    importante: true,
    destinatarios: ['padres'],
    adjuntos: []
  },
  {
    id: 2,
    titulo: 'Suspensión de Clases por Mantenimiento',
    contenido: 'Informamos que el día lunes 29 de enero no habrá clases debido a trabajos de mantenimiento en las instalaciones eléctricas del colegio.',
    fecha: new Date('2024-01-20T08:30:00'),
    autor: 'Administración',
    tipo: 'suspension',
    importante: true,
    destinatarios: ['padres', 'estudiantes'],
    adjuntos: []
  },
  {
    id: 3,
    titulo: 'Resultados del I Bimestre',
    contenido: 'Ya se encuentran disponibles las calificaciones del primer bimestre. Pueden consultarlas a través de la plataforma o solicitarlas en secretaría.',
    fecha: new Date('2024-01-18T15:45:00'),
    autor: 'Coordinación Académica',
    tipo: 'academico',
    importante: false,
    destinatarios: ['padres'],
    adjuntos: ['libreta_I_bimestre.pdf']
  },
  {
    id: 4,
    titulo: 'Festival de Talentos 2024',
    contenido: 'Invitamos a todos los estudiantes a participar en el Festival de Talentos que se realizará el 15 de febrero. Las inscripciones están abiertas hasta el 5 de febrero.',
    fecha: new Date('2024-01-15T12:00:00'),
    autor: 'Departamento de Arte',
    tipo: 'evento',
    importante: false,
    destinatarios: ['padres', 'estudiantes'],
    adjuntos: ['bases_festival_talentos.pdf']
  },
  {
    id: 5,
    titulo: 'Campaña de Vacunación',
    contenido: 'El MINSA realizará una campaña de vacunación en nuestras instalaciones el miércoles 31 de enero. Es importante que traigan el carnet de vacunación de sus hijos.',
    fecha: new Date('2024-01-12T09:15:00'),
    autor: 'Enfermería',
    tipo: 'salud',
    importante: true,
    destinatarios: ['padres'],
    adjuntos: ['autorizacion_vacunacion.pdf']
  }
]

export const usuariosMock = {
  'carlos.rodriguez@email.com': { 
    nombre: 'Carlos Rodríguez', 
    rol: 'padre', 
    hijos: [1, 2],
    telefono: '+51 987 654 321',
    avatar: '/images/avatar-padre1.jpg'
  },
  'miguel.martinez@email.com': { 
    nombre: 'Miguel Martinez', 
    rol: 'padre', 
    hijos: [3],
    telefono: '+51 987 654 322',
    avatar: '/images/avatar-padre2.jpg'
  },
  'ana.silva@email.com': { 
    nombre: 'Ana Silva', 
    rol: 'padre', 
    hijos: [4],
    telefono: '+51 987 654 323',
    avatar: '/images/avatar-padre3.jpg'
  },
  'maria.garcia@email.com': { 
    nombre: 'María García', 
    rol: 'padre', 
    hijos: [5],
    telefono: '+51 987 654 324',
    avatar: '/images/avatar-padre4.jpg'
  },
  'tutor1@email.com': { 
    nombre: 'María García', 
    rol: 'tutor', 
    alumnos: [1, 2, 3, 4, 5],
    especialidad: 'Matemáticas y Ciencias',
    grados: ['5to A', '3ro B'],
    telefono: '+51 987 654 340',
    avatar: '/images/avatar-tutor1.jpg'
  },
  'profesor.carlos@talentos.edu.pe': { 
    nombre: 'Carlos Mendoza', 
    rol: 'tutor', 
    alumnos: [6, 7, 8, 9, 10],
    especialidad: 'Comunicación y Literatura',
    grados: ['4to A', '4to B'],
    telefono: '+51 998 765 432',
    avatar: '/images/avatar-tutor2.jpg'
  },
  'profesor.ana@talentos.edu.pe': { 
    nombre: 'Ana Vilchez', 
    rol: 'tutor', 
    alumnos: [11, 12, 13],
    especialidad: 'Ciencias Naturales',
    grados: ['4to A'],
    telefono: '+51 976 543 210',
    avatar: '/images/tutor-ana.jpg'
  },
  'profesor.roberto@talentos.edu.pe': { 
    nombre: 'Roberto Quispe', 
    rol: 'tutor', 
    alumnos: [14, 15, 16],
    especialidad: 'Educación Física',
    grados: ['5to B'],
    telefono: '+51 965 432 109',
    avatar: '/images/tutor-roberto.jpg'
  },
  'profesora.lucia@talentos.edu.pe': { 
    nombre: 'Lucía Torres', 
    rol: 'tutor', 
    alumnos: [17, 18, 19, 20],
    especialidad: 'Arte y Música',
    grados: ['1ro A', '2do A'],
    telefono: '+51 954 321 098',
    avatar: '/images/tutor-lucia.jpg'
  },
  'admin@talentos.edu': { 
    nombre: 'Dr. Juan Pérez', 
    rol: 'admin',
    cargo: 'Director General',
    telefono: '+51 987 654 350',
    avatar: '/images/avatar-admin.jpg'
  },
  'entrada@talentos.edu': { 
    nombre: 'Pedro Sánchez', 
    rol: 'entrada',
    cargo: 'Personal de Seguridad',
    turno: 'Mañana',
    telefono: '+51 987 654 360',
    avatar: '/images/avatar-entrada.jpg'
  }
}

// Grados del colegio
export const gradosMock = [
  { id: 1, nombre: '1ro Primaria', nivel: 'Primaria', orden: 1 },
  { id: 2, nombre: '2do Primaria', nivel: 'Primaria', orden: 2 },
  { id: 3, nombre: '3ro Primaria', nivel: 'Primaria', orden: 3 },
  { id: 4, nombre: '4to Primaria', nivel: 'Primaria', orden: 4 },
  { id: 5, nombre: '5to Primaria', nivel: 'Primaria', orden: 5 },
  { id: 6, nombre: '6to Primaria', nivel: 'Primaria', orden: 6 }
]

// Cursos disponibles
export const cursosMock = [
  { id: 1, nombre: 'Matemáticas', descripcion: 'Números, operaciones, geometría', color: '#3B82F6' },
  { id: 2, nombre: 'Comunicación', descripcion: 'Lenguaje, lectura, escritura', color: '#10B981' },
  { id: 3, nombre: 'Ciencia y Tecnología', descripcion: 'Ciencias naturales y experimentos', color: '#F59E0B' },
  { id: 4, nombre: 'Personal Social', descripcion: 'Historia, geografía, civismo', color: '#EF4444' },
  { id: 5, nombre: 'Arte y Cultura', descripcion: 'Dibujo, música, danza', color: '#8B5CF6' },
  { id: 6, nombre: 'Educación Física', descripcion: 'Deportes y actividad física', color: '#06B6D4' },
  { id: 7, nombre: 'Educación Religiosa', descripcion: 'Valores y espiritualidad', color: '#84CC16' },
  { id: 8, nombre: 'Inglés', descripcion: 'Idioma extranjero', color: '#F97316' }
]

// Asignaciones de cursos a profesores por grado
export const asignacionesMock = [
  // Tutor 1 - María García (tutor1@email.com)
  { id: 1, tutorEmail: 'tutor1@email.com', tutorNombre: 'María García', cursoId: 1, gradoId: 5, seccion: 'A' },
  { id: 2, tutorEmail: 'tutor1@email.com', tutorNombre: 'María García', cursoId: 3, gradoId: 5, seccion: 'A' },
  { id: 3, tutorEmail: 'tutor1@email.com', tutorNombre: 'María García', cursoId: 1, gradoId: 3, seccion: 'B' },
  
  // Tutor 2 - José López (tutor2@email.com)  
  { id: 4, tutorEmail: 'tutor2@email.com', tutorNombre: 'José López', cursoId: 2, gradoId: 4, seccion: 'A' },
  { id: 5, tutorEmail: 'tutor2@email.com', tutorNombre: 'José López', cursoId: 4, gradoId: 4, seccion: 'A' },
  { id: 6, tutorEmail: 'tutor2@email.com', tutorNombre: 'José López', cursoId: 2, gradoId: 4, seccion: 'B' }
]