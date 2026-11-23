/* Maths Clash effects: the night arena behind everything (haze, beams from the roof rig, floating numbers) and the sparks and confetti on top.
   Speed: the background is all soft light, so it is drawn at half size and 30 times a second on its own canvas; sparks and confetti
   are drawn full size on a second canvas that only exists while there is something to draw. Designed and built by Hamza Ashour. */
'use strict';
(function () {
  const FX = BC.FX = { parts: [], flash: { red: 0, blue: 0 }, tilt: 0, calm: false };
  const BGS = 0.5;                                   // background canvas scale
  let cv, g, cp, gp, W = 1920, H = 1080, t0 = performance.now(), lastBg = 0, partsOn = false;
  const doodles = [], bokeh = [];
  const GLYPHS = ['+', '−', '×', '÷', '=', '7', '3', '5', '9', '½', 'π', '¼', '%', '2'];
  const BEAM = { red: '215,70,75', blue: '60,120,215', warm: '255,211,122' };

  function size() {
    W = BC.W; H = BC.H;
    cv.width = Math.round(W * BGS); cv.height = Math.round(H * BGS);
    cp.width = W; cp.height = H;
  }

  FX.init = function () {
    cv = BC.$('#fx'); cp = BC.$('#fxp');
    g = cv.getContext('2d'); gp = cp.getContext('2d');
    size();
    for (let i = 0; i < 14; i++) doodles.push({ x: Math.random(), y: Math.random(), s: 44 + Math.random() * 64, c: GLYPHS[i % GLYPHS.length], v: 5 + Math.random() * 10, rot: (Math.random() - 0.5) * 0.8, vr: (Math.random() - 0.5) * 0.2 });
    for (let i = 0; i < 16; i++) bokeh.push({ x: Math.random(), y: Math.random(), r: 8 + Math.random() * 26, v: 4 + Math.random() * 8, ph: Math.random() * 6.28, c: i % 2 ? '215,70,75' : '60,120,215' });
    requestAnimationFrame(loop);
  };

  /* Team flash: lights that team's side of the arena for a moment. */
  FX.glow = function (team, amount = 1) { FX.flash[team] = Math.max(FX.flash[team], amount); };

  const SPARKS = ['#ffc43d', '#ffffff', '#ffd978'];
  FX.burst = function (x, y, color, n = 40, power = 1) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = (180 + Math.random() * 520) * power;
      FX.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.7 + Math.random() * 0.6, age: 0, r: 4 + Math.random() * 6, color: i % 3 === 0 ? color : SPARKS[i % SPARKS.length], kind: Math.random() < 0.45 ? 'star' : 'spark', rot: Math.random() * 6 });
    }
  };
  FX.confetti = function (team, n = 110) {
    const cols = team === 'blue' ? ['#3c78d7', '#8db7ec', '#ffffff', '#ffc43d', '#ffc43d'] : team === 'red' ? ['#d7464b', '#ec9a9c', '#ffffff', '#ffc43d', '#ffc43d'] : ['#d7464b', '#3c78d7', '#ffffff', '#ffc43d', '#ffc43d'];
    for (let i = 0; i < n; i++) {
      FX.parts.push({ x: Math.random() * W, y: -40 - Math.random() * 500, vx: (Math.random() - 0.5) * 160, vy: 160 + Math.random() * 260, life: 6, age: 0, r: 9 + Math.random() * 9, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10, color: cols[i % cols.length], kind: i % 5 === 0 ? 'dot' : 'paper' });
    }
  };
  /* a confetti cannon: paper shot up from the bottom corner on a team's side */
  FX.cannon = function (team, n = 55) {
    const left = team === 'red', cols = team === 'blue' ? ['#3c78d7', '#8db7ec', '#ffffff', '#ffc43d'] : ['#d7464b', '#ec9a9c', '#ffffff', '#ffc43d'];
    for (let i = 0; i < n; i++) {
      FX.parts.push({ x: left ? 24 + Math.random() * 60 : W - 24 - Math.random() * 60, y: H - 30, vx: (left ? 1 : -1) * (160 + Math.random() * 620), vy: -(900 + Math.random() * 900), g: 1500, life: 4, age: 0, r: 9 + Math.random() * 9, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14, color: cols[i % cols.length], kind: i % 5 === 0 ? 'dot' : 'paper' });
    }
  };
  FX.ring = function (x, y, color) { FX.parts.push({ x, y, life: 0.7, age: 0, r: 20, color, kind: 'ring' }); };

  function loop(now) {
    const dt = Math.min(0.05, (now - (loop.last || now)) / 1000); loop.last = now;
    if (cv.width !== Math.round(BC.W * BGS) || cp.height !== BC.H) size();
    drawParts(dt);
    if (now - lastBg >= 28) {                                  // the background: every other frame
      const bdt = Math.min(0.1, (now - (lastBg || now)) / 1000); lastBg = now;
      drawBg((now - t0) / 1000, bdt);
    }
    requestAnimationFrame(loop);
  }

  function drawBg(t, dt) {
    g.setTransform(BGS, 0, 0, BGS, 0, 0);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    // the night: very dark blue
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0b1034'); sky.addColorStop(0.5, '#0a0e2c'); sky.addColorStop(1, '#04061a');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    const k = FX.calm ? 0.4 : 0.75;       // the arena is dim, and dimmer still during a match so the questions are what you see
    const fr = FX.flash.red, fb = FX.flash.blue;
    FX.flash.red = Math.max(0, fr - dt * 1.4); FX.flash.blue = Math.max(0, fb - dt * 1.4);
    // soft haze: red on the left, blue on the right
    g.globalCompositeOperation = 'lighter';
    field(W * 0.14 + Math.sin(t * 0.2) * 80, H * 0.4, 760, `rgba(215,53,59,${(0.05 + fr * 0.2) * k})`);
    field(W * 0.86 + Math.cos(t * 0.17) * 80, H * 0.4, 760, `rgba(45,107,207,${(0.055 + fb * 0.2) * k})`);
    // beams from the lamps on the roof rig, sweeping slowly
    const lights = (BC.Arena && BC.Arena.lights) || [];
    lights.forEach((l, i) => {
      const f = l.x / W, base = (0.5 - f) * 1.05, a = base + Math.sin(t * 0.55 + i * 1.7) * 0.16;
      const L = H * 1.15, half = 0.075 + 0.02 * Math.sin(t * 0.8 + i);
      const x1 = l.x + Math.sin(a - half) * L, y1 = l.y + Math.cos(a - half) * L, x2 = l.x + Math.sin(a + half) * L, y2 = l.y + Math.cos(a + half) * L;
      const xm = l.x + Math.sin(a) * L, ym = l.y + Math.cos(a) * L;
      const gr = g.createLinearGradient(l.x, l.y, xm, ym);
      const boost = (l.team === 'red' ? fr : l.team === 'blue' ? fb : 0) * 0.25;
      gr.addColorStop(0, `rgba(${BEAM[l.team]},${(0.2 + boost) * k})`); gr.addColorStop(1, `rgba(${BEAM[l.team]},0)`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(l.x, l.y); g.lineTo(x1, y1); g.lineTo(x2, y2); g.closePath(); g.fill();
    });
    g.globalCompositeOperation = 'source-over';
    // soft lights floating up
    for (const b of bokeh) {
      b.y -= (b.v / H) * dt; if (b.y < -0.1) { b.y = 1.1; b.x = Math.random(); }
      const a = 0.02 + 0.03 * (0.5 + 0.5 * Math.sin(t * 0.9 + b.ph));
      g.fillStyle = `rgba(${b.c},${a * k})`; g.beginPath(); g.arc(b.x * W, b.y * H, b.r, 0, 6.283); g.fill();
    }
    // faint numbers and signs drifting up
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = `rgba(150,175,255,${0.05 * k})`;
    for (const d of doodles) {
      d.y -= (d.v / H) * dt; d.rot += d.vr * dt;
      if (d.y < -0.1) { d.y = 1.1; d.x = Math.random(); }
      g.save(); g.translate(d.x * W + Math.sin(t * 0.6 + d.s) * 14, d.y * H); g.rotate(d.rot);
      g.font = `900 ${d.s}px Nunito, sans-serif`;
      g.fillText(d.c, 0, 0);
      g.restore();
    }
  }

  /* sparks and confetti, full size, on top of the game; the canvas is hidden when there is nothing to draw */
  function drawParts(dt) {
    if (!FX.parts.length) { if (partsOn) { gp.clearRect(0, 0, W, H); cp.style.display = 'none'; partsOn = false; } return; }
    if (!partsOn) { cp.style.display = 'block'; partsOn = true; }
    gp.clearRect(0, 0, W, H);
    for (let i = FX.parts.length - 1; i >= 0; i--) {
      const p = FX.parts[i];
      p.age += dt;
      if (p.age > p.life) { FX.parts.splice(i, 1); continue; }
      const a = 1 - p.age / p.life;
      if (p.kind === 'spark' || p.kind === 'star') {
        p.vx *= 0.94; p.vy = p.vy * 0.94 + 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        gp.fillStyle = p.color; gp.globalAlpha = Math.min(1, a * 1.6);
        if (p.kind === 'star') star(p.x, p.y, p.r * (0.5 + a) * 1.3, 0.45, p.rot + p.age * 4);
        else { gp.beginPath(); gp.arc(p.x, p.y, p.r * a + 0.5, 0, 6.283); gp.fill(); }
      } else if (p.kind === 'ring') {
        gp.strokeStyle = p.color; gp.globalAlpha = a; gp.lineWidth = 6 * a;
        gp.beginPath(); gp.arc(p.x, p.y, p.r + p.age * 600, 0, 6.283); gp.stroke();
      } else {
        if (p.g) { p.vy += p.g * dt; p.vx *= 0.992; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        gp.save(); gp.translate(p.x, p.y); gp.rotate(p.rot); gp.globalAlpha = Math.min(1, a * 3);
        gp.fillStyle = p.color;
        if (p.kind === 'dot') { gp.beginPath(); gp.arc(0, 0, p.r / 2.2, 0, 6.283); gp.fill(); } else gp.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        gp.restore();
        if (p.y > H + 30) FX.parts.splice(i, 1);
      }
    }
    gp.globalAlpha = 1;
  }
  function field(x, y, r, col) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function star(x, y, R, inner = 0.45, rot = 0) {
    gp.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? R * inner : R, a = rot - 1.5708 + (i * Math.PI) / 5; gp.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    gp.closePath(); gp.fill();
  }
})();
