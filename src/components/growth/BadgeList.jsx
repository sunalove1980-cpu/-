import './BadgeList.css';

export default function BadgeList({ definitions, unlockedBadges }) {
  const unlockedMap = Object.fromEntries(unlockedBadges.map((b) => [b.id, b.unlockedAt]));

  return (
    <section aria-labelledby="badge-heading">
      <h2 id="badge-heading" className="section-title">
        업적 배지 ({unlockedBadges.length} / {definitions.length})
      </h2>
      <ul className="badge-grid">
        {definitions.map((badge) => {
          const unlocked = Boolean(unlockedMap[badge.id]);
          return (
            <li
              key={badge.id}
              className={`badge-tile${unlocked ? ' badge-tile--unlocked' : ''}`}
              title={badge.description}
            >
              <span className="badge-tile__icon" aria-hidden="true">
                {unlocked ? badge.icon : '🔒'}
              </span>
              <span className="badge-tile__name">{badge.name}</span>
              <span className="badge-tile__desc">{badge.description}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
