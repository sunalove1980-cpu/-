import { useEffect, useRef, useState } from 'react';
import CelebrationEffect from './CelebrationEffect.jsx';
import './QuestCard.css';

const EMPTY_ENTRY = { completed: false, value: null, note: '' };

export default function QuestCard({ habit, entry = EMPTY_ENTRY, streak, onToggle, onNumberChange, onNoteChange }) {
  const [celebrating, setCelebrating] = useState(false);
  const [draftText, setDraftText] = useState(entry.note || '');
  const [draftValue, setDraftValue] = useState(entry.value ?? '');
  const wasCompletedRef = useRef(entry.completed);
  const debounceRef = useRef(null);
  const numberDebounceRef = useRef(null);

  useEffect(() => {
    if (!wasCompletedRef.current && entry.completed) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 900);
      return () => clearTimeout(timer);
    }
    wasCompletedRef.current = entry.completed;
    return undefined;
  }, [entry.completed]);

  useEffect(() => {
    setDraftText(entry.note || '');
  }, [entry.note]);

  useEffect(() => {
    setDraftValue(entry.value ?? '');
  }, [entry.value]);

  const commitNote = (text) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onNoteChange(text), 500);
  };

  const commitNumber = (val) => {
    clearTimeout(numberDebounceRef.current);
    numberDebounceRef.current = setTimeout(() => onNumberChange(val), 500);
  };

  return (
    <li className={`quest-card${entry.completed ? ' quest-card--done' : ''}`}>
      {celebrating && <CelebrationEffect rewardLabel="+10 XP · +5 코인" />}

      <div className="quest-card__main">
        <span className="quest-card__icon" aria-hidden="true">
          {habit.icon}
        </span>
        <div className="quest-card__info">
          <p className="quest-card__name">{habit.name}</p>
          {streak?.current > 0 && (
            <p className="quest-card__streak">
              <span aria-hidden="true">🔥</span> {streak.current}일 연속 달성 중
            </p>
          )}
        </div>

        {habit.type === 'check' && (
          <button
            type="button"
            role="checkbox"
            aria-checked={entry.completed}
            aria-label={`${habit.name} ${entry.completed ? '완료 취소' : '완료로 표시'}`}
            className={`quest-card__check${entry.completed ? ' quest-card__check--done' : ''}`}
            onClick={onToggle}
          >
            {entry.completed ? '✓' : ''}
          </button>
        )}
      </div>

      {habit.type === 'number' && (
        <div className="quest-card__field">
          <label className="visually-hidden" htmlFor={`habit-number-${habit.id}`}>
            {habit.name} 수치 입력
          </label>
          <input
            id={`habit-number-${habit.id}`}
            type="number"
            inputMode="decimal"
            placeholder={`${habit.unit || ''} 입력`}
            value={draftValue}
            onChange={(e) => {
              setDraftValue(e.target.value);
              commitNumber(e.target.value);
            }}
            onBlur={(e) => onNumberChange(e.target.value)}
            className="quest-card__number-input"
          />
          {habit.unit && <span className="quest-card__unit">{habit.unit}</span>}
        </div>
      )}

      {habit.type === 'note' && (
        <div className="quest-card__field">
          <label className="visually-hidden" htmlFor={`habit-note-${habit.id}`}>
            {habit.name} 메모 입력
          </label>
          <textarea
            id={`habit-note-${habit.id}`}
            className="quest-card__note-input"
            placeholder="오늘의 메모를 남겨보세요"
            value={draftText}
            maxLength={300}
            rows={2}
            onChange={(e) => {
              setDraftText(e.target.value);
              commitNote(e.target.value);
            }}
            onBlur={(e) => onNoteChange(e.target.value)}
          />
        </div>
      )}
    </li>
  );
}
