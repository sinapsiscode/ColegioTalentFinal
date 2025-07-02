import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  FiCalendar,
  FiUser,
  FiEye,
  FiMessageSquare,
  FiEdit3,
  FiTrash2,
  FiSend,
  FiArchive,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiFileText,
  FiDownload,
  FiMoreVertical
} from 'react-icons/fi'

const CommuniqueCard = ({ 
  comunicado, 
  onEdit, 
  onDelete, 
  onPublish, 
  onArchive, 
  onViewDetails,
  variant = 'default' 
}) => {
  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'borrador':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: FiFileText,
          label: 'Borrador'
        }
      case 'publicado':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          icon: FiCheckCircle,
          label: 'Publicado'
        }
      case 'programado':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          icon: FiClock,
          label: 'Programado'
        }
      case 'archivado':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          icon: FiArchive,
          label: 'Archivado'
        }
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: FiFileText,
          label: estado
        }
    }
  }

  const getPrioridadConfig = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return { color: 'text-red-600', bg: 'bg-red-100', label: 'Alta' }
      case 'media':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Media' }
      case 'baja':
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'Baja' }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: prioridad }
    }
  }

  const getCategoriaConfig = (categoria) => {
    const configs = {
      academico: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Académico' },
      administrativo: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Administrativo' },
      evento: { color: 'text-green-600', bg: 'bg-green-100', label: 'Evento' },
      reunion: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Reunión' },
      salud: { color: 'text-red-600', bg: 'bg-red-100', label: 'Salud' },
      disciplina: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Disciplina' }
    }
    return configs[categoria] || { color: 'text-gray-600', bg: 'bg-gray-100', label: categoria }
  }

  const estadoConfig = getEstadoConfig(comunicado.estado)
  const prioridadConfig = getPrioridadConfig(comunicado.prioridad)
  const categoriaConfig = getCategoriaConfig(comunicado.categoria)

  const formatearFecha = (fecha) => {
    return format(new Date(fecha), "d 'de' MMMM, yyyy", { locale: es })
  }

  const formatearHora = (fecha) => {
    return format(new Date(fecha), "HH:mm", { locale: es })
  }

  const truncarTexto = (texto, limite = 150) => {
    if (texto.length <= limite) return texto
    return texto.substring(0, limite) + '...'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoriaConfig.bg} ${categoriaConfig.color}`}>
                {categoriaConfig.label}
              </span>
              
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${prioridadConfig.bg} ${prioridadConfig.color}`}>
                {prioridadConfig.label}
              </span>

              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estadoConfig.bg} ${estadoConfig.text}`}>
                <estadoConfig.icon className="w-3 h-3 mr-1" />
                {estadoConfig.label}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {comunicado.titulo}
            </h3>
            
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <FiUser className="w-4 h-4 mr-1" />
              <span>{comunicado.autor}</span>
              <span className="mx-2">•</span>
              <FiCalendar className="w-4 h-4 mr-1" />
              <span>{formatearFecha(comunicado.fecha)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onViewDetails(comunicado)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Ver detalles"
            >
              <FiMoreVertical className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 text-sm leading-relaxed mb-4">
          {truncarTexto(comunicado.contenido)}
        </p>

        {/* Audiencia */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <span className="font-medium">Dirigido a:</span>
          <span className="ml-2">{comunicado.dirigidoA?.join(', ')}</span>
        </div>

        {/* Adjuntos */}
        {comunicado.adjuntos && comunicado.adjuntos.length > 0 && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <FiFileText className="w-4 h-4 mr-1" />
            <span>{comunicado.adjuntos.length} archivo{comunicado.adjuntos.length > 1 ? 's' : ''} adjunto{comunicado.adjuntos.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Estadísticas */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FiEye className="w-4 h-4 mr-1" />
              <span>{comunicado.vistas || 0}</span>
            </div>
            {comunicado.respuestas && (
              <div className="flex items-center">
                <FiMessageSquare className="w-4 h-4 mr-1" />
                <span>{comunicado.respuestas}</span>
              </div>
            )}
            {comunicado.confirmacionLectura && (
              <div className="flex items-center">
                <FiCheckCircle className="w-4 h-4 mr-1" />
                <span>{comunicado.lecturas || 0} leídos</span>
              </div>
            )}
          </div>
          
          {comunicado.fechaVencimiento && (
            <div className="flex items-center text-xs">
              <FiClock className="w-3 h-3 mr-1" />
              <span>Vence: {formatearFecha(comunicado.fechaVencimiento)}</span>
            </div>
          )}
        </div>

        {/* Etiquetas */}
        {comunicado.etiquetas && comunicado.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {comunicado.etiquetas.slice(0, 3).map((etiqueta, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                #{etiqueta}
              </span>
            ))}
            {comunicado.etiquetas.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{comunicado.etiquetas.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {comunicado.estado === 'borrador' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPublish(comunicado)}
                className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors duration-200"
                title="Publicar comunicado"
              >
                <FiSend className="w-3 h-3 mr-1" />
                Publicar
              </motion.button>
            )}
            
            {comunicado.estado === 'publicado' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onArchive(comunicado)}
                className="inline-flex items-center px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors duration-200"
                title="Archivar comunicado"
              >
                <FiArchive className="w-3 h-3 mr-1" />
                Archivar
              </motion.button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(comunicado)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              title="Editar comunicado"
            >
              <FiEdit3 className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(comunicado)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
              title="Eliminar comunicado"
            >
              <FiTrash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CommuniqueCard