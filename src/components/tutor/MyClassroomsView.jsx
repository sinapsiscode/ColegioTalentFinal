import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiUsers,
  FiClock,
  FiBookOpen,
  FiMapPin,
  FiCalendar,
  FiChevronRight,
  FiGrid,
  FiList,
  FiFilter
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const MyClassroomsView = ({ estudiantes, clasesHoy, tutor }) => {
  const [viewMode, setViewMode] = useState('grid') // 'grid' o 'list'
  const [selectedGrade, setSelectedGrade] = useState('all')
  const navigate = useNavigate()

  // Agrupar estudiantes por grado y sección
  const getClassrooms = () => {
    const classrooms = {}
    
    estudiantes.forEach(estudiante => {
      const key = `${estudiante.grado} ${estudiante.seccion || ''}`
      if (!classrooms[key]) {
        classrooms[key] = {
          grado: estudiante.grado,
          seccion: estudiante.seccion,
          estudiantes: [],
          materias: new Set()
        }
      }
      classrooms[key].estudiantes.push(estudiante)
    })

    // Agregar información de materias desde las clases
    clasesHoy.forEach(clase => {
      const key = clase.grado
      if (classrooms[key]) {
        classrooms[key].materias.add(clase.materia)
      }
    })

    return Object.entries(classrooms).map(([key, data]) => ({
      id: key,
      nombre: key,
      grado: data.grado,
      seccion: data.seccion,
      totalEstudiantes: data.estudiantes.length,
      estudiantes: data.estudiantes,
      materias: Array.from(data.materias),
      // Buscar información adicional de las clases
      aula: clasesHoy.find(c => c.grado === key)?.aula || 'Por asignar',
      horarios: clasesHoy
        .filter(c => c.grado === key)
        .map(c => ({ hora: c.hora, materia: c.materia }))
    }))
  }

  const classrooms = getClassrooms()
  
  // Filtrar por grado si está seleccionado
  const filteredClassrooms = selectedGrade === 'all' 
    ? classrooms 
    : classrooms.filter(c => c.grado.includes(selectedGrade))

  // Obtener lista única de grados
  const uniqueGrades = [...new Set(classrooms.map(c => c.grado.split(' ')[0]))]

  // Estadísticas generales
  const stats = {
    totalAulas: classrooms.length,
    totalEstudiantes: estudiantes.length,
    promediosPorAula: classrooms.length > 0 ? Math.round(estudiantes.length / classrooms.length) : 0,
    materiasImpartidas: [...new Set(clasesHoy.map(c => c.materia))].length
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Mis Aulas Asignadas</h2>
          <p className="text-gray-600">
            Gestiono {stats.totalAulas} aulas con {stats.totalEstudiantes} estudiantes en total
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          {/* Filtro por grado */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los grados</option>
            {uniqueGrades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>

          {/* Toggle vista */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Aulas</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalAulas}</p>
            </div>
            <FiGrid className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Estudiantes</p>
              <p className="text-2xl font-bold text-green-900">{stats.totalEstudiantes}</p>
            </div>
            <FiUsers className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Promedio/Aula</p>
              <p className="text-2xl font-bold text-purple-900">{stats.promediosPorAula}</p>
            </div>
            <FiUsers className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Materias</p>
              <p className="text-2xl font-bold text-orange-900">{stats.materiasImpartidas}</p>
            </div>
            <FiBookOpen className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Vista de aulas */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClassrooms.map((classroom, index) => (
            <motion.div
              key={classroom.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/tutor/classroom/${classroom.id}`)}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              {/* Header del aula */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{classroom.nombre}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <FiMapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Aula {classroom.aula}</span>
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {classroom.totalEstudiantes}
                </div>
              </div>

              {/* Materias */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Materias:</p>
                <div className="flex flex-wrap gap-1">
                  {classroom.materias.map(materia => (
                    <span 
                      key={materia}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {materia}
                    </span>
                  ))}
                </div>
              </div>

              {/* Horarios */}
              {classroom.horarios.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Próxima clase:</p>
                  <div className="flex items-center gap-2 text-sm">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{classroom.horarios[0].hora}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{classroom.horarios[0].materia}</span>
                  </div>
                </div>
              )}

              {/* Indicador de acción */}
              <div className="flex items-center justify-end mt-4 text-blue-600">
                <span className="text-sm">Ver detalles</span>
                <FiChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // Vista de lista
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Aula</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ubicación</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Estudiantes</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Materias</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Horarios</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClassrooms.map((classroom, index) => (
                <motion.tr
                  key={classroom.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{classroom.nombre}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <FiMapPin className="w-4 h-4" />
                      <span>Aula {classroom.aula}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium">
                      {classroom.totalEstudiantes}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {classroom.materias.map(materia => (
                        <span 
                          key={materia}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {materia}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {classroom.horarios.length > 0 ? (
                      <div className="text-sm text-gray-600">
                        {classroom.horarios[0].hora}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => navigate(`/tutor/classroom/${classroom.id}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Ver detalles
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {filteredClassrooms.length === 0 && (
        <div className="text-center py-12">
          <FiFilter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron aulas con los filtros aplicados</p>
        </div>
      )}
    </div>
  )
}

export default MyClassroomsView