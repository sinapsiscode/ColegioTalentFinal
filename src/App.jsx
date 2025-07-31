import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from './stores/authStore'
import useNotificationsStore from './stores/notificationsStore'
import LoadingSpinner from './components/common/LoadingSpinner'
import ToastContainer from './components/common/ToastNotification'
import ErrorBoundary from './components/common/ErrorBoundary'

const Login = React.lazy(() => import('./views/Login'))
const ParentDashboard = React.lazy(() => import('./views/parent/Dashboard'))
const ParentAttendance = React.lazy(() => import('./views/parent/Attendance'))
const ParentMessages = React.lazy(() => import('./views/parent/Messages'))
const ParentCommuniques = React.lazy(() => import('./views/parent/Communiques'))
const ParentGrades = React.lazy(() => import('./views/parent/Grades'))
const ParentProfile = React.lazy(() => import('./views/parent/Profile'))
const ParentStudents = React.lazy(() => import('./views/parent/Students'))

const TutorDashboard = React.lazy(() => import('./views/tutor/Dashboard'))
const TutorStudents = React.lazy(() => import('./views/tutor/TutorStudents'))
const TutorMessages = React.lazy(() => import('./views/tutor/Messages'))
const TutorCommuniques = React.lazy(() => import('./views/tutor/Communiques'))
const TutorReports = React.lazy(() => import('./views/tutor/Reports'))
const TutorGrades = React.lazy(() => import('./views/tutor/Grades'))
const TutorCourses = React.lazy(() => import('./views/tutor/Courses'))
const TutorSchedules = React.lazy(() => import('./views/tutor/Schedules'))
const MySections = React.lazy(() => import('./views/tutor/MySections'))

const AdminDashboard = React.lazy(() => import('./views/admin/Dashboard'))
const AdminReports = React.lazy(() => import('./views/admin/Reports'))
const AdminUsers = React.lazy(() => import('./views/admin/Users'))
const AdminCommuniques = React.lazy(() => import('./views/admin/Communiques'))
const AdminPayments = React.lazy(() => import('./views/admin/Payments'))
const AdminPaymentConcepts = React.lazy(() => import('./views/admin/PaymentConcepts'))
const AdminTutorAttendance = React.lazy(() => import('./views/admin/TutorAttendance'))
const CoursesAndAssignments = React.lazy(() => import('./views/admin/CoursesAndAssignments'))
const CourseManagement = React.lazy(() => import('./views/admin/CourseManagement'))
const CoursesManagement = React.lazy(() => import('./views/admin/CoursesManagement'))
const AdminConfiguration = React.lazy(() => import('./views/admin/Configuration'))
const AttendanceControl = React.lazy(() => import('./views/admin/AttendanceControl'))
const PaymentManagement = React.lazy(() => import('./views/admin/PaymentManagement'))
const AdminAttendanceDashboard = React.lazy(() => import('./views/admin/AttendanceDashboard'))
const AdminAttendanceRegister = React.lazy(() => import('./views/admin/AttendanceRegister'))
const Sections = React.lazy(() => import('./views/admin/Sections'))
const AdminSchedules = React.lazy(() => import('./views/admin/Schedules'))
const AssignmentCenter = React.lazy(() => import('./views/admin/AssignmentCenter'))
const AsistenciaDashboard = React.lazy(() => import('./views/asistencia/Dashboard'))
const AsistenciaHistorial = React.lazy(() => import('./views/asistencia/Historial'))
const MensajesDashboard = React.lazy(() => import('./views/mensajes/Dashboard'))

const ParentPayments = React.lazy(() => import('./views/parent/Payments'))
const ParentNotifications = React.lazy(() => import('./views/parent/Notifications'))
const StudentProfile = React.lazy(() => import('./views/parent/StudentProfile'))
const NotificationCenter = React.lazy(() => import('./views/parent/NotificationCenter'))
const ParentSchedules = React.lazy(() => import('./views/parent/Schedules'))

