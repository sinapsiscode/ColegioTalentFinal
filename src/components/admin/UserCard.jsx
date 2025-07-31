import React, { memo, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiMoreVertical,
  FiEdit3,
  FiTrash2,
  FiCopy,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiBook,
  FiSettings,
  FiUsers,
  FiGrid
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Funciones helper movidas fuera del componente para evitar recreación
const getStatusConfig = (estado) => {
  const configs = {
    activo: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
    inactivo: { color: 'bg-gray-100 text-gray-800', icon: FiClock },
    suspendido: { color: 'bg-red-100 text-red-800', icon: FiAlertTriangle },
    pendiente: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock }
  }
  return configs[estado] || { color: 'bg-gray-100 text-gray-800', icon: FiUser }
}

const getTipoConfig = (tipo) => {
  const configs = {
    profesor: { color: 'bg-blue-100 text-blue-800', icon: FiBook },
    padre: { color: 'bg-green-100 text-green-800', icon: FiUsers },
    administrativo: { color: 'bg-purple-100 text-purple-800', icon: FiSettings },
    estudiante: { color: 'bg-orange-100 text-orange-800', icon: FiUser }
  }
  return configs[tipo] || { color: 'bg-gray-100 text-gray-800', icon: FiUser }
}

const getTypeInfo = (usuario) => {
  switch (usuario.tipo) {
    case 'profesor':
      return {
        primaryInfo: usuario.materia,
        secondaryInfo: usuario.grado,
        extraInfo: `${usuario.experiencia} años exp.`
      }
    case 'padre':
      return {
        primaryInfo: usuario.estudiante,
        secondaryInfo: usuario.grado,
        extraInfo: usuario.ocupacion
      }
    case 'administrativo':
      return {
        primaryInfo: usuario.cargo,
        secondaryInfo: usuario.departamento,
        extraInfo: `${usuario.experiencia} años exp.`
      }
    case 'estudiante':
      return {
        primaryInfo: `${usuario.grado} - Sección ${usuario.seccion}`,
        secondaryInfo: `Promedio: ${usuario.promedioGeneral}`,
        extraInfo: `${usuario.asistencia}% asistencia`
      }
    default:
      return {
        primaryInfo: 'Sin información',
        secondaryInfo: '',
        extraInfo: ''
      }
  }
}

const formatTimeAgo = (fecha) => {
  const now = new Date()
  const diff = now - new Date(fecha)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) {
    return `hace ${minutes} min`
  } else if (hours < 24) {
    return `hace ${hours}h`
  } else {
    return `hace ${days}d`
  }
}

// Componente Badge memoizado
const StatusBadge = memo(({ estado }) => {
  const config = useMemo(() => getStatusConfig(estado), [estado])
  const Icon = config.icon
  
  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      <span className="capitalize">{estado}</span>
    </div>
  )
})

const TipoBadge = memo(({ tipo }) => {
  const config = useMemo(() => getTipoConfig(tipo), [tipo])
  const Icon = config.icon
  
  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      <span className="capitalize">{tipo}</span>
    </div>
  )
})

