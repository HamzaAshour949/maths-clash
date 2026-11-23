/* Maths Clash UI parts: HUD, answer diamond, timer, banners, solution steps. */
'use strict';
(function () {
  const { el, math } = BC;
  const UI = BC.UI = {};

  /* a small 3x3 dot diamond with one dot lit: shows which button / key answers this slot */
  UI.glyph = function (dir) {
    const cells = ['x', 'up', 'x', 'left', 'x', 'right', 'x', 'down', 'x'];
    return `<span class="glyph">${cells.map((c) => `<i class="${c === 'x' ? 'x' : c === dir ? 'on' : ''}"></i>`).join('')}</span>`;
  };

  /* ---------- HUD ---------- */
  UI.hud = function (root, match) {
    const h = {};
    h.red = el('div', 'hud-team red', `<span class="av">${BC.Art.avatar('red')}</span><span class="nm">${BC.tn('red')}</span><span class="sc">0</span><span class="st"></span>`);
    h.blue = el('div', 'hud-team blue', `<span class="av">${BC.Art.avatar('blue')}</span><span class="nm">${BC.tn('blue')}</span><span class="sc">0</span><span class="st"></span>`);
    h.mid = el('div', 'hud-mid', `<div class="rn"></div><div class="rs"></div><div class="pips"></div>`);
    /* the timer has to be seen from the back of the room: a big ring with big numbers, a bar across the whole top of the screen that closes in
       from both sides, and a red glow round the edges for the last five seconds */
    h.timer = el('div', 'timer', `<svg viewBox="0 0 168 168"><circle class="bgc" cx="84" cy="84" r="80"/><circle class="trk" cx="84" cy="84" r="68"/><circle class="arc" cx="84" cy="84" r="68" stroke-dasharray="427.26" stroke-dashoffset="0"/></svg><div class="num">20</div>`);
    h.bar = el('div', 'tbar', '<i></i>');
    h.vig = el('div', 'tvig');
    root.append(h.red, h.blue, h.mid, h.timer);
    (root.parentNode || root).append(h.vig, h.bar);
    h.shown = { red: match.score.red, blue: match.score.blue };
    h.red.querySelector('.sc').textContent = h.shown.red;
    h.blue.querySelector('.sc').textContent = h.shown.blue;
    h.setRound = (name, sub) => { h.mid.querySelector('.rn').textContent = name; h.mid.querySelector('.rs').textContent = sub || ''; };
    h.setPips = (total, now, winners = []) => {
      h.mid.querySelector('.pips').innerHTML = Array.from({ length: total }, (_, i) => `<i class="${i < now ? (winners[i] || 'done') : i === now ? 'now' : ''}"></i>`).join('');
    };
    /* A score changed. The points pop up where they were won, fly to the team's plate, the plate takes the hit
       (flash, shockwave, the number rolls up), and a big score also gets a confetti cannon and a kick of the screen. */
    h.rolls = {};
    h.score = (team, pts = 0, x = null, y = null) => {
      const plate = h[team], box = plate.querySelector('.sc'), stage = BC.$('#stage');
      const target = match.score[team], big = pts >= 100;
      const at = BC.centerOf(plate), col = team === 'red' ? '#d7353b' : '#2d6bcf';
      h.shown[team] = target;
      const roll = (secs) => {
        if (h.rolls[team]) h.rolls[team].kill();
        const o = { v: parseInt(box.textContent, 10) || 0 };
        h.rolls[team] = gsap.to(o, { v: target, duration: secs, ease: 'power1.out', onUpdate: () => { box.textContent = Math.round(o.v); } });
      };
      const chipAt = (cls, text, px, py) => {
        const c = el('div', `fly ${cls}`, text);
        Object.assign(c.style, { left: px + 'px', top: py + 'px' });
        stage.appendChild(c);
        gsap.set(c, { xPercent: -50, yPercent: -50 });
        return c;
      };
      const hit = () => {
        roll(big ? 1.0 : 0.65);
        gsap.timeline().to(plate, { scale: big ? 1.2 : 1.12, duration: 0.09, ease: 'power2.out' }).to(plate, { scale: 1, duration: 0.7, ease: 'elastic.out(1.1, 0.4)' });
        gsap.fromTo(box, { scale: big ? 1.7 : 1.4, color: '#ffc43d' }, { scale: 1, color: '#ffffff', duration: 0.8, ease: 'elastic.out(1, 0.45)' });
        const pulse = el('i', 'pulse'); plate.appendChild(pulse);
        gsap.fromTo(pulse, { opacity: 0.85 }, { opacity: 0, duration: 0.55, onComplete: () => pulse.remove() });
        const ring = el('i', `shock ${team}`); Object.assign(ring.style, { left: at.x + 'px', top: at.y + 'px' }); stage.appendChild(ring);
        gsap.fromTo(ring, { scale: 0.3, opacity: 0.9 }, { scale: big ? 3.4 : 2.6, opacity: 0, duration: 0.75, ease: 'power2.out', onComplete: () => ring.remove() });
        BC.FX.burst(at.x, at.y, col, big ? 80 : 40, 1.1); BC.FX.glow(team, big ? 2 : 1.3);
        BC.Audio.play('roll', { n: big ? 10 : 6 });
        if (big) { BC.FX.cannon(team); gsap.fromTo('#screen', { x: team === 'red' ? -10 : 10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1.8, 0.25)' }); }
      };
      if (pts > 0) {
        const from = x != null ? { x, y } : { x: at.x, y: at.y + 160 };
        const chip = chipAt(team + (big ? ' big' : ''), '+' + pts, from.x, from.y);
        gsap.timeline()
          .fromTo(chip, { scale: 0.2, opacity: 0, rotation: -14 }, { scale: big ? 1.4 : 1.1, opacity: 1, rotation: 0, duration: 0.34, ease: 'back.out(2.6)' })
          .to(chip, { duration: big ? 0.45 : 0.28 })
          .to(chip, { x: at.x - from.x, duration: 0.5, ease: 'power1.inOut' })
          .to(chip, { y: at.y - from.y, scale: 0.6, duration: 0.5, ease: 'power3.in' }, '<')
          .add(() => { chip.remove(); hit(); });
        BC.Audio.play('score', { team, pts });
      } else if (pts < 0) {
        const chip = chipAt('neg', '−' + Math.abs(pts), at.x, at.y + 30);
        gsap.timeline()
          .fromTo(chip, { scale: 0.4, opacity: 0 }, { scale: 1.1, opacity: 1, duration: 0.25, ease: 'back.out(2)' })
          .to(chip, { y: 120, opacity: 0, duration: 0.85, ease: 'power1.in' })
          .add(() => chip.remove());
        roll(0.6);
        gsap.fromTo(plate, { x: -12 }, { x: 0, duration: 0.55, ease: 'elastic.out(1.6, 0.25)' });
        gsap.fromTo(box, { color: '#e8595c' }, { color: '#ffffff', duration: 0.9 });
      } else roll(0.3);
    };
    h.tag = (team, text) => {
      const st = h[team].querySelector('.st');
      gsap.killTweensOf(st);
      if (!text) { gsap.to(st, { opacity: 0, duration: 0.2 }); return; }
      st.textContent = text; gsap.fromTo(st, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.25 });
    };
    h.showTimer = (on) => {
      h.timer.style.display = on ? 'block' : 'none'; h.bar.style.display = on ? 'block' : 'none';
      root.classList.toggle('has-timer', !!on);
      if (!on) { h.vig.classList.remove('on'); h.vig.style.display = 'none'; BC.Crowd.tension(false); }
    };
    h.setTimer = (left, total) => {
      const f = Math.min(1, Math.max(0, left) / total);
      h.timer.querySelector('.arc').style.strokeDashoffset = String(427.26 * (1 - f));
      h.bar.firstChild.style.transform = `scaleX(${f})`;
      const s = Math.ceil(Math.max(0, left));
      const num = h.timer.querySelector('.num'); if (num.textContent !== String(s)) num.textContent = s;
      const reading = h.timer.classList.contains('reading'), low = !reading && left <= 5, mid = !reading && !low && left <= 10 && total > 12;
      for (const e of [h.timer, h.bar]) { e.classList.toggle('low', low); e.classList.toggle('mid', mid); e.classList.toggle('reading', reading); }
      const glow = low && left > 0;
      h.vig.style.display = glow ? 'block' : 'none'; h.vig.classList.toggle('on', glow);
      BC.Crowd.tension(glow);
    };
    return h;
  };

  /* ---------- the answer diamond: 4 options placed where their buttons are ---------- */
  UI.diamond = function (root, opts, extraCls = '') {
    const d = { els: {}, values: {} };
    BC.DIRS.forEach((dir, i) => {
      const o = el('div', `opt ${dir} ${extraCls}`, `${/nogl/.test(extraCls) ? '' : UI.glyph(dir)}<span class="ot">${math(opts[i])}</span><span class="chips"></span><span class="xby"></span>`);
      o.dataset.act = 'dir:' + dir;             // clickable by the mouse (the teacher answers for a team)
      d.els[dir] = o; d.values[dir] = opts[i];
      root.appendChild(o);
    });
    d.all = () => BC.DIRS.map((k) => d.els[k]);
    d.select = (dir, team) => { d.all().forEach((o) => (team ? o.classList.remove('sel-' + team) : o.classList.remove('sel-red', 'sel-blue'))); if (dir && team) d.els[dir].classList.add('sel-' + team); };      // one ring per team (both can be on the same tile)      // highlighted, not answered yet
    d.enter = () => gsap.fromTo(d.all(), { opacity: 0, scale: 0.6, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'back.out(1.8)' });
    d.fit = () => d.all().forEach((o) => BC.fit(o.querySelector('.ot'), parseInt(getComputedStyle(o.querySelector('.ot')).fontSize, 10), 20));
    d.pick = (dir, team) => { d.els[dir].classList.add('pick-' + team); gsap.fromTo(d.els[dir], { scale: 1.08 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }); };
    d.chip = (dir, team) => { const c = el('span', `chip ${team}`, BC.tn(team)); d.els[dir].querySelector('.chips').appendChild(c); gsap.from(c, { scale: 0, duration: 0.3, ease: 'back.out(3)' }); };
    d.reveal = (rightDir) => {
      BC.DIRS.forEach((k) => { if (k !== rightDir) d.els[k].classList.add('wrong-ans'); });
      d.els[rightDir].classList.remove('wrong-ans');
      d.els[rightDir].classList.add('right-ans');
      gsap.fromTo(d.els[rightDir], { scale: 1.12 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, .45)' });
    };
    d.shake = (dir) => gsap.fromTo(d.els[dir], { x: -16 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, .25)' });
    d.center = (dir) => BC.centerOf(d.els[dir]);
    return d;
  };

  /* ---------- question card with a solution area ---------- */
  UI.qcard = function (root, q, ref, book, fig) {
    const c = el('div', 'qcard' + (fig ? ' vis' : ''), `<div class="qt"><span>${math(q)}</span></div><div class="sol"></div>${fig ? `<div class="fig">${fig}</div>` : ''}<div class="ref">${book ? book + ' · ' : ''}${ref || ''}</div>`);
    root.appendChild(c);
    root.classList.toggle('vis', !!fig);
    requestAnimationFrame(() => BC.fit(c.querySelector('.qt'), fig ? 44 : 54, 24));
    c.solve = async (steps) => {
      if (!steps || !steps.length) return;
      c.classList.add('solved');
      BC.fit(c.querySelector('.qt'), fig ? 26 : 30, 18);
      const sol = c.querySelector('.sol');
      sol.innerHTML = steps.map((s, i) => `<div class="stp"><span class="no">${i + 1}</span><span>${math(s)}</span></div>`).join('');
      const items = BC.$$('.stp', sol);
      // shrink the steps if they do not fit
      let size = 34;
      while (size > 20 && sol.scrollHeight + sol.offsetTop > c.clientHeight - 30) { size -= 2; items.forEach((it) => { it.style.fontSize = size + 'px'; }); }
      for (const it of items) { if (!it.isConnected) break; BC.Audio.play('step'); gsap.fromTo(it, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }); await BC.Match.sleep(650); }
    };
    gsap.fromTo(c, { opacity: 0, y: -30, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' });
    return c;
  };

  /* ---------- big banner across the middle ---------- */
  UI.banner = async function (root, text, team, hold = 700) {
    const b = el('div', `banner ${team || ''}`, `<i class="plate"></i><span>${BC.esc(text)}</span>`);
    root.appendChild(b);
    const sp = b.querySelector('span'), pl = b.querySelector('.plate');
    if (sp.offsetWidth > BC.W - 330) { sp.style.fontSize = Math.floor(130 * (BC.W - 330) / sp.offsetWidth) + 'px'; }      // a long team name still fits the screen
    pl.style.width = Math.max(330, sp.offsetWidth + 150) + 'px'; pl.style.height = sp.offsetHeight + 50 + 'px';
    if (!team && /^(TIME UP|NOBODY|LOCKED OUT|TOO SLOW)/.test(text)) BC.Crowd.groan('both');
    gsap.fromTo(b, { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power4.out' });
    await BC.Match.sleep(hold);
    gsap.to(b, { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => b.remove() });
    await BC.Match.sleep(250);
  };

  UI.status = function (root, html) {
    let s = root.querySelector('.status');
    if (!s) { s = el('div', 'status'); root.appendChild(s); }
    if (s.innerHTML === html) return s;
    s.innerHTML = html;
    gsap.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    return s;
  };

  /* whose turn it is, shown in five places at once: a glowing frame round the whole screen in the team's colour, the team's score plate lifts
     with a white ring and a YOUR TURN tag, the other plate dims, the info box beside the timer takes the team's colour, and a banner announces it */
  BC.setTurn = function (team) {
    document.body.classList.toggle('turn-red', team === 'red');
    document.body.classList.toggle('turn-blue', team === 'blue');
    BC.$$('.hud-team').forEach((p) => { p.classList.toggle('turn', !!team && p.classList.contains(team)); p.classList.toggle('off', !!team && !p.classList.contains(team)); });
  };

  BC.toast = function (text) {
    const t = el('div', 'toast', BC.esc(text));
    BC.$('#stage').appendChild(t);
    gsap.timeline().to(t, { opacity: 1, duration: 0.2 }).to(t, { opacity: 0, duration: 0.4, delay: 1.3, onComplete: () => t.remove() });
  };
})();
