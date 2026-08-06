// 이름 문자열을 차분한 톤의 고정된 색으로 매핑한다. 같은 이름은 항상 같은 색이 된다.
// 채도·명도를 낮게 잡아 화려한 원색 대신 절제된 팔레트를 쓴다.
export function colorForName(name) {
  let hash = 0;
  for (const ch of String(name)) {
    hash = (hash * 31 + ch.codePointAt(0)) % 360;
  }
  return `hsl(${hash} 45% 42%)`;
}
