import { useApp } from '../../state/AppContext.jsx';
import CharacterPanel from './CharacterPanel.jsx';
import StreakList from './StreakList.jsx';
import BadgeList from './BadgeList.jsx';

export default function GrowthScreen() {
  const { profile, activeHabits, streaksByHabit, badges, badgeDefinitions } = useApp();

  return (
    <section aria-labelledby="growth-heading">
      <h1 id="growth-heading" className="visually-hidden">
        캐릭터 성장
      </h1>
      <CharacterPanel profile={profile} />
      <StreakList habits={activeHabits} streaksByHabit={streaksByHabit} />
      <BadgeList definitions={badgeDefinitions} unlockedBadges={badges} />
    </section>
  );
}
