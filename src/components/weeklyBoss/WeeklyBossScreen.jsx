import { useApp } from '../../state/AppContext.jsx';
import { todayKey } from '../../state/dateUtils.js';
import './WeeklyBossScreen.css';

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function bossIconForTier(tier) {
  if (tier >= 5) return '🐲';
  if (tier >= 3) return '🐉';
  return '🦖';
}

export default function WeeklyBossScreen() {
  const { weeklyBossView, recordsByDate } = useApp();
  const { maxHp, currentHp, defeated, tier, weekDates, lifetimeDefeats } = weeklyBossView;
  const hpPercent = Math.max(0, Math.round((currentHp / maxHp) * 100));
  const today = todayKey();

  return (
    <section aria-labelledby="boss-heading" className="boss-screen">
      <h1 id="boss-heading" className="visually-hidden">
        주간 건강 보스전
      </h1>

      <div className={`boss-card${defeated ? ' boss-card--defeated' : ''}`}>
        <p className="boss-card__tier">시즌 난이도 Tier {tier}</p>
        <div className="boss-card__avatar" aria-hidden="true">
          {defeated ? '🏆' : bossIconForTier(tier)}
        </div>
        <p className="boss-card__title">
          {defeated ? '이번 주 보스를 물리쳤어요!' : '이번 주의 건강 보스'}
        </p>

        <div
          className="boss-card__hp-track"
          role="progressbar"
          aria-valuenow={hpPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`보스 체력 ${hpPercent}%`}
        >
          <div className="boss-card__hp-fill" style={{ width: `${hpPercent}%` }} />
        </div>
        <p className="boss-card__hp-label">
          체력 {Math.max(0, currentHp)} / {maxHp}
        </p>

        <p className="boss-card__hint">
          {defeated
            ? '다음 주에는 조금 더 강한 보스가 기다리고 있어요.'
            : '건강 습관을 완료할 때마다 보스에게 데미지를 줄 수 있어요.'}
        </p>
      </div>

      <section className="boss-week" aria-label="이번 주 진행 현황">
        <h2 className="section-title">이번 주 진행 현황</h2>
        <ul className="boss-week__days">
          {weekDates.map((dateKey, i) => {
            const record = recordsByDate[dateKey];
            const completions = record ? Object.values(record.habitEntries).filter((e) => e.completed).length : 0;
            const isFuture = dateKey > today;
            const isToday = dateKey === today;
            return (
              <li key={dateKey} className={`boss-week__day${completions > 0 ? ' boss-week__day--active' : ''}${isToday ? ' boss-week__day--today' : ''}`}>
                <span className="boss-week__weekday">{WEEKDAY_LABELS[i]}</span>
                <span className="boss-week__dot" aria-hidden="true">
                  {isFuture ? '' : completions > 0 ? '⚔️' : '·'}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="boss-lifetime" aria-label="누적 보스 처치 기록">
        <span aria-hidden="true">🛡️</span> 지금까지 처치한 보스: <strong>{lifetimeDefeats}</strong>마리
      </div>
    </section>
  );
}
