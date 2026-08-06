// Firestore 'sessions' 컬렉션을 다루는 함수 모음.
// 문서 구조:
// {
//   name: string | null,        // 진행자가 붙인 이름 (예: '오전반')
//   dateKey: 'YYYY-MM-DD',      // 생성된 날짜 (기록 화면에서 날짜별로 묶을 때 사용)
//   createdAt: Timestamp,
//   questionId: string | null,  // 현재 진행 중인 질문 ID (없으면 자유 게시판 모드)
//   questionText: string | null,
//   questionAt: Timestamp | null,
// }
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { todayKey } from './dates';

const COLLECTION = 'sessions';

/** 새 세션(하나의 QR/발표 단위)을 만들고 ID를 반환한다. */
export async function createSession(name) {
  const ref = await addDoc(collection(db, COLLECTION), {
    name: name?.trim() || null,
    dateKey: todayKey(),
    createdAt: serverTimestamp(),
    questionId: null,
    questionText: null,
    questionAt: null,
  });
  return ref.id;
}

/** 세션 하나를 실시간 구독한다 (이름, 진행 중인 질문 등). */
export function subscribeSession(sessionId, onUpdate, onError) {
  return onSnapshot(
    doc(db, COLLECTION, sessionId),
    (snap) => onUpdate(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError,
  );
}

/** 최근 세션 목록을 실시간 구독한다 (홈 화면의 '최근 세션'용). */
export function subscribeRecentSessions(onUpdate, onError, max = 8) {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(max));
  return onSnapshot(
    q,
    (snap) => onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  );
}

/** 전체 세션을 한 번 불러온다 (지난 기록 화면용). */
export async function fetchAllSessions() {
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** 새 질문을 올려 '질문 모드'를 시작한다. */
export async function askQuestion(sessionId, text) {
  const questionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await updateDoc(doc(db, COLLECTION, sessionId), {
    questionId,
    questionText: text.trim(),
    questionAt: serverTimestamp(),
  });
  return questionId;
}

/** 진행 중인 질문을 종료하고 자유 게시판 모드로 되돌린다. */
export function clearQuestion(sessionId) {
  return updateDoc(doc(db, COLLECTION, sessionId), {
    questionId: null,
    questionText: null,
    questionAt: null,
  });
}
