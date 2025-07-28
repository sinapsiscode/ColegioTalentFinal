/**
 * PRUEBAS DEL SISTEMA DE PERSISTENCIA HÍBRIDO
 * 
 * Este archivo contiene pruebas para verificar que el sistema
 * de persistencia funciona correctamente
 */

import { DatabaseQueries } from '../data/databaseSchema'

// =====================================================
// FUNCIONES DE PRUEBA
// =====================================================

export const testPersistence = () => {
  console.log('🧪 Iniciando pruebas de persistencia...')
  
  try {
    // Test 1: Crear un nuevo usuario
    console.log('\n📝 Test 1: Crear usuario')
    const newUser = {
      email: 'test@prueba.com',
      password_hash: 'hashed_test123',
      rol: 'padre',
      nombre: 'Usuario',
      apellidos: 'De Prueba',
      telefono: '+51 999 888 777',
      direccion: 'Dirección de prueba 123',
      estado: 'activo'
    }
    
    const createdUser = DatabaseQueries.addUser(newUser)
    console.log('✅ Usuario creado:', createdUser)
    
    // Test 2: Buscar el usuario creado
    console.log('\n🔍 Test 2: Buscar usuario por email')
    const foundUser = DatabaseQueries.getUserByEmail('test@prueba.com')
    console.log('✅ Usuario encontrado:', foundUser)
    
    // Test 3: Actualizar el usuario
    console.log('\n✏️ Test 3: Actualizar usuario')
    const updatedUser = DatabaseQueries.updateUser(foundUser.id, {
      telefono: '+51 555 444 333',
      direccion: 'Nueva dirección actualizada'
    })
    console.log('✅ Usuario actualizado:', updatedUser)
    
    // Test 4: Obtener estadísticas
    console.log('\n📊 Test 4: Estadísticas de BD')
    const stats = DatabaseQueries.getDatabaseStats()
    console.log('✅ Estadísticas:', stats)
    
    // Test 5: Crear backup
    console.log('\n💾 Test 5: Crear backup')
    const backupKey = DatabaseQueries.createBackup()
    console.log('✅ Backup creado:', backupKey)
    
    console.log('\n🎉 Todas las pruebas pasaron exitosamente!')
    
    return {
      success: true,
      message: 'Sistema de persistencia funcionando correctamente',
      createdUserId: createdUser.id,
      stats
    }
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const testParentChildRelationships = () => {
  console.log('🧪 Probando relaciones padre-hijo...')
  
  try {
    // Obtener un padre existente
    const parents = DatabaseQueries.getAllUsers().filter(u => u.rol === 'padre')
    if (parents.length === 0) {
      throw new Error('No hay padres en la BD')
    }
    
    const testParent = parents[0]
    console.log('👨‍👧‍👦 Padre de prueba:', testParent.nombre)
    
    // Obtener hijos actuales
    const currentChildren = DatabaseQueries.getChildrenByParentId(testParent.id)
    console.log('✅ Hijos actuales:', currentChildren.length)
    
    // Obtener estudiantes disponibles
    const availableStudents = DatabaseQueries.getAvailableStudentsForParent(testParent.id)
    console.log('✅ Estudiantes disponibles:', availableStudents.length)
    
    return {
      success: true,
      parentName: testParent.nombre,
      currentChildren: currentChildren.length,
      availableStudents: availableStudents.length
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de relaciones:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const showDatabaseInfo = () => {
  console.log('📊 INFORMACIÓN DE LA BASE DE DATOS')
  console.log('=====================================')
  
  const stats = DatabaseQueries.getDatabaseStats()
  
  if (stats) {
    console.log(`📝 Nombre: ${stats.database}`)
    console.log(`📌 Versión: ${stats.version}`)
    console.log(`📅 Creada: ${stats.created_at}`)
    console.log(`💾 Último backup: ${stats.last_backup || 'Nunca'}`)
    console.log(`💽 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`)
    console.log('\n📊 TABLAS:')
    
    Object.entries(stats.tables).forEach(([table, info]) => {
      console.log(`  • ${table}: ${info.records} registros (próximo ID: ${info.next_id})`)
    })
  } else {
    console.log('❌ No se pudo obtener información de la BD')
  }
}

// =====================================================
// EJECUTAR TODAS LAS PRUEBAS
// =====================================================

export const runAllTests = () => {
  console.log('🚀 EJECUTANDO TODAS LAS PRUEBAS DE PERSISTENCIA')
  console.log('==================================================')
  
  // Mostrar info inicial
  showDatabaseInfo()
  
  // Ejecutar pruebas
  const persistenceTest = testPersistence()
  const relationshipTest = testParentChildRelationships()
  
  console.log('\n📋 RESUMEN DE RESULTADOS:')
  console.log('=========================')
  console.log(`Persistencia: ${persistenceTest.success ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Relaciones: ${relationshipTest.success ? '✅ PASS' : '❌ FAIL'}`)
  
  return {
    persistenceTest,
    relationshipTest,
    allPassed: persistenceTest.success && relationshipTest.success
  }
}

// Para uso desde consola del navegador
if (typeof window !== 'undefined') {
  window.testDatabase = {
    runAllTests,
    testPersistence,
    testParentChildRelationships,
    showDatabaseInfo
  }
  
  console.log('🔧 Funciones de prueba disponibles en window.testDatabase')
}