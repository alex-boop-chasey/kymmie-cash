/**
 * Synthesized sound engine using the Web Audio API. No external audio files,
 * so it works offline on Cloudflare static hosting. The AudioContext is created
 * lazily on the first user gesture (browser autoplay policy).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Call from a click/tap handler to unlock audio on mobile/Safari. */
export function unlockAudio() {
  ensure();
}

export function setMuted(m: boolean) {
  muted = m;
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.6, (ctx?.currentTime ?? 0), 0.02);
}
export function isMuted() {
  return muted;
}

interface ToneOpts {
  freq: number;
  type?: OscillatorType;
  dur: number;
  gain?: number;
  attack?: number;
  decay?: number;
  glideTo?: number;
  when?: number;
  /** Optional detune in cents for fatter voices. */
  detune?: number;
}

function tone(o: ToneOpts) {
  const c = ensure();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + (o.when ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.detune) osc.detune.setValueAtTime(o.detune, t0);
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.glideTo), t0 + o.dur);
  const peak = o.gain ?? 0.3;
  const atk = o.attack ?? 0.005;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + o.dur + 0.02);
}

function noiseBurst(dur: number, gain = 0.2, filterHz = 2000, when = 0, type: BiquadFilterType = 'bandpass') {
  const c = ensure();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + when;
  const frames = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = type;
  filt.frequency.value = filterHz;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filt);
  filt.connect(g);
  g.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

// ---- Internal helpers -----------------------------------------------------

/**
 * A filtered noise sweep — the "whoosh" of moving air/mechanics. The bandpass
 * center glides from startHz to endHz over the duration.
 */
