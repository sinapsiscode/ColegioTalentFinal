import React, { useState } from 'react'
import { FiChevronDown, FiCheck } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const FilterDropdown = ({
  label,
  options = [],
  selectedValue,
  onSelect,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedOption = options.find(opt => opt.value === selectedValue)
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="input-field flex items-center justify-between w-full"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : label}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <div className="py-1 max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value)
                    setIsOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between transition-colors duration-200"
                >
                  <span className="text-gray-900">{option.label}</span>
                  {selectedValue === option.value && (
                    <FiCheck className="w-4 h-4 text-talentos-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default FilterDropdown