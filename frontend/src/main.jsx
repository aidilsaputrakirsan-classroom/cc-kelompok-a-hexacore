import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', () => {
    throw '(debug) skipping full reload'
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
