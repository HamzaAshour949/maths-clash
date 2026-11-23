/* Maths Clash v0.3: the big reactions (his ask, 23 Nov: "a more exciting celebration screen after a team scores, and a wrong screen that is so obvious that it is wrong").
   UI.celebrate  - a right answer: the screen flashes in the team colour, light rays turn behind a big card with a green tick, the points count up,
                   stars fly out, confetti cannons fire, the screen kicks.
   UI.wrongScreen - a wrong answer or time up: the screen goes dark with red edges, a giant red X stamps down with a slam and the screen shakes,
                   then WRONG! with the team and the points it lost.
   UI.stampX     - a small X stamped on one answer tile (the tie-break race keeps going, so it cannot cover the screen).
   Flat colours and hard shadows (no gloss, no outlines), and nothing in the logo corner (x > 1690, y > 818). Designed and built by Hamza Ashour. */
'use strict';
(function () {
  const { el } = BC;
  const UI = BC.UI, A = () => BC.Audio, M = () => BC.Match;
  const sfx = (n, o) => { try { A().play(n, o); } catch (e) { /* no sound */ } };
  const kick = (x, y) => gsap.fromTo('#screen', { x, y }, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1.8, 0.25)' });
  const STAR = '<svg viewBox="0 0 40 40"><path d="M20 2 L25 15 L38 15 L27.5 23.5 L31.5 37 L20 29 L8.5 37 L12.5 23.5 L2 15 L15 15 Z"/></svg>';

  UI.celebrate = async function (root, team, title, pts, sub, hold = 1500) {
    const stolen = /STOLEN/.test(title);                 // a steal gets a thief's mask on a yellow badge; a right answer keeps the green tick
    const badge = stolen ? '<svg viewBox="0 0 100 100"><g transform="translate(50 50) scale(0.84) translate(-50 -50)"><path d="M9 44 L1 36 L3 51 Z M91 44 L99 36 L97 51 Z"/><path d="M8 42 C28 30 72 30 92 42 L90 56 C80 68 62 68 54 58 C52 55 48 55 46 58 C38 68 20 68 10 56 Z"/><ellipse cx="31" cy="50" rx="9" ry="6.5"/><ellipse cx="69" cy="50" rx="9" ry="6.5"/></g></svg>' : '<svg viewBox="0 0 100 100"><path d="M26 53 L44 70 L76 33"/></svg>';
    /* a steal is sneaky, not a party (his note): no confetti, stars, rays or cannons; the card snatches in fast from the stealing team's side */
    const w = el('div', `cel ${team || ''}${stolen ? ' stolen' : ''}`, `<div class="cel-flash"></div>${stolen ? '' : '<div class="cel-rays"></div>'}
      <div class="cel-card"><div class="cel-tick${stolen ? ' steal' : ''}">${badge}</div>
        <div class="cel-t">${BC.esc(title)}</div><div class="cel-who">${team ? BC.esc(BC.tn(team)) : ''}</div>
        ${pts ? '<div class="cel-pts">+<b>0</b></div>' : sub ? `<div class="cel-pts sub">${BC.esc(sub)}</div>` : ''}</div>
      ${stolen ? '' : `<div class="cel-stars">${Array.from({ length: 12 }, (_, i) => `<i class="s${i % 3}">${STAR}</i>`).join('')}</div>`}`);
    root.appendChild(w);
    const card = w.querySelector('.cel-card'), t = w.querySelector('.cel-t');
    if (t.scrollWidth > t.clientWidth) t.style.fontSize = Math.floor(132 * t.clientWidth / t.scrollWidth) + 'px';      // a long title still fits the card
    sfx('correct'); sfx('whoosh');
    if (!stolen) {
      try { BC.FX.cannon('red', 50); BC.FX.cannon('blue', 50); BC.FX.confetti(team, 120); } catch (e) { /* no effects */ }
      try { BC.Crowd.react(team || 'both', 'cheer', 1800, { p: 0.9, spread: 100 }); } catch (e) { /* no crowd */ }
      kick(team === 'blue' ? 14 : -14, -6);
      gsap.fromTo(w.querySelector('.cel-rays'), { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo(card, { scale: 0.3, rotation: -8, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: 'back.out(2.2)' });
    } else {
      const from = team === 'blue' ? 1500 : -1500;
      gsap.fromTo(card, { x: from, skewX: team === 'blue' ? -14 : 14, opacity: 1 }, { x: 0, skewX: 0, duration: 0.38, ease: 'back.out(1.3)' });
    }
    gsap.fromTo(w.querySelector('.cel-flash'), { opacity: 0 }, { opacity: stolen ? 0.35 : 0.6, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.out' });
    gsap.fromTo(w.querySelector('.cel-tick'), { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.6, delay: 0.18, ease: 'elastic.out(1, 0.45)' });
    if (!stolen) gsap.fromTo(w.querySelector('.cel-tick path'), { strokeDashoffset: 90 }, { strokeDashoffset: 0, duration: 0.35, delay: 0.3, ease: 'power2.out' });
    w.querySelectorAll('.cel-stars i').forEach((s, i) => {
      const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4, d = 380 + Math.random() * 160;
      gsap.fromTo(s, { x: 0, y: 0, scale: 0.2, rotation: 0, opacity: 1 }, { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.62, scale: 0.8 + Math.random() * 0.7, rotation: 200 + Math.random() * 160, opacity: 0, duration: 1.2, delay: 0.12 + Math.random() * 0.12, ease: 'power2.out' });
    });
    const pb = w.querySelector('.cel-pts b');
    if (pb) {
      const o = { v: 0 };
      gsap.to(o, { v: pts, duration: 0.7, delay: 0.25, ease: 'power2.out', onUpdate: () => { pb.textContent = Math.round(o.v); }, onComplete: () => { sfx('score'); gsap.fromTo(pb.parentNode, { scale: 1.3 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' }); } });
    }
    await M().sleep(hold);
    gsap.to(w, { opacity: 0, duration: 0.3, onComplete: () => w.remove() });
    await M().sleep(220);
  };

  UI.wrongScreen = async function (root, team, title, sub, hold = 1350, sound = 'buzzer') {      // sound: 'buzzer' (a first wrong answer) or 'trumpet' (a wrong steal)
    const w = el('div', `wr ${team || ''}`, `<div class="wr-dim"></div><div class="wr-x"><i></i><i></i></div>
      <div class="wr-card"><div class="wr-t">${BC.esc(title)}</div>
        <div class="wr-who">${team ? `<span class="pill ${team}">${BC.esc(BC.tn(team))}</span>` : ''}${sub ? `<b>${BC.esc(sub)}</b>` : ''}</div></div>`);
    root.appendChild(w);
    gsap.fromTo(w.querySelector('.wr-dim'), { opacity: 0 }, { opacity: 1, duration: 0.15 });
    const x = w.querySelector('.wr-x');
    gsap.fromTo(x, { scale: 3.2, opacity: 0, rotation: -12 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.26, ease: 'power4.in', onComplete: () => {
      sfx(sound); if (sound === 'buzzer') sfx('aww');      // his recordings: the buzzer for a first wrong answer, the failure trumpet for a wrong steal
      gsap.fromTo('#screen', { x: -22 }, { x: 0, duration: 0.7, ease: 'elastic.out(2.2, 0.18)' });
      gsap.fromTo(x, { scale: 1.12 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1.2, 0.35)' });
    } });
    gsap.fromTo(w.querySelector('.wr-card'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, delay: 0.3, ease: 'back.out(2)' });
    try { BC.Crowd.groan(team || 'both'); } catch (e) { /* no crowd */ }
    await M().sleep(hold);
    gsap.to(w, { opacity: 0, duration: 0.25, onComplete: () => w.remove() });
    await M().sleep(200);
  };

  /* a red X stamped on one element (an answer tile); it stays until the screen is cleared */
  UI.stampX = function (target) {
    if (!target) return;
    const s = el('div', 'stampx', '<i></i><i></i>');
    target.appendChild(s);
    gsap.fromTo(s, { scale: 2.6, opacity: 0, rotation: -15 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.22, ease: 'power4.in', onComplete: () => sfx('buzzer') });      // the buzzer in the race too
  };
})();
