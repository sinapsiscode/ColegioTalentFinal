# Sistema de Configuración Centralizada

## Descripción General

Este documento describe el sistema de configuración centralizada implementado para preparar la aplicación para producción. El sistema permite cambiar fácilmente entre datos mock y API real, además de centralizar todas las configuraciones de la aplicación.

## Estructura de Archivos

### 1. `/src/config/index.js`
Archivo principal de configuración que centraliza todos los parámetros de la aplicación:
- Información de la aplicación (nombre, versión, año académico)
- Configuración de API (URL base, timeouts, reintentos)
- Feature flags (usar mock data, debug, notificaciones, etc.)
- URLs de servicios externos
- Configuración de autenticación
- Parámetros de UI
- Configuración de desarrollo

### 2. `/src/services/dataService.js`
Capa de abstracción de datos que maneja automáticamente el cambio entre datos mock y API real:
- Métodos unificados para todas las operaciones CRUD
- Inicialización automática de datos mock
- Simulación de delays de red
- Manejo consistente de errores

### 3. `/src/services/apiService.js`
Servicio de API que encapsula todas las llamadas al backend:
- Métodos organizados por entidad (users, students, payments, etc.)
- Manejo automático de tokens de autenticación
- Sistema de reintentos con delays configurables
- Logging configurable según el ambiente

### 4. `.env.example`
Plantilla de variables de ambiente con todas las configuraciones disponibles:
- Copiar como `.env` para desarrollo local
- Documentación completa de cada variable
- Valores por defecto sensatos

## Configuración de Ambiente

### Desarrollo Local

1. Copiar `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Ajustar las variables según necesidad:
```env
# Usar datos mock (por defecto en desarrollo)
VITE_USE_MOCK=true

# URL de la API (cuando esté lista)
VITE_API_BASE_URL=http://localhost:3001/api

# Nivel de logs
VITE_LOG_LEVEL=debug
```

### Producción

1. Configurar las variables de ambiente en el servidor:
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.talentos.edu.pe
VITE_LOG_LEVEL=error
```

## Feature Flags

El sistema incluye feature flags para controlar funcionalidades:

```javascript
// En el código
import { config } from '@/config'

if (config.features.enablePayments) {
  // Mostrar módulo de pagos
}

if (config.features.useMockData) {
  // Usar datos de prueba
}
```

## Uso del Data Service

El `dataService` proporciona una API unificada independiente del origen de datos:

```javascript
import dataService from '@/services/dataService'

// Obtener usuarios (mock o API según configuración)
const users = await dataService.getUsers()

// Crear estudiante
const student = await dataService.createStudent({
  nombre: 'Juan',
  apellidos: 'Pérez',
  grado: '5to'
})

// Aprobar pago
const payment = await dataService.approvePayment(
  paymentId,
  'admin@talentos.edu',
  'Pago verificado'
)
```

## Logging

El sistema incluye utilidades de logging configurables:

```javascript
import { log } from '@/config'

log.debug('Información de debug')
log.info('Información general')
log.warn('Advertencia')
log.error('Error crítico')
```

Los logs se muestran según el nivel configurado en `VITE_LOG_LEVEL`.

## Migración a API Real

Para migrar de datos mock a API real:

1. Implementar los endpoints en el backend siguiendo la estructura de `apiService.js`
2. Configurar `VITE_USE_MOCK=false` en el ambiente
3. Configurar `VITE_API_BASE_URL` con la URL del backend
4. El sistema automáticamente usará la API real sin cambios en el código

## Validación de Configuración

El sistema valida configuraciones críticas al iniciar:

```javascript
import { validateConfig } from '@/config'

// En main.jsx
if (!validateConfig()) {
  console.error('Configuración inválida')
}
```

## Beneficios

1. **Desarrollo sin Backend**: Trabajar con datos mock completos
2. **Transición Suave**: Cambiar a API real con una variable
3. **Configuración Centralizada**: Un solo lugar para todos los parámetros
4. **Ambiente-específico**: Diferentes configuraciones por ambiente
5. **Type Safety**: Configuración estructurada y predecible
6. **Debugging Mejorado**: Logs configurables por ambiente
7. **Feature Control**: Activar/desactivar funcionalidades fácilmente

## Ejemplos de Uso

### Cambiar el delay de mock data
```env
VITE_MOCK_DELAY=1000  # 1 segundo de delay
```

### Deshabilitar módulo de pagos
```env
VITE_ENABLE_PAYMENTS=false
```

### Cambiar límite de archivos
```env
VITE_MAX_FILE_SIZE=10485760  # 10MB
```

### Configurar reintentos de API
```env
VITE_API_RETRY_ATTEMPTS=5
VITE_API_RETRY_DELAY=2000
```

## Mantenimiento

1. Agregar nuevas configuraciones en `/src/config/index.js`
2. Documentar en `.env.example`
3. Usar `getConfig()` para acceder a configuraciones anidadas
4. Mantener valores por defecto sensatos
5. Validar configuraciones críticas