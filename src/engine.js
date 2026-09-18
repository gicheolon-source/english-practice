// 문제 생성기.
// 데이터(표현/감점포인트/시나리오)만 있으면 레슨 문제는 여기서 전부 만들어진다.
// 화면이 아는 문제 종류는 choice / match / order 세 가지뿐이다.
//
// SRS key 규칙: `<접두사>:<id들>`
//   mn: 뜻 고르기   pr: 영어 고르기   fl: 빈칸   mt: 짝 맞추기
//   lv: 등급 감각   ld: 등급 사다리   pf: O/X   fx: 고쳐쓰기   sc: 답변 구조
// mt: 는 한 문제에 여러 표현이 섞여 있어 복습으로 되살리지 않는다.

import { PHRASES, PHRASE_BY_ID, LV, FN_BY_ID, LADDERS, LADDER_BY_ID } from '../data/phrases.js';
import { PITFALLS, PITFALL_BY_ID, TAG_BY_ID, isSentence } from '../data/pitfalls.js';
import { SCENARIOS, SCENARIO_BY_ID } from '../data/scenarios.js';

/* ---------------- 유틸 ---------------- */
const shuffle = a => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const sample = (a, n) => shuffle(a).slice(0, n);
const uniqBy = (a, f) => { const seen = new Set(); return a.filter(x => { const k = f(x); if (seen.has(k)) return false; seen.add(k); return true; }); };
const cut = (s, n = 40) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

function poolOf({ fn, lv } = {}) {
  let p = PHRASES;
  if (fn) p = p.filter(x => x.fn === fn);
  if (lv) p = p.filter(x => x.lv === lv);
  return p.length ? p : PHRASES;
}
const chipOf = p => `${FN_BY_ID[p.fn].emoji} ${FN_BY_ID[p.fn].ko} · ${LV[p.lv].ko}`;

// 오답 보기를 고른다. 같은 기능 안에서 먼저 찾고, 모자라면 전체에서 채운다.
function distractors(p, n, key) {
  const same = PHRASES.filter(x => x.id !== p.id && x.fn === p.fn);
  const rest = PHRASES.filter(x => x.id !== p.id && x.fn !== p.fn);
  const out = uniqBy([...sample(same, n), ...sample(rest, n)], key).filter(x => key(x) !== key(p));
  return out.slice(0, n);
}

/* ---------------- 뜻 고르기 ---------------- */
function qMeaning(p) {
  const opts = shuffle([p, ...distractors(p, 3, x => x.ko)]);
  return {
    kind: 'choice', key: `mn:${p.id}`,
    chip: chipOf(p),
    prompt: '이 문장은 무슨 뜻일까요?',
    quote: p.en, say: p.en,
    options: opts.map(x => ({ id: x.id, label: x.ko })),
    answer: p.id,
    explain: `${p.en}\n→ ${p.ko}\n\n${p.note}`,
  };
}

/* ---------------- 영어 고르기 ---------------- */
function qProduce(p) {
  const opts = shuffle([p, ...distractors(p, 3, x => x.en)]);
  return {
    kind: 'choice', key: `pr:${p.id}`,
    chip: chipOf(p),
    prompt: '시험장에서 이렇게 말하려면?',
    quote: p.ko,
    say: p.en,
    options: opts.map(x => ({ id: x.id, label: x.en })),
    answer: p.id,
    explain: `${p.en}\n\n${p.note}\n\n예시: ${p.ex}`,
  };
}

/* ---------------- 빈칸 채우기 ---------------- */
const STOP = new Set(['the', 'a', 'an', 'and', 'but', 'or', 'so', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'it', 'its', 'i', 'my', 'me', 'you', 'your', 'we', 'our', 'they', 'he', 'she', 'that', 'this', 'there', 'here', 'do', 'did', 'does', 'have', 'has', 'had', 'will', 'would', 'can', 'could', 'not', 'just', 'very', 'about', 'like', 'how', 'what', 'when', 'where']);

