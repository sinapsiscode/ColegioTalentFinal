import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList,
  FiUpload,
  FiPlus,
  FiUser,
  FiX
} from 'react-icons/fi'
import Header from '../../components/common/Header'
import useStudentsStore from '../../stores/studentsStore'
import useTutorStore from '../../stores/tutorStore'
import useAuthStore from '../../stores/authStore'
import { fadeInUp, staggerContainer, staggerItem } from '../../utils/animations'

const TutorStudents = () => {
  const [viewMode, setViewMode] = useState('grid') // 'grid' o 'list'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [sortBy, setSortBy] = useState('nombre')
  const [showImportModal, setShowImportModal] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  const { usuario } = useAuthStore()
  const { alumnos, cargarAlumnos, buscarAlumnos } = useStudentsStore()
  const { clase } = useTutorStore()
  
  // Cargar alumnos al montar el componente
  useEffect(() => {
    cargarAlumnos()
  }, [])
  
  // Filtrar estudiantes según la búsqueda y filtros
  const filteredStudents = (alumnos || []).filter(alumno => {
    // Filtro por búsqueda
    const matchesSearch = searchTerm === '' || 
      alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.grado.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Por ahora todos están activos ya que no hay campo estado en el modelo
    const matchesStatus = filterStatus === 'todos' || filterStatus === 'activos'
    
    return matchesSearch && matchesStatus
  })
  
  // Calcular promedio de notas para cada alumno
  const getPromedio = (alumno) => {
    if (!alumno.notas || alumno.notas.length === 0) return 0
    const suma = alumno.notas.reduce((acc, nota) => acc + nota.nota, 0)
    return suma / alumno.notas.length
  }
  
  // Ordenar estudiantes
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'nombre':
        return a.nombre.localeCompare(b.nombre)
      case 'promedio':
        return getPromedio(b) - getPromedio(a)
      case 'grado':
        return a.grado.localeCompare(b.grado)
      default:
        return 0
    }
  })
  
  const handleFileUpload = (file) => {
    if (!file) return
    
    // Validar que sea un archivo Excel
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    
    if (!validTypes.includes(file.type)) {
      alert('Por favor selecciona un archivo Excel (.xlsx o .xls)')
      return
    }
    
    // Aquí procesarías el archivo Excel
    console.log('Archivo seleccionado:', file.name)
    
    // Simular procesamiento
    setTimeout(() => {
      alert(`Archivo "${file.name}" importado correctamente`)
      setShowImportModal(false)
    }, 1500)
  }
  
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }
  
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }
  
  const stats = {
    total: sortedStudents.length,
    activos: sortedStudents.length, // Todos están activos por defecto
    excelentes: sortedStudents.filter(s => getPromedio(s) >= 17).length,
    porDesaprobar: sortedStudents.filter(s => getPromedio(s) < 11).length,
    intermedio: sortedStudents.filter(s => getPromedio(s) >= 11 && getPromedio(s) < 17).length
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <motion.div
        {...fadeInUp}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Alumnos</h1>
        <p className="text-gray-600 mt-1">
          {clase ? `Clase: ${clase.nombre} - ${clase.grado}` : 'Todos los alumnos'}
        </p>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <motion.div
          {...staggerItem}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-500">Total Alumnos</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </motion.div>
        
        <motion.div
          {...staggerItem}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-500">Activos</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.activos}</p>
        </motion.div>
        
        <motion.div
          {...staggerItem}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-500">Estudiantes Excelentes</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.excelentes}</p>
        </motion.div>
        
        <motion.div
          {...staggerItem}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-500">Estudiantes Intermedio</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.intermedio}</p>
        </motion.div>
        
        <motion.div
          {...staggerItem}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-500">Estudiantes Desaprobados</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.porDesaprobar}</p>
        </motion.div>
      </div>
      
      {/* Controles */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-2">
            {/* Filtro por estado */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="necesita_atencion">Necesitan atención</option>
              <option value="inactivos">Inactivos</option>
            </select>
            
            {/* Ordenar por */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-talentos-primary focus:border-transparent"
            >
              <option value="nombre">Ordenar por nombre</option>
              <option value="promedio">Ordenar por promedio</option>
              <option value="grado">Ordenar por grado</option>
            </select>
            
            {/* Vista */}
            <div className="flex bg-gray-100 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-md transition-colors ${
                  viewMode === 'grid' ? 'bg-talentos-primary text-white' : 'text-gray-600'
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-md transition-colors ${
                  viewMode === 'list' ? 'bg-talentos-primary text-white' : 'text-gray-600'
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
            
            {/* Importar Alumnos */}
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              title="Importar alumnos desde Excel"
            >
              <FiUpload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar Alumnos</span>
              <span className="sm:hidden">Excel</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Lista de estudiantes */}
      {sortedStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No se encontraron estudiantes con los filtros aplicados.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStudents.map((alumno) => (
            <motion.div
              key={alumno.id}
              {...staggerItem}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-talentos-primary rounded-full flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {alumno.nombre} {alumno.apellidos}
                  </h3>
                  <p className="text-sm text-gray-500">{alumno.grado} - Sección {alumno.seccion}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Promedio:</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    getPromedio(alumno) >= 17 ? 'bg-green-100 text-green-800' :
                    getPromedio(alumno) >= 14 ? 'bg-blue-100 text-blue-800' :
                    getPromedio(alumno) >= 11 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getPromedio(alumno).toFixed(1)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Padre/Tutor:</span>
                  <span className="text-sm font-medium text-gray-900">{alumno.padre}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Teléfono:</span>
                  <span className="text-sm text-gray-600">{alumno.telefono}</span>
                </div>
                
                {alumno.notas && alumno.notas.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Últimas notas:</h4>
                    <div className="space-y-1">
                      {alumno.notas.slice(0, 3).map((nota, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-600">{nota.materia}:</span>
                          <span className={`font-medium ${
                            nota.nota >= 17 ? 'text-green-600' :
                            nota.nota >= 14 ? 'text-blue-600' :
                            nota.nota >= 11 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {nota.nota}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Padre/Tutor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStudents.map((alumno) => (
                <tr key={alumno.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {alumno.nombre} {alumno.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">Sección {alumno.seccion}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{alumno.grado}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      getPromedio(alumno) >= 17 ? 'text-green-600' :
                      getPromedio(alumno) >= 14 ? 'text-blue-600' :
                      getPromedio(alumno) >= 11 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {getPromedio(alumno).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{alumno.padre}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{alumno.telefono}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </motion.div>
      
      {/* Modal de importación */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Importar Lista de Alumnos</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">
                  Sube tu archivo Excel con la lista de alumnos
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Arrastra el archivo aquí o haz clic para seleccionar
                </p>
                
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <FiUpload className="w-4 h-4 mr-2" />
                  Seleccionar Excel de Alumnos
                </label>
                
                <div className="text-xs text-gray-500 mt-4 space-y-1">
                  <p>Formatos soportados: .xlsx, .xls</p>
                  <p>El archivo debe contener: Nombre, Apellidos, Grado, Sección</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TutorStudents