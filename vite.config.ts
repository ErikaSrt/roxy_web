import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const base = process.env.VITE_BASE_PATH?.trim() || '/'

if (!base.startsWith('/') || !base.endsWith('/')) {
  throw new Error('VITE_BASE_PATH deve iniciar e terminar com "/" (ex.: /roxy_web/).')
}

export default defineConfig({
  base,
  plugins: [react()],
})
