// Simulación de sonidos de notificación usando Web Audio API
// En producción, estos serían archivos .mp3 reales

// Función IIFE para evitar problemas de módulos
(function() {
  const playNotificationSound = (type = 'default') => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Diferentes frecuencias para diferentes tipos de notificación
      const frequencies = {
        mensaje: [523.25, 659.25], // Do-Mi
        asistencia: [392, 523.25], // Sol-Do
        academico: [440, 554.37], // La-Do#
        comunicado: [493.88, 587.33], // Si-Re
        sistema: [329.63, 440], // Mi-La
        pago: [698.46, 783.99], // Fa-Sol
        default: [440, 523.25] // La-Do
      }
      
      const selectedFreqs = frequencies[type] || frequencies.default
      
      // Configurar el sonido
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(selectedFreqs[0], audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(selectedFreqs[1], audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
      
    } catch (error) {
      console.log('No se pudo reproducir el sonido:', error)
    }
  }
  
  // Hacer la función disponible globalmente
  window.playNotificationSound = playNotificationSound
})();