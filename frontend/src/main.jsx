import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', () => {
    throw '(debug) skipping full reload'
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
