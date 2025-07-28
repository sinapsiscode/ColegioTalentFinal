import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiBell, 
  FiSettings, 
  FiTrash2, 
  FiCheck,
  FiFilter,
  FiClock,
  FiMail,
  FiSmartphone,
  FiVolume2,
  FiVolumeX,
  FiCalendar,
  FiMessageSquare,
  FiDollarSign,
  FiAlertCircle,
  FiBookOpen,
  FiUsers,
  FiActivity
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import FilterDropdown from '../../components/common/FilterDropdown'
import DateRangeFilter from '../../components/common/DateRangeFilter'
import useNotificationsStoreDB from '../../stores/notificationsStoreDB'
import useAuthStore from '../../stores/authStore'
import { showSuccess, showConfirm } from '../../utils/sweetAlert'

const NotificationCenter = () => {
  const { usuario } = useAuthStore()
  const {
    notificaciones,
    notificacionesNoLeidas,
    preferencias,
    historial,
    TIPOS,
    PRIORIDADES,
    inicializar,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    actualizarPreferencias,
    obtenerEstadisticas,
    limpiarAntiguas,
    solicitarPermisosNavegador
  } = useNotificationsStoreDB()

  const [activeTab, setActiveTab] = useState('notificaciones')
  const [filtroTipo, setFiltroTipo] = useState('all')
  const [filtroPrioridad, setFiltroPrioridad] = useState('all')
  const [filtroEstado, setFiltroEstado] = useState('all')
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null })
  const [prefsLocales, setPrefsLocales] = useState(preferencias)

  // Iconos por tipo de notificación
  const iconosPorTipo = {
    [TIPOS.MENSAJE]: { icon: FiMessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
    [TIPOS.ASISTENCIA]: { icon: FiClock, color: 'text-green-600', bg: 'bg-green-100' },
    [TIPOS.COMUNICADO]: { icon: FiBell, color: 'text-blue-600', bg: 'bg-blue-100' },
    [TIPOS.ACADEMICO]: { icon: FiBookOpen, color: 'text-orange-600', bg: 'bg-orange-100' },
    [TIPOS.PAGO]: { icon: FiDollarSign, color: 'text-red-600', bg: 'bg-red-100' },
    [TIPOS.SISTEMA]: { icon: FiAlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
    [TIPOS.EVENTO]: { icon: FiCalendar, color: 'text-pink-600', bg: 'bg-pink-100' },
    [TIPOS.SALUD]: { icon: FiActivity, color: 'text-emerald-600', bg: 'bg-emerald-100' }
  }

  useEffect(() => {
    if (usuario?.id) {
      inicializar(usuario.id)
    }
  }, [usuario, inicializar])

  useEffect(() => {
    setPrefsLocales(preferencias)
  }, [preferencias])

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter(notif => {
    if (filtroTipo !== 'all' && notif.tipo !== filtroTipo) return false
    if (filtroPrioridad !== 'all' && notif.prioridad !== filtroPrioridad) return false
    if (filtroEstado === 'leidas' && !notif.leida) return false
    if (filtroEstado === 'no_leidas' && notif.leida) return false
    
    if (dateRange.startDate && dateRange.endDate) {
      const fecha = new Date(notif.fecha)
      const start = new Date(dateRange.startDate)
      const end = new Date(dateRange.endDate)
      if (fecha < start || fecha > end) return false
    }
    
    return true
  })

  // Handlers
  const handleMarcarLeida = async (id) => {
    await marcarComoLeida(id)
  }

  const handleEliminar = async (id) => {
    const result = await showConfirm(
      '¿Eliminar notificación?',
      'Esta acción no se puede deshacer',
      'Sí, eliminar',
      'Cancelar'
    )
    
    if (result.isConfirmed) {
      await eliminarNotificacion(id)
      showSuccess('Notificación eliminada', '')
    }
  }

  const handleMarcarTodasLeidas = async () => {
    await marcarTodasComoLeidas()
    showSuccess('Todas las notificaciones marcadas como leídas', '')
  }

  const handleLimpiarAntiguas = async () => {
    const result = await showConfirm(
      '¿Limpiar notificaciones antiguas?',
      'Se eliminarán las notificaciones de más de 30 días',
      'Sí, limpiar',
      'Cancelar'
    )
    
    if (result.isConfirmed) {
      const eliminadas = await limpiarAntiguas(30)
      showSuccess(`${eliminadas} notificaciones eliminadas`, '')
    }
  }

  const handleGuardarPreferencias = async () => {
    await actualizarPreferencias(usuario.id, prefsLocales)
    showSuccess('Preferencias guardadas', '')
  }

  const handleSolicitarPermisos = async () => {
    const granted = await solicitarPermisosNavegador()
    if (granted) {
      setPrefsLocales(prev => ({ ...prev, push: true }))
      showSuccess('Permisos concedidos', 'Recibirás notificaciones del navegador')
    }
  }

  const estadisticas = obtenerEstadisticas()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Centro de Notificaciones</h1>
            <p className="text-gray-600 mt-1">
              {notificacionesNoLeidas} notificaciones sin leer
            </p>
          </div>
          
          <div className="flex gap-2">
            {notificacionesNoLeidas > 0 && (
              <AnimatedButton
                variant="outline"
                icon={FiCheck}
                onClick={handleMarcarTodasLeidas}
                size="sm"
              >
                Marcar todas como leídas
              </AnimatedButton>
            )}
            <AnimatedButton
              variant="outline"
              icon={FiTrash2}
              onClick={handleLimpiarAntiguas}
              size="sm"
            >
              Limpiar antiguas
            </AnimatedButton>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('notificaciones')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'notificaciones'
                  ? 'border-talentos-primary text-talentos-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiBell className="inline-block mr-2" />
              Notificaciones
            </button>
            <button
              onClick={() => setActiveTab('preferencias')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'preferencias'
                  ? 'border-talentos-primary text-talentos-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiSettings className="inline-block mr-2" />
              Preferencias
            </button>
            <button
              onClick={() => setActiveTab('estadisticas')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'estadisticas'
                  ? 'border-talentos-primary text-talentos-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiActivity className="inline-block mr-2" />
              Estadísticas
            </button>
          </nav>
        </div>

        {/* Contenido de tabs */}
        {activeTab === 'notificaciones' && (
          <>
            {/* Filtros */}
            <AnimatedCard className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FilterDropdown
                  label="Tipo"
                  options={[
                    { value: 'all', label: 'Todos los tipos' },
                    { value: TIPOS.MENSAJE, label: 'Mensajes' },
                    { value: TIPOS.ASISTENCIA, label: 'Asistencia' },
                    { value: TIPOS.COMUNICADO, label: 'Comunicados' },
                    { value: TIPOS.ACADEMICO, label: 'Académico' },
                    { value: TIPOS.PAGO, label: 'Pagos' },
                    { value: TIPOS.SISTEMA, label: 'Sistema' },
                    { value: TIPOS.EVENTO, label: 'Eventos' },
                    { value: TIPOS.SALUD, label: 'Salud' }
                  ]}
                  selectedValue={filtroTipo}
                  onSelect={setFiltroTipo}
                />
                
                <FilterDropdown
                  label="Prioridad"
                  options={[
                    { value: 'all', label: 'Todas las prioridades' },
                    { value: PRIORIDADES.BAJA, label: 'Baja' },
                    { value: PRIORIDADES.MEDIA, label: 'Media' },
                    { value: PRIORIDADES.ALTA, label: 'Alta' },
                    { value: PRIORIDADES.URGENTE, label: 'Urgente' }
                  ]}
                  selectedValue={filtroPrioridad}
                  onSelect={setFiltroPrioridad}
                />
                
                <FilterDropdown
                  label="Estado"
                  options={[
                    { value: 'all', label: 'Todas' },
                    { value: 'no_leidas', label: 'No leídas' },
                    { value: 'leidas', label: 'Leídas' }
                  ]}
                  selectedValue={filtroEstado}
                  onSelect={setFiltroEstado}
                />
                
                <DateRangeFilter
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  onDateChange={setDateRange}
                />
              </div>
            </AnimatedCard>

            {/* Lista de notificaciones */}
            <div className="space-y-4">
              <AnimatePresence>
                {notificacionesFiltradas.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <FiBell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay notificaciones</p>
                  </motion.div>
                ) : (
                  notificacionesFiltradas.map((notificacion) => {
                    const { icon: Icon, color, bg } = iconosPorTipo[notificacion.tipo] || iconosPorTipo[TIPOS.SISTEMA]
                    
                    return (
                      <motion.div
                        key={notificacion.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        whileHover={{ scale: 1.01 }}
                        className={`bg-white rounded-lg shadow-sm border ${
                          notificacion.leida ? 'border-gray-200' : 'border-blue-300 shadow-blue-100'
                        } p-4 cursor-pointer transition-all`}
                        onClick={() => handleMarcarLeida(notificacion.id)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${bg}`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className={`font-medium ${
                                  notificacion.leida ? 'text-gray-700' : 'text-gray-900'
                                }`}>
                                  {notificacion.titulo}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notificacion.mensaje}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <span>{new Date(notificacion.fecha).toLocaleString('es-PE')}</span>
                                  <span className={`px-2 py-1 rounded-full ${
                                    notificacion.prioridad === PRIORIDADES.URGENTE ? 'bg-red-100 text-red-700' :
                                    notificacion.prioridad === PRIORIDADES.ALTA ? 'bg-orange-100 text-orange-700' :
                                    notificacion.prioridad === PRIORIDADES.MEDIA ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {notificacion.prioridad}
                                  </span>
                                </div>
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEliminar(notificacion.id)
                                }}
                                className="ml-4 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {notificacion.actionUrl && (
                              <motion.a
                                href={notificacion.actionUrl}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center text-sm text-talentos-primary hover:text-talentos-secondary mt-2"
                                whileHover={{ x: 5 }}
                              >
                                Ver más →
                              </motion.a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {activeTab === 'preferencias' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preferencias por tipo */}
            <AnimatedCard>
              <h2 className="text-lg font-semibold mb-4">Tipos de Notificaciones</h2>
              <div className="space-y-3">
                {Object.entries(TIPOS).map(([key, tipo]) => {
                  const { icon: Icon, color } = iconosPorTipo[tipo]
                  return (
                    <label key={tipo} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <span className="text-gray-700 capitalize">{tipo}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefsLocales[tipo] || false}
                        onChange={(e) => setPrefsLocales(prev => ({ 
                          ...prev, 
                          [tipo]: e.target.checked 
                        }))}
                        className="h-4 w-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                      />
                    </label>
                  )
                })}
              </div>
            </AnimatedCard>

            {/* Métodos de notificación */}
            <AnimatedCard>
              <h2 className="text-lg font-semibold mb-4">Métodos de Notificación</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FiBell className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="text-gray-700">Notificaciones en la app</span>
                      <p className="text-xs text-gray-500">Mostrar en el centro de notificaciones</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefsLocales.app || true}
                    onChange={(e) => setPrefsLocales(prev => ({ ...prev, app: e.target.checked }))}
                    className="h-4 w-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FiSmartphone className="w-5 h-5 text-green-600" />
                    <div>
                      <span className="text-gray-700">Notificaciones push</span>
                      <p className="text-xs text-gray-500">Recibir notificaciones del navegador</p>
                    </div>
                  </div>
                  {!prefsLocales.push ? (
                    <button
                      onClick={handleSolicitarPermisos}
                      className="text-sm text-talentos-primary hover:text-talentos-secondary"
                    >
                      Activar
                    </button>
                  ) : (
                    <input
                      type="checkbox"
                      checked={prefsLocales.push || false}
                      onChange={(e) => setPrefsLocales(prev => ({ ...prev, push: e.target.checked }))}
                      className="h-4 w-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                    />
                  )}
                </label>

                <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FiMail className="w-5 h-5 text-purple-600" />
                    <div>
                      <span className="text-gray-700">Notificaciones por email</span>
                      <p className="text-xs text-gray-500">Solo para notificaciones importantes</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefsLocales.email || false}
                    onChange={(e) => setPrefsLocales(prev => ({ ...prev, email: e.target.checked }))}
                    className="h-4 w-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    {prefsLocales.sonido ? (
                      <FiVolume2 className="w-5 h-5 text-orange-600" />
                    ) : (
                      <FiVolumeX className="w-5 h-5 text-gray-600" />
                    )}
                    <div>
                      <span className="text-gray-700">Sonidos</span>
                      <p className="text-xs text-gray-500">Reproducir sonido al recibir notificaciones</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefsLocales.sonido || false}
                    onChange={(e) => setPrefsLocales(prev => ({ ...prev, sonido: e.target.checked }))}
                    className="h-4 w-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                  />
                </label>
              </div>
            </AnimatedCard>

            {/* Horarios */}
            <AnimatedCard className="lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Horario de Notificaciones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horario permitido
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={prefsLocales.horarioInicio || '07:00'}
                      onChange={(e) => setPrefsLocales(prev => ({ 
                        ...prev, 
                        horarioInicio: e.target.value 
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-talentos-primary focus:border-talentos-primary"
                    />
                    <span className="text-gray-500">a</span>
                    <input
                      type="time"
                      value={prefsLocales.horarioFin || '21:00'}
                      onChange={(e) => setPrefsLocales(prev => ({ 
                        ...prev, 
                        horarioFin: e.target.value 
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-talentos-primary focus:border-talentos-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días activos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'].map(dia => (
                      <label key={dia} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={prefsLocales.diasSemana?.includes(dia) || false}
                          onChange={(e) => {
                            const diasActuales = prefsLocales.diasSemana || []
                            if (e.target.checked) {
                              setPrefsLocales(prev => ({ 
                                ...prev, 
                                diasSemana: [...diasActuales, dia] 
                              }))
                            } else {
                              setPrefsLocales(prev => ({ 
                                ...prev, 
                                diasSemana: diasActuales.filter(d => d !== dia) 
                              }))
                            }
                          }}
                          className="h-4 w-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{dia}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <AnimatedButton
                  variant="primary"
                  onClick={handleGuardarPreferencias}
                >
                  Guardar Preferencias
                </AnimatedButton>
              </div>
            </AnimatedCard>
          </div>
        )}

        {activeTab === 'estadisticas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Estadísticas generales */}
            <AnimatedCard className="lg:col-span-3">
              <h2 className="text-lg font-semibold mb-4">Resumen de Notificaciones</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{estadisticas.noLeidas}</p>
                  <p className="text-sm text-gray-600">No leídas</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{estadisticas.hoy}</p>
                  <p className="text-sm text-gray-600">Hoy</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{estadisticas.tasaLectura}%</p>
                  <p className="text-sm text-gray-600">Tasa lectura</p>
                </div>
              </div>
            </AnimatedCard>

            {/* Por tipo */}
            <AnimatedCard>
              <h3 className="text-md font-semibold mb-3">Por Tipo</h3>
              <div className="space-y-2">
                {Object.entries(estadisticas.porTipo).map(([tipo, cantidad]) => {
                  const { icon: Icon, color } = iconosPorTipo[tipo]
                  const porcentaje = estadisticas.total > 0 
                    ? Math.round((cantidad / estadisticas.total) * 100) 
                    : 0
                  
                  return (
                    <div key={tipo} className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-gray-700">{tipo}</span>
                          <span className="text-gray-500">{cantidad}</span>
                        </div>
                        <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${porcentaje}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={`h-full ${color.replace('text-', 'bg-')}`}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </AnimatedCard>

            {/* Por prioridad */}
            <AnimatedCard>
              <h3 className="text-md font-semibold mb-3">Por Prioridad</h3>
              <div className="space-y-3">
                {Object.entries(estadisticas.porPrioridad).map(([prioridad, cantidad]) => {
                  const colors = {
                    [PRIORIDADES.BAJA]: 'bg-gray-500',
                    [PRIORIDADES.MEDIA]: 'bg-blue-500',
                    [PRIORIDADES.ALTA]: 'bg-orange-500',
                    [PRIORIDADES.URGENTE]: 'bg-red-500'
                  }
                  
                  return (
                    <div key={prioridad} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">{prioridad}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{cantidad}</span>
                        <div className={`w-3 h-3 rounded-full ${colors[prioridad]}`} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </AnimatedCard>

            {/* Historial reciente */}
            <AnimatedCard>
              <h3 className="text-md font-semibold mb-3">Actividad Reciente</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {historial.slice(0, 10).map((evento) => (
                  <div key={evento.id} className="text-xs text-gray-600 py-1 border-b border-gray-100">
                    <p className="font-medium">{evento.accion}</p>
                    <p className="text-gray-500">
                      {new Date(evento.fecha).toLocaleString('es-PE')}
                    </p>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </div>
        )}
      </main>
    </div>
  )
}

export default NotificationCenter