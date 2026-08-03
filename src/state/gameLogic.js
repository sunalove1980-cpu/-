// 게임 시스템 계산 로직: 경험치/레벨/코인, 연속 달성(스트릭), 회복 보너스,
// 업적 배지, 주간 건강 보스전 관련 순수 함수 모음. (부수효과 없음 - 테스트/재사용 용이)
import { addDays, isNextDay } from './dateUtils.js';

export const XP_PER_HABIT = 10;
export const COIN_PER_HABIT = 5;
export const SCORE_PER_HABIT = 10;
export const RECOVERY_BONUS_XP = 5;
export const RECOVERY_BONUS_COIN = 5;
export const BOSS_DAMAGE_PER_COMPLETION = 10;

/** 레벨업에 필요한 누적 경험치량 (레벨이 오를수록 점점 더 필요) */
export function xpRequiredForLevel(level) {
  return 100 + (level - 1) * 50;
}

export function createInitialProfile() {
  return { level: 1, xp: 0, xpToNext: xpRequiredForLevel(1), coins: 0, totalScoreAllTime: 0 };
}

/**
 * 경험치/코인/점수 증감을 프로필에 반영하고 레벨업(또는 강등)을 계산한다.
 * 체크 해제 시에는 xpDelta/coinDelta에 음수를 넘겨 되돌릴 수 있다.
 */
export function applyRewards(profile, { xpDelta = 0, coinDelta = 0, scoreDelta = 0 }) {
  let xp = profile.xp + xpDelta;
  let level = profile.level;
  let xpToNext = xpRequiredForLevel(level);
  let leveledUp = false;

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = xpRequiredForLevel(level);
    leveledUp = true;
  }
  while (xp < 0 && level > 1) {
    level -= 1;
    xpToNext = xpRequiredForLevel(level);
    xp += xpToNext;
  }
  if (xp < 0) xp = 0;

  const coins = Math.max(0, profile.coins + coinDelta);
  const totalScoreAllTime = Math.max(0, profile.totalScoreAllTime + scoreDelta);

  return { level, xp, xpToNext, coins, totalScoreAllTime, leveledUp };
}

/**
 * 습관 하나의 전체 기록을 스캔해 연속 달성일을 계산한다.
 * 하루를 놓치면 "현재 스트릭"만 0으로 돌아갈 뿐 다른 불이익은 없다.
 */
export function computeHabitStreak(habitId, recordsByDate, todayKeyValue) {
  const completedDates = Object.values(recordsByDate)
    .filter((r) => r.habitEntries?.[habitId]?.completed)
    .map((r) => r.date)
    .sort();

  if (completedDates.length === 0) {
    return { current: 0, longest: 0, lastCompletedDate: null };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < completedDates.length; i += 1) {
    if (isNextDay(completedDates[i - 1], completedDates[i])) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  // 마지막 완료일에서부터 거꾸로 연속 구간 길이를 센다.
  let current = 1;
  for (let i = completedDates.length - 1; i > 0; i -= 1) {
    if (isNextDay(completedDates[i - 1], completedDates[i])) {
      current += 1;
    } else {
      break;
    }
  }

  const lastCompletedDate = completedDates[completedDates.length - 1];
  const isStillAlive =
    lastCompletedDate === todayKeyValue || lastCompletedDate === addDays(todayKeyValue, -1);

  return { current: isStillAlive ? current : 0, longest, lastCompletedDate };
}

/** 어제 그 습관을 놓쳤다가 오늘 다시 실천했는지(회복) 판단 */
export function didRecoverToday(habitId, recordsByDate, dateKeyValue) {
  const yesterdayKey = addDays(dateKeyValue, -1);
  const yesterdayEntry = recordsByDate[yesterdayKey]?.habitEntries?.[habitId];
  return Boolean(yesterdayEntry && yesterdayEntry.completed === false);
}

export const BADGE_DEFINITIONS = [
  { id: 'first_quest', icon: '🌱', name: '첫 걸음', description: '첫 건강 퀘스트를 완료했어요' },
  { id: 'streak_3', icon: '🔥', name: '3일의 약속', description: '한 습관을 3일 연속 달성했어요' },
  { id: 'streak_7', icon: '⚡', name: '일주일의 힘', description: '한 습관을 7일 연속 달성했어요' },
  { id: 'century_score', icon: '💯', name: '백점 만점', description: '하루에 100점을 달성했어요' },
  { id: 'perfect_day', icon: '🏆', name: '완벽한 하루', description: '오늘의 모든 퀘스트를 완료했어요' },
  { id: 'boss_slayer', icon: '🛡️', name: '보스 사냥꾼', description: '주간 건강 보스를 물리쳤어요' },
  { id: 'level_5', icon: '⭐', name: '성장하는 모험가', description: '레벨 5를 달성했어요' },
  { id: 'level_10', icon: '👑', name: '건강의 달인', description: '레벨 10을 달성했어요' },
];

/** 아직 잠금 해제되지 않은 배지 중 이번 액션으로 새로 달성된 배지 id 목록 */
export function evaluateNewBadges(unlockedIds, context) {
  const unlocked = new Set(unlockedIds);
  const earned = [];
  const check = (id, condition) => {
    if (!unlocked.has(id) && condition) earned.push(id);
  };
  check('first_quest', context.totalCompletionsEver >= 1);
  check('streak_3', context.maxCurrentStreak >= 3);
  check('streak_7', context.maxCurrentStreak >= 7);
  check('century_score', context.todayScore >= 100);
  check('perfect_day', context.allHabitsCompletedToday);
  check('boss_slayer', context.bossDefeatedCount >= 1);
  check('level_5', context.level >= 5);
  check('level_10', context.level >= 10);
  return earned;
}

/** 활성 습관 수를 기반으로 그 주의 보스 체력을 산정한다 (완주 없이도 처치 가능하도록 70% 수준) */
export function createWeeklyBoss(weekStart, activeHabitCount, tier = 1) {
  const baseMax = Math.max(140, Math.round(activeHabitCount * 7 * SCORE_PER_HABIT * 0.7));
  const maxHp = Math.round(baseMax * (1 + (tier - 1) * 0.08));
  return { weekStart, maxHp, currentHp: maxHp, defeated: false, tier };
}

export function applyBossDamage(boss, amount) {
  const currentHp = Math.max(0, Math.min(boss.maxHp, boss.currentHp - amount));
  return { ...boss, currentHp, defeated: boss.defeated || currentHp <= 0 };
}
