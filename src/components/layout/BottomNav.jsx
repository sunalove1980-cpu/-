import './BottomNav.css';

const TABS = [
  { key: 'list', label: '기록', icon: '🗂️' },
  { key: 'settings', label: '설정', icon: '⚙️' },
];

export default function BottomNav({ activeTab, onChangeTab }) {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={activeTab === tab.key ? 'is-active' : ''}
          onClick={() => onChangeTab(tab.key)}
          aria-current={activeTab === tab.key ? 'page' : undefined}
        >
          <span aria-hidden="true">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
