import React, { memo, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FiMessageSquare,
  FiEye,
  FiMessageCircle,
  FiSend,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiUser
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Funciones helper movidas fuera del componente
const getPriorityConfig = (prioridad) => {
  const configs = {
    alta: { color: 'bg-red-100 text-red-800 border-red-200', icon: FiAlertTriangle },
    media: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: FiClock },
    baja: { color: 'bg-green-100 text-green-800 border-green-200', icon: FiCheckCircle }
  }
  return configs[prioridad] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: null }
}

const getStatusConfig = (estado) => {
  const configs = {
    enviado: { color: 'bg-green-100 text-green-800', icon: FiSend },
    programado: { color: 'bg-blue-100 text-blue-800', icon: FiClock },
    borrador: { color: 'bg-gray-100 text-gray-800', icon: FiMessageSquare }
  }
  return configs[estado] || { color: 'bg-gray-100 text-gray-800', icon: FiMessageSquare }
}

const formatTimeAgo = (fecha) => {
  const now = new Date()
  const diff = now - new Date(fecha)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (hours < 24) {
    return `hace ${hours}h`
  } else {
    return `hace ${days}d`
  }
}

// Componente LoadingSkeleton memoizado
const LoadingSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-4"></div>
      {[...Array(5)].map((_, index) => (
        <div key={index} className="border-b border-gray-200 py-3">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="flex space-x-4">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
))

// Componente Badge de Estado memoizado
const StatusBadge = memo(({ estado }) => {
  const config = useMemo(() => getStatusConfig(estado), [estado])
  const Icon = config.icon

  return (
    <div className={`flex items-center space-x-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      <span className="capitalize">{estado}</span>
    </div>
  )
})

// Componente Badge de Prioridad memoizado
const PriorityBadge = memo(({ prioridad }) => {
  const config = useMemo(() => getPriorityConfig(prioridad), [prioridad])
  const Icon = config.icon

  return (
    <div className={`flex items-center space-x-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {Icon && <Icon className="w-3 h-3" />}
      <span className="capitalize">{prioridad}</span>
    </div>
  )
})

// Componente Estadísticas memoizado
const CommuniqueStats = memo(({ comunicado }) => {
  const stats = useMemo(() => [
    { icon: FiUser, value: comunicado.destinatarios, label: 'destinatarios', shortLabel: comunicado.destinatarios },
    ...(comunicado.estado === 'enviado' ? [
      { icon: FiEye, value: comunicado.vistas, label: 'vistas', shortLabel: comunicado.vistas },
      { icon: FiMessageCircle, value: comunicado.respuestas, label: 'respuestas', shortLabel: comunicado.respuestas }
    ] : [])
  ], [comunicado.destinatarios, comunicado.estado, comunicado.vistas, comunicado.respuestas])

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-600">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="flex items-center space-x-1">
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{stat.value} {stat.label}</span>
            <span className="sm:hidden">{stat.shortLabel}</span>
          </div>
        )
      })}
    </div>
  )
})

// Componente EmptyState memoizado
const EmptyState = memo(() => (
  <div className="text-center py-8">
    <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
    <p className="text-sm text-gray-600">No hay comunicados recientes</p>
  </div>
))

// Componente CommuniqueItem memoizado
const CommuniqueItem = memo(({ comunicado, index, onCommuniqueClick }) => {
  const timeAgo = useMemo(() => formatTimeAgo(comunicado.fecha), [comunicado.fecha])
  const formattedDate = useMemo(() => 
    format(new Date(comunicado.fecha), 'dd MMM yyyy, HH:mm', { locale: es }), 
    [comunicado.fecha]
  )

  const handleClick = useCallback(() => {
    if (onCommuniqueClick) {
      onCommuniqueClick(comunicado)
    }
  }, [onCommuniqueClick, comunicado])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      onClick={handleClick}
      className="border-b border-gray-200 pb-2 sm:pb-3 last:border-b-0 hover:bg-gray-50 rounded-lg px-2 py-3 sm:p-3 transition-colors duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 mb-1 pr-2">
            {comunicado.titulo}
          </h4>
          
          {/* Metadatos */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
            <StatusBadge estado={comunicado.estado} />
            <PriorityBadge prioridad={comunicado.prioridad} />
          </div>
        </div>
        
        <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">
          {timeAgo}
        </span>
      </div>

      {/* Autor - Solo en desktop */}
      <div className="hidden sm:flex items-center space-x-1 mb-2">
        <FiUser className="w-3 h-3 text-gray-500" />
        <span className="text-xs text-gray-600">{comunicado.autor}</span>
      </div>

      {/* Estadísticas */}
      <CommuniqueStats comunicado={comunicado} />

      {/* Fecha completa - Solo desktop */}
      <div className="mt-2 hidden sm:block">
        <p className="text-xs text-gray-500">
          {formattedDate}
        </p>
      </div>
    </motion.div>
  )
})

// Componente principal optimizado
const RecentCommuniques = memo(({ comunicados = [], loading = false, onCommuniqueClick }) => {
  // Memoizar el contador
  const count = useMemo(() => comunicados.length, [comunicados.length])

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-talentos-primary" />
          <span className="text-sm sm:text-base">Comunicados Recientes</span>
        </h3>
        <span className="text-xs text-gray-500 hidden sm:inline">{count} comunicados</span>
      </div>

      <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
        {comunicados.map((comunicado, index) => (
          <CommuniqueItem
            key={comunicado.id}
            comunicado={comunicado}
            index={index}
            onCommuniqueClick={onCommuniqueClick}
          />
        ))}
      </div>

      {count === 0 && <EmptyState />}
    </div>
  )
})

// Configurar displayNames para mejor debugging
RecentCommuniques.displayName = 'RecentCommuniques'
LoadingSkeleton.displayName = 'LoadingSkeleton'
StatusBadge.displayName = 'StatusBadge'
PriorityBadge.displayName = 'PriorityBadge'
CommuniqueStats.displayName = 'CommuniqueStats'
EmptyState.displayName = 'EmptyState'
CommuniqueItem.displayName = 'CommuniqueItem'

export default RecentCommuniques