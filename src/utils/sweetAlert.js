import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

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

export const showError = (title, text, options = {}) => {
  return MySwal.fire({
    ...defaultConfig,
    title,
    text,
    icon: 'error',
    ...options
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

export const showConfirm = (title, text, options = {}) => {
  return MySwal.fire({
    ...defaultConfig,
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar',
    ...options
  })
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

export default MySwal