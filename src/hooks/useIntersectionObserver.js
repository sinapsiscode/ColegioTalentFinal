import { useState, useEffect, useRef } from 'react'

/**
 * Hook para observar la intersección de elementos con el viewport
 * Útil para lazy loading y animaciones al hacer scroll
 * @param {Object} options - Opciones para el IntersectionObserver
 * @returns {Object} - ref y isIntersecting
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const targetRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })

    const currentTarget = targetRef.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [options])

  return { targetRef, isIntersecting }
}

export default useIntersectionObserver