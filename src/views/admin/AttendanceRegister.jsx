import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiSave,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCalendar,
  FiUser,
  FiFilter,
  FiSearch,
  FiGrid,
  FiList,
  FiEdit,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import FilterDropdown from '../../components/common/FilterDropdown'
import SearchInput from '../../components/common/SearchInput'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StaggeredList from '../../components/common/StaggeredList'

import useAttendanceStore from '../../stores/attendanceStore'
import useStudentsStore from '../../stores/studentsStore'
import { showSuccess, showError, showWarning, showInfo as showAlert } from '../../utils/sweetAlert'

const AttendanceRegister = () => {
  const navigate = useNavigate()
  const { 
    registrarAsistencia,
    registrarMultiplesAsistencias,
    obtenerRegistroHoy,
    cargando
  } = useAttendanceStore()
  
  const { alumnos } = useStudentsStore()

  // Estados
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedSection, setSelectedSection] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Estado de asistencia temporal
  const [attendanceStates, setAttendanceStates] = useState({})
  const [modifiedStudents, setModifiedStudents] = useState(new Set())

  // Cargar estados iniciales
  useEffect(() => {
    const initialStates = {}
    alumnos.forEach(alumno => {
      const registro = obtenerRegistroHoy(alumno.id)
      if (registro) {
        initialStates[alumno.id] = {
          estado: registro.estado,
          horaEntrada: registro.horaEntrada,
          horaSalida: registro.horaSalida,
          observaciones: registro.observaciones || ''
        }
      } else {
        initialStates[alumno.id] = {
          estado: 'falta',
          horaEntrada: null,
          horaSalida: null,
          observaciones: ''
        }
      }
    })
    setAttendanceStates(initialStates)
  }, [alumnos, obtenerRegistroHoy, selectedDate])

  // Filtrar estudiantes
  const filteredStudents = alumnos.filter(alumno => {
    const matchGrade = selectedGrade === 'all' || alumno.grado === selectedGrade
    const matchSection = selectedSection === 'all' || alumno.seccion === selectedSection
    const matchSearch = searchTerm === '' || 
      alumno.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchGrade && matchSection && matchSearch
  })

  // Handlers
  const handleStateChange = (studentId, newState) => {
    const currentTime = new Date().toISOString()
    
    setAttendanceStates(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        estado: newState,
        horaEntrada: newState === 'presente' || newState === 'tarde' ? currentTime : null,
        horaSalida: newState === 'falta' ? null : prev[studentId]?.horaSalida
      }
    }))
    
    setModifiedStudents(prev => new Set([...prev, studentId]))
  }

  const handleObservationChange = (studentId, observation) => {
    setAttendanceStates(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        observaciones: observation
      }
    }))
    
    setModifiedStudents(prev => new Set([...prev, studentId]))
  }

  const handleSaveAll = async () => {
    if (modifiedStudents.size === 0) {
      showWarning('Sin cambios', 'No se han realizado cambios en la asistencia')
      return
    }

    setSaving(true)
    
    try {
      // Preparar registros para guardar
      const registros = Array.from(modifiedStudents).map(studentId => {
        const state = attendanceStates[studentId]
        return {
          alumnoId: studentId,
          fecha: selectedDate,
          estado: state.estado,
          horaEntrada: state.horaEntrada,
          horaSalida: state.horaSalida,
          observaciones: state.observaciones,
          registradoPor: 'admin'
        }
      })

      // Guardar todos los registros
      await registrarMultiplesAsistencias(registros)
      
      showSuccess(
        'Asistencia guardada',
        `Se han registrado ${modifiedStudents.size} cambios correctamente`
      )
      
      setModifiedStudents(new Set())
      setEditMode(false)
    } catch (error) {
      showError('Error', 'No se pudo guardar la asistencia')
    } finally {
      setSaving(false)
    }
  }

  const handleQuickAction = (action) => {
    const currentTime = new Date().toISOString()
    const updates = {}
    const studentsToUpdate = new Set()

    filteredStudents.forEach(student => {
      switch (action) {
        case 'all-present':
          updates[student.id] = {
            estado: 'presente',
            horaEntrada: currentTime,
            horaSalida: null,
            observaciones: ''
          }
          studentsToUpdate.add(student.id)
          break
        case 'all-absent':
          updates[student.id] = {
            estado: 'falta',
            horaEntrada: null,
            horaSalida: null,
            observaciones: ''
          }
          studentsToUpdate.add(student.id)
          break
        case 'clear':
          updates[student.id] = {
            estado: 'falta',
            horaEntrada: null,
            horaSalida: null,
            observaciones: ''
          }
          studentsToUpdate.add(student.id)
          break
      }
    })

    setAttendanceStates(prev => ({ ...prev, ...updates }))
    setModifiedStudents(prev => new Set([...prev, ...studentsToUpdate]))
  }

  // Estadísticas
  const stats = {
    total: filteredStudents.length,
    presentes: filteredStudents.filter(s => attendanceStates[s.id]?.estado === 'presente').length,
    tardes: filteredStudents.filter(s => attendanceStates[s.id]?.estado === 'tarde').length,
    faltas: filteredStudents.filter(s => attendanceStates[s.id]?.estado === 'falta').length
  }

  // Renderizar tarjeta de estudiante
  const renderStudentCard = (student) => {
    const state = attendanceStates[student.id] || { estado: 'falta' }
    const isModified = modifiedStudents.has(student.id)
    
    return (
      <AnimatedCard key={student.id} className={`relative ${isModified ? 'ring-2 ring-talentos-primary' : ''}`}>
        <div className="p-4">
          {/* Header con foto y nombre */}
          <div className="flex items-start space-x-3 mb-4">
            <img
              src={student.foto_url || `/avatar-student${(student.id % 6) + 1}.jpg`}
              alt={student.nombreCompleto}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{student.nombreCompleto}</h4>
              <p className="text-sm text-gray-600">{student.grado} {student.seccion}</p>
              {student.codigo && (
                <p className="text-xs text-gray-500">Código: {student.codigo}</p>
              )}
            </div>
            {isModified && (
              <span className="text-xs text-talentos-primary font-medium">Modificado</span>
            )}
          </div>

          {/* Botones de estado */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => handleStateChange(student.id, 'presente')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                state.estado === 'presente'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-100'
              }`}
              disabled={!editMode}
            >
              <FiCheckCircle className="w-4 h-4 mx-auto mb-1" />
              Presente
            </button>
            
            <button
              onClick={() => handleStateChange(student.id, 'tarde')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                state.estado === 'tarde'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
              }`}
              disabled={!editMode}
            >
              <FiClock className="w-4 h-4 mx-auto mb-1" />
              Tarde
            </button>
            
            <button
              onClick={() => handleStateChange(student.id, 'falta')}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                state.estado === 'falta'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-100'
              }`}
              disabled={!editMode}
            >
              <FiXCircle className="w-4 h-4 mx-auto mb-1" />
              Falta
            </button>
          </div>

          {/* Campo de observaciones */}
          {editMode && (
            <div className="mt-3">
              <textarea
                value={state.observaciones || ''}
                onChange={(e) => handleObservationChange(student.id, e.target.value)}
                placeholder="Observaciones..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-talentos-primary focus:border-transparent resize-none"
                rows="2"
              />
            </div>
          )}

          {/* Mostrar hora si existe */}
          {state.horaEntrada && (
            <div className="mt-2 text-xs text-gray-500">
              Entrada: {new Date(state.horaEntrada).toLocaleTimeString('es-PE')}
            </div>
          )}
        </div>
      </AnimatedCard>
    )
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
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
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/admin/attendance')}
              className="p-2 text-gray-600 hover:text-talentos-primary transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Registro Manual de Asistencia</h1>
              <p className="text-gray-600 mt-1">
                Registre la asistencia de los estudiantes manualmente
              </p>
            </div>
          </div>

          {/* Controles principales */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                <FiCalendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="text-sm font-medium text-gray-700 focus:outline-none"
                />
              </div>
              
              {/* Toggle vista */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-talentos-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-talentos-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {editMode ? (
                <>
                  <AnimatedButton
                    variant="outline"
                    onClick={() => {
                      setEditMode(false)
                      setModifiedStudents(new Set())
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </AnimatedButton>
                  <AnimatedButton
                    variant="primary"
                    icon={FiSave}
                    onClick={handleSaveAll}
                    disabled={saving || modifiedStudents.size === 0}
                  >
                    {saving ? 'Guardando...' : `Guardar (${modifiedStudents.size})`}
                  </AnimatedButton>
                </>
              ) : (
                <AnimatedButton
                  variant="primary"
                  icon={FiEdit}
                  onClick={() => setEditMode(true)}
                >
                  Editar Asistencia
                </AnimatedButton>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <AnimatedCard>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FiUsers className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Presentes</p>
                  <p className="text-2xl font-bold text-green-600">{stats.presentes}</p>
                </div>
                <FiCheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tardanzas</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.tardes}</p>
                </div>
                <FiClock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Faltas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.faltas}</p>
                </div>
                <FiXCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Filtros y búsqueda */}
        <AnimatedCard className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar estudiante..."
              className="w-full"
            />
            
            <FilterDropdown
              label="Grado"
              options={[
                { value: 'all', label: 'Todos los grados' },
                { value: '1°', label: '1° Primaria' },
                { value: '2°', label: '2° Primaria' },
                { value: '3°', label: '3° Primaria' },
                { value: '4°', label: '4° Primaria' },
                { value: '5°', label: '5° Primaria' },
                { value: '6°', label: '6° Primaria' }
              ]}
              selectedValue={selectedGrade}
              onSelect={setSelectedGrade}
            />
            
            <FilterDropdown
              label="Sección"
              options={[
                { value: 'all', label: 'Todas las secciones' },
                { value: 'A', label: 'Sección A' },
                { value: 'B', label: 'Sección B' },
                { value: 'C', label: 'Sección C' }
              ]}
              selectedValue={selectedSection}
              onSelect={setSelectedSection}
            />

            {editMode && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => showAlert(
                    'Acciones rápidas',
                    'Use estos botones para aplicar acciones masivas',
                    false
                  )}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FiInfo className="w-4 h-4" />
                </button>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleQuickAction('all-present')}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    title="Marcar todos como presentes"
                  >
                    Todos presentes
                  </button>
                  <button
                    onClick={() => handleQuickAction('all-absent')}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    title="Marcar todos como ausentes"
                  >
                    Todos ausentes
                  </button>
                </div>
              </div>
            )}
          </div>
        </AnimatedCard>

        {/* Lista de estudiantes */}
        {filteredStudents.length === 0 ? (
          <AnimatedCard>
            <div className="text-center py-12">
              <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron estudiantes
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          </AnimatedCard>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.map(student => renderStudentCard(student))}
          </div>
        ) : (
          <AnimatedCard>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const state = attendanceStates[student.id] || { estado: 'falta' }
                    const isModified = modifiedStudents.has(student.id)
                    
                    return (
                      <tr key={student.id} className={isModified ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={student.foto_url || `/avatar-student${(student.id % 6) + 1}.jpg`}
                              alt={student.nombreCompleto}
                              className="w-8 h-8 rounded-full object-cover mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.nombreCompleto}
                              </div>
                              {student.codigo && (
                                <div className="text-xs text-gray-500">
                                  {student.codigo}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.grado} {student.seccion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editMode ? (
                            <div className="flex justify-center space-x-1">
                              <button
                                onClick={() => handleStateChange(student.id, 'presente')}
                                className={`p-1 rounded ${
                                  state.estado === 'presente'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                                }`}
                              >
                                <FiCheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStateChange(student.id, 'tarde')}
                                className={`p-1 rounded ${
                                  state.estado === 'tarde'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'
                                }`}
                              >
                                <FiClock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStateChange(student.id, 'falta')}
                                className={`p-1 rounded ${
                                  state.estado === 'falta'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                                }`}
                              >
                                <FiXCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                state.estado === 'presente'
                                  ? 'bg-green-100 text-green-800'
                                  : state.estado === 'tarde'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {state.estado.charAt(0).toUpperCase() + state.estado.slice(1)}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editMode ? (
                            <input
                              type="text"
                              value={state.observaciones || ''}
                              onChange={(e) => handleObservationChange(student.id, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-talentos-primary"
                              placeholder="..."
                            />
                          ) : (
                            <span className="text-sm text-gray-600">
                              {state.observaciones || '-'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </AnimatedCard>
        )}

        {/* Información adicional */}
        {editMode && modifiedStudents.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm"
          >
            <div className="flex items-center space-x-3">
              <FiAlertCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium text-gray-900">
                  {modifiedStudents.size} cambio{modifiedStudents.size !== 1 ? 's' : ''} sin guardar
                </p>
                <p className="text-sm text-gray-600">
                  Presiona "Guardar" para aplicar los cambios
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default AttendanceRegister