// Firebase 설정이 아직 비어 있을 때 보여주는 안내 화면
export default function SetupGuide() {
  return (
    <div className="setup">
      <div className="setup-card">
        <h1>🔧 마지막 설정이 필요합니다</h1>
        <p>
          이 앱은 <strong>Firebase</strong>로 실시간 글을 주고받습니다. 아래 순서대로
          무료 Firebase 프로젝트를 만들고 설정값을 넣으면 바로 사용할 수 있습니다.
        </p>
        <ol>
          <li>
            <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer">
              console.firebase.google.com
            </a>
            에 구글 계정으로 로그인 → <strong>프로젝트 만들기</strong>
          </li>
          <li>왼쪽 메뉴 <strong>빌드 → Firestore Database → 데이터베이스 만들기</strong> (테스트 모드, 위치는 asia-northeast3 서울 추천)</li>
          <li>프로젝트 개요 옆 ⚙️ → <strong>프로젝트 설정 → 내 앱 → 웹 앱(&lt;/&gt;) 추가</strong></li>
          <li>화면에 나오는 <code>firebaseConfig</code> 값을 복사</li>
          <li>
            프로젝트의 <code>lecture-live/src/firebaseConfig.js</code>에 붙여넣고 다시 빌드·배포
          </li>
        </ol>
        <p className="setup-note">
          설정값을 개발자(또는 Claude)에게 전달하면 대신 적용해 드릴 수 있습니다.
        </p>
      </div>
    </div>
  );
}
