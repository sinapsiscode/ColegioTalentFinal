import React, { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiBell, FiDollarSign } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { badgePulse } from '../../../utils/animations'

const NotificationBadge = memo(({ count }) => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="absolute -top-0.5 -right-0.5 xs:-top-1 xs:-right-1 bg-red-500 text-white text-[10px] xs:text-xs sm:text-xs rounded-full w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 flex items-center justify-center font-bold border xs:border-2 border-white shadow-sm xs:shadow-lg"
    {...badgePulse}
  >
    {count > 9 ? '9+' : count}
  </motion.span>
))

const NotificationButton = memo(({ 
  type = 'general', 
  count = 0, 
  onClick, 
  rol,
  title 
}) => {
  const navigate = useNavigate()
  
  const handleClick = useCallback(() => {
    if (type === 'general' && rol === 'padre') {
      navigate('/parent/notification-center')
    } else if (onClick) {
      onClick()
    }
  }, [type, rol, navigate, onClick])
  
  const Icon = type === 'payment' ? FiDollarSign : FiBell
  const buttonTitle = title || (type === 'payment' ? 'Notificaciones de pagos' : 
    rol === 'padre' ? 'Ir al centro de notificaciones' : 'Ver notificaciones')
  
  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="relative p-1.5 xs:p-2 sm:p-2 md:p-2.5 lg:p-2.5 xl:p-3 text-gray-600 hover:text-talentos-primary transition-colors duration-200 rounded-full hover:bg-gray-100 active:bg-gray-200"
        title={buttonTitle}
      >
        <Icon className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-6 xl:h-6" />
        {count > 0 && <NotificationBadge count={count} />}
      </button>
    </div>
  )
})

NotificationBadge.displayName = 'NotificationBadge'
NotificationButton.displayName = 'NotificationButton'

export default NotificationButton