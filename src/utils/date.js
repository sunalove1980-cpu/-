export function todayString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function formatDateKo(dateString) {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-');
  if (!y || !m || !d) return dateString;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}
