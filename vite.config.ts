import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 本项目的 `/api/*` 由 Netlify Functions 提供。
  // 本地开发建议使用 `netlify dev`（会同时启动前端与 Functions）。
})
