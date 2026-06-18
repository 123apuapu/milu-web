// Web Audio 提示音 — 纯代码生成，无需音频文件

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

export function playMessageSound() {
  playTone(880, 0.12, 'sine', 0.25);
}

let ringInterval: ReturnType<typeof setInterval> | null = null;

export function startRingtone() {
  stopRingtone();
  playTone(520, 0.4, 'square', 0.2);
  ringInterval = setInterval(() => {
    playTone(520, 0.4, 'square', 0.2);
  }, 800);
}

export function stopRingtone() {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
}

export function playHangupSound() {
  playTone(330, 0.25, 'sine', 0.2);
}
