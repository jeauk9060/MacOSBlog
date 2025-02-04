import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 프록시 추가한 부분
  server: {
    proxy: {
      "/notion-api": {
        target: "https://api.notion.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/notion-api/, ""),
        secure: false, // HTTPS 인증서 오류 방지 (필요할 경우)
      },
    },
  },
})
