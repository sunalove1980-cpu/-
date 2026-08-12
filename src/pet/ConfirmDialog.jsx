// 실수로 두 번 누른 게 아닌지 확인하는 작은 확인창. 예: 이미 기록한 건강기록을
// 다시 누르면 곧바로 취소해도 되는지 물어본다.
import './ConfirmDialog.css';

export default function ConfirmDialog({ title, description, confirmLabel = '기록 취소하기', cancelLabel = '그대로 두기', onConfirm, onDismiss }) {
  return (
    <div className="confirm-dialog__backdrop" onClick={onDismiss}>
      <div className="confirm-dialog" role="alertdialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <p className="confirm-dialog__title">{title}</p>
        {description && <p className="confirm-dialog__desc">{description}</p>}
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__btn confirm-dialog__btn--ghost" onClick={onDismiss}>
            {cancelLabel}
          </button>
          <button type="button" className="confirm-dialog__btn confirm-dialog__btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
