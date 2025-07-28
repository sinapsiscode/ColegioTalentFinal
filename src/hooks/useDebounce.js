import { useState, useEffect } from 'react'

/**
 * Hook personalizado para debounce
 * @param {any} value - El valor a hacer debounce
 * @param {number} delay - El delay en milisegundos (por defecto 500ms)
 * @returns {any} - El valor con debounce aplicado
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Establecer un timer para actualizar el valor después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpiar el timer si el valor cambia antes de que se complete el delay
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce