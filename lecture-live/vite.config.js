import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages에서는 https://<사용자>.github.io/<저장소명>/live/ 경로에 배포되므로 base를 바꾼다.
// Netlify 등 루트 도메인 배포나 로컬 개발은 '/'를 그대로 사용한다.
const base = process.env.DEPLOY_TARGET === 'gh-pages' ? '/-/live/' : '/';

// 해시 라우팅을 쓰므로 별도 리다이렉트 설정이 필요 없다.
export default defineConfig({
  base,
  plugins: [react()],
});
