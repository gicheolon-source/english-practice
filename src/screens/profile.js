import { el, modal, fmtMs, enVoices, currentVoice, setVoiceURI, speak, noEnglishVoice, onVoices } from '../ui.js';
import { COURSES, COURSE_BY_ID } from '../../data/courses.js';
import * as S from '../store.js';
import * as Sync from '../sync.js';

// 로그인은 선택. 안 해도 앱은 다 쓸 수 있고, 하면 기기 간 진도가 이어진다.
function syncCard(view, go) {
  const u = Sync.user();
  const err = el('p', { style: 'font-size:12px;color:var(--rose);margin:8px 0 0;font-weight:700' });

  if (u) {
    return el('div', { class: 'card' },
      el('h3', {}, '☁️ 클라우드 동기화'),
      el('div', { class: 'kv' }, el('span', {}, '로그인'), el('span', { class: 'v' }, u.email)),
      el('p', { style: 'font-size:12px;color:var(--muted);font-weight:600;margin:6px 0 0' },
        '진도가 자동으로 저장돼요. 다른 기기에서 같은 계정으로 로그인하면 이어서 할 수 있어요.'),
      el('button', {
        class: 'btn btn-ghost', style: 'margin-top:12px',
        onclick: async () => { await Sync.signOutNow(); renderProfile(view, { go }); },
      }, '로그아웃'),
    );
  }

  const btn = el('button', {
    class: 'btn btn-primary', style: 'margin-top:12px',
    onclick: async () => {
      btn.disabled = true; btn.textContent = '로그인 중...';
      const r = await Sync.signIn();
      btn.disabled = false; btn.textContent = `Google로 로그인 (@${Sync.domain()})`;
      if (!r.ok) err.textContent = r.msg;
    },
  }, `Google로 로그인 (@${Sync.domain()})`);

  return el('div', { class: 'card' },
    el('h3', {}, '☁️ 클라우드 동기화'),
    el('p', { style: 'font-size:12.5px;color:var(--muted);font-weight:600;margin:0' },
      '지금은 이 기기에만 진도가 저장돼요. 회사 계정으로 로그인하면 다른 기기에서도 이어서 학습할 수 있어요.'),
    btn, err,
  );
}

/* ---------------- 발음 음성 고르기 ---------------- */
const FEMALE = /Ava|Emma|Jenny|Aria|Michelle|Zira|Samantha|Allison|Joanna|Ana|Sonia|Libby|Natasha|Clara|Female/i;
const MALE = /Andrew|Brian|Guy|Steffan|Roger|Eric|Christopher|David|Mark|Alex|Nathan|Matthew|Ryan|Thomas|William|Male/i;
const FLAG = l => (/^en[-_]US/i.test(l) ? '🇺🇸' : /^en[-_]GB/i.test(l) ? '🇬🇧' : /^en[-_]AU/i.test(l) ? '🇦🇺' : /^en[-_]IN/i.test(l) ? '🇮🇳' : '🌐');

function voiceLabel(v) {
  const name = v.name
    .replace(/^(Microsoft|Google)\s+/i, '')
    .replace(/\s*(Online\s*)?\(Natural\)\s*/i, '')
    .replace(/\s*-\s*English.*$/i, '')
    .trim();
  const sex = FEMALE.test(v.name) ? '여성' : MALE.test(v.name) ? '남성' : '';
  const natural = /natural|neural|google/i.test(v.name) ? ' · 자연스러움' : '';
  return `${FLAG(v.lang)} ${name}${sex ? ` (${sex})` : ''}${natural}`;
}

let unsubVoices = null;

function voiceCard(view, go) {
  if (noEnglishVoice()) {
    return el('div', { class: 'card' },
      el('h3', {}, '🔊 영어 발음'),
      el('p', { style: 'font-size:12.5px;color:var(--muted);font-weight:600;margin:0 0 10px;line-height:1.6' },
        '이 기기에 영어 음성이 설치되어 있지 않아요. 한국어 음성으로 영어를 읽으면 발음이 망가지기 때문에 재생 버튼을 숨겨 뒀습니다.'),
      el('div', { class: 'note', style: 'margin-top:0' },
        'Windows: 설정 → 시간 및 언어 → 언어 및 지역 → 언어 추가 → English (United States) → "음성" 항목 체크 후 설치. 설치 뒤 브라우저를 껐다 켜면 바로 잡힙니다. Microsoft Edge 로 열면 별도 설치 없이 자연스러운 미국 음성을 쓸 수 있어요.'),
    );
  }

  const list = enVoices().slice().sort((a, b) => a.name.localeCompare(b.name));
  if (!list.length) return el('div', { class: 'card' }, el('h3', {}, '🔊 영어 발음'), el('p', { style: 'font-size:12.5px;color:var(--muted);font-weight:600;margin:0' }, '음성 목록을 불러오는 중이에요...'));

  const cur = currentVoice();
  const sel = el('select', { class: 'vsel', onchange: e => { S.setVoiceURI(e.target.value); setVoiceURI(e.target.value); speak('Hi, I am your English tutor.'); } },
    ...list.map(v => el('option', { value: v.voiceURI, selected: cur && v.voiceURI === cur.voiceURI }, voiceLabel(v))),
  );

  return el('div', { class: 'card' },
    el('h3', {}, '🔊 영어 발음'),
    el('p', { style: 'font-size:12.5px;color:var(--muted);font-weight:600;margin:0 0 10px' },
      '마음에 안 드는 발음이면 다른 성우로 바꿔보세요. 미국 음성이 맨 위로 자동 정렬돼요.'),
    sel,
    el('button', { class: 'btn btn-ghost', style: 'margin-top:10px', onclick: () => speak('I have been working here for about three years.') }, '▶ 샘플 문장 들어보기'),
  );
}

