/**
 * Generador de códigos únicos para QR
 * Incluye timestamp y verificación para evitar duplicados
 */

// Almacenar códigos generados para evitar duplicados en la sesión
const generatedCodes = new Set()

/**
 * Genera un código único basado en tipo y ID
 * @param {string} type - Tipo de código (E=Estudiante, T=Tutor, P=Personal)
 * @param {number|string} id - ID del usuario
 * @param {Object} options - Opciones adicionales
 * @returns {string} Código único generado
 */
export const generateUniqueCode = (type, id, options = {}) => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  // Formato: [TIPO][ID-6digitos][TIMESTAMP-últimos4][RANDOM-3digitos]
  const paddedId = id.toString().padStart(6, '0')
  const timestampSuffix = timestamp.toString().slice(-4)
  
  let code = `${type}${paddedId}${timestampSuffix}${random}`
  
  // Verificar que no exista
  let attempts = 0
  while (generatedCodes.has(code) && attempts < 100) {
    const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    code = `${type}${paddedId}${timestampSuffix}${newRandom}`
    attempts++
  }
  
  generatedCodes.add(code)
  return code
}

/**
 * Genera un código QR único para estudiante
 * @param {Object} student - Datos del estudiante
 * @returns {string} Código único
 */
export const generateStudentCode = (student) => {
  // Si ya tiene un código válido, retornarlo
  if (student.codigo_qr && student.codigo_qr.startsWith('E')) {
    return student.codigo_qr
  }
  
  return generateUniqueCode('E', student.id)
}

/**
 * Genera un código QR único para tutor
 * @param {Object} tutor - Datos del tutor
 * @returns {string} Código único
 */
export const generateTutorCode = (tutor) => {
  // Si ya tiene un código válido, retornarlo
  if (tutor.codigo_qr && tutor.codigo_qr.startsWith('T')) {
    return tutor.codigo_qr
  }
  
  return generateUniqueCode('T', tutor.id)
}

/**
 * Genera un código QR único para personal de entrada
 * @param {Object} staff - Datos del personal
 * @returns {string} Código único
 */
export const generateStaffCode = (staff) => {
  // Si ya tiene un código válido, retornarlo
  if (staff.codigo_qr && staff.codigo_qr.startsWith('P')) {
    return staff.codigo_qr
  }
  
  return generateUniqueCode('P', staff.id)
}

/**
 * Valida el formato de un código QR
 * @param {string} code - Código a validar
 * @returns {Object} Información del código o null si es inválido
 */
export const validateQRCode = (code) => {
  if (!code || typeof code !== 'string') {
    return null
  }
  
  // Patrón: [TIPO-1letra][ID-6digitos][TIMESTAMP-4digitos][RANDOM-3digitos]
  const pattern = /^([ETP])(\d{6})(\d{4})(\d{3})$/
  const match = code.match(pattern)
  
  if (!match) {
    return null
  }
  
  const [, type, id, timestamp, random] = match
  
  const typeMap = {
    'E': 'estudiante',
    'T': 'tutor',
    'P': 'personal'
  }
  
  return {
    valid: true,
    type: typeMap[type],
    id: parseInt(id, 10),
    timestamp,
    random,
    code
  }
}

/**
 * Genera datos completos para QR incluyendo información adicional
 * @param {Object} userData - Datos del usuario
 * @param {string} type - Tipo de usuario
 * @returns {Object} Datos completos para el QR
 */
export const generateQRData = (userData, type) => {
  let code = ''
  let qrType = ''
  
  switch (type) {
    case 'estudiante':
      code = generateStudentCode(userData)
      qrType = 'student_id'
      break
    case 'tutor':
      code = generateTutorCode(userData)
      qrType = 'teacher_id'
      break
    case 'personal':
      code = generateStaffCode(userData)
      qrType = 'staff_id'
      break
    default:
      throw new Error('Tipo de usuario no válido')
  }
  
  return {
    code,
    type: qrType,
    id: userData.id,
    name: `${userData.nombre} ${userData.apellidos || ''}`.trim(),
    grade: userData.grado || null,
    section: userData.seccion || null,
    school: 'Colegio Talentos',
    generated: new Date().toISOString(),
    version: '2.0'
  }
}

/**
 * Decodifica un código QR y retorna la información
 * @param {string} qrContent - Contenido del QR escaneado
 * @returns {Object} Información decodificada
 */
export const decodeQRData = (qrContent) => {
  try {
    // Primero intentar parsear como JSON
    if (qrContent.startsWith('{')) {
      const data = JSON.parse(qrContent)
      return {
        valid: true,
        format: 'json',
        ...data
      }
    }
    
    // Si no es JSON, validar como código simple
    const validation = validateQRCode(qrContent)
    if (validation) {
      return {
        ...validation,
        format: 'simple'
      }
    }
    
    // Código no reconocido
    return {
      valid: false,
      error: 'Formato de código QR no reconocido',
      raw: qrContent
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Error al decodificar QR',
      raw: qrContent
    }
  }
}

/**
 * Limpia los códigos generados (útil para testing)
 */
export const clearGeneratedCodes = () => {
  generatedCodes.clear()
}

// Exportar todo como default también
export default {
  generateUniqueCode,
  generateStudentCode,
  generateTutorCode,
  generateStaffCode,
  validateQRCode,
  generateQRData,
  decodeQRData,
  clearGeneratedCodes
}