import React from 'react'
import { motion } from 'framer-motion'
import { buttonPress } from '../../utils/animations'

const AnimatedButton = ({ 
  children, 
  className = "", 
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon,
  ...props 
}) => {
  const baseClasses = "font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
  
  const variants = {
    primary: "bg-talentos-primary hover:bg-talentos-dark text-white focus:ring-talentos-accent",
    secondary: "bg-talentos-secondary hover:bg-talentos-primary text-white focus:ring-talentos-accent",
    outline: "border border-talentos-primary text-talentos-primary hover:bg-talentos-primary hover:text-white focus:ring-talentos-accent",
    ghost: "text-talentos-primary hover:bg-talentos-light focus:ring-talentos-accent",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  }
  
  const combinedClass = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <motion.button
      className={combinedClass}
      disabled={disabled || loading}
      {...(disabled || loading ? {} : buttonPress)}
      {...props}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {Icon && !loading && <Icon className="w-4 h-4" />}
      {children && <span>{children}</span>}
    </motion.button>
  )
}

export default AnimatedButton