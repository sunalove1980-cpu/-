# 숲속 상담소 (Forest Counselor)

🔗 **배포된 주소**: https://forest-counselor.netlify.app

숲속에 사는 귀여운 여우 캐릭터 "포리"에게 고민을 털어놓는 웹앱입니다.
캐릭터는 화면 안을 스스로 어슬렁거리며 돌아다니고, 터치하면 반응하며,
채팅으로 고민을 적으면 F(공감형) / T(팩폭형) 모드에 맞춰 대답합니다.
React + Vite로 만들었고, Gemini API를 붙여서 실제 AI 답변을 받을 수 있습니다.

## 주요 기능

- 화면 안을 계속 돌아다니는 통통하고 귀여운 캐릭터 (랜덤 목적지로 걷다가 쉬었다가 반복)
- 표정 변화: 평소(idle) / 터치하면 놀람(surprised) / 생각 중(thinking) / 답변 후 F모드는
  활짝 웃는 표정(happy), T모드는 씩 웃는 표정(smug)으로 자동 전환
- 캐릭터를 터치/클릭하면 놀라는 리액션 애니메이션 + 짧은 대사
- **F 모드**: 먼저 감정을 알아주고, 부담스럽지 않은 선에서 담백하게 공감 + 작은 제안
- **T 모드**: 공감 생략, 원인 분석과 실행 가능한 해결책 위주의 직설적인 "쌉T" 답변
- 상단의 스피커 버튼을 누르면 숲 배경음(바람 소리 + 가끔 들리는 새소리)이 재생됨 —
  외부 음원 파일 없이 Web Audio API로 그때그때 만들어낸 소리라 용량이 들지 않음
- 기기의 현재 시각에 맞춰 숲 배경이 새벽/아침/낮/노을/밤 다섯 단계로 자연스럽게 바뀜
  (밤에는 별과 반딧불이도 나타남), 1분마다 다시 확인해서 시간이 지나면 알아서 전환됨
- Gemini API 연동 (`VITE_GEMINI_API_KEY` 설정 시 실제 AI 응답, 없으면 내장 대사로 자동 대체)
- 하단 채팅창 + 대화 기록 전체 보기 패널

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

### 프로덕션 빌드 미리보기

```bash
npm run build     # dist/ 폴더에 배포용 정적 파일 생성
npm run preview   # 빌드 결과물을 로컬에서 미리보기
```

## 2. Gemini API 연결하기

API 키가 없어도 앱은 정상 작동합니다 (내장된 대사 뱅크로 대신 답합니다).
실제 Gemini 답변을 받고 싶다면:

