import React, { useState, memo, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiMenu, 
  FiX, 
  FiUser, 
  FiHome,
  FiUsers,
  FiMessageSquare,
  FiFileText,
  FiBarChart,
  FiSettings,
  FiDollarSign,
  FiBookOpen,
  FiBook,
  FiClock,
  FiCalendar,
  FiCamera,
  FiUserPlus,
  FiChevronDown
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
import { ANIMATIONS } from '../../utils/constants'

// Importar subcomponentes optimizados
import NavigationItem from './header/NavigationItem'
import DropdownNavigation from './header/DropdownNavigation'
import NotificationButton from './header/NotificationButton'
import UserMenu from './header/UserMenu'

// Helper functions moved outside component to prevent recreation
const getNavigationItems = (rol) => {
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
        { 
          type: 'single',
          path: '/admin/dashboard', 
          icon: FiHome, 
          label: 'Dashboard'
        },
        {
          type: 'dropdown',
          id: 'gestion',
          icon: FiUsers,
          label: 'Gestión',
          items: [
            { path: '/admin/users', icon: FiUsers, label: 'Usuarios' },
            { path: '/admin/courses-management', icon: FiBook, label: 'Cursos y Secciones' },
            { path: '/admin/assignments', icon: FiUserPlus, label: 'Asignaciones' }
          ]
        },
        {
          type: 'dropdown',
          id: 'operaciones',
          icon: FiCalendar,
          label: 'Operaciones',
          items: [
            { path: '/admin/schedules', icon: FiCalendar, label: 'Horarios' },
            { path: '/asistencia', icon: FiClock, label: 'Asistencia' },
            { path: '/admin/communiques', icon: FiFileText, label: 'Comunicados' }
          ]
        },
        {
          type: 'dropdown',
          id: 'administracion',
          icon: FiDollarSign,
          label: 'Administración',
          items: [
            { path: '/admin/payments', icon: FiDollarSign, label: 'Pagos' },
            { path: '/admin/reports', icon: FiBarChart, label: 'Reportes' }
          ]
        },
        { 
          type: 'single',
          path: '/admin/configuration', 
          icon: FiSettings, 
          label: 'Config'
        }
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

// Memoized Logo component
const Logo = memo(() => (
  <div className="flex items-center space-x-2 xs:space-x-2.5 sm:space-x-3 lg:space-x-4 flex-shrink-0">
    <div className="flex-shrink-0">
      <img
        src="/logo-talentos.jpeg"
        alt="Talentos College"
        className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 2xl:h-18 2xl:w-18 object-contain rounded-lg shadow-sm"
      />
    </div>
    <div className="hidden xs:block">
      <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-talentos-primary whitespace-nowrap">
        <span className="hidden sm:inline">Talentos College</span>
        <span className="sm:hidden">Talentos</span>
      </h1>
    </div>
  </div>
))

// Memoized Mobile Menu component
const MobileMenu = memo(({ 
  menuOpen, 
  onClose, 
  navigationItems, 
  dropdownOpen, 
  onDropdownToggle, 
  onNavigate, 
  usuario, 
  rol 
}) => (
  <AnimatePresence>
    {menuOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ 
            type: 'spring', 
            stiffness: ANIMATIONS.SPRING_STIFFNESS, 
            damping: ANIMATIONS.SPRING_DAMPING 
          }}
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
                onClick={onClose}
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
              
              if (item.type === 'single' || !item.type) {
                const isActive = location.pathname === item.path
                
                return (
                  <button
                    key={item.path || item.id}
                    onClick={() => {
                      onNavigate(item.path)
                      onClose()
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
              }
              
              if (item.type === 'dropdown') {
                const isOpen = dropdownOpen === item.id
                const hasActiveChild = item.items?.some(child => location.pathname === child.path)
                
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => onDropdownToggle(isOpen ? null : item.id)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        hasActiveChild
                          ? 'text-talentos-primary bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pl-4 space-y-1 overflow-hidden"
                        >
                          {item.items?.map((subItem) => {
                            const SubIcon = subItem.icon
                            const isSubActive = location.pathname === subItem.path
                            
                            return (
                              <button
                                key={subItem.path}
                                onClick={() => {
                                  onNavigate(subItem.path)
                                  onClose()
                                  onDropdownToggle(null)
                                }}
                                className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                                  isSubActive
                                    ? 'text-white bg-talentos-primary'
                                    : 'text-gray-600 hover:text-talentos-primary hover:bg-gray-50'
                                }`}
                              >
                                <SubIcon className="w-4 h-4" />
                                <span>{subItem.label}</span>
                              </button>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              }
              
              return null
            })}
          </div>
          
          <div className="mx-4 my-3 border-t border-gray-200"></div>
          
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
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
))

const Header = memo(() => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [paymentNotificationsOpen, setPaymentNotificationsOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profileEditOpen, setProfileEditOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  
  const { usuario, rol, logout } = useAuthStore()
  const { notificacionesNoLeidas } = useNotificationsStore()
  const { getPagosVencidos, getProximosVencimientos } = usePaymentScheduleStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Memoized navigation items
  const navigationItems = useMemo(() => getNavigationItems(rol), [rol])
  
  // Memoized payment notifications count
  const paymentNotificationsCount = useMemo(() => {
    if (rol !== 'padre') return 0
    return getPagosVencidos(usuario?.email || '').length + 
           getProximosVencimientos(usuario?.email || '', 7).length
  }, [rol, usuario?.email, getPagosVencidos, getProximosVencimientos])
  
  // Handlers with useCallback
  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])
  
  const handleMenuToggle = useCallback(() => {
    setMenuOpen(prev => !prev)
  }, [])
  
  const handleMenuClose = useCallback(() => {
    setMenuOpen(false)
  }, [])
  
  const handleDropdownToggle = useCallback((id) => {
    setDropdownOpen(id)
  }, [])
  
  const handleNavigate = useCallback((path) => {
    navigate(path)
  }, [navigate])
  
  const handleProfileMenuToggle = useCallback((isOpen) => {
    setProfileMenuOpen(isOpen)
  }, [])
  
  const handleProfileEdit = useCallback((isOpen) => {
    setProfileEditOpen(isOpen)
  }, [])
  
  const handleChangePassword = useCallback((isOpen) => {
    setChangePasswordOpen(isOpen)
  }, [])
  
  const handleHelp = useCallback((isOpen) => {
    setHelpOpen(isOpen)
  }, [])
  
  const handlePaymentNotificationsToggle = useCallback(() => {
    setPaymentNotificationsOpen(prev => !prev)
  }, [])
  
  const handleNotificationsToggle = useCallback(() => {
    setNotificationsOpen(prev => !prev)
  }, [])
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-18 lg:h-20 xl:h-22 2xl:h-24">
          <Logo />
          
          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center justify-center flex-1 px-1 lg:px-2 xl:px-3">
            <div className="flex items-center space-x-0.5 md:space-x-0.5 lg:space-x-1 xl:space-x-1.5 bg-gray-50 rounded-2xl p-1 md:p-1 lg:p-1.5">
              {navigationItems.map((item) => {
                if (item.type === 'dropdown') {
                  return (
                    <DropdownNavigation
                      key={item.id}
                      item={item}
                      isOpen={dropdownOpen === item.id}
                      onToggle={handleDropdownToggle}
                    />
                  )
                }
                
                return (
                  <NavigationItem
                    key={item.path || item.id}
                    item={item}
                  />
                )
              })}
            </div>
          </nav>
          
          {/* Acciones del usuario */}
          <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-2.5 md:space-x-3 lg:space-x-3 xl:space-x-4 flex-shrink-0">
            {/* Notificaciones de pagos para padres */}
            {rol === 'padre' && (
              <NotificationButton
                type="payment"
                count={paymentNotificationsCount}
                onClick={handlePaymentNotificationsToggle}
                rol={rol}
              />
            )}
            
            {/* Notificaciones generales */}
            <NotificationButton
              type="general"
              count={notificacionesNoLeidas}
              onClick={handleNotificationsToggle}
              rol={rol}
            />
            
            {/* Menú de usuario */}
            <UserMenu
              usuario={usuario}
              rol={rol}
              isOpen={profileMenuOpen}
              onToggle={handleProfileMenuToggle}
              onProfileEdit={handleProfileEdit}
              onChangePassword={handleChangePassword}
              onHelp={handleHelp}
              onLogout={handleLogout}
            />
            
            {/* Botón menú móvil */}
            <button
              onClick={handleMenuToggle}
              className="md:hidden p-1.5 xs:p-2 sm:p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200 rounded-full hover:bg-gray-100"
            >
              {menuOpen ? 
                <FiX className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6" /> : 
                <FiMenu className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6" />
              }
            </button>
          </div>
        </div>
      </div>
      
      {/* Menú móvil */}
      <MobileMenu
        menuOpen={menuOpen}
        onClose={handleMenuClose}
        navigationItems={navigationItems}
        dropdownOpen={dropdownOpen}
        onDropdownToggle={handleDropdownToggle}
        onNavigate={handleNavigate}
        usuario={usuario}
        rol={rol}
      />
      
      {/* Modales */}
      <AnimatePresence>
        {paymentNotificationsOpen && (
          <PaymentNotifications
            padreEmail={usuario?.email || ''}
            onClose={() => setPaymentNotificationsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {notificationsOpen && (
          <NotificationCenter
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        )}
      </AnimatePresence>
      
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
})

Logo.displayName = 'Logo'
MobileMenu.displayName = 'MobileMenu'
Header.displayName = 'Header'

export default Header