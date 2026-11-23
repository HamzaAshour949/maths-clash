/* Test helpers (harmless in the app): press buttons for a team, speed up time, check the layout. */
'use strict';
(function () {
  window.__press = function (team, what) {
    const ev = { team, src: 'test-' + team, key: true };
    if (what === 'ok') ev.ok = true;
    else if (what === 'back') ev.back = true;
    else if (what === 'buzz') ev.shoulder = true;
    else { ev.dir = what; ev.dpad = true; }
    BC.Input.emit(ev);
  };
  window.__teacher = () => BC.Input.emit({ team: null, src: 'kb', teacher: true, ok: true });
  window.__speed = (s) => { BC.speed = s; };
  window.__axis = (team, v) => { BC.Input.virtualAxis[team] = v; };
  /* lists text that overflows its box and visible widgets that overlap each other */
  window.__audit = function () {
    const out = [];
    const vis = (e) => { const s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0.05; };
    BC.$$('#screen *').forEach((e) => {
      if (!vis(e)) return;
      if ((e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2) && getComputedStyle(e).overflow === 'hidden') out.push('clipped: ' + (e.className || e.tagName) + ' "' + e.textContent.slice(0, 40) + '"');
    });
    const boxes = BC.$$('#screen .opt, #screen .qcard, #screen .medal, #screen .hud-team, #screen .timer, #screen .cluecard, #screen .cpuzzle, #screen .dialside, #screen .tside, #screen .lprompt, #screen .status, #screen .btn, #screen .ycard, #screen .bd-who, #screen .bd-tk, #screen .bd-steal, #brand').filter(vis);
    const rect = (e) => e.getBoundingClientRect();
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = rect(boxes[i]), b = rect(boxes[j]);
      if (boxes[i].contains(boxes[j]) || boxes[j].contains(boxes[i])) continue;
      if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) out.push('overlap: ' + boxes[i].className + ' × ' + boxes[j].className);
    }
    const st = BC.$('#stage').getBoundingClientRect();
    boxes.forEach((e) => { const r = rect(e); if (r.left < st.left - 1 || r.right > st.right + 1 || r.top < st.top - 1 || r.bottom > st.bottom + 1) out.push('off stage: ' + e.className); });
    return out;
  };
})();
/* every picture type of a year on one board (for checking the drawings) */
window.__gallery = function (year) {
  const list = BC.DATA[year].vis, root = BC.$('#screen');
  root.innerHTML = '';
  const cols = 4, w = BC.W / cols, h = BC.H / Math.ceil(list.length / cols);
  list.forEach((g, i) => {
    const it = g();
    const box = BC.el('div', 'abs', `<div style="position:absolute;inset:6px;border:1px solid #333a5c;border-radius:12px;padding:8px;display:flex;flex-direction:column"><div style="font-size:15px;color:#aab2d4;font-weight:800">${i} · ${it.ref}</div><div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center">${it.fig || it.opts.join('')}</div><div style="font-size:14px;color:#fff">${BC.math(it.q)}</div></div>`);
    Object.assign(box.style, { left: (i % cols) * w + 'px', top: Math.floor(i / cols) * h + 'px', width: w + 'px', height: h + 'px' });
    box.querySelectorAll('svg').forEach((s) => { s.style.maxHeight = '100%'; s.style.maxWidth = it.fig ? '100%' : '24%'; });
    root.appendChild(box);
  });
};
/* every kid mood on one board, and the mascots (for checking the drawings) */
window.__kids = function () {
  const root = BC.$('#screen'); root.innerHTML = '';
  BC.Crowd.setVisible(false);
  ['idle', 'happy', 'cheer', 'wow', 'sad', 'angry', 'nerv'].forEach((m, i) => {
    for (let k = 0; k < 8; k++) {
      const t = k < 4 ? 'red' : 'blue';
      const d = BC.el('div', `kid ${t} m-${m}`, BC.Art.kid(BC.Art.randomKid(t, k + 1, i)));
      Object.assign(d.style, { left: 30 + k * 150 + 'px', top: 30 + i * 150 + 'px', width: '120px', height: '146px' });
      d.style.setProperty('--d', '0s'); d.style.setProperty('--w', '0.6s'); d.style.setProperty('--p', '1.8s');
      root.appendChild(d);
    }
    root.appendChild(BC.el('div', 'abs', `<span style="font:800 26px Nunito;color:#fff">${m}</span>`)).style.cssText = `left:1240px;top:${90 + i * 150}px`;
  });
  ['idle', 'cheer', 'sad', 'wow'].forEach((m, i) => {
    const d = BC.el('div', `mascot ${i % 2 ? 'blue' : 'red'} m-${m}`, BC.Art.brain(i % 2 ? 'blue' : 'red'));
    Object.assign(d.style, { left: 1380 + (i % 2) * 260 + 'px', top: 40 + Math.floor(i / 2) * 460 + 'px', width: '250px', height: '297px' });
    root.appendChild(d);
  });
};
/* jump straight into one round (no reading time): __mode('tug', 6) */
window.__mode = async function (key, year) {
  const M = BC.Match, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  if (BC.App.name === 'match') { M.abort(); await sleep(150); }
  BC.settings.mode = 'rounds'; BC.settings.rounds = Object.fromEntries(M.ORDER.map((k) => [k, k === key]));
  BC.settings.read = 0;
  BC.App.year = year || 5;
  BC.App.go('match');
  await sleep(3300); __teacher(); await sleep(1800);
  return BC.__audit ? BC.__audit() : window.__audit();
};
/* jump straight into a ticket board game: __board(5) */
window.__board = async function (year, tickets) {
  const M = BC.Match, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  if (BC.App.name === 'match') { M.abort(); await sleep(150); }
  BC.settings.mode = 'board'; BC.settings.read = 0; BC.settings.tickets = tickets || 12;
  BC.App.year = year || 5;
  BC.App.go('match');
  await sleep(3300); __teacher(); await sleep(2200);
  return window.__audit();
};
/* zoom the board onto a point to inspect drawings: __zoom(x, y, scale); __zoom() puts it back */
window.__zoom = function (x, y, s) {
  if (x == null) { BC.fitStage(); return; }
  BC.$('#stage').style.transform = `translate(calc(-50% + ${(BC.W / 2 - x) * s}px), calc(-50% + ${(BC.H / 2 - y) * s}px)) scale(${s})`;
};
window.__crowd = (team, mood, ms) => BC.Crowd.react(team || 'both', mood || 'cheer', ms || 4000, { p: 1, spread: 0 });
window.__demos = function () {
  const root = BC.$('#screen'); root.innerHTML = '';
  const keys = Object.keys(BC.Demos);
  keys.forEach((k, i) => {
    const b = BC.el('div', 'abs', `<div style="font:800 20px Nunito;color:#aab2d4">${k}</div><div class="intro" style="position:relative;inset:auto;overflow:visible"><div class="demo" style="width:900px;height:330px;margin:0">${BC.Demos[k]()}</div></div>`);
    Object.assign(b.style, { left: (i % 2) * 960 + 20 + 'px', top: Math.floor(i / 2) * 268 + 4 + 'px', transform: 'scale(.72)', transformOrigin: '0 0' });
    root.appendChild(b);
  });
};

