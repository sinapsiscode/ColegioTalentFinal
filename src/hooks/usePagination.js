import { useState, useMemo } from 'react'
import { DEFAULTS } from '../utils/constants'

/**
 * Custom hook para manejar paginación
 * @param {Array} items - Lista de items para paginar
 * @param {Number} itemsPerPage - Items por página (default: DEFAULTS.ITEMS_PER_PAGE)
 * @returns {Object} - Datos de paginación y funciones de control
 */
export const usePagination = (items = [], itemsPerPage = DEFAULTS.ITEMS_PER_PAGE) => {
  const [currentPage, setCurrentPage] = useState(1)

  // Calcular totales
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Obtener items de la página actual
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage])

  // Funciones de navegación
  const goToPage = (page) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const firstPage = () => setCurrentPage(1)
  const lastPage = () => setCurrentPage(totalPages)

  // Reset cuando cambian los items
  const resetPage = () => setCurrentPage(1)

  // Información de paginación
  const pageInfo = {
    from: totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
    to: Math.min(currentPage * itemsPerPage, totalItems),
    total: totalItems
  }

  return {
    // Datos
    currentPage,
    totalPages,
    paginatedItems,
    itemsPerPage,
    
    // Navegación
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    resetPage,
    setCurrentPage,
    
    // Estados
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    
    // Info
    pageInfo,
    isEmpty: totalItems === 0
  }
}

export default usePagination