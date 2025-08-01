import React, { memo, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiChevronDown } from 'react-icons/fi'
import { navItemHover } from '../../../utils/animations'

const DropdownNavigation = memo(({ item, isOpen, onToggle }) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const hasActiveChild = useMemo(() => 
    item.items?.some(child => location.pathname === child.path), 
    [item.items, location.pathname]
  )
  
  const handleToggle = useCallback(() => {
    onToggle(isOpen ? null : item.id)
  }, [onToggle, isOpen, item.id])
  
  const handleSubItemClick = useCallback((subItem) => {
    navigate(subItem.path)
    onToggle(null)
  }, [navigate, onToggle])
  
  const Icon = item.icon
  
  return (
    <div className="relative">
      <motion.button
        onClick={handleToggle}
        className={`group flex items-center gap-1.5 md:gap-2 px-3 md:px-3.5 lg:px-4 xl:px-5 py-2.5 md:py-3 lg:py-3.5 rounded-lg text-sm md:text-base lg:text-base xl:text-lg 2xl:text-lg font-medium transition-all duration-200 relative ${
          hasActiveChild || isOpen
            ? 'text-talentos-primary bg-white shadow-md border border-gray-100'
            : 'text-gray-600 hover:text-talentos-primary hover:bg-white hover:shadow-sm hover:border hover:border-gray-100'
        }`}
        title={item.label}
        {...navItemHover}
      >
        <Icon className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 xl:w-5.5 xl:h-5.5 flex-shrink-0" />
        
        <span className="font-medium whitespace-nowrap">
          <span className="hidden lg:inline">{item.label}</span>
        </span>
        
        <FiChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        
        {/* Tooltip para tablets */}
        <div className="md:block lg:hidden absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {item.label}
        </div>
        
        {/* Indicador activo */}
        {hasActiveChild && (
          <motion.div
            className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-3/5 h-0.5 bg-talentos-primary rounded-full"
            layoutId="activeIndicator"
          />
        )}
      </motion.button>
      
      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop para cerrar */}
            <div 
              className="fixed inset-0 z-30"
              onClick={() => onToggle(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-40"
            >
              {item.items?.map((subItem) => {
                const SubIcon = subItem.icon
                const isSubActive = location.pathname === subItem.path
                
                return (
                  <button
                    key={subItem.path}
                    onClick={() => handleSubItemClick(subItem)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-base transition-colors duration-200 ${
                      isSubActive
                        ? 'text-talentos-primary bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <SubIcon className="w-4 h-4" />
                    <span>{subItem.label}</span>
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
})

DropdownNavigation.displayName = 'DropdownNavigation'

export default DropdownNavigation