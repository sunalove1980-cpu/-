import './BarChart.css';

// 최근 N일 점수처럼 간단한 값을 세로 막대로 보여주는 경량 차트 (외부 라이브러리 없이 CSS로 구현)
export default function BarChart({ data, ariaLabel, valueSuffix = '' }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="bar-chart" role="img" aria-label={ariaLabel}>
      {data.map((d) => (
        <div className="bar-chart__col" key={d.label}>
          <span className="bar-chart__value">{d.value}</span>
          <div className="bar-chart__track">
            <div
              className="bar-chart__fill"
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
          </div>
          <span className="bar-chart__label">{d.label}</span>
        </div>
      ))}
      <span className="visually-hidden">{valueSuffix}</span>
    </div>
  );
}
