# 숲속 브레이크타임 (Forest Break Time)

🔗 **배포된 주소**: https://forest-counselor.netlify.app

숲속 캐릭터 "포리"와 함께하는 회사원용 짧은 브레이크타임 웹앱입니다.
화면 안을 스스로 돌아다니는 귀여운 캐릭터를 터치하면 반응하고,
**점심 메뉴 룰렛**과 **아이스브레이커 질문 카드**로 잠깐의 휴식과 스몰토크를 도와줍니다.
전부 로컬 데이터 + 랜덤 로직으로 동작해서 **외부 AI API 호출이 전혀 없고, 운영 비용이 0원**입니다.

## 주요 기능

- 화면 안을 계속 돌아다니는 통통하고 귀여운 캐릭터 (랜덤 목적지로 걷다가 쉬었다가 반복)
- 표정 변화: 평소(idle) / 터치하면 놀람(surprised) / 고르는 중(thinking) / 결과가 나오면
  F모드는 활짝 웃는 표정(happy), T모드는 씩 웃는 표정(smug)으로 자동 전환
- **🍱 점심 룰렛**: 한식/중식/일식/양식/분식/샐러드/고기 카테고리 중 골라서 룰렛을 돌리면
  메뉴 하나를 랜덤으로 뽑아줌. 최근 뽑은 메뉴 기록도 보여줌
- **💬 아이스브레이커**: 가벼운 잡담/밸런스 게임/업무·팀/취향 카테고리에서 랜덤 질문 카드를
  뽑아 회의나 티타임 전 분위기를 풀어줌 (직전과 같은 질문은 최대한 피해서 뽑음)
- **F 모드**: 다정한 말투로 챙겨주는 코멘트 / **T 모드**: 군더더기 없이 팩트로 던지는 "쌉T" 코멘트
  — 두 기능의 안내·결과 멘트 톤이 모드에 따라 달라짐
- 상단의 스피커 버튼을 누르면 숲 배경음(바람 소리 + 가끔 들리는 새소리)이 재생됨 —
  외부 음원 파일 없이 Web Audio API로 그때그때 만들어낸 소리라 용량이 들지 않음
- 기기의 현재 시각에 맞춰 숲 배경이 새벽/아침/낮/노을/밤 다섯 단계로 자연스럽게 바뀜
  (밤에는 별과 반딧불이도 나타남), 1분마다 다시 확인해서 시간이 지나면 알아서 전환됨

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
API 키나 별도 환경변수 설정이 전혀 필요 없습니다.

### 프로덕션 빌드 미리보기

```bash
npm run build     # dist/ 폴더에 배포용 정적 파일 생성
npm run preview   # 빌드 결과물을 로컬에서 미리보기
```

## 2. 깃허브(GitHub)에 올리는 방법

```bash
git add .
git commit -m "숲속 브레이크타임 앱 추가"
git push
```

## 3. 배포하는 방법

### Netlify (이 저장소에서 실제로 배포 중인 방식)

이 프로젝트는 Netlify에 `forest-counselor`라는 이름으로 배포되어 있습니다
(https://forest-counselor.netlify.app). 저장소 루트의 `netlify.toml`이 빌드 명령(`npm run
build`)과 배포 폴더(`dist`)를 지정합니다. API 키가 필요 없으니 환경변수 설정 없이도
그대로 잘 동작합니다.

### Vercel

[vercel.com](https://vercel.com)에서 이 GitHub 저장소를 Import하면 Vite 프로젝트로 자동
인식됩니다 (Build: `npm run build`, Output: `dist`). Deploy를 누르면 몇 분 안에
`https://프로젝트이름.vercel.app` 주소가 생성됩니다. 여기도 환경변수 설정이 필요 없습니다.

### GitHub Pages

`.github/workflows/deploy-pages.yml`이 포함되어 있어서, 이 브랜치에 코드를 푸시하면
자동으로 빌드해 GitHub Pages에 배포합니다. 저장소 **Settings → Pages**에서 **Source**를
**GitHub Actions**로 선택하면 활성화됩니다.

## 프로젝트 구조

```
src/
├─ data/
│  ├─ persona.js         # F/T 모드 정의, 터치 반응 대사, 공용 랜덤 선택 유틸
│  ├─ lunch.js            # 점심 룰렛 메뉴 목록 + 모드별 안내/결과 코멘트
│  └─ icebreakers.js       # 아이스브레이커 질문 목록 + 모드별 안내/결과 코멘트
├─ hooks/
│  ├─ useWander.js         # 캐릭터가 화면을 스스로 돌아다니게 하는 애니메이션 로직
│  ├─ useForestAmbience.js  # Web Audio API로 바람/새소리를 합성하는 숲 배경음 훅
│  └─ useTimeOfDay.js       # 기기 로컬 시각 기준 새벽/아침/낮/노을/밤 판정
├─ components/
│  ├─ TopBar.jsx           # 타이틀 + 숲 소리 버튼 + F/T 모드 선택 토글
│  ├─ ForestScene.jsx       # 숲 배경(시간대별 하늘/별/구름/반딧불이) + 캐릭터 + 말풍선
│  ├─ Character.jsx         # SVG 캐릭터, 걷기/터치 반응 애니메이션
│  ├─ characterExpressions.jsx  # 표정별(눈/입/눈썹) SVG 파츠 모음
│  ├─ SpeechBubble.jsx       # 캐릭터 위에 뜨는 말풍선
│  ├─ ActionBar.jsx          # 하단의 "점심 룰렛" / "아이스브레이커" 버튼
│  ├─ BottomSheet.jsx        # 두 기능이 공용으로 쓰는 하단 시트(모달) 틀
│  ├─ LunchRoulette.jsx       # 점심 룰렛 UI (카테고리 필터, 슬롯 애니메이션, 최근 기록)
│  └─ IcebreakerDraw.jsx      # 아이스브레이커 카드 뽑기 UI
└─ App.jsx, main.jsx, index.css
```

## 안내

이 앱은 짧은 휴식과 가벼운 스몰토크를 돕는 용도입니다. 모든 기능이 로컬 데이터와
랜덤 로직으로만 동작하며, 사용자 입력이나 대화 내용을 외부 서버로 전송하지 않습니다.
