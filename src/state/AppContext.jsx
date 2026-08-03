import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  getAll,
  getOne,
  putOne,
  putMany,
  clearAllStores,
  STORE_HABITS,
  STORE_DAILY_RECORDS,
  STORE_META,
} from '../db/db.js';
import { DEFAULT_HABITS } from '../db/schema.js';
import { todayKey, weekStartKey, addDays } from './dateUtils.js';
import {
  XP_PER_HABIT,
  COIN_PER_HABIT,
  SCORE_PER_HABIT,
  RECOVERY_BONUS_XP,
  RECOVERY_BONUS_COIN,
  BOSS_DAMAGE_PER_COMPLETION,
  xpRequiredForLevel,
  computeHabitStreak,
  didRecoverToday,
  createWeeklyBoss,
  BADGE_DEFINITIONS,
  evaluateNewBadges,
} from './gameLogic.js';

const AppContext = createContext(null);

// meta 스토어는 {key, value} 형태의 레코드로 구성된 단순 key-value 저장소다.
async function getMeta(key, fallback) {
  const record = await getOne(STORE_META, key);
  return record ? record.value : fallback;
}
function putMeta(key, value) {
  return putOne(STORE_META, { key, value });
}

/** 총 누적 경험치를 레벨 공식에 통과시켜 현재 레벨/잔여 경험치를 구한다 */
function computeLevelFromXp(totalXp) {
  let level = 1;
  let xp = totalXp;
  let xpToNext = xpRequiredForLevel(level);
  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = xpRequiredForLevel(level);
  }
  return { level, xp, xpToNext };
}

/** 특정 날짜의 습관 입력값들로부터 점수/경험치/코인을 처음부터 다시 계산한다 (증분 계산 없이 항상 재계산 -> 데이터 불일치 방지) */
function computeDayTotals(habitEntries, habits, recordsByDate, dateKey) {
  let totalScore = 0;
  let xpEarned = 0;
  let coinsEarned = 0;
  for (const habit of habits) {
    if (!habit.active) continue;
    const entry = habitEntries[habit.id];
    if (!entry?.completed) continue;
    totalScore += SCORE_PER_HABIT;
    xpEarned += XP_PER_HABIT;
    coinsEarned += COIN_PER_HABIT;
    if (didRecoverToday(habit.id, recordsByDate, dateKey)) {
      xpEarned += RECOVERY_BONUS_XP;
      coinsEarned += RECOVERY_BONUS_COIN;
    }
  }
  return { totalScore, xpEarned, coinsEarned };
}

// React StrictMode(개발 모드)는 마운트 시 effect를 두 번 실행한다.
// bootstrap()도 두 번 호출될 수 있으므로, 최초 습관 시딩 로직을 모듈 스코프
// 프로미스로 감싸 동시에 두 번 실행되어도 기본 습관이 중복 생성되지 않게 한다.
let seedingPromise = null;
function ensureHabitsSeeded() {
  if (!seedingPromise) {
    seedingPromise = (async () => {
      const existing = await getAll(STORE_HABITS);
      if (existing.length > 0) return existing;
      const seeded = DEFAULT_HABITS.map((h, i) => ({
        id: crypto.randomUUID(),
        name: h.name,
        icon: h.icon,
        type: h.type,
        unit: h.unit || '',
        order: i,
        active: true,
        createdAt: Date.now(),
        archivedAt: null,
      }));
      await putMany(STORE_HABITS, seeded);
      return seeded;
    })();
  }
  return seedingPromise;
}

async function loadEverythingFromDb() {
  const habits = await ensureHabitsSeeded();
  const recordsList = await getAll(STORE_DAILY_RECORDS);
  const recordsByDate = Object.fromEntries(recordsList.map((r) => [r.date, r]));
  const badges = await getMeta('badges', []);
  const weeklyBoss = await getMeta('weeklyBoss', null);
  const settings = await getMeta('settings', { theme: 'system' });
  return { habits, recordsByDate, badges, weeklyBoss, settings };
}

