import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import './UpdatePrompt.css';

// 새 버전이 배포되면 즉시 덮어쓰지 않고 사용자에게 물어본 뒤 갱신한다.
export default function UpdatePrompt() {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [updateFn, setUpdateFn] = useState(null);

  useEffect(() => {
    const update = registerSW({
      immediate: true,
      onNeedRefresh: () => setNeedsRefresh(true),
    });
    setUpdateFn(() => update);
  }, []);

  if (!needsRefresh) return null;

  return (
    <div className="update-prompt" role="status">
      <p>새로운 버전이 있어요.</p>
      <button
        type="button"
        onClick={() => {
          updateFn?.(true);
          setNeedsRefresh(false);
        }}
      >
        새로고침
      </button>
    </div>
  );
}
