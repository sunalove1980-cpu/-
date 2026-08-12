// 아늑한 방 배경. 침대/물그릇은 펫이 실제로 걸어가서 도착하는 좌표(BED_SPOT, BOWL_SPOT)에
// 맞춰 배치되어 있어, 펫이 그 자리에 정확히 "도착"한 것처럼 보인다.
import { BED_SPOT, BOWL_SPOT, FOOD_SPOT, MIND_SPOT } from './constants.js';
import './Room.css';

function BedIcon() {
  return (
    <svg className="room-bed" viewBox="0 0 120 90" role="img" aria-label="침대">
      <ellipse className="room-bed__shadow" cx="60" cy="80" rx="52" ry="8" />
      <rect className="room-bed__frame" x="8" y="34" width="104" height="42" rx="10" />
      <rect className="room-bed__blanket" x="8" y="34" width="104" height="30" rx="10" />
      <rect className="room-bed__blanket-trim" x="8" y="54" width="104" height="8" />
      <rect className="room-bed__pillow" x="16" y="18" width="36" height="24" rx="10" />
      <rect className="room-bed__leg" x="14" y="72" width="8" height="12" rx="2" />
      <rect className="room-bed__leg" x="98" y="72" width="8" height="12" rx="2" />
    </svg>
  );
}

function BowlIcon() {
  return (
    <svg className="room-bowl" viewBox="0 0 90 60" role="img" aria-label="물그릇">
      <ellipse className="room-bowl__shadow" cx="45" cy="52" rx="34" ry="6" />
      <ellipse className="room-bowl__water" cx="45" cy="26" rx="30" ry="12" />
      <path className="room-bowl__body" d="M8 26 Q8 50 45 50 Q82 50 82 26 Z" />
      <ellipse className="room-bowl__rim" cx="45" cy="26" rx="34" ry="10" />
      <ellipse className="room-bowl__shine" cx="34" cy="22" rx="8" ry="3.4" />
    </svg>
  );
}

function FoodIcon() {
  return (
    <svg className="room-food" viewBox="0 0 90 60" role="img" aria-label="식사 자리">
      <ellipse className="room-food__shadow" cx="45" cy="52" rx="32" ry="6" />
      <ellipse className="room-food__plate" cx="45" cy="34" rx="34" ry="14" />
      <ellipse className="room-food__plate-inner" cx="45" cy="34" rx="24" ry="9.5" />
      <circle className="room-food__apple" cx="34" cy="30" r="9" />
      <path className="room-food__leaf" d="M34 21 C 36 16 42 16 42 20 C 42 24 36 24 34 21 Z" />
      <ellipse className="room-food__veg" cx="54" cy="32" rx="9" ry="7" />
    </svg>
  );
}

function CushionIcon() {
  return (
    <svg className="room-cushion" viewBox="0 0 90 60" role="img" aria-label="마음 돌보기 방석">
      <ellipse className="room-cushion__shadow" cx="45" cy="50" rx="34" ry="6" />
      <ellipse className="room-cushion__base" cx="45" cy="34" rx="36" ry="18" />
      <ellipse className="room-cushion__pattern" cx="45" cy="30" rx="22" ry="9" />
      <g className="room-cushion__sparkle" transform="translate(66 12)">
        <path d="M0 -8 Q1.4 -1.4 8 0 Q1.4 1.4 0 8 Q-1.4 1.4 -8 0 Q-1.4 -1.4 0 -8 Z" />
      </g>
    </svg>
  );
}

export default function Room() {
  return (
    <div className="room">
      <div className="room__wall">
        <div className="room__window">
          <div className="room__window-glow" />
          <div className="room__window-cross room__window-cross--v" />
          <div className="room__window-cross room__window-cross--h" />
        </div>
        <div className="room__lights">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="room__light" style={{ animationDelay: `${i * 0.22}s` }} />
          ))}
        </div>
        <div className="room__shelf">
          <span className="room__plant" />
          <span className="room__book room__book--a" />
          <span className="room__book room__book--b" />
        </div>
      </div>

      <div className="room__floor">
        <div className="room__rug" />
      </div>

      <div className="room__prop room__prop--bed" style={{ left: `${BED_SPOT.x}%`, top: `${BED_SPOT.y}%` }}>
        <BedIcon />
      </div>
      <div className="room__prop room__prop--bowl" style={{ left: `${BOWL_SPOT.x}%`, top: `${BOWL_SPOT.y}%` }}>
        <BowlIcon />
      </div>
      <div className="room__prop room__prop--food" style={{ left: `${FOOD_SPOT.x}%`, top: `${FOOD_SPOT.y}%` }}>
        <FoodIcon />
      </div>
      <div className="room__prop room__prop--cushion" style={{ left: `${MIND_SPOT.x}%`, top: `${MIND_SPOT.y}%` }}>
        <CushionIcon />
      </div>
    </div>
  );
}
