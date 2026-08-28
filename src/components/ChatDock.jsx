import { useState } from 'react';
import './ChatDock.css';

export default function ChatDock({ mode, thinking, onSend, onOpenLog, messageCount }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const text = value.trim();
    if (!text || thinking) return;
    onSend(text);
    setValue('');
  }

  return (
    <form className={`chat-dock chat-dock--${mode?.toLowerCase()}`} onSubmit={handleSubmit}>
      <button
        type="button"
        className="chat-dock__log-btn"
        onClick={onOpenLog}
        aria-label="대화 기록 보기"
      >
        💬
        {messageCount > 0 && <span className="chat-dock__count">{messageCount}</span>}
      </button>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={mode === 'T' ? '무슨 일인지 짧게 써.' : '무슨 고민이야? 편하게 적어봐'}
        maxLength={300}
        disabled={thinking}
      />

      <button type="submit" className="chat-dock__send" disabled={thinking || !value.trim()}>
        {thinking ? '생각 중…' : '보내기'}
      </button>
    </form>
  );
}
