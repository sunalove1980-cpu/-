import { useRegisterSW } from 'virtual:pwa-register/react';
import './UpdatePrompt.css';

// 새 버전의 서비스워커가 대기 중이면 사용자에게 업데이트를 안내하고,
// 오프라인 준비가 완료되면 짧게 알려준다.
export default function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="update-prompt" role="status">
      {needRefresh ? (
        <>
          <span>새로운 버전이 있습니다.</span>
          <button type="button" className="update-prompt__cta" onClick={() => updateServiceWorker(true)}>
            업데이트
          </button>
        </>
      ) : (
        <span>오프라인에서도 사용할 준비가 되었습니다.</span>
      )}
      <button type="button" aria-label="알림 닫기" onClick={close} className="update-prompt__close">
        ✕
      </button>
    </div>
  );
}
