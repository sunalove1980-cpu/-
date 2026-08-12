// 메인 화면: 방 전체 + 그 안에서 스스로 움직이는 펫.
// 건강기록 / 로그인 / 데이터베이스 없이, 지금 이 순간의 상태만으로 동작하는 1단계 화면이다.
import { useState } from 'react';
import Room from './Room.jsx';
import Pet from './Pet.jsx';
import StatHud from './StatHud.jsx';
import { usePetSimulation } from './usePetSimulation.js';
import { getExpression } from './expression.js';
import './PetRoomScreen.css';

export default function PetRoomScreen() {
  const { position, facing, scale, activity, stats, isBlinking, onTapPet } = usePetSimulation();
  const [isPressed, setIsPressed] = useState(false);

  const expr = getExpression(activity, isBlinking);

  const handleTap = () => {
    onTapPet();
    setIsPressed(true);
    window.setTimeout(() => setIsPressed(false), 160);
  };

  return (
    <div className="pet-room-screen">
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
          showHearts={expr.showHearts}
          headTilt={expr.headTilt}
        />
      </button>
    </div>
  );
}