1. [Google AI Studio](https://aistudio.google.com/apikey)에서 API 키를 발급받습니다.
2. 프로젝트 루트에 `.env.local` 파일을 만듭니다 (`.env.example`을 복사해도 됩니다).

   ```bash
   cp .env.example .env.local
   ```

3. `.env.local`에 키를 채워 넣습니다.

   ```
   VITE_GEMINI_API_KEY=여기에_발급받은_키
   ```

4. 개발 서버를 다시 시작하면 (`npm run dev`) 상단바에 "Gemini 연결됨" 배지가 뜨고,
   채팅 답변이 실제 Gemini 모델(`gemini-3.6-flash`, `VITE_GEMINI_MODEL`로 변경 가능)에서
   생성됩니다. API 호출이 실패하면 자동으로 내장 대사로 대체되어 앱이 멈추지 않습니다.

F/T 모드별 시스템 프롬프트와 내장 대사는 `src/data/persona.js`에서,
실제 API 호출 로직은 `src/services/geminiService.js`에서 관리합니다.

> ⚠️ **주의**: `VITE_*` 환경 변수는 빌드 결과물(JS 번들)에 그대로 포함되어 브라우저에서
> 볼 수 있습니다. 개인용/데모용으로 쓰기엔 괜찮지만, 불특정 다수가 접근하는 곳에 배포한다면
> 키가 노출되어 남용될 수 있으니 서버(예: Vercel/Netlify Function)를 하나 두고 그쪽에서만
> Gemini를 호출하도록 바꾸는 걸 권장합니다.

## 3. 깃허브(GitHub)에 올리는 방법

```bash
git add .
git commit -m "숲속 상담소 앱 추가"
git push
```

## 4. 배포하는 방법

### GitHub Pages (이 저장소에 이미 워크플로 포함됨)

`.github/workflows/deploy-pages.yml`이 포함되어 있어서, 코드를 푸시하면 자동으로 빌드해
GitHub Pages에 배포합니다.

1. 저장소 **Settings → Pages**에서 **Source**를 **GitHub Actions**로 선택합니다.
2. Gemini를 실제 배포본에서도 쓰고 싶다면 **Settings → Secrets and variables → Actions**에서
   `VITE_GEMINI_API_KEY`라는 이름으로 Repository secret을 추가합니다. (안 하면 내장 대사로 동작)
3. **Actions** 탭에서 "Deploy to GitHub Pages" 워크플로가 실행되는지 확인합니다.
4. 완료되면 `https://내계정.github.io/저장소이름/` 주소로 접속할 수 있습니다.

### Netlify (현재 배포 중인 방식)

이 프로젝트는 Netlify에 `forest-counselor`라는 이름으로 배포되어 있습니다
(https://forest-counselor.netlify.app). 저장소 루트의 `netlify.toml`이 빌드 명령(`npm run
build`)과 배포 폴더(`dist`)를 지정합니다. Netlify 대시보드의 **Site settings → Environment
variables**에서 `VITE_GEMINI_API_KEY`를 추가하면 배포본에서도 실제 Gemini 응답을 받을 수
있습니다 (안 넣으면 내장 대사로 동작).

### Vercel

[vercel.com](https://vercel.com)에서 이 GitHub 저장소를 Import하면 Vite 프로젝트로 자동
인식됩니다 (Build: `npm run build`, Output: `dist`). "Environment Variables" 단계에서
`VITE_GEMINI_API_KEY`를 추가하면 배포본에서도 Gemini가 동작합니다. Deploy를 누르면 몇 분 안에
`https://프로젝트이름.vercel.app` 주소가 생성됩니다.

## 프로젝트 구조

```
src/
├─ data/persona.js         # F/T 모드 시스템 프롬프트, 반응 대사, 내장(fallback) 대사 뱅크
├─ services/geminiService.js  # Gemini API 호출 + 실패 시 대체 응답 처리
├─ hooks/useWander.js       # 캐릭터가 화면을 스스로 돌아다니게 하는 애니메이션 로직
├─ hooks/useForestAmbience.js  # Web Audio API로 바람/새소리를 합성하는 숲 배경음 훅
├─ components/
│  ├─ TopBar.jsx           # 타이틀 + 숲 소리 버튼 + F/T 모드 선택 토글
│  ├─ ForestScene.jsx       # 숲 배경 + 캐릭터 + 말풍선을 담는 무대
│  ├─ Character.jsx         # SVG 캐릭터, 걷기/터치 반응 애니메이션
│  ├─ characterExpressions.jsx  # 표정별(눈/입/눈썹) SVG 파츠 모음
│  ├─ SpeechBubble.jsx       # 캐릭터 위에 뜨는 말풍선
│  ├─ ChatDock.jsx           # 하단 입력창
│  └─ ChatLog.jsx            # 대화 기록 전체보기 패널
└─ App.jsx, main.jsx, index.css
```

## 안내

이 앱은 가벼운 위로/정리를 돕는 용도이며, 전문적인 심리 상담이나 의료적 진단을 대체하지
않습니다. 위기 상황이라면 반드시 전문 기관(정신건강 위기상담전화 1577-0199, 자살예방상담전화
1393 등)에 연락하세요.
