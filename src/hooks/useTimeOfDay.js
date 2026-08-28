import { useEffect, useState } from 'react';

// 사용자의 로컬 시간(기기 시계) 기준으로 하루를 5구간으로 나눠서
// 숲 배경이 실제 시간 흐름에 맞게 바뀌도록 한다. 1분마다 다시 계산한다.

const PERIODS = [
  { key: 'dawn', from: 5, to: 7 }, // 새벽
  { key: 'morning', from: 7, to: 11 }, // 아침
  { key: 'day', from: 11, to: 17 }, // 낮
  { key: 'sunset', from: 17, to: 19.5 }, // 노을
  { key: 'night', from: 19.5, to: 24 }, // 밤
  { key: 'night', from: 0, to: 5 }, // 밤(자정~새벽 전)
];

function getPeriod(date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;
  const found = PERIODS.find((p) => h >= p.from && h < p.to);
  return found?.key ?? 'day';
}

export function useTimeOfDay() {
  const [period, setPeriod] = useState(() => getPeriod());

  useEffect(() => {
    const id = setInterval(() => setPeriod(getPeriod()), 60_000);
    return () => clearInterval(id);
  }, []);

  return period;
}