/* jump straight into the tie-break (best of 5): __tiebreak(5). The board game is skipped, so both teams are level on 0. */
window.__tiebreak = async function (year) {
  const M = BC.Match, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  if (BC.App.name === 'match') { M.abort(); await sleep(150); }
  BC.settings.mode = 'board'; BC.settings.read = 0;
  BC.App.year = year || 5;
  const real = BC.Modes.board; BC.Modes.board = async () => {};
  BC.App.go('match');
  await sleep(3300); __teacher(); await sleep(1800);
  BC.Modes.board = real;
  return 'tie-break';
};

/* __qaudit(year): draw every kind of question the ticket board and the tie-break can ask, on the real layout, with the answer rings of BOTH teams on,
   and report anything that touches: a ring against the question card, another tile, the logo box, the info boxes, the timer or the score plates. Run it inside a match. */
window.__qaudit = async function (year, per, boards) {
  const M = BC.Match, UI = BC.UI, run = M.run, S = run.stageEl, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const items = [];
  const nU = BC.Graded.UNITS[year].length;
  for (let u = 0; u < nU; u++) for (let L = 1; L <= 5; L++) { const mk = BC.Graded.makers(year, u, L); mk.forEach((f) => { for (let k = 0; k < (per == null ? 2 : per); k++) { try { const it = f(); if (it) items.push(it); } catch (e) { /* skip */ } } }); }
  for (let n = 0; n < (boards || 0); n++) { const b = BC.Board.make(year); b.cats.forEach((c) => c.tickets.forEach((t) => { const it = BC.Board.ask(year, t); if (it) items.push(it); })); }      // the real board questions (book pool + puzzles + graded)
  const st = BC.$('#stage').getBoundingClientRect(), k = st.width / BC.W;
  const grow = (r, g) => { const gx = typeof g === 'number' ? g : g[0], gy = typeof g === 'number' ? g : g[1]; return { left: r.left - gx, right: r.right + gx, top: r.top - gy, bottom: r.bottom + gy }; };
  const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  const bad = [], seen = new Set();
  for (const it of items) {
    run.clear();
    const opts = it.opts.slice();
    const card = UI.qcard(S, it.q, it.ref, run.data.book, it.fig);
    const dm = UI.diamond(S, opts, 'nogl');
    const info = BC.el('div', 'bd-who tb', '<b>TIE-BREAK</b><span>ROUND 1 · BOTH TEAMS</span>');
    const info2 = BC.el('div', 'bd-tk tbs', '<span class="u">FIRST TO 3 ROUNDS</span><span class="tb-dots"><i></i></span><span class="tb-sc"><b class="r">0</b><i>–</i><b class="b">0</b></span>');
    S.append(info, info2);
    const all = BC.$$('#screen .opt, #screen .qcard, #screen .bd-who, #screen .bd-tk');
    gsap.killTweensOf(all); gsap.set(all, { clearProps: 'all' });
    await sleep(30); dm.fit(); await sleep(30);
    if (!card.isConnected || !card.offsetWidth) continue;        // the match cleared the stage under us: skip
    const brand = BC.$('#brand').getBoundingClientRect();
    const hud = BC.$$('.hud-team').map((e) => e.getBoundingClientRect());
    for (const combo of [['up', 'left'], ['right', 'down'], ['left', 'left'], ['up', 'up'], ['down', 'right']]) {
      dm.select(null); dm.select(combo[0], 'red'); dm.select(combo[1], 'blue');
      const both = combo[0] === combo[1];
      const tiles = BC.DIRS.map((d) => ({ d, el: dm.els[d], r: dm.els[d].getBoundingClientRect(), ringed: combo.includes(d), reach: both ? [30 * k, 22 * k] : [22 * k, 14 * k] }));
      const cr = card.getBoundingClientRect(), r1 = info.getBoundingClientRect(), r2 = info2.getBoundingClientRect();
      const note = (m) => { const key = (it.fig ? 'fig ' : 'txt ') + m; if (!seen.has(key)) { seen.add(key); bad.push(key + ' · ' + String(it.q).slice(0, 50)); (window.__qdebug = window.__qdebug || []).length < 6 && window.__qdebug.push({ m, q: String(it.q).slice(0, 60), vis: S.classList.contains('vis'), card: [cr.left, cr.top, cr.right, cr.bottom].map(Math.round), tiles: tiles.map((t) => [t.d, Math.round(t.r.left), Math.round(t.r.top), Math.round(t.r.right), Math.round(t.r.bottom)]), n: S.querySelectorAll('.opt').length, cards: S.querySelectorAll('.qcard').length }); } };
      tiles.forEach((t) => {
        const g = grow(t.r, t.ringed ? t.reach : 0);
        if (hit(g, cr)) note('ring x question card (' + t.d + ')');
        if (hit(g, grow(brand, 6 * k))) note('ring x logo (' + t.d + ')');
        if (hit(g, r1) || hit(g, r2)) note('ring x info box (' + t.d + ')');
        hud.forEach((h) => { if (hit(g, h)) note('ring x score plate (' + t.d + ')'); });
        if (t.r.bottom + (t.ringed ? t.reach[1] : 0) > st.bottom - 8 * k) note('too low (' + t.d + ')');
        const ot = t.el.querySelector('.ot'); if (ot.scrollHeight > ot.clientHeight + 2 || ot.scrollWidth > ot.clientWidth + 2) note('answer text clipped (' + t.d + ')');
      });
      tiles.forEach((a, i) => tiles.forEach((b, j) => { if (j > i && (a.ringed || b.ringed) && hit(grow(a.r, a.ringed ? a.reach : 0), grow(b.r, b.ringed ? b.reach : 0))) note('ring x tile (' + a.d + ',' + b.d + ')'); }));
      const qt = card.querySelector('.qt'); if (qt.scrollHeight > qt.clientHeight + 2) note('question text clipped');
    }
  }
  run.clear();
  return { checked: items.length, withFig: items.filter((i) => i.fig).length, problems: bad };
};

