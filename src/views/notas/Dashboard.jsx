import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiBook,
  FiTrendingUp,
  FiAward,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiUser,
  FiBarChart2,
  FiFileText,
  FiChevronRight,
  FiEdit3,
  FiCheckCircle,
  FiAlertCircle,
  FiClock
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import FilterDropdown from '../../components/common/FilterDropdown'
import CountUpNumber from '../../components/common/CountUpNumber'

import useAuthStore from '../../stores/authStore'
import useGradesStore from '../../stores/gradesStore'
import useStudentsStore from '../../stores/studentsStore'
import { showSuccess, showError, showInfo } from '../../utils/sweetAlert'
import { generateBoletinPDF } from '../../utils/pdfGenerator'

// Configuración de períodos académicos
const PERIODOS_ACADEMICOS = [
  { id: 'bim1', nombre: '1° Bimestre', abrev: 'B1', meses: 'Marzo - Abril' },
  { id: 'bim2', nombre: '2° Bimestre', abrev: 'B2', meses: 'Mayo - Junio' },
  { id: 'bim3', nombre: '3° Bimestre', abrev: 'B3', meses: 'Agosto - Septiembre' },
  { id: 'bim4', nombre: '4° Bimestre', abrev: 'B4', meses: 'Octubre - Noviembre' },
  { id: 'final', nombre: 'Nota Final', abrev: 'NF', meses: 'Promedio Anual' }
]

const MATERIAS = [
  { id: 'MAT', nombre: 'Matemática', color: 'blue' },
  { id: 'COM', nombre: 'Comunicación', color: 'green' },
  { id: 'CYT', nombre: 'Ciencia y Tecnología', color: 'purple' },
  { id: 'PS', nombre: 'Personal Social', color: 'orange' },
  { id: 'EF', nombre: 'Educación Física', color: 'red' },
  { id: 'ART', nombre: 'Arte y Cultura', color: 'pink' },
  { id: 'REL', nombre: 'Educación Religiosa', color: 'indigo' },
  { id: 'ING', nombre: 'Inglés', color: 'teal' }
]

