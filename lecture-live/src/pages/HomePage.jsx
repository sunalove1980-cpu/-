import { useEffect, useState } from 'react';
import { Archive, ChevronRight, Loader2, Radio } from 'lucide-react';
import { createSession, subscribeRecentSessions } from '../lib/sessions';
import { formatDateKey, formatTime, todayKey } from '../lib/dates';

// 첫 화면: 새 세션을 시작하거나 최근 세션을 이어서 열거나, 지난 기록을 본다.
// '세션'은 QR 코드 하나에 대응하는 하나의 발표 단위 — 하루에 여러 번 만들 수 있다.
export default function HomePage() {
  const [sessions, setSessions] = useState([]);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = subscribeRecentSessions(setSessions, (err) => setError(err.message));
    return unsub;
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    setError(null);
    try {
      const id = await createSession(name);
      window.location.hash = `#/screen?s=${id}`;
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  };

  return (
    <div className="home">
      <header className="home-topbar">
        <span className="home-topbar-mark" />
        <span className="home-topbar-name">강의 라이브 보드</span>
      </header>

      <div className="home-body">
        <p className="home-eyebrow">{formatDateKey(todayKey())}</p>
        <h1 className="home-heading">세션을 시작하세요</h1>
        <p className="home-desc">
          세션마다 별도의 QR 코드가 발급됩니다. 하루에 여러 강의·여러 번 나눠 써도
          기록이 섞이지 않습니다.
        </p>

        <form className="home-create" onSubmit={handleCreate}>
          <input
            className="write-input"
            type="text"
            value={name}
            maxLength={40}
            placeholder="세션 이름 (예: 오전반, 생략 가능)"
            onChange={(e) => setName(e.target.value)}
          />
          <button className="home-primary-btn" type="submit" disabled={creating}>
            {creating ? <Loader2 className="spin" size={16} strokeWidth={2} /> : <Radio size={16} strokeWidth={1.75} />}
            새 세션 시작하기
          </button>
        </form>

        {error && <p className="error-banner">{error}</p>}

        {sessions.length > 0 && (
          <>
            <p className="home-section-label">최근 세션</p>
            <nav className="home-list">
              {sessions.map((s) => (
                <a key={s.id} className="home-row" href={`#/screen?s=${s.id}`}>
                  <Radio className="icon" size={16} strokeWidth={1.75} />
                  <span className="home-row-body">
                    <span className="home-row-title">{s.name || '이름 없는 세션'}</span>
                    <span className="home-row-desc">
                      {formatDateKey(s.dateKey)} · {formatTime(s.createdAt) || '방금 생성'}
                    </span>
                  </span>
                  <ChevronRight className="icon home-row-chevron" size={16} strokeWidth={2} />
                </a>
              ))}
            </nav>
          </>
        )}

        <p className="home-section-label">기록</p>
        <nav className="home-list">
          <a className="home-row" href="#/archive">
            <Archive className="icon" size={18} strokeWidth={1.75} />
            <span className="home-row-body">
              <span className="home-row-title">지난 기록 보기</span>
              <span className="home-row-desc">세션별 글 모아보기 · 파일로 저장</span>
            </span>
            <ChevronRight className="icon home-row-chevron" size={16} strokeWidth={2} />
          </a>
        </nav>
      </div>
    </div>
  );
}