/* __ask(year, key, selectDir, selectTeam): show one particular ticket question on the real answer layout (for the tutorial video).
   key is a pool key: 'c0'..'c5' Clue cracker, 'k0'..'k13' Crack the code, 'b3' a book question, 'v2' a picture, or any text found in the question.
   Run it inside a match, e.g. after await __board(5, 12). Example: await __ask(5, 'c5', 'left', 'red') */
window.__ask = async function (year, key, dir, team) {
  const M = BC.Match, UI = BC.UI, run = M.run, S = run.stageEl, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let it = null;
  for (let n = 0; n < 400 && !it; n++) {
    const b = BC.Board.make(year);
    b.cats.forEach((c) => c.tickets.forEach((t) => { if (!it && t.src.key === key) it = t.src.make(); }));
  }
  if (!it) { for (let u = 0; u < BC.Graded.UNITS[year].length && !it; u++) for (let L = 1; L <= 5 && !it; L++) BC.Graded.makers(year, u, L).forEach((f) => { if (!it) { const x = f(); if (x && String(x.q).includes(key)) it = x; } }); }
  if (!it) return 'not found: ' + key;
  run.clear();
  if (team) BC.setTurn(team);
  UI.qcard(S, it.q, it.ref, run.data.book, it.fig);
  const dm = UI.diamond(S, it.opts, 'nogl'); dm.enter();
  await sleep(900); dm.fit();
  if (dir && team) dm.select(dir, team);
  return it.q;
};

