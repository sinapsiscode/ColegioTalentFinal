# Guía del Componente UnifiedExcelButton

El componente `UnifiedExcelButton` es una solución unificada para todas las funcionalidades de exportación e importación de Excel **Y PDF** en la aplicación. Reemplaza los múltiples botones dispersos por toda la aplicación con una implementación consistente y funcional.

## 🚀 Características Principales

- **Exportación automática** con formatos profesionales (Excel + PDF)
- **Modal de selección de formato** para admin/tutores
- **Importación de archivos Excel** con validación
- **Soporte para múltiples tipos de datos** (usuarios, estudiantes, calificaciones, etc.)
- **Detección automática de roles** de usuario
- **Callbacks personalizables** para éxito y errores
- **Filtros aplicables** en tiempo real
- **Múltiples variantes de diseño** y tamaños
- **Dropdown dinámico** para exportar/importar
- **Totalmente responsive** y accesible

## 📦 Instalación y Uso

### Importación
```jsx
import UnifiedExcelButton from '../components/common/UnifiedExcelButton'
```

### Uso Básico
```jsx
<UnifiedExcelButton
  data={usuarios}
  dataType="usuarios"
  customLabel="Exportar Usuarios"
/>
```

## 🎯 Props Disponibles

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `data` | Array | `[]` | Datos a exportar |
| `dataType` | String | `'generic'` | Tipo de datos (usuarios, estudiantes, etc.) |
| `fileName` | String | `null` | Nombre personalizado del archivo |
| `variant` | String | `'primary'` | Estilo del botón |
| `size` | String | `'default'` | Tamaño del botón |
| `showDropdown` | Boolean | `false` | Mostrar dropdown para importar/exportar |
| `onImport` | Function | `null` | Callback para importación |
| `onExportSuccess` | Function | `null` | Callback para exportación exitosa |
| `onExportError` | Function | `null` | Callback para errores |
| `onExportPDF` | Function | `null` | **NUEVO** Callback para exportación PDF |
| `showFormatModal` | Boolean | `false` | **NUEVO** Forzar mostrar modal de formato |
| `userRole` | String | `null` | **NUEVO** Rol del usuario (admin/tutor/padre) |
| `className` | String | `''` | Clases CSS adicionales |
| `disabled` | Boolean | `false` | Deshabilitar el botón |
| `filterFn` | Function | `null` | Función para filtrar datos |
| `customLabel` | String | `null` | Etiqueta personalizada |

## 🎨 Variantes de Diseño

### Variants
- `primary` - Azul principal (default)
- `secondary` - Gris
- `success` - Verde
- `outline` - Borde con fondo transparente
- `ghost` - Sin fondo, solo texto

### Sizes
- `sm` - Pequeño
- `default` - Normal
- `lg` - Grande

## 📊 Tipos de Datos Soportados

### usuarios
Exporta datos de usuarios del sistema con formato profesional.
```jsx
<UnifiedExcelButton
  data={users}
  dataType="usuarios"
  customLabel="Exportar Usuarios"
/>
```

### estudiantes
Exporta información de estudiantes con todos sus datos.
```jsx
<UnifiedExcelButton
  data={students}
  dataType="estudiantes"
  showDropdown={true}
  onImport={handleImportStudents}
/>
```

### comunicados
Exporta comunicados con estadísticas y metadatos.
```jsx
<UnifiedExcelButton
  data={communiques}
  dataType="comunicados"
  variant="outline"
/>
```

### calificaciones
Exporta notas con formato condicional (colores por rendimiento).
```jsx
<UnifiedExcelButton
  data={grades}
  dataType="calificaciones"
  onExportSuccess={() => showSuccess('Notas exportadas')}
/>
```

### asistencia
Exporta registros de asistencia con formato condicional.
```jsx
<UnifiedExcelButton
  data={attendance}
  dataType="asistencia"
  filterFn={(record) => record.fecha >= startDate}
/>
```

### pagos
Exporta cronograma de pagos con hoja de resumen adicional.
```jsx
<UnifiedExcelButton
  data={payments}
  dataType="pagos"
  variant="success"
/>
```

### generic
Para datos personalizados que no tienen un tipo específico.
```jsx
<UnifiedExcelButton
  data={customData}
  dataType="generic"
  fileName="mi_reporte_custom.xlsx"
/>
```

## 🆕 Nuevas Funcionalidades PDF

### Modal de Selección de Formato
Los usuarios **admin** y **tutor** automáticamente ven un modal para elegir entre Excel y PDF:

```jsx
<UnifiedExcelButton
  data={usuarios}
  dataType="usuarios"
  userRole="admin" // o "tutor"
  onExportPDF={async (data) => {
    // Tu función de generación PDF
    return await generateUsersPDF(data)
  }}
/>
```

### Detección Automática por Rol
```jsx
// Admin/Tutor: Modal con Excel + PDF
<UnifiedExcelButton
  data={estudiantes}
  dataType="estudiantes"
  userRole={usuario.rol} // Si es admin/tutor → modal
  onExportPDF={generateStudentsPDF}
/>

// Padre: Solo Excel directo
<UnifiedExcelButton
  data={estudiantes}
  dataType="estudiantes"
  userRole="padre" // Solo Excel, sin modal
/>
```

