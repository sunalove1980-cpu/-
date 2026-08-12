// 펫의 "다음 행동"을 무작위 + 스탯 가중치로 결정하는 로직.
// 단순 반복 애니메이션이 아니라, 매번 상태(에너지/기분/수분)에 따라 확률이 달라지는
// 가중치 룰렛 방식으로 다음 행동을 뽑는다.

import {
  CABIN_APPROACH,
  POND_APPROACH,
  THRESHOLDS,
  isNightTime,
  jitterPoint,
  randRange,
  randomFloorPoint,
} from './constants.js';

function weightedPick(entries) {
  const pool = entries.filter((entry) => entry.weight > 0);
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.key;
  }
  return pool[pool.length - 1].key;
}

/**
 * 다음 활동을 결정한다.
 * @param {{energy:number, hydration:number, mood:number}} stats
 * @returns {object} 다음 activity 객체
 */
export function decideNextActivity(stats) {
  const { energy, hydration, mood } = stats;

  // 위급 상황은 확률 없이 바로 강제 (방치해도 스스로 챙기는 최소한의 생존 규칙)
  if (energy <= THRESHOLDS.criticalEnergy && energy <= hydration) {
    return makeWalkTo(jitterPoint(CABIN_APPROACH, 2), 'sleep');
  }
  if (hydration <= THRESHOLDS.criticalHydration) {
    return makeWalkTo(jitterPoint(POND_APPROACH, 2), 'drink');
  }
  // 오래 방치되어 많이 외로워진 경우: 다른 행동보다 우선해서 시무룩한 모습을 보인다.
  if (mood <= THRESHOLDS.lonelyMood) {
    return { type: 'lonely', duration: randRange(3200, 5200) };
  }

  const lowEnergy = energy < THRESHOLDS.lowEnergy;
  const lowHydration = hydration < THRESHOLDS.lowHydration;
  const lowMood = mood < THRESHOLDS.lowMood;
  const night = isNightTime();

  // 침대(오두막)로 향할 가중치: 피곤할수록 커지고, 밤 시간대에는 크게 피곤하지 않아도
  // 잠자리에 들 가능성이 높아진다 ("실제로 잠드는 행동은 밤 시간대의 자율행동").
  const tiredBedWeight = lowEnergy ? Math.round((THRESHOLDS.lowEnergy - energy) * 2.2) + 12 : 0;
  const bedWeight = night ? tiredBedWeight * 3 + (lowEnergy ? 0 : 16) : tiredBedWeight;

  const weights = [
    { key: 'idle', weight: lowMood ? 9 : 16 },
    { key: 'lookAround', weight: lowMood ? 6 : 12 },
    { key: 'walkRandom', weight: lowMood ? 6 : 13 },
    { key: 'yawn', weight: lowEnergy || night ? 14 : 6 },
    { key: 'stretch', weight: 6 },
    { key: 'sniff', weight: lowMood ? 4 : 10 },
    { key: 'daydream', weight: lowMood ? 4 : 9 },
    { key: 'playHop', weight: lowMood ? 2 : 8 },
    { key: 'sad', weight: lowMood ? Math.round((THRESHOLDS.lowMood - mood) * 1.6) + 10 : 0 },
    {
      key: 'walkToPond',
      weight: lowHydration ? Math.round((THRESHOLDS.lowHydration - hydration) * 2.2) + 12 : 0,
    },
    { key: 'walkToCabin', weight: bedWeight },
  ];

  const choice = weightedPick(weights) ?? 'idle';

  switch (choice) {
    case 'lookAround':
      return { type: 'lookAround', duration: randRange(1500, 2600), glanceDir: Math.random() < 0.5 ? -1 : 1 };
    case 'yawn':
      return { type: 'yawn', duration: randRange(1600, 2100) };
    case 'stretch':
      return { type: 'stretch', duration: randRange(1400, 1900) };
    case 'sniff':
      return { type: 'sniff', duration: randRange(1600, 2400) };
    case 'daydream':
      return { type: 'daydream', duration: randRange(2200, 3600) };
    case 'playHop':
      return { type: 'playHop', duration: randRange(1000, 1400) };
    case 'sad':
      return { type: 'sad', duration: randRange(2200, 3400) };
    case 'walkRandom':
      return makeWalkTo(randomFloorPoint(), 'idle');
    case 'walkToPond':
      return makeWalkTo(jitterPoint(POND_APPROACH, 3), 'drink');
    case 'walkToCabin':
      return makeWalkTo(jitterPoint(CABIN_APPROACH, 3), 'sleep');
    case 'idle':
    default:
      return { type: 'idle', duration: randRange(2000, 4200) };
  }
}

function makeWalkTo(target, nextType) {
  return { type: 'walk', target, nextType };
}

export function sleepDuration(energy) {
  return 4800 + (100 - energy) * 75;
}

export function drinkDuration(hydration) {
  return 2200 + (100 - hydration) * 22;
}
