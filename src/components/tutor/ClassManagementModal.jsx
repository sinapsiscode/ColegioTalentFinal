import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX,
  FiClock,
  FiUsers,
  FiBookOpen,
  FiCheckCircle,
  FiPlayCircle,
  FiPauseCircle,
  FiStopCircle,
  FiEdit,
  FiMessageSquare,
  FiAlertCircle
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import AnimatedButton from '../common/AnimatedButton'
import { showSuccess, showError, showInput } from '../../utils/sweetAlert'
import { safeFormat } from '../../utils/dateHelpers'

const ClassManagementModal = ({ clase, isOpen, onClose, onUpdateClass }) => {
  const [activeTab, setActiveTab] = useState('asistencia')
  const [classStatus, setClassStatus] = useState('pendiente')
  const [startTime, setStartTime] = useState(null)
  const [attendance, setAttendance] = useState({})
  const [classNotes, setClassNotes] = useState('')
  const [selectedStudents, setSelectedStudents] = useState([])

  useEffect(() => {
    if (clase) {
      setClassStatus(clase.estado || 'pendiente')
      setClassNotes(clase.observaciones || '')
      
      if (clase.estudiantes && Array.isArray(clase.estudiantes)) {
        const initialAttendance = {}
        clase.estudiantes.forEach(est => {
          if (est && est.id) {
            initialAttendance[est.id] = 'pendiente'
          }
        })
        setAttendance(initialAttendance)
      }
    }
  }, [clase])

  const handleStartClass = () => {
    setClassStatus('en_curso')
    setStartTime(new Date())
    showSuccess('Clase iniciada', `La clase de ${clase.materia} ha comenzado`)
  }

  const handlePauseClass = () => {
    setClassStatus('pausada')
    showSuccess('Clase pausada', 'La clase ha sido pausada temporalmente')
  }

  const handleEndClass = async () => {
    const notes = await showInput(
      'Finalizar Clase',
      'Agrega observaciones sobre la clase (opcional):',
      {
        inputType: 'textarea',
        showCancelButton: true,
        confirmButtonText: 'Finalizar',
        cancelButtonText: 'Cancelar'
      }
    )

    if (notes.isConfirmed) {
      setClassStatus('completada')
      setClassNotes(notes.value)
      
      // Actualizar la clase
      const updatedClass = {
        ...clase,
        estado: 'completada',
        horaFin: new Date().toISOString(),
        asistencia: attendance,
        observaciones: notes.value,
        duracion: startTime ? Math.round((new Date() - startTime) / 60000) : 0
      }
      
      onUpdateClass(updatedClass)
      showSuccess('Clase finalizada', 'La clase ha sido completada exitosamente')
      setTimeout(onClose, 2000)
    }
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSendMessage = async () => {
    if (selectedStudents.length === 0) {
      showError('Error', 'Selecciona al menos un estudiante')
      return
    }

    const message = await showInput(
      'Enviar mensaje',
      'Escribe tu mensaje para los padres:',
      {
        inputType: 'textarea',
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar'
      }
    )

    if (message.isConfirmed && message.value) {
      showSuccess(
        'Mensaje enviado', 
        `Se ha enviado el mensaje a los padres de ${selectedStudents.length} estudiante(s)`
      )
      setSelectedStudents([])
    }
  }

  const getAttendanceStats = () => {
    const total = Object.keys(attendance).length
    const presentes = Object.values(attendance).filter(a => a === 'presente').length
    const tardes = Object.values(attendance).filter(a => a === 'tarde').length
    const faltas = Object.values(attendance).filter(a => a === 'falta').length
    
    return { total, presentes, tardes, faltas }
  }

  const stats = getAttendanceStats()

  if (!clase) return null

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
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{clase.materia || 'Sin materia'}</h2>
                    <p className="text-blue-100 mt-1">
                      {clase.grado || 'Sin grado'} - {clase.hora || 'Sin hora'} | {safeFormat(new Date(), 'dd MMMM yyyy')}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Estado y controles */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${classStatus === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${classStatus === 'en_curso' ? 'bg-green-100 text-green-800' : ''}
                      ${classStatus === 'pausada' ? 'bg-orange-100 text-orange-800' : ''}
                      ${classStatus === 'completada' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {classStatus === 'pendiente' && 'Pendiente'}
                      {classStatus === 'en_curso' && 'En curso'}
                      {classStatus === 'pausada' && 'Pausada'}
                      {classStatus === 'completada' && 'Completada'}
                    </span>
                    {startTime && (
                      <span className="text-sm text-blue-100">
                        Iniciada: {format(startTime, 'HH:mm')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {classStatus === 'pendiente' && (
                      <AnimatedButton
                        variant="secondary"
                        icon={FiPlayCircle}
                        onClick={handleStartClass}
                        size="sm"
                      >
                        Iniciar
                      </AnimatedButton>
                    )}
                    {classStatus === 'en_curso' && (
                      <>
                        <AnimatedButton
                          variant="outline"
                          icon={FiPauseCircle}
                          onClick={handlePauseClass}
                          size="sm"
                          className="!text-white !border-white hover:!bg-white/20"
                        >
                          Pausar
                        </AnimatedButton>
                        <AnimatedButton
                          variant="danger"
                          icon={FiStopCircle}
                          onClick={handleEndClass}
                          size="sm"
                        >
                          Finalizar
                        </AnimatedButton>
                      </>
                    )}
                    {classStatus === 'pausada' && (
                      <AnimatedButton
                        variant="secondary"
                        icon={FiPlayCircle}
                        onClick={() => setClassStatus('en_curso')}
                        size="sm"
                      >
                        Reanudar
                      </AnimatedButton>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('asistencia')}
                    className={`
                      px-6 py-3 text-sm font-medium transition-colors duration-200
                      ${activeTab === 'asistencia' 
                        ? 'text-talentos-primary border-b-2 border-talentos-primary' 
                        : 'text-gray-600 hover:text-gray-900'}
                    `}
                  >
                    Asistencia
                  </button>
                  <button
                    onClick={() => setActiveTab('detalles')}
                    className={`
                      px-6 py-3 text-sm font-medium transition-colors duration-200
                      ${activeTab === 'detalles' 
                        ? 'text-talentos-primary border-b-2 border-talentos-primary' 
                        : 'text-gray-600 hover:text-gray-900'}
                    `}
                  >
                    Detalles
                  </button>
                  <button
                    onClick={() => setActiveTab('comunicacion')}
                    className={`
                      px-6 py-3 text-sm font-medium transition-colors duration-200
                      ${activeTab === 'comunicacion' 
                        ? 'text-talentos-primary border-b-2 border-talentos-primary' 
                        : 'text-gray-600 hover:text-gray-900'}
                    `}
                  >
                    Comunicación
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                {/* Tab: Asistencia */}
                {activeTab === 'asistencia' && (
                  <div>
                    {/* Estadísticas de asistencia */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-green-600">Presentes</p>
                        <p className="text-2xl font-bold text-green-700">{stats.presentes}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-yellow-600">Tardes</p>
                        <p className="text-2xl font-bold text-yellow-700">{stats.tardes}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-red-600">Faltas</p>
                        <p className="text-2xl font-bold text-red-700">{stats.faltas}</p>
                      </div>
                    </div>

                    {/* Lista de estudiantes */}
                    <div className="space-y-2">
                      {clase.estudiantes?.map(estudiante => (
                        <div
                          key={estudiante.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={estudiante.foto || `https://ui-avatars.com/api/?name=${estudiante.nombre}`}
                              alt={estudiante.nombre}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {estudiante.nombre} {estudiante.apellidos}
                              </p>
                              <p className="text-sm text-gray-600">{estudiante.codigo}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAttendanceChange(estudiante.id, 'presente')}
                              className={`
                                px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200
                                ${attendance[estudiante.id] === 'presente'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-600 hover:bg-green-100'}
                              `}
                            >
                              <FiCheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(estudiante.id, 'tarde')}
                              className={`
                                px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200
                                ${attendance[estudiante.id] === 'tarde'
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-gray-200 text-gray-600 hover:bg-yellow-100'}
                              `}
                            >
                              <FiClock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(estudiante.id, 'falta')}
                              className={`
                                px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200
                                ${attendance[estudiante.id] === 'falta'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 text-gray-600 hover:bg-red-100'}
                              `}
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Detalles */}
                {activeTab === 'detalles' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Información de la Clase
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Materia</p>
                          <p className="font-medium text-gray-900">{clase.materia}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Grado y Sección</p>
                          <p className="font-medium text-gray-900">{clase.grado}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Horario</p>
                          <p className="font-medium text-gray-900">{clase.hora}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Aula</p>
                          <p className="font-medium text-gray-900">{clase.aula || 'Por asignar'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Estudiantes</p>
                          <p className="font-medium text-gray-900">{clase.estudiantes?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duración</p>
                          <p className="font-medium text-gray-900">
                            {startTime && classStatus === 'completada' 
                              ? `${Math.round((new Date() - startTime) / 60000)} minutos`
                              : 'No iniciada'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Temas de la Clase
                      </h3>
                      <textarea
                        placeholder="Describe los temas tratados en la clase..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-talentos-primary"
                        rows={4}
                        disabled={classStatus !== 'en_curso' && classStatus !== 'completada'}
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Tareas Asignadas
                      </h3>
                      <button className="flex items-center space-x-2 text-talentos-primary hover:text-talentos-secondary transition-colors duration-200">
                        <FiEdit className="w-4 h-4" />
                        <span>Agregar tarea</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab: Comunicación */}
                {activeTab === 'comunicacion' && (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">
                            Comunicación con Padres
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Selecciona los estudiantes cuyos padres deseas contactar y envía un mensaje
                            sobre el desarrollo de la clase o cualquier observación importante.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {clase.estudiantes?.map(estudiante => (
                        <label
                          key={estudiante.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(estudiante.id)}
                              onChange={() => handleSelectStudent(estudiante.id)}
                              className="w-4 h-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                            />
                            <img
                              src={estudiante.foto || `https://ui-avatars.com/api/?name=${estudiante.nombre}`}
                              alt={estudiante.nombre}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {estudiante.nombre} {estudiante.apellidos}
                              </p>
                              <p className="text-sm text-gray-600">
                                Asistencia: {
                                  attendance[estudiante.id] === 'presente' ? 'Presente' :
                                  attendance[estudiante.id] === 'tarde' ? 'Tarde' :
                                  attendance[estudiante.id] === 'falta' ? 'Falta' :
                                  'Sin marcar'
                                }
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {selectedStudents.length} estudiante(s) seleccionado(s)
                      </p>
                      <AnimatedButton
                        variant="primary"
                        icon={FiMessageSquare}
                        onClick={handleSendMessage}
                        disabled={selectedStudents.length === 0}
                      >
                        Enviar Mensaje
                      </AnimatedButton>
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

export default ClassManagementModal