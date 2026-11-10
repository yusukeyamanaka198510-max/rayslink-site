const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ヘッダー
const header = document.getElementById('header');
const onScroll = () => header?.classList.toggle('scrolled', scrollY > 20);

// モバイルメニュー
const burger = document.getElementById('burger');
const menu = document.getElementById('mmenu');
const setMenu = (open: boolean) => {
  burger?.setAttribute('aria-expanded', String(open));
  burger?.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  menu?.classList.toggle('open', open);
  menu?.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('lock', open);
};
burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
menu?.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// フェードイン
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-reveal],.vitem,.line-in').forEach((el) => io.observe(el));

// 円・光のパララックス（transformのみ）
const px = [...document.querySelectorAll<HTMLElement>('[data-speed]')];
// 縦タイムライン
const vtl = document.querySelector<HTMLElement>('.vtl');
let ticking = false;
const frame = () => {
  ticking = false;
  onScroll();
  if (!reduce) px.forEach((el) => {
    // 要素の親が画面中央からどれだけずれているかに比例して、ゆっくり動かす（transformのみ）
    const s = parseFloat(el.dataset.speed || '0');
    const r = (el.parentElement || el).getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) return;
    const off = r.top + r.height / 2 - innerHeight / 2;
    el.style.transform = `translate3d(0,${(off * s).toFixed(1)}px,0)`;
  });
  if (vtl) {
    const r = vtl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height));
    vtl.style.setProperty('--p', p.toFixed(3));
  }
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
frame();

// #education などのリンクで開いたとき、閉じている事業の行を開く
const openByHash = () => {
  const el = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  if (el instanceof HTMLDetailsElement) el.open = true;
};
addEventListener('hashchange', openByHash);
openByHash();
