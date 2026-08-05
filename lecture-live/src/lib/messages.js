// Firestore 'messages' 컬렉션을 다루는 함수 모음.
// 문서 구조: { date: 'YYYY-MM-DD', name: string, text: string, createdAt: Timestamp }
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'messages';

/** createdAt 오름차순 정렬 (아직 서버 시간이 안 찍힌 새 글은 맨 뒤로) */
function sortByCreatedAt(list) {
  return [...list].sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
    const tb = b.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
    return ta - tb;
  });
}

/**
 * 특정 날짜의 글을 실시간 구독한다.
 * 정렬은 클라이언트에서 처리해 Firestore 복합 색인 없이 동작하게 한다.
 * @returns 구독 해제 함수
 */
export function subscribeToDate(dateKey, onUpdate, onError) {
  const q = query(collection(db, COLLECTION), where('date', '==', dateKey));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onUpdate(sortByCreatedAt(list));
    },
    onError,
  );
}

/** 글 작성 */
export function postMessage({ date, name, text }) {
  return addDoc(collection(db, COLLECTION), {
    date,
    name: name.trim() || '익명',
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
}

/** 글 삭제 (발표 화면에서 진행자가 사용) */
export function deleteMessage(id) {
  return deleteDoc(doc(db, COLLECTION, id));
}

/** 전체 글을 한 번 불러와 날짜별로 묶는다. (지난 기록 화면용) */
export async function fetchAllGroupedByDate() {
  const snap = await getDocs(collection(db, COLLECTION));
  const byDate = new Map();
  for (const d of snap.docs) {
    const data = { id: d.id, ...d.data() };
    if (!byDate.has(data.date)) byDate.set(data.date, []);
    byDate.get(data.date).push(data);
  }
  for (const [key, list] of byDate) byDate.set(key, sortByCreatedAt(list));
  // 최신 날짜가 앞에 오도록 정렬
  return new Map([...byDate.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)));
}
