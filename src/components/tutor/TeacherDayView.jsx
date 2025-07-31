import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiClock,
  FiUsers,
  FiBookOpen,
  FiCheckCircle,
  FiAlertTriangle,
  FiMic,
  FiCamera,
  FiRadio,
  FiCloud,
  FiBell,
  FiChevronRight,
  FiPause,
  FiPlay
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const TeacherDayView = ({ clasesHoy, estudiantesPresentes, onStartClass, onEndClass }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentClass, setCurrentClass] = useState(null)
  const [nextClass, setNextClass] = useState(null)
  const [classTimer, setClassTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showNotification, setShowNotification] = useState(false)

  // Actualizar reloj cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      checkCurrentClass()
    }, 1000)
    
    return () => clearInterval(interval)
  }, [clasesHoy])

  // Detectar modo offline
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Timer de clase
  useEffect(() => {
    let interval
    if (isTimerRunning) {
      interval = setInterval(() => {
        setClassTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const checkCurrentClass = () => {
    const now = new Date()
    const currentHour = format(now, 'HH:mm')
    
    const current = clasesHoy.find(clase => {
      const [start, end] = clase.hora.split(' - ')
      return currentHour >= start && currentHour <= end
    })
    
    const next = clasesHoy.find(clase => {
      const [start] = clase.hora.split(' - ')
      return currentHour < start
    })
    
    // Notificar 5 minutos antes de la siguiente clase
    if (next && !showNotification) {
      const [nextStart] = next.hora.split(' - ')
      const [nextHour, nextMin] = nextStart.split(':').map(Number)
      const nextTime = new Date()
      nextTime.setHours(nextHour, nextMin, 0)
      
      const timeDiff = (nextTime - now) / 1000 / 60 // minutos
      
      if (timeDiff <= 5 && timeDiff > 4) {
        setShowNotification(true)
        // Vibrar si está disponible
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200])
        }
        
        // Notificación del navegador
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Próxima clase en 5 minutos', {
            body: `${next.materia} - ${next.grado} en ${next.aula}`,
            icon: '/logo-talentos.jpeg'
          })
        }
      }
    }
    
    setCurrentClass(current)
    setNextClass(next)
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getClassProgress = (clase) => {
    if (!clase) return 0
    
    const now = new Date()
    const [start, end] = clase.hora.split(' - ')
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)
    
    const startTime = new Date()
    startTime.setHours(startHour, startMin, 0)
    
    const endTime = new Date()
    endTime.setHours(endHour, endMin, 0)
    
    const totalDuration = endTime - startTime
    const elapsed = now - startTime
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header con reloj y estado */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Mi Día de Hoy</h2>
            <p className="text-blue-100">{format(currentTime, 'EEEE, d MMMM yyyy', { locale: es })}</p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-mono font-bold">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {isOffline ? (
                <>
                  <FiCloud className="w-4 h-4" />
                  <span>Modo Offline</span>
                </>
              ) : (
                <>
                  <FiRadio className="w-4 h-4" />
                  <span>En línea</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clase actual */}
      {currentClass ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border-b border-gray-200 bg-green-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              Clase en Curso
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {isTimerRunning ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
              </button>
              
              <div className="px-3 py-1 bg-white rounded-lg shadow-sm font-mono font-medium">
                {formatTimer(classTimer)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{currentClass.materia}</h4>
                <p className="text-lg text-gray-600">{currentClass.grado} - Aula {currentClass.aula}</p>
                <p className="text-sm text-gray-500 mt-1">Tema: {currentClass.tema}</p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Asistencia</div>
                <div className="text-2xl font-bold text-green-600">
                  {currentClass.asistentes}/{currentClass.totalEstudiantes}
                </div>
              </div>
            </div>
            
            {/* Barra de progreso de la clase */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{currentClass.hora.split(' - ')[0]}</span>
                <span>{Math.round(getClassProgress(currentClass))}%</span>
                <span>{currentClass.hora.split(' - ')[1]}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getClassProgress(currentClass)}%` }}
                  className="bg-green-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button className="flex items-center justify-center gap-2 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <FiUsers className="w-4 h-4" />
                <span className="text-sm">Asistencia</span>
              </button>
              
              <button className="flex items-center justify-center gap-2 p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                <FiMic className="w-4 h-4" />
                <span className="text-sm">Nota Voz</span>
              </button>
              
              <button className="flex items-center justify-center gap-2 p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
                <FiCamera className="w-4 h-4" />
                <span className="text-sm">Foto Tarea</span>
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="p-6 bg-gray-50 text-center">
          <FiClock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No hay clase en este momento</p>
        </div>
      )}

      {/* Próxima clase */}
      {nextClass && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiBell className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Próxima clase: {nextClass.materia}</p>
                <p className="text-xs text-gray-600">{nextClass.grado} - {nextClass.hora} en {nextClass.aula}</p>
              </div>
            </div>
            
            <FiChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}

      {/* Resumen del día */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{clasesHoy.length}</div>
            <div className="text-xs text-gray-500">Clases hoy</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-600">
              {clasesHoy.filter(c => c.estado === 'completada').length}
            </div>
            <div className="text-xs text-gray-500">Completadas</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {clasesHoy.filter(c => c.estado === 'pendiente').length}
            </div>
            <div className="text-xs text-gray-500">Pendientes</div>
          </div>
        </div>
      </div>
      
      {/* Notificación flotante */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center gap-3">
              <FiBell className="w-6 h-6" />
              <div>
                <p className="font-semibold">Próxima clase en 5 minutos</p>
                <p className="text-sm">{nextClass?.materia} - {nextClass?.grado}</p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="ml-4 text-yellow-200 hover:text-white"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TeacherDayView