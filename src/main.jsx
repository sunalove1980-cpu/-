import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// registerType: 'autoUpdate' 설정과 짝을 이룬다 — 새 버전이 배포되면 백그라운드에서
// 곧바로 새 서비스워커를 활성화해 두고, 사용자가 앱을 다시 열 때(다음 네비게이션)
// 별도 확인 없이 최신 버전이 뜨도록 한다. 화면에 보이는 안내는 따로 없다.
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
