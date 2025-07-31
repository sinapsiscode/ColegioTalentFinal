import React from 'react'
import { FiAlertTriangle, FiRefreshCw, FiHome, FiMail } from 'react-icons/fi'
import { Button } from '../ui'

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    // Actualiza el state para mostrar el UI de error
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  }

  componentDidCatch(error, errorInfo) {
    // Captura el error y su información
    this.setState({
      error,
      errorInfo
    })

    // Log del error para debugging
    console.error('Error capturado por ErrorBoundary:', error, errorInfo)
    
    // Aquí podrías enviar el error a un servicio de logging
    this.logErrorToService(error, errorInfo)
  }

  logErrorToService = (error, errorInfo) => {
    // Simulación de envío de error a servicio de logging
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    // En producción, enviarías esto a tu servicio de logging
    console.log('Error Report:', errorReport)
    
    // Guardar en localStorage para debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      existingErrors.push(errorReport)
      // Mantener solo los últimos 10 errores
      if (existingErrors.length > 10) {
        existingErrors.shift()
      }
      localStorage.setItem('app_errors', JSON.stringify(existingErrors))
    } catch (e) {
      console.error('No se pudo guardar el error en localStorage:', e)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportBug = () => {
    const subject = `Error Report - ID: ${this.state.errorId}`
    const body = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Stack Trace:
${this.state.error?.stack}

Component Stack:
${this.state.errorInfo?.componentStack}
    `
    
    const mailtoLink = `mailto:soporte@talentoscollege.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <FiAlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Oops! Algo salió mal
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              La aplicación encontró un error inesperado. Nuestro equipo ha sido notificado 
              y trabajará para solucionarlo.
            </p>

            {/* Error ID */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-500">ID del Error:</p>
              <p className="text-sm font-mono text-gray-700">{this.state.errorId}</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={this.handleReload}
                variant="primary"
                icon={FiRefreshCw}
                className="w-full"
              >
                Recargar Página
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
                icon={FiHome}
                className="w-full"
              >
                Ir al Inicio
              </Button>

              <Button
                onClick={this.handleReportBug}
                variant="ghost"
                icon={FiMail}
                size="sm"
                className="w-full"
              >
                Reportar Error
              </Button>
            </div>

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalles técnicos (Solo desarrollo)
                </summary>
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap mb-4">
                    {this.state.error?.message}
                  </pre>
                  
                  <h3 className="font-semibold text-red-800 mb-2">Stack Trace:</h3>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-32">
                    {this.state.error?.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default GlobalErrorBoundary