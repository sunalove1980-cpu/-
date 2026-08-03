import './CharacterPanel.css';

const STAGES = [
  { min: 1, max: 2, icon: '🌱', label: '새싹 모험가' },
  { min: 3, max: 4, icon: '🧑‍🎓', label: '수련생' },
  { min: 5, max: 6, icon: '🧙', label: '숙련자' },
  { min: 7, max: 9, icon: '🦸', label: '건강 히어로' },
  { min: 10, max: Infinity, icon: '👑', label: '건강의 달인' },
];

function getStage(level) {
  return STAGES.find((s) => level >= s.min && level <= s.max) || STAGES[0];
}

export default function CharacterPanel({ profile }) {
  const stage = getStage(profile.level);
  const percent = Math.min(100, Math.round((profile.xp / profile.xpToNext) * 100));

  return (
    <section className="character-panel" aria-label="캐릭터 성장 현황">
      <div className="character-panel__avatar" aria-hidden="true">
        <span className="character-panel__emoji">{stage.icon}</span>
        <span className="character-panel__level-ring">Lv.{profile.level}</span>
      </div>
      <p className="character-panel__stage">{stage.label}</p>

      <div
        className="character-panel__xp-bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`경험치 ${profile.xp} / ${profile.xpToNext}`}
      >
        <div className="character-panel__xp-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="character-panel__xp-label">
        경험치 {profile.xp} / {profile.xpToNext}
      </p>

      <div className="character-panel__stats">
        <div className="character-panel__stat">
          <span aria-hidden="true">🪙</span>
          <strong>{profile.coins}</strong>
          <span>코인</span>
        </div>
        <div className="character-panel__stat">
          <span aria-hidden="true">🏅</span>
          <strong>{profile.totalScoreAllTime}</strong>
          <span>누적 점수</span>
        </div>
      </div>
    </section>
  );
}
