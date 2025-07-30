import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiX,
  FiBook,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiSave,
  FiUser
} from 'react-icons/fi'
import AnimatedButton from '../common/AnimatedButton'
import useCoursesStore from '../../stores/coursesStore'
import useAdminUsersStore from '../../stores/adminUsersStore'
import { showSuccess, showError } from '../../utils/sweetAlert'

const CourseModal = ({ isOpen, onClose, course = null }) => {
  const { createCourse, updateCourse } = useCoursesStore()
  const { usuarios, cargarUsuarios } = useAdminUsersStore()
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    grado: '',
    seccion: 'A',
    materia: '',
    horasSemanales: 4,
    aula: '',
    horario: '',
    capacidad: 30,
    fechaInicio: '',
    fechaFin: '',
    profesorId: null
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Cargar profesores al montar
  useEffect(() => {
    if (isOpen) {
      cargarUsuarios()
    }
  }, [isOpen, cargarUsuarios])

  // Inicializar formulario
  useEffect(() => {
    if (course) {
      setFormData({
        codigo: course.codigo || '',
        nombre: course.nombre || '',
        descripcion: course.descripcion || '',
        grado: course.grado || '',
        seccion: course.seccion || 'A',
        materia: course.materia || '',
        horasSemanales: course.horasSemanales || 4,
        aula: course.aula || '',
        horario: course.horario || '',
        capacidad: course.capacidad || 30,
        fechaInicio: course.fechaInicio || '',
        fechaFin: course.fechaFin || '',
        profesorId: course.profesor?.id || null
      })
    } else {
      // Reset form para nuevo curso
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        grado: '',
        seccion: 'A',
        materia: '',
        horasSemanales: 4,
        aula: '',
        horario: '',
        capacidad: 30,
        fechaInicio: '',
        fechaFin: '',
        profesorId: null
      })
    }
    setErrors({})
  }, [course, isOpen])

  // Filtrar solo profesores/tutores
  const profesores = usuarios.filter(u => u.rol === 'tutor' || u.rol === 'profesor')

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
    
    if (!formData.codigo.trim()) newErrors.codigo = 'El código es requerido'
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida'
    if (!formData.grado.trim()) newErrors.grado = 'El grado es requerido'
    if (!formData.materia.trim()) newErrors.materia = 'La materia es requerida'
    
    if (formData.horasSemanales < 1) newErrors.horasSemanales = 'Las horas deben ser mayor a 0'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const result = course
        ? await updateCourse(course.id, formData)
        : await createCourse(formData)
      
      if (result.success) {
        showSuccess(
          course ? 'Curso actualizado' : 'Curso creado',
          `El curso ${formData.nombre} ha sido ${course ? 'actualizado' : 'creado'} correctamente`
        )
        onClose()
      } else {
        showError('Error', result.error || 'No se pudo guardar el curso')
      }
    } catch (error) {
      showError('Error', 'Ocurrió un error al guardar el curso')
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

  // Lista de materias para primaria (editable según necesidades del colegio)
  const materias = [
    'Matemáticas', 'Comunicación', 'Ciencias', 'Personal Social',
    'Inglés', 'Arte', 'Educación Física', 'Computación', 'Religión'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {course ? 'Editar Curso' : 'Nuevo Curso'}
            </h2>
            <p className="text-gray-600 mt-1">
              {course ? 'Modifica la información del curso' : 'Completa los datos para crear un nuevo curso'}
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
              <FiBook className="w-5 h-5 text-blue-600" />
              <span>Información del Curso</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.codigo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: MAT-5A"
                />
                {errors.codigo && <p className="text-red-500 text-xs mt-1">{errors.codigo}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Curso *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.nombre ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Matemáticas 5° Primaria A"
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                  errors.descripcion ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe el contenido y objetivos del curso..."
              />
              {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
            </div>
          </div>

          {/* Detalles académicos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FiCalendar className="w-5 h-5 text-purple-600" />
              <span>Detalles Académicos</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sección *</label>
                <select
                  value={formData.seccion}
                  onChange={(e) => handleInputChange('seccion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materia *</label>
                <input
                  type="text"
                  value={formData.materia}
                  onChange={(e) => handleInputChange('materia', e.target.value)}
                  list="materias-list"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.materia ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Matemáticas"
                />
                <datalist id="materias-list">
                  {materias.map(materia => (
                    <option key={materia} value={materia} />
                  ))}
                </datalist>
                {errors.materia && <p className="text-red-500 text-xs mt-1">{errors.materia}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horas/Semana *</label>
                <input
                  type="number"
                  value={formData.horasSemanales}
                  onChange={(e) => handleInputChange('horasSemanales', parseInt(e.target.value))}
                  min="1"
                  max="20"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.horasSemanales ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.horasSemanales && <p className="text-red-500 text-xs mt-1">{errors.horasSemanales}</p>}
              </div>
            </div>
          </div>


          {/* Profesor asignado */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FiUser className="w-5 h-5 text-orange-600" />
              <span>Profesor Asignado</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Profesor</label>
              <select
                value={formData.profesorId || ''}
                onChange={(e) => handleInputChange('profesorId', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
              >
                <option value="">Sin profesor asignado</option>
                {profesores.map(profesor => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombre} {profesor.apellidos} - {profesor.email}
                    {profesor.especialidad && ` (${profesor.especialidad})`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Puedes asignar un profesor ahora o hacerlo más tarde
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
            {loading ? 'Guardando...' : course ? 'Actualizar' : 'Crear Curso'}
          </AnimatedButton>
        </div>
      </motion.div>
    </div>
  )
}

export default CourseModal