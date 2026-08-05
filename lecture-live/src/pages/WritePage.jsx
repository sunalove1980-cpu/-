import { useEffect, useRef, useState } from 'react';
import { postMessage, subscribeToDate } from '../lib/messages';
import { formatDateKey, formatTime, todayKey } from '../lib/dates';
import { colorForName } from '../lib/colors';

const NAME_KEY = 'lecture-live:name';
const MAX_LEN = 300;

// 참여자 페이지: QR로 접속한 사람이 이름과 글을 입력하는 화면 (모바일 우선)
export default function WritePage() {
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) || '');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const textRef = useRef(null);
  const date = todayKey();

  useEffect(() => {
    const unsub = subscribeToDate(date, setMessages, (err) => setError(err.message));
    return unsub;
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      localStorage.setItem(NAME_KEY, name.trim());
      await postMessage({ date, name, text: trimmed });
      setText('');
      setSent(true);
      setTimeout(() => setSent(false), 2000);
      textRef.current?.focus();
    } catch (err) {
      setError(`전송에 실패했습니다: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="write">
      <header className="write-header">
        <h1>✍️ 글 남기기</h1>
        <p>{formatDateKey(date)}</p>
      </header>

      <form className="write-form" onSubmit={handleSubmit}>
        <label className="write-label" htmlFor="name">이름 (비워두면 익명)</label>
        <input
          id="name"
          className="write-input"
          type="text"
          value={name}
          maxLength={20}
          placeholder="예: 홍길동"
          onChange={(e) => setName(e.target.value)}
        />

        <label className="write-label" htmlFor="text">하고 싶은 말</label>
        <textarea
          id="text"
          ref={textRef}
          className="write-textarea"
          value={text}
          maxLength={MAX_LEN}
          rows={4}
          placeholder="질문, 소감, 한 줄 생각 등 자유롭게 적어주세요"
          onChange={(e) => setText(e.target.value)}
        />
        <div className="write-meta">
          <span>{text.length} / {MAX_LEN}</span>
          {sent && <span className="write-sent">✅ 화면에 표시됐어요!</span>}
        </div>

        {error && <p className="error-banner">{error}</p>}

        <button className="write-submit" type="submit" disabled={!text.trim() || sending}>
          {sending ? '보내는 중…' : '보내기 🚀'}
        </button>
      </form>

      <section className="write-feed">
        <h2>오늘 올라온 글 ({messages.length})</h2>
        <ul>
          {[...messages].reverse().map((m) => (
            <li key={m.id} className="feed-item" style={{ '--accent': colorForName(m.name) }}>
              <span className="feed-name">{m.name}</span>
              <span className="feed-time">{formatTime(m.createdAt)}</span>
              <p className="feed-text">{m.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
