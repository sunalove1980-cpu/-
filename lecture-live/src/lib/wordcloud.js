// 같은 내용의 답변을 하나로 묶어 빈도순 단어구름 데이터로 바꾼다.
// 대소문자/앞뒤 공백 차이는 같은 단어로 취급하되, 화면엔 처음 입력된 그대로 보여준다.
export function tally(messages) {
  const counts = new Map(); // normalized key -> { text, count }
  for (const m of messages) {
    const trimmed = m.text.trim().replace(/\s+/g, ' ');
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { text: trimmed, count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}
