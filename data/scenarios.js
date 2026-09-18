// 오픽 답변 "구조" 템플릿.
// 순서대로 말하기만 해도 분량과 논리가 확보된다. 레슨에서는 순서 배열 문제로 나온다.

export const SCENARIOS = [
  {
    id: 'sc-desc',
    ko: '묘사 문제 답변 구조',
    goal: '장소·사람·사물을 묘사하라는 문제 (오픽에서 가장 자주 나온다)',
    steps: [
      { en: "Sure, let me tell you about my neighborhood.", ko: '시작 — 무엇을 말할지 먼저 밝힌다' },
      { en: "It's a pretty quiet area in the south part of Seoul.", ko: '큰 그림 — 위치나 전체 인상' },
      { en: "There's a big park right in front of my place, and a few cafes nearby.", ko: '구체적인 것 2~3개' },
      { en: "What I like most is that everything is within walking distance.", ko: '가장 마음에 드는 점' },
      { en: "So yeah, that's pretty much what it's like.", ko: '마무리 — 짧게 닫는다' },
    ],
    note: '묘사는 "전체 → 부분 → 내 생각" 순서가 가장 안전하다.',
  },
  {
    id: 'sc-past',
    ko: '과거 경험 답변 구조',
    goal: '기억에 남는 경험을 말하라는 문제',
    steps: [
      { en: "Actually, something like that happened about two years ago.", ko: '언제 일인지 먼저' },
      { en: "I was on a business trip to Busan with a couple of coworkers.", ko: '배경 — 누구와, 어디서' },
      { en: "And then, out of nowhere, our flight got canceled.", ko: '사건 — and then 으로 전환' },
      { en: "We ended up taking the KTX and made it just in time.", ko: '결과 — end up 이 편하다' },
      { en: "Looking back, it was stressful, but it's a funny story now.", ko: '느낌 — 지금 생각하면 어떤지' },
    ],
    note: '과거 문제는 처음부터 끝까지 과거시제. Looking back 으로 닫으면 깔끔하다.',
  },
  {
    id: 'sc-routine',
    ko: '습관 · 루틴 답변 구조',
    goal: '평소에 얼마나 자주, 어떻게 하는지 묻는 문제',
    steps: [
      { en: "I'd say I do that about twice a week.", ko: '빈도를 숫자로 먼저' },
      { en: "Usually on weeknights, right after I get off work.", ko: '언제 하는지' },
      { en: "I normally start with a quick warm-up, and then I go for a run.", ko: '순서 — then 으로 연결' },
      { en: "It depends on the weather, though. If it rains, I just stay home.", ko: '예외 상황 (분량 벌기 좋다)' },
      { en: "It's become kind of a routine for me at this point.", ko: '마무리' },
    ],
    note: '빈도 → 시점 → 순서 → 예외. 예외를 넣으면 IH 이상으로 들린다.',
  },
  {
    id: 'sc-compare',
    ko: '비교 · 변화 답변 구조',
    goal: '예전과 지금이 어떻게 다른지 묻는 문제',
    steps: [
      { en: "Things have changed quite a bit over the past few years.", ko: '변했다는 사실부터' },
      { en: "Back then, we had to do everything on paper.", ko: '과거 — Back then' },
      { en: "But these days, pretty much everything is done online.", ko: '현재 — But these days' },
      { en: "So it's way more convenient than it used to be.", ko: '차이를 비교급으로' },
      { en: "That said, I kind of miss the old way sometimes.", ko: '반전 한 스푼 (고득점 포인트)' },
    ],
    note: 'Back then / these days 짝이면 시제 실수를 거의 안 한다.',
  },
  {
    id: 'sc-rp-ask',
    ko: '롤플레이 — 질문하기',
    goal: '점원·친구에게 전화해서 정보를 물어보라는 문제',
    steps: [
      { en: "Hi, I'm calling to ask about the membership.", ko: '전화 건 이유부터' },
      { en: "First of all, how much is it per month?", ko: '질문 1 — First of all' },
      { en: "Also, do I need to sign up for a whole year?", ko: '질문 2 — Also' },
      { en: "And one more thing — are there any discounts for students?", ko: '질문 3 — And one more thing' },
      { en: "Okay, got it. Thanks a lot for your help.", ko: '마무리 인사' },
    ],
    note: '롤플레이는 질문을 최소 3개 해야 한다. First of all / Also / One more thing 으로 센다.',
  },
  {
    id: 'sc-rp-fix',
    ko: '롤플레이 — 문제 해결',
    goal: '상황에 문제가 생겼고, 대안을 제시하라는 문제',
    steps: [
      { en: "Hey, I have some bad news, unfortunately.", ko: '나쁜 소식을 예고한다' },
      { en: "I don't think I can make it tomorrow — something came up at work.", ko: '상황 설명 + 이유' },
      { en: "I'm really sorry about the short notice.", ko: '사과' },
      { en: "So here's what I was thinking — could we push it to Saturday instead?", ko: '대안 제시 (핵심)' },
      { en: "Let me know what works for you.", ko: '상대에게 넘기며 마무리' },
    ],
    note: '사과만 하고 끝내면 감점. 반드시 대안 하나를 제시해야 한다.',
  },
  {
    id: 'sc-combo',
    ko: '콤보 3종 세트 순서',
    goal: '같은 주제로 문제 3개가 연달아 나올 때의 순서',
    steps: [
      { en: 'Describe it — what it looks like, where it is.', ko: '1번: 묘사' },
      { en: 'Talk about your routine — how often, when, with who.', ko: '2번: 습관' },
      { en: 'Tell a specific story — one memorable time.', ko: '3번: 경험' },
    ],
    note: '오픽은 한 주제를 이 순서로 세 번 묻는다. 미리 알고 가면 당황하지 않는다.',
  },
  {
    id: 'sc-al',
    ko: 'AL 답변 구조',
    goal: 'AL(Advanced Low)을 노릴 때의 고급 전개',
    steps: [
      { en: "That's an interesting question, actually.", ko: '질문을 받아치며 시간을 번다' },
      { en: "I'd say it really depends on the situation.", ko: '단정하지 않는다 — 뉘앙스' },
      { en: "For instance, when I was working on a tight deadline last year...", ko: '구체적인 사례를 하나 깊게' },
      { en: "If I hadn't done that, things would've turned out completely differently.", ko: '가정법 — AL 의 결정타' },
      { en: "So in that sense, I think it's more about balance than anything else.", ko: '한 단계 추상화해서 마무리' },
    ],
    note: 'AL 은 길이보다 "가정법 + 추상화"다. 문장 4번을 못 하면 IH 에서 멈춘다.',
  },
];

export const SCENARIO_BY_ID = Object.fromEntries(SCENARIOS.map(s => [s.id, s]));
