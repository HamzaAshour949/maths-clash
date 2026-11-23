/* Maths Clash rounds: Buzz in, Number sniper, Crack the code, Clue cracker, Tug of war. */
'use strict';
(function () {
  const { el, R, math, n } = BC;
  const M = BC.Match, UI = BC.UI, A = BC.Audio, Input = BC.Input;
  const Modes = BC.Modes = {};
  const quiet = (p) => p.catch(() => {});

  /* shuffle 4 options onto the 4 buttons; returns the options in DIRS order and where the right one went */
  function deal(opts) {
    const order = R.shuffle([0, 1, 2, 3]);
    return { opts: order.map((i) => opts[i]), right: BC.DIRS[order.indexOf(0)] };
  }

  /* countdown sound for the last 5 seconds */
  function ticker() {
    let lastS = 99;
    return (left) => { const s = Math.ceil(left); if (s <= 5 && s >= 1 && s < lastS) { A.play('tick', { high: s <= 3 }); } lastS = s; };
  }

  /* between questions: wait for A / Space, or (Settings → Next question by itself) go on after a few seconds, with a small countdown at the bottom */
  async function waitNext(run, ms = 18000) {
    await M.sleep(900);
    M.nextPressed = false;
    const auto = +BC.settings.auto || 0;
    if (!auto) { await M.waitFor(() => M.nextPressed || M.skip || M.skipRound, ms); M.skip = false; return; }
    const S = run.stageEl, pill = el('div', 'auto-next', `NEXT IN <b>${auto}</b>`);
    S.appendChild(pill);
    const until = M.t + auto * 1000, prev = M.onFrame;
    let shown = auto;
    M.onFrame = (dt) => { if (prev) prev(dt); const s = Math.max(1, Math.ceil((until - M.t) / 1000)); if (s !== shown) { shown = s; pill.querySelector('b').textContent = s; } };
    try { await M.waitFor(() => M.nextPressed || M.skip || M.skipRound, auto * 1000); }
    finally { M.onFrame = prev; pill.remove(); }
    M.skip = false;
  }
  Modes.waitNext = waitNext;

  /* Reading time: the presenter reads the question aloud before any answer timer starts. Space skips it. */
  Modes.readTime = async function (run, S, cap) {
    let secs = BC.settings.read == null ? 10 : BC.settings.read;
    if (cap != null) secs = Math.min(secs, cap);                // a short task (a mini game) needs less reading time
    if (!secs || M.skip || M.skipRound) return;
    const h = run.hud;
    let left = secs;
    h.timer.classList.add('reading'); h.showTimer(true); h.setTimer(left, secs);
    const prev = M.onFrame;
    M.onFrame = (dt) => { left -= dt; h.setTimer(left, secs); };
    M.readSkip = false;
    await M.waitFor(() => M.readSkip || M.skip || M.skipRound, secs * 1000);
    M.onFrame = prev;
    h.timer.classList.remove('reading');
    if (!M.skip && !M.skipRound) A.play('count', { go: true });
  };
  const BUZZ_PENALTY = 50, FLASH_PENALTY = 25;

  /* =============================== BUZZ IN =============================== */
  Modes.buzz = async function (run, o = {}) {
    const count = o.count || run.counts.buzz;
    const winners = [];
    for (let qi = 0; qi < count; qi++) {
      if (M.skipRound) break;
      run.clear();
      if (!o.sudden) run.hud.setPips(count, qi, winners);
      const S = run.stageEl;
      const item = (qi % 2 === 1 || o.sudden) && run.data.vis ? Modes.picture(run) : M.take(run.year, 'buzz', run.data.buzz);
      const { opts, right } = deal(item.opts);
      const card = UI.qcard(S, item.q, item.ref, run.data.book, item.fig);
      const dm = UI.diamond(S, opts);
      dm.enter(); setTimeout(() => dm.fit(), 30);
      const medal = el('div', 'medal', '<div class="m1">?</div><div class="m2">BUZZ IN</div>');
      S.appendChild(medal);
      gsap.from(medal, { scale: 0, duration: 0.5, delay: 0.3, ease: 'back.out(2)' });

      let phase = 'wait', buzzed = null, answer = null, armT = 0, stealer = null;
      let left = BC.settings.timer, total = left;
      const tried = new Set();
      const tk = ticker();
      M.onInput = (ev) => {
        if (!ev.team || ev.join) return;
        if (phase === 'buzz') {
          if (ev.face || ev.dpad || ev.ok || ev.shoulder || ev.key || ev.stick) { buzzed = ev.team; phase = 'armed'; }
          return;
        }
        const who = phase === 'answer' ? buzzed : phase === 'steal' ? stealer : null;
        if (who && ev.team === who && ev.dir && !ev.repeat && M.t > armT && !tried.has(ev.dir) && !answer) answer = ev.dir;
      };
      M.onFrame = (dt) => {
        if (phase === 'buzz' || phase === 'answer' || phase === 'steal') { left -= dt; run.hud.setTimer(left, total); tk(left); }
      };
      await M.sleep(700);
      await Modes.readTime(run, S);
      phase = 'buzz';
      run.hud.showTimer(true); run.hud.setTimer(left, total);
      await M.waitFor(() => buzzed || M.skip || M.skipRound, total * 1000);

      let winner = null;
      const tryAnswer = async (team, secs, pts, label) => {
        phase = team === buzzed ? 'answer' : 'steal';
        run.activeTeam = team; BC.setTurn(team);             // the teacher's mouse answers for this team
        armT = M.t + 350; answer = null; left = secs; total = secs;
        medal.className = 'medal ' + team;
        medal.innerHTML = `<div class="m1">${BC.tn(team)}</div><div class="m2">${label}</div>`;
        gsap.fromTo(medal, { scale: 1.5 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .4)' });
        await M.waitFor(() => answer || M.skip || M.skipRound, secs * 1000);
        run.activeTeam = null; BC.setTurn(null);
        phase = 'judge';
        run.hud.tag(team);
        if (!answer) {
          if (!M.skip && !M.skipRound) {
            if (team === buzzed) { run.add(team, -BUZZ_PENALTY); await UI.banner(S, `TIME UP  −${BUZZ_PENALTY}`, team, 650); }
            else await UI.banner(S, 'TIME UP', null, 500);
          }
          return false;
        }
        dm.pick(answer, team);
        await M.sleep(450);
        if (answer === right) {
          A.play('correct'); Input.rumble(team, 0.8, 250);
          const c = dm.center(answer);
          run.add(team, pts, c.x, c.y);
          dm.reveal(right);
          winner = team;
          await UI.banner(S, pts > 100 ? 'CORRECT!' : pts === 100 ? 'CORRECT!' : 'STOLEN!', team, 650);
          return true;
        }
        A.play('wrong'); Input.rumble(team, 0.3, 120);
        if (team === buzzed) { run.add(team, -BUZZ_PENALTY); UI.banner(S, `WRONG  −${BUZZ_PENALTY}`, team, 600).catch(() => {}); }
        tried.add(answer);
        dm.els[answer].classList.remove('pick-red', 'pick-blue');
        dm.els[answer].classList.add('wrong-ans');
        dm.shake(answer);
        await M.sleep(450);
        return false;
      };

      if (buzzed) {
        A.play('buzz', { team: buzzed }); Input.rumble(buzzed, 1, 260); BC.FX.glow(buzzed, 1.4); BC.Crowd.buzz(buzzed);
        { const c = BC.centerOf(medal); BC.FX.burst(c.x, c.y, BC.TEAMS[buzzed].color, 60, 1.2); }
        card.classList.add('buzz-' + buzzed);
        const ok = await tryAnswer(buzzed, 10, 100, 'ANSWER!');
        if (!ok && !M.skip && !M.skipRound) {
          stealer = BC.other(buzzed);
          A.play('buzz', { team: stealer }); Input.rumble(stealer, 0.7, 200); BC.FX.glow(stealer, 1); BC.Crowd.buzz(stealer);
          await tryAnswer(stealer, 8, o.sudden ? 100 : 50, 'STEAL!');
        }
      } else if (!M.skip && !M.skipRound) {
        phase = 'judge';
        await UI.banner(S, 'TIME UP', null, 600);
      }
      phase = 'done';
      winners[qi] = winner;
      run.hud.showTimer(false);
      medal.className = 'medal'; gsap.to(medal, { opacity: 0, scale: 0.6, duration: 0.3 });
      if (!winner) { dm.reveal(right); A.play('reveal'); }
      if (!o.sudden) run.hud.setPips(count, qi + 1, winners);
      if (M.skipRound) break;
      M.skip = false;
      await card.solve(item.steps);
      await waitNext(run);
      if (o.sudden && winner) break;
    }
  };

  /* =============================== NUMBER SNIPER =============================== */
  Modes.line = async function (run) {
    const count = run.counts.line;
    const winners = [];
    for (let qi = 0; qi < count; qi++) {
      if (M.skipRound) break;
      run.clear();
      run.hud.setPips(count, qi, winners);
      const S = run.stageEl;
      const L = M.take(run.year, 'line', run.data.line)();
      const line = el('div', 'nline');
      S.appendChild(line);
      const LW = line.clientWidth || 1600;
      const span = L.max - L.min, X = (v) => ((v - L.min) / span) * LW;
      const prompt = el('div', 'lprompt', `<span>${math(L.prompt)}</span><div class="ref">${run.data.book} · ${L.ref || ''}</div>`);
      S.appendChild(prompt);
      BC.fit(prompt, BC.portrait ? 80 : 76, 34);
      let ticks = '';
      const nT = Math.round(span / L.step);
      for (let i = 0; i <= nT; i++) {
        const v = L.min + i * L.step;
        const big = L.labels.some((lv) => Math.abs(lv - v) < L.step / 1000);
        ticks += `<i class="tk ${big ? 'big' : ''}" style="left:${X(v)}px"></i>`;
      }
      ticks += L.labels.map((v) => `<span class="lb" style="left:${X(v)}px">${L.fmt(v)}</span>`).join('');
      line.innerHTML = `<div class="axis"></div>${ticks}<div class="truth"><div class="pin"></div><div class="tl"></div></div>`;
      const mk = {};
      for (const t of ['red', 'blue']) {
        mk[t] = el('div', `mk ${t}`, `<div class="stem"></div><div class="puck">${t === 'red' ? 'R' : 'B'}</div><div class="lk">LOCKED</div>`);
        line.appendChild(mk[t]);
      }
      gsap.from(prompt, { y: -40, opacity: 0, duration: 0.5, ease: 'power3.out' });
      gsap.from(line, { scaleX: 0.2, opacity: 0, duration: 0.6, ease: 'power3.out' });
      const st = { red: { p: 0.5, locked: false, hold: 0 }, blue: { p: 0.5, locked: false, hold: 0 } };
      const place = () => { for (const t of ['red', 'blue']) mk[t].style.left = st[t].p * LW + 'px'; };
      place();
      let left = 15, total = 15, live = false;
      const tk = ticker();
      M.onInput = (ev) => {
        if (!live || !ev.team || ev.join) return;
        const s = st[ev.team];
        if (ev.ok && !s.locked) { s.locked = true; mk[ev.team].classList.add('locked', 'hidden'); run.hud.tag(ev.team, 'LOCKED IN'); A.play('lock'); Input.rumble(ev.team, 0.4, 90); }
        else if (ev.back && s.locked) { s.locked = false; mk[ev.team].classList.remove('locked', 'hidden'); run.hud.tag(ev.team); A.play('back'); }
      };
      M.onFrame = (dt) => {
        if (!live) return;
        left -= dt; run.hud.setTimer(left, total); tk(left);
        for (const t of ['red', 'blue']) {
          const s = st[t]; if (s.locked) continue;
          const held = Input.held(t), ax = Input.axis(t);
          let v = 0;
          if (held) { s.hold += dt; v = held * (0.025 + Math.min(s.hold / 1.4, 1) * 0.33); }
          else { s.hold = 0; v = Math.sign(ax) * ax * ax * 0.45; }
          s.p = Math.min(1, Math.max(0, s.p + v * dt));
        }
        place();
      };
      await M.sleep(700);
      await Modes.readTime(run, S);
      live = true; run.hud.showTimer(true);
      await M.waitFor(() => (st.red.locked && st.blue.locked) || M.skip || M.skipRound, total * 1000);
      live = false; run.hud.showTimer(false);
      if (M.skipRound) break;
      // reveal: both markers come back
      for (const t of ['red', 'blue']) { mk[t].classList.remove('hidden'); run.hud.tag(t); gsap.fromTo(mk[t].querySelector('.puck'), { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.5)' }); }
      await M.sleep(450);
      const tr = line.querySelector('.truth');
      tr.style.left = X(L.target) + 'px';
      tr.querySelector('.tl').innerHTML = math(L.showT || L.fmt(L.target));
      A.play('reveal');
      gsap.fromTo(tr, { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 0.5, ease: 'bounce.out' });
      await M.sleep(700);
      const tpos = (L.target - L.min) / span;
      const d = { red: Math.abs(st.red.p - tpos), blue: Math.abs(st.blue.p - tpos) };
      const fmtOff = (f) => { const v = f * span; return span <= 12 ? String(Math.round(v * 100) / 100) : n(Math.round(v / (L.step / 10)) * (L.step / 10)); };
      let win = null;
      if (Math.abs(d.red - d.blue) < 0.002) win = 'tie'; else win = d.red < d.blue ? 'red' : 'blue';
      for (const t of ['red', 'blue']) {
        const r = el('div', `lres ${t}`, `${BC.tn(t)}: off by ${fmtOff(d[t])}`);
        S.appendChild(r); gsap.from(r, { opacity: 0, y: 20, duration: 0.4 });
      }
      await M.sleep(500);
      const pos = (t) => BC.centerOf(mk[t].querySelector('.puck'));
      if (win === 'tie') { run.add('red', 50, pos('red').x, pos('red').y); run.add('blue', 50, pos('blue').x, pos('blue').y); A.play('correct'); await UI.banner(S, 'DEAD HEAT', null, 700); }
      else {
        run.add(win, 100, pos(win).x, pos(win).y); A.play('correct'); Input.rumble(win, 0.8, 220);
        await UI.banner(S, `${BC.tn(win)} IS CLOSER`, win, 700);
      }
      for (const t of ['red', 'blue']) {
        if (d[t] <= 0.01) { A.play('bullseye'); run.add(t, 50, pos(t).x, pos(t).y); await UI.banner(S, `${BC.tn(t)} BULLSEYE +50`, t, 700); }
      }
      winners[qi] = win === 'tie' ? null : win;
      run.hud.setPips(count, qi + 1, winners);
      await waitNext(run);
    }
  };

  /* =============================== CRACK THE CODE =============================== */
  Modes.code = async function (run) {
    const count = run.counts.code;
    const winners = [];
    const data = run.data;
    for (let qi = 0; qi < count; qi++) {
      if (M.skipRound) break;
      run.clear();
      run.hud.setPips(count, qi, winners);
      const S = run.stageEl;
      // alternate: book puzzle, then a fresh one of a book type
      let item = null;
      if (qi % 2 === 0 || !data.codeGen.length) item = M.take(run.year, 'code', data.code);
      for (let g = 0; !item && g < 5; g++) item = R.pick(data.codeGen)();
      if (!item) item = M.take(run.year, 'code', data.code);
      const map = item.map || null;
      const card = el('div', 'cpuzzle', `<div class="cq">${math(item.q)}</div><div class="cn">${math(item.note || (item.boxes > 1 ? 'Find the missing digits.' : 'Find the missing digit.'))}</div><div class="sol"></div><div class="ref">${data.book} · ${item.ref || ''}</div>`);
      S.appendChild(card);
      requestAnimationFrame(() => BC.fit(card.querySelector('.cq'), 64, 30));
      gsap.from(card, { y: -40, opacity: 0, duration: 0.5, ease: 'power3.out' });
      const st = {}, side = {};
      const draw = (t) => {
        const s = st[t];
        side[t].querySelector('.dq').innerHTML = math(item.q, (i) => {
          const b = map ? map[i] : i;
          const cls = s.result ? (s.result[b] ? 'ok' : 'bad') : (!s.locked && b === s.cur ? 'on' : '');
          return `<span class="dbox ${cls}">${s.locked && !s.result ? '•' : s.d[b]}</span>`;
        });
      };
      for (const t of ['red', 'blue']) {
        st[t] = { d: Array(item.boxes).fill(0), cur: 0, locked: false, lockT: 0, result: null };
        side[t] = el('div', `dialside ${t}`, `<div class="tname">${BC.tn(t)}</div><div class="dq"></div><div class="verdict"></div><div class="dstate"></div>`);
        S.appendChild(side[t]);
        draw(t);
        requestAnimationFrame(() => BC.fit(side[t].querySelector('.dq'), BC.portrait ? 84 : 60, 24));
        gsap.from(side[t], { y: 60, opacity: 0, duration: 0.5, delay: t === 'red' ? 0.1 : 0.2, ease: 'power3.out' });
      }
      let live = false, left = 35, total = 35;
      const tk = ticker();
      M.onInput = (ev) => {
        if (!live || !ev.team || ev.join) return;
        const s = st[ev.team];
        if (ev.ok && !s.locked) { s.locked = true; s.lockT = M.t; A.play('lock'); Input.rumble(ev.team, 0.4, 90); side[ev.team].querySelector('.dstate').textContent = 'LOCKED IN'; side[ev.team].querySelector('.dstate').classList.add('locked'); draw(ev.team); return; }
        if (ev.back && s.locked) { s.locked = false; A.play('back'); side[ev.team].querySelector('.dstate').textContent = ''; side[ev.team].querySelector('.dstate').classList.remove('locked'); draw(ev.team); return; }
        if (s.locked || !ev.dir || ev.face) return;
        if (ev.dir === 'up' || ev.dir === 'down') { s.d[s.cur] = (s.d[s.cur] + (ev.dir === 'up' ? 1 : 9)) % 10; A.play('dial', { up: ev.dir === 'up' }); }
        else { s.cur = (s.cur + (ev.dir === 'right' ? 1 : item.boxes - 1)) % item.boxes; A.play('move'); }
        draw(ev.team);
      };
      M.onFrame = (dt) => { if (!live) return; left -= dt; run.hud.setTimer(left, total); tk(left); };
      await M.sleep(700);
      await Modes.readTime(run, S);
      live = true; run.hud.showTimer(true);
      await M.waitFor(() => (st.red.locked && st.blue.locked) || M.skip || M.skipRound, total * 1000);
      live = false; run.hud.showTimer(false);
      if (M.skipRound) break;
      // judge
      const good = {};
      for (const t of ['red', 'blue']) {
        const s = st[t];
        good[t] = s.locked && (item.check ? item.check(s.d) : s.d.every((v, i) => v === item.answer[i]));
        s.result = s.d.map((v, i) => v === item.answer[i]);
        if (!s.locked) s.result = s.d.map(() => false);
        draw(t);
      }
      A.play('reveal');
      await M.sleep(400);
      const firsts = ['red', 'blue'].filter((t) => good[t]).sort((a, b) => st[a].lockT - st[b].lockT);
      for (const t of ['red', 'blue']) {
        gsap.to(side[t].querySelector('.dstate'), { opacity: 0, duration: 0.2 });
        const v = side[t].querySelector('.verdict');
        v.textContent = good[t] ? (firsts[0] === t && firsts.length ? 'CRACKED!' : 'CRACKED') : st[t].locked ? 'NOT QUITE' : 'NO ANSWER';
        v.style.color = good[t] ? 'var(--good)' : 'var(--ink3)';
        gsap.fromTo(v, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' });
      }
      if (firsts.length) {
        A.play('correct');
        firsts.forEach((t, i) => { const c = BC.centerOf(side[t]); run.add(t, i === 0 ? 150 : 100, c.x, c.y); });
        Input.rumble(firsts[0], 0.8, 220);
        await M.sleep(500);
        await UI.banner(S, firsts.length === 2 ? `${BC.tn(firsts[0])} WAS FASTER` : `${BC.tn(firsts[0])} CRACKED IT`, firsts[0], 700);
      } else { A.play('wrong'); await UI.banner(S, 'LOCKED OUT', null, 600); }
      winners[qi] = firsts[0] || null;
      run.hud.setPips(count, qi + 1, winners);
      // show the answer and the method
      card.classList.add('solved');
      card.querySelector('.cq').innerHTML = math(item.q, (i) => `<span class="dbox ok">${item.answer[map ? map[i] : i]}</span>`);
      BC.fit(card.querySelector('.cq'), 40, 22);
      const sol = card.querySelector('.sol');
      sol.innerHTML = (item.steps || []).map((s, i) => `<div class="stp"><span class="no">${i + 1}</span><span>${math(s)}</span></div>`).join('');
      if (BC.portrait) {
        gsap.to(card, { height: 440, duration: 0.3 });
        gsap.to(side.red, { top: 760, height: 440, duration: 0.3 });
        gsap.to(side.blue, { top: 1230, height: 440, duration: 0.3 });
      } else {
        gsap.to(card, { height: 300, duration: 0.3 });
        BC.$$('.dialside', S).forEach((d) => d.classList.add('compact'));
        gsap.to(BC.$$('.dialside', S), { top: 496, height: 312, duration: 0.3 });
      }
      let size = 30; const items = BC.$$('.stp', sol);
      await M.sleep(320);
      while (size > 18 && card.scrollHeight > card.clientHeight + 2) { size -= 2; items.forEach((it) => { it.style.fontSize = size + 'px'; }); }
      for (const it of items) { A.play('step'); gsap.fromTo(it, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.4 }); await M.sleep(600); }
      await waitNext(run);
    }
  };

  /* =============================== CLUE CRACKER =============================== */
  Modes.clue = async function (run) {
    const count = run.counts.clue;
    const winners = [];
    for (let qi = 0; qi < count; qi++) {
      if (M.skipRound) break;
      run.clear();
      run.hud.setPips(count, qi, winners);
      const S = run.stageEl;
      const item = M.take(run.year, 'clue', run.data.clue);
      const { opts, right } = deal(item.cands);
      const nC = item.clues.length;
      const worth = nC === 4 ? [250, 200, 150, 100] : [200, 150, 100];
      const card = el('div', 'cluecard', `<div class="ct">${BC.esc(item.title || 'Mystery')}: which one am I?</div><div class="worth"><span class="pill">Worth <b class="wv">${worth[0]}</b></span></div><div class="cl">${item.clues.map((c, i) => `<div class="cli"><span class="no">${i + 1}</span><span>${math(c)}</span></div>`).join('')}</div><div class="ref">${run.data.book} · ${item.ref || ''}</div>`);
      S.appendChild(card);
      gsap.from(card, { y: -30, opacity: 0, duration: 0.5 });
      const dm = UI.diamond(S, opts);
      dm.enter(); setTimeout(() => dm.fit(), 30);
      const medal = el('div', 'medal', '<div class="m1">?</div><div class="m2">LOCK IN</div>');
      S.appendChild(medal);
      const lock = { red: null, blue: null }, lockAt = { red: 0, blue: 0 }, lockT = { red: 0, blue: 0 };
      let shown = 0, live = false;
      const showClue = (k) => {
        shown = k + 1;
        const li = BC.$$('.cli', card)[k];
        A.play('step');
        gsap.fromTo(li, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' });
        const wv = card.querySelector('.wv'); wv.textContent = worth[k];
        gsap.fromTo(card.querySelector('.worth'), { scale: 1.3 }, { scale: 1, duration: 0.4 });
      };
      M.onInput = (ev) => {
        if (!live || !ev.team || ev.join || !ev.dir || ev.repeat || lock[ev.team]) return;
        lock[ev.team] = ev.dir; lockAt[ev.team] = shown; lockT[ev.team] = M.t;
        A.play('lock'); Input.rumble(ev.team, 0.5, 100); BC.FX.glow(ev.team, 0.8);
        run.hud.tag(ev.team, `LOCKED · ${worth[shown - 1]}`);
      };
      let left = 0, total = 1;
      const tk = ticker();
      M.onFrame = (dt) => { if (live) { left -= dt; run.hud.setTimer(left, total); if (shown === nC) tk(left); } };
      await M.sleep(600);
      live = true; run.hud.showTimer(true);
      const both = () => lock.red && lock.blue;
      for (let k = 0; k < nC; k++) {
        showClue(k);
        if (k === 0) { live = false; await Modes.readTime(run, S); live = true; }
        const secs = k === nC - 1 ? 10 : 6;
        left = secs; total = secs;
        await M.waitFor(() => both() || M.skip || M.skipRound, secs * 1000);
        if (both() || M.skip || M.skipRound) break;
      }
      live = false; run.hud.showTimer(false); run.hud.tag('red'); run.hud.tag('blue');
      if (M.skipRound) break;
      for (let k = shown; k < nC; k++) showClue(k);
      // reveal the choices
      gsap.to(medal, { opacity: 0, duration: 0.3 });
      for (const t of ['red', 'blue']) if (lock[t]) dm.chip(lock[t], t);
      A.play('reveal');
      await M.sleep(700);
      dm.reveal(right);
      const good = ['red', 'blue'].filter((t) => lock[t] === right).sort((a, b) => lockT[a] - lockT[b]);
      if (good.length) {
        A.play('correct');
        const c = dm.center(right);
        good.forEach((t) => run.add(t, worth[lockAt[t] - 1], c.x, c.y));
        await UI.banner(S, good.length === 2 ? 'BOTH CRACKED IT' : `${BC.tn(good[0])} CRACKED IT`, good.length === 2 ? null : good[0], 700);
      } else { A.play('wrong'); await UI.banner(S, 'NOBODY GOT IT', null, 600); }
      winners[qi] = good.length === 1 ? good[0] : good.length === 2 ? (lockAt.red < lockAt.blue ? 'red' : lockAt.blue < lockAt.red ? 'blue' : null) : null;
      run.hud.setPips(count, qi + 1, winners);
      // show which clue rules each one out
      const parse = item.parse || ((s) => +String(s).replace(/,/g, '').replace('−', '-'));
      for (const dir of BC.DIRS) {
        if (dir === right) continue;
        const v = parse(dm.values[dir]);
        const k = item.test.findIndex((f) => !f(v));
        const x = dm.els[dir].querySelector('.xby');
        x.textContent = k >= 0 ? `✘ clue ${k + 1}` : '';
        gsap.to(x, { opacity: 1, duration: 0.3 });
        await M.sleep(380); A.play('move');
      }
      await waitNext(run);
    }
  };

  /* =============================== QUICK DRAW: who presses first =============================== */
  Modes.draw = async function (run) {
    const count = run.counts.draw;
    const winners = [];
    for (let qi = 0; qi < count; qi++) {
      if (M.skipRound) break;
      run.clear();
      run.hud.setPips(count, qi, winners);
      const S = run.stageEl;
      const rule = M.take(run.year, 'draw', run.data.draw)();
      const card = el('div', 'qcard', `<div class="qt"><span>Hit your button when you see<br><b>${math(rule.rule)}</b></span></div><div class="ref">${run.data.book} · ${rule.ref || ''}</div>`);
      card.classList.add('drawcard');
      S.appendChild(card);
      BC.fit(card.querySelector('.qt'), 54, 22);
      gsap.from(card, { y: -30, opacity: 0, duration: 0.45 });
      const flash = el('div', 'flashnum', '');
      S.appendChild(flash);
      const tags = {};
      for (const t of ['red', 'blue']) { tags[t] = el('div', `drawtag ${t}`, BC.tn(t)); S.appendChild(tags[t]); }
      // the stream: 3 to 7 decoys, then a match; up to two matches per turn
      const seq = [];
      for (let m = 0; m < 2; m++) {
        const k = R.int(3, 7);
        for (let i = 0; i < k; i++) seq.push({ v: rule.no(), hit: false });
        seq.push({ v: rule.yes(), hit: true });
      }
      const frozen = { red: false, blue: false };
      let cur = null, live = false, winner = null;
      M.onInput = (ev) => {
        if (!live || !ev.team || ev.join || ev.repeat || frozen[ev.team] || winner) return;
        if (cur && cur.hit) { winner = ev.team; return; }
        frozen[ev.team] = true;
        A.play('wrong'); Input.rumble(ev.team, 0.3, 250);
        run.add(ev.team, -50);
        tags[ev.team].textContent = `${BC.tn(ev.team)}: FALSE START −50`;
        tags[ev.team].classList.add('frozen');
        gsap.fromTo(tags[ev.team], { scale: 1.3 }, { scale: 1, duration: 0.4 });
      };
      await Modes.readTime(run, S);
      for (const c of ['3', '2', '1']) { A.play('count'); await UI.banner(S, c, null, 330); }
      live = true;
      const speed = Math.max(700, 1150 - qi * 90);
      for (const item of seq) {
        cur = item;
        flash.innerHTML = math(item.v);
        BC.fit(flash, 170, 60);
        A.play('tick', { high: false });
        gsap.fromTo(flash, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.16, ease: 'back.out(2)' });
        await M.waitFor(() => winner || M.skip || M.skipRound || (frozen.red && frozen.blue), speed);
        if (winner || M.skip || M.skipRound || (frozen.red && frozen.blue)) break;
      }
      live = false;
      if (M.skipRound) break;
      if (winner) {
        A.play('buzz', { team: winner }); Input.rumble(winner, 1, 250);
        flash.classList.add('hit', winner);
        { const c = BC.centerOf(flash); run.add(winner, 100, c.x, c.y); }
        await UI.banner(S, `${BC.tn(winner)} WAS FASTEST!`, winner, 800);
      } else {
        await UI.banner(S, cur && cur.hit ? 'TOO SLOW!' : 'NOBODY', null, 700);
      }
      winners[qi] = winner;
      run.hud.setPips(count, qi + 1, winners);
      if (rule.why && cur) UI.status(S, math(rule.why(cur.v)));
      await M.sleep(600);
      await waitNext(run, 9000);
    }
  };

  /* =============================== LIGHTNING: one fast question, first right answer wins =============================== */
  Modes.flash = async function (run) {
    const S = run.stageEl, dur = run.counts.flash;
    run.hud.setPips(0, -1);
    let left = dur, live = false, done = 0;
    const got = { red: 0, blue: 0 };
    run.hud.showTimer(true); run.hud.setTimer(left, dur);
    for (const c of ['3', '2', '1']) { A.play('count'); await UI.banner(S, c, null, 330); }
    A.play('count', { go: true });
    const tk = ticker();
    M.onFrame = (dt) => { if (live) { left -= dt; run.hud.setTimer(left, dur); tk(left); } };
    while (left > 0 && !M.skipRound) {
      S.innerHTML = '';
      let item = null;
      if (run.data.vis && R.chance(0.6)) item = Modes.picture(run);
      for (let g = 0; g < 6 && !item; g++) { try { item = R.pick(run.data.tug)(); } catch (e) { item = null; } }
      const { opts, right } = deal(item.opts);
      const card = UI.qcard(S, item.q, `${item.ref ? run.data.book + ' · ' + item.ref + ' · ' : ''}Lightning ${done + 1}`, '', item.fig);
      const dm = UI.diamond(S, opts);
      dm.all().forEach((o) => { o.style.opacity = 1; });
      setTimeout(() => dm.fit(), 20);
      const score = el('div', 'status', `<b class="red-ink">RED ${got.red}</b> &nbsp;·&nbsp; <b class="blue-ink">BLUE ${got.blue}</b>`);
      S.appendChild(score);
      const out = new Set();
      let winner = null;
      live = true;
      M.onInput = (ev) => {
        if (!live || !ev.team || ev.join || !ev.dir || ev.repeat || out.has(ev.team) || winner) return;
        if (ev.dir === right) { winner = ev.team; dm.pick(ev.dir, ev.team); return; }
        out.add(ev.team); A.play('wrong'); Input.rumble(ev.team, 0.3, 150); run.add(ev.team, -FLASH_PENALTY);
        dm.chip(ev.dir, ev.team); dm.shake(ev.dir); dm.els[ev.dir].classList.add('wrong-ans');
        run.hud.tag(ev.team, 'OUT');
      };
      await M.waitFor(() => winner || out.size === 2 || left <= 0 || M.skip || M.skipRound, Math.max(0, left) * 1000 + 50);
      live = false; M.skip = false;
      run.hud.tag('red'); run.hud.tag('blue');
      if (M.skipRound) break;
      dm.reveal(right);
      if (winner) {
        got[winner]++;
        A.play('correct'); Input.rumble(winner, 0.6, 120);
        const c = dm.center(right);
        run.add(winner, 50, c.x, c.y);
      } else A.play('reveal');
      done++;
      await M.sleep(winner ? 650 : 1100);
      void card;
    }
    live = false; run.hud.showTimer(false);
    if (M.skipRound) return;
    S.innerHTML = '';
    const win = got.red > got.blue ? 'red' : got.blue > got.red ? 'blue' : null;
    await UI.banner(S, win ? `${BC.tn(win)} ${got[win]} – ${got[BC.other(win)]}` : `DRAW ${got.red} – ${got.blue}`, win, 1200);
    await waitNext(run, 6000);
  };

  /* one picture question for this year (never the same type twice in a row) */
  Modes.picture = function (run) {
    const list = run.data.vis;
    let g, guard = 0;
    do { g = R.pick(list); } while (g === Modes.lastPic && guard++ < 6);
    Modes.lastPic = g;
    for (let t = 0; t < 6; t++) { try { const it = g(); if (it) return it; } catch (e) { /* try again */ } }
    return R.pick(list)();
  };

  /* =============================== PICTURE ROUND =============================== */
  Modes.pic = async function (run) {
    const count = run.counts.pic;
    const winners = [];
    for (let qi = 0; qi < count; qi++) {
      if (M.skipRound) break;
      run.clear();
      run.hud.setPips(count, qi, winners);
      const S = run.stageEl;
      const item = Modes.picture(run);
      const { opts, right } = deal(item.opts);
      const card = UI.qcard(S, item.q, item.ref, run.data.book, item.fig);
      const dm = UI.diamond(S, opts);
      dm.enter(); setTimeout(() => dm.fit(), 30);
      const medal = el('div', 'medal', '<div class="m1">?</div><div class="m2">LOCK IN</div>');
      S.appendChild(medal);
      const lock = { red: null, blue: null }, lockT = { red: 0, blue: 0 };
      let live = false, left = 25, total = 25;
      const tk = ticker();
      M.onInput = (ev) => {
        if (!live || !ev.team || ev.join || !ev.dir || ev.repeat || lock[ev.team]) return;
        lock[ev.team] = ev.dir; lockT[ev.team] = M.t;
        A.play('lock'); Input.rumble(ev.team, 0.5, 100); BC.FX.glow(ev.team, 0.8);
        run.hud.tag(ev.team, 'LOCKED IN');
      };
      M.onFrame = (dt) => { if (live) { left -= dt; run.hud.setTimer(left, total); tk(left); } };
      await M.sleep(700);
      await Modes.readTime(run, S);
      live = true; run.hud.showTimer(true);
      await M.waitFor(() => (lock.red && lock.blue) || M.skip || M.skipRound, total * 1000);
      live = false; run.hud.showTimer(false); run.hud.tag('red'); run.hud.tag('blue');
      if (M.skipRound) break;
      M.skip = false;
      gsap.to(medal, { opacity: 0, duration: 0.3 });
      for (const t of ['red', 'blue']) if (lock[t]) dm.chip(lock[t], t);
      A.play('reveal');
      await M.sleep(600);
      dm.reveal(right);
      const good = ['red', 'blue'].filter((t) => lock[t] === right).sort((a, b) => lockT[a] - lockT[b]);
      if (good.length) {
        A.play('correct');
        const c = dm.center(right);
        good.forEach((t, i) => run.add(t, i === 0 ? 150 : 100, c.x, c.y));
        Input.rumble(good[0], 0.8, 200);
        await UI.banner(S, good.length === 2 ? `${BC.tn(good[0])} WAS FASTER` : `${BC.tn(good[0])} GOT IT`, good[0], 700);
      } else { A.play('wrong'); await UI.banner(S, 'NOBODY GOT IT', null, 600); }
      winners[qi] = good[0] || null;
      run.hud.setPips(count, qi + 1, winners);
      await card.solve(item.steps);
      await waitNext(run);
    }
  };

  /* =============================== TUG OF WAR =============================== */
  Modes.tug = async function (run) {
    const S = run.stageEl;
    const dur = run.counts.tug, WIN = 8;
    const RW = BC.portrait ? 880 : 1620, MID = RW / 2, STEP = (MID - 60) / WIN;
    run.hud.setPips(0, -1);
    const rope = el('div', 'rope-wrap', `<div class="rope"></div>${Array.from({ length: 2 * WIN + 1 }, (_, i) => `<i class="rope-mark" style="left:${MID + (i - WIN) * STEP}px;${i === WIN ? 'background:#fff;height:70px;top:25px' : ''}"></i>`).join('')}<div class="rope-end red">R</div><div class="rope-end blue">B</div><div class="knot" style="left:${MID}px">0</div>`);
    S.appendChild(rope);
    const knot = rope.querySelector('.knot');
    const st = { pos: 0 };
    const side = {};
    for (const t of ['red', 'blue']) {
      side[t] = el('div', `tside ${t}`, `<div class="tq"></div><div class="lockout">FROZEN!</div><div class="cnt">0 RIGHT</div>`);
      S.appendChild(side[t]);
      st[t] = { right: null, ready: false, lockUntil: 0, n: 0, dm: null };
      gsap.from(side[t], { y: 80, opacity: 0, duration: 0.5, delay: t === 'red' ? 0 : 0.1 });
    }
    gsap.from(rope, { scaleX: 0.3, opacity: 0, duration: 0.6 });
    const newQ = (t) => {
      const s = st[t];
      let item = null;
      for (let g = 0; g < 12 && !item; g++) { try { item = R.pick(run.data.tug)(); if (item && item.fig && !item.small) item = null; } catch (e) { item = null; } }
      const { opts, right } = deal(item.opts);
      s.right = right;
      if (s.dm) s.dm.all().forEach((o) => o.remove());
      const tq = side[t].querySelector('.tq');
      tq.innerHTML = item.fig ? `<span class="tfig">${item.fig}</span><span class="ttx">${math(item.q)}</span>` : `<span>${math(item.q)}</span>`;
      tq.classList.toggle('hasfig', !!item.fig);
      BC.fit(item.fig ? tq.querySelector('.ttx') : tq, item.fig ? 36 : 46, 18);
      s.dm = UI.diamond(side[t], opts);
      s.dm.all().forEach((o) => side[t].insertBefore(o, side[t].querySelector('.lockout')));
      s.dm.fit();
      gsap.fromTo(s.dm.all(), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.22, stagger: 0.03 });
      gsap.fromTo(tq, { opacity: 0.2 }, { opacity: 1, duration: 0.2 });
      s.ready = true;
    };
    const moveKnot = () => {
      gsap.to(knot, { left: MID + st.pos * STEP, duration: 0.45, ease: 'elastic.out(1, .55)' });
      knot.textContent = Math.abs(st.pos);
      knot.style.color = st.pos < 0 ? '#a3282d' : st.pos > 0 ? '#1d4fa8' : '#1b2040';
    };
    newQ('red'); newQ('blue');
    BC.$$('.opt', S).forEach((o) => { o.style.visibility = 'hidden'; });
    BC.$$('.tq', S).forEach((o) => { o.style.visibility = 'hidden'; });
    for (const c of ['3', '2', '1']) { A.play('count'); await UI.banner(S, c, null, 380); }
    BC.$$('.opt, .tq', S).forEach((o) => { o.style.visibility = ''; });
    A.play('count', { go: true });
    UI.banner(S, 'PULL!', null, 400).catch(() => {});
    let left = dur, live = true;
    const tk = ticker();
    run.hud.showTimer(true);
    M.onInput = (ev) => {
      if (!live || !ev.team || ev.join || !ev.dir || ev.repeat) return;
      const t = ev.team, s = st[t];
      if (!s.ready || M.t < s.lockUntil) return;
      s.ready = false;
      if (ev.dir === s.right) {
        s.n++;
        side[t].querySelector('.cnt').textContent = `${s.n} RIGHT`;
        st.pos += t === 'red' ? -1 : 1;
        moveKnot();
        s.dm.reveal(s.right);
        A.play('pull', { team: t, step: s.n }); Input.rumble(t, 0.6, 120); BC.FX.glow(t, 0.9);
        BC.Crowd.react(t, 'cheer', 800, { p: 0.85, spread: 120 }); BC.Crowd.react(BC.other(t), 'nerv', 800, { p: 0.6, spread: 120 });
        { const c = BC.centerOf(knot); BC.FX.burst(c.x + (t === 'red' ? -1 : 1) * STEP, c.y, BC.TEAMS[t].color, 26, 0.7); }
        quiet(M.sleep(320).then(() => { if (live) newQ(t); }));
      } else {
        A.play('wrong'); Input.rumble(t, 0.25, 300);
        BC.Crowd.react(t, () => (Math.random() < 0.6 ? 'sad' : 'angry'), 1300, { spread: 150 });
        s.dm.els[ev.dir].classList.add('wrong-ans'); s.dm.shake(ev.dir);
        s.dm.els[s.right].classList.add('right-ans');
        s.lockUntil = M.t + 1600;
        const lo = side[t].querySelector('.lockout');
        gsap.timeline().to(lo, { opacity: 1, duration: 0.15 }).to(lo, { opacity: 0, duration: 0.25, delay: 1.2 });
        quiet(M.sleep(1600).then(() => { if (live) newQ(t); }));
      }
    };
    M.onFrame = (dt) => { if (!live) return; left -= dt; run.hud.setTimer(left, dur); tk(left); };
    await M.waitFor(() => Math.abs(st.pos) >= WIN || M.skip || M.skipRound, dur * 1000);
    live = false; run.hud.showTimer(false);
    M.skip = false;
    if (M.skipRound) return;
    BC.$$('.tside .opt', S).forEach((o) => gsap.to(o, { opacity: 0.25, duration: 0.3 }));
    const win = st.pos < 0 ? 'red' : st.pos > 0 ? 'blue' : null;
    await M.sleep(300);
    if (win) {
      A.play('correct'); BC.FX.confetti(win, 90);
      { const c = BC.centerOf(side[win]); run.add(win, 300, c.x, c.y); }
      await UI.banner(S, `${BC.tn(win)} WINS THE TUG!`, win, 1100);
    } else {
      run.add('red', 100); run.add('blue', 100);
      await UI.banner(S, 'A DRAW! +100 EACH', null, 1000);
    }
    await waitNext(run, 8000);
  };
})();
