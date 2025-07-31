import React from 'react'
import ErrorToast, { useErrorToasts } from './ErrorToast'

const ErrorToastContainer = () => {
  const { toasts, removeErrorToast } = useErrorToasts()

  return (
    <>
      {toasts.map((toast, index) => (
        <ErrorToast
          key={toast.id}
          error={toast.error}
          onClose={() => removeErrorToast(toast.id)}
          onRetry={toast.onRetry}
          position={toast.position || 'top-right'}
          autoClose={toast.autoClose !== false}
          duration={toast.duration || 5000}
          style={{
            zIndex: 9999 - index // Asegurar que los más recientes estén encima
          }}
        />
      ))}
    </>
  )
}

export default ErrorToastContainer