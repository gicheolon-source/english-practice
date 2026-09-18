# OPIc Coach — 오픽 자격증 대비

한국인 직장인을 위한 오픽(OPIc) 대비 앱. 목표 구간은 **IM2 · IH**(이직 · 승진)부터 **AL**(고득점)까지.

두 개의 앱이 한 지붕 아래 있습니다.

| 영역 | 경로 | 하는 일 | 네트워크 |
|---|---|---|---|
| 학습 · 복습 · 표현집 | `/` | 듀오링고식 스킬트리로 시험 문장을 외운다 | **100% 오프라인** |
| 스피킹 | `/speaking/` | 실제로 말하고 Claude 에게 첨삭받는다 | API 필요 |

## 학습 앱

- **8개 유닛 · 35레슨** — 오픽 기본기 → 묘사 → 습관 → 과거 경험 → 비교 → 롤플레이 → 콩글리시 탈출 → AL 고득점
- **표현 84개** (12가지 기능 × IM2/IH/AL 등급), **감점 포인트 26개**(시제 · 콩글리시 · 단답), **답변 구조 8종**, **등급 사다리 8종**
- 문제는 데이터에서 자동 생성 (뜻 고르기 / 영어 고르기 / 빈칸 / 짝 맞추기 / 등급 감각 / O·X / 고쳐쓰기 / 순서 배열)
- 틀린 문제는 SM-2 방식으로 복습 큐에 쌓임
- 진도는 localStorage. 회사 Google 계정으로 로그인하면 기기 간 동기화(선택)
- PWA — 홈 화면에 추가하면 오프라인으로 동작

### 발음(TTS)
브라우저 내장 Web Speech API 를 씁니다. API 키도 네트워크도 필요 없습니다.

- 미국 영어 음성을 자동으로 골라 씁니다 (Edge Neural → Google US → macOS → Windows SAPI 순)
- **영어 음성이 하나도 없으면 아예 읽지 않습니다.** 한국어 음성으로 영어를 읽으면 발음이 망가지기 때문입니다.
- 프로필 → `🔊 영어 발음` 에서 성우를 직접 고를 수 있습니다.
- Windows 에 영어 음성이 없다면: 설정 → 시간 및 언어 → 언어 및 지역 → 언어 추가 → English (United States) → "음성" 체크 후 설치.
  Microsoft Edge 로 열면 별도 설치 없이 자연스러운 미국 음성을 쓸 수 있습니다.

## 스피킹 앱 (`/speaking/`)

크롬 음성인식으로 답변을 녹음·전사하고, Claude 로 등급 추정 · 문법 교정 · 모범답안 피드백을 받습니다.

### API 키 — 두 가지 방식
1. **개인·로컬용 (기본):** 사용자가 자기 Claude API 키를 입력. 키는 해당 브라우저(localStorage)에만 저장되고,
   호출은 브라우저 → Anthropic 으로 직접 이뤄집니다.
2. **서버 키 (모든 기기 공통):** Vercel 서버리스 함수 `api/feedback.js` 가 서버에 저장된 키로 대신 호출.

Vercel → Settings → Environment Variables
- `ANTHROPIC_API_KEY` = `sk-ant-...` (필수)
- `APP_PASSCODE` = 짧은 접속 비밀번호 (권장)

`ANTHROPIC_API_KEY` 가 없으면 함수는 501 을 반환하고 앱은 "개인 키" 방식으로 폴백합니다.
(이 저장소에는 어떤 키도 포함돼 있지 않습니다.)

## 폴더 구조

```
data/       phrases.js  pitfalls.js  scenarios.js  courses.js   ← 내용물은 전부 여기
src/        engine.js(문제 생성)  store.js(진도)  ui.js(DOM+TTS)  sync.js  a2hs.js
src/screens/ courses  learn  lesson  phrasebook  profile
speaking/   기존 OPIc 스피킹 트레이너 (별도 앱)
api/        feedback.js (Vercel 서버리스)
```

레슨을 늘리려면 `data/` 에 항목을 추가하고 `courses.js` 의 `gen` 명세만 적으면 됩니다. 빌드 과정은 없습니다.

## 로컬 실행
- Windows: `start.bat` 더블클릭 → http://localhost:8000
- 또는 `python -m http.server 8000`

정적 파일만 고쳤는데 반영이 안 되면 서비스워커 캐시 때문입니다. `sw.js` 의 `VERSION` 을 올리세요.

## 배포
정적 사이트라 Vercel 에 그대로 배포됩니다 (빌드 불필요).
