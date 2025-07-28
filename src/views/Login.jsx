import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import useAuthStore from '../stores/authStore'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { testLogin } from '../utils/testLogin'

const MySwal = withReactContent(Swal)

const Login = () => {
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    rol: 'padre'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [cargando, setCargando] = useState(false)
  
  const { login } = useAuthStore()
  const navigate = useNavigate()

  // Test de datos en desarrollo
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 Ejecutando test de login...')
      testLogin()
    }
  }, [])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    
    try {
      const resultado = await login(formData)
      
      if (resultado.success) {
        MySwal.fire({
          title: '¡Bienvenido!',
          text: `Hola ${resultado.usuario.nombre}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
        
        setTimeout(() => {
          const routes = {
            padre: '/parent/dashboard',
            tutor: '/tutor/dashboard',
            admin: '/admin/dashboard',
            entrada: '/scanner/dashboard'
          }
          navigate(routes[resultado.usuario.rol])
        }, 1000)
      } else {
        MySwal.fire({
          title: 'Error de acceso',
          text: resultado.error,
          icon: 'error'
        })
      }
    } catch (error) {
      MySwal.fire({
        title: 'Error',
        text: 'Ocurrió un error inesperado',
        icon: 'error'
      })
    } finally {
      setCargando(false)
    }
  }
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const usuariosDemo = [
    { email: 'carlos.rodriguez@email.com', rol: 'padre', nombre: 'Carlos Rodríguez', descripcion: 'Padre de María y José' },
    { email: 'miguel.martinez@email.com', rol: 'padre', nombre: 'Miguel Martinez', descripcion: 'Padre de Ana' },
    { email: 'tutor1@email.com', rol: 'tutor', nombre: 'María García', descripcion: 'Profesora de 5to Grado' },
    { email: 'admin@talentos.edu', rol: 'admin', nombre: 'Dr. Juan Pérez', descripcion: 'Director Académico' },
    { email: 'entrada@talentos.edu', rol: 'entrada', nombre: 'Pedro Sánchez', descripcion: 'Personal de Seguridad' }
  ]

  // Login rápido por rol
  const loginRapido = (usuario) => {
    setFormData({
      usuario: usuario.email,
      password: '123456',
      rol: usuario.rol
    })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-talentos-primary to-talentos-secondary flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-6 sm:space-y-8"
      >
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="text-center">
            <motion.img
              src="/logo-talentos.jpeg"
              alt="Talentos College"
              className="h-24 sm:h-32 mx-auto mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            />
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl sm:text-3xl font-bold text-talentos-primary mb-2"
            >
              Talentos College
            </motion.h1>
            <p className="text-gray-600">Sistema de Comunicación Escolar</p>
          </div>
          
          <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-2">
                Usuario (Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="usuario"
                  name="usuario"
                  type="email"
                  required
                  value={formData.usuario}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="ejemplo@email.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Recordar sesión */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-talentos-primary focus:ring-talentos-accent border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordar sesión
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  className="text-talentos-primary hover:text-talentos-secondary transition-colors"
                  onClick={() => MySwal.fire({
                    title: 'Recuperar contraseña',
                    text: 'Contacta al administrador del sistema para recuperar tu contraseña',
                    icon: 'info'
                  })}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
            
            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={cargando}
                className="btn-primary w-full py-2.5 sm:py-3 text-base sm:text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </motion.button>
            </div>
          </form>
          
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Usuarios de prueba:</h3>
            <div className="space-y-2 max-h-48 sm:max-h-none overflow-y-auto sm:overflow-visible">
              {usuariosDemo.map((usuario, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    // Solo llenar el formulario
                    setFormData({
                      usuario: usuario.email,
                      password: '123456',
                      rol: usuario.rol
                    })
                  }}
                  className="w-full text-left p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{usuario.nombre}</p>
                      <p className="text-xs text-gray-500 mb-1">{usuario.email}</p>
                      <p className="text-xs text-gray-600 italic">{usuario.descripcion}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-xs bg-talentos-light text-talentos-dark px-2 py-1 rounded-full capitalize">
                        {usuario.rol}
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        Click para llenar
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Contraseña para todos: <strong>123456</strong>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login