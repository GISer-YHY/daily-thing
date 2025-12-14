import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 这里的代理设置仅对本地开发 (npm run dev) 有效
      // 生产环境 (Netlify) 使用 netlify.toml 配置
      '/api': {
        target: 'http://8.148.218.240:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})