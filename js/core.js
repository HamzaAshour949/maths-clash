/* Maths Clash core: stage, helpers, maths text, random. Designed and built by Hamza Ashour. */
'use strict';
const BC = window.BC = {};
BC.W = 1920; BC.H = 1080;

/* ---------- DOM helpers ---------- */
BC.$ = (sel, root = document) => root.querySelector(sel);
BC.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
BC.el = function (tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
BC.wait = (ms) => new Promise((r) => BC.timers.add(setTimeout(r, ms / BC.speed)));
BC.speed = 1;
BC.timers = new Set();

/* ---------- stage scaling: one 1920 x 1080 board, letterboxed ---------- */
/* 16:9 on a wide screen, 9:16 on a tall one (or forced in Settings). The edge margin shrinks the board
   for projectors that cut off the edges of the picture. */
BC.portrait = false;
/* the real size of the page (window.innerWidth can disagree with it on some screens and emulators) */
BC.viewport = function () {
  const d = document.documentElement;
  return { w: d.clientWidth || window.innerWidth, h: d.clientHeight || window.innerHeight };
};
BC.layout = function () {
  const pref = (BC.settings && BC.settings.screen) || 'auto';
  if (pref === 'portrait' || pref === 'landscape') return pref;
  const v = BC.viewport();
  return v.h > v.w * 1.05 ? 'portrait' : 'landscape';
};
BC.fitStage = function () {
  const st = BC.$('#stage');
  if (!st) return;
  const portrait = BC.layout() === 'portrait';
  const changed = portrait !== BC.portrait;
  BC.portrait = portrait;
  BC.W = portrait ? 1080 : 1920; BC.H = portrait ? 1920 : 1080;
  document.body.classList.toggle('portrait', portrait);
  const m = 1 - 2 * ((BC.settings && BC.settings.margin) || 0) / 100;
  const v = BC.viewport();
  const s = Math.min(v.w / BC.W, v.h / BC.H) * m;
  BC.scale = s;
  st.style.transform = `translate(-50%, -50%) scale(${s})`;
  if (changed && BC.onLayout) BC.onLayout();
};
/* centre of an element in board units (for bursts and score pops) */
BC.centerOf = function (e) {
  const s = BC.$('#stage').getBoundingClientRect(), r = e.getBoundingClientRect();
  return { x: (r.left + r.width / 2 - s.left) / BC.scale, y: (r.top + r.height / 2 - s.top) / BC.scale };
};
/* moving between a Retina screen and a projector changes the pixel ratio: refit */
(function watchDpr() {
  try { matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener('change', () => { BC.fitStage(); watchDpr(); }, { once: true }); } catch (e) { /* old engine */ }
})();
window.addEventListener('resize', () => BC.fitStage());

/* ---------- random ---------- */
const R = BC.R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  },
  chance: (p) => Math.random() < p,
};

/* ---------- numbers ---------- */
BC.n = function (x) {           // 12345 -> "12,345", -8 -> "−8"
  const neg = x < 0; x = Math.abs(x);
  const [i, d] = String(x).split('.');
  const s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? '.' + d : '');
  return (neg ? '−' : '') + s;
};
BC.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
BC.lcm = (a, b) => a / BC.gcd(a, b) * b;
BC.isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };

/* Fractions: written in text as [[3/4]] or [[2 1/2]] (mixed number). */
BC.fr = (a, b) => `[[${a}/${b}]]`;
BC.mixed = function (num, den) {   // improper -> mixed markup, reduced
  const g = BC.gcd(num, den); num /= g; den /= g;
  if (den === 1) return String(num);
  const w = Math.floor(num / den), r = num - w * den;
  return w ? `[[${w} ${r}/${den}]]` : `[[${r}/${den}]]`;
};

/* Maths text -> HTML: fractions, the minus sign, blanks □ as boxes. */
BC.esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* Blanks □ are numbered in reading order; boxFn(i) can draw each one (the dials use it).
   Fractions: [[3/4]], [[2 1/2]] or ((2 + □|3 + 12)) for any numerator | denominator. */
