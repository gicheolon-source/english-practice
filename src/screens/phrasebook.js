// 내 표현집. 레슨에서 만난 표현이 여기에 쌓인다.
// 기능별 / 등급별 필터 + 즐겨찾기 + 발음 듣기.

import { el, mount, modal, speak, sayBtn } from '../ui.js';
import { PHRASES, FUNCTIONS, FN_BY_ID, LV } from '../../data/phrases.js';
import { PITFALLS, TAGS, TAG_BY_ID, isSentence } from '../../data/pitfalls.js';
import * as S from '../store.js';

let filter = { fn: 'all', onlyStar: false, onlySeen: false };
let pfFilter = 'all';
let tab = 'phrase'; // phrase | pitfall

export function renderPhrasebook(view, { go }) {
  const st = S.get();
  const seen = S.seenIds();
  view.className = 'view';
  view.innerHTML = '';

  const learned = PHRASES.filter(p => seen.has(p.id)).length;

  mount(view,
    el('div', { class: 'sec-title' }, `내 표현집 · ${learned}/${PHRASES.length}`),

    el('div', { class: 'seg' },
      ...[['phrase', `표현 ${PHRASES.length}`], ['pitfall', `감점 포인트 ${PITFALLS.length}`]].map(([id, label]) =>
        el('button', { class: 'seg-b' + (tab === id ? ' on' : ''), onclick: () => { tab = id; renderPhrasebook(view, { go }); } }, label)),
    ),
  );

  if (tab === 'pitfall') return paintPitfalls(view, go, seen);
  paintPhrases(view, go, st, seen);
}

/* ---------------- 표현 ---------------- */
function paintPhrases(view, go, st, seen) {
  const chips = el('div', { class: 'chips' });
  const chip = (id, label) => el('button', {
    class: 'fchip' + (filter.fn === id ? ' on' : ''),
    onclick: () => { filter.fn = id; renderPhrasebook(view, { go }); },
  }, label);
  chips.append(chip('all', '전체'));
  FUNCTIONS.forEach(f => chips.append(chip(f.id, `${f.emoji} ${f.ko}`)));

  const toggles = el('div', { class: 'chips', style: 'margin-top:2px' },
    el('button', {
      class: 'fchip' + (filter.onlyStar ? ' on' : ''),
      onclick: () => { filter.onlyStar = !filter.onlyStar; renderPhrasebook(view, { go }); },
    }, `⭐ 즐겨찾기 ${st.starred.length}`),
    el('button', {
      class: 'fchip' + (filter.onlySeen ? ' on' : ''),
      onclick: () => { filter.onlySeen = !filter.onlySeen; renderPhrasebook(view, { go }); },
    }, '📖 배운 것만'),
  );

  let list = PHRASES;
  if (filter.fn !== 'all') list = list.filter(p => p.fn === filter.fn);
  if (filter.onlyStar) list = list.filter(p => S.isStarred(p.id));
  if (filter.onlySeen) list = list.filter(p => seen.has(p.id));

  view.append(chips, toggles);

  if (!list.length) {
    view.append(el('div', { class: 'empty' },
      el('div', { class: 'e' }, '🔍'),
      el('p', {}, '조건에 맞는 표현이 없어요.'),
      el('button', { class: 'btn btn-primary', style: 'margin-top:16px', onclick: () => go('#/learn') }, '학습하러 가기'),
    ));
    return;
  }

  list.forEach(p => {
    const open = seen.has(p.id);
    view.append(el('div', { class: 'ph-card' + (open ? '' : ' dim') },
      el('div', { class: 'ph-main', onclick: () => open ? showPhrase(p, view, go) : lockedHint() },
        el('div', { class: 'ph-en' }, open ? p.en : '● ● ● ● ●'),
        el('div', { class: 'ph-ko' }, open ? p.ko : '레슨에서 만나면 열려요'),
        el('div', { class: 'ph-meta' },
          el('span', { class: 'tag' }, `${FN_BY_ID[p.fn].emoji} ${FN_BY_ID[p.fn].ko}`),
          el('span', { class: 'tag pol', style: `background:${LV[p.lv].color}22;color:${LV[p.lv].color}` }, LV[p.lv].ko),
        ),
      ),
      el('div', { class: 'ph-side' },
        open ? sayBtn(p.en) : null,
        el('button', {
          class: 'star' + (S.isStarred(p.id) ? ' on' : ''),
          title: '즐겨찾기',
          onclick: () => { S.toggleStar(p.id); renderPhrasebook(view, { go }); },
        }, S.isStarred(p.id) ? '⭐' : '☆'),
      ),
    ));
  });

  view.append(el('div', { style: 'height:16px' }));
}

