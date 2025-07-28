import React, { useEffect } from 'react'
import useStudentsStore from '../../stores/studentsStore'
import useGradesStore from '../../stores/gradesStore'
import useAuthStore from '../../stores/authStore'

const FilterTest = () => {
  const { usuario } = useAuthStore()
  const { obtenerAlumnosPorPadreId } = useStudentsStore()
  const { calificaciones } = useGradesStore()
  
  useEffect(() => {
    if (usuario) {
      console.log('🧪 TEST DE FILTROS')
      console.log('================')
      
      // Obtener hijos del padre
      const misHijos = obtenerAlumnosPorPadreId(usuario.id)
      console.log(`Hijos encontrados: ${misHijos.length}`)
      
      // Para cada hijo, verificar calificaciones
      misHijos.forEach(hijo => {
        console.log(`\n👦 ${hijo.nombre} ${hijo.apellidos}:`)
        
        const hijoCal = calificaciones.filter(c => c.alumnoId === hijo.id)
        console.log(`  - Calificaciones: ${hijoCal.length}`)
        
        if (hijoCal.length > 0) {
          const promedio = hijoCal.reduce((sum, c) => sum + c.nota, 0) / hijoCal.length
          console.log(`  - Promedio: ${promedio.toFixed(1)}`)
          console.log(`  - Categoría: ${
            promedio >= 16 ? 'EXCELENTE' : 
            promedio >= 11 ? 'REGULAR' : 
            'NECESITA ATENCIÓN'
          }`)
        } else {
          console.log('  - Sin calificaciones')
        }
      })
      
      // Verificar filtros
      console.log('\n📊 ESTADÍSTICAS DE FILTROS:')
      const excelentes = misHijos.filter(hijo => {
        const cal = calificaciones.filter(c => c.alumnoId === hijo.id)
        const prom = cal.length > 0 ? cal.reduce((sum, c) => sum + c.nota, 0) / cal.length : 0
        return prom >= 16
      })
      
      const regulares = misHijos.filter(hijo => {
        const cal = calificaciones.filter(c => c.alumnoId === hijo.id)
        const prom = cal.length > 0 ? cal.reduce((sum, c) => sum + c.nota, 0) / cal.length : 0
        return prom >= 11 && prom < 16
      })
      
      const atencion = misHijos.filter(hijo => {
        const cal = calificaciones.filter(c => c.alumnoId === hijo.id)
        const prom = cal.length > 0 ? cal.reduce((sum, c) => sum + c.nota, 0) / cal.length : 0
        return prom < 11
      })
      
      console.log(`- Excelentes: ${excelentes.length}`)
      console.log(`- Regulares: ${regulares.length}`)
      console.log(`- Necesita atención: ${atencion.length}`)
      console.log(`- Total: ${misHijos.length}`)
    }
  }, [usuario])
  
  return null
}

export default FilterTest