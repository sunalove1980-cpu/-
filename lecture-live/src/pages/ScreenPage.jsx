import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { subscribeToDate, deleteMessage } from '../lib/messages';
import { formatDateKey, formatTime, todayKey } from '../lib/dates';
import { colorForName } from '../lib/colors';

// 발표 화면: 프로젝터에 띄워두는 페이지.
// 왼쪽에 QR 코드, 오른쪽에 오늘 날짜의 글이 실시간으로 쌓인다.
export default function ScreenPage() {
  const [date, setDate] = useState(todayKey);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  // 자정을 넘기면 자동으로 다음 날짜로 전환
  useEffect(() => {
    const timer = setInterval(() => {
      const now = todayKey();
      setDate((prev) => (prev === now ? prev : now));
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMessages([]);
    const unsub = subscribeToDate(
      date,
      (list) => {
        setMessages(list);
        setError(null);
      },
      (err) => setError(err.message),
    );
    return unsub;
  }, [date]);

  // 새 글이 오면 목록 맨 아래로 자동 스크롤
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  // QR에 담을 참여자 페이지 주소
  const writeUrl = useMemo(() => {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}#/write`;
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('이 글을 삭제할까요?')) await deleteMessage(id);
  };

  return (
    <div className="screen">
      <aside className="screen-side">
        <a className="screen-home" href="#/">← 처음으로</a>
        <h1 className="screen-title">강의 라이브 보드</h1>
        <p className="screen-date">{formatDateKey(date)}</p>
        <div className="screen-qr">
          <QRCodeSVG value={writeUrl} size={220} marginSize={2} />
        </div>
        <p className="screen-qr-label">
          휴대폰 카메라로 QR을 찍고
          <br />
          <strong>이름과 글을 남겨주세요!</strong>
        </p>
        <p className="screen-url">{writeUrl}</p>
        <p className="screen-count">
          💬 오늘의 글 <strong>{messages.length}</strong>개
        </p>
        <a className="screen-archive" href="#/archive">📚 지난 기록</a>
      </aside>

      <main className="screen-main" ref={listRef}>
        {error && <p className="error-banner">연결 오류: {error}</p>}
        {messages.length === 0 && !error ? (
          <div className="screen-empty">
            <p aria-hidden="true">🕊️</p>
            <p>아직 글이 없습니다. 첫 번째 글을 기다리는 중…</p>
          </div>
        ) : (
          <ul className="screen-grid">
            {messages.map((m) => (
              <li key={m.id} className="msg-card" style={{ '--accent': colorForName(m.name) }}>
                <div className="msg-head">
                  <span className="msg-name">{m.name}</span>
                  <span className="msg-time">{formatTime(m.createdAt)}</span>
                  <button
                    type="button"
                    className="msg-delete"
                    title="이 글 삭제"
                    onClick={() => handleDelete(m.id)}
                  >
                    ✕
                  </button>
                </div>
                <p className="msg-text">{m.text}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
