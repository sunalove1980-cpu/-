import './BottomSheet.css';

export default function BottomSheet({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="bottom-sheet__overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet__header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="bottom-sheet__body">{children}</div>
      </div>
    </div>
  );
}
