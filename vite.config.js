import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mi-princesa/', // Cambia "mi-princesa" por el nombre de tu repositorio
})