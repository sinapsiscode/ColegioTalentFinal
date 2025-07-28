import * as XLSX from 'xlsx';

const nombres = [
  'Santiago', 'Mateo', 'Sebastián', 'Leonardo', 'Diego', 'Alejandro', 'Nicolás', 'Daniel', 'Lucas', 'Gabriel',
  'Valentina', 'Sofía', 'Isabella', 'Camila', 'Luciana', 'Mariana', 'Fernanda', 'Catalina', 'Valeria', 'Antonella',
  'Carlos', 'Luis', 'Jorge', 'Pedro', 'Miguel', 'Andrés', 'José', 'Manuel', 'Ricardo', 'Fernando',
  'María', 'Ana', 'Lucía', 'Andrea', 'Paula', 'Laura', 'Daniela', 'Carolina', 'Natalia', 'Gabriela',
  'Roberto', 'Alberto', 'Eduardo', 'Francisco', 'Rafael', 'Antonio', 'Javier', 'Emilio', 'Rodrigo', 'Mauricio'
];

const apellidos = [
  'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores',
  'Rivera', 'Gutiérrez', 'Díaz', 'Hernández', 'Morales', 'Muñoz', 'Álvarez', 'Romero', 'Jiménez', 'Ruiz',
  'Vargas', 'Castillo', 'Mendoza', 'Silva', 'Ortiz', 'Delgado', 'Castro', 'Moreno', 'Reyes', 'Herrera',
  'Medina', 'Aguilar', 'Vega', 'Cruz', 'Guerrero', 'Campos', 'Salazar', 'León', 'Ramos', 'Espinoza'
];

const distritos = [
  'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'San Borja', 'Magdalena', 'Jesús María',
  'Lince', 'Pueblo Libre', 'San Miguel', 'Barranco', 'Chorrillos', 'Surquillo', 'San Luis'
];

const calles = [
  'Av. Javier Prado', 'Av. Arequipa', 'Av. Benavides', 'Av. Primavera', 'Av. La Marina',
  'Av. José Pardo', 'Av. Petit Thouars', 'Av. Angamos', 'Av. República', 'Av. Colonial',
  'Jr. de la Unión', 'Calle Las Begonias', 'Calle Los Tulipanes', 'Av. El Sol', 'Av. Los Precursores'
];

const observacionesBase = [
  'Estudiante destacado en matemáticas',
  'Excelente participación en clase',
  'Muestra gran interés por las ciencias',
  'Líder natural del grupo',
  'Muy responsable con sus tareas',
  'Destaca en actividades deportivas',
  'Excelente compañero de clase',
  'Muestra creatividad en sus trabajos',
  'Estudiante muy aplicado',
  'Participa activamente en actividades escolares',
  'Necesita apoyo en lectura',
  'Excelente en trabajos grupales',
  'Muestra aptitudes artísticas',
  'Muy colaborador con sus compañeros',
  'Estudiante con gran potencial'
];

function generarDNI(index) {
  const base = 70000000;
  return (base + index).toString();
}

function generarTelefono() {
  const prefijos = ['987', '986', '985', '984', '983'];
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  const numero = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return prefijo + numero;
}

