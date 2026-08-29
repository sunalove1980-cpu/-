import { useCallback, useEffect, useRef, useState } from 'react';
import TopBar from './components/TopBar.jsx';
import ForestScene from './components/ForestScene.jsx';
import ActionBar from './components/ActionBar.jsx';
import BottomSheet from './components/BottomSheet.jsx';
import LunchRoulette from './components/LunchRoulette.jsx';
import IcebreakerDraw from './components/IcebreakerDraw.jsx';
import { useWander } from './hooks/useWander.js';
import { useForestAmbience } from './hooks/useForestAmbience.js';
import { useTimeOfDay } from './hooks/useTimeOfDay.js';
import { MODES, pickReaction, pickLine } from './data/persona.js';
import { LUNCH_LINES } from './data/lunch.js';
import { ICEBREAKER_LINES } from './data/icebreakers.js';
import './App.css';

const HAPPY_EXPRESSION = { F: 'happy', T: 'smug' };

const MODE_STORAGE_KEY = 'forest-counselor:mode';

function loadStoredMode() {
  try {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    return saved === MODES.T ? MODES.T : MODES.F;
  } catch {
    return MODES.F;
  }
}

export default function App() {
  const [mode, setMode] = useState(loadStoredMode);
  const [reacting, setReacting] = useState(false);
  const [expression, setExpression] = useState('idle');
  const [sheet, setSheet] = useState(null); // 'lunch' | 'icebreaker' | null
  const [bubble, setBubble] = useState({ text: '', visible: false });

  const sceneRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const reactTimerRef = useRef(null);
  const expressionTimerRef = useRef(null);

  const { pos, facing, freeze } = useWander(sceneRef, { speed: 50 });
  const { enabled: soundOn, toggle: toggleSound } = useForestAmbience();
  const timeOfDay = useTimeOfDay();

  useEffect(() => {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // 저장 실패해도 앱 동작에는 지장 없음 (예: 프라이빗 모드)
    }
  }, [mode]);

  const showBubble = useCallback((text, ms = 3200) => {
    clearTimeout(bubbleTimerRef.current);
    setBubble({ text, visible: true });
    bubbleTimerRef.current = setTimeout(() => {
      setBubble((prev) => ({ ...prev, visible: false }));
    }, ms);
  }, []);

  // 표정을 잠깐 바꿨다가 일정 시간 뒤 idle로 되돌린다.
  const flashExpression = useCallback((next, ms) => {
    clearTimeout(expressionTimerRef.current);
    setExpression(next);
    if (ms) {
      expressionTimerRef.current = setTimeout(() => setExpression('idle'), ms);
    }
  }, []);

  const handleTouchCharacter = useCallback(() => {
    clearTimeout(reactTimerRef.current);
    freeze(1100);
    setReacting(true);
    flashExpression('surprised', 1400);
    showBubble(pickReaction(mode), 2400);
    reactTimerRef.current = setTimeout(() => setReacting(false), 650);
  }, [flashExpression, freeze, mode, showBubble]);

  useEffect(() => () => {
    clearTimeout(bubbleTimerRef.current);
    clearTimeout(reactTimerRef.current);
    clearTimeout(expressionTimerRef.current);
  }, []);

  const openLunch = useCallback(() => {
    setSheet('lunch');
    freeze(30000);
    showBubble(pickLine(LUNCH_LINES.intro, mode), 2600);
  }, [freeze, mode, showBubble]);

  const openIcebreaker = useCallback(() => {
    setSheet('icebreaker');
    freeze(30000);
    showBubble(pickLine(ICEBREAKER_LINES.intro, mode), 2600);
  }, [freeze, mode, showBubble]);

  const closeSheet = useCallback(() => {
    setSheet(null);
    freeze(0);
  }, [freeze]);

  const handlePickStart = useCallback(() => {
    flashExpression('thinking');
  }, [flashExpression]);

  const handleLunchResult = useCallback(() => {
    flashExpression(HAPPY_EXPRESSION[mode] ?? 'happy', 2600);
    showBubble(pickLine(LUNCH_LINES.result, mode), 2600);
  }, [flashExpression, mode, showBubble]);

  const handleIcebreakerResult = useCallback(() => {
    flashExpression(HAPPY_EXPRESSION[mode] ?? 'happy', 2600);
    showBubble(pickLine(ICEBREAKER_LINES.result, mode), 2600);
  }, [flashExpression, mode, showBubble]);

  return (
    <div className="app">
      <TopBar mode={mode} onChangeMode={setMode} soundOn={soundOn} onToggleSound={toggleSound} />

      <ForestScene
        ref={sceneRef}
        charPos={pos}
        facing={facing}
        reacting={reacting}
        thinking={expression === 'thinking'}
        expression={expression}
        mode={mode}
        timeOfDay={timeOfDay}
        onTouchCharacter={handleTouchCharacter}
        bubbleText={bubble.text}
        bubbleVisible={bubble.visible}
      />

      <ActionBar onOpenLunch={openLunch} onOpenIcebreaker={openIcebreaker} />

      <BottomSheet open={sheet === 'lunch'} title="🍱 점심 룰렛" onClose={closeSheet}>
        <LunchRoulette onStart={handlePickStart} onResult={handleLunchResult} />
      </BottomSheet>

      <BottomSheet open={sheet === 'icebreaker'} title="💬 아이스브레이커" onClose={closeSheet}>
        <IcebreakerDraw onStart={handlePickStart} onResult={handleIcebreakerResult} />
      </BottomSheet>
    </div>
  );
}
