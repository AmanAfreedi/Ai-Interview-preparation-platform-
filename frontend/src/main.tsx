import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AuthBootstrap } from '@/components/auth/auth-bootstrap'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthBootstrap>
      <App />
    </AuthBootstrap>
  </StrictMode>,
)
