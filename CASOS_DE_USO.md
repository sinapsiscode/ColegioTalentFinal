# 📚 CASOS DE USO - SISTEMA TALENTOS COLLEGE

## 👨‍👩‍👧‍👦 **CASOS DE USO - ROL PADRE**

### 1. **Ver Dashboard Principal**
- **Actor:** Padre de familia
- **Precondición:** Estar autenticado
- **Flujo:**
  1. Padre ingresa al sistema
  2. Ve resumen de todos sus hijos
  3. Ve notificaciones pendientes
  4. Ve comunicados recientes
- **Postcondición:** Padre tiene visión general del estado académico

### 2. **Consultar Calificaciones**
- **Actor:** Padre
- **Precondición:** Tener hijos asignados
- **Flujo:**
  1. Selecciona hijo desde dashboard
  2. Accede a sección "Calificaciones"
  3. Ve notas por materia y periodo
  4. Puede filtrar por bimestre/trimestre
  5. Descarga reporte PDF
- **Postcondición:** Padre conoce rendimiento académico

### 3. **Revisar Asistencia**
- **Actor:** Padre
- **Precondición:** Hijo registrado en sistema
- **Flujo:**
  1. Accede a "Asistencia"
  2. Ve calendario con marcaciones
  3. Revisa estadísticas (% asistencia)
  4. Ve justificaciones pendientes
- **Postcondición:** Padre monitorea asistencia

### 4. **Gestionar Pagos**
- **Actor:** Padre
- **Precondición:** Tener obligaciones de pago
- **Flujo:**
  1. Accede a "Pagos"
  2. Ve pensiones pendientes/pagadas
  3. Descarga boletas
  4. Registra comprobante de pago
  5. Ve historial de pagos
- **Postcondición:** Pagos actualizados

### 5. **Comunicarse con Tutores**
- **Actor:** Padre
- **Precondición:** Hijo asignado a tutor
- **Flujo:**
  1. Accede a "Mensajes"
  2. Selecciona tutor/profesor
  3. Envía mensaje
  4. Recibe respuesta
  5. Ve historial de conversación
- **Postcondición:** Comunicación establecida

### 6. **Leer Comunicados**
- **Actor:** Padre
- **Precondición:** Comunicados publicados
- **Flujo:**
  1. Ve notificación de nuevo comunicado
  2. Accede a lista de comunicados
  3. Lee detalle
  4. Marca como leído
  5. Descarga adjuntos si existen
- **Postcondición:** Padre informado

## 👨‍🏫 **CASOS DE USO - ROL TUTOR**

### 7. **Gestionar Calificaciones**
- **Actor:** Tutor
- **Precondición:** Tener estudiantes asignados
- **Flujo:**
  1. Accede a dashboard
  2. Selecciona opción de calificaciones
  3. Ingresa notas individualmente o masivamente
  4. Importa desde Excel (opcional)
  5. Guarda y notifica
- **Postcondición:** Calificaciones registradas

### 8. **Registrar Observaciones**
- **Actor:** Tutor
- **Precondición:** Estudiante en su clase
- **Flujo:**
  1. Selecciona estudiante
  2. Agrega observación comportamental
  3. Categoriza (positiva/negativa/neutra)
  4. Guarda para historial
- **Postcondición:** Observación documentada

### 9. **Marcar Asistencia (Manual)**
- **Actor:** Tutor
- **Precondición:** Clase en sesión
- **Flujo:**
  1. Abre lista de clase
  2. Marca presente/ausente/tardanza
  3. Agrega justificaciones
  4. Confirma asistencia
- **Postcondición:** Asistencia registrada

### 10. **Enviar Comunicados a Padres**
- **Actor:** Tutor
- **Precondición:** Autorización para comunicados
- **Flujo:**
  1. Crea nuevo comunicado
  2. Selecciona destinatarios (individual/grupal)
  3. Redacta mensaje
  4. Programa envío o envía inmediato
- **Postcondición:** Padres notificados

### 11. **Generar Reportes**
- **Actor:** Tutor
- **Precondición:** Datos disponibles
- **Flujo:**
  1. Selecciona tipo de reporte
  2. Filtra por estudiante/fecha/materia
  3. Genera vista previa
  4. Exporta PDF/Excel
- **Postcondición:** Reporte generado

