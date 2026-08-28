import { useEffect, useRef } from 'react';
import './ChatLog.css';

export default function ChatLog({ open, messages, onClose }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages.length]);

  if (!open) return null;

  return (
    <div className="chat-log__overlay" onClick={onClose}>
      <div className="chat-log" onClick={(e) => e.stopPropagation()}>
        <div className="chat-log__header">
          <h2>대화 기록</h2>
          <button type="button" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="chat-log__list" ref={listRef}>
          {messages.length === 0 && <p className="chat-log__empty">아직 나눈 대화가 없어요.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`chat-log__bubble chat-log__bubble--${m.role}`}>
              {m.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
