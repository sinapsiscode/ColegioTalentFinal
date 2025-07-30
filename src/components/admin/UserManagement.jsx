import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiUsers,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiKey,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCheck,
  FiX,
  FiUserPlus,
  FiUpload,
  FiList,
  FiGrid
} from 'react-icons/fi'
import useAuthStore from '../../stores/authStore'
import { showSuccess, showError, showConfirm, showInput } from '../../utils/sweetAlert'
import LoadingSpinner from '../common/LoadingSpinner'
import SearchInput from '../common/SearchInput'
import FilterDropdown from '../common/FilterDropdown'
import AssignChildrenModal from './AssignChildrenModal'
import ImportStudentsModal from './ImportStudentsModal'

const UserManagement = () => {
  const { 
    getAllUsers, 
    createUser, 
    updateUser, 
    toggleUserStatus, 
    changeUserPassword,
    loading 
  } = useAuthStore()

  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [showAssignChildrenModal, setShowAssignChildrenModal] = useState(false)
  const [selectedParent, setSelectedParent] = useState(null)
  const [showImportStudentsModal, setShowImportStudentsModal] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [viewMode, setViewMode] = useState('table') // 'table' or 'cards'

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, searchTerm, roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setLoadingData(true)
      const response = await getAllUsers()
      if (response.success) {
        setUsers(response.data)
      } else {
        showError('Error', 'No se pudieron cargar los usuarios')
      }
    } catch (error) {
      showError('Error', 'Error al cargar usuarios')
    } finally {
      setLoadingData(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.rol === roleFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.estado === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setShowAddModal(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleToggleStatus = async (user) => {
    const newStatus = user.estado === 'activo' ? 'inactivo' : 'activo'
    const action = newStatus === 'activo' ? 'activar' : 'desactivar'
    
    const confirmed = await showConfirm(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
      `¿Estás seguro de que quieres ${action} a ${user.nombre} ${user.apellidos}?`
    )

    if (confirmed) {
      const response = await toggleUserStatus(user.id, newStatus)
      if (response.success) {
        showSuccess('Usuario actualizado', response.message)
        loadUsers()
      } else {
        showError('Error', response.error)
      }
    }
  }

  const handleResetPassword = async (user) => {
    try {
      const result = await showInput(
        'Cambiar Contraseña',
        `Ingresa la nueva contraseña para ${user.nombre} ${user.apellidos}:`,
        {
          inputType: 'password',
          inputPlaceholder: 'Nueva contraseña',
          showCancelButton: true,
          confirmButtonText: 'Cambiar',
          cancelButtonText: 'Cancelar'
        }
      )

      if (result.isConfirmed && result.value) {
        const response = await changeUserPassword(user.id, result.value)
        if (response.success) {
          showSuccess('Contraseña actualizada', response.message)
        } else {
          showError('Error', response.error)
        }
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  const handleAssignChildren = (user) => {
    if (user.rol !== 'padre') {
      showError('Error', 'Solo se pueden asignar hijos a usuarios con rol de padre')
      return
    }
    setSelectedParent(user)
    setShowAssignChildrenModal(true)
  }

  const handleAssignmentComplete = () => {
    // Opcional: Recargar usuarios o mostrar mensaje de éxito
    showSuccess('Asignación Completa', 'Las relaciones padre-hijo han sido actualizadas')
  }

  const handleImportStudents = () => {
    setShowImportStudentsModal(true)
  }

  const handleImportComplete = (importedCount) => {
    showSuccess(
      'Importación Exitosa', 
      `Se han importado ${importedCount} estudiante(s) correctamente al sistema`
    )
    // Opcional: Recargar algún estado si es necesario
  }

  const handleDeleteUser = async (user) => {
    // Verificar dependencias según el rol
    let warningMessage = `¿Estás seguro de que quieres eliminar a ${user.nombre} ${user.apellidos}?`
    
    if (user.rol === 'padre') {
      // Verificar si tiene hijos asignados
      const hasChildren = true // TODO: Verificar en base de datos
      if (hasChildren) {
        warningMessage += '\n\nEste usuario tiene hijos asignados. Se eliminarán las relaciones.'
      }
    } else if (user.rol === 'tutor') {
      // Verificar si tiene estudiantes o cursos asignados
      const hasAssignments = true // TODO: Verificar en base de datos
      if (hasAssignments) {
        warningMessage += '\n\nEste tutor tiene estudiantes/cursos asignados. Se reasignarán.'
      }
    }
    
    const confirmed = await showConfirm(
      'Eliminar Usuario',
      warningMessage,
      'warning'
    )
    
    if (confirmed) {
      try {
        // TODO: Implementar llamada a API
        const response = { success: true, message: 'Usuario eliminado correctamente' }
        
        if (response.success) {
          showSuccess('Usuario Eliminado', response.message)
          // Remover usuario de la lista local
          setUsers(users.filter(u => u.id !== user.id))
        } else {
          showError('Error', 'No se pudo eliminar el usuario')
        }
      } catch (error) {
        showError('Error', 'Error al eliminar el usuario')
      }
    }
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      showError('Sin selección', 'Selecciona al menos un usuario')
      return
    }

    const userCount = selectedUsers.length
    let confirmMessage = ''

    switch (action) {
      case 'activate':
        confirmMessage = `¿Activar ${userCount} usuario(s)?`
        break
      case 'deactivate':
        confirmMessage = `¿Desactivar ${userCount} usuario(s)?`
        break
      case 'delete':
        confirmMessage = `¿Eliminar ${userCount} usuario(s)? Esta acción no se puede deshacer.`
        break
      case 'export':
        // Exportar sin confirmación
        exportSelectedUsers()
        return
    }

    const confirmed = await showConfirm('Acción masiva', confirmMessage)
    
    if (confirmed) {
      // TODO: Implementar acciones masivas
      showSuccess('Acción completada', `${userCount} usuario(s) procesados`)
      setSelectedUsers([])
      loadUsers()
    }
  }

  const exportSelectedUsers = () => {
    const usersToExport = users.filter(u => selectedUsers.includes(u.id))
    // TODO: Implementar exportación real
    console.log('Exportando usuarios:', usersToExport)
    showSuccess('Exportación lista', `${usersToExport.length} usuario(s) exportados`)
  }

  const roleOptions = [
    { value: 'all', label: 'Todos los roles' },
    { value: 'padre', label: 'Padres' },
    { value: 'tutor', label: 'Tutores' },
    { value: 'admin', label: 'Administradores' },
    { value: 'entrada', label: 'Personal de entrada' }
  ]

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'activo', label: 'Activos' },
    { value: 'inactivo', label: 'Inactivos' }
  ]

  const getRoleColor = (role) => {
    const colors = {
      padre: 'bg-blue-100 text-blue-800',
      tutor: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800',
      entrada: 'bg-orange-100 text-orange-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getRoleLabel = (role) => {
    const labels = {
      padre: 'Padre',
      tutor: 'Tutor',
      admin: 'Admin',
      entrada: 'Entrada'
    }
    return labels[role] || role
  }

  if (loadingData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-talentos-light rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-talentos-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestión de Usuarios</h2>
              <p className="text-sm text-gray-600">Administra usuarios del sistema</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-talentos-primary hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar lista"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleImportStudents}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Importar estudiantes desde Excel"
            >
              <FiUpload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar Estudiantes</span>
              <span className="sm:hidden">Importar</span>
            </button>
            
            <button
              onClick={handleAddUser}
              className="flex items-center space-x-2 px-4 py-2 bg-talentos-primary text-white rounded-lg hover:bg-talentos-secondary transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Usuario</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder="Buscar usuarios..."
          />
          
          <FilterDropdown
            label="Filtrar por rol"
            options={roleOptions}
            selectedValue={roleFilter}
            onSelect={setRoleFilter}
          />
          
          <FilterDropdown
            label="Filtrar por estado"
            options={statusOptions}
            selectedValue={statusFilter}
            onSelect={setStatusFilter}
          />
        </div>

        {/* Stats and View Mode */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{filteredUsers.length} de {users.length} usuarios</span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{users.filter(u => u.estado === 'activo').length} activos</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>{users.filter(u => u.estado === 'inactivo').length} inactivos</span>
            </span>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
              title="Vista tabla"
            >
              <FiList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded ${viewMode === 'cards' ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
              title="Vista tarjetas"
            >
              <FiGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
          >
            <span className="text-sm text-gray-700">
              {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Activar
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                Desactivar
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Exportar
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="ml-1 sm:ml-2 text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Table */}
      {viewMode === 'table' ? (
        <div className="overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-2 py-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded text-talentos-primary focus:ring-talentos-primary"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="w-16 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Rol
                </th>
                <th className="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="w-20 px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.005 }}
                    onClick={() => handleEditUser(user)}
                    className="hover:bg-gray-50 cursor-pointer transition-all duration-200"
                  >
                    <td className="w-12 px-2 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded text-talentos-primary focus:ring-talentos-primary"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-talentos-light flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-talentos-primary" />
                          </div>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.nombre} {user.apellidos}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                          {/* Mostrar información adicional en móviles */}
                          <div className="sm:hidden mt-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${getRoleColor(user.rol)}`}>
                                {getRoleLabel(user.rol)}
                              </span>
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${user.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className={`text-xs ${user.estado === 'activo' ? 'text-green-800' : 'text-red-800'}`}>
                                  {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>
                            </div>
                            {user.telefono && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <FiPhone className="w-3 h-3" />
                                <span>{user.telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="w-16 px-2 py-4 hidden sm:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.rol)}`}>
                        {getRoleLabel(user.rol)}
                      </span>
                    </td>
                    
                    <td className="w-20 px-2 py-4 hidden sm:table-cell">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${user.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs ${user.estado === 'activo' ? 'text-green-800' : 'text-red-800'}`}>
                          {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="w-20 px-2 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditUser(user)
                          }}
                          className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                          title="Editar usuario"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleStatus(user)
                          }}
                          className="p-1.5 text-gray-600 hover:text-green-600 transition-colors"
                          title={user.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        >
                          {user.estado === 'activo' ? (
                            <FiToggleRight className="w-4 h-4" />
                          ) : (
                            <FiToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteUser(user)
                          }}
                          className="p-1.5 text-gray-600 hover:text-red-600 transition-colors hidden sm:inline-block"
                          title="Eliminar usuario"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron usuarios
              </h3>
              <p className="text-gray-600">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Agrega el primer usuario al sistema'
                }
              </p>
            </div>
          )}
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Card Header with Checkbox */}
              <div className="p-4 pb-0">
                <div className="flex items-start justify-between">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded text-talentos-primary focus:ring-talentos-primary mt-1"
                  />
                  <div className={`w-2 h-2 rounded-full ${user.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </div>
              
              {/* User Info */}
              <div className="p-4 pt-2 text-center">
                <div className="w-20 h-20 rounded-full bg-talentos-light flex items-center justify-center mx-auto mb-3">
                  <FiUser className="w-10 h-10 text-talentos-primary" />
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1">
                  {user.nombre} {user.apellidos}
                </h3>
                
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-3 ${getRoleColor(user.rol)}`}>
                  {getRoleLabel(user.rol)}
                </span>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-1">
                    <FiMail className="w-3 h-3" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.telefono && (
                    <div className="flex items-center justify-center space-x-1">
                      <FiPhone className="w-3 h-3" />
                      <span>{user.telefono}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Card Actions */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Editar"
                >
                  <FiEdit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleResetPassword(user)}
                  className="p-1.5 text-gray-600 hover:text-yellow-600 transition-colors"
                  title="Cambiar contraseña"
                >
                  <FiKey className="w-4 h-4" />
                </button>
                {user.rol === 'padre' && (
                  <button
                    onClick={() => handleAssignChildren(user)}
                    className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Asignar hijos"
                  >
                    <FiUserPlus className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleToggleStatus(user)}
                  className="p-1.5 text-gray-600 hover:text-green-600 transition-colors"
                  title={user.estado === 'activo' ? 'Desactivar' : 'Activar'}
                >
                  {user.estado === 'activo' ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDeleteUser(user)}
                  className="p-1.5 text-gray-600 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron usuarios
              </h3>
              <p className="text-gray-600">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Agrega el primer usuario al sistema'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <UserFormModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={async (userData) => {
            const response = await createUser(userData)
            if (response.success) {
              showSuccess('Usuario creado', response.message)
              loadUsers()
              setShowAddModal(false)
            } else {
              showError('Error', response.error)
            }
          }}
          title="Nuevo Usuario"
          loading={loading}
        />
      )}

      {showEditModal && selectedUser && (
        <UserFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={async (userData) => {
            const response = await updateUser(selectedUser.id, userData)
            if (response.success) {
              showSuccess('Usuario actualizado', response.message)
              loadUsers()
              setShowEditModal(false)
            } else {
              showError('Error', response.error)
            }
          }}
          user={selectedUser}
          title="Editar Usuario"
          loading={loading}
        />
      )}

      {/* Modal para asignar hijos */}
      {showAssignChildrenModal && selectedParent && (
        <AssignChildrenModal
          isOpen={showAssignChildrenModal}
          onClose={() => {
            setShowAssignChildrenModal(false)
            setSelectedParent(null)
          }}
          parentUser={selectedParent}
          onAssignmentComplete={handleAssignmentComplete}
        />
      )}

      {/* Modal para importar estudiantes */}
      {showImportStudentsModal && (
        <ImportStudentsModal
          isOpen={showImportStudentsModal}
          onClose={() => setShowImportStudentsModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  )
}

const UserFormModal = ({ isOpen, onClose, onSave, user, title, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rol: 'padre',
    nombre: '',
    apellidos: '',
    telefono: '',
    direccion: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '',
        rol: user.rol || 'padre',
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        telefono: user.telefono || '',
        direccion: user.direccion || ''
      })
    } else {
      setFormData({
        email: '',
        password: '',
        rol: 'padre',
        nombre: '',
        apellidos: '',
        telefono: '',
        direccion: ''
      })
    }
    setErrors({})
  }, [user, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    
    if (!user && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    } else if (!user && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="usuario@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {user ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
              </label>
              <div className="relative">
                <FiKey className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={user ? 'Dejar vacío para mantener actual' : 'Contraseña'}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre"
                />
              </div>
              {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent ${
                  errors.apellidos ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Apellidos"
              />
              {errors.apellidos && <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent"
              >
                <option value="padre">Padre</option>
                <option value="tutor">Tutor</option>
                <option value="admin">Administrador</option>
                <option value="entrada">Personal de entrada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent"
                  placeholder="+51 987 654 321"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                rows="3"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-accent focus:border-transparent"
                placeholder="Dirección completa"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-talentos-primary text-white rounded-lg hover:bg-talentos-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>{user ? 'Actualizar' : 'Crear'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default UserManagement