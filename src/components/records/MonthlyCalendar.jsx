import { formatMonthLabel, calendarCells, todayKey } from '../../state/dateUtils.js';
import './MonthlyCalendar.css';

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

export default function MonthlyCalendar({ monthKey, onShiftMonth, selectedDate, onSelectDate, rateByDate }) {
  const cells = calendarCells(monthKey);
  const today = todayKey();

  return (
    <section className="monthly-calendar" aria-label="월간 달성률 달력">
      <div className="monthly-calendar__header">
        <button type="button" onClick={() => onShiftMonth(-1)} aria-label="이전 달">
          ‹
        </button>
        <h2>{formatMonthLabel(monthKey)}</h2>
        <button type="button" onClick={() => onShiftMonth(1)} aria-label="다음 달">
          ›
        </button>
      </div>
      <div className="monthly-calendar__weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="monthly-calendar__grid">
        {cells.map((dateKey, i) => {
          if (!dateKey) return <span key={`blank-${i}`} className="monthly-calendar__cell monthly-calendar__cell--blank" />;
          const rate = rateByDate[dateKey];
          const isSelected = dateKey === selectedDate;
          const isToday = dateKey === today;
          const isFuture = dateKey > today;
          const day = Number(dateKey.slice(-2));
          const intensity = rate === undefined || rate === null ? 0 : 0.15 + (rate / 100) * 0.65;
          return (
            <button
              key={dateKey}
              type="button"
              className={`monthly-calendar__cell${isSelected ? ' monthly-calendar__cell--selected' : ''}${isToday ? ' monthly-calendar__cell--today' : ''}`}
              style={rate ? { backgroundColor: `rgba(124, 58, 237, ${intensity})` } : undefined}
              onClick={() => onSelectDate(dateKey)}
              disabled={isFuture}
              aria-current={isToday ? 'date' : undefined}
              aria-label={`${dateKey}${rate !== undefined && rate !== null ? `, 달성률 ${rate}%` : ', 기록 없음'}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}
