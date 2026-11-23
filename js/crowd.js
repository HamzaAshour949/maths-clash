/* Maths Clash crowd: the audience sits in a dark arena behind the whole game (red fans on the left, blue fans on the right):
   a lighting rig, an upper deck full of tiny fans, a balcony, and curved tiers with aisles and lit steps.
   The fans on the tiers cheer, groan and get cross with the match, and light up when they do.
   Designed and built by Hamza Ashour. */
'use strict';
(function () {
  const C = BC.Crowd = { kids: [], mount: null, tense: false, on: true };
  const A = BC.Arena = { lights: [] };           // the rig's lights, so the beams in the background start from them
  const rnd = (a, b) => a + Math.random() * (b - a);
  const NS = 'http://www.w3.org/2000/svg';
  void NS;

  /* the tiers, back to front: size of the kids, where their seat line is at the middle, how many per row, how much the row curves */
  function plan() {
    if (!BC.portrait) {
      return {
        tiers: [
          { s: 0.58, cut: 585, n: 10, b: 0.36, sag: 56 },
          { s: 0.74, cut: 712, n: 8, b: 0.42, sag: 50 },
          { s: 0.92, cut: 868, n: 7, b: 0.48, sag: 42 },
          { s: 1.1, cut: 1034, n: 6, b: 0.56, sag: 32, front: true },
        ],
        deck: { y0: 150, y1: 505, dy: 24, dx: 28, r: 7, sag: 46 }, mezz: 528, truss: 22, lights: 12, aisles: [0.25, 0.5, 0.75],
      };
    }
    return {
      tiers: [
        { s: 0.56, cut: 1230, n: 6, b: 0.32, sag: 30 },
        { s: 0.68, cut: 1372, n: 5, b: 0.37, sag: 28 },
        { s: 0.8, cut: 1522, n: 4, b: 0.42, sag: 26 },
        { s: 0.94, cut: 1690, n: 4, b: 0.48, sag: 22 },
        { s: 1.08, cut: 1872, n: 3, b: 0.55, sag: 18, front: true },
      ],
      deck: { y0: 640, y1: 1190, dy: 24, dx: 30, r: 7, sag: 26 }, mezz: 1210, truss: 22, lights: 7, aisles: [0.25, 0.5, 0.75],
    };
  }

  const pathCircles = (pts, r) => pts.map(([x, y]) => `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`).join('');
  const pathBodies = (pts, r) => pts.map(([x, y]) => `M${(x - r * 1.5).toFixed(1)} ${(y + r * 2.6).toFixed(1)}q0 ${-r * 1.8} ${r * 1.5} ${-r * 1.8}t${r * 1.5} ${r * 1.8}z`).join('');

  /* everything that does not move: the roof rig, the upper deck, the balcony */
  function backdrop(p, W, H) {
    const curve = (x, sag) => -sag * Math.pow((x - W / 2) / (W / 2), 2);
    const d = p.deck, parts = [];
    // upper deck: rows of tiny fans in the dark
    const left = [], right = [], phones = [];
    let ri = 0;
    for (let y = d.y0; y <= d.y1; y += d.dy, ri++) {
      const L = [], R = [];
      for (let x = (ri % 2) * d.dx * 0.5 + 14; x < W; x += d.dx) {
        if (p.aisles.some((a) => Math.abs(x - a * W) < 34)) continue;
        const yy = y + curve(x, d.sag) + Math.sin(x * 12.9 + y) * 2;
        (x < W / 2 ? L : R).push([x, yy]);
        if (Math.random() < 0.012) phones.push([x, yy - d.r * 0.2, x < W / 2 ? '#ffd9a0' : '#bfe6ff']);
      }
      const t = (y - d.y0) / (d.y1 - d.y0);       // 0 far, 1 near
      const fa = 0.4 + t * 0.35;
      parts.push(`<path d="${pathCircles(L, d.r)}${pathBodies(L, d.r)}" fill="#2a1230" fill-opacity="${fa}"/><path d="${pathCircles(R, d.r)}${pathBodies(R, d.r)}" fill="#0f1f4a" fill-opacity="${fa}"/>`);
      void left; void right;
    }
    const phoneDots = phones.map(([x, y, c], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${c}" fill-opacity=".16"/><circle class="ph" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${c}"/>`).join('');
    // balcony band between the decks: lit windows
    let win = '';
    for (let x = 30; x < W; x += 70) win += `<rect x="${x}" y="${p.mezz + 8 + curve(x, d.sag * 0.4)}" width="38" height="14" rx="3" fill="${Math.random() < 0.5 ? '#ffcf8a' : '#9fc4ff'}" fill-opacity="${(0.05 + Math.random() * 0.1).toFixed(2)}"/>`;
    const mezz = `<path d="M0 ${p.mezz + curve(0, d.sag * 0.4)} ${Array.from({ length: 25 }, (_, i) => `L${(i / 24) * W} ${p.mezz + curve((i / 24) * W, d.sag * 0.4)}`).join('')} L${W} ${p.mezz + 34} L0 ${p.mezz + 34}Z" fill="#070a22"/>${win}`;
    // the rig across the roof: the lamps the beams start from
    A.lights = [];
    let rig = `<rect x="0" y="${p.truss}" width="${W}" height="14" fill="#0b0f2e"/><rect x="0" y="${p.truss + 14}" width="${W}" height="3" fill="#2a3170" fill-opacity=".6"/>`;
    for (let i = 0; i < p.lights; i++) {
      const x = ((i + 0.5) * W) / p.lights, f = i / (p.lights - 1);
      const team = f < 0.42 ? 'red' : f > 0.58 ? 'blue' : 'warm';
      const col = team === 'red' ? '#d7464b' : team === 'blue' ? '#3c78d7' : '#ffd37a';
      A.lights.push({ x, y: p.truss + 30, team });
      rig += `<rect x="${x - 18}" y="${p.truss + 12}" width="36" height="22" rx="7" fill="#101644"/><circle cx="${x}" cy="${p.truss + 30}" r="8" fill="${col}" style="filter:drop-shadow(0 0 10px ${col})"/>`;
    }
    return `<svg class="c-back" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}<g class="phones">${phoneDots}</g>${mezz}${rig}</svg>`;
  }

  /* one tier: the step it sits on (curved, with a lit edge) and the aisles cut into it */
  function riserSvg(p, t, nextCut, W, H) {
    const curve = (x, sag) => -sag * Math.pow((x - W / 2) / (W / 2), 2);
    const edge = (x) => t.cut + curve(x, t.sag);
    const along = (x0, x1) => { const pts = []; for (let x = x0; x <= x1 + 0.1; x += 40) pts.push([x, edge(x)]); return pts; };
    const half = (x0, x1, id, rim) => {
      const pts = along(x0, x1);
      const top = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
      return `<path d="${top}L${x1} ${H}L${x0} ${H}Z" fill="url(#${id})"/><path d="${top}" fill="none" stroke="${rim}" stroke-width="2.2"/>`;
    };
    let aisles = '';
    for (const f of p.aisles) {
      const x = f * W, y0 = edge(x), y1 = nextCut == null ? H : Math.min(H, nextCut + curve(x, t.sag) + 6);
      let dots = '';
      for (let y = y0 + 10; y < y1 - 6; y += 22) dots += `<circle cx="${x - 22}" cy="${y.toFixed(1)}" r="2.2"/><circle cx="${x + 22}" cy="${y.toFixed(1)}" r="2.2"/>`;
      aisles += `<rect x="${x - 26}" y="${y0.toFixed(1)}" width="52" height="${Math.max(0, y1 - y0).toFixed(1)}" fill="#05071b"/><g fill="#ffc97a" fill-opacity=".8" style="filter:drop-shadow(0 0 3px #ffb35a)">${dots}</g>`;
    }
    return `<svg class="c-riser" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${half(6, W / 2 - 4, 'g-riser-red', 'rgba(255,110,145,.5)')}${half(W / 2 + 4, W - 6, 'g-riser-blue', 'rgba(100,165,255,.55)')}${aisles}</svg>`;
  }

  C.build = function () {
    const stage = BC.$('#stage');
    if (!stage) return;
    C.clear();
    if (!BC.$('#art-defs')) stage.insertAdjacentHTML('afterbegin', BC.Art.defs());
    if (!C.mount) { C.mount = BC.el('div', ''); C.mount.id = 'crowd'; stage.insertBefore(C.mount, BC.$('#screen')); }
    const m = C.mount;
    m.innerHTML = '';
    m.classList.toggle('off', !C.on);
    const W = BC.W, H = BC.H, p = plan();
    const curve = (x, sag) => -sag * Math.pow((x - W / 2) / (W / 2), 2);
    m.insertAdjacentHTML('beforeend', backdrop(p, W, H));
    let seed = 3;
    p.tiers.forEach((t, ri) => {
      const row = BC.el('div', 'c-row');
      m.appendChild(row);
      const kw = 140 * t.s, kh = 170 * t.s, slot = W / (2 * t.n), odd = ri % 2 === 1;
      for (let i = 0; i < 2 * t.n; i++) {
        const cx = (i + (odd ? 1 : 0.5)) * slot;
        if (cx > W - kw / 2) continue;
        if (p.aisles.some((a) => Math.abs(cx - a * W) < 34 + kw * 0.32)) continue;
        const team = cx < W / 2 ? 'red' : 'blue';
        const spec = BC.Art.randomKid(team, seed++, ri);
        // the two front tiers (fw) get the fancy inner animations (waving arms, tears, steam); the back tiers (nb) only jump, which is much cheaper
        const el = BC.el('div', `kid ${team} m-idle ${ri >= p.tiers.length - 2 ? 'fw' : 'nb'}`, BC.Art.kid(spec));
        const u = (cx - W / 2) / (W / 2);
        Object.assign(el.style, { left: cx - kw / 2 + rnd(-5, 5) + 'px', top: t.cut + curve(cx, t.sag) - 146 * t.s + 'px', width: kw + 'px', height: kh + 'px', transform: `rotate(${(u * 4).toFixed(1)}deg)` });
        el.style.setProperty('--b', t.b);
        el.style.setProperty('--d', (-Math.random() * 2).toFixed(2) + 's');
        el.style.setProperty('--p', rnd(1.5, 2.2).toFixed(2) + 's');
        el.style.setProperty('--w', rnd(0.5, 0.75).toFixed(2) + 's');
        row.appendChild(el);
        C.kids.push({ el, team, tier: ri, mood: 'idle', base: 'idle', t: null, x: cx });
      }
      const next = p.tiers[ri + 1];
      row.insertAdjacentHTML('beforeend', riserSvg(p, t, next ? next.cut : null, W, H));
      if (t.front) {
        for (const team of ['red', 'blue']) row.insertAdjacentHTML('beforeend', `<div class="c-sign ${team}" style="left:${team === 'red' ? 0 : W / 2}px;top:${t.cut + 6}px;width:${W / 2}px">GO ${BC.tshort(team)}</div>`);
      }
    });
    C.phoneEls = BC.$$('.ph', m);
  };

  /* a few phone lights twinkle and a few kids blink every moment: done from here, so nothing runs forever on the big backdrop */
  setInterval(() => {
    if (!C.on || !C.mount) return;
    for (let i = 0; i < 3 && C.phoneEls && C.phoneEls.length; i++) { const e = C.phoneEls[Math.floor(Math.random() * C.phoneEls.length)]; e.setAttribute('fill-opacity', Math.random() < 0.5 ? '0.25' : '1'); }
    for (let i = 0; i < 3 && C.kids.length; i++) { const k = C.kids[Math.floor(Math.random() * C.kids.length)]; k.el.classList.add('bl'); setTimeout(() => k.el.classList.remove('bl'), 130); }
  }, 700);

  C.clear = function () { C.kids.forEach((k) => clearTimeout(k.t)); C.kids = []; C.tense = false; };

  C.setVisible = function (on) { C.on = on; if (C.mount) C.mount.classList.toggle('off', !on); };
  /* during a match the whole audience is dimmed further, so the students look at the questions, not the crowd */
  C.setFocus = function (on) { if (C.mount) C.mount.classList.toggle('focus', !!on); };

  function setMood(k, mood, ms) {
    clearTimeout(k.t);
    if (k.mood !== mood) { k.el.classList.remove('m-' + k.mood); k.el.classList.add('m-' + mood); k.mood = mood; }
    if (ms) k.t = setTimeout(() => setMood(k, k.base, 0), ms);
  }

  const of = (team) => (team === 'both' || !team ? C.kids : C.kids.filter((k) => k.team === team));

  /* one team (or both) takes a mood for a while; each kid reacts a moment apart */
  C.react = function (team, mood, ms = 1600, o = {}) {
    for (const k of of(team)) {
      if (Math.random() > (o.p == null ? 0.94 : o.p)) continue;
      const m = typeof mood === 'function' ? mood(k) : mood;
      setTimeout(() => setMood(k, m, ms + rnd(0, 350)), rnd(0, o.spread == null ? 240 : o.spread));
    }
  };
  /* a mood that stays until it is changed */
  C.hold = function (team, mood) {
    for (const k of of(team)) { k.base = typeof mood === 'function' ? mood(k) : mood; setTimeout(() => setMood(k, k.base, 0), rnd(0, 300)); }
  };
  C.calm = function () { C.tense = false; C.hold('both', 'idle'); };

  let lastSound = 0;
  const sound = (name, o) => { const n = performance.now(); if (n - lastSound < 350) return; lastSound = n; try { BC.Audio.play(name, o); } catch (e) { /* no audio yet */ } };
  const mixed = (a, b, pa) => () => (Math.random() < pa ? a : b);

  C.cheer = function (team, big) { C.react(team, 'cheer', big ? 2600 : 1700); sound('cheer', { team, big }); };
  /* the other side is sad, or cross, or a bit of both */
  C.lose = function (team, ms = 1900) {
    const cross = Math.random() < 0.5;            // this time most of them are cross, or most are sad
    C.react(team, () => (Math.random() < (cross ? 0.72 : 0.28) ? 'angry' : 'sad'), ms);
    sound('aww', { team });
  };

  let lastScore = { team: null, t: 0, pts: 0 };
  /* the score changed: fans of the scoring team cheer, the other side groans */
  C.score = function (team, pts) {
    if (!C.kids.length) return;
    const other = BC.other(team), now = performance.now();
    if (pts > 0) {
      if (lastScore.team === other && lastScore.pts > 0 && now - lastScore.t < 900) { C.react('both', 'cheer', 1900); sound('cheer', { team: 'both', big: false }); }
      else { C.cheer(team, pts >= 100); C.lose(other, 1700); }
    } else {
      C.lose(team, 1900);
      C.react(other, 'happy', 1400, { p: 0.7 });
      setTimeout(() => sound('laugh', { team: other }), 450);
    }
    lastScore = { team, t: now, pts };
  };
  /* somebody pressed first */
  C.buzz = function (team) { C.react(team, 'cheer', 1100, { p: 0.8 }); C.react(BC.other(team), 'nerv', 1400, { p: 0.7 }); sound('ooh', { team }); };
  C.gasp = function (team) { C.react(team || 'both', 'wow', 1100); sound('ooh', { team: team || 'both' }); };
  C.groan = function (team) { C.lose(team || 'both', 1700); };
  /* timer in the last seconds: everyone bites their nails */
  C.tension = function (on) {
    if (on === C.tense || !C.kids.length) return;
    C.tense = on;
    C.kids.forEach((k) => { if (on) { k.base = 'nerv'; if (k.mood === 'idle' || k.mood === 'happy') setMood(k, 'nerv', 0); } else { if (k.base === 'nerv') { k.base = 'idle'; if (k.mood === 'nerv') setMood(k, 'idle', 0); } } });
  };
  /* the match is over */
  C.end = function (winner) {
    C.tense = false;
    if (!winner) { C.hold('both', 'wow'); return; }
    C.hold(winner, 'cheer'); C.hold(BC.other(winner), mixed('sad', 'angry', 0.72));
    sound('cheer', { team: winner, big: true }); setTimeout(() => sound('aww', { team: BC.other(winner) }), 500);
  };

  /* a wave running along the stands (title and menu) */
  let waveTimer = null;
  C.wave = function (on) {
    clearInterval(waveTimer); waveTimer = null;
    if (!on) return;
    const run = () => {
      const order = C.kids.slice().sort((a, b) => a.x - b.x);
      order.forEach((k, i) => setTimeout(() => setMood(k, 'cheer', 650), i * 22));
    };
    run(); waveTimer = setInterval(run, 5200);
  };

  /* every so often a kid or two gets excited for no reason */
  setInterval(() => {
    if (!C.kids.length || !C.on) return;
    for (let i = 0; i < 4; i++) {
      const k = C.kids[Math.floor(Math.random() * C.kids.length)];
      if (k && k.mood === 'idle' && k.base === 'idle' && Math.random() < 0.6) setMood(k, 'happy', rnd(1100, 2000));
    }
  }, 900);
})();

/* the signs follow the year chosen in the menu */
(function () { BC.Crowd.relabel = function () { BC.$$('.c-sign').forEach((e) => { e.textContent = 'GO ' + BC.tshort(e.classList.contains('red') ? 'red' : 'blue'); }); }; })();
