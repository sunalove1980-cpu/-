import { formatDisplayDate } from '../../state/dateUtils.js';
import './DateDetailCard.css';

export default function DateDetailCard({ dateKey, record, habitsById }) {
  const entries = record ? Object.entries(record.habitEntries) : [];

  return (
    <section className="date-detail" aria-label={`${dateKey} 기록 상세`}>
      <div className="date-detail__header">
        <h2>{formatDisplayDate(dateKey)}</h2>
        {record && <span className="date-detail__score">{record.totalScore}점</span>}
      </div>

      {entries.length === 0 ? (
        <p className="date-detail__empty">이 날의 기록이 없어요.</p>
      ) : (
        <ul className="date-detail__list">
          {entries.map(([habitId, entry]) => {
            const habit = habitsById[habitId];
            if (!habit) return null;
            return (
              <li key={habitId} className={`date-detail__item${entry.completed ? ' date-detail__item--done' : ''}`}>
                <span aria-hidden="true">{habit.icon}</span>
                <span className="date-detail__name">{habit.name}</span>
                <span className="date-detail__value">
                  {habit.type === 'number' && entry.value !== null ? `${entry.value}${habit.unit || ''}` : null}
                  {habit.type === 'note' && entry.note ? entry.note : null}
                  {habit.type === 'check' ? (entry.completed ? '완료' : '미완료') : null}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
