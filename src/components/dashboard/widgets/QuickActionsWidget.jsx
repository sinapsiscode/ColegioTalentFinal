import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FiUsers,
  FiMessageSquare,
  FiCalendar,
  FiFileText,
  FiBook,
  FiSettings,
  FiPlus,
  FiTrendingUp,
  FiPieChart
} from 'react-icons/fi'

const QuickActionsWidget = ({ 
  title = "Acciones Rápidas",
  actions = [],
  size = "normal", // "small", "normal", "large"
  layout = "grid" // "grid", "list"
}) => {
  const navigate = useNavigate()

  const defaultActions = [
    {
      id: 'users',
      label: 'Gestionar Usuarios',
      icon: FiUsers,
      color: 'blue',
      path: '/admin/users',
      count: 245
    },
    {
      id: 'messages',
      label: 'Comunicados',
      icon: FiMessageSquare,
      color: 'purple',
      path: '/admin/communiques',
      count: 12
    },
    {
      id: 'attendance',
      label: 'Asistencia',
      icon: FiCalendar,
      color: 'green',
      path: '/admin/attendance-control',
      count: 189
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: FiFileText,
      color: 'orange',
      path: '/admin/reports',
      count: 8
    },
    {
      id: 'courses',
      label: 'Cursos',
      icon: FiBook,
      color: 'indigo',
      path: '/admin/courses-management',
      count: 24
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: FiSettings,
      color: 'gray',
      path: '/admin/configuration',
      count: null
    }
  ]

  const actionsToShow = actions.length > 0 ? actions : defaultActions

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      text: 'text-blue-600',
      icon: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200',
      border: 'border-blue-200 hover:border-blue-300'
    },
    purple: {
      bg: 'bg-purple-50 hover:bg-purple-100',
      text: 'text-purple-600',
      icon: 'bg-purple-100 text-purple-600 group-hover:bg-purple-200',
      border: 'border-purple-200 hover:border-purple-300'
    },
    green: {
      bg: 'bg-green-50 hover:bg-green-100',
      text: 'text-green-600',
      icon: 'bg-green-100 text-green-600 group-hover:bg-green-200',
      border: 'border-green-200 hover:border-green-300'
    },
    orange: {
      bg: 'bg-orange-50 hover:bg-orange-100',
      text: 'text-orange-600',
      icon: 'bg-orange-100 text-orange-600 group-hover:bg-orange-200',
      border: 'border-orange-200 hover:border-orange-300'
    },
    indigo: {
      bg: 'bg-indigo-50 hover:bg-indigo-100',
      text: 'text-indigo-600',
      icon: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200',
      border: 'border-indigo-200 hover:border-indigo-300'
    },
    gray: {
      bg: 'bg-gray-50 hover:bg-gray-100',
      text: 'text-gray-600',
      icon: 'bg-gray-100 text-gray-600 group-hover:bg-gray-200',
      border: 'border-gray-200 hover:border-gray-300'
    }
  }

  const sizeClasses = {
    small: {
      container: 'p-3',
      item: 'p-2',
      icon: 'w-4 h-4 p-1',
      title: 'text-sm',
      label: 'text-xs',
      count: 'text-xs'
    },
    normal: {
      container: 'p-4',
      item: 'p-3',
      icon: 'w-5 h-5 p-1.5',
      title: 'text-base',
      label: 'text-sm',
      count: 'text-sm'
    },
    large: {
      container: 'p-6',
      item: 'p-4',
      icon: 'w-6 h-6 p-2',
      title: 'text-lg',
      label: 'text-base',
      count: 'text-base'
    }
  }

  const currentSizeClass = sizeClasses[size] || sizeClasses.normal

  const handleActionClick = (action) => {
    if (action.path) {
      navigate(action.path)
    } else if (action.onClick) {
      action.onClick()
    }
  }

  const getGridCols = () => {
    if (layout === 'list') return 'grid-cols-1'
    
    const count = actionsToShow.length
    if (size === 'small') return 'grid-cols-2'
    if (count <= 2) return 'grid-cols-1'
    if (count <= 4) return 'grid-cols-2'
    return 'grid-cols-2 lg:grid-cols-3'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
            <FiTrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className={`font-semibold text-gray-900 ${currentSizeClass.title}`}>
            {title}
          </h3>
        </div>

        {size !== 'small' && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {/* Toggle layout */}}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiPieChart className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Actions Grid */}
      <div className={`flex-1 overflow-y-auto ${currentSizeClass.container}`}>
        <div className={`grid gap-3 h-full ${getGridCols()}`}>
          {actionsToShow.map((action, index) => {
            const Icon = action.icon
            const colors = colorClasses[action.color] || colorClasses.blue

            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -2,
                  boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleActionClick(action)}
                className={`group relative ${currentSizeClass.item} rounded-xl border-2 transition-all duration-200 ${colors.bg} ${colors.border} overflow-hidden`}
              >
                {/* Background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  initial={false}
                />

                <div className="relative z-10 flex items-center justify-between h-full">
                  <div className="flex-1 text-left">
                    <div className={`${currentSizeClass.icon} rounded-lg ${colors.icon} transition-colors duration-200 mb-2`}>
                      <Icon className="w-full h-full" />
                    </div>
                    
                    <h4 className={`font-semibold ${colors.text} ${currentSizeClass.label} mb-1`}>
                      {action.label}
                    </h4>
                    
                    {action.description && size !== 'small' && (
                      <p className="text-xs text-gray-500 leading-tight">
                        {action.description}
                      </p>
                    )}
                  </div>

                  {action.count !== null && (
                    <motion.div
                      className={`ml-2 ${currentSizeClass.count} font-bold ${colors.text} bg-white/80 px-2 py-1 rounded-lg shadow-sm`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {action.count}
                    </motion.div>
                  )}
                </div>

                {/* Hover indicator */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 ${colors.text.replace('text-', 'bg-')} origin-left`}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            )
          })}

          {/* Add new action button */}
          {size !== 'small' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: actionsToShow.length * 0.1 }}
              whileHover={{ 
                scale: 1.02, 
                y: -2,
                boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
              className={`group relative ${currentSizeClass.item} rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 transition-all duration-200 flex items-center justify-center`}
            >
              <div className="text-center">
                <div className="p-2 bg-gray-200 rounded-lg mx-auto mb-2 group-hover:bg-gray-300 transition-colors">
                  <FiPlus className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  Agregar
                </span>
              </div>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default QuickActionsWidget