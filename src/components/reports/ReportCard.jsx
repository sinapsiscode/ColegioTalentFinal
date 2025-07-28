import React from 'react'
import { motion } from 'framer-motion'
import CountUpNumber from '../common/CountUpNumber'
import { FiUserPlus } from 'react-icons/fi'

const ReportCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue', 
  trend,
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      icon: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      icon: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      icon: 'text-purple-600'
    }
  }

  const colors = colorClasses[color] || colorClasses.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{title}</p>
            
            <div className="flex items-baseline space-x-1">
              {typeof value === 'number' ? (
                <CountUpNumber
                  value={value}
                  className={`text-xl sm:text-2xl lg:text-3xl font-bold ${colors.text}`}
                  prefix={prefix}
                  suffix={suffix}
                  decimals={decimals}
                />
              ) : (
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${colors.text} truncate`}>
                  {prefix}{value}{suffix}
                </p>
              )}
              
              {trend !== undefined && (
                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
          </div>
          
          <div className={`p-2 sm:p-3 rounded-lg ${colors.bg} flex-shrink-0`}>
            <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${colors.icon}`} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ReportCard