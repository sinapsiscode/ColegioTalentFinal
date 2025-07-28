# 📡 API Endpoints - Talentos College Backend

## 🔐 Autenticación

### POST `/api/auth/login`
```json
{
  "email": "usuario@email.com",
  "password": "123456"
}
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "usuario@email.com",
      "rol": "padre", // padre, tutor, admin, entrada
      "telefono": "+51987654321",
      "avatar": "url_avatar"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### POST `/api/auth/logout`
### POST `/api/auth/refresh`
### GET `/api/auth/profile`
### PUT `/api/auth/profile`
### PUT `/api/auth/change-password`

---

## 👥 Estudiantes

### GET `/api/students` - Todos los estudiantes (Admin/Tutor)
### GET `/api/students/:id` - Estudiante específico
### GET `/api/students/parent/:parentId` - Estudiantes de un padre
### POST `/api/students` - Crear estudiante (Admin)
### PUT `/api/students/:id` - Actualizar estudiante (Admin)
### DELETE `/api/students/:id` - Eliminar estudiante (Admin)

**Estructura de Estudiante:**
```json
{
  "id": 1,
  "nombre": "Ana",
  "apellidos": "Rodríguez González",
  "grado": "5to Primaria",
  "seccion": "A",
  "codigoQR": "QR001",
  "padre_id": 1,
  "telefono": "+51987654321",
  "email": "padre@email.com",
  "fechaNacimiento": "2013-05-15",
  "direccion": "Av. Las Flores 123"
}
```

---

## 📊 Calificaciones

### GET `/api/grades/student/:studentId` - Notas de estudiante
### GET `/api/grades/class/:classId` - Notas de clase
### POST `/api/grades` - Crear calificación (Tutor)
### PUT `/api/grades/:id` - Actualizar calificación (Tutor)
### DELETE `/api/grades/:id` - Eliminar calificación (Tutor)
### GET `/api/grades/statistics/:studentId` - Estadísticas de notas

**Estructura de Calificación:**
```json
{
  "id": 1,
  "estudiante_id": 1,
  "materia_id": 1,
  "bimestre": "I Bimestre",
  "evaluaciones": [
    {
      "tipo": "Examen",
      "descripcion": "Examen Bimestral",
      "nota": 18,
      "fecha": "2024-03-15",
      "peso": 0.4
    }
  ],
  "promedio": 17.5,
  "estado": "aprobado",
  "observaciones": "Excelente rendimiento"
}
```

---

## 📅 Asistencia

### GET `/api/attendance/student/:studentId` - Asistencia de estudiante
### GET `/api/attendance/date/:date` - Asistencia por fecha
### POST `/api/attendance` - Registrar asistencia (Entrada)
### PUT `/api/attendance/:id` - Actualizar asistencia
### GET `/api/attendance/statistics/:studentId` - Estadísticas de asistencia
### GET `/api/attendance/daily-report/:date` - Reporte diario

**Estructura de Asistencia:**
```json
{
  "id": 1,
  "estudiante_id": 1,
  "fecha": "2024-01-15",
  "horaEntrada": "07:45:00",
  "horaSalida": "14:30:00",
  "estado": "presente", // presente, tarde, falta
  "observaciones": "A tiempo"
}
```

---

## 💬 Mensajes

### GET `/api/messages/user/:userId` - Mensajes de usuario
### GET `/api/messages/conversation/:conversationId` - Conversación
### POST `/api/messages` - Enviar mensaje
### PUT `/api/messages/:id/read` - Marcar como leído
### DELETE `/api/messages/:id` - Eliminar mensaje

**Estructura de Mensaje:**
```json
{
  "id": 1,
  "remitente_id": 1,
  "destinatario_id": 2,
  "asunto": "Consulta sobre notas",
  "mensaje": "Contenido del mensaje",
  "leido": false,
  "fecha": "2024-01-15T10:30:00Z",
  "adjuntos": ["url1", "url2"]
}
```

---

## 📢 Comunicados

### GET `/api/communiques` - Todos los comunicados
### GET `/api/communiques/:id` - Comunicado específico
### POST `/api/communiques` - Crear comunicado (Tutor/Admin)
### PUT `/api/communiques/:id` - Actualizar comunicado
### DELETE `/api/communiques/:id` - Eliminar comunicado
### PUT `/api/communiques/:id/publish` - Publicar comunicado
### GET `/api/communiques/:id/views` - Estadísticas de vistas

**Estructura de Comunicado:**
```json
{
  "id": 1,
  "titulo": "Reunión de Padres",
  "contenido": "Se convoca a reunión...",
  "categoria": "reunion",
  "prioridad": "media",
  "dirigidoA": ["padres", "tutores"],
  "autor_id": 1,
  "estado": "publicado", // borrador, publicado, programado
  "fecha": "2024-01-15",
  "fechaPublicacion": "2024-01-15T08:00:00Z",
  "adjuntos": ["url1"],
  "etiquetas": ["reunion", "padres"],
  "vistas": 45,
  "respuestas": 12
}
```

---

## 💰 Pagos

### GET `/api/payments/parent/:parentId` - Pagos de padre
### GET `/api/payments/:id` - Pago específico
### POST `/api/payments` - Crear pago (Admin)
### PUT `/api/payments/:id` - Actualizar pago
### POST `/api/payments/:id/voucher` - Subir comprobante
### GET `/api/payment-concepts` - Conceptos de pago
### POST `/api/payment-concepts` - Crear concepto (Admin)

**Estructura de Pago:**
```json
{
  "id": 1,
  "estudiante_id": 1,
  "concepto_id": 1,
  "monto": 450.00,
  "fechaVencimiento": "2024-01-31",
  "fechaPago": "2024-01-25",
  "estado": "pagado", // pendiente, pagado, vencido
  "metodoPago": "transferencia",
  "numeroTransaccion": "TXN123456",
  "comprobante": "url_comprobante",
  "observaciones": "Pago completo"
}
```

---

## 👤 Usuarios (Admin)

### GET `/api/users` - Todos los usuarios
### GET `/api/users/:id` - Usuario específico
### POST `/api/users` - Crear usuario
### PUT `/api/users/:id` - Actualizar usuario
### DELETE `/api/users/:id` - Eliminar usuario
### PUT `/api/users/:id/status` - Cambiar estado

---

## 📈 Reportes (Admin)

### GET `/api/reports/attendance` - Reporte de asistencia
### GET `/api/reports/grades` - Reporte de calificaciones
### GET `/api/reports/payments` - Reporte de pagos
### GET `/api/reports/general` - Reporte general
### GET `/api/reports/export/pdf/:type` - Exportar a PDF
### GET `/api/reports/export/excel/:type` - Exportar a Excel

---

## 🔔 Notificaciones

### GET `/api/notifications/user/:userId` - Notificaciones de usuario
### PUT `/api/notifications/:id/read` - Marcar como leída
### PUT `/api/notifications/user/:userId/read-all` - Marcar todas como leídas
### DELETE `/api/notifications/:id` - Eliminar notificación
### GET `/api/notifications/settings/:userId` - Configuración
### PUT `/api/notifications/settings/:userId` - Actualizar configuración

---

## 📁 Subida de Archivos

### POST `/api/upload` - Subir archivo
### DELETE `/api/upload/:id` - Eliminar archivo

---

## 🔧 Configuración Requerida

### Variables de Entorno Backend:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=talentos_college
DB_USER=admin
DB_PASSWORD=password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
UPLOAD_DIR=uploads/

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@talentoscollege.edu
SMTP_PASS=password

# App
PORT=3001
NODE_ENV=production
```

### Headers Requeridos:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: application/json
```

### Códigos de Estado:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Estructura de Respuesta Estándar:
```json
{
  "success": true|false,
  "data": {...},
  "message": "Mensaje descriptivo",
  "errors": [...] // Solo en caso de error
}
```