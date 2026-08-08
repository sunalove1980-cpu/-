import './StarRatingInput.css';

const STAR_COUNT = 5;

function starFillFor(index, rating) {
  const diff = rating - index;
  if (diff >= 1) return 'full';
  if (diff >= 0.5) return 'half';
  return 'empty';
}

// 별 왼쪽 절반을 누르면 0.5점, 오른쪽 절반을 누르면 1점 단위로 매겨진다.
export default function StarRatingInput({ value, onChange, label = '내 별점' }) {
  const handlePick = (index, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const isHalf = clickX < rect.width / 2;
    const next = index + (isHalf ? 0.5 : 1);
    onChange(next === value ? 0 : next);
  };

  return (
    <div className="star-rating">
      <span className="star-rating__label">{label}</span>
      <div className="star-rating__stars" role="radiogroup" aria-label={label}>
        {Array.from({ length: STAR_COUNT }, (_, index) => {
          const fill = starFillFor(index, value);
          return (
            <button
              key={index}
              type="button"
              className={`star-rating__star star-rating__star--${fill}`}
              onClick={(event) => handlePick(index, event)}
              aria-label={`${index + 1}점`}
            >
              ★
            </button>
          );
        })}
      </div>
      <span className="star-rating__value">{value.toFixed(1)} / 5.0</span>
    </div>
  );
}
