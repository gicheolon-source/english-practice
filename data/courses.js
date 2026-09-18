// 오픽(OPIc) 대비 코스. 8개 유닛 · 35레슨.
//
// 레슨의 gen 은 "이 레슨에서 어떤 문제를 몇 개 만들지"를 적은 명세다.
// t 종류: meaning | produce | fill | match | level | ladder | pitfall | fix | scenario
//   fn  : 표현 기능 필터 (intro, desc, routine, past, compare, feel, rpask, rpfix, link, time, filler, wrap)
//   lv  : 등급 필터 (1=IM2, 2=IH, 3=AL)
//   tag : 감점 포인트 필터 (tense, konglish, short)
//   id  : 특정 시나리오 지정

export const COURSES = [
  {
    id: 'opic',
    emoji: '🎯',
    name_ko: '오픽(OPIc) 자격증 대비',
    desc_ko: 'IM2·IH부터 AL까지. 시험장에서 바로 쓰는 문장으로.',
    color: '#1CB0F6',
    units: [
      {
        ko: '오픽 기본기',
        en: 'OPIc Basics',
        color: '#2FBF71',
        lessons: [
          { id: 'o1', icon: '🙋', ko: '자기소개 1번', en: '무조건 나오는 첫 문제를 통째로 준비한다',
            gen: [{ t: 'meaning', fn: 'intro', n: 3 }, { t: 'produce', fn: 'intro', n: 3 }, { t: 'match', fn: 'intro', n: 1 }] },
          { id: 'o2', icon: '⏳', ko: '시간 벌기', en: '막혔을 때 침묵 대신 쓰는 문장',
            gen: [{ t: 'meaning', fn: 'filler', n: 3 }, { t: 'produce', fn: 'filler', n: 3 }, { t: 'fill', fn: 'filler', n: 2 }] },
          { id: 'o3', icon: '🏁', ko: '마무리 짓기', en: '답변을 깔끔하게 닫는 법',
            gen: [{ t: 'meaning', fn: 'wrap', n: 3 }, { t: 'produce', fn: 'wrap', n: 3 }, { t: 'match', fn: 'wrap', n: 1 }] },
          { id: 'o4', icon: '✂️', ko: '단답 탈출', en: '"Yes." 한 마디로 끝내지 않기',
            gen: [{ t: 'pitfall', tag: 'short', n: 4 }, { t: 'fix', tag: 'short', n: 3 }] },
          { id: 'o5', icon: '🏆', ko: '기본기 점검', en: '유닛 1 종합', boss: true,
            gen: [{ t: 'meaning', fn: 'intro', n: 2 }, { t: 'produce', fn: 'filler', n: 2 }, { t: 'produce', fn: 'wrap', n: 2 }, { t: 'pitfall', tag: 'short', n: 2 }] },
        ],
      },
      {
        ko: '묘사하기',
        en: 'Describing',
        color: '#1CB0F6',
        lessons: [
          { id: 'o6', icon: '🏞️', ko: '묘사 표현', en: '장소·사물을 그리듯 말하기',
            gen: [{ t: 'meaning', fn: 'desc', n: 3 }, { t: 'produce', fn: 'desc', n: 3 }, { t: 'match', fn: 'desc', n: 1 }] },
          { id: 'o7', icon: '🧩', ko: '묘사 빈칸 채우기', en: '핵심 단어를 직접 떠올려 본다',
            gen: [{ t: 'fill', fn: 'desc', n: 4 }, { t: 'produce', fn: 'desc', n: 3 }] },
          { id: 'o8', icon: '🧱', ko: '묘사 답변 구조', en: '전체 → 부분 → 내 생각',
            gen: [{ t: 'scenario', id: 'sc-desc' }, { t: 'meaning', fn: 'desc', n: 2 }, { t: 'produce', fn: 'desc', n: 2 }, { t: 'fill', fn: 'desc', n: 2 }] },
          { id: 'o9', icon: '🏆', ko: '묘사 점검', en: '유닛 2 종합', boss: true,
            gen: [{ t: 'meaning', fn: 'desc', n: 2 }, { t: 'produce', fn: 'desc', n: 3 }, { t: 'match', fn: 'desc', n: 1 }, { t: 'scenario', id: 'sc-desc' }] },
        ],
      },
      {
        ko: '습관과 루틴',
        en: 'Habits & Routines',
        color: '#FFB020',
        lessons: [
          { id: 'o10', icon: '🔁', ko: '빈도 말하기', en: '얼마나 자주 하는지 숫자로',
            gen: [{ t: 'meaning', fn: 'routine', n: 3 }, { t: 'produce', fn: 'routine', n: 3 }, { t: 'match', fn: 'routine', n: 1 }] },
          { id: 'o11', icon: '🕒', ko: '시간 표현', en: '언제, 얼마 동안을 정확히',
            gen: [{ t: 'meaning', fn: 'time', n: 3 }, { t: 'produce', fn: 'time', n: 3 }, { t: 'fill', fn: 'time', n: 2 }] },
          { id: 'o12', icon: '🧱', ko: '루틴 답변 구조', en: '빈도 → 시점 → 순서 → 예외',
            gen: [{ t: 'scenario', id: 'sc-routine' }, { t: 'produce', fn: 'routine', n: 3 }, { t: 'produce', fn: 'time', n: 2 }] },
          { id: 'o13', icon: '🏆', ko: '루틴 점검', en: '유닛 3 종합', boss: true,
            gen: [{ t: 'meaning', fn: 'routine', n: 2 }, { t: 'meaning', fn: 'time', n: 2 }, { t: 'produce', fn: 'routine', n: 2 }, { t: 'match', fn: 'time', n: 1 }, { t: 'scenario', id: 'sc-routine' }] },
        ],
      },
      {
        ko: '과거 경험',
        en: 'Past Experience',
        color: '#8B5CF6',
        lessons: [
          { id: 'o14', icon: '⏪', ko: '과거 표현', en: '기억에 남는 일을 꺼내는 문장',
            gen: [{ t: 'meaning', fn: 'past', n: 3 }, { t: 'produce', fn: 'past', n: 3 }, { t: 'match', fn: 'past', n: 1 }] },
          { id: 'o15', icon: '⏱️', ko: '시제 교정', en: '오픽 최대 감점 구간',
            gen: [{ t: 'pitfall', tag: 'tense', n: 4 }, { t: 'fix', tag: 'tense', n: 4 }] },
          { id: 'o16', icon: '🔗', ko: '스토리 연결어', en: 'and then, so, but 을 제대로',
            gen: [{ t: 'meaning', fn: 'link', n: 3 }, { t: 'produce', fn: 'link', n: 3 }, { t: 'fill', fn: 'link', n: 2 }] },
          { id: 'o17', icon: '🧱', ko: '경험 답변 구조', en: '언제 → 배경 → 사건 → 결과 → 느낌',
            gen: [{ t: 'scenario', id: 'sc-past' }, { t: 'produce', fn: 'past', n: 3 }, { t: 'produce', fn: 'link', n: 2 }] },
          { id: 'o18', icon: '🏆', ko: '과거 점검', en: '유닛 4 종합', boss: true,
            gen: [{ t: 'meaning', fn: 'past', n: 2 }, { t: 'produce', fn: 'link', n: 2 }, { t: 'pitfall', tag: 'tense', n: 2 }, { t: 'scenario', id: 'sc-past' }] },
        ],
      },
      {
        ko: '비교와 변화',
        en: 'Comparing & Change',
        color: '#FF6B6B',
        lessons: [
          { id: 'o19', icon: '⚖️', ko: '비교 표현', en: '예전과 지금을 나란히 놓기',
            gen: [{ t: 'meaning', fn: 'compare', n: 3 }, { t: 'produce', fn: 'compare', n: 3 }, { t: 'match', fn: 'compare', n: 1 }] },
          { id: 'o20', icon: '💭', ko: '느낌 · 의견', en: '내 생각을 덧붙여 분량 늘리기',
            gen: [{ t: 'meaning', fn: 'feel', n: 3 }, { t: 'produce', fn: 'feel', n: 3 }, { t: 'fill', fn: 'feel', n: 2 }] },
          { id: 'o21', icon: '🧱', ko: '비교 답변 구조', en: 'Back then → these days → 반전',
            gen: [{ t: 'scenario', id: 'sc-compare' }, { t: 'produce', fn: 'compare', n: 3 }, { t: 'produce', fn: 'feel', n: 2 }] },
          { id: 'o22', icon: '🏆', ko: '비교 점검', en: '유닛 5 종합', boss: true,
            gen: [{ t: 'meaning', fn: 'compare', n: 2 }, { t: 'meaning', fn: 'feel', n: 2 }, { t: 'produce', fn: 'compare', n: 2 }, { t: 'match', fn: 'feel', n: 1 }, { t: 'scenario', id: 'sc-compare' }] },
        ],
      },
      {
        ko: '롤플레이',
        en: 'Role Play',
        color: '#00C9A7',
        lessons: [
          { id: 'o23', icon: '❓', ko: '질문하기', en: '전화해서 3가지 물어보기',
            gen: [{ t: 'meaning', fn: 'rpask', n: 3 }, { t: 'produce', fn: 'rpask', n: 3 }, { t: 'match', fn: 'rpask', n: 1 }] },
          { id: 'o24', icon: '🛠️', ko: '문제 해결', en: '사과만 하지 말고 대안을 낸다',
            gen: [{ t: 'meaning', fn: 'rpfix', n: 3 }, { t: 'produce', fn: 'rpfix', n: 3 }, { t: 'match', fn: 'rpfix', n: 1 }] },
          { id: 'o25', icon: '🧱', ko: '롤플레이 구조', en: '질문형 · 해결형 두 가지 틀',
            gen: [{ t: 'scenario', id: 'sc-rp-ask' }, { t: 'scenario', id: 'sc-rp-fix' }, { t: 'produce', fn: 'rpask', n: 2 }, { t: 'produce', fn: 'rpfix', n: 2 }] },
          { id: 'o26', icon: '🏆', ko: '롤플레이 점검', en: '유닛 6 종합', boss: true,
            gen: [{ t: 'meaning', fn: 'rpask', n: 2 }, { t: 'meaning', fn: 'rpfix', n: 2 }, { t: 'produce', fn: 'rpask', n: 2 }, { t: 'produce', fn: 'rpfix', n: 2 }] },
        ],
      },
      {
        ko: '콩글리시 탈출',
        en: 'Konglish Cleanup',
        color: '#EF4444',
        lessons: [
          { id: 'o27', icon: '🚫', ko: '이대로 말해도 될까?', en: 'O / X 로 감을 잡는다',
            gen: [{ t: 'pitfall', tag: 'konglish', n: 6 }] },
          { id: 'o28', icon: '✏️', ko: '고쳐 쓰기', en: '틀린 문장을 직접 바꿔본다',
            gen: [{ t: 'fix', tag: 'konglish', n: 6 }] },
          { id: 'o29', icon: '🎭', ko: '암기 티 없애기', en: '외운 문장처럼 들리지 않게',
            gen: [{ t: 'pitfall', tag: 'short', n: 3 }, { t: 'fix', tag: 'short', n: 3 }, { t: 'produce', fn: 'filler', n: 2 }] },
          { id: 'o30', icon: '🏆', ko: '감점 점검', en: '유닛 7 종합', boss: true,
            gen: [{ t: 'pitfall', tag: 'konglish', n: 3 }, { t: 'fix', tag: 'konglish', n: 3 }, { t: 'pitfall', tag: 'tense', n: 2 }] },
        ],
      },
      {
        ko: 'AL 고득점',
        en: 'Going for AL',
        color: '#12233A',
        lessons: [
          { id: 'o31', icon: '🪜', ko: '등급 사다리', en: '같은 말을 IM2 → IH → AL 로',
            gen: [{ t: 'ladder', n: 3 }, { t: 'level', n: 3 }] },
          { id: 'o32', icon: '💎', ko: 'AL 표현', en: '가정법과 뉘앙스가 들어간 문장',
            gen: [{ t: 'meaning', lv: 3, n: 4 }, { t: 'produce', lv: 3, n: 4 }] },
          { id: 'o33', icon: '🎚️', ko: '등급 감각', en: '이 문장은 몇 등급짜리일까',
            gen: [{ t: 'level', n: 6 }] },
          { id: 'o34', icon: '🧱', ko: 'AL 답변 구조', en: '가정법 + 추상화로 닫기',
            gen: [{ t: 'scenario', id: 'sc-al' }, { t: 'scenario', id: 'sc-combo' }, { t: 'produce', lv: 3, n: 3 }] },
          { id: 'o35', icon: '🏆', ko: '최종 점검', en: '시험 전 마지막 리허설', boss: true,
            gen: [{ t: 'level', n: 2 }, { t: 'ladder', n: 1 }, { t: 'pitfall', n: 2 }, { t: 'produce', lv: 3, n: 2 }, { t: 'scenario', id: 'sc-al' }] },
        ],
      },
    ],
  },
];

export const COURSE_BY_ID = Object.fromEntries(COURSES.map(c => [c.id, c]));

export function findLesson(courseId, lessonId) {
  const course = COURSE_BY_ID[courseId];
  if (!course) return null;
  for (const unit of course.units) {
    const lesson = unit.lessons.find(l => l.id === lessonId);
    if (lesson) return { course, unit, lesson };
  }
  return null;
}