// Componente Avatar memoizado
const UserAvatar = memo(({ usuario }) => {
  const initials = useMemo(() => 
    usuario.nombre.split(' ').map(n => n[0]).join('').slice(0, 2), 
    [usuario.nombre]
  )
  
  return (
    <div className="w-12 h-12 bg-gradient-to-br from-talentos-primary to-talentos-secondary rounded-full flex items-center justify-center text-white font-semibold text-lg">
      {usuario.avatar ? (
        <img src={usuario.avatar} alt={usuario.nombre} className="w-12 h-12 rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
})

// Componente Métricas memoizado
const UserMetrics = memo(({ usuario }) => {
  const metrics = useMemo(() => {
    switch (usuario.tipo) {
      case 'profesor':
        return [
          { value: usuario.comunicadosEnviados || 0, label: 'Comunicados' },
          { value: usuario.calificacionPromedio || 0, label: 'Calificación' }
        ]
      case 'padre':
        return [
          { value: usuario.mensajesEnviados || 0, label: 'Mensajes' },
          { value: usuario.satisfaccion || 0, label: 'Satisfacción' }
        ]
      case 'administrativo':
        return [
          { value: usuario.tareasPendientes || 0, label: 'Pendientes' },
          { value: `${usuario.eficiencia || 0}%`, label: 'Eficiencia' }
        ]
      case 'estudiante':
        return [
          { value: usuario.promedioGeneral || 0, label: 'Promedio' },
          { value: `${usuario.asistencia || 0}%`, label: 'Asistencia' }
        ]
      default:
        return []
    }
  }, [usuario.tipo, usuario.comunicadosEnviados, usuario.calificacionPromedio, usuario.mensajesEnviados, usuario.satisfaccion, usuario.tareasPendientes, usuario.eficiencia, usuario.promedioGeneral, usuario.asistencia])

  if (metrics.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {metrics.map((metric, index) => (
        <div key={index} className="text-center">
          <p className="text-lg font-bold text-gray-900">{metric.value}</p>
          <p className="text-xs text-gray-600">{metric.label}</p>
        </div>
      ))}
    </div>
  )
})

// Componente principal optimizado
const UserCard = memo(({ 
  usuario, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onChangeStatus,
  onManagePermissions,
  onViewDetails,
  onGenerateQR
}) => {
  // Memoizar cálculos costosos
  const typeInfo = useMemo(() => getTypeInfo(usuario), [usuario])
  const formattedDate = useMemo(() => 
    format(new Date(usuario.fechaRegistro), 'dd MMM yyyy', { locale: es }), 
    [usuario.fechaRegistro]
  )
  const timeAgo = useMemo(() => formatTimeAgo(usuario.ultimaActividad), [usuario.ultimaActividad])

  // Memoizar handlers para evitar re-renders
  const handleViewDetails = useCallback(() => onViewDetails(usuario), [onViewDetails, usuario])
  const handleEdit = useCallback(() => onEdit(usuario), [onEdit, usuario])
  const handleManagePermissions = useCallback(() => onManagePermissions(usuario), [onManagePermissions, usuario])
  const handleDuplicate = useCallback(() => onDuplicate(usuario.id), [onDuplicate, usuario.id])
  const handleGenerateQR = useCallback(() => onGenerateQR(usuario), [onGenerateQR, usuario])
  const handleDelete = useCallback(() => onDelete(usuario.id), [onDelete, usuario.id])
  const handleActivate = useCallback(() => onChangeStatus(usuario.id, 'activo'), [onChangeStatus, usuario.id])
  const handleSuspend = useCallback(() => onChangeStatus(usuario.id, 'suspendido'), [onChangeStatus, usuario.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <UserAvatar usuario={usuario} />
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {usuario.nombre}
            </h3>
            
            {/* Metadatos */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <TipoBadge tipo={usuario.tipo} />
              <StatusBadge estado={usuario.estado} />
            </div>
          </div>
        </div>
        
        {/* Actions menu */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleViewDetails}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
            title="Ver detalles"
          >
            <FiUser className="w-4 h-4" />
          </motion.button>
          
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Más opciones"
            >
              <FiMoreVertical className="w-4 h-4" />
            </motion.button>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48 z-10">
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiEdit3 className="w-3 h-3" />
                <span>Editar</span>
              </button>
              
              <button
                onClick={handleManagePermissions}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiShield className="w-3 h-3" />
                <span>Permisos</span>
              </button>
              
              <button
                onClick={handleDuplicate}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiCopy className="w-3 h-3" />
                <span>Duplicar</span>
              </button>
              
              {usuario.tipo === 'estudiante' && onGenerateQR && (
                <button
                  onClick={handleGenerateQR}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiGrid className="w-3 h-3" />
                  <span>Generar QR</span>
                </button>
              )}
              
              {usuario.estado === 'activo' ? (
                <button
                  onClick={handleSuspend}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-orange-700 hover:bg-orange-50"
                >
                  <FiUserX className="w-3 h-3" />
                  <span>Suspender</span>
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                >
                  <FiUserCheck className="w-3 h-3" />
                  <span>Activar</span>
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                <FiTrash2 className="w-3 h-3" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Información principal */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <FiMail className="w-4 h-4 text-gray-500" />
          <span className="text-gray-900 font-medium">{usuario.email}</span>
        </div>
        
        {usuario.telefono && (
          <div className="flex items-center space-x-2 text-sm">
            <FiPhone className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{usuario.telefono}</span>
          </div>
        )}
        
        {typeInfo.primaryInfo && (
          <div className="flex items-center space-x-2 text-sm">
            <FiUser className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{typeInfo.primaryInfo}</span>
          </div>
        )}
      </div>

      {/* Información específica del tipo */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        {typeInfo.secondaryInfo && (
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-medium">{typeInfo.secondaryInfo}</span>
          </p>
        )}
        {typeInfo.extraInfo && (
          <p className="text-xs text-gray-600">{typeInfo.extraInfo}</p>
        )}
      </div>

      {/* Métricas específicas */}
      <UserMetrics usuario={usuario} />

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <FiCalendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
        
        <div className="text-xs text-gray-500">
          {timeAgo}
        </div>
      </div>

      {/* Indicador de suspensión */}
      {usuario.estado === 'suspendido' && usuario.motivoSuspension && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800">
            <span className="font-medium">Motivo:</span> {usuario.motivoSuspension}
          </p>
        </div>
      )}
    </motion.div>
  )
})

UserCard.displayName = 'UserCard'
StatusBadge.displayName = 'StatusBadge'
TipoBadge.displayName = 'TipoBadge'
UserAvatar.displayName = 'UserAvatar'
UserMetrics.displayName = 'UserMetrics'

export default UserCard