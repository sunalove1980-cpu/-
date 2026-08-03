import './StreakList.css';

export default function StreakList({ habits, streaksByHabit }) {
  if (habits.length === 0) return null;

  return (
    <section className="streak-list" aria-labelledby="streak-heading">
      <h2 id="streak-heading" className="section-title">
        습관별 연속 달성일
      </h2>
      <ul className="streak-list__items">
        {habits.map((habit) => {
          const streak = streaksByHabit[habit.id] || { current: 0, longest: 0 };
          return (
            <li key={habit.id} className="streak-item">
              <span className="streak-item__icon" aria-hidden="true">
                {habit.icon}
              </span>
              <span className="streak-item__name">{habit.name}</span>
              <span className="streak-item__value">
                <strong>{streak.current}</strong>일 연속
                <span className="streak-item__longest">최장 {streak.longest}일</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
