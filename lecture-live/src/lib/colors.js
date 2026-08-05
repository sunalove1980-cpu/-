// 이름 문자열을 고정된 색으로 매핑한다. 같은 이름은 항상 같은 색 카드가 된다.
export function colorForName(name) {
  let hash = 0;
  for (const ch of String(name)) {
    hash = (hash * 31 + ch.codePointAt(0)) % 360;
  }
  return `hsl(${hash} 70% 55%)`;
}