export function AppProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error

  const [habits, setHabits] = useState([]);
  const [recordsByDate, setRecordsByDate] = useState({});
  const [badges, setBadges] = useState([]);
  const [weeklyBossMeta, setWeeklyBossMeta] = useState(null);
  const [settings, setSettings] = useState({ theme: 'system' });
  const [badgeToast, setBadgeToast] = useState(null);

  const saveStatusTimer = useRef(null);
  const flashSaved = useCallback(() => {
    setSaveStatus('saved');
    clearTimeout(saveStatusTimer.current);
    saveStatusTimer.current = setTimeout(() => setSaveStatus('idle'), 1600);
  }, []);

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const data = await loadEverythingFromDb();
      setHabits(data.habits);
      setRecordsByDate(data.recordsByDate);
      setBadges(data.badges);
      setWeeklyBossMeta(data.weeklyBoss);
      setSettings(data.settings);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // 다크모드 등 테마를 <html> 요소에 반영
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (theme) => {
      const isDark =
        theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.dataset.theme = isDark ? 'dark' : 'light';
    };
    applyTheme(settings.theme);
    if (settings.theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mql.addEventListener('change', listener);
      return () => mql.removeEventListener('change', listener);
    }
    return undefined;
  }, [settings.theme]);

  const activeHabits = useMemo(() => habits.filter((h) => h.active), [habits]);

  const todayRecord = useMemo(
    () =>
      recordsByDate[todayKey()] || {
        date: todayKey(),
        habitEntries: {},
        totalScore: 0,
        xpEarned: 0,
        coinsEarned: 0,
      },
    [recordsByDate],
  );

  const profile = useMemo(() => {
    let totalXp = 0;
    let totalCoins = 0;
    let totalScoreAllTime = 0;
    for (const record of Object.values(recordsByDate)) {
      totalXp += record.xpEarned || 0;
      totalCoins += record.coinsEarned || 0;
      totalScoreAllTime += record.totalScore || 0;
    }
    return { ...computeLevelFromXp(totalXp), coins: totalCoins, totalScoreAllTime };
  }, [recordsByDate]);

  const streaksByHabit = useMemo(() => {
    const map = {};
    for (const habit of habits) {
      map[habit.id] = computeHabitStreak(habit.id, recordsByDate, todayKey());
    }
    return map;
  }, [habits, recordsByDate]);

  // 주간 보스: 매주 새로 생성되고, 완료 횟수에 비례해 체력이 줄어든다 (파생값 + tier만 영속 저장)
  const weeklyBossView = useMemo(() => {
    const currentWeekStart = weekStartKey(todayKey());
    const base = weeklyBossMeta && weeklyBossMeta.weekStart === currentWeekStart
      ? weeklyBossMeta
      : {
          weekStart: currentWeekStart,
          tier: weeklyBossMeta?.defeatRecorded ? (weeklyBossMeta.tier || 1) + 1 : weeklyBossMeta?.tier || 1,
          defeatRecorded: false,
          lifetimeDefeats: weeklyBossMeta?.lifetimeDefeats || 0,
        };

    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    let completions = 0;
    for (const dateKey of weekDates) {
      const record = recordsByDate[dateKey];
      if (!record) continue;
      completions += Object.values(record.habitEntries).filter((e) => e.completed).length;
    }
    const boss = createWeeklyBoss(currentWeekStart, activeHabits.length, base.tier);
    const currentHp = Math.max(0, boss.maxHp - completions * BOSS_DAMAGE_PER_COMPLETION);
    const defeated = currentHp <= 0;
    return { ...base, maxHp: boss.maxHp, currentHp, defeated, weekDates, completions };
  }, [weeklyBossMeta, recordsByDate, activeHabits.length]);

  // 주가 바뀌었거나 보스를 새로 처치했을 때만 meta에 반영 (불필요한 반복 저장 방지)
  useEffect(() => {
    if (status !== 'ready') return;
    const needsWeekRollover = !weeklyBossMeta || weeklyBossMeta.weekStart !== weeklyBossView.weekStart;
    const needsDefeatFlag = weeklyBossView.defeated && !weeklyBossView.defeatRecorded;
    if (!needsWeekRollover && !needsDefeatFlag) return;

    const nextMeta = {
      weekStart: weeklyBossView.weekStart,
      tier: weeklyBossView.tier,
      defeatRecorded: weeklyBossView.defeated,
      lifetimeDefeats: weeklyBossView.lifetimeDefeats + (needsDefeatFlag ? 1 : 0),
    };
    setWeeklyBossMeta(nextMeta);
    putMeta('weeklyBoss', nextMeta).catch(() => {
      setErrorMessage('주간 보스 정보를 저장하지 못했습니다.');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, weeklyBossView.weekStart, weeklyBossView.defeated]);

  // 새로운 업적 배지 자동 판정
  useEffect(() => {
    if (status !== 'ready') return;
    const totalCompletionsEver = Object.values(recordsByDate).reduce(
      (sum, r) => sum + Object.values(r.habitEntries).filter((e) => e.completed).length,
      0,
    );
    const maxCurrentStreak = Math.max(0, ...Object.values(streaksByHabit).map((s) => s.current));
    const allHabitsCompletedToday =
      activeHabits.length > 0 && activeHabits.every((h) => todayRecord.habitEntries[h.id]?.completed);

    const context = {
      totalCompletionsEver,
      maxCurrentStreak,
      todayScore: todayRecord.totalScore,
      allHabitsCompletedToday,
      bossDefeatedCount: weeklyBossView.lifetimeDefeats,
      level: profile.level,
    };
    const earnedIds = evaluateNewBadges(
      badges.map((b) => b.id),
      context,
    );
    if (earnedIds.length === 0) return;

    const nextBadges = [...badges, ...earnedIds.map((id) => ({ id, unlockedAt: Date.now() }))];
    setBadges(nextBadges);
    setBadgeToast(BADGE_DEFINITIONS.find((b) => b.id === earnedIds[earnedIds.length - 1]));
    putMeta('badges', nextBadges).catch(() => {
      setErrorMessage('배지 정보를 저장하지 못했습니다.');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, recordsByDate, streaksByHabit, weeklyBossView.lifetimeDefeats, profile.level]);

  const persistTodayEntry = useCallback(
    async (habitId, patch) => {
      setSaveStatus('saving');
      try {
        const dateKey = todayKey();
        const existingRecord = recordsByDate[dateKey] || {
          date: dateKey,
          habitEntries: {},
          totalScore: 0,
          xpEarned: 0,
          coinsEarned: 0,
        };
        const existingEntry = existingRecord.habitEntries[habitId] || {
          completed: false,
          value: null,
          note: '',
        };
        const newHabitEntries = {
          ...existingRecord.habitEntries,
          [habitId]: { ...existingEntry, ...patch },
        };
        const totals = computeDayTotals(newHabitEntries, habits, recordsByDate, dateKey);
        const newRecord = {
          ...existingRecord,
          habitEntries: newHabitEntries,
          ...totals,
          updatedAt: Date.now(),
        };
        await putOne(STORE_DAILY_RECORDS, newRecord);
        setRecordsByDate((prev) => ({ ...prev, [dateKey]: newRecord }));
        flashSaved();
      } catch (err) {
        setSaveStatus('error');
        setErrorMessage(err?.message || '기록을 저장하지 못했습니다.');
      }
    },
    [habits, recordsByDate, flashSaved],
  );

  const toggleCheck = useCallback(
    (habitId) => {
      const current = todayRecord.habitEntries[habitId]?.completed || false;
      return persistTodayEntry(habitId, { completed: !current });
    },
    [todayRecord, persistTodayEntry],
  );

  const setNumberValue = useCallback(
    (habitId, rawValue) => {
      const value = rawValue === '' || rawValue === null ? null : Number(rawValue);
      const completed = value !== null && !Number.isNaN(value);
      return persistTodayEntry(habitId, { value: completed ? value : null, completed });
    },
    [persistTodayEntry],
  );

  const setNoteValue = useCallback(
    (habitId, text) => {
      const completed = text.trim().length > 0;
      return persistTodayEntry(habitId, { note: text, completed });
    },
    [persistTodayEntry],
  );

  const addHabit = useCallback(
    async ({ name, icon, type, unit }) => {
      setSaveStatus('saving');
      try {
        const maxOrder = habits.reduce((m, h) => Math.max(m, h.order), -1);
        const newHabit = {
          id: crypto.randomUUID(),
          name: name.trim(),
          icon: icon || '✨',
          type,
          unit: unit || '',
          order: maxOrder + 1,
          active: true,
          createdAt: Date.now(),
          archivedAt: null,
        };
        await putOne(STORE_HABITS, newHabit);
        setHabits((prev) => [...prev, newHabit]);
        flashSaved();
      } catch (err) {
        setSaveStatus('error');
        setErrorMessage(err?.message || '습관을 추가하지 못했습니다.');
      }
    },
    [habits, flashSaved],
  );

  const updateHabit = useCallback(
    async (habitId, patch) => {
      setSaveStatus('saving');
      try {
        const target = habits.find((h) => h.id === habitId);
        if (!target) return;
        const updated = { ...target, ...patch };
        await putOne(STORE_HABITS, updated);
        setHabits((prev) => prev.map((h) => (h.id === habitId ? updated : h)));
        flashSaved();
      } catch (err) {
        setSaveStatus('error');
        setErrorMessage(err?.message || '습관을 수정하지 못했습니다.');
      }
    },
    [habits, flashSaved],
  );

  // 습관을 삭제해도 과거 dailyRecords는 그대로 남기기 위해 실제 삭제 대신 보관(archive) 처리한다.
  const deleteHabit = useCallback(
    (habitId) => updateHabit(habitId, { active: false, archivedAt: Date.now() }),
    [updateHabit],
  );

  const dismissBadgeToast = useCallback(() => setBadgeToast(null), []);

  const setTheme = useCallback(
    async (theme) => {
      const next = { ...settings, theme };
      setSettings(next);
      try {
        await putMeta('settings', next);
        flashSaved();
      } catch (err) {
        setSaveStatus('error');
        setErrorMessage(err?.message || '설정을 저장하지 못했습니다.');
      }
    },
    [settings, flashSaved],
  );

  const buildBackupData = useCallback(
    () => ({
      version: 1,
      exportedAt: Date.now(),
      habits,
      dailyRecords: Object.values(recordsByDate),
      meta: { badges, weeklyBoss: weeklyBossMeta, settings },
    }),
    [habits, recordsByDate, badges, weeklyBossMeta, settings],
  );

  const restoreFromBackup = useCallback(async (data) => {
    if (!data || !Array.isArray(data.habits) || !Array.isArray(data.dailyRecords)) {
      throw new Error('올바른 백업 파일 형식이 아닙니다.');
    }
    setSaveStatus('saving');
    try {
      await clearAllStores();
      seedingPromise = null; // 복원된 습관으로 다시 시딩 판단을 하도록 캐시 초기화
      if (data.habits.length > 0) await putMany(STORE_HABITS, data.habits);
      if (data.dailyRecords.length > 0) await putMany(STORE_DAILY_RECORDS, data.dailyRecords);
      if (data.meta?.badges) await putMeta('badges', data.meta.badges);
      if (data.meta?.weeklyBoss) await putMeta('weeklyBoss', data.meta.weeklyBoss);
      if (data.meta?.settings) await putMeta('settings', data.meta.settings);
      await bootstrap();
      flashSaved();
    } catch (err) {
      setSaveStatus('error');
      setErrorMessage(err?.message || '백업을 복원하지 못했습니다.');
      throw err;
    }
  }, [bootstrap, flashSaved]);

  const resetAllData = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await clearAllStores();
      seedingPromise = null; // 초기화 후 기본 습관을 다시 심을 수 있도록 캐시 초기화
      await bootstrap();
      flashSaved();
    } catch (err) {
      setSaveStatus('error');
      setErrorMessage(err?.message || '초기화하지 못했습니다.');
      throw err;
    }
  }, [bootstrap, flashSaved]);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const value = useMemo(
    () => ({
      status,
      errorMessage,
      saveStatus,
      habits,
      activeHabits,
      recordsByDate,
      todayRecord,
      profile,
      streaksByHabit,
      badges,
      badgeDefinitions: BADGE_DEFINITIONS,
      badgeToast,
      weeklyBossView,
      settings,
      actions: {
        toggleCheck,
        setNumberValue,
        setNoteValue,
        addHabit,
        updateHabit,
        deleteHabit,
        setTheme,
        buildBackupData,
        restoreFromBackup,
        resetAllData,
        dismissBadgeToast,
        clearError,
      },
    }),
    [
      status,
      errorMessage,
      saveStatus,
      habits,
      activeHabits,
      recordsByDate,
      todayRecord,
      profile,
      streaksByHabit,
      badges,
      badgeToast,
      weeklyBossView,
      settings,
      toggleCheck,
      setNumberValue,
      setNoteValue,
      addHabit,
      updateHabit,
      deleteHabit,
      setTheme,
      buildBackupData,
      restoreFromBackup,
      resetAllData,
      dismissBadgeToast,
      clearError,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp은 AppProvider 내부에서만 사용할 수 있습니다.');
  return ctx;
}
