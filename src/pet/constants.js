// 시뮬레이션 전반에서 쓰는 상수 모음.
// 장면(scene)은 백분율 좌표계를 쓴다: x/y 모두 0~100 사이 값으로, 화면 크기에 관계없이 동작한다.

// 펫이 걸어다닐 수 있는 초원 영역 (원근감을 위해 y가 좁은 밴드를 이룸)
export const FLOOR = {
  xMin: 8,
  xMax: 92,
  yMin: 54,
  yMax: 86,
};

// 장면 속 장소 (백분율 좌표). Room.jsx가 그림을 그리는 기준점이다.
export const CABIN_SPOT = { x: 80, y: 58 }; // 오두막 — 수면 기록/자율 취침
export const POND_SPOT = { x: 15, y: 78 }; // 연못 — 물 마시기
export const BERRY_SPOT = { x: 58, y: 85 }; // 산딸기 덤불 — 건강한 식사
export const CAMPFIRE_SPOT = { x: 24, y: 60 }; // 모닥불 — 마음 돌보기

// 펫이 실제로 걸어가서 멈추는 지점. 장소 바로 앞(옆)이라 위에 겹쳐 서지 않는다.
export const CABIN_APPROACH = { x: 70, y: 70 };
export const POND_APPROACH = { x: 32, y: 79 };
export const BERRY_APPROACH = { x: 42, y: 83 };
export const CAMPFIRE_APPROACH = { x: 38, y: 64 };

// 펫이 활동을 시작하는 기본 위치
export const START_POS = { x: 50, y: 74 };

// 시뮬레이션 틱 간격 (ms). 이 간격마다 스탯 감소/행동 판단/이동 계산을 수행한다.
export const TICK_MS = 120;

// 초당 이동 속도 (백분율 단위 / 초)
export const MOVE_SPEED_PER_SEC = 16;
// 손가락을 따라갈 때는 좀 더 기민하게 반응한다.
export const FOLLOW_SPEED_PER_SEC = 26;

// 스탯 변화율 (0~100 스케일, 초당 변화량)
export const STAT_RATES = {
  energyDecayPerSec: 0.45,
  energyRegenPerSec: 6.5,
  hydrationDecayPerSec: 0.6,
  hydrationRegenPerSec: 9,
  moodDecayPerSec: 0.28,
  moodBoostOnPat: 14,
  moodRegenNearFullNeedsPerSec: 0.15,
};

// 스탯 임계값
export const THRESHOLDS = {
  lowEnergy: 40,
  criticalEnergy: 14,
  lowHydration: 40,
  criticalHydration: 14,
  lowMood: 35,
  lonelyMood: 16, // 이보다 낮으면 "많이 외로워하는" 강한 우울 표현
};

// 방치(무관심) 상태 — 오래 아무 상호작용이 없으면 스탯이 점점 더 빨리 나빠진다.
export const NEGLECT = {
  graceMs: 25_000, // 이 시간까지는 정상 속도
  rampMs: 100_000, // 이후 이 시간에 걸쳐 배율이 최대치까지 서서히 증가
  maxMultiplier: 3.5,
  // 앱을 완전히 꺼두고 돌아왔을 때 한 번에 적용하는 "그리움" 페널티의 최대 강도
  offlinePenaltyRampMs: 6 * 60 * 60 * 1000, // 6시간 방치 시 최대 페널티
  offlineMoodPenaltyMax: 46,
  offlineEnergyPenaltyMax: 22,
  offlineHydrationPenaltyMax: 22,
};

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

export function randRange(min, max) {
  return min + Math.random() * (max - min);
}

export function randomFloorPoint() {
  return {
    x: randRange(FLOOR.xMin, FLOOR.xMax),
    y: randRange(FLOOR.yMin, FLOOR.yMax),
  };
}

export function jitterPoint(point, amount = 3) {
  return {
    x: clamp(point.x + randRange(-amount, amount), FLOOR.xMin, FLOOR.xMax),
    y: clamp(point.y + randRange(-amount, amount), FLOOR.yMin, FLOOR.yMax),
  };
}

// y 위치를 기준으로 원근 스케일 계산 (초원 안쪽=작게, 바깥쪽=크게)
export function depthScale(y) {
  return lerp(0.8, 1.12, (y - FLOOR.yMin) / (FLOOR.yMax - FLOOR.yMin));
}

// 밤 시간대(21시~7시)인지 여부. 자율행동에서 "진짜로 잠드는" 확률을 밤에 크게 높이는 데 쓴다.
export function isNightTime(date = new Date()) {
  const hour = date.getHours();
  return hour >= 21 || hour < 7;
}

// 지금이 하루 중 언제인지: 아침 / 낮 / 노을 / 저녁 / 밤. 장면의 하늘·초원 색을 바꾸는 데 쓴다.
export function getTimeOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'sunset';
  if (hour >= 19 && hour < 21) return 'evening';
  return 'night';
}

// 마지막 상호작용(탭/기록/쓰다듬기)으로부터 지난 시간에 따라 스탯 감소 배율을 계산한다.
// 오래 방치할수록 배율이 커져 "급격하게 피곤해하거나 우울해지는" 효과를 만든다.
export function neglectMultiplier(idleMs) {
  const t = (idleMs - NEGLECT.graceMs) / NEGLECT.rampMs;
  return lerp(1, NEGLECT.maxMultiplier, t);
}
