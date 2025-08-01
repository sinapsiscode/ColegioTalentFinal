import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'
import ErrorBoundary from './ErrorBoundary'

// Componente de carga mejorado con indicador de progreso
const LazyLoadingFallback = ({ message = 'Cargando...', showProgress = true }) => {
  return (
    <motion.div 
      className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p className="mt-4 text-gray-600 text-sm">{message}</p>
      )}
      {showProgress && (
        <div className="mt-4 w-64">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-talentos-primary"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Wrapper para componentes lazy con error boundary
const LazyLoadWrapper = ({ 
  children, 
  fallback = <LazyLoadingFallback />,
  errorFallback = null 
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// HOC para envolver componentes lazy
export const withLazyLoad = (Component, options = {}) => {
  const {
    loadingMessage = 'Cargando componente...',
    showProgress = true,
    errorFallback = null
  } = options

  return (props) => (
    <LazyLoadWrapper 
      fallback={<LazyLoadingFallback message={loadingMessage} showProgress={showProgress} />}
      errorFallback={errorFallback}
    >
      <Component {...props} />
    </LazyLoadWrapper>
  )
}

// Utilidad para precargar componentes
export const preloadComponent = (componentPromise) => {
  // Inicia la carga del componente pero no espera
  componentPromise.then(() => {
    console.log('Component preloaded successfully')
  }).catch((error) => {
    console.error('Error preloading component:', error)
  })
}

// Hook para precargar rutas basado en el rol del usuario
export const usePreloadRoutes = (userRole) => {
  React.useEffect(() => {
    // Precargar rutas comunes según el rol
    switch (userRole) {
      case 'padre':
        // Precargar vistas más usadas por padres
        import('../../views/parent/Students')
        import('../../views/parent/Grades')
        import('../../views/parent/Messages')
        break
      case 'tutor':
        // Precargar vistas más usadas por tutores
        import('../../views/tutor/TutorStudents')
        import('../../views/tutor/Grades')
        import('../../views/tutor/Courses')
        break
      case 'admin':
        // Precargar vistas más usadas por admins
        import('../../views/admin/Users')
        import('../../views/admin/Reports')
        import('../../views/admin/Communiques')
        break
      default:
        break
    }
  }, [userRole])
}

export { LazyLoadingFallback, LazyLoadWrapper }
export default LazyLoadWrapper