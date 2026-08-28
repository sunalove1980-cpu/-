import { forwardRef } from 'react';
import './Character.css';

// 숲속 캐릭터 "포리" — 순수 SVG로 그린 여우. props로 좌우 반전/반응 상태를 받는다.
const Character = forwardRef(function Character(
  { x, y, facing, reacting, thinking, mode, onTouch },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={[
        'character',
        reacting ? 'character--reacting' : '',
        thinking ? 'character--thinking' : '',
        `character--${mode?.toLowerCase()}`,
      ].join(' ')}
      style={{
        transform: `translate(${x}px, ${y}px) scaleX(${facing})`,
      }}
      onPointerDown={onTouch}
      aria-label="포리 쓰다듬기"
    >
      <svg viewBox="0 0 120 120" width="104" height="104" className="character__svg">
        <ellipse className="character__shadow" cx="60" cy="108" rx="30" ry="6" />
        {/* 꼬리 */}
        <path
          className="character__tail"
          d="M88 78 C 112 70, 116 96, 96 100 C 108 92, 100 82, 88 78 Z"
          fill="#e8a06a"
        />
        {/* 귀 */}
        <path className="character__ear character__ear--left" d="M30 40 L20 12 L46 32 Z" fill="#e8a06a" />
        <path className="character__ear character__ear--right" d="M90 40 L100 12 L74 32 Z" fill="#e8a06a" />
        <path d="M32 34 L27 20 L42 31 Z" fill="#fbe3cd" />
        <path d="M88 34 L93 20 L78 31 Z" fill="#fbe3cd" />
        {/* 몸통/얼굴 */}
        <ellipse cx="60" cy="66" rx="34" ry="30" fill="#f2b47f" />
        <ellipse cx="60" cy="76" rx="18" ry="14" fill="#fff3e4" />
        {/* 볼터치 */}
        <ellipse cx="38" cy="66" rx="6" ry="4" fill="#f6a0ab" opacity="0.7" />
        <ellipse cx="82" cy="66" rx="6" ry="4" fill="#f6a0ab" opacity="0.7" />
        {/* 눈 */}
        <g className="character__eyes">
          <circle cx="48" cy="60" r="4.2" fill="#3a2a1e" />
          <circle cx="72" cy="60" r="4.2" fill="#3a2a1e" />
        </g>
        {/* 코/입 */}
        <path d="M60 68 L55 73 Q60 78 65 73 Z" fill="#3a2a1e" />
      </svg>

      {thinking && (
        <span className="character__thought" aria-hidden="true">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </span>
      )}
    </button>
  );
});

export default Character;
