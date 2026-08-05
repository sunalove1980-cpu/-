import { useEffect, useState } from 'react';
import { isConfigured } from './firebase';
import HomePage from './pages/HomePage';
import ScreenPage from './pages/ScreenPage';
import WritePage from './pages/WritePage';
import ArchivePage from './pages/ArchivePage';
import SetupGuide from './pages/SetupGuide';

// 해시 기반 라우팅: 정적 호스팅에서 리다이렉트 설정 없이 동작하고,
// QR 코드에 담긴 링크(#/write)도 그대로 열린다.
function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash.replace(/^#/, '') || '/';
}

export default function App() {
  const route = useHashRoute();

  if (!isConfigured) return <SetupGuide />;

  if (route.startsWith('/screen')) return <ScreenPage />;
  if (route.startsWith('/write')) return <WritePage />;
  if (route.startsWith('/archive')) return <ArchivePage />;
  return <HomePage />;
}
