# 강의 라이브 보드 (Lecture Live Board)

강의 중 참여자들이 QR 코드로 접속해 글을 남기면, 발표 화면에 **실시간**으로 표시되는 웹앱입니다.
글은 날짜별로 자동 구분·저장되며, 지난 기록을 TXT/CSV 파일로 내려받을 수 있습니다.

## 화면 구성

| 주소 | 용도 |
| --- | --- |
| `#/` | 첫 화면 (역할 선택) |
| `#/screen` | **발표 화면** — 프로젝터에 띄우는 화면. QR 코드 + 실시간 글 벽. 글 위에 마우스를 올리면 ✕로 삭제 가능 |
| `#/write` | **참여자 화면** — QR을 찍으면 열리는 글쓰기 페이지 (이름은 기기에 기억됨) |
| `#/archive` | **지난 기록** — 날짜별 글 모아보기, TXT/CSV 다운로드 |

## 사용 준비 (최초 1회): Firebase 설정

실시간 통신은 무료 Firebase(Firestore)를 사용합니다.

1. [console.firebase.google.com](https://console.firebase.google.com)에서 **프로젝트 만들기**
2. 왼쪽 메뉴 **빌드 → Firestore Database → 데이터베이스 만들기**
   - 위치: `asia-northeast3` (서울) 추천
   - 보안 규칙: **테스트 모드**로 시작 (30일 후 만료되므로, 계속 쓰려면 규칙 탭에서 아래처럼 변경)
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /messages/{id} {
           allow read, create, delete: if true;
           allow update: if false;
         }
       }
     }
     ```
3. 프로젝트 개요 옆 ⚙️ → **프로젝트 설정 → 내 앱 → 웹 앱(`</>`) 추가**
4. 화면에 나오는 `firebaseConfig` 값을 `src/firebaseConfig.js`에 붙여넣기
5. 다시 빌드/배포

설정 전에는 앱이 설정 안내 화면을 보여줍니다.

## 로컬 실행

```bash
cd lecture-live
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # dist/ 폴더에 배포용 파일 생성
```

## 데이터 구조

Firestore `messages` 컬렉션에 글 1개당 문서 1개:

```
{ date: 'YYYY-MM-DD'(한국 시간 기준), name: '이름', text: '내용', createdAt: 서버시각 }
```

- 발표/참여자 화면은 오늘 날짜의 글만 실시간 구독합니다 (자정이 지나면 자동으로 새 날짜로 전환).
- 지난 기록 화면은 전체 글을 날짜별로 묶어 보여줍니다. 데이터는 삭제하지 않는 한 계속 보관됩니다.
