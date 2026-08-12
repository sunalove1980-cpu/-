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
import ConfirmDialog from './ConfirmDialog.jsx';
import SoundToggle from './SoundToggle.jsx';
import { usePetSimulation } from './usePetSimulation.js';
import { useAmbientSound } from './useAmbientSound.js';
import { getExpression } from './expression.js';
import { findAction } from './actions.js';
import { FLOOR, clamp, getTimeOfDay } from './constants.js';
import { pickNagMessage } from './nag.js';
import './PetRoomScreen.css';

const NAG_VISIBLE_MS = 6500;
const NAG_COOLDOWN_MS = 8 * 60 * 1000; // 조건이 계속돼도 8분에 한 번 이상은 잔소리하지 않는다

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
    cancelAction,
  } = usePetSimulation();
  const [isPressed, setIsPressed] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const { enabled: soundEnabled, toggle: toggleSound, supported: soundSupported } = useAmbientSound();
  // 이미 기록한 행동을 다시 누르면 곧바로 더 쌓는 대신, 취소할지 먼저 물어본다
  // (실수로 두 번 누르는 사고를 막기 위함).
  const [pendingCancelId, setPendingCancelId] = useState(null);
  const pendingCancelAction = pendingCancelId ? findAction(actions, pendingCancelId) : null;

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

  // 시간대 + 오늘 기록 상황에 맞춰 펫이 잔소리 말풍선을 띄운다 (예: 너무 늦은 밤인데
  // 아직 안 잠, 오후 늦도록 오늘 기록이 하나도 없음). ref로 최신 값을 들고 있다가
  // 1분 간격 타이머에서 읽어, effect를 매번 다시 구독하지 않게 한다.
  const [nagMessage, setNagMessage] = useState(null);
  const nagCooldownRef = useRef(0);
  const latestForNagRef = useRef();
  latestForNagRef.current = { activityType: activity.type, todayRecords };

  useEffect(() => {
    let hideTimer;
    const check = () => {
      const now = Date.now();
      if (now < nagCooldownRef.current) return;
      const { activityType, todayRecords: records } = latestForNagRef.current;
      const hasAnyRecordToday = Object.values(records).some((count) => count > 0);
      const message = pickNagMessage({ hour: new Date().getHours(), activityType, hasAnyRecordToday });
      if (message) {
        setNagMessage(message);
        nagCooldownRef.current = now + NAG_COOLDOWN_MS;
        hideTimer = window.setTimeout(() => setNagMessage(null), NAG_VISIBLE_MS);
      }
    };
    check();
    const interval = setInterval(check, 60_000);
    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, []);

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
        {soundSupported && <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />}

        <div
          className="pet-position-anchor"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: `translate(-50%, -92%) scale(${scale})`,
          }}
        >
          {nagMessage && (
            <div className="nag-bubble">
              {nagMessage}
              <span className="nag-bubble__tail" />
            </div>
          )}
          <button
            type="button"
            className={`pet-anchor${isPressed ? ' pet-anchor--pressed' : ''}`}
            style={{ transform: `scaleX(${facing})` }}
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
          onRequestCancel={setPendingCancelId}
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

      {pendingCancelAction && (
        <ConfirmDialog
          title={`'${pendingCancelAction.label}' 기록을 취소할까요?`}
          description="실수로 두 번 누르신 거라면 취소할 수 있어요. 스탯과 경험치가 원래대로 돌아갑니다."
          confirmLabel="기록 취소하기"
          cancelLabel="그대로 두기"
          onConfirm={() => {
            cancelAction(pendingCancelId);
            setPendingCancelId(null);
          }}
          onDismiss={() => setPendingCancelId(null)}
        />
      )}
    </div>
  );
}
