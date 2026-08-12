// 화면 상단에 떠 있는 작은 상태 표시줄. 건강기록 화면이 아니라, 지금 이 순간
// 펫의 상태를 한눈에 보여주는 최소한의 UI다 (다음 행동을 이해하는 데 도움을 준다).
import './StatHud.css';

const ROWS = [
  { key: 'energy', label: '에너지', icon: '⚡', color: '#ffb648' },
  { key: 'hydration', label: '수분', icon: '💧', color: '#5ec3f0' },
  { key: 'mood', label: '기분', icon: '💛', color: '#ff8fa3' },
];

export default function StatHud({ stats }) {
  return (
    <div className="stat-hud">
      {ROWS.map((row) => (
        <div className="stat-hud__item" key={row.key}>
          <span className="stat-hud__icon" aria-hidden="true">{row.icon}</span>
          <span className="stat-hud__track">
            <span
              className="stat-hud__fill"
              style={{ width: `${Math.round(stats[row.key])}%`, background: row.color }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}
