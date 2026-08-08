import { useEffect, useState } from 'react';
import { formatDateKo } from '../../utils/date.js';
import './RecordCard.css';

export default function RecordCard({ record, onClick }) {
  const [thumbUrl, setThumbUrl] = useState(null);
  const firstImage = record.images?.[0];

  useEffect(() => {
    if (!firstImage) {
      setThumbUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(firstImage.blob);
    setThumbUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [firstImage]);

  return (
    <button type="button" className="record-card" onClick={onClick}>
      <div className="record-card__thumb">
        {thumbUrl ? (
          <img src={thumbUrl} alt="" />
        ) : (
          <span aria-hidden="true">{record.type === 'movie' ? '🎬' : '📖'}</span>
        )}
      </div>
      <div className="record-card__body">
        <p className="record-card__title">{record.title}</p>
        <p className="record-card__meta">
          {record.creator && <span>{record.creator}</span>}
          {record.watchedOn && <span>{formatDateKo(record.watchedOn)}</span>}
        </p>
        <p className="record-card__rating" aria-label={`내 별점 ${record.rating}점`}>
          {'★'.repeat(Math.round(record.rating))}
          {'☆'.repeat(5 - Math.round(record.rating))}
          <span>{Number(record.rating).toFixed(1)}</span>
        </p>
      </div>
    </button>
  );
}
