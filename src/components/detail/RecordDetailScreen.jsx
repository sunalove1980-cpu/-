import { useEffect, useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { formatDateKo } from '../../utils/date.js';
import { getTypeMeta } from '../../utils/recordTypes.js';
import './RecordDetailScreen.css';

function ImageGallery({ images }) {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const created = images.map((img) => ({ id: img.id, url: URL.createObjectURL(img.blob), caption: img.caption }));
    setUrls(created);
    return () => created.forEach((item) => URL.revokeObjectURL(item.url));
  }, [images]);

  if (!urls.length) return null;

  return (
    <div className="record-detail__gallery">
      {urls.map((item) => (
        <figure key={item.id}>
          <img src={item.url} alt={item.caption || '첨부 이미지'} />
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

export default function RecordDetailScreen({ record, onEdit, onBack }) {
  const { removeRecord } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('이 기록을 삭제할까요? 되돌릴 수 없어요.')) return;
    setIsDeleting(true);
    try {
      await removeRecord(record.id);
      onBack();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="record-detail">
      <div className="record-detail__top">
        <button type="button" className="record-detail__back" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="record-detail__actions">
          <button type="button" onClick={onEdit}>
            수정
          </button>
          <button type="button" className="record-detail__delete" onClick={handleDelete} disabled={isDeleting}>
            삭제
          </button>
        </div>
      </div>

      <div className="record-detail__header">
        <span className="record-detail__type">
          {getTypeMeta(record.type).emoji} {getTypeMeta(record.type).label}
        </span>
        <h1>{record.title}</h1>
        <p className="record-detail__meta">
          {record.creator && <span>{record.creator}</span>}
          {record.watchedOn && <span>{formatDateKo(record.watchedOn)}</span>}
          {record.genre && <span>{record.genre}</span>}
        </p>
        <p className="record-detail__rating">
          {'★'.repeat(Math.round(record.rating))}
          {'☆'.repeat(5 - Math.round(record.rating))}
          <strong>{Number(record.rating).toFixed(1)} / 5.0</strong>
        </p>
      </div>

      {record.synopsis && (
        <section>
          <h2>줄거리</h2>
          <p>{record.synopsis}</p>
        </section>
      )}

      {(record.memorableScene || record.images?.length > 0) && (
        <section>
          <h2>인상 깊었던 장면</h2>
          {record.memorableScene && <p>{record.memorableScene}</p>}
          <ImageGallery images={record.images || []} />
        </section>
      )}

      {record.review && (
        <section>
          <h2>나의 총평</h2>
          <p>{record.review}</p>
        </section>
      )}
    </div>
  );
}
