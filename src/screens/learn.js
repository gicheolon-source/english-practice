import { el, modal, fmtMs } from '../ui.js';
import { COURSE_BY_ID } from '../../data/courses.js';
import * as S from '../store.js';

const WAVE = [0, 42, 62, 42, 0, -42, -62, -42];

export function renderLearn(view, { go }) {
  const st = S.get();
  const course = COURSE_BY_ID[st.course];
  if (!course) return go('#/courses');

  view.className = 'view';
  view.innerHTML = '';

  const due = S.dueCount();
  if (due > 0) {
    view.append(el('button', {
      class: 'course-card', style: 'border-color:var(--violet);box-shadow:0 4px 0 var(--violet)',
      onclick: () => go('#/review'),
    },
      el('div', { class: 'emo', style: 'background:#F3EBFF' }, '🔁'),
      el('div', { style: 'flex:1' },
        el('h3', {}, '복습할 항목이 있어요'),
        el('p', {}, `틀렸던 ${due}개 항목이 복습 시점이에요. 지금 하면 확실히 남습니다.`),
      ),
    ));
  }

  let flat = 0;
  course.units.forEach((unit, ui) => {
    const lessons = unit.lessons;
    const doneCount = lessons.filter(l => S.lessonState(course.id, l.id)?.done).length;
    view.append(el('div', { class: 'unit-head', style: `background:${unit.color}` },
      el('div', { class: 'u-n' }, ui + 1),
      el('h2', {}, unit.ko),
      el('p', {}, `${unit.en} · ${doneCount}/${lessons.length}`),
    ));

    const path = el('div', { class: 'path' });
    let firstOpen = true;
    lessons.forEach((l, li) => {
      const state = S.lessonState(course.id, l.id);
      const unlocked = S.isUnlocked(course, ui, li);
      const cls = state?.done ? 'done' : unlocked ? 'open' : 'locked';
      const isCurrent = unlocked && !state?.done && firstOpen;
      if (isCurrent) firstOpen = false;

      const node = el('button', {
        class: `node ${cls}${l.boss ? ' boss' : ''}`,
        disabled: !unlocked,
        onclick: () => openLesson(course, l, unlocked, go),
      },
        state?.done ? el('span', { class: 'stars' }, '⭐'.repeat(state.stars)) : null,
        l.boss && !state?.done ? '🏆' : l.icon,
        el('span', { class: 'label' }, l.ko),
      );

      path.append(el('div', {
        class: 'node-row',
      }, el('div', { class: 'node-wrap' + (isCurrent ? ' cur' : ''), style: `transform:translateX(${WAVE[flat % WAVE.length]}px)` }, node)));
      flat++;
    });
    view.append(path);
  });

  view.append(el('div', { style: 'height:20px' }));
}

function openLesson(course, lesson, unlocked, go) {
  const st = S.get();
  if (!unlocked) {
    modal({ emoji: '🔒', title: '아직 잠겨 있어요', body: '앞의 레슨을 먼저 끝내면 열립니다.', actions: [{ label: '알겠어요' }] });
    return;
  }
  if (st.hearts <= 0) {
    modal({
      emoji: '💔', title: '하트가 없어요',
      body: `${fmtMs(S.heartMsLeft())} 뒤에 하트가 하나 회복됩니다.`,
      actions: [{ label: '기다릴게요' }, { label: '지금 채우기 (연습용)', kind: 'btn-ghost', onClick: () => { S.refillHearts(); go(`#/lesson/${course.id}/${lesson.id}`); } }],
    });
    return;
  }
  const prev = S.lessonState(course.id, lesson.id);
  modal({
    emoji: lesson.icon,
    title: lesson.ko,
    body: prev?.done ? `이미 완료했어요 (${'⭐'.repeat(prev.stars)}). 다시 풀면 XP를 더 받습니다.` : lesson.en,
    actions: [{ label: '시작하기', onClick: () => go(`#/lesson/${course.id}/${lesson.id}`) }, { label: '나중에', kind: 'btn-ghost' }],
  });
}
