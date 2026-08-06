// Firestore 'messages' 컬렉션을 다루는 함수 모음.
// 문서 구조:
// {
//   sessionId: string,
//   questionId: string | null,  // 어떤 질문에 대한 답변인지 (없으면 자유 게시글)
//   parentId: string | null,    // 답글 대상 글 ID (없으면 최상위 글)
//   name: string,
//   text: string,
//   likes: number,
//   createdAt: Timestamp,
// }
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
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
 * 특정 세션의 글을 실시간 구독한다.
 * 정렬은 클라이언트에서 처리해 Firestore 복합 색인 없이 동작하게 한다.
 */
export function subscribeToSession(sessionId, onUpdate, onError) {
  const q = query(collection(db, COLLECTION), where('sessionId', '==', sessionId));
  return onSnapshot(
    q,
    (snap) => onUpdate(sortByCreatedAt(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
    onError,
  );
}

/** 글 작성 (자유 게시글, 질문에 대한 답변, 답글 모두 이 함수 하나로 처리) */
export function postMessage({ sessionId, questionId = null, parentId = null, name, text }) {
  return addDoc(collection(db, COLLECTION), {
    sessionId,
    questionId,
    parentId,
    name: name.trim() || '익명',
    text: text.trim(),
    likes: 0,
    createdAt: serverTimestamp(),
  });
}

export function likeMessage(id) {
  return updateDoc(doc(db, COLLECTION, id), { likes: increment(1) });
}

export function unlikeMessage(id) {
  return updateDoc(doc(db, COLLECTION, id), { likes: increment(-1) });
}

/** 글 삭제 (발표 화면에서 진행자가 사용) */
export function deleteMessage(id) {
  return deleteDoc(doc(db, COLLECTION, id));
}

/** 전체 글을 한 번 불러와 세션별로 묶는다. (지난 기록 화면용) */
export async function fetchAllGroupedBySession() {
  const snap = await getDocs(collection(db, COLLECTION));
  const bySession = new Map();
  for (const d of snap.docs) {
    const data = { id: d.id, ...d.data() };
    if (!bySession.has(data.sessionId)) bySession.set(data.sessionId, []);
    bySession.get(data.sessionId).push(data);
  }
  for (const [key, list] of bySession) bySession.set(key, sortByCreatedAt(list));
  return bySession;
}

/** 최상위 글 + 그 답글들을 { top, repliesByParent } 형태로 묶는다. */
export function buildThread(messages) {
  const top = [];
  const repliesByParent = new Map();
  for (const m of messages) {
    if (m.parentId) {
      if (!repliesByParent.has(m.parentId)) repliesByParent.set(m.parentId, []);
      repliesByParent.get(m.parentId).push(m);
    } else {
      top.push(m);
    }
  }
  return { top, repliesByParent };
}
