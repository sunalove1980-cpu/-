import { useCallback, useEffect, useRef, useState } from 'react';

// 숲 배경음을 Web Audio API로 그때그때 합성한다 (외부 음원 파일 없이 동작).
// - 바람/나뭇잎: 브라운 노이즈를 로우패스 필터에 통과시키고, 느린 LFO로 필터 컷오프를
//   흔들어서 "쏴아~" 하는 자연스러운 바람 소리를 만든다.
// - 새소리: 무작위 간격으로 짧은 사인파 지저귐을 좌우로 팬닝해서 뿌린다.
// 브라우저 자동재생 정책 때문에 반드시 사용자 클릭(toggle) 이후에만 소리가 난다.

export function useForestAmbience() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef(null);
  const birdTimerRef = useRef(null);

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctxRef.current = new Ctx();
    }
    return ctxRef.current;
  }, []);

  const scheduleBird = useCallback((ctx, destination) => {
    const delay = 1600 + Math.random() * 3400;
    birdTimerRef.current = setTimeout(() => {
      if (!nodesRef.current) return; // 이미 꺼짐
      playBirdChirp(ctx, destination);
      scheduleBird(ctx, destination);
    }, delay);
  }, []);

  const start = useCallback(() => {
    const ctx = ensureContext();
    if (!ctx) return; // Web Audio 미지원 브라우저
    if (ctx.state === 'suspended') ctx.resume();
    if (nodesRef.current) return;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);

    // 브라운 노이즈 버퍼 생성
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.value = 0.06;

    noise.connect(filter);
    filter.connect(windGain);
    windGain.connect(master);

    noise.start();
    lfo.start();

    nodesRef.current = { noise, lfo, master };
    scheduleBird(ctx, master);
    setEnabled(true);
  }, [ensureContext, scheduleBird]);

  const stop = useCallback(() => {
    clearTimeout(birdTimerRef.current);
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    nodesRef.current = null; // 예약된 새소리가 더 이상 재생되지 않도록 먼저 비움
    if (ctx && nodes) {
      const { master, noise, lfo } = nodes;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.4);
      setTimeout(() => {
        try {
          noise.stop();
          lfo.stop();
        } catch {
          // 이미 정지된 경우 무시
        }
      }, 450);
    }
    setEnabled(false);
  }, []);

  const toggle = useCallback(() => {
    if (enabled) stop();
    else start();
  }, [enabled, start, stop]);

  useEffect(
    () => () => {
      clearTimeout(birdTimerRef.current);
      ctxRef.current?.close?.();
    },
    [],
  );

  return { enabled, toggle };
}

function playBirdChirp(ctx, destination) {
  const now = ctx.currentTime;
  const noteCount = 2 + Math.floor(Math.random() * 3);
  const baseFreq = 1500 + Math.random() * 1200;

  const chirpGain = ctx.createGain();
  chirpGain.gain.value = 0.16;

  if (ctx.createStereoPanner) {
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.random() * 1.6 - 0.8;
    chirpGain.connect(panner);
    panner.connect(destination);
  } else {
    chirpGain.connect(destination);
  }

  for (let i = 0; i < noteCount; i++) {
    const start = now + i * 0.09;
    const freq = baseFreq + (Math.random() - 0.5) * 400;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.85, start);
    osc.frequency.exponentialRampToValueAtTime(freq, start + 0.05);

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, start);
    noteGain.gain.exponentialRampToValueAtTime(1, start + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

    osc.connect(noteGain);
    noteGain.connect(chirpGain);
    osc.start(start);
    osc.stop(start + 0.16);
  }
}
