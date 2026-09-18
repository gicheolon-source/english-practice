// 아주 얇은 DOM 헬퍼 + 공용 위젯

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

export function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) { if (c == null || c === false) continue; n.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return n;
}

// DOM.append 는 null 을 "null" 텍스트로 넣어버린다. 항상 이걸로 붙일 것.
export function mount(node, ...kids) {
  for (const c of kids.flat()) { if (c == null || c === false) continue; node.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return node;
}

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function go(path) { location.hash = path; }

export function modal({ emoji, title, body, actions = [] }) {
  const ov = $('#overlay');
  const box = el('div', { class: 'modal' },
    emoji && el('div', { class: 'e' }, emoji),
    el('h3', {}, title),
    body && el('p', {}, body),
    ...actions.map((a, i) => el('button', {
      class: 'btn ' + (a.kind || (i === 0 ? 'btn-primary' : 'btn-ghost')),
      style: i ? 'margin-top:8px' : '',
      onclick: () => { closeModal(); a.onClick?.(); },
    }, a.label)),
  );
  ov.innerHTML = ''; ov.append(box); ov.hidden = false;
  ov.onclick = e => { if (e.target === ov) closeModal(); };
}
export function closeModal() { const ov = $('#overlay'); ov.hidden = true; ov.innerHTML = ''; }

/* ---------------- 영어 발음 (Web Speech API) ---------------- */
// 브라우저 내장 TTS라 네트워크도 API 키도 필요 없다.
// 핵심 규칙: 영어 음성이 없으면 "차라리 말하지 않는다".
// 한국어 음성(Heami 등)으로 영어를 읽히면 발음이 완전히 망가지기 때문이다.

const SUPPORTED = 'speechSynthesis' in window;

// 위에 있을수록 미국식 원어민에 가깝고 품질이 좋은 음성이다.
const VOICE_RANK = [
  /Microsoft (Ava|Andrew|Emma|Brian|Steffan|Jenny|Guy|Aria|Michelle|Roger|Eric|Christopher)/i, // Edge Neural (US)
  /Google US English/i,
  /Samantha|Alex|Ava \(|Allison|Nathan|Joanna|Matthew/i,                                       // macOS / iOS
  /Microsoft (Zira|David|Mark)/i,                                                              // Windows SAPI (US)
];
const isEn = v => !!v.lang && /^en/i.test(v.lang);
const isUS = v => /^en[-_]US/i.test(v.lang);

let voices = [];
let loaded = false;
let chosen = null;
let forcedURI = null;               // 사용자가 직접 고른 음성
const listeners = [];

function score(v) {
  let s = isUS(v) ? 0 : 60;                       // 미국 영어 우선, 영국/호주는 뒤로
  const i = VOICE_RANK.findIndex(re => re.test(v.name));
  s += i < 0 ? 40 : i * 5;
  if (/natural|neural|online/i.test(v.name)) s -= 8; // 자연스러운 합성음 가산점
  if (!v.localService) s -= 2;
  return s;
}

function refresh() {
  if (!SUPPORTED) return;
  voices = speechSynthesis.getVoices() || [];
  if (voices.length) loaded = true;
  const en = enVoices();
  chosen = (forcedURI && en.find(v => v.voiceURI === forcedURI)) || en.slice().sort((a, b) => score(a) - score(b))[0] || null;
  listeners.forEach(fn => fn());
}

if (SUPPORTED) {
  refresh();
  speechSynthesis.addEventListener('voiceschanged', refresh);
  // Chrome 은 getVoices() 가 처음엔 비어 있고 voiceschanged 가 안 올 때도 있다.
  setTimeout(refresh, 300);
  setTimeout(refresh, 1500);
}

export function enVoices() { return voices.filter(isEn); }
export function currentVoice() { return chosen; }
export function setVoiceURI(uri) { forcedURI = uri || null; refresh(); }
export function onVoices(fn) { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; }

// 음성 목록이 아직 안 올라왔을 때는 일단 가능하다고 본다(버튼이 깜빡 사라지는 걸 막는다).
export const canSpeak = () => SUPPORTED && (!loaded || enVoices().length > 0);
// 영어 음성이 하나도 없는 상태인지. 프로필에서 안내 문구를 띄우는 데 쓴다.
export const noEnglishVoice = () => SUPPORTED && loaded && enVoices().length === 0;

export function speak(text, rate = 0.95) {
  if (!text || !SUPPORTED) return;
  if (loaded && !chosen) return; // 영어 음성 없음 -> 한국어 음성으로 읽지 않는다
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/_____/g, ' blank '));
    u.lang = chosen?.lang || 'en-US';
    u.rate = rate;
    if (chosen) u.voice = chosen;
    speechSynthesis.speak(u);
  } catch { /* 지원하지 않는 브라우저는 무시 */ }
}

// 영어 문장 옆에 붙이는 재생 버튼
export function sayBtn(text, cls = 'say-btn') {
  if (!text || !canSpeak()) return null;
  return el('button', { class: cls, title: '발음 듣기', onclick: e => { e.stopPropagation(); speak(text); } }, '🔊');
}

export function fmtMs(ms) {
  const m = Math.max(0, Math.ceil(ms / 60000));
  return m >= 60 ? `${Math.floor(m / 60)}시간 ${m % 60}분` : `${m}분`;
}
