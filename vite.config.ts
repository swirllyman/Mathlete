import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths, so the same build works from the domain root, from a
  // GitHub Pages project subpath (/Mathlete/), or opened straight off disk.
  base: './',
  plugins: [react()],
})