function keyWord(en) {
  const words = en.split(/\s+/).map(w => w.replace(/[^A-Za-z'-]/g, '')).filter(Boolean);
  const cand = words.filter(w => w.length >= 4 && !STOP.has(w.toLowerCase()));
  return cand.length ? cand.sort((a, b) => b.length - a.length)[0] : null;
}

function qFill(p) {
  const w = keyWord(p.en);
  if (!w) return null;
  const others = PHRASES.map(x => keyWord(x.en)).filter(x => x && x.toLowerCase() !== w.toLowerCase());
  const opts = shuffle([w, ...uniqBy(sample(others, 8), x => x.toLowerCase()).slice(0, 3)]);
  if (opts.length < 4) return null;
  return {
    kind: 'choice', key: `fl:${p.id}`,
    chip: chipOf(p),
    prompt: '빈칸에 들어갈 단어는?',
    quote: p.en.replace(new RegExp(`\\b${w}\\b`), '_____'),
    hint: p.ko,
    say: p.en,
    options: opts.map(x => ({ id: x, label: x })),
    answer: w,
    explain: `${p.en}\n→ ${p.ko}\n\n${p.note}`,
  };
}

/* ---------------- 짝 맞추기 ---------------- */
function qMatch(spec) {
  const pool = poolOf(spec);
  const picked = sample(pool, 4);
  if (picked.length < 3) return null;
  return {
    kind: 'match', key: `mt:${picked.map(p => p.id).sort().join('+')}`,
    chip: '🔗 짝 맞추기',
    prompt: '영어와 우리말을 연결하세요',
    left: shuffle(picked).map(p => ({ id: p.id, label: cut(p.en, 46) })),
    right: shuffle(picked).map(p => ({ id: p.id, label: cut(p.ko, 30) })),
    answer: picked.map(p => p.id),
    explain: picked.map(p => `${p.en}\n→ ${p.ko}`).join('\n\n'),
  };
}

/* ---------------- 등급 감각 ---------------- */
function qLevel(p) {
  return {
    kind: 'choice', key: `lv:${p.id}`,
    chip: '🎚️ 등급 감각',
    prompt: '이 문장은 어느 등급에서 나오는 답변일까요?',
    quote: p.en, say: p.en,
    options: [1, 2, 3].map(n => ({ id: String(n), label: LV[n].ko, sub: LV[n].hint })),
    answer: String(p.lv),
    explain: `[${LV[p.lv].ko}] ${LV[p.lv].hint}\n\n${p.ko}\n\n${p.note}`,
  };
}

/* ---------------- 등급 사다리 ---------------- */
function qLadder(l) {
  const items = l.steps.map((s, i) => ({ id: String(i), label: s }));
  return {
    kind: 'order', key: `ld:${l.id}`,
    chip: '🪜 등급 사다리',
    prompt: 'IM2 → IH → AL 순서로 배열하세요',
    hint: l.ko,
    say: l.steps[2],
    items: shuffle(items),
    answer: l.steps.map((_, i) => String(i)),
    explain: l.steps.map((s, i) => `[${LV[i + 1].ko}] ${s}`).join('\n\n') + `\n\n${l.note}`,
  };
}

/* ---------------- 감점 포인트 O / X ---------------- */
function qPitfall(pf) {
  const showBad = Math.random() < 0.55;
  const sentence = showBad || !isSentence(pf) ? pf.bad : pf.good;
  const ok = !(showBad || !isSentence(pf));
  return {
    kind: 'choice', key: `pf:${pf.id}`,
    chip: `${TAG_BY_ID[pf.tag].emoji} ${TAG_BY_ID[pf.tag].ko}`,
    prompt: '오픽 시험에서 이렇게 말해도 될까요?',
    quote: sentence,
    say: ok ? sentence : null,
    options: [{ id: 'ok', label: '이대로 말해도 된다', icon: '⭕' }, { id: 'no', label: '고쳐야 한다', icon: '❌' }],
    answer: ok ? 'ok' : 'no',
    explain: isSentence(pf)
      ? `❌ ${pf.bad}\n✅ ${pf.good}\n→ ${pf.ko}\n\n${pf.why}`
      : `❌ ${pf.bad}\n${pf.good}\n\n${pf.why}`,
  };
}

/* ---------------- 고쳐 쓰기 ---------------- */
function qFix(pf) {
  const pool = PITFALLS.filter(x => x.id !== pf.id && isSentence(x));
  const opts = shuffle([pf.good, ...sample(pool, 3).map(x => x.good)]);
  return {
    kind: 'choice', key: `fx:${pf.id}`,
    chip: `${TAG_BY_ID[pf.tag].emoji} ${TAG_BY_ID[pf.tag].ko}`,
    prompt: '감점되는 문장입니다. 어떻게 바꿔 말할까요?',
    quote: pf.bad,
    hint: pf.ko,
    say: pf.good,
    options: opts.map(x => ({ id: x, label: x })),
    answer: pf.good,
    explain: `❌ ${pf.bad}\n✅ ${pf.good}\n→ ${pf.ko}\n\n${pf.why}`,
  };
}

/* ---------------- 답변 구조 배열 ---------------- */
function qScenario(sc) {
  const items = sc.steps.map((s, i) => ({ id: String(i), label: cut(s.en, 58) }));
  return {
    kind: 'order', key: `sc:${sc.id}`,
    chip: '🧱 답변 구조',
    prompt: '답변하는 순서대로 배열하세요',
    hint: sc.goal,
    items: shuffle(items),
    answer: sc.steps.map((_, i) => String(i)),
    explain: sc.steps.map((s, i) => `${i + 1}. ${s.en}\n   (${s.ko})`).join('\n') + `\n\n${sc.note}`,
  };
}

/* ---------------- 명세 -> 문제 ---------------- */
const GENERATORS = {
  meaning: s => sample(poolOf(s), s.n || 3).map(qMeaning),
  produce: s => sample(poolOf(s), s.n || 3).map(qProduce),
  fill: s => sample(poolOf(s), (s.n || 2) + 3).map(qFill).filter(Boolean).slice(0, s.n || 2),
  match: s => Array.from({ length: s.n || 1 }, () => qMatch(s)).filter(Boolean),
  level: s => sample(PHRASES, s.n || 4).map(qLevel),
  ladder: s => sample(LADDERS, s.n || 2).map(qLadder),
  pitfall: s => sample(s.tag ? PITFALLS.filter(p => p.tag === s.tag) : PITFALLS, s.n || 3).map(qPitfall),
  fix: s => sample((s.tag ? PITFALLS.filter(p => p.tag === s.tag) : PITFALLS).filter(isSentence), s.n || 3).map(qFix),
  scenario: s => [qScenario(s.id ? SCENARIO_BY_ID[s.id] : pick(SCENARIOS))].filter(Boolean),
};

export function buildLesson(lesson, dueKeys = []) {
  const qs = (lesson.gen || []).flatMap(s => GENERATORS[s.t]?.(s) || []);
  const list = uniqBy(qs, q => q.key);

  // 복습 대기 중인 항목을 최대 2개까지 섞어 넣는다.
  const extra = dueKeys.filter(k => !list.some(q => q.key === k)).slice(0, 2).map(fromKey).filter(Boolean);
  const out = shuffle(list);
  extra.forEach(q => out.splice(Math.floor(Math.random() * (out.length + 1)), 0, q));
  return out;
}

export function buildReview(keys, limit = 8) {
  return shuffle(keys.map(fromKey).filter(Boolean)).slice(0, limit);
}

// SRS key 하나로 문제를 다시 만든다. 복원할 수 없는 key 는 null.
export function fromKey(key) {
  const i = String(key).indexOf(':');
  if (i < 0) return null;
  const t = key.slice(0, i), id = key.slice(i + 1);
  const p = PHRASE_BY_ID[id];
  switch (t) {
    case 'mn': return p ? qMeaning(p) : null;
    case 'pr': return p ? qProduce(p) : null;
    case 'fl': return p ? qFill(p) : null;
    case 'lv': return p ? qLevel(p) : null;
    case 'ld': return LADDER_BY_ID[id] ? qLadder(LADDER_BY_ID[id]) : null;
    case 'pf': return PITFALL_BY_ID[id] ? qPitfall(PITFALL_BY_ID[id]) : null;
    case 'fx': return PITFALL_BY_ID[id] && isSentence(PITFALL_BY_ID[id]) ? qFix(PITFALL_BY_ID[id]) : null;
    case 'sc': return SCENARIO_BY_ID[id] ? qScenario(SCENARIO_BY_ID[id]) : null;
    default: return null; // mt: 등
  }
}

export function checkAnswer(q, given) {
  if (given == null) return false;
  if (q.kind === 'choice') return String(given) === String(q.answer);
  if (q.kind === 'order') return Array.isArray(given) && given.join('|') === q.answer.join('|');
  if (q.kind === 'match') return Object.keys(given).length === q.left.length && q.left.every(l => given[l.id] === l.id);
  return false;
}
