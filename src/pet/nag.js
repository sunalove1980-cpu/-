// 시간대에 맞춰 펫이 말풍선으로 잔소리를 한다.
// - 너무 늦은 밤인데 아직 안 자고 있으면 "얼른 자자"
// - 오후 늦게까지 오늘 건강기록이 하나도 없으면 "뭐라도 좀 해보자"
const SLEEP_NAG_MESSAGES = [
  '벌써 이렇게 늦었어? 얼른 자자, 나 졸려 🌙',
  '지금 자야 내일도 쌩쌩하지! 이제 그만 자자 💤',
  '너무 늦게까지 안 자면 나도 잠이 안 와... 슬슬 잘까?',
];

const INACTIVITY_NAG_MESSAGES = [
  '오늘 아직 아무 것도 안 했잖아! 물 한 잔이라도 어때? 💧',
  '해 지기 전에 나랑 뭐라도 하나 해보자!',
  '오늘 건강기록이 텅 비었어... 나 심심해, 같이 놀아줘!',
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * @param {{hour:number, activityType:string, hasAnyRecordToday:boolean}} ctx
 * @returns {string|null} 지금 재생할 잔소리 메시지 (없으면 null)
 */
export function pickNagMessage({ hour, activityType, hasAnyRecordToday }) {
  const isDeepNight = hour >= 23 || hour < 5;
  if (isDeepNight && activityType !== 'sleep') {
    return pick(SLEEP_NAG_MESSAGES);
  }
  if (hour >= 15 && hour < 23 && !hasAnyRecordToday) {
    return pick(INACTIVITY_NAG_MESSAGES);
  }
  return null;
}
