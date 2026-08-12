// 메인 화면: 숲속 오두막 장면 + 그 안에서 스스로 움직이는 펫 + 하단 건강기록 버튼.
// 화면을 드래그하면 펫이 손가락을 따라온다. 로그인 / Supabase 없이, 이 브라우저
// (localStorage)에만 이름·상태·경험치·오늘 기록·커스텀 행동이 저장된다.
import { useEffect, useRef, useState } from 'react';
import Room from './Room.jsx';
import Pet from './Pet.jsx';
import StatHud from './StatHud.jsx';
import ProgressPanel from './ProgressPanel.jsx';
import ActionBar from './ActionBar.jsx';
import ActionManager from './ActionManager.jsx';
import { usePetSimulation } from './usePetSimulation.js';
import { getExpression } from './expression.js';
import { FLOOR, clamp, getTimeOfDay } from './constants.js';
import './PetRoomScreen.css';

const DRAG_THRESHOLD_PX = 8;

export default function PetRoomScreen() {
  const {
    position,
    facing,
    scale,
    activity,
    stats,
    isBlinking,
    onTapPet,
    startFollow,
    updateFollow,
    endFollow,
    petName,
    level,
    healthEnergy,
    streakDays,
    todayRecords,
    actions,
    addAction,
    removeAction,
    logAction,
  } = usePetSimulation();
  const [isPressed, setIsPressed] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  // 실제 시간에 맞춰 하늘/초원 색을 바꾼다 (아침/낮/노을/저녁/밤). 1분마다 확인하면 충분하다.
  const [timeOfDay, setTimeOfDay] = useState(() => getTimeOfDay());
  useEffect(() => {
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const stageRef = useRef(null);
  const pointerActiveRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const activePointerIdRef = useRef(null);

  const expr = getExpression(activity, isBlinking);

  const pointToPercent = (clientX, clientY) => {
    const rect = stageRef.current.getBoundingClientRect();
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100, FLOOR.xMin, FLOOR.xMax),
      y: clamp(((clientY - rect.top) / rect.height) * 100, FLOOR.yMin, FLOOR.yMax),
    };
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // 여기서 바로 setPointerCapture를 걸면 순수 탭(클릭)까지 스테이지가 가로채 버려
    // 펫 버튼의 onClick이 안 터진다. 그래서 실제로 드래그라고 판단될 때만 캡처한다.
    pointerActiveRef.current = true;
    draggingRef.current = false;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    activePointerIdRef.current = event.pointerId;
  };

  const handlePointerMove = (event) => {
    if (!pointerActiveRef.current) return;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    if (!draggingRef.current) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      draggingRef.current = true;
      stageRef.current?.setPointerCapture?.(activePointerIdRef.current);
      startFollow(pointToPercent(event.clientX, event.clientY));
    } else {
      updateFollow(pointToPercent(event.clientX, event.clientY));
    }
  };

  const endPointerSession = () => {
    if (!pointerActiveRef.current) return;
    pointerActiveRef.current = false;
    if (draggingRef.current) endFollow();
  };

  const handleTap = () => {
    // 드래그(화면 긁기)로 이어진 릴리즈라면 별도의 탭 반응을 또 재생하지 않는다.
    if (draggingRef.current) return;
    onTapPet();
    setIsPressed(true);
    window.setTimeout(() => setIsPressed(false), 160);
  };

  return (
    <div className="pet-room-screen">
      <div
        className="pet-room-screen__stage"
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerSession}
        onPointerCancel={endPointerSession}
      >
        <Room timeOfDay={timeOfDay} />
        <StatHud stats={stats} />

        <button
          type="button"
          className={`pet-anchor${isPressed ? ' pet-anchor--pressed' : ''}`}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: `translate(-50%, -92%) scale(${scale}) scaleX(${facing})`,
          }}
          onClick={handleTap}
          aria-label="펫 쓰다듬기"
        >
          <Pet
            pose={expr.pose}
            facing={facing}
            eyes={expr.eyes}
            pupilShift={expr.pupilShift}
            mouth={expr.mouth}
            earDroop={expr.earDroop}
            tailWag={expr.tailWag}
            showZzz={expr.showZzz}
            celebration={expr.celebration}
            reward={expr.reward}
            gloom={expr.gloom}
            wearingPajama={expr.wearingPajama}
            headTilt={expr.headTilt}
          />
        </button>
      </div>

      <div className="pet-room-screen__footer">
        <ProgressPanel
          petName={petName}
          level={level}
          healthEnergy={healthEnergy}
          streakDays={streakDays}
          todayRecords={todayRecords}
          actions={actions}
        />
        <ActionBar
          actions={actions}
          todayRecords={todayRecords}
          onLog={logAction}
          onOpenManager={() => setManagerOpen(true)}
        />
      </div>

      {managerOpen && (
        <ActionManager
          actions={actions}
          onAdd={addAction}
          onRemove={removeAction}
          onClose={() => setManagerOpen(false)}
        />
      )}
    </div>
  );
}
