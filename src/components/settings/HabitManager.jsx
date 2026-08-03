import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { MAX_HABIT_NAME_LENGTH } from '../../db/schema.js';
import './HabitManager.css';

const ICON_CHOICES = ['💧', '🚶', '🤸', '🌙', '😴', '💊', '⚖️', '🚫', '🥗', '📚', '🧘', '☀️', '✨'];
const TYPE_OPTIONS = [
  { value: 'check', label: '체크형 (완료 여부)' },
  { value: 'number', label: '숫자형 (예: 체중)' },
  { value: 'note', label: '메모형 (텍스트 기록)' },
];

function HabitForm({ initial, onSubmit, onCancel, lockType }) {
  const [name, setName] = useState(initial?.name || '');
  const [icon, setIcon] = useState(initial?.icon || '✨');
  const [type, setType] = useState(initial?.type || 'check');
  const [unit, setUnit] = useState(initial?.unit || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), icon, type, unit: type === 'number' ? unit.trim() : '' });
  };

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <label className="habit-form__field">
        <span>습관 이름</span>
        <input
          type="text"
          value={name}
          maxLength={MAX_HABIT_NAME_LENGTH}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 명상 10분"
          required
          aria-label="습관 이름"
        />
      </label>

      <div className="habit-form__field">
        <span>아이콘</span>
        <div className="habit-form__icons" role="group" aria-label="아이콘 선택">
          {ICON_CHOICES.map((choice) => (
            <button
              type="button"
              key={choice}
              className={`habit-form__icon-btn${icon === choice ? ' habit-form__icon-btn--active' : ''}`}
              onClick={() => setIcon(choice)}
              aria-pressed={icon === choice}
              aria-label={`아이콘 ${choice} 선택`}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>

      {!lockType && (
        <label className="habit-form__field">
          <span>유형</span>
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="습관 유형 선택">
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {type === 'number' && (
        <label className="habit-form__field">
          <span>단위</span>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="예: kg"
            aria-label="숫자 단위"
          />
        </label>
      )}

      <div className="habit-form__actions">
        <button type="submit" className="habit-form__submit">
          저장
        </button>
        <button type="button" className="habit-form__cancel" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
}

export default function HabitManager() {
  const { activeHabits, actions } = useApp();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleAdd = async (data) => {
    await actions.addHabit(data);
    setAdding(false);
  };

  const handleEdit = async (habitId, data) => {
    await actions.updateHabit(habitId, { name: data.name, icon: data.icon, unit: data.unit });
    setEditingId(null);
  };

  const handleDelete = (habit) => {
    const confirmed = window.confirm(`"${habit.name}" 습관을 삭제할까요? 지난 기록은 계속 보관됩니다.`);
    if (confirmed) actions.deleteHabit(habit.id);
  };

  return (
    <section aria-labelledby="habit-manager-heading" className="habit-manager">
      <h2 id="habit-manager-heading" className="section-title">
        나의 건강 습관 관리
      </h2>

      <ul className="habit-manager__list">
        {[...activeHabits].sort((a, b) => a.order - b.order).map((habit) =>
          editingId === habit.id ? (
            <li key={habit.id} className="habit-manager__edit-row">
              <HabitForm
                initial={habit}
                lockType
                onSubmit={(data) => handleEdit(habit.id, data)}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <li key={habit.id} className="habit-manager__row">
              <span aria-hidden="true">{habit.icon}</span>
              <span className="habit-manager__name">{habit.name}</span>
              <button type="button" onClick={() => setEditingId(habit.id)} aria-label={`${habit.name} 수정`}>
                수정
              </button>
              <button
                type="button"
                className="habit-manager__delete"
                onClick={() => handleDelete(habit)}
                aria-label={`${habit.name} 삭제`}
              >
                삭제
              </button>
            </li>
          ),
        )}
      </ul>

      {adding ? (
        <HabitForm onSubmit={handleAdd} onCancel={() => setAdding(false)} />
      ) : (
        <button type="button" className="habit-manager__add" onClick={() => setAdding(true)}>
          + 새 습관 추가
        </button>
      )}
    </section>
  );
}
