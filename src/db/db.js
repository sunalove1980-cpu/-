// IndexedDB 저장을 위한 얇은 Promise 래퍼.
// 브라우저의 IndexedDB API를 직접 감싸서 async/await로 쓸 수 있게 해준다.
import { DB_NAME, DB_VERSION, STORE_RECORDS, STORE_META } from './schema.js';

let dbPromise = null;

function openDatabase() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('이 브라우저는 IndexedDB를 지원하지 않습니다.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        const store = db.createObjectStore(STORE_RECORDS, { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = () => reject(new Error('데이터베이스를 여는 중 오류가 발생했습니다.'));
    request.onblocked = () => reject(new Error('데이터베이스가 다른 탭에서 사용 중이라 열 수 없습니다.'));
  });

  return dbPromise;
}

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('저장소 작업 중 오류가 발생했습니다.'));
  });
}

async function withStore(storeName, mode, callback) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result;
    try {
      result = callback(store);
    } catch (err) {
      reject(err);
      return;
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error || new Error('저장 처리 중 오류가 발생했습니다.'));
    tx.onabort = () => reject(tx.error || new Error('저장 처리가 중단되었습니다.'));
  });
}

export async function getAll(storeName) {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return promisifyRequest(store.getAll());
}

export async function getOne(storeName, key) {
  const db = await openDatabase();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return promisifyRequest(store.get(key));
}

export async function putOne(storeName, value) {
  return withStore(storeName, 'readwrite', (store) => {
    store.put(value);
    return value;
  });
}

export async function deleteOne(storeName, key) {
  return withStore(storeName, 'readwrite', (store) => {
    store.delete(key);
  });
}

export async function clearStore(storeName) {
  return withStore(storeName, 'readwrite', (store) => {
    store.clear();
  });
}

export async function clearAllStores() {
  await clearStore(STORE_RECORDS);
  await clearStore(STORE_META);
}

export { STORE_RECORDS, STORE_META };
