// Servicio de API
// Este archivo contiene todas las llamadas a la API real
// Usa la configuración centralizada para endpoints y timeouts

import { config, log } from '../config'

class ApiService {
  constructor() {
    this.baseURL = config.api.baseURL
    this.timeout = config.api.timeout
    this.retryAttempts = config.api.retryAttempts
    this.retryDelay = config.api.retryDelay
  }

  // Método base para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      signal: controller.signal
    }

    const finalOptions = { ...defaultOptions, ...options }
    
    try {
      log.debug(`API Request: ${options.method || 'GET'} ${url}`)
      
      const response = await fetch(url, finalOptions)
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      log.debug(`API Response: ${url}`, data)
      
      return data
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        log.error(`Request timeout: ${url}`)
        throw new Error('La solicitud ha excedido el tiempo de espera')
      }
      
      log.error(`API Error: ${url}`, error)
      throw error
    }
  }

  // Obtener headers de autenticación
  getAuthHeaders() {
    const token = localStorage.getItem(config.auth.tokenKey)
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Método con reintentos
  async requestWithRetry(endpoint, options = {}, attemptCount = 0) {
    try {
      return await this.request(endpoint, options)
    } catch (error) {
      if (attemptCount < this.retryAttempts - 1) {
        log.warn(`Reintentando petición (${attemptCount + 1}/${this.retryAttempts}): ${endpoint}`)
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        return this.requestWithRetry(endpoint, options, attemptCount + 1)
      }
      throw error
    }
  }

  // ==================== USUARIOS ====================
  users = {
    getAll: () => this.request('/users'),
    getById: (id) => this.request(`/users/${id}`),
    getByEmail: (email) => this.request(`/users/email/${email}`),
    create: (data) => this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => this.request(`/users/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== ESTUDIANTES ====================
  students = {
    getAll: () => this.request('/students'),
    getById: (id) => this.request(`/students/${id}`),
    getByParent: (parentEmail) => this.request(`/students/parent/${parentEmail}`),
    create: (data) => this.request('/students', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => this.request(`/students/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== COMUNICADOS ====================
  communiques = {
    getAll: () => this.request('/communiques'),
    getById: (id) => this.request(`/communiques/${id}`),
    create: (data) => this.request('/communiques', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => this.request(`/communiques/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => this.request(`/communiques/${id}`, {
      method: 'DELETE'
    }),
    markAsRead: (id, userId) => this.request(`/communiques/${id}/read`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    })
  }

  // ==================== ASISTENCIA ====================
  attendance = {
    getAll: (filters) => {
      const params = new URLSearchParams(filters).toString()
      return this.request(`/attendance${params ? `?${params}` : ''}`)
    },
    record: (data) => this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => this.request(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    getStats: (studentId) => this.request(`/attendance/stats/${studentId}`)
  }

  // ==================== PAGOS ====================
  payments = {
    getAll: (filters) => {
      const params = new URLSearchParams(filters).toString()
      return this.request(`/payments${params ? `?${params}` : ''}`)
    },
    getById: (id) => this.request(`/payments/${id}`),
    create: (data) => this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    approve: (id, data) => this.request(`/payments/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    reject: (id, data) => this.request(`/payments/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    uploadVoucher: (formData) => this.request('/payments/upload', {
      method: 'POST',
      body: formData,
      headers: {
        ...this.getAuthHeaders()
        // No incluir Content-Type para FormData
      }
    })
  }

  // ==================== CALIFICACIONES ====================
  grades = {
    getAll: (filters) => {
      const params = new URLSearchParams(filters).toString()
      return this.request(`/grades${params ? `?${params}` : ''}`)
    },
    getById: (id) => this.request(`/grades/${id}`),
    create: (data) => this.request('/grades', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => this.request(`/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => this.request(`/grades/${id}`, {
      method: 'DELETE'
    }),
    bulkCreate: (grades) => this.request('/grades/bulk', {
      method: 'POST',
      body: JSON.stringify({ grades })
    })
  }

  // ==================== MENSAJES ====================
  messages = {
    getByUser: (userId) => this.request(`/messages/user/${userId}`),
    getConversation: (userId1, userId2) => 
      this.request(`/messages/conversation/${userId1}/${userId2}`),
    send: (data) => this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    markAsRead: (id) => this.request(`/messages/${id}/read`, {
      method: 'PUT'
    }),
    delete: (id) => this.request(`/messages/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== CURSOS ====================
  courses = {
    getAll: () => this.request('/courses'),
    getById: (id) => this.request(`/courses/${id}`),
    create: (data) => this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => this.request(`/courses/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== ASIGNACIONES ====================
  assignments = {
    getAll: () => this.request('/assignments'),
    getByTeacher: (teacherId) => this.request(`/assignments/teacher/${teacherId}`),
    getByStudent: (studentId) => this.request(`/assignments/student/${studentId}`),
    create: (data) => this.request('/assignments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => this.request(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => this.request(`/assignments/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== REPORTES ====================
  reports = {
    getStudentReport: (studentId, period) => 
      this.request(`/reports/student/${studentId}?period=${period}`),
    getClassReport: (classId, period) => 
      this.request(`/reports/class/${classId}?period=${period}`),
    getAttendanceReport: (filters) => {
      const params = new URLSearchParams(filters).toString()
      return this.request(`/reports/attendance?${params}`)
    },
    getPaymentReport: (filters) => {
      const params = new URLSearchParams(filters).toString()
      return this.request(`/reports/payments?${params}`)
    },
    generatePDF: (type, data) => this.request('/reports/pdf', {
      method: 'POST',
      body: JSON.stringify({ type, data })
    })
  }

  // ==================== NOTIFICACIONES ====================
  notifications = {
    getByUser: (userId) => this.request(`/notifications/user/${userId}`),
    markAsRead: (id) => this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    }),
    markAllAsRead: (userId) => this.request(`/notifications/user/${userId}/read-all`, {
      method: 'PUT'
    }),
    create: (data) => this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ==================== CONFIGURACIÓN ====================
  configuration = {
    getAll: () => this.request('/configuration'),
    update: (data) => this.request('/configuration', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    getByKey: (key) => this.request(`/configuration/${key}`)
  }

  // ==================== AUTENTICACIÓN ====================
  auth = {
    login: (credentials) => this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    logout: () => this.request('/auth/logout', {
      method: 'POST'
    }),
    refresh: (refreshToken) => this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    }),
    changePassword: (data) => this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    resetPassword: (email) => this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
    verifyToken: (token) => this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }
}

// Exportar instancia única
const apiService = new ApiService()
export default apiService