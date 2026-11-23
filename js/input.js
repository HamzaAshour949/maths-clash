/* Maths Clash input: game controllers (Xbox, PlayStation, Switch Pro ... standard mapping) + keyboard + mouse.
   Every press becomes one event: { team, src, dir, face, dpad, stick, ok, back, start, shoulder }.
   Face buttons sit where the answers sit: Y/triangle = top, X/square = left, B/circle = right, A/cross = bottom. */
'use strict';
(function () {
  const Input = BC.Input = {
    pads: {},            // gamepad index -> { team, id, prevB:[], stickDir, stickT, holdDir, holdT }
    handler: null,       // current screen's onInput(ev)
    keysDown: new Set(),
    virtualAxis: { red: 0, blue: 0 },
    locked: false,       // P: controllers are locked: their presses are still received (the badge flashes) but change nothing
    lockedPresses: 0,
  };

  const KEYS = {
    red: { KeyW: 'up', KeyA: 'left', KeyS: 'down', KeyD: 'right', ok: ['ShiftLeft', 'KeyE', 'KeyQ'] },
    blue: { ArrowUp: 'up', ArrowLeft: 'left', ArrowDown: 'down', ArrowRight: 'right', ok: ['Enter', 'ShiftRight', 'NumpadEnter', 'Slash'] },
  };
  Input.KEYS = KEYS;

  const isPad = (ev) => typeof ev.src === 'string' && ev.src.startsWith('pad');
  function emit(ev) {
    ev.any = true;
    if (Input.locked && isPad(ev)) {               // received, but it changes nothing
      Input.lockedPresses++;
      if (BC.onLockedInput) BC.onLockedInput(ev);
      return;
    }
    // the quiet hold: nothing the players press counts (the teacher's keys do)
    if (BC.Match && BC.Match.hold && BC.App && BC.App.name === 'match' && !ev.teacher && !ev.pause) return;
    // a team that has a controller is played by its controller only: its keyboard keys and a single mouse click are ignored
    if (BC.App && BC.App.name === 'match' && ev.team && typeof ev.src === 'string' && /^(kb-|mouse-)/.test(ev.src) && Input.teamCount(ev.team) > 0 && !ev.override) return;
    if (BC.onAnyInput) BC.onAnyInput(ev);
    if (Input.handler) Input.handler(ev);
  }
  Input.emit = emit;

  /* P: lock / unlock every game controller. Keyboard and mouse (the teacher's) always work. */
  Input.setLock = function (on) {
    Input.locked = on == null ? !Input.locked : !!on;
    document.body.classList.toggle('pads-locked', Input.locked);
    if (BC.Audio && BC.Audio.play) BC.Audio.play(Input.locked ? 'lock' : 'back');
    if (BC.toast) BC.toast(Input.locked ? 'Controllers LOCKED · press P to unlock' : 'Controllers unlocked');
  };

  /* ---------- team assignment for controllers ---------- */
  Input.teamCount = function (team) { return Object.values(Input.pads).filter((p) => p.team === team).length; };
  function assign(index, gp) {
    const red = Input.teamCount('red'), blue = Input.teamCount('blue');
    const team = red <= blue ? 'red' : 'blue';
    Input.pads[index] = { team, id: gp.id, prevB: [], stickDir: null, stickT: 0, holdDir: null, holdT: 0 };
    if (BC.onPadsChanged) BC.onPadsChanged();
  }
  Input.setTeam = function (index, team) { if (Input.pads[index]) { Input.pads[index].team = team; if (BC.onPadsChanged) BC.onPadsChanged(); } };
  window.addEventListener('gamepaddisconnected', (e) => { delete Input.pads[e.gamepad.index]; if (BC.onPadsChanged) BC.onPadsChanged(); });

  Input.padName = function (id) {
    const s = (id || '').toLowerCase();
    if (/dualsense|dualshock|playstation|054c/.test(s)) return 'PlayStation';
    if (/xbox|xinput|045e/.test(s)) return 'Xbox';
    if (/pro controller|nintendo|057e/.test(s)) return 'Switch Pro';
    return 'Controller';
  };

  const FACE = { 0: 'down', 1: 'right', 2: 'left', 3: 'up' };
  const DPAD = { 12: 'up', 13: 'down', 14: 'left', 15: 'right' };

  /* ---------- polling ---------- */
  function poll(now) {
    const list = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of list) {
      if (!gp || !gp.connected) continue;
      let p = Input.pads[gp.index];
      const pressed = gp.buttons.map((b) => (typeof b === 'object' ? b.pressed || b.value > 0.5 : b > 0.5));
      if (!p) {
        if (!pressed.some(Boolean)) continue;       // a pad joins with its first press
        assign(gp.index, gp); p = Input.pads[gp.index];
        p.prevB = pressed.slice();
        emit({ team: p.team, src: 'pad' + gp.index, join: true });
        continue;
      }
      const src = 'pad' + gp.index, team = p.team;
      pressed.forEach((on, i) => {
        if (!on || p.prevB[i]) return;
        if (i in FACE) emit({ team, src, dir: FACE[i], face: true, ok: i === 0, back: i === 1 });
        else if (i in DPAD) { emit({ team, src, dir: DPAD[i], dpad: true }); p.holdDir = DPAD[i]; p.holdT = now + 380; }
        else if (i === 9) emit({ team, src, start: true });
        else if (i === 8) emit({ team, src, select: true });
        else if (i >= 4 && i <= 7) emit({ team, src, shoulder: true, side: i % 2 ? 'right' : 'left' });
        else emit({ team, src, other: true });
      });
      // d-pad auto repeat while held
      if (p.holdDir) {
        const idx = { up: 12, down: 13, left: 14, right: 15 }[p.holdDir];
        if (!pressed[idx]) p.holdDir = null;
        else if (now > p.holdT) { emit({ team, src, dir: p.holdDir, dpad: true, repeat: true }); p.holdT = now + 110; }
      }
      // left stick as digital directions (menus, dials) with repeat
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      let sd = null;
      if (Math.hypot(ax, ay) > 0.62) sd = Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 'right' : 'left') : (ay > 0 ? 'down' : 'up');
      if (sd && sd !== p.stickDir) { emit({ team, src, dir: sd, stick: true }); p.stickT = now + 400; }
      else if (sd && now > p.stickT) { emit({ team, src, dir: sd, stick: true, repeat: true }); p.stickT = now + 130; }
      p.stickDir = sd;
      p.prevB = pressed;
    }
    requestAnimationFrame(poll);
  }
  requestAnimationFrame(poll);

  /* Analog value for the number line: stick (proportional), d-pad / keys (held, speeds up). */
  Input.axis = function (team) {
    let best = 0;
    const list = navigator.getGamepads && !Input.locked ? navigator.getGamepads() : [];
    for (const gp of list) {
      if (!gp) continue;
      const p = Input.pads[gp.index];
      if (!p || p.team !== team) continue;
      let x = gp.axes[0] || 0;
      if (Math.abs(x) < 0.14) x = 0;
      const rx = gp.axes[2] || 0;                       // right stick = fine control
      if (Math.abs(rx) > 0.14 && Math.abs(rx) * 0.25 > Math.abs(x)) x = rx * 0.25;
      if (Math.abs(x) > Math.abs(best)) best = x;
    }
    return best || Input.virtualAxis[team];
  };
  /* held digital direction (-1, 0, 1) from keys or d-pad, for accelerating movement */
  Input.held = function (team) {
    const k = KEYS[team];
    let d = 0;
    for (const code of Input.keysDown) { if (k[code] === 'left') d = -1; if (k[code] === 'right') d = 1; }
    const list = navigator.getGamepads && !Input.locked ? navigator.getGamepads() : [];
    for (const gp of list) {
      if (!gp) continue;
      const p = Input.pads[gp.index];
      if (!p || p.team !== team) continue;
      if (gp.buttons[14] && gp.buttons[14].pressed) d = -1;
      if (gp.buttons[15] && gp.buttons[15].pressed) d = 1;
    }
    return d;
  };

  /* Rumble the team's controllers (Xbox and PlayStation pads in Chromium support this). */
  Input.rumble = function (team, strong = 0.6, ms = 160) {
    const list = navigator.getGamepads && !Input.locked ? navigator.getGamepads() : [];
    for (const gp of list) {
      if (!gp) continue;
      const p = Input.pads[gp.index];
      if (!p || (team && p.team !== team)) continue;
      try {
        if (gp.vibrationActuator && gp.vibrationActuator.playEffect) {
          gp.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: Math.min(1, strong + 0.2) });
        }
      } catch (e) { /* no rumble */ }
    }
  };

  /* ---------- keyboard ---------- */
  window.addEventListener('keydown', (e) => {
    const code = e.code;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(code)) e.preventDefault();
    const first = !Input.keysDown.has(code);
    Input.keysDown.add(code);
    // teacher keys
    if (code === 'Escape') { if (first) emit({ team: null, src: 'kb', pause: true, back: true }); return; }
    if (code === 'KeyP') { if (first) Input.setLock(); return; }
    if (code === 'KeyH') { if (first && BC.App && BC.App.toggleHold) BC.App.toggleHold(); return; }
    if (code === 'KeyF' || code === 'F11') { if (first) BC.toggleFullscreen(); e.preventDefault(); return; }
    if (code === 'KeyM') { if (first) BC.Audio.toggleMusic(); return; }
    if (code === 'KeyL') { if (first) BC.cycleLook(); return; }
    if (code === 'Tab') { if (first && window.bcShell) window.bcShell.nextDisplay(); return; }
    if (code === 'Space') { if (first) emit({ team: null, src: 'kb', teacher: true, ok: true }); return; }
    { const m = /^(?:Digit|Numpad)(\d)$/.exec(code); if (m) { if (first) emit({ team: null, src: 'kb', digit: +m[1] }); return; } }      // typing a number (settings)
    for (const team of ['red', 'blue']) {
      const k = KEYS[team];
      if (k[code]) {
        if (!first && !['up', 'down', 'left', 'right'].includes(k[code])) return;
        emit({ team, src: 'kb-' + team, dir: k[code], key: true, dpad: true, repeat: !first });
        return;
      }
      if (k.ok.includes(code)) { if (first) emit({ team, src: 'kb-' + team, ok: true, key: true }); return; }
    }
  });
  window.addEventListener('keyup', (e) => { Input.keysDown.delete(e.code); });
  window.addEventListener('blur', () => Input.keysDown.clear());

  /* ---------- mouse: the teacher can act for ANY team (a flat battery, a broken pad) ----------
     Anything with data-act is clickable: answer tiles, tickets, the steal / pass buttons. Which team? The team whose turn it is
     (ticket board, buzz-in answers); a split-screen side (tug of war); otherwise left click = RED, right click = BLUE.
     Clicking a team's score plate buzzes for that team; clicking empty space buzzes / fires / locks in for the team and counts as "next". */
  function mouseTeam(e) {
    const t = e.target;
    const side = t.closest && t.closest('.tside');
    if (side) return side.classList.contains('blue') ? 'blue' : 'red';
    const run = BC.Match && BC.Match.run;
    if (run && run.activeTeam) return run.activeTeam;
    return e.button === 2 || e.type === 'contextmenu' ? 'blue' : 'red';
  }
  function mouseAct(e) {
    const App = BC.App;
    if (!App || App.name !== 'match' || App.pause || !e.target || !e.target.closest) return false;
    if (e.target.closest('.overlay, .toast')) return false;
    const run = BC.Match && BC.Match.run;
    const act = e.target.closest('[data-act]');
    const plate = e.target.closest('.hud-team');
    if (plate) { const pt = plate.classList.contains('blue') ? 'blue' : 'red'; if (Input.teamCount(pt) > 0 && e.detail < 2) return true; emit({ team: pt, src: 'mouse-' + pt, shoulder: true, ok: true, mouse: true, override: true }); return true; }
    const team = mouseTeam(e), src = 'mouse-' + team;
    // a team that has a controller: only a double click (or a right click) from the mouse counts, so a stray click or a resting pointer changes nothing
    const hasPad = Input.teamCount(team) > 0, deliberate = e.detail >= 2 || e.type === 'contextmenu';
    if (hasPad && !deliberate) return true;
    const ovr = hasPad;
    if (act) {
      const a = act.dataset.act;
      if (a.startsWith('dir:')) emit({ team, src, dir: a.slice(4), key: true, dpad: true, mouse: true, override: ovr });
      else emit({ team, src, act: a, mouse: true, override: ovr });
      return true;
    }
    emit({ team, src, shoulder: true, ok: !(run && run.activeTeam), next: true, mouse: true, empty: true, override: ovr });
    return true;
  }
  window.addEventListener('click', (e) => { if (e.button === 0) mouseAct(e); });
  window.addEventListener('contextmenu', (e) => { if (BC.App && BC.App.name === 'match') { e.preventDefault(); mouseAct(e); } });

  BC.toggleFullscreen = function () {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  };
})();
