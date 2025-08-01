import React, { memo, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiEdit, FiKey, FiHelpCircle, FiSettings, FiLogOut } from 'react-icons/fi'

const UserMenu = memo(({ 
  usuario, 
  rol, 
  isOpen, 
  onToggle, 
  onProfileEdit, 
  onChangePassword, 
  onHelp, 
  onLogout 
}) => {
  const handleToggle = useCallback(() => {
    onToggle(!isOpen)
  }, [onToggle, isOpen])
  
  const handleProfileEdit = useCallback(() => {
    onProfileEdit(true)
    onToggle(false)
  }, [onProfileEdit, onToggle])
  
  const handleChangePassword = useCallback(() => {
    onChangePassword(true)
    onToggle(false)
  }, [onChangePassword, onToggle])
  
  const handleHelp = useCallback(() => {
    onHelp(true)
    onToggle(false)
  }, [onHelp, onToggle])
  
  const handleLogout = useCallback(() => {
    onLogout()
    onToggle(false)
  }, [onLogout, onToggle])
  
  const profileOptions = useMemo(() => {
    const commonOptions = [
      { 
        icon: FiEdit, 
        label: 'Editar Perfil', 
        action: handleProfileEdit
      },
      { 
        icon: FiKey, 
        label: 'Cambiar Contraseña', 
        action: handleChangePassword
      },
      { 
        icon: FiHelpCircle, 
        label: 'Ayuda', 
        action: handleHelp
      }
    ]

    if (rol === 'admin') {
      commonOptions.unshift({
        icon: FiSettings,
        label: 'Configuración',
        action: () => {
          console.log('Abrir configuración de admin')
          onToggle(false)
        }
      })
    }

    return commonOptions
  }, [rol, handleProfileEdit, handleChangePassword, handleHelp, onToggle])
  
  return (
    <div className="relative flex items-center space-x-1.5 xs:space-x-2 sm:space-x-2.5 md:space-x-3">
      <div className="hidden sm:block md:block text-right">
        <p className="text-sm sm:text-base md:text-base lg:text-lg xl:text-lg font-medium text-gray-900 truncate max-w-24 xs:max-w-28 sm:max-w-32 md:max-w-36 lg:max-w-40 xl:max-w-48">
          {usuario?.nombre}
        </p>
        <p className="text-xs xs:text-sm sm:text-sm md:text-sm lg:text-base text-gray-500 capitalize">
          {rol}
        </p>
      </div>
      
      <button
        onClick={handleToggle}
        className="w-8 h-8 xs:w-8.5 xs:h-8.5 sm:w-9 sm:h-9 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 bg-talentos-primary rounded-full flex items-center justify-center hover:bg-talentos-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-talentos-accent focus:ring-offset-2 shadow-sm"
      >
        <FiUser className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 text-white" />
      </button>

      {/* Menú desplegable del perfil */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-30"
              onClick={() => onToggle(false)}
            />
            
            {/* Menú */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 lg:w-56 xl:w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-40"
            >
              {/* Información del usuario en móvil */}
              <div className="md:hidden px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{usuario?.nombre}</p>
                <p className="text-xs text-gray-500 capitalize">{rol}</p>
              </div>

              {/* Opciones del menú */}
              {profileOptions.map((option, index) => {
                const Icon = option.icon
                return (
                  <button
                    key={index}
                    onClick={option.action}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 lg:py-3 text-sm lg:text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>{option.label}</span>
                  </button>
                )
              })}
              
              {/* Separador */}
              <div className="border-t border-gray-100 my-1"></div>
              
              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2.5 lg:py-3 text-sm lg:text-base text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <FiLogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
})

UserMenu.displayName = 'UserMenu'

export default UserMenu