function lockedHint() {
  modal({ emoji: '🔒', title: '아직 안 배운 표현이에요', body: '레슨에서 이 표현을 만나면 표현집이 열립니다.', actions: [{ label: '알겠어요' }] });
}

function showPhrase(p, view, go) {
  const ov = document.querySelector('#overlay');
  const box = el('div', { class: 'modal wide' },
    el('div', { class: 'ph-en big' }, p.en, sayBtn(p.en, 'say-btn lg')),
    el('div', { class: 'ph-ko big' }, p.ko),
    el('div', { class: 'ph-meta', style: 'justify-content:center' },
      el('span', { class: 'tag' }, `${FN_BY_ID[p.fn].emoji} ${FN_BY_ID[p.fn].ko}`),
      el('span', { class: 'tag pol', style: `background:${LV[p.lv].color}22;color:${LV[p.lv].color}` }, `${LV[p.lv].ko} · ${LV[p.lv].hint}`),
    ),
    el('div', { class: 'note' }, p.note),
    p.ex && el('div', { class: 'ex' }, el('div', { class: 'ex-label' }, '예문', sayBtn(p.ex)), p.ex),
    el('button', {
      class: 'btn ' + (S.isStarred(p.id) ? 'btn-primary' : 'btn-ghost'), style: 'margin-top:14px',
      onclick: () => { S.toggleStar(p.id); closeOv(); renderPhrasebook(view, { go }); },
    }, S.isStarred(p.id) ? '⭐ 즐겨찾기 해제' : '☆ 즐겨찾기에 추가'),
    el('button', { class: 'btn btn-ghost', style: 'margin-top:8px', onclick: closeOv }, '닫기'),
  );
  ov.innerHTML = ''; ov.append(box); ov.hidden = false;
  ov.onclick = e => { if (e.target === ov) closeOv(); };
  speak(p.en);
}
function closeOv() { const ov = document.querySelector('#overlay'); ov.hidden = true; ov.innerHTML = ''; }

/* ---------------- 감점 포인트 ---------------- */
function paintPitfalls(view, go, seen) {
  const chips = el('div', { class: 'chips' },
    el('button', { class: 'fchip' + (pfFilter === 'all' ? ' on' : ''), onclick: () => { pfFilter = 'all'; renderPhrasebook(view, { go }); } }, '전체'),
    ...TAGS.map(t => el('button', {
      class: 'fchip' + (pfFilter === t.id ? ' on' : ''),
      onclick: () => { pfFilter = t.id; renderPhrasebook(view, { go }); },
    }, `${t.emoji} ${t.ko}`)),
  );
  view.append(chips);

  const list = pfFilter === 'all' ? PITFALLS : PITFALLS.filter(p => p.tag === pfFilter);
  list.forEach(p => {
    const open = seen.has(p.id);
    view.append(el('div', { class: 'pf-card' + (open ? '' : ' dim'), onclick: () => open ? null : lockedHint() },
      open ? el('div', {},
        el('div', { class: 'ph-meta', style: 'margin:0 0 6px' },
          el('span', { class: 'tag' }, `${TAG_BY_ID[p.tag].emoji} ${TAG_BY_ID[p.tag].ko}`)),
        el('div', { class: 'pf-bad' }, '✕ ', p.bad),
        el('div', { class: 'pf-good' }, '○ ', p.good, isSentence(p) ? sayBtn(p.good) : null),
        el('div', { class: 'pf-ko' }, p.ko),
        el('div', { class: 'note' }, p.why),
      ) : el('div', {},
        el('div', { class: 'pf-bad' }, '● ● ● ● ●'),
        el('div', { class: 'ph-ko' }, '레슨에서 만나면 열려요'),
      ),
    ));
  });
  view.append(el('div', { style: 'height:16px' }));
}
