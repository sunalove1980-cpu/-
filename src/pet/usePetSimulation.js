// 펫 시뮬레이션의 핵심 훅.
// - 매 틱(TICK_MS)마다 스탯을 변화시키고, 현재 행동을 진행시키거나 다음 행동을 뽑는다.
// - 이동은 목표 지점까지 거리 기반으로 계산해 "실제로 걸어가는" 것처럼 보이게 한다.
// - 눈 깜빡임은 메인 루프와 독립적인 랜덤 타이머로 돌아간다 (반복 GIF처럼 보이지 않도록).
// - 건강기록(logAction)은 펫에게 먹이를 주는 보상 연출을 재생하고, 경험치/날짜별 기록을
//   localStorage에 저장한다. 사용자가 직접 추가한 행동(최대 20개)도 여기서 관리한다.
// - 자정을 넘겨서야 목표를 채우는 경우가 많아서, 기록은 "오늘"만이 아니라 원하는 날짜를
//   골라 남길 수 있다 (selectedDate). 과거 날짜 기록은 경험치만 반영하고, 펫의 실시간
//   상태(스탯)나 이동/축하 연출은 오늘 기록일 때만 재생한다.
// - 오래 방치하면 스탯 감소가 점점 빨라지고, 앱을 꺼둔 사이 지난 시간만큼 그리움 페널티가
//   한 번에 반영된다. 화면을 드래그하면 펫이 손가락을 따라온다.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FOLLOW_SPEED_PER_SEC,
  MOVE_SPEED_PER_SEC,
  START_POS,
  STAT_RATES,
  TICK_MS,
  clamp,
  depthScale,
  neglectMultiplier,
} from './constants.js';
import { decideNextActivity, drinkDuration, sleepDuration } from './behaviors.js';
import { MAX_ACTIONS, createCustomAction, findAction, loadActions, resolveAction, saveActions } from './actions.js';
import { TAP_REACTION_KINDS } from './expression.js';
import {
  ACTION_XP,
  XP_PER_LEVEL,
  applyOfflineNeglect,
  computeStreak,
  loadState,
  saveState,
  todayKey,
} from './storage.js';

const EYES_ALREADY_SET = new Set(['sleep', 'yawn', 'actionYawn', 'lonely', 'daydream']);
const TOAST_VISIBLE_MS = 2600;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function randomTapKind() {
  return TAP_REACTION_KINDS[Math.floor(Math.random() * TAP_REACTION_KINDS.length)];
}

function markInteraction(sim) {
  sim.lastInteractionAt = Date.now();
}

