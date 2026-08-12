// 펫 시뮬레이션의 핵심 훅.
// - 매 틱(TICK_MS)마다 스탯을 변화시키고, 현재 행동을 진행시키거나 다음 행동을 뽑는다.
// - 이동은 목표 지점까지 거리 기반으로 계산해 "실제로 걸어가는" 것처럼 보이게 한다.
// - 눈 깜빡임은 메인 루프와 독립적인 랜덤 타이머로 돌아간다 (반복 GIF처럼 보이지 않도록).
import { useCallback, useEffect, useRef, useState } from 'react';
import { MOVE_SPEED_PER_SEC, START_POS, STAT_RATES, TICK_MS, clamp, depthScale } from './constants.js';
import { decideNextActivity, drinkDuration, sleepDuration } from './behaviors.js';

const INITIAL_STATS = { energy: 78, hydration: 72, mood: 84 };

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function snapshotFrom(sim) {
  return {
    position: sim.position,
    facing: sim.facing,
    activity: sim.activity,
    stats: { ...sim.stats },
    scale: depthScale(sim.position.y),
  };
}

function buildArrivalActivity(nextType, stats) {
  if (nextType === 'sleep') return { type: 'sleep', duration: sleepDuration(stats.energy), elapsed: 0 };
  if (nextType === 'drink') return { type: 'drink', duration: drinkDuration(stats.hydration), elapsed: 0 };
  return { type: 'idle', duration: 1200 + Math.random() * 1600, elapsed: 0 };
}

function nextAfter(activity, sim) {
  if (activity.type === 'tapLook') {
    return { type: 'tapHappy', duration: 1300 + Math.random() * 500, elapsed: 0 };
  }
  if (activity.type === 'tapHappy') {
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
  const moodDelta =
    activity.type === 'tapHappy'
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
      sim.activity = buildArrivalActivity(activity.nextType, sim.stats);
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

export function usePetSimulation() {
  const simRef = useRef({
    position: { ...START_POS },
    facing: 1,
    activity: { type: 'idle', duration: 2200, elapsed: 0 },
    stats: { ...INITIAL_STATS },
  });

  const [render, setRender] = useState(() => snapshotFrom(simRef.current));
  const [isBlinking, setIsBlinking] = useState(false);

  // 메인 시뮬레이션 루프
  useEffect(() => {
    const interval = setInterval(() => {
      tick(simRef.current, TICK_MS / 1000);
      setRender(snapshotFrom(simRef.current));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

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
        if (type === 'sleep' || type === 'yawn') {
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

  return {
    position: render.position,
    facing: render.facing,
    scale: render.scale,
    activity: render.activity,
    stats: render.stats,
    isBlinking,
    onTapPet,
  };
}
