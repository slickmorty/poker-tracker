import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static site. base: './' so it works from any subpath (GitHub Pages project sites).
export default defineConfig({
  plugins: [react()],
  base: '/poker-tracker/',
  build: { outDir: 'dist', sourcemap: false },
})
