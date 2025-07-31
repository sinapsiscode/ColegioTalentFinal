import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { errorToastManager } from '../components/error/ErrorToast'

const MySwal = withReactContent(Swal)

const defaultConfig = {
  customClass: {
    confirmButton: 'btn-primary ml-3',
    cancelButton: 'btn-outline mr-3',
    popup: 'rounded-lg',
    title: 'text-talentos-primary',
    actions: 'gap-4'
  },
  buttonsStyling: false,
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  showCloseButton: true
}

export const showSuccess = (title, text, options = {}) => {
  return MySwal.fire({
    ...defaultConfig,
    title,
    text,
    icon: 'success',
    timer: 3000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    ...options
  })
}

// Función específica para mostrar errores con toast
export const showErrorToast = (error, options = {}) => {
  const errorObj = typeof error === 'string' ? { message: error } : error
  return errorToastManager.addToast(errorObj, {
    onRetry: options.onRetry,
    position: options.position || 'top-right',
    duration: options.duration || 5000,
    autoClose: options.autoClose !== false
  })
}

export const showError = (title, text, options = {}) => {
  const { useToast = false, ...swalOptions } = options
  
  // Si se especifica usar toast, usar el sistema de toasts
  if (useToast) {
    const errorObj = typeof title === 'string' ? { message: title } : title
    return errorToastManager.addToast(errorObj, {
      onRetry: options.onRetry,
      position: options.position || 'top-right',
      duration: options.duration || 5000
    })
  }
  
  // Usar SweetAlert2 tradicional
  return MySwal.fire({
    ...defaultConfig,
    title,
    text,
    icon: 'error',
    ...swalOptions
  })
}

export const showWarning = (title, text, options = {}) => {
  return MySwal.fire({
    ...defaultConfig,
    title,
    text,
    icon: 'warning',
    ...options
  })
}

export const showInfo = (title, text, options = {}) => {
  return MySwal.fire({
    ...defaultConfig,
    title,
    text,
    icon: 'info',
    ...options
  })
}

export const showConfirm = (title, text, confirmText = 'Sí, confirmar', denyText = null, options = {}) => {
  // Si se proporciona denyText, activar el botón deny
  const config = {
    ...defaultConfig,
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || confirmText,
    cancelButtonText: options.cancelButtonText || 'Cancelar',
    ...options
  }
  
  // Si se proporciona denyText, agregar configuración para tres botones
  if (denyText && options.denyButtonText) {
    config.showDenyButton = true
    config.denyButtonText = options.denyButtonText || denyText
    config.denyButtonColor = '#22c55e' // Verde para Excel
    config.confirmButtonColor = '#dc2626' // Rojo para PDF
  }
  
  return MySwal.fire(config)
}

export const showDeleteConfirm = (itemName, options = {}) => {
  return MySwal.fire({
    ...defaultConfig,
    title: '¿Estás seguro?',
    text: `Esta acción eliminará ${itemName} permanentemente`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
    ...options
  })
}

export const showLoading = (title = 'Procesando...', text = 'Por favor espera') => {
  return MySwal.fire({
    ...defaultConfig,
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      MySwal.showLoading()
    }
  })
}

export const showInput = (title, inputLabel, options = {}) => {
  return MySwal.fire({
    ...defaultConfig,
    title,
    input: 'text',
    inputLabel,
    showCancelButton: true,
    confirmButtonText: 'Continuar',
    cancelButtonText: 'Cancelar',
    customClass: {
      ...defaultConfig.customClass,
      actions: 'swal2-actions-custom',
      confirmButton: 'btn-primary swal2-confirm-custom',
      cancelButton: 'btn-outline swal2-cancel-custom'
    },
    inputValidator: (value) => {
      if (!value) {
        return 'Este campo es requerido'
      }
    },
    ...options
  })
}

export const showTextarea = (title, inputLabel, options = {}) => {
  return MySwal.fire({
    ...defaultConfig,
    title,
    input: 'textarea',
    inputLabel,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'Este campo es requerido'
      }
    },
    ...options
  })
}