/* __mini(game, year, unit, level, team): put one mini game on the real board layout and return it. game: jars flag flagf dial shape plot pens.
   Then play it: __mg.g.solve() puts the right answer in, __press(team,'ok') locks it in; __mg.g.wrong() puts a wrong one in. Run it inside a match (after await __board(5, 12)). */
window.__mini = async function (game, year, unit, level, team) {
  const M = BC.Match, UI = BC.UI, run = M.run, S = run.stageEl, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const spec = BC.Mini.make(game, year, unit, level);
  run.clear(); team = team || 'red'; BC.setTurn(team);
  const card = UI.qcard(S, spec.q, spec.ref, run.data.book, null); card.classList.add('mini');
  const inst = BC.Mini.mount(S, spec, BC.Mini.RECT, team);
  await sleep(500); inst.start();
  M.onInput = (ev) => { if (ev.team === team) inst.input(ev); };
  M.onFrame = (dt) => inst.frame(dt);
  window.__mg = inst; window.__mgcard = card;
  return { q: spec.q, bad: BC.Mini.check(spec), spec };
};

/* __mgaudit(reps): mount every mini game on the real screen, full size and half size (the tie-break), at every level, in three states (start, solved, wrong),
   and report anything outside its box, clipped, or touching the caption. Run inside a match (after await __board(5, 12)). */
