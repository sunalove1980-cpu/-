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
      // 새 버전이 배포되면 사용자가 "업데이트" 버튼을 누르지 않아도 곧바로 최신 버전을 받도록 자동 갱신한다.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/favicon-16.png', 'icons/favicon-32.png', 'icons/apple-touch-icon.png'],
      manifest: {
        id: base,
        name: '포켓펫',
        short_name: '포켓펫',
        description: '아기 펫이 아늑한 방 안에서 스스로 숨쉬고 걷고 잠드는 다마고치형 반려 펫 앱',
        lang: 'ko',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#a9dcf5',
        theme_color: '#a9dcf5',
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
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'hq-images',
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