BC.math = function (s, boxFn) {
  if (s == null) return '';
  if (typeof s === 'string' && s.startsWith('<svg')) return s;
  let i = 0;
  let h = BC.esc(String(s)).replace(/□/g, () => `\u0001${i++}\u0001`);
  const frac = (w, a, b) => `<span class="mfrac">${w ? `<span class="mw">${w}</span>` : ''}<span class="mf"><span class="mt">${a}</span><span class="mb">${b}</span></span></span>`;
  h = h.replace(/\[\[(?:(\d+) )?([^\]\/]+)\/([^\]]+)\]\]/g, (m, w, a, b) => frac(w, a, b));
  h = h.replace(/\(\((.+?)\|(.+?)\)\)/g, (m, a, b) => frac(null, a, b));
  h = h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  h = h.replace(/\u0001(\d+)\u0001/g, (m, k) => (boxFn ? boxFn(+k) : '<i class="blank"></i>'));
  return h;
};

/* Shrink text until it fits its box (no scrolling, no overflow). */
BC.fit = function (el, max, min = 22) {
  let size = max;
  el.style.fontSize = size + 'px';
  let guard = 60;
  while (guard-- > 0 && size > min && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)) {
    size -= 2;
    el.style.fontSize = size + 'px';
  }
  return size;
};

/* Settings, kept between sessions */
BC.settings = Object.assign({
  length: 'normal',     // short | normal | long
  timer: 20,            // seconds per question (buzz)
  read: 10,             // reading time before an answer timer starts
  music: false,          // v0.3: off by default (his ask); M or Settings turns it on
  screen: 'auto',       // auto | landscape (16:9) | portrait (9:16)
  margin: 0,            // % edge margin for projectors that crop
  volume: 0.8,
  look: 'flat',         // flat | outline
  mode: 'board',        // rounds (the eight rounds) | board (the ticket board). v0.2: the ticket board is the default
  tickets: 24,          // how many tickets are played in a board game: any whole number, 1 up to the whole board.
                        // v0.2: 24 (12 per team) ≈ a 20-minute competition with a real class (about 40-45 s a ticket: reading, thinking, steals)
  guard: 'off',         // ticket board, out of points: 'off' (a team with nothing can still gamble) | 'afford' (only tickets whose cost it can pay)
  auto: 5,              // v0.2: after a question, go on by itself after this many seconds (0 = wait for A / Space)
  level: 'easy',        // v0.2: 'easy' = every ticket asks a question one level easier, short texts only; 'book' = the old levels
  rounds: { buzz: true, pic: true, draw: true, line: true, code: true, flash: true, clue: true, tug: true },
}, (() => { try { return JSON.parse(localStorage.getItem('bc-settings') || '{}'); } catch (e) { return {}; } })());
/* v0.2 (23 Nov): settings saved by an older copy keep their old game and ticket count; move them once to the new competition defaults */
{ const sv = +BC.settings.sv || 0;
  if (sv < 2) { BC.settings.mode = 'board'; BC.settings.tickets = 24; BC.settings.auto = BC.settings.auto == null ? 5 : BC.settings.auto; }
  if (sv < 3) BC.settings.music = false;        /* v0.3: music off by default, once for settings saved by an older copy */
  BC.settings.sv = 3; }
/* the look: 'flat' (solid colour blocks) or 'outline' (dark shapes with a light edge) */
BC.applyLook = function () { document.body.classList.toggle('look-outline', BC.settings.look === 'outline'); };
BC.cycleLook = function () {
  BC.settings.look = BC.settings.look === 'outline' ? 'flat' : 'outline';
  BC.saveSettings(); BC.applyLook();
  if (BC.toast) BC.toast('Look: ' + (BC.settings.look === 'outline' ? 'Outline' : 'Flat'));
};
BC.saveSettings = function () { try { localStorage.setItem('bc-settings', JSON.stringify(BC.settings)); } catch (e) { /* private mode */ } };

/* Teams */
BC.TEAMS = {
  red: { id: 'red', name: 'RED', color: '#d7353b', deep: '#a3282d', glow: 'rgba(215, 53, 59,.6)' },
  blue: { id: 'blue', name: 'BLUE', color: '#2d6bcf', deep: '#1d4fa8', glow: 'rgba(45, 107, 207,.6)' },
};
BC.other = (t) => (t === 'red' ? 'blue' : 'red');
/* the teams are two classes: Red is Year 5A (or 6A), Blue is Year 5B (or 6B). BC.tn gives the name to show; BC.tshort the short one (5A). */
BC.tshort = (t) => ((BC.App && BC.App.year) || 5) + (t === 'red' ? 'A' : 'B');
BC.tn = (t) => (t === 'red' || t === 'blue' ? 'YEAR ' + BC.tshort(t) : String(t).toUpperCase());

/* Answer slots follow the controller: Y = top, X = left, B = right, A = bottom. */
BC.DIRS = ['up', 'left', 'right', 'down'];
