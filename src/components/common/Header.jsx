import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiBell, 
  FiMenu, 
  FiX, 
  FiUser, 
  FiLogOut, 
  FiHome,
  FiUsers,
  FiMessageSquare,
  FiFileText,
  FiBarChart,
  FiSettings,
  FiDollarSign,
  FiBookOpen,
  FiList,
  FiClock,
  FiEdit,
  FiKey,
  FiHelpCircle,
  FiUserCheck,
  FiBook,
  FiCamera,
  FiMoreHorizontal,
  FiChevronDown,
  FiCalendar,
  FiUserPlus
} from 'react-icons/fi'
import useAuthStore from '../../stores/authStore'
import useNotificationsStore from '../../stores/notificationsStore'
import usePaymentScheduleStore from '../../stores/paymentScheduleStore'
import PaymentNotifications from '../payments/PaymentNotifications'
import ProfileEditModal from '../profile/ProfileEditModal'
import ChangePasswordModal from '../profile/ChangePasswordModal'
import HelpModal from '../profile/HelpModal'
import NotificationCenter from './NotificationCenter'
import { useNavigate, useLocation } from 'react-router-dom'
import { navItemHover, notificationSlide, badgePulse } from '../../utils/animations'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [paymentNotificationsOpen, setPaymentNotificationsOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profileEditOpen, setProfileEditOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const { usuario, rol, logout } = useAuthStore()
  const { notificaciones, notificacionesNoLeidas, marcarComoLeida } = useNotificationsStore()
  const { getPagosVencidos, getProximosVencimientos } = usePaymentScheduleStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  
  // Actualizar ancho de ventana
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Determinar cuántos items mostrar basado en el ancho de ventana
  const getVisibleItemsCount = () => {
    // Mostrar todos los items para evitar el botón "Más"
    return 10
  }
  
  // Obtener notificaciones de pagos para padres
  const paymentNotificationsCount = rol === 'padre' ? 
    getPagosVencidos(usuario?.email || '').length + getProximosVencimientos(usuario?.email || '', 7).length : 0
  
  const getNavigationItems = () => {
    switch (rol) {
      case 'padre':
        return [
          { path: '/parent/dashboard', icon: FiHome, label: 'Dashboard', priority: 1 },
          { path: '/parent/students', icon: FiUsers, label: 'Estudiantes', priority: 2 },
          { path: '/parent/attendance', icon: FiClock, label: 'Asistencia', priority: 3 },
          { path: '/parent/messages', icon: FiMessageSquare, label: 'Mensajes', priority: 4 },
          { path: '/parent/communiques', icon: FiFileText, label: 'Comunicados', priority: 5 },
          { path: '/parent/grades', icon: FiBarChart, label: 'Notas', priority: 6 },
          { path: '/parent/schedules', icon: FiCalendar, label: 'Horarios', priority: 7 },
          { path: '/parent/payments', icon: FiDollarSign, label: 'Pagos', priority: 8 }
        ]
      case 'tutor':
        return [
          { path: '/tutor/dashboard', icon: FiHome, label: 'Dashboard', priority: 1 },
          { path: '/tutor/courses', icon: FiBook, label: 'Mis Cursos', priority: 2 },
          { path: '/tutor/sections', icon: FiBookOpen, label: 'Mis Secciones', priority: 3 },
          { path: '/tutor/students', icon: FiUsers, label: 'Alumnos', priority: 4 },
          { path: '/tutor/schedules', icon: FiCalendar, label: 'Mi Horario', priority: 5 },
          { path: '/tutor/grades', icon: FiBarChart, label: 'Calificaciones', priority: 6 },
          { path: '/tutor/messages', icon: FiMessageSquare, label: 'Mensajes', priority: 7 },
          { path: '/tutor/communiques', icon: FiFileText, label: 'Comunicados', priority: 8 },
          { path: '/tutor/reports', icon: FiFileText, label: 'Reportes', priority: 9 }
        ]
      case 'admin':
        return [
          { path: '/admin/dashboard', icon: FiHome, label: 'Panel Principal', shortLabel: 'Dashboard', priority: 1 },
          { path: '/admin/users', icon: FiUsers, label: 'Gestión Usuarios', shortLabel: 'Usuarios', priority: 2 },
          { path: '/admin/courses-management', icon: FiBook, label: 'Cursos y Secciones', shortLabel: 'Cursos', priority: 3 },
          { path: '/admin/assignments', icon: FiUserPlus, label: 'Centro de Asignaciones', shortLabel: 'Asignaciones', priority: 4 },
          { path: '/admin/schedules', icon: FiCalendar, label: 'Gestión Horarios', shortLabel: 'Horarios', priority: 5 },
          { path: '/asistencia', icon: FiClock, label: 'Control Asistencia', shortLabel: 'Asistencia', priority: 5 },
          { path: '/admin/payments', icon: FiDollarSign, label: 'Gestión Pagos', shortLabel: 'Pagos', priority: 6 },
          { path: '/admin/communiques', icon: FiFileText, label: 'Comunicados', priority: 7 },
          { path: '/admin/reports', icon: FiBarChart, label: 'Reportes', priority: 8 },
          { path: '/admin/configuration', icon: FiSettings, label: 'Configuración', shortLabel: 'Config', priority: 9 }
        ]
      case 'entrada':
        return [
          { path: '/asistencia', icon: FiHome, label: 'Dashboard', priority: 1 },
          { path: '/asistencia/scanner', icon: FiCamera, label: 'Escáner QR', priority: 2 },
          { path: '/asistencia/historial', icon: FiClock, label: 'Historial', priority: 3 }
        ]
      default:
        return []
    }
  }
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  const handleNotificationClick = (notificacion) => {
    if (!notificacion.leida) {
      marcarComoLeida(notificacion.id)
    }
    setNotificationsOpen(false)
  }

  const getProfileOptions = () => {
    const commonOptions = [
      { 
        icon: FiEdit, 
        label: 'Editar Perfil', 
        action: () => {
          setProfileEditOpen(true)
          setProfileMenuOpen(false)
        }
      },
      { 
        icon: FiKey, 
        label: 'Cambiar Contraseña', 
        action: () => {
          setChangePasswordOpen(true)
          setProfileMenuOpen(false)
        }
      },
      { 
        icon: FiHelpCircle, 
        label: 'Ayuda', 
        action: () => {
          setHelpOpen(true)
          setProfileMenuOpen(false)
        }
      }
    ]

    if (rol === 'admin') {
      commonOptions.unshift({
        icon: FiSettings,
        label: 'Configuración',
        action: () => {
          // TODO: Crear página de configuración de administrador
          console.log('Abrir configuración de admin')
          setProfileMenuOpen(false)
        }
      })
    }

    return commonOptions
  }
  
  const navigationItems = getNavigationItems()
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-18 lg:h-20 xl:h-22 2xl:h-24">
          {/* Logo y título - Optimizado para todos los dispositivos */}
          <div className="flex items-center space-x-2 xs:space-x-2.5 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            <div className="flex-shrink-0">
              <img
                src="/logo-talentos.jpeg"
                alt="Talentos College"
                className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 2xl:h-18 2xl:w-18 object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="hidden xs:block">
              <h1 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-talentos-primary whitespace-nowrap">
                <span className="hidden sm:inline">Talentos College</span>
                <span className="sm:hidden">Talentos</span>
              </h1>
            </div>
          </div>
          
          {/* Navegación - RESPONSIVE SIN SCROLL */}
          <nav className="hidden md:flex items-center justify-center flex-1 px-1 lg:px-2 xl:px-3">
            <div className="flex items-center space-x-0.5 md:space-x-0.5 lg:space-x-1 xl:space-x-1.5 bg-gray-50 rounded-2xl p-1 md:p-1 lg:p-1.5">
              {/* Mostrar items principales basado en el tamaño de pantalla */}
              {navigationItems.slice(0, getVisibleItemsCount()).map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`group flex items-center gap-1 md:gap-1.5 px-2 md:px-2 lg:px-2.5 xl:px-3 py-2 md:py-2 lg:py-2.5 rounded-lg text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-base font-medium transition-all duration-200 relative ${
                      isActive
                        ? 'text-talentos-primary bg-white shadow-md border border-gray-100'
                        : 'text-gray-600 hover:text-talentos-primary hover:bg-white hover:shadow-sm hover:border hover:border-gray-100'
                    }`}
                    title={item.label}
                    {...navItemHover}
                  >
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-4.5 xl:h-4.5 flex-shrink-0" />
                    
                    {/* Sistema de texto adaptativo mejorado */}
                    <span className="font-medium whitespace-nowrap">
                      {/* Solo iconos en tablets medianos */}
                      <span className="hidden md:inline lg:hidden">
                        {/* Solo icono, sin texto */}
                      </span>
                      {/* Texto corto o completo según el espacio */}
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
              })}
              
            </div>
          </nav>
          
          {/* Acciones del usuario - Optimizadas para todos los dispositivos */}
          <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-2.5 md:space-x-3 lg:space-x-3 xl:space-x-4 flex-shrink-0">
            {/* Notificaciones de pagos (solo para padres) */}
            {rol === 'padre' && (
              <div className="relative">
                <button
                  onClick={() => setPaymentNotificationsOpen(true)}
                  className="relative p-1.5 xs:p-2 sm:p-2 md:p-2.5 lg:p-2.5 xl:p-3 text-gray-600 hover:text-talentos-primary transition-colors duration-200 rounded-full hover:bg-gray-100"
                  title="Notificaciones de pagos"
                >
                  <FiDollarSign className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-6 xl:h-6" />
                  {paymentNotificationsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 xs:-top-1 xs:-right-1 bg-red-500 text-white text-[10px] xs:text-xs sm:text-xs rounded-full w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 flex items-center justify-center font-medium border xs:border-2 border-white shadow-sm xs:shadow-lg"
                      {...badgePulse}
                    >
                      {paymentNotificationsCount > 9 ? '9+' : paymentNotificationsCount}
                    </motion.span>
                  )}
                </button>
              </div>
            )}
            
            {/* Notificaciones generales */}
            <div className="relative">
              <button
                onClick={() => {
                  if (rol === 'padre') {
                    navigate('/parent/notification-center')
                  } else {
                    setNotificationsOpen(!notificationsOpen)
                  }
                }}
                className="relative p-1.5 xs:p-2 sm:p-2 md:p-2.5 lg:p-2.5 xl:p-3 text-gray-600 hover:text-talentos-primary transition-colors duration-200 rounded-full hover:bg-gray-100 active:bg-gray-200"
                title={rol === 'padre' ? 'Ir al centro de notificaciones' : 'Ver notificaciones'}
              >
                <FiBell className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-6 xl:h-6" />
                {notificacionesNoLeidas > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 xs:-top-1 xs:-right-1 bg-red-500 text-white text-[10px] xs:text-xs sm:text-xs rounded-full w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 flex items-center justify-center font-bold border xs:border-2 border-white shadow-sm xs:shadow-lg"
                    {...badgePulse}
                  >
                    {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
                  </motion.span>
                )}
              </button>
            </div>
            
            {/* Información del usuario con menú desplegable */}
            <div className="relative flex items-center space-x-1.5 xs:space-x-2 sm:space-x-2.5 md:space-x-3">
              <div className="hidden sm:block md:block text-right">
                <p className="text-xs sm:text-sm md:text-sm lg:text-base xl:text-base font-medium text-gray-900 truncate max-w-24 xs:max-w-28 sm:max-w-32 md:max-w-36 lg:max-w-40 xl:max-w-48">{usuario?.nombre}</p>
                <p className="text-[10px] xs:text-xs sm:text-xs md:text-xs lg:text-sm text-gray-500 capitalize">{rol}</p>
              </div>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-8 h-8 xs:w-8.5 xs:h-8.5 sm:w-9 sm:h-9 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 bg-talentos-primary rounded-full flex items-center justify-center hover:bg-talentos-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-talentos-accent focus:ring-offset-2 shadow-sm"
              >
                <FiUser className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 text-white" />
              </button>

              {/* Menú desplegable del perfil */}
              <AnimatePresence>
                {profileMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setProfileMenuOpen(false)}
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
                      {getProfileOptions().map((option, index) => {
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
                        onClick={() => {
                          handleLogout()
                          setProfileMenuOpen(false)
                        }}
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
            
            {/* Menú móvil y tablets */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1.5 xs:p-2 sm:p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200 rounded-full hover:bg-gray-100"
            >
              {menuOpen ? <FiX className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6" /> : <FiMenu className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Menú móvil con backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop - se cierra al hacer click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Menú móvil - Panel deslizante */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 xs:w-72 sm:w-80 bg-white shadow-xl z-50 overflow-y-auto"
            >
              {/* Header del menú */}
              <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/logo-talentos.jpeg"
                      alt="Talentos College"
                      className="h-10 w-10 rounded-lg"
                    />
                    <div>
                      <h2 className="text-white font-semibold">Talentos College</h2>
                      <p className="text-white/80 text-xs capitalize">{rol}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 text-white/80 hover:text-white transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Items del menú */}
              <div className="px-2 pt-4 pb-3 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path)
                        setMenuOpen(false)
                      }}
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-white bg-talentos-primary shadow-md'
                          : 'text-gray-700 hover:text-talentos-primary hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
              
              {/* Separador */}
              <div className="mx-4 my-3 border-t border-gray-200"></div>
              
              {/* Información del usuario */}
              <div className="px-4 pb-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-talentos-primary rounded-full flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{usuario?.nombre}</p>
                    <p className="text-xs text-gray-500">{usuario?.email}</p>
                  </div>
                </div>
                
                {/* Botón cerrar sesión */}
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuOpen(false)
                  }}
                  className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Modal de notificaciones de pagos */}
      <AnimatePresence>
        {paymentNotificationsOpen && (
          <PaymentNotifications
            padreEmail={usuario?.email || ''}
            onClose={() => setPaymentNotificationsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Centro de Notificaciones Mejorado */}
      <AnimatePresence>
        {notificationsOpen && (
          <NotificationCenter
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Modales de perfil */}
      <ProfileEditModal 
        isOpen={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
      />
      
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
      
      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </header>
  )
}

export default Header