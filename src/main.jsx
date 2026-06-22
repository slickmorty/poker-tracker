import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Vazirmatn — self-hosted (no external CDN). Load a few weights.
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/700.css'

import './styles.css'
// React Multi Date Picker dark theming (RTL-friendly)
import 'react-multi-date-picker/styles/backgrounds/bg-dark.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
