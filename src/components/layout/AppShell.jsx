import { useApp } from '../../state/AppContext.jsx';
import './AppShell.css';

export default function AppShell({ nav, children }) {
  const { profile } = useApp();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__logo" aria-hidden="true">
            🛡️
          </span>
          <div>
            <p className="app-header__title">건강 퀘스트</p>
            <p className="app-header__subtitle">매일의 습관이 성장이 됩니다</p>
          </div>
        </div>
        <div className="app-header__stats" aria-label="현재 레벨과 보유 코인">
          <span className="app-header__pill app-header__pill--level">Lv.{profile.level}</span>
          <span className="app-header__pill app-header__pill--coin">
            <span aria-hidden="true">🪙</span> {profile.coins}
          </span>
        </div>
      </header>
      {/* nav를 헤더 바로 아래(문서 흐름상)에 두면, 모바일에서는 position:fixed로
          화면 하단에 고정되고 PC에서는 헤더 아래 가로 메뉴로 자연스럽게 보인다. */}
      {nav}
      <main className="app-main">{children}</main>
    </div>
  );
}
