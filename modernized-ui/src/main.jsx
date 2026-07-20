import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const isSlides = window.location.pathname.startsWith('/slides')
const isWeek8Material = window.location.pathname.startsWith('/slides/semana-8')
const Root = isWeek8Material
  ? lazy(() => import('./Presentation.jsx'))
  : isSlides
    ? lazy(() => import('./PresentationWeek7.jsx'))
    : lazy(() => import('./App.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div className="route-loading">Cargando…</div>}>
      <Root />
    </Suspense>
  </StrictMode>,
)
