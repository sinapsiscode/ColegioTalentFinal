import React from 'react'
import { motion } from 'framer-motion'
import { FiFilter, FiCalendar } from 'react-icons/fi'
import FilterDropdown from '../common/FilterDropdown'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

const AttendanceFilter = ({ 
  selectedStudent, 
  onStudentChange, 
  students, 
  dateRange,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange 
}) => {
  const studentOptions = students.map(student => ({
    value: student.id,
    label: student.nombreCompleto
  }))

  const dateRangeOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'last7', label: 'Últimos 7 días' },
    { value: 'last30', label: 'Últimos 30 días' },
    { value: 'all', label: 'Todo el período' }
  ]

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'presente', label: 'Solo presentes' },
    { value: 'tarde', label: 'Solo tardanzas' },
    { value: 'falta', label: 'Solo faltas' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6"
    >
      <div className="flex items-center space-x-2 mb-4">
        <FiFilter className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estudiante
          </label>
          <FilterDropdown
            label="Seleccionar estudiante"
            options={studentOptions}
            selectedValue={selectedStudent}
            onSelect={onStudentChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <FilterDropdown
            label="Seleccionar período"
            options={dateRangeOptions}
            selectedValue={dateRange}
            onSelect={onDateRangeChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <FilterDropdown
            label="Filtrar por estado"
            options={statusOptions}
            selectedValue={statusFilter}
            onSelect={onStatusFilterChange}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default AttendanceFilter