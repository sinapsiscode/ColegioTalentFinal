import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiX, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiKey,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi'
import useAuthStore from '../../stores/authStore'
import { showSuccess, showError } from '../../utils/sweetAlert'

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { changePassword } = useAuthStore()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Calcular fortaleza de contraseña solo para nueva contraseña
    if (name === 'newPassword') {
      calculatePasswordStrength(value)
    }
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    
    // Criterios de fortaleza
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    
    setPasswordStrength(strength)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    if (passwordStrength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Débil'
    if (passwordStrength <= 3) return 'Regular'
    if (passwordStrength <= 4) return 'Buena'
    return 'Muy fuerte'
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const validateForm = () => {
    if (!formData.currentPassword) {
      showError('Error', 'Ingresa tu contraseña actual')
      return false
    }
    
    if (formData.newPassword.length < 6) {
      showError('Error', 'La nueva contraseña debe tener al menos 6 caracteres')
      return false
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      showError('Error', 'Las contraseñas no coinciden')
      return false
    }
    
    if (formData.currentPassword === formData.newPassword) {
      showError('Error', 'La nueva contraseña debe ser diferente a la actual')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)

    try {
      const result = await changePassword(formData.currentPassword, formData.newPassword)
      
      if (result.success) {
        showSuccess('Contraseña actualizada', result.message || 'Tu contraseña ha sido cambiada exitosamente')
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setPasswordStrength(0)
        onClose()
      } else {
        showError('Error', result.error || 'No se pudo cambiar la contraseña')
      }
    } catch (error) {
      showError('Error', error.message || 'No se pudo cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-talentos-light rounded-full flex items-center justify-center">
              <FiKey className="w-5 h-5 text-talentos-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Cambiar Contraseña</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contraseña actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña actual
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent"
                placeholder="Contraseña actual"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva contraseña
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent"
                placeholder="Nueva contraseña"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Indicador de fortaleza */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Fortaleza:</span>
                  <span className={`font-medium ${
                    passwordStrength <= 2 ? 'text-red-600' : 
                    passwordStrength <= 3 ? 'text-yellow-600' : 
                    passwordStrength <= 4 ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent"
                placeholder="Confirmar nueva contraseña"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
              
              {/* Indicador de coincidencia */}
              {formData.confirmPassword && (
                <div className="absolute right-12 top-3">
                  {formData.newPassword === formData.confirmPassword ? (
                    <FiCheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <FiAlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recomendaciones de seguridad */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Recomendaciones:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Al menos 8 caracteres</li>
              <li>• Combina mayúsculas y minúsculas</li>
              <li>• Incluye números y símbolos</li>
              <li>• No uses información personal</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-talentos-primary text-white rounded-lg hover:bg-talentos-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FiKey className="w-4 h-4" />
                  <span>Cambiar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ChangePasswordModal