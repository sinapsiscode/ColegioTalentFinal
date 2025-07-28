import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiBook,
  FiUsers,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiBookOpen,
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi'

import Header from '../../components/common/Header'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageTransition from '../../components/common/PageTransition'
import AnimatedCard from '../../components/common/AnimatedCard'
import CountUpNumber from '../../components/common/CountUpNumber'
import useCoursesStore from '../../stores/coursesStore'
import useAuthStore from '../../stores/authStore'
import { showInfo } from '../../utils/sweetAlert'

const TutorCourses = () => {
  const { usuario } = useAuthStore()
  const {
    courses,
    loading,
    loadTeacherCourses
  } = useCoursesStore()

  const [selectedCourse, setSelectedCourse] = useState(null)

  // Cargar cursos del profesor al montar
  useEffect(() => {
    if (usuario?.id) {
      loadTeacherCourses(usuario.id)
    }
  }, [usuario, loadTeacherCourses])

  // Calcular estadísticas
  const stats = {
    totalCursos: courses.length,
    totalEstudiantes: courses.reduce((sum, c) => sum + c.estudiantesInscritos, 0),
    totalHoras: courses.reduce((sum, c) => sum + c.horasSemanales, 0),
    capacidadPromedio: courses.length > 0 
      ? Math.round(courses.reduce((sum, c) => sum + (c.estudiantesInscritos / c.capacidad * 100), 0) / courses.length)
      : 0
  }

  const handleCourseClick = (course) => {
    setSelectedCourse(course)
    showInfo(
      course.nombre,
      `
      <div class="text-left space-y-2">
        <p><strong>Código:</strong> ${course.codigo}</p>
        <p><strong>Horario:</strong> ${course.horario}</p>
        <p><strong>Aula:</strong> ${course.aula}</p>
        <p><strong>Estudiantes:</strong> ${course.estudiantesInscritos} / ${course.capacidad}</p>
        <p><strong>Período:</strong> ${new Date(course.fechaInicio).toLocaleDateString('es-PE')} - ${new Date(course.fechaFin).toLocaleDateString('es-PE')}</p>
      </div>
      `
    )
  }

  if (loading && courses.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-96">
              <LoadingSpinner size="xl" />
            </div>
          </main>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header de la página */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus cursos asignados y visualiza la información de tus estudiantes
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard delay={0}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Cursos</p>
                    <CountUpNumber
                      value={stats.totalCursos}
                      className="text-2xl font-bold text-gray-900 mt-1"
                    />
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiBook className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.1}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Estudiantes</p>
                    <CountUpNumber
                      value={stats.totalEstudiantes}
                      className="text-2xl font-bold text-gray-900 mt-1"
                    />
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiUsers className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Horas Semanales</p>
                    <CountUpNumber
                      value={stats.totalHoras}
                      className="text-2xl font-bold text-gray-900 mt-1"
                      suffix="h"
                    />
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FiClock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ocupación</p>
                    <CountUpNumber
                      value={stats.capacidadPromedio}
                      className="text-2xl font-bold text-gray-900 mt-1"
                      suffix="%"
                    />
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FiTrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Lista de cursos */}
          {courses.length === 0 ? (
            <AnimatedCard>
              <div className="p-8 text-center">
                <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes cursos asignados
                </h3>
                <p className="text-gray-600">
                  Contacta con el administrador para que te asigne cursos
                </p>
              </div>
            </AnimatedCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleCourseClick(course)}
                  className="cursor-pointer"
                >
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    {/* Header del curso */}
                    <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary p-4">
                      <div className="flex items-center justify-between text-white">
                        <h3 className="font-semibold text-lg">{course.nombre}</h3>
                        <span className="text-sm bg-white/20 px-2 py-1 rounded">
                          {course.codigo}
                        </span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 space-y-4">
                      <p className="text-gray-600 text-sm">{course.descripcion}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiBookOpen className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{course.materia}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{course.grado} - Sección {course.seccion}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <FiClock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{course.horario}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Aula {course.aula}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <FiUsers className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{course.estudiantesInscritos} / {course.capacidad} estudiantes</span>
                        </div>
                      </div>

                      {/* Barra de progreso de capacidad */}
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Capacidad</span>
                          <span>{Math.round((course.estudiantesInscritos / course.capacidad) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-talentos-primary to-talentos-secondary h-full rounded-full transition-all duration-500"
                            style={{ width: `${(course.estudiantesInscritos / course.capacidad) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Estado */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          course.estado === 'activo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {course.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {course.horasSemanales} horas/semana
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Información adicional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <div className="flex items-start space-x-3">
              <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Información importante
                </h4>
                <p className="text-sm text-blue-700">
                  Para gestionar las calificaciones, asistencia o enviar comunicados a tus estudiantes, 
                  utiliza las opciones correspondientes en el menú principal. Si necesitas que te asignen 
                  más cursos o modificar tu horario, contacta con el departamento administrativo.
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  )
}

export default TutorCourses