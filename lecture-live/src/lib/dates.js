// 날짜 관련 유틸. 모든 날짜 키는 한국 시간(Asia/Seoul) 기준 'YYYY-MM-DD' 문자열을 쓴다.

const KST = 'Asia/Seoul';

/** 오늘 날짜 키 (예: '2026-08-05') */
export function todayKey() {
  // sv-SE 로케일은 YYYY-MM-DD 형식을 그대로 돌려준다.
  return new Date().toLocaleDateString('sv-SE', { timeZone: KST });
}

/** 'YYYY-MM-DD' → '2026년 8월 5일 (수)' 같은 표시용 문자열 */
export function formatDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12)); // 정오로 두어 시간대 밀림 방지
  const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short', timeZone: 'UTC' });
  return `${y}년 ${m}월 ${d}일 (${weekday})`;
}

/** Firestore Timestamp(또는 null) → 'HH:MM' 표시 문자열 */
export function formatTime(ts) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: KST,
  });
}