export function renderProfile(view, { go }) {
  unsubVoices?.();
  unsubVoices = onVoices(() => { if (location.hash.includes('profile')) renderProfile(view, { go }); });

  const st = S.get();
  const lv = S.levelXp();
  view.className = 'view';
  view.innerHTML = '';

  view.append(
    el('div', { class: 'hero', style: 'padding-top:12px' },
      el('div', { class: 'mascot' }, '🧑‍💼'),
      el('h1', { style: 'font-size:22px' }, st.name || '학습자'),
      el('p', {}, `레벨 ${S.level()} · ${st.xp.toLocaleString()} XP`),
      el('div', { class: 'goal', style: 'margin:14px 0 2px' }, el('i', { style: `width:${lv.pct}%;background:var(--rose)` })),
      el('p', { style: 'font-size:11px' }, `다음 레벨까지 ${lv.need - lv.cur} XP`),
    ),

    el('div', { class: 'card' },
      el('h3', {}, '오늘의 목표'),
      el('div', { class: 'goal' }, el('i', { style: `width:${Math.min(100, (st.dailyXp / st.dailyGoal) * 100)}%` })),
      el('div', { class: 'kv' }, el('span', {}, '오늘 획득 XP'), el('span', { class: 'v' }, `${st.dailyXp} / ${st.dailyGoal}`)),
      el('div', { class: 'kv' }, el('span', {}, '목표 변경'),
        el('span', {}, ...[20, 50, 100].map(n => el('button', {
          class: 'btn btn-sm ' + (st.dailyGoal === n ? 'btn-primary' : 'btn-ghost'), style: 'margin-left:6px',
          onclick: () => { S.setDailyGoal(n); renderProfile(view, { go }); },
        }, String(n))))),
    ),

    el('div', { class: 'card' },
      el('h3', {}, '통계'),
      el('div', { class: 'kv' }, el('span', {}, '🔥 스트릭'), el('span', { class: 'v' }, `${st.streak}일`)),
      el('div', { class: 'kv' }, el('span', {}, '🧊 스트릭 프리즈'), el('span', { class: 'v' }, `${st.freezes}개`)),
      el('div', { class: 'kv' }, el('span', {}, '❤️ 하트'), el('span', { class: 'v' }, S.HEARTS_UNLIMITED ? '무제한' : st.hearts >= S.HEART_MAX ? '가득' : `${st.hearts} · ${fmtMs(S.heartMsLeft())} 후 회복`)),
      el('div', { class: 'kv' }, el('span', {}, '🔁 복습 대기'), el('span', { class: 'v' }, `${S.dueCount()}개`)),
    ),

    el('div', { class: 'card' },
      el('h3', {}, '코스 진도'),
      ...COURSES.map(c => {
        const p = S.courseProgress(c);
        return el('div', { class: 'kv' },
          el('span', {}, `${c.emoji} ${c.name_ko}`),
          el('span', { class: 'v' }, p.total ? `${p.done}/${p.total}` : '준비 중'));
      }),
      el('button', { class: 'btn btn-ghost', style: 'margin-top:12px', onclick: () => go('#/courses') }, '코스 바꾸기'),
    ),

    voiceCard(view, go),

    syncCard(view, go),

    el('div', { class: 'card' },
      el('h3', {}, '설정'),
      el('button', { class: 'btn btn-ghost', style: 'margin-bottom:8px', onclick: () => {
        const n = prompt('이름을 입력하세요', st.name || '');
        if (n != null) { S.setName(n.trim()); renderProfile(view, { go }); }
      } }, '이름 변경'),
      el('button', { class: 'btn btn-ghost', onclick: () => modal({
        emoji: '⚠️', title: '진도를 모두 지울까요?', body: '되돌릴 수 없어요.',
        actions: [{ label: '취소', kind: 'btn-ghost' }, { label: '전부 초기화', kind: 'btn-no', onClick: () => { S.reset(); go('#/courses'); } }],
      }) }, '진도 초기화'),
    ),
  );
}
