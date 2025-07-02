import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBook,
  FiSettings,
  FiX,
  FiSave,
  FiEye,
  FiEyeOff
} from 'react-icons/fi'
import AnimatedButton from '../common/AnimatedButton'

const UserForm = ({ isOpen, onClose, onSave, usuario = null, configuraciones }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    tipo: 'profesor',
    telefono: '',
    documento: '',
    direccion: '',
    // Campos específicos por tipo
    materia: '',
    grado: '',
    experiencia: '',
    cargo: '',
    departamento: '',
    estudiante: '',
    ocupacion: '',
    empresa: '',
    fechaNacimiento: '',
    seccion: '',
    padre: '',
    // Campos de autenticación
    password: '',
    confirmPassword: '',
    // Permisos
    permisos: []
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setSaving] = useState(false)

  useEffect(() => {
    if (usuario) {
      // Modo edición
      setFormData({
        ...usuario,
        password: '',
        confirmPassword: '',
        permisos: usuario.permisos || []
      })
    } else {
      // Modo creación - resetear form
      setFormData({
        nombre: '',
        email: '',
        tipo: 'profesor',
        telefono: '',
        documento: '',
        direccion: '',
        materia: '',
        grado: '',
        experiencia: '',
        cargo: '',
        departamento: '',
        estudiante: '',
        ocupacion: '',
        empresa: '',
        fechaNacimiento: '',
        seccion: '',
        padre: '',
        password: '',
        confirmPassword: '',
        permisos: []
      })
    }
    setErrors({})
  }, [usuario, isOpen])

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

  const handleTipoChange = (nuevoTipo) => {
    setFormData(prev => ({
      ...prev,
      tipo: nuevoTipo,
      // Limpiar campos específicos del tipo anterior
      materia: '',
      grado: '',
      experiencia: '',
      cargo: '',
      departamento: '',
      estudiante: '',
      ocupacion: '',
      empresa: '',
      fechaNacimiento: '',
      seccion: '',
      padre: '',
      // Asignar permisos por defecto del nuevo tipo
      permisos: configuraciones?.rolesPermitidos?.[nuevoTipo] || []
    }))
  }

  const togglePermiso = (permiso) => {
    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permiso)
        ? prev.permisos.filter(p => p !== permiso)
        : [...prev.permisos, permiso]
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Validaciones básicas
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.email.trim()) newErrors.email = 'El email es requerido'
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido'
    if (!formData.documento.trim()) newErrors.documento = 'El documento es requerido'
    
    // Validación de contraseña (solo para nuevos usuarios)
    if (!usuario) {
      if (!formData.password) newErrors.password = 'La contraseña es requerida'
      if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres'
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }
    
    // Validaciones específicas por tipo
    switch (formData.tipo) {
      case 'profesor':
        if (!formData.materia.trim()) newErrors.materia = 'La materia es requerida'
        if (!formData.grado.trim()) newErrors.grado = 'El grado es requerido'
        break
      case 'administrativo':
        if (!formData.cargo.trim()) newErrors.cargo = 'El cargo es requerido'
        if (!formData.departamento.trim()) newErrors.departamento = 'El departamento es requerido'
        break
      case 'padre':
        if (!formData.estudiante.trim()) newErrors.estudiante = 'El nombre del estudiante es requerido'
        if (!formData.grado.trim()) newErrors.grado = 'El grado del estudiante es requerido'
        break
      case 'estudiante':
        if (!formData.grado.trim()) newErrors.grado = 'El grado es requerido'
        if (!formData.seccion.trim()) newErrors.seccion = 'La sección es requerida'
        if (!formData.padre.trim()) newErrors.padre = 'El padre/tutor es requerido'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSaving(true)
    
    try {
      // Preparar datos para envío
      const userData = { ...formData }
      
      // No enviar contraseñas vacías en modo edición
      if (usuario && !userData.password) {
        delete userData.password
        delete userData.confirmPassword
      }
      
      await onSave(userData)
      onClose()
    } catch (error) {
      console.error('Error guardando usuario:', error)
    } finally {
      setSaving(false)
    }
  }

  const renderCamposEspecificos = () => {
    switch (formData.tipo) {
      case 'profesor':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materia *</label>
                <input
                  type="text"
                  value={formData.materia}
                  onChange={(e) => handleInputChange('materia', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.materia ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Matemáticas"
                />
                {errors.materia && <p className="text-red-500 text-xs mt-1">{errors.materia}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grado *</label>
                <select
                  value={formData.grado}
                  onChange={(e) => handleInputChange('grado', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.grado ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar grado</option>
                  {configuraciones?.grados?.map(grado => (
                    <option key={grado} value={grado}>{grado}</option>
                  ))}
                </select>
                {errors.grado && <p className="text-red-500 text-xs mt-1">{errors.grado}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Años de Experiencia</label>
              <input
                type="number"
                value={formData.experiencia}
                onChange={(e) => handleInputChange('experiencia', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                placeholder="Ej: 5"
                min="0"
              />
            </div>
          </>
        )
        
      case 'administrativo':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cargo *</label>
              <input
                type="text"
                value={formData.cargo}
                onChange={(e) => handleInputChange('cargo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                  errors.cargo ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Secretaria Académica"
              />
              {errors.cargo && <p className="text-red-500 text-xs mt-1">{errors.cargo}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamento *</label>
              <select
                value={formData.departamento}
                onChange={(e) => handleInputChange('departamento', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                  errors.departamento ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar departamento</option>
                {configuraciones?.departamentos?.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.departamento && <p className="text-red-500 text-xs mt-1">{errors.departamento}</p>}
            </div>
          </div>
        )
        
      case 'padre':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Estudiante *</label>
                <input
                  type="text"
                  value={formData.estudiante}
                  onChange={(e) => handleInputChange('estudiante', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.estudiante ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre completo del estudiante"
                />
                {errors.estudiante && <p className="text-red-500 text-xs mt-1">{errors.estudiante}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grado del Estudiante *</label>
                <select
                  value={formData.grado}
                  onChange={(e) => handleInputChange('grado', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.grado ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar grado</option>
                  {configuraciones?.grados?.filter(g => g !== 'Todos').map(grado => (
                    <option key={grado} value={grado}>{grado}</option>
                  ))}
                </select>
                {errors.grado && <p className="text-red-500 text-xs mt-1">{errors.grado}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ocupación</label>
                <input
                  type="text"
                  value={formData.ocupacion}
                  onChange={(e) => handleInputChange('ocupacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  placeholder="Ej: Ingeniero"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                <input
                  type="text"
                  value={formData.empresa}
                  onChange={(e) => handleInputChange('empresa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  placeholder="Nombre de la empresa"
                />
              </div>
            </div>
          </>
        )
        
      case 'estudiante':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grado *</label>
                <select
                  value={formData.grado}
                  onChange={(e) => handleInputChange('grado', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.grado ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar grado</option>
                  {configuraciones?.grados?.filter(g => g !== 'Todos').map(grado => (
                    <option key={grado} value={grado}>{grado}</option>
                  ))}
                </select>
                {errors.grado && <p className="text-red-500 text-xs mt-1">{errors.grado}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sección *</label>
                <select
                  value={formData.seccion}
                  onChange={(e) => handleInputChange('seccion', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.seccion ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar sección</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                {errors.seccion && <p className="text-red-500 text-xs mt-1">{errors.seccion}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Padre/Tutor *</label>
              <input
                type="text"
                value={formData.padre}
                onChange={(e) => handleInputChange('padre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                  errors.padre ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre del padre o tutor"
              />
              {errors.padre && <p className="text-red-500 text-xs mt-1">{errors.padre}</p>}
            </div>
          </>
        )
        
      default:
        return null
    }
  }

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
              {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <p className="text-gray-600 mt-1">
              {usuario ? 'Modifica la información del usuario' : 'Completa los datos para crear un nuevo usuario'}
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
              <FiUser className="w-5 h-5 text-blue-600" />
              <span>Información Básica</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.nombre ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre completo"
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuario *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                >
                  {Object.entries(configuraciones?.tiposUsuario || {}).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  placeholder="+51 999 123 456"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Documento *</label>
                <input
                  type="text"
                  value={formData.documento}
                  onChange={(e) => handleInputChange('documento', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                    errors.documento ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="DNI/Pasaporte"
                />
                {errors.documento && <p className="text-red-500 text-xs mt-1">{errors.documento}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                placeholder="Dirección completa"
              />
            </div>
          </div>

          {/* Campos específicos del tipo */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FiSettings className="w-5 h-5 text-purple-600" />
              <span>Información Específica</span>
            </h3>
            
            {renderCamposEspecificos()}
          </div>

          {/* Autenticación */}
          {!usuario && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FiSettings className="w-5 h-5 text-green-600" />
                <span>Credenciales de Acceso</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent pr-10 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirma la contraseña"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Permisos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FiSettings className="w-5 h-5 text-orange-600" />
              <span>Permisos de Acceso</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(configuraciones?.permisos || {}).map(([permiso, descripcion]) => (
                <div key={permiso} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={permiso}
                    checked={formData.permisos.includes(permiso)}
                    onChange={() => togglePermiso(permiso)}
                    className="w-4 h-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                  />
                  <label htmlFor={permiso} className="text-sm text-gray-700 cursor-pointer">
                    {descripcion}
                  </label>
                </div>
              ))}
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
            {loading ? 'Guardando...' : usuario ? 'Actualizar' : 'Crear Usuario'}
          </AnimatedButton>
        </div>
      </motion.div>
    </div>
  )
}

export default UserForm