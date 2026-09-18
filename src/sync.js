// 선택 로그인 + 진도 클라우드 동기화.
// 로그인 안 해도 앱은 100% 동작한다. 로그인은 기기 간 진도 공유용일 뿐.
// Firebase 프로젝트는 틱톡샵 대시보드(tts-dashboard-5b16e)를 재사용하되 컬렉션은 분리한다.

import * as S from './store.js';

const CFG = {
  apiKey:            'AIzaSyCxU5UQ_B2uytJPJ2UDh1MllBNKpGInF_g',
  authDomain:        'tts-dashboard-5b16e.firebaseapp.com',
  projectId:         'tts-dashboard-5b16e',
  storageBucket:     'tts-dashboard-5b16e.firebasestorage.app',
  messagingSenderId: '348023047864',
  appId:             '1:348023047864:web:c9696aea52298563bad64d',
};
const SDK = 'https://www.gstatic.com/firebasejs/12.12.1/';
const ALLOWED_DOMAIN = 'neosimplix.com';
const COL = 'work_english';

let fb = null;          // {auth, db, a, f}
let curUser = null;
let status = 'off';     // off | loading | ready | error
let applying = false;   // 원격 진도를 로컬에 심는 중 (되밀기 방지)
let pushTimer = null;
const subs = [];

export function user() { return curUser; }
export function state() { return status; }
export function domain() { return ALLOWED_DOMAIN; }
export function subscribe(fn) { subs.push(fn); return () => { const i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); }; }
function emit() { subs.forEach(f => { try { f(curUser, status); } catch (e) { console.warn(e); } }); }

const isOk = u => !!(u && u.email && u.email.toLowerCase().endsWith('@' + ALLOWED_DOMAIN));

async function sdk() {
  if (fb) return fb;
  const [appM, authM, fsM] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-auth.js'),
    import(SDK + 'firebase-firestore.js'),
  ]);
  const app = appM.initializeApp(CFG);
  fb = { auth: authM.getAuth(app), db: fsM.getFirestore(app), a: authM, f: fsM };
  return fb;
}

/** 앱 시작 시 1회. 네트워크가 없거나 SDK 로드에 실패해도 앱은 그대로 돌아간다. */
export async function init() {
  status = 'loading'; emit();
  try { await sdk(); } catch (e) {
    console.warn('[sync] Firebase 로드 실패 — 로컬 모드로 계속', e);
    status = 'error'; emit(); return;
  }
  status = 'ready'; emit();
  fb.a.onAuthStateChanged(fb.auth, async u => {
    curUser = isOk(u) ? u : null;
    emit();
    if (curUser) { await merge(); }
  });
  S.subscribe(() => { if (!applying && curUser) schedulePush(); });
}

export async function signIn() {
  try { await sdk(); } catch (e) { return { ok: false, msg: '네트워크 연결을 확인해주세요.' }; }
  try {
    const p = new fb.a.GoogleAuthProvider();
    p.setCustomParameters({ hd: ALLOWED_DOMAIN, prompt: 'select_account' });
    const res = await fb.a.signInWithPopup(fb.auth, p);
    if (!isOk(res.user)) {
      await fb.a.signOut(fb.auth);
      return { ok: false, msg: `회사 계정(@${ALLOWED_DOMAIN})으로만 로그인할 수 있어요.` };
    }
    return { ok: true };
  } catch (e) {
    console.warn('[sync] 로그인 실패', e.code, e.message);
    const msg = e.code === 'auth/popup-closed-by-user' ? '로그인을 취소했어요.'
      : e.code === 'auth/operation-not-allowed' ? 'Firebase 콘솔에서 Google 로그인을 켜주세요.'
      : e.code === 'auth/unauthorized-domain' ? 'Firebase 승인 도메인에 이 주소를 추가해주세요.'
      : '로그인 실패: ' + (e.code || e.message);
    return { ok: false, msg };
  }
}

export async function signOutNow() {
  if (!fb) return;
  try { await fb.a.signOut(fb.auth); } catch (e) { console.warn(e); }
}

/* ---------- 진도 병합 ---------- */
// updatedAt 이 더 큰 쪽이 이긴다. 같은 계정을 두 기기에서 동시에 쓰는 경우는 가정하지 않는다.
async function merge() {
  const { doc, getDoc } = fb.f;
  const local = S.get();
  let remote = null;
  try {
    const snap = await getDoc(doc(fb.db, COL, curUser.uid));
    if (snap.exists()) remote = snap.data().v;
  } catch (e) { console.warn('[sync] 원격 진도 읽기 실패', e); return; }

  if (remote && (remote.updatedAt || 0) > (local.updatedAt || 0)) {
    applying = true;
    S.replace(remote);
    applying = false;
  } else {
    await push();
  }
  emit();
}

function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(push, 1200);
}

export async function push() {
  if (!fb || !curUser) return;
  const { doc, setDoc } = fb.f;
  const v = S.get();
  try {
    await setDoc(doc(fb.db, COL, curUser.uid), { v, ts: Date.now(), email: curUser.email });
  } catch (e) { console.warn('[sync] 진도 저장 실패', e); }
}
