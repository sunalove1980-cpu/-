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
  apiKey: 'AIzaSyBhbieYc_22vBkcXe8gEzrmJ-ZbSoPw2qA',
  authDomain: 'web-for-my-lecture.firebaseapp.com',
  projectId: 'web-for-my-lecture',
  storageBucket: 'web-for-my-lecture.firebasestorage.app',
  messagingSenderId: '831687027321',
  appId: '1:831687027321:web:2570b4a17c88a2062502a8',
};

// apiKey가 자리표시자 그대로면 아직 설정 전으로 간주한다.
export const isConfigured = !firebaseConfig.apiKey.startsWith('PASTE');
