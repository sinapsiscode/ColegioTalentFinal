import React from 'react'
import { motion } from 'framer-motion'
import { cardHover } from '../../utils/animations'

const AnimatedCard = ({ 
  children, 
  className = "", 
  onClick,
  delay = 0,
  hover = true,
  ...props 
}) => {
  const baseClass = "card bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
  const combinedClass = `${baseClass} ${className}`
  
  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.3 },
    ...(hover ? cardHover : {}),
    ...(onClick ? { 
      style: { cursor: 'pointer' },
      onClick
    } : {}),
    ...props
  }
  
  return (
    <motion.div
      className={combinedClass}
      {...animationProps}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedCard