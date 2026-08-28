import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages는 https://<사용자>.github.io/<저장소명>/ 처럼 하위 경로에 배포되므로
// base를 그에 맞게 바꿔야 한다. Vercel/Netlify 등 루트 도메인 배포나 로컬 개발은 '/'를 그대로 사용한다.
// GitHub Actions 배포 워크플로에서 DEPLOY_TARGET=gh-pages 환경변수를 설정해 전환한다.
const base = process.env.DEPLOY_TARGET === 'gh-pages' ? '/-/' : '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
});
