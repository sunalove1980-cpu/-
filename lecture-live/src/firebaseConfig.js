// ─────────────────────────────────────────────────────────────
// Firebase 설정 파일
//
// Firebase 콘솔(https://console.firebase.google.com)에서
//   1. 프로젝트 만들기
//   2. 웹 앱(</>) 추가
//   3. "SDK 설정 및 구성"에 나오는 firebaseConfig 값을 아래에 붙여넣기
//   4. 빌드 후 다시 배포
//
// 값이 채워지기 전에는 앱이 설정 안내 화면을 보여준다.
// ─────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: 'PASTE_YOUR_API_KEY',
  authDomain: 'PASTE_PROJECT_ID.firebaseapp.com',
  projectId: 'PASTE_PROJECT_ID',
  storageBucket: 'PASTE_PROJECT_ID.appspot.com',
  messagingSenderId: 'PASTE_SENDER_ID',
  appId: 'PASTE_APP_ID',
};

// apiKey가 자리표시자 그대로면 아직 설정 전으로 간주한다.
export const isConfigured = !firebaseConfig.apiKey.startsWith('PASTE');
