import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, FileSpreadsheet, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { buildThread, fetchAllGroupedBySession } from '../lib/messages';
import { deleteSession, fetchAllSessions } from '../lib/sessions';
import { formatDateKey, formatTime } from '../lib/dates';
import { colorForName } from '../lib/colors';

// 지난 기록: 세션 목록(날짜별로 묶어 표시)에서 하나를 골라 글을 모아보고,
// TXT/CSV 파일로 내려받는다.
export default function ArchivePage() {
  const [sessions, setSessions] = useState(null);
  const [bySession, setBySession] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchAllSessions(), fetchAllGroupedBySession()])
      .then(([sessionList, grouped]) => {
        setSessions(sessionList);
        setBySession(grouped);
        if (sessionList[0]) setSelected(sessionList[0].id);
      })
      .catch((err) => setError(err.message));
  }, []);

  const groupedByDate = useMemo(() => {
    if (!sessions) return [];
    const map = new Map();
    for (const s of sessions) {
      if (!map.has(s.dateKey)) map.set(s.dateKey, []);
      map.get(s.dateKey).push(s);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [sessions]);

  const currentSession = sessions?.find((s) => s.id === selected);
  const messages = (selected && bySession?.get(selected)) || [];
  const { top, repliesByParent } = useMemo(() => buildThread(messages), [messages]);

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
      `강의 라이브 보드 — ${currentSession?.name || '이름 없는 세션'} (${formatDateKey(currentSession.dateKey)})`,
      `총 ${top.length}개의 글`,
      '─'.repeat(40),
      ...top.flatMap((m) => [
        `[${formatTime(m.createdAt)}] ${m.name}${m.questionId ? ' (답변)' : ''}: ${m.text}  ♥${m.likes || 0}`,
        ...(repliesByParent.get(m.id) ?? []).map(
          (r) => `    ↳ [${formatTime(r.createdAt)}] ${r.name}: ${r.text}  ♥${r.likes || 0}`,
        ),
      ]),
    ];
    download(`lecture-${currentSession.dateKey}-${selected}.txt`, lines.join('\n'), 'text/plain');
  };

  const downloadCsv = () => {
    const esc = (s) => `"${String(s).replaceAll('"', '""')}"`;
    const rows = [
      ['시간', '이름', '유형', '내용', '좋아요'].join(','),
      ...top.flatMap((m) => [
        [esc(formatTime(m.createdAt)), esc(m.name), esc(m.questionId ? '답변' : '글'), esc(m.text), m.likes || 0].join(','),
        ...(repliesByParent.get(m.id) ?? []).map((r) =>
          [esc(formatTime(r.createdAt)), esc(r.name), esc('답글'), esc(r.text), r.likes || 0].join(','),
        ),
      ]),
    ];
    // 엑셀에서 한글이 깨지지 않도록 BOM을 붙인다.
    download(`lecture-${currentSession.dateKey}-${selected}.csv`, `﻿${rows.join('\n')}`, 'text/csv');
  };

  const handleDelete = async () => {
    if (!currentSession) return;
    if (!window.confirm(`"${currentSession.name || '이름 없는 세션'}" 세션과 그 안의 글을 모두 삭제할까요? 되돌릴 수 없습니다.`)) return;
    try {
      await deleteSession(currentSession.id);
      const remaining = sessions.filter((s) => s.id !== currentSession.id);
      setSessions(remaining);
      setBySession((prev) => {
        const next = new Map(prev);
        next.delete(currentSession.id);
        return next;
      });
      setSelected(remaining[0]?.id ?? null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="archive">
      <header className="archive-header">
        <a href="#/"><ArrowLeft size={14} strokeWidth={2} /> 처음으로</a>
        <h1>지난 기록</h1>
      </header>

      {error && <p className="error-banner">불러오기 실패: {error}</p>}
      {!sessions && !error && <p className="archive-loading">기록을 불러오는 중…</p>}
      {sessions && sessions.length === 0 && <p className="archive-loading">아직 저장된 기록이 없습니다.</p>}

      {sessions && sessions.length > 0 && (
        <div className="archive-body">
          <nav className="archive-dates">
            {groupedByDate.map(([dateKey, list]) => (
              <div key={dateKey} className="archive-date-group">
                <p className="archive-date-heading">{formatDateKey(dateKey)}</p>
                {list.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={s.id === selected ? 'date-btn active' : 'date-btn'}
                    onClick={() => setSelected(s.id)}
                  >
                    {s.name || '이름 없는 세션'}
                    <small>{(bySession?.get(s.id)?.length) || 0}개의 글</small>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <section className="archive-detail">
            {currentSession && (
              <>
                <div className="archive-toolbar">
                  <h2>{currentSession.name || '이름 없는 세션'}</h2>
                  <div className="archive-actions">
                    <button type="button" onClick={downloadTxt}>
                      <Download size={14} strokeWidth={2} /> TXT
                    </button>
                    <button type="button" onClick={downloadCsv}>
                      <FileSpreadsheet size={14} strokeWidth={2} /> CSV
                    </button>
                    <button type="button" className="archive-delete" onClick={handleDelete}>
                      <Trash2 size={14} strokeWidth={2} /> 삭제
                    </button>
                  </div>
                </div>
                <ul className="archive-list">
                  {top.map((m) => (
                    <li key={m.id} className="feed-item">
                      <div className="feed-head">
                        <span className="msg-dot" style={{ background: colorForName(m.name) }} />
                        <span className="feed-name">{m.name}</span>
                        <span className="feed-time">{formatTime(m.createdAt)}</span>
                      </div>
                      {m.questionId && <p className="archive-qtag">질문에 대한 답변</p>}
                      <p className="feed-text">{m.text}</p>
                      <div className="feed-actions readonly">
                        <span className="msg-metric"><Heart size={13} strokeWidth={2} /> {m.likes || 0}</span>
                        {(repliesByParent.get(m.id)?.length ?? 0) > 0 && (
                          <span className="msg-metric">
                            <MessageCircle size={13} strokeWidth={2} /> {repliesByParent.get(m.id).length}
                          </span>
                        )}
                      </div>
                      {(repliesByParent.get(m.id)?.length ?? 0) > 0 && (
                        <ul className="feed-replies">
                          {repliesByParent.get(m.id).map((r) => (
                            <li key={r.id} className="feed-reply">
                              <div className="feed-head">
                                <span className="msg-dot" style={{ background: colorForName(r.name) }} />
                                <span className="feed-name">{r.name}</span>
                                <span className="feed-time">{formatTime(r.createdAt)}</span>
                              </div>
                              <p className="feed-text">{r.text}</p>
                            </li>
                          ))}
                        </ul>
                      )}
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
