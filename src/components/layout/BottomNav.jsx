import './BottomNav.css';

export const NAV_ITEMS = [
  { key: 'today', label: '오늘의 퀘스트', shortLabel: '퀘스트', icon: '🗡️' },
  { key: 'growth', label: '성장', shortLabel: '성장', icon: '🌟' },
  { key: 'records', label: '기록', shortLabel: '기록', icon: '📖' },
  { key: 'boss', label: '주간 도전', shortLabel: '주간도전', icon: '🐉' },
  { key: 'settings', label: '설정', shortLabel: '설정', icon: '⚙️' },
];

export default function BottomNav({ activeTab, onChangeTab }) {
  return (
    <nav className="bottom-nav" aria-label="주요 화면 이동">
      <ul className="bottom-nav__list">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === activeTab;
          return (
            <li key={item.key} className="bottom-nav__item">
              <button
                type="button"
                className={`bottom-nav__button${isActive ? ' bottom-nav__button--active' : ''}`}
                onClick={() => onChangeTab(item.key)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <span className="bottom-nav__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="bottom-nav__label">{item.shortLabel}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
