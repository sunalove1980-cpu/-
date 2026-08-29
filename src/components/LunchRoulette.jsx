import { useEffect, useMemo, useRef, useState } from 'react';
import { LUNCH_CATEGORIES, LUNCH_ITEMS, pickLunch } from '../data/lunch.js';
import './LunchRoulette.css';

const HISTORY_KEY = 'forest-counselor:lunch-history';
const MAX_HISTORY = 5;

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function LunchRoulette({ onStart, onResult }) {
  const [category, setCategory] = useState('all');
  const [spinning, setSpinning] = useState(false);
  const [displayItem, setDisplayItem] = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const pool = useMemo(
    () => (category === 'all' ? LUNCH_ITEMS : LUNCH_ITEMS.filter((it) => it.category === category)),
    [category],
  );

  function spin() {
    if (spinning || pool.length === 0) return;
    setSpinning(true);
    onStart?.();
    const finalPick = pickLunch(pool);
    let ticks = 0;
    const maxTicks = 16;

    function tick() {
      setDisplayItem(pickLunch(pool));
      ticks += 1;
      if (ticks < maxTicks) {
        timerRef.current = setTimeout(tick, 55 + ticks * 14);
      } else {
        setDisplayItem(finalPick);
        setSpinning(false);
        setHistory((prev) => {
          const next = [finalPick.name, ...prev.filter((n) => n !== finalPick.name)].slice(0, MAX_HISTORY);
          try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
          } catch {
            // 저장 실패해도 결과 표시에는 지장 없음
          }
          return next;
        });
        onResult?.(finalPick);
      }
    }
    tick();
  }

  return (
    <div className="lunch-roulette">
      <div className="lunch-roulette__categories">
        {LUNCH_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`lunch-roulette__chip ${category === c.key ? 'is-active' : ''}`}
            onClick={() => setCategory(c.key)}
            disabled={spinning}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className={`lunch-roulette__display ${spinning ? 'is-spinning' : ''}`}>
        {displayItem ? (
          <>
            <span className="lunch-roulette__emoji">{displayItem.emoji}</span>
            <span className="lunch-roulette__name">{displayItem.name}</span>
          </>
        ) : (
          <span className="lunch-roulette__placeholder">버튼을 눌러서 오늘 점심을 정해봐!</span>
        )}
      </div>

      <button type="button" className="lunch-roulette__spin-btn" onClick={spin} disabled={spinning}>
        {spinning ? '고르는 중…' : '🎲 룰렛 돌리기'}
      </button>

      {history.length > 0 && (
        <div className="lunch-roulette__history">
          <span>최근 뽑은 메뉴</span>
          <div className="lunch-roulette__history-list">
            {history.map((name, i) => (
              <span key={i} className="lunch-roulette__history-tag">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
