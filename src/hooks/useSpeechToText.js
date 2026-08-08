import { useCallback, useEffect, useRef, useState } from 'react';

// 브라우저 내장 음성 인식(Web Speech API)을 감싼 훅.
// - 크롬(안드로이드 포함) / 삼성 인터넷 / 데스크톱 사파리 최신 버전에서 동작한다.
// - 지원하지 않는 브라우저(구형 iOS Safari, Firefox 등)에서는 isSupported가 false가 되고,
//   호출하는 쪽에서 마이크 버튼을 숨기거나 안내 문구를 보여주면 된다.
const SpeechRecognitionCtor =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export function useSpeechToText({ lang = 'ko-KR', onFinalResult } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionCtor) {
      setError('이 브라우저는 음성 인식을 지원하지 않아요. 직접 입력해 주세요.');
      return;
    }
    setError('');

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          onFinalResultRef.current?.(transcript);
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return;
      setError('음성 인식 중 문제가 발생했어요. 다시 시도해 주세요.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  return {
    isSupported: Boolean(SpeechRecognitionCtor),
    isListening,
    interimText,
    error,
    start,
    stop,
    toggle,
  };
}
