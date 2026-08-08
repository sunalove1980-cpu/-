import './AppShell.css';

export default function AppShell({ nav, children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__logo" aria-hidden="true">
            🎬📖
          </span>
          <div>
            <p className="app-header__title">감상노트</p>
            <p className="app-header__subtitle">본 영화, 읽은 책을 오래오래 기억해요</p>
          </div>
        </div>
      </header>
      {nav}
      <main className="app-main">{children}</main>
    </div>
  );
}
