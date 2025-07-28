/**
 * ApiService - Servicio para conectar con el backend de Node.js
 * 
 * INSTRUCCIONES DE USO:
 * 1. Crea tu API de Node.js en otra carpeta (ej: ../backend-talentos/)
 * 2. Cambia la URL base en el .env
 * 3. Descomenta las líneas en los stores para usar métodos reales
 */

class ApiService {
  constructor() {
    // URL base de tu API de Node.js (cambiar en .env)
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'
    
    // Token de autenticación
    this.token = localStorage.getItem('token')
  }

  /**
   * Método principal para hacer requests
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      // console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`) // Comentado por seguridad
      
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API Error: ${response.status}`)
      }

      const data = await response.json()
      // console.log(`✅ API Response:`, data) // Comentado por seguridad
      
      return data
    } catch (error) {
      console.error(`❌ API Error:`, error)
      throw error
    }
  }

  /**
   * Actualizar token de autenticación
   */
  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS DE AUTENTICACIÓN
  // ═══════════════════════════════════════════════════════════

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    
    if (response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' })
    this.setToken(null)
  }

  async refreshToken() {
    const response = await this.request('/auth/refresh', { method: 'POST' })
    if (response.token) {
      this.setToken(response.token)
    }
    return response
  }

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS DE USUARIOS
  // ═══════════════════════════════════════════════════════════

  async getUsers(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`/users${params ? `?${params}` : ''}`)
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE'
    })
  }

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS DE ESTUDIANTES
  // ═══════════════════════════════════════════════════════════

  async getStudents(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`/students${params ? `?${params}` : ''}`)
  }

  async getStudent(studentId) {
    return this.request(`/students/${studentId}`)
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    })
  }

  async updateStudent(studentId, studentData) {
    return this.request(`/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    })
  }

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS DE ASISTENCIA
  // ═══════════════════════════════════════════════════════════

  async getAttendance(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`/attendance${params ? `?${params}` : ''}`)
  }

  async createAttendance(attendanceData) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    })
  }

  async updateAttendance(attendanceId, attendanceData) {
    return this.request(`/attendance/${attendanceId}`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData)
    })
  }

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS DE MENSAJES
  // ═══════════════════════════════════════════════════════════

  async getConversations(userId) {
    return this.request(`/messages/conversations/${userId}`)
  }

  async getMessages(conversationId) {
    return this.request(`/messages/conversation/${conversationId}`)
  }

  async sendMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    })
  }

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS DE COMUNICADOS
  // ═══════════════════════════════════════════════════════════

  async getCommuniques(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`/communiques${params ? `?${params}` : ''}`)
  }

  async createCommunique(communiqueData) {
    return this.request('/communiques', {
      method: 'POST',
      body: JSON.stringify(communiqueData)
    })
  }

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS DE PAGOS
  // ═══════════════════════════════════════════════════════════

  async getPayments(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`/payments${params ? `?${params}` : ''}`)
  }

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    })
  }

  async getPaymentConcepts() {
    return this.request('/payment-concepts')
  }

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS DE ARCHIVOS
  // ═══════════════════════════════════════════════════════════

  async uploadFile(file, endpoint = '/upload') {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {} // Deja que el navegador establezca Content-Type para FormData
    })
  }

  async uploadStudentsList(file) {
    return this.uploadFile(file, '/students/upload')
  }

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS DE REPORTES
  // ═══════════════════════════════════════════════════════════

  async generateReport(reportType, filters = {}) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type: reportType, filters })
    })
  }

  async downloadReport(reportId) {
    const response = await fetch(`${this.baseURL}/reports/download/${reportId}`, {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      }
    })
    
    if (!response.ok) {
      throw new Error('Error downloading report')
    }
    
    return response.blob()
  }
}

// Crear una instancia única (Singleton)
const apiService = new ApiService()

export default apiService

// También exportar la clase por si necesitas múltiples instancias
export { ApiService }