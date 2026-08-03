import './LineChart.css';

const WIDTH = 300;
const HEIGHT = 120;
const PADDING = 12;

// 체중처럼 날짜별 숫자값 변화를 보여주는 경량 라인 차트. 값이 없는 날은 건너뛴다.
export default function LineChart({ points, unit = '', ariaLabel }) {
  const valid = points.filter((p) => p.value !== null && p.value !== undefined);

  if (valid.length < 2) {
    return (
      <p className="line-chart__empty">기록이 더 쌓이면 변화 추이를 그래프로 볼 수 있어요.</p>
    );
  }

  const values = valid.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = valid.map((p, i) => {
    const x = PADDING + (i / (valid.length - 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - ((p.value - min) / range) * (HEIGHT - PADDING * 2);
    return { x, y, value: p.value, label: p.label };
  });

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  return (
    <div className="line-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={ariaLabel}
        className="line-chart__svg"
        preserveAspectRatio="none"
      >
        <path d={path} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        {coords.map((c) => (
          <circle key={c.label} cx={c.x} cy={c.y} r={3} fill="#7c3aed" />
        ))}
      </svg>
      <div className="line-chart__meta">
        <span>최소 {min}{unit}</span>
        <span>최대 {max}{unit}</span>
        <span>최근 {values[values.length - 1]}{unit}</span>
      </div>
    </div>
  );
}
