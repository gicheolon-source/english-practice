// 진도 저장소. 지금은 localStorage 단일 소스.
// 나중에 Firebase 를 붙일 때는 save()/load() 두 함수만 갈아끼우면 된다.

const KEY = 'eng_practice_v1';

// 하트 무제한. false 로 바꾸면 예전처럼 5개 + 20분 회복으로 돌아간다.
export const HEARTS_UNLIMITED = true;
export const HEART_MAX = 5;
export const HEART_REGEN_MS = 20 * 60 * 1000; // 20분마다 1개
export const XP_PER_CORRECT = 10;
export const XP_LESSON_BONUS = 20;
export const XP_PERFECT_BONUS = 15;

const todayStr = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

function blank() {
  return {
    name: '',
    course: null,
    xp: 0,
    hearts: HEART_MAX,
    heartTs: Date.now(),
    streak: 0,
    freezes: 2,
    lastActive: null,
    dailyGoal: 50,
    dailyXp: 0,
    dailyDate: todayStr(),
    progress: {},   // `${courseId}/${lessonId}` -> {done, best, stars, plays}
    srs: {},        // key -> {ef, iv, due, reps, lapses}
    starred: [],    // 즐겨찾기한 표현 id
    voiceURI: null, // 직접 고른 TTS 음성 (null 이면 자동 선택)
    updatedAt: Date.now(),
  };
}

let state = load();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    return Object.assign(blank(), JSON.parse(raw));
  } catch { return blank(); }
}

export function save() {
  state.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('save failed', e); }
  onChange.forEach(fn => fn(state));
}

const onChange = [];
export function subscribe(fn) { onChange.push(fn); return () => { const i = onChange.indexOf(fn); if (i >= 0) onChange.splice(i, 1); }; }

export function get() { regenHearts(); rollDay(); return state; }
export function reset() { state = blank(); save(); }

// 원격 진도를 그대로 덮어쓴다. updatedAt 을 건드리지 않으려고 save() 를 안 쓴다.
export function replace(next) {
  state = Object.assign(blank(), next);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('replace failed', e); }
  onChange.forEach(fn => fn(state));
}

/* ---------- 하트 ---------- */
function regenHearts() {
  if (HEARTS_UNLIMITED) { state.hearts = HEART_MAX; state.heartTs = Date.now(); return; }
  if (state.hearts >= HEART_MAX) { state.heartTs = Date.now(); return; }
  const gained = Math.floor((Date.now() - state.heartTs) / HEART_REGEN_MS);
  if (gained > 0) {
    state.hearts = Math.min(HEART_MAX, state.hearts + gained);
    state.heartTs = state.hearts >= HEART_MAX ? Date.now() : state.heartTs + gained * HEART_REGEN_MS;
  }
}
export function heartMsLeft() {
  regenHearts();
  if (state.hearts >= HEART_MAX) return 0;
  return HEART_REGEN_MS - (Date.now() - state.heartTs);
}
export function loseHeart() {
  if (HEARTS_UNLIMITED) return HEART_MAX;
  regenHearts(); if (state.hearts > 0) { if (state.hearts === HEART_MAX) state.heartTs = Date.now(); state.hearts--; } save(); return state.hearts;
}
export function refillHearts() { state.hearts = HEART_MAX; state.heartTs = Date.now(); save(); }

/* ---------- 스트릭 / 일일목표 ---------- */
function rollDay() {
  const t = todayStr();
  if (state.dailyDate !== t) { state.dailyDate = t; state.dailyXp = 0; }
  // 스트릭 끊김 판정
  if (state.lastActive) {
    const gap = daysBetween(state.lastActive, t);
    if (gap > 1) {
      if (state.freezes > 0 && gap === 2) { state.freezes--; state.lastActive = todayStr(new Date(Date.now() - 86400000)); }
      else if (gap > 1) { state.streak = 0; }
    }
  }
}
function touchStreak() {
  const t = todayStr();
  if (state.lastActive === t) return;
  const gap = state.lastActive ? daysBetween(state.lastActive, t) : 999;
  state.streak = gap === 1 ? state.streak + 1 : 1;
  state.lastActive = t;
}

