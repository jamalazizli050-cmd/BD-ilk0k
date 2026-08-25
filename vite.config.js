import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Обычный Vite + React. Ничего лишнего.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
})
