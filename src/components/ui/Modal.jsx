import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { ANIMATIONS, Z_INDEX } from '../../utils/constants'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  header,
  footer,
  ...props
}) => {
  const sizes = {
    xs: 'max-w-sm',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  }
  
  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])
  
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            style={{ zIndex: Z_INDEX.MODAL }}
            onClick={handleBackdropClick}
          />
          
          {/* Modal */}
          <div 
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: Z_INDEX.MODAL + 1 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: 'spring', 
                stiffness: ANIMATIONS.SPRING_STIFFNESS, 
                damping: ANIMATIONS.SPRING_DAMPING 
              }}
              className={`bg-white rounded-xl shadow-xl w-full ${sizes[size]} ${className} overflow-hidden`}
              {...props}
            >
              {/* Header */}
              {(title || header || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex-1">
                    {header || (
                      <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                      </h3>
                    )}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="ml-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                    >
                      <FiX size={20} />
                    </button>
                  )}
                </div>
              )}
              
              {/* Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {children}
              </div>
              
              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// Subcomponentes para mejor organización
Modal.Header = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-gray-200 ${className}`}>
    {children}
  </div>
)

Modal.Body = ({ children, className = '' }) => (
  <div className={`p-6 max-h-[70vh] overflow-y-auto ${className}`}>
    {children}
  </div>
)

Modal.Footer = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${className}`}>
    {children}
  </div>
)

export default Modal