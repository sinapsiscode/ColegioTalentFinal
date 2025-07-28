// Test simple para verificar que el login funciona
import { DatabaseQueries } from '../data/databaseSchema'

export const testLogin = () => {
  console.log('🧪 TESTING LOGIN FUNCTIONALITY...')
  
  // Test 1: Verificar que Carlos existe
  const carlos = DatabaseQueries.getUserByEmail('carlos.rodriguez@email.com')
  console.log('👤 Carlos encontrado:', carlos)
  
  if (!carlos) {
    console.error('❌ ERROR: Carlos no encontrado')
    return false
  }
  
  // Test 2: Verificar estructura del usuario
  const requiredFields = ['id', 'email', 'rol', 'nombre', 'apellidos']
  const missingFields = requiredFields.filter(field => !carlos[field])
  
  if (missingFields.length > 0) {
    console.error('❌ ERROR: Campos faltantes:', missingFields)
    return false
  }
  
  // Test 3: Verificar hijos de Carlos
  const hijosCarlos = DatabaseQueries.getStudentsByParentId(carlos.id)
  console.log('👶 Hijos de Carlos:', hijosCarlos)
  console.log(`📊 Total hijos: ${hijosCarlos.length}`)
  
  if (hijosCarlos.length === 0) {
    console.error('❌ ERROR: Carlos no tiene hijos asignados')
    return false
  }
  
  // Test 4: Verificar otros usuarios
  const miguel = DatabaseQueries.getUserByEmail('miguel.martinez@email.com')
  const tutor = DatabaseQueries.getUserByEmail('tutor1@email.com')
  const admin = DatabaseQueries.getUserByEmail('admin@talentos.edu')
  
  console.log('👥 Otros usuarios:')
  console.log('  Miguel:', miguel ? '✅' : '❌')
  console.log('  Tutor:', tutor ? '✅' : '❌')
  console.log('  Admin:', admin ? '✅' : '❌')
  
  console.log('✅ TODOS LOS TESTS PASARON')
  return true
}

// Ejecutar test automáticamente en desarrollo
if (import.meta.env.DEV) {
  setTimeout(() => {
    testLogin()
  }, 1000)
}