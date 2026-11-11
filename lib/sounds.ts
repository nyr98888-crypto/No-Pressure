let audioCtx: AudioContext | null = null;
let chargeOsc: OscillatorNode | null = null;
let chargeGain: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function tone(
  ctx: AudioContext,
  {
    type = "sine",
    frequency,
    start,
    duration,
    gain = 0.12,
    rampTo,
  }: {
    type?: OscillatorType;
    frequency: number;
    start: number;
    duration: number;
    gain?: number;
    rampTo?: number;
  }
) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (rampTo != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(rampTo, 1), start + duration);
  }
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Very short high-end mechanical click (drag ticks). */
export function playTick() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, {
    type: "triangle",
    frequency: 2200 + Math.random() * 600,
    start: now,
    duration: 0.025,
    gain: 0.03,
    rampTo: 1100,
  });
}

/** Smooth rising synth for slider charge-up. `progress` 0→1. */
export function playCharge(progress: number) {
  const ctx = getCtx();
  if (!ctx) return;
  const p = Math.max(0, Math.min(1, progress));
  const freq = 120 + p * 680;

  if (!chargeOsc || !chargeGain) {
    chargeOsc = ctx.createOscillator();
    chargeGain = ctx.createGain();
    chargeOsc.type = "sawtooth";
    chargeOsc.frequency.value = freq;
    chargeGain.gain.value = 0.0001;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800;
    chargeOsc.connect(filter);
    filter.connect(chargeGain);
    chargeGain.connect(ctx.destination);
    chargeOsc.start();
  }

  chargeOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.04);
  chargeGain.gain.setTargetAtTime(0.04 + p * 0.08, ctx.currentTime, 0.05);
}

export function stopCharge() {
  const ctx = getCtx();
  if (!ctx || !chargeOsc || !chargeGain) return;
  const now = ctx.currentTime;
  chargeGain.gain.setTargetAtTime(0.0001, now, 0.03);
  const osc = chargeOsc;
  const gain = chargeGain;
  chargeOsc = null;
  chargeGain = null;
  window.setTimeout(() => {
    try {
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    } catch {
      /* already stopped */
    }
  }, 120);
}

/** Heavy 808 slam + metal impact. */
export function playDetonation() {
  stopCharge();
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  tone(ctx, {
    type: "sine",
    frequency: 90,
    start: now,
    duration: 0.45,
    gain: 0.4,
    rampTo: 32,
  });

  tone(ctx, {
    type: "square",
    frequency: 420,
    start: now,
    duration: 0.08,
    gain: 0.08,
    rampTo: 180,
  });

  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.18, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.2);
  }
  const noise = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  noise.buffer = noiseBuffer;
  filter.type = "bandpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.7;
  amp.gain.setValueAtTime(0.35, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  noise.connect(filter);
  filter.connect(amp);
  amp.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.18);
}

/** Cascading gold coin bells + register chime. */
export function playJackpot() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093];
  notes.forEach((frequency, i) => {
    tone(ctx, {
      type: "square",
      frequency,
      start: now + i * 0.05,
      duration: 0.12,
      gain: 0.07,
    });
    tone(ctx, {
      type: "sine",
      frequency: frequency * 2,
      start: now + i * 0.05 + 0.015,
      duration: 0.1,
      gain: 0.04,
    });
  });
}

/** Metallic token snap clink. */
export function playClink() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, {
    type: "triangle",
    frequency: 1400,
    start: now,
    duration: 0.08,
    gain: 0.07,
    rampTo: 700,
  });
  tone(ctx, {
    type: "sine",
    frequency: 2800,
    start: now + 0.01,
    duration: 0.06,
    gain: 0.04,
    rampTo: 1200,
  });
}

/** Keep alias used by settle flow. */
export function playBuzzer() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, {
    type: "sawtooth",
    frequency: 220,
    start: now,
    duration: 0.5,
    gain: 0.16,
    rampTo: 70,
  });
  tone(ctx, {
    type: "sawtooth",
    frequency: 233,
    start: now,
    duration: 0.5,
    gain: 0.12,
    rampTo: 80,
  });
}

/** Legacy alias. */
export function playSlam() {
  playDetonation();
}
