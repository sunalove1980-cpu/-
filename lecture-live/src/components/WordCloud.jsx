import { tally } from '../lib/wordcloud';

const MIN_SIZE = 1;
const MAX_SIZE = 3.4;

// 답변을 빈도순으로 묶어, 많이 나온 단어일수록 크고 진하게 보여준다.
export default function WordCloud({ messages }) {
  const words = tally(messages);
  if (words.length === 0) return null;

  const maxCount = words[0].count;

  return (
    <ul className="wordcloud">
      {words.map((w) => {
        const scale = maxCount > 1 ? Math.sqrt(w.count / maxCount) : 1;
        const size = MIN_SIZE + (MAX_SIZE - MIN_SIZE) * scale;
        const weight = 500 + Math.round(300 * scale);
        const opacity = 0.55 + 0.45 * scale;
        return (
          <li
            key={w.text}
            className="wordcloud-item"
            style={{ fontSize: `${size}rem`, fontWeight: weight, opacity }}
            title={`${w.count}번`}
          >
            {w.text}
          </li>
        );
      })}
    </ul>
  );
}
