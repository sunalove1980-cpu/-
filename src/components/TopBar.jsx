import { MODE_META, MODES } from '../data/persona.js';
import './TopBar.css';

export default function TopBar({ mode, onChangeMode, geminiConnected }) {
  return (
    <header className="top-bar">
      <div className="top-bar__title">
        <span className="top-bar__logo">🌲</span>
        <div>
          <h1>숲속 상담소</h1>
          <p>
            포리에게 고민을 털어놔봐
            <span className={`top-bar__badge ${geminiConnected ? 'is-on' : ''}`}>
              {geminiConnected ? 'Gemini 연결됨' : '체험 모드'}
            </span>
          </p>
        </div>
      </div>

      <div className="mode-toggle" role="group" aria-label="상담 모드 선택">
        {Object.values(MODES).map((m) => {
          const meta = MODE_META[m];
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              className={`mode-toggle__btn ${active ? 'is-active' : ''}`}
              style={active ? { '--accent': meta.accent } : undefined}
              onClick={() => onChangeMode(m)}
              aria-pressed={active}
            >
              <strong>{meta.label}</strong>
              <span>{meta.subLabel}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
