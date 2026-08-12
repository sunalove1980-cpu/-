// 아기 펫 캐릭터 SVG. 모든 움직임은 부모(PetRoomScreen)가 계산한 표정/포즈 값을 받아
// CSS 애니메이션 + 약간의 inline transform으로 표현한다 (GIF 반복이 아니라 상태 기반 렌더링).
import './Pet.css';

function Eyes({ state, pupilShift }) {
  const shift = pupilShift * 2.2;
  if (state === 'closed') {
    return (
      <g className="pet-eyes pet-eyes--closed">
        <path d="M -22 0 Q -16 5 -10 0" />
        <path d="M 10 0 Q 16 5 22 0" />
      </g>
    );
  }
  if (state === 'happy') {
    return (
      <g className="pet-eyes pet-eyes--happy">
        <path d="M -24 3 Q -16 -8 -8 3" />
        <path d="M 8 3 Q 16 -8 24 3" />
      </g>
    );
  }
  if (state === 'sleepy') {
    return (
      <g className="pet-eyes pet-eyes--sleepy">
        <ellipse cx="-16" cy="1" rx="7" ry="2.2" />
        <ellipse cx="16" cy="1" rx="7" ry="2.2" />
      </g>
    );
  }
  if (state === 'squint') {
    return (
      <g className="pet-eyes pet-eyes--squint">
        <path d="M -23 1 Q -16 4 -9 1" />
        <path d="M 9 1 Q 16 4 23 1" />
      </g>
    );
  }
  const radius = state === 'wide' ? 9 : 7.4;
  return (
    <g className="pet-eyes pet-eyes--open">
      <circle cx="-16" cy="0" r={radius} className="pet-eye-white" />
      <circle cx="16" cy="0" r={radius} className="pet-eye-white" />
      <circle cx={-16 + shift} cy="1.5" r={radius * 0.55} className="pet-eye-pupil" />
      <circle cx={16 + shift} cy="1.5" r={radius * 0.55} className="pet-eye-pupil" />
      <circle cx={-16 + shift + 2} cy="-1.5" r={radius * 0.18} className="pet-eye-shine" />
      <circle cx={16 + shift + 2} cy="-1.5" r={radius * 0.18} className="pet-eye-shine" />
    </g>
  );
}

// 건강기록을 축하할 때 뜨는 파티클. shape에 따라 다른 아이콘이 떠오른다
// (물방울/별/사과/반짝임/달 — 탭 반응의 하트와 같은 자리, 같은 애니메이션을 재사용한다).
function ParticleShape({ shape }) {
  switch (shape) {
    case 'droplet':
      return <path d="M0 -12 C 7 -2 7 7 0 11 C -7 7 -7 -2 0 -12 Z" />;
    case 'star':
      return (
        <path d="M0 -12 L3.4 -3.6 L12 -2.6 L5.6 3.4 L7.4 12 L0 7.4 L-7.4 12 L-5.6 3.4 L-12 -2.6 L-3.4 -3.6 Z" />
      );
    case 'apple':
      return (
        <g>
          <circle cx="0" cy="1" r="9" />
          <path className="pet-particle-leaf" d="M0 -8 C 2 -12 7 -12 7 -9 C 7 -6 2 -6 0 -8 Z" />
        </g>
      );
    case 'sparkle':
      return <path d="M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12 Z" />;
    case 'moon':
      return <path d="M6 -10 A 10 10 0 1 0 6 10 A 8 8 0 1 1 6 -10 Z" />;
    case 'heart':
    default:
      return <path d="M0 8 C -4 2 -14 4 -14 -4 C -14 -12 -4 -10 0 -4 C 4 -10 14 -12 14 -4 C 14 4 4 2 0 8 Z" />;
  }
}

function Celebration({ shape, color }) {
  const spots = [
    { x: 100, y: 40 },
    { x: 70, y: 50 },
    { x: 130, y: 52 },
  ];
  return (
    <g className="pet-particles" aria-hidden="true" style={{ color }}>
      {spots.map((spot, i) => (
        <g key={i} className={`pet-particle pet-particle--${i + 1}`} transform={`translate(${spot.x} ${spot.y})`}>
          <ParticleShape shape={shape} />
        </g>
      ))}
    </g>
  );
}

