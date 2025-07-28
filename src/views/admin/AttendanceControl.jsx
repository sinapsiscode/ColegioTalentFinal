import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiClock,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiBarChart,
  FiCamera,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header'
import PageTransition from '../../components/common/PageTransition'
import AnimatedButton from '../../components/common/AnimatedButton'
import CountUpNumber from '../../components/common/CountUpNumber'

const AttendanceControl = () => {
  const [activeTab, setActiveTab] = useState('students')
  const navigate = useNavigate()

  // Estadísticas de ejemplo
  const stats = {
    students: {
      total: 1250,
      present: 1180,
      absent: 70,
      percentage: 94.4
    },
    tutors: {
      total: 45,
      present: 42,
      absent: 3,
      percentage: 93.3
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <PageTransition>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Control de Asistencia
            </h1>
            <p className="text-gray-600">
              Gestiona y monitorea la asistencia de estudiantes y tutores
            </p>
          </div>

          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Estudiantes</h3>
                <FiUsers className="w-5 h-5 text-blue-500" />
              </div>
              <CountUpNumber value={stats.students.total} className="text-2xl font-bold text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">Registrados hoy</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Asistencia Estudiantes</h3>
                <FiCheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <CountUpNumber value={stats.students.percentage} decimals={1} suffix="%" className="text-2xl font-bold text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">{stats.students.present} presentes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Tutores</h3>
                <FiUserCheck className="w-5 h-5 text-purple-500" />
              </div>
              <CountUpNumber value={stats.tutors.total} className="text-2xl font-bold text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">En el sistema</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Asistencia Tutores</h3>
                <FiCheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <CountUpNumber value={stats.tutors.percentage} decimals={1} suffix="%" className="text-2xl font-bold text-gray-900" />
              <p className="text-xs text-gray-500 mt-1">{stats.tutors.present} presentes</p>
            </motion.div>
          </div>

          {/* Tabs y contenido */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('students')}
                  className={`py-3 px-6 text-sm font-medium transition-colors ${
                    activeTab === 'students'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiUsers className="w-4 h-4" />
                    Asistencia de Estudiantes
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('tutors')}
                  className={`py-3 px-6 text-sm font-medium transition-colors ${
                    activeTab === 'tutors'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiUserCheck className="w-4 h-4" />
                    Asistencia de Tutores
                  </div>
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'students' ? (
                <div className="space-y-6">
                  {/* Acciones rápidas para estudiantes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/asistencia/scanner')}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 cursor-pointer"
                    >
                      <FiCamera className="w-8 h-8 mb-3" />
                      <h3 className="text-lg font-semibold mb-1">Escanear QR</h3>
                      <p className="text-sm opacity-90">Registrar entrada/salida de estudiantes</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/admin/attendance-register')}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 cursor-pointer"
                    >
                      <FiCalendar className="w-8 h-8 mb-3" />
                      <h3 className="text-lg font-semibold mb-1">Registro Manual</h3>
                      <p className="text-sm opacity-90">Tomar asistencia por aula</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/admin/attendance-dashboard')}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 cursor-pointer"
                    >
                      <FiBarChart className="w-8 h-8 mb-3" />
                      <h3 className="text-lg font-semibold mb-1">Dashboard</h3>
                      <p className="text-sm opacity-90">Ver estadísticas detalladas</p>
                    </motion.div>
                  </div>

                  {/* Resumen del día */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Hoy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FiCheckCircle className="w-6 h-6 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold text-green-900">{stats.students.present}</p>
                            <p className="text-sm text-green-700">Presentes</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FiXCircle className="w-6 h-6 text-red-500" />
                          <div>
                            <p className="text-2xl font-bold text-red-900">{stats.students.absent}</p>
                            <p className="text-sm text-red-700">Ausentes</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FiAlertCircle className="w-6 h-6 text-yellow-500" />
                          <div>
                            <p className="text-2xl font-bold text-yellow-900">15</p>
                            <p className="text-sm text-yellow-700">Tardanzas</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FiClock className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold text-blue-900">8:15 AM</p>
                            <p className="text-sm text-blue-700">Hora promedio</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Acciones rápidas para tutores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/admin/tutor-attendance')}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 cursor-pointer"
                    >
                      <FiUserCheck className="w-8 h-8 mb-3" />
                      <h3 className="text-lg font-semibold mb-1">Gestión de Asistencia</h3>
                      <p className="text-sm opacity-90">Registrar y gestionar asistencia de tutores</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg p-6 cursor-pointer"
                    >
                      <FiBarChart className="w-8 h-8 mb-3" />
                      <h3 className="text-lg font-semibold mb-1">Reportes</h3>
                      <p className="text-sm opacity-90">Ver reportes de asistencia de tutores</p>
                    </motion.div>
                  </div>

                  {/* Resumen de tutores */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado Actual de Tutores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FiCheckCircle className="w-6 h-6 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold text-green-900">{stats.tutors.present}</p>
                            <p className="text-sm text-green-700">En el campus</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FiXCircle className="w-6 h-6 text-red-500" />
                          <div>
                            <p className="text-2xl font-bold text-red-900">{stats.tutors.absent}</p>
                            <p className="text-sm text-red-700">Ausentes</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FiClock className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold text-blue-900">7:45 AM</p>
                            <p className="text-sm text-blue-700">Hora promedio entrada</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de tutores presentes hoy */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tutores Presentes Hoy</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 text-center py-8">
                        Haz clic en "Gestión de Asistencia" para ver el detalle completo
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </PageTransition>
    </div>
  )
}

export default AttendanceControl