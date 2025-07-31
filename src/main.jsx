import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary'
import ErrorToastContainer from './components/error/ErrorToastContainer'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
      <ErrorToastContainer />
    </GlobalErrorBoundary>
  </React.StrictMode>,
)