function whoosh(dur: number, gain: number, startHz: number, endHz: number, when = 0) {
  const c = ensure();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + when;
  const frames = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    // gentle bell-shaped envelope in the buffer itself
    const env = Math.sin((i / frames) * Math.PI);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = 'bandpass';
  filt.Q.value = 1.2;
  filt.frequency.setValueAtTime(Math.max(20, startHz), t0);
  filt.frequency.exponentialRampToValueAtTime(Math.max(20, endHz), t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + dur * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filt);
  filt.connect(g);
  g.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/** A deep, punchy sub "thump"/impact — the body of casino hits. */
function thump(freq: number, dur: number, gain: number, when = 0) {
  tone({ freq, type: 'sine', dur, gain, glideTo: Math.max(30, freq * 0.4), when, attack: 0.002 });
}

/** A quick bright shimmer sparkle at high frequencies. */
function sparkle(when = 0, gain = 0.05, spread = 5) {
  for (let i = 0; i < spread; i++) {
    const f = 2600 + Math.random() * 2800;
    tone({ freq: f, type: 'sine', dur: 0.12 + Math.random() * 0.12, gain, when: when + i * 0.03, glideTo: f * 1.4 });
  }
}

// ---- Public sound effects -------------------------------------------------

export function playButton() {
  tone({ freq: 420, type: 'square', dur: 0.06, gain: 0.18, glideTo: 640 });
  tone({ freq: 840, type: 'sine', dur: 0.05, gain: 0.08, glideTo: 1200, when: 0.01 });
}

export function playSpin() {
  // Mechanical launch: a punchy low thump, a rising saw sweep and an airy whoosh.
  thump(140, 0.14, 0.22);
  tone({ freq: 180, type: 'sawtooth', dur: 0.55, gain: 0.14, glideTo: 620, detune: 6 });
  tone({ freq: 184, type: 'sawtooth', dur: 0.55, gain: 0.1, glideTo: 640, detune: -6 });
  whoosh(0.5, 0.14, 500, 3200);
  noiseBurst(0.06, 0.14, 1600, 0);
}

export function playReelStop(index = 0) {
  // Chunky mechanical thunk that rises in pitch per reel for building anticipation.
  const base = 240 + index * 42;
  thump(base * 0.7, 0.1, 0.16);
  tone({ freq: base, type: 'triangle', dur: 0.14, gain: 0.26, glideTo: base * 0.55 });
  tone({ freq: base * 2, type: 'square', dur: 0.05, gain: 0.08, glideTo: base });
  noiseBurst(0.05, 0.16, 800 + index * 200, 0);
}

export function playCoin(when = 0) {
  tone({ freq: 1250, type: 'sine', dur: 0.12, gain: 0.16, glideTo: 1900, when });
  tone({ freq: 1680, type: 'sine', dur: 0.1, gain: 0.11, glideTo: 2500, when: when + 0.035 });
  tone({ freq: 2400, type: 'sine', dur: 0.07, gain: 0.05, glideTo: 3000, when: when + 0.06 });
}

export function playWinSmall() {
  const notes = [523, 659, 784, 1047]; // C E G C
  notes.forEach((f, i) => {
    tone({ freq: f, type: 'triangle', dur: 0.2, gain: 0.24, when: i * 0.085 });
    tone({ freq: f * 2, type: 'sine', dur: 0.12, gain: 0.06, when: i * 0.085 }); // shimmer octave
  });
  playCoin(0.1);
  playCoin(0.24);
  sparkle(0.18, 0.04, 3);
}

export function playWinBig() {
  const notes = [523, 659, 784, 1047, 1319, 1568]; // C E G C E G triumphant run
  notes.forEach((f, i) => {
    tone({ freq: f, type: 'square', dur: 0.24, gain: 0.2, when: i * 0.095 });
    tone({ freq: f * 1.5, type: 'triangle', dur: 0.2, gain: 0.08, when: i * 0.095 }); // fifth harmony
  });
  thump(120, 0.3, 0.2);
  for (let i = 0; i < 8; i++) playCoin(0.15 + i * 0.07);
  sparkle(0.25, 0.05, 6);
}

/**
 * Dragon Link-style "win ticker": a repeating short square-wave blip whose
 * interval SHRINKS over the duration and whose pitch STEPS UP a semitone every
 * few blips, ending on a bright resolve. Call while the WIN meter counts up.
 *
 * @param magnitude 0..1 — bigger = higher starting pitch / more urgency.
 * @param durationMs total tick-up time in milliseconds.
 */
export function playWinTickup(magnitude: number, durationMs: number) {
  const c = ensure();
  if (!c || !master || muted) return;
  const dur = Math.max(0.2, durationMs / 1000);
  const mag = Math.max(0, Math.min(1, magnitude));
  // Bigger magnitude => higher starting pitch (roughly D5 .. A5).
  const baseFreq = 440 * Math.pow(2, (2 + mag * 5) / 12);
  const startInterval = 0.11; // slow at first
  const endInterval = 0.038; // frantic by the end
  const maxVoices = Math.max(4, Math.floor(dur / 0.04)); // cap scheduled voices

  let t = 0;
  let n = 0;
  let semis = 0;
  const stepEvery = 3; // step up a semitone every few blips
  while (t < dur && n < maxVoices) {
    const progress = t / dur;
    const interval = startInterval + (endInterval - startInterval) * progress;
    const freq = baseFreq * Math.pow(2, semis / 12);
    const gain = 0.1 + 0.06 * progress; // grows more urgent as it accelerates
    tone({ freq, type: 'square', dur: Math.min(0.07, interval * 0.8), gain, when: t, glideTo: freq * 1.02 });
    tone({ freq: freq * 2, type: 'sine', dur: 0.04, gain: gain * 0.3, when: t }); // faint octave shimmer
    t += interval;
    n++;
    if (n % stepEvery === 0) semis++;
  }
  // Bright resolve at the end.
  const resolveFreq = baseFreq * Math.pow(2, (semis + 2) / 12);
  tone({ freq: resolveFreq, type: 'triangle', dur: 0.22, gain: 0.22, when: t, glideTo: resolveFreq * 1.5 });
  tone({ freq: resolveFreq * 2, type: 'sine', dur: 0.18, gain: 0.08, when: t });
  sparkle(t + 0.02, 0.04, 3);
}

export function playJackpot() {
  // Big escalating fanfare with a deep bass foundation and cascading sparkle.
  const notes = [392, 523, 659, 784, 1047, 1319, 1568, 2093];
  notes.forEach((f, i) => {
    tone({ freq: f, type: 'sawtooth', dur: 0.32, gain: 0.2, when: i * 0.1, detune: 5 });
    tone({ freq: f, type: 'square', dur: 0.32, gain: 0.08, when: i * 0.1, detune: -7 });
  });
  thump(90, 0.5, 0.24);
  thump(120, 0.4, 0.18, 0.4);
  for (let i = 0; i < 16; i++) playCoin(0.2 + i * 0.06);
  sparkle(0.4, 0.06, 10);
}

export function playFreeSpins() {
  const notes = [659, 784, 988, 1319, 1568];
  notes.forEach((f, i) => {
    tone({ freq: f, type: 'triangle', dur: 0.3, gain: 0.24, when: i * 0.11 });
    tone({ freq: f * 2, type: 'sine', dur: 0.16, gain: 0.05, when: i * 0.11 });
  });
  thump(110, 0.28, 0.16);
  sparkle(0.2, 0.05, 5);
}

// ---- Hold & Spin money-feature sounds -------------------------------------

/**
 * Tense rising drone/riser used right before a big feature lands. Builds pitch
 * with a tremolo wobble for maximum anticipation.
 */
export function playAnticipation() {
  const c = ensure();
  if (!c || !master || muted) return;
  const t0 = c.currentTime;
  const dur = 1.4;

  // Rising detuned drone.
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.22, t0 + dur * 0.85);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  // Tremolo (amplitude wobble) that speeds up.
  const trem = c.createGain();
  trem.gain.value = 1;
  const lfo = c.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(6, t0);
  lfo.frequency.exponentialRampToValueAtTime(16, t0 + dur);
  const lfoDepth = c.createGain();
  lfoDepth.gain.value = 0.35;
  lfo.connect(lfoDepth);
  lfoDepth.connect(trem.gain);

  g.connect(trem);
  trem.connect(master);

  for (const [base, det] of [[110, 0], [110, 8], [165, -6]] as const) {
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(base, t0);
    osc.frequency.exponentialRampToValueAtTime(base * 4.5, t0 + dur);
    osc.detune.setValueAtTime(det, t0);
    osc.connect(g);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
  lfo.start(t0);
  lfo.stop(t0 + dur + 0.05);

  whoosh(dur, 0.1, 400, 4000);
}

/**
 * Bright magical "cha-ching" chime for a money orb locking in. Rises in pitch
 * with `index` (0,1,2,...) so each successive lock feels more rewarding.
 */
export function playOrbLand(index = 0) {
  const step = Math.min(index, 14); // cap the climb so it stays musical
  const root = 523 * Math.pow(2, step / 12); // climb a semitone per orb
  // Electric "zap": highpass-filtered noise crackle so each land reads as
  // lightning striking the symbol. Sits UNDER the bell.
  noiseBurst(0.06, 0.13, 2000, 0, 'highpass');
  noiseBurst(0.03, 0.08, 3600, 0.008, 'highpass');
  tone({ freq: 3200, type: 'sawtooth', dur: 0.05, gain: 0.05, glideTo: 800 }); // crackly zap body
  // Bright bell: fundamental + major third + octave.
  tone({ freq: root, type: 'triangle', dur: 0.3, gain: 0.24, glideTo: root * 1.01 });
  tone({ freq: root * 1.26, type: 'sine', dur: 0.26, gain: 0.12 });
  tone({ freq: root * 2, type: 'sine', dur: 0.4, gain: 0.14, glideTo: root * 2.01 });
  // Cha-ching metallic tail.
  tone({ freq: root * 3, type: 'square', dur: 0.14, gain: 0.05, when: 0.02 });
  thump(root * 0.5, 0.12, 0.1);
  playCoin(0.05);
  sparkle(0.04, 0.04, 3 + Math.min(step, 4));
}

/** Dramatic feature-start stinger for entering the money round. */
export function playHoldStart() {
  // Big impact hit.
  thump(70, 0.6, 0.26);
  thump(110, 0.35, 0.16);
  noiseBurst(0.4, 0.18, 1400, 0, 'lowpass');
  // Rising heroic chord.
  const chord = [262, 330, 392, 523];
  chord.forEach((f, i) => {
    tone({ freq: f, type: 'sawtooth', dur: 0.6, gain: 0.16, when: 0.05, detune: i % 2 ? 6 : -6, glideTo: f * 1.5 });
  });
  tone({ freq: 784, type: 'triangle', dur: 0.7, gain: 0.14, when: 0.1, glideTo: 1047 });
  sparkle(0.15, 0.06, 8);
}

/** Short suspenseful tick/riser played for each respin. */
export function playHoldRespin() {
  tone({ freq: 300, type: 'square', dur: 0.06, gain: 0.14, glideTo: 500 });
  tone({ freq: 220, type: 'sawtooth', dur: 0.28, gain: 0.1, glideTo: 660 });
  noiseBurst(0.05, 0.1, 1800, 0);
  whoosh(0.24, 0.07, 700, 2600);
}

type JackpotTier = 'mini' | 'minor' | 'major' | 'maxi' | 'super' | 'grand';

/**
 * Escalating celebratory fanfares for each jackpot tier. Grandeur (length,
 * note count, bass depth, sparkle) grows from mini -> minor -> major -> grand.
 */
export function playJackpotTier(tier: JackpotTier) {
  const c = ensure();
  if (!c || !master || muted) return;

  if (tier === 'mini') {
    // A single bright note + a short sparkle.
    tone({ freq: 1047, type: 'triangle', dur: 0.28, gain: 0.24, glideTo: 1047 * 1.5 });
    tone({ freq: 1047 * 2, type: 'sine', dur: 0.16, gain: 0.07 });
    thump(180, 0.2, 0.12);
    for (let i = 0; i < 3; i++) playCoin(0.08 + i * 0.06);
    sparkle(0.06, 0.045, 3);
    return;
  }

  if (tier === 'minor') {
    // A rising two-note motif.
    const notes = [784, 1047];
    notes.forEach((f, i) => {
      tone({ freq: f, type: 'triangle', dur: 0.26, gain: 0.22, when: i * 0.12 });
      tone({ freq: f * 2, type: 'sine', dur: 0.14, gain: 0.06, when: i * 0.12 });
    });
    thump(140, 0.28, 0.16);
    for (let i = 0; i < 6; i++) playCoin(0.12 + i * 0.06);
    sparkle(0.14, 0.05, 5);
    return;
  }

  if (tier === 'major') {
    // Three-note ascending run over a detuned saw stack.
    const notes = [659, 880, 1175];
    notes.forEach((f, i) => {
      tone({ freq: f, type: 'sawtooth', dur: 0.34, gain: 0.2, when: i * 0.13, detune: 6 });
      tone({ freq: f, type: 'square', dur: 0.34, gain: 0.08, when: i * 0.13, detune: -8 });
      tone({ freq: f * 1.5, type: 'triangle', dur: 0.26, gain: 0.07, when: i * 0.13 });
    });
    thump(100, 0.45, 0.2);
    thump(140, 0.35, 0.14, 0.3);
    for (let i = 0; i < 12; i++) playCoin(0.16 + i * 0.06);
    sparkle(0.18, 0.06, 8);
    return;
  }

  // grand — big 5-note ascending arpeggio + sustained low pad + double bass
  // thump + a long sparkle tail. The longest and grandest tier.
  const arp = [523, 659, 784, 1047, 1319];
  arp.forEach((f, i) => {
    tone({ freq: f, type: 'sawtooth', dur: 0.4, gain: 0.22, when: i * 0.14, detune: 6 });
    tone({ freq: f, type: 'square', dur: 0.4, gain: 0.09, when: i * 0.14, detune: -8 });
    tone({ freq: f * 1.5, type: 'triangle', dur: 0.3, gain: 0.08, when: i * 0.14 });
  });
  // Sustained low pad underneath the whole flourish.
  tone({ freq: 65, type: 'sawtooth', dur: 2.2, gain: 0.12, attack: 0.15, detune: 4 });
  tone({ freq: 98, type: 'sawtooth', dur: 2.2, gain: 0.08, attack: 0.15, detune: -6 });
  // Double bass thump.
  thump(65, 0.7, 0.26);
  thump(90, 0.6, 0.2, 0.35);
  for (let i = 0; i < 20; i++) playCoin(0.2 + i * 0.06);
  sparkle(0.2, 0.07, 14);
  sparkle(0.95, 0.06, 12); // long sparkle tail
}

/**
 * Crowd cheer/applause — layered swept-upward noise bursts (the roar) plus a
 * few bright rising tones (whistles). Play it when the player wins.
 */
export function playCheer() {
  const c = ensure();
  if (!c || !master || muted) return;
  // Applause roar: several overlapping noise bursts sweeping upward.
  for (let i = 0; i < 6; i++) {
    const when = i * 0.08;
    const start = 700 + Math.random() * 400;
    whoosh(0.5 + Math.random() * 0.3, 0.09, start, start + 1600 + Math.random() * 800, when);
  }
  // Sustained crowd body.
  noiseBurst(0.9, 0.12, 1500, 0, 'bandpass');
  noiseBurst(0.7, 0.08, 3000, 0.1, 'highpass');
  // Whistles: bright rising tones.
  const whistles = [1800, 2200, 2600];
  whistles.forEach((f, i) => {
    tone({ freq: f, type: 'sine', dur: 0.4, gain: 0.07, when: 0.15 + i * 0.12, glideTo: f * 1.5 });
  });
  sparkle(0.2, 0.04, 5);
}

/**
 * Crowd boo/disappointment — a low filtered "wahh" that slides downward in
 * pitch alongside a dull low tone. Play it when a spin loses.
 */
export function playBoo() {
  const c = ensure();
  if (!c || !master || muted) return;
  // Descending detuned "wahh" voices.
  for (const det of [0, 10, -10]) {
    tone({ freq: 320, type: 'sawtooth', dur: 0.8, gain: 0.12, glideTo: 90, detune: det });
  }
  // Dull low body tone.
  tone({ freq: 160, type: 'triangle', dur: 0.7, gain: 0.14, glideTo: 70 });
  // Muffled low crowd murmur sweeping downward.
  whoosh(0.7, 0.1, 900, 200);
  noiseBurst(0.6, 0.09, 500, 0, 'lowpass');
}

/** Resolving flourish when the money round ends; grander when `big`. */
export function playHoldEnd(big: boolean) {
  if (big) {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((f, i) => {
      tone({ freq: f, type: 'sawtooth', dur: 0.3, gain: 0.2, when: i * 0.09, detune: 5 });
      tone({ freq: f * 2, type: 'sine', dur: 0.2, gain: 0.06, when: i * 0.09 });
    });
    thump(90, 0.5, 0.24);
    for (let i = 0; i < 8; i++) playCoin(0.2 + i * 0.07);
    sparkle(0.25, 0.06, 9);
  } else {
    const notes = [523, 659, 784];
    notes.forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.24, gain: 0.22, when: i * 0.1 }));
    thump(130, 0.24, 0.14);
    playCoin(0.12);
    sparkle(0.18, 0.04, 3);
  }
}

