import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiFileText,
  FiUser,
  FiCalendar,
  FiTag,
  FiUsers,
  FiSettings,
  FiX,
  FiSave,
  FiSend,
  FiPaperclip,
  FiTrash2,
  FiAlertTriangle
} from 'react-icons/fi'
import AnimatedButton from '../common/AnimatedButton'

const CommuniqueForm = ({ isOpen, onClose, onSave, comunicado = null, configuraciones }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    categoria: 'academico',
    prioridad: 'media',
    audiencia: 'toda_comunidad',
    dirigidoA: [],
    grados: [],
    etiquetas: [],
    fechaPublicacion: '',
    fechaVencimiento: '',
    confirmacionLectura: false,
    adjuntos: []
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [isDraft, setIsDraft] = useState(true)

  useEffect(() => {
    if (comunicado) {
      // Modo edición
      setFormData({
        ...comunicado,
        fechaPublicacion: comunicado.fechaPublicacion ? 
          new Date(comunicado.fechaPublicacion).toISOString().slice(0, 16) : '',
        fechaVencimiento: comunicado.fechaVencimiento ? 
          new Date(comunicado.fechaVencimiento).toISOString().slice(0, 10) : '',
        etiquetas: comunicado.etiquetas || [],
        adjuntos: comunicado.adjuntos || []
      })
      setIsDraft(comunicado.estado === 'borrador')
    } else {
      // Modo creación - resetear form
      const now = new Date()
      setFormData({
        titulo: '',
        contenido: '',
        categoria: 'academico',
        prioridad: 'media',
        audiencia: 'toda_comunidad',
        dirigidoA: [],
        grados: [],
        etiquetas: [],
        fechaPublicacion: now.toISOString().slice(0, 16),
        fechaVencimiento: '',
        confirmacionLectura: false,
        adjuntos: []
      })
      setIsDraft(true)
    }
    setErrors({})
  }, [comunicado, isOpen])

  if (!isOpen) return null

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleAudienceChange = (audiencia) => {
    setFormData(prev => ({
      ...prev,
      audiencia,
      // Actualizar dirigidoA basado en la audiencia
      dirigidoA: configuraciones?.audiencias?.[audiencia]?.dirigidoA || [],
      grados: audiencia === 'estudiantes' || audiencia === 'padres' ? [] : ['todos']
    }))
  }

  const toggleGrado = (grado) => {
    setFormData(prev => ({
      ...prev,
      grados: prev.grados.includes(grado)
        ? prev.grados.filter(g => g !== grado)
        : [...prev.grados, grado]
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.etiquetas.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        etiquetas: [...prev.etiquetas, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const newFiles = files.map(file => ({
      nombre: file.name,
      tipo: file.type.includes('image') ? 'imagen' : 
            file.type.includes('pdf') ? 'pdf' : 'documento',
      tamaño: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      archivo: file
    }))
    
    setFormData(prev => ({
      ...prev,
      adjuntos: [...prev.adjuntos, ...newFiles]
    }))
  }

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      adjuntos: prev.adjuntos.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.titulo.trim()) newErrors.titulo = 'El título es requerido'
    if (!formData.contenido.trim()) newErrors.contenido = 'El contenido es requerido'
    if (formData.contenido.length < 50) newErrors.contenido = 'El contenido debe tener al menos 50 caracteres'
    if (!formData.fechaPublicacion) newErrors.fechaPublicacion = 'La fecha de publicación es requerida'
    
    // Validar que la fecha de vencimiento sea posterior a la de publicación
    if (formData.fechaVencimiento && formData.fechaPublicacion) {
      const fechaPub = new Date(formData.fechaPublicacion)
      const fechaVenc = new Date(formData.fechaVencimiento)
      if (fechaVenc <= fechaPub) {
        newErrors.fechaVencimiento = 'La fecha de vencimiento debe ser posterior a la de publicación'
      }
    }
    
    if (formData.grados.length === 0 && (formData.audiencia === 'estudiantes' || formData.audiencia === 'padres')) {
      newErrors.grados = 'Selecciona al menos un grado'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e, saveAsDraft = true) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const comunicadoData = {
        ...formData,
        estado: saveAsDraft ? 'borrador' : 'publicado',
        fechaPublicacion: new Date(formData.fechaPublicacion),
        fechaVencimiento: formData.fechaVencimiento ? new Date(formData.fechaVencimiento) : null
      }
      
      await onSave(comunicadoData)
      onClose()
    } catch (error) {
      console.error('Error guardando comunicado:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.name === 'newTag') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {comunicado ? 'Editar Comunicado' : 'Nuevo Comunicado'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {comunicado ? 'Modifica el comunicado existente' : 'Crea un nuevo comunicado para la comunidad educativa'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FiX className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, isDraft)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Información básica */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <FiFileText className="w-5 h-5 text-blue-600" />
              <span>Información Básica</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.titulo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Cronograma de Evaluaciones II Bimestre"
                />
                {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Contenido *</label>
                <textarea
                  value={formData.contenido}
                  onChange={(e) => handleInputChange('contenido', e.target.value)}
                  rows={6}
                  className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.contenido ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Escribe aquí el contenido del comunicado..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.contenido && <p className="text-red-500 text-xs">{errors.contenido}</p>}
                  <p className="text-xs text-gray-500 ml-auto">
                    {formData.contenido.length} caracteres (mínimo 50)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <FiSettings className="w-5 h-5 text-purple-600" />
              <span>Configuración</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                >
                  {Object.entries(configuraciones?.categorias || {}).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                <select
                  value={formData.prioridad}
                  onChange={(e) => handleInputChange('prioridad', e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                >
                  {Object.entries(configuraciones?.prioridades || {}).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Audiencia</label>
                <select
                  value={formData.audiencia}
                  onChange={(e) => handleAudienceChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                >
                  {Object.entries(configuraciones?.audiencias || {}).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dirigido a y Grados */}
          {(formData.audiencia === 'estudiantes' || formData.audiencia === 'padres' || formData.audiencia === 'estudiantes_padres') && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <FiUsers className="w-5 h-5 text-green-600" />
                <span>Grados Específicos</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                {configuraciones?.grados?.filter(g => g !== 'todos').map(grado => (
                  <div key={grado} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`grado-${grado}`}
                      checked={formData.grados.includes(grado)}
                      onChange={() => toggleGrado(grado)}
                      className="w-4 h-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                    />
                    <label htmlFor={`grado-${grado}`} className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                      {grado}
                    </label>
                  </div>
                ))}
              </div>
              {errors.grados && <p className="text-red-500 text-xs mt-2">{errors.grados}</p>}
            </div>
          )}

          {/* Fechas */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <FiCalendar className="w-5 h-5 text-orange-600" />
              <span>Programación</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Fecha y Hora de Publicación *</label>
                <input
                  type="datetime-local"
                  value={formData.fechaPublicacion}
                  onChange={(e) => handleInputChange('fechaPublicacion', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.fechaPublicacion ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.fechaPublicacion && <p className="text-red-500 text-xs mt-1">{errors.fechaPublicacion}</p>}
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento (Opcional)</label>
                <input
                  type="date"
                  value={formData.fechaVencimiento}
                  onChange={(e) => handleInputChange('fechaVencimiento', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.fechaVencimiento ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.fechaVencimiento && <p className="text-red-500 text-xs mt-1">{errors.fechaVencimiento}</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confirmacionLectura"
                  checked={formData.confirmacionLectura}
                  onChange={(e) => handleInputChange('confirmacionLectura', e.target.checked)}
                  className="w-4 h-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                />
                <label htmlFor="confirmacionLectura" className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                  Solicitar confirmación de lectura
                </label>
              </div>
            </div>
          </div>

          {/* Etiquetas */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <FiTag className="w-5 h-5 text-indigo-600" />
              <span>Etiquetas</span>
            </h3>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
              <input
                type="text"
                name="newTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent min-h-[44px] sm:min-h-auto"
                placeholder="Agregar etiqueta..."
              />
              <AnimatedButton
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!newTag.trim()}
                className="min-h-[44px] sm:min-h-auto"
              >
                Agregar
              </AnimatedButton>
            </div>
            
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {formData.etiquetas.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Adjuntos */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <FiPaperclip className="w-5 h-5 text-gray-600" />
              <span>Archivos Adjuntos</span>
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <FiPaperclip className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-xs sm:text-sm text-gray-600">
                  Haz clic para seleccionar archivos o arrastra aquí
                </p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  PDF, DOC, DOCX, JPG, PNG (máx. 10MB cada uno)
                </p>
              </label>
            </div>
            
            {formData.adjuntos.length > 0 && (
              <div className="mt-3 sm:mt-4 space-y-2">
                {formData.adjuntos.map((archivo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FiFileText className="w-4 h-4 text-gray-500" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[150px] sm:max-w-none">{archivo.nombre}</span>
                      <span className="text-xs text-gray-500">({archivo.tamaño})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 border-t border-gray-200 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-3 order-2 sm:order-1">
            <AnimatedButton
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="min-h-[44px] sm:min-h-auto"
            >
              Cancelar
            </AnimatedButton>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 order-1 sm:order-2">
            <AnimatedButton
              variant="outline"
              icon={FiSave}
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="min-h-[44px] sm:min-h-auto"
            >
              {loading ? 'Guardando...' : 'Guardar Borrador'}
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              icon={FiSend}
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="min-h-[44px] sm:min-h-auto"
            >
              {loading ? 'Publicando...' : 'Publicar Ahora'}
            </AnimatedButton>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CommuniqueForm