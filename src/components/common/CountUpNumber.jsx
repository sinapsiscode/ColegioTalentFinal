import React, { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

const CountUpNumber = ({ 
  value, 
  duration = 2, 
  className = "",
  suffix = "",
  prefix = ""
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (current) => Math.round(current))
  
  useEffect(() => {
    setIsVisible(true)
    spring.set(value)
  }, [spring, value])
  
  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  )
}

export default CountUpNumber