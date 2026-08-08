// crypto.randomUUID가 없는 구형 브라우저(WebView 등)를 위한 안전한 대체 구현 포함
export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
