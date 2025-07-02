import React, { useState } from 'react'
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
  FiList
} from 'react-icons/fi'
import useAuthStore from '../../stores/authStore'
import useNotificationsStore from '../../stores/notificationsStore'
import usePaymentScheduleStore from '../../stores/paymentScheduleStore'
import PaymentNotifications from '../payments/PaymentNotifications'
import { useNavigate, useLocation } from 'react-router-dom'
import { navItemHover, notificationSlide, badgePulse } from '../../utils/animations'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [paymentNotificationsOpen, setPaymentNotificationsOpen] = useState(false)
  const { usuario, rol, logout } = useAuthStore()
  const { notificaciones, notificacionesNoLeidas, marcarComoLeida } = useNotificationsStore()
  const { getPagosVencidos, getProximosVencimientos } = usePaymentScheduleStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Obtener notificaciones de pagos para padres
  const paymentNotificationsCount = rol === 'padre' ? 
    getPagosVencidos(usuario?.email || '').length + getProximosVencimientos(usuario?.email || '', 7).length : 0
  
  const getNavigationItems = () => {
    switch (rol) {
      case 'padre':
        return [
          { path: '/parent/dashboard', icon: FiHome, label: 'Dashboard' },
          { path: '/parent/attendance', icon: FiUsers, label: 'Asistencia' },
          { path: '/parent/messages', icon: FiMessageSquare, label: 'Mensajes' },
          { path: '/parent/communiques', icon: FiFileText, label: 'Comunicados' },
          { path: '/parent/grades', icon: FiBarChart, label: 'Notas' },
          { path: '/parent/payments', icon: FiDollarSign, label: 'Pagos' }
        ]
      case 'tutor':
        return [
          { path: '/tutor/dashboard', icon: FiHome, label: 'Dashboard' },
          { path: '/tutor/students', icon: FiUsers, label: 'Alumnos' },
          { path: '/tutor/messages', icon: FiMessageSquare, label: 'Mensajes' },
          { path: '/tutor/communiques', icon: FiFileText, label: 'Comunicados' }
        ]
      case 'admin':
        return [
          { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
          { path: '/admin/reports', icon: FiBarChart, label: 'Reportes' },
          { path: '/admin/users', icon: FiUsers, label: 'Usuarios' },
          { path: '/admin/communiques', icon: FiFileText, label: 'Comunicados' },
          { path: '/admin/payments', icon: FiDollarSign, label: 'Pagos' },
          { path: '/admin/payment-concepts', icon: FiList, label: 'Conceptos' }
        ]
      case 'entrada':
        return [
          { path: '/scanner/dashboard', icon: FiHome, label: 'Escáner QR' }
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
  
  const navigationItems = getNavigationItems()
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-talentos-primary">
                Talentos College
              </h1>
            </div>
          </div>
          
          {/* Navegación desktop */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-talentos-primary bg-talentos-light'
                      : 'text-gray-600 hover:text-talentos-primary hover:bg-gray-50'
                  }`}
                  {...navItemHover}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.button>
              )
            })}
          </nav>
          
          {/* Acciones del usuario */}
          <div className="flex items-center space-x-4">
            {/* Notificaciones de pagos (solo para padres) */}
            {rol === 'padre' && (
              <div className="relative">
                <button
                  onClick={() => setPaymentNotificationsOpen(true)}
                  className="relative p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
                  title="Notificaciones de pagos"
                >
                  <FiDollarSign className="w-6 h-6" />
                  {paymentNotificationsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
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
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
              >
                <FiBell className="w-6 h-6" />
                {notificacionesNoLeidas > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                    {...badgePulse}
                  >
                    {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
                  </motion.span>
                )}
              </button>
              
              {/* Panel de notificaciones */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    {...notificationSlide}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notificaciones.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No hay notificaciones
                      </div>
                    ) : (
                      notificaciones.slice(0, 5).map((notificacion) => (
                        <motion.div
                          key={notificacion.id}
                          whileHover={{ backgroundColor: '#f9fafb' }}
                          onClick={() => handleNotificationClick(notificacion)}
                          className={`p-4 border-b border-gray-100 cursor-pointer ${
                            !notificacion.leida ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{notificacion.icono}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {notificacion.titulo}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {notificacion.mensaje}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notificacion.fecha.toLocaleTimeString()}
                              </p>
                            </div>
                            {!notificacion.leida && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Información del usuario */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{usuario?.nombre}</p>
                <p className="text-xs text-gray-500 capitalize">{rol}</p>
              </div>
              <div className="w-8 h-8 bg-talentos-primary rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
              title="Cerrar sesión"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
            
            {/* Menú móvil */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
            >
              {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Menú móvil */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
          <div className="px-2 pt-2 pb-3 space-y-1">
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
                  className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-talentos-primary bg-talentos-light'
                      : 'text-gray-600 hover:text-talentos-primary hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
          </motion.div>
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
    </header>
  )
}

export default Header