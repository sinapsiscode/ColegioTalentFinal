import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiBook, 
  FiHome,
  FiUser,
  FiUserCheck,
  FiSave,
  FiX
} from 'react-icons/fi'
import { showSuccess, showError, showConfirm } from '../../utils/sweetAlert'
import { Button, Card, Modal, Input, Table } from '../ui'

const CourseAssignmentManager = () => {
  const [activeTab, setActiveTab] = useState('secciones')
  
  // Estados principales
  const [secciones, setSecciones] = useState([])
  const [cursos, setCursos] = useState([])
  const [profesores, setProfesores] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  
  // Estados de modales
  const [showSeccionModal, setShowSeccionModal] = useState(false)
  const [showCursoModal, setShowCursoModal] = useState(false)
  const [showProfesorModal, setShowProfesorModal] = useState(false)
  const [showAsignacionModal, setShowAsignacionModal] = useState(false)
  
  // Estados de edición
  const [seccionEditando, setSeccionEditando] = useState(null)
  const [cursoEditando, setCursoEditando] = useState(null)
  const [profesorEditando, setProfesorEditando] = useState(null)
  const [asignacionEditando, setAsignacionEditando] = useState(null)

  // Estados de formularios
  const [formSeccion, setFormSeccion] = useState({
    nombre: '',
    grado: '',
    aula: '',
    capacidad: 25
  })

  const [formCurso, setFormCurso] = useState({
    nombre: '',
    descripcion: '',
    color: '#3B82F6'
  })

  const [formProfesor, setFormProfesor] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    especialidad: ''
  })

  const [formAsignacion, setFormAsignacion] = useState({
    profesorId: '',
    cursoId: '',
    seccionId: ''
  })

  // Grados de primaria
  const grados = ['1°', '2°', '3°', '4°', '5°', '6°']

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = () => {
    // Secciones iniciales
    const seccionesIniciales = [
      { id: 1, nombre: 'Sección A', grado: '1°', aula: 'Aula 101', capacidad: 25 },
      { id: 2, nombre: 'Sección B', grado: '1°', aula: 'Aula 102', capacidad: 25 },
      { id: 3, nombre: 'Sección A', grado: '2°', aula: 'Aula 201', capacidad: 28 },
      { id: 4, nombre: 'Sección A', grado: '3°', aula: 'Aula 301', capacidad: 30 },
      { id: 5, nombre: 'Sección A', grado: '4°', aula: 'Aula 401', capacidad: 30 },
      { id: 6, nombre: 'Sección A', grado: '5°', aula: 'Aula 501', capacidad: 32 },
      { id: 7, nombre: 'Sección A', grado: '6°', aula: 'Aula 601', capacidad: 32 }
    ]

    // Cursos de primaria
    const cursosIniciales = [
      { id: 1, nombre: 'Matemáticas', descripcion: 'Aritmética y resolución de problemas', color: '#3B82F6' },
      { id: 2, nombre: 'Comunicación', descripcion: 'Lenguaje, lectura y escritura', color: '#10B981' },
      { id: 3, nombre: 'Ciencia y Tecnología', descripcion: 'Ciencias naturales y experimentos', color: '#F59E0B' },
      { id: 4, nombre: 'Personal Social', descripcion: 'Historia, geografía y ciudadanía', color: '#EF4444' },
      { id: 5, nombre: 'Arte y Cultura', descripcion: 'Expresión artística y cultural', color: '#8B5CF6' },
      { id: 6, nombre: 'Educación Física', descripcion: 'Deportes y actividad física', color: '#06B6D4' },
      { id: 7, nombre: 'Educación Religiosa', descripcion: 'Valores y espiritualidad', color: '#84CC16' },
      { id: 8, nombre: 'Inglés', descripcion: 'Idioma extranjero', color: '#F97316' }
    ]

    // Profesores iniciales
    const profesoresIniciales = [
      { id: 1, nombre: 'María', apellidos: 'García López', email: 'maria.garcia@colegio.edu', telefono: '987654321', especialidad: 'Matemáticas' },
      { id: 2, nombre: 'José', apellidos: 'Rodríguez Silva', email: 'jose.rodriguez@colegio.edu', telefono: '987654322', especialidad: 'Comunicación' },
      { id: 3, nombre: 'Ana', apellidos: 'Martínez Ruiz', email: 'ana.martinez@colegio.edu', telefono: '987654323', especialidad: 'Ciencias' },
      { id: 4, nombre: 'Carlos', apellidos: 'López Díaz', email: 'carlos.lopez@colegio.edu', telefono: '987654324', especialidad: 'Personal Social' },
      { id: 5, nombre: 'Patricia', apellidos: 'Herrera Castro', email: 'patricia.herrera@colegio.edu', telefono: '987654325', especialidad: 'Arte' }
    ]

    // Asignaciones iniciales
    const asignacionesIniciales = [
      { id: 1, profesorId: 1, cursoId: 1, seccionId: 6 }, // María - Matemáticas - 5° A
      { id: 2, profesorId: 2, cursoId: 2, seccionId: 4 }, // José - Comunicación - 3° A
      { id: 3, profesorId: 3, cursoId: 3, seccionId: 5 }  // Ana - Ciencias - 4° A
    ]

    setSecciones(seccionesIniciales)
    setCursos(cursosIniciales)
    setProfesores(profesoresIniciales)
    setAsignaciones(asignacionesIniciales)
  }

  // Funciones de reset
  const resetFormSeccion = () => {
    setFormSeccion({ nombre: '', grado: '', aula: '', capacidad: 25 })
    setSeccionEditando(null)
  }

  const resetFormCurso = () => {
    setFormCurso({ nombre: '', descripcion: '', color: '#3B82F6' })
    setCursoEditando(null)
  }

  const resetFormProfesor = () => {
    setFormProfesor({ nombre: '', apellidos: '', email: '', telefono: '', especialidad: '' })
    setProfesorEditando(null)
  }

  const resetFormAsignacion = () => {
    setFormAsignacion({ profesorId: '', cursoId: '', seccionId: '' })
    setAsignacionEditando(null)
  }

  // CRUD Secciones
  const handleSaveSeccion = (e) => {
    e.preventDefault()
    
    if (!formSeccion.nombre.trim() || !formSeccion.grado || !formSeccion.aula.trim()) {
      showError('Error', 'Todos los campos son obligatorios')
      return
    }

    if (seccionEditando) {
      setSecciones(prev => prev.map(seccion => 
        seccion.id === seccionEditando.id ? { ...seccion, ...formSeccion } : seccion
      ))
      showSuccess('Éxito', 'Sección actualizada correctamente')
    } else {
      const nuevaSeccion = {
        id: Math.max(...secciones.map(s => s.id), 0) + 1,
        ...formSeccion
      }
      setSecciones(prev => [...prev, nuevaSeccion])
      showSuccess('Éxito', 'Sección creada correctamente')
    }

    setShowSeccionModal(false)
    resetFormSeccion()
  }

  const handleEditSeccion = (seccion) => {
    setSeccionEditando(seccion)
    setFormSeccion(seccion)
    setShowSeccionModal(true)
  }

  const handleDeleteSeccion = async (seccion) => {
    const result = await showConfirm('¿Eliminar sección?', `Se eliminará "${seccion.nombre} - ${seccion.grado}"`)
    if (result.isConfirmed) {
      setSecciones(prev => prev.filter(s => s.id !== seccion.id))
      setAsignaciones(prev => prev.filter(a => a.seccionId !== seccion.id))
      showSuccess('Eliminado', 'Sección eliminada correctamente')
    }
  }

  // CRUD Cursos
  const handleSaveCurso = (e) => {
    e.preventDefault()
    
    if (!formCurso.nombre.trim()) {
      showError('Error', 'El nombre del curso es obligatorio')
      return
    }

    if (cursoEditando) {
      setCursos(prev => prev.map(curso => 
        curso.id === cursoEditando.id ? { ...curso, ...formCurso } : curso
      ))
      showSuccess('Éxito', 'Curso actualizado correctamente')
    } else {
      const nuevoCurso = {
        id: Math.max(...cursos.map(c => c.id), 0) + 1,
        ...formCurso
      }
      setCursos(prev => [...prev, nuevoCurso])
      showSuccess('Éxito', 'Curso creado correctamente')
    }

    setShowCursoModal(false)
    resetFormCurso()
  }

  const handleEditCurso = (curso) => {
    setCursoEditando(curso)
    setFormCurso(curso)
    setShowCursoModal(true)
  }

  const handleDeleteCurso = async (curso) => {
    const result = await showConfirm('¿Eliminar curso?', `Se eliminará "${curso.nombre}"`)
    if (result.isConfirmed) {
      setCursos(prev => prev.filter(c => c.id !== curso.id))
      setAsignaciones(prev => prev.filter(a => a.cursoId !== curso.id))
      showSuccess('Eliminado', 'Curso eliminado correctamente')
    }
  }

  // CRUD Profesores
  const handleSaveProfesor = (e) => {
    e.preventDefault()
    
    if (!formProfesor.nombre.trim() || !formProfesor.apellidos.trim() || !formProfesor.email.trim()) {
      showError('Error', 'Nombre, apellidos y email son obligatorios')
      return
    }

    if (profesorEditando) {
      setProfesores(prev => prev.map(profesor => 
        profesor.id === profesorEditando.id ? { ...profesor, ...formProfesor } : profesor
      ))
      showSuccess('Éxito', 'Profesor actualizado correctamente')
    } else {
      const nuevoProfesor = {
        id: Math.max(...profesores.map(p => p.id), 0) + 1,
        ...formProfesor
      }
      setProfesores(prev => [...prev, nuevoProfesor])
      showSuccess('Éxito', 'Profesor creado correctamente')
    }

    setShowProfesorModal(false)
    resetFormProfesor()
  }

  const handleEditProfesor = (profesor) => {
    setProfesorEditando(profesor)
    setFormProfesor(profesor)
    setShowProfesorModal(true)
  }

  const handleDeleteProfesor = async (profesor) => {
    const result = await showConfirm('¿Eliminar profesor?', `Se eliminará "${profesor.nombre} ${profesor.apellidos}"`)
    if (result.isConfirmed) {
      setProfesores(prev => prev.filter(p => p.id !== profesor.id))
      setAsignaciones(prev => prev.filter(a => a.profesorId !== profesor.id))
      showSuccess('Eliminado', 'Profesor eliminado correctamente')
    }
  }

  // CRUD Asignaciones
  const handleSaveAsignacion = (e) => {
    e.preventDefault()
    
    if (!formAsignacion.profesorId || !formAsignacion.cursoId || !formAsignacion.seccionId) {
      showError('Error', 'Todos los campos son obligatorios')
      return
    }

    // Verificar si ya existe la asignación
    const existeAsignacion = asignaciones.some(a => 
      a.profesorId === parseInt(formAsignacion.profesorId) && 
      a.cursoId === parseInt(formAsignacion.cursoId) && 
      a.seccionId === parseInt(formAsignacion.seccionId) &&
      (!asignacionEditando || a.id !== asignacionEditando.id)
    )

    if (existeAsignacion) {
      showError('Error', 'Esta asignación ya existe')
      return
    }

    if (asignacionEditando) {
      setAsignaciones(prev => prev.map(asig => 
        asig.id === asignacionEditando.id ? { 
          ...asig, 
          profesorId: parseInt(formAsignacion.profesorId),
          cursoId: parseInt(formAsignacion.cursoId),
          seccionId: parseInt(formAsignacion.seccionId)
        } : asig
      ))
      showSuccess('Éxito', 'Asignación actualizada correctamente')
    } else {
      const nuevaAsignacion = {
        id: Math.max(...asignaciones.map(a => a.id), 0) + 1,
        profesorId: parseInt(formAsignacion.profesorId),
        cursoId: parseInt(formAsignacion.cursoId),
        seccionId: parseInt(formAsignacion.seccionId)
      }
      setAsignaciones(prev => [...prev, nuevaAsignacion])
      showSuccess('Éxito', 'Asignación creada correctamente')
    }

    setShowAsignacionModal(false)
    resetFormAsignacion()
  }

  const handleEditAsignacion = (asignacion) => {
    setAsignacionEditando(asignacion)
    setFormAsignacion({
      profesorId: asignacion.profesorId.toString(),
      cursoId: asignacion.cursoId.toString(),
      seccionId: asignacion.seccionId.toString()
    })
    setShowAsignacionModal(true)
  }

  const handleDeleteAsignacion = async (asignacion) => {
    const profesor = profesores.find(p => p.id === asignacion.profesorId)
    const curso = cursos.find(c => c.id === asignacion.cursoId)
    const seccion = secciones.find(s => s.id === asignacion.seccionId)
    
    const result = await showConfirm(
      '¿Eliminar asignación?', 
      `Se eliminará la asignación de ${profesor?.nombre} en ${curso?.nombre} para ${seccion?.grado} ${seccion?.nombre}`
    )
    
    if (result.isConfirmed) {
      setAsignaciones(prev => prev.filter(a => a.id !== asignacion.id))
      showSuccess('Eliminado', 'Asignación eliminada correctamente')
    }
  }

  // Funciones auxiliares
  const getProfesorNombre = (profesorId) => {
    const profesor = profesores.find(p => p.id === profesorId)
    return profesor ? `${profesor.nombre} ${profesor.apellidos}` : 'Profesor no encontrado'
  }

  const getCursoNombre = (cursoId) => {
    const curso = cursos.find(c => c.id === cursoId)
    return curso ? curso.nombre : 'Curso no encontrado'
  }

  const getSeccionNombre = (seccionId) => {
    const seccion = secciones.find(s => s.id === seccionId)
    return seccion ? `${seccion.grado} ${seccion.nombre}` : 'Sección no encontrada'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión Académica</h1>
        <p className="text-gray-600">Administra secciones, cursos, profesores y sus asignaciones</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('secciones')}
          className={`flex-1 px-5 py-3 text-base rounded-md font-medium transition-colors ${
            activeTab === 'secciones'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiHome className="inline-block mr-2" />
          Secciones
        </button>
        <button
          onClick={() => setActiveTab('cursos')}
          className={`flex-1 px-5 py-3 text-base rounded-md font-medium transition-colors ${
            activeTab === 'cursos'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiBook className="inline-block mr-2" />
          Cursos
        </button>
        <button
          onClick={() => setActiveTab('profesores')}
          className={`flex-1 px-5 py-3 text-base rounded-md font-medium transition-colors ${
            activeTab === 'profesores'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiUser className="inline-block mr-2" />
          Profesores
        </button>
        <button
          onClick={() => setActiveTab('asignaciones')}
          className={`flex-1 px-5 py-3 text-base rounded-md font-medium transition-colors ${
            activeTab === 'asignaciones'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiUserCheck className="inline-block mr-2" />
          Asignaciones
        </button>
      </div>

      {/* Contenido de Secciones */}
      {activeTab === 'secciones' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Secciones del Colegio</h2>
            <Button
              onClick={() => setShowSeccionModal(true)}
              variant="primary"
              icon={FiPlus}
            >
              Nueva Sección
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {secciones.map(seccion => (
              <motion.div
                key={seccion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{seccion.grado} {seccion.nombre}</h3>
                    <p className="text-sm text-gray-500">{seccion.aula}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditSeccion(seccion)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <FiEdit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSeccion(seccion)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Capacidad: {seccion.capacidad} estudiantes
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Contenido de Cursos */}
      {activeTab === 'cursos' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cursos de Primaria</h2>
            <Button
              onClick={() => setShowCursoModal(true)}
              variant="success"
              icon={FiPlus}
            >
              Nuevo Curso
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cursos.map(curso => (
              <motion.div
                key={curso.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: curso.color }}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{curso.nombre}</h3>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditCurso(curso)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <FiEdit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCurso(curso)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{curso.descripcion}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Contenido de Profesores */}
      {activeTab === 'profesores' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Profesores</h2>
            <Button
              onClick={() => setShowProfesorModal(true)}
              style={{ backgroundColor: '#8B5CF6' }}
              className="hover:bg-purple-700"
              icon={FiPlus}
            >
              Nuevo Profesor
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Profesor
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Especialidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profesores.map(profesor => (
                    <tr key={profesor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {profesor.nombre} {profesor.apellidos}
                        </div>
                        <div className="text-sm text-gray-500">
                          {profesor.telefono}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {profesor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {profesor.especialidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditProfesor(profesor)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FiEdit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProfesor(profesor)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Contenido de Asignaciones */}
      {activeTab === 'asignaciones' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Asignaciones Curso-Profesor</h2>
            <Button
              onClick={() => setShowAsignacionModal(true)}
              variant="warning"
              icon={FiPlus}
            >
              Nueva Asignación
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Profesor
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Sección
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {asignaciones.map(asignacion => (
                    <tr key={asignacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getProfesorNombre(asignacion.profesorId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: cursos.find(c => c.id === asignacion.cursoId)?.color }}
                          ></div>
                          <div className="text-sm text-gray-900">
                            {getCursoNombre(asignacion.cursoId)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getSeccionNombre(asignacion.seccionId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditAsignacion(asignacion)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FiEdit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAsignacion(asignacion)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sección */}
      {showSeccionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {seccionEditando ? 'Editar Sección' : 'Nueva Sección'}
              </h3>
              <button
                onClick={() => {
                  setShowSeccionModal(false)
                  resetFormSeccion()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSeccion}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Sección
                </label>
                <input
                  type="text"
                  value={formSeccion.nombre}
                  onChange={(e) => setFormSeccion(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Sección A"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grado
                </label>
                <select
                  value={formSeccion.grado}
                  onChange={(e) => setFormSeccion(prev => ({ ...prev, grado: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar grado</option>
                  {grados.map(grado => (
                    <option key={grado} value={grado}>
                      {grado} Grado
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aula/Ubicación
                </label>
                <input
                  type="text"
                  value={formSeccion.aula}
                  onChange={(e) => setFormSeccion(prev => ({ ...prev, aula: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Aula 101"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad
                </label>
                <input
                  type="number"
                  min="15"
                  max="40"
                  value={formSeccion.capacidad}
                  onChange={(e) => setFormSeccion(prev => ({ ...prev, capacidad: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSeccionModal(false)
                    resetFormSeccion()
                  }}
                  className="px-5 py-3 text-base text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FiSave className="mr-2" />
                  {seccionEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Curso */}
      {showCursoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {cursoEditando ? 'Editar Curso' : 'Nuevo Curso'}
              </h3>
              <button
                onClick={() => {
                  setShowCursoModal(false)
                  resetFormCurso()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCurso}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Curso
                </label>
                <input
                  type="text"
                  value={formCurso.nombre}
                  onChange={(e) => setFormCurso(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Matemáticas"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formCurso.descripcion}
                  onChange={(e) => setFormCurso(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Descripción del curso"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formCurso.color}
                    onChange={(e) => setFormCurso(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formCurso.color}
                    onChange={(e) => setFormCurso(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCursoModal(false)
                    resetFormCurso()
                  }}
                  className="px-5 py-3 text-base text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 text-base bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <FiSave className="mr-2" />
                  {cursoEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Profesor */}
      {showProfesorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {profesorEditando ? 'Editar Profesor' : 'Nuevo Profesor'}
              </h3>
              <button
                onClick={() => {
                  setShowProfesorModal(false)
                  resetFormProfesor()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfesor}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formProfesor.nombre}
                  onChange={(e) => setFormProfesor(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: María"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  value={formProfesor.apellidos}
                  onChange={(e) => setFormProfesor(prev => ({ ...prev, apellidos: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: García López"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formProfesor.email}
                  onChange={(e) => setFormProfesor(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="profesor@colegio.edu"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formProfesor.telefono}
                  onChange={(e) => setFormProfesor(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="987654321"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidad
                </label>
                <input
                  type="text"
                  value={formProfesor.especialidad}
                  onChange={(e) => setFormProfesor(prev => ({ ...prev, especialidad: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Matemáticas"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfesorModal(false)
                    resetFormProfesor()
                  }}
                  className="px-5 py-3 text-base text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                >
                  <FiSave className="mr-2" />
                  {profesorEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Asignación */}
      {showAsignacionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {asignacionEditando ? 'Editar Asignación' : 'Nueva Asignación'}
              </h3>
              <button
                onClick={() => {
                  setShowAsignacionModal(false)
                  resetFormAsignacion()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAsignacion}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profesor
                </label>
                <select
                  value={formAsignacion.profesorId}
                  onChange={(e) => setFormAsignacion(prev => ({ ...prev, profesorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar profesor</option>
                  {profesores.map(profesor => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombre} {profesor.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso
                </label>
                <select
                  value={formAsignacion.cursoId}
                  onChange={(e) => setFormAsignacion(prev => ({ ...prev, cursoId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar curso</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sección
                </label>
                <select
                  value={formAsignacion.seccionId}
                  onChange={(e) => setFormAsignacion(prev => ({ ...prev, seccionId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar sección</option>
                  {secciones.map(seccion => (
                    <option key={seccion.id} value={seccion.id}>
                      {seccion.grado} {seccion.nombre} - {seccion.aula}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAsignacionModal(false)
                    resetFormAsignacion()
                  }}
                  className="px-5 py-3 text-base text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
                >
                  <FiSave className="mr-2" />
                  {asignacionEditando ? 'Actualizar' : 'Asignar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default CourseAssignmentManager