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
      // 새 버전이 배포되면 즉시 덮어쓰지 않고 사용자에게 업데이트 여부를 물어본다 (UpdatePrompt 컴포넌트).
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'icons/favicon-16.png', 'icons/favicon-32.png', 'icons/apple-touch-icon.png'],
      manifest: {
        id: base,
        name: '건강 퀘스트',
        short_name: '건강퀘스트',
        description: '습관을 체크하면 경험치와 코인을 얻고 레벨이 오르는 게임형 건강 습관 관리 앱',
        lang: 'ko',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#14102b',
        theme_color: '#5b21b6',
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
