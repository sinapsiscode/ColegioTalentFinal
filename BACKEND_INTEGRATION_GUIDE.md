# Guía de Integración Backend - Talentos College

## 📋 Resumen Ejecutivo

Este documento describe cómo el backend debe implementar la API para integrarse perfectamente con el frontend existente. El frontend está completamente preparado y solo requiere cambiar una variable de entorno para usar la API real.

## 🔄 Flujo de Integración

### 1. Activación de API Real
```bash
# En el archivo .env del frontend
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.talentos.edu.pe
```

### 2. Arquitectura de Comunicación

```mermaid
Frontend (React) 
    ↓
dataService.js (Capa de abstracción)
    ↓
apiService.js (Cliente HTTP)
    ↓
Backend API (REST)
```

## 🏗️ Estructura de la API

### Base URL y Versionado
```
https://api.talentos.edu.pe/api/v1
```

### Headers Requeridos
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {jwt_token}",
  "X-API-Version": "1.0"
}
```

## 🔐 Autenticación

### POST /auth/login
**Request:**
```json
{
  "email": "admin@talentos.edu",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@talentos.edu",
      "nombre": "Administrador",
      "rol": "admin",
      "permissions": ["*"],
      "avatar": "https://api.talentos.edu.pe/avatars/1.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

### POST /auth/refresh
**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/logout
**Headers:** Authorization required

## 👥 Usuarios

### GET /users
**Query params:** `?page=1&limit=20&role=padre&search=carlos`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "padre1@email.com",
      "nombre": "Carlos Rodríguez",
      "rol": "padre",
      "telefono": "+51 987 654 321",
      "estado": "activo",
      "createdAt": "2024-01-15T10:00:00Z",
      "hijos": [1, 2]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### GET /users/:id
### POST /users
### PUT /users/:id
### DELETE /users/:id

## 🎓 Estudiantes

### GET /students
**Query params:** `?grade=5to&section=A&status=active`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Ana",
      "apellidos": "Rodríguez González",
      "nombreCompleto": "Ana Rodríguez González",
      "grado": "5to Primaria",
      "seccion": "A",
      "codigoQR": "E001234567890",
      "fechaNacimiento": "2013-05-15",
      "direccion": "Av. Las Flores 123",
      "estado": "activo",
      "foto": "https://api.talentos.edu.pe/students/photos/1.jpg"
    }
  ]
}
```

### GET /students/parent/:parentEmail
Obtiene estudiantes asignados a un padre específico

## 👨‍👩‍👧 Relaciones Padre-Estudiante

### GET /parent-student-relationships
### POST /parent-student-relationships
```json
{
  "parentEmail": "padre1@email.com",
  "studentId": 1,
  "relationshipType": "padre"
}
```

## 📅 Asistencia

### GET /attendance
**Query params:** `?studentId=1&date=2024-01-15&dateFrom=2024-01-01&dateTo=2024-01-31`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1-2024-01-15",
      "estudianteId": 1,
      "nombreEstudiante": "Ana Rodríguez González",
      "fecha": "2024-01-15",
      "horaEntrada": "07:50:00",
      "horaSalida": "14:00:00",
      "estado": "presente",
      "observaciones": "",
      "registradoPor": "entrada@talentos.edu"
    }
  ]
}
```

### POST /attendance
```json
{
  "estudianteId": 1,
  "fecha": "2024-01-15",
  "horaEntrada": "07:50:00",
  "estado": "presente",
  "registradoPor": "entrada@talentos.edu"
}
```

## 💰 Pagos

