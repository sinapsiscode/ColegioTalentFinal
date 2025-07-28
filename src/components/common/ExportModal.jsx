import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiDownload, FiFileText, FiFile } from 'react-icons/fi'
import { SiMicrosoftexcel } from 'react-icons/si'
import { showSuccess, showError } from '../../utils/sweetAlert'

/**
 * Modal para seleccionar formato de exportación
 * - Para administradores: Excel y PDF
 * - Para padres: Solo PDF (automático)
 * - Diseño responsivo y accesible
 */

const ExportModal = ({ 
  isOpen, 
  onClose, 
  onExport, 
  userRole = 'admin',
  title = 'Exportar Datos',
  description = 'Selecciona el formato de exportación que prefieras',
  data = [],
  loading = false 
}) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf')
  const [isExporting, setIsExporting] = useState(false)

  // Formatear datos para mostrar resumen
  const dataCount = Array.isArray(data) ? data.length : 0

  const handleExport = async (format) => {
    if (!onExport) return

    setIsExporting(true)
    try {
      const result = await onExport(format)
      
      if (result?.success) {
        showSuccess(
          'Exportación Exitosa', 
          result.message || `Archivo ${format.toUpperCase()} descargado`
        )
        onClose()
      } else {
        showError(
          'Error de Exportación', 
          result?.error || 'No se pudo completar la exportación'
        )
      }
    } catch (error) {
      showError('Error', 'Error inesperado durante la exportación')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const formatOptions = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Documento portátil, ideal para visualización',
      icon: FiFileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      available: true
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Hoja de cálculo, ideal para análisis de datos',
      icon: SiMicrosoftexcel,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      available: userRole === 'admin' // Solo disponible para admins
    }
  ].filter(option => option.available)

  // Si es padre, exportar automáticamente a PDF
  React.useEffect(() => {
    if (isOpen && userRole === 'parent') {
      handleExport('pdf')
    }
  }, [isOpen, userRole])

  if (!isOpen) return null

  // Para padres, mostrar solo el loading mientras se exporta
  if (userRole === 'parent') {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl p-6 mx-4 max-w-md w-full"
          >
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-talentos-primary border-t-transparent rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generando Reporte PDF
              </h3>
              <p className="text-gray-600">
                Por favor espera mientras preparamos tu reporte...
              </p>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {description}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              disabled={isExporting}
            >
              <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6">
            {/* Data Summary */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <FiFile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Datos a exportar
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {dataCount} {dataCount === 1 ? 'registro' : 'registros'}
                  </p>
                </div>
              </div>
            </div>

            {/* Format Options */}
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">
                Selecciona el formato:
              </h4>
              
              {formatOptions.map((format) => {
                const Icon = format.icon
                const isSelected = selectedFormat === format.id
                
                return (
                  <motion.button
                    key={format.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? `${format.borderColor} ${format.bgColor}`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    disabled={isExporting}
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mt-0.5 ${format.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 text-sm sm:text-base">
                          {format.name}
                        </h5>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {format.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${format.color.replace('text-', 'bg-')} flex-shrink-0`} />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors order-2 sm:order-1"
              disabled={isExporting}
            >
              Cancelar
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport(selectedFormat)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-talentos-primary text-white rounded-lg hover:bg-talentos-secondary transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
              disabled={isExporting || !selectedFormat}
            >
              {isExporting ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <FiDownload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Exportar</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ExportModal