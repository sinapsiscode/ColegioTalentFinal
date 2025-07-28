import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import usePermissions from '../../hooks/usePermissions'

const PermissionGuard = ({ 
  children, 
  studentId, 
  requiredPermission = 'canViewStudent',
  fallbackRoute = '/unauthorized' 
}) => {
  const navigate = useNavigate()
  const permissions = usePermissions()
  
  useEffect(() => {
    if (studentId && requiredPermission) {
      const hasPermission = permissions[requiredPermission]?.(studentId)
      
      if (!hasPermission) {
        console.warn(`❌ ACCESO DENEGADO: Usuario ${permissions.usuario?.nombre} no puede acceder a estudiante ${studentId}`)
        navigate(fallbackRoute)
        return
      }
    }
  }, [studentId, requiredPermission, permissions, navigate, fallbackRoute])
  
  // Solo renderizar si tiene permisos
  if (studentId && requiredPermission) {
    const hasPermission = permissions[requiredPermission]?.(studentId)
    if (!hasPermission) {
      return null
    }
  }
  
  return children
}

export default PermissionGuard