### GET /payments
**Query params:** `?parentEmail=padre1@email.com&status=pending&studentId=1`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "estudianteId": 1,
      "nombreEstudiante": "Ana Rodríguez González",
      "padreEmail": "padre1@email.com",
      "concepto": "Pensión Enero 2024",
      "monto": 350.00,
      "fechaVencimiento": "2024-01-31",
      "fechaPago": null,
      "estado": "pendiente_pago",
      "metodoPago": null,
      "numeroOperacion": null,
      "voucher": null
    }
  ]
}
```

### POST /payments
**Para subir voucher:**
```json
{
  "estudianteId": 1,
  "concepto": "Pensión Enero 2024",
  "monto": 350.00,
  "metodoPago": "transferencia",
  "numeroOperacion": "TR123456",
  "voucherBase64": "data:image/jpeg;base64,..."
}
```

### POST /payments/:id/approve
### POST /payments/:id/reject

## 📢 Comunicados

### GET /communiques
**Query params:** `?tipo=general&grado=5to`

### POST /communiques
```json
{
  "titulo": "Reunión de Padres",
  "contenido": "Se convoca a reunión...",
  "tipo": "general",
  "prioridad": "alta",
  "autor": "María García",
  "destinatarios": ["5to Primaria", "6to Primaria"]
}
```

## 💬 Mensajes

### GET /messages/user/:userId
### GET /messages/conversation/:userId1/:userId2
### POST /messages
```json
{
  "remitenteId": "padre1@email.com",
  "destinatarioId": "tutor1@email.com",
  "mensaje": "Buenos días profesora...",
  "tipo": "texto"
}
```

### PUT /messages/:id/read

## 📊 Calificaciones

### GET /grades
**Query params:** `?studentId=1&period=primer-bimestre&subject=matematicas`

### POST /grades
```json
{
  "estudianteId": 1,
  "materia": "Matemáticas",
  "periodo": "Primer Bimestre",
  "nota": 18,
  "profesorId": "tutor1@email.com"
}
```

## 📚 Cursos

### GET /courses
### GET /courses/teacher/:teacherId
### POST /teacher-assignments
```json
{
  "tutorId": "tutor1@email.com",
  "cursoId": 1,
  "grado": "5to Primaria",
  "seccion": "A"
}
```

## 🔔 Notificaciones

### GET /notifications/user/:userId
### PUT /notifications/:id/read
### PUT /notifications/user/:userId/read-all

## 📈 Reportes

### GET /reports/attendance
**Query params:** `?studentId=1&dateFrom=2024-01-01&dateTo=2024-01-31&format=pdf`

### GET /reports/payments
**Query params:** `?status=pending&month=2024-01&format=excel`

### GET /reports/student/:studentId
Reporte completo del estudiante

## 🔄 Respuestas Estándar

### Éxito
```json
{
  "success": true,
  "data": { },
  "message": "Operación exitosa"
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El email ya está registrado",
    "field": "email"
  }
}
```

### Errores HTTP
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (sin autenticación)
- `403` - Forbidden (sin permisos)
- `404` - Not Found
- `422` - Unprocessable Entity (validación)
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🛡️ Seguridad

### Requisitos Mínimos
1. **HTTPS obligatorio**
2. **JWT con expiración** (1h access, 7d refresh)
3. **Rate limiting**: 100 requests/min por IP
4. **CORS configurado** para el dominio del frontend
5. **Validación de entrada** con sanitización
6. **Logs de auditoría** para acciones críticas

### Headers de Seguridad
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

## 🚀 Deployment Checklist

### Backend debe proveer:
- [ ] Todos los endpoints documentados
- [ ] Autenticación JWT funcionando
- [ ] Validación de datos robusta
- [ ] Manejo de errores consistente
- [ ] Paginación en listados
- [ ] Filtros y búsqueda
- [ ] Upload de archivos (vouchers)
- [ ] Logs y monitoreo
- [ ] Documentación OpenAPI/Swagger
- [ ] Tests de integración

### Variables de Entorno Backend
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=https://app.talentos.edu.pe
UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE=5MB
RATE_LIMIT_WINDOW=1m
RATE_LIMIT_MAX=100
```

## 📝 Notas Importantes

1. **IDs**: El frontend espera IDs numéricos para estudiantes y strings (email) para usuarios
2. **Fechas**: Formato ISO 8601 (`2024-01-15T10:00:00Z`)
3. **Moneda**: Montos en decimales con 2 dígitos (350.00)
4. **Estados**: Usar los valores exactos documentados
5. **Paginación**: Siempre incluir metadata de paginación
6. **Archivos**: Soportar base64 y multipart/form-data

## 🔌 Prueba de Integración

```bash
# 1. Probar login
curl -X POST https://api.talentos.edu.pe/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@talentos.edu","password":"123456"}'

# 2. Usar token para obtener estudiantes
curl -X GET https://api.talentos.edu.pe/api/v1/students \
  -H "Authorization: Bearer {token}"

# 3. En el frontend, cambiar:
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.talentos.edu.pe/api/v1

# 4. ¡Listo! La app usará la API real
```

## 🆘 Soporte

Para dudas sobre la integración:
1. Revisar `/src/services/apiService.js` para ver exactamente qué espera el frontend
2. Usar `/src/services/dataService.js` como referencia de la estructura de datos
3. Los datos mock en `/src/services/dataService.js` muestran ejemplos reales

---

**Última actualización**: Enero 2024
**Versión del Frontend**: 1.0.0
**Contacto Frontend**: desarrollo@talentos.edu.pe