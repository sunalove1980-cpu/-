// 숲속 오두막 장면. 하늘엔 구름이 천천히 흐르고, 초원엔 오두막·연못·산딸기 덤불·모닥불이
// 자리 잡고 있다. 나비가 가끔 지나다니는 것 말고는 조용히 바라보고 있어도 편안하도록
// (불멍 하듯) 애니메이션 속도를 느긋하게 맞췄다.
import { BERRY_SPOT, CABIN_SPOT, CAMPFIRE_SPOT, POND_SPOT } from './constants.js';
import './Room.css';

// 밤/저녁 하늘에 뜨는 별자리 위치 (고정된 배치라 리렌더돼도 깜빡이지 않는다)
const STARS = [
  { top: '6%', left: '10%', size: 2 }, { top: '14%', left: '28%', size: 1.6 },
  { top: '8%', left: '45%', size: 1.8 }, { top: '20%', left: '62%', size: 2 },
  { top: '4%', left: '78%', size: 1.6 }, { top: '16%', left: '90%', size: 1.8 },
  { top: '28%', left: '18%', size: 1.6 }, { top: '32%', left: '52%', size: 2 },
  { top: '24%', left: '35%', size: 1.4 }, { top: '10%', left: '5%', size: 1.4 },
  { top: '30%', left: '82%', size: 1.6 }, { top: '2%', left: '60%', size: 1.4 },
];

function CabinIcon() {
  return (
    <svg className="room-cabin" viewBox="0 0 140 130" role="img" aria-label="오두막">
      <ellipse className="room-cabin__shadow" cx="70" cy="122" rx="60" ry="8" />
      <path className="room-cabin__roof" d="M8 56 L70 12 L132 56 L120 56 L70 22 L20 56 Z" />
      <rect className="room-cabin__wall" x="22" y="54" width="96" height="58" rx="4" />
      <rect className="room-cabin__wall-line" x="22" y="72" width="96" height="4" />
      <rect className="room-cabin__wall-line" x="22" y="92" width="96" height="4" />
      <rect className="room-cabin__door" x="58" y="76" width="24" height="36" rx="3" />
      <circle className="room-cabin__knob" cx="76" cy="94" r="2" />
      <rect className="room-cabin__window" x="30" y="62" width="18" height="16" rx="2" />
      <rect className="room-cabin__window" x="92" y="62" width="18" height="16" rx="2" />
      <rect className="room-cabin__chimney" x="98" y="24" width="14" height="24" rx="2" />
      <g className="room-cabin__smoke">
        <circle className="room-cabin__smoke-puff room-cabin__smoke-puff--1" cx="105" cy="18" r="5" />
        <circle className="room-cabin__smoke-puff room-cabin__smoke-puff--2" cx="105" cy="18" r="5" />
        <circle className="room-cabin__smoke-puff room-cabin__smoke-puff--3" cx="105" cy="18" r="5" />
      </g>
    </svg>
  );
}

function PondIcon() {
  return (
    <svg className="room-pond" viewBox="0 0 130 80" role="img" aria-label="연못">
      <ellipse className="room-pond__water" cx="65" cy="42" rx="58" ry="26" />
      <ellipse className="room-pond__shine" cx="42" cy="30" rx="16" ry="6" />
      <ellipse className="room-pond__ripple" cx="80" cy="48" rx="14" ry="5" />
      <g className="room-pond__lily" transform="translate(92 50)">
        <ellipse rx="12" ry="7" />
        <path className="room-pond__lily-notch" d="M0 0 L12 -2 L10 4 Z" />
      </g>
      <path className="room-pond__reed" d="M14 44 C 10 30 14 18 10 6" />
      <path className="room-pond__reed" d="M22 46 C 20 34 24 24 20 12" />
    </svg>
  );
}

