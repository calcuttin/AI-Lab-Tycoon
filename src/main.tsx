import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

async function mount() {
  // Keep the isolated scene study and its fixture data out of production builds.
  // Import App only on the normal path, so the study never opens the saved game.
  const Component = import.meta.env.DEV && new URLSearchParams(location.search).get('office-study') === '1'
    ? (await import('./dev/OfficeStudy')).default
    : (await import('./App')).default
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Component />
    </StrictMode>,
  )
}

void mount()
