// iOS 홈 화면 추가 안내 배너.
// 안드로이드/크롬은 브라우저가 알아서 설치 배너를 띄우니 여기서는 iOS 만 다룬다.

import { el } from './ui.js';

const KEY = 'ra_a2hs_dismissed';
const SHARE_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';

// iPadOS 13+ 는 UA 가 Macintosh 로 나와서 터치 지원 여부로 걸러야 한다.
export const isIOS = (ua, touch) => /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && touch > 1);
// iOS 브라우저는 전부 WebKit 이지만 '홈 화면에 추가'는 Safari 에서만 제대로 된다.
export const isNotSafari = ua => /CriOS|FxiOS|EdgiOS|OPiOS|Whale|FBAN|FBAV|Instagram|KAKAOTALK|Line\/|NAVER|DaumApps/i.test(ua);

const notSafari = isNotSafari(navigator.userAgent);
const installed = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;

function dismiss(bar) {
  try { localStorage.setItem(KEY, '1'); } catch (e) { console.warn(e); }
  bar.classList.remove('up');
  setTimeout(() => bar.remove(), 260);
}

export function show(other = notSafari) {
  const bar = el('div', { class: 'a2hs' });
  const close = el('button', { class: 'a2hs-x', 'aria-label': '닫기', onclick: () => dismiss(bar) }, '✕');

  if (other) {
    const copy = el('button', {
      class: 'a2hs-cta',
      onclick: async () => {
        try { await navigator.clipboard.writeText(location.href); copy.textContent = '복사됨!'; }
        catch (e) { copy.textContent = location.host; }
        setTimeout(() => { copy.textContent = '주소 복사'; }, 2000);
      },
    }, '주소 복사');
    bar.append(
      el('div', { class: 'a2hs-ic' }, '🧭'),
      el('div', { class: 'a2hs-txt' },
        el('b', {}, 'Safari로 열면 앱으로 설치돼요'),
        el('span', {}, '이 브라우저에서는 홈 화면에 추가할 수 없어요.'),
      ),
      copy, close,
    );
  } else {
    bar.append(
      el('div', { class: 'a2hs-ic' }, '📲'),
      el('div', { class: 'a2hs-txt' },
        el('b', {}, '홈 화면에 추가하면 앱처럼 써요'),
        el('span', {}, '아래 ', el('i', { class: 'a2hs-share', html: SHARE_ICON }), ' 공유 버튼 → ‘홈 화면에 추가’'),
      ),
      close,
    );
  }

  document.body.append(bar);
  requestAnimationFrame(() => bar.classList.add('up'));
}

export function initA2HS() {
  if (!isIOS(navigator.userAgent, navigator.maxTouchPoints) || installed) return;
  try { if (localStorage.getItem(KEY) === '1') return; } catch (e) { return; }
  // 첫 화면이 그려진 뒤에 올라오도록 살짝 늦춘다.
  setTimeout(show, 1600);
}
