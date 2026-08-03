import { useApp } from '../../state/AppContext.jsx';
import './SaveToast.css';

export default function SaveToast() {
  const { saveStatus, errorMessage, actions } = useApp();

  if (errorMessage) {
    return (
      <div className="save-toast save-toast--error" role="alert">
        <span aria-hidden="true">⚠️</span>
        <span>{errorMessage}</span>
        <button type="button" onClick={actions.clearError} aria-label="오류 메시지 닫기">
          닫기
        </button>
      </div>
    );
  }

  if (saveStatus === 'saved') {
    return (
      <div className="save-toast save-toast--success" role="status">
        <span aria-hidden="true">✅</span>
        <span>저장되었습니다</span>
      </div>
    );
  }

  return null;
}
