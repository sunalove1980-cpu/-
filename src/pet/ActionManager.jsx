// "행동 추가/관리" 모달. 사용자가 직접 건강기록 행동을 만들고(최대 20개) 지울 수 있다.
import { useState } from 'react';
import { ICON_PALETTE, MAX_ACTIONS } from './actions.js';
import './ActionManager.css';

export default function ActionManager({ actions, onAdd, onRemove, onClose }) {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState(ICON_PALETTE[0]);
  const canAdd = actions.length < MAX_ACTIONS;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!label.trim() || !canAdd) return;
    onAdd(label, icon);
    setLabel('');
  };

  return (
    <div className="action-manager__backdrop" onClick={onClose}>
      <div className="action-manager" onClick={(event) => event.stopPropagation()}>
        <div className="action-manager__header">
          <h2>건강기록 행동 관리</h2>
          <button type="button" className="action-manager__close" onClick={onClose} aria-label="닫기">✕</button>
        </div>
        <p className="action-manager__hint">
          내가 채우고 싶은 건강 습관을 자유롭게 추가하세요 ({actions.length}/{MAX_ACTIONS})
        </p>

        <ul className="action-manager__list">
          {actions.map((action) => (
            <li key={action.id} className="action-manager__item">
              <span className="action-manager__item-icon" aria-hidden="true">{action.icon}</span>
              <span className="action-manager__item-label">{action.label}</span>
              {actions.length > 1 && (
                <button
                  type="button"
                  className="action-manager__remove"
                  onClick={() => onRemove(action.id)}
                  aria-label={`${action.label} 삭제`}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>

        {canAdd ? (
          <form className="action-manager__form" onSubmit={handleSubmit}>
            <div className="action-manager__palette">
              {ICON_PALETTE.map((candidate) => (
                <button
                  type="button"
                  key={candidate}
                  className={`action-manager__icon-btn${icon === candidate ? ' action-manager__icon-btn--selected' : ''}`}
                  onClick={() => setIcon(candidate)}
                >
                  {candidate}
                </button>
              ))}
            </div>
            <div className="action-manager__input-row">
              <input
                type="text"
                className="action-manager__input"
                placeholder="예: 비타민 챙겨 먹기"
                value={label}
                maxLength={12}
                onChange={(event) => setLabel(event.target.value)}
              />
              <button type="submit" className="action-manager__add" disabled={!label.trim()}>
                추가
              </button>
            </div>
          </form>
        ) : (
          <p className="action-manager__limit">최대 {MAX_ACTIONS}개까지 추가할 수 있어요.</p>
        )}
      </div>
    </div>
  );
}