function formatLastSeen(ms) {
  if (!ms) return null;
  const diff = Date.now() - ms;
  if (diff < 60_000) return '방금 전';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`;
  return `${Math.floor(diff / 86_400_000)}일 전`;
}

function formatShortDate(dateKey) {
  const [, m, d] = dateKey.split('-');
  return `${Number(m)}/${Number(d)}`;
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
    recordsByDate: sim.progress.recordsByDate,
  };
}

function buildArrivalActivity(walkActivity, stats) {
  const { nextType, particle, pajama, icon } = walkActivity;
  if (nextType === 'sleep') return { type: 'sleep', duration: sleepDuration(stats.energy), elapsed: 0 };
  if (nextType === 'drink') return { type: 'drink', duration: drinkDuration(stats.hydration), elapsed: 0 };
  if (nextType === 'actionYawn') return { type: 'actionYawn', duration: 900, elapsed: 0, particle, pajama, icon };
  if (nextType === 'actionReceive') return { type: 'actionReceive', duration: 700, elapsed: 0, particle, pajama, icon };
  return { type: 'idle', duration: 1200 + Math.random() * 1600, elapsed: 0 };
}

function nextAfter(activity, sim) {
  if (activity.type === 'tapLook') {
    return { type: 'tapReact', kind: activity.kind, duration: 1300 + Math.random() * 500, elapsed: 0 };
  }
  if (activity.type === 'actionYawn') {
    return {
      type: 'actionReceive',
      duration: 700,
      elapsed: 0,
      particle: activity.particle,
      pajama: activity.pajama,
      icon: activity.icon,
    };
  }
  if (activity.type === 'actionReceive') {
    return { type: 'actionCelebrate', duration: 1600, elapsed: 0, particle: activity.particle, pajama: activity.pajama };
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
  const idleMs = Date.now() - sim.lastInteractionAt;
  const neglect = neglectMultiplier(idleMs);

  stats.energy = clamp(
    stats.energy +
      (activity.type === 'sleep' ? STAT_RATES.energyRegenPerSec : -STAT_RATES.energyDecayPerSec * neglect) * dt,
  );
  stats.hydration = clamp(
    stats.hydration +
      (activity.type === 'drink' ? STAT_RATES.hydrationRegenPerSec : -STAT_RATES.hydrationDecayPerSec * neglect) *
        dt,
  );
  const needsAreFine = stats.energy > 55 && stats.hydration > 55;
  const isCelebrating = activity.type === 'tapReact' || activity.type === 'actionCelebrate';
  const moodDelta = isCelebrating
    ? STAT_RATES.moodRegenNearFullNeedsPerSec * 4
    : needsAreFine
      ? STAT_RATES.moodRegenNearFullNeedsPerSec
      : -STAT_RATES.moodDecayPerSec * neglect;
  stats.mood = clamp(stats.mood + moodDelta * dt);
}

function updateActivity(sim, dt) {
  const activity = sim.activity;

  if (activity.type === 'follow') {
    const step = FOLLOW_SPEED_PER_SEC * dt;
    const dist = distance(sim.position, activity.target);
    if (dist > 0.4) {
      const dx = activity.target.x - sim.position.x;
      const dy = activity.target.y - sim.position.y;
      const move = Math.min(step, dist);
      sim.position = {
        x: sim.position.x + (dx / dist) * move,
        y: sim.position.y + (dy / dist) * move,
      };
      if (Math.abs(dx) > 0.4) sim.facing = dx < 0 ? -1 : 1;
    }
    return;
  }

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
    recordsByDate: sim.progress.recordsByDate,
    lastSeenAt: Date.now(),
  };
}

export function usePetSimulation() {
  const loadedRef = useRef(null);
  if (loadedRef.current === null) {
    const loaded = loadState();
    // 앱을 꺼둔 사이 지난 시간만큼 "그리워하던" 페널티를 한 번에 반영한다.
    const offlineMs = loaded.lastSeenAt ? Date.now() - loaded.lastSeenAt : 0;
    loaded.stats = applyOfflineNeglect(loaded.stats, offlineMs);
    loadedRef.current = loaded;
  }
  const loaded = loadedRef.current;

  const lastSeenLabelRef = useRef(formatLastSeen(loaded.lastSeenAt));

  const simRef = useRef({
    position: { ...START_POS },
    facing: 1,
    activity: { type: 'idle', duration: 2200, elapsed: 0 },
    stats: { ...loaded.stats },
    lastInteractionAt: Date.now(),
    isFollowing: false,
    progress: {
      petName: loaded.petName,
      xp: loaded.xp,
      recordsByDate: { ...loaded.recordsByDate },
    },
  });

  const [render, setRender] = useState(() => snapshotFrom(simRef.current));
  const [isBlinking, setIsBlinking] = useState(false);

  // 지금 건강기록 버튼이 어느 날짜를 향하고 있는지. 기본은 오늘이지만, 자정을 넘겨서야
  // 목표를 채우는 경우가 많아 사용자가 최근 며칠 중 원하는 날짜로 바꿀 수 있다.
  const [selectedDate, setSelectedDate] = useState(() => todayKey());

  // 사용자가 정의한 건강기록 행동 목록 (기본 5종 + 커스텀, 최대 20개)
  const [actions, setActions] = useState(() => loadActions());
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  // 과거 날짜에 기록했을 때 보여줄 짧은 안내 토스트 (오늘 기록과 달리 펫이 반응하지 않으므로)
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);
  const showToast = useCallback((message) => {
    setToastMessage(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), TOAST_VISIBLE_MS);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

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

  // 5초마다 + 탭이 백그라운드로 가거나 닫힐 때 자동 저장 (이름/상태/경험치/기록/접속 시간 유지)
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
        if (EYES_ALREADY_SET.has(type)) {
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
    if (sim.activity.type === 'tapLook' || sim.activity.type === 'tapReact') return;
    sim.activity = { type: 'tapLook', kind: randomTapKind(), duration: 500, elapsed: 0 };
    sim.stats.mood = clamp(sim.stats.mood + STAT_RATES.moodBoostOnPat);
    markInteraction(sim);
    setRender(snapshotFrom(sim));
  }, []);

  // 화면을 누른 채 드래그하면 펫이 손가락을 따라온다.
  const startFollow = useCallback((point) => {
    const sim = simRef.current;
    sim.isFollowing = true;
    sim.activity = { type: 'follow', target: point };
    markInteraction(sim);
    setRender(snapshotFrom(sim));
  }, []);

  const updateFollow = useCallback((point) => {
    const sim = simRef.current;
    if (!sim.isFollowing) return;
    sim.activity.target = point;
    markInteraction(sim);
  }, []);

  const endFollow = useCallback(() => {
    const sim = simRef.current;
    if (!sim.isFollowing) return;
    sim.isFollowing = false;
    sim.activity = { type: 'tapReact', kind: randomTapKind(), duration: 900 + Math.random() * 500, elapsed: 0 };
    sim.stats.mood = clamp(sim.stats.mood + STAT_RATES.moodBoostOnPat * 0.6);
    setRender(snapshotFrom(sim));
  }, []);

  const logAction = useCallback(
    (id) => {
      const action = findAction(actionsRef.current, id);
      if (!action) return;
      const resolved = resolveAction(action);
      const sim = simRef.current;
      const progress = sim.progress;
      const dateKey = selectedDate;
      const isToday = dateKey === todayKey();

      if (!progress.recordsByDate[dateKey]) progress.recordsByDate[dateKey] = {};
      progress.recordsByDate[dateKey][id] = (progress.recordsByDate[dateKey][id] || 0) + 1;
      progress.xp += ACTION_XP;

      if (isToday) {
        // 오늘 기록은 펫의 실시간 상태에 바로 반영되고, 걸어가서 보상을 받는 연출도 재생한다.
        for (const [statKey, delta] of Object.entries(resolved.statDelta)) {
          sim.stats[statKey] = clamp(sim.stats[statKey] + delta);
        }
        markInteraction(sim);
        const target = resolved.getTarget ? resolved.getTarget() : null;
        const firstStage = resolved.pajama ? 'actionYawn' : 'actionReceive';
        const payload = { particle: resolved.particle, pajama: resolved.pajama, icon: action.icon };
        sim.activity = target
          ? { type: 'walk', target, nextType: firstStage, ...payload }
          : buildArrivalActivity({ nextType: firstStage, ...payload }, sim.stats);
      } else {
        // 지난 날짜 기록은 경험치만 채워주고, 펫을 실시간으로 움직이지는 않는다.
        showToast(`${formatShortDate(dateKey)} 기록에 '${action.label}'을(를) 추가했어요`);
      }

      setRender(snapshotFrom(sim));
      persist();
    },
    [persist, selectedDate, showToast],
  );

  // 이미 기록한 행동을 취소한다 (실수로 두 번 누르는 걸 막기 위해, 두 번째 탭부터는
  // 바로 기록을 더 쌓지 않고 확인창을 거쳐 여기로 온다). 오늘 기록일 때만 스탯을 되돌리고,
  // 지난 날짜 기록은 경험치만 되돌린다 (과거 시점 펫 상태는 따로 남아있지 않기 때문).
  const cancelAction = useCallback(
    (id) => {
      const sim = simRef.current;
      const progress = sim.progress;
      const dateKey = selectedDate;
      const isToday = dateKey === todayKey();
      const dayRecords = progress.recordsByDate[dateKey];
      if (!dayRecords || !dayRecords[id]) return;

      if (isToday) {
        const action = findAction(actionsRef.current, id);
        if (action) {
          const resolved = resolveAction(action);
          for (const [statKey, delta] of Object.entries(resolved.statDelta)) {
            sim.stats[statKey] = clamp(sim.stats[statKey] - delta);
          }
        }
        markInteraction(sim);
      }
      progress.xp = Math.max(0, progress.xp - ACTION_XP);
      delete dayRecords[id];

      setRender(snapshotFrom(sim));
      persist();
    },
    [persist, selectedDate],
  );

  const addAction = useCallback((label, icon) => {
    if (!label.trim()) return;
    setActions((prev) => {
      if (prev.length >= MAX_ACTIONS) return prev;
      const next = [...prev, createCustomAction(label, icon)];
      saveActions(next);
      return next;
    });
  }, []);

  const removeAction = useCallback((id) => {
    setActions((prev) => {
      if (prev.length <= 1) return prev; // 최소 1개는 남겨둔다
      const next = prev.filter((action) => action.id !== id);
      saveActions(next);
      return next;
    });
  }, []);

  return {
    position: render.position,
    facing: render.facing,
    scale: render.scale,
    activity: render.activity,
    stats: render.stats,
    isBlinking,
    onTapPet,
    startFollow,
    updateFollow,
    endFollow,
    petName: render.petName,
    level: render.level,
    xp: render.xp,
    healthEnergy: render.healthEnergy,
    streakDays: computeStreak(render.recordsByDate),
    recordsByDate: render.recordsByDate,
    selectedDate,
    selectDate: setSelectedDate,
    selectedDateRecords: render.recordsByDate[selectedDate] || {},
    toastMessage,
    lastSeenLabel: lastSeenLabelRef.current,
    actions,
    addAction,
    removeAction,
    logAction,
    cancelAction,
  };
}
