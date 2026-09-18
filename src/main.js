import { $, el, go, setVoiceURI } from './ui.js';
import * as S from './store.js';
import { COURSE_BY_ID } from '../data/courses.js';
import { renderCourses } from './screens/courses.js';
import { renderLearn } from './screens/learn.js';
import { renderLesson, renderReview } from './screens/lesson.js';
import { renderPhrasebook } from './screens/phrasebook.js';
import { renderProfile } from './screens/profile.js';
import * as Sync from './sync.js';
import * as A2HS from './a2hs.js';

const view = $('#view');
const topbar = $('#topbar');
const tabbar = $('#tabbar');

const TABS = [
  { id: 'learn', ic: '🗺️', label: '학습', path: '#/learn' },
  { id: 'review', ic: '🔁', label: '복습', path: '#/review' },
  { id: 'book', ic: '📖', label: '표현집', path: '#/book' },
  { id: 'speaking', ic: '🎙️', label: '스피킹', href: 'speaking/' },
  { id: 'profile', ic: '🧑‍💼', label: '프로필', path: '#/profile' },
];

function chrome(show, active) {
  topbar.hidden = !show;
  tabbar.hidden = !show;
  if (!show) return;
  const st = S.get();
  const course = COURSE_BY_ID[st.course];
  topbar.innerHTML = '';
  topbar.append(
    el('button', { class: 'tb-flag', onclick: () => go('#/courses'), title: '코스 변경' }, course?.emoji || '🎯'),
    el('div', { class: 'tb-item tb-streak' }, el('span', { class: 'ic' }, '🔥'), String(st.streak)),
    el('div', { class: 'tb-item tb-gem' }, el('span', { class: 'ic' }, '💎'), String(st.xp)),
    el('div', { class: 'tb-spacer' }),
    el('div', { class: 'tb-item tb-heart' }, el('span', { class: 'ic' }, '❤️'), S.HEARTS_UNLIMITED ? '∞' : String(st.hearts)),
  );

  const due = S.dueCount();
  tabbar.innerHTML = '';
  TABS.forEach(t => tabbar.append(el('button', {
    class: 'tab' + (t.id === active ? ' on' : ''),
    onclick: () => { if (t.href) location.href = t.href; else go(t.path); },
  },
    el('span', { class: 'ic' }, t.ic, t.id === 'review' && due > 0 ? el('span', { class: 'badge' }, String(due)) : null),
    t.label,
  )));
}

function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);
  const head = parts[0] || '';
  const st = S.get();
  window.scrollTo(0, 0);

  if (!st.course && head !== 'courses') return go('#/courses');

  switch (head) {
    case 'courses':
      chrome(false);
      return renderCourses(view, { go });
    case 'lesson':
      return renderLesson(view, { go, params: parts.slice(1), chrome });
    case 'review': {
      if (S.dueCount() === 0) {
        chrome(true, 'review');
        view.className = 'view';
        view.innerHTML = '';
        view.append(el('div', { class: 'empty' },
          el('div', { class: 'e' }, '🌱'),
          el('p', {}, '지금은 복습할 항목이 없어요.'),
          el('p', { style: 'font-size:12px' }, '레슨에서 문제를 틀리면 여기에 쌓여요.'),
          el('button', { class: 'btn btn-primary', style: 'margin-top:20px', onclick: () => go('#/learn') }, '학습하러 가기'),
        ));
        return;
      }
      return renderReview(view, { go, chrome });
    }
    case 'book':
      chrome(true, 'book');
      return renderPhrasebook(view, { go });
    case 'profile':
      chrome(true, 'profile');
      return renderProfile(view, { go });
    case 'learn':
    default:
      chrome(true, 'learn');
      return renderLearn(view, { go });
  }
}

// 저장해 둔 발음 음성 복원
setVoiceURI(S.get().voiceURI);

// 디버그용
window.EP = { S, go, route, Sync, A2HS };

window.addEventListener('hashchange', route);
route();

// 선택 로그인. 로그인 상태가 바뀌면 프로필/학습 화면만 다시 그린다(레슨 중에는 건드리지 않는다).
Sync.subscribe(() => {
  const head = location.hash.replace(/^#\/?/, '').split('/')[0];
  if (head === 'profile' || head === 'learn' || head === '') route();
});
Sync.init();
A2HS.initA2HS();
