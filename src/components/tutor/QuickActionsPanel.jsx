import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiMic,
  FiCamera,
  FiClipboard,
  FiZap,
  FiCheckSquare,
  FiMessageCircle,
  FiSend,
  FiX,
  FiStopCircle
} from 'react-icons/fi'
import { showSuccess, showError } from '../../utils/sweetAlert'

const QuickActionsPanel = ({ estudiantes, onActionComplete }) => {
  const [activeAction, setActiveAction] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [quickNote, setQuickNote] = useState('')

  // Acciones rápidas disponibles
  const quickActions = [
    {
      id: 'voice-note',
      icon: FiMic,
      label: 'Nota de voz',
      color: 'bg-red-500',
      description: 'Grabar observación rápida'
    },
    {
      id: 'photo-homework',
      icon: FiCamera,
      label: 'Foto tarea',
      color: 'bg-blue-500',
      description: 'Capturar trabajo del estudiante'
    },
    {
      id: 'quick-grade',
      icon: FiClipboard,
      label: 'Nota rápida',
      color: 'bg-green-500',
      description: 'Asignar calificación veloz'
    },
    {
      id: 'bulk-action',
      icon: FiZap,
      label: 'Acción masiva',
      color: 'bg-yellow-500',
      description: 'Aplicar a varios estudiantes'
    },
    {
      id: 'quick-message',
      icon: FiMessageCircle,
      label: 'Mensaje rápido',
      color: 'bg-purple-500',
      description: 'Enviar a padres'
    }
  ]

  // Manejar grabación de voz
  const handleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true)
      setRecordingTime(0)
      
      // Simular grabación
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Solicitar permisos de micrófono
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            // Aquí iría la lógica real de grabación
            console.log('Grabando audio...')
          })
          .catch(err => {
            showError('Error', 'No se pudo acceder al micrófono')
            setIsRecording(false)
            clearInterval(interval)
          })
      }
      
      // Detener después de 60 segundos
      setTimeout(() => {
        if (isRecording) {
          handleStopRecording()
        }
      }, 60000)
    } else {
      handleStopRecording()
    }
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    showSuccess('Grabación guardada', `Nota de voz de ${recordingTime} segundos guardada`)
    setActiveAction(null)
    onActionComplete && onActionComplete({
      type: 'voice-note',
      duration: recordingTime,
      students: selectedStudents
    })
  }

  // Manejar captura de foto
  const handlePhotoCapture = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        // Aquí iría la lógica para procesar la imagen
        showSuccess('Foto capturada', 'La imagen se ha guardado correctamente')
        setActiveAction(null)
        onActionComplete && onActionComplete({
          type: 'photo',
          file: file.name,
          students: selectedStudents
        })
      }
    }
    
    input.click()
  }

  // Manejar calificación rápida
  const handleQuickGrade = (grade) => {
    if (selectedStudents.length === 0) {
      showError('Error', 'Selecciona al menos un estudiante')
      return
    }
    
    showSuccess(
      'Calificación asignada',
      `Nota ${grade} asignada a ${selectedStudents.length} estudiante(s)`
    )
    
    setActiveAction(null)
    setSelectedStudents([])
    
    onActionComplete && onActionComplete({
      type: 'grade',
      grade,
      students: selectedStudents
    })
  }

  // Manejar mensaje rápido
  const handleQuickMessage = () => {
    if (!quickNote.trim()) {
      showError('Error', 'Escribe un mensaje')
      return
    }
    
    if (selectedStudents.length === 0) {
      showError('Error', 'Selecciona al menos un estudiante')
      return
    }
    
    showSuccess(
      'Mensaje enviado',
      `Mensaje enviado a los padres de ${selectedStudents.length} estudiante(s)`
    )
    
    setActiveAction(null)
    setQuickNote('')
    setSelectedStudents([])
    
    onActionComplete && onActionComplete({
      type: 'message',
      message: quickNote,
      students: selectedStudents
    })
  }

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
      
      {/* Grid de acciones */}
      {!activeAction && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAction(action.id)}
              className="relative group"
            >
              <div className={`${action.color} text-white rounded-lg p-4 transition-all duration-200 group-hover:shadow-lg`}>
                <action.icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs font-medium">{action.label}</p>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {action.description}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Panel de acción activa */}
      {activeAction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header de acción */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {quickActions.find(a => a.id === activeAction)?.label}
            </h4>
            <button
              onClick={() => {
                setActiveAction(null)
                setSelectedStudents([])
                setQuickNote('')
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Selección de estudiantes (excepto para voz) */}
          {activeAction !== 'voice-note' && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Seleccionar estudiantes:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {estudiantes.map((estudiante) => (
                  <label
                    key={estudiante.id}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(estudiante.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, estudiante.id])
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== estudiante.id))
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm truncate">{estudiante.nombre}</span>
                  </label>
                ))}
              </div>
              
              {/* Seleccionar todos */}
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => setSelectedStudents(estudiantes.map(e => e.id))}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Seleccionar todos
                </button>
                <span className="text-xs text-gray-500">
                  {selectedStudents.length} seleccionados
                </span>
              </div>
            </div>
          )}

          {/* Contenido específico por acción */}
          {activeAction === 'voice-note' && (
            <div className="text-center py-8">
              {isRecording ? (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <FiMic className="w-10 h-10 text-red-600" />
                  </div>
                  <p className="text-2xl font-mono font-bold text-gray-900 mb-2">
                    {formatRecordingTime(recordingTime)}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">Grabando...</p>
                  <button
                    onClick={handleStopRecording}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FiStopCircle className="w-5 h-5 inline mr-2" />
                    Detener
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleVoiceRecording}
                    className="w-20 h-20 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors mx-auto mb-4"
                  >
                    <FiMic className="w-10 h-10 mx-auto" />
                  </button>
                  <p className="text-sm text-gray-600">Toca para grabar</p>
                </>
              )}
            </div>
          )}

          {activeAction === 'photo-homework' && (
            <div className="text-center py-8">
              <button
                onClick={handlePhotoCapture}
                className="w-20 h-20 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors mx-auto mb-4"
              >
                <FiCamera className="w-10 h-10 mx-auto" />
              </button>
              <p className="text-sm text-gray-600">Toca para tomar foto</p>
            </div>
          )}

          {activeAction === 'quick-grade' && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Selecciona la calificación:</p>
              <div className="grid grid-cols-5 gap-2">
                {[20, 18, 16, 14, 12, 10, 8, 6, 4, 2].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => handleQuickGrade(grade)}
                    className={`p-3 rounded-lg font-semibold transition-colors ${
                      grade >= 14
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : grade >= 11
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeAction === 'quick-message' && (
            <div>
              <textarea
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
              
              {/* Plantillas rápidas */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  'Excelente participación hoy',
                  'Necesita refuerzo en',
                  'No trajo tarea',
                  'Felicitaciones por'
                ].map((template) => (
                  <button
                    key={template}
                    onClick={() => setQuickNote(template)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200"
                  >
                    {template}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleQuickMessage}
                className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FiSend className="w-4 h-4 mr-2" />
                Enviar mensaje
              </button>
            </div>
          )}

          {activeAction === 'bulk-action' && (
            <div className="space-y-3">
              <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left">
                <FiCheckSquare className="w-5 h-5 inline mr-2 text-green-600" />
                Marcar asistencia completa
              </button>
              <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left">
                <FiClipboard className="w-5 h-5 inline mr-2 text-blue-600" />
                Asignar misma nota
              </button>
              <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left">
                <FiMessageCircle className="w-5 h-5 inline mr-2 text-purple-600" />
                Enviar mensaje grupal
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default QuickActionsPanel