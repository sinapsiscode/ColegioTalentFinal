import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiBookOpen,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiEye,
  FiClock,
  FiUserCheck,
  FiActivity,
  FiBarChart2,
  FiChevronRight
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageTransition from '../../components/common/PageTransition'
import SearchInput from '../../components/common/SearchInput'
import AnimatedCard from '../../components/common/AnimatedCard'
import getDatabase from '../../data/DatabaseManager'
import useAuthStore from '../../stores/authStore'
import { showError } from '../../utils/sweetAlert'

const MySections = () => {
  const [loading, setLoading] = useState(true)
  const [sections, setSections] = useState([])
  const [filteredSections, setFilteredSections] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState(null)
  const [sectionStudents, setSectionStudents] = useState([])
  const [viewMode, setViewMode] = useState('cards') // cards, detail
  
  const { usuario } = useAuthStore()

  useEffect(() => {
    loadTutorSections()
  }, [usuario])

  useEffect(() => {
    applyFilters()
  }, [sections, searchTerm])

  const loadTutorSections = async () => {
    setLoading(true)
    try {
      const db = getDatabase()
      const allSections = db.select('sections') || []
      const students = db.select('students') || []
      
      // Filtrar solo las secciones donde el tutor es el usuario actual
      const tutorSections = allSections.filter(section => 
        section.tutorId === usuario.id
      )
      
      // Enriquecer con conteo de estudiantes
      const enrichedSections = tutorSections.map(section => {
        const sectionStudents = students.filter(student => 
          student.seccionId === section.id
        )
        
        return {
          ...section,
          estudiantesCount: sectionStudents.length,
          estudiantesPresentes: 0, // Esto se actualizaría en tiempo real
          proximaClase: getNextClass(section) // Función helper para obtener próxima clase
        }
      })
      
      setSections(enrichedSections)
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
        section.aula.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredSections(filtered)
  }

  const loadSectionStudents = async (sectionId) => {
    try {
      const db = getDatabase()
      const students = db.select('students') || []
      const sectionStudentsList = students.filter(student => 
        student.seccionId === sectionId
      )
      
      setSectionStudents(sectionStudentsList)
    } catch (error) {
      console.error('Error cargando estudiantes:', error)
      showError('Error', 'No se pudieron cargar los estudiantes')
    }
  }

  const handleViewSection = async (section) => {
    setSelectedSection(section)
    await loadSectionStudents(section.id)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('cards')
    setSelectedSection(null)
    setSectionStudents([])
  }

  const getNextClass = (section) => {
    // Helper function para obtener la próxima clase de la sección
    // En una implementación real, esto consultaría el horario
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
    const randomDay = days[Math.floor(Math.random() * days.length)]
    const randomHour = 8 + Math.floor(Math.random() * 6)
    return `${randomDay} ${randomHour}:00`
  }

  const getStats = () => {
    return {
      totalSections: sections.length,
      totalStudents: sections.reduce((sum, s) => sum + s.estudiantesCount, 0),
      avgStudents: sections.length > 0 
        ? Math.round(sections.reduce((sum, s) => sum + s.estudiantesCount, 0) / sections.length)
        : 0,
      totalCapacity: sections.reduce((sum, s) => sum + s.capacidad, 0)
    }
  }

  const stats = getStats()

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50">
          <Header title="Mis Secciones" usuario={usuario} />
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
        <Header title="Mis Secciones" usuario={usuario} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {viewMode === 'cards' ? (
              <motion.div
                key="cards"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <AnimatedCard>
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiBookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Mis Secciones</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalSections}</p>
                      </div>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard delay={0.1}>
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FiUsers className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                      </div>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard delay={0.2}>
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FiBarChart2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Promedio por Sección</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.avgStudents}</p>
                      </div>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard delay={0.3}>
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FiActivity className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Capacidad Total</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.totalCapacity}</p>
                      </div>
                    </div>
                  </AnimatedCard>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                  <div className="p-6">
                    <div className="max-w-md">
                      <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onClear={() => setSearchTerm('')}
                        placeholder="Buscar secciones..."
                      />
                    </div>
                  </div>
                </div>

                {/* Sections Grid */}
                {filteredSections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSections.map((section, index) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200"
                      >
                        {/* Header con gradiente */}
                        <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary p-4">
                          <h3 className="text-lg font-semibold text-white">
                            {section.nombre}
                          </h3>
                          <p className="text-talentos-accent/80 text-sm">
                            {section.grado}
                          </p>
                        </div>

                        {/* Contenido */}
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                              <span>Aula {section.aula}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <FiUsers className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{section.estudiantesCount}/{section.capacidad}</span>
                            </div>
                          </div>

                          {section.proximaClase && (
                            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                              <FiClock className="w-4 h-4 mr-2 text-blue-500" />
                              <span>Próxima clase: {section.proximaClase}</span>
                            </div>
                          )}

                          <div className="pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleViewSection(section)}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-talentos-primary text-white rounded-lg hover:bg-talentos-secondary transition-colors"
                            >
                              <FiEye className="w-4 h-4" />
                              <span>Ver Detalles</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FiBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes secciones asignadas
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm 
                        ? 'No se encontraron secciones con los criterios de búsqueda'
                        : 'El administrador debe asignarte como tutor de una sección'}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              // Vista de detalle
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {selectedSection && (
                  <>
                    {/* Back button */}
                    <button
                      onClick={handleBackToList}
                      className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <FiChevronRight className="w-5 h-5 transform rotate-180 mr-1" />
                      <span>Volver a mis secciones</span>
                    </button>

                    {/* Section Detail Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                      <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary p-6">
                        <h2 className="text-2xl font-bold text-white mb-2">
                          {selectedSection.nombre}
                        </h2>
                        <p className="text-talentos-accent/90">
                          {selectedSection.grado} - Aula {selectedSection.aula}
                        </p>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Estudiantes</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                  {selectedSection.estudiantesCount}
                                </p>
                              </div>
                              <FiUsers className="w-8 h-8 text-blue-500" />
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Presentes Hoy</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                  {selectedSection.estudiantesPresentes}
                                </p>
                              </div>
                              <FiUserCheck className="w-8 h-8 text-green-500" />
                            </div>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Capacidad</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                  {selectedSection.capacidad}
                                </p>
                              </div>
                              <FiActivity className="w-8 h-8 text-purple-500" />
                            </div>
                          </div>
                        </div>

                        {/* Lista de estudiantes */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Lista de Estudiantes
                        </h3>
                        
                        {sectionStudents.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Código
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Nombre
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Estado
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {sectionStudents.map((student) => (
                                  <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {student.codigo}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {student.nombre} {student.apellidos}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        Activo
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">
                              No hay estudiantes asignados a esta sección
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}

export default MySections