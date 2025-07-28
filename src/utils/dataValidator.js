// Utilidad para validar la integridad de los datos
import { DatabaseQueries } from '../data/databaseSchema'

export const validateDataIntegrity = () => {
  console.log('🔍 VALIDANDO INTEGRIDAD DE DATOS...')
  
  // Validar usuarios
  const carlos = DatabaseQueries.getUserByEmail('carlos.rodriguez@email.com')
  console.log('👤 Carlos Rodríguez:', carlos)
  
  // Validar hijos de Carlos
  if (carlos) {
    const hijosDeCarlos = DatabaseQueries.getStudentsByParentId(carlos.id)
    console.log('👶 Hijos de Carlos:', hijosDeCarlos)
    console.log(`📊 Carlos tiene ${hijosDeCarlos.length} hijos`)
  }
  
  // Validar otros padres
  const miguel = DatabaseQueries.getUserByEmail('miguel.martinez@email.com')
  if (miguel) {
    const hijosDeMiguel = DatabaseQueries.getStudentsByParentId(miguel.id)
    console.log('👶 Hijos de Miguel:', hijosDeMiguel)
    console.log(`📊 Miguel tiene ${hijosDeMiguel.length} hijos`)
  }
  
  // Validar integridad general
  const integrity = DatabaseQueries.validateDataIntegrity()
  console.log('✅ Integridad de datos:', integrity)
  
  return integrity
}

// Función para mostrar estadísticas de datos
export const showDataStats = () => {
  const users = DatabaseQueries.getAllStudents()
  const padres = users.filter(u => u.role === 'padre')
  
  console.log('📈 ESTADÍSTICAS DE DATOS:')
  console.log(`👥 Total usuarios: ${users.length}`)
  console.log(`👨‍👩‍👧‍👦 Total padres: ${padres.length}`)
  console.log(`👶 Total estudiantes: ${DatabaseQueries.getAllStudents().length}`)
}