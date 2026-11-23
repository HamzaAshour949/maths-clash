/* Maths Clash screens: title, year menu, team lobby, how to play, settings, pause, results. */
'use strict';
(function () {
  const { el, $, $$ } = BC;
  const M = BC.Match, A = BC.Audio, Input = BC.Input, Art = BC.Art, Crowd = BC.Crowd;
  const App = BC.App = { screen: null, year: 5 };

  App.go = function (name, arg) {
    if (App.screen && App.screen.exit) App.screen.exit();
    BC.Match.onFrame = null;
    const root = $('#screen');
    root.innerHTML = '';
    App.screen = Screens[name];
    App.name = name; App.arg = arg;
    Crowd.wave(false); Crowd.calm();
    A.ambient(name === 'match' ? 0.045 : name === 'help' || name === 'settings' ? 0.035 : 0.09);   // the audience's murmur, quietest while the students think
    Crowd.setVisible(name !== 'help' && name !== 'settings');
    if (Crowd.relabel) Crowd.relabel();
    Input.handler = (ev) => App.screen.onInput && App.screen.onInput(ev);
    App.screen.enter(root, arg);
  };

  /* a vertical / grid list driven by any controller, the keyboard or the mouse */
  function focusList(items, { onPick, onSide, start = 0, cols = 1, onMove } = {}) {
    let i = start;
    const set = (k, sound = true) => {
      i = (k + items.length) % items.length;
      items.forEach((it, j) => it.classList.toggle('focus', j === i));
      if (sound) A.play('move');
      if (onMove) onMove(i);
    };
    items.forEach((it, j) => {
      it.addEventListener('mouseenter', () => { if (i !== j) set(j, true); });         // hovering an item plays the move sound
      it.addEventListener('click', () => { set(j, false); A.play('select'); onPick && onPick(j); });
    });
    set(start, false);
    return {
      get index() { return i; },
      input(ev) {
        if (ev.join) return;
        if (ev.dir === 'up' && !ev.face) set(i - cols);
        else if (ev.dir === 'down' && !ev.face) set(i + cols);
        else if (ev.dir === 'left' && !ev.face) { if (onSide) onSide(i, -1); else if (cols > 1) set(i - 1); }
        else if (ev.dir === 'right' && !ev.face) { if (onSide) onSide(i, 1); else if (cols > 1) set(i + 1); }
        else if (ev.ok || ev.teacher) { A.play('select'); onPick && onPick(i); }
      },
    };
  }

  const Screens = {};

  /* the logo, one letter at a time so every letter can bounce */
  const word = (w, cls, off) => `<span class="${cls}">${[...w].map((c, i) => `<span class="l" style="--i:${off + i}">${c}</span>`).join('')}</span>`;
  const logo = (small) => `<div class="logo${small ? ' small' : ''}">${word('MATHS', 'w1', 0)}<span class="gap"></span>${word('CLASH', 'w2', 5)}</div>`;
  const mascots = (cls, moodR = 'idle', moodB = 'idle') => `<div class="mascot red ${cls} m-${moodR}">${Art.brain('red')}</div><div class="mascot blue ${cls} m-${moodB}">${Art.brain('blue')}</div>`;
  /* the mascots sometimes jump for joy */
  function mascotPlay(root, every = 3200) {
    const ms = $$('.mascot', root);
    return setInterval(() => {
      const m = ms[Math.floor(Math.random() * ms.length)];
      if (!m || !m.isConnected) return;
      m.classList.remove('m-idle'); m.classList.add('m-cheer');
      setTimeout(() => { m.classList.remove('m-cheer'); m.classList.add('m-idle'); }, 1300);
    }, every);
  }

  /* ---------------- title ---------------- */
  Screens.title = {
    enter(root) {
      BC.FX.calm = false;
      A.setMood('menu');
      this.leaving = false;
      root.innerHTML = `${logo(false)}<div class="tagline">THE CLASSROOM BATTLE</div><div class="spot red"></div><div class="spot blue"></div>${mascots('title-m')}<div class="vsb"><span>VS</span></div><div class="press"><span>PRESS ANY BUTTON</span></div>`;
      gsap.from($('.w1', root), { x: -900, opacity: 0, duration: 0.8, ease: 'power4.out' });
      gsap.from($('.w2', root), { x: 900, opacity: 0, duration: 0.8, ease: 'power4.out' });
      gsap.from($('.tagline', root), { scale: 0, opacity: 0, duration: 0.5, delay: 0.7, ease: 'back.out(2.2)' });
      gsap.from($('.vsb', root), { scale: 0, rotation: -120, duration: 0.7, delay: 0.5, ease: 'back.out(1.8)' });
      gsap.from($$('.mascot', root), { y: 120, opacity: 0, duration: 0.7, stagger: 0.12, delay: 0.3, ease: 'back.out(1.6)' });
      gsap.from($('.press', root), { opacity: 0, duration: 0.5, delay: 1.1 });
      this.play = mascotPlay(root, 2600);
      Crowd.wave(true);
      root.onclick = () => this.go();
      this.t0 = performance.now();
    },
    go() {
      if (this.leaving || performance.now() - this.t0 < 500) return;
      this.leaving = true;
      A.unlock(); A.startMusic('menu'); A.play('select'); BC.FX.glow('red', 1); BC.FX.glow('blue', 1);
      BC.FX.confetti(null, 120);
      $$('#screen .mascot').forEach((m) => { m.classList.remove('m-idle'); m.classList.add('m-cheer'); });
      Crowd.react('both', 'cheer', 1200); A.play('cheer', { team: 'both' });
      setTimeout(() => { if (App.name === 'title') App.go('menu'); }, 520);
    },
    onInput(ev) { if (!ev.pause) this.go(); },
    exit() { clearInterval(this.play); $('#screen').onclick = null; },
  };

  /* ---------------- menu ---------------- */
  Screens.menu = {
    enter(root) {
      A.startMusic('menu'); A.setMood('menu');
      root.innerHTML = `${logo(true)}
        <div class="ycard y5 rise" style="--ad:.05s"><div class="yl">YEAR</div><div class="big">5</div><div class="sub">Practice Book 5A<br>Challenges and puzzles, Units 1–6</div></div>
        <div class="ycard y6 rise" style="--ad:.15s"><div class="yl">YEAR</div><div class="big">6</div><div class="sub">Practice Book 6A<br>Challenges and puzzles, Units 1–6</div></div>
        ${mascots('menu-m')}
        <div class="btn mbtn mb1 rise" style="--ad:.3s">How to play</div>
        <div class="btn mbtn mb2 rise" style="--ad:.35s">Settings</div>
        <div class="btn mbtn mb3 rise" style="--ad:.4s">Quit</div>`;
      this.play = mascotPlay(root, 3400);
      Crowd.wave(true);
      const items = [$('.y5', root), $('.y6', root), $('.mb1', root), $('.mb2', root), $('.mb3', root)];
      this.list = focusList(items, {
        start: App.year === 6 ? 1 : 0,
        onPick: (i) => {
          if (i === 0 || i === 1) { App.year = i === 0 ? 5 : 6; Crowd.react('both', 'cheer', 900); App.go('lobby'); }
          else if (i === 2) App.go('help');
          else if (i === 3) App.go('settings');
          else window.close();
        },
      });
      // grid moves: cards row (0,1) and buttons row (2,3,4)
      this.list.input = ((orig) => (ev) => {
        const k = this.list.index;
        if (ev.join || ev.face && !ev.ok) return;
        if (BC.portrait) {
          if (ev.dir === 'down') return this.focus(items, k === 0 ? 1 : k === 1 ? 3 : k);
          if (ev.dir === 'up') return this.focus(items, k === 1 ? 0 : k >= 2 ? 1 : k);
          if (ev.dir === 'left' && k >= 2) return this.focus(items, k === 2 ? 4 : k - 1);
          if (ev.dir === 'right' && k >= 2) return this.focus(items, k === 4 ? 2 : k + 1);
          if (ev.dir) return;
        }
        if (ev.dir === 'down' && k < 2) return this.focus(items, k === 0 ? 2 : 3);
        if (ev.dir === 'up' && k >= 2) return this.focus(items, k === 4 ? 1 : 0);
        if (ev.dir === 'left') return this.focus(items, k === 0 ? 1 : k === 2 ? 4 : k - 1);
        if (ev.dir === 'right') return this.focus(items, k === 1 ? 0 : k === 4 ? 2 : k + 1);
        return orig(ev);
      })(this.list.input);
    },
    focus(items, k) { items[k].dispatchEvent(new Event('mouseenter')); A.play('move'); },
    onInput(ev) { if (ev.pause) { App.go('title'); return; } this.list.input(ev); },
    exit() { clearInterval(this.play); },
  };

  /* ---------------- team lobby: controllers join and pick a side ---------------- */
  const padIcon = '<svg class="ic" viewBox="0 0 64 64"><path fill="currentColor" d="M18 18h28c7 0 12 6 13 14l2 12c1 6-5 10-10 6l-6-6H19l-6 6c-5 4-11 0-10-6l2-12c1-8 6-14 13-14z" opacity=".9"/><circle cx="44" cy="28" r="3" fill="#fff"/><circle cx="50" cy="34" r="3" fill="#fff"/><rect x="16" y="29" width="12" height="4" rx="2" fill="#fff"/><rect x="20" y="25" width="4" height="12" rx="2" fill="#fff"/></svg>';
  const kbIcon = '<svg class="ic" viewBox="0 0 64 64"><rect x="4" y="16" width="56" height="32" rx="6" fill="currentColor" opacity=".9"/><g fill="#fff"><rect x="10" y="22" width="6" height="6" rx="1"/><rect x="19" y="22" width="6" height="6" rx="1"/><rect x="28" y="22" width="6" height="6" rx="1"/><rect x="37" y="22" width="6" height="6" rx="1"/><rect x="46" y="22" width="8" height="6" rx="1"/><rect x="16" y="36" width="32" height="6" rx="1"/></g></svg>';
  Screens.lobby = {
    enter(root) {
      A.setMood('menu');
      root.innerHTML = `<div class="lobby-title">Year ${App.year} · Pick your sides</div>
        <div class="team-col red rise"><div class="tm">${Art.avatar('red')}</div><h2>${BC.tn('red')}</h2><div class="devs"></div></div>
        <div class="team-col blue rise" style="--ad:.1s"><div class="tm">${Art.avatar('blue')}</div><h2>${BC.tn('blue')}</h2><div class="devs"></div></div>
        <div class="lobby-tip">Controllers: press any button to join · <b>← →</b> switch sides · <b>↑ ↓</b> switch the game · test your buzzers!</div>
        <div class="btn lobby-mode"></div>
        <div class="btn go lobby-go">Start the battle</div>
        <div class="btn back lobby-back">Back</div>`;
      $('.lobby-mode', root).onclick = () => this.toggleMode();
      this.showMode();
      $('.go', root).onclick = () => this.start();
      $('.back', root).onclick = () => App.go('menu');
      this.render();
      BC.onPadsChanged = () => this.render();
      this.pulse = gsap.to($('.go', root), { scale: 1.05, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    },
    render() {
      for (const t of ['red', 'blue']) {
        const box = $(`.team-col.${t} .devs`);
        if (!box) return;
        const kb = t === 'red' ? 'W A S D · Shift' : 'Arrows · Enter';
        let h = `<div class="dev" data-src="kb-${t}">${kbIcon}<span>Keyboard</span><span class="k">${kb}</span></div>`;
        Object.entries(Input.pads).forEach(([i, p]) => {
          if (p.team === t) h += `<div class="dev" data-src="pad${i}">${padIcon}<span>${Input.padName(p.id)} ${+i + 1}</span><span class="k">← → to switch</span></div>`;
        });
        box.innerHTML = h;
      }
    },
    flash(src, team) {
      const d = $(`.dev[data-src="${src}"]`);
      if (d) { d.classList.add('flash'); setTimeout(() => d.classList.remove('flash'), 180); }
      BC.FX.glow(team, 0.8);
      Crowd.react(team, 'cheer', 700, { p: 0.7, spread: 100 });
    },
    /* the game: the eight rounds, or the ticket board */
    showMode() { const b = $('.lobby-mode'); if (b) b.innerHTML = BC.settings.mode === 'board' ? `Game: <b>Ticket board</b> · ${App.tickets()} tickets` : 'Game: <b>Eight rounds</b>'; },
    toggleMode() { BC.settings.mode = BC.settings.mode === 'board' ? 'rounds' : 'board'; BC.saveSettings(); A.play('select'); this.showMode(); },
    start() { A.play('select'); this.pulse && this.pulse.kill(); BC.onPadsChanged = null; BC.App.startMatch(); },
    onInput(ev) {
      if (ev.pause) { App.go('menu'); return; }
      if (ev.teacher) { this.start(); return; }
      if (ev.start) { this.start(); return; }
      if (!ev.team) return;
      if (ev.join) { A.play('join', { team: ev.team }); this.render(); this.flash(ev.src, ev.team); return; }
      const padIdx = ev.src.startsWith('pad') ? +ev.src.slice(3) : null;
      if (padIdx != null && (ev.dpad || ev.stick) && (ev.dir === 'left' || ev.dir === 'right') && !ev.repeat) {
        const to = ev.dir === 'left' ? 'red' : 'blue';
        if (Input.pads[padIdx].team !== to) { Input.setTeam(padIdx, to); A.play('join', { team: to }); this.flash(ev.src, to); }
        return;
      }
      if ((ev.dpad || ev.stick || ev.key) && (ev.dir === 'up' || ev.dir === 'down') && !ev.face && !ev.repeat) { this.toggleMode(); return; }    // up / down: switch the game
      A.play('buzz', { team: ev.team }); Input.rumble(ev.team, 0.5, 120);
      this.flash(ev.src, ev.team);
    },
    exit() { BC.onPadsChanged = null; if (this.pulse) this.pulse.kill(); },
  };

  /* ---------------- how to play ---------------- */
  Screens.help = {
    enter(root) {
      const r = M.ROUNDS;
      root.innerHTML = `<div class="bigcard"><h3>How to play</h3>
        <div class="help-grid">${M.ORDER.map((k, i) => `<div class="hcard"><div class="hn">ROUND ${i + 1}</div><div class="ht">${r[k].name}</div><div class="hd">${BC.esc(r[k].desc)}</div></div>`).join('')}</div>
        <div class="ctrls">
          <div class="ctrl"><h4>Controllers</h4>
            <div class="row">${BC.UI.glyph('up')} top = <b>Y / △</b> &nbsp; ${BC.UI.glyph('down')} bottom = <b>A / ✕</b></div>
            <div class="row">${BC.UI.glyph('left')} left = <b>X / ▢</b> &nbsp; ${BC.UI.glyph('right')} right = <b>B / ○</b></div>
            <div class="row">The d-pad works too · <b>stick</b> aims</div>
            <div class="row"><b>START</b> pauses the game</div></div>
          <div class="ctrl"><h4 class="red-ink">Red keyboard</h4>
            <div class="row"><span class="kb">W</span><span class="kb">A</span><span class="kb">S</span><span class="kb">D</span> answers and moves</div>
            <div class="row"><span class="kb">Shift</span> or <span class="kb">E</span> lock in</div>
            <div class="row">Any of these keys buzzes in</div></div>
          <div class="ctrl"><h4 class="blue-ink">Blue keyboard</h4>
            <div class="row"><span class="kb">↑</span><span class="kb">←</span><span class="kb">↓</span><span class="kb">→</span> answers and moves</div>
            <div class="row"><span class="kb">Enter</span> or right <span class="kb">Shift</span> lock in</div>
            <div class="row">Any of these keys buzzes in</div></div>
          <div class="ctrl"><h4>Teacher</h4>
            <div class="row"><span class="kb">Space</span> next · <span class="kb">Esc</span> pause</div>
            <div class="row"><span class="kb">P</span> lock the controllers</div>
            <div class="row"><span class="kb">H</span> quiet hold / resume</div>
            <div class="row"><span class="kb">F</span> full screen <span class="kb">M</span> music</div>
            <div class="row">Mouse: <b class="red-ink">left</b> Red · <b class="blue-ink">right</b> Blue</div></div>
        </div></div>
        <div class="btn back" style="left:860px;top:1010px;width:200px;height:56px;font-size:26px">Back</div>`;
      gsap.from($('.bigcard', root), { y: 40, opacity: 0, duration: 0.4 });
      gsap.from($$('.hcard', root), { y: 30, opacity: 0, duration: 0.4, stagger: 0.05, delay: 0.1 });
      $('.back', root).onclick = () => App.go('menu');
    },
    onInput(ev) { if (ev.pause || ev.ok || ev.back || ev.teacher) { A.play('back'); App.go('menu'); } },
  };

  /* how many tickets one game plays: any number from 1 up to the whole board (6 units x 6 rows) */
  App.ticketsMax = () => BC.Graded.UNITS[App.year || 5].length * BC.Board.ROWS.length;
  App.tickets = () => Math.min(App.ticketsMax(), Math.max(1, Math.round(+BC.settings.tickets || 12)));

  /* ---------------- settings ---------------- */
  Screens.settings = {
    enter(root) {
      root.innerHTML = `<div class="overlay" style="background:transparent;backdrop-filter:none"><div class="ocard setcard" style="top:30px;height:1020px;padding:26px 50px"><h3 style="font-size:56px;margin-bottom:14px">Settings</h3><div class="items"></div><div class="sethint">Tickets per game: <b>◀ ▶</b> one at a time (hold to run) or just <b>type the number</b></div></div></div>`;
      this.root = root;
      this.draw(0);
    },
    rows() {
      const s = BC.settings;
      const L = { short: 'Short', normal: 'Normal', long: 'Long' };
      const board = s.mode === 'board';
      /* v0.3: a volume slider (0-10) for each big sound; changing it plays the sound at the new level */
      const bar = (k) => { const v = s[k] == null ? 8 : s[k]; return `<span class="vctl"><span class="vbar"><i style="width:${v * 10}%"></i></span><b class="vnum">${v}</b></span>`; };
      const lvl = (k, label, snd) => ({ label, val: bar(k), side: (d) => { s[k] = Math.min(10, Math.max(0, (s[k] == null ? 8 : s[k]) + d)); A.setLevel(k); setTimeout(() => A.play(snd), 60); } });
      return [
        { label: 'Game', val: s.mode === 'board' ? 'Ticket board' : 'Eight rounds', side: () => { s.mode = s.mode === 'board' ? 'rounds' : 'board'; } },
        ...(board ? [{ label: 'Tickets per game (board)', val: (App.tickets() >= App.ticketsMax() ? 'The whole board (' + App.ticketsMax() + ')' : App.tickets()), side: (d) => { s.tickets = Math.min(App.ticketsMax(), Math.max(1, App.tickets() + d)); }, digit: true },
        { label: 'Out of points (board)', val: s.guard === 'afford' ? 'Only tickets it can afford' : 'Can still gamble', side: () => { s.guard = s.guard === 'afford' ? 'off' : 'afford'; } }] : []),
        ...(board ? [] : [{ label: 'Match length', val: L[s.length], side: (d) => { const o = ['short', 'normal', 'long']; s.length = o[(o.indexOf(s.length) + d + 3) % 3]; } }]),
        { label: 'Reading time', val: (s.read == null ? 10 : s.read) + ' s', side: (d) => { const o = [0, 5, 10, 15, 20]; s.read = o[(o.indexOf(s.read == null ? 10 : s.read) + d + o.length) % o.length]; } },
        { label: 'Next question by itself', val: s.auto ? 'After ' + s.auto + ' s' : 'Off (press A)', side: (d) => { const o = [0, 3, 5, 8, 10]; s.auto = o[(o.indexOf(+s.auto || 0) + d + o.length) % o.length]; } },
        ...(board ? [{ label: 'Questions (board)', val: s.level === 'book' ? 'Book level' : 'Easier, short', side: () => { s.level = s.level === 'book' ? 'easy' : 'book'; } }] : []),
        ...(board ? [] : [{ label: 'Buzz-in timer', val: s.timer + ' s', side: (d) => { const o = [10, 15, 20, 30]; s.timer = o[(o.indexOf(s.timer) + d + 4) % 4] || 20; } },
        ...M.ORDER.map((k) => ({ label: M.ROUNDS[k].short, val: s.rounds[k] !== false ? 'On' : 'Off', side: () => { s.rounds[k] = s.rounds[k] === false; } }))]),
        { label: 'Screen shape', val: { auto: 'Automatic', landscape: 'Wide 16:9', portrait: 'Tall 9:16' }[s.screen || 'auto'], side: (d) => { const o = ['auto', 'landscape', 'portrait']; s.screen = o[(o.indexOf(s.screen || 'auto') + d + 3) % 3]; BC.saveSettings(); BC.fitStage(); } },
        { label: 'Projector edge margin', val: (s.margin || 0) + '%', side: (d) => { const o = [0, 2, 4, 6, 8]; s.margin = o[(o.indexOf(s.margin || 0) + d + o.length) % o.length]; BC.saveSettings(); BC.fitStage(); } },
        ...(window.bcShell ? [{ label: 'Show on the other screen', val: '', pick: () => window.bcShell.nextDisplay() }] : []),
        { label: 'Look  (key L)', val: s.look === 'outline' ? 'Outline' : 'Flat', side: () => { s.look = s.look === 'outline' ? 'flat' : 'outline'; BC.applyLook(); } },
        { label: 'Music  (key M)', val: s.music ? 'On' : 'Off', side: () => A.toggleMusic() },
        { label: 'Volume', val: Math.round(s.volume * 10) + ' / 10', side: (d) => A.setVolume(Math.min(1, Math.max(0, Math.round((s.volume + d * 0.1) * 10) / 10))) },
        lvl('vBuzz', 'Wrong-answer buzzer', 'buzzer'),
        lvl('vCorrect', 'Right answer (round win)', 'correct'),
        lvl('vFail', 'Failure trumpet (a wrong steal)', 'trumpet'),
        lvl('vWin', 'Winner (match win)', 'win'),
        { label: 'Back', val: '', pick: () => App.go('menu') },
      ];
    },
    draw(focus) {
      this.focusIdx = focus;
      const rows = this.rows();
      const box = $('.items', this.root);
      box.innerHTML = rows.map((r) => `<div class="mi" style="height:37px;margin-bottom:2px;font-size:22px">${r.label}<span class="val">${r.val ? `<span class="arr">◀</span>${r.val}<span class="arr">▶</span>` : ''}</span></div>`).join('');
      const items = $$('.mi', box);
      this.list = focusList(items, {
        start: focus,
        onSide: (i, d) => { if (rows[i].side) { rows[i].side(d); BC.saveSettings(); A.play('move'); if (App.name === 'settings') this.draw(i); } },
        onPick: (i) => { if (rows[i].pick) rows[i].pick(); else if (rows[i].side) { rows[i].side(1); BC.saveSettings(); this.draw(i); } },
      });
    },
    onInput(ev) {
      if (ev.pause || ev.back) { A.play('back'); App.go('menu'); return; }
      if (ev.digit != null) {
        const rows = this.rows(), i = this.list.index;
        if (!rows[i] || !rows[i].digit) return;
        const now = Date.now(), cur = (now - (this.typedAt || 0) < 1400 ? String(this.typed || '') : '') + ev.digit;
        this.typed = cur.slice(-2); this.typedAt = now;
        BC.settings.tickets = Math.min(App.ticketsMax(), Math.max(1, +this.typed || 1));
        BC.saveSettings(); A.play('move'); this.draw(i); return;
      }
      this.list.input(ev);
    },
  };

  /* ---------------- the match ---------------- */
  App.startMatch = function () {
    App.go('match');
  };
  Screens.match = {
    enter() { A.startMusic('battle'); BC.FX.calm = true; Crowd.setFocus(true); M.start(App.year); },
    onInput(ev) { App.matchInput(ev); },
    exit() { BC.FX.calm = false; Crowd.setFocus(false); M.hold = false; document.body.classList.remove('on-hold'); BC.setTurn(null); },
  };
  App.matchInput = function (ev) {
    if (App.pause) { App.pause.input(ev); return; }
    if (ev.pause || ev.start) { App.openPause(); return; }
    if (ev.teacher) { M.nextPressed = true; M.introSkip = true; M.readSkip = true; }
    if (ev.ok || ev.next) M.nextPressed = true;
    if (M.onInput) M.onInput(ev);
  };

  /* ---------------- pause menu (the teacher's controls) ---------------- */
  App.openPause = function () {
    if (App.pause || App.name !== 'match') return;
    M.paused = true; A.duck(true); A.play('open');
    const run = M.run;
    const rows = [
      ['Resume', () => App.closePause()],
      ['Skip this question', () => { M.skip = true; App.closePause(); }],
      ['Skip this round', () => { M.skipRound = true; M.skip = true; App.closePause(); }],
      ['Red +50', () => { run.add('red', 50); }],
      ['Red −50', () => { run.add('red', -50); }],
      ['Blue +50', () => { run.add('blue', 50); }],
      ['Blue −50', () => { run.add('blue', -50); }],
      ...(window.bcShell ? [['Show on the other screen', () => { window.bcShell.nextDisplay(); App.closePause(); }]] : []),
      ['Quit to menu', () => { App.closePause(); M.abort(); App.go('menu'); }],
    ];
    const ov = el('div', 'overlay', `<div class="ocard" style="top:120px;height:840px"><h3>Paused</h3>${rows.map(([t]) => `<div class="mi" style="height:68px;margin-bottom:8px">${t}</div>`).join('')}</div>`);
    $('#stage').appendChild(ov);
    gsap.from($('.ocard', ov), { scale: 0.9, opacity: 0, duration: 0.25 });
    const list = focusList($$('.mi', ov), { onPick: (i) => rows[i][1]() });
    App.pause = { ov, input: (ev) => { if (ev.pause || ev.start || ev.back) { App.closePause(); return; } list.input(ev); } };
  };
  /* the quiet hold (key H): the clock stops and the controllers are ignored, with only a tiny mark in the corner (no menu, no overlay) */
  App.toggleHold = function () {
    if (App.name !== 'match' || App.pause) return;
    M.hold = !M.hold; M.paused = M.hold;
    document.body.classList.toggle('on-hold', M.hold);
  };
  App.closePause = function () {
    if (!App.pause) return;
    const ov = App.pause.ov; App.pause = null;
    gsap.to(ov, { opacity: 0, duration: 0.2, onComplete: () => ov.remove() });
    M.paused = !!M.hold; A.duck(false); A.play('close');
  };

  /* ---------------- results: the winner screen is loud on purpose (rays, cannons, fireworks, shaking, a trophy, a scrolling CHAMPIONS ribbon) ---------------- */
  const TROPHY = '<svg class="trophy" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg"><path d="M22 20 H98 V54 C98 80 80 96 60 96 C40 96 22 80 22 54 Z" fill="#ffc43d"/><path d="M22 28 H6 C6 56 18 66 32 68 M98 28 H114 C114 56 102 66 88 68" fill="none" stroke="#ffc43d" stroke-width="9" stroke-linecap="round"/><rect x="52" y="94" width="16" height="26" fill="#f0a500"/><rect x="34" y="118" width="52" height="14" rx="5" fill="#ffc43d"/><rect x="26" y="130" width="68" height="14" rx="5" fill="#f0a500"/><path d="M60 30 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2z" fill="#fff6c8"/><path d="M34 26 V56 C34 70 42 82 54 88" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="6" stroke-linecap="round"/></svg>';
  Screens.results = {
    enter(root, run) {
      A.setMood('menu');
      const { red, blue } = run.score;
      const win = red > blue ? 'red' : blue > red ? 'blue' : (run.tieWin || null);      // equal on points: the tie-break decides
      const mood = (t) => (win ? (win === t ? 'cheer' : 'sad') : 'wow');
      const band = win ? `${BC.tn(win)} ★ CHAMPIONS ★ `.repeat(8) : '';
      root.innerHTML = `${win ? `<div class="res-rays ${win}"></div>` : ''}
        <div class="win ${win ? win + '-ink chaos' : ''}">${win ? BC.tn(win) + ' WINS!' : 'IT\'S A DRAW!'}</div>${run.tieNote && win ? `<div class="res-note ${win}">${run.tieNote}</div>` : ''}
        <div class="res-row">${mascots('res-m', mood('red'), mood('blue'))}<div class="scores"><div class="tsc red${win === 'blue' ? ' lost' : ''}"><div class="nm">${BC.tn('red')}</div><div class="v">0</div></div><div class="vs">${win ? TROPHY : 'VS'}</div><div class="tsc blue${win === 'red' ? ' lost' : ''}"><div class="nm">${BC.tn('blue')}</div><div class="v">0</div></div></div></div>
        ${win ? `<div class="res-band b1 ${win}"><span>${band}</span></div><div class="res-band b2 ${win}"><span>${band}</span></div>` : ''}
        <div class="btn again res-btn">Play again</div>
        <div class="btn menu res-btn">Menu</div>`;
      if (win) $(`.res-m.${win}`, root).classList.add('res-winner');
      // the scores count up
      for (const [t, v] of [['red', red], ['blue', blue]]) {
        const box = $(`.tsc.${t} .v`, root), o = { n: 0 };
        gsap.to(o, { n: v, duration: 1.7, delay: 0.5, ease: 'power2.out', onUpdate: () => { box.textContent = Math.round(o.n); } });
      }
      gsap.from($('.win', root), { scale: 3.4, opacity: 0, rotation: -6, duration: 0.7, ease: 'power4.out' });
      gsap.from($$('.tsc', root), { y: 90, opacity: 0, duration: 0.6, stagger: 0.12, delay: 0.3, ease: 'back.out(1.6)' });
      gsap.from($$('.mascot', root), { scale: 0, opacity: 0, duration: 0.6, stagger: 0.1, delay: 0.5, ease: 'back.out(1.8)', transformOrigin: '50% 100%' });
      if (win) {
        gsap.from($('.trophy', root), { y: -500, rotation: 40, duration: 0.9, delay: 0.9, ease: 'bounce.out' });
        gsap.to($(`.tsc.${win}`, root), { scale: 1.07, duration: 0.45, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.2 });
        // chaos: fireworks, cannons, confetti, flashing lights, a shaking screen and a roaring crowd, all the time until a button is pressed
        const W = BC.W, H = BC.H, col = BC.TEAMS[win].color, gold = '#ffc43d';
        BC.FX.confetti(win, 200); BC.FX.glow(win, 2.4); BC.FX.cannon(win, 70); BC.FX.cannon(BC.other(win), 30);
        let k = 0;
        this.loop = setInterval(() => {
          if (App.name !== 'results') return;
          k++;
          if (BC.FX.parts.length < 700) BC.FX.burst(120 + Math.random() * (W - 240), 120 + Math.random() * (H * 0.55), k % 3 ? col : gold, 38, 1.1);
          if (k % 2 === 0) { BC.FX.cannon(k % 4 === 0 ? 'red' : 'blue', 40); BC.FX.glow(win, 1.8); }
          if (k % 3 === 0) gsap.fromTo('#screen', { x: (Math.random() - 0.5) * 34, y: (Math.random() - 0.5) * 20 }, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1.6, 0.25)' });
          if (k % 5 === 0) { BC.FX.confetti(win, 90); Crowd.react(win, 'cheer', 1500); }
        }, 420);
      } else BC.FX.confetti(null, 200);
      Crowd.end(win);
      A.play('win'); Input.rumble(win, 1, 500);
      this.list = focusList([$('.again', root), $('.menu', root)], { cols: 2, onPick: (i) => (i === 0 ? App.startMatch() : App.go('menu')) });
      this.t0 = performance.now();
    },
    onInput(ev) { if (performance.now() - this.t0 < 1500) return; if (ev.pause) { App.go('menu'); return; } this.list.input(ev); },
    exit() { clearInterval(this.loop); gsap.killTweensOf('#screen'); gsap.set('#screen', { x: 0, y: 0 }); },
  };

  /* a locked controller is still heard: the badge blinks, nothing else happens */
  BC.onLockedInput = function () {
    const b = $('#lockbadge'); if (!b) return;
    b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
  };

  /* ---------------- boot ---------------- */
  window.addEventListener('DOMContentLoaded', () => {
    BC.applyLook();
    BC.fitStage();
    BC.FX.init();
    Crowd.build();
    BC.onLayout = () => {
      Crowd.build();
      if (!App.name || App.name === 'match') return;      // the match follows on its next question
      if (App.name === 'settings') { const f = Screens.settings.focusIdx || 0; App.go('settings'); Screens.settings.draw(f); return; }
      App.go(App.name, App.arg);
    };
    if (window.bcShell) window.bcShell.onMessage((msg) => BC.toast(msg));
    console.info('Maths Clash ready · layout ' + (BC.portrait ? '9:16' : '16:9') + ' · screen controls ' + (window.bcShell ? 'on' : 'off'));
    // hide the mouse pointer while people play with controllers / keys
    let hideT = null;
    window.addEventListener('mousemove', () => { document.body.classList.remove('hide-cursor'); clearTimeout(hideT); hideT = setTimeout(() => document.body.classList.add('hide-cursor'), 2500); });
    document.fonts.ready.then(() => App.go('title'));
  });
})();
