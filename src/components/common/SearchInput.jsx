import React from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { motion } from 'framer-motion'

const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Buscar...", 
  onClear,
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field pl-10 pr-10"
        placeholder={placeholder}
      />
      {value && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-talentos-primary transition-colors duration-200"
        >
          <FiX className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  )
}

export default SearchInput