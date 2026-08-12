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
  showHearts = false,
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
      {showHearts && (
        <g className="pet-hearts" aria-hidden="true">
          <path className="pet-heart pet-heart--1" d="M100 40 C 96 34 86 36 86 44 C 86 52 100 60 100 60 C 100 60 114 52 114 44 C 114 36 104 34 100 40 Z" />
          <path className="pet-heart pet-heart--2" d="M70 50 C 67 46 60 47 60 53 C 60 58 70 64 70 64 C 70 64 80 58 80 53 C 80 47 73 46 70 50 Z" />
          <path className="pet-heart pet-heart--3" d="M130 52 C 127 48 120 49 120 55 C 120 60 130 66 130 66 C 130 66 140 60 140 55 C 140 49 133 48 130 52 Z" />
        </g>
      )}

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