### 12. **Gestionar Actividades**
- **Actor:** Tutor
- **Precondición:** Actividades planificadas
- **Flujo:**
  1. Crea nueva actividad/tarea
  2. Asigna prioridad y fecha
  3. Actualiza progreso
  4. Marca como completada
- **Postcondición:** Actividades organizadas

## 👤 **CASOS DE USO - ROL ADMINISTRADOR**

### 13. **Gestionar Usuarios**
- **Actor:** Administrador
- **Precondición:** Permisos de admin
- **Flujo:**
  1. Accede a gestión de usuarios
  2. Crea/edita/desactiva usuarios
  3. Asigna roles y permisos
  4. Vincula padres con hijos
  5. Importa usuarios masivamente
- **Postcondición:** Usuarios configurados

### 14. **Importar Estudiantes**
- **Actor:** Administrador
- **Precondición:** Archivo Excel preparado
- **Flujo:**
  1. Descarga plantilla
  2. Completa datos
  3. Sube archivo
  4. Valida información
  5. Confirma importación
- **Postcondición:** Estudiantes registrados

### 15. **Configurar Pagos**
- **Actor:** Administrador
- **Precondición:** Estructura de pagos definida
- **Flujo:**
  1. Define conceptos de pago
  2. Establece montos y fechas
  3. Asigna a estudiantes
  4. Programa recordatorios
- **Postcondición:** Pagos configurados

### 16. **Generar Reportes Institucionales**
- **Actor:** Administrador
- **Precondición:** Datos completos
- **Flujo:**
  1. Selecciona tipo de reporte
  2. Define periodo
  3. Aplica filtros
  4. Genera estadísticas
  5. Exporta para dirección
- **Postcondición:** Reportes listos

### 17. **Gestionar Comunicados Generales**
- **Actor:** Administrador
- **Precondición:** Información a comunicar
- **Flujo:**
  1. Crea comunicado institucional
  2. Define audiencia (todos/grado/sección)
  3. Programa publicación
  4. Monitorea lectura
- **Postcondición:** Comunidad informada

## 🚪 **CASOS DE USO - ROL ENTRADA**

### 18. **Escanear QR de Estudiante**
- **Actor:** Personal de entrada
- **Precondición:** Scanner activo
- **Flujo:**
  1. Estudiante presenta QR
  2. Sistema valida código
  3. Registra hora de entrada
  4. Muestra foto para verificación
  5. Confirma ingreso
- **Postcondición:** Entrada registrada

### 19. **Escanear QR de Tutor**
- **Actor:** Personal de entrada
- **Precondición:** Tutor con fotocheck QR
- **Flujo:**
  1. Tutor presenta QR
  2. Sistema valida identidad
  3. Registra entrada con GPS
  4. Calcula puntualidad
  5. Confirma registro
- **Postcondición:** Asistencia docente registrada

### 20. **Registrar Salida Anticipada**
- **Actor:** Personal de entrada
- **Precondición:** Autorización de salida
- **Flujo:**
  1. Busca estudiante
  2. Verifica autorización
  3. Registra motivo
  4. Escanea QR de salida
  5. Notifica a padres
- **Postcondición:** Salida documentada

## 🔄 **CASOS DE USO TRANSVERSALES**

### 21. **Recuperar Contraseña**
- **Actor:** Cualquier usuario
- **Flujo:**
  1. Click en "Olvidé contraseña"
  2. Ingresa email
  3. Recibe código
  4. Ingresa nueva contraseña
- **Postcondición:** Acceso restaurado

### 22. **Cambiar Idioma**
- **Actor:** Cualquier usuario
- **Flujo:**
  1. Accede a configuración
  2. Selecciona idioma
  3. Sistema se actualiza
- **Postcondición:** Interfaz en nuevo idioma

### 23. **Configurar Notificaciones**
- **Actor:** Padres/Tutores
- **Flujo:**
  1. Accede a preferencias
  2. Activa/desactiva tipos de notificación
  3. Define horarios
  4. Guarda preferencias
- **Postcondición:** Notificaciones personalizadas

### 24. **Exportar Datos**
- **Actor:** Usuarios autorizados
- **Flujo:**
  1. Selecciona datos a exportar
  2. Elige formato (PDF/Excel)
  3. Aplica filtros
  4. Descarga archivo
- **Postcondición:** Datos exportados

