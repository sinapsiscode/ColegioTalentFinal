import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX,
  FiUser,
  FiCalendar,
  FiBarChart,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiEdit,
  FiMessageSquare,
  FiPhone,
  FiMail,
  FiMapPin,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi'
import { subDays } from 'date-fns'

import AnimatedButton from '../common/AnimatedButton'
import useAttendanceStore from '../../stores/attendanceStore'
import useGradesStore from '../../stores/gradesStore'
import { showSuccess, showInput, showConfirm } from '../../utils/sweetAlert'
import { safeFormat, calculateAge } from '../../utils/dateHelpers'

const StudentDetailModal = ({ estudiante, isOpen, onClose, onUpdateStudent }) => {
  const [activeTab, setActiveTab] = useState('general')
  const [editingField, setEditingField] = useState(null)
  const [studentData, setStudentData] = useState(null)
  
  const { obtenerEstadisticasAsistencia, registrosAsistencia } = useAttendanceStore()
  const { calificaciones } = useGradesStore()

  useEffect(() => {
    if (estudiante) {
      // Asegurar que el estudiante tenga todos los campos necesarios
      setStudentData({
        id: estudiante.id,
        nombre: estudiante.nombre || 'Sin nombre',
        apellidos: estudiante.apellidos || '',
        foto: estudiante.foto || null,
        grado: estudiante.grado || 'Sin asignar',
        seccion: estudiante.seccion || '',
        codigo: estudiante.codigo || estudiante.codigo_qr || '',
        fecha_nacimiento: estudiante.fecha_nacimiento || null,
        direccion: estudiante.direccion || 'No registrada',
        estado: estudiante.estado || 'activo',
        observaciones: estudiante.observaciones || '',
        ...estudiante
      })
    }
  }, [estudiante])

  if (!estudiante || !studentData) return null

  // Obtener estadísticas
  const statsAsistencia = obtenerEstadisticasAsistencia(estudiante.id)
  const calificacionesEstudiante = calificaciones.filter(c => c.estudianteId === estudiante.id)
  
  // Calcular promedio general
  const promedioGeneral = calificacionesEstudiante.length > 0
    ? (calificacionesEstudiante.reduce((sum, c) => sum + c.nota, 0) / calificacionesEstudiante.length).toFixed(1)
    : 0

  // Obtener últimos registros de asistencia
  const ultimosRegistros = registrosAsistencia
    .filter(r => r.estudianteId === estudiante.id)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5)

  // Agrupar calificaciones por materia
  const calificacionesPorMateria = calificacionesEstudiante.reduce((acc, cal) => {
    if (!acc[cal.materia]) {
      acc[cal.materia] = []
    }
    acc[cal.materia].push(cal)
    return acc
  }, {})

  const handleEditField = async (field, currentValue) => {
    const result = await showInput(
      `Editar ${field}`,
      `Nuevo valor para ${field}:`,
      {
        inputValue: currentValue,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar'
      }
    )

    if (result.isConfirmed && result.value) {
      const updatedData = { ...studentData, [field]: result.value }
      setStudentData(updatedData)
      onUpdateStudent(updatedData)
      showSuccess('Actualizado', `${field} actualizado correctamente`)
    }
  }

  const handleContactParent = () => {
    showSuccess('Contactar Padre', 'Abriendo ventana de mensajes...')
    // Aquí se podría navegar a mensajes o abrir un modal de comunicación
  }

  const handleChangeStatus = async () => {
    const result = await showConfirm(
      'Cambiar Estado',
      `¿Cambiar el estado del estudiante a ${
        studentData.estado === 'activo' ? 'Necesita Atención' : 'Activo'
      }?`,
      'warning'
    )

    if (result.isConfirmed) {
      const newStatus = studentData.estado === 'activo' ? 'necesita_atencion' : 'activo'
      const updatedData = { ...studentData, estado: newStatus }
      setStudentData(updatedData)
      onUpdateStudent(updatedData)
      showSuccess('Estado actualizado', `El estudiante ahora está marcado como: ${newStatus}`)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-talentos-primary to-talentos-secondary text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={studentData.foto || `https://ui-avatars.com/api/?name=${studentData.nombre}`}
                      alt={studentData.nombre}
                      className="w-16 h-16 rounded-full border-2 border-white"
                    />
                    <div>
                      <h2 className="text-2xl font-bold">
                        {studentData.nombre} {studentData.apellidos}
                      </h2>
                      <p className="text-blue-100">
                        {studentData.grado} - Código: {studentData.codigo}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm text-blue-100">Asistencia</p>
                    <p className="text-xl font-bold">
                      {statsAsistencia.total > 0 
                        ? Math.round(((statsAsistencia.presentes + statsAsistencia.tardes) / statsAsistencia.total) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm text-blue-100">Promedio</p>
                    <p className="text-xl font-bold">{promedioGeneral}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm text-blue-100">Estado</p>
                    <p className="text-xl font-bold capitalize">
                      {studentData.estado === 'necesita_atencion' ? 'Atención' : studentData.estado}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`
                      px-6 py-3 text-sm font-medium transition-colors duration-200
                      ${activeTab === 'general' 
                        ? 'text-talentos-primary border-b-2 border-talentos-primary' 
                        : 'text-gray-600 hover:text-gray-900'}
                    `}
                  >
                    Información General
                  </button>
                  <button
                    onClick={() => setActiveTab('asistencia')}
                    className={`
                      px-6 py-3 text-sm font-medium transition-colors duration-200
                      ${activeTab === 'asistencia' 
                        ? 'text-talentos-primary border-b-2 border-talentos-primary' 
                        : 'text-gray-600 hover:text-gray-900'}
                    `}
                  >
                    Asistencia
                  </button>
                  <button
                    onClick={() => setActiveTab('calificaciones')}
                    className={`
                      px-6 py-3 text-sm font-medium transition-colors duration-200
                      ${activeTab === 'calificaciones' 
                        ? 'text-talentos-primary border-b-2 border-talentos-primary' 
                        : 'text-gray-600 hover:text-gray-900'}
                    `}
                  >
                    Calificaciones
                  </button>
                  <button
                    onClick={() => setActiveTab('observaciones')}
                    className={`
                      px-6 py-3 text-sm font-medium transition-colors duration-200
                      ${activeTab === 'observaciones' 
                        ? 'text-talentos-primary border-b-2 border-talentos-primary' 
                        : 'text-gray-600 hover:text-gray-900'}
                    `}
                  >
                    Observaciones
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                {/* Tab: Información General */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Datos Personales */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <FiUser className="w-5 h-5" />
                          <span>Datos Personales</span>
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                            <p className="font-medium text-gray-900">
                              {safeFormat(studentData.fecha_nacimiento, 'dd/MM/yyyy', 'No registrada')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Edad</p>
                            <p className="font-medium text-gray-900">
                              {calculateAge(studentData.fecha_nacimiento) 
                                ? `${calculateAge(studentData.fecha_nacimiento)} años`
                                : 'No disponible'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Dirección</p>
                              <p className="font-medium text-gray-900">{studentData.direccion}</p>
                            </div>
                            <button
                              onClick={() => handleEditField('direccion', studentData.direccion)}
                              className="text-talentos-primary hover:text-talentos-secondary"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Información de Contacto */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <FiPhone className="w-5 h-5" />
                          <span>Contacto del Padre/Madre</span>
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <FiPhone className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900">+51 987 654 321</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiMail className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900">padre@email.com</p>
                          </div>
                          <AnimatedButton
                            variant="outline"
                            icon={FiMessageSquare}
                            onClick={handleContactParent}
                            size="sm"
                            className="w-full mt-4"
                          >
                            Contactar Padre/Madre
                          </AnimatedButton>
                        </div>
                      </div>
                    </div>

                    {/* Estado y Acciones */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Estado del Estudiante
                          </h3>
                          <p className="text-gray-600">
                            {studentData.estado === 'activo' 
                              ? 'El estudiante está progresando adecuadamente'
                              : 'El estudiante requiere atención especial'}
                          </p>
                        </div>
                        <AnimatedButton
                          variant={studentData.estado === 'activo' ? 'warning' : 'success'}
                          icon={studentData.estado === 'activo' ? FiAlertCircle : FiCheckCircle}
                          onClick={handleChangeStatus}
                          size="sm"
                        >
                          {studentData.estado === 'activo' ? 'Marcar Atención' : 'Marcar Activo'}
                        </AnimatedButton>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Asistencia */}
                {activeTab === 'asistencia' && (
                  <div className="space-y-6">
                    {/* Resumen de Asistencia */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <FiCheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-700">{statsAsistencia.presentes}</p>
                        <p className="text-sm text-green-600">Presentes</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <FiClock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-yellow-700">{statsAsistencia.tardes}</p>
                        <p className="text-sm text-yellow-600">Tardes</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <FiX className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-700">{statsAsistencia.faltas}</p>
                        <p className="text-sm text-red-600">Faltas</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <FiActivity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-700">
                          {statsAsistencia.total > 0 
                            ? Math.round(((statsAsistencia.presentes + statsAsistencia.tardes) / statsAsistencia.total) * 100)
                            : 0}%
                        </p>
                        <p className="text-sm text-blue-600">Asistencia</p>
                      </div>
                    </div>

                    {/* Últimos Registros */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Últimos Registros
                      </h3>
                      <div className="space-y-2">
                        {ultimosRegistros.length > 0 ? (
                          ultimosRegistros.map((registro, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`
                                  w-3 h-3 rounded-full
                                  ${registro.estado === 'presente' ? 'bg-green-500' : ''}
                                  ${registro.estado === 'tarde' ? 'bg-yellow-500' : ''}
                                  ${registro.estado === 'falta' ? 'bg-red-500' : ''}
                                `} />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {safeFormat(registro.fecha, 'EEEE, dd MMMM', 'Fecha no disponible')}
                                  </p>
                                  <p className="text-sm text-gray-600 capitalize">
                                    {registro.estado} {registro.hora && `- ${registro.hora}`}
                                  </p>
                                </div>
                              </div>
                              {registro.observaciones && (
                                <p className="text-sm text-gray-500">{registro.observaciones}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            No hay registros de asistencia disponibles
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Calificaciones */}
                {activeTab === 'calificaciones' && (
                  <div className="space-y-6">
                    {/* Promedio General */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Promedio General</h3>
                          <p className="text-gray-600">Todas las materias</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">{promedioGeneral}</p>
                          <p className={`text-sm ${promedioGeneral >= 14 ? 'text-green-600' : 'text-orange-600'}`}>
                            {promedioGeneral >= 14 ? 'Aprobado' : 'Necesita mejorar'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Calificaciones por Materia */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Calificaciones por Materia
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(calificacionesPorMateria).map(([materia, cals]) => {
                          const promedio = (cals.reduce((sum, c) => sum + c.nota, 0) / cals.length).toFixed(1)
                          const tendencia = cals.length > 1 && cals[cals.length - 1].nota > cals[0].nota
                          
                          return (
                            <div key={materia} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{materia}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg font-bold text-gray-900">{promedio}</span>
                                  {tendencia !== null && (
                                    tendencia ? (
                                      <FiTrendingUp className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <FiTrendingDown className="w-4 h-4 text-red-500" />
                                    )
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                {cals.map((cal, index) => (
                                  <div
                                    key={index}
                                    className="flex-1 text-center"
                                  >
                                    <p className="text-xs text-gray-600">{cal.bimestre}</p>
                                    <p className={`
                                      text-sm font-medium
                                      ${cal.nota >= 14 ? 'text-green-600' : 'text-orange-600'}
                                    `}>
                                      {cal.nota}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Observaciones */}
                {activeTab === 'observaciones' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Observaciones del Tutor
                        </h3>
                        <AnimatedButton
                          variant="outline"
                          icon={FiEdit}
                          onClick={() => handleEditField('observaciones', studentData.observaciones || '')}
                          size="sm"
                        >
                          Editar
                        </AnimatedButton>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {studentData.observaciones || 'No hay observaciones registradas para este estudiante.'}
                        </p>
                      </div>
                    </div>

                    {/* Historial de observaciones (simulado) */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Historial</h4>
                      <div className="space-y-3">
                        <div className="border-l-4 border-blue-400 pl-4 py-2">
                          <p className="text-sm text-gray-600">
                            {safeFormat(subDays(new Date(), 7), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-gray-700">
                            Excelente participación en clase. Muestra gran interés en las actividades.
                          </p>
                        </div>
                        <div className="border-l-4 border-yellow-400 pl-4 py-2">
                          <p className="text-sm text-gray-600">
                            {safeFormat(subDays(new Date(), 14), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-gray-700">
                            Necesita reforzar los temas de matemáticas. Se recomienda práctica adicional.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex justify-end">
                  <AnimatedButton
                    variant="outline"
                    onClick={onClose}
                  >
                    Cerrar
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default StudentDetailModal