// 하단 건강기록 버튼 5종. 누르면 펫이 해당 장소로 걸어가 축하 행동을 한다.
import { ACTIONS } from './actions.js';
import './ActionBar.css';

export default function ActionBar({ todayRecords, onLog }) {
  return (
    <div className="action-bar" role="group" aria-label="건강기록">
      {ACTIONS.map((action) => {
        const count = todayRecords[action.key] || 0;
        return (
          <button
            key={action.key}
            type="button"
            className={`action-bar__btn${count > 0 ? ' action-bar__btn--done' : ''}`}
            onClick={() => onLog(action.key)}
          >
            <span className="action-bar__icon" aria-hidden="true">{action.icon}</span>
            <span className="action-bar__label">{action.label}</span>
            {count > 0 && <span className="action-bar__count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
