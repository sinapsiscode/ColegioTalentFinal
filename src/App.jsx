import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from './stores/authStore'
import useNotificationsStore from './stores/notificationsStore'
import LoadingSpinner from './components/common/LoadingSpinner'

const Login = React.lazy(() => import('./views/Login'))
const ParentDashboard = React.lazy(() => import('./views/parent/Dashboard'))
const ParentAttendance = React.lazy(() => import('./views/parent/Attendance'))
const ParentMessages = React.lazy(() => import('./views/parent/Messages'))
const ParentCommuniques = React.lazy(() => import('./views/parent/Communiques'))
const ParentGrades = React.lazy(() => import('./views/parent/Grades'))
const ParentProfile = React.lazy(() => import('./views/parent/Profile'))

const TutorDashboard = React.lazy(() => import('./views/tutor/Dashboard'))
const TutorStudents = React.lazy(() => import('./views/tutor/TutorStudents'))
const TutorMessages = React.lazy(() => import('./views/tutor/Messages'))
const TutorCommuniques = React.lazy(() => import('./views/tutor/Communiques'))

const AdminDashboard = React.lazy(() => import('./views/admin/Dashboard'))
const AdminReports = React.lazy(() => import('./views/admin/Reports'))
const AdminUsers = React.lazy(() => import('./views/admin/Users'))
const AdminCommuniques = React.lazy(() => import('./views/admin/Communiques'))
const AdminPayments = React.lazy(() => import('./views/admin/Payments'))
const AdminPaymentConcepts = React.lazy(() => import('./views/admin/PaymentConcepts'))

const ParentPayments = React.lazy(() => import('./views/parent/Payments'))

const ScannerDashboard = React.lazy(() => import('./views/scanner/Dashboard'))

function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, rol } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(rol)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return children
}

function LoadingFallback() {
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingSpinner size="lg" />
    </motion.div>
  )
}

function App() {
  const { isAuthenticated, rol } = useAuthStore()
  const { iniciarSimulacion } = useNotificationsStore()
  
  useEffect(() => {
    if (isAuthenticated) {
      iniciarSimulacion()
    }
  }, [isAuthenticated, iniciarSimulacion])
  
  const getDefaultRoute = () => {
    switch (rol) {
      case 'padre':
        return '/parent/dashboard'
      case 'tutor':
        return '/tutor/dashboard'
      case 'admin':
        return '/admin/dashboard'
      case 'entrada':
        return '/scanner/dashboard'
      default:
        return '/login'
    }
  }
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              isAuthenticated ? 
                <Navigate to={getDefaultRoute()} replace /> : 
                <Navigate to="/login" replace />
            } />
            
            {/* Rutas para Padres */}
            <Route path="/parent/dashboard" element={
              <PrivateRoute allowedRoles={['padre']}>
                <ParentDashboard />
              </PrivateRoute>
            } />
            <Route path="/parent/attendance/:studentId?" element={
              <PrivateRoute allowedRoles={['padre']}>
                <ParentAttendance />
              </PrivateRoute>
            } />
            <Route path="/parent/messages" element={
              <PrivateRoute allowedRoles={['padre']}>
                <ParentMessages />
              </PrivateRoute>
            } />
            <Route path="/parent/communiques" element={
              <PrivateRoute allowedRoles={['padre']}>
                <ParentCommuniques />
              </PrivateRoute>
            } />
            <Route path="/parent/grades/:studentId?" element={
              <PrivateRoute allowedRoles={['padre']}>
                <ParentGrades />
              </PrivateRoute>
            } />
            <Route path="/parent/profile/:studentId?" element={
              <PrivateRoute allowedRoles={['padre']}>
                <ParentProfile />
              </PrivateRoute>
            } />
            <Route path="/parent/payments" element={
              <PrivateRoute allowedRoles={['padre']}>
                <ParentPayments />
              </PrivateRoute>
            } />
            
            {/* Rutas para Tutores */}
            <Route path="/tutor/dashboard" element={
              <PrivateRoute allowedRoles={['tutor']}>
                <TutorDashboard />
              </PrivateRoute>
            } />
            <Route path="/tutor/students" element={
              <PrivateRoute allowedRoles={['tutor']}>
                <TutorStudents />
              </PrivateRoute>
            } />
            <Route path="/tutor/messages" element={
              <PrivateRoute allowedRoles={['tutor']}>
                <TutorMessages />
              </PrivateRoute>
            } />
            <Route path="/tutor/communiques" element={
              <PrivateRoute allowedRoles={['tutor']}>
                <TutorCommuniques />
              </PrivateRoute>
            } />
            
            {/* Rutas para Administración */}
            <Route path="/admin/dashboard" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/reports" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminReports />
              </PrivateRoute>
            } />
            <Route path="/admin/users" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminUsers />
              </PrivateRoute>
            } />
            <Route path="/admin/communiques" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminCommuniques />
              </PrivateRoute>
            } />
            <Route path="/admin/payments" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminPayments />
              </PrivateRoute>
            } />
            <Route path="/admin/payment-concepts" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminPaymentConcepts />
              </PrivateRoute>
            } />
            
            {/* Rutas para Personal de Entrada */}
            <Route path="/scanner/dashboard" element={
              <PrivateRoute allowedRoles={['entrada']}>
                <ScannerDashboard />
              </PrivateRoute>
            } />
            
            {/* Ruta de error */}
            <Route path="/unauthorized" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                  <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
                </div>
              </div>
            } />
            
            {/* Ruta 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-gray-600">Página no encontrada</p>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

export default App