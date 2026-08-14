// localStorage에 펫의 이름·스탯·경험치·날짜별 건강기록·마지막 접속 시간을 저장한다.
// 로그인/서버 없이 이 브라우저에서만 유지되는 1단계 저장소.
//
// 건강기록은 "오늘"만이 아니라 날짜별(recordsByDate)로 저장한다. 자정을 넘겨서야
// 어제 목표를 다 채우는 경우가 많아서, 사용자가 날짜를 직접 골라 그 날짜의 기록에
// 더하거나 취소할 수 있어야 하기 때문이다. 연속 실천일은 저장된 숫자가 아니라
// 이 날짜별 기록에서 매번 다시 계산한다 (과거 날짜를 나중에 채워도 정확히 반영되도록).
import { NEGLECT, clamp } from './constants.js';

const STORAGE_KEY = 'pocketpet.save.v1';

export const XP_PER_LEVEL = 100;
export const ACTION_XP = 20;
export const DEFAULT_PET_NAME = '몽이';
export const PAST_DAYS_SELECTABLE = 7; // 오늘 포함, 며칠 전까지 기록을 고쳐 쓸 수 있는지

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

// 오늘부터 (count-1)일 전까지의 날짜 키 목록 (최신 순: 오늘, 어제, 그 전날 ...).
export function recentDateKeys(count = PAST_DAYS_SELECTABLE, from = new Date()) {
  const keys = [];
  let key = todayKey(from);
  for (let i = 0; i < count; i++) {
    keys.push(key);
    key = yesterdayKeyOf(key);
  }
  return keys;
}

function hasAnyRecord(records) {
  return Boolean(records) && Object.values(records).some((count) => count > 0);
}

// 오늘(또는 기준일)부터 거꾸로 훑어, 끊기지 않고 이어진 날의 수를 센다.
// 기준일에 아직 기록이 없어도 "오늘은 아직 안 끝났으니" 어제까지의 연속 기록은 유지해서 보여준다.
export function computeStreak(recordsByDate, from = new Date()) {
  let cursor = todayKey(from);
  if (!hasAnyRecord(recordsByDate[cursor])) {
    cursor = yesterdayKeyOf(cursor);
  }
  let streak = 0;
  const SAFETY_CAP = 20_000; // 수십 년치 사용도 안전하게 커버하는 상한 (무한루프 방지용)
  while (hasAnyRecord(recordsByDate[cursor]) && streak < SAFETY_CAP) {
    streak += 1;
    cursor = yesterdayKeyOf(cursor);
  }
  return streak;
}

function defaultState() {
  return {
    petName: DEFAULT_PET_NAME,
    stats: { energy: 78, hydration: 72, mood: 84 },
    xp: 0,
    recordsByDate: {},
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
      recordsByDate: { ...saved.recordsByDate },
    };
    // 이전 버전(오늘 기록만 저장하던 저장소)에서 넘어온 데이터를 날짜별 기록으로 옮겨온다.
    if (!saved.recordsByDate && saved.todayKey && saved.todayRecords) {
      merged.recordsByDate = { [saved.todayKey]: { ...saved.todayRecords } };
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

// 앱을 완전히 꺼둔 채 오래 방치했다면, 돌아왔을 때 "그리워하던" 만큼 스탯을 한 번에 깎는다.
// (실시간 방치 배율과는 별개로, 오프라인 시간에 대한 일회성 페널티)
export function applyOfflineNeglect(stats, offlineMs) {
  if (!offlineMs || offlineMs <= NEGLECT.graceMs) return stats;
  const severity = clamp((offlineMs - NEGLECT.graceMs) / NEGLECT.offlinePenaltyRampMs, 0, 1);
  return {
    mood: clamp(stats.mood - severity * NEGLECT.offlineMoodPenaltyMax),
    energy: clamp(stats.energy - severity * NEGLECT.offlineEnergyPenaltyMax),
    hydration: clamp(stats.hydration - severity * NEGLECT.offlineHydrationPenaltyMax),
  };
}
