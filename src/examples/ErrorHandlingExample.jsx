import React, { useState } from 'react'
import { Button } from '../components/ui'
import { useErrorHandler, useFormErrorHandler } from '../hooks/useErrorHandler'
import { showErrorToast } from '../utils/sweetAlert'

const ErrorHandlingExample = () => {
  const { executeWithErrorHandling, isLoading, error } = useErrorHandler()
  const { fieldErrors, handleFormError } = useFormErrorHandler()
  const [data, setData] = useState(null)

  // Simular diferentes tipos de errores
  const simulateNetworkError = () => {
    const error = new Error('Network Error')
    error.code = 'NETWORK_ERROR'
    throw error
  }

  const simulateServerError = () => {
    const error = new Error('Internal Server Error')
    error.response = { status: 500 }
    throw error
  }

  const simulateValidationError = () => {
    const error = new Error('Validation Error')
    error.response = {
      status: 400,
      data: {
        errors: {
          email: 'El email es requerido',
          password: 'La contraseña debe tener al menos 6 caracteres'
        }
      }
    }
    throw error
  }

  const simulateSuccess = async () => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { message: 'Operación exitosa', data: { id: 1, name: 'Test' } }
  }

  // Ejemplo 1: Error con toast personalizado
  const handleNetworkError = () => {
    showErrorToast(
      { message: 'No se pudo conectar al servidor' },
      {
        onRetry: handleNetworkError,
        position: 'top-center',
        duration: 8000
      }
    )
  }

  // Ejemplo 2: Error con hook
  const handleServerError = () => {
    executeWithErrorHandling(
      simulateServerError,
      {
        customMessage: 'Error en el servidor, inténtalo más tarde',
        onError: (error, message) => {
          console.log('Error capturado:', message)
        }
      }
    )
  }

  // Ejemplo 3: Operación exitosa
  const handleSuccess = () => {
    executeWithErrorHandling(
      simulateSuccess,
      {
        onSuccess: (result) => {
          setData(result.data)
          console.log('Operación exitosa:', result)
        }
      }
    )
  }

  // Ejemplo 4: Error de validación de formulario
  const handleValidationError = () => {
    try {
      simulateValidationError()
    } catch (error) {
      handleFormError(error, ['email', 'password'])
    }
  }

  // Ejemplo 5: Error que rompe el componente (para probar ErrorBoundary)
  const handleCriticalError = () => {
    // Esto causará que el ErrorBoundary capture el error
    throw new Error('Error crítico que rompe el componente')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Sistema de Manejo de Errores</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Ejemplos de errores */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Tipos de Errores</h2>
          <div className="space-y-3">
            <Button
              onClick={handleNetworkError}
              variant="outline"
              className="w-full"
            >
              Error de Red (Toast personalizado)
            </Button>
            
            <Button
              onClick={handleServerError}
              variant="outline" 
              className="w-full"
              loading={isLoading}
            >
              Error de Servidor (Hook)
            </Button>
            
            <Button
              onClick={handleValidationError}
              variant="outline"
              className="w-full"
            >
              Error de Validación
            </Button>
            
            <Button
              onClick={handleCriticalError}
              variant="danger"
              className="w-full"
            >
              Error Crítico (Error Boundary)
            </Button>
          </div>
        </div>

        {/* Operación exitosa */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Operación Exitosa</h2>
          <Button
            onClick={handleSuccess}
            variant="success"
            loading={isLoading}
            className="w-full mb-4"
          >
            Simular Operación Exitosa
          </Button>
          
          {data && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-800 font-medium">Datos recibidos:</p>
              <pre className="text-green-700 text-sm mt-1">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Mostrar errores del hook */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error capturado por hook:</h3>
          <p className="text-red-700 mt-1">{error.message}</p>
          <p className="text-red-600 text-sm mt-1">
            Timestamp: {new Date(error.timestamp).toLocaleString()}
          </p>
        </div>
      )}

      {/* Mostrar errores de formulario */}
      {Object.keys(fieldErrors).length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">Errores de validación:</h3>
          <ul className="mt-2 space-y-1">
            {Object.entries(fieldErrors).map(([field, message]) => (
              <li key={field} className="text-yellow-700 text-sm">
                <strong>{field}:</strong> {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Información sobre el sistema */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-medium mb-2">Sistema de Manejo de Errores</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>✅ <strong>Error Boundary:</strong> Captura errores que rompen componentes</li>
          <li>✅ <strong>Error Toasts:</strong> Notificaciones elegantes con retry automático</li>
          <li>✅ <strong>Hooks de Error:</strong> Manejo consistente en componentes</li>
          <li>✅ <strong>Logging:</strong> Registro automático para debugging</li>
          <li>✅ <strong>Diferentes tipos:</strong> Red, servidor, validación, críticos</li>
          <li>✅ <strong>Retry automático:</strong> Para errores recuperables</li>
        </ul>
      </div>
    </div>
  )
}

export default ErrorHandlingExample