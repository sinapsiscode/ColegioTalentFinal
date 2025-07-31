import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiX,
  FiSave,
  FiBookOpen,
  FiUsers,
  FiMapPin,
  FiCalendar,
  FiUser
} from 'react-icons/fi'
import AnimatedButton from '../common/AnimatedButton'
import { showSuccess, showError } from '../../utils/sweetAlert'
import useAdminUsersStore from '../../stores/adminUsersStore'
import { LIMITS } from '../../utils/constants'

const SectionModal = ({ isOpen, onClose, section = null, onSave }) => {
  const { usuarios, cargarUsuarios } = useAdminUsersStore()
  const [formData, setFormData] = useState({
    nombre: '',
    grado: '',
    capacidad: LIMITS.DEFAULT_SECTION_CAPACITY,
    aula: '',
    tutorId: '',
    descripcion: '',
    año: new Date().getFullYear()
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Cargar usuarios cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarUsuarios()
    }
  }, [isOpen, cargarUsuarios])

  // Inicializar formulario
  useEffect(() => {
    if (section) {
      setFormData({
        nombre: section.nombre || '',
        grado: section.grado || '',
        capacidad: section.capacidad || LIMITS.DEFAULT_SECTION_CAPACITY,
        aula: section.aula || '',
        tutorId: section.tutorId || '',
        descripcion: section.descripcion || '',
        año: section.año || new Date().getFullYear()
      })
    } else {
      // Reset form para nueva sección
      setFormData({
        nombre: '',
        grado: '',
        capacidad: LIMITS.DEFAULT_SECTION_CAPACITY,
        aula: '',
        tutorId: '',
        descripcion: '',
        año: new Date().getFullYear()
      })
    }
    setErrors({})
  }, [section, isOpen])

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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.grado.trim()) newErrors.grado = 'El grado es requerido'
    if (!formData.aula.trim()) newErrors.aula = 'El aula es requerida'
    
    if (formData.capacidad < 1) newErrors.capacidad = 'La capacidad debe ser mayor a 0'
    if (formData.capacidad > LIMITS.MAX_SECTION_CAPACITY) newErrors.capacidad = `La capacidad no puede ser mayor a ${LIMITS.MAX_SECTION_CAPACITY}`
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const sectionData = {
        ...formData,
        id: section?.id,
        fechaCreacion: section?.fechaCreacion || new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      }
      
      await onSave(sectionData)
      
      showSuccess(
        section ? 'Sección actualizada' : 'Sección creada',
        `La sección ${formData.nombre} ha sido ${section ? 'actualizada' : 'creada'} correctamente`
      )
      onClose()
    } catch (error) {
      showError('Error', 'No se pudo guardar la sección')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Lista de grados disponibles (solo primaria, editable si se necesita expandir)
  const grados = [
    '1ro Primaria', '2do Primaria', '3ro Primaria',
    '4to Primaria', '5to Primaria', '6to Primaria'
  ]

  // Lista de secciones comunes
  const secciones = ['A', 'B', 'C', 'D', 'E']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {section ? 'Editar Sección' : 'Nueva Sección'}
            </h2>
            <p className="text-gray-600 mt-1">
              {section ? 'Modifica la información de la sección' : 'Completa los datos para crear una nueva sección'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FiBookOpen className="w-5 h-5 text-blue-600" />
              <span>Información de la Sección</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Sección *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.nombre ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 1ro A, 2do B"
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grado *</label>
                <input
                  type="text"
                  value={formData.grado}
                  onChange={(e) => handleInputChange('grado', e.target.value)}
                  list="grados-list"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.grado ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 1ro Primaria"
                />
                <datalist id="grados-list">
                  {grados.map(grado => (
                    <option key={grado} value={grado} />
                  ))}
                </datalist>
                {errors.grado && <p className="text-red-500 text-xs mt-1">{errors.grado}</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                placeholder="Describe las características especiales de esta sección..."
              />
            </div>
          </div>

          {/* Información física y administrativa */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FiMapPin className="w-5 h-5 text-green-600" />
              <span>Información Administrativa</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aula *</label>
                <input
                  type="text"
                  value={formData.aula}
                  onChange={(e) => handleInputChange('aula', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.aula ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 101, A-12"
                />
                {errors.aula && <p className="text-red-500 text-xs mt-1">{errors.aula}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad *</label>
                <input
                  type="number"
                  value={formData.capacidad}
                  onChange={(e) => handleInputChange('capacidad', parseInt(e.target.value))}
                  min="1"
                  max={LIMITS.MAX_SECTION_CAPACITY}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.capacidad ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.capacidad && <p className="text-red-500 text-xs mt-1">{errors.capacidad}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año Académico</label>
                <input
                  type="number"
                  value={formData.año}
                  onChange={(e) => handleInputChange('año', parseInt(e.target.value))}
                  min="2020"
                  max="2030"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiUser className="w-4 h-4 mr-1" />
                Tutor de Aula
              </label>
              <select
                value={formData.tutorId}
                onChange={(e) => handleInputChange('tutorId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
              >
                <option value="">Sin tutor asignado</option>
                {usuarios
                  ?.filter(user => user.rol === 'tutor')
                  .map(tutor => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.nombre} {tutor.apellidos} - {tutor.email}
                    </option>
                  ))
                }
              </select>
              <p className="text-xs text-gray-500 mt-1">
                El tutor asignado será responsable de esta sección
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <AnimatedButton
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </AnimatedButton>
          
          <AnimatedButton
            variant="primary"
            icon={FiSave}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Guardando...' : section ? 'Actualizar' : 'Crear Sección'}
          </AnimatedButton>
        </div>
      </motion.div>
    </div>
  )
}

export default SectionModal