function BerryBushIcon() {
  return (
    <svg className="room-berry" viewBox="0 0 110 76" role="img" aria-label="산딸기 덤불">
      <ellipse className="room-berry__shadow" cx="55" cy="68" rx="40" ry="7" />
      <ellipse className="room-berry__bush" cx="55" cy="42" rx="46" ry="28" />
      <ellipse className="room-berry__bush-hi" cx="38" cy="30" rx="22" ry="14" />
      <circle className="room-berry__fruit" cx="30" cy="38" r="5.5" />
      <circle className="room-berry__fruit" cx="46" cy="26" r="5" />
      <circle className="room-berry__fruit" cx="66" cy="34" r="5.5" />
      <circle className="room-berry__fruit" cx="78" cy="50" r="5" />
      <circle className="room-berry__fruit" cx="52" cy="52" r="5" />
    </svg>
  );
}

function CampfireIcon() {
  return (
    <svg className="room-campfire" viewBox="0 0 90 80" role="img" aria-label="모닥불">
      <ellipse className="room-campfire__shadow" cx="45" cy="70" rx="34" ry="7" />
      <path className="room-campfire__log" d="M8 62 L58 46 L62 54 L12 70 Z" />
      <path className="room-campfire__log room-campfire__log--b" d="M82 62 L32 46 L28 54 L78 70 Z" />
      <g transform="translate(45 40)">
        <g className="room-campfire__flame-group">
          <path className="room-campfire__flame room-campfire__flame--outer" d="M0 26 C -16 14 -10 -6 0 -24 C 10 -6 16 14 0 26 Z" />
          <path className="room-campfire__flame room-campfire__flame--inner" d="M0 18 C -8 10 -6 -2 0 -14 C 6 -2 8 10 0 18 Z" />
        </g>
      </g>
      <circle className="room-campfire__ember room-campfire__ember--1" cx="45" cy="24" r="2" />
      <circle className="room-campfire__ember room-campfire__ember--2" cx="52" cy="28" r="1.6" />
      <circle className="room-campfire__ember room-campfire__ember--3" cx="38" cy="26" r="1.6" />
    </svg>
  );
}

function Butterfly({ className }) {
  return (
    <svg className={`room-butterfly ${className}`} viewBox="0 0 30 22" aria-hidden="true">
      <g className="room-butterfly__wings">
        <ellipse className="room-butterfly__wing room-butterfly__wing--left" cx="10" cy="11" rx="9" ry="7" />
        <ellipse className="room-butterfly__wing room-butterfly__wing--right" cx="20" cy="11" rx="9" ry="7" />
      </g>
      <line className="room-butterfly__body" x1="15" y1="4" x2="15" y2="18" />
    </svg>
  );
}

export default function Room({ timeOfDay = 'day' }) {
  return (
    <div className={`room room--${timeOfDay}`}>
      <div className="room__sky">
        <div className="room__stars">
          {STARS.map((star, i) => (
            <span
              key={i}
              className="room__star"
              style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
            />
          ))}
        </div>
        <div className="room__sun" />
        <div className="room__cloud room__cloud--1" />
        <div className="room__cloud room__cloud--2" />
        <div className="room__cloud room__cloud--3" />
        <div className="room__cloud room__cloud--4" />
      </div>

      <div className="room__hills" />

      <div className="room__treeline room__treeline--far">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="room__tree room__tree--far" />
        ))}
      </div>
      <div className="room__treeline room__treeline--near">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="room__tree room__tree--near" />
        ))}
      </div>

      <div className="room__meadow">
        <div className="room__meadow-texture" />
      </div>

      <Butterfly className="room-butterfly--a" />
      <Butterfly className="room-butterfly--b" />

      <div className="room__prop room__prop--cabin" style={{ left: `${CABIN_SPOT.x}%`, top: `${CABIN_SPOT.y}%` }}>
        <CabinIcon />
      </div>
      <div className="room__prop room__prop--pond" style={{ left: `${POND_SPOT.x}%`, top: `${POND_SPOT.y}%` }}>
        <PondIcon />
      </div>
      <div className="room__prop room__prop--berry" style={{ left: `${BERRY_SPOT.x}%`, top: `${BERRY_SPOT.y}%` }}>
        <BerryBushIcon />
      </div>
      <div className="room__prop room__prop--campfire" style={{ left: `${CAMPFIRE_SPOT.x}%`, top: `${CAMPFIRE_SPOT.y}%` }}>
        <CampfireIcon />
      </div>
    </div>
  );
}
