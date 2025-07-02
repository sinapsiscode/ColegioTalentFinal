import React from 'react'
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

const UserCard = ({ 
  usuario, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onChangeStatus,
  onManagePermissions,
  onViewDetails,
  onGenerateQR
}) => {
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800'
      case 'inactivo': return 'bg-gray-100 text-gray-800'
      case 'suspendido': return 'bg-red-100 text-red-800'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'activo': return <FiCheckCircle className="w-3 h-3" />
      case 'inactivo': return <FiClock className="w-3 h-3" />
      case 'suspendido': return <FiAlertTriangle className="w-3 h-3" />
      case 'pendiente': return <FiClock className="w-3 h-3" />
      default: return <FiUser className="w-3 h-3" />
    }
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'profesor': return 'bg-blue-100 text-blue-800'
      case 'padre': return 'bg-green-100 text-green-800'
      case 'administrativo': return 'bg-purple-100 text-purple-800'
      case 'estudiante': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'profesor': return <FiBook className="w-3 h-3" />
      case 'padre': return <FiUsers className="w-3 h-3" />
      case 'administrativo': return <FiSettings className="w-3 h-3" />
      case 'estudiante': return <FiUser className="w-3 h-3" />
      default: return <FiUser className="w-3 h-3" />
    }
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

  const typeInfo = getTypeInfo(usuario)

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
          <div className="w-12 h-12 bg-gradient-to-br from-talentos-primary to-talentos-secondary rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {usuario.avatar ? (
              <img src={usuario.avatar} alt={usuario.nombre} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              usuario.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {usuario.nombre}
            </h3>
            
            {/* Metadatos */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(usuario.tipo)}`}>
                {getTipoIcon(usuario.tipo)}
                <span className="capitalize">{usuario.tipo}</span>
              </div>
              
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(usuario.estado)}`}>
                {getStatusIcon(usuario.estado)}
                <span className="capitalize">{usuario.estado}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions menu */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onViewDetails(usuario)}
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
                onClick={() => onEdit(usuario)}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiEdit3 className="w-3 h-3" />
                <span>Editar</span>
              </button>
              
              <button
                onClick={() => onManagePermissions(usuario)}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiShield className="w-3 h-3" />
                <span>Permisos</span>
              </button>
              
              <button
                onClick={() => onDuplicate(usuario.id)}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiCopy className="w-3 h-3" />
                <span>Duplicar</span>
              </button>
              
              {usuario.tipo === 'estudiante' && onGenerateQR && (
                <button
                  onClick={() => onGenerateQR(usuario)}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiGrid className="w-3 h-3" />
                  <span>Generar QR</span>
                </button>
              )}
              
              {usuario.estado === 'activo' ? (
                <button
                  onClick={() => onChangeStatus(usuario.id, 'suspendido')}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-orange-700 hover:bg-orange-50"
                >
                  <FiUserX className="w-3 h-3" />
                  <span>Suspender</span>
                </button>
              ) : (
                <button
                  onClick={() => onChangeStatus(usuario.id, 'activo')}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                >
                  <FiUserCheck className="w-3 h-3" />
                  <span>Activar</span>
                </button>
              )}
              
              <button
                onClick={() => onDelete(usuario.id)}
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
      {usuario.tipo === 'profesor' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{usuario.comunicadosEnviados || 0}</p>
            <p className="text-xs text-gray-600">Comunicados</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{usuario.calificacionPromedio || 0}</p>
            <p className="text-xs text-gray-600">Calificación</p>
          </div>
        </div>
      )}

      {usuario.tipo === 'padre' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{usuario.mensajesEnviados || 0}</p>
            <p className="text-xs text-gray-600">Mensajes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{usuario.satisfaccion || 0}</p>
            <p className="text-xs text-gray-600">Satisfacción</p>
          </div>
        </div>
      )}

      {usuario.tipo === 'administrativo' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{usuario.tareasPendientes || 0}</p>
            <p className="text-xs text-gray-600">Pendientes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{usuario.eficiencia || 0}%</p>
            <p className="text-xs text-gray-600">Eficiencia</p>
          </div>
        </div>
      )}

      {usuario.tipo === 'estudiante' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{usuario.promedioGeneral || 0}</p>
            <p className="text-xs text-gray-600">Promedio</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{usuario.asistencia || 0}%</p>
            <p className="text-xs text-gray-600">Asistencia</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <FiCalendar className="w-4 h-4" />
          <span>{format(new Date(usuario.fechaRegistro), 'dd MMM yyyy', { locale: es })}</span>
        </div>
        
        <div className="text-xs text-gray-500">
          {formatTimeAgo(usuario.ultimaActividad)}
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
}

export default UserCard