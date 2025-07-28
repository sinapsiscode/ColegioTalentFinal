# Talentos College - Sistema de Comunicación Escolar

Una aplicación web moderna desarrollada en React para facilitar la comunicación entre padres, tutores, administración y personal del colegio Talentos College.

## 🚀 Características Principales

- **Dashboard Personalizado**: Interfaz específica para cada tipo de usuario
- **Sistema de Roles**: Padre, Tutor, Administrador y Personal de Entrada
- **Gestión de Asistencia**: Seguimiento en tiempo real de la asistencia estudiantil
- **Mensajería Integrada**: Comunicación directa entre padres y tutores
- **Comunicados Oficiales**: Sistema de notificaciones y comunicados institucionales
- **Gestión de Calificaciones**: Acceso a notas y progreso académico
- **Responsive Design**: Optimizado para dispositivos móviles y desktop

## 🛠️ Stack Tecnológico

- **React 18.3.1** - Framework principal
- **Vite 5.4.0** - Build tool y servidor de desarrollo
- **Node.js 22.14.0** - Runtime de JavaScript
- **TailwindCSS 3.4.1** - Framework de estilos
- **Zustand 4.5.0** - Gestión de estado global
- **React Router v6** - Enrutamiento
- **Framer Motion** - Animaciones
- **SweetAlert2** - Modales y notificaciones
- **React Hook Form** - Manejo de formularios
- **React Icons** - Iconografía

## 📋 Requisitos del Sistema

- Node.js versión 22.14.0
- npm versión 10.9.2
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

## 🚀 Instalación y Configuración

### 1. Clonar o descargar el proyecto

```bash
# Si usas Git
git clone [URL_DEL_REPOSITORIO]
cd colegio-FINAL

# O simplemente asegúrate de estar en el directorio del proyecto
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm start
```

El proyecto estará disponible en: `http://localhost:3000`

## 👥 Usuarios de Prueba

La aplicación incluye usuarios de demostración para cada rol:

### Padres de Familia
- **Email**: `carlos.rodriguez@email.com`
- **Contraseña**: `123456`
- **Descripción**: Carlos Rodríguez - Padre de Ana y Luis

- **Email**: `miguel.martinez@email.com`
- **Contraseña**: `123456`
- **Descripción**: Miguel Martinez - Padre de Sofia

- **Email**: `ana.silva@email.com`
- **Contraseña**: `123456`
- **Descripción**: Ana Silva - Madre de Pedro

### Tutores
- **Email**: `tutor1@email.com`
- **Contraseña**: `123456`
- **Descripción**: María García - Profesora de Matemáticas

### Administración
- **Email**: `admin@talentos.edu`
- **Contraseña**: `123456`
- **Descripción**: Dr. Juan Pérez - Director General

### Personal de Entrada
- **Email**: `entrada@talentos.edu`
- **Contraseña**: `123456`
- **Descripción**: Pedro Sánchez - Personal de Seguridad

## 📱 Funcionalidades por Rol

### Para Padres de Familia
- ✅ Dashboard con resumen de hijos
- ✅ Visualización de asistencia por hijo
- ✅ Sistema de mensajería con tutores
- ✅ Acceso a comunicados del colegio
- ✅ Consulta de calificaciones
- ✅ Perfil detallado de cada hijo

### Para Tutores
- ✅ Dashboard con lista de alumnos a cargo
- ✅ Sistema de mensajería con padres
- ✅ Creación y envío de comunicados
- ✅ Gestión de calificaciones

### Para Administración
- ✅ Panel de control general
- ✅ Gestión de comunicados masivos
- ✅ Reportes de asistencia
- ✅ Gestión de usuarios del sistema

### Para Personal de Entrada
- ✅ Interface de escaneo QR (simulado)
- ✅ Registro rápido de entrada/salida
- ✅ Control de asistencia en tiempo real

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── common/         # Componentes comunes (Header, LoadingSpinner)
│   ├── attendance/     # Componentes de asistencia
│   ├── messaging/      # Componentes de mensajería
│   └── academic/       # Componentes académicos
├── views/              # Vistas principales
│   ├── parent/        # Vistas para padres
│   ├── tutor/         # Vistas para tutores
│   ├── admin/         # Vistas para administración
│   └── scanner/       # Vistas para personal de entrada
├── stores/            # Estados globales con Zustand
├── utils/             # Utilidades y helpers
├── data/              # Datos mock para demostración
└── styles/            # Estilos globales
```

## 🎨 Diseño y UX

- **Mobile-First**: Diseño responsivo optimizado para móviles
- **Tema Corporativo**: Colores institucionales del colegio
- **Animaciones Suaves**: Transiciones con Framer Motion
- **Feedback Visual**: Indicadores de estado y acciones
- **Accesibilidad**: Componentes accesibles y navegación por teclado

## 📊 Datos de Demostración

El proyecto incluye datos mock completos:
- 20 estudiantes de ejemplo
- Historial de asistencia del último mes
- 10 conversaciones de ejemplo
- 5 comunicados recientes
- Sistema de notificaciones simuladas

## 🔧 Scripts Disponibles

```bash
# Iniciar desarrollo
npm start

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar linter
npm run lint
```

## 🌐 Compatibilidad con Windows

El proyecto está completamente configurado para funcionar en entornos Windows:
- Rutas normalizadas para compatibilidad cross-platform
- Configuración específica para Vite en Windows
- Variables de entorno compatibles
- Dependencias verificadas para Node.js 22.14.0

## 🚧 Características en Desarrollo

Las siguientes funcionalidades están marcadas para desarrollo futuro:
- [ ] Búsqueda y filtros avanzados
- [ ] Exportación de reportes en PDF
- [ ] Integración con escáner QR real
- [ ] Sistema de notificaciones push reales
- [ ] Chat en tiempo real
- [ ] Gestión de calendarios académicos

## 🐛 Resolución de Problemas

### Error: Puerto 3000 ocupado
```bash
# Cambiar puerto en vite.config.js o matar proceso
npx kill-port 3000
```

### Error: Dependencias no encontradas
```bash
# Limpiar cache e instalar
npm cache clean --force
rm -rf node_modules
npm install
```

### Error: Versión de Node incorrecta
Asegúrate de usar Node.js 22.14.0 y npm 10.9.2

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto:
- Revisar la documentación en el código
- Verificar la consola del navegador para errores
- Confirmar que todas las dependencias estén instaladas correctamente

## 📄 Licencia

Este proyecto fue desarrollado específicamente para Talentos College como sistema de comunicación escolar.

---

**Talentos College** - Conectando padres, estudiantes y educadores 🎓