// 수면 기록 축하 때만 입는 잠옷: 배 위 잠옷 상의 + 머리 위 잠자리 모자.
function Pajama() {
  return (
    <g className="pet-pajama" aria-hidden="true">
      <path className="pet-pajama__top" d="M62 96 Q100 84 138 96 L134 150 Q100 160 66 150 Z" />
      <circle className="pet-pajama__dot" cx="82" cy="112" r="2.6" />
      <circle className="pet-pajama__dot" cx="100" cy="122" r="2.6" />
      <circle className="pet-pajama__dot" cx="118" cy="112" r="2.6" />
      <circle className="pet-pajama__dot" cx="90" cy="138" r="2.6" />
      <circle className="pet-pajama__dot" cx="110" cy="138" r="2.6" />
      <g className="pet-pajama__cap" transform="translate(100 30)">
        <path d="M-24 6 Q0 -34 24 6 Q0 -6 -24 6 Z" />
        <circle cx="24" cy="4" r="6" className="pet-pajama__pompom" />
      </g>
    </g>
  );
}

function Mouth({ state }) {
  switch (state) {
    case 'yawn':
      return <ellipse className="pet-mouth pet-mouth--yawn" cx="0" cy="10" rx="8" ry="9" />;
    case 'grin':
      return <path className="pet-mouth pet-mouth--grin" d="M -13 8 Q 0 24 13 8 Q 0 16 -13 8 Z" />;
    case 'flat':
      return <path className="pet-mouth pet-mouth--flat" d="M -7 10 Q 0 10 7 10" />;
    case 'small':
      return <path className="pet-mouth pet-mouth--small" d="M -4 9 Q 0 13 4 9" />;
    case 'smile':
    default:
      return <path className="pet-mouth pet-mouth--smile" d="M -9 8 Q 0 18 9 8" />;
  }
}

export default function Pet({
  pose = 'stand',
  eyes = 'open',
  pupilShift = 0,
  mouth = 'smile',
  earDroop = false,
  tailWag = false,
  showZzz = false,
  celebration = null,
  wearingPajama = false,
  headTilt = 0,
}) {
  return (
    <svg
      className={`pet-svg pet-svg--${pose}`}
      viewBox="0 0 200 200"
      role="img"
      aria-label="아기 펫"
    >
      {showZzz && (
        <g className="pet-zzz" aria-hidden="true">
          <text className="pet-zzz__z pet-zzz__z--1" x="118" y="46">Z</text>
          <text className="pet-zzz__z pet-zzz__z--2" x="130" y="30">Z</text>
          <text className="pet-zzz__z pet-zzz__z--3" x="144" y="14">Z</text>
        </g>
      )}
      {celebration && <Celebration shape={celebration.shape} color={celebration.color} />}

      <ellipse className="pet-shadow" cx="100" cy="176" rx="46" ry="9" />

      <g className="pet-tail-group" transform="translate(148 118)">
        <path
          className={`pet-tail${tailWag ? ' pet-tail--wag' : ''}`}
          d="M0 0 C 16 -6 20 8 8 14 C 0 18 -6 6 0 0 Z"
        />
      </g>

      <g className="pet-legs">
        <ellipse className="pet-leg pet-leg--left" cx="76" cy="164" rx="13" ry="9" />
        <ellipse className="pet-leg pet-leg--right" cx="124" cy="164" rx="13" ry="9" />
      </g>

      <g className="pet-body-wrap">
        <ellipse className="pet-body" cx="100" cy="118" rx="54" ry="48" />
        <ellipse className="pet-belly" cx="100" cy="132" rx="30" ry="22" />
        {wearingPajama && <Pajama />}

        <g className={`pet-arm pet-arm--left${pose === 'stretch' ? ' pet-arm--up' : ''}`}>
          <ellipse cx="53" cy="120" rx="10" ry="15" />
        </g>
        <g className={`pet-arm pet-arm--right${pose === 'stretch' ? ' pet-arm--up' : ''}`}>
          <ellipse cx="147" cy="120" rx="10" ry="15" />
        </g>

        <g className="pet-head" transform={`translate(100 88) rotate(${headTilt})`}>
          <g className={`pet-ear pet-ear--left${earDroop ? ' pet-ear--droop' : ''}`}>
            <ellipse cx="-34" cy="-34" rx="15" ry="20" />
            <ellipse className="pet-ear-inner" cx="-34" cy="-32" rx="8" ry="12" />
          </g>
          <g className={`pet-ear pet-ear--right${earDroop ? ' pet-ear--droop' : ''}`}>
            <ellipse cx="34" cy="-34" rx="15" ry="20" />
            <ellipse className="pet-ear-inner" cx="34" cy="-32" rx="8" ry="12" />
          </g>

          <ellipse className="pet-face" cx="0" cy="6" rx="46" ry="42" />
          <ellipse className="pet-cheek pet-cheek--left" cx="-30" cy="14" rx="8" ry="5.5" />
          <ellipse className="pet-cheek pet-cheek--right" cx="30" cy="14" rx="8" ry="5.5" />

          <g transform="translate(0 -2)">
            <Eyes state={eyes} pupilShift={pupilShift} />
          </g>
          <Mouth state={mouth} />
        </g>
      </g>
    </svg>
  );
}
