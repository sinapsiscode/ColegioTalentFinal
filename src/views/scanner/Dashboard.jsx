import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiCamera,
  FiUsers,
  FiActivity,
  FiSettings,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCalendar
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import useScannerStore from '../../stores/scannerStore'
import useAuthStore from '../../stores/authStore'

import QRScanner from '../../components/scanner/QRScanner'
import AttendanceStats from '../../components/scanner/AttendanceStats'
import AttendanceList from '../../components/scanner/AttendanceList'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import AnimatedButton from '../../components/common/AnimatedButton'
import { showSuccess, showError, showInfo } from '../../utils/sweetAlert'

const Dashboard = () => {
  const { usuario } = useAuthStore()
  const {
    cargando,
    escaneando,
    registrosAsistencia,
    estudiantesPresentes,
    estudiantesAusentes,
    estadisticasDelDia,
    inicializarDatos,
    generarReporte,
    resetearDia
  } = useScannerStore()

  const [mostrarEscaner, setMostrarEscaner] = useState(true)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date())

  // Inicializar datos al montar el componente
  useEffect(() => {
    inicializarDatos()
    
    // Actualizar cada 30 segundos
    const intervalo = setInterval(() => {
      setUltimaActualizacion(new Date())
    }, 30000)

    return () => clearInterval(intervalo)
  }, [inicializarDatos])

  // Handlers
  const handleScanSuccess = (registro) => {
    setUltimaActualizacion(new Date())
    
    // Mostrar notificación visual adicional
    const mensaje = registro.tipo === 'entrada' 
      ? `✅ Entrada registrada: ${registro.estudiante.nombre}`
      : `🚪 Salida registrada: ${registro.estudiante.nombre}`
    
    // En una implementación real, podrías enviar esto a un sistema de notificaciones
    console.log(mensaje)
  }

  const handleScanError = (error) => {
    console.error('Error en escaneo:', error)
  }

  const handleVerDetalle = (registro) => {
    const mensaje = `
      <div class="text-left">
        <h3 class="text-lg font-bold mb-3">${registro.estudiante.nombre}</h3>
        <div class="space-y-2 text-sm">
          <p><strong>Código:</strong> ${registro.estudiante.codigo}</p>
          <p><strong>Grado:</strong> ${registro.estudiante.grado}</p>
          <p><strong>Tipo:</strong> ${registro.tipo.charAt(0).toUpperCase() + registro.tipo.slice(1)}</p>
          <p><strong>Fecha:</strong> ${new Date(registro.fecha).toLocaleString('es-PE')}</p>
          <p><strong>Método:</strong> ${registro.metodo === 'qr' ? 'Escáner QR' : 'Manual'}</p>
          <p><strong>Ubicación:</strong> ${registro.ubicacion}</p>
          <p><strong>Usuario:</strong> ${registro.usuario}</p>
          ${registro.observaciones ? `<p><strong>Observaciones:</strong> ${registro.observaciones}</p>` : ''}
        </div>
      </div>
    `
    
    showInfo('Detalles del Registro', mensaje)
  }

  const handleEditarRegistro = (registro) => {
    showInfo('Editar Registro', 'Funcionalidad de edición próximamente disponible')
  }

  const handleExportarDatos = async () => {
    try {
      const reporte = await generarReporte('hoy')
      showSuccess(
        'Reporte generado',
        `Se han exportado ${reporte.totalRegistros} registros del día`
      )
    } catch (error) {
      showError('Error', 'No se pudo generar el reporte')
    }
  }

  const handleActualizar = () => {
    inicializarDatos()
    setUltimaActualizacion(new Date())
    showSuccess('Datos actualizados', 'La información ha sido actualizada')
  }

  const handleResetearDia = async () => {
    try {
      const result = await showInfo(
        '¿Resetear datos del día?',
        'Esta acción eliminará todos los registros del día actual. ¿Estás seguro?',
        true
      )
      
      if (result.isConfirmed) {
        resetearDia()
        showSuccess('Datos reseteados', 'Se han eliminado todos los registros del día')
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner size="xl" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Control de Acceso</h1>
            <p className="text-gray-600 mt-1">
              Sistema de registro de asistencia por código QR
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMostrarEscaner(!mostrarEscaner)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                mostrarEscaner
                  ? 'bg-talentos-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
              title={mostrarEscaner ? "Ocultar escáner" : "Mostrar escáner"}
            >
              <FiCamera className="w-5 h-5" />
            </motion.button>
            
            <AnimatedButton
              variant="outline"
              icon={FiRefreshCw}
              onClick={handleActualizar}
              size="sm"
            >
              Actualizar
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              icon={FiDownload}
              onClick={handleExportarDatos}
              size="sm"
            >
              Exportar
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              icon={FiSettings}
              onClick={handleResetearDia}
              size="sm"
            >
              Resetear
            </AnimatedButton>
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${escaneando ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900">
                    Escáner {escaneando ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FiUsers className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    {estudiantesPresentes.length} estudiantes presentes
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FiActivity className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600">
                    {registrosAsistencia.length} registros hoy
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <FiClock className="w-3 h-3" />
                <span>
                  Última actualización: {ultimaActualizacion.toLocaleTimeString('es-PE')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Escáner QR */}
            {mostrarEscaner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <QRScanner
                  onScanSuccess={handleScanSuccess}
                  onScanError={handleScanError}
                />
              </motion.div>
            )}

            {/* Estadísticas */}
            <AttendanceStats 
              estadisticas={estadisticasDelDia} 
              loading={cargando} 
            />

            {/* Lista de registros */}
            <AttendanceList
              registros={registrosAsistencia}
              loading={cargando}
              onVerDetalle={handleVerDetalle}
              onEditarRegistro={handleEditarRegistro}
              onExportarDatos={handleExportarDatos}
              onActualizar={handleActualizar}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estudiantes presentes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                  <span>Estudiantes Presentes</span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {estudiantesPresentes.length} estudiante{estudiantesPresentes.length !== 1 ? 's' : ''} en el colegio
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {estudiantesPresentes.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <FiUsers className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No hay estudiantes presentes</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {estudiantesPresentes.map((estudiante) => (
                      <div key={estudiante.id} className="p-3 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                            <img
                              src={estudiante.fotoUrl}
                              alt={estudiante.nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium hidden">
                              {estudiante.nombre.charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {estudiante.nombre}
                            </p>
                            <p className="text-xs text-gray-600">
                              {estudiante.grado}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Accesos rápidos */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FiSettings className="w-5 h-5 text-blue-600" />
                  <span>Accesos Rápidos</span>
                </h3>
              </div>
              
              <div className="p-4 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportarDatos}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                >
                  <FiDownload className="w-4 h-4" />
                  <span className="text-sm font-medium">Descargar reporte</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleActualizar}
                  className="w-full flex items-center space-x-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Actualizar datos</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => showInfo('Configuración', 'Panel de configuración próximamente disponible')}
                  className="w-full flex items-center space-x-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                >
                  <FiSettings className="w-4 h-4" />
                  <span className="text-sm font-medium">Configuración</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Información del usuario */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-talentos-primary/10 to-talentos-secondary/10 rounded-lg border border-talentos-primary/20 p-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <FiCalendar className="w-5 h-5 text-talentos-primary" />
                <span>Información del Operador</span>
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Usuario:</span>
                  <span className="font-medium text-gray-900">{usuario?.nombre || 'Personal de Entrada'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Turno:</span>
                  <span className="font-medium text-gray-900">Diurno</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ubicación:</span>
                  <span className="font-medium text-gray-900">Puerta Principal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium text-gray-900">
                    {new Date().toLocaleDateString('es-PE')}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard