import { useEffect, useState } from 'react';
import { isConfigured } from './firebase';
import HomePage from './pages/HomePage';
import ScreenPage from './pages/ScreenPage';
import WritePage from './pages/WritePage';
import ArchivePage from './pages/ArchivePage';
import SetupGuide from './pages/SetupGuide';

// 해시 기반 라우팅 + 쿼리 문자열 파싱.
// 정적 호스팅에서 리다이렉트 설정 없이 동작하고, QR 코드에 담긴 링크
// (#/write?s=세션ID)도 그대로 열린다.
function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  return { path: path || '/', params: Object.fromEntries(new URLSearchParams(qs || '')) };
}

function useHashRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export default function App() {
  const { path, params } = useHashRoute();

  if (!isConfigured) return <SetupGuide />;

  if (path.startsWith('/screen')) return <ScreenPage sessionId={params.s} />;
  if (path.startsWith('/write')) return <WritePage sessionId={params.s} />;
  if (path.startsWith('/archive')) return <ArchivePage />;
  return <HomePage />;
}
