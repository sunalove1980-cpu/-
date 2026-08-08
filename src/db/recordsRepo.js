// 기록(영화/책) 관련 CRUD를 다루는 저장소 계층. 컴포넌트는 IndexedDB를 직접 건드리지 않고 이 함수들만 사용한다.
import { getAll, getOne, putOne, deleteOne, clearStore, STORE_RECORDS } from './db.js';
import { createId } from '../utils/id.js';

export async function listRecords() {
  const records = await getAll(STORE_RECORDS);
  return records.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getRecord(id) {
  return getOne(STORE_RECORDS, id);
}

export async function createRecord(data) {
  const now = Date.now();
  const record = {
    id: createId(),
    type: data.type || 'movie',
    title: data.title?.trim() || '',
    creator: data.creator?.trim() || '',
    genre: data.genre?.trim() || '',
    watchedOn: data.watchedOn || '',
    rating: typeof data.rating === 'number' ? data.rating : 0,
    synopsis: data.synopsis || '',
    review: data.review || '',
    memorableScene: data.memorableScene || '',
    images: data.images || [],
    createdAt: now,
    updatedAt: now,
  };
  await putOne(STORE_RECORDS, record);
  return record;
}

export async function updateRecord(id, patch) {
  const existing = await getRecord(id);
  if (!existing) throw new Error('기록을 찾을 수 없습니다.');
  const updated = { ...existing, ...patch, id, updatedAt: Date.now() };
  await putOne(STORE_RECORDS, updated);
  return updated;
}

export async function deleteRecord(id) {
  await deleteOne(STORE_RECORDS, id);
}

// 백업 복원 시 기존 기록을 모두 지우고 가져온 기록으로 통째로 교체한다.
export async function replaceAllRecords(records) {
  await clearStore(STORE_RECORDS);
  for (const record of records) {
    await putOne(STORE_RECORDS, record);
  }
}
