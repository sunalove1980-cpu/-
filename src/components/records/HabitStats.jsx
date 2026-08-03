import './HabitStats.css';

// 가장 꾸준히 지킨 습관과 최근 실천율이 낮은 습관을 보여준다.
// 비난하는 표현 대신 동기부여가 되는 중립적인 문구를 사용한다.
export default function HabitStats({ stats }) {
  if (stats.length === 0) return null;

  const best = [...stats].sort((a, b) => b.rate - a.rate)[0];
  const needsAttention = [...stats].sort((a, b) => a.rate - b.rate)[0];

  return (
    <section className="habit-stats" aria-label="습관 실천 경향">
      <h2 className="section-title">최근 30일 습관 경향</h2>
      <div className="habit-stats__cards">
        {best && best.rate > 0 && (
          <div className="habit-stats__card habit-stats__card--good">
            <span className="habit-stats__label">가장 꾸준히 지킨 습관</span>
            <span className="habit-stats__icon" aria-hidden="true">
              {best.habit.icon}
            </span>
            <span className="habit-stats__name">{best.habit.name}</span>
            <span className="habit-stats__rate">달성률 {best.rate}%</span>
          </div>
        )}
        {needsAttention && needsAttention.habit.id !== best?.habit.id && (
          <div className="habit-stats__card habit-stats__card--gentle">
            <span className="habit-stats__label">요즘 조금 더 관심이 필요해요</span>
            <span className="habit-stats__icon" aria-hidden="true">
              {needsAttention.habit.icon}
            </span>
            <span className="habit-stats__name">{needsAttention.habit.name}</span>
            <span className="habit-stats__rate">달성률 {needsAttention.rate}%</span>
          </div>
        )}
      </div>

      <ul className="habit-stats__list">
        {stats.map(({ habit, completions, rate }) => (
          <li key={habit.id}>
            <span aria-hidden="true">{habit.icon}</span>
            <span className="habit-stats__list-name">{habit.name}</span>
            <span className="habit-stats__list-value">
              {completions}회 · {rate}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
