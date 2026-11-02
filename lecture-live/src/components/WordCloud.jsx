import { tally } from '../lib/wordcloud';

// 빈도수에 '비례'가 아니라 '1회 더 나올 때마다 고정폭만큼 커지는' 방식을 쓴다.
// 상대 비율로 계산하면 응답이 적을 때 차이가 흐릿해지는데, 이렇게 하면 2번째 등장부터
// 바로 눈에 띄게 커진다.
const MIN_SIZE = 1.15; // rem, 1회 등장
const STEP = 0.85; // rem, 등장할 때마다 추가
const MAX_SIZE = 4.6; // rem, 상한선

function sizeFor(count) {
  return Math.min(MIN_SIZE + (count - 1) * STEP, MAX_SIZE);
}

function colorFor(count) {
  if (count <= 1) return 'var(--ink-faint)';
  if (count === 2) return 'var(--ink)';
  return 'var(--accent)';
}

// 답변을 빈도순으로 묶어, 많이 나온 단어일수록 크고 진하게 보여준다.
export default function WordCloud({ messages }) {
  const words = tally(messages);
  if (words.length === 0) return null;

  return (
    <ul className="wordcloud">
      {words.map((w) => {
        const size = sizeFor(w.count);
        const t = (size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE);
        const weight = 600 + Math.round(200 * t);
        return (
          <li
            key={w.text}
            className="wordcloud-item"
            style={{ fontSize: `${size}rem`, fontWeight: weight, color: colorFor(w.count) }}
            title={`${w.count}번`}
          >
            {w.text}
          </li>
        );
      })}
    </ul>
  );
}
