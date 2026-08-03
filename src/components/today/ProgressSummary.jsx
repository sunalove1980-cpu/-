import { formatDisplayDate, todayKey } from '../../state/dateUtils.js';
import './ProgressSummary.css';

export default function ProgressSummary({ completedCount, totalCount, totalScore }) {
  const rate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <section className="progress-summary" aria-label="오늘의 진행 상황">
      <div className="progress-summary__top">
        <p className="progress-summary__date">{formatDisplayDate(todayKey())}</p>
        <p className="progress-summary__score">
          오늘 총점 <strong>{totalScore}</strong>점
        </p>
      </div>
      <div
        className="progress-summary__bar"
        role="progressbar"
        aria-valuenow={rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`오늘의 퀘스트 달성률 ${rate}%`}
      >
        <div className="progress-summary__bar-fill" style={{ width: `${rate}%` }} />
      </div>
      <p className="progress-summary__count">
        {completedCount} / {totalCount} 퀘스트 완료 · 달성률 {rate}%
      </p>
    </section>
  );
}
