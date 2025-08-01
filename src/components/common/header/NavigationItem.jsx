import React, { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { navItemHover } from '../../../utils/animations'

const NavigationItem = memo(({ item }) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const isActive = location.pathname === item.path
  
  const handleClick = useCallback(() => {
    navigate(item.path)
  }, [navigate, item.path])
  
  const Icon = item.icon
  
  return (
    <motion.button
      onClick={handleClick}
      className={`group flex items-center gap-1.5 md:gap-2 px-3 md:px-3.5 lg:px-4 xl:px-5 py-2.5 md:py-3 lg:py-3.5 rounded-lg text-sm md:text-base lg:text-base xl:text-lg 2xl:text-lg font-medium transition-all duration-200 relative ${
        isActive
          ? 'text-talentos-primary bg-white shadow-md border border-gray-100'
          : 'text-gray-600 hover:text-talentos-primary hover:bg-white hover:shadow-sm hover:border hover:border-gray-100'
      }`}
      title={item.label}
      {...navItemHover}
    >
      <Icon className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 xl:w-5.5 xl:h-5.5 flex-shrink-0" />
      
      <span className="font-medium whitespace-nowrap">
        <span className="hidden lg:inline">
          {item.shortLabel || item.label}
        </span>
      </span>
      
      {/* Tooltip para tablets */}
      <div className="md:block lg:hidden absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {item.label}
      </div>
      
      {/* Indicador activo */}
      {isActive && (
        <motion.div
          className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-3/5 h-0.5 bg-talentos-primary rounded-full"
          layoutId="activeIndicator"
        />
      )}
    </motion.button>
  )
})

NavigationItem.displayName = 'NavigationItem'

export default NavigationItem