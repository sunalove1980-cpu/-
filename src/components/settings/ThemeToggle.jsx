import { useApp } from '../../state/AppContext.jsx';
import './ThemeToggle.css';

const OPTIONS = [
  { value: 'light', label: '라이트', icon: '☀️' },
  { value: 'dark', label: '다크', icon: '🌙' },
  { value: 'system', label: '시스템', icon: '🖥️' },
];

export default function ThemeToggle() {
  const { settings, actions } = useApp();

  return (
    <section aria-labelledby="theme-heading" className="theme-toggle">
      <h2 id="theme-heading" className="section-title">
        화면 테마
      </h2>
      <div className="theme-toggle__options" role="radiogroup" aria-label="테마 선택">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={settings.theme === opt.value}
            className={`theme-toggle__btn${settings.theme === opt.value ? ' theme-toggle__btn--active' : ''}`}
            onClick={() => actions.setTheme(opt.value)}
          >
            <span aria-hidden="true">{opt.icon}</span> {opt.label}
          </button>
        ))}
      </div>
    </section>
  );
}
