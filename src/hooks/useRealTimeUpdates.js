import { useState, useEffect } from 'react'
import useNotificationsStore from '../stores/notificationsStore'
import useMessagesStore from '../stores/messagesStore'
import useAttendanceStore from '../stores/attendanceStore'
import useAuthStore from '../stores/authStore'

const useRealTimeUpdates = (updateInterval = 30000) => { // 30 seconds default
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isUpdating, setIsUpdating] = useState(false)
  
  const { usuario, rol } = useAuthStore()
  const { actualizarMensajesNoLeidos } = useMessagesStore()
  const { cargarRegistrosAsistencia } = useAttendanceStore()
  const { agregarNotificacion } = useNotificationsStore()

  // Simular actualización de datos en tiempo real
  const updateData = async () => {
    if (isUpdating) return
    
    setIsUpdating(true)
    
    try {
      // Actualizar mensajes no leídos
      actualizarMensajesNoLeidos()
      
      // Actualizar asistencia si es necesario
      if (rol === 'admin' || rol === 'tutor') {
        cargarRegistrosAsistencia()
      }
      
      // Simular eventos aleatorios (solo en desarrollo)
      if (Math.random() > 0.7) {
        const eventos = [
          {
            tipo: 'mensaje',
            titulo: '💬 Nuevo mensaje',
            mensaje: 'Tienes un nuevo mensaje sin leer',
            priority: 'media'
          },
          {
            tipo: 'asistencia',
            titulo: '✅ Asistencia registrada',
            mensaje: 'Un estudiante acaba de llegar',
            priority: 'baja'
          },
          {
            tipo: 'comunicado',
            titulo: '📢 Nuevo comunicado',
            mensaje: 'Se ha publicado un nuevo comunicado',
            priority: 'alta'
          }
        ]
        
        const eventoAleatorio = eventos[Math.floor(Math.random() * eventos.length)]
        
        // Solo agregar notificación si el usuario está activo
        if (document.visibilityState === 'visible') {
          agregarNotificacion(eventoAleatorio)
        }
      }
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error actualizando datos en tiempo real:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Configurar intervalo de actualización
  useEffect(() => {
    // Actualizar inmediatamente al montar
    updateData()
    
    // Configurar intervalo
    const interval = setInterval(updateData, updateInterval)
    
    // Actualizar cuando la pestaña vuelve a ser visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Cleanup
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [updateInterval])

  // Forzar actualización manual
  const forceUpdate = () => {
    updateData()
  }

  return {
    lastUpdate,
    isUpdating,
    forceUpdate
  }
}

export default useRealTimeUpdates