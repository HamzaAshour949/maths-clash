/* Maths Clash mini games for the ticket board and the tie-break. A ticket can be a little game instead of a four-answer question:
   jelly jars (place value), a flag on a number line, digit dials, a shape builder (area and perimeter), a coordinates grid, factor pens.
   Every game draws itself into any rectangle (the whole board area for one team, or one half of the screen for a speed race in the tie-break),
   is played with the d-pad / stick / arrow keys, and is locked in with A. One lock-in per try: right = the ticket, wrong or time up = no.
   A spec (made by Mini.make) is plain data, so a steal replays the same puzzle for the other team. Designed and built by Hamza Ashour. */
'use strict';
(function () {
  const { el, R } = BC;
  const Mini = BC.Mini = { games: {} };
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const num = (n) => Number(n).toLocaleString('en-US');
  const A = () => BC.Audio;
  const sfx = (n, o) => { try { A().play(n, o); } catch (e) { /* no sound */ } };

  /* where the games live on the stage (1920 x 1080), clear of the logo box in the bottom-right corner */
  Mini.RECT = { x: 240, y: 340, w: 1440, h: 580 };
  Mini.HALF = { red: { x: 40, y: 356, w: 880, h: 448 }, blue: { x: 1000, y: 356, w: 880, h: 448 } };

  /* ---------------------------------------------------------------------- the frame around every game ---------------------------------------------------------------------- */
  Mini.mount = function (parent, spec, rect, team) {
    const arena = el('div', `mg-arena ${team} wait`);
    Object.assign(arena.style, { left: rect.x + 'px', top: rect.y + 'px', width: rect.w + 'px', height: rect.h + 'px' });
    const body = el('div', 'mg-body');
    arena.appendChild(body);
    parent.appendChild(arena);
    const inst = { spec, arena, team, live: false, finished: false, result: null, onDone: null };
    const ctx = { w: rect.w - 6, h: rect.h - 6, team, done: (ok) => inst.finish(ok) };      // (the 3px border is inside the box)
    const g = inst.g = Mini.games[spec.game](spec, ctx);
    body.appendChild(g.el);
    inst.start = () => { inst.live = true; arena.classList.remove('wait'); };
    inst.input = (ev) => {
      if (!inst.live || inst.finished || ev.join) return;
      if (ev.ok) { const r = g.confirm ? g.confirm() : undefined; if (r === true || r === false) inst.finish(r); }
      else if (ev.dir && g.key) g.key(ev);
    };
    inst.frame = (dt) => { if (inst.live && !inst.finished && g.frame) g.frame(dt); };
    inst.finish = (ok) => {
      if (inst.finished) return;
      inst.finished = true; inst.result = !!ok; inst.live = false;
      arena.classList.add(ok ? 'good' : 'bad');
      if (inst.onDone) inst.onDone(!!ok);
    };
    /* reveal(ok, 'quiet'): a wrong attempt only says "Not quite" (nobody learns the answer before a steal). showSolution(): the game solves itself on the screen; returns how long it takes (ms). */
    inst.reveal = (ok, mode) => {
      arena.classList.remove('wait');
      if (ok === undefined) ok = inst.result;
      if (!ok && mode === 'quiet') { const cap = g.el.querySelector('.mg-cap'); if (cap) { cap.textContent = 'Not quite'; cap.classList.remove('g'); cap.classList.add('on', 'b'); } return; }
      if (g.reveal) g.reveal(ok);
    };
    inst.showSolution = () => { arena.classList.remove('wait', 'bad'); arena.style.opacity = 1; gsap.killTweensOf(arena); return g.show ? g.show() : (g.reveal(false), 900); };
    inst.destroy = () => { arena.remove(); };
    return inst;
  };

  /* ================================================================== 1. JELLY JARS (place value) ================================================================== */
  const ABBR = { 1: 'O', 10: 'T', 100: 'H', 1000: 'Th', 10000: 'TTh', 100000: 'HTh', 1000000: 'M', 10000000: 'TM' };
  const SHORT = { 1: '1', 10: '10', 100: '100', 1000: '1K', 10000: '10K', 100000: '100K', 1000000: '1M', 10000000: '10M' };
  const JELLY = ['#ff6b6b', '#ff9f43', '#ffd43b', '#f783ac', '#9775fa', '#4dabf7', '#3bc9db', '#e599f7'];      // no greens: green only ever means "right" after A
  Mini.games.jars = function (spec, ctx) {
    const P = spec.places, n = P.length, cnt = P.map(() => 0);
    let cur = Math.floor(n / 2);
    const jw = Math.min(n <= 4 ? 220 : n <= 5 ? 190 : 150, Math.floor((ctx.w - 40) / n) - 14), jh = Math.min(430, ctx.h - 150), ch = Math.floor((jh - 24) / 10) - 3;
    const root = el('div', 'mg-jars');
    root.style.setProperty('--jw', jw + 'px'); root.style.setProperty('--jh', jh + 'px'); root.style.setProperty('--ch', ch + 'px');
    const jars = P.map((v, i) => {
      const j = el('div', 'jar', `<div class="jh">${ABBR[v]}</div><div class="jb"></div>`);
      j.style.setProperty('--jc', JELLY[(i + (8 - n)) % 8]);
      root.appendChild(j); return j;
    });
    const cap = el('div', 'mg-cap', ''); root.appendChild(cap);
    const draw = (i, pop) => {
      const b = jars[i].querySelector('.jb');
      b.innerHTML = Array.from({ length: cnt[i] }, () => `<div class="ct">${SHORT[P[i]]}</div>`).join('');
      if (pop && cnt[i]) gsap.fromTo(b.lastElementChild, { scale: 0.4 }, { scale: 1, duration: 0.28, ease: 'back.out(1.3)' });      // a soft bounce: a bigger one poked out of the jar
    };
    const mark = () => jars.forEach((j, i) => j.classList.toggle('cur', i === cur));
    const value = () => cnt.reduce((s, c, i) => s + c * P[i], 0);
    const add = (i) => {
      if (cnt[i] < 9) { cnt[i]++; draw(i, true); sfx('move'); return; }
      if (i === 0) { gsap.fromTo(jars[0], { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1.2,.3)' }); sfx('wrong'); return; }
      // the tenth counter: all ten squish into one in the next jar to the left
      const b = jars[i].querySelector('.jb'); const kids = [...b.children];
      gsap.to(kids, { scale: 0, duration: 0.22, onComplete: () => { cnt[i] = 0; draw(i); } });
      sfx('select');
      setTimeout(() => add(i - 1), 230);
    };
    const remove = (i) => { if (cnt[i] > 0) { cnt[i]--; draw(i); sfx('move'); } else gsap.fromTo(jars[i], { x: -6 }, { x: 0, duration: 0.3 }); };
    mark();
    return {
      el: root,
      key(ev) {
        if (ev.dir === 'left') { cur = (cur + n - 1) % n; mark(); sfx('move'); }
        else if (ev.dir === 'right') { cur = (cur + 1) % n; mark(); sfx('move'); }
        else if (ev.dir === 'up') add(cur);
        else if (ev.dir === 'down') remove(cur);
      },
      confirm() { return value() === spec.target; },
      reveal(ok) { cap.innerHTML = ok ? `<b>${num(spec.target)}</b> ✔` : `You built <b>${num(value())}</b> · it was <b>${num(spec.target)}</b>`; cap.classList.add('on', ok ? 'g' : 'b'); },
      show() {                                  // the jars empty, then fill up with the right counters, one by one
        cnt.fill(0); P.forEach((_, i) => draw(i)); cur = -1; mark();
        const digs = String(spec.target).padStart(n, '0').split('').map(Number), total = digs.reduce((a, b) => a + b, 0), step = Math.min(0.1, 2.2 / Math.max(1, total));
        let t = 0.35;
        digs.forEach((d, i) => { for (let c = 0; c < d; c++) { t += step; setTimeout(() => { cnt[i]++; draw(i, true); sfx('move'); }, t * 1000); } });
        setTimeout(() => { cap.innerHTML = `<b>${num(spec.target)}</b>`; cap.classList.remove('b'); cap.classList.add('on', 'g'); }, (t + 0.3) * 1000);
        return (t + 0.6) * 1000;
      },
      solve() { String(spec.target).padStart(n, '0').split('').forEach((d, i) => { cnt[i] = +d; draw(i); }); },
      wrong() { cnt[n - 1] = (cnt[n - 1] + 1) % 9; draw(n - 1); },
    };
  };

  /* ================================================================== 2. FLAG ON A NUMBER LINE ================================================================== */
  Mini.games.flag = function (spec, ctx) {
    const root = el('div', 'mg-line');
    const PADX = 120, LW = ctx.w - 2 * PADX;
    const span = spec.max - spec.min, X = (v) => PADX + ((v - spec.min) / span) * LW;
    let ticks = '';
    const nT = Math.round(span / spec.step);
    for (let i = 0; i <= nT; i++) { const v = spec.min + i * spec.step; const big = spec.labels.some((l) => Math.abs(l - v) < spec.step / 1000); ticks += `<i class="tk${big ? ' big' : ''}" style="left:${X(v)}px"></i>`; }
    ticks += spec.labels.map((v) => `<span class="lb" style="left:${X(v)}px">${BC.math(spec.fmt === 'frac' ? spec.labelText[v] : num(v))}</span>`).join('');
    root.innerHTML = `<div class="axis" style="left:${PADX}px;width:${LW}px"></div>${ticks}<div class="truth" style="display:none"><div class="pin"></div></div>`;
    const flag = el('div', 'flag', '<div class="pole"></div><div class="pen"></div>');
    root.appendChild(flag);
    const cap = el('div', 'mg-cap', ''); root.appendChild(cap);
    let p = 0.5, hold = 0;
    const place = () => { flag.style.left = PADX + p * LW + 'px'; };
    place();
    return {
      el: root,
      frame(dt) {
        const held = BC.Input.held(ctx.team), ax = BC.Input.axis(ctx.team);
        let v = 0;
        if (held) { hold += dt; v = held * (0.025 + Math.min(hold / 1.4, 1) * 0.33); }
        else { hold = 0; v = Math.sign(ax) * ax * ax * 0.45; }
        if (v) { p = Math.min(1, Math.max(0, p + v * dt)); place(); }
      },
      key() { /* the flag moves smoothly in frame() */ },
      confirm() { return Math.abs(spec.min + p * span - spec.target) <= spec.tol; },
      reveal(ok) {
        const t = root.querySelector('.truth'); t.style.display = 'block'; t.style.left = X(spec.target) + 'px'; t.classList.add('rise');
        cap.innerHTML = ok ? 'Right on the spot ✔' : 'The green pin shows where it goes'; cap.classList.add('on', ok ? 'g' : 'b');
      },
      show() {                                  // the flag slides to the right spot and the pin appears
        const o = { p }, tp = (spec.target - spec.min) / span;
        gsap.to(o, { p: tp, duration: 1.2, ease: 'power2.inOut', onUpdate: () => { p = o.p; place(); }, onComplete: () => { p = tp; place(); this.reveal(true); cap.textContent = 'The flag goes here'; } });
        return 2000;
      },
      solve() { p = (spec.target - spec.min) / span; place(); },
      wrong() { p = p > 0.5 ? 0.1 : 0.9; place(); },
    };
  };

  /* ================================================================== 3. DIGIT DIALS ================================================================== */
  Mini.games.dial = function (spec, ctx) {
    const n = spec.answer.length, d = new Array(n).fill(0);
    let cur = 0;
    const bw = Math.min(120, Math.floor((ctx.w - 140) / (n + 2)));
    const root = el('div', 'mg-dial'); root.style.setProperty('--bw', bw + 'px');
    const boxes = d.map((_, i) => {
      const b = el('div', 'dg', '<i class="up">▲</i><b>0</b><i class="dn">▼</i>');
      if (i && (n - i) % 3 === 0 && spec.commas !== false) root.appendChild(el('div', 'dc', ','));
      root.appendChild(b); return b;
    });
    const cap = el('div', 'mg-cap', ''); root.appendChild(cap);
    const show = () => boxes.forEach((b, i) => { b.classList.toggle('cur', i === cur); b.querySelector('b').textContent = d[i]; });
    show();
    return {
      el: root,
      key(ev) {
        if (ev.dir === 'left') cur = (cur + n - 1) % n;
        else if (ev.dir === 'right') cur = (cur + 1) % n;
        else if (ev.dir === 'up') d[cur] = (d[cur] + 1) % 10;
        else if (ev.dir === 'down') d[cur] = (d[cur] + 9) % 10;
        sfx('move'); show();
      },
      confirm() { return d.every((v, i) => v === spec.answer[i]); },
      reveal(ok) { cap.innerHTML = ok ? `<b>${spec.answer.join('')}</b> ✔` : `You made <b>${d.join('')}</b> · it was <b>${spec.answer.join('')}</b>`; cap.classList.add('on', ok ? 'g' : 'b'); },
      show() {                                  // the boxes turn to the right digits, left to right
        spec.answer.forEach((v, i) => setTimeout(() => { cur = i; d[i] = v; show(); sfx('move'); }, 350 + i * 450));
        setTimeout(() => { cur = -1; show(); cap.innerHTML = `<b>${spec.answer.join('')}</b>`; cap.classList.remove('b'); cap.classList.add('on', 'g'); }, 350 + n * 450 + 200);
        return 350 + n * 450 + 700;
      },
      solve() { spec.answer.forEach((v, i) => { d[i] = v; }); show(); },
      wrong() { d[0] = (spec.answer[0] + 1) % 10; show(); },
    };
  };

  /* ================================================================== 4. SHAPE BUILDER (area and perimeter) ================================================================== */
  const GW = 18, GH = 10;
  Mini.games.shape = function (spec, ctx) {
    const cell = Math.floor(Math.min((ctx.w - 100) / GW, (ctx.h - 110) / GH));
    const root = el('div', 'mg-shape');
    const board = el('div', 'sg', '<div class="rect"></div>');
    Object.assign(board.style, { width: GW * cell + 'px', height: GH * cell + 'px', backgroundSize: `${cell}px ${cell}px` });
    root.appendChild(board);
    const cap = el('div', 'mg-cap', ''); root.appendChild(cap);
    let w = 3, h = 2;
    const rect = board.querySelector('.rect');
    rect.style.backgroundSize = `${cell}px ${cell}px`;
    const draw = () => Object.assign(rect.style, { width: w * cell + 'px', height: h * cell + 'px' });
    draw();
    const okNow = () => (spec.area == null || w * h === spec.area) && (spec.perim == null || 2 * (w + h) === spec.perim) && (!spec.longest || Math.min(w, h) === 1);
    return {
      el: root,
      key(ev) {
        if (ev.dir === 'left') w = Math.max(1, w - 1); else if (ev.dir === 'right') w = Math.min(GW, w + 1);
        else if (ev.dir === 'up') h = Math.min(GH, h + 1); else if (ev.dir === 'down') h = Math.max(1, h - 1);
        sfx('move'); draw();
      },
      confirm() { return okNow(); },
      reveal(ok) { cap.innerHTML = ok ? `${w} × ${h}: area <b>${w * h}</b>, perimeter <b>${2 * (w + h)}</b> ✔` : `Yours: ${w} × ${h} → area <b>${w * h}</b>, perimeter <b>${2 * (w + h)}</b>`; cap.classList.add('on', ok ? 'g' : 'b'); },
      show() {                                  // the rectangle grows to the right width, then the right height
        const [sw, sh] = spec.sol;
        setTimeout(() => { w = sw; draw(); sfx('move'); }, 400);
        setTimeout(() => { h = sh; draw(); sfx('move'); }, 1000);
        setTimeout(() => { cap.innerHTML = `${sw} × ${sh}: area <b>${sw * sh}</b>, perimeter <b>${2 * (sw + sh)}</b>`; cap.classList.remove('b'); cap.classList.add('on', 'g'); }, 1500);
        return 2300;
      },
      solve() { [w, h] = spec.sol; draw(); },
      wrong() { w = 1; h = 1; if (okNow()) w = 2; draw(); },
    };
  };

  /* ================================================================== 5. COORDINATES ================================================================== */
  Mini.games.plot = function (spec, ctx) {
    const lo = spec.lo, hi = spec.hi, N = hi - lo, cell = Math.floor(Math.min((ctx.w - 120) / N, (ctx.h - 150) / N));
    const S = N * cell, ox = Math.floor((ctx.w - S) / 2), oy = 44;
    const root = el('div', 'mg-plot');
    const px = (x) => ox + (x - lo) * cell, py = (y) => oy + (hi - y) * cell;
    let svg = `<svg width="${ctx.w}" height="${ctx.h}" viewBox="0 0 ${ctx.w} ${ctx.h}">`;
    for (let i = 0; i <= N; i++) {
      const v = lo + i, ax = v === 0;
      svg += `<line x1="${px(v)}" y1="${oy}" x2="${px(v)}" y2="${oy + S}" stroke="${ax ? '#fff' : 'rgba(255,255,255,.2)'}" stroke-width="${ax ? 4 : 1.5}"/><line x1="${ox}" y1="${py(v)}" x2="${ox + S}" y2="${py(v)}" stroke="${ax ? '#fff' : 'rgba(255,255,255,.2)'}" stroke-width="${ax ? 4 : 1.5}"/>`;
      const fs = Math.max(13, Math.floor(cell * 0.42));
      if (v !== 0) svg += `<text x="${px(v)}" y="${py(0) + fs + 6}" fill="#aab2d4" font-size="${fs}" font-weight="800" text-anchor="middle">${v}</text><text x="${px(0) - 8}" y="${py(v) + fs * 0.35}" fill="#aab2d4" font-size="${fs}" font-weight="800" text-anchor="end">${v}</text>`;
    }
    svg += '</svg>';
    root.innerHTML = svg;
    if (spec.start) root.appendChild(el('div', 'pt start', '')).style.cssText = `left:${px(spec.start.x)}px;top:${py(spec.start.y)}px`;
    const dot = el('div', 'pt cur', ''); root.appendChild(dot);
    const tgt = el('div', 'pt truth', ''); tgt.style.display = 'none'; root.appendChild(tgt);
    const cap = el('div', 'mg-cap', ''); root.appendChild(cap);
    let x = spec.start && spec.mode !== 'plot' ? spec.start.x : Math.max(lo, 0), y = spec.start && spec.mode !== 'plot' ? spec.start.y : Math.max(lo, 0);
    const put = () => { dot.style.left = px(x) + 'px'; dot.style.top = py(y) + 'px'; };
    put();
    return {
      el: root,
      key(ev) {
        if (ev.dir === 'left') x = Math.max(lo, x - 1); else if (ev.dir === 'right') x = Math.min(hi, x + 1);
        else if (ev.dir === 'up') y = Math.min(hi, y + 1); else if (ev.dir === 'down') y = Math.max(lo, y - 1);
        sfx('move'); put();
      },
      confirm() { return x === spec.target.x && y === spec.target.y; },
      reveal(ok) {
        tgt.style.left = px(spec.target.x) + 'px'; tgt.style.top = py(spec.target.y) + 'px'; tgt.style.display = 'block';
        tgt.classList.add('pop');
        cap.innerHTML = ok ? `(${spec.target.x}, ${spec.target.y}) ✔` : `You put it at (${x}, ${y}) · it goes at (${spec.target.x}, ${spec.target.y})`; cap.classList.add('on', ok ? 'g' : 'b');
      },
      show() {                                  // the dot travels to the right point
        const o = { x, y };
        gsap.to(o, { x: spec.target.x, y: spec.target.y, duration: 1.2, ease: 'power2.inOut', onUpdate: () => { dot.style.left = px(o.x) + 'px'; dot.style.top = py(o.y) + 'px'; }, onComplete: () => { x = spec.target.x; y = spec.target.y; put(); this.reveal(true); cap.innerHTML = `The dot goes at <b>(${spec.target.x}, ${spec.target.y})</b>`; } });
        return 2100;
      },
      solve() { x = spec.target.x; y = spec.target.y; put(); },
      wrong() { x = spec.target.x === hi ? lo : hi; put(); },
    };
  };

  /* ================================================================== 6. SHEEP PENS (factors) ================================================================== */
  /* Size a pen for N sheep exactly, like the shape builder: sheep in each row (◀ ▶) and rows (▲ ▼), then A. The tasks fix one thing
     ("3 in each row", "4 rows", "a square", "2 more in each row than rows"), so there is one answer. Both sides stay between 2 and 12 (rows up to 8). */
  const PW = 12, PH = 8;
  Mini.games.pens = function (spec, ctx) {
    const cell = Math.floor(Math.min((ctx.w - 100) / PW, (ctx.h - 120) / PH));
    const root = el('div', 'mg-pen');
    const field = el('div', 'pf', '');
    Object.assign(field.style, { width: PW * cell + 'px', height: PH * cell + 'px' });
    let cells = '';
    for (let r = 0; r < PH; r++) for (let c = 0; c < PW; c++) cells += `<i data-r="${r}" data-c="${c}" style="left:${c * cell}px;bottom:${r * cell}px;width:${cell}px;height:${cell}px"></i>`;
    field.innerHTML = cells + '<div class="fence"></div>';
    root.appendChild(field);
    const cap = el('div', 'mg-cap', ''); root.appendChild(cap);
    const fence = field.querySelector('.fence'), dots = [...field.querySelectorAll('i')];
    let w = 3, h = 2;
    const draw = () => {
      dots.forEach((d) => d.classList.toggle('on', +d.dataset.c < w && +d.dataset.r < h));
      Object.assign(fence.style, { width: w * cell + 'px', height: h * cell + 'px' });
    };
    draw();
    const okNow = () => {
      if (w * h !== spec.n) return false;
      if (spec.kind === 'perRow') return w === spec.k;
      if (spec.kind === 'rows') return h === spec.k;
      if (spec.kind === 'square') return w === h;
      if (spec.kind === 'more') return w - h === spec.k;
      return w >= 2 && h >= 2;
    };
    const say = (html, good) => { cap.innerHTML = html; cap.classList.remove('g', 'b'); cap.classList.add('on', good ? 'g' : 'b'); };
    return {
      el: root,
      key(ev) {
        if (ev.dir === 'left') w = Math.max(2, w - 1); else if (ev.dir === 'right') w = Math.min(PW, w + 1);
        else if (ev.dir === 'up') h = Math.min(PH, h + 1); else if (ev.dir === 'down') h = Math.max(2, h - 1);
        sfx('move'); draw();
      },
      confirm() { return okNow(); },
      reveal(ok) { say(ok ? `${w} in each row × ${h} rows = <b>${w * h}</b> sheep ✔` : `Yours: ${w} in each row × ${h} rows = <b>${w * h}</b> sheep`, ok); },
      show() {                                  // the pen grows to the right shape: first the sheep in each row, then the rows
        const [sw, sh] = spec.sol;
        setTimeout(() => { w = sw; draw(); sfx('move'); }, 400);
        setTimeout(() => { h = sh; draw(); sfx('move'); }, 1000);
        setTimeout(() => say(`${sw} in each row × ${sh} rows = <b>${spec.n}</b> sheep`, true), 1500);
        return 2300;
      },
      solve() { [w, h] = spec.sol; draw(); },
      wrong() { w = spec.sol[0] === 2 ? 3 : 2; h = spec.sol[1] === 2 ? 3 : 2; if (okNow()) w = 12; draw(); },
    };
  };

  /* ====================================================================== the puzzles (specs) ====================================================================== */
  const boxStr = (k) => { const a = Array(k).fill('□'); let out = ''; a.forEach((b, i) => { if (i && (k - i) % 3 === 0) out += ','; out += b; }); return out; };
  const digitsOf = (v, k) => String(v).padStart(k, '0').split('').map(Number);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* Jelly jars are hard from the first level: Year 5 builds 5- and 6-digit numbers (a millions jar in unit 2), Year 6 builds 6- and 7-digit numbers (a ten-millions jar).
     Year 5 stops at 1,000,000 and Year 6 at 10,000,000, so the very hardest ticket asks for "less than" the top number of the unit (100,000 / 1,000,000 / 10,000,000). */
  function jarsSpec(year, unit, L) {
    const tab = { 5: [[5, 5, 5, 5, 6], [6, 6, 6, 6, 7]], 6: [[7, 7, 7, 7, 8]] };
    const d = (tab[year] && tab[year][unit] || [5, 5, 5, 5, 6])[L - 1];
    const places = Array.from({ length: d }, (_, i) => 10 ** (d - 1 - i));
    const parts = (v) => String(v).split('').map((c, i, a) => ({ c: +c, p: 10 ** (a.length - 1 - i) })).filter((z) => z.c).map((z) => `${z.c} × ${num(z.p)}`).join(' + ');
    const full = d - (L === 5 ? 1 : 0);                                   // digits of an ordinary number at this level
    const mk = () => {
      const ds = Array.from({ length: full }, (_, i) => (i ? rnd(0, 9) : rnd(1, 9)));
      if (L >= 2 && full > 2) ds[rnd(1, full - 2)] = 0;
      if (L >= 4 && full > 4) ds[rnd(1, full - 2)] = 0;
      return Number(ds.join(''));
    };
    let target, q, steps;
    if (L === 5) {
      const top = 10 ** (d - 1), k = rnd(2, d - 3), less = 10 ** k;
      target = top - less;
      q = `Make **${num(less)} less** than **${num(top)}** in the jars`;
      steps = [`${num(top)} − ${num(less)} = **${num(target)}**`, `${num(target)} = ${parts(target)}`];
    } else if (L >= 2 && Math.random() < 0.45) {
      const base = Number(String(rnd(2, 7)) + Array.from({ length: full - 1 }, () => rnd(0, 9)).join('')), k = rnd(1, full - 2), up = Math.random() < 0.5 ? 1 : -1, add = 10 ** k;
      target = base + up * add;
      q = `Make **${num(add)} ${up > 0 ? 'more' : 'less'}** than **${num(base)}** in the jars`;
      steps = [`${num(base)} ${up > 0 ? '+' : '−'} ${num(add)} = **${num(target)}**`, `${num(target)} = ${parts(target)}`];
    } else {
      target = mk();
      q = `Build **${num(target)}** in the jars`;
      steps = [`${num(target)} = ${parts(target)}`, 'Ten counters in a jar squish into one counter in the jar to the left.'];
    }
    return { game: 'jars', places, target, q, steps, secs: 40 };
  }

  function flagSpec(year, unit, L, frac) {
    if (frac) {
      const dens = [[2, 4], [3, 5], [6, 8, 10], [4, 8, 10], [6, 8, 12]][L - 1], den = R.pick(dens), top = L >= 4 ? 2 : 1;
      let nu; do { nu = rnd(1, den * top - 1); } while (nu % den === 0);
      const labelText = { 0: '0', 1: '1', 2: '2' };
      const t = nu / den;
      return { game: 'flag', min: 0, max: top, step: 1 / den, labels: top === 2 ? [0, 1, 2] : [0, 1], labelText, fmt: 'frac', target: t, tol: 0.3 / den, q: `Put the flag on **[[${nu}/${den}]]**`, steps: [`The line from 0 to ${top === 2 ? 2 : 1} is cut into ${den} equal steps for each whole.`, `[[${nu}/${den}]] is ${nu} steps from 0.`], secs: 25 };
    }
    const maxK = { '5-0': 5, '5-1': 6, '6-0': 7 }[year + '-' + unit] || 5;
    const kk = [maxK - 2, maxK - 1, maxK, maxK, maxK - 1][L - 1];
    const k = Math.max(2, kk), span = 10 ** k, groups = 10 ** (maxK - k);
    const min = L >= 2 ? span * rnd(0, Math.max(0, groups - 1)) : 0;
    const j = L >= 4 ? rnd(1, 9) + 0.5 : rnd(1, 9), target = Math.round(min + (span / 10) * j);
    return { game: 'flag', min, max: min + span, step: span / 10, labels: [min, min + span / 2, min + span], fmt: 'num', target, tol: span * (L >= 4 ? 0.022 : 0.032), q: `Put the flag on **${num(target)}**`, steps: [`The line goes from ${num(min)} to ${num(min + span)} in 10 equal steps of ${num(span / 10)}.`, `${num(target)} is ${j} steps from ${num(min)}.`], secs: 25 };
  }

  function dialSpec(year, unit, L, kinds) {
    const kind = R.pick(kinds), w = clamp(L + 2, 3, 5);
    let eq, answer, steps;
    const big = year === 6;
    if (kind === 'add') {
      const wx = clamp(w + (big ? 1 : 0), 2, 5), x = rnd(10 ** (wx - 1), 10 ** wx - 1), a = rnd(10 ** wx, 10 ** (wx + 1) - 1), b = a + x;
      eq = `${num(a)} + ${boxStr(wx)} = ${num(b)}`; answer = digitsOf(x, wx); steps = [`${num(b)} − ${num(a)} = **${num(x)}**`];
    } else if (kind === 'sub') {
      const wx = clamp(w + (big ? 1 : 0), 2, 5), x = rnd(10 ** (wx - 1), 10 ** wx - 1), b = rnd(10 ** (wx - 1), 10 ** wx - 1), a = x + b;
      eq = `${num(a)} − ${boxStr(wx)} = ${num(b)}`; answer = digitsOf(x, wx); steps = [`${num(a)} − ${num(b)} = **${num(x)}**`];
    } else if (kind === 'mul') {
      const m = L >= 5 ? rnd(11, 19) : rnd(3, 9), wx = L <= 2 ? 2 : 3, x = rnd(wx === 1 ? 2 : 10 ** (wx - 1), 10 ** wx - 1), p = x * m;
      eq = `${boxStr(wx)} × ${m} = ${num(p)}`; answer = digitsOf(x, wx); steps = [`${num(p)} ÷ ${m} = **${num(x)}**`];
    } else if (kind === 'div') {
      const d = rnd(2, 9), qn = rnd(L <= 2 ? 12 : 30, L <= 2 ? 60 : 150 + L * 40), x = d * qn, wx = String(x).length;
      eq = `${boxStr(wx)} ÷ ${d} = ${num(qn)}`; answer = digitsOf(x, wx); steps = [`${num(qn)} × ${d} = **${num(x)}**`];
    } else {
      const f = R.pick([10, 100, 1000]), a = rnd(2, 99), up = Math.random() < 0.5, res = up ? a * f : a, wx = String(res).length;
      eq = up ? `${num(a)} × ${num(f)} = ${boxStr(wx)}` : `${num(a * f)} ÷ ${num(f)} = ${boxStr(wx)}`; answer = digitsOf(res, wx);
      steps = [up ? `${num(a)} × ${num(f)}: every digit moves ${String(f).length - 1} places left → **${num(res)}**` : `${num(a * f)} ÷ ${num(f)}: every digit moves ${String(f).length - 1} places right → **${num(res)}**`];
    }
    return { game: 'dial', q: `Find the missing digits: **${eq}**`, answer, steps, secs: 35 };
  }

  function dialFromBook(item) {
    return { game: 'dial', q: `Find the missing digits: ${item.q}${item.note ? ' ' + item.note : ''}`, answer: item.answer.slice(), steps: item.steps || [], commas: false, ref: item.ref, secs: 40 };
  }

  function shapeSpec(L) {
    if (L <= 1) { const w = rnd(2, 4), h = rnd(2, 4); return { game: 'shape', area: w * h, perim: null, sol: [w, h], q: `Make a rectangle with an area of **${w * h}** squares`, steps: [`${w} × ${h} = ${w * h}`, 'Area = length × width.'], secs: 30 }; }
    if (L === 2) { const w = rnd(2, 6), h = rnd(2, 6); return { game: 'shape', area: null, perim: 2 * (w + h), sol: [w, h], q: `Make a rectangle with a perimeter of **${2 * (w + h)}** units`, steps: [`${w} + ${h} + ${w} + ${h} = ${2 * (w + h)}`, 'Perimeter = all the sides added up.'], secs: 30 }; }
    if (L === 3) { let w, h; do { w = rnd(2, 9); h = rnd(2, 8); } while (w === h); return { game: 'shape', area: w * h, perim: 2 * (w + h), sol: [w, h], q: `Make a rectangle: **area ${w * h}**, **perimeter ${2 * (w + h)}**`, steps: [`${w} × ${h} = ${w * h} and 2 × (${w} + ${h}) = ${2 * (w + h)}`], secs: 35 }; }
    if (L === 4) { const a = R.pick([8, 10, 12, 14]); return { game: 'shape', area: a, perim: null, longest: true, sol: [a, 1], q: `**Area ${a}** squares. Make the **longest** perimeter.`, steps: [`The long thin one is the longest: ${a} × 1 has a perimeter of ${2 * (a + 1)}.`], secs: 35 }; }
    let w, h; do { w = rnd(3, 12); h = rnd(2, 9); } while (w === h);
    return { game: 'shape', area: w * h, perim: 2 * (w + h), sol: [w, h], q: `Make a rectangle: **area ${w * h}**, **perimeter ${2 * (w + h)}**`, steps: [`${w} × ${h} = ${w * h} and 2 × (${w} + ${h}) = ${2 * (w + h)}`], secs: 40 };
  }

  function plotSpec(L) {
    const p = (a, b) => ({ x: rnd(a, b), y: rnd(a, b) });
    if (L <= 2) { const r = L === 1 ? 8 : 10, t = p(1, r - 1); return { game: 'plot', lo: 0, hi: r, mode: 'plot', target: t, q: `Put the dot at **(${t.x}, ${t.y})**`, steps: [`${t.x} across (along the bottom), then ${t.y} up.`], secs: 25 }; }
    if (L === 3) { const t = p(-5, 5); return { game: 'plot', lo: -6, hi: 6, mode: 'plot', target: t, q: `Put the dot at **(${t.x}, ${t.y})**`, steps: [`${t.x} along the bottom (negative = left), ${t.y} up or down (negative = down).`], secs: 25 }; }
    if (L === 4) {
      let s, dx, dy, t;
      do { s = p(-4, 4); dx = rnd(-4, 4); dy = rnd(-4, 4); t = { x: s.x + dx, y: s.y + dy }; } while ((!dx && !dy) || Math.abs(t.x) > 6 || Math.abs(t.y) > 6);
      const hv = (v, a, b) => (v ? `${Math.abs(v)} ${v > 0 ? a : b}` : '');
      return { game: 'plot', lo: -6, hi: 6, mode: 'move', start: s, target: t, q: `The star is at **(${s.x}, ${s.y})**. Move it **${[hv(dx, 'right', 'left'), hv(dy, 'up', 'down')].filter(Boolean).join(' and ')}**`, steps: [`(${s.x}, ${s.y}) → (${t.x}, ${t.y})`], secs: 30 };
    }
    let s;
    do { s = p(-5, 5); } while (!s.x || !s.y);
    const yAxis = Math.random() < 0.5, t = yAxis ? { x: -s.x, y: s.y } : { x: s.x, y: -s.y };
    return { game: 'plot', lo: -6, hi: 6, mode: 'move', start: s, target: t, q: `Reflect the dot at **(${s.x}, ${s.y})** in the **${yAxis ? 'y-axis (the up line)' : 'x-axis (the across line)'}**`, steps: [`A reflection flips it to the other side of the line, the same distance away: (${t.x}, ${t.y}).`], secs: 30 };
  }

  /* sheep pens: N sheep, sides between 2 and 12 (rows up to 8), N never more than 48 and mostly much less */
  function pensSpec(L) {
    const pairs = [];                                           // [per row, rows] that fit the field
    for (let a = 2; a <= 12; a++) for (let b = 2; b <= 8; b++) pairs.push([a, b]);
    const pick = (f) => R.pick(pairs.filter(f));
    let kind, k, sol, n, q, steps;
    if (L <= 1) {
      sol = pick(([a, b]) => a * b <= 20 && a * b >= 12 && a !== b && a >= b); n = sol[0] * sol[1]; kind = 'any';
      q = `Make a rectangle of **${n}** sheep`;
      steps = [`${sol[0]} × ${sol[1]} = ${n}`, `Other rectangles work too: any two numbers that multiply to ${n}.`];
    } else if (L === 2) {
      sol = pick(([a, b]) => a * b <= 24 && a * b >= 12 && a !== b); n = sol[0] * sol[1]; const byRow = Math.random() < 0.5;
      kind = byRow ? 'perRow' : 'rows'; k = byRow ? sol[0] : sol[1];
      q = byRow ? `**${n}** sheep. **${k}** in each row.` : `**${n}** sheep in **${k}** rows.`;
      steps = byRow ? [`${n} ÷ ${k} = ${sol[1]} rows`, `${k} × ${sol[1]} = ${n}`] : [`${n} ÷ ${k} = ${sol[0]} in each row`, `${sol[0]} × ${k} = ${n}`];
    } else if (L === 3 || L === 5) {
      sol = L === 5 ? pick(([a, b]) => a * b <= 48 && a * b >= 36 && a !== b) : pick(([a, b]) => a * b <= 36 && a * b >= 24 && a !== b); n = sol[0] * sol[1]; const byRow = Math.random() < 0.5;
      kind = byRow ? 'perRow' : 'rows'; k = byRow ? sol[0] : sol[1];
      q = byRow ? `**${n}** sheep. **${k}** in each row.` : `**${n}** sheep in **${k}** rows.`;
      steps = byRow ? [`${n} ÷ ${k} = ${sol[1]} rows`, `${k} × ${sol[1]} = ${n}`] : [`${n} ÷ ${k} = ${sol[0]} in each row`, `${sol[0]} × ${k} = ${n}`];
    } else if (L === 4) {
      const s = R.pick([4, 5, 6]); sol = [s, s]; n = s * s; kind = 'square';
      q = `Make a **square** of **${n}** sheep`;
      steps = [`A square has the same number of sheep in each row as rows.`, `${s} × ${s} = ${n}`];
    } else {
      sol = pick(([a, b]) => a - b >= 1 && a - b <= 4 && a * b <= 42 && a * b >= 24); n = sol[0] * sol[1]; k = sol[0] - sol[1]; kind = 'more';
      q = `Make a pen for **${n}** sheep with **${k === 1 ? '1 more sheep' : k + ' more sheep'}** in each row than there are rows`;
      steps = [`Try pairs that multiply to ${n}: ${sol[0]} × ${sol[1]} = ${n}.`, `${sol[0]} − ${sol[1]} = ${k}, so it fits.`];
    }
    return { game: 'pens', n, kind, k, sol, q, steps, secs: 30 };
  }

  /* the time for each game, by level (very easy .. very hard): a simple build is quick, the hard ones have a bigger number or more steps */
  Mini.SECS = {
    jars: [30, 35, 40, 45, 50], flag: [20, 20, 25, 25, 30], flagf: [20, 25, 25, 30, 30], dial: [25, 30, 35, 40, 45], book: [40, 40, 40, 45, 50],
    shape: [25, 25, 30, 35, 40], plot: [20, 20, 25, 30, 30], pens: [25, 30, 35, 40, 45],
  };
  /* which games suit which unit of the Practice Book (the same six units as the board's columns) */
  const TABLE = {
    5: [['jars', 'flag', 'dial'], ['jars', 'flag', 'dial'], ['dial'], [], ['pens', 'dial'], ['shape']],
    6: [['jars', 'flag'], ['dial'], ['dial', 'pens'], ['flagf', 'dial'], ['flagf', 'dial'], ['plot']],
  };
  const DIAL_KINDS = { '5-2': ['add', 'sub'], '5-4': ['mul', 'div', 'shift'], '6-1': ['add', 'sub', 'mul'], '6-2': ['mul', 'div', 'sub'] };
  Mini.make = function (game, year, unit, L) {
    let s;
    if (game === 'jars') s = jarsSpec(year, unit, L);
    else if (game === 'flag') s = flagSpec(year, unit, L, false);
    else if (game === 'flagf') s = flagSpec(year, unit, L, true);
    else if (game === 'dial') {
      const book = (BC.DATA && BC.DATA[year] && BC.DATA[year].code || []).filter((c) => { const u = BC.Graded.UNITS[year][unit], m = /p\.\s*(\d+)/.exec(c.ref || ''); return m && +m[1] >= u.pages[0] && +m[1] <= u.pages[1]; });
      const kinds = DIAL_KINDS[year + '-' + unit];
      s = L >= 3 && book.length && (!kinds || Math.random() < 0.45) ? dialFromBook(R.pick(book)) : dialSpec(year, unit, L, kinds || ['add', 'sub']);
    } else if (game === 'shape') s = shapeSpec(L);
    else if (game === 'plot') s = plotSpec(L);
    else if (game === 'pens') s = pensSpec(L);
    s.secs = Mini.SECS[s.game === 'dial' && s.ref && /Challenge/.test(s.ref) ? 'book' : game][L - 1];
    s.mini = true; s.lvl = L; s.ref = s.ref || 'Maths Clash mini game';
    return s;
  };
  /* the makers a ticket of this unit and level can use */
  Mini.makers = function (year, unit, L) {
    const bookDial = () => (BC.DATA && BC.DATA[year] && BC.DATA[year].code || []).some((c) => { const u = BC.Graded.UNITS[year][unit], k = /p\.\s*(\d+)/.exec(c.ref || ''); return k && +k[1] >= u.pages[0] && +k[1] <= u.pages[1]; });
    return ((TABLE[year] || [])[unit] || []).filter((g) => !(g === 'dial' && !DIAL_KINDS[year + '-' + unit] && !(L >= 3 && bookDial()))).map((g) => { const f = () => Mini.make(g, year, unit, L); f.game = g; return f; });
  };
  /* a speed puzzle for the tie-break: a different kind of game every round (and never the same puzzle twice) until all kinds were used, then the kinds start again with new puzzles.
     `used` is kept by the tie-break: { games: Set, qs: Set } */
  Mini.tieSpec = function (year, round, used) {
    used = used || { games: new Set(), qs: new Set() };
    const L = round < 2 ? 2 : 3;
    const options = [];
    for (let unit = 0; unit < 6; unit++) Mini.makers(year, unit, L).forEach((f) => options.push(f));
    if (!options.length) return null;
    const kinds = [...new Set(options.map((f) => f.game))];
    if (kinds.every((g) => used.games.has(g))) used.games.clear();
    const pool = options.filter((f) => !used.games.has(f.game));
    for (let t = 0; t < 30; t++) {
      const s = R.pick(pool)();
      if (used.qs.has(s.q)) continue;
      used.games.add(s.game); used.qs.add(s.q); s.secs = L === 2 ? 35 : 40;
      return s;
    }
    return null;
  };
  /* structure checks for the tests and the audit */
  Mini.check = function (s) {
    const bad = [];
    if (!s || !s.mini || !Mini.games[s.game]) return ['unknown game'];
    if (!s.q || !s.steps || !s.steps.length) bad.push('no text or steps');
    if (s.game === 'jars') { if (s.places.length < 5 || String(s.target).length > s.places.length || s.target < 1) bad.push('jars: target does not fit the jars'); }
    if (s.game === 'flag') { if (!(s.target > s.min && s.target < s.max) || !(s.tol > 0)) bad.push('flag: target outside the line'); }
    if (s.game === 'dial') { if (!s.answer.length || s.answer.some((d) => !(d >= 0 && d <= 9))) bad.push('dial: bad digits'); }
    if (s.game === 'shape') { const [w, h] = s.sol; if (!(w >= 1 && h >= 1 && w <= GW && h <= GH)) bad.push('shape: no solution on the grid'); else if ((s.area != null && w * h !== s.area) || (s.perim != null && 2 * (w + h) !== s.perim)) bad.push('shape: solution does not match'); }
    if (s.game === 'plot') { if (s.target.x < s.lo || s.target.x > s.hi || s.target.y < s.lo || s.target.y > s.hi) bad.push('plot: target off the grid'); }
    if (s.game === 'pens') {
      const [a, b] = s.sol;
      if (!(a >= 2 && a <= 12 && b >= 2 && b <= 8) || a * b !== s.n || s.n > 48) bad.push('pens: solution does not fit the field');
      else if ((s.kind === 'perRow' && a !== s.k) || (s.kind === 'rows' && b !== s.k) || (s.kind === 'square' && a !== b) || (s.kind === 'more' && a - b !== s.k)) bad.push('pens: solution does not match the task');
    }
    return bad;
  };
})();
