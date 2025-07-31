import React from 'react'
import { motion } from 'framer-motion'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiCalendar, 
  FiMessageSquare,
  FiBookOpen
} from 'react-icons/fi'
import CountUpNumber from '../../common/CountUpNumber'

const StatsWidget = ({ 
  title = "Estadística", 
  value = 0, 
  change = 0, 
  changeType = "positive",
  icon: Icon = FiUsers,
  color = "blue",
  unit = "",
  description = "",
  size = "normal" // "small", "normal", "large"
}) => {
  const isPositive = changeType === "positive" || change >= 0
  
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      accent: 'from-blue-500 to-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      accent: 'from-green-500 to-green-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      accent: 'from-purple-500 to-purple-600'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',  
      accent: 'from-orange-500 to-orange-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      accent: 'from-red-500 to-red-600'
    }
  }

  const sizeClasses = {
    small: {
      container: 'p-3',
      icon: 'w-4 h-4',
      iconContainer: 'p-2',
      title: 'text-xs',
      value: 'text-lg',
      change: 'text-xs',
      description: 'text-xs'
    },
    normal: {
      container: 'p-4',
      icon: 'w-5 h-5',
      iconContainer: 'p-2',
      title: 'text-sm',
      value: 'text-2xl',
      change: 'text-xs',
      description: 'text-xs'
    },
    large: {
      container: 'p-6',
      icon: 'w-6 h-6',
      iconContainer: 'p-3',
      title: 'text-base',
      value: 'text-3xl',
      change: 'text-sm',
      description: 'text-sm'
    }
  }

  const currentColorClass = colorClasses[color] || colorClasses.blue
  const currentSizeClass = sizeClasses[size] || sizeClasses.normal

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`relative h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${currentSizeClass.container}`}
    >
      {/* Background gradient effect */}
      <motion.div 
        className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${currentColorClass.accent} opacity-5 rounded-full transform translate-x-8 -translate-y-8`}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className={`${currentColorClass.bg} rounded-lg ${currentSizeClass.iconContainer}`}>
            <Icon className={`${currentSizeClass.icon} ${currentColorClass.text}`} />
          </div>
          
          {change !== 0 && (
            <motion.div 
              className={`flex items-center space-x-1 px-2 py-1 rounded-full ${currentSizeClass.change} font-medium ${
                isPositive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              {isPositive ? (
                <FiTrendingUp className="w-3 h-3" />
              ) : (
                <FiTrendingDown className="w-3 h-3" />
              )}
              <span>{isPositive ? '+' : ''}{change}{unit && unit !== '%' ? unit : '%'}</span>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-1">
            <CountUpNumber 
              value={value} 
              className={`${currentSizeClass.value} font-bold text-gray-900`}
              suffix={unit && unit !== '%' ? unit : ''}
              duration={1200}
            />
          </div>
          
          <h3 className={`${currentSizeClass.title} font-semibold text-gray-700 mb-1`}>
            {title}
          </h3>
          
          {description && (
            <p className={`${currentSizeClass.description} text-gray-500 leading-tight`}>
              {description}
            </p>
          )}
        </div>

        {/* Progress indicator para ciertos tipos */}
        {(title.toLowerCase().includes('asistencia') || title.toLowerCase().includes('completado')) && (
          <motion.div 
            className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.div
              className={`h-full bg-gradient-to-r ${currentColorClass.accent} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(value, 100)}%` }}
              transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default StatsWidget