// ---- Free-spins (3 Kymmies) big-winner celebration ------------------------

/**
 * The classic ringing "winner's bell" — a bright metallic bell struck several
 * times with a long ringing decay, like the top-box bell on a pub pokie.
 */
export function playWinnerBell() {
  const c = ensure();
  if (!c || !master || muted) return;
  const strikes = 5;
  for (let i = 0; i < strikes; i++) {
    const when = i * 0.26;
    // Bell = a bright fundamental plus inharmonic partials with long decay.
    tone({ freq: 1244, type: 'sine', dur: 0.9, gain: 0.24, when, attack: 0.001 });
    tone({ freq: 1244 * 2.76, type: 'sine', dur: 0.7, gain: 0.08, when, attack: 0.001 });
    tone({ freq: 1244 * 1.5, type: 'sine', dur: 0.8, gain: 0.06, when, attack: 0.001 });
    tone({ freq: 622, type: 'sine', dur: 0.6, gain: 0.05, when, attack: 0.001 });
  }
}

/**
 * A big triumphant fanfare + winner bell for when 3+ Kymmies land the free
 * spins — the "you won something special" moment.
 */
export function playFreeSpinsFanfare() {
  const brass = (f: number, when: number, dur: number, gain: number) => {
    tone({ freq: f, type: 'sawtooth', dur, gain, when, detune: 7 });
    tone({ freq: f, type: 'square', dur, gain: gain * 0.35, when, detune: -9 });
    tone({ freq: f * 1.5, type: 'triangle', dur: dur * 0.85, gain: gain * 0.4, when }); // fifth
  };

  // 1) Rising heroic run.
  const run = [392, 523, 659, 784, 1047, 1319, 1568, 2093];
  run.forEach((f, i) => brass(f, i * 0.12, 0.34, 0.2));

  // 2) A triumphant melodic phrase (pentatonic, celebratory) after the run.
  const melody: [number, number][] = [
    [1047, 1.0], [1319, 1.28], [1568, 1.56], [1319, 1.84], [1047, 2.02],
    [1319, 2.24], [1760, 2.5], [1568, 2.86], [1319, 3.14], [1568, 3.42], [2093, 3.7],
  ];
  melody.forEach(([f, when], i) => brass(f, when, i === melody.length - 1 ? 1.1 : 0.3, 0.19));

  // 3) A big sustained resolve chord at the end.
  [523, 659, 784, 1047].forEach((f) => tone({ freq: f, type: 'sawtooth', dur: 1.3, gain: 0.12, when: 3.7, detune: 5, attack: 0.03 }));

  // Deep foundation hits across the whole flourish.
  [0, 0.5, 1.0, 2.0, 3.0, 3.7].forEach((w, i) => thump(i % 2 ? 120 : 88, 0.55, 0.22, w));
  // Cascading coins + sparkle over the full duration.
  for (let i = 0; i < 30; i++) playCoin(0.3 + i * 0.11);
  sparkle(0.4, 0.06, 12);
  sparkle(2.4, 0.06, 12);
  sparkle(3.8, 0.07, 14);
  // Ring the winner's bell over the top of the fanfare.
  playWinnerBell();
}

