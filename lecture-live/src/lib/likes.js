// 로그인이 없는 앱이라 '이미 좋아요를 눌렀는지'는 이 기기의 localStorage로만 기억한다.
// (완벽한 중복 방지는 아니지만, 강의 중 가벼운 반응 용도로는 충분하다.)
const KEY = 'lecture-live:liked';

function readSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function writeSet(set) {
  localStorage.setItem(KEY, JSON.stringify([...set]));
}

export function hasLiked(messageId) {
  return readSet().has(messageId);
}

export function markLiked(messageId) {
  const set = readSet();
  set.add(messageId);
  writeSet(set);
}

export function unmarkLiked(messageId) {
  const set = readSet();
  set.delete(messageId);
  writeSet(set);
}
