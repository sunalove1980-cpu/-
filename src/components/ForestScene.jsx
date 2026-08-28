import { forwardRef } from 'react';
import Character from './Character.jsx';
import SpeechBubble from './SpeechBubble.jsx';
import './ForestScene.css';

// 밤에만 보이는 별자리 위치 (퍼센트 좌표) — CSS가 낮/저녁 시간대에는 자동으로 숨긴다.
const STARS = [
  { top: '8%', left: '12%' },
  { top: '14%', left: '32%' },
  { top: '6%', left: '52%' },
  { top: '18%', left: '68%' },
  { top: '10%', left: '84%' },
  { top: '22%', left: '20%' },
  { top: '26%', left: '78%' },
];

// 밤에 풀숲 사이를 떠다니는 반딧불이
const FIREFLIES = [
  { top: '68%', left: '18%' },
  { top: '74%', left: '58%' },
  { top: '64%', left: '75%' },
  { top: '78%', left: '38%' },
];

const ForestScene = forwardRef(function ForestScene(
  {
    charPos,
    facing,
    reacting,
    thinking,
    expression,
    mode,
    timeOfDay = 'day',
    onTouchCharacter,
    bubbleText,
    bubbleVisible,
  },
  ref,
) {
  return (
    <div className={`forest-scene forest-scene--${timeOfDay}`} ref={ref}>
      <div className="forest-scene__celestial" aria-hidden="true" />

      <div className="forest-scene__stars" aria-hidden="true">
        {STARS.map((pos, i) => (
          <span key={i} className="forest-scene__star" style={pos} />
        ))}
      </div>

      <div className="forest-scene__cloud forest-scene__cloud--1" aria-hidden="true" />
      <div className="forest-scene__cloud forest-scene__cloud--2" aria-hidden="true" />

      <div className="forest-scene__hill forest-scene__hill--back" aria-hidden="true" />
      <div className="forest-scene__hill forest-scene__hill--front" aria-hidden="true" />

      <div className="forest-scene__tree forest-scene__tree--1" aria-hidden="true" />
      <div className="forest-scene__tree forest-scene__tree--2" aria-hidden="true" />
      <div className="forest-scene__tree forest-scene__tree--3" aria-hidden="true" />
      <div className="forest-scene__bush forest-scene__bush--1" aria-hidden="true" />
      <div className="forest-scene__bush forest-scene__bush--2" aria-hidden="true" />
      <div className="forest-scene__flowers" aria-hidden="true" />
      <div className="forest-scene__ground" aria-hidden="true" />

      <div className="forest-scene__fireflies" aria-hidden="true">
        {FIREFLIES.map((pos, i) => (
          <span key={i} className="forest-scene__firefly" style={pos} />
        ))}
      </div>

      <SpeechBubble
        x={Math.min(charPos.x - 40, 999)}
        y={charPos.y - 84}
        text={bubbleText}
        visible={bubbleVisible}
        mode={mode}
      />

      <Character
        x={charPos.x}
        y={charPos.y}
        facing={facing}
        reacting={reacting}
        thinking={thinking}
        expression={expression}
        mode={mode}
        onTouch={onTouchCharacter}
      />
    </div>
  );
});

export default ForestScene;