// ---- Cash-register tally sounds -------------------------------------------

/** A classic "cha-ching" cash-register ding, brighter as the tally climbs. */
export function playCashRegister(step = 0) {
  const c = ensure();
  if (!c || !master || muted) return;
  // Mechanical drawer "ka" click.
  noiseBurst(0.04, 0.14, 1800, 0, 'bandpass');
  // Two bright ascending bell dings that rise a little with each coin counted.
  const base = 1320 * Math.pow(1.02, Math.min(step, 40));
  tone({ freq: base, type: 'triangle', dur: 0.12, gain: 0.2, glideTo: base * 1.02 });
  tone({ freq: base * 1.5, type: 'sine', dur: 0.16, gain: 0.12, when: 0.05 });
}

/** A big celebration burst once the whole money total is tallied. */
export function playBigCelebration() {
  const run = [523, 659, 784, 1047, 1319, 1568, 2093];
  run.forEach((f, i) => {
    tone({ freq: f, type: 'sawtooth', dur: 0.34, gain: 0.2, when: i * 0.09, detune: 6 });
    tone({ freq: f * 1.5, type: 'triangle', dur: 0.28, gain: 0.08, when: i * 0.09 });
  });
  thump(80, 0.7, 0.28);
  thump(110, 0.5, 0.2, 0.5);
  for (let i = 0; i < 18; i++) playCoin(0.2 + i * 0.06);
  sparkle(0.4, 0.07, 14);
}