/* ---------- XP ---------- */
export function addXp(n) {
  state.xp += n;
  state.dailyXp += n;
  touchStreak();
  save();
}
export const level = () => Math.floor(Math.sqrt(state.xp / 60)) + 1;
export const levelXp = () => {
  const l = level();
  const cur = (l - 1) ** 2 * 60, next = l ** 2 * 60;
  return { cur: state.xp - cur, need: next - cur, pct: Math.min(100, ((state.xp - cur) / (next - cur)) * 100) };
};

/* ---------- 레슨 진도 ---------- */
const pkey = (c, l) => `${c}/${l}`;
export function lessonState(courseId, lessonId) { return state.progress[pkey(courseId, lessonId)] || null; }
export function completeLesson(courseId, lessonId, { correct, total }) {
  const k = pkey(courseId, lessonId);
  const stars = total === 0 ? 0 : correct === total ? 3 : correct / total >= 0.8 ? 2 : 1;
  const prev = state.progress[k] || { plays: 0, stars: 0, best: 0 };
  state.progress[k] = { done: true, plays: prev.plays + 1, stars: Math.max(prev.stars, stars), best: Math.max(prev.best, correct), lastAt: Date.now() };
  save();
  return state.progress[k];
}
export function isUnlocked(course, unitIdx, lessonIdx) {
  if (unitIdx === 0 && lessonIdx === 0) return true;
  const units = course.units;
  let prev;
  if (lessonIdx > 0) prev = units[unitIdx].lessons[lessonIdx - 1];
  else prev = units[unitIdx - 1].lessons[units[unitIdx - 1].lessons.length - 1];
  return !!lessonState(course.id, prev.id)?.done;
}
export function courseProgress(course) {
  const all = course.units.flatMap(u => u.lessons);
  const done = all.filter(l => lessonState(course.id, l.id)?.done).length;
  return { done, total: all.length, pct: all.length ? (done / all.length) * 100 : 0 };
}

/* ---------- 표현 즐겨찾기 ---------- */
export function isStarred(id) { return state.starred.includes(id); }
export function toggleStar(id) {
  const i = state.starred.indexOf(id);
  if (i >= 0) state.starred.splice(i, 1); else state.starred.push(id);
  save();
  return i < 0;
}

// 레슨에서 한 번이라도 만난 표현 id 집합 (SRS key 의 뒷부분)
export function seenIds() {
  return new Set(Object.keys(state.srs).flatMap(k => {
    const [, id] = k.split(':');
    return id ? id.split('+') : [];
  }));
}

/* ---------- SRS (SM-2 lite) ---------- */
export function gradeItem(key, ok) {
  const now = Date.now();
  const it = state.srs[key] || { ef: 2.5, iv: 0, due: now, reps: 0, lapses: 0 };
  if (ok) {
    it.reps++;
    it.iv = it.reps === 1 ? 1 : it.reps === 2 ? 3 : Math.round(it.iv * it.ef);
    it.ef = Math.max(1.3, it.ef + 0.1);
  } else {
    it.reps = 0; it.lapses++; it.iv = 0;
    it.ef = Math.max(1.3, it.ef - 0.25);
  }
  it.due = now + Math.max(10 * 60 * 1000, it.iv * 86400000); // 틀리면 10분 뒤 재등장
  state.srs[key] = it;
}
export function dueKeys(limit = 20) {
  const now = Date.now();
  return Object.entries(state.srs)
    .filter(([, v]) => v.due <= now && v.reps < 6)
    .sort((a, b) => a[1].due - b[1].due)
    .slice(0, limit)
    .map(([k]) => k);
}
export function dueCount() { return dueKeys(999).length; }

/* ---------- 프로필 ---------- */
export function setCourse(id) { state.course = id; save(); }
export function setName(n) { state.name = n; save(); }
export function setDailyGoal(n) { state.dailyGoal = n; save(); }
export function setVoiceURI(uri) { state.voiceURI = uri || null; save(); }
