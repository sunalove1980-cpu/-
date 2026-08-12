// 명상 앰비언트 사운드를 켜고 끄는 작은 원형 버튼.
import './SoundToggle.css';

export default function SoundToggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      className={`sound-toggle${enabled ? ' sound-toggle--on' : ''}`}
      onClick={onToggle}
      aria-label={enabled ? '명상 사운드 끄기' : '명상 사운드 켜기'}
      aria-pressed={enabled}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  );
}
