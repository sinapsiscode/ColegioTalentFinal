import { useState, useMemo, useEffect } from 'react'
import { DEFAULTS } from './constants'

export const searchItems = (items, searchTerm, searchFields) => {
  if (!searchTerm.trim()) return items
  
  const term = searchTerm.toLowerCase().trim()
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = getNestedValue(item, field)
      return value && value.toString().toLowerCase().includes(term)
    })
  })
}

export const filterItems = (items, filters) => {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === 'all') return true
      
      const itemValue = getNestedValue(item, key)
      return itemValue === value
    })
  })
}

export const sortItems = (items, sortBy, sortOrder = 'asc') => {
  if (!sortBy) return items
  
  return [...items].sort((a, b) => {
    const aValue = getNestedValue(a, sortBy)
    const bValue = getNestedValue(b, sortBy)
    
    if (aValue === bValue) return 0
    
    const comparison = aValue < bValue ? -1 : 1
    return sortOrder === 'asc' ? comparison : -comparison
  })
}

export const paginateItems = (items, page, itemsPerPage) => {
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  return {
    items: items.slice(startIndex, endIndex),
    totalPages: Math.ceil(items.length / itemsPerPage),
    totalItems: items.length,
    currentPage: page,
    itemsPerPage
  }
}

export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

// Función para comparar IDs de manera segura (maneja strings y números)
export const compareIds = (id1, id2) => {
  // Si ambos son null o undefined, son iguales
  if (!id1 && !id2) return true
  
  // Si uno es null/undefined y el otro no, no son iguales
  if (!id1 || !id2) return false
  
  // Convertir ambos a string para comparación
  return id1.toString() === id2.toString()
}

export const useSearch = (initialItems, searchFields, initialFilters = {}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(DEFAULTS.ITEMS_PER_PAGE)
  
  const filteredItems = useMemo(() => {
    let result = [...initialItems]
    
    if (searchTerm) {
      result = searchItems(result, searchTerm, searchFields)
    }
    
    if (Object.keys(filters).length > 0) {
      result = filterItems(result, filters)
    }
    
    if (sortBy) {
      result = sortItems(result, sortBy, sortOrder)
    }
    
    return result
  }, [initialItems, searchTerm, filters, sortBy, sortOrder, searchFields])
  
  const paginatedResult = useMemo(() => {
    return paginateItems(filteredItems, currentPage, itemsPerPage)
  }, [filteredItems, currentPage, itemsPerPage])
  
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filters, sortBy, sortOrder])
  
  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    ...paginatedResult
  }
}