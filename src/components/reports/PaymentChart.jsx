import React from 'react'
import { motion } from 'framer-motion'

const PaymentChart = ({ data, type = 'bar' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  // Gráfico de dona
  if (type === 'donut') {
    const total = data.reduce((sum, item) => sum + (item.amount || 0), 0)
    let currentAngle = -90
    
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
    
    return (
      <div className="relative h-full flex items-center justify-center">
        <svg className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48" viewBox="-1 -1 2 2">
          {data.map((item, index) => {
            const percentage = (item.amount / total) * 100
            const angle = (percentage / 100) * 360
            const startAngle = currentAngle
            currentAngle += angle
            
            const startAngleRad = (startAngle * Math.PI) / 180
            const endAngleRad = (currentAngle * Math.PI) / 180
            
            const x1 = Math.cos(startAngleRad)
            const y1 = Math.sin(startAngleRad)
            const x2 = Math.cos(endAngleRad)
            const y2 = Math.sin(endAngleRad)
            
            const largeArcFlag = angle > 180 ? 1 : 0
            
            const pathData = [
              `M ${x1 * 0.6} ${y1 * 0.6}`,
              `L ${x1} ${y1}`,
              `A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `L ${x2 * 0.6} ${y2 * 0.6}`,
              `A 0.6 0.6 0 ${largeArcFlag} 0 ${x1 * 0.6} ${y1 * 0.6}`
            ].join(' ')
            
            return (
              <motion.path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            )
          })}
        </svg>
        
        {/* Centro con total */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">S/. {total.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>
        
        {/* Leyenda */}
        <div className="absolute right-0 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div>
                <p className="text-sm text-gray-700">{item.category}</p>
                <p className="text-xs text-gray-500">S/. {item.amount.toLocaleString()} ({item.percentage}%)</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Gráfico de barras apiladas
  if (type === 'stacked-bar') {
    const maxTotal = Math.max(...data.map(item => 
      (item.paid || 0) + (item.pending || 0) + (item.overdue || 0)
    ))
    
    return (
      <div className="h-64 flex items-end justify-between space-x-3">
        {data.map((item, index) => {
          const total = (item.paid || 0) + (item.pending || 0) + (item.overdue || 0)
          const paidHeight = ((item.paid || 0) / maxTotal) * 100
          const pendingHeight = ((item.pending || 0) / maxTotal) * 100
          const overdueHeight = ((item.overdue || 0) / maxTotal) * 100
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(total / maxTotal) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="w-full flex flex-col-reverse relative group"
              >
                {/* Pagado */}
                <div 
                  className="bg-green-500 transition-all"
                  style={{ height: `${(item.paid / total) * 100}%` }}
                />
                {/* Pendiente */}
                <div 
                  className="bg-yellow-500 transition-all"
                  style={{ height: `${(item.pending / total) * 100}%` }}
                />
                {/* Vencido */}
                <div 
                  className="bg-red-500 rounded-t-lg transition-all"
                  style={{ height: `${(item.overdue / total) * 100}%` }}
                />
                
                {/* Tooltip */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  <p className="text-green-400">Pagado: {item.paid}</p>
                  <p className="text-yellow-400">Pendiente: {item.pending}</p>
                  <p className="text-red-400">Vencido: {item.overdue}</p>
                </div>
              </motion.div>
              
              <p className="text-xs text-gray-600 mt-2">{item.grade}</p>
            </div>
          )
        })}
      </div>
    )
  }

  // Gráfico de barras simple
  return (
    <div className="h-64 flex items-end justify-between space-x-2">
      {data.map((item, index) => {
        const maxValue = Math.max(...data.map(d => d.amount || 0))
        const height = ((item.amount || 0) / maxValue) * 100
        
        return (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="w-full bg-green-500 rounded-t-lg relative group hover:bg-green-600 transition-colors">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                S/. {(item.amount || 0).toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">{item.category || item.label}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

export default PaymentChart