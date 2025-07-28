import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiAlertCircle,
  FiX,
  FiCheck
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import AnimatedButton from '../../components/common/AnimatedButton'
import { showSuccess, showError, showConfirm, showInfo } from '../../utils/sweetAlert'
import { DatabaseQueries } from '../../data/databaseSchema'
import useAuthStore from '../../stores/authStore'

const TutorAssignments = () => {
  const [loading, setLoading] = useState(true)
  const [tutores, setTutores] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [selectedTutor, setSelectedTutor] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGrade, setFilterGrade] = useState('all')
  const { usuario } = useAuthStore()

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar tutores
      const allUsers = DatabaseQueries.getAllUsers()
      const tutorUsers = allUsers.filter(u => u.rol === 'tutor')
      setTutores(tutorUsers)

      // Cargar todos los estudiantes
      const allStudents = DatabaseQueries.getAllStudents()
      setEstudiantes(allStudents)

      // Cargar asignaciones existentes
      const allAssignments = DatabaseQueries.getAllTeacherAssignments() || []
      setAsignaciones(allAssignments)

      setLoading(false)
    } catch (error) {
      console.error('Error cargando datos:', error)
      showError('Error', 'No se pudieron cargar los datos')
      setLoading(false)
    }
  }

  // Obtener estudiantes asignados a un tutor
  const getEstudiantesAsignados = (tutorId) => {
    const asignacionesTutor = asignaciones.filter(a => a.teacher_user_id === tutorId)
    const estudianteIds = asignacionesTutor.map(a => a.student_id)
    return estudiantes.filter(e => estudianteIds.includes(e.id))
  }

  // Obtener materias de un tutor
  const getMateriasTutor = (tutorId) => {
    const asignacionesTutor = asignaciones.filter(a => a.teacher_user_id === tutorId)
    const materias = [...new Set(asignacionesTutor.map(a => a.subject))]
    return materias
  }

  // Obtener grados únicos
  const getGradosUnicos = () => {
    const grados = [...new Set(estudiantes.map(e => e.grado))]
    return grados.sort()
  }

  // Obtener estadísticas por tutor
  const getEstadisticasTutor = (tutorId) => {
    const estudiantesAsignados = getEstudiantesAsignados(tutorId)
    const materias = getMateriasTutor(tutorId)
    const grados = [...new Set(estudiantesAsignados.map(e => e.grado))]
    const secciones = [...new Set(estudiantesAsignados.map(e => `${e.grado} ${e.seccion || ''}`))]
    
    return {
      totalEstudiantes: estudiantesAsignados.length,
      totalMaterias: materias.length,
      totalGrados: grados.length,
      totalSecciones: secciones.length,
      materias,
      grados,
      secciones
    }
  }

  // Filtrar tutores
  const filteredTutores = tutores.filter(tutor => {
    const matchesSearch = searchTerm === '' || 
      tutor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterGrade === 'all') return matchesSearch
    
    const estudiantesAsignados = getEstudiantesAsignados(tutor.id)
    const tieneGrado = estudiantesAsignados.some(e => e.grado === filterGrade)
    
    return matchesSearch && tieneGrado
  })

  // Modal de asignación
  const AssignmentModal = ({ tutor, onClose, onSave }) => {
    const [selectedStudents, setSelectedStudents] = useState([])
    const [selectedSubject, setSelectedSubject] = useState('Matemáticas')
    const [filterModalGrade, setFilterModalGrade] = useState('all')
    const [filterModalSection, setFilterModalSection] = useState('all')
    
    // Estudiantes ya asignados al tutor
    const estudiantesAsignados = getEstudiantesAsignados(tutor.id)
    const estudianteIdsAsignados = estudiantesAsignados.map(e => e.id)
    
    // Estudiantes disponibles (no asignados a este tutor)
    const estudiantesDisponibles = estudiantes.filter(e => !estudianteIdsAsignados.includes(e.id))
    
    // Filtrar estudiantes en el modal
    const estudiantesFiltrados = estudiantesDisponibles.filter(e => {
      if (filterModalGrade !== 'all' && e.grado !== filterModalGrade) return false
      if (filterModalSection !== 'all' && e.seccion !== filterModalSection) return false
      return true
    })
    
    // Obtener secciones únicas del grado seleccionado
    const getSeccionesPorGrado = () => {
      if (filterModalGrade === 'all') return []
      const secciones = [...new Set(
        estudiantes
          .filter(e => e.grado === filterModalGrade)
          .map(e => e.seccion || 'Sin sección')
      )]
      return secciones.sort()
    }
    
    const handleToggleStudent = (studentId) => {
      if (selectedStudents.includes(studentId)) {
        setSelectedStudents(selectedStudents.filter(id => id !== studentId))
      } else {
        setSelectedStudents([...selectedStudents, studentId])
      }
    }
    
    const handleSelectAll = () => {
      const allIds = estudiantesFiltrados.map(e => e.id)
      setSelectedStudents(allIds)
    }
    
    const handleDeselectAll = () => {
      setSelectedStudents([])
    }
    
    const handleSave = async () => {
      if (selectedStudents.length === 0) {
        showError('Error', 'Selecciona al menos un estudiante')
        return
      }
      
      try {
        // Verificar asignaciones existentes para evitar duplicados
        const existingAssignments = asignaciones.filter(
          a => a.teacher_user_id === tutor.id && a.subject === selectedSubject
        )
        const existingStudentIds = existingAssignments.map(a => a.student_id)
        
        // Filtrar solo estudiantes que no tienen asignación con este tutor en esta materia
        const newStudentsToAssign = selectedStudents.filter(
          studentId => !existingStudentIds.includes(studentId)
        )
        
        if (newStudentsToAssign.length === 0) {
          showError('Información', 'Todos los estudiantes seleccionados ya están asignados a este tutor en esta materia')
          return
        }
        
        // Crear asignaciones para cada estudiante nuevo
        const newAssignments = newStudentsToAssign.map(studentId => ({
          teacher_user_id: tutor.id,
          student_id: studentId,
          subject: selectedSubject,
          academic_year: new Date().getFullYear().toString()
        }))
        
        // Guardar en la base de datos
        let successCount = 0
        let failedCount = 0
        
        for (const assignment of newAssignments) {
          const result = DatabaseQueries.createTeacherAssignment(assignment)
          if (result) {
            successCount++
          } else {
            failedCount++
          }
        }
        
        if (successCount > 0) {
          showSuccess(
            'Asignaciones creadas',
            `Se asignaron ${successCount} estudiantes a ${tutor.nombre} ${tutor.apellidos}`
          )
          
          if (failedCount > 0) {
            showInfo(
              'Información',
              `${failedCount} estudiantes ya tenían asignación previa`
            )
          }
          
          onSave()
          onClose()
        } else {
          showError('Error', 'No se pudieron crear las asignaciones')
        }
      } catch (error) {
        console.error('Error al guardar asignaciones:', error)
        showError('Error', 'No se pudieron guardar las asignaciones')
      }
    }
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del modal */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Asignar Estudiantes</h2>
                <p className="text-blue-100 mt-1">
                  Tutor: {tutor.nombre} {tutor.apellidos}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Contenido del modal */}
          <div className="p-6">
            {/* Selección de materia */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materia a impartir
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Matemáticas">Matemáticas</option>
                <option value="Comunicación">Comunicación</option>
                <option value="Ciencias">Ciencias</option>
                <option value="Historia">Historia</option>
                <option value="Inglés">Inglés</option>
                <option value="Arte">Arte</option>
                <option value="Educación Física">Educación Física</option>
              </select>
            </div>
            
            {/* Filtros */}
            <div className="mb-4 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por grado
                </label>
                <select
                  value={filterModalGrade}
                  onChange={(e) => {
                    setFilterModalGrade(e.target.value)
                    setFilterModalSection('all')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los grados</option>
                  {getGradosUnicos().map(grado => (
                    <option key={grado} value={grado}>{grado}</option>
                  ))}
                </select>
              </div>
              
              {filterModalGrade !== 'all' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por sección
                  </label>
                  <select
                    value={filterModalSection}
                    onChange={(e) => setFilterModalSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas las secciones</option>
                    {getSeccionesPorGrado().map(seccion => (
                      <option key={seccion} value={seccion}>{seccion}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* Acciones de selección */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedStudents.length} estudiantes seleccionados
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Seleccionar todos
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Deseleccionar todos
                </button>
                {filterModalGrade !== 'all' && (
                  <>
                    <span className="text-gray-400">|</span>
                    <button
                      onClick={() => {
                        const gradoStudents = estudiantesFiltrados.map(e => e.id)
                        setSelectedStudents(gradoStudents)
                      }}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      Seleccionar {filterModalGrade}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Lista de estudiantes */}
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {estudiantesFiltrados.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FiUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay estudiantes disponibles con los filtros aplicados</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {estudiantesFiltrados.map(estudiante => {
                    // Verificar si el estudiante tiene asignaciones con otros tutores
                    const otrasAsignaciones = asignaciones.filter(
                      a => a.student_id === estudiante.id && a.teacher_user_id !== tutor.id
                    )
                    const tieneTutor = otrasAsignaciones.length > 0
                    
                    return (
                      <label
                        key={estudiante.id}
                        className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(estudiante.id)}
                          onChange={() => handleToggleStudent(estudiante.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-gray-900">
                            {estudiante.nombre} {estudiante.apellidos}
                          </p>
                          <p className="text-sm text-gray-500">
                            {estudiante.grado} - Sección {estudiante.seccion || 'Sin sección'}
                          </p>
                          {tieneTutor && (
                            <p className="text-xs text-amber-600 mt-1">
                              Ya tiene {otrasAsignaciones.length} tutor(es) asignado(s)
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Código: {estudiante.codigo_qr}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Footer del modal */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <AnimatedButton
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </AnimatedButton>
            <AnimatedButton
              variant="primary"
              icon={FiCheck}
              onClick={handleSave}
              disabled={selectedStudents.length === 0}
            >
              Asignar {selectedStudents.length} estudiantes
            </AnimatedButton>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Eliminar asignación
  const handleDeleteAssignment = async (tutorId, studentId) => {
    // Buscar información del estudiante y tutor para el mensaje
    const estudiante = estudiantes.find(e => e.id === studentId)
    const tutor = tutores.find(t => t.id === tutorId)
    
    const result = await showConfirm(
      'Eliminar asignación',
      `¿Estás seguro de eliminar la asignación de ${estudiante?.nombre} ${estudiante?.apellidos} del tutor ${tutor?.nombre} ${tutor?.apellidos}?`,
      'Eliminar',
      'Cancelar'
    )
    
    if (result.isConfirmed) {
      try {
        const deleted = DatabaseQueries.deleteTeacherAssignment(tutorId, studentId)
        
        if (deleted) {
          showSuccess(
            'Asignación eliminada', 
            `${estudiante?.nombre} ${estudiante?.apellidos} ya no está asignado a ${tutor?.nombre} ${tutor?.apellidos}`
          )
          
          // Actualizar los datos localmente para una actualización más rápida
          setAsignaciones(asignaciones.filter(
            a => !(a.teacher_user_id === tutorId && a.student_id === studentId)
          ))
          
          // Recargar datos para asegurar sincronización
          setTimeout(loadData, 500)
        } else {
          showError('Error', 'No se pudo eliminar la asignación')
        }
      } catch (error) {
        console.error('Error al eliminar asignación:', error)
        showError('Error', 'No se pudo eliminar la asignación')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Asignaciones de Tutores</h1>
          <p className="text-gray-600 mt-2">
            Administra las asignaciones de estudiantes y materias para cada tutor
          </p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tutores</p>
                <p className="text-2xl font-bold text-gray-900">{tutores.length}</p>
              </div>
              <FiUsers className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estudiantes Asignados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(asignaciones.map(a => a.student_id))].length}
                </p>
              </div>
              <FiUserCheck className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sin Asignar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estudiantes.length - [...new Set(asignaciones.map(a => a.student_id))].length}
                </p>
              </div>
              <FiAlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Materias Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(asignaciones.map(a => a.subject))].length}
                </p>
              </div>
              <FiBookOpen className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar tutor por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los grados</option>
              {getGradosUnicos().map(grado => (
                <option key={grado} value={grado}>{grado}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Vista de tutores */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutores.map(tutor => {
              const stats = getEstadisticasTutor(tutor.id)
              const estudiantesAsignados = getEstudiantesAsignados(tutor.id)
              
              return (
                <motion.div
                  key={tutor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Header del tutor */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {tutor.nombre} {tutor.apellidos}
                        </h3>
                        <p className="text-blue-100 text-sm">{tutor.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTutor(tutor)
                          setShowAssignModal(true)
                        }}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <FiPlus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Estadísticas */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{stats.totalEstudiantes}</p>
                        <p className="text-xs text-gray-600">Estudiantes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{stats.totalSecciones}</p>
                        <p className="text-xs text-gray-600">Secciones</p>
                      </div>
                    </div>
                    
                    {/* Materias */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Materias:</p>
                      <div className="flex flex-wrap gap-1">
                        {stats.materias.length > 0 ? (
                          stats.materias.map(materia => (
                            <span 
                              key={materia}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                            >
                              {materia}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">Sin materias asignadas</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Últimos estudiantes asignados */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Estudiantes asignados:
                      </p>
                      {estudiantesAsignados.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {estudiantesAsignados.slice(0, 3).map(estudiante => (
                            <div 
                              key={estudiante.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-600 truncate">
                                {estudiante.nombre} {estudiante.apellidos}
                              </span>
                              <button
                                onClick={() => handleDeleteAssignment(tutor.id, estudiante.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {estudiantesAsignados.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{estudiantesAsignados.length - 3} más
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Sin estudiantes asignados</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          // Vista de lista
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiantes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Secciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materias
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTutores.map(tutor => {
                  const stats = getEstadisticasTutor(tutor.id)
                  
                  return (
                    <tr key={tutor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {tutor.nombre} {tutor.apellidos}
                          </p>
                          <p className="text-sm text-gray-500">{tutor.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {stats.totalEstudiantes}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {stats.totalSecciones}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {stats.materias.map(materia => (
                            <span 
                              key={materia}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {materia}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedTutor(tutor)
                            setShowAssignModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Estudiantes sin asignar */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5" />
            Estudiantes sin tutor asignado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estudiantes
              .filter(e => !asignaciones.some(a => a.student_id === e.id))
              .slice(0, 6)
              .map(estudiante => (
                <div key={estudiante.id} className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-medium text-gray-900">
                    {estudiante.nombre} {estudiante.apellidos}
                  </p>
                  <p className="text-sm text-gray-600">
                    {estudiante.grado} - Sección {estudiante.seccion || 'Sin sección'}
                  </p>
                </div>
              ))}
          </div>
          {estudiantes.filter(e => !asignaciones.some(a => a.student_id === e.id)).length > 6 && (
            <p className="text-sm text-yellow-700 mt-4 text-center">
              +{estudiantes.filter(e => !asignaciones.some(a => a.student_id === e.id)).length - 6} más
            </p>
          )}
        </div>
      </main>

      {/* Modal de asignación */}
      <AnimatePresence>
        {showAssignModal && selectedTutor && (
          <AssignmentModal
            tutor={selectedTutor}
            onClose={() => {
              setShowAssignModal(false)
              setSelectedTutor(null)
            }}
            onSave={() => {
              loadData()
              setShowAssignModal(false)
              setSelectedTutor(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default TutorAssignments