import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Archive,
  ArrowLeft,
  Heart,
  MessageCircle,
  Radio,
  Send,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { buildThread, deleteMessage, subscribeToSession } from '../lib/messages';
import { askQuestion, clearQuestion, subscribeSession } from '../lib/sessions';
import { formatDateKey, formatTime } from '../lib/dates';
import { colorForName } from '../lib/colors';

// 발표 화면: 프로젝터에 띄워두는 페이지이자 진행자의 질문 컨트롤 화면.
// - 질문이 없으면: 참여자가 자유롭게 올린 글이 실시간으로 쌓인다.
// - 진행자가 질문을 올리면: 그 질문이 상단에 크게 뜨고, 참여자는 그 질문에 답한다.
export default function ScreenPage({ sessionId }) {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [questionDraft, setQuestionDraft] = useState('');
  const [asking, setAsking] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return undefined;
    const unsub = subscribeSession(sessionId, setSession, (err) => setError(err.message));
    return unsub;
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return undefined;
    const unsub = subscribeToSession(sessionId, setMessages, (err) => setError(err.message));
    return unsub;
  }, [sessionId]);

  const { top, repliesByParent } = useMemo(() => buildThread(messages), [messages]);

  const visible = useMemo(() => {
    if (session?.questionId) return top.filter((m) => m.questionId === session.questionId);
    return top.filter((m) => !m.questionId);
  }, [top, session?.questionId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [visible.length]);

  const writeUrl = useMemo(() => {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}#/write?s=${sessionId}`;
  }, [sessionId]);

  const handleAsk = async (e) => {
    e.preventDefault();
    const text = questionDraft.trim();
    if (!text || asking) return;
    setAsking(true);
    try {
      await askQuestion(sessionId, text);
      setQuestionDraft('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAsking(false);
    }
  };

  const handleClear = () => clearQuestion(sessionId);

  const handleDelete = async (id) => {
    if (window.confirm('이 글을 삭제할까요?')) await deleteMessage(id);
  };

  if (!sessionId) {
    return (
      <div className="screen-missing">
        <p>세션 정보가 없습니다.</p>
        <a href="#/">← 처음으로 가서 세션을 시작하세요</a>
      </div>
    );
  }

  return (
    <div className="screen">
      <aside className="screen-side">
        <a className="screen-home" href="#/">
          <ArrowLeft size={14} strokeWidth={2} /> 처음으로
        </a>
        <div className="screen-brand">
          <Radio className="icon" size={20} strokeWidth={1.75} />
          <div>
            <div className="screen-title">{session?.name || '강의 라이브 보드'}</div>
            <div className="screen-date">{session ? formatDateKey(session.dateKey) : ''}</div>
          </div>
        </div>
        <div className="screen-qr">
          <QRCodeSVG value={writeUrl} size={200} marginSize={2} />
        </div>
        <p className="screen-qr-label">
          그리고 휴대폰 카메라로 QR을 찍고
          <br />
          <strong>이름과 글을 남겨주세요.</strong>
        </p>
        <p className="screen-url">{writeUrl}</p>
        <div className="screen-stats">
          <MessageCircle size={16} strokeWidth={2} />
          {session?.questionId ? '답변' : '오늘의 글'} <strong>{visible.length}</strong>개
        </div>
        <a className="screen-archive" href="#/archive">
          <Archive size={14} strokeWidth={2} /> 지난 기록
        </a>
      </aside>

      <main className="screen-main" ref={listRef}>
        {error && <p className="error-banner">연결 오류: {error}</p>}

        <div className="qa-panel">
          {session?.questionId ? (
            <div className="qa-active">
              <span className="qa-label">진행 중인 질문</span>
              <h2 className="qa-question">{session.questionText}</h2>
              <button type="button" className="qa-clear" onClick={handleClear}>
                <X size={14} strokeWidth={2} /> 질문 종료하고 자유 게시판으로
              </button>
            </div>
          ) : (
            <form className="qa-ask" onSubmit={handleAsk}>
              <input
                className="write-input"
                type="text"
                value={questionDraft}
                maxLength={200}
                placeholder="참여자에게 물어볼 질문을 입력하세요 (예: 가장 궁금한 점은?)"
                onChange={(e) => setQuestionDraft(e.target.value)}
              />
              <button type="submit" disabled={!questionDraft.trim() || asking}>
                <Send size={15} strokeWidth={2} /> 질문 올리기
              </button>
            </form>
          )}
        </div>

        {visible.length === 0 && !error ? (
          <div className="screen-empty">
            <Users size={40} strokeWidth={1.5} />
            <p>{session?.questionId ? '아직 답변이 없습니다' : '아직 글이 없습니다. 첫 번째 글을 기다리는 중'}</p>
          </div>
        ) : (
          <ul className="screen-grid">
            {visible.map((m) => {
              const replyCount = repliesByParent.get(m.id)?.length ?? 0;
              return (
                <li key={m.id} className="msg-card">
                  <div className="msg-head">
                    <span className="msg-dot" style={{ background: colorForName(m.name) }} />
                    <span className="msg-name">{m.name}</span>
                    <span className="msg-time">{formatTime(m.createdAt)}</span>
                    <button
                      type="button"
                      className="msg-delete"
                      title="이 글 삭제"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                  <p className="msg-text">{m.text}</p>
                  <div className="msg-foot">
                    <span className="msg-metric">
                      <Heart size={13} strokeWidth={2} /> {m.likes || 0}
                    </span>
                    {replyCount > 0 && (
                      <span className="msg-metric">
                        <MessageCircle size={13} strokeWidth={2} /> {replyCount}
                      </span>
                    )}
                  </div>

                  {replyCount > 0 && (
                    <ul className="msg-replies">
                      {repliesByParent.get(m.id).map((r) => (
                        <li key={r.id} className="msg-reply">
                          <span className="msg-dot" style={{ background: colorForName(r.name) }} />
                          <span className="msg-reply-name">{r.name}</span>
                          <span className="msg-reply-text">{r.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
