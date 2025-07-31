import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiUsers,
  FiHome,
  FiBookOpen,
  FiCalendar,
  FiSettings
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import PageTransition from '../../components/common/PageTransition'
import TeacherAssignments from '../../components/assignments/TeacherAssignments'
import FamilyAssignments from '../../components/assignments/FamilyAssignments'
import StudentAssignments from '../../components/assignments/StudentAssignments'
import useAuthStore from '../../stores/authStore'

const AssignmentCenter = () => {
  const [activeTab, setActiveTab] = useState('teachers')
  const { usuario } = useAuthStore()

  const tabs = [
    {
      id: 'teachers',
      name: 'Profesores',
      icon: FiUsers,
      description: 'Asignar cursos y secciones a profesores',
      color: 'blue'
    },
    {
      id: 'families',
      name: 'Familias', 
      icon: FiHome,
      description: 'Asignar hijos a padres de familia',
      color: 'green'
    },
    {
      id: 'students',
      name: 'Estudiantes',
      icon: FiBookOpen,
      description: 'Asignar estudiantes a secciones',
      color: 'purple'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'teachers':
        return <TeacherAssignments />
      case 'families':
        return <FamilyAssignments />
      case 'students':
        return <StudentAssignments />
      default:
        return null
    }
  }

  const getTabColorClasses = (tabId, isActive) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return ''

    if (isActive) {
      switch (tab.color) {
        case 'blue':
          return 'border-blue-500 text-blue-600 bg-blue-50'
        case 'green':
          return 'border-green-500 text-green-600 bg-green-50'
        case 'purple':
          return 'border-purple-500 text-purple-600 bg-purple-50'
        default:
          return 'border-gray-500 text-gray-600 bg-gray-50'
      }
    } else {
      return 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Header title="Centro de Asignaciones" usuario={usuario} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header con descripción */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Centro de Asignaciones Universal
            </h1>
            <p className="text-lg text-gray-600">
              Gestiona todas las asignaciones del sistema desde un solo lugar: profesores, familias y estudiantes.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        group relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-sm font-medium text-center
                        border-b-2 focus:outline-none transition-all duration-200
                        ${getTabColorClasses(tab.id, isActive)}
                      `}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Icon className="w-5 h-5" />
                        <span className="hidden sm:inline">{tab.name}</span>
                      </div>
                      
                      {/* Descripción visible en hover */}
                      <div className="absolute inset-x-0 bottom-full mb-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Indicador de tab activo */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                {(() => {
                  const activeTabData = tabs.find(t => t.id === activeTab)
                  const Icon = activeTabData?.icon || FiSettings
                  return (
                    <>
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {activeTabData?.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        - {activeTabData?.description}
                      </span>
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Contenido del tab */}
            <div className="min-h-[600px]">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </div>

          {/* Stats footer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Centro de Control Administrativo
              </h3>
              <p className="text-sm text-gray-600">
                Todas las asignaciones del sistema unificadas en una sola interfaz para máxima eficiencia operacional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default AssignmentCenter