const NotasDashboard = React.lazy(() => import('./views/notas/Dashboard'))
const ReportesDashboard = React.lazy(() => import('./views/reportes/Dashboard'))

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
        return '/asistencia'
      default:
        return '/login'
    }
  }
  
  return (
    <ErrorBoundary>
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
            <Route path="/parent/students" element={
              <PrivateRoute allowedRoles={['padre']}>
                <ParentStudents />
              </PrivateRoute>
            } />
            <Route path="/parent/student/:studentId" element={
              <PrivateRoute allowedRoles={['padre']}>
                <StudentProfile />
              </PrivateRoute>
            } />
            <Route path="/parent/payments" element={
              <PrivateRoute allowedRoles={['padre']}>
                <ParentPayments />
              </PrivateRoute>
            } />
            <Route path="/parent/notifications" element={
              <PrivateRoute allowedRoles={['padre']}>
                <ParentNotifications />
              </PrivateRoute>
            } />
            <Route path="/parent/notification-center" element={
              <PrivateRoute allowedRoles={['padre']}>
                <NotificationCenter />
              </PrivateRoute>
            } />
            <Route path="/parent/schedules" element={
              <PrivateRoute allowedRoles={['padre']}>
                <ParentSchedules />
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
            <Route path="/tutor/reports" element={
              <PrivateRoute allowedRoles={['tutor']}>
                <TutorReports />
              </PrivateRoute>
            } />
            <Route path="/tutor/grades" element={
              <PrivateRoute allowedRoles={['tutor']}>
                <TutorGrades />
              </PrivateRoute>
            } />
            <Route path="/tutor/courses" element={
              <PrivateRoute allowedRoles={['tutor']}>
                <TutorCourses />
              </PrivateRoute>
            } />
            <Route path="/tutor/schedules" element={
              <PrivateRoute allowedRoles={['tutor']}>
                <TutorSchedules />
              </PrivateRoute>
            } />
            <Route path="/tutor/sections" element={
              <PrivateRoute allowedRoles={['tutor']}>
                <MySections />
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
                <PaymentManagement />
              </PrivateRoute>
            } />
            <Route path="/admin/tutor-attendance" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminTutorAttendance />
              </PrivateRoute>
            } />
            <Route path="/admin/tutor-assignments" element={
              <PrivateRoute allowedRoles={['admin']}>
                <CoursesAndAssignments />
              </PrivateRoute>
            } />
            <Route path="/admin/course-management" element={
              <PrivateRoute allowedRoles={['admin']}>
                <CourseManagement />
              </PrivateRoute>
            } />
            <Route path="/admin/configuration" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminConfiguration />
              </PrivateRoute>
            } />
            <Route path="/admin/attendance" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminAttendanceDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/attendance/register" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminAttendanceRegister />
              </PrivateRoute>
            } />
            <Route path="/admin/sections" element={
              <PrivateRoute allowedRoles={['admin']}>
                <Sections />
              </PrivateRoute>
            } />
            <Route path="/admin/courses-management" element={
              <PrivateRoute allowedRoles={['admin']}>
                <CoursesManagement />
              </PrivateRoute>
            } />
            <Route path="/admin/schedules" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminSchedules />
              </PrivateRoute>
            } />
            <Route path="/admin/assignments" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AssignmentCenter />
              </PrivateRoute>
            } />
            
            {/* Rutas para Personal de Entrada */}
            <Route path="/scanner/dashboard" element={
              <PrivateRoute allowedRoles={['entrada']}>
                <ScannerDashboard />
              </PrivateRoute>
            } />
            
            {/* Rutas del Sistema de Asistencia */}
            <Route path="/asistencia" element={
              <PrivateRoute allowedRoles={['admin', 'entrada']}>
                {rol === 'admin' ? <AttendanceControl /> : <AsistenciaDashboard />}
              </PrivateRoute>
            } />
            <Route path="/asistencia/scanner" element={
              <PrivateRoute allowedRoles={['admin', 'entrada']}>
                <ScannerDashboard />
              </PrivateRoute>
            } />
            <Route path="/asistencia/registro" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminAttendanceRegister />
              </PrivateRoute>
            } />
            <Route path="/asistencia/historial" element={
              <PrivateRoute allowedRoles={['admin', 'entrada']}>
                <AsistenciaHistorial />
              </PrivateRoute>
            } />
            
            {/* Rutas del Sistema de Mensajes */}
            <Route path="/mensajes" element={
              <PrivateRoute allowedRoles={['admin', 'padre', 'tutor']}>
                <MensajesDashboard />
              </PrivateRoute>
            } />
            <Route path="/mensajes/:usuarioId" element={
              <PrivateRoute allowedRoles={['admin', 'padre', 'tutor']}>
                <MensajesDashboard />
              </PrivateRoute>
            } />
            
            {/* Rutas del Sistema de Notas */}
            <Route path="/notas" element={
              <PrivateRoute allowedRoles={['admin', 'padre', 'tutor']}>
                <NotasDashboard />
              </PrivateRoute>
            } />
            <Route path="/notas/:bimestre" element={
              <PrivateRoute allowedRoles={['admin', 'padre', 'tutor']}>
                <NotasDashboard />
              </PrivateRoute>
            } />
            
            {/* Rutas del Sistema de Reportes */}
            <Route path="/reportes" element={
              <PrivateRoute allowedRoles={['admin']}>
                <ReportesDashboard />
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
        
          {/* Toast Notifications Container */}
          <ToastContainer />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App