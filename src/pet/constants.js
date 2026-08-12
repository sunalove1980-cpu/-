// 시뮬레이션 전반에서 쓰는 상수 모음.
// 방(room)은 백분율 좌표계를 쓴다: x/y 모두 0~100 사이 값으로, 화면 크기에 관계없이 동작한다.

// 펫이 걸어다닐 수 있는 바닥 영역 (원근감을 위해 y가 좁은 밴드를 이룸)
export const FLOOR = {
  xMin: 10,
  xMax: 90,
  yMin: 56,
  yMax: 85,
};

// 가구 위치 (백분율 좌표). Room.jsx가 그림을 그리는 기준점이다.
export const BED_SPOT = { x: 80, y: 62 };
export const BOWL_SPOT = { x: 16, y: 78 };
export const FOOD_SPOT = { x: 58, y: 84 };
export const MIND_SPOT = { x: 24, y: 59 };

// 펫이 실제로 걸어가서 멈추는 지점. 가구 바로 앞(옆)이라 가구 위에 겹쳐 서지 않는다.
export const BED_APPROACH = { x: 71, y: 71 };
export const BOWL_APPROACH = { x: 33, y: 79 };
export const FOOD_APPROACH = { x: 42, y: 82 };
export const MIND_APPROACH = { x: 38, y: 63 };

// 펫이 활동을 시작하는 기본 위치
export const START_POS = { x: 50, y: 74 };

// 시뮬레이션 틱 간격 (ms). 이 간격마다 스탯 감소/행동 판단/이동 계산을 수행한다.
export const TICK_MS = 120;

// 초당 이동 속도 (백분율 단위 / 초)
export const MOVE_SPEED_PER_SEC = 16;

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

// y 위치를 기준으로 원근 스케일 계산 (바닥 안쪽=작게, 바깥쪽=크게)
export function depthScale(y) {
  return lerp(0.82, 1.1, (y - FLOOR.yMin) / (FLOOR.yMax - FLOOR.yMin));
}

// 밤 시간대(21시~7시)인지 여부. 자율행동에서 "진짜로 잠드는" 확률을 밤에 크게 높이는 데 쓴다.
export function isNightTime(date = new Date()) {
  const hour = date.getHours();
  return hour >= 21 || hour < 7;
}
