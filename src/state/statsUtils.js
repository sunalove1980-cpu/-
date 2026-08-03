// 기록 화면에서 쓰는 통계 계산 함수들. 순수 함수로 분리해 테스트/재사용을 쉽게 한다.

/** 주어진 날짜들에 대해 '완료수 / 활성 습관수' 달성률(%)을 계산. 기록 자체가 없는 날은 null */
export function computeRateByDate(recordsByDate, activeHabitCount, dateKeys) {
  const map = {};
  for (const dateKey of dateKeys) {
    const record = recordsByDate[dateKey];
    if (!record || activeHabitCount === 0) {
      map[dateKey] = record ? 0 : null;
      continue;
    }
    const completed = Object.values(record.habitEntries).filter((e) => e.completed).length;
    map[dateKey] = Math.round((completed / activeHabitCount) * 100);
  }
  return map;
}

/** 최근 기간 동안 기록이 존재하는 날들의 평균 달성률 */
export function computeAverageRate(rateByDate, dateKeys) {
  const known = dateKeys.map((d) => rateByDate[d]).filter((r) => r !== null && r !== undefined);
  if (known.length === 0) return 0;
  return Math.round(known.reduce((sum, r) => sum + r, 0) / known.length);
}

/** 습관별로 최근 기간 내 완료 횟수와 달성률을 계산 */
export function computeHabitCompletionStats(habits, recordsByDate, dateKeys) {
  return habits.map((habit) => {
    const completions = dateKeys.reduce((sum, dateKey) => {
      const entry = recordsByDate[dateKey]?.habitEntries?.[habit.id];
      return sum + (entry?.completed ? 1 : 0);
    }, 0);
    const rate = Math.round((completions / dateKeys.length) * 100);
    return { habit, completions, rate };
  });
}

/** 특정 습관(type: number)의 날짜별 수치 값 목록 */
export function collectNumberSeries(habit, recordsByDate, dateKeys) {
  return dateKeys.map((dateKey) => ({
    label: dateKey.slice(5),
    value: recordsByDate[dateKey]?.habitEntries?.[habit.id]?.value ?? null,
  }));
}
