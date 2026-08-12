// 액션 버튼 위에 얹히는 얇은 진행 상황 패널: 펫 이름/레벨, 건강 에너지 게이지,
// 연속 실천일, 오늘 어떤 건강기록을 했는지 보여주는 체크리스트.
import { ACTIONS } from './actions.js';
import { XP_PER_LEVEL } from './storage.js';
import './ProgressPanel.css';

export default function ProgressPanel({ petName, level, healthEnergy, streakDays, todayRecords }) {
  return (
    <div className="progress-panel">
      <div className="progress-panel__top">
        <span className="progress-panel__name">
          🐾 {petName} <span className="progress-panel__level">Lv.{level}</span>
        </span>
        {streakDays > 0 && (
          <span className="progress-panel__streak">🔥 {streakDays}일 연속</span>
        )}
      </div>

      <div className="progress-panel__energy">
        <span className="progress-panel__energy-label">건강 에너지</span>
        <span className="progress-panel__energy-track">
          <span className="progress-panel__energy-fill" style={{ width: `${healthEnergy}%` }} />
        </span>
        <span className="progress-panel__energy-value">{healthEnergy}/{XP_PER_LEVEL}</span>
      </div>

      <div className="progress-panel__checklist" aria-label="오늘의 건강기록">
        {ACTIONS.map((action) => {
          const done = (todayRecords[action.key] || 0) > 0;
          return (
            <span
              key={action.key}
              className={`progress-panel__check${done ? ' progress-panel__check--done' : ''}`}
              title={action.label}
            >
              {action.icon}
            </span>
          );
        })}
      </div>
    </div>
  );
}
