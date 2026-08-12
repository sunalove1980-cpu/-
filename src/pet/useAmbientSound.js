// 앰비언트 사운드 on/off 상태를 관리하는 훅. 마지막으로 켜둔 상태를 localStorage에
// 기억해뒀다가, 브라우저 자동재생 정책 때문에 페이지를 열자마자 소리가 나오지는
// 못하므로 사용자가 화면에 처음 손을 대는 순간 자동으로 다시 재생을 이어간다.
import { useCallback, useEffect, useRef, useState } from 'react';
import { isAmbientSupported, startAmbientSound, stopAmbientSound } from './ambientSound.js';

const STORAGE_KEY = 'pocketpet.sound.v1';

function loadPreference() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

function savePreference(isOn) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, isOn ? 'on' : 'off');
  } catch {
    // 저장 실패는 조용히 무시
  }
}

export function useAmbientSound() {
  const supported = isAmbientSupported();
  const [enabled, setEnabled] = useState(() => supported && loadPreference());
  const resumeAttemptedRef = useRef(false);

  const enable = useCallback(() => {
    if (!supported) return;
    startAmbientSound();
    setEnabled(true);
    savePreference(true);
  }, [supported]);

  const disable = useCallback(() => {
    stopAmbientSound();
    setEnabled(false);
    savePreference(false);
  }, []);

  const toggle = useCallback(() => {
    if (enabled) disable();
    else enable();
  }, [enabled, disable, enable]);

  // 이전 방문에서 소리를 켜둔 상태라면, 첫 터치/클릭 때 자동으로 재생을 재개한다.
  useEffect(() => {
    if (!enabled || resumeAttemptedRef.current) return;
    const resume = () => {
      resumeAttemptedRef.current = true;
      startAmbientSound();
      window.removeEventListener('pointerdown', resume);
    };
    window.addEventListener('pointerdown', resume, { once: true });
    return () => window.removeEventListener('pointerdown', resume);
  }, [enabled]);

  useEffect(() => () => stopAmbientSound(), []);

  return { enabled, toggle, supported };
}
