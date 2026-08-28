// Gemini API 연동 모듈.
//
// - VITE_GEMINI_API_KEY 가 .env.local 에 설정되어 있으면 실제 Gemini API를 호출한다.
// - 키가 없거나(개발 중, 또는 배포 전) 호출이 실패하면 data/persona.js 의 대사 뱅크로
//   자연스럽게 대체 응답한다 — 그래서 API 키 없이도 앱이 항상 정상 동작한다.
//
// ⚠️ 주의: import.meta.env.VITE_* 값은 빌드 결과물에 그대로 포함되어 브라우저에 노출된다.
// 개인용/데모용으로는 괜찮지만, 불특정 다수에게 공개 배포할 거라면 이 파일의 호출부를
// 서버(예: Vercel/Netlify Function)로 옮기고 프런트에서는 그 서버만 호출하도록 바꾸는 걸 권장한다.

import { SYSTEM_PROMPTS, pickFallbackReply } from '../data/persona.js';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// 가짜 "생각 중" 지연 시간 (fallback 모드일 때 너무 즉답하면 어색해서 살짝 텀을 준다)
const FAKE_THINK_MS = 500;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {{ role: 'user' | 'assistant', text: string }[]} history 최근 대화 기록 (최신이 마지막)
 * @param {string} userText 이번에 사용자가 입력한 고민
 * @param {'F' | 'T'} mode 현재 선택된 상담 모드
 * @returns {Promise<{ text: string, source: 'gemini' | 'fallback' }>}
 */
export async function askForest({ history, userText, mode }) {
  if (!API_KEY) {
    await wait(FAKE_THINK_MS);
    return { text: pickFallbackReply(mode, userText), source: 'fallback' };
  }

  try {
    const contents = [
      ...history.slice(-8).map((turn) => ({
        role: turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: turn.text }],
      })),
      { role: 'user', parts: [{ text: userText }] },
    ];

    const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPTS[mode] }] },
        contents,
        generationConfig: {
          temperature: mode === 'T' ? 0.6 : 0.8,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API 오류: ${res.status}`);

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
    if (!text.trim()) throw new Error('Gemini 응답이 비어있음');

    return { text: text.trim(), source: 'gemini' };
  } catch (err) {
    console.warn('[geminiService] API 호출 실패, 내장 대사로 대체:', err);
    return { text: pickFallbackReply(mode, userText), source: 'fallback' };
  }
}

export const isGeminiConfigured = Boolean(API_KEY);
