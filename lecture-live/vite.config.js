import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Netlify 루트 도메인 배포 기준. 해시 라우팅을 쓰므로 별도 리다이렉트 설정이 필요 없다.
export default defineConfig({
  base: '/',
  plugins: [react()],
});
