Prompt Mejorado para Claude Code
Crea una aplicación web frontend en React para el sistema de comunicación escolar "Talentos College" con las siguientes especificaciones:

## Stack Técnico
- React 18.3.1 con JavaScript (no TypeScript)
- Vite 5.4.0 como bundler
- Node 22.14.0 / npm 10.9.2
- TailwindCSS 3.4.1 para estilos
- Zustand 4.5.0 para estado global
- SweetAlert2 11.10.5 con sweetalert2-react-content 5.0.7 para notificaciones

## Estructura de la Aplicación

### 1. VISTAS PRINCIPALES
Crear un sistema de rutas con las siguientes vistas:

**Para Padres de Familia:**
- Login con selección de rol
- Dashboard principal con resumen de hijos
- Vista de asistencia por hijo (historial y tiempo real)
- Bandeja de mensajes (inbox/enviados)
- Vista de comunicados del colegio
- Perfil del alumno con información académica
- Vista de libreta de notas

**Para Tutores:**
- Dashboard con lista de alumnos a cargo
- Sistema de mensajería con padres
- Vista para enviar comunicados a grupos

**Para Administración:**
- Panel de control general
- Gestión de comunicados masivos
- Vista de reportes de asistencia
- Gestión de usuarios

**Para Personal de Entrada:**
- Interfaz de escaneo QR simulado
- Registro rápido de entrada/salida

### 2. COMPONENTES REUTILIZABLES
Crear componentes modulares para:
- Header con navegación y notificaciones badge
- Tarjetas de información de alumno
- Lista de mensajes con preview
- Componente de chat/mensajería
- Selector de hijos (para padres con múltiples hijos)
- Tabla de asistencia con filtros
- Componente de notificaciones toast
- Modal de confirmación para acciones críticas
- Loader skeleton para estados de carga

### 3. ESTADO GLOBAL (Zustand)
Implementar stores para:
- authStore: usuario actual, rol, permisos
- studentsStore: información de alumnos
- messagesStore: conversaciones y mensajes
- notificationsStore: notificaciones en tiempo real simuladas
- attendanceStore: registros de asistencia

### 4. DISEÑO UI/UX
- Diseño mobile-first responsive
- Tema con colores del colegio (usar variables CSS)
- Modo claro por defecto
- Iconos consistentes (puedes usar Heroicons o Lucide)
- Animaciones suaves con Tailwind
- Estados vacíos ilustrativos
- Feedback visual para todas las acciones

### 5. FUNCIONALIDADES MOCK
Simular con datos locales:
- Sistema de login con roles predefinidos
- Datos de 20 alumnos de ejemplo
- Historial de asistencia del último mes
- 10 conversaciones de ejemplo
- 5 comunicados recientes
- Simulación de notificaciones push cada 30 segundos
- QR scanner simulado que registra asistencia

### 6. CARACTERÍSTICAS ESPECIALES
- Búsqueda y filtros en todas las listas
- Paginación donde sea necesario
- Exportar reportes (simulado con console.log)
- Vista de impresión para libretas de notas
- Indicadores de mensajes no leídos
- Sistema de badges para notificaciones
- Breadcrumbs para navegación
- Formularios con validación

### 7. ESTRUCTURA DE CARPETAS
src/
├── components/
│   ├── common/
│   ├── attendance/
│   ├── messaging/
│   └── academic/
├── views/
│   ├── parent/
│   ├── tutor/
│   ├── admin/
│   └── scanner/
├── stores/
├── utils/
├── data/ (datos mock)
└── styles/

### 8. CONSIDERACIONES
- NO implementar backend real, usar datos mock
- NO incluir funcionalidades de aula virtual
- Hacer énfasis en la experiencia móvil
- Incluir comentarios explicativos en el código
- Usar nombres en español para las variables relacionadas al dominio
- Implementar lazy loading para las rutas
- Agregar transiciones entre vistas
- Incluir un README con instrucciones de uso

Genera el proyecto completo con todas las vistas, componentes y funcionalidades descritas, asegurándote de que sea una aplicación funcional y navegable desde el primer momento.
