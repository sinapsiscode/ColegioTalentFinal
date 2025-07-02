import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, 
  FiCalendar, 
  FiUser, 
  FiTag, 
  FiPaperclip, 
  FiDownload,
  FiShare2,
  FiPrinter,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiImage,
  FiFile
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CommuniqueDetail = ({ comunicado, isOpen, onClose, onMarkAsRead, onShare, onPrint }) => {
  if (!comunicado) return null

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baja': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (prioridad) => {
    switch (prioridad) {
      case 'alta': return <FiAlertCircle className="w-4 h-4" />
      case 'media': return <FiClock className="w-4 h-4" />
      case 'baja': return <FiCheckCircle className="w-4 h-4" />
      default: return null
    }
  }

  const getFileIcon = (tipo) => {
    switch (tipo) {
      case 'pdf': return <FiFileText className="w-5 h-5 text-red-600" />
      case 'imagen': return <FiImage className="w-5 h-5 text-blue-600" />
      default: return <FiFile className="w-5 h-5 text-gray-600" />
    }
  }

  const getCategoryColor = (categoria) => {
    const colors = {
      reuniones: 'bg-blue-100 text-blue-800',
      horarios: 'bg-purple-100 text-purple-800',
      eventos: 'bg-pink-100 text-pink-800',
      seguridad: 'bg-red-100 text-red-800',
      actividades: 'bg-green-100 text-green-800',
      resultados: 'bg-indigo-100 text-indigo-800',
      talleres: 'bg-orange-100 text-orange-800',
      academico: 'bg-cyan-100 text-cyan-800'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800'
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary text-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border border-white/20 bg-white/10`}>
                      {getPriorityIcon(comunicado.prioridad)}
                      <span className="capitalize">{comunicado.prioridad} prioridad</span>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20`}>
                      {comunicado.categoria.charAt(0).toUpperCase() + comunicado.categoria.slice(1)}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-3">{comunicado.titulo}</h2>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4" />
                      <span>{comunicado.autor}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>{format(new Date(comunicado.fecha), 'EEEE, d MMMM yyyy - HH:mm', { locale: es })}</span>
                    </div>
                    
                    {comunicado.adjuntos && comunicado.adjuntos.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <FiPaperclip className="w-4 h-4" />
                        <span>{comunicado.adjuntos.length} adjunto{comunicado.adjuntos.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  <FiX className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Content text */}
              <div className="mb-6">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {comunicado.contenido}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {comunicado.etiquetas && comunicado.etiquetas.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Etiquetas</h4>
                  <div className="flex flex-wrap gap-2">
                    {comunicado.etiquetas.map((etiqueta, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        <FiTag className="w-3 h-3" />
                        <span>{etiqueta}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {comunicado.adjuntos && comunicado.adjuntos.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Adjuntos</h4>
                  <div className="space-y-2">
                    {comunicado.adjuntos.map((adjunto, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(adjunto.tipo)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{adjunto.nombre}</p>
                            <p className="text-xs text-gray-600">{adjunto.tamaño}</p>
                          </div>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
                          title="Descargar"
                        >
                          <FiDownload className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Directed to */}
              {comunicado.dirigidoA && comunicado.dirigidoA.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Dirigido a</h4>
                  <div className="flex flex-wrap gap-2">
                    {comunicado.dirigidoA.map((destinatario, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {destinatario}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {!comunicado.leido && (
                    <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1"></div>
                      No leído
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {!comunicado.leido && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onMarkAsRead(comunicado.id)}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      Marcar como leído
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onShare(comunicado)}
                    className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
                    title="Compartir"
                  >
                    <FiShare2 className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onPrint(comunicado)}
                    className="p-2 text-gray-600 hover:text-talentos-primary transition-colors duration-200"
                    title="Imprimir"
                  >
                    <FiPrinter className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CommuniqueDetail