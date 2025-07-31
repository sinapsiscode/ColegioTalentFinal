import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUsers,
  FiUserPlus,
  FiUserMinus,
  FiSearch,
  FiFilter,
  FiUser,
  FiHome,
  FiCheck,
  FiX,
  FiEye,
  FiEdit3,
  FiHeart,
  FiPlus
} from 'react-icons/fi'
import LoadingSpinner from '../common/LoadingSpinner'
import AnimatedButton from '../common/AnimatedButton'
import SearchInput from '../common/SearchInput'
import FilterDropdown from '../common/FilterDropdown'
import AssignChildrenModal from '../admin/AssignChildrenModal'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'
import getDatabase from '../../data/DatabaseManager'
import useAdminUsersStore from '../../stores/adminUsersStore'

const FamilyAssignments = () => {
  const [loading, setLoading] = useState(true)
  const [parents, setParents] = useState([])
  const [students, setStudents] = useState([])
  const [filteredParents, setFilteredParents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedParent, setSelectedParent] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [viewMode, setViewMode] = useState('list') // list, detail
  
  const { usuarios, cargarUsuarios } = useAdminUsersStore()

  useEffect(() => {
    cargarUsuarios()
    loadFamilyAssignments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [parents, searchTerm, statusFilter])

  const loadFamilyAssignments = async () => {
    setLoading(true)
    try {
      const db = getDatabase()
      const relationships = db.select('parent_student_relationships') || []
      const users = db.select('users') || []
      const studentsData = db.select('students') || []

      // Obtener solo padres
      const parentUsers = users.filter(user => user.rol === 'padre')

      // Enriquecer padres con sus hijos asignados
      const enrichedParents = parentUsers.map(parent => {
        // Obtener relaciones de este padre
        const parentRelationships = relationships.filter(rel => rel.parentId === parent.id)
        
        // Obtener información completa de los hijos
        const assignedChildren = parentRelationships.map(rel => {
          const student = studentsData.find(s => s.id === rel.studentId)
          return {
            ...student,
            relationship: rel.relationship,
            relationshipId: rel.id
          }
        }).filter(Boolean) // Filtrar hijos que no existen

        return {
          ...parent,
          assignedChildren,
          totalChildren: assignedChildren.length,
          hasChildren: assignedChildren.length > 0
        }
      })

      setParents(enrichedParents)
      setStudents(studentsData)
    } catch (error) {
      console.error('Error cargando asignaciones familiares:', error)
      showError('Error', 'No se pudieron cargar las asignaciones familiares')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...parents]

    if (searchTerm) {
      filtered = filtered.filter(parent =>
        parent.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.assignedChildren.some(child => 
          child.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(parent => {
        switch (statusFilter) {
          case 'with_children':
            return parent.hasChildren
          case 'without_children':
            return !parent.hasChildren
          case 'single_child':
            return parent.totalChildren === 1
          case 'multiple_children':
            return parent.totalChildren > 1
          default:
            return true
        }
      })
    }

    setFilteredParents(filtered)
  }

  const handleViewParent = (parent) => {
    setSelectedParent(parent)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedParent(null)
  }

  const handleAssignChildren = (parent) => {
    setSelectedParent(parent)
    setShowAssignModal(true)
  }

  const handleSaveAssignments = async () => {
    await loadFamilyAssignments() // Recargar datos
    setShowAssignModal(false)
    setSelectedParent(null)
  }

  const handleRemoveChild = async (parent, child) => {
    const confirmed = await showConfirm(
      'Remover Hijo',
      `¿Estás seguro de que quieres remover a ${child.nombre} ${child.apellidos} de la familia de ${parent.nombre} ${parent.apellidos}?`,
      'warning'
    )

    if (confirmed.isConfirmed) {
      try {
        const db = getDatabase()
        db.delete('parent_student_relationships', record => record.id === child.relationshipId)
        
        await loadFamilyAssignments()
        showSuccess('Hijo removido', 'El hijo ha sido removido de la familia correctamente')
      } catch (error) {
        showError('Error', 'No se pudo remover el hijo de la familia')
      }
    }
  }

  const getStatusOptions = () => [
    { value: 'all', label: 'Todos los padres' },
    { value: 'with_children', label: 'Con hijos asignados' },
    { value: 'without_children', label: 'Sin hijos asignados' },
    { value: 'single_child', label: 'Un solo hijo' },
    { value: 'multiple_children', label: 'Múltiples hijos' }
  ]

  const getStats = () => {
    const totalParents = parents.length
    const withChildren = parents.filter(p => p.hasChildren).length
    const withoutChildren = totalParents - withChildren
    const totalChildren = parents.reduce((sum, p) => sum + p.totalChildren, 0)
    const orphanedStudents = students.length - totalChildren

    return { totalParents, withChildren, withoutChildren, totalChildren, orphanedStudents }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiHome className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Padres</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalParents}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiHeart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Con Hijos</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.withChildren}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-red-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FiX className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sin Hijos</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.withoutChildren}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-purple-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiUsers className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Hijos</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalChildren}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-orange-50 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FiUsers className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sin Padre</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.orphanedStudents}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClear={() => setSearchTerm('')}
                  placeholder="Buscar padres o hijos..."
                />
                
                <FilterDropdown
                  label="Filtrar por estado"
                  options={getStatusOptions()}
                  selectedValue={statusFilter}
                  onSelect={setStatusFilter}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {filteredParents.length} de {parents.length} padres
                </span>
              </div>
            </div>

            {/* Parents List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Padre/Madre
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Hijos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hijos Asignados
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredParents.map((parent, index) => (
                    <motion.tr
                      key={parent.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {parent.nombre} {parent.apellidos}
                            </div>
                            <div className="text-sm text-gray-500">
                              {parent.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {parent.totalChildren}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {parent.assignedChildren.length > 0 ? (
                            <div className="space-y-1">
                              {parent.assignedChildren.slice(0, 2).map(child => (
                                <div key={child.id} className="flex items-center space-x-2">
                                  <FiUser className="w-3 h-3 text-gray-400" />
                                  <span>{child.nombre} {child.apellidos}</span>
                                  <span className="text-xs text-gray-500">({child.relationship})</span>
                                </div>
                              ))}
                              {parent.assignedChildren.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{parent.assignedChildren.length - 2} más
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Sin hijos asignados</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {parent.hasChildren ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Con familia
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Sin hijos
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewParent(parent)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Ver detalles"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAssignChildren(parent)}
                            className="p-1.5 text-gray-600 hover:text-green-600 transition-colors"
                            title="Asignar hijos"
                          >
                            <FiUserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredParents.length === 0 && (
              <div className="text-center py-12">
                <FiHome className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron padres
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'No hay padres registrados en el sistema'}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          // Vista de detalle del padre
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {selectedParent && (
              <>
                <button
                  onClick={handleBackToList}
                  className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiHome className="w-5 h-5 mr-1" />
                  <span>Volver a la lista</span>
                </button>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-6">
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-6">
                      <h2 className="text-2xl font-bold text-white">
                        {selectedParent.nombre} {selectedParent.apellidos}
                      </h2>
                      <p className="text-green-100">
                        {selectedParent.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estadísticas del padre */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total de Hijos</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {selectedParent.totalChildren}
                        </p>
                      </div>
                      <FiUsers className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Relaciones</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {new Set(selectedParent.assignedChildren.map(c => c.relationship)).size}
                        </p>
                      </div>
                      <FiHeart className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Estado Familiar</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedParent.hasChildren ? 'Con Familia' : 'Sin Hijos'}
                        </p>
                      </div>
                      <FiHome className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Lista de hijos */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FiUsers className="w-5 h-5 mr-2 text-purple-600" />
                      Hijos Asignados
                    </h3>
                    <AnimatedButton
                      variant="primary"
                      size="sm"
                      icon={FiPlus}
                      onClick={() => handleAssignChildren(selectedParent)}
                    >
                      Asignar Hijos
                    </AnimatedButton>
                  </div>

                  {selectedParent.assignedChildren.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedParent.assignedChildren.map(child => (
                        <div key={child.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {child.nombre} {child.apellidos}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Código: {child.codigo}
                              </p>
                              <p className="text-sm text-blue-600 font-medium">
                                Relación: {child.relationship}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveChild(selectedParent, child)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remover hijo"
                            >
                              <FiUserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-gray-200 rounded-lg">
                      <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Sin hijos asignados
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Este padre no tiene hijos asignados en el sistema
                      </p>
                      <AnimatedButton
                        variant="primary"
                        icon={FiPlus}
                        onClick={() => handleAssignChildren(selectedParent)}
                      >
                        Asignar primer hijo
                      </AnimatedButton>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de asignación */}
      <AnimatePresence>
        {showAssignModal && selectedParent && (
          <AssignChildrenModal
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            parent={selectedParent}
            onSave={handleSaveAssignments}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default FamilyAssignments