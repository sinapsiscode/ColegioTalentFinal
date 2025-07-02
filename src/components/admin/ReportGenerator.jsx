import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiFileText,
  FiCalendar,
  FiSettings,
  FiDownload,
  FiPlay,
  FiX,
  FiCheck
} from 'react-icons/fi'
import AnimatedButton from '../common/AnimatedButton'

const ReportGenerator = ({ isOpen, onClose, onGenerate, configuraciones }) => {
  const [selectedType, setSelectedType] = useState('academico')
  const [selectedFormat, setSelectedFormat] = useState('PDF')
  const [selectedTemplate, setSelectedTemplate] = useState('detallado')
  const [selectedPeriod, setSelectedPeriod] = useState('mes')
  const [customName, setCustomName] = useState('')
  const [includeGraphics, setIncludeGraphics] = useState(true)
  const [includeComparisons, setIncludeComparisons] = useState(false)
  const [recipients, setRecipients] = useState(['direccion'])
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const reportTypes = [
    { id: 'academico', name: 'Rendimiento Académico', icon: '📚', description: 'Calificaciones y progreso estudiantil' },
    { id: 'asistencia', name: 'Asistencia', icon: '📋', description: 'Control de asistencia por grados' },
    { id: 'comunicaciones', name: 'Comunicaciones', icon: '💬', description: 'Efectividad de comunicados' },
    { id: 'satisfaccion', name: 'Satisfacción', icon: '⭐', description: 'Evaluaciones de padres y estudiantes' },
    { id: 'docente', name: 'Desempeño Docente', icon: '👥', description: 'Evaluación del personal docente' },
    { id: 'finanzas', name: 'Finanzas', icon: '💰', description: 'Estado financiero institucional' }
  ]

  const periods = [
    { id: 'semana', name: 'Última Semana' },
    { id: 'mes', name: 'Último Mes' },
    { id: 'trimestre', name: 'Último Trimestre' },
    { id: 'año', name: 'Año Actual' },
    { id: 'custom', name: 'Período Personalizado' }
  ]

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    const config = {
      tipo: selectedType,
      formato: selectedFormat,
      plantilla: selectedTemplate,
      periodo: selectedPeriod,
      nombre: customName || `Reporte ${reportTypes.find(t => t.id === selectedType)?.name}`,
      includeGraficos: includeGraphics,
      includeComparaciones: includeComparisons,
      destinatarios: recipients
    }

    try {
      await onGenerate(selectedType, config)
      onClose()
    } catch (error) {
      console.error('Error generando reporte:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleRecipient = (recipientId) => {
    setRecipients(prev => 
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generar Nuevo Reporte</h2>
            <p className="text-gray-600 mt-1">Configura los parámetros para tu reporte personalizado</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FiX className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tipo de Reporte */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <FiFileText className="w-5 h-5 text-blue-600" />
              <span>Tipo de Reporte</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reportTypes.map((type) => (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedType === type.id
                      ? 'border-talentos-primary bg-talentos-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{type.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      <p className="text-xs text-gray-600">{type.description}</p>
                    </div>
                    {selectedType === type.id && (
                      <FiCheck className="w-5 h-5 text-talentos-primary" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Configuración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formato y Plantilla */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <FiSettings className="w-5 h-5 text-purple-600" />
                <span>Configuración</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  >
                    {configuraciones?.formatosDisponibles?.map((formato) => (
                      <option key={formato} value={formato}>{formato}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plantilla</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  >
                    {Object.entries(configuraciones?.plantillas || {}).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  >
                    {periods.map((period) => (
                      <option key={period.id} value={period.id}>{period.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Opciones Adicionales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <FiCalendar className="w-5 h-5 text-green-600" />
                <span>Opciones</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Reporte</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={`Reporte ${reportTypes.find(t => t.id === selectedType)?.name}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="graphics"
                      checked={includeGraphics}
                      onChange={(e) => setIncludeGraphics(e.target.checked)}
                      className="w-4 h-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                    />
                    <label htmlFor="graphics" className="text-sm text-gray-700">
                      Incluir gráficos y visualizaciones
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="comparisons"
                      checked={includeComparisons}
                      onChange={(e) => setIncludeComparisons(e.target.checked)}
                      className="w-4 h-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                    />
                    <label htmlFor="comparisons" className="text-sm text-gray-700">
                      Incluir comparaciones históricas
                    </label>
                  </div>
                </div>

                {/* Destinatarios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destinatarios</label>
                  <div className="space-y-2">
                    {Object.entries(configuraciones?.destinatarios || {}).map(([key, name]) => (
                      <div key={key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={key}
                          checked={recipients.includes(key)}
                          onChange={() => toggleRecipient(key)}
                          className="w-4 h-4 text-talentos-primary focus:ring-talentos-primary border-gray-300 rounded"
                        />
                        <label htmlFor={key} className="text-sm text-gray-700">{name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <AnimatedButton
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancelar
          </AnimatedButton>
          
          <AnimatedButton
            variant="primary"
            icon={isGenerating ? FiDownload : FiPlay}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generando...' : 'Generar Reporte'}
          </AnimatedButton>
        </div>
      </motion.div>
    </div>
  )
}

export default ReportGenerator