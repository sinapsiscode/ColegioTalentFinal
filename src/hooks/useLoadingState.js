import { useState, useCallback } from 'react'

/**
 * Custom hook para manejar estados de carga, error y datos
 * @param {*} initialData - Datos iniciales
 * @returns {Object} - data, loading, error, setData, setLoading, setError, reset, execute
 */
export const useLoadingState = (initialData = null) => {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Resetear todo al estado inicial
  const reset = useCallback(() => {
    setData(initialData)
    setLoading(false)
    setError(null)
  }, [initialData])

  // Ejecutar una función asíncrona con manejo de estados
  const execute = useCallback(async (asyncFunction) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFunction()
      setData(result)
      setLoading(false)
      return result
    } catch (err) {
      setError(err.message || 'Ocurrió un error')
      setLoading(false)
      throw err
    }
  }, [])

  // Helpers para actualizar estados individuales
  const startLoading = useCallback(() => {
    setLoading(true)
    setError(null)
  }, [])

  const stopLoading = useCallback(() => {
    setLoading(false)
  }, [])

  const setSuccess = useCallback((newData) => {
    setData(newData)
    setLoading(false)
    setError(null)
  }, [])

  const setFailure = useCallback((errorMessage) => {
    setError(errorMessage)
    setLoading(false)
  }, [])

  return {
    // Estados
    data,
    loading,
    error,
    
    // Setters directos
    setData,
    setLoading,
    setError,
    
    // Helpers
    reset,
    execute,
    startLoading,
    stopLoading,
    setSuccess,
    setFailure,
    
    // Estados derivados
    hasData: data !== null && data !== undefined,
    hasError: error !== null,
    isIdle: !loading && !error && data === initialData
  }
}

export default useLoadingState