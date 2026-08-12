// 하단 건강기록 버튼 5종의 설정.
// 각 항목은: 어디로 이동하는지(target), 어떤 스탯을 직접 올리는지(statDelta),
// 축하할 때 어떤 모양/색의 파티클을 띄우는지(particle)를 갖는다.
import { BED_APPROACH, BOWL_APPROACH, FOOD_APPROACH, MIND_APPROACH, randomFloorPoint } from './constants.js';

export const ACTIONS = [
  {
    key: 'water',
    label: '물 마시기',
    icon: '💧',
    getTarget: () => BOWL_APPROACH,
    statDelta: { hydration: 30, mood: 5 },
    particle: { shape: 'droplet', color: '#5ec3f0' },
  },
  {
    key: 'walk',
    label: '걷기',
    icon: '🚶',
    getTarget: () => randomFloorPoint(),
    statDelta: { mood: 8, energy: 4 },
    particle: { shape: 'star', color: '#ffb648' },
  },
  {
    key: 'meal',
    label: '건강한 식사',
    icon: '🥗',
    getTarget: () => FOOD_APPROACH,
    statDelta: { energy: 20, hydration: 5, mood: 5 },
    particle: { shape: 'apple', color: '#ff8a5c' },
  },
  {
    key: 'mind',
    label: '마음 돌보기',
    icon: '🧘',
    getTarget: () => MIND_APPROACH,
    statDelta: { mood: 20 },
    particle: { shape: 'sparkle', color: '#c39bff' },
  },
  {
    key: 'sleep',
    label: '수면 기록',
    icon: '🌙',
    getTarget: () => BED_APPROACH,
    statDelta: { energy: 15, mood: 8 },
    particle: { shape: 'moon', color: '#7c8cff' },
    pajama: true,
  },
];

export function getAction(key) {
  return ACTIONS.find((action) => action.key === key) ?? null;
}
