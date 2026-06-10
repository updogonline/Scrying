import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    cors: true,
    allowedHosts: ['arranged-ridge-dates-advisors.trycloudflare.com']
  },
  preview: {
    host: true,
    cors: true,
    allowedHosts: ['arranged-ridge-dates-advisors.trycloudflare.com']
  }
})