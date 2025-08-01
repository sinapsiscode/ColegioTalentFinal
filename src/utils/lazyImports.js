import React from 'react'

// Utilidad para crear imports lazy con retry en caso de fallo
export const lazyWithRetry = (componentImport) => 
  React.lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    )

    try {
      const component = await componentImport()
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false')
      return component
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Actualizar la página una vez si hay error de carga
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true')
        window.location.reload()
      }
      throw error
    }
  })

// Lazy imports para componentes pesados comunes
export const ChartComponents = {
  AttendanceChart: lazyWithRetry(() => import('../components/reports/AttendanceChart')),
  GradesChart: lazyWithRetry(() => import('../components/reports/GradesChart')),
  PaymentChart: lazyWithRetry(() => import('../components/reports/PaymentChart')),
  MonthlyTrendChart: lazyWithRetry(() => import('../components/reports/MonthlyTrendChart')),
  StudentDistributionChart: lazyWithRetry(() => import('../components/reports/StudentDistributionChart')),
  InteractiveDashboard: lazyWithRetry(() => import('../components/charts/InteractiveDashboard')),
  ChartsDashboard: lazyWithRetry(() => import('../components/charts/ChartsDashboard'))
}

// Lazy imports para modales pesados
export const ModalComponents = {
  ImportStudentsModal: lazyWithRetry(() => import('../components/admin/ImportStudentsModal')),
  AssignChildrenModal: lazyWithRetry(() => import('../components/admin/AssignChildrenModal')),
  PaymentModal: lazyWithRetry(() => import('../components/payments/PaymentModal')),
  PaymentSimulationModal: lazyWithRetry(() => import('../components/payments/PaymentSimulationModal')),
  CourseModal: lazyWithRetry(() => import('../components/admin/CourseModal')),
  SectionModal: lazyWithRetry(() => import('../components/admin/SectionModal')),
  GradeManagementModal: lazyWithRetry(() => import('../components/tutor/GradeManagementModal')),
  StudentDetailModal: lazyWithRetry(() => import('../components/tutor/StudentDetailModal')),
  ExportModal: lazyWithRetry(() => import('../components/common/ExportModal'))
}

// Lazy imports para componentes de reportes
export const ReportComponents = {
  ReportGenerator: lazyWithRetry(() => import('../components/admin/ReportGenerator')),
  PaymentReports: lazyWithRetry(() => import('../components/admin/PaymentReports')),
  ReportCard: lazyWithRetry(() => import('../components/reports/ReportCard'))
}

// Lazy imports para componentes de QR/Scanner
export const ScannerComponents = {
  QRScanner: lazyWithRetry(() => import('../components/scanner/QRScanner')),
  QRGenerator: lazyWithRetry(() => import('../components/admin/QRGenerator')),
  StudentQRDisplay: lazyWithRetry(() => import('../components/common/StudentQRDisplay'))
}

// Lazy imports para componentes de mensajería
export const MessagingComponents = {
  ChatEnhanced: lazyWithRetry(() => import('../components/messaging/ChatEnhanced')),
  ConversationList: lazyWithRetry(() => import('../components/messaging/ConversationList')),
  MessageArea: lazyWithRetry(() => import('../components/messaging/MessageArea')),
  NewConversationModal: lazyWithRetry(() => import('../components/messaging/NewConversationModal'))
}

// Función para precargar múltiples componentes
export const preloadComponents = (components) => {
  components.forEach(component => {
    if (typeof component === 'function') {
      component()
    }
  })
}

// Hook para precargar componentes basado en la ruta actual
export const usePreloadComponents = (currentPath) => {
  React.useEffect(() => {
    // Precargar componentes según la ruta
    if (currentPath.includes('/reports')) {
      preloadComponents([
        () => import('../components/reports/AttendanceChart'),
        () => import('../components/reports/GradesChart'),
        () => import('../components/reports/PaymentChart')
      ])
    } else if (currentPath.includes('/messages')) {
      preloadComponents([
        () => import('../components/messaging/ChatEnhanced'),
        () => import('../components/messaging/MessageArea')
      ])
    } else if (currentPath.includes('/scanner')) {
      preloadComponents([
        () => import('../components/scanner/QRScanner'),
        () => import('../components/admin/QRGenerator')
      ])
    }
  }, [currentPath])
}

// Intersection Observer para lazy loading de imágenes
export const useLazyImages = () => {
  React.useEffect(() => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      })
    })

    const images = document.querySelectorAll('img.lazy')
    images.forEach(img => imageObserver.observe(img))

    return () => {
      images.forEach(img => imageObserver.unobserve(img))
    }
  }, [])
}