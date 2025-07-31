import { useState, useCallback } from 'react'
import { showError } from '../utils/sweetAlert'

export const useErrorHandler = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Manejar errores de forma consistente
  const handleError = useCallback((error, options = {}) => {
    const {
      showToast = true,
      logError = true,
      customMessage = null
    } = options

    console.error('Error handled:', error)

    // Determinar el mensaje de error
    let errorMessage = customMessage || 'Ha ocurrido un error inesperado'
    
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error?.message) {
      errorMessage = error.message
    }

    // Establecer el error en el estado
    setError({
      message: errorMessage,
      originalError: error,
      timestamp: new Date().toISOString()
    })

    // Mostrar toast si está habilitado
    if (showToast) {
      showError(errorMessage)
    }

    // Log del error si está habilitado
    if (logError) {
      logErrorToConsole(error, errorMessage)
    }

    return errorMessage
  }, [])

  // Ejecutar función async con manejo de errores
  const executeWithErrorHandling = useCallback(async (asyncFunction, options = {}) => {
    const {
      loadingState = true,
      showToast = true,
      customMessage = null,
      onSuccess = null,
      onError = null
    } = options

    try {
      if (loadingState) setIsLoading(true)
      setError(null)

      const result = await asyncFunction()
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (error) {
      const errorMessage = handleError(error, { showToast, customMessage })
      
      if (onError) {
        onError(error, errorMessage)
      }
      
      throw error // Re-throw para que el componente pueda manejar si es necesario
    } finally {
      if (loadingState) setIsLoading(false)
    }
  }, [handleError])

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Retry function
  const retry = useCallback((asyncFunction, options = {}) => {
    clearError()
    return executeWithErrorHandling(asyncFunction, options)
  }, [clearError, executeWithErrorHandling])

  return {
    error,
    isLoading,
    handleError,
    executeWithErrorHandling,
    clearError,
    retry
  }
}

// Función auxiliar para logging
const logErrorToConsole = (error, message) => {
  const errorInfo = {
    message,
    originalError: error,
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href
  }

  console.group('🚨 Error Handler Log')
  console.error('Message:', message)
  console.error('Original Error:', error)
  console.error('Stack:', error?.stack)
  console.error('Full Info:', errorInfo)
  console.groupEnd()
}

// Hook especializado para formularios
export const useFormErrorHandler = () => {
  const [fieldErrors, setFieldErrors] = useState({})
  const { handleError, executeWithErrorHandling, isLoading } = useErrorHandler()

  const handleFormError = useCallback((error, formFields = []) => {
    // Limpiar errores previos
    setFieldErrors({})

    // Si es un error de validación con campos específicos
    if (error?.response?.data?.errors) {
      const errors = error.response.data.errors
      const newFieldErrors = {}

      formFields.forEach(field => {
        if (errors[field]) {
          newFieldErrors[field] = errors[field]
        }
      })

      setFieldErrors(newFieldErrors)
      return newFieldErrors
    }

    // Si no es un error de campo específico, usar el handler general
    handleError(error)
    return null
  }, [handleError])

  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({})
  }, [])

  return {
    fieldErrors,
    handleFormError,
    clearFieldError,
    clearAllFieldErrors,
    executeWithErrorHandling,
    isLoading
  }
}

export default useErrorHandler