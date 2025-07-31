import React from 'react'
import { motion } from 'framer-motion'

const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  hover = false,
  onClick,
  header,
  footer,
  variant = 'default',
  ...props
}) => {
  const baseClasses = 'bg-white border border-gray-200 transition-all duration-200'
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10'
  }
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  
  const variants = {
    default: 'rounded-lg',
    rounded: 'rounded-xl',
    pill: 'rounded-2xl',
    square: 'rounded-none'
  }
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''
  
  const classes = `${baseClasses} ${variants[variant]} ${shadows[shadow]} ${hoverClasses} ${clickableClasses} ${className}`
  
  const cardContent = (
    <>
      {header && (
        <div className="border-b border-gray-200 pb-4 mb-4">
          {header}
        </div>
      )}
      <div className={paddings[padding]}>
        {children}
      </div>
      {footer && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          {footer}
        </div>
      )}
    </>
  )
  
  if (hover || onClick) {
    return (
      <motion.div
        className={classes}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        {...props}
      >
        {cardContent}
      </motion.div>
    )
  }
  
  return (
    <div className={classes} {...props}>
      {cardContent}
    </div>
  )
}

// Subcomponentes para mejor organización
Card.Header = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
    {children}
  </div>
)

Card.Body = ({ children, className = '', padding = 'md' }) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10'
  }
  
  return (
    <div className={`${paddings[padding]} ${className}`}>
      {children}
    </div>
  )
}

Card.Footer = ({ children, className = '' }) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
    {children}
  </div>
)

export default Card