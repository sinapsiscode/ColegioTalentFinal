import { create } from 'zustand'
import dataService from '../services/dataService'
import { config, log } from '../config'
import { DEFAULTS } from '../utils/constants'

const useAuthStore = create((set, get) => ({
  usuario: null,
  rol: null,
  isAuthenticated: false,
  permisos: [],
  loading: false,
  error: null,
  
  // Login function - ready for backend integration
  login: async (userData) => {
    try {
      set({ loading: true, error: null })
      
      // Use data service for abstraction
      const email = userData.usuario
      const password = userData.password
      
      try {
        // Simulate delay for mock data
        await dataService.simulateDelay()
        
        // Try to get user by email
        const usuarioEncontrado = await dataService.getUserByEmail(email)
        
        log.debug('🔍 AUTH DEBUG:')
        log.debug('- Email buscado:', email)
        log.debug('- Usuario encontrado:', usuarioEncontrado ? { id: usuarioEncontrado.id, nombre: usuarioEncontrado.nombre, rol: usuarioEncontrado.rol } : 'NO ENCONTRADO')
        
        // Verificar contraseña (puede ser la universal o específica del usuario)
        const passwordValida = password === DEFAULTS.PASSWORD || 
          (usuarioEncontrado?.password_hash && password === usuarioEncontrado.password_hash.replace('hashed_', ''))
        
        if (usuarioEncontrado && passwordValida) {
          const permisos = get().getPermisosPorRol(usuarioEncontrado.rol)
          
          // Simular token JWT (el backend enviará uno real)
          const mockToken = `mock_token_${Date.now()}`
          localStorage.setItem('auth_token', mockToken)
          
          set({
            usuario: usuarioEncontrado,
            rol: usuarioEncontrado.rol,
            isAuthenticated: true,
            permisos,
            loading: false
          })

          // 🔔 Inicializar sistema de notificaciones
          const useNotificationsStore = await import('../stores/notificationsStore')
          const notificationsStore = useNotificationsStore.default.getState()
          notificationsStore.inicializar(usuarioEncontrado.id, usuarioEncontrado.rol)
          
          return { success: true, usuario: usuarioEncontrado }
        }
        
        set({ loading: false, error: 'Credenciales incorrectas' })
        return { success: false, error: 'Credenciales incorrectas' }
      } catch (error) {
        log.error('Error en login:', error)
        set({ loading: false, error: 'Error de autenticación' })
        return { success: false, error: 'Error de autenticación' }
      }
      
    } catch (error) {
      console.error('Login error:', error)
      set({ loading: false, error: error.message || 'Error de conexión' })
      return { success: false, error: error.message || 'Error de conexión' }
    }
  },
  
  // Logout function - ready for backend
  logout: async () => {
    try {
      // Clear auth tokens
      const token = localStorage.getItem(config.auth.tokenKey)
      if (token && !token.startsWith('mock_')) {
        try {
          // Only call logout API for real tokens
          // await apiService.auth.logout()
        } catch (error) {
          log.warn('Error al hacer logout en el servidor:', error)
        }
      }
      
      // Limpiar tokens del storage
      localStorage.removeItem(config.auth.tokenKey)
      localStorage.removeItem(config.auth.refreshTokenKey)
      
      set({
        usuario: null,
        rol: null,
        isAuthenticated: false,
        permisos: [],
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  },
  
  // Update profile function - ready for backend
  updateProfile: async (profileData) => {
    try {
      set({ loading: true, error: null })
      
      const { usuario } = get()
      if (!usuario) throw new Error('No hay usuario autenticado')
      
      const updatedUser = await dataService.updateUser(usuario.id, profileData)
      
      if (updatedUser) {
        set({
          usuario: updatedUser,
          loading: false
        })
        
        return { success: true, usuario: updatedUser }
      } else {
        throw new Error('Error al actualizar el perfil')
      }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },
  
  // Change password function - ready for backend
  changePassword: async (currentPassword, newPassword) => {
    try {
      set({ loading: true, error: null })
      
      // For mock data, just validate password
      if (config.features.useMockData) {
        if (currentPassword !== '123456') {
          set({ loading: false, error: 'Contraseña actual incorrecta' })
          return { success: false, error: 'Contraseña actual incorrecta' }
        }
        
        set({ loading: false })
        return { success: true, message: 'Contraseña actualizada correctamente' }
      }
      
      // Real API would be called here
      set({ loading: false })
      return { success: true, message: 'Función no disponible en modo desarrollo' }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },
  
  // Check if user is authenticated (useful for route guards)
  checkAuth: async () => {
    try {
      const token = localStorage.getItem(config.auth.tokenKey)
      if (!token) {
        return false
      }

      // Mock check - just verify token exists
      if (token.startsWith('mock_token_')) {
        return true
      }
      
      // Real API token verification would go here
      return false
    } catch (error) {
      console.error('Auth check error:', error)
      return false
    }
  },
  
  getPermisosPorRol: (rol) => {
    const permisos = {
      padre: ['ver_asistencia', 'ver_mensajes', 'enviar_mensajes', 'ver_notas', 'ver_comunicados', 'subir_vouchers', 'ver_pagos'],
      tutor: ['ver_alumnos', 'enviar_mensajes', 'crear_comunicados', 'ver_asistencia_grupo'],
      admin: ['gestionar_usuarios', 'ver_reportes', 'enviar_comunicados_masivos', 'gestionar_sistema', 'gestionar_pagos', 'aprobar_pagos', 'ver_reportes_pagos', 'gestionar_conceptos_pago'],
      entrada: ['registrar_asistencia', 'escanear_qr']
    }
    
    return permisos[rol] || []
  },
  
  tienePermiso: (permiso) => {
    const { permisos } = get()
    return permisos.includes(permiso)
  },
  
  // Initialize authentication on app startup
  initializeAuth: async () => {
    try {
      const token = localStorage.getItem(config.auth.tokenKey)
      if (!token) {
        return false
      }
      
      // Restore authentication state
      const isValid = await get().checkAuth()
      return isValid
    } catch (error) {
      console.error('Initialize auth error:', error)
      return false
    }
  },

  // Session timeout handling
  handleSessionTimeout: () => {
    get().logout()
    // Optional: Show session timeout message
    console.warn('Sesión expirada. Redirigiendo al login...')
  },

  // Check if session is still valid
  validateSession: () => {
    const token = localStorage.getItem(config.auth.tokenKey)
    if (!token) return false
    
    // For mock tokens, check if they're not too old
    if (token.startsWith('mock_token_')) {
      const timestamp = token.split('_')[2]
      const tokenAge = Date.now() - parseInt(timestamp)
      const maxAge = config.auth.rememberMeDuration || 24 * 60 * 60 * 1000
      
      if (tokenAge > maxAge) {
        get().handleSessionTimeout()
        return false
      }
    }
    
    return true
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // ==============================================================
  // GESTIÓN DE USUARIOS (ADMIN)
  // ==============================================================
  
  // Obtener lista de todos los usuarios
  getAllUsers: async () => {
    try {
      set({ loading: true, error: null })
      
      const usuarios = await dataService.getUsers()
      set({ loading: false })
      return { success: true, data: usuarios }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Crear nuevo usuario
  createUser: async (userData) => {
    try {
      set({ loading: true, error: null })
      
      const newUser = await dataService.createUser({
        ...userData,
        password_hash: `hashed_${userData.password}`,
        estado: 'activo'
      })
      
      set({ loading: false })
      return { success: true, data: newUser, message: 'Usuario creado exitosamente' }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Actualizar usuario
  updateUser: async (userId, userData) => {
    try {
      set({ loading: true, error: null })
      
      const updatedUser = await dataService.updateUser(userId, userData)
      
      // Si es el usuario actual, actualizar el estado
      const currentUser = get().usuario
      if (currentUser && currentUser.id === userId) {
        set({ usuario: updatedUser })
      }
      
      set({ loading: false })
      return { success: true, data: updatedUser, message: 'Usuario actualizado exitosamente' }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Cambiar contraseña de usuario (por admin)
  changeUserPassword: async (userId, newPassword) => {
    try {
      set({ loading: true, error: null })
      
      await dataService.updateUser(userId, {
        password_hash: `hashed_${newPassword}`
      })
      
      set({ loading: false })
      return { success: true, message: 'Contraseña actualizada exitosamente' }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Activar/Desactivar usuario
  toggleUserStatus: async (userId, status) => {
    try {
      set({ loading: true, error: null })
      
      const updatedUser = await dataService.updateUser(userId, {
        estado: status
      })
      
      set({ loading: false })
      return { success: true, data: updatedUser, message: `Usuario ${status === 'activo' ? 'activado' : 'desactivado'} exitosamente` }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Actualizar perfil del usuario actual
  updateProfile: async (profileData) => {
    try {
      set({ loading: true, error: null })
      
      const currentUser = get().usuario
      if (!currentUser) {
        return { success: false, error: 'No hay usuario autenticado' }
      }
      
      const updatedUser = await dataService.updateUser(currentUser.id, profileData)
      
      // Actualizar estado del usuario actual
      set({ usuario: updatedUser, loading: false })
      
      return { success: true, data: updatedUser, message: 'Perfil actualizado exitosamente' }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Cambiar contraseña del usuario actual
  changePassword: async (currentPassword, newPassword) => {
    try {
      set({ loading: true, error: null })

      const currentUser = get().usuario
      if (!currentUser) {
        return { success: false, error: 'No hay usuario autenticado' }
      }

      // For mock data, verify current password
      if (config.features.useMockData) {
        const storedPassword = currentUser.password_hash?.replace('hashed_', '') || '123456'
        if (currentPassword !== storedPassword && currentPassword !== '123456') {
          set({ loading: false, error: 'Contraseña actual incorrecta' })
          return { success: false, error: 'Contraseña actual incorrecta' }
        }

        // Update password
        const updatedUser = await dataService.updateUser(currentUser.id, {
          password_hash: `hashed_${newPassword}`
        })

        set({ usuario: updatedUser, loading: false })
        return { success: true, message: 'Contraseña cambiada exitosamente' }
      }
      
      // Real API would be called here
      set({ loading: false })
      return { success: false, error: 'Función no disponible en modo desarrollo' }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // ==============================================================
  // GESTIÓN DE RELACIONES PADRE-HIJO
  // ==============================================================

  // Obtener hijos asignados a un padre
  getChildrenByParent: async (parentUserId) => {
    try {
      set({ loading: true, error: null })
      
      // Get parent user to find email
      const parentUser = await dataService.getUserById(parentUserId)
      if (!parentUser) {
        throw new Error('Usuario padre no encontrado')
      }
      
      const children = await dataService.getStudentsByParent(parentUser.email)
      set({ loading: false })
      return { success: true, data: children }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Asignar hijos a un padre
  assignChildrenToParent: async (parentUserId, studentIds, relationshipType = 'padre') => {
    try {
      set({ loading: true, error: null })
      
      // This would need to be implemented in dataService
      // For now, return a mock response
      log.warn('assignChildrenToParent not yet implemented in dataService')
      
      set({ loading: false })
      return { 
        success: true, 
        data: [],
        message: `Función de asignación no implementada aún`
      }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Obtener estudiantes disponibles para asignar a un padre
  getAvailableStudents: async (parentUserId = null) => {
    try {
      set({ loading: true, error: null })
      
      // Get all students
      const allStudents = await dataService.getStudents()
      
      // If parentUserId provided, filter out already assigned
      let availableStudents = allStudents
      if (parentUserId) {
        const parentUser = await dataService.getUserById(parentUserId)
        if (parentUser) {
          const assignedStudents = await dataService.getStudentsByParent(parentUser.email)
          const assignedIds = assignedStudents.map(s => s.id)
          availableStudents = allStudents.filter(s => !assignedIds.includes(s.id))
        }
      }
      
      set({ loading: false })
      return { success: true, data: availableStudents }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Remover un hijo de un padre
  removeChildFromParent: async (parentUserId, studentId) => {
    try {
      set({ loading: true, error: null })
      
      // This would need to be implemented in dataService
      log.warn('removeChildFromParent not yet implemented in dataService')
      
      set({ loading: false })
      return { success: true, message: 'Función de remoción no implementada aún' }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  }
}))

export default useAuthStore