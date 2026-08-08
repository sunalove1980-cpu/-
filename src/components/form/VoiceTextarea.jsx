import { useSpeechToText } from '../../hooks/useSpeechToText.js';
import './VoiceTextarea.css';

// 타이핑과 음성 입력을 함께 지원하는 텍스트 영역.
// 마이크 버튼을 누르면 말하는 내용이 실시간으로 텍스트에 이어 붙는다.
export default function VoiceTextarea({ id, label, value, onChange, placeholder, rows = 4, hint }) {
  const { isSupported, isListening, interimText, error, toggle } = useSpeechToText({
    onFinalResult: (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      onChange((prev) => {
        const base = prev?.trim() ? `${prev.trim()} ` : '';
        return `${base}${trimmed}`;
      });
    },
  });

  return (
    <div className="voice-textarea">
      <div className="voice-textarea__head">
        <label htmlFor={id} className="voice-textarea__label">
          {label}
        </label>
        {isSupported && (
          <button
            type="button"
            className={`voice-textarea__mic${isListening ? ' voice-textarea__mic--active' : ''}`}
            onClick={toggle}
            aria-pressed={isListening}
            aria-label={isListening ? '음성 입력 중지' : '음성으로 입력하기'}
          >
            <span aria-hidden="true">{isListening ? '⏹' : '🎤'}</span>
            {isListening ? '듣는 중…' : '음성 입력'}
          </button>
        )}
      </div>
      {hint && <p className="voice-textarea__hint">{hint}</p>}
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {isListening && interimText && <p className="voice-textarea__interim">🎙️ {interimText}</p>}
      {!isSupported && <p className="voice-textarea__notice">이 브라우저는 음성 입력을 지원하지 않아요. 직접 입력해 주세요.</p>}
      {error && <p className="voice-textarea__error">{error}</p>}
    </div>
  );
}
