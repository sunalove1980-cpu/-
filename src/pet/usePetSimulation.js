// 펫 시뮬레이션의 핵심 훅.
// - 매 틱(TICK_MS)마다 스탯을 변화시키고, 현재 행동을 진행시키거나 다음 행동을 뽑는다.
// - 이동은 목표 지점까지 거리 기반으로 계산해 "실제로 걸어가는" 것처럼 보이게 한다.
// - 눈 깜빡임은 메인 루프와 독립적인 랜덤 타이머로 돌아간다 (반복 GIF처럼 보이지 않도록).
// - 건강기록 버튼(logAction)은 펫을 해당 장소로 걷게 한 뒤 축하 행동을 재생하고,
//   경험치/오늘 기록/연속 실천일을 localStorage에 저장한다.
import { useCallback, useEffect, useRef, useState } from 'react';
import { MOVE_SPEED_PER_SEC, START_POS, STAT_RATES, TICK_MS, clamp, depthScale } from './constants.js';
import { decideNextActivity, drinkDuration, sleepDuration } from './behaviors.js';
import { getAction } from './actions.js';
import { ACTION_XP, XP_PER_LEVEL, bumpStreak, loadState, saveState, todayKey } from './storage.js';

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function formatLastSeen(ms) {
  if (!ms) return null;
  const diff = Date.now() - ms;
  if (diff < 60_000) return '방금 전';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`;
  return `${Math.floor(diff / 86_400_000)}일 전`;
}

function snapshotFrom(sim) {
  return {
    position: sim.position,
    facing: sim.facing,
    activity: sim.activity,
    stats: { ...sim.stats },
    scale: depthScale(sim.position.y),
    petName: sim.progress.petName,
    xp: sim.progress.xp,
    level: 1 + Math.floor(sim.progress.xp / XP_PER_LEVEL),
    healthEnergy: sim.progress.xp % XP_PER_LEVEL,
    streakDays: sim.progress.streakDays,
    todayRecords: { ...sim.progress.todayRecords },
  };
}

function buildArrivalActivity(walkActivity, stats) {
  const { nextType, particle, pajama } = walkActivity;
  if (nextType === 'sleep') return { type: 'sleep', duration: sleepDuration(stats.energy), elapsed: 0 };
  if (nextType === 'drink') return { type: 'drink', duration: drinkDuration(stats.hydration), elapsed: 0 };
  if (nextType === 'actionYawn') return { type: 'actionYawn', duration: 900, elapsed: 0, particle, pajama };
  if (nextType === 'actionCelebrate') return { type: 'actionCelebrate', duration: 1600, elapsed: 0, particle, pajama };
  return { type: 'idle', duration: 1200 + Math.random() * 1600, elapsed: 0 };
}

function nextAfter(activity, sim) {
  if (activity.type === 'tapLook') {
    return { type: 'tapHappy', duration: 1300 + Math.random() * 500, elapsed: 0 };
  }
  if (activity.type === 'actionYawn') {
    return { type: 'actionCelebrate', duration: 1600, elapsed: 0, particle: activity.particle, pajama: activity.pajama };
  }
  if (activity.type === 'tapHappy' || activity.type === 'actionCelebrate') {
    return decideNextActivity(sim.stats);
  }
  if (activity.type === 'sleep') {
    if (sim.stats.energy < 82) {
      // 아직 덜 잤으면 살짝 뒤척이다 다시 잠든다
      return { type: 'sleep', duration: sleepDuration(sim.stats.energy) * 0.6, elapsed: 0 };
    }
    return { type: 'yawn', duration: 1100, elapsed: 0, waking: true };
  }
  return decideNextActivity(sim.stats);
}

function updateStats(sim, dt) {
  const { stats, activity } = sim;
  stats.energy = clamp(
    stats.energy + (activity.type === 'sleep' ? STAT_RATES.energyRegenPerSec : -STAT_RATES.energyDecayPerSec) * dt,
  );
  stats.hydration = clamp(
    stats.hydration +
      (activity.type === 'drink' ? STAT_RATES.hydrationRegenPerSec : -STAT_RATES.hydrationDecayPerSec) * dt,
  );
  const needsAreFine = stats.energy > 55 && stats.hydration > 55;
  const isCelebrating = activity.type === 'tapHappy' || activity.type === 'actionCelebrate';
  const moodDelta = isCelebrating
    ? STAT_RATES.moodRegenNearFullNeedsPerSec * 4
    : needsAreFine
      ? STAT_RATES.moodRegenNearFullNeedsPerSec
      : -STAT_RATES.moodDecayPerSec;
  stats.mood = clamp(stats.mood + moodDelta * dt);
}

function updateActivity(sim, dt) {
  const activity = sim.activity;

  if (activity.type === 'walk') {
    const step = MOVE_SPEED_PER_SEC * dt;
    const dist = distance(sim.position, activity.target);
    if (dist <= step) {
      sim.position = { ...activity.target };
      sim.activity = buildArrivalActivity(activity, sim.stats);
    } else {
      const dx = activity.target.x - sim.position.x;
      const dy = activity.target.y - sim.position.y;
      sim.position = {
        x: sim.position.x + (dx / dist) * step,
        y: sim.position.y + (dy / dist) * step,
      };
      if (Math.abs(dx) > 0.4) sim.facing = dx < 0 ? -1 : 1;
    }
    return;
  }

  activity.elapsed = (activity.elapsed || 0) + dt * 1000;
  if (activity.elapsed < activity.duration) return;

  sim.activity = nextAfter(activity, sim);
}

function tick(sim, dtSeconds) {
  updateStats(sim, dtSeconds);
  updateActivity(sim, dtSeconds);
}

function toSavedShape(sim) {
  return {
    petName: sim.progress.petName,
    stats: { ...sim.stats },
    xp: sim.progress.xp,
    streakDays: sim.progress.streakDays,
    lastRecordDateKey: sim.progress.lastRecordDateKey,
    todayKey: sim.progress.todayKey,
    todayRecords: { ...sim.progress.todayRecords },
    lastSeenAt: Date.now(),
  };
}

export function usePetSimulation() {
  const loadedRef = useRef(null);
  if (loadedRef.current === null) loadedRef.current = loadState();
  const loaded = loadedRef.current;

  const lastSeenLabelRef = useRef(formatLastSeen(loaded.lastSeenAt));

  const simRef = useRef({
    position: { ...START_POS },
    facing: 1,
    activity: { type: 'idle', duration: 2200, elapsed: 0 },
    stats: { ...loaded.stats },
    progress: {
      petName: loaded.petName,
      xp: loaded.xp,
      streakDays: loaded.streakDays,
      lastRecordDateKey: loaded.lastRecordDateKey,
      todayKey: loaded.todayKey,
      todayRecords: { ...loaded.todayRecords },
    },
  });

  const [render, setRender] = useState(() => snapshotFrom(simRef.current));
  const [isBlinking, setIsBlinking] = useState(false);

  const persist = useCallback(() => {
    saveState(toSavedShape(simRef.current));
  }, []);

  // 메인 시뮬레이션 루프
  useEffect(() => {
    const interval = setInterval(() => {
      tick(simRef.current, TICK_MS / 1000);
      setRender(snapshotFrom(simRef.current));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  // 5초마다 + 탭이 백그라운드로 가거나 닫힐 때 자동 저장 (이름/상태/경험치/오늘 기록/접속 시간 유지)
  useEffect(() => {
    const saveInterval = setInterval(persist, 5000);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') persist();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', persist);
    window.addEventListener('beforeunload', persist);
    return () => {
      clearInterval(saveInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', persist);
      window.removeEventListener('beforeunload', persist);
      persist();
    };
  }, [persist]);

  // 눈 깜빡임: 메인 루프와 별개인 랜덤 타이머 (자연스러운 리듬을 위해)
  useEffect(() => {
    let cancelled = false;
    let blinkTimer;
    let openTimer;
    function scheduleBlink() {
      const delay = 2200 + Math.random() * 3200;
      blinkTimer = setTimeout(() => {
        if (cancelled) return;
        const type = simRef.current.activity.type;
        if (type === 'sleep' || type === 'yawn' || type === 'actionYawn') {
          scheduleBlink();
          return;
        }
        setIsBlinking(true);
        openTimer = setTimeout(() => {
          if (!cancelled) setIsBlinking(false);
        }, 140);
        scheduleBlink();
      }, delay);
    }
    scheduleBlink();
    return () => {
      cancelled = true;
      clearTimeout(blinkTimer);
      clearTimeout(openTimer);
    };
  }, []);

  const onTapPet = useCallback(() => {
    const sim = simRef.current;
    if (sim.activity.type === 'tapLook' || sim.activity.type === 'tapHappy') return;
    sim.activity = { type: 'tapLook', duration: 500, elapsed: 0 };
    sim.stats.mood = clamp(sim.stats.mood + STAT_RATES.moodBoostOnPat);
    setRender(snapshotFrom(sim));
  }, []);

  const logAction = useCallback(
    (key) => {
      const action = getAction(key);
      if (!action) return;
      const sim = simRef.current;
      const progress = sim.progress;

      // 앱을 켜 둔 채로 자정을 넘겼다면 오늘 기록을 새로 시작한다.
      const today = todayKey();
      if (progress.todayKey !== today) {
        progress.todayKey = today;
        progress.todayRecords = {};
      }

      // 스탯에 직접 반영 (사용자의 건강행동 → 펫의 상태로 바로 연결)
      for (const [statKey, delta] of Object.entries(action.statDelta)) {
        sim.stats[statKey] = clamp(sim.stats[statKey] + delta);
      }

      progress.xp += ACTION_XP;
      progress.todayRecords[key] = (progress.todayRecords[key] || 0) + 1;
      bumpStreak(progress);

      // 하던 행동을 멈추고 해당 장소로 걸어가 축하 행동을 한다.
      sim.activity = {
        type: 'walk',
        target: action.getTarget(),
        nextType: action.pajama ? 'actionYawn' : 'actionCelebrate',
        particle: action.particle,
        pajama: Boolean(action.pajama),
      };

      setRender(snapshotFrom(sim));
      persist();
    },
    [persist],
  );

  return {
    position: render.position,
    facing: render.facing,
    scale: render.scale,
    activity: render.activity,
    stats: render.stats,
    isBlinking,
    onTapPet,
    petName: render.petName,
    level: render.level,
    xp: render.xp,
    healthEnergy: render.healthEnergy,
    streakDays: render.streakDays,
    todayRecords: render.todayRecords,
    lastSeenLabel: lastSeenLabelRef.current,
    logAction,
  };
}
