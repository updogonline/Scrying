import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Scrying/' : '/',
  plugins: [react()],
  server: {
    host: true,
    cors: true,
    allowedHosts: ['.trycloudflare.com']
  }
}))