// ---- Looping music bed ----------------------------------------------------
//
// A subtle, low-volume background loop driven by a lookahead scheduler. Voices
// are short-lived oscillators that disconnect themselves on `ended`, so nothing
// leaks. Everything routes through a single `musicGain` node into `master`, so
// the bed respects `muted` (master drops to 0) and can be faded out cleanly.

let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicGain: GainNode | null = null;
let musicMode: 'base' | 'feature' | null = null;
let featureIntensity = 0;
let musicNextTime = 0;
let musicStep = 0;

/** Schedule one short self-cleaning voice into the music bed. */
function musicVoice(
  freq: number,
  when: number,
  dur: number,
  type: OscillatorType,
  gain: number,
  detune = 0,
  glideTo = 0
) {
  const c = ctx;
  if (!c || !musicGain) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  // Optional erhu/guzheng-style pitch bend over most of the note.
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glideTo), when + dur * 0.9);
  if (detune) osc.detune.setValueAtTime(detune, when);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), when + Math.min(0.08, dur * 0.3));
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(g);
  g.connect(musicGain);
  osc.start(when);
  osc.stop(when + dur + 0.05);
  osc.onended = () => {
    osc.disconnect();
    g.disconnect();
  };
}

/** Lookahead scheduler — queues bars a little ahead of the audio clock. */
function scheduleMusic() {
  const c = ctx;
  if (!c || !musicGain || !musicMode) return;
  const lookahead = 0.25;
  while (musicNextTime < c.currentTime + lookahead) {
    const t = musicNextTime;
    if (musicMode === 'base') {
      // Traditional Chinese base tune: a long, flowing gong-mode pentatonic
      // guzheng melody (spanning ~2 octaves) with rests, grace-note ornaments,
      // occasional erhu-style bends and a descending guzheng run, over a warm
      // sustained pad and a soft taiko heartbeat.
      // Gong pentatonic across two octaves: G3 A3 C4 D4 E4 G4 A4 C5 D5 E5.
      const PENTA = [196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
      // 32-step phrase (-1 = rest). Arched contour resolving back toward C (=2/7).
      const MELODY = [
        7, 8, 7, 5, 6, 5, 4, -1, 2, 4, 5, 7, 6, 5, 4, 2,
        9, 8, 7, 6, 5, 4, 5, -1, 3, 4, 2, 4, 5, 2, -1, 2,
      ];
      const idx = MELODY[musicStep % MELODY.length];
      if (idx >= 0) {
        const note = PENTA[idx];
        // Long, expressive notes on phrase ends; a gentle erhu bend up into some.
        const long = musicStep % 8 === 7;
        const bend = musicStep % 8 === 0 ? note * 0.943 : 0; // slide up a tone into downbeats
        musicVoice(bend || note, t, long ? 0.9 : 0.5, 'triangle', 0.06, 0, bend ? note : 0);
        musicVoice(note * 2, t, 0.22, 'sine', 0.014); // shimmer octave
        // Quick guzheng grace note before select beats.
        if (musicStep % 4 === 2) musicVoice(note * 1.122, t, 0.08, 'triangle', 0.028);
        // Sparkling descending guzheng run once per phrase.
        if (musicStep % 16 === 12) {
          [7, 6, 5, 4].forEach((s, k) => musicVoice(PENTA[s], t + 0.09 + k * 0.075, 0.14, 'triangle', 0.03));
        }
      }
      if (musicStep % 4 === 0) {
        musicVoice(130.81, t, 2.0, 'sine', 0.032, 4); // sustained pad root
        musicVoice(196.0, t, 2.0, 'sine', 0.022, -4); // pad fifth
      }
      if (musicStep % 2 === 0) musicVoice(66, t, 0.2, 'sine', 0.07); // soft taiko heartbeat
      musicNextTime += 0.42;
    } else {
      // Lively Chinese festival tune (Chinese New Year style) for free spins and
      // the money round: a bright, fast dizi-flute melody with a long syncopated
      // phrase, grace notes, quick runs and bends, a driving bass, a hand-drum on
      // every beat and a gong accent on the downbeat. Tempo/brightness rise with
      // `featureIntensity` as the board fills.
      const c2 = ctx;
      const x = featureIntensity;
      const beat = 0.24 - 0.08 * x;
      // Bright pentatonic across two octaves: E4 G4 A4 C5 D5 E5 G5 A5 C6.
      const PENTA = [329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      // 32-step festive phrase (-1 = rest) with call-and-response and a run.
      const MELODY = [
        0, 2, 3, 4, 5, 4, 3, 2, 3, 5, 6, 5, 4, 3, 2, -1,
        3, 5, 6, 7, 6, 5, 4, 3, 4, 6, 7, 8, 7, 6, 5, 3,
      ];
      const idx = MELODY[musicStep % MELODY.length];
      if (idx >= 0) {
        const note = PENTA[idx];
        const bend = musicStep % 8 === 4 ? note * 0.891 : 0; // festive slide-up
        musicVoice(bend || note, t, beat * 0.9, 'triangle', 0.06, 0, bend ? note : 0); // bright dizi melody
        musicVoice(note * 2, t, beat * 0.45, 'sine', 0.02 + 0.02 * x); // sparkle
        // Fast ornamental grace note for the festive lilt.
        if (musicStep % 2 === 1) musicVoice(note * 1.122, t, beat * 0.3, 'triangle', 0.028);
        // Quick ascending flourish once per phrase.
        if (musicStep % 16 === 7) {
          [3, 4, 5, 6].forEach((s, k) => musicVoice(PENTA[s], t + beat * 0.5 + k * beat * 0.28, beat * 0.35, 'triangle', 0.03));
        }
      }
      musicVoice(98, t, beat * 0.85, 'sawtooth', 0.045 + 0.015 * x, 3); // driving bass
      musicVoice(66, t, 0.15, 'sine', 0.07); // hand-drum every beat
      // Bright gong/cymbal shimmer on the downbeat (scheduled at the beat time).
      if (musicStep % 4 === 0 && c2) noiseBurst(0.18, 0.045 + 0.03 * x, 5000, Math.max(0, t - c2.currentTime), 'highpass');
      musicNextTime += beat;
    }
    musicStep++;
  }
}

/** Shared start/switch logic for the two loops. */
function startMusic(mode: 'base' | 'feature') {
  const c = ensure();
  if (!c || !master) return;
  if (!musicGain) {
    musicGain = c.createGain();
    musicGain.gain.value = 0.0001;
    musicGain.connect(master);
  }
  // Bed level. Voices are already low-gain (~0.06); this node must be near-unity
  // (not ~0.06) or the bed double-attenuates to inaudibility. Feature runs hotter.
  const target = mode === 'base' ? 1.4 : 1.8;
  musicGain.gain.cancelScheduledValues(c.currentTime);
  musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), c.currentTime);
  musicGain.gain.setTargetAtTime(target, c.currentTime, 0.4);
  musicMode = mode;
  musicStep = 0;
  musicNextTime = c.currentTime + 0.1;
  if (!musicTimer) musicTimer = setInterval(scheduleMusic, 60);
  scheduleMusic();
}

