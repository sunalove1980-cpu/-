import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages는 https://<사용자>.github.io/<저장소명>/ 처럼 하위 경로에 배포되므로
// base를 그에 맞게 바꿔야 한다. Vercel/Netlify 등 루트 도메인 배포나 로컬 개발은 '/'를 그대로 사용한다.
// GitHub Actions 배포 워크플로에서 DEPLOY_TARGET=gh-pages 환경변수를 설정해 전환한다.
const base = process.env.DEPLOY_TARGET === 'gh-pages' ? '/-/' : '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      // 새 버전이 배포되면 백그라운드에서 곧바로 새 서비스워커를 활성화한다.
      // 열려 있는 탭을 바로 바꿔치기하진 않지만(사용 중 화면이 갑자기 리셋되지 않도록),
      // 앱을 완전히 종료했다가 다시 열면(=새 네비게이션) 별도 확인 없이 최신 버전으로 열린다.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/favicon-16.png', 'icons/favicon-32.png', 'icons/apple-touch-icon.png'],
      manifest: {
        id: base,
        name: '감상노트 - 영화·책 기록',
        short_name: '감상노트',
        description: '내가 본 영화·드라마와 읽은 책의 줄거리, 별점, 인상 깊은 장면을 사진과 음성으로 기록하는 앱',
        lang: 'ko',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#f1faf7',
        theme_color: '#1c9683',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 오프라인에서도 앱 셸과 정적 자산이 열리도록 프리캐시하고, 문서 요청은 SPA fallback으로 처리한다.
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        // Pretendard Variable 폰트(~2MB)가 기본 2MB 한도에 걸리지 않도록 여유를 둔다.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'gn-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
