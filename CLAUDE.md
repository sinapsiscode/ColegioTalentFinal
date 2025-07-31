# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando trabaje con código en este repositorio.

## Comandos de Desarrollo Comunes

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 3000)
npm start

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar ESLint
npm run lint
```

## Arquitectura de Alto Nivel

### Stack Tecnológico
- **React 18.3** con Vite como herramienta de construcción
- **Zustand** para gestión de estado (patrón stores)
- **React Router v6** para enrutamiento con acceso basado en roles
- **TailwindCSS** para estilos con Framer Motion para animaciones
- **Persistencia local** usando DatabaseManager (basado en localStorage)

### Estructura de la Aplicación

#### Sistema Multi-Rol
La aplicación soporta 4 roles de usuario distintos:
- **admin**: Gestión completa del sistema, creación de usuarios, reportes
- **padre**: Ver solo los datos de sus hijos asignados
- **tutor**: Gestionar estudiantes asignados, crear comunicados
- **entrada**: Escaneo QR para asistencia

#### Arquitectura de Gestión de Estado
- **Stores de Zustand** en `src/stores/` manejan todo el estado de la aplicación
- **DatabaseManager** (`src/data/DatabaseManager.js`) proporciona API tipo SQL para persistencia de datos
- Los stores interactúan con DatabaseManager para operaciones CRUD
- Datos mock disponibles en modo desarrollo

#### Patrones Arquitectónicos Clave
1. **Enrutamiento basado en roles**: Todas las rutas protegidas por componente `PrivateRoute` que verifica el rol del usuario
2. **Carga diferida**: Vistas cargadas bajo demanda usando React.lazy()
3. **Persistencia híbrida**: Listo para integración con API backend mientras usa localStorage
4. **Relaciones padre-hijo**: Modelo de datos complejo soportando múltiples hijos por padre

### Lógica de Negocio Crítica

#### Flujo de Autenticación
- Contraseña universal de desarrollo: `123456`
- Listo para producción con soporte de token JWT
- Permisos basados en roles definidos en `authStore.js`

#### Asignación Padre-Hijo
- Los administradores asignan hijos a padres vía `AssignChildrenModal`
- Los padres solo ven sus hijos asignados en todas las vistas
- Tipos de relación: padre/madre/tutor_legal

#### Sistema de Exportación de Datos
- Los administradores pueden exportar a Excel o PDF
- Los padres restringidos solo a PDF
- Utilidades de exportación en `src/utils/exportUtilsSimple.js`

### Esquema de Base de Datos
Tablas clave en localStorage:
- `users`: Usuarios del sistema con roles
- `students`: Todos los estudiantes
- `parent_student_relationships`: Vincula padres con hijos
- `teacher_student_assignments`: Vincula tutores con estudiantes

### Enfoque de Pruebas
No hay pruebas automatizadas actualmente. Pruebas manuales vía:
```javascript
// Consola del navegador
window.testDatabase.runAllTests()
window.testDatabase.showDatabaseInfo()
```

### Notas Importantes de Implementación
- Todas las operaciones de datos deben pasar por DatabaseManager para consistencia
- Las vistas de padres filtran datos basándose en hijos asignados (característica crítica de seguridad)
- Servicio de API mock listo para integración con backend
- Respaldos automáticos cada 5 minutos (máximo 10 respaldos)

## Constantes Centralizadas

### Archivo: `src/utils/constants.js`
Contiene todas las constantes del sistema organizadas por categorías:

- **USER_ROLES**: Roles de usuario del sistema
- **LIMITS**: Límites del sistema (capacidades, tamaños, timeouts)
- **MESSAGES**: Mensajes de usuario (éxito, error, confirmación, carga)
- **DEFAULTS**: Valores por defecto (contraseña, paginación, moneda)
- **Z_INDEX**: Valores z-index para capas CSS
- **ANIMATIONS**: Configuración de animaciones
- **SIMULATION**: Rangos para datos simulados
- **EXCEL_SETTINGS**: Configuración de exportación Excel
- **DATA_GENERATION**: Configuración de generación de datos

### Refactoring Realizado (última actualización)
- 21 valores hardcodeados reemplazados en 17 archivos
- Contraseña '123456' centralizada en DEFAULTS.PASSWORD
- Capacidades de sección (30/50) en LIMITS
- Tamaños de archivo (5MB) en LIMITS.MAX_FILE_SIZE_MB
- Paginación (10 items) en DEFAULTS.ITEMS_PER_PAGE
- Mensajes de éxito/error centralizados en MESSAGES

### Uso de Constantes
```javascript
import { LIMITS, DEFAULTS, MESSAGES } from '../utils/constants'

// Ejemplos:
if (file.size > LIMITS.MAX_FILE_SIZE_MB * 1024 * 1024) { ... }
const [itemsPerPage] = useState(DEFAULTS.ITEMS_PER_PAGE)
showSuccess(MESSAGES.TITLES.SUCCESS, MESSAGES.SUCCESS.CREATE)
```