import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX,
  FiPlus,
  FiEdit,
  FiTrash,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiTarget,
  FiPercent
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import AnimatedButton from '../common/AnimatedButton'
import { showSuccess, showError, showConfirm, showInput } from '../../utils/sweetAlert'

const ActivityManagementModal = ({ isOpen, onClose, actividades, onCreateActivity, onUpdateActivity, onDeleteActivity }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newActivity, setNewActivity] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'tarea',
    prioridad: 'media',
    fechaLimite: format(new Date(), 'yyyy-MM-dd'),
    progreso: 0
  })

  const handleCreateActivity = async () => {
    if (!newActivity.titulo || !newActivity.descripcion) {
      showError('Error', 'Complete todos los campos requeridos')
      return
    }

    const activity = {
      ...newActivity,
      id: Date.now(),
      fechaCreacion: new Date().toISOString(),
      completado: false
    }

    onCreateActivity(activity)
    showSuccess('Actividad creada', 'La nueva actividad ha sido agregada')
    
    // Reset form
    setNewActivity({
      titulo: '',
      descripcion: '',
      tipo: 'tarea',
      prioridad: 'media',
      fechaLimite: format(new Date(), 'yyyy-MM-dd'),
      progreso: 0
    })
    setIsCreating(false)
  }

  const handleUpdateProgress = async (activity) => {
    const result = await showInput(
      'Actualizar Progreso',
      `Progreso actual: ${activity.progreso}%`,
      {
        input: 'range',
        inputAttributes: {
          min: 0,
          max: 100,
          step: 10
        },
        inputValue: activity.progreso,
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar'
      }
    )

    if (result.isConfirmed) {
      const progreso = parseInt(result.value)
      onUpdateActivity({
        ...activity,
        progreso,
        completado: progreso === 100
      })
      showSuccess('Progreso actualizado', `Progreso: ${progreso}%`)
    }
  }

  const handleDeleteActivity = async (activity) => {
    const result = await showConfirm(
      '¿Eliminar actividad?',
      `¿Estás seguro de eliminar "${activity.titulo}"?`,
      'warning'
    )

    if (result.isConfirmed) {
      onDeleteActivity(activity.id)
      showSuccess('Actividad eliminada', 'La actividad ha sido eliminada')
    }
  }

  const handleCompleteActivity = (activity) => {
    onUpdateActivity({
      ...activity,
      completado: true,
      progreso: 100,
      fechaCompletado: new Date().toISOString()
    })
    showSuccess('¡Completada!', `La actividad "${activity.titulo}" ha sido marcada como completada`)
  }

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'text-red-600 bg-red-50'
      case 'media': return 'text-yellow-600 bg-yellow-50'
      case 'baja': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'examen': return FiTarget
      case 'reunion': return FiCalendar
      case 'revision': return FiCheckCircle
      default: return FiClock
    }
  }

  // Filtrar y ordenar actividades
  const actividadesPendientes = actividades
    .filter(a => !a.completado)
    .sort((a, b) => {
      // Primero por prioridad
      const prioridadOrden = { alta: 0, media: 1, baja: 2 }
      const prioridadDiff = prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad]
      if (prioridadDiff !== 0) return prioridadDiff
      
      // Luego por fecha límite
      return new Date(a.fechaLimite) - new Date(b.fechaLimite)
    })

  const actividadesCompletadas = actividades
    .filter(a => a.completado)
    .sort((a, b) => new Date(b.fechaCompletado) - new Date(a.fechaCompletado))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Gestión de Actividades</h2>
                    <p className="text-blue-100 mt-1">
                      {actividadesPendientes.length} pendientes, {actividadesCompletadas.length} completadas
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Botón Nueva Actividad */}
                {!isCreating && (
                  <AnimatedButton
                    variant="primary"
                    icon={FiPlus}
                    onClick={() => setIsCreating(true)}
                    className="mb-6"
                  >
                    Nueva Actividad
                  </AnimatedButton>
                )}

                {/* Formulario Nueva Actividad */}
                {isCreating && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Nueva Actividad
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título *
                        </label>
                        <input
                          type="text"
                          value={newActivity.titulo}
                          onChange={(e) => setNewActivity({ ...newActivity, titulo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                          placeholder="Ej: Revisar exámenes de matemáticas"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción *
                        </label>
                        <textarea
                          value={newActivity.descripcion}
                          onChange={(e) => setNewActivity({ ...newActivity, descripcion: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                          rows={3}
                          placeholder="Describe la actividad..."
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo
                          </label>
                          <select
                            value={newActivity.tipo}
                            onChange={(e) => setNewActivity({ ...newActivity, tipo: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                          >
                            <option value="tarea">Tarea</option>
                            <option value="examen">Examen</option>
                            <option value="reunion">Reunión</option>
                            <option value="revision">Revisión</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prioridad
                          </label>
                          <select
                            value={newActivity.prioridad}
                            onChange={(e) => setNewActivity({ ...newActivity, prioridad: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                          >
                            <option value="alta">Alta</option>
                            <option value="media">Media</option>
                            <option value="baja">Baja</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha Límite
                          </label>
                          <input
                            type="date"
                            value={newActivity.fechaLimite}
                            onChange={(e) => setNewActivity({ ...newActivity, fechaLimite: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 mt-4">
                        <AnimatedButton
                          variant="outline"
                          onClick={() => setIsCreating(false)}
                          size="sm"
                        >
                          Cancelar
                        </AnimatedButton>
                        <AnimatedButton
                          variant="primary"
                          icon={FiCheckCircle}
                          onClick={handleCreateActivity}
                          size="sm"
                        >
                          Crear Actividad
                        </AnimatedButton>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Actividades Pendientes */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FiClock className="w-5 h-5" />
                    <span>Actividades Pendientes</span>
                  </h3>
                  
                  {actividadesPendientes.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FiCheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No hay actividades pendientes</p>
                      <p className="text-green-600 text-sm mt-1">¡Excelente trabajo!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {actividadesPendientes.map((actividad) => {
                        const Icon = getTypeIcon(actividad.tipo)
                        
                        return (
                          <motion.div
                            key={actividad.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Icon className="w-5 h-5 text-gray-400" />
                                  <h4 className="font-medium text-gray-900">{actividad.titulo}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(actividad.prioridad)}`}>
                                    {actividad.prioridad}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3">{actividad.descripcion}</p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center space-x-1">
                                      <FiCalendar className="w-4 h-4" />
                                      <span>{format(new Date(actividad.fechaLimite), 'dd MMM', { locale: es })}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <FiPercent className="w-4 h-4" />
                                      <span>{actividad.progreso}%</span>
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleUpdateProgress(actividad)}
                                      className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                    >
                                      <FiPercent className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleCompleteActivity(actividad)}
                                      className="text-green-600 hover:text-green-700 transition-colors duration-200"
                                    >
                                      <FiCheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteActivity(actividad)}
                                      className="text-red-600 hover:text-red-700 transition-colors duration-200"
                                    >
                                      <FiTrash className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Barra de progreso */}
                                {actividad.progreso > 0 && (
                                  <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${actividad.progreso}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Actividades Completadas */}
                {actividadesCompletadas.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <FiCheckCircle className="w-5 h-5 text-green-600" />
                      <span>Actividades Completadas</span>
                    </h3>
                    
                    <div className="space-y-2">
                      {actividadesCompletadas.slice(0, 5).map((actividad) => (
                        <div
                          key={actividad.id}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 line-through">{actividad.titulo}</p>
                            <p className="text-sm text-gray-600">
                              Completada el {format(new Date(actividad.fechaCompletado), 'dd/MM/yyyy', { locale: es })}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteActivity(actividad)}
                            className="text-red-600 hover:text-red-700 transition-colors duration-200"
                          >
                            <FiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ActivityManagementModal