window.__mgaudit = async function (reps, only) {
  const M = BC.Match, UI = BC.UI, run = M.run, S = run.stageEl, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const st = BC.$('#stage').getBoundingClientRect(), k = st.width / BC.W, out = new Set();
  const games = [['jars', 5, 0], ['jars', 5, 1], ['jars', 6, 0], ['flag', 5, 0], ['flag', 5, 1], ['flag', 6, 0], ['flagf', 6, 3], ['flagf', 6, 4], ['dial', 5, 2], ['dial', 5, 4], ['dial', 6, 1], ['dial', 6, 2], ['dial', 6, 4], ['shape', 5, 5], ['plot', 6, 5], ['pens', 5, 4], ['pens', 6, 2]];
  let n = 0;
  const paint = ['.jar', '.dg', '.lb', '.sg', '.pn-arr', '.pn-info', '.pn-list', '.axis', '.flag', '.pt'];
  for (const [game, year, unit] of games.filter((g) => !only || only.includes(g[0]))) for (let L = 1; L <= 5; L++) for (const mode of ['full', 'half']) for (let rep = 0; rep < (reps || 1); rep++) for (const state of ['start', 'solved', 'wrong']) {
    const spec = BC.Mini.make(game, year, unit, L), tag = `${game} y${year}u${unit} L${L} ${mode} ${state}`;
    const bad = BC.Mini.check(spec); if (bad.length) out.add('spec: ' + tag + ' ' + bad);
    run.clear();
    const card = UI.qcard(S, spec.q, spec.ref, run.data.book, null); card.classList.add('mini');
    const inst = BC.Mini.mount(S, spec, mode === 'full' ? BC.Mini.RECT : BC.Mini.HALF.red, 'red'); inst.start();
    if (state !== 'start') { if (state === 'solved') inst.g.solve(); else inst.g.wrong(); inst.finish(state === 'solved'); inst.reveal(state === 'solved'); }
    await sleep(380); n++;
    const A = inst.arena.getBoundingClientRect();
    inst.arena.querySelectorAll('.mg-body *').forEach((e) => {
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return;
      if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') return;
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
      const over = Math.max(A.left - r.left, r.right - A.right, A.top - r.top, r.bottom - A.bottom) / k;
      if (over > 2 && !e.classList.contains('truth')) out.add(`outside the box by ${Math.round(over)}px: ${tag} <${String(e.className.baseVal || e.className || e.tagName)}>`);
      if (e.clientWidth > 0 && e.children.length === 0 && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) && cs.overflow !== 'visible') out.add(`clipped text: ${tag} <${e.className}> "${e.textContent.slice(0, 20)}"`);
    });
    const cap = inst.arena.querySelector('.mg-cap.on');
    if (cap) { const cr = cap.getBoundingClientRect(); paint.forEach((sel) => inst.arena.querySelectorAll('.mg-body ' + sel).forEach((e) => { if (e.contains(cap) || cap.contains(e)) return; const r = e.getBoundingClientRect(); if (r.width && r.left < cr.right && cr.left < r.right && r.top < cr.bottom - 2 && cr.top < r.bottom - 2) out.add(`caption touches ${sel}: ${tag}`); })); }
    const qt = card.querySelector('.qt'); BC.fit(qt, 54, 24); if (qt.scrollHeight > qt.clientHeight + 1) out.add(`task text clipped: ${tag} "${spec.q.slice(0, 40)}"`);
  }
  run.clear();
  return { checked: n, problems: [...out] };
};

/* __textaudit(year, boards): every board question (and mini-game task) in its question box: nothing clipped, and a clear margin between the text and the box edges. */
window.__textaudit = async function (year, boards) {
  const M = BC.Match, UI = BC.UI, run = M.run, S = run.stageEl, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const st = BC.$('#stage').getBoundingClientRect(), k = st.width / BC.W, out = new Set();
  const items = [];
  for (let n = 0; n < (boards || 4); n++) { const b = BC.Board.make(year); b.cats.forEach((c) => c.tickets.forEach((t) => { const it = BC.Board.ask(year, t); if (it) items.push(it); })); }
  let tight = 1e9, worst = '';
  for (const it of items) {
    run.clear();
    const card = UI.qcard(S, it.q, it.ref, run.data.book, it.mini ? null : it.fig);
    if (it.mini) card.classList.add('mini');
    await sleep(40);
    const qt = card.querySelector('.qt'), sp = qt.querySelector('span'), cr = card.getBoundingClientRect();
    if (qt.scrollHeight > qt.clientHeight + 1 || qt.scrollWidth > qt.clientWidth + 1) out.add('clipped: ' + String(it.q).slice(0, 60));
    const rg = document.createRange(); rg.selectNodeContents(sp); const rr = rg.getBoundingClientRect();
    const gap = Math.min(rr.left - cr.left, cr.right - rr.right, rr.top - cr.top, cr.bottom - rr.bottom) / k;
    if (gap < tight) { tight = gap; worst = String(it.q).slice(0, 70); }
    if (gap < 22) out.add(`text ${Math.round(gap)}px from the box edge: ${String(it.q).slice(0, 60)}`);
  }
  run.clear();
  return { checked: items.length, tightest: Math.round(tight), worst, problems: [...out].slice(0, 25) };
};
