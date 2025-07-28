import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUpload,
  FiDownload,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiFileText,
  FiEye,
  FiSave,
  FiRefreshCw
} from 'react-icons/fi'
import * as XLSX from 'xlsx'

import AnimatedButton from '../common/AnimatedButton'
import LoadingSpinner from '../common/LoadingSpinner'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'
import useGradesStore from '../../stores/gradesStore'
import useAuthStore from '../../stores/authStore'

const ExcelGradeImport = ({ estudiantes, onImportComplete }) => {
  const { usuario } = useAuthStore()
  const { crearCalificacion } = useGradesStore()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState([])
  const [materia, setMateria] = useState('')
  const [tipoEvaluacion, setTipoEvaluacion] = useState('')
  
  const fileInputRef = useRef(null)
  
  const materias = [
    'Matemáticas',
    'Comunicación',
    'Ciencias',
    'Personal Social',
    'Inglés',
    'Arte',
    'Educación Física',
    'Computación',
    'Religión'
  ]
  
  const tiposEvaluacion = [
    { value: 'parcial', label: 'Evaluación Parcial' },
    { value: 'final', label: 'Evaluación Final' },
    { value: 'practica', label: 'Práctica Calificada' },
    { value: 'trabajo', label: 'Trabajo' },
    { value: 'examen_mensual', label: 'Examen Mensual' }
  ]
  
  // Generar plantilla Excel
  const downloadTemplate = () => {
    const ws_data = [
      ['PLANTILLA DE CALIFICACIONES - TALENTOS COLLEGE'],
      [],
      ['Instrucciones:'],
      ['1. Complete las columnas Código, Estudiante y Nota'],
      ['2. Las notas deben estar entre 0 y 20'],
      ['3. Use punto decimal para decimales (ej: 15.5)'],
      ['4. No modifique los códigos de estudiante'],
      [],
      ['Código', 'Estudiante', 'Nota']
    ]
    
    // Agregar estudiantes a la plantilla
    estudiantes.forEach(est => {
      ws_data.push([
        est.id.toString().padStart(3, '0'),
        `${est.nombre} ${est.apellidos}`,
        ''
      ])
    })
    
    const ws = XLSX.utils.aoa_to_sheet(ws_data)
    
    // Estilos para el encabezado
    ws['!cols'] = [
      { wch: 10 },  // Código
      { wch: 30 },  // Estudiante
      { wch: 10 }   // Nota
    ]
    
    // Crear libro y descargar
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Calificaciones')
    XLSX.writeFile(wb, `plantilla_calificaciones_${materia || 'general'}.xlsx`)
    
    showSuccess('Plantilla Descargada', 'Complete la plantilla y súbala para importar las calificaciones')
  }
  
  // Procesar archivo Excel
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    if (!materia || !tipoEvaluacion) {
      showError('Error', 'Seleccione materia y tipo de evaluación antes de subir el archivo')
      return
    }
    
    setSelectedFile(file)
    setProcessing(true)
    setErrors([])
    
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      // Encontrar donde empiezan los datos (después de "Código, Estudiante, Nota")
      let dataStartIndex = jsonData.findIndex(row => 
        row[0] === 'Código' || row[0] === 'codigo' || row[0] === 'CÓDIGO'
      )
      
      if (dataStartIndex === -1) {
        throw new Error('Formato de archivo incorrecto. Use la plantilla proporcionada.')
      }
      
      // Procesar datos
      const processedData = []
      const errorList = []
      
      for (let i = dataStartIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        if (!row || row.length < 3) continue
        
        const codigo = row[0]?.toString().trim()
        const nombreCompleto = row[1]?.toString().trim()
        const nota = parseFloat(row[2])
        
        if (!codigo || !nombreCompleto) continue
        
        // Buscar estudiante por código
        const estudiante = estudiantes.find(est => 
          est.id.toString() === codigo || 
          est.id.toString().padStart(3, '0') === codigo
        )
        
        if (!estudiante) {
          errorList.push({
            fila: i + 1,
            mensaje: `Estudiante con código ${codigo} no encontrado`
          })
          continue
        }
        
        // Validar nota
        if (isNaN(nota) || nota < 0 || nota > 20) {
          errorList.push({
            fila: i + 1,
            mensaje: `Nota inválida para ${nombreCompleto}: ${row[2]}`
          })
          continue
        }
        
        processedData.push({
          estudianteId: estudiante.id,
          estudiante: estudiante,
          nombreArchivo: nombreCompleto,
          nota: nota,
          valido: true
        })
      }
      
      setPreview({
        total: processedData.length,
        validos: processedData.filter(d => d.valido).length,
        datos: processedData
      })
      
      setErrors(errorList)
      
      if (processedData.length === 0) {
        showError('Error', 'No se encontraron datos válidos en el archivo')
        setSelectedFile(null)
      }
      
    } catch (error) {
      console.error('Error procesando archivo:', error)
      showError('Error', error.message || 'No se pudo procesar el archivo')
      setSelectedFile(null)
      setPreview(null)
    } finally {
      setProcessing(false)
    }
  }
  
  // Guardar calificaciones
  const handleSaveGrades = async () => {
    if (!preview || preview.validos === 0) {
      showError('Error', 'No hay calificaciones válidas para guardar')
      return
    }
    
    const result = await showConfirm(
      'Confirmar Importación',
      `¿Importar ${preview.validos} calificaciones para ${materia}?`,
      'Importar',
      'Cancelar'
    )
    
    if (!result.isConfirmed) return
    
    setProcessing(true)
    
    try {
      const promises = preview.datos
        .filter(d => d.valido)
        .map(item => 
          crearCalificacion({
            estudianteId: item.estudianteId,
            materia: materia,
            evaluacion: tipoEvaluacion,
            nota: item.nota,
            fecha: new Date().toISOString(),
            tutorId: usuario.id,
            periodo: '2024-1',
            observaciones: 'Importado desde Excel'
          })
        )
      
      await Promise.all(promises)
      
      showSuccess(
        'Importación Exitosa',
        `Se importaron ${preview.validos} calificaciones correctamente`
      )
      
      // Limpiar
      setSelectedFile(null)
      setPreview(null)
      setErrors([])
      setIsExpanded(false)
      fileInputRef.current.value = ''
      
      if (onImportComplete) {
        onImportComplete()
      }
      
    } catch (error) {
      console.error('Error guardando calificaciones:', error)
      showError('Error', 'No se pudieron guardar las calificaciones')
    } finally {
      setProcessing(false)
    }
  }
  
  // Limpiar todo
  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setErrors([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FiUpload className="w-5 h-5 text-green-500" />
          <span>Importar Calificaciones desde Excel</span>
        </h3>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-green-600 hover:text-green-700 transition-colors duration-200"
        >
          {isExpanded ? 'Ocultar' : 'Expandir'}
        </button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Selección de materia y evaluación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materia <span className="text-red-500">*</span>
                </label>
                <select
                  value={materia}
                  onChange={(e) => setMateria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={preview}
                >
                  <option value="">Seleccionar materia</option>
                  {materias.map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evaluación <span className="text-red-500">*</span>
                </label>
                <select
                  value={tipoEvaluacion}
                  onChange={(e) => setTipoEvaluacion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={preview}
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposEvaluacion.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Área de carga */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Archivo Excel</h4>
                <AnimatedButton
                  variant="outline"
                  icon={FiDownload}
                  onClick={downloadTemplate}
                  size="sm"
                  disabled={!materia || processing}
                >
                  Descargar Plantilla
                </AnimatedButton>
              </div>
              
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={!materia || !tipoEvaluacion || processing}
                />
                
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-all duration-200
                    ${!materia || !tipoEvaluacion 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                      : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                    }
                  `}
                >
                  {processing ? (
                    <LoadingSpinner size="lg" />
                  ) : selectedFile ? (
                    <div className="space-y-2">
                      <FiFileText className="w-12 h-12 text-green-500 mx-auto" />
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FiUpload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        {!materia || !tipoEvaluacion 
                          ? 'Primero seleccione materia y tipo de evaluación'
                          : 'Click para seleccionar archivo Excel'
                        }
                      </p>
                      <p className="text-xs text-gray-500">XLSX, XLS (máx. 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Errores */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center">
                  <FiAlertCircle className="w-4 h-4 mr-1" />
                  Errores encontrados ({errors.length})
                </h4>
                <ul className="text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                  {errors.map((error, idx) => (
                    <li key={idx}>
                      Fila {error.fila}: {error.mensaje}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Vista previa */}
            {preview && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-green-900 mb-3">
                  Vista Previa de Importación
                </h4>
                
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{preview.total}</p>
                    <p className="text-xs text-green-700">Total registros</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{preview.validos}</p>
                    <p className="text-xs text-green-700">Válidos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{errors.length}</p>
                    <p className="text-xs text-red-700">Con errores</p>
                  </div>
                </div>
                
                {/* Tabla de preview */}
                <div className="max-h-64 overflow-y-auto">
                  <table className="min-w-full divide-y divide-green-200 text-sm">
                    <thead className="bg-green-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-green-800">
                          Estudiante
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-green-800">
                          Nota
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-green-800">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-100">
                      {preview.datos.slice(0, 10).map((item, idx) => (
                        <tr key={idx} className="hover:bg-green-50">
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {item.estudiante.nombre} {item.estudiante.apellidos}
                          </td>
                          <td className="px-3 py-2 text-center font-medium">
                            {item.nota}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {item.valido ? (
                              <FiCheck className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <FiX className="w-4 h-4 text-red-600 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.datos.length > 10 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      ... y {preview.datos.length - 10} registros más
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Botones de acción */}
            <div className="flex items-center justify-end space-x-3">
              {preview && (
                <AnimatedButton
                  variant="outline"
                  icon={FiRefreshCw}
                  onClick={handleReset}
                  disabled={processing}
                >
                  Limpiar
                </AnimatedButton>
              )}
              
              <AnimatedButton
                variant="primary"
                icon={FiSave}
                onClick={handleSaveGrades}
                loading={processing}
                disabled={!preview || preview.validos === 0 || processing}
              >
                Importar {preview ? `${preview.validos} Calificaciones` : 'Calificaciones'}
              </AnimatedButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Indicador cuando está colapsado */}
      {!isExpanded && (
        <div className="text-sm text-gray-600">
          Importe múltiples calificaciones desde un archivo Excel
        </div>
      )}
    </motion.div>
  )
}

export default ExcelGradeImport