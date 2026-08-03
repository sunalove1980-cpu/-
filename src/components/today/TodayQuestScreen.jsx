import { useApp } from '../../state/AppContext.jsx';
import ProgressSummary from './ProgressSummary.jsx';
import QuestCard from './QuestCard.jsx';
import './TodayQuestScreen.css';

export default function TodayQuestScreen() {
  const { activeHabits, todayRecord, streaksByHabit, actions } = useApp();
  const sortedHabits = [...activeHabits].sort((a, b) => a.order - b.order);
  const completedCount = sortedHabits.filter((h) => todayRecord.habitEntries[h.id]?.completed).length;

  return (
    <section aria-labelledby="today-heading">
      <h1 id="today-heading" className="visually-hidden">
        오늘의 건강 퀘스트
      </h1>

      <ProgressSummary
        completedCount={completedCount}
        totalCount={sortedHabits.length}
        totalScore={todayRecord.totalScore}
      />

      {sortedHabits.length === 0 ? (
        <div className="today-empty">
          <p>아직 등록된 건강 습관이 없어요.</p>
          <p className="today-empty__hint">설정 화면에서 나만의 건강 퀘스트를 추가해보세요.</p>
        </div>
      ) : (
        <ul className="today-list">
          {sortedHabits.map((habit) => (
            <QuestCard
              key={habit.id}
              habit={habit}
              entry={todayRecord.habitEntries[habit.id]}
              streak={streaksByHabit[habit.id]}
              onToggle={() => actions.toggleCheck(habit.id)}
              onNumberChange={(value) => actions.setNumberValue(habit.id, value)}
              onNoteChange={(text) => actions.setNoteValue(habit.id, text)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