/** Calm, traditional Chinese pentatonic loop (guzheng + pad) for the base game. */
export function startBaseMusic() {
  startMusic('base');
}

/** Livelier Chinese festival loop for the free-spins feature and money round. */
export function startFeatureMusic() {
  featureIntensity = 0;
  startMusic('feature');
}

/**
 * Nudge the feature loop's tempo/brightness up as the board nears full.
 * @param x 0..1 — fraction of the board filled.
 */
export function setFeatureIntensity(x: number) {
  featureIntensity = Math.max(0, Math.min(1, x));
  if (musicGain && ctx && musicMode === 'feature') {
    const target = 1.8 + 0.2 * featureIntensity; // brighten the bed a touch
    musicGain.gain.setTargetAtTime(target, ctx.currentTime, 0.3);
  }
}

/** Stop any music loop with a short fade, fully tearing down its nodes. */
export function stopMusic() {
  const c = ctx;
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  musicMode = null;
  const closing = musicGain;
  musicGain = null;
  if (closing && c) {
    closing.gain.cancelScheduledValues(c.currentTime);
    closing.gain.setValueAtTime(Math.max(0.0001, closing.gain.value), c.currentTime);
    closing.gain.setTargetAtTime(0.0001, c.currentTime, 0.2);
    // Disconnect after the fade so no nodes leak.
    setTimeout(() => {
      try {
        closing.disconnect();
      } catch {
        /* already disconnected */
      }
    }, 700);
  }
}

