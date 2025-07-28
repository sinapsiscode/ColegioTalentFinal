import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { motion } from 'framer-motion'

import Header from '../../components/common/Header'
import UserManagement from '../../components/admin/UserManagement'

const Users = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200 lg:hidden"
            >
              <FiArrowLeft className="w-5 h-5" />
            </motion.button>
            
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-sm text-gray-600 mt-1">
                Administra usuarios, permisos y accesos del sistema
              </p>
            </div>
          </div>
        </div>

        {/* User Management Component */}
        <UserManagement />
      </main>
    </div>
  )
}

export default Users