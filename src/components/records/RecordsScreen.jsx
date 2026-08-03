import { useMemo, useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import {
  todayKey,
  monthKeyOf,
  shiftMonthKey,
  calendarCells,
  lastNDateKeys,
  fromDateKey,
} from '../../state/dateUtils.js';
import { computeRateByDate, computeAverageRate, computeHabitCompletionStats, collectNumberSeries } from '../../state/statsUtils.js';
import MonthlyCalendar from './MonthlyCalendar.jsx';
import DateDetailCard from './DateDetailCard.jsx';
import HabitStats from './HabitStats.jsx';
import BarChart from './charts/BarChart.jsx';
import LineChart from './charts/LineChart.jsx';
import './RecordsScreen.css';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function RecordsScreen() {
  const { habits, activeHabits, recordsByDate } = useApp();
  const [monthKey, setMonthKey] = useState(monthKeyOf(todayKey()));
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const habitsById = useMemo(() => Object.fromEntries(habits.map((h) => [h.id, h])), [habits]);

  const cells = useMemo(() => calendarCells(monthKey), [monthKey]);
  const rateByDate = useMemo(
    () => computeRateByDate(recordsByDate, activeHabits.length, cells.filter(Boolean)),
    [recordsByDate, activeHabits.length, cells],
  );

  const last7 = useMemo(() => lastNDateKeys(7), []);
  const weeklyScoreData = useMemo(
    () =>
      last7.map((dateKey) => ({
        label: WEEKDAY_LABELS[fromDateKey(dateKey).getDay()],
        value: recordsByDate[dateKey]?.totalScore || 0,
      })),
    [last7, recordsByDate],
  );

  const last30 = useMemo(() => lastNDateKeys(30), []);
  const rateByDate30 = useMemo(
    () => computeRateByDate(recordsByDate, activeHabits.length, last30),
    [recordsByDate, activeHabits.length, last30],
  );
  const avgRate30 = useMemo(() => computeAverageRate(rateByDate30, last30), [rateByDate30, last30]);

  const habitStats = useMemo(
    () => computeHabitCompletionStats(activeHabits, recordsByDate, last30),
    [activeHabits, recordsByDate, last30],
  );

  const numberHabits = activeHabits.filter((h) => h.type === 'number');

  return (
    <section aria-labelledby="records-heading">
      <h1 id="records-heading" className="visually-hidden">
        건강 기록
      </h1>

      <MonthlyCalendar
        monthKey={monthKey}
        onShiftMonth={(delta) => setMonthKey((prev) => shiftMonthKey(prev, delta))}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        rateByDate={rateByDate}
      />

      <DateDetailCard dateKey={selectedDate} record={recordsByDate[selectedDate]} habitsById={habitsById} />

      <section className="records-section" aria-label="최근 7일 점수">
        <h2 className="section-title">최근 7일 점수</h2>
        <BarChart data={weeklyScoreData} ariaLabel="최근 7일간 일일 점수 막대그래프" />
      </section>

      <section className="records-section" aria-label="최근 30일 달성률">
        <h2 className="section-title">최근 30일 평균 달성률</h2>
        <p className="records-rate-highlight">{avgRate30}%</p>
      </section>

      <HabitStats stats={habitStats} />

      {numberHabits.length > 0 && (
        <section className="records-section" aria-label="수치 기록 변화">
          <h2 className="section-title">수치 변화 추이 (최근 30일)</h2>
          {numberHabits.map((habit) => (
            <div key={habit.id} className="records-number-chart">
              <p className="records-number-chart__title">
                <span aria-hidden="true">{habit.icon}</span> {habit.name}
              </p>
              <LineChart
                points={collectNumberSeries(habit, recordsByDate, last30)}
                unit={habit.unit}
                ariaLabel={`${habit.name} 최근 30일 변화 그래프`}
              />
            </div>
          ))}
        </section>
      )}
    </section>
  );
}
