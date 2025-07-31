import { useState, useMemo } from 'react'

/**
 * Custom hook para manejar búsquedas en listas
 * @param {Array} items - Lista de items para buscar
 * @param {Array|String} searchFields - Campos donde buscar (puede ser string para un solo campo)
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - searchTerm, setSearchTerm, filteredItems, isSearching
 */
export const useSearch = (items = [], searchFields = [], options = {}) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Convertir searchFields a array si es string
  const fields = Array.isArray(searchFields) ? searchFields : [searchFields]
  
  // Opciones por defecto
  const {
    caseSensitive = false,
    trimSearch = true,
    minSearchLength = 0
  } = options

  const filteredItems = useMemo(() => {
    // Si no hay término de búsqueda o es menor al mínimo, retornar todos
    const term = trimSearch ? searchTerm.trim() : searchTerm
    if (!term || term.length < minSearchLength) return items

    // Preparar término de búsqueda
    const searchValue = caseSensitive ? term : term.toLowerCase()

    return items.filter(item => {
      return fields.some(field => {
        // Obtener valor del campo (soporta campos anidados con notación de punto)
        const value = field.split('.').reduce((obj, key) => obj?.[key], item)
        
        if (value === null || value === undefined) return false
        
        const stringValue = String(value)
        const compareValue = caseSensitive ? stringValue : stringValue.toLowerCase()
        
        return compareValue.includes(searchValue)
      })
    })
  }, [items, searchTerm, fields, caseSensitive, trimSearch, minSearchLength])

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    isSearching: searchTerm.trim().length > 0,
    resultCount: filteredItems.length,
    clearSearch: () => setSearchTerm('')
  }
}

export default useSearch