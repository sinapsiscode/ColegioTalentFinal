import React, { useState } from 'react'
import UnifiedExcelButton from '../components/common/UnifiedExcelButton'
import { showSuccess, showInfo } from '../utils/sweetAlert'

// Datos de ejemplo
const mockUsers = [
  { id: 1, nombre: 'Juan', apellidos: 'Pérez', email: 'juan@colegio.com', rol: 'tutor', estado: 'activo' },
  { id: 2, nombre: 'María', apellidos: 'García', email: 'maria@colegio.com', rol: 'padre', estado: 'activo' },
  { id: 3, nombre: 'Carlos', apellidos: 'López', email: 'carlos@colegio.com', rol: 'admin', estado: 'inactivo' }
]

const mockStudents = [
  { id: 1, nombre: 'Ana', apellidos: 'Martínez', grado: '5to', seccion: 'A', codigoQR: 'QR001' },
  { id: 2, nombre: 'Pedro', apellidos: 'Rodríguez', grado: '5to', seccion: 'B', codigoQR: 'QR002' },
  { id: 3, nombre: 'Lucía', apellidos: 'Fernández', grado: '4to', seccion: 'A', codigoQR: 'QR003' }
]

const mockGrades = [
  { 
    id: 1, nombreEstudiante: 'Ana Martínez', materia: 'Matemáticas', 
    bimestre: 'I', nota: 18, fecha: '2024-03-15', tipoEvaluacion: 'Examen',
    descripcion: 'Examen de álgebra', peso: 0.4
  },
  { 
    id: 2, nombreEstudiante: 'Pedro Rodríguez', materia: 'Historia', 
    bimestre: 'I', nota: 15, fecha: '2024-03-10', tipoEvaluacion: 'Ensayo',
    descripcion: 'Ensayo sobre independencia', peso: 0.3
  }
]

const ExcelButtonExamples = () => {
  const [filter, setFilter] = useState('')

  const handleImportUsers = (data, fileName) => {
    console.log('Usuarios importados:', data)
    showSuccess('Importación exitosa', `Se importaron ${data.length} usuarios desde ${fileName}`)
  }

  const handleImportStudents = (data, fileName) => {
    console.log('Estudiantes importados:', data)
    showInfo('Procesando', `Validando ${data.length} estudiantes de ${fileName}`)
  }

  const filteredUsers = filter ? 
    mockUsers.filter(user => user.rol.includes(filter)) : 
    mockUsers

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ejemplos de UnifiedExcelButton
        </h1>
        <p className="text-gray-600 mb-8">
          Demostración de los diferentes usos del componente unificado de Excel
        </p>

        {/* Ejemplo 1: Exportar solo */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Exportación Simple de Usuarios</h2>
          <p className="text-gray-600 mb-4">Botón simple que solo exporta datos sin opciones de importación</p>
          
          <div className="flex gap-4 items-center">
            <UnifiedExcelButton
              data={mockUsers}
              dataType="usuarios"
              customLabel="Exportar Usuarios"
              variant="primary"
            />
            
            <span className="text-sm text-gray-500">
              ({mockUsers.length} usuarios)
            </span>
          </div>
        </div>

        {/* Ejemplo 2: Exportar e Importar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Exportar e Importar Estudiantes</h2>
          <p className="text-gray-600 mb-4">Botón con dropdown que permite tanto exportar como importar</p>
          
          <div className="flex gap-4 items-center">
            <UnifiedExcelButton
              data={mockStudents}
              dataType="estudiantes"
              showDropdown={true}
              onImport={handleImportStudents}
              variant="success"
            />
            
            <span className="text-sm text-gray-500">
              ({mockStudents.length} estudiantes)
            </span>
          </div>
        </div>

        {/* Ejemplo 3: Con filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">3. Exportación con Filtros</h2>
          <p className="text-gray-600 mb-4">Exporta solo los datos que pasan el filtro aplicado</p>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Filtrar por rol:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border rounded"
              >
                <option value="">Todos</option>
                <option value="admin">Admin</option>
                <option value="tutor">Tutor</option>
                <option value="padre">Padre</option>
              </select>
            </div>
            
            <div className="flex gap-4 items-center">
              <UnifiedExcelButton
                data={filteredUsers}
                dataType="usuarios"
                customLabel="Exportar Filtrados"
                variant="outline"
                size="sm"
              />
              
              <span className="text-sm text-gray-500">
                ({filteredUsers.length} de {mockUsers.length} usuarios)
              </span>
            </div>
          </div>
        </div>

        {/* Ejemplo 4: Calificaciones */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">4. Calificaciones con Callback</h2>
          <p className="text-gray-600 mb-4">Exportación con notificación personalizada de éxito</p>
          
          <div className="flex gap-4 items-center">
            <UnifiedExcelButton
              data={mockGrades}
              dataType="calificaciones"
              customLabel="Exportar Notas"
              variant="secondary"
              onExportSuccess={(result) => {
                showSuccess(
                  'Calificaciones exportadas', 
                  `Se generó ${result.archivo} con ${result.registros} registros`
                )
              }}
              onExportError={(error) => {
                console.error('Error personalizado:', error)
              }}
            />
            
            <span className="text-sm text-gray-500">
              ({mockGrades.length} calificaciones)
            </span>
          </div>
        </div>

        {/* Ejemplo 5: Diferentes tamaños */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">5. Diferentes Tamaños y Variantes</h2>
          <p className="text-gray-600 mb-4">Muestra los diferentes tamaños y estilos disponibles</p>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <span className="text-sm font-medium w-20">Pequeño:</span>
              <UnifiedExcelButton
                data={mockUsers}
                dataType="usuarios"
                size="sm"
                variant="primary"
                customLabel="Exportar"
              />
            </div>
            
            <div className="flex gap-4 items-center">
              <span className="text-sm font-medium w-20">Normal:</span>
              <UnifiedExcelButton
                data={mockUsers}
                dataType="usuarios"
                size="default"
                variant="outline"
                customLabel="Exportar Usuarios"
              />
            </div>
            
            <div className="flex gap-4 items-center">
              <span className="text-sm font-medium w-20">Grande:</span>
              <UnifiedExcelButton
                data={mockUsers}
                dataType="usuarios"
                size="lg"
                variant="success"
                customLabel="Exportar a Excel"
              />
            </div>
          </div>
        </div>

        {/* Ejemplo 6: Datos genéricos */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">6. Datos Genéricos</h2>
          <p className="text-gray-600 mb-4">Para datos que no tienen un tipo específico definido</p>
          
          <div className="flex gap-4 items-center">
            <UnifiedExcelButton
              data={[
                { producto: 'Laptop', precio: 1500, stock: 10 },
                { producto: 'Mouse', precio: 25, stock: 50 },
                { producto: 'Teclado', precio: 75, stock: 30 }
              ]}
              dataType="generic"
              fileName="inventario_productos.xlsx"
              customLabel="Exportar Inventario"
              variant="ghost"
            />
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Características del Componente
          </h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• <strong>Tipos soportados:</strong> usuarios, estudiantes, comunicados, calificaciones, asistencia, pagos, generic</li>
            <li>• <strong>Exportación automática</strong> con formato profesional y estilos aplicados</li>
            <li>• <strong>Importación de Excel</strong> con validación básica de archivos</li>
            <li>• <strong>Callbacks personalizables</strong> para manejar éxito y errores</li>
            <li>• <strong>Filtros aplicables</strong> usando la prop filterFn</li>
            <li>• <strong>Responsive y accesible</strong> con animaciones suaves</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExcelButtonExamples