import React from 'react'
import { exportForParents, exportForAdmins } from '../../utils/exportUtilsSimple'
import { showSuccess, showError } from '../../utils/sweetAlert'

/**
 * Componente de prueba para verificar la funcionalidad de exportación
 * Se puede usar temporalmente para probar las funciones
 */

const ExportTest = () => {
  // Datos de prueba
  const testData = [
    {
      'Materia': 'Matemáticas',
      'Calificación': '8.5',
      'Fecha': '2024-01-15',
      'Observaciones': 'Buen desempeño'
    },
    {
      'Materia': 'Español',
      'Calificación': '9.0',
      'Fecha': '2024-01-16',
      'Observaciones': 'Excelente trabajo'
    },
    {
      'Materia': 'Ciencias',
      'Calificación': '7.8',
      'Fecha': '2024-01-17',
      'Observaciones': 'Puede mejorar'
    }
  ]

  const testPDFExport = async () => {
    try {
      const result = await exportForParents(testData, {
        title: 'Reporte de Prueba PDF',
        filename: 'test_pdf_export'
      })

      if (result.success) {
        showSuccess('PDF Generado', result.message)
      } else {
        showError('Error PDF', result.error)
      }
    } catch (error) {
      showError('Error', 'Error inesperado: ' + error.message)
    }
  }

  const testExcelExport = async () => {
    try {
      const headers = ['Materia', 'Calificación', 'Fecha', 'Observaciones']
      const result = await exportForAdmins(testData, headers, 'excel', {
        title: 'Reporte de Prueba Excel',
        filename: 'test_excel_export'
      })

      if (result.success) {
        showSuccess('Excel Generado', result.message)
      } else {
        showError('Error Excel', result.error)
      }
    } catch (error) {
      showError('Error', 'Error inesperado: ' + error.message)
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Prueba de Exportación
        </h2>
        
        <div className="space-y-4">
          <button
            onClick={testPDFExport}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Probar Exportación PDF
          </button>
          
          <button
            onClick={testExcelExport}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Probar Exportación Excel
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Datos de prueba:</h3>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default ExportTest