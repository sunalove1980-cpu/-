import { useCallback, useEffect, useRef, useState } from 'react';

// 캐릭터가 화면(부모 컨테이너) 안을 스스로 어슬렁거리며 돌아다니게 하는 훅.
// - 매 프레임 목표 지점을 향해 일정 속도로 이동하고, 도착하면 잠깐 쉬었다가 새 목표를 고른다.
// - freeze(ms) 를 호출하면 그 시간 동안 이동을 멈춘다 (터치 반응 애니메이션 중 등).

export const CHAR_SIZE = 104; // px — Character.css 의 크기와 맞춰야 함

export function useWander(containerRef, { speed = 55, minPause = 900, maxPause = 2600 } = {}) {
  const [pos, setPos] = useState({ x: 40, y: 60 });
  const [facing, setFacing] = useState(1); // 1: 오른쪽, -1: 왼쪽
  const posRef = useRef(pos);
  const targetRef = useRef(null);
  const pausedUntilRef = useRef(0);
  const frozenUntilRef = useRef(0);

  const pickTarget = useCallback(() => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const maxX = Math.max(rect.width - CHAR_SIZE, 0);
    const maxY = Math.max(rect.height - CHAR_SIZE, 0);
    return {
      x: Math.random() * maxX,
      // 화면 중간~아래쪽 대(band)에서만 돌아다니게 해서 상단 UI와 안 겹치게 한다.
      y: maxY * 0.35 + Math.random() * maxY * 0.55,
    };
  }, [containerRef]);

  const freeze = useCallback((ms) => {
    frozenUntilRef.current = performance.now() + ms;
  }, []);

  useEffect(() => {
    let last = performance.now();
    let raf;

    function step(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const isFrozen = now < frozenUntilRef.current;

      if (!isFrozen) {
        if (now >= pausedUntilRef.current) {
          if (!targetRef.current) targetRef.current = pickTarget();
          const target = targetRef.current;
          if (target) {
            const { x, y } = posRef.current;
            const dx = target.x - x;
            const dy = target.y - y;
            const dist = Math.hypot(dx, dy);

            if (dist < 3) {
              targetRef.current = null;
              pausedUntilRef.current = now + minPause + Math.random() * (maxPause - minPause);
            } else {
              const move = speed * dt;
              const nx = x + (dx / dist) * move;
              const ny = y + (dy / dist) * move;
              posRef.current = { x: nx, y: ny };
              if (Math.abs(dx) > 2) setFacing(dx >= 0 ? 1 : -1);
              setPos(posRef.current);
            }
          }
        }
      }

      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pickTarget, speed, minPause, maxPause]);

  return { pos, facing, freeze };
}