const NotasDashboard = () => {
  const navigate = useNavigate()
  const { bimestre } = useParams()
  const { usuario, rol } = useAuthStore()
  
  const {
    calificaciones,
    cargando,
    cargarCalificaciones,
    obtenerCalificacionesPorBimestre,
    calcularPromedioGeneral,
    calcularNotaFinal,
    registrarNota
  } = useGradesStore()
  
  const { alumnos, obtenerAlumnosPorPadreId } = useStudentsStore()

  // Estados
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState(bimestre || 'bim1')
  const [viewMode, setViewMode] = useState('general') // general, detalle
  const [isEditing, setIsEditing] = useState(false)
  const [notasTemporales, setNotasTemporales] = useState({})
  const [refreshing, setRefreshing] = useState(false)

  // Obtener estudiantes según el rol
  const estudiantes = rol === 'padre' 
    ? obtenerAlumnosPorPadreId(usuario.id)
    : rol === 'tutor'
    ? alumnos // TODO: Filtrar por estudiantes asignados al tutor
    : alumnos

  useEffect(() => {
    cargarCalificaciones()
  }, [cargarCalificaciones])

  useEffect(() => {
    if (!selectedStudent && estudiantes.length > 0) {
      setSelectedStudent(estudiantes[0].id)
    }
  }, [estudiantes, selectedStudent])

  // Navegación a bimestre específico
  useEffect(() => {
    if (bimestre && PERIODOS_ACADEMICOS.find(p => p.id === bimestre)) {
      setSelectedPeriod(bimestre)
    }
  }, [bimestre])

  // Obtener calificaciones del estudiante y período seleccionados
  const obtenerNotasActuales = () => {
    if (!selectedStudent) return []
    
    const notasPorBimestre = obtenerCalificacionesPorBimestre(selectedStudent, selectedPeriod)
    
    // Si es la vista final, calcular promedios
    if (selectedPeriod === 'final') {
      return MATERIAS.map(materia => {
        const notaFinal = calcularNotaFinal(selectedStudent, materia.id)
        return {
          materia: materia.id,
          materiaNombre: materia.nombre,
          nota: notaFinal,
          esFinal: true
        }
      })
    }
    
    return notasPorBimestre
  }

  const notasActuales = obtenerNotasActuales()

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const notas = notasActuales.map(n => n.nota).filter(n => n > 0)
    
    if (notas.length === 0) {
      return { promedio: 0, aprobadas: 0, desaprobadas: 0, pendientes: 0 }
    }
    
    const promedio = notas.reduce((sum, n) => sum + n, 0) / notas.length
    const aprobadas = notas.filter(n => n >= 11).length
    const desaprobadas = notas.filter(n => n < 11 && n > 0).length
    const pendientes = MATERIAS.length - notas.length
    
    return { promedio, aprobadas, desaprobadas, pendientes }
  }

  const estadisticas = calcularEstadisticas()

  // Obtener evolución del estudiante
  const obtenerEvolucion = () => {
    if (!selectedStudent) return []
    
    return PERIODOS_ACADEMICOS.filter(p => p.id !== 'final').map(periodo => {
      const promedio = calcularPromedioGeneral(selectedStudent, periodo.id)
      return {
        periodo: periodo.abrev,
        promedio: promedio || 0
      }
    })
  }

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true)
    await cargarCalificaciones()
    setTimeout(() => {
      setRefreshing(false)
      showSuccess('Actualizado', 'Las calificaciones han sido actualizadas')
    }, 1000)
  }

  const handleExportBoletin = async () => {
    if (!selectedStudent) return
    
    try {
      const estudiante = estudiantes.find(e => e.id === selectedStudent)
      const todasLasNotas = {}
      
      PERIODOS_ACADEMICOS.forEach(periodo => {
        if (periodo.id !== 'final') {
          todasLasNotas[periodo.id] = obtenerCalificacionesPorBimestre(selectedStudent, periodo.id)
        } else {
          todasLasNotas[periodo.id] = MATERIAS.map(materia => ({
            materia: materia.id,
            materiaNombre: materia.nombre,
            nota: calcularNotaFinal(selectedStudent, materia.id)
          }))
        }
      })
      
      await generateBoletinPDF({
        estudiante,
        notas: todasLasNotas,
        periodos: PERIODOS_ACADEMICOS,
        año: new Date().getFullYear()
      })
      
      showSuccess('Boletín generado', 'El boletín de notas ha sido descargado')
    } catch (error) {
      showError('Error', 'No se pudo generar el boletín')
    }
  }

  const handleEditNotas = () => {
    if (rol !== 'tutor') return
    
    setIsEditing(true)
    const notasObj = {}
    notasActuales.forEach(nota => {
      notasObj[nota.materia] = nota.nota
    })
    setNotasTemporales(notasObj)
  }

  const handleSaveNotas = async () => {
    try {
      // Guardar cada nota modificada
      for (const [materia, nota] of Object.entries(notasTemporales)) {
        await registrarNota({
          estudianteId: selectedStudent,
          materia,
          nota: parseFloat(nota),
          bimestre: selectedPeriod,
          fecha: new Date()
        })
      }
      
      setIsEditing(false)
      await cargarCalificaciones()
      showSuccess('Notas guardadas', 'Las calificaciones han sido actualizadas')
    } catch (error) {
      showError('Error', 'No se pudieron guardar las notas')
    }
  }

  const handleNotaChange = (materia, valor) => {
    const nota = parseFloat(valor)
    if (nota >= 0 && nota <= 20) {
      setNotasTemporales(prev => ({ ...prev, [materia]: nota }))
    }
  }

  // Renderizar tarjeta de período
  const renderPeriodoCard = (periodo) => {
    const promedio = periodo.id === 'final' 
      ? estadisticas.promedio 
      : calcularPromedioGeneral(selectedStudent, periodo.id)
    
    const isActive = selectedPeriod === periodo.id
    const hasNotas = promedio > 0
    
    return (
      <motion.div
        key={periodo.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setSelectedPeriod(periodo.id)
          navigate(`/notas/${periodo.id}`)
        }}
        className={`cursor-pointer rounded-lg border-2 transition-all ${
          isActive
            ? 'border-talentos-primary bg-talentos-primary/5'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${isActive ? 'text-talentos-primary' : 'text-gray-900'}`}>
              {periodo.nombre}
            </h3>
            {hasNotas ? (
              <FiCheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <FiClock className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{periodo.meses}</p>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Promedio</p>
              <p className={`text-2xl font-bold ${
                promedio >= 14 ? 'text-green-600' :
                promedio >= 11 ? 'text-yellow-600' :
                promedio > 0 ? 'text-red-600' : 'text-gray-400'
              }`}>
                {promedio > 0 ? promedio.toFixed(1) : '--'}
              </p>
            </div>
            <FiChevronRight className={`w-5 h-5 ${isActive ? 'text-talentos-primary' : 'text-gray-400'}`} />
          </div>
        </div>
      </motion.div>
    )
  }

  // Renderizar nota de materia
  const renderNotaMateria = (nota, materia) => {
    const colorClase = materia.color
    const notaValor = isEditing ? (notasTemporales[nota.materia] || 0) : nota.nota
    
    return (
      <AnimatedCard key={nota.materia} className="hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-${colorClase}-100 rounded-lg flex items-center justify-center`}>
                <FiBook className={`w-5 h-5 text-${colorClase}-600`} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{nota.materiaNombre}</h4>
                <p className="text-xs text-gray-500">
                  {nota.esFinal ? 'Promedio anual' : selectedPeriod.toUpperCase()}
                </p>
              </div>
            </div>
            
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={notasTemporales[nota.materia] || 0}
                onChange={(e) => handleNotaChange(nota.materia, e.target.value)}
                className="w-20 px-2 py-1 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-talentos-primary focus:outline-none"
              />
            ) : (
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  notaValor >= 14 ? 'text-green-600' :
                  notaValor >= 11 ? 'text-yellow-600' :
                  notaValor > 0 ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {notaValor > 0 ? notaValor.toFixed(1) : '--'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {notaValor >= 18 ? 'Excelente' :
                   notaValor >= 14 ? 'Bueno' :
                   notaValor >= 11 ? 'Regular' :
                   notaValor > 0 ? 'Necesita apoyo' : 'Sin calificar'}
                </p>
              </div>
            )}
          </div>
          
          {/* Barra de progreso visual */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                notaValor >= 14 ? 'bg-green-500' :
                notaValor >= 11 ? 'bg-yellow-500' :
                notaValor > 0 ? 'bg-red-500' : 'bg-gray-300'
              }`}
              style={{ width: `${(notaValor / 20) * 100}%` }}
            />
          </div>
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notas Académicas</h1>
              <p className="text-gray-600 mt-1">
                Registro y seguimiento de calificaciones
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {rol === 'tutor' && selectedPeriod !== 'final' && (
                <>
                  {isEditing ? (
                    <>
                      <AnimatedButton
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </AnimatedButton>
                      <AnimatedButton
                        variant="primary"
                        icon={FiCheckCircle}
                        onClick={handleSaveNotas}
                      >
                        Guardar Notas
                      </AnimatedButton>
                    </>
                  ) : (
                    <AnimatedButton
                      variant="outline"
                      icon={FiEdit3}
                      onClick={handleEditNotas}
                    >
                      Editar Notas
                    </AnimatedButton>
                  )}
                </>
              )}
              
              <AnimatedButton
                variant="outline"
                icon={FiRefreshCw}
                onClick={handleRefresh}
                className={refreshing ? 'animate-spin' : ''}
                disabled={refreshing}
              >
                Actualizar
              </AnimatedButton>
              
              <AnimatedButton
                variant="primary"
                icon={FiDownload}
                onClick={handleExportBoletin}
              >
                Descargar Boletín
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Selector de estudiante */}
        {estudiantes.length > 1 && (
          <div className="mb-6">
            <FilterDropdown
              label="Estudiante"
              options={estudiantes.map(e => ({
                value: e.id,
                label: `${e.nombre} ${e.apellidos} - ${e.grado}`
              }))}
              selectedValue={selectedStudent}
              onSelect={setSelectedStudent}
            />
          </div>
        )}

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnimatedCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio General</p>
                  <CountUpNumber
                    value={estadisticas.promedio}
                    decimals={1}
                    className={`text-3xl font-bold mt-2 ${
                      estadisticas.promedio >= 14 ? 'text-green-600' :
                      estadisticas.promedio >= 11 ? 'text-yellow-600' :
                      estadisticas.promedio > 0 ? 'text-red-600' : 'text-gray-900'
                    }`}
                  />
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiTrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cursos Aprobados</p>
                  <CountUpNumber
                    value={estadisticas.aprobadas}
                    className="text-3xl font-bold text-green-600 mt-2"
                  />
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiCheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cursos Desaprobados</p>
                  <CountUpNumber
                    value={estadisticas.desaprobadas}
                    className="text-3xl font-bold text-red-600 mt-2"
                  />
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <FiAlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sin Calificar</p>
                  <CountUpNumber
                    value={estadisticas.pendientes}
                    className="text-3xl font-bold text-gray-600 mt-2"
                  />
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FiClock className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Selector de períodos */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Períodos Académicos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {PERIODOS_ACADEMICOS.map(periodo => renderPeriodoCard(periodo))}
          </div>
        </div>

        {/* Vista de notas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {PERIODOS_ACADEMICOS.find(p => p.id === selectedPeriod)?.nombre}
            </h2>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('general')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'general'
                    ? 'bg-talentos-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Vista General
              </button>
              <button
                onClick={() => setViewMode('detalle')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'detalle'
                    ? 'bg-talentos-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Vista Detallada
              </button>
            </div>
          </div>

          {/* Grid de notas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notasActuales.map(nota => {
              const materia = MATERIAS.find(m => m.id === nota.materia)
              return renderNotaMateria(nota, materia)
            })}
          </div>

          {/* Mensaje si no hay notas */}
          {notasActuales.length === 0 && (
            <AnimatedCard>
              <div className="text-center py-12">
                <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay calificaciones registradas
                </h3>
                <p className="text-gray-600">
                  Las notas de este período aún no han sido cargadas
                </p>
              </div>
            </AnimatedCard>
          )}
        </div>

        {/* Gráfico de evolución */}
        {viewMode === 'detalle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <AnimatedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Evolución del Rendimiento
                </h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {obtenerEvolucion().map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t-lg relative">
                        <div
                          className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${
                            data.promedio >= 14 ? 'bg-green-500' :
                            data.promedio >= 11 ? 'bg-yellow-500' :
                            data.promedio > 0 ? 'bg-red-500' : 'bg-gray-300'
                          }`}
                          style={{ height: `${(data.promedio / 20) * 256}px` }}
                        >
                          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-bold">
                            {data.promedio > 0 ? data.promedio.toFixed(1) : '--'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{data.periodo}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default NotasDashboard