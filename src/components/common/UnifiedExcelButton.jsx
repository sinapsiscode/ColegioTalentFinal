import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiFileText as FileSpreadsheet, 
  FiDownload as Download, 
  FiUpload as Upload, 
  FiLoader as Loader, 
  FiChevronDown as ChevronDown,
  FiFile as FileText,
  FiUsers as Users,
  FiMessageSquare as MessageSquare,
  FiCalendar as Calendar,
  FiDollarSign as DollarSign,
  FiBookOpen as BookOpen,
  FiX as X
} from 'react-icons/fi'
import ExcelExporter from '../../utils/excelExporter'
import { showSuccess, showError, showInfo } from '../../utils/sweetAlert'

const UnifiedExcelButton = ({ 
  data = [],
  dataType = 'generic',
  fileName = null,
  variant = 'primary',
  size = 'default',
  showDropdown = false,
  onImport = null,
  onExportSuccess = null,
  onExportError = null,
  onExportPDF = null,
  className = '',
  disabled = false,
  filterFn = null,
  customLabel = null,
  showFormatModal = false, // Nueva prop para mostrar modal de formato
  userRole = null // Nueva prop para detectar rol del usuario
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [formatModalOpen, setFormatModalOpen] = useState(false)

  // Configuración de tipos de datos
  const dataTypeConfig = {
    usuarios: {
      label: 'Usuarios',
      icon: Users,
      exportFn: ExcelExporter.exportarUsuarios,
      fileName: 'usuarios'
    },
    estudiantes: {
      label: 'Estudiantes', 
      icon: Users,
      exportFn: ExcelExporter.exportarEstudiantes,
      fileName: 'estudiantes'
    },
    comunicados: {
      label: 'Comunicados',
      icon: MessageSquare,
      exportFn: ExcelExporter.exportarComunicados,
      fileName: 'comunicados'
    },
    calificaciones: {
      label: 'Calificaciones',
      icon: BookOpen,
      exportFn: ExcelExporter.exportarCalificaciones,
      fileName: 'calificaciones'
    },
    asistencia: {
      label: 'Asistencia',
      icon: Calendar,
      exportFn: ExcelExporter.exportarAsistencia,
      fileName: 'asistencia'
    },
    pagos: {
      label: 'Pagos',
      icon: DollarSign,
      exportFn: ExcelExporter.exportarCronogramaPagos,
      fileName: 'cronograma_pagos'
    },
    generic: {
      label: 'Datos',
      icon: FileSpreadsheet,
      exportFn: null,
      fileName: 'datos'
    }
  }

  const config = dataTypeConfig[dataType] || dataTypeConfig.generic
  const IconComponent = config.icon

  // Determinar si debe mostrar opciones de formato (admin/tutor)
  const shouldShowFormatOptions = showFormatModal || 
    (userRole && ['admin', 'tutor'].includes(userRole)) ||
    (onExportPDF !== null)

  // Manejar click principal del botón
  const handleMainClick = () => {
    if (shouldShowFormatOptions) {
      setFormatModalOpen(true)
    } else {
      handleExport('excel')
    }
  }

  // Manejar exportación con formato específico
  const handleExport = async (format = 'excel') => {
    if (isExporting || disabled) return

    setIsExporting(true)
    setFormatModalOpen(false)
    setDropdownOpen(false)
    
    try {
      // Aplicar filtros si existe función de filtrado
      const processedData = filterFn ? data.filter(filterFn) : data

      if (!processedData || processedData.length === 0) {
        showInfo('Sin datos', 'No hay datos disponibles para exportar')
        return
      }

      let result

      if (format === 'pdf' && onExportPDF) {
        // Exportar a PDF usando callback personalizado
        result = await onExportPDF(processedData)
      } else {
        // Exportar a Excel
        if (config.exportFn) {
          // Usar exportador específico
          result = config.exportFn(processedData)
        } else {
          // Exportación genérica
          result = await exportGeneric(processedData)
        }
      }

      if (result && result.success) {
        showSuccess(
          'Exportación exitosa', 
          result.mensaje || `Se exportaron ${processedData.length} registros en formato ${format.toUpperCase()}`
        )
        
        if (onExportSuccess) {
          onExportSuccess(result)
        }
      } else if (format === 'excel') {
        // Para Excel sin resultado específico, asumir éxito
        showSuccess(
          'Exportación exitosa', 
          `Se exportaron ${processedData.length} registros en formato Excel`
        )
        
        if (onExportSuccess) {
          onExportSuccess({ 
            success: true, 
            registros: processedData.length, 
            formato: format 
          })
        }
      }

    } catch (error) {
      console.error('Error en exportación:', error)
      const errorMessage = error.message || 'Error al exportar los datos'
      
      showError('Error de exportación', errorMessage)
      
      if (onExportError) {
        onExportError(error)
      }
    } finally {
      setIsExporting(false)
    }
  }

  // Exportación genérica para casos no específicos
  const exportGeneric = async (data) => {
    try {
      const XLSX = await import('xlsx')
      
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(data)
      
      // Aplicar estilos básicos
      const range = XLSX.utils.decode_range(ws['!ref'])
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
        if (ws[cellRef]) {
          ws[cellRef].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "E2E8F0" } }
          }
        }
      }
      
      XLSX.utils.book_append_sheet(wb, ws, config.label)
      
      const finalFileName = fileName || `${config.fileName}_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, finalFileName)
      
      return {
        success: true,
        archivo: finalFileName,
        registros: data.length,
        mensaje: `Se exportaron ${data.length} registros exitosamente`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        mensaje: 'Error al generar el archivo Excel'
      }
    }
  }

  // Manejar importación
  const handleImport = () => {
    if (isImporting || disabled || !onImport) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls'
    
    input.onchange = async (e) => {
      setIsImporting(true)
      
      try {
        const file = e.target.files[0]
        if (!file) return

        const XLSX = await import('xlsx')
        const reader = new FileReader()
        
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)
            
            onImport(jsonData, file.name)
            showSuccess('Importación exitosa', `Se procesaron ${jsonData.length} registros`)
          } catch (error) {
            showError('Error de importación', 'No se pudo procesar el archivo Excel')
          } finally {
            setIsImporting(false)
          }
        }
        
        reader.readAsArrayBuffer(file)
      } catch (error) {
        showError('Error', 'No se pudo leer el archivo')
        setIsImporting(false)
      }
    }
    
    input.click()
  }

  // Estilos según variante
  const getVariantClasses = () => {
    const baseClasses = 'inline-flex items-center font-medium transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
    
    switch (variant) {
      case 'secondary':
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white`
      case 'success':
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`
      case 'outline':
        return `${baseClasses} border-2 border-talentos-primary text-talentos-primary hover:bg-talentos-primary hover:text-white`
      case 'ghost':
        return `${baseClasses} text-gray-700 hover:bg-gray-100`
      default:
        return `${baseClasses} bg-talentos-primary hover:bg-blue-700 text-white`
    }
  }

  // Estilos según tamaño
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm rounded-md'
      case 'lg':
        return 'px-6 py-3 text-lg rounded-lg'
      default:
        return 'px-4 py-2 text-base rounded-lg'
    }
  }

  const buttonClasses = `${getVariantClasses()} ${getSizeClasses()} ${className}`

  // Si no hay dropdown, mostrar botón simple
  if (!showDropdown || !onImport) {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleMainClick}
          disabled={disabled || isExporting}
          className={buttonClasses}
        >
          {isExporting ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <IconComponent className="w-4 h-4 mr-2" />
              {customLabel || `Exportar ${config.label}`}
            </>
          )}
        </motion.button>

        {/* Modal de selección de formato */}
        {formatModalOpen && (
          <FormatSelectionModal
            isOpen={formatModalOpen}
            onClose={() => setFormatModalOpen(false)}
            onSelectFormat={handleExport}
            dataType={config.label}
            loading={isExporting}
          />
        )}
      </>
    )
  }

  // Botón con dropdown para exportar/importar
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={disabled || isExporting || isImporting}
        className={`${buttonClasses} pr-10`}
      >
        {(isExporting || isImporting) ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            {isExporting ? 'Exportando...' : 'Importando...'}
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {customLabel || 'Excel'}
            <ChevronDown className="w-4 h-4 ml-2 absolute right-2" />
          </>
        )}
      </motion.button>

      {/* Dropdown */}
      {dropdownOpen && !isExporting && !isImporting && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1"
          >
            <button
              onClick={handleExport}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
            >
              <Download className="w-4 h-4 mr-3 text-green-600" />
              Exportar Excel
            </button>
            
            {onImport && (
              <button
                onClick={handleImport}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
              >
                <Upload className="w-4 h-4 mr-3 text-blue-600" />
                Importar Excel
              </button>
            )}
          </motion.div>

          {/* Overlay para cerrar dropdown */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setDropdownOpen(false)}
          />
        </>
      )}
    </div>
  )
}

// Componente modal para seleccionar formato de exportación
const FormatSelectionModal = ({ isOpen, onClose, onSelectFormat, dataType, loading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal - Responsive */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto
                   sm:p-6 p-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-start sm:items-center space-x-3 mb-3 sm:mb-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                Exportar Lista de {dataType}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                ¿En qué formato deseas descargar la lista?
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opciones de formato - Responsive */}
        <div className="space-y-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectFormat('excel')}
            disabled={loading}
            className="w-full p-3 sm:p-4 border-2 border-green-200 rounded-lg 
                     hover:border-green-300 hover:bg-green-50 transition-all 
                     flex items-center space-x-3 sm:space-x-4 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="text-left flex-1">
              <h4 className="text-sm sm:text-base font-medium text-gray-900">Formato Excel</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Archivo .xlsx con datos organizados</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectFormat('pdf')}
            disabled={loading}
            className="w-full p-3 sm:p-4 border-2 border-red-200 rounded-lg 
                     hover:border-red-300 hover:bg-red-50 transition-all 
                     flex items-center space-x-3 sm:space-x-4 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="text-left flex-1">
              <h4 className="text-sm sm:text-base font-medium text-gray-900">Formato PDF</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Documento con formato profesional</p>
            </div>
          </motion.button>
        </div>

        {/* Loading state - Responsive */}
        {loading && (
          <div className="flex items-center justify-center py-3 sm:py-4">
            <Loader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-xs sm:text-sm text-gray-600">Exportando...</span>
          </div>
        )}

        {/* Footer - Responsive */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 
                     border border-gray-300 rounded-lg hover:bg-gray-50 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default UnifiedExcelButton