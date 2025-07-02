import React from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../utils/animations'

const StaggeredList = ({ children, className = "", delay = 0.1 }) => {
  const containerVariants = {
    ...staggerContainer,
    animate: {
      transition: {
        staggerChildren: delay
      }
    }
  }
  
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={staggerItem}
          transition={{ duration: 0.3 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

export default StaggeredList