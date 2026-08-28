// 표정 파츠 모음. Character.jsx 가 expression 값에 따라 눈/입/추가 효과를 조합해서 그린다.
// idle: 평소, happy: F모드 답변 직후, smug: T모드 답변 직후, surprised: 터치했을 때, thinking: 생각 중

const STROKE = { stroke: '#3a2a1e', strokeWidth: 3.4, fill: 'none', strokeLinecap: 'round' };

export const EXPRESSIONS = {
  idle: {
    eyes: (
      <>
        <circle cx="45" cy="61" r="5.6" fill="#3a2a1e" />
        <circle cx="75" cy="61" r="5.6" fill="#3a2a1e" />
        <circle cx="42.8" cy="58.4" r="1.9" fill="#fff" />
        <circle cx="72.8" cy="58.4" r="1.9" fill="#fff" />
      </>
    ),
    mouth: <path d="M56 72 Q60 76 64 72" {...STROKE} strokeWidth="2.6" />,
    brows: null,
    sparkle: null,
  },
  happy: {
    eyes: (
      <>
        <path d="M38 62 Q45 53 52 62" {...STROKE} />
        <path d="M68 62 Q75 53 82 62" {...STROKE} />
      </>
    ),
    mouth: (
      <path d="M52 70 Q60 82 68 70" fill="#7a4a34" stroke="#3a2a1e" strokeWidth="2.6" strokeLinecap="round" />
    ),
    brows: null,
    sparkle: (
      <g className="character__sparkle" opacity="0.9">
        <path d="M22 40 l2.4 5.4 5.4 2.4 -5.4 2.4 -2.4 5.4 -2.4 -5.4 -5.4 -2.4 5.4 -2.4 Z" fill="#ffe58a" />
        <path d="M100 52 l1.6 3.6 3.6 1.6 -3.6 1.6 -1.6 3.6 -1.6 -3.6 -3.6 -1.6 3.6 -1.6 Z" fill="#ffe58a" />
      </g>
    ),
  },
  surprised: {
    eyes: (
      <>
        <circle cx="45" cy="61" r="8" fill="#3a2a1e" />
        <circle cx="75" cy="61" r="8" fill="#3a2a1e" />
        <circle cx="42" cy="57.5" r="2.3" fill="#fff" />
        <circle cx="72" cy="57.5" r="2.3" fill="#fff" />
      </>
    ),
    mouth: <ellipse cx="60" cy="75" rx="4.4" ry="5.6" fill="#3a2a1e" />,
    brows: (
      <>
        <path d="M36 46 Q45 41 53 45" {...STROKE} strokeWidth="2.6" />
        <path d="M67 45 Q75 41 84 46" {...STROKE} strokeWidth="2.6" />
      </>
    ),
    sparkle: null,
  },
  thinking: {
    eyes: (
      <>
        <path d="M38 63 Q45 67 52 63" {...STROKE} />
        <circle cx="75" cy="60" r="5.6" fill="#3a2a1e" />
        <circle cx="72.8" cy="57.4" r="1.9" fill="#fff" />
      </>
    ),
    mouth: <path d="M55 74 L65 74" {...STROKE} strokeWidth="2.6" />,
    brows: null,
    sparkle: null,
  },
  smug: {
    eyes: (
      <>
        <path d="M38 64 Q45 60 52 63" {...STROKE} />
        <circle cx="75" cy="60" r="5.6" fill="#3a2a1e" />
        <circle cx="72.8" cy="57.4" r="1.9" fill="#fff" />
      </>
    ),
    mouth: (
      <path d="M54 71 Q62 76 70 66" fill="none" stroke="#3a2a1e" strokeWidth="2.8" strokeLinecap="round" />
    ),
    brows: <path d="M67 44 Q75 40 84 43" {...STROKE} strokeWidth="2.6" />,
    sparkle: null,
  },
};
