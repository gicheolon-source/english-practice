import { el, mount, modal } from '../ui.js';
import { COURSES } from '../../data/courses.js';
import * as S from '../store.js';

export function renderCourses(view, { go }) {
  const st = S.get();
  view.className = 'view plain';
  view.innerHTML = '';
  mount(view,
    el('div', { class: 'hero' },
      el('div', { class: 'mascot' }, '🧑‍💼'),
      el('h1', {}, 'OPIc Coach'),
      el('p', {}, '한국인 직장인을 위한 오픽 자격증 대비 트레이너'),
    ),
    el('div', { class: 'sec-title' }, '코스 선택'),
    ...COURSES.map(c => {
      const ready = c.units.length > 0;
      const p = S.courseProgress(c);
      return el('button', {
        class: 'course-card' + (ready ? '' : ' dim'),
        onclick: () => {
          if (!ready) return modal({ emoji: '🚧', title: '준비 중인 코스예요', body: `${c.name_ko} 코스는 다음 업데이트에서 열립니다.`, actions: [{ label: '알겠어요' }] });
          S.setCourse(c.id); go('#/learn');
        },
      },
        el('div', { class: 'emo' }, ready ? c.emoji : '🔒'),
        el('div', { style: 'flex:1;min-width:0' },
          el('h3', {}, c.name_ko, el('span', { class: 'lang' }, ready ? '학습 가능' : '준비 중')),
          el('p', {}, c.desc_ko),
          ready ? el('div', { class: 'goal', style: 'height:8px;margin:8px 0 0' }, el('i', { style: `width:${p.pct}%;background:${c.color}` })) : null,
          ready ? el('p', { style: 'margin-top:4px;font-size:11px' }, `${p.done} / ${p.total} 레슨`) : null,
        ),
      );
    }),
    st.course && el('button', { class: 'btn btn-ghost', style: 'margin-top:8px', onclick: () => go('#/learn') }, '← 돌아가기'),
  );
}