// ---- Kymmie (scatter) explosive build-up ----------------------------------

/**
 * A substantial, explosive hit + rising build-up each time a Kymmie lands on
 * the board. Escalates (louder/higher/tenser) with each successive Kymmie so
 * 1 → 2 → 3 keeps ramping the anticipation.
 */
export function playKymmieHit(count = 1) {
  const c = ensure();
  if (!c || !master || muted) return;
  const n = Math.max(1, count);
  // Explosive impact: deep boom + low noise blast + bright crack.
  thump(70 + n * 6, 0.5, 0.3);
  noiseBurst(0.35, 0.24, 320 + n * 110, 0, 'lowpass');
  noiseBurst(0.12, 0.16, 3200, 0, 'highpass');
  tone({ freq: 300 * Math.pow(1.12, n), type: 'sawtooth', dur: 0.18, gain: 0.2, glideTo: 120 });
  // Rising build-up riser that climbs higher and tenser with each Kymmie.
  const base = 190 * Math.pow(1.2, n);
  tone({ freq: base, type: 'sawtooth', dur: 0.95, gain: 0.17, glideTo: base * 3.6, detune: 7, when: 0.05 });
  tone({ freq: base * 1.01, type: 'sawtooth', dur: 0.95, gain: 0.1, glideTo: base * 3.6, detune: -7, when: 0.05 });
  whoosh(0.85, 0.13, 500, 3400 + n * 450, 0.05);
  sparkle(0.12, 0.05, 3 + n);
}

