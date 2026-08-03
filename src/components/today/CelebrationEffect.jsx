import './CelebrationEffect.css';

const PARTICLES = ['⭐', '🪙', '✨', '🪙', '⭐', '✨'];

// 습관을 완료했을 때 카드 위에 잠깐 나타나는 별/코인 축하 효과
export default function CelebrationEffect({ rewardLabel }) {
  return (
    <div className="celebration" aria-hidden="true">
      {PARTICLES.map((particle, i) => (
        <span
          key={i}
          className="celebration__particle"
          style={{ '--i': i, '--angle': `${i * 60}deg` }}
        >
          {particle}
        </span>
      ))}
      <span className="celebration__reward">{rewardLabel}</span>
    </div>
  );
}
