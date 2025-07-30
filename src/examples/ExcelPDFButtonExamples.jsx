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

const ExcelPDFButtonExamples = () => {
  const [currentRole, setCurrentRole] = useState('admin')

  // Simulador de exportación a PDF
  const handlePDFExport = async (data, type) => {
    console.log(`Generando PDF de ${type}:`, data)
    
    // Simular proceso de generación
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          mensaje: `PDF de ${type} generado correctamente`,
          archivo: `${type}_${new Date().toISOString().split('T')[0]}.pdf`,
          registros: data.length
        })
      }, 1500)
    })
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ejemplos de UnifiedExcelButton con PDF + Excel
        </h1>
        <p className="text-gray-600 mb-8">
          Demostración del componente con soporte para exportación en ambos formatos (Admin/Tutor)
        </p>

        {/* Selector de rol */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Selector de Rol de Usuario</h2>
          <p className="text-gray-600 mb-4">
            Los admin y tutores ven modal de selección de formato. Los padres solo Excel.
          </p>
          
          <div className="flex gap-2">
            {['admin', 'tutor', 'padre'].map(role => (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Rol actual:</strong> {currentRole} - 
              {['admin', 'tutor'].includes(currentRole) 
                ? ' Verá modal de selección Excel/PDF' 
                : ' Solo exportación Excel'}
            </p>
          </div>
        </div>

        {/* Ejemplo 1: Admin - Usuarios con ambos formatos */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Exportación de Usuarios (Admin)</h2>
          <p className="text-gray-600 mb-4">
            Los administradores pueden exportar usuarios tanto en Excel como PDF
          </p>
          
          <div className="flex gap-4 items-center">
            <UnifiedExcelButton
              data={mockUsers}
              dataType="usuarios"
              customLabel="Exportar Usuarios"
              userRole={currentRole}
              showFormatModal={['admin', 'tutor'].includes(currentRole)}
              onExportPDF={async (data) => await handlePDFExport(data, 'usuarios')}
              onExportSuccess={(result) => {
                showSuccess('¡Éxito!', `${result.mensaje || 'Exportación completada'}`)
              }}
              variant="primary"
            />
            
            <span className="text-sm text-gray-500">
              ({mockUsers.length} usuarios)
            </span>
          </div>
        </div>

        {/* Ejemplo 2: Tutor - Estudiantes con ambos formatos */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Lista de Estudiantes (Tutor)</h2>
          <p className="text-gray-600 mb-4">
            Los tutores pueden exportar e importar estudiantes, con opción de PDF para reportes
          </p>
          
          <div className="flex gap-4 items-center">
            <UnifiedExcelButton
              data={mockStudents}
              dataType="estudiantes"
              showDropdown={true}
              userRole={currentRole}
              showFormatModal={['admin', 'tutor'].includes(currentRole)}
              onImport={(data, fileName) => {
                showInfo('Importación', `Se procesaron ${data.length} estudiantes de ${fileName}`)
              }}
              onExportPDF={async (data) => await handlePDFExport(data, 'estudiantes')}
              onExportSuccess={(result) => {
                showSuccess('Exportación exitosa', `${result.registros} estudiantes exportados`)
              }}
              variant="success"
            />
            
            <span className="text-sm text-gray-500">
              ({mockStudents.length} estudiantes)
            </span>
          </div>
        </div>

        {/* Ejemplo 3: Tutor - Calificaciones con formato específico */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">3. Calificaciones (Tutor)</h2>
          <p className="text-gray-600 mb-4">
            Exportar calificaciones con formato profesional en Excel o PDF
          </p>
          
          <div className="flex gap-4 items-center">
            <UnifiedExcelButton
              data={mockGrades}
              dataType="calificaciones"
              customLabel="Exportar Notas"
              userRole={currentRole}
              showFormatModal={['admin', 'tutor'].includes(currentRole)}
              onExportPDF={async (data) => {
                // Simulación más realista para calificaciones
                console.log('Generando reporte de calificaciones en PDF...')
                await new Promise(resolve => setTimeout(resolve, 2000))
                return {
                  success: true,
                  mensaje: 'Reporte de calificaciones generado en PDF',
                  archivo: `calificaciones_${new Date().toISOString().split('T')[0]}.pdf`,
                  registros: data.length
                }
              }}
              onExportSuccess={(result) => {
                showSuccess('Reporte generado', result.mensaje)
              }}
              variant="outline"
              size="sm"
            />
            
            <span className="text-sm text-gray-500">
              ({mockGrades.length} calificaciones)
            </span>
          </div>
        </div>

        {/* Ejemplo 4: Comparación por rol */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">4. Comparación por Rol</h2>
          <p className="text-gray-600 mb-4">
            El mismo botón se comporta diferente según el rol del usuario
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Admin */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Administrador</h3>
              <UnifiedExcelButton
                data={mockUsers}
                dataType="usuarios"
                customLabel="Exportar"
                userRole="admin"
                showFormatModal={true}
                onExportPDF={async (data) => await handlePDFExport(data, 'usuarios')}
                size="sm"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">Modal Excel + PDF</p>
            </div>

            {/* Tutor */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Tutor</h3>
              <UnifiedExcelButton
                data={mockStudents}
                dataType="estudiantes"
                customLabel="Exportar"
                userRole="tutor"
                showFormatModal={true}
                onExportPDF={async (data) => await handlePDFExport(data, 'estudiantes')}
                size="sm"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">Modal Excel + PDF</p>
            </div>

            {/* Padre */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Padre</h3>
              <UnifiedExcelButton
                data={mockStudents}
                dataType="estudiantes"
                customLabel="Exportar"
                userRole="padre"
                size="sm"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">Solo Excel directo</p>
            </div>
          </div>
        </div>

        {/* Ejemplo 5: Con callback personalizado */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">5. Con Integraciones Personalizadas</h2>
          <p className="text-gray-600 mb-4">
            Integrando con tus funciones existentes de generación de PDF
          </p>
          
          <div className="flex gap-4 items-center">
            <UnifiedExcelButton
              data={mockGrades}
              dataType="calificaciones"
              customLabel="Reporte Completo"
              userRole="admin"
              showFormatModal={true}
              onExportPDF={async (data) => {
                // Aquí integrarías con tu generateAdvancedReport existente
                console.log('Llamando a generateAdvancedReport...')
                
                // Simular tu función existente
                const pdfData = {
                  titulo: 'Reporte de Calificaciones',
                  datos: data,
                  fecha: new Date().toLocaleDateString('es-PE')
                }
                
                // Simular generateAdvancedReport(pdfData)
                await new Promise(resolve => setTimeout(resolve, 2000))
                
                return {
                  success: true,
                  mensaje: 'Reporte avanzado generado correctamente',
                  archivo: 'reporte_avanzado.pdf'
                }
              }}
              onExportSuccess={(result) => {
                showSuccess('¡Perfecto!', `${result.mensaje}\nArchivo: ${result.archivo}`)
              }}
              variant="secondary"
            />
          </div>
        </div>

        {/* Información de implementación */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📋 Cómo Implementar en tu Código
          </h3>
          
          <div className="space-y-4 text-sm">
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-gray-900 mb-2">Para Administradores:</h4>
              <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                {`<UnifiedExcelButton
  data={usuarios}
  dataType="usuarios"
  userRole="admin"
  showFormatModal={true}
  onExportPDF={generateUsersPDF}
/>`}
              </code>
            </div>
            
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-gray-900 mb-2">Para Tutores:</h4>
              <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                {`<UnifiedExcelButton
  data={estudiantes}
  dataType="estudiantes"
  userRole="tutor"
  showFormatModal={true}
  onExportPDF={generateStudentsPDF}
  showDropdown={true}
  onImport={handleImport}
/>`}
              </code>
            </div>
            
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-gray-900 mb-2">Para Padres:</h4>
              <code className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                {`<UnifiedExcelButton
  data={estudiantes}
  dataType="estudiantes"
  userRole="padre"
  // Sin showFormatModal = solo Excel
/>`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExcelPDFButtonExamples