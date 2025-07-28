import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiX,
  FiUser,
  FiMail,
  FiBook,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi'
import AnimatedButton from '../common/AnimatedButton'
import useCoursesStore from '../../stores/coursesStore'
import useAdminUsersStore from '../../stores/adminUsersStore'
import { showSuccess, showError } from '../../utils/sweetAlert'

const AssignTeacherModal = ({ isOpen, onClose, course }) => {
  const { assignTeacher, removeTeacher } = useCoursesStore()
  const { usuarios, cargarUsuarios } = useAdminUsersStore()
  
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar profesores al montar
  useEffect(() => {
    if (isOpen) {
      cargarUsuarios()
      // Pre-seleccionar profesor actual si existe
      if (course?.profesor) {
        setSelectedTeacher(course.profesor.id)
      }
    }
  }, [isOpen, course, cargarUsuarios])

  // Filtrar solo profesores/tutores
  const profesores = usuarios.filter(u => 
    (u.tipo === 'tutor' || u.tipo === 'profesor') &&
    (searchTerm === '' || 
     u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAssign = async () => {
    if (!selectedTeacher) {
      showError('Error', 'Debes seleccionar un profesor')
      return
    }

    setLoading(true)
    
    try {
      const result = await assignTeacher(course.id, selectedTeacher)
      
      if (result.success) {
        showSuccess(
          'Profesor asignado',
          'El profesor ha sido asignado al curso correctamente'
        )
        onClose()
      } else {
        showError('Error', result.error || 'No se pudo asignar el profesor')
      }
    } catch (error) {
      showError('Error', 'Ocurrió un error al asignar el profesor')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    
    try {
      const result = await removeTeacher(course.id)
      
      if (result.success) {
        showSuccess(
          'Profesor removido',
          'El profesor ha sido removido del curso'
        )
        onClose()
      } else {
        showError('Error', result.error || 'No se pudo remover el profesor')
      }
    } catch (error) {
      showError('Error', 'Ocurrió un error al remover el profesor')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !course) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Asignar Profesor
            </h2>
            <p className="text-gray-600 mt-1">
              Selecciona un profesor para el curso: {course.nombre}
            </p>
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
        <div className="p-6">
          {/* Información del curso */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FiBook className="w-5 h-5 text-blue-600" />
              Información del Curso
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Código:</span>
                <span className="ml-2 font-medium">{course.codigo}</span>
              </div>
              <div>
                <span className="text-gray-600">Materia:</span>
                <span className="ml-2 font-medium">{course.materia}</span>
              </div>
              <div>
                <span className="text-gray-600">Grado:</span>
                <span className="ml-2 font-medium">{course.grado} - Sección {course.seccion}</span>
              </div>
              <div>
                <span className="text-gray-600">Horario:</span>
                <span className="ml-2 font-medium">{course.horario}</span>
              </div>
            </div>
            
            {course.profesor && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4" />
                  Profesor actual: <strong>{course.profesor.nombre}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Búsqueda */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar profesor por nombre o email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
            />
          </div>

          {/* Lista de profesores */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {profesores.length === 0 ? (
              <div className="text-center py-8">
                <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No se encontraron profesores</p>
              </div>
            ) : (
              profesores.map(profesor => (
                <motion.div
                  key={profesor.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedTeacher(profesor.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTeacher === profesor.id
                      ? 'border-talentos-primary bg-talentos-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {profesor.nombre} {profesor.apellidos}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FiMail className="w-3 h-3" />
                            {profesor.email}
                          </span>
                          {profesor.materia && (
                            <span className="flex items-center gap-1">
                              <FiBook className="w-3 h-3" />
                              {profesor.materia}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {selectedTeacher === profesor.id && (
                      <div className="w-6 h-6 bg-talentos-primary rounded-full flex items-center justify-center">
                        <FiCheck className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {course.profesor && (
              <AnimatedButton
                variant="outline"
                onClick={handleRemove}
                disabled={loading}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Remover profesor actual
              </AnimatedButton>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <AnimatedButton
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              icon={FiCheck}
              onClick={handleAssign}
              disabled={loading || !selectedTeacher}
            >
              {loading ? 'Asignando...' : 'Asignar Profesor'}
            </AnimatedButton>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AssignTeacherModal