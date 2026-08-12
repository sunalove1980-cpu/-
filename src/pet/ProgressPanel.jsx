// 액션 버튼 위에 얹히는 얇은 진행 상황 패널: 펫 이름/레벨, 건강 에너지 게이지,
// 연속 실천일, 오늘 실천한 행동 목록을 보여준다.
import { XP_PER_LEVEL } from './storage.js';
import './ProgressPanel.css';

export default function ProgressPanel({ petName, level, healthEnergy, streakDays, todayRecords, actions }) {
  const doneToday = actions.filter((action) => (todayRecords[action.id] || 0) > 0);

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

      <div className="progress-panel__checklist" aria-label="오늘 실천한 행동">
        {doneToday.length === 0 ? (
          <span className="progress-panel__empty">오늘 아직 기록이 없어요. 아래 버튼을 눌러보세요!</span>
        ) : (
          doneToday.map((action) => (
            <span key={action.id} className="progress-panel__check" title={action.label}>
              {action.icon}
              {todayRecords[action.id] > 1 && (
                <span className="progress-panel__check-count">{todayRecords[action.id]}</span>
              )}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
