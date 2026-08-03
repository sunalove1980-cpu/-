// 날짜 계산은 항상 "사용자의 로컬 타임존" 기준으로 처리한다.
// UTC 변환(toISOString 등)을 쓰면 자정 근처에서 날짜가 하루씩 밀릴 수 있으므로
// getFullYear/getMonth/getDate를 직접 조합해 로컬 날짜 문자열을 만든다.

/** Date 객체 -> 'YYYY-MM-DD' (로컬 기준) */
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 오늘 날짜 키 (로컬 기준) */
export function todayKey() {
  return toDateKey(new Date());
}

/** 'YYYY-MM-DD' -> Date (로컬 자정) */
export function fromDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** dateKey 기준 offsetDays 만큼 이동한 날짜 키 */
export function addDays(dateKey, offsetDays) {
  const date = fromDateKey(dateKey);
  date.setDate(date.getDate() + offsetDays);
  return toDateKey(date);
}

/** 두 날짜 키가 연속된 하루 차이인지 (b가 a의 바로 다음날인지) */
export function isNextDay(dateKeyA, dateKeyB) {
  return addDays(dateKeyA, 1) === dateKeyB;
}

/** 최근 n일의 날짜 키 배열을 과거->오늘 순으로 반환 */
export function lastNDateKeys(n, endDateKey = todayKey()) {
  const keys = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    keys.push(addDays(endDateKey, -i));
  }
  return keys;
}

/** 해당 날짜가 속한 주(월요일 시작)의 시작 날짜 키 */
export function weekStartKey(dateKey = todayKey()) {
  const date = fromDateKey(dateKey);
  const day = date.getDay(); // 0=일 ~ 6=토
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  return toDateKey(date);
}

/** 화면 표기용 'M월 D일 (요일)' 포맷 */
export function formatDisplayDate(dateKey) {
  const date = fromDateKey(dateKey);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday})`;
}

/** 해당 dateKey가 속한 월의 전체 날짜 키 배열 */
export function monthDateKeys(dateKey = todayKey()) {
  const date = fromDateKey(dateKey);
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const keys = [];
  for (let d = 1; d <= daysInMonth; d += 1) {
    keys.push(toDateKey(new Date(year, month, d)));
  }
  return keys;
}

/** 'YYYY-MM-DD' -> 'YYYY-MM' */
export function monthKeyOf(dateKey) {
  return dateKey.slice(0, 7);
}

/** 'YYYY-MM' 기준 delta개월 이동한 월 키 */
export function shiftMonthKey(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** 'YYYY년 M월' 표기 */
export function formatMonthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return `${y}년 ${m}월`;
}

/** 달력 그리드용 셀 배열 (월요일 시작, 7의 배수 길이, 여백은 null) */
export function calendarCells(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const firstOfMonth = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstWeekday = firstOfMonth.getDay(); // 0=일 ~ 6=토
  const leadingBlanks = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const cells = [];
  for (let i = 0; i < leadingBlanks; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(toDateKey(new Date(y, m - 1, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