// ---- Money-coin harsh smack -----------------------------------------------

/** A harsh, slappy SMACK as money coins appear in a column. */
export function playOrbSmack(count = 1) {
  const c = ensure();
  if (!c || !master || muted) return;
  const n = Math.max(1, count);
  // Bright noise crack + low thwack body + a quick downward snap.
  noiseBurst(0.05, 0.32, 4200, 0, 'highpass');
  noiseBurst(0.06, 0.22, 1200, 0, 'bandpass');
  thump(150 + n * 8, 0.09, 0.26);
  tone({ freq: 950, type: 'square', dur: 0.05, gain: 0.16, glideTo: 190 });
}

// ---- Triumphant win horns (4 escalating tiers) ----------------------------

/**
 * Triumphant brass horn stabs on every win, escalating through 4 tiers — each
 * tier adds notes and grandeur. tier 1 = a single stab, tier 4 = a full fanfare.
 */
export function playWinHorns(tier = 1) {
  const c = ensure();
  if (!c || !master || muted) return;
  const bus = master;
  const t = Math.max(1, Math.min(4, Math.round(tier)));

  const stab = (freqs: number[], when: number, dur: number, gain: number) => {
    const t0 = c.currentTime + when;
    const filt = c.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 1500;
    filt.Q.value = 0.7;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * 0.55), t0 + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    filt.connect(g);
    g.connect(bus);
    freqs.forEach((f, i) => {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = i % 2 ? 7 : -7;
      o.connect(filt);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    });
  };
  const chord = (root: number) => [root, root * 1.5, root * 2];
  const G = 392, C2 = 523, E2 = 659, G2 = 784, C3 = 1047;

  if (t === 1) {
    stab(chord(G), 0, 0.42, 0.22);
  } else if (t === 2) {
    stab(chord(G), 0, 0.26, 0.2);
    stab(chord(C2), 0.22, 0.5, 0.24);
  } else if (t === 3) {
    stab(chord(G), 0, 0.2, 0.2);
    stab(chord(C2), 0.19, 0.2, 0.22);
    stab(chord(E2), 0.38, 0.62, 0.26);
    thump(90, 0.4, 0.16, 0.38);
    sparkle(0.4, 0.04, 4);
  } else {
    stab(chord(C2), 0, 0.19, 0.22);
    stab(chord(E2), 0.17, 0.19, 0.24);
    stab(chord(G2), 0.34, 0.22, 0.26);
    stab([C3, C3 * 1.5, C3 * 2, C2], 0.56, 0.95, 0.3);
    thump(80, 0.7, 0.24);
    thump(120, 0.5, 0.16, 0.6);
    for (let i = 0; i < 10; i++) playCoin(0.5 + i * 0.06);
    sparkle(0.6, 0.06, 10);
  }
}
