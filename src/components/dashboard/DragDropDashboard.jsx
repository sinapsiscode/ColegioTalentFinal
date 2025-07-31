import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import {
  FiEdit3,
  FiSave,
  FiRotateCcw,
  FiGrid,
  FiMaximize2,
  FiMinimize2,
  FiMove,
  FiPlus,
  FiTrash2,
  FiSettings,
  FiEye,
  FiEyeOff,
  FiLayers
} from 'react-icons/fi'
import AnimatedButton from '../common/AnimatedButton'

// Hook personalizado para drag & drop
const useDragAndDrop = (initialLayout, onLayoutChange) => {
  const [layout, setLayout] = useState(initialLayout)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)

  const moveWidget = (draggedId, targetId) => {
    const newLayout = [...layout]
    const draggedIndex = newLayout.findIndex(item => item.id === draggedId)
    const targetIndex = newLayout.findIndex(item => item.id === targetId)
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedWidget] = newLayout.splice(draggedIndex, 1)
      newLayout.splice(targetIndex, 0, draggedWidget)
      setLayout(newLayout)
      onLayoutChange?.(newLayout)
    }
  }

  const updateWidget = (widgetId, updates) => {
    const newLayout = layout.map(widget =>
      widget.id === widgetId ? { ...widget, ...updates } : widget
    )
    setLayout(newLayout)
    onLayoutChange?.(newLayout)
  }

  const addWidget = (newWidget) => {
    const widget = {
      ...newWidget,
      id: `widget-${Date.now()}`,
      position: { x: 0, y: 0 },
      size: newWidget.size || { width: 2, height: 2 }
    }
    setLayout([...layout, widget])
    onLayoutChange?.([...layout, widget])
  }

  const removeWidget = (widgetId) => {
    const newLayout = layout.filter(widget => widget.id !== widgetId)
    setLayout(newLayout)
    onLayoutChange?.(newLayout)
  }

  return {
    layout,
    setLayout,
    isDragging,
    setIsDragging,
    draggedItem,
    setDraggedItem,
    moveWidget,
    updateWidget,
    addWidget,
    removeWidget
  }
}

