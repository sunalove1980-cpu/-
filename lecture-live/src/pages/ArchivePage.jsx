import { useEffect, useMemo, useState } from 'react';
import { fetchAllGroupedByDate } from '../lib/messages';
import { formatDateKey, formatTime } from '../lib/dates';
import { colorForName } from '../lib/colors';

// 지난 기록: 날짜 목록에서 하루를 골라 글을 모아보고, TXT/CSV 파일로 내려받는다.
export default function ArchivePage() {
  const [byDate, setByDate] = useState(null); // Map<dateKey, messages[]>
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllGroupedByDate()
      .then((map) => {
        setByDate(map);
        const first = map.keys().next().value;
        if (first) setSelected(first);
      })
      .catch((err) => setError(err.message));
  }, []);

  const messages = useMemo(
    () => (byDate && selected ? byDate.get(selected) ?? [] : []),
    [byDate, selected],
  );

  const download = (filename, content, type) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTxt = () => {
    const lines = [
      `강의 라이브 보드 — ${formatDateKey(selected)}`,
      `총 ${messages.length}개의 글`,
      '─'.repeat(40),
      ...messages.map((m) => `[${formatTime(m.createdAt)}] ${m.name}: ${m.text}`),
    ];
    download(`lecture-${selected}.txt`, lines.join('\n'), 'text/plain');
  };

  const downloadCsv = () => {
    const esc = (s) => `"${String(s).replaceAll('"', '""')}"`;
    const rows = [
      ['시간', '이름', '내용'].join(','),
      ...messages.map((m) => [esc(formatTime(m.createdAt)), esc(m.name), esc(m.text)].join(',')),
    ];
    // 엑셀에서 한글이 깨지지 않도록 BOM을 붙인다.
    download(`lecture-${selected}.csv`, `﻿${rows.join('\n')}`, 'text/csv');
  };

  return (
    <div className="archive">
      <header className="archive-header">
        <a href="#/">← 처음으로</a>
        <h1>📚 지난 기록</h1>
      </header>

      {error && <p className="error-banner">불러오기 실패: {error}</p>}
      {!byDate && !error && <p className="archive-loading">기록을 불러오는 중…</p>}

      {byDate && byDate.size === 0 && (
        <p className="archive-loading">아직 저장된 기록이 없습니다.</p>
      )}

      {byDate && byDate.size > 0 && (
        <div className="archive-body">
          <nav className="archive-dates">
            {[...byDate.keys()].map((key) => (
              <button
                key={key}
                type="button"
                className={key === selected ? 'date-btn active' : 'date-btn'}
                onClick={() => setSelected(key)}
              >
                {formatDateKey(key)}
                <small>{byDate.get(key).length}개의 글</small>
              </button>
            ))}
          </nav>

          <section className="archive-detail">
            {selected && (
              <>
                <div className="archive-toolbar">
                  <h2>{formatDateKey(selected)}</h2>
                  <div className="archive-actions">
                    <button type="button" onClick={downloadTxt}>⬇️ TXT 저장</button>
                    <button type="button" onClick={downloadCsv}>⬇️ CSV 저장</button>
                  </div>
                </div>
                <ul className="archive-list">
                  {messages.map((m) => (
                    <li key={m.id} className="feed-item" style={{ '--accent': colorForName(m.name) }}>
                      <span className="feed-name">{m.name}</span>
                      <span className="feed-time">{formatTime(m.createdAt)}</span>
                      <p className="feed-text">{m.text}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
