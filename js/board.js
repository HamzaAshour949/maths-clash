/* Maths Clash ticket board: one column for each unit of the Practice Book, six rows of tickets from very easy to very hard.
   The level's reward and cost are written ONCE, in the difficulty card at the left of its row, not on every ticket.
   The team whose turn it is picks a ticket and answers it. Wrong or out of time: the other team may steal it for half the reward, or pass.
   A picked ticket is gone. Scores never go below zero. Questions come from two pools: the book's Challenge pool (data-y5/y6.js)
   and the graded pool (graded.js), whose numbers grow with the level. Designed and built by Hamza Ashour. */
'use strict';
(function () {
  const { el, R } = BC;
  const Board = BC.Board = { used: { 5: new Set(), 6: new Set() } };

  /* the five levels: what a ticket wins and what a wrong answer costs. A steal wins half the reward but risks the full cost,
     so it is only worth it when a team is fairly sure. */
  Board.LEVELS = [
    { lvl: 1, name: 'VERY EASY', reward: 100, damage: 50 },
    { lvl: 2, name: 'EASY', reward: 200, damage: 100 },
    { lvl: 3, name: 'MEDIUM', reward: 300, damage: 150 },
    { lvl: 4, name: 'HARD', reward: 400, damage: 200 },
    { lvl: 5, name: 'VERY HARD', reward: 500, damage: 250 },
  ];
  Board.ECON = Board.LEVELS;
  Board.ROWS = [1, 1, 2, 3, 4, 5];                 // top to bottom: two very easy tickets, then one of each other level
  Board.CATS = BC.Graded.UNITS;                    // six columns: the book's units
  Board.TEAM = { red: '#d7353b', blue: '#2d6bcf' };
  const lvOf = (L) => Board.LEVELS[L - 1];

  const pageOf = (it) => { const m = /p\.\s*(\d+)/.exec(String((it && it.ref) || '')); return m ? +m[1] : 0; };

  /* a rough difficulty for the book's Challenge questions: more steps, longer and trickier wording, bigger numbers, later in the unit = harder */
  function weight(it, page, range) {
    const q = String(it.q || '');
    let s = (it.steps ? it.steps.length : 1) * 1.2 + Math.min(2, q.length / 90);
    if (/prime|factor|product|remainder|perimeter|area|largest|smallest|biggest|could|always|sometimes|never|reflect|simplify|ascending|exact|coordinates/i.test(q)) s += 0.8;
    const mx = Math.max(0, ...(q.match(/\d[\d,]*/g) || []).map((x) => +x.replace(/,/g, '')));
    s += mx >= 100000 ? 0.6 : mx >= 10000 ? 0.3 : 0;
    s += ((page - range[0]) / Math.max(1, range[1] - range[0])) * 1.5;
    if (it.fig) s -= 0.2;
    return s;
  }

  /* every multiple-choice question of the book pool, with the page it comes from */
  function sources(year) {
    const D = BC.DATA[year], out = [];
    D.buzz.forEach((it, i) => out.push({ key: 'b' + i, make: () => Object.assign({}, it), page: pageOf(it), sample: it }));
    [['v', D.vis || []], ['t', D.tug || []]].forEach(([k, list]) => list.forEach((g, i) => {
      let sample = null;
      for (let t = 0; t < 4 && !sample; t++) { try { sample = g(); } catch (e) { sample = null; } }
      if (sample && sample.opts && sample.opts.length === 4) out.push({ key: k + i, make: g, page: pageOf(sample), sample });
    }));
    /* the puzzle rounds, as four-answer questions (the board has four answer tiles): Clue cracker (which of these numbers fits every clue?)
       and Crack the code (what goes in the boxes?). The first option is always the right one; the board shuffles them. */
    (D.clue || []).forEach((c, i) => {
      if (!clueQ(c)) return;
      out.push({ key: 'c' + i, make: () => clueQ(c), page: pageOf(c), sample: clueQ(c) });
    });
    return out;
  }
  const num = (s) => +String(s).replace(/,/g, '');
  function clueQ(c) {
    const fits = c.cands.map((s) => c.test.every((t) => t(num(s))));
    const ri = fits.indexOf(true);
    if (ri < 0 || fits.indexOf(true, ri + 1) >= 0) return null;             // exactly one candidate fits every clue
    const steps = c.cands.map((s) => { const k = c.test.findIndex((t) => !t(num(s))); return k < 0 ? `**${s}** fits every clue ✔` : `${s} ✘ breaks the clue: ${c.clues[k]}`; });
    return { q: `**${c.title}.** ${c.clues.join(' ')} Which number am I?`, opts: [c.cands[ri], ...c.cands.filter((_, i) => i !== ri)], ref: c.ref, steps };
  }
  function codeQ(c) {
    const ds = c.answer.slice(), n = ds.join('');
    // one block of boxes = one number (420, 8,000); boxes in different places = the digits in order (9 and 5)
    const groups = c.q.match(/□+(?:,□+)*/g) || [], together = groups.length === 1 && groups[0].replace(/,/g, '').length === ds.length;
    const show = (s) => (together || s.length === 1 ? (s.length >= 4 ? Number(s).toLocaleString('en-US') : s) : s.split('').slice(0, -1).join(', ') + ' and ' + s.slice(-1));
    const cand = new Set();
    ds.forEach((d, p) => [-2, -1, 1, 2].forEach((k) => { const nd = d + k; if (nd >= 0 && nd <= 9) { const t = ds.slice(); t[p] = nd; cand.add(t.join('')); } }));
    for (let p = 0; p + 1 < ds.length; p++) { const t = ds.slice(); [t[p], t[p + 1]] = [t[p + 1], t[p]]; cand.add(t.join('')); }
    cand.add(ds.slice().reverse().join(''));
    if (ds.length === 1) for (let k = 0; k <= 9; k++) cand.add(String(k));
    const pool = [...cand].filter((s) => s !== n && s.length === n.length && (n.length === 1 || s[0] !== '0'));
    if (pool.length < 3) return null;
    const near = ds.length === 1 ? pool.sort((a, z) => Math.abs(a - ds[0]) - Math.abs(z - ds[0])).slice(0, 5) : pool;
    const wrong = R.shuffle(near.slice()).slice(0, 3);
    return { q: `${c.q} ${c.note || (together ? 'What number goes in the boxes?' : 'What digits go in the boxes, in order?')}`, opts: [show(n), ...wrong.map(show)], ref: c.ref, steps: c.steps };
  }
  /* the book's Challenge questions are hard, so they only fill the medium, hard and very hard tickets: within a unit the easiest third
     is level 3, the middle third level 4, the hardest third level 5. The two easiest levels are always the graded pool's. */
  const cache = {};
  function bookByUnit(year) {
    if (cache[year]) return cache[year];
    const units = BC.Graded.UNITS[year], src = sources(year);
    cache[year] = units.map((u) => {
      const pool = src.filter((s) => s.page >= u.pages[0] && s.page <= u.pages[1]);
      const ranked = pool.map((s) => ({ s, w: weight(s.sample, s.page, u.pages) })).sort((a, b) => a.w - b.w).map((x) => x.s);
      const by = { 3: [], 4: [], 5: [] };
      ranked.forEach((s, r) => by[3 + Math.min(2, Math.floor(((r + 0.5) * 3) / ranked.length))].push(s));
      return by;
    });
    return cache[year];
  }

  /* a fresh board: for each unit one ticket per row, from the book pool (about half of the medium-and-up tickets) or the graded pool */
  /* v0.2: words in a question (numbers and symbols do not count). Long texts were too hard to read for the classes, so the easier setting keeps only short ones. */
  const words = (q) => String(q || '').replace(/\*\*|\[\[|\]\]|\(\(|\)\)/g, '').replace(/<[^>]+>/g, '').split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;
  Board.words = words;
  Board.SHORT = 12;
  /* v0.2: Settings → Questions "Easier, short" (the default): each ticket asks a question one level easier than its row (the reward stays the row's) */
  Board.qLevel = (L) => (BC.settings.level === 'book' ? L : Math.max(1, L - 1));
  Board.make = function (year) {
    const units = BC.Graded.UNITS[year], book = bookByUnit(year), used = Board.used[year], easy = BC.settings.level !== 'book';
    const board = { cats: [], count: 0 };
    units.forEach((u, ui) => {
      const col = { name: u.name, sub: u.sub, tickets: [] }, madeKeys = new Set(), usedMakers = new Set(), gamesUsed = new Set();
      Board.ROWS.forEach((L0, r) => {
        const L = Board.qLevel(L0), lv = Object.assign({ qlvl: L }, lvOf(L0));          // L = the level of the question, L0 = the row (reward and cost)
        const graded = BC.Graded.makers(year, ui, L);
        const bk = (book[ui][L] || []).filter((s) => !used.has(s.key) && !madeKeys.has(s.key) && (!easy || (!/^[ck]\d/.test(s.key) && words(s.sample && s.sample.q) <= Board.SHORT)));
        let src;
        const minis = BC.Mini ? BC.Mini.makers(year, ui, L) : [], fresh0 = minis.filter((f) => !gamesUsed.has(f.game));
        if (minis.length && Math.random() < 0.85) {                    // a little game instead of a question, whenever the unit has one for this level
          const f = R.pick(fresh0.length ? fresh0 : minis); gamesUsed.add(f.game);
          src = { key: `m${ui}-${L}-${f.game}`, make: f, from: 'mini' };
          col.tickets.push(Object.assign({ unit: ui, row: r, used: false, winner: null, src }, lv));
          return;
        }
        const pz = bk.filter((x) => /^[ck]\d/.test(x.key));                 // the puzzle questions (Clue cracker) are welcome on the board: a unit that has one for this level usually uses it
        if (bk.length && L >= 3 && (!graded.length || Math.random() < (pz.length ? 0.8 : 0.5))) {
          const b = pz.length && Math.random() < 0.7 ? R.pick(pz) : R.pick(bk); madeKeys.add(b.key);
          src = { key: b.key, make: b.make, from: 'book', page: b.page };
        } else {
          const idx = graded.map((_, i) => i), fresh = idx.filter((i) => !usedMakers.has(L + ':' + i)), i = R.pick(fresh.length ? fresh : idx);
          usedMakers.add(L + ':' + i);
          src = { key: `g${ui}-${L}-${i}`, make: graded[i], from: 'graded' };
        }
        col.tickets.push(Object.assign({ unit: ui, row: r, used: false, winner: null, src }, lv));
      });
      board.cats.push(col);
      board.count += col.tickets.length;
    });
    return board;
  };
  /* the question behind a ticket (the graded makers can fail now and then: try again, then another maker of the same level) */
  Board.ask = function (year, tk) {
    for (let g = 0; g < 4; g++) { try { const it = tk.src.make(); if (it) return it; } catch (e) { /* try again */ } }
    const list = BC.Graded.makers(year, tk.unit, tk.qlvl || tk.lvl);
    for (let g = 0; g < 12 && list.length; g++) { const it = R.pick(list)(); if (it) return it; }
    return null;
  };
  /* for the tests: what each unit can draw on, per level */
  Board.audit = function (year) {
    const book = bookByUnit(year);
    return BC.Graded.UNITS[year].map((u, ui) => ({
      name: u.name,
      book: { 3: book[ui][3].length, 4: book[ui][4].length, 5: book[ui][5].length },
      graded: [1, 2, 3, 4, 5].map((L) => BC.Graded.makers(year, ui, L).length),
    }));
  };

  /* =====================================================  the game  ===================================================== */
  const tickerFn = () => { let last = 99; return (left) => { const s = Math.ceil(left); if (s <= 5 && s >= 1 && s < last) BC.Audio.play('tick', { high: s <= 3 }); last = s; }; };
  /* the steal offer: one panel, in the middle of the screen, the same for both teams (used by questions and mini games) */
  async function stealPanel(run, S, st, half, tk) {
    const M = BC.Match, A = BC.Audio, Input = BC.Input, ticker = tickerFn;
          const panel = el('div', 'bd-steal', `<div class="st-h ${st}">${BC.tn(st)} · STEAL OR PASS?</div>
            <div class="st-b"><div class="st-opt steal" data-act="steal"><b>STEAL</b><span class="s">win +${half} · lose −${tk.damage}</span></div>
            <div class="st-opt pass" data-act="pass"><b>PASS</b><span class="s">no points change</span></div></div>`);
          S.appendChild(panel);
          S.classList.add('stealing');                        // v0.2: the answer tiles fade away while the panel is up (it sat on top of them)
          gsap.from(panel, { scale: 0.6, opacity: 0, duration: 0.45, ease: 'back.out(2)' });
          let decision = null, sel = 'steal', left = 10; const t2 = ticker(), armT = M.t + 500;      // the ring starts on STEAL (◀ ▶ move it, A confirms)
          panel.querySelector('.st-opt.steal').classList.add('sel');
          run.activeTeam = st; BC.setTurn(st);
          A.play('buzz', { team: st }); BC.Crowd.gasp(st);
          const mark = (w) => { sel = w; panel.querySelectorAll('.st-opt').forEach((o) => o.classList.toggle('sel', o.classList.contains(w))); A.play('move'); };
          // left / right (X, B, d-pad, stick, arrows) select STEAL / PASS; A (Shift / Enter) confirms. A mouse click selects, a second click confirms.
          M.onInput = (ev) => {
            if (ev.team !== st || ev.join || M.t < armT || decision) return;
            if (ev.act === 'steal' || ev.act === 'pass') { if (sel === ev.act) decision = sel; else mark(ev.act); return; }
            if (ev.ok) { if (sel) decision = sel; return; }
            if (ev.dir === 'left' && !ev.repeat && sel !== 'steal') mark('steal');
            else if (ev.dir === 'right' && !ev.repeat && sel !== 'pass') mark('pass');
          };
          M.onFrame = (dt) => { left -= dt; run.hud.setTimer(left, 10); t2(left); };
          run.hud.showTimer(true); run.hud.setTimer(left, 10);
          await M.waitFor(() => decision || M.skip || M.skipRound, 10000);
          run.hud.showTimer(false); M.onInput = null; M.onFrame = null;
          if (decision) { const chosen = panel.querySelector('.st-opt.' + decision); if (chosen) chosen.classList.add('chosen'); panel.classList.add('decided'); await M.sleep(380); }
          gsap.to(panel, { scale: 0.7, opacity: 0, duration: 0.25, onComplete: () => panel.remove() });
          S.classList.remove('stealing');                     // the answer tiles come back for the stealing team
          return decision;
        }

  const deal = (opts) => { const order = R.shuffle([0, 1, 2, 3]); return { opts: order.map((i) => opts[i]), right: BC.DIRS[order.indexOf(0)] }; };
  const ticker = () => { let last = 99; return (left) => { const s = Math.ceil(left); if (s <= 5 && s >= 1 && s < last) BC.Audio.play('tick', { high: s <= 3 }); last = s; }; };
  const other = (t) => (t === 'red' ? 'blue' : 'red');
  const pips = (L) => `<span class="lv-pips">${[1, 2, 3, 4, 5].map((k) => `<i${k <= L ? ' class="on"' : ''}></i>`).join('')}</span>`;
  const pay = (L) => `<span class="lv-pay"><span class="w"><i>WIN</i><b>+${lvOf(L).reward}</b></span><span class="l"><i>LOSE</i><b>−${lvOf(L).damage}</b></span></span>`;
  const progress = (total, now, winners) => Array.from({ length: total }, (_, i) => `<i class="${i < now ? (winners[i] || 'done') : i === now ? 'now' : ''}"></i>`).join('');

  /* the two info boxes beside the timer: who is playing (left) and what the ticket is (right). Same places for both teams. */
  function infoBoxes(S, team, what, right) {
    S.querySelectorAll('.bd-who, .bd-tk').forEach((e) => e.remove());
    const who = el('div', `bd-who ${team}`, `<b>${BC.tn(team)}</b><span>${what}</span>`);
    const box = el('div', 'bd-tk', right);
    S.append(who, box);
    return { who, box };
  }

  function drawBoard(S, board, year) {
    const root = el('div', 'bd');
    let k = 0, h = `<div class="bd-grid"><div class="bd-corner" style="grid-row:1;grid-column:1;--i:${k++}">DIFFICULTY</div>`;
    board.cats.forEach((c, ci) => { h += `<div class="bd-cat" data-c="${ci}" style="grid-row:1;grid-column:${ci + 2};--i:${k++}"><small>${c.sub}</small><b>${BC.esc(c.name)}</b></div>`; });
    // the difficulty cards: very easy spans its two rows
    [[1, 2, 2], [2, 4, 1], [3, 5, 1], [4, 6, 1], [5, 7, 1]].forEach(([L, row, span]) => {
      const lv = lvOf(L);
      h += `<div class="bd-lv lv${L}" data-lv="${L}" style="grid-row:${row} / span ${span};grid-column:1;--i:${k++}"><span class="lv-l"><span class="lv-name">${lv.name}</span>${pips(L)}${L === 1 ? '<span class="lv-x2">2 TICKETS</span>' : ''}</span>${pay(L)}</div>`;
    });
    board.cats.forEach((c, ci) => c.tickets.forEach((t, r) => {
      const won = t.used ? (t.winner || 'none') : '';
      h += `<div class="tk lv${t.lvl}${t.used ? ' used ' + won : ''}" data-c="${ci}" data-r="${r}" data-act="cell:${ci}:${r}" style="grid-row:${r + 2};grid-column:${ci + 2};--i:${k++}">${t.used ? `<span class="tk-won">${won === 'none' ? 'NOBODY' : BC.tn(won)}</span>` : '<span class="tk-q">?</span>'}</div>`;
    }));
    h += '<div class="tk-sel" style="grid-row:2;grid-column:2"><i class="w"></i><i class="c"></i></div>';      // v0.3: the pick ring, shaped like a ticket (notches too)
    root.innerHTML = h + '</div>';
    S.appendChild(root);
    fitHeads(root);
    return root;
  }
  /* v0.2: the unit names (2 lines at most) and the level names shrink until they fit their card. Measured on the computer that shows them:
     the same font renders a little wider on some computers ("Four Operations 1" went to 3 lines and out of its box on one). */
  function fitHeads(root) {
    BC.$$('.bd-cat', root).forEach((c) => {
      const b = c.querySelector('b'); if (!b) return;
      for (let fs = 26; fs >= 14; fs--) {
        b.style.fontSize = fs + 'px';
        const lines = Math.round(b.offsetHeight / (fs * 1.08));
        if (lines <= 2 && b.scrollWidth <= b.clientWidth && c.scrollHeight <= c.clientHeight) break;
      }
    });
    BC.$$('.bd-lv', root).forEach((c) => {
      const n = c.querySelector('.lv-name'); if (!n) return;
      for (let fs = 20; fs >= 13 && c.scrollWidth > c.clientWidth; fs--) n.style.fontSize = fs + 'px';
    });
  }

  /* the picking team moves a cursor over the tickets and locks one in (controller, keys, or the teacher's mouse) */
  async function pickTicket(run, S, board, team, cursor, afford, progressNow, total, winners) {
    const M = BC.Match, root = drawBoard(S, board, run.year);
    const cells = () => BC.$$('.tk', root);
    const cell = (c, r) => root.querySelector(`.tk[data-c="${c}"][data-r="${r}"]`);
    const nCols = board.cats.length, nRows = Board.ROWS.length;
    // "Only tickets you can afford" (optional rule): a team can only pick a ticket whose cost it can pay, except the cheapest row
    const unused = (c, r) => !board.cats[c].tickets[r].used;
    const afforded = (c, r) => { const t = board.cats[c].tickets[r]; return !afford || t.lvl === 1 || run.score[team] >= t.damage; };
    const anyOk = board.cats.some((cat, ci) => cat.tickets.some((t, r) => !t.used && afforded(ci, r)));
    const free = (c, r) => unused(c, r) && (!anyOk || afforded(c, r));
    root.style.setProperty('--cc', Board.TEAM[team]);
    root.classList.add('picking');
    run.activeTeam = team; BC.setTurn(team);
    BC.UI.banner(S, BC.tn(team) + '’S TURN', team, 800).catch(() => {});
    cells().forEach((e) => { const c = +e.dataset.c, r = +e.dataset.r; if (unused(c, r) && !free(c, r)) { e.classList.add('locked'); e.dataset.need = board.cats[c].tickets[r].damage; } });
    infoBoxes(S, team, 'PICKS A TICKET', `<span class="k">TICKET <b>${progressNow + 1}</b><i>/ ${total}</i></span><span class="pr big" style="gap:${total > 20 ? 2 : 4}px">${progress(total, progressNow, winners)}</span>`);
    // start on a ticket that is still there
    if (!free(cursor.c, cursor.r)) { outer: for (let r = 0; r < nRows; r++) for (let c = 0; c < nCols; c++) if (free(c, r)) { cursor.c = c; cursor.r = r; break outer; } }
    const show = () => {
      cells().forEach((e) => { const on = +e.dataset.c === cursor.c && +e.dataset.r === cursor.r; e.classList.toggle('cur', on); if (on) e.dataset.who = BC.tn(team); else delete e.dataset.who; });
      const sel = root.querySelector('.tk-sel'); if (sel) { sel.style.gridRow = cursor.r + 2; sel.style.gridColumn = cursor.c + 2; }
      BC.$$('.bd-cat', root).forEach((e) => e.classList.toggle('on', +e.dataset.c === cursor.c));
      const L = Board.ROWS[cursor.r];
      BC.$$('.bd-lv', root).forEach((e) => e.classList.toggle('on', +e.dataset.lv === L));
    };
    const move = (dc, dr) => {
      let c = cursor.c, r = cursor.r;
      for (let k = 0; k < 8; k++) {
        c += dc; r += dr;
        if (c < 0 || c >= nCols || r < 0 || r >= nRows) return;
        if (free(c, r)) { cursor.c = c; cursor.r = r; BC.Audio.play('move'); show(); return; }
      }
    };
    show();
    let chosen = null, live = false, left = 25;
    const tk = ticker();
    root.addEventListener('mouseover', (e) => {                 // the mouse moves the cursor too
      const t = e.target.closest && e.target.closest('.tk'); if (!live || !t || BC.Input.teamCount(team) > 0) return;      // a team with a controller keeps its own cursor
      const c = +t.dataset.c, r = +t.dataset.r;
      if (free(c, r) && (c !== cursor.c || r !== cursor.r)) { cursor.c = c; cursor.r = r; BC.Audio.play('move'); show(); }
    });
    M.onInput = (ev) => {
      if (!live || ev.team !== team || ev.join) return;
      if (ev.act && ev.act.startsWith('cell:')) { const [, c, r] = ev.act.split(':').map(Number); if (free(c, r)) { cursor.c = c; cursor.r = r; chosen = { c, r }; } return; }
      if (ev.ok) { chosen = { c: cursor.c, r: cursor.r }; return; }
      if (ev.dir && !ev.face && !ev.repeat) move(ev.dir === 'left' ? -1 : ev.dir === 'right' ? 1 : 0, ev.dir === 'up' ? -1 : ev.dir === 'down' ? 1 : 0);
    };
    M.onFrame = (dt) => { if (live) { left -= dt; run.hud.setTimer(left, 25); tk(left); } };
    await M.sleep(450);
    live = true; run.hud.showTimer(true); run.hud.setTimer(left, 25);
    await M.waitFor(() => chosen || M.skip || M.skipRound, 25000);
    live = false; run.hud.showTimer(false); M.onInput = null; M.onFrame = null;
    if (!chosen) {                                   // out of time (or the teacher skipped): a random ticket
      const all = [];
      board.cats.forEach((c, ci) => c.tickets.forEach((t, r) => { if (free(ci, r)) all.push({ c: ci, r }); }));
      chosen = R.pick(all);
      cursor.c = chosen.c; cursor.r = chosen.r; show();
      BC.UI.banner(S, 'RANDOM PICK', null, 500).catch(() => {});
      await M.sleep(600);
    }
    BC.Audio.play('lock');
    const e = cell(chosen.c, chosen.r);
    gsap.to(e, { scale: 1.22, duration: 0.25, ease: 'back.out(3)' });
    await M.sleep(450);
    gsap.to(root, { opacity: 0, duration: 0.3 });
    await M.sleep(300);
    root.remove();
    S.querySelectorAll('.bd-who, .bd-tk').forEach((x) => x.remove());
    return { c: chosen.c, r: chosen.r, ticket: board.cats[chosen.c].tickets[chosen.r], cat: board.cats[chosen.c] };
  }

  Board.run = async function (run) {
    const M = BC.Match, UI = BC.UI, A = BC.Audio, Input = BC.Input, S = run.stageEl;
    S.classList.add('bdq');            // the answer rings need room: see the .bdq rules in game.css
    const board = Board.make(run.year), afford = BC.settings.guard === 'afford';
    const total = Math.max(1, Math.min(Math.round(+BC.settings.tickets) || 12, board.count));
    const cursor = { c: 2, r: 2 };
    const winners = [];
    let picks = 0, turn = Math.random() < 0.5 ? 'red' : 'blue';
    run.floor0 = true;
    run.hud.mid.style.display = 'none';             // the board shows its own progress
    run.hud.setPips(total, 0, winners);


    /* the cost of a wrong answer, never taking a team below zero */
    const takeAway = (team, dmg, x, y) => {
      const eff = Math.min(dmg, run.score[team]);
      if (eff > 0) run.add(team, -eff, x, y);
      return { eff };
    };

    /* a ticket that is a little game: the picking team plays it (reading time first, then GO); right = the reward, wrong or time up = the cost,
       then the other team may steal: it plays the same puzzle again (a bit shorter). A steal wins half, a wrong steal costs the full cost. */
    const miniTicket = async (tk, cat, item, turn) => {
      const card = UI.qcard(S, item.q, item.ref, run.data.book, null);
      card.classList.add('mini', 'buzz-' + turn);
      const info = infoBoxes(S, turn, 'MINI GAME', `<span class="u">${cat.sub} · ${BC.esc(cat.name)}</span><span class="lvm lv${tk.lvl}"><b>${tk.name}</b>${pips(tk.lvl)}</span>${pay(tk.lvl)}`);
      gsap.from([info.who, info.box], { y: -24, opacity: 0, duration: 0.4 });
      run.ticket = { mini: item.game, reward: tk.reward, damage: tk.damage, turn, lvl: tk.lvl };      // (for the test helpers)
      let winner = null;
      const setWho = (team, what) => { info.who.className = `bd-who ${team}`; info.who.innerHTML = `<b>${BC.tn(team)}</b><span>${what}</span>`; gsap.fromTo(info.who, { scale: 1.12 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, .5)' }); card.classList.remove('buzz-red', 'buzz-blue'); card.classList.add('buzz-' + team); };
      const play = async (team, secs, first) => {
        run.activeTeam = team; BC.setTurn(team);
        const inst = BC.Mini.mount(S, item, BC.Mini.RECT, team); run.mini = inst;
        gsap.from(inst.arena, { y: 30, opacity: 0, duration: 0.4 });
        await M.sleep(first ? 600 : 900);
        if (first) await BC.Modes.readTime(run, S, 6);
        if (M.skip || M.skipRound) return { inst, skipped: true };
        let left = secs, byTimer = false; const tk2 = ticker();
        inst.start();
        M.onInput = (ev) => { if (ev.team === team) inst.input(ev); };
        M.onFrame = (dt) => { left -= dt; run.hud.setTimer(left, secs); tk2(left); inst.frame(dt); };
        run.hud.showTimer(true); run.hud.setTimer(left, secs);
        await M.waitFor(() => inst.finished || M.skip || M.skipRound, secs * 1000);
        run.hud.showTimer(false); M.onInput = null; M.onFrame = null;
        if (M.skip || M.skipRound) return { inst, skipped: true };
        if (!inst.finished) { byTimer = true; inst.finish(false); }
        return { inst, ok: inst.result === true, timeUp: byTimer };
      };
      const judge = async (team, r, win) => {
        r.inst.reveal(r.ok, 'quiet');                       // a wrong attempt does not give the answer away (the other team may steal)
        const c = BC.centerOf(r.inst.arena);
        if (r.ok) { Input.rumble(team, 0.8, 250); winner = team; await UI.celebrate(S, team, team === turn ? 'CORRECT!' : 'STOLEN!', win); run.add(team, win, c.x, c.y); return true; }      // the points fly to the plate after the card (they covered it)
        Input.rumble(team, 0.5, 300);
        const p = takeAway(team, tk.damage, c.x, c.y);
        await UI.wrongScreen(S, team, r.timeUp ? 'TIME UP!' : 'WRONG!', p.eff ? `−${p.eff}` : '', team === turn ? 1350 : 1900, team === turn ? 'buzzer' : 'trumpet');      // v0.3: the big wrong screen (a failed steal gets the trumpet)
        return false;
      };
      let last = null;                                    // the arena of the last attempt
      const r1 = await play(turn, item.secs || 35, true);
      if (!r1.skipped) {
        const ok = await judge(turn, r1, tk.reward);
        gsap.to(r1.inst.arena, { opacity: 0.18, duration: 0.3 });
        if (!ok && !M.skip && !M.skipRound) {
          const st = other(turn), half = Math.round(tk.reward / 2);
          setWho(st, 'STEAL OR PASS?');
          const decision = await stealPanel(run, S, st, half, tk);
          r1.inst.destroy();
          if (decision === 'steal' && !M.skip && !M.skipRound) {
            setWho(st, 'STEALS');
            const r2 = await play(st, Math.round((item.secs || 35) * 0.7), false);
            if (!r2.skipped) { await judge(st, r2, half); last = r2.inst; }
          } else if (!M.skip && !M.skipRound) await UI.banner(S, 'PASSED', null, 550);
        }
      }
      /* nobody won the ticket (both wrong, or the steal was passed): the game solves itself so the whole class can see how it goes */
      if (!winner && !M.skip && !M.skipRound) {
        let inst = last;
        if (!inst) { inst = BC.Mini.mount(S, item, BC.Mini.RECT, 'sol'); gsap.from(inst.arena, { opacity: 0, duration: 0.3 }); }
        const ms = inst.showSolution();
        A.play('reveal');
        await M.sleep(ms + 1100);
      }
      M.skip = false;
      run.hud.showTimer(false); run.activeTeam = null; BC.setTurn(null);
      return { winner, card, info };
    };


    try {
      while (picks < total && !M.skipRound) {
        run.clear(); run.activeTeam = null; run.hud.setPips(total, picks, winners);
        const pick = await pickTicket(run, S, board, turn, cursor, afford, picks, total, winners);
        if (M.skipRound) break;
        const tk = pick.ticket, cat = pick.cat;
        tk.used = true; Board.used[run.year].add(tk.src.key);

        /* the question */
        run.clear(); run.hud.setPips(total, picks, winners);
        const item = Board.ask(run.year, tk);
        if (!item) { tk.winner = null; picks++; continue; }
        if (item.mini) {
          const mr = await miniTicket(tk, cat, item, turn);
          tk.winner = mr.winner; winners[picks] = mr.winner; picks++;
          run.hud.setPips(total, picks, winners);
          gsap.to([mr.info.who, mr.info.box], { opacity: 0, duration: 0.3 });
          if (M.skipRound) break;
          S.querySelectorAll('.mg-arena').forEach((a) => a.remove());
          await mr.card.solve(item.steps);
          await BC.Modes.waitNext(run);
          turn = other(turn);
          continue;
        }
        const { opts, right } = deal(item.opts);
        run.ticket = { right, reward: tk.reward, damage: tk.damage, turn, lvl: tk.lvl };      // (for the test helpers)
        const card = UI.qcard(S, item.q, item.ref, run.data.book, item.fig);
        const dm = UI.diamond(S, opts, 'nogl');
        dm.enter(); setTimeout(() => dm.fit(), 30);
        const info = infoBoxes(S, turn, 'ANSWERS', `<span class="u">${cat.sub} · ${BC.esc(cat.name)}</span><span class="lvm lv${tk.lvl}"><b>${tk.name}</b>${pips(tk.lvl)}</span>${pay(tk.lvl)}`);
        gsap.from([info.who, info.box], { y: -24, opacity: 0, duration: 0.4 });
        card.classList.add('buzz-' + turn);
        const tried = new Set();
        let winner = null;
        const setWho = (team, what) => { info.who.className = `bd-who ${team}`; info.who.innerHTML = `<b>${BC.tn(team)}</b><span>${what}</span>`; gsap.fromTo(info.who, { scale: 1.12 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, .5)' }); card.classList.remove('buzz-red', 'buzz-blue'); card.classList.add('buzz-' + team); };

        /* the answer: Y / X / B, the d-pad, the stick or the arrow keys only SELECT a tile (it lights up in the team's colour); A (Shift / Enter) confirms it.
           A mouse click selects, a second click on the same tile confirms. Nothing selected when the time ends = no answer. */
        const ask = async (team, secs) => {
          let answer = null, sel = null, left = secs; const armT = M.t + 350, tk2 = ticker();
          run.activeTeam = team; BC.setTurn(team);
          const choose = (dir) => { if (tried.has(dir) || dir === sel) return; sel = dir; dm.select(dir, team); A.play('move'); };
          M.onInput = (ev) => {
            if (ev.team !== team || ev.join || M.t < armT || answer) return;
            if (ev.mouse && ev.dir) { if (sel === ev.dir) answer = sel; else choose(ev.dir); return; }
            if (ev.ok) { if (sel) answer = sel; return; }
            if (ev.dir && !ev.repeat) choose(ev.dir);
          };
          M.onFrame = (dt) => { left -= dt; run.hud.setTimer(left, secs); tk2(left); };
          run.hud.showTimer(true); run.hud.setTimer(left, secs);
          await M.waitFor(() => answer || M.skip || M.skipRound, secs * 1000);
          run.hud.showTimer(false); M.onInput = null; M.onFrame = null; dm.select(null);
          return answer;
        };
        const judge = async (team, answer, win) => {
          if (!answer) {                                       // time up
            const p = takeAway(team, tk.damage);
            await UI.wrongScreen(S, team, 'TIME UP!', p.eff ? `−${p.eff}` : '', team === turn ? 1350 : 1900, team === turn ? 'buzzer' : 'trumpet');
            return false;
          }
          dm.pick(answer, team); await M.sleep(450);
          if (answer === right) {
            Input.rumble(team, 0.8, 250);
            const c = dm.center(answer); dm.reveal(right); winner = team;
            await UI.celebrate(S, team, team === turn ? 'CORRECT!' : 'STOLEN!', win);      // v0.3: the big celebration
            run.add(team, win, c.x, c.y);                                                     // then the points fly to the plate (at the same time they covered the card)
            return true;
          }
          Input.rumble(team, 0.5, 300);
          const c = dm.center(answer); const p = takeAway(team, tk.damage, c.x, c.y);
          tried.add(answer); dm.els[answer].classList.remove('pick-red', 'pick-blue'); dm.els[answer].classList.add('wrong-ans'); dm.shake(answer); UI.stampX(dm.els[answer]);
          await UI.wrongScreen(S, team, 'WRONG!', p.eff ? `−${p.eff}` : '', team === turn ? 1350 : 1900, team === turn ? 'buzzer' : 'trumpet');
          return false;
        };
        /* the steal offer: one panel, in the middle of the screen, the same for both teams */
        await M.sleep(600);
        await BC.Modes.readTime(run, S);
        // 1. the team that picked it
        let ans = await ask(turn, 20);
        if (!M.skip && !M.skipRound) {
          const ok = await judge(turn, ans, tk.reward);
          // 2. the other team may steal it, or pass
          if (!ok && !M.skip && !M.skipRound) {
            const st = other(turn), half = Math.round(tk.reward / 2);
            setWho(st, 'STEAL OR PASS?');
            const decision = await stealPanel(run, S, st, half, tk);
            if (decision === 'steal' && !M.skip && !M.skipRound) {
              setWho(st, 'STEALS');
              const a2 = await ask(st, 12);
              if (!M.skip && !M.skipRound) await judge(st, a2, half);
            } else if (!M.skip && !M.skipRound) await UI.banner(S, 'PASSED', null, 550);
          }
        }
        M.skip = false;
        run.hud.showTimer(false); run.activeTeam = null; BC.setTurn(null);
        if (!winner) { dm.reveal(right); A.play('reveal'); }
        tk.winner = winner;
        winners[picks] = winner; picks++;
        run.hud.setPips(total, picks, winners);
        gsap.to([info.who, info.box], { opacity: 0, duration: 0.3 });
        if (M.skipRound) break;
        await card.solve(item.steps);
        await BC.Modes.waitNext(run);
        turn = other(turn);
      }
    } finally {
      run.floor0 = false; run.activeTeam = null; BC.setTurn(null);
      run.hud.mid.style.display = '';
      S.classList.remove('bdq', 'stealing');
    }
    if (!M.skipRound) {
      run.clear();
      await UI.banner(run.stageEl, picks >= board.count ? 'BOARD CLEARED' : 'THAT’S THE LAST TICKET', null, 1300);
    }
  };

  /* =====================================================  the tie-break (v0.2)  =====================================================
     A speed race: both teams get the SAME four-answer question. The first press IS the answer (no selecting, no A to confirm):
     Y / X / B / A or the d-pad (or the arrow keys) pick the tile in that place. The FASTEST right answer wins 1 point.
     A wrong answer puts that team out for this question; the question ends when one team is right, or the time runs out (or both are out).
     Then the next question. The first team to 3 points wins, however many questions that takes (a question nobody wins does not count). */
  Board.tiebreak = async function (run) {
    const M = BC.Match, UI = BC.UI, A = BC.Audio, Input = BC.Input, S = run.stageEl, WIN = 3, SECS = 20;
    const wins = { red: 0, blue: 0 }, usedMk = new Set(), usedQ = new Set(), nUnits = BC.Graded.UNITS[run.year].length;
    const easy = BC.settings.level !== 'book';
    const nextItem = (lvl) => {
      for (let g = 0; g < 120; g++) {
        const ui = Math.floor(Math.random() * nUnits), list = BC.Graded.makers(run.year, ui, lvl);
        if (!list.length) continue;
        const mi = Math.floor(Math.random() * list.length), key = ui + ':' + lvl + ':' + mi;
        if (usedMk.has(key) && g < 80) continue;
        try {
          const it = list[mi]();
          if (!it || !it.opts || it.opts.length !== 4 || usedQ.has(it.q)) continue;
          if (words(it.q) > Board.SHORT && g < 100) continue;                          // short questions only: it is a race
          usedMk.add(key); usedQ.add(it.q); return it;
        } catch (e) { /* try another */ }
      }
      return null;
    };
    const plate = (t) => BC.$(`.hud-team.${t}`);
    const tally = (t, pop) => Array.from({ length: WIN }, (_, i) => `<i class="${i < wins[t] ? 'on' : ''}${pop && i === wins[t] - 1 ? ' pop' : ''}"></i>`).join('');
    const scoreHtml = (pop) => `<span class="u">FIRST TO ${WIN} POINTS</span><span class="tb-tal"><span class="red">${tally('red', pop === 'red')}</span><span class="vs">${wins.red}–${wins.blue}</span><span class="blue">${tally('blue', pop === 'blue')}</span></span>`;
    const boxes = (n) => {
      S.querySelectorAll('.bd-who, .bd-tk').forEach((e) => e.remove());
      const who = el('div', 'bd-who tb', `<b>TIE-BREAK</b><span>QUESTION ${n} · FASTEST WINS</span>`);
      const sc = el('div', 'bd-tk tbs', scoreHtml());
      S.append(who, sc);
      return { who, sc };
    };
    /* the big "this team got it" moment: the screen flashes in the team's colour and a huge name card drops in */
    const gotIt = async (team, done) => {                  // v0.3: the same big celebration as the board
      const pl = plate(team); if (pl) gsap.fromTo(pl, { scale: 1.12 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, .4)' });
      await UI.celebrate(S, team, done ? 'CHAMPIONS!' : 'GOT IT!', null, done ? 'WINS THE TIE-BREAK' : '+1 POINT', done ? 2600 : 1800);
    };

    S.classList.add('bdq');
    run.clear(); run.activeTeam = null; BC.setTurn(null);
    run.hud.mid.style.display = 'none';
    run.hud.setRound('TIE-BREAK', `First to ${WIN} points`);
    try {
      await M.intro(run, 0, 'tiebreak');
      M.skipRound = false;
      let n = 0;
      while (wins.red < WIN && wins.blue < WIN && !M.skipRound) {
        run.clear(); run.activeTeam = null; BC.setTurn(null);
        const lead = Math.max(wins.red, wins.blue);
        const item = nextItem(easy ? (lead < 2 ? 1 : 2) : (lead < 2 ? 2 : 3));
        if (!item) { await M.sleep(50); continue; }
        n++;
        const { opts, right } = deal(item.opts);
        run.tbRight = right;                                      // (for the test helpers)
        const card = UI.qcard(S, item.q, item.ref, run.data.book, item.fig);
        const dm = UI.diamond(S, opts, 'nogl');
        dm.enter(); setTimeout(() => dm.fit(), 30);
        const info = boxes(n);
        gsap.from([info.who, info.sc], { y: -24, opacity: 0, duration: 0.4 });
        await M.sleep(600);
        await BC.Modes.readTime(run, S, 5);

        /* the first press is the answer */
        const out = { red: false, blue: false }, tried = new Set();
        let winner = null, left = SECS;
        const armT = M.t + 250, tk2 = ticker();
        M.onInput = (ev) => {
          const t = ev.team;
          if (!t || !(t in out) || ev.join || ev.empty || M.t < armT || winner || out[t]) return;
          const ans = ev.dir && !ev.repeat ? ev.dir : ev.ok ? 'down' : null;          // A = the bottom tile
          if (!ans || tried.has(ans)) return;
          if (ans === right) { winner = t; return; }
          out[t] = true; tried.add(ans);                                                 // wrong: out for this question
          const o = dm.els[ans]; o.classList.add('wrong-ans'); dm.shake(ans); dm.chip(ans, t); UI.stampX(o);
          const pl = plate(t); if (pl) pl.classList.add('out');
          A.play('wrong'); Input.rumble(t, 0.3, 120);
        };
        M.onFrame = (dt) => { left -= dt; run.hud.setTimer(left, SECS); tk2(left); };
        run.hud.showTimer(true); run.hud.setTimer(left, SECS);
        await M.waitFor(() => winner || (out.red && out.blue) || M.skip || M.skipRound, SECS * 1000);
        run.hud.showTimer(false); M.onInput = null; M.onFrame = null;
        BC.$$('.hud-team').forEach((p) => p.classList.remove('out'));
        if (M.skipRound) break;

        if (winner) {
          wins[winner]++;
          dm.pick(right, winner); dm.chip(right, winner); A.play('correct'); Input.rumble(winner, 0.8, 250);
          BC.Crowd.react(winner, 'cheer', 1500, { p: 0.8, spread: 100 });
          dm.reveal(right);
          info.sc.innerHTML = scoreHtml(winner);
          const done = wins[winner] >= WIN;
          await gotIt(winner, done);
          if (done) break;
          await card.solve(item.steps);
          await BC.Modes.waitNext(run);
        } else {
          dm.reveal(right); A.play('reveal');
          await UI.banner(S, M.skip ? 'SKIPPED · NEXT QUESTION' : 'NO POINT · NEXT QUESTION', null, 1400);
          M.skip = false;
        }
      }
    } finally {
      M.onInput = null; M.onFrame = null; run.hud.showTimer(false); run.activeTeam = null; BC.setTurn(null);
      BC.$$('.hud-team').forEach((p) => p.classList.remove('out'));
      S.querySelectorAll('.tb-flash, .tb-got').forEach((e) => e.remove());
      run.hud.mid.style.display = '';
      S.classList.remove('bdq');
    }
    if (wins.red >= WIN || wins.blue >= WIN) {
      const w = wins.red >= WIN ? 'red' : 'blue';
      run.tieWin = w; run.tieNote = `WON THE TIE-BREAK ${wins[w]}–${wins[BC.other(w)]}`;
    }
    run.clear();
  };

  if (BC.Modes) BC.Modes.board = Board.run;
})();
