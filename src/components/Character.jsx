import { forwardRef } from 'react';
import { EXPRESSIONS } from './characterExpressions.jsx';
import './Character.css';

// 숲속 캐릭터 "포리" — 순수 SVG로 그린 통통한 여우. expression 값에 따라 표정이 바뀐다.
const Character = forwardRef(function Character(
  { x, y, facing, reacting, thinking, expression = 'idle', mode, onTouch },
  ref,
) {
  const face = EXPRESSIONS[expression] ?? EXPRESSIONS.idle;

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
      <svg viewBox="0 0 120 128" width="108" height="115" className="character__svg">
        <ellipse className="character__shadow" cx="60" cy="118" rx="30" ry="6" />

        {/* 꼬리 (통통, 끝이 하얀) */}
        <path
          className="character__tail"
          d="M86 84 C 116 74, 122 108, 98 112 C 90 113, 84 106, 84 98 C 84 92, 84 88, 86 84 Z"
          fill="#ef9f66"
        />
        <ellipse cx="103" cy="99" rx="10" ry="9" fill="#fff8ee" />

        {/* 뒷발 (걸을 때 살짝 보이는 통통한 발) */}
        <ellipse cx="42" cy="114" rx="11" ry="7" fill="#ef9f66" />
        <ellipse cx="78" cy="114" rx="11" ry="7" fill="#ef9f66" />
        <ellipse cx="42" cy="116" rx="7" ry="3.6" fill="#fff8ee" />
        <ellipse cx="78" cy="116" rx="7" ry="3.6" fill="#fff8ee" />

        {/* 귀 (둥글고 통통, 뾰족하지 않게) */}
        <path
          className="character__ear character__ear--left"
          d="M28 38 C 18 18, 34 4, 46 20 C 50 28, 46 38, 36 42 Z"
          fill="#ef9f66"
        />
        <path
          className="character__ear character__ear--right"
          d="M92 38 C 102 18, 86 4, 74 20 C 70 28, 74 38, 84 42 Z"
          fill="#ef9f66"
        />
        <path d="M32 34 C 27 21, 36 12, 42 21 C 44 27, 41 33, 35 36 Z" fill="#ffd9ae" />
        <path d="M88 34 C 93 21, 84 12, 78 21 C 76 27, 79 33, 85 36 Z" fill="#ffd9ae" />

        {/* 몸통 + 머리 (하나로 이어진 통통한 실루엣) */}
        <path
          d="M60 20 C 84 20, 98 40, 96 62 C 95 76, 100 84, 96 100 C 92 116, 28 116, 24 100 C 20 84, 25 76, 24 62 C 22 40, 36 20, 60 20 Z"
          fill="#f4b183"
        />

        {/* 배 (크림색, 얼굴~배까지 자연스럽게) */}
        <ellipse cx="60" cy="80" rx="24" ry="26" fill="#fff3e4" />

        {/* 앞발 두 개 (배 앞에 살짝) */}
        <ellipse cx="44" cy="103" rx="8" ry="6.5" fill="#fff3e4" />
        <ellipse cx="76" cy="103" rx="8" ry="6.5" fill="#fff3e4" />

        {/* 볼터치 */}
        <ellipse cx="34" cy="68" rx="7.5" ry="5" fill="#f8a3ae" opacity="0.75" />
        <ellipse cx="86" cy="68" rx="7.5" ry="5" fill="#f8a3ae" opacity="0.75" />

        {/* 눈썹 (표정별) */}
        {face.brows}

        {/* 눈 (표정별) */}
        <g className="character__eyes">{face.eyes}</g>

        {/* 코 */}
        <ellipse cx="60" cy="65.5" rx="3.6" ry="2.8" fill="#3a2a1e" />

        {/* 입 (표정별) */}
        {face.mouth}

        {/* 반짝이 효과 (happy일 때만) */}
        {face.sparkle}
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