### 25. **Ver Perfil de Estudiante**
- **Actor:** Padre/Tutor/Admin
- **Flujo:**
  1. Busca o selecciona estudiante
  2. Accede a perfil completo
  3. Ve información académica
  4. Revisa historial
  5. Imprime ficha si necesario
- **Postcondición:** Información consultada

## 🎯 **CASOS DE USO ESPECIALES**

### 26. **Simulación de Pagos**
- **Actor:** Administrador
- **Flujo:**
  1. Selecciona modo simulación
  2. Elige estudiantes
  3. Simula pagos/moras
  4. Ve proyecciones
- **Postcondición:** Escenarios evaluados

### 27. **Generar Fotochecks QR**
- **Actor:** Administrador
- **Flujo:**
  1. Selecciona estudiantes/tutores
  2. Genera códigos QR únicos
  3. Crea plantilla de fotocheck
  4. Exporta para impresión
- **Postcondición:** Fotochecks listos

### 28. **Auditoría de Sistema**
- **Actor:** Administrador
- **Flujo:**
  1. Accede a logs
  2. Filtra por usuario/acción/fecha
  3. Revisa actividad
  4. Exporta reporte
- **Postcondición:** Actividad auditada

## 📱 **CASOS DE USO MÓVIL**

### 29. **Notificación Push de Asistencia**
- **Actor:** Padre
- **Trigger:** Hijo marca entrada/salida
- **Flujo:**
  1. Sistema detecta marcación
  2. Envía notificación push
  3. Padre ve hora y ubicación
  4. Puede ver detalles
- **Postcondición:** Padre informado en tiempo real

### 30. **Chat en Tiempo Real**
- **Actor:** Padre/Tutor
- **Precondición:** Conversación activa
- **Flujo:**
  1. Recibe notificación de mensaje
  2. Abre chat
  3. Ve mensajes en tiempo real
  4. Responde
  5. Ve indicadores de lectura
- **Postcondición:** Comunicación fluida

## 🔐 **CASOS DE USO DE SEGURIDAD**

### 31. **Validación de Ubicación GPS**
- **Actor:** Sistema
- **Trigger:** Intento de marcación
- **Flujo:**
  1. Obtiene ubicación del dispositivo
  2. Calcula distancia al colegio
  3. Valida si está en radio permitido
  4. Permite o rechaza marcación
  5. Registra intento
- **Postcondición:** Solo marcaciones válidas

### 32. **Autenticación de Dos Factores**
- **Actor:** Usuario con 2FA activo
- **Precondición:** 2FA configurado
- **Flujo:**
  1. Ingresa credenciales
  2. Sistema envía código
  3. Usuario ingresa código
  4. Valida y permite acceso
- **Postcondición:** Acceso seguro

## 📊 **CASOS DE USO ANALÍTICOS**

### 33. **Dashboard de Métricas Institucionales**
- **Actor:** Director/Administrador
- **Precondición:** Datos suficientes
- **Flujo:**
  1. Accede a dashboard analítico
  2. Ve KPIs en tiempo real
  3. Analiza tendencias
  4. Genera insights
  5. Exporta para presentaciones
- **Postcondición:** Decisiones informadas

### 34. **Predicción de Deserción**
- **Actor:** Sistema/Administrador
- **Precondición:** Histórico de datos
- **Flujo:**
  1. Sistema analiza patrones
  2. Identifica estudiantes en riesgo
  3. Genera alertas tempranas
  4. Sugiere intervenciones
- **Postcondición:** Prevención proactiva

### 35. **Análisis de Rendimiento por Materia**
- **Actor:** Coordinador Académico
- **Precondición:** Calificaciones registradas
- **Flujo:**
  1. Selecciona materia y periodo
  2. Ve distribución de notas
  3. Identifica áreas problemáticas
  4. Compara con periodos anteriores
  5. Genera plan de acción
- **Postcondición:** Mejora académica planificada

---

## 📝 **Notas Adicionales**

- Todos los casos de uso incluyen validaciones de seguridad y permisos
- El sistema mantiene logs de auditoría para todas las acciones críticas
- Las notificaciones son configurables por el usuario
- Los datos se sincronizan en tiempo real cuando hay conexión
- El sistema funciona offline con sincronización posterior

---

*Documento actualizado: Enero 2025*
*Versión: 1.0*
*Sistema: Talentos College - Gestión Académica Integral*