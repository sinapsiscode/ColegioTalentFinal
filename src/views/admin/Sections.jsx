import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUsers,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiBookOpen,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiMoreVertical,
  FiEye,
  FiUserPlus,
  FiX
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import AnimatedButton from '../../components/common/AnimatedButton'
import PageTransition from '../../components/common/PageTransition'
import SectionModal from '../../components/admin/SectionModal'
import SearchInput from '../../components/common/SearchInput'
import FilterDropdown from '../../components/common/FilterDropdown'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'
import getDatabase from '../../data/DatabaseManager'
import useAuthStore from '../../stores/authStore'

const Sections = () => {
  const [loading, setLoading] = useState(true)
  const [sections, setSections] = useState([])
  const [filteredSections, setFilteredSections] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedSections, setSelectedSections] = useState([])

  const { usuario } = useAuthStore()

  // Cargar datos iniciales
  useEffect(() => {
    loadSections()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [sections, searchTerm, gradeFilter])

  const loadSections = async () => {
    setLoading(true)
    try {
      const db = getDatabase()
      const sectionsData = db.select('sections') || []
      setSections(sectionsData)
    } catch (error) {
      console.error('Error cargando secciones:', error)
      showError('Error', 'No se pudieron cargar las secciones')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...sections]

    if (searchTerm) {
      filtered = filtered.filter(section => 
        section.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.grado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.aula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (section.tutor && section.tutor.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(section => section.grado === gradeFilter)
    }

    setFilteredSections(filtered)
  }

  const handleCreateSection = () => {
    setEditingSection(null)
    setShowSectionModal(true)
  }

  const handleEditSection = (section) => {
    setEditingSection(section)
    setShowSectionModal(true)
  }

  const handleSaveSection = async (sectionData) => {
    try {
      const db = getDatabase()
      
      if (editingSection) {
        // Actualizar sección existente
        db.update('sections', record => record.id === editingSection.id, sectionData)
      } else {
        // Crear nueva sección
        const newSection = {
          ...sectionData,
          id: Date.now(),
          fechaCreacion: new Date().toISOString(),
          estudiantesCount: 0,
          estado: 'activa'
        }
        db.insert('sections', newSection)
      }
      
      await loadSections()
      setShowSectionModal(false)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteSection = async (section) => {
    const confirmed = await showConfirm(
      'Eliminar Sección',
      `¿Estás seguro de que quieres eliminar la sección ${section.nombre}? Esta acción no se puede deshacer.`,
      'warning'
    )

    if (confirmed.isConfirmed) {
      try {
        const db = getDatabase()
        db.delete('sections', record => record.id === section.id)
        await loadSections()
        showSuccess('Sección eliminada', 'La sección ha sido eliminada correctamente')
      } catch (error) {
        showError('Error', 'No se pudo eliminar la sección')
      }
    }
  }

  const handleSelectSection = (sectionId) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId)
      } else {
        return [...prev, sectionId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedSections.length === filteredSections.length) {
      setSelectedSections([])
    } else {
      setSelectedSections(filteredSections.map(s => s.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedSections.length === 0) return

    const confirmed = await showConfirm(
      'Eliminar Secciones',
      `¿Estás seguro de que quieres eliminar ${selectedSections.length} sección(es)? Esta acción no se puede deshacer.`,
      'warning'
    )

    if (confirmed.isConfirmed) {
      try {
        const db = getDatabase()
        selectedSections.forEach(sectionId => {
          db.delete('sections', record => record.id === sectionId)
        })
        await loadSections()
        setSelectedSections([])
        showSuccess('Secciones eliminadas', `${selectedSections.length} sección(es) eliminada(s) correctamente`)
      } catch (error) {
        showError('Error', 'No se pudieron eliminar las secciones')
      }
    }
  }

  // Obtener opciones únicas de grado para el filtro
  const gradeOptions = [
    { value: 'all', label: 'Todos los grados' },
    ...Array.from(new Set(sections.map(s => s.grado))).map(grade => ({
      value: grade,
      label: grade
    }))
  ]

  const getStats = () => {
    const totalSections = sections.length
    const totalStudents = sections.reduce((sum, section) => sum + (section.estudiantesCount || 0), 0)
    const avgCapacity = sections.length > 0 ? 
      (sections.reduce((sum, section) => sum + section.capacidad, 0) / sections.length).toFixed(1) : 0
    const withTutor = sections.filter(s => s.tutor).length

    return { totalSections, totalStudents, avgCapacity, withTutor }
  }

  const stats = getStats()

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50">
          <Header title="Gestión de Secciones" usuario={usuario} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="xl" />
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Header title="Gestión de Secciones" usuario={usuario} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiBookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Secciones</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalSections}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Capacidad Promedio</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.avgCapacity}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiUser className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Con Tutor</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.withTutor}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Secciones</h2>
                  <p className="text-sm text-gray-600">Gestiona las secciones y aulas del colegio</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <AnimatedButton
                    variant="primary"
                    icon={FiPlus}
                    onClick={handleCreateSection}
                  >
                    <span className="hidden sm:inline">Nueva Sección</span>
                    <span className="sm:hidden">Nueva</span>
                  </AnimatedButton>
                </div>
              </div>

              {/* Filters */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClear={() => setSearchTerm('')}
                  placeholder="Buscar secciones..."
                />
                
                <FilterDropdown
                  label="Filtrar por grado"
                  options={gradeOptions}
                  selectedValue={gradeFilter}
                  onSelect={setGradeFilter}
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {filteredSections.length} de {sections.length} secciones
                  </span>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
                      title="Vista cuadrícula"
                    >
                      <FiGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
                      title="Vista lista"
                    >
                      <FiList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedSections.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between"
                >
                  <span className="text-sm text-blue-700">
                    {selectedSections.length} sección(es) seleccionada(s)
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => setSelectedSections([])}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredSections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200"
                    >
                      {/* Card Header */}
                      <div className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <input
                            type="checkbox"
                            checked={selectedSections.includes(section.id)}
                            onChange={() => handleSelectSection(section.id)}
                            className="rounded text-talentos-primary focus:ring-talentos-primary mt-1"
                          />
                          <div className="relative">
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Section Info */}
                      <div className="px-4 pb-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-3">
                          <FiBookOpen className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {section.nombre}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {section.grado}
                        </p>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center justify-center space-x-1">
                            <FiMapPin className="w-3 h-3" />
                            <span>Aula {section.aula}</span>
                          </div>
                          <div className="flex items-center justify-center space-x-1">
                            <FiUsers className="w-3 h-3" />
                            <span>{section.estudiantesCount || 0}/{section.capacidad} estudiantes</span>
                          </div>
                          {section.tutor && (
                            <div className="flex items-center justify-center space-x-1">
                              <FiUser className="w-3 h-3" />
                              <span className="truncate">{section.tutor}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Card Actions */}
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditSection(section)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-600 hover:text-green-600 transition-colors"
                          title="Ver estudiantes"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-600 hover:text-purple-600 transition-colors"
                          title="Asignar estudiantes"
                        >
                          <FiUserPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section)}
                          className="p-1.5 text-gray-600 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // List View
                <div className="overflow-hidden">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-12 px-2 py-3">
                          <input
                            type="checkbox"
                            checked={selectedSections.length === filteredSections.length && filteredSections.length > 0}
                            onChange={handleSelectAll}
                            className="rounded text-talentos-primary focus:ring-talentos-primary"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sección
                        </th>
                        <th className="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                          Aula
                        </th>
                        <th className="w-32 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                          Estudiantes
                        </th>
                        <th className="w-32 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                          Tutor
                        </th>
                        <th className="w-24 px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSections.map((section, index) => (
                        <motion.tr
                          key={section.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="w-12 px-2 py-4">
                            <input
                              type="checkbox"
                              checked={selectedSections.includes(section.id)}
                              onChange={() => handleSelectSection(section.id)}
                              className="rounded text-talentos-primary focus:ring-talentos-primary"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center min-w-0">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                  <FiBookOpen className="w-4 h-4 text-white" />
                                </div>
                              </div>
                              <div className="ml-3 min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {section.nombre}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {section.grado}
                                </div>
                                {/* Info móvil */}
                                <div className="sm:hidden mt-1 space-y-1">
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Aula {section.aula}</span>
                                    <span>{section.estudiantesCount || 0}/{section.capacidad}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="w-24 px-2 py-4 text-sm text-gray-900 hidden sm:table-cell">
                            {section.aula}
                          </td>
                          <td className="w-32 px-2 py-4 text-sm text-gray-900 hidden md:table-cell">
                            <div className="flex items-center space-x-1">
                              <FiUsers className="w-3 h-3 text-gray-400" />
                              <span>{section.estudiantesCount || 0}/{section.capacidad}</span>
                            </div>
                          </td>
                          <td className="w-32 px-2 py-4 text-sm text-gray-900 hidden lg:table-cell">
                            {section.tutor ? (
                              <span className="truncate">{section.tutor}</span>
                            ) : (
                              <span className="text-gray-400">Sin asignar</span>
                            )}
                          </td>
                          <td className="w-24 px-2 py-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => handleEditSection(section)}
                                className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Editar"
                              >
                                <FiEdit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSection(section)}
                                className="p-1.5 text-gray-600 hover:text-red-600 transition-colors hidden sm:inline-block"
                                title="Eliminar"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {filteredSections.length === 0 && (
                <div className="text-center py-12">
                  <FiBookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron secciones
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || gradeFilter !== 'all'
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Comienza creando la primera sección'
                    }
                  </p>
                  {(!searchTerm && gradeFilter === 'all') && (
                    <AnimatedButton
                      variant="primary"
                      icon={FiPlus}
                      onClick={handleCreateSection}
                    >
                      Crear primera sección
                    </AnimatedButton>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showSectionModal && (
            <SectionModal
              isOpen={showSectionModal}
              onClose={() => setShowSectionModal(false)}
              section={editingSection}
              onSave={handleSaveSection}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default Sections