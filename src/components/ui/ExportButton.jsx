import React, { useState } from 'react'
import { Download, FileSpreadsheet, Loader } from 'lucide-react'

const ExportButton = ({ 
  onExport, 
  loading = false, 
  label = "Exportar Excel",
  className = "",
  variant = "primary" 
}) => {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (loading || isExporting) return
    
    setIsExporting(true)
    try {
      await onExport()
    } finally {
      setIsExporting(false)
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'outline':
        return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading || isExporting}
      className={`
        inline-flex items-center px-4 py-2 rounded-lg font-medium
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${className}
      `}
    >
      {(loading || isExporting) ? (
        <>
          <Loader className="w-4 h-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </button>
  )
}

// Componente para dropdown de exportación con múltiples formatos
export const ExportDropdown = ({ 
  onExportExcel, 
  onExportPDF, 
  loading = false,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (exportFn, format) => {
    if (loading || isExporting) return
    
    setIsExporting(true)
    setIsOpen(false)
    
    try {
      await exportFn(format)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || isExporting}
        className="
          inline-flex items-center px-4 py-2 bg-blue-600 text-white
          rounded-lg font-medium hover:bg-blue-700 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {(loading || isExporting) ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Exportar
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && !loading && !isExporting && (
        <div className="
          absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border
          z-50 py-1
        ">
          {onExportExcel && (
            <button
              onClick={() => handleExport(onExportExcel, 'excel')}
              className="
                w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100
                flex items-center transition-colors
              "
            >
              <FileSpreadsheet className="w-4 h-4 mr-3 text-green-600" />
              Exportar a Excel
            </button>
          )}
          
          {onExportPDF && (
            <button
              onClick={() => handleExport(onExportPDF, 'pdf')}
              className="
                w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100
                flex items-center transition-colors
              "
            >
              <svg className="w-4 h-4 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Exportar a PDF
            </button>
          )}
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ExportButton