function generarFechaNacimiento(grado) {
  const anioActual = new Date().getFullYear();
  const edadBase = {
    '1er Grado': 6,
    '2do Grado': 7,
    '3er Grado': 8,
    '4to Grado': 9,
    '5to Grado': 10,
    '6to Grado': 11
  };
  
  const edad = edadBase[grado] || 8;
  const anioNacimiento = anioActual - edad - Math.floor(Math.random() * 1);
  const mes = Math.floor(Math.random() * 12) + 1;
  const dia = Math.floor(Math.random() * 28) + 1;
  
  return `${anioNacimiento}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
}

function generarEstudiante(index, grado, seccion) {
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
  const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
  const apellidosCompletos = `${apellido1} ${apellido2}`;
  
  const nombrePadre = nombres[Math.floor(Math.random() * nombres.length)];
  const distrito = distritos[Math.floor(Math.random() * distritos.length)];
  const calle = calles[Math.floor(Math.random() * calles.length)];
  const numero = Math.floor(Math.random() * 999) + 1;
  
  const emailPadre = `${nombrePadre.toLowerCase()}.${apellido1.toLowerCase()}${index}@gmail.com`;
  
  return {
    nombre: nombre,
    apellidos: apellidosCompletos,
    codigo: `EST${(index + 1).toString().padStart(5, '0')}`,
    grado: grado,
    seccion: seccion,
    fechaNacimiento: generarFechaNacimiento(grado),
    dni: generarDNI(index),
    telefono: generarTelefono(),
    direccion: `${calle} ${numero}, ${distrito} - Lima`,
    nombrePadre: `${nombrePadre} ${apellido1}`,
    telefonoPadre: generarTelefono(),
    emailPadre: emailPadre,
    observaciones: observacionesBase[Math.floor(Math.random() * observacionesBase.length)]
  };
}

export function generarArchivoEstudiantes(cantidadEstudiantes, nombreArchivo) {
  const grados = ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'];
  const secciones = ['A', 'B'];
  
  const estudiantes = [];
  let estudiantesPorGrado = Math.floor(cantidadEstudiantes / grados.length);
  let estudiantesRestantes = cantidadEstudiantes % grados.length;
  
  let indexTotal = 0;
  
  for (let i = 0; i < grados.length; i++) {
    const grado = grados[i];
    let estudiantesEnEsteGrado = estudiantesPorGrado;
    
    // Distribuir los estudiantes restantes
    if (estudiantesRestantes > 0) {
      estudiantesEnEsteGrado++;
      estudiantesRestantes--;
    }
    
    // Distribuir entre secciones
    const estudiantesPorSeccion = Math.floor(estudiantesEnEsteGrado / secciones.length);
    let estudiantesRestantesSeccion = estudiantesEnEsteGrado % secciones.length;
    
    for (let j = 0; j < secciones.length; j++) {
      const seccion = secciones[j];
      let estudiantesEnEstaSeccion = estudiantesPorSeccion;
      
      if (estudiantesRestantesSeccion > 0) {
        estudiantesEnEstaSeccion++;
        estudiantesRestantesSeccion--;
      }
      
      for (let k = 0; k < estudiantesEnEstaSeccion; k++) {
        estudiantes.push(generarEstudiante(indexTotal, grado, seccion));
        indexTotal++;
      }
    }
  }
  
  // Crear el libro de Excel
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(estudiantes);
  
  // Ajustar el ancho de las columnas
  const wscols = [
    {wch: 15}, // nombre
    {wch: 25}, // apellidos
    {wch: 12}, // codigo
    {wch: 12}, // grado
    {wch: 8},  // seccion
    {wch: 15}, // fechaNacimiento
    {wch: 10}, // dni
    {wch: 12}, // telefono
    {wch: 40}, // direccion
    {wch: 20}, // nombrePadre
    {wch: 12}, // telefonoPadre
    {wch: 30}, // emailPadre
    {wch: 40}  // observaciones
  ];
  ws['!cols'] = wscols;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes');
  
  // Guardar el archivo
  XLSX.writeFile(wb, nombreArchivo);
  
  return estudiantes;
}

// Función para generar múltiples archivos
export function generarMultiplesArchivos() {
  const archivos = [
    { cantidad: 100, nombre: 'estudiantes_100.xlsx' },
    { cantidad: 200, nombre: 'estudiantes_200.xlsx' },
    { cantidad: 150, nombre: 'estudiantes_150_primaria.xlsx' },
    { cantidad: 75, nombre: 'estudiantes_75_secundaria.xlsx' }
  ];
  
  archivos.forEach(({ cantidad, nombre }) => {
    const estudiantes = generarArchivoEstudiantes(cantidad, nombre);
    console.log(`✅ Archivo ${nombre} generado con ${estudiantes.length} estudiantes`);
  });
}