import React from 'react'
import { motion } from 'framer-motion'

const Table = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  striped = false,
  hover = true,
  responsive = true,
  ...props
}) => {
  const variants = {
    default: 'border border-gray-200',
    simple: 'border-0',
    bordered: 'border-2 border-gray-300'
  }
  
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  const baseClasses = `min-w-full divide-y divide-gray-200 ${variants[variant]} ${sizes[size]}`
  const tableClasses = `${baseClasses} ${className}`
  
  const tableContent = (
    <table className={tableClasses} {...props}>
      {children}
    </table>
  )
  
  if (responsive) {
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        {tableContent}
      </div>
    )
  }
  
  return tableContent
}

Table.Header = ({ children, className = '' }) => (
  <thead className={`bg-gray-50 ${className}`}>
    {children}
  </thead>
)

Table.Body = ({ children, className = '', striped = false, hover = true }) => {
  const stripedClasses = striped ? 'divide-y divide-gray-200' : ''
  const bodyClasses = `bg-white ${stripedClasses} ${className}`
  
  return (
    <tbody className={bodyClasses}>
      {children}
    </tbody>
  )
}

Table.Row = ({ children, className = '', hover = true, onClick, ...props }) => {
  const hoverClasses = hover ? 'hover:bg-gray-50' : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''
  const rowClasses = `${hoverClasses} ${clickableClasses} ${className}`
  
  if (onClick) {
    return (
      <motion.tr
        className={rowClasses}
        onClick={onClick}
        whileHover={{ backgroundColor: '#f9fafb' }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.tr>
    )
  }
  
  return (
    <tr className={rowClasses} {...props}>
      {children}
    </tr>
  )
}

Table.HeaderCell = ({ 
  children, 
  className = '', 
  sortable = false, 
  sorted = null, 
  onSort,
  align = 'left',
  ...props 
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  const baseClasses = `px-6 py-3 ${alignClasses[align]} text-sm font-medium text-gray-500 uppercase tracking-wider`
  const sortableClasses = sortable ? 'cursor-pointer hover:text-gray-700' : ''
  const cellClasses = `${baseClasses} ${sortableClasses} ${className}`
  
  return (
    <th className={cellClasses} onClick={sortable ? onSort : undefined} {...props}>
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col space-y-0">
            <svg
              className={`w-3 h-3 ${sorted === 'asc' ? 'text-gray-900' : 'text-gray-400'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <svg
              className={`w-3 h-3 ${sorted === 'desc' ? 'text-gray-900' : 'text-gray-400'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </th>
  )
}

Table.Cell = ({ 
  children, 
  className = '', 
  align = 'left',
  ...props 
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  const cellClasses = `px-6 py-4 whitespace-nowrap ${alignClasses[align]} text-sm text-gray-900 ${className}`
  
  return (
    <td className={cellClasses} {...props}>
      {children}
    </td>
  )
}

// Componente de loading para la tabla
Table.Loading = ({ columns = 5, rows = 5 }) => (
  <Table>
    <Table.Header>
      <Table.Row>
        {Array.from({ length: columns }).map((_, i) => (
          <Table.HeaderCell key={i}>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </Table.HeaderCell>
        ))}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {Array.from({ length: rows }).map((_, i) => (
        <Table.Row key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <Table.Cell key={j}>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
)

// Componente de estado vacío
Table.Empty = ({ message = 'No hay datos disponibles', icon: Icon }) => (
  <div className="text-center py-12">
    {Icon && <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
    <p className="text-gray-500">{message}</p>
  </div>
)

export default Table