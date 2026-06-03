// ──────────────────────────────────────────────
// NEON RAIDER — Retro Synthesizer Audio Engine
// Web Audio API · Zero external assets
// ──────────────────────────────────────────────

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// ── Utility ──────────────────────────────────

function noise(ac: AudioContext, duration: number): AudioBufferSourceNode {
  const buf = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  return src;
}

// ── Sound effects ────────────────────────────

export function playLaser() {
  const ac = getCtx();
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.exponentialRampToValueAtTime(220, t + 0.12);
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.12);
}

export function playEnemyLaser() {
  const ac = getCtx();
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.15);
}

export function playExplosionSmall() {
  const ac = getCtx();
  const t = ac.currentTime;
  const n = noise(ac, 0.3);
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(4000, t);
  filter.frequency.exponentialRampToValueAtTime(200, t + 0.3);
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  n.connect(filter).connect(gain).connect(ac.destination);
  n.start(t);
  n.stop(t + 0.3);
}

export function playExplosionLarge() {
  const ac = getCtx();
  const t = ac.currentTime;
  // Noise burst
  const n = noise(ac, 0.6);
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(5000, t);
  filter.frequency.exponentialRampToValueAtTime(80, t + 0.6);
  gain.gain.setValueAtTime(0.35, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  n.connect(filter).connect(gain).connect(ac.destination);
  n.start(t);
  n.stop(t + 0.6);
  // Sub boom
  const osc = ac.createOscillator();
  const g2 = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.exponentialRampToValueAtTime(20, t + 0.5);
  g2.gain.setValueAtTime(0.4, t);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc.connect(g2).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.5);
}

export function playPowerUp() {
  const ac = getCtx();
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.25);
  osc.frequency.exponentialRampToValueAtTime(1600, t + 0.35);
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.setValueAtTime(0.15, t + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.4);
}

export function playPlayerHit() {
  const ac = getCtx();
  const t = ac.currentTime;
  const n = noise(ac, 0.2);
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1000, t);
  filter.Q.setValueAtTime(2, t);
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  n.connect(filter).connect(gain).connect(ac.destination);
  n.start(t);
  n.stop(t + 0.2);
}

export function playBossWarning() {
  const ac = getCtx();
  const t = ac.currentTime;
  for (let i = 0; i < 3; i++) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sawtooth";
    const start = t + i * 0.35;
    osc.frequency.setValueAtTime(200, start);
    osc.frequency.exponentialRampToValueAtTime(600, start + 0.15);
    osc.frequency.exponentialRampToValueAtTime(200, start + 0.3);
    gain.gain.setValueAtTime(0.18, start);
    gain.gain.setValueAtTime(0.18, start + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  }
}

export function playWaveComplete() {
  const ac = getCtx();
  const t = ac.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    const start = t + i * 0.12;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

export function playGameOver() {
  const ac = getCtx();
  const t = ac.currentTime;
  const notes = [440, 370, 311, 261]; // A4 F#4 Eb4 C4 descending
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sawtooth";
    const start = t + i * 0.25;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

// ── Background music — simple arpeggio loop ──

let musicOscs: OscillatorNode[] = [];
let musicPlaying = false;

export function startMusic() {
  if (musicPlaying) return;
  musicPlaying = true;
  const ac = getCtx();

  const bassNotes = [65.41, 73.42, 82.41, 73.42]; // C2 D2 E2 D2
  const arpNotes = [
    [261.63, 329.63, 392.0],
    [293.66, 369.99, 440.0],
    [329.63, 415.3, 493.88],
    [293.66, 369.99, 440.0],
  ];

  const loopDur = 4; // 4 seconds per loop
  const beatDur = loopDur / 4;

  function scheduleLoop() {
    if (!musicPlaying) return;
    const t = ac.currentTime + 0.05;

    for (let beat = 0; beat < 4; beat++) {
      // Bass
      const bass = ac.createOscillator();
      const bg = ac.createGain();
      bass.type = "sawtooth";
      bass.frequency.setValueAtTime(bassNotes[beat], t + beat * beatDur);
      bg.gain.setValueAtTime(0.06, t + beat * beatDur);
      bg.gain.setValueAtTime(0.06, t + beat * beatDur + beatDur * 0.8);
      bg.gain.exponentialRampToValueAtTime(
        0.001,
        t + beat * beatDur + beatDur * 0.95
      );
      bass.connect(bg).connect(ac.destination);
      bass.start(t + beat * beatDur);
      bass.stop(t + beat * beatDur + beatDur);
      musicOscs.push(bass);

      // Arps
      arpNotes[beat].forEach((freq, j) => {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = "triangle";
        const arpStart = t + beat * beatDur + j * (beatDur / 4);
        osc.frequency.setValueAtTime(freq, arpStart);
        g.gain.setValueAtTime(0.04, arpStart);
        g.gain.exponentialRampToValueAtTime(0.001, arpStart + beatDur / 4.5);
        osc.connect(g).connect(ac.destination);
        osc.start(arpStart);
        osc.stop(arpStart + beatDur / 4);
        musicOscs.push(osc);
      });
    }

    setTimeout(scheduleLoop, loopDur * 1000 - 100);
  }

  scheduleLoop();
}

export function stopMusic() {
  musicPlaying = false;
  musicOscs.forEach((o) => {
    try {
      o.stop();
    } catch (_) {
      /* already stopped */
    }
  });
  musicOscs = [];
}
