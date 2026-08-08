import { useApp } from '../../state/AppContext.jsx';
import './ThemeToggle.css';

const OPTIONS = [
  { key: 'system', label: '기기 설정' },
  { key: 'light', label: '라이트' },
  { key: 'dark', label: '다크' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useApp();

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="화면 테마">
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          className={theme === option.key ? 'is-active' : ''}
          onClick={() => setTheme(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
