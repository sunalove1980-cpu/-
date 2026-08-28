import { forwardRef } from 'react';
import Character from './Character.jsx';
import SpeechBubble from './SpeechBubble.jsx';
import './ForestScene.css';

const ForestScene = forwardRef(function ForestScene(
  {
    charPos,
    facing,
    reacting,
    thinking,
    expression,
    mode,
    onTouchCharacter,
    bubbleText,
    bubbleVisible,
  },
  ref,
) {
  return (
    <div className="forest-scene" ref={ref}>
      <div className="forest-scene__tree forest-scene__tree--1" aria-hidden="true" />
      <div className="forest-scene__tree forest-scene__tree--2" aria-hidden="true" />
      <div className="forest-scene__tree forest-scene__tree--3" aria-hidden="true" />
      <div className="forest-scene__bush forest-scene__bush--1" aria-hidden="true" />
      <div className="forest-scene__bush forest-scene__bush--2" aria-hidden="true" />
      <div className="forest-scene__ground" aria-hidden="true" />

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
