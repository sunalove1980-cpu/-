import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Heart, MessageCircle, Send } from 'lucide-react';
import { buildThread, likeMessage, postMessage, subscribeToSession, unlikeMessage } from '../lib/messages';
import { subscribeSession } from '../lib/sessions';
import { formatTime } from '../lib/dates';
import { colorForName } from '../lib/colors';
import { hasLiked, markLiked, unmarkLiked } from '../lib/likes';

const NAME_KEY = 'lecture-live:name';
const MAX_LEN = 300;

function ReplyForm({ onSubmit, onCancel }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const ref = useRef(null);

  useEffect(() => ref.current?.focus(), []);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    await onSubmit(trimmed);
    setSending(false);
  };

  return (
    <form className="reply-form" onSubmit={submit}>
      <input
        ref={ref}
        className="write-input"
        value={text}
        maxLength={MAX_LEN}
        placeholder="답글을 입력하세요"
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" disabled={!text.trim() || sending}>
        <Send size={14} strokeWidth={2} />
      </button>
      <button type="button" className="reply-cancel" onClick={onCancel}>취소</button>
    </form>
  );
}

function LikeButton({ message }) {
  const [liked, setLiked] = useState(() => hasLiked(message.id));

  const toggle = async () => {
    if (liked) {
      setLiked(false);
      unmarkLiked(message.id);
      await unlikeMessage(message.id);
    } else {
      setLiked(true);
      markLiked(message.id);
      await likeMessage(message.id);
    }
  };

  return (
    <button type="button" className={liked ? 'like-btn liked' : 'like-btn'} onClick={toggle}>
      <Heart size={14} strokeWidth={2} fill={liked ? 'currentColor' : 'none'} />
      {message.likes || 0}
    </button>
  );
}

function FeedItem({ message, sessionId, name, replies, onReply }) {
  const [replying, setReplying] = useState(false);

  const submitReply = async (text) => {
    await onReply({ sessionId, questionId: message.questionId, parentId: message.id, name, text });
    setReplying(false);
  };

  return (
    <li className="feed-item">
      <div className="feed-head">
        <span className="msg-dot" style={{ background: colorForName(message.name) }} />
        <span className="feed-name">{message.name}</span>
        <span className="feed-time">{formatTime(message.createdAt)}</span>
      </div>
      <p className="feed-text">{message.text}</p>
      <div className="feed-actions">
        <LikeButton message={message} />
        <button type="button" className="reply-toggle" onClick={() => setReplying((v) => !v)}>
          <MessageCircle size={14} strokeWidth={2} /> 답글{replies.length > 0 ? ` ${replies.length}` : ''}
        </button>
      </div>

      {replying && <ReplyForm onSubmit={submitReply} onCancel={() => setReplying(false)} />}

      {replies.length > 0 && (
        <ul className="feed-replies">
          {replies.map((r) => (
            <li key={r.id} className="feed-reply">
              <div className="feed-head">
                <span className="msg-dot" style={{ background: colorForName(r.name) }} />
                <span className="feed-name">{r.name}</span>
                <span className="feed-time">{formatTime(r.createdAt)}</span>
              </div>
              <p className="feed-text">{r.text}</p>
              <div className="feed-actions">
                <LikeButton message={r} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

// 참여자 페이지: QR로 접속한 사람이 이름과 글을 입력하는 화면 (모바일 우선)
export default function WritePage({ sessionId }) {
  const [session, setSession] = useState(null);
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) || '');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const textRef = useRef(null);

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

  const activeQuestionId = session?.questionId ?? null;
  const feedTop = activeQuestionId
    ? top.filter((m) => m.questionId === activeQuestionId)
    : top.filter((m) => !m.questionId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || !sessionId) return;
    setSending(true);
    setError(null);
    try {
      localStorage.setItem(NAME_KEY, name.trim());
      await postMessage({ sessionId, questionId: activeQuestionId, name, text: trimmed });
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

  const handleReply = async (payload) => {
    try {
      await postMessage({ ...payload, name: name || payload.name });
    } catch (err) {
      setError(`답글 전송에 실패했습니다: ${err.message}`);
    }
  };

  if (!sessionId) {
    return (
      <div className="write">
        <p className="error-banner">세션 링크가 필요합니다. 발표자에게 QR 코드를 요청하세요.</p>
      </div>
    );
  }

  return (
    <div className="write">
      <header className="write-header">
        <h1>{session?.name || '글 남기기'}</h1>
      </header>

      {activeQuestionId && (
        <div className="qa-banner">
          <span className="qa-label">진행자의 질문</span>
          <p className="qa-question-mobile">{session.questionText}</p>
        </div>
      )}

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

        <label className="write-label" htmlFor="text">{activeQuestionId ? '답변' : '하고 싶은 말'}</label>
        <textarea
          id="text"
          ref={textRef}
          className="write-textarea"
          value={text}
          maxLength={MAX_LEN}
          rows={4}
          placeholder={activeQuestionId ? '질문에 대한 답을 적어주세요' : '질문, 소감, 한 줄 생각 등 자유롭게 적어주세요'}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="write-meta">
          <span>{text.length} / {MAX_LEN}</span>
          {sent && (
            <span className="write-sent">
              <CheckCircle2 size={14} strokeWidth={2} /> 화면에 표시됐어요
            </span>
          )}
        </div>

        {error && <p className="error-banner">{error}</p>}

        <button className="write-submit" type="submit" disabled={!text.trim() || sending}>
          {sending ? '보내는 중…' : (
            <>
              <Send size={16} strokeWidth={2} /> 보내기
            </>
          )}
        </button>
      </form>

      <section className="write-feed">
        <h2>{activeQuestionId ? `답변 (${feedTop.length})` : `오늘 올라온 글 (${feedTop.length})`}</h2>
        <ul>
          {[...feedTop].reverse().map((m) => (
            <FeedItem
              key={m.id}
              message={m}
              sessionId={sessionId}
              name={name}
              replies={repliesByParent.get(m.id) ?? []}
              onReply={handleReply}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
