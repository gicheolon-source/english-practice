import { el, mount, modal, fmtMs, speak, sayBtn } from '../ui.js';
import { findLesson } from '../../data/courses.js';
import { buildLesson, buildReview, checkAnswer } from '../engine.js';
import * as S from '../store.js';

let ses = null;

// 한글이 섞여 있지 않으면 영어 문장으로 본다 (발음 재생 대상 판별)
const isEnglish = s => !!s && !/[\u3131-\u318E\uAC00-\uD7A3]/.test(s);

export function renderLesson(view, { go, params, chrome }) {
  const [courseId, lessonId] = params;
  const found = findLesson(courseId, lessonId);
  if (!found) return go('#/learn');
  const { lesson, course } = found;

  const qs = buildLesson(lesson, S.dueKeys(30));
  if (!qs.length) { modal({ emoji: '⚠️', title: '문제를 만들지 못했어요', actions: [{ label: '돌아가기', onClick: () => go('#/learn') }] }); return; }

  ses = { course, lesson, queue: qs, idx: 0, total: qs.length, correct: 0, wrong: 0, mistakes: new Set(), mode: 'lesson' };
  chrome(false);
  paint(view, go);
}

export function renderReview(view, { go, chrome }) {
  const st = S.get();
  const keys = S.dueKeys(30);
  if (!keys.length) { go('#/learn'); return; }
  const qs = buildReview(keys, 8);
  if (!qs.length) { go('#/learn'); return; }
  ses = { course: { id: st.course }, lesson: { id: '__review', ko: '복습' }, queue: qs, idx: 0, total: qs.length, correct: 0, wrong: 0, mistakes: new Set(), mode: 'review' };
  chrome(false);
  paint(view, go);
}

/* ---------------- 렌더 ---------------- */
function paint(view, go) {
  const q = ses.queue[ses.idx];
  const st = S.get();
  if (window.EP) window.EP.q = q; // 디버그용: 현재 문제
  view.className = 'view plain';
  view.innerHTML = '';

  view.append(el('div', { class: 'lesson-top' },
    el('button', { class: 'x', onclick: () => quit(go) }, '✕'),
    el('div', { class: 'pbar' }, el('i', { style: `width:${(ses.idx / ses.total) * 100}%` })),
    el('div', { class: 'hearts' }, '❤️', S.HEARTS_UNLIMITED ? '∞' : String(st.hearts)),
  ));

  if (!q) return finish(view, go);

  const body = el('div', { class: 'q-wrap' });
  mount(body,
    q.chip && el('div', { class: 'q-chip' }, q.chip),
    el('div', { class: 'q-prompt' }, q.prompt),
    q.quote && el('div', { class: 'q-quote' }, q.quote, isEnglish(q.quote) ? sayBtn(q.quote) : null),
    q.hint && el('div', { class: 'q-hint' }, q.hint),
  );
  // 영어를 보여주는 문제는 문제를 띄우자마자 한 번 읽어준다
  if (q.quote && isEnglish(q.quote)) speak(q.quote);

  const ctx = { given: null, locked: false };
  if (q.kind === 'choice') body.append(choiceUI(q, ctx, () => sync()));
  else if (q.kind === 'match') body.append(matchUI(q, ctx, () => sync()));
  else if (q.kind === 'order') body.append(orderUI(q, ctx, () => sync()));
  view.append(body);

  const cta = el('button', { class: 'btn btn-primary', disabled: true, onclick: () => submit(view, go, q, ctx) }, '확인');
  view.append(el('div', { class: 'cta-bar' }, cta));
  function sync() { cta.disabled = ctx.given == null || (q.kind === 'order' && ctx.given.length !== q.answer.length); }
}

function choiceUI(q, ctx, sync) {
  const wrap = el('div', { class: 'opts' });
  q.options.forEach(o => {
    const b = el('button', { class: 'opt', onclick: () => {
      if (ctx.locked) return;
      wrap.querySelectorAll('.opt').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel'); ctx.given = o.id; sync();
    } },
      o.icon && el('span', { class: 'oi' }, o.icon),
      el('span', { class: 'ol' }, o.label, o.sub && el('span', { class: 'os' }, o.sub)),
    );
    b.dataset.id = o.id;
    wrap.append(b);
  });
  ctx.reveal = ok => {
    wrap.querySelectorAll('.opt').forEach(b => {
      b.disabled = true;
      if (b.dataset.id === String(q.answer)) b.classList.add('right');
      else if (b.classList.contains('sel')) b.classList.add('wrong');
      b.classList.remove('sel');
    });
  };
  return wrap;
}

function matchUI(q, ctx, sync) {
  ctx.given = {};
  let selLeft = null;
  const wrap = el('div', { class: 'match' });
  const colL = el('div', { class: 'col' }), colR = el('div', { class: 'col' });
  let bad = false;

  const tile = (item, side) => el('button', { class: 'mtile', dataset: { id: item.id, side }, onclick: e => {
    if (ctx.locked) return;
    const t = e.currentTarget;
    if (t.classList.contains('paired')) return;
    if (side === 'l') { colL.querySelectorAll('.mtile').forEach(x => x.classList.remove('sel')); t.classList.add('sel'); selLeft = t; return; }
    if (!selLeft) return;
    if (selLeft.dataset.id === item.id) {
      selLeft.classList.remove('sel'); selLeft.classList.add('paired'); t.classList.add('paired');
      ctx.given[selLeft.dataset.id] = item.id; selLeft = null;
      if (Object.keys(ctx.given).length === q.left.length) sync();
    } else {
      bad = true; ctx.bad = true;
      t.classList.add('shake'); selLeft.classList.add('shake');
      const a = selLeft; setTimeout(() => { t.classList.remove('shake'); a.classList.remove('shake'); a.classList.remove('sel'); }, 320);
      selLeft = null;
    }
  } }, item.label);

  q.left.forEach(i => colL.append(tile(i, 'l')));
  q.right.forEach(i => colR.append(tile(i, 'r')));
  wrap.append(colL, colR);
  ctx.reveal = () => wrap.querySelectorAll('.mtile').forEach(b => (b.disabled = true));
  return wrap;
}