export const showSelect = (title, options, inputLabel, selectOptions = {}) => {
  return MySwal.fire({
    ...defaultConfig,
    title,
    input: 'select',
    inputLabel,
    inputOptions: options,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'Debes seleccionar una opción'
      }
    },
    ...selectOptions
  })
}

export const showToast = (title, icon = 'success', position = 'top-end') => {
  return MySwal.fire({
    title,
    icon,
    toast: true,
    position,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: 'rounded-lg shadow-lg'
    }
  })
}

export const showNotification = (message, type = 'info') => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: '💡'
  }
  
  return showToast(`${icons[type]} ${message}`, type)
}

export const showProgressSteps = (steps, currentStep = 0) => {
  return MySwal.fire({
    ...defaultConfig,
    title: 'Progreso',
    progressSteps: steps.map((_, index) => index + 1),
    currentProgressStep: currentStep,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Cerrar'
  })
}

export const closeModal = () => {
  MySwal.close()
}

export const showCustomForm = (title, formFields, options = {}) => {
  const inputTypes = {
    text: 'text',
    email: 'email',
    password: 'password',
    number: 'number',
    tel: 'tel',
    url: 'url',
    textarea: 'textarea',
    select: 'select',
    radio: 'radio',
    checkbox: 'checkbox'
  }
  
  return MySwal.fire({
    ...defaultConfig,
    title,
    html: formFields.map(field => {
      switch (field.type) {
        case 'textarea':
          return `
            <div class="mb-4 text-left">
              <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
              <textarea 
                id="${field.name}" 
                name="${field.name}"
                class="input-field w-full"
                placeholder="${field.placeholder || ''}"
                ${field.required ? 'required' : ''}
              ></textarea>
            </div>
          `
        case 'select':
          return `
            <div class="mb-4 text-left">
              <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
              <select 
                id="${field.name}" 
                name="${field.name}"
                class="input-field w-full"
                ${field.required ? 'required' : ''}
              >
                <option value="">Seleccionar...</option>
                ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
              </select>
            </div>
          `
        default:
          return `
            <div class="mb-4 text-left">
              <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
              <input 
                type="${inputTypes[field.type] || 'text'}" 
                id="${field.name}" 
                name="${field.name}"
                class="input-field w-full"
                placeholder="${field.placeholder || ''}"
                ${field.required ? 'required' : ''}
              />
            </div>
          `
      }
    }).join(''),
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const result = {}
      formFields.forEach(field => {
        const element = document.getElementById(field.name)
        if (element) {
          result[field.name] = element.value
          if (field.required && !element.value) {
            MySwal.showValidationMessage(`${field.label} es requerido`)
            return false
          }
        }
      })
      return result
    },
    ...options
  })
}

// Función específica para seleccionar formato de exportación
export const showExportFormatSelector = (title = 'Exportar Lista de Alumnos') => {
  const isMobile = window.innerWidth < 640
  
  return MySwal.fire({
    title: title,
    text: '¿En qué formato deseas descargar la lista?',
    icon: 'question',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: isMobile ? 'PDF' : '<i class="far fa-file-pdf mr-2"></i> PDF',
    denyButtonText: isMobile ? 'Excel' : '<i class="far fa-file-excel mr-2"></i> Excel',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626', // Rojo para PDF
    denyButtonColor: '#22c55e', // Verde para Excel
    customClass: {
      popup: 'rounded-lg',
      title: isMobile ? 'text-base' : 'text-lg',
      htmlContainer: 'text-sm',
      actions: isMobile ? 'flex-col space-y-2' : 'flex-row space-x-2',
      confirmButton: `${isMobile ? 'w-full' : ''} bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors`,
      denyButton: `${isMobile ? 'w-full' : ''} bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors`,
      cancelButton: `${isMobile ? 'w-full' : ''} bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors`
    },
    buttonsStyling: false,
    width: isMobile ? '90%' : '32rem',
    padding: isMobile ? '1rem' : '1.5rem'
  })
}

export default MySwal