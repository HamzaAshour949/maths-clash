/* Maths Clash sound: soft tuned tones (bells, marimba, plucks, button sounds) and a quiet music loop.
   The kids' voices are gone except two: YAAAY when an answer is right and a sad AWWW when a team gets it wrong or loses points. */
'use strict';
(function () {
  const A = BC.Audio = {};
  let ctx = null, master, sfx, music, verb;
  /* v0.3: the four big sounds each have a volume slider in Settings (0-10, 8 = as recorded) */
  const CATS = { vBuzz: { sounds: ['buzzer'] }, vCorrect: { sounds: ['correct'] }, vFail: { sounds: ['trumpet'] }, vWin: { sounds: ['win'] } };
  const cats = {};
  const catLevel = (k) => { const v = BC.settings[k]; return (v == null ? 8 : v) / 8; };

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = BC.settings.volume;
    master.connect(ctx.destination);
    sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(master);
    // v0.3: a volume for each big moment (Settings sliders 0-10, 8 = normal): the buzzer, the correct sound, the failure trumpet, the win
    Object.keys(CATS).forEach((k) => { const g = ctx.createGain(); g.gain.value = catLevel(k); g.connect(sfx); cats[k] = g; });
    music = ctx.createGain(); music.gain.value = BC.settings.music ? 0.26 : 0; music.connect(master);
    // small room: two feedback delays, tonal and soft
    verb = ctx.createGain(); verb.gain.value = 0.18;
    const d1 = ctx.createDelay(); d1.delayTime.value = 0.071;
    const d2 = ctx.createDelay(); d2.delayTime.value = 0.113;
    const fb = ctx.createGain(); fb.gain.value = 0.35;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    verb.connect(d1); d1.connect(d2); d2.connect(lp); lp.connect(fb); fb.connect(d1); lp.connect(master);
    return ctx;
  }
  A.unlock = function () { init(); loadSamples(); if (ctx && ctx.state === 'suspended') ctx.resume(); };
  ['pointerdown', 'keydown'].forEach((t) => window.addEventListener(t, A.unlock, { once: false, passive: true }));

  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  /* one voice: sine/triangle with soft attack and exponential decay */
  function tone(midi, { t = 0, dur = 0.4, type = 'sine', vol = 0.3, attack = 0.005, glide = 0, dest = null, verbAmt = 1 } = {}) {
    if (!init()) return;
    const now = ctx.currentTime + t;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(hz(midi), now);
    if (glide) o.frequency.exponentialRampToValueAtTime(hz(midi + glide), now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g); g.connect(dest || sfx);
    if (verbAmt && !dest) { const vg = ctx.createGain(); vg.gain.value = verbAmt; g.connect(vg); vg.connect(verb); }
    o.start(now); o.stop(now + dur + 0.05);
  }
  /* FM bell */
  function bell(midi, { t = 0, dur = 1.2, vol = 0.22, ratio = 3.5, index = 2.2, dest = null } = {}) {
    if (!init()) return;
    const now = ctx.currentTime + t;
    const car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    car.frequency.value = hz(midi); mod.frequency.value = hz(midi) * ratio;
    mg.gain.setValueAtTime(hz(midi) * index, now);
    mg.gain.exponentialRampToValueAtTime(1, now + dur);
    mod.connect(mg); mg.connect(car.frequency);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    car.connect(g); g.connect(dest || sfx); g.connect(verb);
    car.start(now); mod.start(now); car.stop(now + dur + 0.05); mod.stop(now + dur + 0.05);
  }
  /* marimba: sine + quick 4th harmonic */
  function marimba(midi, t = 0, vol = 0.28) {
    tone(midi, { t, dur: 0.5, vol, type: 'sine' });
    tone(midi + 24, { t, dur: 0.09, vol: vol * 0.35, type: 'sine', verbAmt: 0.3 });
  }

  /* ---------- the crowd: claps (short puffs of noise) and kids' voices (a buzzy tone through two vowel filters) ---------- */
  let noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  const side = (team) => (team === 'red' ? -0.55 : team === 'blue' ? 0.55 : 0);
  function toStage(node, p) {
    if (ctx.createStereoPanner) { const pn = ctx.createStereoPanner(); pn.pan.value = Math.max(-1, Math.min(1, p)); node.connect(pn); pn.connect(sfx); } else node.connect(sfx);
  }
  function clap(t, vol, p) {
    const now = ctx.currentTime + t;
    const src = ctx.createBufferSource(); src.buffer = noise();
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400 + Math.random() * 1800; bp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    src.connect(bp); bp.connect(g); toStage(g, p + (Math.random() - 0.5) * 0.5);
    src.start(now, Math.random() * 0.8, 0.08);
  }
  function voice(midi, { t = 0, dur = 0.6, vol = 0.2, glide = 0, f1 = 800, f2 = 1300, p = 0 } = {}) {
    const now = ctx.currentTime + t;
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(hz(midi), now);
    if (glide) { o.frequency.linearRampToValueAtTime(hz(midi + glide), now + dur * 0.7); }
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 5 + Math.random() * 1.5; lg.gain.value = hz(midi) * 0.012; lfo.connect(lg); lg.connect(o.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + 0.07); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    for (const [f, q] of [[f1, 5], [f2, 6]]) { const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; o.connect(b); b.connect(g); }
    toStage(g, p);
    o.start(now); lfo.start(now); o.stop(now + dur + 0.05); lfo.stop(now + dur + 0.05);
  }
  function crowdCheer({ team, big }) {
    const p = side(team), n = big ? 40 : 22, span = big ? 1.9 : 1.1;
    for (let i = 0; i < n; i++) clap(Math.pow(Math.random(), 0.8) * span, big ? 0.07 : 0.055, p);
    const voices = big ? 4 : 3;
    for (let i = 0; i < voices; i++) voice(74 + Math.floor(Math.random() * 7), { t: Math.random() * 0.14, dur: big ? 0.85 : 0.6, glide: 3 + Math.random() * 3, f1: 850, f2: 1450, p: p + (Math.random() - 0.5) * 0.4 });
  }
  function crowdAww({ team, vol = 0.2 }) {
    const p = side(team);
    for (let i = 0; i < 3; i++) voice(68 + Math.floor(Math.random() * 5), { t: Math.random() * 0.12, dur: 1.0, glide: -5, f1: 520, f2: 950, vol, p: p + (Math.random() - 0.5) * 0.4 });
  }
  function crowdOoh({ team }) {
    const p = side(team);
    for (let i = 0; i < 2; i++) voice(66 + Math.floor(Math.random() * 4), { t: Math.random() * 0.08, dur: 0.5, glide: 3, f1: 360, f2: 820, vol: 0.16, p: p + (Math.random() - 0.5) * 0.3 });
  }
  A.tap = () => master;            // for checking levels in the preview

  /* ---------- real sounds: free recordings (credits in app/sounds/CREDITS.md), embedded by tools/pack_sounds.js.
     The tones above are the fallback if one cannot be loaded. ---------- */
  const buffers = {};
  function loadSamples() {
    if (!ctx || loadSamples.done || !BC.SoundData) return;
    loadSamples.done = true;
    for (const [name, url] of Object.entries(BC.SoundData)) {
      try {
        const bin = atob(url.slice(url.indexOf(',') + 1)), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        ctx.decodeAudioData(bytes.buffer, (buf) => { buffers[name] = buf; }, () => { /* stays a tone */ });
      } catch (e) { /* stays a tone */ }
    }
  }
  const pickOf = (a) => a[Math.floor(Math.random() * a.length)];
  /* play a recording; false when it is not loaded (the caller then makes the tone instead) */
  function sample(name, { vol = 1, delay = 0, pan = 0, rate = 1 } = {}) {
    const buf = buffers[name];
    if (!buf || !ctx) return false;
    const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(g); toStage(g, pan);
    src.start(ctx.currentTime + delay);
    return true;
  }
  A.sample = sample;
  A.loaded = () => Object.keys(buffers).length;
  /* a group of kids from a few recordings: several clips together, each a little different in pitch, place and timing */
  function kidsGroup(names, n, { vol = 0.3, pan = 0, spread = 0.5, delay = 0.5, rate = [0.95, 1.25] } = {}) {
    for (let i = 0; i < n; i++) {
      sample(pickOf(names), { vol: vol * (0.7 + Math.random() * 0.5), pan: pan + (Math.random() - 0.5) * spread, delay: Math.random() * delay, rate: rate[0] + Math.random() * (rate[1] - rate[0]) });
    }
  }
  const KID_CHEERS = ['kids-cheer', 'kids-play', 'kids-laugh1', 'kids-laugh2', 'kids-laugh3', 'kids-laugh-group'];
  function sampleCheer({ team, big }) {
    if (!buffers['kids-cheer']) return false;
    const p = side(team);
    for (let i = 0; i < (big ? 34 : 18); i++) clap(Math.pow(Math.random(), 0.8) * (big ? 1.8 : 1.0), big ? 0.05 : 0.04, p);   // little hands clapping
    kidsGroup(KID_CHEERS, big ? 7 : 4, { vol: 0.22, pan: p, delay: big ? 0.6 : 0.35 });
    sample('kids-roar', { vol: big ? 0.28 : 0.2, pan: p });
    A.swell(big ? 2400 : 1500);
    return true;
  }
  function sampleAww({ team }) {
    if (!buffers['kids-sob']) return false;
    const p = side(team);
    kidsGroup(['kids-sob'], 3, { vol: 0.32, pan: p, delay: 0.5, rate: [0.9, 1.1] });     // a few kids whimpering
    crowdAww({ team, vol: 0.08 });                                                      // and a soft "awww" under them
    return true;
  }
  /* the audience's quiet murmur: kids playing, looped with a cross-fade so it never stops or repeats obviously */
  const amb = { level: 0, gain: null, nextAt: 0, timer: null, mult: 1, base: 0 };
  const AMB_FADE = 3;
  function ambientTick() {
    if (!ctx || !buffers['kids-chatter'] || amb.base <= 0) return;
    if (!amb.gain) { amb.gain = ctx.createGain(); amb.gain.gain.value = 0; amb.gain.connect(master); amb.nextAt = ctx.currentTime + 0.1; }
    amb.gain.gain.setTargetAtTime(amb.base * amb.mult, ctx.currentTime, 0.4);
    const buf = buffers['kids-chatter'], dur = buf.duration;
    while (amb.nextAt < ctx.currentTime + 1.5) {
      const src = ctx.createBufferSource(), g = ctx.createGain(), t = amb.nextAt;
      src.buffer = buf; src.playbackRate.value = 1;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(1, t + AMB_FADE);
      g.gain.setValueAtTime(1, t + dur - AMB_FADE); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      src.connect(g); g.connect(amb.gain); src.start(t); src.stop(t + dur + 0.1);
      amb.nextAt = t + dur - AMB_FADE;
    }
  }
  /* level 0 = off; about 0.1 is a murmur, 0.2 a lively crowd */
  A.ambient = function (level) {
    return;                                                  // no kids' murmur any more
    amb.base = level;
    if (!init()) return;
    if (!amb.timer) amb.timer = setInterval(ambientTick, 400);
    ambientTick();
    if (amb.gain) amb.gain.gain.setTargetAtTime(level * amb.mult, ctx.currentTime, 0.4);
  };
  /* the murmur swells for a moment when the crowd reacts */
  A.swell = function (ms = 1500) {
    return;
    if (!amb.gain || !ctx) return;
    amb.mult = 1.8; amb.gain.gain.setTargetAtTime(amb.base * amb.mult, ctx.currentTime, 0.12);
    clearTimeout(amb.swellT);
    amb.swellT = setTimeout(() => { amb.mult = 1; if (amb.gain) amb.gain.gain.setTargetAtTime(amb.base, ctx.currentTime, 0.6); }, ms);
  };
  /* the points counter rolling up: little ticks that climb */
  function rollTicks(n) { for (let i = 0; i < n; i++) if (!sample('ui-dial', { vol: 0.45, delay: i * 0.07, rate: 0.9 + i * 0.09 })) tone(84 + i, { t: i * 0.07, dur: 0.04, vol: 0.06, type: 'triangle', verbAmt: 0 }); }

  /* the only kids' sounds left: YAAAY (an answer is right) and AWWW (wrong / lost points). One of each at a time. */
  function yay(opt = {}) {
    if (!buffers['kids-cheer']) return crowdCheer({ team: opt.team, big: false });
    const p = side(opt.team);
    kidsGroup(['kids-cheer', 'kids-play', 'kids-laugh1', 'kids-laugh2', 'kids-laugh-group'], 5, { vol: 0.34, pan: p, delay: 0.25, rate: [0.97, 1.2] });
    sample('kids-roar', { vol: 0.3, pan: p });
  }
  function aww(opt = {}) {
    const p = side(opt.team);
    for (let i = 0; i < 4; i++) voice(70 + Math.floor(Math.random() * 6), { t: Math.random() * 0.15, dur: 1.25, glide: -7, f1: 560, f2: 1000, vol: 0.3, p: p + (Math.random() - 0.5) * 0.5 });
    if (buffers['kids-sob']) kidsGroup(['kids-sob'], 2, { vol: 0.2, pan: p, delay: 0.4, rate: [0.9, 1.05] });
  }
  const lastKid = { yay: -9, aww: -9 };
  function kid(kind, opt) {
    const now = ctx.currentTime, other = kind === 'yay' ? 'aww' : 'yay';
    if (now - lastKid[kind] < 1.4 || now - lastKid[other] < 0.6) return;
    lastKid[kind] = now;
    if (kind === 'yay') yay(opt); else aww(opt);
  }

  /* v0.3: the game-show wrong-answer buzzer, "EHH-EHH" (his words: "a nicer buzzer sound, ehh ehh"): two short honks, the second a little
     lower and longer. Each honk = two slightly detuned saw waves shaped into an "eh" vowel (formants near 600 Hz and 1,800 Hz) with a gentle
     clipper, so it is clear and strong without the harsh rasp. len < 0.8 gives a single short "ehh" (a wrong press in the tie-break race).
     Built on any audio context (also an OfflineAudioContext, to render a preview file). */
  A.buzzerOn = function (c, dest, t0, len = 1.0) {
    const honks = len < 0.8 ? [[0, 0.26, 207]] : [[0, 0.3, 207], [0.38, 0.44, 196]];
    const ws = c.createWaveShaper(), n = 1024, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.tanh(1.6 * x); }
    ws.curve = curve;
    const f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 600; f1.Q.value = 2.2;
    const f2 = c.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1800; f2.Q.value = 4;
    const body = c.createBiquadFilter(); body.type = 'lowpass'; body.frequency.value = 1100;
    const g1 = c.createGain(), g2 = c.createGain(), gb = c.createGain(); g1.gain.value = 1.6; g2.gain.value = 0.9; gb.gain.value = 0.35;
    const out = c.createGain(); out.gain.value = 0.75;
    ws.connect(f1); ws.connect(f2); ws.connect(body); f1.connect(g1); f2.connect(g2); body.connect(gb);
    [g1, g2, gb].forEach((g) => g.connect(out)); out.connect(dest);
    honks.forEach(([at, dur, hz0]) => {
      const s = t0 + at, env = c.createGain();
      env.gain.setValueAtTime(0.0001, s);
      env.gain.exponentialRampToValueAtTime(0.9, s + 0.015);
      env.gain.setValueAtTime(0.9, s + dur - 0.05);
      env.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      env.connect(ws);
      [[hz0, 0.5], [hz0 * 1.012, 0.45]].forEach(([hz, v]) => {
        const o = c.createOscillator(), g = c.createGain(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(hz, s); o.frequency.linearRampToValueAtTime(hz * 0.97, s + dur);
        g.gain.value = v; o.connect(g); g.connect(env); o.start(s); o.stop(s + dur + 0.03);
      });
    });
  };
  A.play = function (name, opt = {}) {
    if (!init()) return;
    const cat = Object.keys(CATS).find((k) => CATS[k].sounds.includes(name)), base = sfx;
    if (cat && cats[cat]) sfx = cats[cat];          // every node this sound makes goes through its own volume
    try { play(name, opt); } finally { sfx = base; }
  };
  A.setLevel = function (key) { if (cats[key] && ctx) cats[key].gain.setTargetAtTime(catLevel(key), ctx.currentTime, 0.03); };
  function play(name, opt) {
    switch (name) {
      case 'buzzer': if (!sample('wrong-buzzer', { vol: 0.5 })) A.buzzerOn(ctx, sfx, ctx.currentTime, 1.0); break;      // a first wrong answer or time up (his recording)
      case 'trumpet': if (!sample('fail-trumpet', { vol: 0.95 })) A.buzzerOn(ctx, sfx, ctx.currentTime, 1.0); break;   // a steal answered wrong (his recording)
      case 'cheer': break;                       // (no crowd cheering any more)
      case 'aww': kid('aww', opt); break;
      case 'grumble': break;
      case 'laugh': break;
      case 'ooh': break;
      case 'roll': rollTicks(opt.n || 6); break;
      case 'open': sample('ui-open', { vol: 0.7 }); break;
      case 'close': sample('ui-close', { vol: 0.7 }); break;
      case 'move': if (!sample('ui-move', { vol: 0.32 })) tone(84, { dur: 0.07, vol: 0.06, type: 'triangle', verbAmt: 0.2 }); break;
      case 'select': if (!sample('ui-select', { vol: 0.42 })) { marimba(72, 0, 0.2); marimba(79, 0.07, 0.2); } break;
      case 'back': if (!sample('ui-back', { vol: 0.5 })) { marimba(76, 0, 0.16); marimba(69, 0.07, 0.16); } break;
      case 'join': if (!sample('ui-join', { vol: 0.55, pan: side(opt.team) })) bell(opt.team === 'blue' ? 79 : 72, { dur: 0.9, vol: 0.18 }); break;
      case 'buzz':
        if (opt.team === 'blue') { bell(83, { dur: 1.1, vol: 0.26, ratio: 2.01 }); bell(90, { t: 0.06, dur: 0.9, vol: 0.14, ratio: 2.01 }); }
        else { bell(71, { dur: 1.1, vol: 0.28, ratio: 2.01 }); bell(78, { t: 0.06, dur: 0.9, vol: 0.15, ratio: 2.01 }); }
        tone(43, { dur: 0.25, vol: 0.35, glide: -12, verbAmt: 0 });
        break;
      case 'correct':                                // his "round win" recording for every right answer, then the kids' YAAAY
        if (!sample('round-win', { vol: 0.8 })) { [72, 76, 79, 84].forEach((m, i) => marimba(m, i * 0.075, 0.26)); bell(96, { t: 0.3, dur: 1.2, vol: 0.07 }); }
        kid('yay', opt); break;
      case 'wrong': tone(57, { dur: 0.32, vol: 0.22, type: 'triangle', glide: -3 }); tone(52, { t: 0.16, dur: 0.5, vol: 0.22, type: 'triangle', glide: -4 }); kid('aww', opt); break;
      case 'tick': tone(opt.high ? 93 : 88, { dur: 0.05, vol: opt.high ? 0.14 : 0.08, type: 'sine', verbAmt: 0.2 }); break;
      case 'lock': if (!sample('ui-lock', { vol: 0.45 })) { tone(64, { dur: 0.08, vol: 0.2, type: 'triangle', verbAmt: 0.2 }); tone(76, { t: 0.04, dur: 0.12, vol: 0.14, type: 'sine' }); } break;
      case 'dial': if (!sample('ui-dial', { vol: 0.5, rate: opt.up ? 1.15 : 0.9 })) tone(opt.up ? 91 : 86, { dur: 0.04, vol: 0.07, type: 'triangle', verbAmt: 0 }); break;
      case 'pull': marimba(opt.team === 'blue' ? 67 + (opt.step || 0) % 5 : 60 + (opt.step || 0) % 5, 0, 0.22); tone(36, { dur: 0.16, vol: 0.3, glide: -7, verbAmt: 0 }); break;
      case 'whoosh': tone(48, { dur: 0.6, vol: 0.13, type: 'triangle', glide: 24, attack: 0.25 }); tone(55, { dur: 0.6, vol: 0.08, type: 'sine', glide: 24, attack: 0.25 }); break;
      case 'slam': tone(40, { dur: 0.5, vol: 0.5, glide: -14, verbAmt: 0 }); bell(64, { dur: 1.6, vol: 0.16, ratio: 1.5 }); bell(71, { dur: 1.6, vol: 0.1, ratio: 1.5 }); break;
      case 'count': bell(opt.go ? 84 : 72, { dur: opt.go ? 1.0 : 0.4, vol: 0.2, ratio: 2 }); break;
      case 'reveal': marimba(67, 0, 0.18); marimba(74, 0.06, 0.18); break;
      case 'step': if (!sample('ui-step', { vol: 0.5 })) tone(79, { dur: 0.12, vol: 0.06, type: 'sine', verbAmt: 0.4 }); break;
      case 'bullseye': [84, 88, 91, 96].forEach((m, i) => bell(m, { t: i * 0.06, dur: 1.0, vol: 0.12 })); break;
      case 'score': {
        // points: a coin for a small score, an arcade ding for 100, a fanfare for a big one
        const pts = opt.pts || 50, p = side(opt.team);
        marimba(opt.team === 'blue' ? 79 : 74, 0, 0.12);
        sample(pts >= 150 ? 'score-big' : pts >= 100 ? 'score-arcade' : 'score-coin', { vol: pts >= 150 ? 0.85 : pts >= 100 ? 0.7 : 0.55, pan: p * 0.5 });
        break;
      }
      case 'win': {                                  // his "match win" recording for the winner screen
        if (sample('match-win', { vol: 0.9 })) break;
        const seq = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [72, 76, 79, 84]];
        seq.forEach((ch, i) => ch.forEach((m) => tone(m, { t: i * 0.28, dur: i === 3 ? 1.8 : 0.45, vol: 0.12, type: 'triangle' })));
        [72, 76, 79, 84, 88].forEach((m, i) => bell(m + 12, { t: 0.84 + i * 0.08, dur: 1.4, vol: 0.08 }));
        break;
      }
      default: break;
    }
  };

  /* ---------- music: a light loop (bass, plucks, a soft kick), 112 bpm ---------- */
  let musicTimer = null, step = 0, nextT = 0, mood = 'menu';
  const BPM = 112, S16 = 60 / BPM / 4;
  const PROG = [[45, 57, 60, 64], [41, 53, 57, 60], [48, 55, 60, 64], [43, 55, 59, 62]]; // Am F C G
  function schedule() {
    if (!ctx) return;
    while (nextT < ctx.currentTime + 0.12) {
      const bar = Math.floor(step / 16) % 4, s = step % 16, ch = PROG[bar];
      const t = nextT - ctx.currentTime;
      if (mood === 'battle') {
        if (s % 4 === 0) tone(36, { t, dur: 0.22, vol: 0.5, glide: -10, dest: music, verbAmt: 0 });
        if (s % 2 === 0) tone(ch[0] - 12 + (s % 8 === 6 ? 12 : 0), { t, dur: 0.18, vol: 0.32, type: 'triangle', dest: music });
        if ([0, 3, 6, 10, 12, 14].includes(s)) tone(ch[1 + (s % 3)] + 12, { t, dur: 0.16, vol: 0.09, type: 'triangle', dest: music });
        if (s === 4 || s === 12) tone(84, { t, dur: 0.03, vol: 0.05, dest: music });
      } else {
        if (s === 0) ch.slice(1).forEach((m) => tone(m, { t, dur: 2.2, vol: 0.05, type: 'triangle', attack: 0.4, dest: music }));
        if (s === 0 || s === 10) tone(ch[0] - 12, { t, dur: 0.6, vol: 0.25, type: 'triangle', dest: music });
        if ([0, 4, 6, 8, 12].includes(s)) tone(ch[1 + (s / 2) % 3] + 24, { t, dur: 0.25, vol: 0.045, type: 'sine', dest: music });
      }
      nextT += S16; step++;
    }
  }
  A.startMusic = function (m) {
    mood = m || mood;
    if (!init()) return;
    if (musicTimer) return;
    nextT = ctx.currentTime + 0.05; step = 0;
    musicTimer = setInterval(schedule, 40);
  };
  A.setMood = function (m) { mood = m; };
  A.toggleMusic = function () {
    BC.settings.music = !BC.settings.music; BC.saveSettings();
    if (init()) music.gain.setTargetAtTime(BC.settings.music ? 0.26 : 0, ctx.currentTime, 0.2);
    if (BC.toast) BC.toast(BC.settings.music ? 'Music on' : 'Music off');
  };
  A.setVolume = function (v) { BC.settings.volume = v; BC.saveSettings(); if (init()) master.gain.setTargetAtTime(v, ctx.currentTime, 0.05); };
  A.duck = function (on) {
    if (!init()) return;
    music.gain.setTargetAtTime(BC.settings.music ? (on ? 0.1 : 0.26) : 0, ctx.currentTime, 0.15);
    amb.mult = on ? 0.4 : 1;
    if (amb.gain) amb.gain.gain.setTargetAtTime(amb.base * amb.mult, ctx.currentTime, 0.2);
  };
})();
