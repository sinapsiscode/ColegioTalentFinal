# 📊 Plantilla de Importación de Estudiantes - Talentos College

## 📋 Formato de la Planilla Excel

### Columnas Requeridas (en este orden exacto):

| Columna | Nombre Campo | Tipo | Ejemplo | Descripción |
|---------|--------------|------|---------|-------------|
| A | `nombre` | Texto | Ana Sofia | Nombre del estudiante |
| B | `apellidos` | Texto | Rodriguez Martinez | Apellidos completos |
| C | `codigo` | Texto | EST00001 | Código único del estudiante |
| D | `grado` | Texto | 1er Grado | Grado académico |
| E | `seccion` | Texto | A | Sección del aula |
| F | `fechaNacimiento` | Fecha | 2017-03-15 | Fecha de nacimiento (YYYY-MM-DD) |
| G | `dni` | Número | 87654321 | DNI del estudiante |
| H | `telefono` | Texto | 987123456 | Teléfono de contacto |
| I | `direccion` | Texto | Av. Los Olivos 123 - Lima | Dirección completa |
| J | `nombrePadre` | Texto | Carlos Rodriguez | Nombre del padre/apoderado |
| K | `telefonoPadre` | Texto | 987654321 | Teléfono del padre |
| L | `emailPadre` | Email | carlos.rodriguez@email.com | Email del padre |
| M | `observaciones` | Texto | Estudiante muy participativa | Observaciones adicionales |

## 📁 Archivos Disponibles

1. **ejemplo_50_estudiantes.csv** - Archivo CSV con 50 estudiantes de ejemplo
2. **Plantilla Excel** - Para crear en Excel, usa estas columnas como encabezados

## 🎯 Grados Disponibles en el Sistema

- **1er Grado** (Secciones: A, B)
- **2do Grado** (Secciones: A, B)  
- **3er Grado** (Secciones: A, B)
- **4to Grado** (Secciones: A, B)
- **5to Grado** (Secciones: A, B)
- **6to Grado** (Secciones: A, B)

## 📋 Características de los 50 Estudiantes de Ejemplo

### Distribución por Grado:
- **1er Grado:** 10 estudiantes (5 en A, 5 en B)
- **2do Grado:** 8 estudiantes (4 en A, 4 en B) 
- **3er Grado:** 8 estudiantes (4 en A, 4 en B)
- **4to Grado:** 8 estudiantes (4 en A, 4 en B)
- **5to Grado:** 8 estudiantes (4 en A, 4 en B)
- **6to Grado:** 8 estudiantes (4 en A, 4 en B)

### Información Incluida:
- ✅ Nombres y apellidos realistas
- ✅ Códigos únicos secuenciales (EST00001 - EST00050)
- ✅ Fechas de nacimiento apropiadas por grado
- ✅ DNIs únicos secuenciales 
- ✅ Teléfonos de contacto
- ✅ Direcciones variadas en Lima
- ✅ Datos completos de padres/apoderados
- ✅ Emails únicos para cada padre
- ✅ Observaciones personalizadas por estudiante

## 🔧 Cómo Usar la Planilla

### Para importar en el sistema:

1. **Abrir el archivo** `ejemplo_50_estudiantes.csv` en Excel
2. **Guardar como** archivo Excel (.xlsx)
3. **En el sistema:** Ir a Admin → Usuarios → "Importar Estudiantes"
4. **Seleccionar** el archivo Excel
5. **Validar** que los datos se muestren correctamente
6. **Confirmar** la importación

### Validaciones del Sistema:

- ✅ Códigos de estudiante únicos
- ✅ DNIs únicos y válidos
- ✅ Emails de padres únicos
- ✅ Grados y secciones existentes
- ✅ Formato de fechas correcto
- ✅ Campos obligatorios completos

## 📝 Notas Importantes

- Los **códigos de estudiante** deben ser únicos en todo el sistema
- Los **emails de padres** también deben ser únicos (un email = un padre)
- Las **fechas** deben usar formato ISO (YYYY-MM-DD)
- Los **grados** deben coincidir exactamente con los disponibles
- Las **secciones** deben existir para el grado especificado

## 🚀 Sistema de Importación

El sistema incluye:
- **Validación automática** de datos
- **Detección de duplicados** 
- **Creación automática** de usuarios padre
- **Relaciones padre-hijo** automáticas
- **Códigos QR** para cada estudiante
- **Notificaciones** de bienvenida