## 🔧 Ejemplos Avanzados

### Con Filtros Dinámicos
```jsx
const [filter, setFilter] = useState('')

<UnifiedExcelButton
  data={users}
  dataType="usuarios"
  filterFn={(user) => user.rol.includes(filter)}
  customLabel={`Exportar ${filteredCount} usuarios`}
  userRole="admin"
  onExportPDF={generateFilteredUsersPDF}
/>
```

### Con Dropdown e Importación
```jsx
<UnifiedExcelButton
  data={students}
  dataType="estudiantes"
  showDropdown={true}
  onImport={(data, fileName) => {
    console.log('Importando:', data)
    processImportedStudents(data)
  }}
  onExportSuccess={(result) => {
    showNotification(`${result.registros} estudiantes exportados`)
  }}
/>
```

### Botón Personalizado
```jsx
<UnifiedExcelButton
  data={grades}
  dataType="calificaciones"
  variant="outline"
  size="lg"
  customLabel="Descargar Calificaciones"
  className="w-full"
  onExportError={(error) => {
    console.error('Error personalizado:', error)
    showCustomErrorModal(error)
  }}
/>
```

## 🎭 Callbacks y Eventos

### onExportSuccess
Se ejecuta cuando la exportación es exitosa.
```jsx
onExportSuccess={(result) => {
  console.log('Archivo:', result.archivo)
  console.log('Registros:', result.registros)
  showSuccess(result.mensaje)
}}
```

### onExportError
Se ejecuta cuando hay un error en la exportación.
```jsx
onExportError={(error) => {
  console.error('Error:', error)
  showError('Error personalizado', error.message)
}}
```

### onImport
Se ejecuta cuando se importa un archivo Excel.
```jsx
onImport={(data, fileName) => {
  console.log('Archivo:', fileName)
  console.log('Datos:', data)
  
  // Validar y procesar datos
  if (validateImportedData(data)) {
    processImportedData(data)
    showSuccess(`${data.length} registros importados`)
  }
}}
```

## 🎨 Estilos y Personalización

### Clases CSS Personalizadas
```jsx
<UnifiedExcelButton
  data={data}
  dataType="usuarios"
  className="shadow-lg border-2 border-blue-300"
  variant="outline"
/>
```

### Estados del Botón
El botón maneja automáticamente los estados:
- **Normal**: Disponible para uso
- **Loading**: Mostrando "Exportando..." o "Importando..."
- **Disabled**: Deshabilitado por prop o durante procesamiento

## 🔄 Integración en Páginas Existentes

### Reemplazo de Botones Antiguos

**Antes:**
```jsx
<button onClick={() => exportUsers()}>
  Exportar Excel
</button>
```

**Después:**
```jsx
<UnifiedExcelButton
  data={users}
  dataType="usuarios"
  customLabel="Exportar Excel"
/>
```

### En Componentes Admin
```jsx
// En UserManagement.jsx
<UnifiedExcelButton
  data={selectedUsers}
  dataType="usuarios"
  size="sm"
  onExportSuccess={() => setSelectedUsers([])}
/>
```

### En Vistas de Tutor
```jsx
// En TutorStudents.jsx
<UnifiedExcelButton
  data={filteredStudents}
  dataType="estudiantes"
  showDropdown={true}
  onImport={handleImportStudents}
/>
```

## 🚨 Manejo de Errores

El componente maneja automáticamente:
- Archivos Excel corruptos o inválidos
- Datos vacíos o nulos
- Errores de la librería XLSX
- Errores de escritura de archivos

Todos los errores se muestran con notificaciones amigables usando `sweetAlert`.

## 📱 Responsive Design

El componente es completamente responsive:
- Se adapta a pantallas pequeñas
- Iconos y texto ajustables
- Dropdown posicionado correctamente
- Touch-friendly en dispositivos móviles

## 🔧 Dependencias

- `xlsx` - Para procesamiento de archivos Excel
- `framer-motion` - Para animaciones
- `lucide-react` - Para iconos
- `sweetAlert` - Para notificaciones

## 📋 Testing

Para probar el componente:

1. Importa el archivo de ejemplos:
```jsx
import ExcelButtonExamples from '../examples/ExcelButtonExamples'
```

2. Usa el componente en desarrollo para probar todas las funcionalidades.

## 🎯 Mejores Prácticas

1. **Usa el dataType correcto** para aprovechar el formato específico
2. **Implementa callbacks** para feedback al usuario
3. **Aplica filtros** antes de pasar los datos si es necesario
4. **Personaliza labels** para contexto específico
5. **Maneja errores** con callbacks personalizados cuando sea necesario

## 🚀 Próximas Mejoras

- [ ] Soporte para más formatos (CSV, JSON)
- [ ] Validación avanzada de datos importados
- [ ] Preview de datos antes de exportar
- [ ] Plantillas de importación personalizables
- [ ] Compresión automática para archivos grandes

---

¡El componente `UnifiedExcelButton` está listo para usar en toda la aplicación! 🎉