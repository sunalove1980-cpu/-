# 강의 라이브 보드 (Lecture Live Board)

강의 중 참여자들이 QR 코드로 접속해 글을 남기면, 발표 화면에 **실시간**으로 표시되는 웹앱입니다.
하루에 여러 번 나눠 쓸 수 있는 **세션** 단위로 동작하며, 진행자가 질문을 올리면 그 질문이
화면 중앙에 크게 뜨고 참여자는 답변으로 응답합니다. 좋아요·답글도 지원합니다.

## 화면 구성

| 주소 | 용도 |
| --- | --- |
| `#/` | 첫 화면 — 새 세션 시작 / 최근 세션 이어보기 / 지난 기록 |
| `#/screen?s=세션ID` | **발표 화면** — 프로젝터에 띄우는 화면. QR 코드, 질문 올리기/종료, 실시간 글·답변 벽 |
| `#/write?s=세션ID` | **참여자 화면** — QR을 찍으면 열리는 글쓰기 페이지. 좋아요·답글 가능 |
| `#/archive` | **지난 기록** — 날짜별 세션 목록, 세션별 글 모아보기, TXT/CSV 다운로드 |

### 세션과 질문 모드

- **세션**: QR 코드 하나에 대응하는 하나의 발표 단위. 홈 화면에서 "새 세션 시작하기"를 누를 때마다
  새로 생성되므로, 하루에 여러 강의·여러 번 사용해도 기록이 섞이지 않습니다.
- **질문 모드**: 발표 화면에서 진행자가 질문을 입력하면, 그 순간부터 화면 중앙에 질문이 크게 뜨고
  참여자 화면에도 같은 질문이 표시됩니다. 참여자가 쓰는 글은 그 질문에 대한 답변으로 기록됩니다.
  "질문 종료"를 누르면 다시 자유 게시판 모드로 돌아갑니다.
- **좋아요/답글**: 참여자 화면(`#/write`)의 피드에서 다른 사람의 글에 하트를 누르거나 답글을 달 수
  있습니다. 좋아요 중복 방지는 기기별 localStorage로만 처리합니다 (로그인이 없는 앱이라 완벽하지는
  않지만 강의용으로는 충분합니다).

## 사용 준비 (최초 1회): Firebase 설정

실시간 통신은 무료 Firebase(Firestore)를 사용합니다.

1. [console.firebase.google.com](https://console.firebase.google.com)에서 **프로젝트 만들기**
2. 왼쪽 메뉴 **Databases & Storage → Firestore → Create database**
   - 위치: `asia-northeast3` (서울) 추천
   - 보안 규칙: 처음엔 테스트 모드로 시작해도 되지만, **아래 영구 규칙으로 바로 바꾸는 것을 추천**
     (테스트 모드는 30일 후 만료되고, `sessions` 컬렉션과 좋아요用 `update` 권한이 없으면
     이 앱의 세션·질문·좋아요 기능이 전혀 작동하지 않습니다):
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /sessions/{id} {
           allow read, create, update: if true;
           allow delete: if false;
         }
         match /messages/{id} {
           allow read, create, update, delete: if true;
         }
       }
     }
     ```
3. 프로젝트 설정 → 내 앱 → 웹 앱(`</>`) 추가
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

**`sessions` 컬렉션** — 세션(=QR 하나) 1개당 문서 1개:

```
{
  name: string | null,          // 진행자가 붙인 이름 (예: '오전반')
  dateKey: 'YYYY-MM-DD',        // 생성된 날짜 (한국 시간 기준)
  createdAt: 서버시각,
  questionId: string | null,    // 진행 중인 질문 ID (없으면 자유 게시판 모드)
  questionText: string | null,
  questionAt: 서버시각 | null,
}
```

**`messages` 컬렉션** — 글(자유 게시글/질문 답변/답글 공통) 1개당 문서 1개:

```
{
  sessionId: string,
  questionId: string | null,    // 어떤 질문에 대한 답변인지
  parentId: string | null,      // 답글 대상 글 ID (없으면 최상위 글)
  name: string,
  text: string,
  likes: number,
  createdAt: 서버시각,
}
```

지난 기록 화면은 전체 세션·글을 불러와 날짜 → 세션 단위로 묶어 보여줍니다. 데이터는 삭제하지
않는 한 계속 보관됩니다.
