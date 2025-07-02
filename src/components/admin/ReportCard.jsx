import React from 'react'
import { motion } from 'framer-motion'
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiCalendar,
  FiUser,
  FiMoreVertical,
  FiCopy,
  FiTrash2,
  FiEdit3,
  FiClock,
  FiCheckCircle,
  FiLoader,
  FiAlertTriangle
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ReportCard = ({ 
  reporte, 
  onView, 
  onDownload, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onGenerate 
}) => {
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'actualizado': return 'bg-green-100 text-green-800'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'generando': return 'bg-blue-100 text-blue-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'actualizado': return <FiCheckCircle className="w-3 h-3" />
      case 'pendiente': return <FiClock className="w-3 h-3" />
      case 'generando': return <FiLoader className="w-3 h-3 animate-spin" />
      case 'error': return <FiAlertTriangle className="w-3 h-3" />
      default: return <FiFileText className="w-3 h-3" />
    }
  }

  const getCategoryColor = (categoria) => {
    const colors = {
      academico: 'bg-blue-100 text-blue-800',
      asistencia: 'bg-green-100 text-green-800',
      comunicaciones: 'bg-purple-100 text-purple-800',
      satisfaccion: 'bg-pink-100 text-pink-800',
      recursos_humanos: 'bg-orange-100 text-orange-800',
      finanzas: 'bg-indigo-100 text-indigo-800',
      tecnologia: 'bg-cyan-100 text-cyan-800',
      actividades: 'bg-red-100 text-red-800'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (categoria) => {
    switch (categoria) {
      case 'academico': return '📚'
      case 'asistencia': return '📋'
      case 'comunicaciones': return '💬'
      case 'satisfaccion': return '⭐'
      case 'recursos_humanos': return '👥'
      case 'finanzas': return '💰'
      case 'tecnologia': return '💻'
      case 'actividades': return '🎯'
      default: return '📄'
    }
  }

  const formatTimeAgo = (fecha) => {
    const now = new Date()
    const diff = now - new Date(fecha)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 24) {
      return `hace ${hours}h`
    } else {
      return `hace ${days}d`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-lg">{getCategoryIcon(reporte.categoria)}</div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {reporte.nombre}
            </h3>
          </div>
          
          {/* Metadatos */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(reporte.categoria)}`}>
              {reporte.categoria.replace('_', ' ').charAt(0).toUpperCase() + reporte.categoria.replace('_', ' ').slice(1)}
            </span>
            
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reporte.estado)}`}>
              {getStatusIcon(reporte.estado)}
              <span className="capitalize">{reporte.estado}</span>
            </div>
            
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {reporte.formato}
            </span>
          </div>
        </div>
        
        {/* Actions menu */}
        <div className="flex items-center space-x-2">
          {reporte.estado === 'actualizado' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDownload(reporte)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              title="Descargar"
            >
              <FiDownload className="w-4 h-4" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onView(reporte)}
            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
            title="Ver detalles"
          >
            <FiEye className="w-4 h-4" />
          </motion.button>
          
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Más opciones"
            >
              <FiMoreVertical className="w-4 h-4" />
            </motion.button>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40 z-10">
              <button
                onClick={() => onEdit(reporte)}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiEdit3 className="w-3 h-3" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => onDuplicate(reporte.id)}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiCopy className="w-3 h-3" />
                <span>Duplicar</span>
              </button>
              {reporte.estado === 'pendiente' && (
                <button
                  onClick={() => onGenerate(reporte)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                >
                  <FiFileText className="w-3 h-3" />
                  <span>Generar</span>
                </button>
              )}
              <button
                onClick={() => onDelete(reporte.id)}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                <FiTrash2 className="w-3 h-3" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm line-clamp-2">
          {reporte.descripcion}
        </p>
      </div>

      {/* Información adicional */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Frecuencia:</span>
          <span className="font-medium text-gray-900 capitalize">{reporte.frecuencia}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Tamaño:</span>
          <span className="font-medium text-gray-900">{reporte.tamaño}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Accesos:</span>
          <span className="font-medium text-gray-900">{reporte.accesos}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <FiCalendar className="w-4 h-4" />
          <span>{format(new Date(reporte.ultimaActualizacion), 'dd MMM yyyy', { locale: es })}</span>
        </div>
        
        <div className="text-xs text-gray-500">
          {formatTimeAgo(reporte.ultimaActualizacion)}
        </div>
      </div>
    </motion.div>
  )
}

export default ReportCard