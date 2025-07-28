// API Service Layer - Preparado para Backend
import axios from 'axios'

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    // Si el token expiró, intentar renovarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await apiClient.post('/auth/refresh', {
            refreshToken
          })
          
          const { token } = response.data
          localStorage.setItem('auth_token', token)
          
          // Reintentar la petición original
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Si no se puede renovar, cerrar sesión
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Funciones de API por módulo
export const authAPI = {
  // Autenticación
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
  
  // Perfil
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
}

export const studentsAPI = {
  // Estudiantes
  getAll: () => apiClient.get('/students'),
  getById: (id) => apiClient.get(`/students/${id}`),
  getByParent: (parentId) => apiClient.get(`/students/parent/${parentId}`),
  create: (data) => apiClient.post('/students', data),
  update: (id, data) => apiClient.put(`/students/${id}`, data),
  delete: (id) => apiClient.delete(`/students/${id}`),
}

export const gradesAPI = {
  // Calificaciones
  getByStudent: (studentId) => apiClient.get(`/grades/student/${studentId}`),
  getByClass: (classId) => apiClient.get(`/grades/class/${classId}`),
  create: (data) => apiClient.post('/grades', data),
  update: (id, data) => apiClient.put(`/grades/${id}`, data),
  delete: (id) => apiClient.delete(`/grades/${id}`),
  
  // Estadísticas
  getStatistics: (studentId, period) => apiClient.get(`/grades/statistics/${studentId}?period=${period}`),
}

export const attendanceAPI = {
  // Asistencia
  getByStudent: (studentId, dateRange) => apiClient.get(`/attendance/student/${studentId}`, { params: dateRange }),
  getByDate: (date) => apiClient.get(`/attendance/date/${date}`),
  register: (data) => apiClient.post('/attendance', data),
  update: (id, data) => apiClient.put(`/attendance/${id}`, data),
  
  // Estadísticas
  getStatistics: (studentId) => apiClient.get(`/attendance/statistics/${studentId}`),
  getDailyReport: (date) => apiClient.get(`/attendance/daily-report/${date}`),
}

export const messagesAPI = {
  // Mensajes
  getAll: (userId) => apiClient.get(`/messages/user/${userId}`),
  getConversation: (conversationId) => apiClient.get(`/messages/conversation/${conversationId}`),
  send: (data) => apiClient.post('/messages', data),
  markAsRead: (messageId) => apiClient.put(`/messages/${messageId}/read`),
  delete: (messageId) => apiClient.delete(`/messages/${messageId}`),
}

export const communiquesAPI = {
  // Comunicados
  getAll: (filters) => apiClient.get('/communiques', { params: filters }),
  getById: (id) => apiClient.get(`/communiques/${id}`),
  create: (data) => apiClient.post('/communiques', data),
  update: (id, data) => apiClient.put(`/communiques/${id}`, data),
  delete: (id) => apiClient.delete(`/communiques/${id}`),
  publish: (id) => apiClient.put(`/communiques/${id}/publish`),
  
  // Estadísticas
  getViews: (id) => apiClient.get(`/communiques/${id}/views`),
}

export const paymentsAPI = {
  // Pagos
  getByParent: (parentId) => apiClient.get(`/payments/parent/${parentId}`),
  getById: (id) => apiClient.get(`/payments/${id}`),
  create: (data) => apiClient.post('/payments', data),
  update: (id, data) => apiClient.put(`/payments/${id}`, data),
  uploadVoucher: (paymentId, file) => {
    const formData = new FormData()
    formData.append('voucher', file)
    return apiClient.post(`/payments/${paymentId}/voucher`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // Conceptos de pago
  getConcepts: () => apiClient.get('/payment-concepts'),
  createConcept: (data) => apiClient.post('/payment-concepts', data),
}

export const usersAPI = {
  // Usuarios (Admin)
  getAll: (filters) => apiClient.get('/users', { params: filters }),
  getById: (id) => apiClient.get(`/users/${id}`),
  create: (data) => apiClient.post('/users', data),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`),
  changeStatus: (id, status) => apiClient.put(`/users/${id}/status`, { status }),
}

export const reportsAPI = {
  // Reportes (Admin)
  getAttendanceReport: (filters) => apiClient.get('/reports/attendance', { params: filters }),
  getGradesReport: (filters) => apiClient.get('/reports/grades', { params: filters }),
  getPaymentsReport: (filters) => apiClient.get('/reports/payments', { params: filters }),
  getGeneralReport: (filters) => apiClient.get('/reports/general', { params: filters }),
  
  // Exportar reportes
  exportToPDF: (reportType, filters) => apiClient.get(`/reports/export/pdf/${reportType}`, { 
    params: filters,
    responseType: 'blob'
  }),
  exportToExcel: (reportType, filters) => apiClient.get(`/reports/export/excel/${reportType}`, { 
    params: filters,
    responseType: 'blob'
  }),
}

export const notificationsAPI = {
  // Notificaciones
  getAll: (userId) => apiClient.get(`/notifications/user/${userId}`),
  markAsRead: (notificationId) => apiClient.put(`/notifications/${notificationId}/read`),
  markAllAsRead: (userId) => apiClient.put(`/notifications/user/${userId}/read-all`),
  delete: (notificationId) => apiClient.delete(`/notifications/${notificationId}`),
  
  // Configuración
  getSettings: (userId) => apiClient.get(`/notifications/settings/${userId}`),
  updateSettings: (userId, settings) => apiClient.put(`/notifications/settings/${userId}`, settings),
}

// Funciones de utilidad
export const uploadAPI = {
  // Subida de archivos
  uploadFile: (file, type = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  deleteFile: (fileId) => apiClient.delete(`/upload/${fileId}`),
}

// Función para configurar interceptors personalizados
export const setupAPIInterceptors = (onUnauthorized, onError) => {
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        onUnauthorized?.()
      } else {
        onError?.(error)
      }
      return Promise.reject(error)
    }
  )
}

export default apiClient