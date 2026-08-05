import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isConfigured } from './firebaseConfig';

// 설정이 채워진 경우에만 Firebase를 초기화한다.
// 설정 전에는 db가 null이고, App이 설정 안내 화면을 대신 보여준다.
let db = null;
if (isConfigured) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { db, isConfigured };
