import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../../utils/animations'

const PageTransition = ({ children, className = "" }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        {...pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition