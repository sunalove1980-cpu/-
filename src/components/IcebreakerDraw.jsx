import { useEffect, useRef, useState } from 'react';
import { ICEBREAKER_CATEGORIES, ICEBREAKERS, pickIcebreaker } from '../data/icebreakers.js';
import './IcebreakerDraw.css';

export default function IcebreakerDraw({ onStart, onResult }) {
  const [category, setCategory] = useState('all');
  const [card, setCard] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const lastTextRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function draw() {
    const pool = category === 'all' ? ICEBREAKERS : ICEBREAKERS.filter((q) => q.category === category);
    if (pool.length === 0) return;

    let pick = pickIcebreaker(pool);
    let guard = 0;
    while (pick.text === lastTextRef.current && pool.length > 1 && guard < 10) {
      pick = pickIcebreaker(pool);
      guard += 1;
    }
    lastTextRef.current = pick.text;

    // 카드가 살짝 뒤집혔다가 새 질문으로 나타나는 느낌을 준다.
    setDrawing(true);
    onStart?.();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCard(pick);
      setDrawing(false);
      onResult?.(pick);
    }, 160);
  }

  return (
    <div className="icebreaker-draw">
      <div className="icebreaker-draw__categories">
        {ICEBREAKER_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`icebreaker-draw__chip ${category === c.key ? 'is-active' : ''}`}
            onClick={() => setCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={`icebreaker-draw__card ${drawing ? 'is-drawing' : ''}`}>
        {card ? (
          <p>{card.text}</p>
        ) : (
          <p className="icebreaker-draw__placeholder">버튼을 눌러서 질문 카드를 뽑아봐!</p>
        )}
      </div>

      <button type="button" className="icebreaker-draw__draw-btn" onClick={draw}>
        {card ? '🔄 다시 뽑기' : '🃏 카드 뽑기'}
      </button>
    </div>
  );
}
