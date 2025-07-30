import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiSettings,
  FiHome,
  FiUsers,
  FiBell,
  FiDollarSign,
  FiClock,
  FiShield,
  FiDatabase,
  FiSave,
  FiRefreshCw
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import PageTransition from '../../components/common/PageTransition'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import { showInfo, showSuccess } from '../../utils/sweetAlert'

const Configuration = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)

  // Tabs de configuración
  const configTabs = [
    { id: 'general', label: 'General', icon: FiHome },
    { id: 'notifications', label: 'Notificaciones', icon: FiBell },
    { id: 'payments', label: 'Pagos', icon: FiDollarSign },
    { id: 'attendance', label: 'Asistencia', icon: FiClock }
  ]

  const handleSave = () => {
    setLoading(true)
    // Simulación de guardado
    setTimeout(() => {
      setLoading(false)
      showSuccess('Configuración guardada', 'Los cambios se aplicarán en el próximo inicio de sesión')
    }, 1500)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Colegio
                </label>
                <input
                  type="text"
                  defaultValue="Talentos College"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  placeholder="Nombre de la institución"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año Escolar Actual
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent">
                  <option>2024</option>
                  <option>2025</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Director(a)
                </label>
                <input
                  type="text"
                  defaultValue="Dra. María González"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono Principal
                </label>
                <input
                  type="tel"
                  defaultValue="+51 999 123 456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  defaultValue="Av. Educación 123, Lima, Perú"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )


      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Notificaciones</h3>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Canales de Notificación</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Notificaciones en la aplicación</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Correo electrónico</span>
                  </label>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Tipos de Notificaciones</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Nuevos comunicados</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Mensajes de tutores</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Recordatorios de pago</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Alertas de asistencia</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 'payments':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Pagos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Día de vencimiento mensual
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>5 de cada mes</option>
                  <option>10 de cada mes</option>
                  <option>15 de cada mes</option>
                  <option>20 de cada mes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de gracia
                </label>
                <input
                  type="number"
                  defaultValue="5"
                  min="0"
                  max="30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interés por mora (%)
                </label>
                <input
                  type="number"
                  defaultValue="2"
                  min="0"
                  max="10"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recordatorios automáticos
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>3 días antes</option>
                  <option>5 días antes</option>
                  <option>7 días antes</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'attendance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Asistencia</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de entrada
                </label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tolerancia tardanza (minutos)
                </label>
                <input
                  type="number"
                  defaultValue="15"
                  min="0"
                  max="60"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de salida
                </label>
                <input
                  type="time"
                  defaultValue="15:00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días hábiles
                </label>
                <div className="space-y-1">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(dia => (
                    <label key={dia} className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm">{dia}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )



      default:
        return null
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
            <p className="text-gray-600 mt-2">
              Administra las opciones y parámetros generales de la plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar con tabs */}
            <div className="lg:col-span-1">
              <AnimatedCard>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Categorías</h3>
                  <nav className="space-y-1">
                    {configTabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <motion.button
                          key={tab.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            activeTab === tab.id
                              ? 'bg-talentos-primary text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{tab.label}</span>
                        </motion.button>
                      )
                    })}
                  </nav>
                </div>
              </AnimatedCard>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-3">
              <AnimatedCard>
                <div className="p-6">
                  {renderTabContent()}
                  
                  {/* Botones de acción */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                    <AnimatedButton
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      Cancelar
                    </AnimatedButton>
                    
                    <AnimatedButton
                      variant="primary"
                      icon={FiSave}
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </AnimatedButton>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>

          {/* Nota informativa */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <FiSettings className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900">Nota importante</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Esta es una vista de demostración. Las configuraciones se aplicarán cuando 
                  el sistema esté conectado al backend. Los cambios actuales no se persistirán.
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  )
}

export default Configuration