const DragDropDashboard = ({ 
  children, 
  initialLayout = [], 
  onLayoutChange,
  className = "",
  gridSize = { cols: 12, rows: 8 },
  cellSize = { width: 100, height: 100 },
  gap = 16
}) => {
  const [editMode, setEditMode] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState(null)
  const containerRef = useRef(null)

  const {
    layout,
    setLayout,
    isDragging,
    setIsDragging,
    draggedItem,
    setDraggedItem,
    moveWidget,
    updateWidget,
    addWidget,
    removeWidget
  } = useDragAndDrop(initialLayout, onLayoutChange)

  // Calcular el tamaño del contenedor
  const containerSize = useMemo(() => {
    return {
      width: gridSize.cols * cellSize.width + (gridSize.cols - 1) * gap,
      height: gridSize.rows * cellSize.height + (gridSize.rows - 1) * gap
    }
  }, [gridSize, cellSize, gap])

  // Generar grid visual
  const renderGrid = () => {
    if (!showGrid || !editMode) return null

    const gridLines = []
    
    // Líneas verticales
    for (let i = 0; i <= gridSize.cols; i++) {
      const x = i * (cellSize.width + gap)
      gridLines.push(
        <motion.line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={containerSize.height}
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
        />
      )
    }

    // Líneas horizontales
    for (let i = 0; i <= gridSize.rows; i++) {
      const y = i * (cellSize.height + gap)
      gridLines.push(
        <motion.line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={containerSize.width}
          y2={y}
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
        />
      )
    }

    return (
      <motion.svg
        className="absolute inset-0 pointer-events-none z-10"
        width={containerSize.width}
        height={containerSize.height}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {gridLines}
      </motion.svg>
    )
  }

  // Calcular posición en grid
  const getGridPosition = (widget) => {
    const x = widget.position.x * (cellSize.width + gap)
    const y = widget.position.y * (cellSize.height + gap)
    const width = widget.size.width * cellSize.width + (widget.size.width - 1) * gap
    const height = widget.size.height * cellSize.height + (widget.size.height - 1) * gap
    
    return { x, y, width, height }
  }

  // Snap to grid
  const snapToGrid = (x, y) => {
    const gridX = Math.round(x / (cellSize.width + gap))
    const gridY = Math.round(y / (cellSize.height + gap))
    return {
      x: Math.max(0, Math.min(gridX, gridSize.cols - 1)),
      y: Math.max(0, Math.min(gridY, gridSize.rows - 1))
    }
  }

  const handleSaveLayout = () => {
    // Guardar en localStorage
    localStorage.setItem('dashboard-layout', JSON.stringify(layout))
    setEditMode(false)
    // Mostrar mensaje de éxito
  }

  const handleResetLayout = () => {
    setLayout(initialLayout)
    localStorage.removeItem('dashboard-layout')
  }

  const handleToggleEditMode = () => {
    setEditMode(!editMode)
    setSelectedWidget(null)
    if (!editMode) {
      setShowGrid(true)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar de edición */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex items-center justify-between mb-6 p-4 bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: editMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiLayers className="w-6 h-6 text-blue-600" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Dashboard Personalizable
              </h3>
              <p className="text-sm text-gray-500">
                {editMode ? 'Arrastra widgets para reorganizar' : 'Haz clic en Editar para personalizar'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {editMode && (
              <>
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    showGrid 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </motion.button>

                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResetLayout}
                  className="p-2 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors"
                >
                  <FiRotateCcw className="w-4 h-4" />
                </motion.button>
              </>
            )}

            {editMode ? (
              <AnimatedButton
                variant="primary"
                icon={FiSave}
                onClick={handleSaveLayout}
                className="px-4 py-2"
              >
                Guardar
              </AnimatedButton>
            ) : (
              <AnimatedButton
                variant="outline"
                icon={FiEdit3}
                onClick={handleToggleEditMode}
                className="px-4 py-2"
              >
                Editar
              </AnimatedButton>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Contenedor principal del dashboard */}
      <motion.div
        ref={containerRef}
        className={`relative transition-all duration-300 ${
          editMode ? 'bg-gray-50 border-2 border-dashed border-blue-300 rounded-2xl p-4' : ''
        }`}
        style={{
          minHeight: containerSize.height,
          width: '100%'
        }}
        layout
      >
        {/* Grid visual */}
        <AnimatePresence>
          {renderGrid()}
        </AnimatePresence>

        {/* Widgets */}
        <AnimatePresence>
          {layout.map((widget) => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              editMode={editMode}
              isSelected={selectedWidget === widget.id}
              onSelect={() => setSelectedWidget(widget.id)}
              onUpdate={(updates) => updateWidget(widget.id, updates)}
              onRemove={() => removeWidget(widget.id)}
              getGridPosition={getGridPosition}
              snapToGrid={snapToGrid}
              cellSize={cellSize}
              gap={gap}
            >
              {children?.[widget.type] || <DefaultWidget widget={widget} />}
            </DraggableWidget>
          ))}
        </AnimatePresence>

        {/* Placeholder cuando no hay widgets */}
        {layout.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-64 text-gray-500"
          >
            <FiLayers className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Dashboard Vacío</h3>
            <p className="text-sm text-center mb-4">
              Haz clic en "Editar" para agregar widgets y personalizar tu dashboard
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

// Componente para widgets arrastrables
const DraggableWidget = ({ 
  widget, 
  children, 
  editMode, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onRemove,
  getGridPosition,
  snapToGrid,
  cellSize,
  gap
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const dragControls = useDragControls()

  const position = getGridPosition(widget)

  const handleDragStart = (event, info) => {
    if (!editMode) return
    setIsDragging(true)
    setDragStart({ x: info.point.x, y: info.point.y })
    onSelect()
  }

  const handleDragEnd = (event, info) => {
    if (!editMode) return
    setIsDragging(false)
    
    const deltaX = info.point.x - dragStart.x
    const deltaY = info.point.y - dragStart.y
    
    const newGridPos = snapToGrid(
      position.x + deltaX,
      position.y + deltaY
    )
    
    onUpdate({ position: newGridPos })
  }

  return (
    <motion.div
      drag={editMode}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ 
        scale: 1.05, 
        zIndex: 50,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      animate={{
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
        scale: isDragging ? 1.05 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={`absolute bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 ${
        editMode 
          ? `border-dashed ${isSelected ? 'border-blue-500' : 'border-gray-300'} cursor-move` 
          : 'border-transparent hover:shadow-xl'
      }`}
      onClick={() => editMode && onSelect()}
    >
      {/* Handle de arrastre en modo edición */}
      {editMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-3 -right-3 flex items-center space-x-1 z-10"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onPointerDown={(e) => dragControls.start(e)}
            className="p-2 bg-blue-500 text-white rounded-lg shadow-lg cursor-move"
          >
            <FiMove className="w-3 h-3" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="p-2 bg-red-500 text-white rounded-lg shadow-lg"
          >
            <FiTrash2 className="w-3 h-3" />
          </motion.button>
        </motion.div>
      )}

      {/* Contenido del widget */}
      <div className="w-full h-full p-4 overflow-hidden">
        {children}
      </div>

      {/* Indicador de selección */}
      {editMode && isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-2xl pointer-events-none"
        />
      )}
    </motion.div>
  )
}

// Widget por defecto
const DefaultWidget = ({ widget }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
    <FiSettings className="w-8 h-8 mb-2 opacity-50" />
    <h3 className="font-medium">{widget.title || 'Widget'}</h3>
    <p className="text-sm opacity-75">{widget.type}</p>
  </div>
)

export default DragDropDashboard