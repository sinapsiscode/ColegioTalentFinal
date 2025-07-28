import React from 'react'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import AnimatedButton from './AnimatedButton'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para que el siguiente renderizado muestre la interfaz de error
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Registrar el error en un servicio de reporte de errores
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    // Recargar la página si es necesario
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // Interfaz de error personalizada
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
              <FiAlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              ¡Ups! Algo salió mal
            </h1>
            
            <p className="text-gray-600 text-center mb-6">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>

            {/* Mostrar detalles del error solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Detalles del error (solo visible en desarrollo):
                </p>
                <pre className="text-xs text-red-600 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex justify-center">
              <AnimatedButton
                variant="primary"
                icon={FiRefreshCw}
                onClick={this.handleReset}
              >
                Recargar página
              </AnimatedButton>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Si el problema persiste, por favor contacta al administrador del sistema.
            </p>
          </div>
        </div>
      )
    }

    // Renderizar los componentes hijos normalmente
    return this.props.children
  }
}

export default ErrorBoundary