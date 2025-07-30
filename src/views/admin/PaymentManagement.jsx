import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiDollarSign,
  FiList,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiBarChart,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiDownload,
  FiPrinter
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import PageTransition from '../../components/common/PageTransition'
import AnimatedButton from '../../components/common/AnimatedButton'
import CountUpNumber from '../../components/common/CountUpNumber'
import usePaymentsStore from '../../stores/paymentsStore'
import usePaymentConceptsStore from '../../stores/paymentConceptsStore'
import { showSuccess, showError } from '../../utils/sweetAlert'

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState('payments')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  const { pagos } = usePaymentsStore()
  const { concepts } = usePaymentConceptsStore()

  // Calcular estadísticas manualmente
  const calculateStats = () => {
    // Verificar que pagos y concepts estén definidos
    const pagosList = pagos || []
    const conceptsList = concepts || []
    
    const totalCollected = pagosList
      .filter(p => p?.estado === 'aprobado')
      .reduce((sum, p) => sum + (p?.monto || 0), 0)
    
    const pendingPayments = pagosList.filter(p => 
      p?.estado === 'pendiente' || p?.estado === 'pendiente_pago'
    ).length
    
    const overduePayments = pagosList.filter(p => {
      if (!p || p.estado === 'aprobado') return false
      const vencimiento = p.fechaVencimiento ? new Date(p.fechaVencimiento) : null
      return vencimiento && vencimiento < new Date()
    }).length
    
    const activeConcepts = conceptsList.filter(c => c?.isActive).length
    
    return {
      totalCollected,
      pendingPayments,
      overduePayments,
      totalConcepts: conceptsList.length,
      activeConcepts,
      monthlyGrowth: 15.3 // Ejemplo
    }
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <PageTransition>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Pagos
            </h1>
            <p className="text-gray-600">
              Administra pagos, conceptos y seguimiento financiero
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Recaudado</h3>
                <FiDollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-500">S/</span>
                <CountUpNumber 
                  value={stats.totalCollected} 
                  className="text-2xl font-bold text-gray-900"
                  decimals={2}
                />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <FiTrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600">+{stats.monthlyGrowth}% este mes</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Pendientes</h3>
                <FiClock className="w-5 h-5 text-yellow-500" />
              </div>
              <CountUpNumber value={stats.pendingPayments} className="text-2xl font-bold text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Pagos por cobrar</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Vencidos</h3>
                <FiAlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <CountUpNumber value={stats.overduePayments} className="text-2xl font-bold text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Conceptos</h3>
                <FiList className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <CountUpNumber value={stats.activeConcepts} className="text-2xl font-bold text-gray-900" />
                <span className="text-sm text-gray-500">/ {stats.totalConcepts}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Conceptos activos</p>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`py-3 px-6 text-sm font-medium transition-colors ${
                    activeTab === 'payments'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4" />
                    Gestión de Pagos
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('concepts')}
                  className={`py-3 px-6 text-sm font-medium transition-colors ${
                    activeTab === 'concepts'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiList className="w-4 h-4" />
                    Conceptos de Pago
                  </div>
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'payments' ? (
                <>
                  {/* Toolbar de Pagos */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar por estudiante, concepto o monto..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="paid">Pagados</option>
                      <option value="pending">Pendientes</option>
                      <option value="overdue">Vencidos</option>
                    </select>

                    <div className="flex gap-2">
                      <AnimatedButton
                        variant="secondary"
                        icon={FiDownload}
                        size="sm"
                      >
                        Exportar
                      </AnimatedButton>
                      <AnimatedButton
                        variant="secondary"
                        icon={FiPrinter}
                        size="sm"
                      >
                        Imprimir
                      </AnimatedButton>
                    </div>
                  </div>

                  {/* Contenido de Pagos */}
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <FiDollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">
                      Esta sección mostrará el listado completo de pagos registrados
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Podrás ver el historial, registrar nuevos pagos y generar reportes
                    </p>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-blue-50 rounded-lg p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiPlus className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Registrar Pago</h4>
                          <p className="text-sm text-gray-600">Nuevo pago manual</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-green-50 rounded-lg p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FiCalendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Programar Cobros</h4>
                          <p className="text-sm text-gray-600">Gestionar vencimientos</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-purple-50 rounded-lg p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FiBarChart className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Ver Reportes</h4>
                          <p className="text-sm text-gray-600">Análisis financiero</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </>
              ) : (
                <>
                  {/* Toolbar de Conceptos */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar conceptos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <AnimatedButton
                      variant="primary"
                      icon={FiPlus}
                      onClick={() => {
                        // Abrir modal de crear concepto
                        showSuccess('Función en desarrollo', 'Pronto podrás crear nuevos conceptos')
                      }}
                    >
                      Nuevo Concepto
                    </AnimatedButton>
                  </div>

                  {/* Lista de Conceptos */}
                  <div className="space-y-4">
                    {concepts.map((concept, index) => (
                      <motion.div
                        key={concept.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              concept.isActive ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <FiList className={`w-5 h-5 ${
                                concept.isActive ? 'text-green-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{concept.name}</h4>
                              <p className="text-sm text-gray-500">{concept.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">S/ {concept.amount.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">{concept.frequency}</p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => showSuccess('Función en desarrollo', 'Pronto podrás editar conceptos')}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => showError('Función en desarrollo', 'Pronto podrás eliminar conceptos')}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {concept.isActive && (
                          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              Aplicado a: {concept.appliedToGrades?.join(', ') || 'Todos los grados'}
                            </span>
                            <span className="text-green-600 font-medium">Activo</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {concepts.length === 0 && (
                    <div className="text-center py-12">
                      <FiList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No hay conceptos de pago registrados</p>
                      <p className="text-sm text-gray-400 mt-1">Crea tu primer concepto para comenzar</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </PageTransition>
    </div>
  )
}

export default PaymentManagement