import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiX, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiSave,
  FiCamera
} from 'react-icons/fi'
import useAuthStore from '../../stores/authStore'
import { showSuccess, showError } from '../../utils/sweetAlert'

const ProfileEditModal = ({ isOpen, onClose }) => {
  const { usuario, updateProfile } = useAuthStore()
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    apellidos: usuario?.apellidos || '',
    email: usuario?.email || '',
    telefono: usuario?.telefono || '',
    direccion: usuario?.direccion || '',
    avatar: usuario?.avatar || ''
  })
  const [loading, setLoading] = useState(false)

  // Actualizar formulario cuando cambia el usuario o se abre el modal
  useEffect(() => {
    if (isOpen && usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        apellidos: usuario.apellidos || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        avatar: usuario.avatar || ''
      })
    }
  }, [isOpen, usuario])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Llamar función updateProfile del authStore
      const resultado = await updateProfile(formData)
      
      if (resultado.success) {
        showSuccess('Perfil actualizado', 'Tu información ha sido actualizada correctamente')
        onClose()
      } else {
        showError('Error', resultado.error || 'No se pudo actualizar el perfil')
      }
    } catch (error) {
      showError('Error', 'No se pudo actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = () => {
    // TODO: Implementar carga de avatar
    showError('Función en desarrollo', 'La carga de avatar estará disponible pronto')
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
          <h2 className="text-xl font-semibold text-gray-900">Editar Perfil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 bg-talentos-primary rounded-full flex items-center justify-center">
                {formData.avatar ? (
                  <img 
                    src={formData.avatar} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FiUser className="w-8 h-8 text-white" />
                )}
              </div>
              <button
                type="button"
                onClick={handleAvatarChange}
                className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <FiCamera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombres
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent"
                  placeholder="Tus nombres"
                  required
                />
              </div>
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent"
                  placeholder="Tus apellidos"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent bg-gray-50"
                  placeholder="tu@email.com"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El email no se puede cambiar por seguridad
              </p>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent"
                  placeholder="+51 999 999 999"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent"
                  placeholder="Tu dirección"
                />
              </div>
            </div>
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
                  <FiSave className="w-4 h-4" />
                  <span>Guardar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ProfileEditModal