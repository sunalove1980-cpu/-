import { useEffect } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import './BadgeToast.css';

export default function BadgeToast() {
  const { badgeToast, actions } = useApp();

  useEffect(() => {
    if (!badgeToast) return undefined;
    const timer = setTimeout(actions.dismissBadgeToast, 3600);
    return () => clearTimeout(timer);
  }, [badgeToast, actions]);

  if (!badgeToast) return null;

  return (
    <div className="badge-toast" role="status">
      <div className="badge-toast__icon" aria-hidden="true">
        {badgeToast.icon}
      </div>
      <div>
        <p className="badge-toast__title">새 배지 획득!</p>
        <p className="badge-toast__name">{badgeToast.name}</p>
      </div>
      <button type="button" onClick={actions.dismissBadgeToast} aria-label="배지 알림 닫기">
        ✕
      </button>
    </div>
  );
}
