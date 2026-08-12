// 하단 건강기록 버튼들. 기본 5종 + 사용자가 추가한 커스텀 행동(최대 20개)을
// 가로 스크롤 칩 목록으로 보여준다. 맨 끝 "+" 칩으로 행동을 추가/삭제하는 관리창을 연다.
import { MAX_ACTIONS } from './actions.js';
import './ActionBar.css';

export default function ActionBar({ actions, todayRecords, onLog, onRequestCancel, onOpenManager }) {
  return (
    <div className="action-bar" role="group" aria-label="건강기록">
      <div className="action-bar__scroll">
        {actions.map((action) => {
          const count = todayRecords[action.id] || 0;
          const done = count > 0;
          return (
            <button
              key={action.id}
              type="button"
              className={`action-bar__btn${done ? ' action-bar__btn--done' : ''}`}
              // 이미 기록한 행동을 또 누르면 바로 더 쌓지 않고, 취소할지 먼저 물어본다
              // (실수로 두 번 눌러 기록/경험치가 중복 쌓이는 걸 막기 위함).
              onClick={() => (done ? onRequestCancel(action.id) : onLog(action.id))}
            >
              <span className="action-bar__icon" aria-hidden="true">{action.icon}</span>
              <span className="action-bar__label">{action.label}</span>
              {done && <span className="action-bar__count">{count > 1 ? count : '✓'}</span>}
            </button>
          );
        })}
        <button
          type="button"
          className="action-bar__btn action-bar__btn--add"
          onClick={onOpenManager}
          aria-label="행동 추가/관리"
        >
          <span className="action-bar__icon" aria-hidden="true">＋</span>
          <span className="action-bar__label">{actions.length}/{MAX_ACTIONS}</span>
        </button>
      </div>
    </div>
  );
}
