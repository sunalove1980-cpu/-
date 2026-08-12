// 명상하듯 편안하게 들을 수 있는 앰비언트 사운드. 오디오 파일 없이 Web Audio API로
// 그 자리에서 만들어 재생한다: 브라운 노이즈로 만든 부드러운 바람 + 낮게 깔리는 드론
// (살짝 어긋난 두 음이 숨쉬듯 맥놀이) + 가끔 울리는 은은한 종소리.
let ctx = null;
let masterGain = null;
let noiseSource = null;
let droneOscillators = [];
let droneGains = [];
let lfo = null;
let chimeTimer = null;
let running = false;

const FADE_IN_SEC = 1.6;
const FADE_OUT_SEC = 0.9;
const MASTER_VOLUME = 0.4;
const CHIME_NOTES = [523.25, 587.33, 659.25, 783.99, 880.0]; // 5음 음계 (C5 펜타토닉)

function getAudioContextClass() {
  if (typeof window === 'undefined') return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

export function isAmbientSupported() {
  return Boolean(getAudioContextClass());
}

function createBrownNoiseBuffer(audioCtx, seconds = 4) {
  const bufferSize = Math.floor(audioCtx.sampleRate * seconds);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.2;
  }
  return buffer;
}

function playChime(audioCtx, destination) {
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = CHIME_NOTES[Math.floor(Math.random() * CHIME_NOTES.length)];
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.07, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);
  osc.connect(gain).connect(destination);
  osc.start(now);
  osc.stop(now + 3.8);
  osc.addEventListener('ended', () => {
    osc.disconnect();
    gain.disconnect();
  });
}

function scheduleChime(audioCtx, destination) {
  const delay = 16000 + Math.random() * 18000; // 16~34초마다 한 번
  chimeTimer = window.setTimeout(() => {
    if (!running) return;
    playChime(audioCtx, destination);
    scheduleChime(audioCtx, destination);
  }, delay);
}

export async function startAmbientSound() {
  if (running) return;
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return;
  if (!ctx) ctx = new AudioContextClass();
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // 사용자 제스처 없이 재개가 막힌 경우 — 다음 탭에서 다시 시도된다.
      return;
    }
  }

  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(MASTER_VOLUME, ctx.currentTime + FADE_IN_SEC);
  masterGain.connect(ctx.destination);

  // 부드러운 바람 소리
  noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createBrownNoiseBuffer(ctx);
  noiseSource.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 700;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.5;
  noiseSource.connect(noiseFilter).connect(noiseGain).connect(masterGain);
  noiseSource.start();

  // 낮게 깔리는 명상 드론 (살짝 어긋난 두 음)
  droneOscillators = [];
  droneGains = [];
  for (const freq of [98, 98.4]) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.value = 0.16;
    osc.connect(gain).connect(masterGain);
    osc.start();
    droneOscillators.push(osc);
    droneGains.push(gain);
  }

  // 드론 볼륨을 아주 천천히 들숨/날숨처럼 움직여준다 (약 12초 주기)
  lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.05;
  lfo.connect(lfoGain);
  for (const gain of droneGains) lfoGain.connect(gain.gain);
  lfo.start();

  running = true;
  scheduleChime(ctx, masterGain);
}

export function stopAmbientSound() {
  running = false;
  window.clearTimeout(chimeTimer);
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const finishedGain = masterGain;
  const finishedNodes = [noiseSource, ...droneOscillators, lfo];
  finishedGain.gain.cancelScheduledValues(now);
  finishedGain.gain.setValueAtTime(finishedGain.gain.value, now);
  finishedGain.gain.linearRampToValueAtTime(0, now + FADE_OUT_SEC);

  window.setTimeout(() => {
    for (const node of finishedNodes) {
      try {
        node?.stop();
      } catch {
        // 이미 멈춘 노드면 무시
      }
      node?.disconnect();
    }
    finishedGain.disconnect();
  }, FADE_OUT_SEC * 1000 + 100);

  noiseSource = null;
  droneOscillators = [];
  droneGains = [];
  lfo = null;
  masterGain = null;
}
