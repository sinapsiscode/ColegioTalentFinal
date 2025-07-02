import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  FiBell,
  FiAlertTriangle,
  FiClock,
  FiX,
  FiDollarSign,
  FiCalendar,
  FiCreditCard,
  FiEye,
  FiEyeOff
} from 'react-icons/fi'
import usePaymentScheduleStore from '../../stores/paymentScheduleStore'

const PaymentNotifications = ({ padreEmail, onClose }) => {
  const {
    getPagosPendientes,
    getPagosVencidos,
    getProximosVencimientos
  } = usePaymentScheduleStore()

  const [notificationsRead, setNotificationsRead] = useState(new Set())
  const [filterType, setFilterType] = useState('todos')

  const pagosVencidos = getPagosVencidos(padreEmail)
  const proximosVencimientos = getProximosVencimientos(padreEmail, 7)
  const pagosPendientes = getPagosPendientes(padreEmail)

  const allNotifications = [
    ...pagosVencidos.map(pago => ({
      ...pago,
      type: 'vencido',
      priority: 'high',
      title: `Pago vencido - ${pago.mes}`,
      message: `La pensión de ${pago.nombreEstudiante} venció el ${format(new Date(pago.fechaVencimiento), 'dd/MM/yyyy')}`,
      icon: FiAlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    })),
    ...proximosVencimientos.map(pago => ({
      ...pago,
      type: 'proximo',
      priority: 'medium',
      title: `Próximo vencimiento - ${pago.mes}`,
      message: `La pensión de ${pago.nombreEstudiante} vence en ${pago.diasRestantes} día${pago.diasRestantes > 1 ? 's' : ''}`,
      icon: FiClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }))
  ].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  const filteredNotifications = allNotifications.filter(notification => {
    if (filterType === 'todos') return true
    return notification.type === filterType
  })

  const unreadCount = filteredNotifications.filter(n => !notificationsRead.has(n.estudianteId + n.mes)).length

  const markAsRead = (notificationId) => {
    setNotificationsRead(prev => new Set([...prev, notificationId]))
  }

  const markAllAsRead = () => {
    const allIds = allNotifications.map(n => n.estudianteId + n.mes)
    setNotificationsRead(new Set(allIds))
  }

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto)
  }

  const getUrgencyLevel = (type, diasRestantes) => {
    if (type === 'vencido') return 'Urgente'
    if (diasRestantes <= 3) return 'Muy urgente'
    if (diasRestantes <= 7) return 'Urgente'
    return 'Moderado'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-talentos-primary to-talentos-secondary text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FiBell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">Notificaciones de Pagos</h2>
                <p className="text-sm opacity-90">
                  {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Filtros y acciones */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-sm text-white placeholder-white/70"
              >
                <option value="todos" className="text-gray-900">Todas</option>
                <option value="vencido" className="text-gray-900">Vencidas</option>
                <option value="proximo" className="text-gray-900">Próximas</option>
              </select>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors"
              >
                <FiEye className="w-4 h-4" />
                <span>Marcar todas como leídas</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto max-h-96">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                <FiBell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay notificaciones
                </h3>
                <p className="text-gray-600">
                  {filterType === 'todos' 
                    ? 'No tienes notificaciones pendientes'
                    : `No hay notificaciones de tipo "${filterType}"`
                  }
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const notificationId = notification.estudianteId + notification.mes
                const isRead = notificationsRead.has(notificationId)
                const Icon = notification.icon

                return (
                  <motion.div
                    key={notificationId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      !isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Ícono y estado */}
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.bgColor} ${notification.borderColor} border`}>
                          <Icon className={`w-5 h-5 ${notification.color}`} />
                        </div>
                        {!isRead && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notification.type === 'vencido' 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getUrgencyLevel(notification.type, notification.diasRestantes)}
                            </span>
                            
                            {!isRead && (
                              <button
                                onClick={() => markAsRead(notificationId)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Marcar como leída"
                              >
                                <FiEyeOff className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Detalles del pago */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FiDollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              {formatearMonto(notification.monto)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <FiCalendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              {format(new Date(notification.fechaVencimiento), 'dd/MM/yyyy')}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <FiCreditCard className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              {notification.nombreEstudiante}
                            </span>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center space-x-3 mt-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-1 bg-talentos-primary text-white px-3 py-1 rounded-lg text-sm hover:bg-talentos-primary/90 transition-colors"
                          >
                            <FiCreditCard className="w-3 h-3" />
                            <span>Pagar ahora</span>
                          </motion.button>
                          
                          <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm">
                            <FiEye className="w-3 h-3" />
                            <span>Ver detalles</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* Footer con resumen */}
        {allNotifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Pagos vencidos</p>
                <p className="text-lg font-semibold text-red-600">{pagosVencidos.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Próximos vencimientos</p>
                <p className="text-lg font-semibold text-yellow-600">{proximosVencimientos.length}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default PaymentNotifications