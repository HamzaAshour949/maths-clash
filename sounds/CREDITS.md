# Sound credits

Maths Clash uses free sound effects. They are trimmed and volume-matched; nothing else was changed.

**Buttons and menus (`ui-*.wav`)** — Kenney, *Interface Sounds* (https://kenney.nl/assets/interface-sounds), licence **CC0 1.0** (public domain, no credit needed).
Files used: tick_001, tick_002, click_003, click_004, select_002, back_002, confirmation_002, open_001, close_001.

**Kids' voices, ambience and score sounds (`kids-*`, `score-*`.mp3)** — Mixkit (https://mixkit.co/free-sound-effects/), **Mixkit Sound Effects Free License** (free for commercial and non-commercial projects, no credit needed; not to be resold on their own).
Items used (Mixkit sound-effect ids): 2253 Children playing indoors (the ambient chatter) · 448 Loud children crowd outdoors · 2262 Vocal kids playing and screaming · 2261 Kids playing and laughing · 427 Laughing children indoors · 2265 Happy child laughing · 431 Kid giggle laugh · 2258 Happy young girl · 2260 Little boy gibberish talk · 2257 Cartoon girl saying no no no · 474 Lost kid sobbing · 2069 Winning a coin, video game · 217 Arcade score interface · 2068 Achievement completed.

The game layers several of the kids' clips, each a little different in pitch and timing, so a few recordings sound like a whole group of children. The clapping, the music loop, bells, marimba and the other tones are made by the game itself (`js/audio.js`).

`tools/pack_sounds.js` turns this folder into `js/sounds-data.js` (the sounds embedded in the app).

**What still plays:** the button and menu sounds, the point sounds, the game's own tones (bells, marimba, ticks) and the music loop. Of the kids' recordings only the ones used for the **YAAAY** (an answer is right) and the sad **AWWW** (a team is wrong or loses points) are kept; the other kids' sounds (the murmur, laughing, gibberish, "no no no") are no longer used.

**Wrong-answer sounds (`wrong-buzzer.mp3`, `fail-trumpet.mp3`, v0.3)** — Pixabay (https://pixabay.com/sound-effects/), **Pixabay Content License** (free to use, no credit needed). Chosen by Mr. Hamza Ashour: "Buzzer or wrong answer" (eritnhut1992, 20582) for a first wrong answer or time up, "Failure trumpet" (Universfield, 242645) for a steal answered wrong. Trimmed and volume-matched.

**Win sounds (`round-win.mp3`, `match-win.mp3`, v0.3)** — supplied by Mr. Hamza Ashour (24 Nov 2026): "round win" plays for every right answer (CORRECT!, STOLEN!, GOT IT!, CHAMPIONS!), "match win" on the winner screen. Trimmed and volume-matched.
