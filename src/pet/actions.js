// 건강기록 행동 정의 + localStorage 기반 커스텀 행동 관리.
// 기본 제공 5종(물/걷기/식사/마음/수면)은 정해진 장소로 걸어가지만,
// 사용자가 직접 추가한 행동은 "그 자리에서 보상을 받는" 형태로 처리한다 (최대 20개).
import {
  BERRY_APPROACH,
  CABIN_APPROACH,
  CAMPFIRE_APPROACH,
  POND_APPROACH,
  randomFloorPoint,
} from './constants.js';

const STORAGE_KEY = 'pocketpet.actions.v1';
export const MAX_ACTIONS = 20;

// 기본 제공 행동 5종의 "장소/스탯/파티클"은 코드에 고정되어 있고, 목록 자체(순서·삭제 여부·
// 커스텀 행동 추가)만 localStorage에 저장한다.
const BUILTIN_TARGETS = {
  water: () => POND_APPROACH,
  walk: () => randomFloorPoint(),
  meal: () => BERRY_APPROACH,
  mind: () => CAMPFIRE_APPROACH,
  sleep: () => CABIN_APPROACH,
};

const BUILTIN_STAT_DELTA = {
  water: { hydration: 30, mood: 5 },
  walk: { mood: 8, energy: 4 },
  meal: { energy: 20, hydration: 5, mood: 5 },
  mind: { mood: 20 },
  sleep: { energy: 15, mood: 8 },
};

const BUILTIN_PARTICLE = {
  water: { shape: 'droplet', color: '#5ec3f0' },
  walk: { shape: 'star', color: '#ffb648' },
  meal: { shape: 'apple', color: '#ff8a5c' },
  mind: { shape: 'sparkle', color: '#c39bff' },
  sleep: { shape: 'moon', color: '#7c8cff' },
};

export const DEFAULT_ACTIONS = [
  { id: 'water', label: '물 마시기', icon: '💧', builtin: 'water' },
  { id: 'walk', label: '걷기', icon: '🚶', builtin: 'walk' },
  { id: 'meal', label: '건강한 식사', icon: '🥗', builtin: 'meal' },
  { id: 'mind', label: '마음 돌보기', icon: '🧘', builtin: 'mind' },
  { id: 'sleep', label: '수면 기록', icon: '🌙', builtin: 'sleep', pajama: true },
];

// 커스텀 행동을 추가할 때 고를 수 있는 아이콘 팔레트 (자유 입력 대신 고정 팔레트로 단순하게).
export const ICON_PALETTE = [
  '💊', '🦷', '🧴', '🧺', '🧹', '📖', '🎨', '🎵',
  '☀️', '🌳', '✍️', '🎯', '🧦', '🧠', '🥤', '🍎',
  '🏃', '🚿', '🛏️', '🌿', '🙏', '📵', '🧊', '💪',
];

export function loadActions() {
  if (typeof window === 'undefined') return DEFAULT_ACTIONS.slice();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ACTIONS.slice();
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_ACTIONS.slice();
    return saved.slice(0, MAX_ACTIONS);
  } catch {
    return DEFAULT_ACTIONS.slice();
  }
}

export function saveActions(list) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ACTIONS)));
  } catch {
    // 저장 실패는 조용히 무시 (프라이빗 모드 등)
  }
}

export function createCustomAction(label, icon) {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: label.trim().slice(0, 12),
    icon,
  };
}

export function findAction(list, id) {
  return list.find((action) => action.id === id) ?? null;
}

// 행동 하나를 실제로 재생할 때 필요한 정보(이동 위치/스탯 보정/파티클)로 변환한다.
export function resolveAction(action) {
  if (action.builtin && BUILTIN_TARGETS[action.builtin]) {
    return {
      getTarget: BUILTIN_TARGETS[action.builtin],
      statDelta: BUILTIN_STAT_DELTA[action.builtin],
      particle: BUILTIN_PARTICLE[action.builtin],
      pajama: Boolean(action.pajama),
    };
  }
  // 커스텀 행동: 특정 장소 개념이 없으니 지금 있는 자리에서 바로 보상을 받는다.
  return {
    getTarget: null,
    statDelta: { mood: 8, energy: 5, hydration: 5 },
    particle: { shape: 'sparkle', color: '#ffd166' },
    pajama: false,
  };
}
