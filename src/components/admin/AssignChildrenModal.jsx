import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, 
  FiUsers, 
  FiCheck, 
  FiSearch,
  FiUser,
  FiUserPlus,
  FiTrash2,
  FiSave
} from 'react-icons/fi'
import useAuthStore from '../../stores/authStore'
import { showSuccess, showError } from '../../utils/sweetAlert'

/**
 * Modal para asignar hijos (estudiantes) a un padre
 * - Lista de estudiantes disponibles
 * - Selección múltiple con checkboxes
 * - Visualización de hijos ya asignados
 * - Búsqueda y filtros
 */

const AssignChildrenModal = ({ 
  isOpen, 
  onClose, 
  parentUser,
  onAssignmentComplete 
}) => {
  const [availableStudents, setAvailableStudents] = useState([])
  const [currentChildren, setCurrentChildren] = useState([])
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [relationshipType, setRelationshipType] = useState('padre')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const { 
    getAvailableStudents, 
    getChildrenByParent, 
    assignChildrenToParent,
    removeChildFromParent 
  } = useAuthStore()

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen && parentUser) {
      loadData()
    }
  }, [isOpen, parentUser])

  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar estudiantes disponibles y hijos actuales en paralelo
      const [availableResult, childrenResult] = await Promise.all([
        getAvailableStudents(parentUser.id),
        getChildrenByParent(parentUser.id)
      ])

      if (availableResult.success) {
        setAvailableStudents(availableResult.data || [])
      }

      if (childrenResult.success) {
        setCurrentChildren(childrenResult.data || [])
      }
    } catch (error) {
      showError('Error', 'No se pudieron cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar estudiantes por búsqueda
  const filteredStudents = availableStudents.filter(student =>
    student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grado.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Manejar selección de estudiantes
  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  // Seleccionar/deseleccionar todos
  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id))
    }
  }

  // Asignar hijos seleccionados
  const handleAssignChildren = async () => {
    if (selectedStudentIds.length === 0) {
      showError('Error', 'Selecciona al menos un estudiante')
      return
    }

    setLoading(true)
    try {
      const result = await assignChildrenToParent(
        parentUser.id, 
        selectedStudentIds, 
        relationshipType
      )

      if (result.success) {
        showSuccess('Asignación Exitosa', result.message)
        setSelectedStudentIds([])
        await loadData() // Recargar datos
        
        if (onAssignmentComplete) {
          onAssignmentComplete()
        }
      } else {
        showError('Error de Asignación', result.error)
      }
    } catch (error) {
      showError('Error', 'Error inesperado durante la asignación')
    } finally {
      setLoading(false)
    }
  }

  // Remover hijo individual
  const handleRemoveChild = async (studentId) => {
    setLoading(true)
    try {
      const result = await removeChildFromParent(parentUser.id, studentId)
      
      if (result.success) {
        showSuccess('Hijo Removido', result.message)
        await loadData() // Recargar datos
        
        if (onAssignmentComplete) {
          onAssignmentComplete()
        }
      } else {
        showError('Error', result.error)
      }
    } catch (error) {
      showError('Error', 'Error inesperado al remover hijo')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Asignar Hijos
                </h3>
                <p className="text-sm text-gray-600">
                  {parentUser?.nombre} {parentUser?.apellidos}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="flex h-[70vh]">
            {/* Panel izquierdo - Hijos actuales */}
            <div className="w-1/2 p-6 border-r border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">
                  Hijos Asignados ({currentChildren.length})
                </h4>
              </div>
              
              <div className="space-y-2 overflow-y-auto h-full">
                {currentChildren.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiUser className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay hijos asignados</p>
                  </div>
                ) : (
                  currentChildren.map(child => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {child.nombre} {child.apellidos}
                        </p>
                        <p className="text-sm text-gray-600">
                          {child.grado} • {child.relationship_type}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveChild(child.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Panel derecho - Estudiantes disponibles */}
            <div className="w-1/2 p-6">
              <div className="mb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">
                    Estudiantes Disponibles
                  </h4>
                  {filteredStudents.length > 0 && (
                    <button
                      onClick={toggleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {selectedStudentIds.length === filteredStudents.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                    </button>
                  )}
                </div>

                {/* Búsqueda */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar estudiantes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Tipo de relación */}
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="padre">Padre</option>
                  <option value="madre">Madre</option>
                  <option value="tutor_legal">Tutor Legal</option>
                </select>
              </div>
              
              <div className="space-y-2 overflow-y-auto h-80">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-gray-500">Cargando estudiantes...</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiUserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes disponibles'}</p>
                  </div>
                ) : (
                  filteredStudents.map(student => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStudentIds.includes(student.id)
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleStudentSelection(student.id)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedStudentIds.includes(student.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedStudentIds.includes(student.id) && (
                            <FiCheck className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {student.nombre} {student.apellidos}
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.grado} • {student.seccion}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {selectedStudentIds.length} estudiante(s) seleccionado(s)
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAssignChildren}
                disabled={selectedStudentIds.length === 0 || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Asignando...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>Asignar Hijos</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AssignChildrenModal