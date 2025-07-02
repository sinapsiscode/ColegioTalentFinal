import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiUsers,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiSearch,
  FiFilter,
  FiPlus,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import useAdminUsersStore from '../../stores/adminUsersStore'
import useAuthStore from '../../stores/authStore'

import UserCard from '../../components/admin/UserCard'
import UserStats from '../../components/admin/UserStats'
import UserForm from '../../components/admin/UserForm'
import QRGenerator from '../../components/admin/QRGenerator'
import StudentProfile from '../../components/admin/StudentProfile'
import SearchInput from '../../components/common/SearchInput'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import { showSuccess, showError, showConfirm, showInput } from '../../utils/sweetAlert'

const Users = () => {
  const { usuario } = useAuthStore()
  const {
    cargando,
    usuarios,
    filtros,
    paginacion,
    configuraciones,
    cargarUsuarios,
    crearUsuario,
    editarUsuario,
    eliminarUsuario,
    cambiarEstadoUsuario,
    actualizarPermisos,
    obtenerUsuariosPorFiltros,
    buscarUsuarios,
    actualizarFiltros,
    cambiarPagina,
    obtenerEstadisticas,
    exportarUsuarios,
    importarUsuarios,
    duplicarUsuario
  } = useAdminUsersStore()

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showForm, setShowForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([])
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [showQRGenerator, setShowQRGenerator] = useState(false)
  const [selectedStudentForQR, setSelectedStudentForQR] = useState(null)
  const [showStudentProfile, setShowStudentProfile] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState(null)

  // Cargar usuarios al montar
  useEffect(() => {
    cargarUsuarios()
  }, [cargarUsuarios])

  // Filtrar usuarios
  useEffect(() => {
    let resultado
    
    if (searchTerm) {
      resultado = {
        usuarios: buscarUsuarios(searchTerm),
        total: buscarUsuarios(searchTerm).length,
        totalPaginas: 1
      }
    } else {
      resultado = obtenerUsuariosPorFiltros()
    }
    
    setUsuariosFiltrados(resultado.usuarios)
    setTotalPaginas(resultado.totalPaginas)
  }, [usuarios, searchTerm, filtros, paginacion.pagina, buscarUsuarios, obtenerUsuariosPorFiltros])

  // Handlers
  const handleCreateUser = async (userData) => {
    try {
      const nuevoId = crearUsuario(userData)
      showSuccess('Usuario creado', 'El usuario ha sido creado exitosamente')
      return nuevoId
    } catch (error) {
      showError('Error', 'No se pudo crear el usuario')
      throw error
    }
  }

  const handleEditUser = async (userData) => {
    try {
      editarUsuario(selectedUser.id, userData)
      showSuccess('Usuario actualizado', 'Los datos han sido actualizados exitosamente')
    } catch (error) {
      showError('Error', 'No se pudo actualizar el usuario')
      throw error
    }
  }

  const handleDeleteUser = async (usuarioId) => {
    try {
      const result = await showConfirm(
        '¿Eliminar usuario?',
        'Esta acción no se puede deshacer',
        'Sí, eliminar',
        'Cancelar'
      )

      if (result.isConfirmed) {
        eliminarUsuario(usuarioId)
        showSuccess('Usuario eliminado', 'El usuario ha sido eliminado exitosamente')
      }
    } catch (error) {
      console.log('Cancelado por el usuario')
    }
  }

  const handleChangeStatus = async (usuarioId, nuevoEstado) => {
    if (nuevoEstado === 'suspendido') {
      try {
        const result = await showInput(
          'Suspender Usuario',
          'Ingresa el motivo de la suspensión:',
          {
            showCancelButton: true,
            confirmButtonText: 'Suspender',
            cancelButtonText: 'Cancelar',
            inputPlaceholder: 'Motivo de la suspensión...'
          }
        )

        if (result.isConfirmed && result.value.trim()) {
          cambiarEstadoUsuario(usuarioId, nuevoEstado, result.value.trim())
          showSuccess('Usuario suspendido', 'El usuario ha sido suspendido')
        }
      } catch (error) {
        console.log('Cancelado por el usuario')
      }
    } else {
      cambiarEstadoUsuario(usuarioId, nuevoEstado)
      showSuccess(
        nuevoEstado === 'activo' ? 'Usuario activado' : 'Estado cambiado',
        `El usuario ahora está ${nuevoEstado}`
      )
    }
  }

  const handleManagePermissions = (usuario) => {
    showSuccess('Gestión de Permisos', 'Editor de permisos próximamente disponible')
  }

  const handleViewDetails = (usuario) => {
    if (usuario.tipo === 'estudiante') {
      setSelectedStudentId(usuario.id)
      setShowStudentProfile(true)
    } else {
      showSuccess('Detalles del Usuario', `Mostrando información de ${usuario.nombre}`)
    }
  }

  const handleDuplicateUser = (usuarioId) => {
    const nuevoId = duplicarUsuario(usuarioId)
    if (nuevoId) {
      showSuccess('Usuario duplicado', 'Se ha creado una copia del usuario')
    }
  }

  const handleRefresh = () => {
    cargarUsuarios()
    showSuccess('Usuarios actualizados', 'Los datos han sido actualizados')
  }

  const handleExport = async () => {
    try {
      const archivo = await exportarUsuarios('excel')
      showSuccess('Exportación completada', `Descargando ${archivo.archivo}`)
    } catch (error) {
      showError('Error', 'No se pudo exportar la lista de usuarios')
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls,.csv'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (file) {
        try {
          const resultado = await importarUsuarios(file)
          showSuccess('Importación completada', `${resultado.procesados} usuarios procesados`)
        } catch (error) {
          showError('Error', 'No se pudo importar el archivo')
        }
      }
    }
    input.click()
  }

  const openForm = (usuario = null) => {
    setSelectedUser(usuario)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setSelectedUser(null)
  }

  const handleGenerateQR = (student) => {
    setSelectedStudentForQR(student)
    setShowQRGenerator(true)
  }

  const closeQRGenerator = () => {
    setShowQRGenerator(false)
    setSelectedStudentForQR(null)
  }

  const handleSaveUser = async (userData) => {
    if (selectedUser) {
      await handleEditUser(userData)
    } else {
      await handleCreateUser(userData)
    }
  }

  // Opciones de filtro
  const tipoOptions = [
    { value: 'all', label: 'Todos los tipos' },
    ...(configuraciones.tiposUsuario ? Object.entries(configuraciones.tiposUsuario).map(([key, label]) => ({
      value: key,
      label
    })) : [])
  ]

  const estadoOptions = [
    { value: 'all', label: 'Todos los estados' },
    ...(configuraciones.estados ? Object.entries(configuraciones.estados).map(([key, label]) => ({
      value: key,
      label
    })) : [])
  ]

  const gradoOptions = [
    { value: 'all', label: 'Todos los grados' },
    ...(configuraciones.grados ? configuraciones.grados.map(grado => ({
      value: grado,
      label: grado
    })) : [])
  ]

  const departamentoOptions = [
    { value: 'all', label: 'Todos los departamentos' },
    ...(configuraciones.departamentos ? configuraciones.departamentos.map(dept => ({
      value: dept,
      label: dept
    })) : [])
  ]

  const estadisticas = obtenerEstadisticas()

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner size="xl" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header de la página */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="mt-1 text-gray-600">
              Administra usuarios, permisos y accesos del sistema
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center p-1 bg-white border border-gray-200 rounded-lg">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-talentos-primary text-white' 
                    : 'text-gray-600 hover:text-talentos-primary'
                }`}
                title="Vista en grilla"
              >
                <FiGrid className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-talentos-primary text-white' 
                    : 'text-gray-600 hover:text-talentos-primary'
                }`}
                title="Vista en lista"
              >
                <FiList className="w-4 h-4" />
              </motion.button>
            </div>
            
            <AnimatedButton
              variant="outline"
              icon={FiRefreshCw}
              onClick={handleRefresh}
              size="sm"
            >
              Actualizar
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              icon={FiDownload}
              onClick={handleExport}
              size="sm"
            >
              Exportar
            </AnimatedButton>
            
            <AnimatedButton
              variant="outline"
              icon={FiUpload}
              onClick={handleImport}
              size="sm"
            >
              Importar
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              icon={FiPlus}
              onClick={() => openForm()}
              size="sm"
            >
              Nuevo Usuario
            </AnimatedButton>
          </div>
        </div>

        {/* Estadísticas */}
        <UserStats estadisticas={estadisticas} loading={cargando} />

        {/* Controles de búsqueda y filtros */}
        <div className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar usuarios..."
            />
            
            <FilterDropdown
              label="Tipo"
              options={tipoOptions}
              selectedValue={filtros.tipo}
              onSelect={(value) => actualizarFiltros({ tipo: value })}
            />
            
            <FilterDropdown
              label="Estado"
              options={estadoOptions}
              selectedValue={filtros.estado}
              onSelect={(value) => actualizarFiltros({ estado: value })}
            />
            
            <FilterDropdown
              label="Grado"
              options={gradoOptions}
              selectedValue={filtros.grado}
              onSelect={(value) => actualizarFiltros({ grado: value })}
            />
            
            <FilterDropdown
              label="Departamento"
              options={departamentoOptions}
              selectedValue={filtros.departamento}
              onSelect={(value) => actualizarFiltros({ departamento: value })}
            />
          </div>
          
          {/* Contador de resultados */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
              {searchTerm && (
                <span className="ml-2">
                  para "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
            </p>
            
            {/* Paginación */}
            {totalPaginas > 1 && !searchTerm && (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => cambiarPagina(paginacion.pagina - 1)}
                  disabled={paginacion.pagina === 1}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </motion.button>
                
                <span className="text-sm text-gray-600">
                  Página {paginacion.pagina} de {totalPaginas}
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => cambiarPagina(paginacion.pagina + 1)}
                  disabled={paginacion.pagina === totalPaginas}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de usuarios */}
        {usuariosFiltrados.length === 0 ? (
          <div className="py-12 text-center bg-white border border-gray-200 rounded-lg">
            <FiUsers className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchTerm || Object.values(filtros).some(f => f !== 'all')
                ? 'No se encontraron usuarios'
                : 'No hay usuarios registrados'
              }
            </h3>
            <p className="mb-4 text-gray-600">
              {searchTerm || Object.values(filtros).some(f => f !== 'all')
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea el primer usuario para comenzar'
              }
            </p>
            {!searchTerm && !Object.values(filtros).some(f => f !== 'all') && (
              <AnimatedButton
                variant="primary"
                icon={FiPlus}
                onClick={() => openForm()}
              >
                Crear Primer Usuario
              </AnimatedButton>
            )}
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {usuariosFiltrados.map((usuario, index) => (
              <motion.div
                key={usuario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <UserCard
                  usuario={usuario}
                  onEdit={(user) => openForm(user)}
                  onDelete={handleDeleteUser}
                  onDuplicate={handleDuplicateUser}
                  onChangeStatus={handleChangeStatus}
                  onManagePermissions={handleManagePermissions}
                  onViewDetails={handleViewDetails}
                  onGenerateQR={handleGenerateQR}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de formulario */}
      <UserForm
        isOpen={showForm}
        onClose={closeForm}
        onSave={handleSaveUser}
        usuario={selectedUser}
        configuraciones={configuraciones}
      />

      {/* Modal de generador QR */}
      <QRGenerator
        isOpen={showQRGenerator}
        onClose={closeQRGenerator}
        student={selectedStudentForQR}
      />

      {/* Modal de perfil del estudiante */}
      {showStudentProfile && selectedStudentId && (
        <StudentProfile
          studentId={selectedStudentId}
          onClose={() => {
            setShowStudentProfile(false)
            setSelectedStudentId(null)
          }}
        />
      )}
    </div>
  )
}

export default Users