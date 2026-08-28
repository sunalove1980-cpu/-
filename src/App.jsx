import { useCallback, useEffect, useRef, useState } from 'react';
import TopBar from './components/TopBar.jsx';
import ForestScene from './components/ForestScene.jsx';
import ChatDock from './components/ChatDock.jsx';
import ChatLog from './components/ChatLog.jsx';
import { useWander } from './hooks/useWander.js';
import { useForestAmbience } from './hooks/useForestAmbience.js';
import { askForest, isGeminiConfigured } from './services/geminiService.js';
import { MODES, pickReaction } from './data/persona.js';
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

let uid = 0;
const nextId = () => `m${Date.now()}-${uid++}`;

export default function App() {
  const [mode, setMode] = useState(loadStoredMode);
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [expression, setExpression] = useState('idle');
  const [logOpen, setLogOpen] = useState(false);
  const [bubble, setBubble] = useState({ text: '', visible: false });

  const sceneRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const reactTimerRef = useRef(null);
  const expressionTimerRef = useRef(null);

  const { pos, facing, freeze } = useWander(sceneRef, { speed: 50 });
  const { enabled: soundOn, toggle: toggleSound } = useForestAmbience();

  useEffect(() => {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // 저장 실패해도 앱 동작에는 지장 없음 (예: 프라이빗 모드)
    }
  }, [mode]);

  const showBubble = useCallback((text, ms = 4200) => {
    clearTimeout(bubbleTimerRef.current);
    setBubble({ text, visible: true });
    bubbleTimerRef.current = setTimeout(() => {
      setBubble((prev) => ({ ...prev, visible: false }));
    }, ms);
  }, []);

  // 표정을 잠깐 바꿨다가(reset 없으면 계속 유지) 일정 시간 뒤 idle로 되돌린다.
  const flashExpression = useCallback((next, ms) => {
    clearTimeout(expressionTimerRef.current);
    setExpression(next);
    if (ms) {
      expressionTimerRef.current = setTimeout(() => setExpression('idle'), ms);
    }
  }, []);

  const handleTouchCharacter = useCallback(() => {
    if (thinking) return;
    clearTimeout(reactTimerRef.current);
    freeze(1100);
    setReacting(true);
    flashExpression('surprised', 1400);
    showBubble(pickReaction(mode), 2400);
    reactTimerRef.current = setTimeout(() => setReacting(false), 650);
  }, [flashExpression, freeze, mode, showBubble, thinking]);

  useEffect(() => () => {
    clearTimeout(bubbleTimerRef.current);
    clearTimeout(reactTimerRef.current);
    clearTimeout(expressionTimerRef.current);
  }, []);

  const handleSend = useCallback(
    async (text) => {
      const userMsg = { id: nextId(), role: 'user', text };
      setMessages((prev) => [...prev, userMsg]);
      setThinking(true);
      flashExpression('thinking');
      freeze(60000); // 답변 오는 동안은 제자리에서 생각하는 모션만

      const history = messages.map((m) => ({ role: m.role, text: m.text }));

      try {
        const { text: replyText } = await askForest({ history, userText: text, mode });
        const assistantMsg = { id: nextId(), role: 'assistant', text: replyText };
        setMessages((prev) => [...prev, assistantMsg]);
        const bubbleMs = Math.min(3600 + replyText.length * 60, 8000);
        showBubble(replyText, bubbleMs);
        flashExpression(HAPPY_EXPRESSION[mode] ?? 'happy', bubbleMs);
      } finally {
        setThinking(false);
        freeze(0);
      }
    },
    [flashExpression, freeze, messages, mode, showBubble],
  );

  return (
    <div className="app">
      <TopBar
        mode={mode}
        onChangeMode={setMode}
        geminiConnected={isGeminiConfigured}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />

      <ForestScene
        ref={sceneRef}
        charPos={pos}
        facing={facing}
        reacting={reacting}
        thinking={thinking}
        expression={expression}
        mode={mode}
        onTouchCharacter={handleTouchCharacter}
        bubbleText={bubble.text}
        bubbleVisible={bubble.visible}
      />

      <ChatDock
        mode={mode}
        thinking={thinking}
        onSend={handleSend}
        onOpenLog={() => setLogOpen(true)}
        messageCount={messages.length}
      />

      <ChatLog open={logOpen} messages={messages} onClose={() => setLogOpen(false)} />
    </div>
  );
}
