/* Maths Clash match engine: a pausable clock, the rounds, scoring. */
'use strict';
(function () {
  const { el, R } = BC;
  const M = BC.Match = { t: 0, paused: false, waiters: [], skip: false, skipRound: false, aborted: false, run: null };

  /* the match clock only moves while the game is not paused */
  let last = performance.now();
  function tick(now) {
    const dt = now - last; last = now;
    if (!M.paused) M.t += dt * BC.speed;
    for (let i = M.waiters.length - 1; i >= 0; i--) {
      const w = M.waiters[i];
      if (M.aborted) { M.waiters.splice(i, 1); w.rej(new Error('abort')); continue; }
      if (M.paused) continue;
      if (w.pred && w.pred()) { M.waiters.splice(i, 1); w.res(true); continue; }
      if (M.t >= w.until) { M.waiters.splice(i, 1); w.res(!w.pred); }
    }
    if (M.onFrame && !M.paused) M.onFrame(dt * BC.speed / 1000);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  M.sleep = (ms) => new Promise((res, rej) => M.waiters.push({ until: M.t + ms, res, rej }));
  M.waitFor = (pred, ms = 1e12) => new Promise((res, rej) => M.waiters.push({ until: M.t + ms, pred, res, rej }));
  M.abort = function () { M.aborted = true; M.onFrame = null; };

  /* how many questions in each round */
  M.COUNTS = {
    short: { buzz: 3, pic: 3, draw: 3, line: 3, code: 2, flash: 30, clue: 2, tug: 45 },
    normal: { buzz: 4, pic: 5, draw: 4, line: 4, code: 3, flash: 45, clue: 3, tug: 60 },
    long: { buzz: 7, pic: 8, draw: 6, line: 6, code: 5, flash: 60, clue: 5, tug: 90 },
  };

  M.ROUNDS = {
    buzz: { name: 'BUZZ IN', short: 'Buzz in', desc: 'Hit your buzzer first, then answer. A wrong answer costs 50 and the other team can steal.', how: ['Any button = buzz', 'Then press the answer\'s button'] },
    pic: { name: 'PICTURE ROUND', short: 'Picture round', desc: 'Every question is a picture: charts, number lines, shapes, fractions, grids. Both teams lock in one answer; the faster right answer earns a bonus.', how: ['Press the answer\'s button', 'One guess each'] },
    draw: { name: 'QUICK DRAW', short: 'Quick draw', desc: 'Numbers flash up one by one. Be the first to hit your button when one fits the rule. Press too early and you lose 50!', how: ['Any button = fire', 'Wait for the right number'] },
    line: { name: 'NUMBER SNIPER', short: 'Number sniper', desc: 'Slide your marker to the number on the line. Closest team scores. Dead on = bullseye bonus.', how: ['Stick or ← → to aim', 'A / Shift / Enter to lock'] },
    code: { name: 'CRACK THE CODE', short: 'Crack the code', desc: 'Find the missing digits. Every right team scores, the fastest gets a bonus.', how: ['↑ ↓ change the digit', '← → next box · A to lock'] },
    flash: { name: 'LIGHTNING', short: 'Lightning', desc: 'Quick-fire questions for both teams. The first right answer scores 50; a wrong answer costs 25 and puts you out of that question.', how: ['Press the answer\'s button', 'A wrong answer puts you out'] },
    clue: { name: 'CLUE CRACKER', short: 'Clue cracker', desc: 'Clues appear one at a time. Lock in early for big points, but a wrong guess scores nothing.', how: ['Press the answer\'s button', 'Fewer clues = more points'] },
    tug: { name: 'TUG OF WAR', short: 'Tug of war', desc: 'Rapid fire! Every right answer pulls the rope your way. A wrong answer freezes you.', how: ['Answer as fast as you can', 'Pull the knot to your side'] },
  };
  M.ORDER = ['buzz', 'pic', 'draw', 'line', 'code', 'flash', 'clue', 'tug'];
  /* the other way to play: one board of tickets (not one of the eight rounds; chosen in the lobby or Settings) */
  M.ROUNDS.board = { name: 'TICKET BOARD', short: 'Ticket board', k1: 'A NEW GAME', desc: 'Pick a ticket from the board. The harder the ticket, the more it wins and the more it costs. Wrong? The other team can steal it for half the reward, or pass. Picked tickets are gone, and scores never go below zero.', how: ['Move to a ticket · A locks it', 'Answer · wrong = the other team may steal'] };

  /* pick items without repeating them until the list runs out */
  const used = {};
  M.take = function (year, kind, list) {
    const key = year + kind;
    used[key] = used[key] || new Set();
    if (used[key].size >= list.length) used[key].clear();
    const free = list.map((_, i) => i).filter((i) => !used[key].has(i));
    const i = R.pick(free);
    used[key].add(i);
    return list[i];
  };

  /* ---------- one match ---------- */
  M.start = async function (year) {
    M.aborted = false; M.paused = false; M.hold = false; document.body.classList.remove('on-hold'); M.skip = false; M.skipRound = false;
    const data = BC.DATA[year];
    const counts = M.COUNTS[BC.settings.length] || M.COUNTS.normal;
    const boardMode = BC.settings.mode === 'board';
    const rounds = boardMode ? ['board'] : M.ORDER.filter((r) => BC.settings.rounds[r] !== false);
    if (!rounds.length) rounds.push('buzz');
    const run = M.run = { year, data, score: { red: 0, blue: 0 }, counts, rounds, history: [] };
    const root = BC.$('#screen'); root.innerHTML = '';
    const layer = el('div', 'layer'); root.appendChild(layer);
    run.root = layer;                                   // the full board: round intros slide across all of it
    const field = el('div', 'layer playfield'); layer.appendChild(field);   // the game itself, a little smaller to leave room for the stands
    run.hud = BC.UI.hud(field, run);
    run.stageEl = el('div', 'layer'); field.appendChild(run.stageEl);
    run.add = function (team, pts, x, y) {
      if (run.floor0 && pts < 0) pts = -Math.min(-pts, run.score[team]);      // the ticket board never takes a team below zero
      if (!pts) return;
      run.score[team] = run.score[team] + pts;
      run.hud.score(team, pts, x, y);
      if (pts) BC.Crowd.score(team, pts);
      if (pts > 0) { BC.FX.glow(team, 1); if (x != null) { BC.FX.burst(x, y, BC.TEAMS[team].color, 46); BC.FX.ring(x, y, BC.TEAMS[team].color); } }
    };
    run.clear = function () { run.stageEl.innerHTML = ''; BC.Input.handler = BC.App.matchInput; M.onInput = null; M.onFrame = null; run.hud.showTimer(false); run.hud.tag('red'); run.hud.tag('blue'); };
    BC.Audio.setMood('battle');
    BC.Crowd.calm();
    try {
      for (let i = 0; i < rounds.length; i++) {
        const key = rounds[i];
        run.roundIndex = i;
        run.clear();
        run.hud.setRound(key === 'board' ? M.ROUNDS.board.name : `ROUND ${i + 1} · ${M.ROUNDS[key].name}`, data.label);
        run.hud.setPips(0, -1);
        await M.intro(run, i + 1, key);
        M.skipRound = false;
        await BC.Modes[key](run);
        run.clear();
        if (i < rounds.length - 1) await M.summary(run, i + 1);
      }
      run.clear();
      if (run.score.red === run.score.blue && !M.skipRound) { if (boardMode && BC.Board && BC.Board.tiebreak) await BC.Board.tiebreak(run); else await M.suddenDeath(run); }
      BC.App.go('results', run);
    } catch (e) {
      if (e.message !== 'abort') { console.error(e); BC.App.go('menu'); }
    }
  };

  /* the tie-break after a ticket-board game that ends level (the board file plays it) */
  M.ROUNDS.tiebreak = { name: 'TIE-BREAK', k1: "IT'S A TIE ON POINTS", desc: 'Both teams get the SAME question. Press your answer: no A needed. The FASTEST right answer wins 1 point. A wrong answer is out for that question. First team to 3 points wins.', how: ['Press your answer: no A needed', 'Fastest right answer = 1 point', 'First to 3 points wins'] };

  /* ---------- round intro: two slabs crash in ---------- */
  M.intro = async function (run, num, key) {
    const r = M.ROUNDS[key];
    const box = el('div', 'intro', `<div class="slab r"></div><div class="slab b"></div><div class="txt"><div class="k1">${r.k1 || `ROUND ${num} OF ${run.rounds.length}`}</div><div class="k2">${r.name}</div><div class="demo">${BC.Demos && BC.Demos[key] ? BC.Demos[key]() : ''}</div><div class="k3">${BC.esc(r.desc)}</div><div class="k4">${r.how.map((h) => `<span class="pill">${BC.esc(h)}</span>`).join('')}</div><div class="k5">Press <b>A</b> or <b>Space</b> when everyone is ready</div></div>`);
    run.root.appendChild(box);
    const [sr, sb] = BC.$$('.slab', box), txt = box.querySelector('.txt');
    BC.Audio.play('whoosh');
    gsap.fromTo(sr, { xPercent: -110 }, { xPercent: 0, duration: 0.55, ease: 'power4.out' });
    gsap.fromTo(sb, { xPercent: 110 }, { xPercent: 0, duration: 0.55, ease: 'power4.out' });
    gsap.fromTo(txt.children, { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.09, delay: 0.35, ease: 'back.out(1.6)' });
    await M.sleep(450); BC.Audio.play('slam'); BC.Input.rumble(null, 0.5, 200); BC.Crowd.react('both', 'cheer', 1500);
    await M.sleep(2500);                       // a stray press cannot skip it
    M.introSkip = false; M.nextPressed = false;
    const k5 = box.querySelector('.k5');
    const pulse = gsap.to(k5, { opacity: 0.35, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    await M.waitFor(() => M.skip || M.introSkip || M.nextPressed, 60000);
    pulse.kill();
    M.introSkip = false; M.nextPressed = false; M.skip = false;
    gsap.to(txt, { opacity: 0, scale: 1.1, duration: 0.3 });
    gsap.to(sr, { xPercent: -120, duration: 0.5, ease: 'power3.in', delay: 0.1 });
    gsap.to(sb, { xPercent: 120, duration: 0.5, ease: 'power3.in', delay: 0.1 });
    await M.sleep(650);
    box.remove();
  };

  /* ---------- score check between rounds ---------- */
  M.summary = async function (run, after) {
    const { red, blue } = run.score;
    const lead = red === blue ? 'All square!' : `${BC.tn(red > blue ? 'red' : 'blue')} leads by ${Math.abs(red - blue)}`;
    const s = el('div', 'sum', `<div class="h">AFTER ROUND ${after}</div><div class="scores"><div class="tsc red"><div class="nm">${BC.tn('red')}</div><div class="v">${red}</div></div><div class="vs">VS</div><div class="tsc blue"><div class="nm">${BC.tn('blue')}</div><div class="v">${blue}</div></div></div><div class="lead">${lead}</div>`);
    run.stageEl.appendChild(s);
    if (red !== blue) BC.Crowd.react(red > blue ? 'red' : 'blue', 'cheer', 2200);
    gsap.from(BC.$$('.tsc', s), { scale: 0.6, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'back.out(1.7)' });
    gsap.from(s.querySelector('.lead'), { opacity: 0, y: 20, delay: 0.5 });
    BC.UI.status(run.stageEl, 'Press <b>A</b> or <b>Space</b> for the next round');
    M.nextPressed = false;
    await M.sleep(1500);
    M.nextPressed = false;
    await M.waitFor(() => M.nextPressed || M.skip, 60000);
    M.skip = false;
    gsap.to(s, { opacity: 0, duration: 0.3 });
    await M.sleep(300);
  };

  /* ---------- a tie: one buzz-in question decides it ---------- */
  M.suddenDeath = async function (run) {
    run.hud.setRound('SUDDEN DEATH', 'First right answer wins');
    const box = el('div', 'intro', `<div class="slab r"></div><div class="slab b"></div><div class="txt"><div class="k1">IT'S A TIE</div><div class="k2">SUDDEN DEATH</div><div class="k3">One question. First right answer wins the match.</div></div>`);
    run.root.appendChild(box);
    BC.Audio.play('slam'); BC.Crowd.gasp('both');
    gsap.from(box.children, { opacity: 0, scale: 1.3, duration: 0.5 });
    await M.sleep(2600);
    box.remove();
    for (let guard = 0; guard < 6 && run.score.red === run.score.blue; guard++) {
      await BC.Modes.buzz(run, { count: 1, sudden: true });
      run.clear();
    }
  };
})();
