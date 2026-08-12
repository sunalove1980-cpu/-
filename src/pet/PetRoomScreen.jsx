// 메인 화면: 방 전체 + 그 안에서 스스로 움직이는 펫 + 하단 건강기록 버튼.
// 로그인 / Supabase 없이, 이 브라우저(localStorage)에만 이름·상태·경험치·오늘 기록이 저장된다.
import { useState } from 'react';
import Room from './Room.jsx';
import Pet from './Pet.jsx';
import StatHud from './StatHud.jsx';
import ProgressPanel from './ProgressPanel.jsx';
import ActionBar from './ActionBar.jsx';
import { usePetSimulation } from './usePetSimulation.js';
import { getExpression } from './expression.js';
import './PetRoomScreen.css';

export default function PetRoomScreen() {
  const {
    position,
    facing,
    scale,
    activity,
    stats,
    isBlinking,
    onTapPet,
    petName,
    level,
    healthEnergy,
    streakDays,
    todayRecords,
    logAction,
  } = usePetSimulation();
  const [isPressed, setIsPressed] = useState(false);

  const expr = getExpression(activity, isBlinking);

  const handleTap = () => {
    onTapPet();
    setIsPressed(true);
    window.setTimeout(() => setIsPressed(false), 160);
  };

  return (
    <div className="pet-room-screen">
      <div className="pet-room-screen__stage">
        <Room />
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
            eyes={expr.eyes}
            pupilShift={expr.pupilShift}
            mouth={expr.mouth}
            earDroop={expr.earDroop}
            tailWag={expr.tailWag}
            showZzz={expr.showZzz}
            celebration={expr.celebration}
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
        />
        <ActionBar todayRecords={todayRecords} onLog={logAction} />
      </div>
    </div>
  );
}
