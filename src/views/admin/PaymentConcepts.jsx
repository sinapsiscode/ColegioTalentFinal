import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit, FiTrash2, FiEye, FiToggleLeft, FiToggleRight, FiFilter, FiDownload } from 'react-icons/fi'
import Header from '../../components/common/Header'
import usePaymentConceptsStore from '../../stores/paymentConceptsStore'
import useAuthStore from '../../stores/authStore'
import AnimatedCard from '../../components/common/AnimatedCard'
import AnimatedButton from '../../components/common/AnimatedButton'
import FilterDropdown from '../../components/common/FilterDropdown'
import Swal from 'sweetalert2'

const PaymentConcepts = () => {
  const { usuario } = useAuthStore()
  const {
    conceptos,
    getConceptosFiltrados,
    getEstadisticasConceptos,
    crearConcepto,
    actualizarConcepto,
    activarConcepto,
    desactivarConcepto,
    eliminarConcepto,
    filtros,
    setFiltros
  } = usePaymentConceptsStore()

  const [showModal, setShowModal] = useState(false)
  const [editingConcept, setEditingConcept] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'pension',
    monto: '',
    obligatorio: false,
    fechaVencimiento: '',
    descripcion: ''
  })

  const conceptosFiltrados = getConceptosFiltrados()
  const estadisticas = getEstadisticasConceptos()

  const categorias = [
    { value: 'pension', label: 'Pensión', color: 'blue' },
    { value: 'matricula', label: 'Matrícula', color: 'green' },
    { value: 'articulo', label: 'Artículo', color: 'purple' },
    { value: 'actividad', label: 'Actividad', color: 'orange' },
    { value: 'evento', label: 'Evento', color: 'pink' },
    { value: 'alimentacion', label: 'Alimentación', color: 'yellow' }
  ]

  const getCategoriaColor = (categoria) => {
    const cat = categorias.find(c => c.value === categoria)
    return cat ? cat.color : 'gray'
  }

  const getCategoriaLabel = (categoria) => {
    const cat = categorias.find(c => c.value === categoria)
    return cat ? cat.label : categoria
  }

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.monto) {
      Swal.fire('Error', 'Nombre y monto son obligatorios', 'error')
      return
    }

    const conceptoData = {
      ...formData,
      monto: parseFloat(formData.monto),
      fechaVencimiento: formData.fechaVencimiento || null
    }

    if (editingConcept) {
      actualizarConcepto(editingConcept.id, conceptoData)
      Swal.fire('Actualizado', 'Concepto actualizado correctamente', 'success')
    } else {
      crearConcepto(conceptoData)
      Swal.fire('Creado', 'Concepto creado correctamente', 'success')
    }

    setShowModal(false)
    setEditingConcept(null)
    setFormData({
      nombre: '',
      categoria: 'pension',
      monto: '',
      obligatorio: false,
      fechaVencimiento: '',
      descripcion: ''
    })
  }

  const handleEdit = (concepto) => {
    setEditingConcept(concepto)
    setFormData({
      nombre: concepto.nombre,
      categoria: concepto.categoria,
      monto: concepto.monto.toString(),
      obligatorio: concepto.obligatorio,
      fechaVencimiento: concepto.fechaVencimiento || '',
      descripcion: concepto.descripcion
    })
    setShowModal(true)
  }

  const handleDelete = async (concepto) => {
    const result = await Swal.fire({
      title: '¿Eliminar concepto?',
      text: `Se eliminará "${concepto.nombre}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      eliminarConcepto(concepto.id)
      Swal.fire('Eliminado', 'Concepto eliminado correctamente', 'success')
    }
  }

  const handleToggleActive = (concepto) => {
    if (concepto.activo) {
      desactivarConcepto(concepto.id)
    } else {
      activarConcepto(concepto.id)
    }
  }

  const exportToCSV = () => {
    const headers = ['Nombre', 'Categoría', 'Monto', 'Obligatorio', 'Activo', 'Fecha Vencimiento', 'Descripción']
    const csvContent = [
      headers.join(','),
      ...conceptosFiltrados.map(concepto => [
        concepto.nombre,
        getCategoriaLabel(concepto.categoria),
        concepto.monto,
        concepto.obligatorio ? 'Sí' : 'No',
        concepto.activo ? 'Activo' : 'Inactivo',
        concepto.fechaVencimiento || '',
        concepto.descripcion
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conceptos_pago_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Conceptos de Pago</h1>
        <div className="flex gap-3">
          <AnimatedButton
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <FiDownload className="mr-2" />
            Exportar
          </AnimatedButton>
          <AnimatedButton
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Nuevo Concepto
          </AnimatedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedCard className="bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Conceptos</p>
              <p className="text-2xl font-bold text-blue-800">{estadisticas.total}</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Activos</p>
              <p className="text-2xl font-bold text-green-800">{estadisticas.activos}</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-orange-50 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Obligatorios</p>
              <p className="text-2xl font-bold text-orange-800">{estadisticas.obligatorios}</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Vencidos</p>
              <p className="text-2xl font-bold text-red-800">{estadisticas.vencidos}</p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Lista de Conceptos</h2>
          
          <div className="flex gap-3">
            <FilterDropdown
              label="Categoría"
              value={filtros.categoria}
              onChange={(value) => setFiltros({ categoria: value })}
              options={[
                { value: 'todos', label: 'Todas' },
                ...categorias.map(cat => ({ value: cat.value, label: cat.label }))
              ]}
            />
            
            <FilterDropdown
              label="Estado"
              value={filtros.activo}
              onChange={(value) => setFiltros({ activo: value })}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'activo', label: 'Activos' },
                { value: 'inactivo', label: 'Inactivos' }
              ]}
            />

            <FilterDropdown
              label="Tipo"
              value={filtros.obligatorio}
              onChange={(value) => setFiltros({ obligatorio: value })}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'obligatorio', label: 'Obligatorios' },
                { value: 'opcional', label: 'Opcionales' }
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Monto</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Vencimiento</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {conceptosFiltrados.map((concepto) => (
                <motion.tr
                  key={concepto.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{concepto.nombre}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getCategoriaColor(concepto.categoria)}-100 text-${getCategoriaColor(concepto.categoria)}-800`}>
                      {getCategoriaLabel(concepto.categoria)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">S/. {concepto.monto.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      concepto.obligatorio ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {concepto.obligatorio ? 'Obligatorio' : 'Opcional'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {concepto.fechaVencimiento ? new Date(concepto.fechaVencimiento).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      concepto.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {concepto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(concepto)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Editar"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleActive(concepto)}
                        className={`p-1 ${concepto.activo ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800'}`}
                        title={concepto.activo ? 'Desactivar' : 'Activar'}
                      >
                        {concepto.activo ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(concepto)}
                        className="text-red-600 hover:text-red-800 p-1"
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
      </AnimatedCard>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingConcept ? 'Editar Concepto' : 'Nuevo Concepto'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Pensión Febrero 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto (S/.)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="350.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento (Opcional)</label>
                <input
                  type="date"
                  value={formData.fechaVencimiento}
                  onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Descripción del concepto de pago"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="obligatorio"
                  checked={formData.obligatorio}
                  onChange={(e) => setFormData({...formData, obligatorio: e.target.checked})}
                  className="mr-2 focus:ring-blue-500"
                />
                <label htmlFor="obligatorio" className="text-sm text-gray-700">
                  Es obligatorio
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingConcept(null)
                  setFormData({
                    nombre: '',
                    categoria: 'pension',
                    monto: '',
                    obligatorio: false,
                    fechaVencimiento: '',
                    descripcion: ''
                  })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingConcept ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  )
}

export default PaymentConcepts