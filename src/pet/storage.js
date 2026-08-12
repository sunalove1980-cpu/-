// localStorage에 펫의 이름·스탯·경험치·오늘 기록·연속 실천일·마지막 접속 시간을 저장한다.
// 로그인/서버 없이 이 브라우저에서만 유지되는 1단계 저장소.

const STORAGE_KEY = 'pocketpet.save.v1';

export const XP_PER_LEVEL = 100;
export const ACTION_XP = 20;
export const DEFAULT_PET_NAME = '몽이';

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function yesterdayKeyOf(key) {
  const [y, m, d] = key.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d - 1));
}

function defaultState() {
  return {
    petName: DEFAULT_PET_NAME,
    stats: { energy: 78, hydration: 72, mood: 84 },
    xp: 0,
    streakDays: 0,
    lastRecordDateKey: null,
    todayKey: todayKey(),
    todayRecords: {},
    lastSeenAt: null,
  };
}

export function loadState() {
  const fallback = defaultState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw);
    const merged = {
      ...fallback,
      ...saved,
      stats: { ...fallback.stats, ...saved.stats },
      todayRecords: { ...saved.todayRecords },
    };
    // 앱을 닫은 사이 날짜가 바뀌었다면 "오늘 기록"만 비운다 (연속일 계산은 실제 기록 시점에 처리).
    const today = todayKey();
    if (merged.todayKey !== today) {
      merged.todayKey = today;
      merged.todayRecords = {};
    }
    return merged;
  } catch {
    return fallback;
  }
}

export function saveState(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 프라이빗 모드 등 localStorage를 쓸 수 없는 환경은 조용히 무시한다.
  }
}

// 오늘 처음 기록하는 순간 연속 실천일을 갱신한다 (state를 직접 변경한다).
export function bumpStreak(state) {
  const today = todayKey();
  if (state.lastRecordDateKey === today) {
    // 오늘 이미 기록이 있었다면 유지
  } else if (state.lastRecordDateKey && yesterdayKeyOf(today) === state.lastRecordDateKey) {
    state.streakDays += 1;
  } else {
    state.streakDays = 1;
  }
  state.lastRecordDateKey = today;
}
