# 건강 퀘스트 (Health Quest)

습관을 체크하면 경험치와 코인을 얻고 캐릭터 레벨이 오르는 게임형 건강 습관 관리 웹앱입니다.
React + Vite로 만들었고, 회원가입이나 서버 없이 브라우저(IndexedDB)에만 데이터를 저장하는
PWA(Progressive Web App)입니다.

## 주요 기능

- 오늘의 건강 퀘스트 체크 (경험치/코인 획득, 레벨업, 축하 애니메이션)
- 날짜별 기록 보관 (달력, 최근 7일/30일 통계, 습관별 달성률, 체중 변화 그래프, 메모)
- 연속 달성일(스트릭)과 회복 보너스, 업적 배지, 주간 건강 보스전
- 습관 직접 추가/수정/삭제 (삭제해도 과거 기록은 보존)
- JSON 백업/복원, 전체 초기화(2단계 확인)
- 라이트/다크 모드, 오프라인 지원, 홈 화면 설치(PWA)

## 1. 로컬에서 실행하는 방법

**준비물**: [Node.js](https://nodejs.org) 18 버전 이상 (npm 포함)

```bash
# 1) 프로젝트 폴더로 이동
cd 프로젝트_폴더

# 2) 의존성 설치 (최초 1회)
npm install

# 3) 개발 서버 실행
npm run dev
```

터미널에 나오는 주소(예: `http://localhost:5173`)를 브라우저에서 열면 앱이 보입니다.
코드를 수정하면 자동으로 새로고침됩니다(HMR).

종료하려면 터미널에서 `Ctrl + C`를 누르세요.

### 프로덕션 빌드 미리보기

```bash
npm run build     # dist/ 폴더에 배포용 정적 파일 생성
npm run preview   # 빌드 결과물을 로컬에서 미리보기 (PWA 기능까지 실제처럼 테스트 가능)
```

> PWA(서비스워커, 오프라인, 설치 배너)는 `npm run dev`가 아니라
> `npm run build && npm run preview`로 확인해야 정확합니다.

## 2. 깃허브(GitHub)에 올리는 방법

이미 깃 저장소가 설정되어 있다면 아래처럼 커밋 후 푸시하면 됩니다.

```bash
git add .
git commit -m "건강 퀘스트 앱 추가"
git push
```

아직 깃허브 저장소가 없다면:

1. [github.com](https://github.com)에서 New Repository로 새 저장소를 만듭니다.
2. 아래 명령어를 순서대로 실행합니다.

```bash
git init
git add .
git commit -m "첫 커밋: 건강 퀘스트 앱"
git branch -M main
git remote add origin https://github.com/내계정/저장소이름.git
git push -u origin main
```

## 3. 배포하는 방법 (Vercel 예시, 가장 쉬움)

1. [vercel.com](https://vercel.com)에 깃허브 계정으로 로그인합니다.
2. "Add New… → Project"를 누르고 방금 올린 깃허브 저장소를 선택합니다.
3. Framework Preset이 자동으로 **Vite**로 인식됩니다. (Build Command: `npm run build`, Output Directory: `dist`)
4. "Deploy" 버튼을 누르면 몇 분 안에 `https://내프로젝트.vercel.app` 같은 주소가 생성됩니다.

Netlify를 쓰고 싶다면 [netlify.com](https://netlify.com)에서 동일하게 깃허브 저장소를 연결하고,
Build command는 `npm run build`, Publish directory는 `dist`로 설정하면 됩니다.

> ⚠️ PWA는 **HTTPS 주소**에서만 정상적으로 설치/오프라인 동작합니다. Vercel/Netlify는 기본적으로
> HTTPS를 제공하므로 별도 설정이 필요 없습니다.

## 4. 휴대전화에 앱처럼 설치하는 방법

배포된 주소(https://로 시작하는 링크)를 휴대전화 브라우저로 열고 진행하세요.

### 안드로이드 (Chrome)

1. 배포된 주소를 Chrome으로 엽니다.
2. 화면 우측 상단 점 3개 메뉴(⋮)를 누릅니다.
3. "앱 설치" 또는 "홈 화면에 추가"를 선택합니다.
4. 안내에 따라 "설치"를 누르면 홈 화면에 아이콘이 생기고, 이후에는 주소창 없이 독립된 앱처럼 실행됩니다.

### 아이폰 (Safari)

1. 배포된 주소를 Safari로 엽니다. (크롬이 아닌 **Safari**여야 설치가 가능합니다)
2. 하단 공유 버튼(⬆️ 네모에서 화살표가 나가는 아이콘)을 누릅니다.
3. "홈 화면에 추가"를 선택합니다.
4. 이름을 확인하고 "추가"를 누르면 홈 화면에 아이콘이 생성됩니다.

설치 후에는 인터넷 연결이 없어도 기본 화면과 그동안 저장된 기록을 열어볼 수 있습니다.
앱이 업데이트되면 화면 하단에 "새로운 버전이 있습니다" 안내가 뜨며, 버튼을 누르면 최신 버전으로
갱신됩니다.

## 프로젝트 구조

```
src/
├─ db/            # IndexedDB 래퍼(db.js)와 데이터 스키마 문서(schema.js)
├─ state/         # 전역 상태(AppContext), 게임 로직, 날짜/통계 유틸
├─ components/
│  ├─ layout/     # 상단바, 하단 내비게이션, 저장/배지/업데이트 토스트
│  ├─ today/      # 오늘의 퀘스트 화면
│  ├─ growth/     # 성장(레벨/스트릭/배지) 화면
│  ├─ records/    # 기록/통계/차트 화면
│  ├─ weeklyBoss/ # 주간 건강 보스전 화면
│  └─ settings/   # 습관 관리, 백업/복원, 테마, 초기화, 안내문
└─ App.jsx, main.jsx, index.css
```

데이터 저장 구조에 대한 자세한 설명은 `src/db/schema.js` 파일 상단 주석을 참고하세요.

## 앱 아이콘 다시 만들기

`scripts/icon-source.svg`, `scripts/icon-maskable-source.svg` 파일을 수정한 뒤,
아래 명령으로 필요한 모든 크기의 PNG를 다시 생성할 수 있습니다.

```bash
npm install -D sharp
node scripts/gen-icons.mjs
npm uninstall sharp
```

## 안내

이 앱은 건강 습관을 기록하고 동기부여를 돕기 위한 용도이며, 의료 진단이나 치료를 제공하지
않습니다. 자세한 내용은 앱 내 설정 화면의 안내문을 확인하세요.
