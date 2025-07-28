import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar, FiX } from 'react-icons/fi'

const DateRangeFilter = ({ 
  label = 'Rango de fechas', 
  startDate, 
  endDate, 
  onDateChange,
  presetRanges = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState(startDate || '')
  const [tempEndDate, setTempEndDate] = useState(endDate || '')

  // Obtener fecha actual
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  // Rangos predefinidos
  const ranges = [
    { 
      label: 'Hoy', 
      value: () => ({
        start: todayStr,
        end: todayStr
      })
    },
    { 
      label: 'Últimos 7 días', 
      value: () => {
        const start = new Date(today)
        start.setDate(start.getDate() - 7)
        return {
          start: start.toISOString().split('T')[0],
          end: todayStr
        }
      }
    },
    { 
      label: 'Últimos 30 días', 
      value: () => {
        const start = new Date(today)
        start.setDate(start.getDate() - 30)
        return {
          start: start.toISOString().split('T')[0],
          end: todayStr
        }
      }
    },
    { 
      label: 'Este mes', 
      value: () => {
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        }
      }
    },
    { 
      label: 'Mes anterior', 
      value: () => {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const end = new Date(today.getFullYear(), today.getMonth(), 0)
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        }
      }
    },
    { 
      label: 'Este año', 
      value: () => ({
        start: `${today.getFullYear()}-01-01`,
        end: `${today.getFullYear()}-12-31`
      })
    }
  ]

  const handlePresetRange = (range) => {
    const { start, end } = range.value()
    setTempStartDate(start)
    setTempEndDate(end)
    onDateChange({ startDate: start, endDate: end })
    setIsOpen(false)
  }

  const handleApplyDates = () => {
    if (tempStartDate && tempEndDate) {
      onDateChange({ startDate: tempStartDate, endDate: tempEndDate })
      setIsOpen(false)
    }
  }

  const handleClearDates = () => {
    setTempStartDate('')
    setTempEndDate('')
    onDateChange({ startDate: null, endDate: null })
    setIsOpen(false)
  }

  const formatDateDisplay = () => {
    if (!startDate && !endDate) return 'Seleccionar fechas'
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short' 
      })
      const end = new Date(endDate).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      })
      return `${start} - ${end}`
    }
    return 'Seleccionar fechas'
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botón trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-talentos-primary focus:border-transparent transition-colors"
      >
        <div className="flex items-center space-x-2">
          <FiCalendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">{formatDateDisplay()}</span>
        </div>
        {(startDate || endDate) && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClearDates()
            }}
            className="ml-2 p-1 hover:bg-gray-100 rounded"
          >
            <FiX className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
        >
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">{label}</h3>
            
            {/* Rangos predefinidos */}
            {presetRanges && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {ranges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handlePresetRange(range)}
                    className="px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}

            {/* Selección manual */}
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  max={tempEndDate || todayStr}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha fin
                </label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  min={tempStartDate}
                  max={todayStr}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyDates}
                disabled={!tempStartDate || !tempEndDate}
                className="px-4 py-2 text-sm text-white bg-talentos-primary hover:bg-talentos-secondary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aplicar
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Click outside handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default DateRangeFilter