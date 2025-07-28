import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiX, 
  FiHelpCircle, 
  FiPhone, 
  FiMail, 
  FiMessageCircle,
  FiBook,
  FiSettings,
  FiUsers,
  FiDollarSign,
  FiBarChart,
  FiFileText,
  FiChevronDown,
  FiChevronRight,
  FiExternalLink
} from 'react-icons/fi'
import useAuthStore from '../../stores/authStore'

const HelpModal = ({ isOpen, onClose }) => {
  const { rol } = useAuthStore()
  const [activeSection, setActiveSection] = useState('faq')
  const [expandedFaq, setExpandedFaq] = useState(null)

  const getFaqByRole = () => {
    const commonFaqs = [
      {
        id: 1,
        question: '¿Cómo cambio mi contraseña?',
        answer: 'Puedes cambiar tu contraseña desde tu menú de perfil en la esquina superior derecha. Haz clic en tu avatar, selecciona "Cambiar Contraseña" y sigue las instrucciones.'
      },
      {
        id: 2,
        question: '¿Cómo actualizo mi información de perfil?',
        answer: 'Desde el menú de perfil, selecciona "Editar Perfil". Podrás actualizar tu nombre, teléfono y dirección. El email no se puede cambiar por seguridad.'
      },
      {
        id: 3,
        question: '¿Qué hago si olvido mi contraseña?',
        answer: 'Contacta al administrador del sistema o envía un email a soporte@talentoscollege.edu para solicitar el restablecimiento de tu contraseña.'
      }
    ]

    const roleSpecificFaqs = {
      padre: [
        {
          id: 4,
          question: '¿Cómo veo las notas de mis hijos?',
          answer: 'Ve a la sección "Notas" en el menú principal. Podrás ver las calificaciones por bimestre y materia de todos tus hijos.'
        },
        {
          id: 5,
          question: '¿Cómo reviso la asistencia?',
          answer: 'En la sección "Asistencia" puedes ver el registro diario de entrada y salida de tus hijos, así como estadísticas de asistencia.'
        },
        {
          id: 6,
          question: '¿Cómo pago las pensiones?',
          answer: 'Ve a "Pagos" donde encontrarás todos los conceptos de pago, fechas de vencimiento y podrás subir comprobantes de pago.'
        }
      ],
      tutor: [
        {
          id: 4,
          question: '¿Cómo registro las notas de mis estudiantes?',
          answer: 'En la sección "Alumnos", selecciona un estudiante y podrás registrar sus calificaciones por materia y bimestre.'
        },
        {
          id: 5,
          question: '¿Cómo envío comunicados a los padres?',
          answer: 'Ve a "Comunicados" y selecciona "Crear Nuevo". Puedes elegir a qué padres enviar el comunicado y programar la fecha de envío.'
        }
      ],
      admin: [
        {
          id: 4,
          question: '¿Cómo gestiono los usuarios del sistema?',
          answer: 'En "Usuarios" puedes crear, editar y desactivar cuentas de padres, tutores y personal administrativo.'
        },
        {
          id: 5,
          question: '¿Cómo genero reportes?',
          answer: 'La sección "Reportes" te permite generar informes de asistencia, notas, pagos y estadísticas generales del colegio.'
        }
      ],
      entrada: [
        {
          id: 4,
          question: '¿Cómo registro la entrada de estudiantes?',
          answer: 'Usa el escáner QR para leer el código del estudiante. El sistema automáticamente registrará la hora de entrada.'
        },
        {
          id: 5,
          question: '¿Qué hago si el código QR no funciona?',
          answer: 'Puedes buscar manualmente al estudiante por nombre o código y registrar su asistencia de forma manual.'
        }
      ]
    }

    return [...commonFaqs, ...(roleSpecificFaqs[rol] || [])]
  }

  const getQuickLinksbyRole = () => {
    const links = {
      padre: [
        { icon: FiUsers, label: 'Mis Estudiantes', path: '/parent/students' },
        { icon: FiBarChart, label: 'Notas', path: '/parent/grades' },
        { icon: FiDollarSign, label: 'Pagos', path: '/parent/payments' },
        { icon: FiFileText, label: 'Comunicados', path: '/parent/communiques' }
      ],
      tutor: [
        { icon: FiUsers, label: 'Mis Alumnos', path: '/tutor/students' },
        { icon: FiFileText, label: 'Comunicados', path: '/tutor/communiques' },
        { icon: FiMessageCircle, label: 'Mensajes', path: '/tutor/messages' }
      ],
      admin: [
        { icon: FiUsers, label: 'Usuarios', path: '/admin/users' },
        { icon: FiBarChart, label: 'Reportes', path: '/admin/reports' },
        { icon: FiSettings, label: 'Configuración', path: '/admin/settings' },
        { icon: FiDollarSign, label: 'Pagos', path: '/admin/payments' }
      ],
      entrada: [
        { icon: FiUsers, label: 'Escáner QR', path: '/scanner/dashboard' }
      ]
    }

    return links[rol] || []
  }

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-talentos-primary to-talentos-secondary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FiHelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Centro de Ayuda</h2>
              <p className="text-blue-100 text-sm">¿En qué podemos ayudarte?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row max-h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="md:w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setActiveSection('faq')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'faq' ? 'bg-talentos-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiBook className="w-4 h-4" />
                <span>Preguntas Frecuentes</span>
              </button>
              <button
                onClick={() => setActiveSection('guides')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'guides' ? 'bg-talentos-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiSettings className="w-4 h-4" />
                <span>Guías Rápidas</span>
              </button>
              <button
                onClick={() => setActiveSection('contact')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'contact' ? 'bg-talentos-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiMessageCircle className="w-4 h-4" />
                <span>Contactar Soporte</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === 'faq' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preguntas Frecuentes
                </h3>
                <div className="space-y-3">
                  {getFaqByRole().map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {expandedFaq === faq.id ? (
                          <FiChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <FiChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-4 pb-4 text-gray-700 border-t border-gray-100">
                          <p className="pt-3">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'guides' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Accesos Rápidos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getQuickLinksbyRole().map((link, index) => {
                    const Icon = link.icon
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          // Navigate to the link
                          window.location.href = link.path
                          onClose()
                        }}
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-talentos-light rounded-full flex items-center justify-center group-hover:bg-talentos-primary group-hover:text-white transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-medium text-gray-900">{link.label}</h4>
                        </div>
                        <FiExternalLink className="w-4 h-4 text-gray-400 group-hover:text-talentos-primary" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {activeSection === 'contact' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contactar Soporte
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Teléfono */}
                    <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiPhone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Teléfono</h4>
                        <p className="text-sm text-gray-600 mb-2">Lun - Vie: 8:00 AM - 6:00 PM</p>
                        <a href="tel:+51987654321" className="text-blue-600 font-medium hover:underline">
                          +51 987 654 321
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FiMail className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Email</h4>
                        <p className="text-sm text-gray-600 mb-2">Respuesta en 24 horas</p>
                        <a href="mailto:soporte@talentoscollege.edu" className="text-green-600 font-medium hover:underline">
                          soporte@talentoscollege.edu
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Información del Sistema</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Versión:</strong> 1.0.0</p>
                      <p><strong>Última actualización:</strong> Enero 2025</p>
                      <p><strong>Tu rol:</strong> <span className="capitalize">{rol}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HelpModal