import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, 
  FiUpload, 
  FiFileText,
  FiCheck,
  FiAlertTriangle,
  FiUsers,
  FiDownload,
  FiEye,
  FiSave
} from 'react-icons/fi'
import * as XLSX from 'xlsx'
import { DatabaseQueries } from '../../data/databaseSchema'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'

/**
 * Modal para importar estudiantes desde archivo Excel
 * 
 * Estructura Excel esperada:
 * - nombre (obligatorio)
 * - apellidos (obligatorio) 
 * - fecha_nacimiento (obligatorio, formato YYYY-MM-DD)
 * - grado (obligatorio)
 * - seccion (obligatorio)
 * - documento (opcional)
 * - direccion (opcional)
 * - telefono_emergencia (opcional)
 * - email_padre (opcional)
 * - observaciones (opcional)
 */

const ImportStudentsModal = ({ isOpen, onClose, onImportComplete }) => {
  const [file, setFile] = useState(null)
  const [students, setStudents] = useState([])
  const [validationResults, setValidationResults] = useState({ valid: [], invalid: [] })
  const [step, setStep] = useState(1) // 1: Upload, 2: Preview, 3: Import
  const [importing, setImporting] = useState(false)
  const [importOptions, setImportOptions] = useState({
    generateQR: true,
    autoLinkParents: true,
    overwriteExisting: false
  })

  // Configuración de validaciones
  const REQUIRED_COLUMNS = ['nombre', 'apellidos', 'fecha_nacimiento', 'grado', 'seccion']
  const OPTIONAL_COLUMNS = ['documento', 'direccion', 'telefono_emergencia', 'email_padre', 'observaciones']
  const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]
  
  const VALID_GRADES = [
    '1ro Primaria', '2do Primaria', '3ro Primaria', '4to Primaria', '5to Primaria', '6to Primaria',
    '1ro Secundaria', '2do Secundaria', '3ro Secundaria', '4to Secundaria', '5to Secundaria'
  ]

  // Reset modal state
  const resetModal = () => {
    setFile(null)
    setStudents([])
    setValidationResults({ valid: [], invalid: [] })
    setStep(1)
    setImporting(false)
  }

  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0]
    if (!uploadedFile) return

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]

    if (!validTypes.includes(uploadedFile.type)) {
      showError('Archivo no válido', 'Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV')
      return
    }

    setFile(uploadedFile)
    parseExcelFile(uploadedFile)
  }

  // Parse Excel file
  const parseExcelFile = (file) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          showError('Archivo vacío', 'El archivo no contiene datos válidos')
          return
        }

        setStudents(jsonData)
        validateStudents(jsonData)
        setStep(2)

      } catch (error) {
        console.error('Error parsing Excel:', error)
        showError('Error de lectura', 'No se pudo leer el archivo. Verifica que sea un Excel válido.')
      }
    }

    reader.readAsArrayBuffer(file)
  }

  // Validate students data
  const validateStudents = (studentsData) => {
    const valid = []
    const invalid = []

    studentsData.forEach((student, index) => {
      const errors = []
      const warnings = []

      // Validate required fields
      REQUIRED_COLUMNS.forEach(column => {
        if (!student[column] || String(student[column]).trim() === '') {
          errors.push(`${column} es obligatorio`)
        }
      })

      // Validate specific fields
      if (student.nombre) {
        if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(student.nombre)) {
          errors.push('Nombre solo debe contener letras y espacios')
        }
      }

      if (student.apellidos) {
        if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(student.apellidos)) {
          errors.push('Apellidos solo debe contener letras y espacios')
        }
      }

      if (student.fecha_nacimiento) {
        const date = new Date(student.fecha_nacimiento)
        if (isNaN(date.getTime())) {
          errors.push('Fecha de nacimiento no válida (usar formato YYYY-MM-DD)')
        } else {
          const age = new Date().getFullYear() - date.getFullYear()
          if (age < 3 || age > 18) {
            warnings.push(`Edad inusual: ${age} años`)
          }
        }
      }

      if (student.grado && !VALID_GRADES.includes(student.grado)) {
        errors.push(`Grado no válido. Debe ser uno de: ${VALID_GRADES.join(', ')}`)
      }

      if (student.seccion && !/^[A-Z]$/.test(student.seccion)) {
        errors.push('Sección debe ser una letra mayúscula (A, B, C, etc.)')
      }

      if (student.documento && !/^\d{8}$/.test(student.documento)) {
        warnings.push('Documento debe tener 8 dígitos')
      }

      if (student.email_padre && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email_padre)) {
        warnings.push('Email del padre no tiene formato válido')
      }

      if (student.telefono_emergencia && !/^\+51\s?\d{9}$/.test(student.telefono_emergencia)) {
        warnings.push('Teléfono debe tener formato +51 987654321')
      }

      const studentWithValidation = {
        ...student,
        rowIndex: index + 2, // +2 because Excel rows start at 1 and we have header
        errors,
        warnings,
        isValid: errors.length === 0
      }

      if (errors.length === 0) {
        valid.push(studentWithValidation)
      } else {
        invalid.push(studentWithValidation)
      }
    })

    setValidationResults({ valid, invalid })
  }

  // Handle import
  const handleImport = async () => {
    if (validationResults.valid.length === 0) {
      showError('Sin datos válidos', 'No hay estudiantes válidos para importar')
      return
    }

    const confirmed = await showConfirm(
      'Confirmar Importación',
      `¿Importar ${validationResults.valid.length} estudiante(s) válido(s)?`,
      'Sí, importar',
      'Cancelar'
    )

    if (!confirmed.isConfirmed) return

    setImporting(true)
    setStep(3)

    try {
      let importedCount = 0
      let skippedCount = 0

      for (const student of validationResults.valid) {
        try {
          // Check if student already exists
          const existingStudents = DatabaseQueries.getAllStudents()
          const exists = existingStudents.some(s => 
            s.nombre === student.nombre && 
            s.apellidos === student.apellidos &&
            s.grado === student.grado
          )

          if (exists && !importOptions.overwriteExisting) {
            skippedCount++
            continue
          }

          // Prepare student data
          const studentData = {
            nombre: student.nombre.trim(),
            apellidos: student.apellidos.trim(),
            fecha_nacimiento: student.fecha_nacimiento,
            grado: student.grado,
            seccion: student.seccion,
            documento: student.documento || '',
            direccion: student.direccion || '',
            telefono_emergencia: student.telefono_emergencia || '',
            observaciones: student.observaciones || '',
            // Auto-generate QR code if option is enabled
            codigo_qr: importOptions.generateQR ? `QR${Date.now()}_${importedCount}` : '',
            foto: '/images/default-student.jpg',
            // No promedio hasta que profesor asigne calificaciones
            promedio: null,
            asistencia: 0
          }

          // Insert student
          const insertedStudent = DatabaseQueries.customInsert('students', studentData)
          
          if (insertedStudent) {
            importedCount++

            // Auto-link with parent if email provided and option enabled
            if (importOptions.autoLinkParents && student.email_padre) {
              try {
                const parent = DatabaseQueries.getUserByEmail(student.email_padre)
                if (parent && parent.rol === 'padre') {
                  DatabaseQueries.assignStudentToParent(
                    parent.id, 
                    insertedStudent.id, 
                    'padre'
                  )
                }
              } catch (linkError) {
                console.warn('No se pudo vincular con padre:', linkError)
              }
            }
          }

        } catch (studentError) {
          console.error('Error importing student:', studentError)
        }
      }

      // Show results
      showSuccess(
        'Importación Completada', 
        `Se importaron ${importedCount} estudiante(s). ${skippedCount > 0 ? `${skippedCount} omitido(s) por duplicados.` : ''}`
      )

      // Notify parent component
      if (onImportComplete) {
        onImportComplete(importedCount)
      }

      // Reset and close
      setTimeout(() => {
        resetModal()
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Import error:', error)
      showError('Error de Importación', 'Ocurrió un error durante la importación')
      setImporting(false)
    }
  }

  // Download template
  const downloadTemplate = () => {
    const templateData = [
      {
        nombre: 'María José',
        apellidos: 'González López',
        fecha_nacimiento: '2015-03-15',
        grado: '3ro Primaria',
        seccion: 'A',
        documento: '12345678',
        direccion: 'Av. Los Olivos 123',
        telefono_emergencia: '+51 987 654 321',
        email_padre: 'padre@email.com',
        observaciones: 'Sin observaciones'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes')
    XLSX.writeFile(wb, 'template_estudiantes.xlsx')
    
    showSuccess('Template Descargado', 'Usa este archivo como ejemplo para importar estudiantes')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUpload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Importar Estudiantes
                </h3>
                <p className="text-sm text-gray-600">
                  Paso {step} de 3: {
                    step === 1 ? 'Subir archivo Excel' :
                    step === 2 ? 'Revisar datos' :
                    'Importando estudiantes'
                  }
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={importing}
            >
              <FiX className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6">
                {/* Template Download */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FiDownload className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">¿Primera vez?</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Descarga la plantilla Excel con el formato correcto
                      </p>
                      <button
                        onClick={downloadTemplate}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Descargar Plantilla
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona tu archivo Excel
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Acepta archivos .xlsx, .xls y .csv
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <FiUpload className="w-4 h-4" />
                    <span>Seleccionar Archivo</span>
                  </label>
                </div>

                {/* Required Format */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Formato Requerido:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Columnas Obligatorias:</h5>
                      <ul className="space-y-1 text-gray-600">
                        {REQUIRED_COLUMNS.map(col => (
                          <li key={col} className="flex items-center space-x-2">
                            <FiCheck className="w-3 h-3 text-green-600" />
                            <span>{col}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Columnas Opcionales:</h5>
                      <ul className="space-y-1 text-gray-600">
                        {OPTIONAL_COLUMNS.map(col => (
                          <li key={col} className="flex items-center space-x-2">
                            <div className="w-3 h-3 border border-gray-400 rounded-sm" />
                            <span>{col}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Validation Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <FiCheck className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        {validationResults.valid.length} Válidos
                      </span>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <FiAlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-900">
                        {validationResults.invalid.length} Con Errores
                      </span>
                    </div>
                  </div>
                </div>

                {/* Import Options */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Opciones de Importación:</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={importOptions.generateQR}
                        onChange={(e) => setImportOptions(prev => ({ ...prev, generateQR: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Auto-generar códigos QR</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={importOptions.autoLinkParents}
                        onChange={(e) => setImportOptions(prev => ({ ...prev, autoLinkParents: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Auto-vincular con padres (por email)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={importOptions.overwriteExisting}
                        onChange={(e) => setImportOptions(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Sobrescribir estudiantes existentes</span>
                    </label>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">
                      Vista Previa (primeros 10 registros)
                    </h4>
                  </div>
                  <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Estado</th>
                          <th className="px-3 py-2 text-left">Nombre</th>
                          <th className="px-3 py-2 text-left">Apellidos</th>
                          <th className="px-3 py-2 text-left">Grado</th>
                          <th className="px-3 py-2 text-left">Sección</th>
                          <th className="px-3 py-2 text-left">Errores</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...validationResults.valid, ...validationResults.invalid]
                          .slice(0, 10)
                          .map((student, index) => (
                          <tr key={index} className={student.isValid ? 'bg-green-50' : 'bg-red-50'}>
                            <td className="px-3 py-2">
                              {student.isValid ? (
                                <FiCheck className="w-4 h-4 text-green-600" />
                              ) : (
                                <FiAlertTriangle className="w-4 h-4 text-red-600" />
                              )}
                            </td>
                            <td className="px-3 py-2">{student.nombre}</td>
                            <td className="px-3 py-2">{student.apellidos}</td>
                            <td className="px-3 py-2">{student.grado}</td>
                            <td className="px-3 py-2">{student.seccion}</td>
                            <td className="px-3 py-2">
                              {student.errors.length > 0 && (
                                <div className="text-xs text-red-600">
                                  {student.errors.slice(0, 2).join(', ')}
                                  {student.errors.length > 2 && '...'}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Errors List */}
                {validationResults.invalid.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">
                      Errores Encontrados ({validationResults.invalid.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto">
                      {validationResults.invalid.slice(0, 5).map((student, index) => (
                        <div key={index} className="text-sm text-red-700 mb-1">
                          <strong>Fila {student.rowIndex}:</strong> {student.errors.join(', ')}
                        </div>
                      ))}
                      {validationResults.invalid.length > 5 && (
                        <div className="text-sm text-red-600">
                          ... y {validationResults.invalid.length - 5} errores más
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-12">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Importando Estudiantes...
                </h4>
                <p className="text-gray-600">
                  Por favor espera mientras procesamos los datos
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {file && (
                <span>Archivo: {file.name}</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {step === 1 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </motion.button>
              )}
              
              {step === 2 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Volver
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleImport}
                    disabled={validationResults.valid.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave className="w-4 h-4" />
                    <span>Importar {validationResults.valid.length} Estudiantes</span>
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ImportStudentsModal