function orderUI(q, ctx, sync) {
  ctx.given = [];
  const slots = el('div', { class: 'order-slots' });
  const bank = el('div', { class: 'order-bank' });
  const redraw = () => {
    slots.innerHTML = '';
    ctx.given.forEach((id, i) => {
      const item = q.items.find(x => x.id === id);
      slots.append(el('button', { class: 'chip', onclick: () => { if (ctx.locked) return; ctx.given.splice(i, 1); redraw(); sync(); } },
        el('span', { class: 'n' }, String(i + 1)), item.label));
    });
    bank.querySelectorAll('.chip').forEach(c => c.classList.toggle('used', ctx.given.includes(c.dataset.id)));
    sync();
  };
  q.items.forEach(it => bank.append(el('button', { class: 'chip', dataset: { id: it.id }, onclick: () => {
    if (ctx.locked || ctx.given.includes(it.id)) return;
    ctx.given.push(it.id); redraw();
  } }, it.label)));
  ctx.reveal = () => bank.querySelectorAll('.chip').forEach(c => (c.disabled = true));
  return el('div', {}, slots, bank);
}

/* ---------------- 채점 ---------------- */
function submit(view, go, q, ctx) {
  ctx.locked = true;
  const ok = checkAnswer(q, ctx.given) && !ctx.bad;
  ctx.reveal?.(ok);
  S.gradeItem(q.key, ok);

  if (ok) {
    ses.correct++;
    S.addXp(S.XP_PER_CORRECT);
  } else {
    ses.wrong++;
    ses.mistakes.add(q.key);
    const left = S.loseHeart();
    // 틀린 문제는 뒤로 다시 보낸다
    ses.queue.push(q); ses.total = ses.queue.length;
    if (left <= 0) { showDead(go); return; }
  }

  if (q.say) speak(q.say);
  const sheet = el('div', { class: `sheet ${ok ? 'good' : 'bad'}` },
    el('div', { class: 'sheet-head' },
      el('h4', {}, ok ? '✅ 정답이에요!' : '❌ 아쉬워요'),
      q.say ? sayBtn(q.say) : null,
    ),
    q.explain && el('div', { class: 'exp' }, q.explain),
    el('button', { class: 'btn ' + (ok ? 'btn-ok' : 'btn-no'), onclick: () => { ses.idx++; paint(view, go); } }, '계속'),
  );
  view.querySelector('.cta-bar')?.remove();
  view.append(sheet);
  requestAnimationFrame(() => sheet.classList.add('up'));
}

function showDead(go) {
  modal({
    emoji: '💔', title: '하트를 다 썼어요',
    body: `${fmtMs(S.heartMsLeft())} 뒤에 하트가 회복돼요. 복습으로 다시 다져보는 것도 좋아요.`,
    actions: [{ label: '학습 화면으로', onClick: () => go('#/learn') }],
  });
}

function quit(go) {
  if (ses.idx === 0) return go('#/learn');
  modal({
    emoji: '🤔', title: '그만둘까요?', body: '지금 나가면 이 레슨의 진도는 저장되지 않아요.',
    actions: [{ label: '계속 풀기', kind: 'btn-ok' }, { label: '나가기', kind: 'btn-ghost', onClick: () => go('#/learn') }],
  });
}

/* ---------------- 결과 ---------------- */
function finish(view, go) {
  const base = ses.queue.length;
  const acc = base ? Math.round((ses.correct / base) * 100) : 0;
  const perfect = ses.wrong === 0;
  let gained = S.XP_LESSON_BONUS + (perfect ? S.XP_PERFECT_BONUS : 0);
  S.addXp(gained);

  if (ses.mode === 'lesson') S.completeLesson(ses.course.id, ses.lesson.id, { correct: ses.correct, total: base });

  view.className = 'view plain';
  view.innerHTML = '';
  view.append(el('div', { class: 'result' },
    el('div', { class: 'big' }, perfect ? '🏆' : acc >= 70 ? '🎉' : '💪'),
    el('h2', {}, perfect ? '완벽해요!' : acc >= 70 ? '레슨 완료!' : '끝까지 했어요!'),
    el('p', {}, perfect ? '한 문제도 안 틀렸어요' : `정답률 ${acc}%`),
    el('div', { class: 'stat-row' },
      el('div', { class: 'stat' }, el('div', {}, el('div', { class: 'k' }, 'XP'), el('div', { class: 'v' }, `+${gained + ses.correct * S.XP_PER_CORRECT}`))),
      el('div', { class: 'stat g' }, el('div', {}, el('div', { class: 'k' }, '정답'), el('div', { class: 'v' }, `${ses.correct}/${base}`))),
      el('div', { class: 'stat b' }, el('div', {}, el('div', { class: 'k' }, '스트릭'), el('div', { class: 'v' }, `${S.get().streak}일`))),
    ),
    ses.mistakes.size ? el('div', { class: 'card', style: 'text-align:left' },
      el('h3', {}, '🔁 복습 대기열에 담았어요'),
      el('p', { style: 'font-size:12.5px;color:var(--muted);font-weight:600;margin:0' },
        `틀린 ${ses.mistakes.size}개 항목은 나중에 자동으로 다시 나옵니다.`),
    ) : null,
    el('button', { class: 'btn btn-primary', onclick: () => go('#/learn') }, '계속하기'),
  ));
  ses = null;
}
