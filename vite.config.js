import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages는 https://<user>.github.io/<repo>/ 경로로 서비스되므로
// 저장소 이름을 base로 지정해야 정적 자산 경로가 올바르게 해석된다.
export default defineConfig({
  base: '/TS_BookPage/',
  plugins: [react()],
})
