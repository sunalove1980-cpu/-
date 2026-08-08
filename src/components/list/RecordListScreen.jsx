import { useMemo, useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { RECORD_TYPES } from '../../utils/recordTypes.js';
import RecordCard from './RecordCard.jsx';
import './RecordListScreen.css';

const FILTERS = [
  { key: 'all', label: '전체' },
  ...RECORD_TYPES.map((type) => ({ key: type.key, label: `${type.emoji} ${type.label}` })),
];

export default function RecordListScreen({ onSelect, onAdd }) {
  const { records } = useApp();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return records.filter((record) => {
      if (filter !== 'all' && record.type !== filter) return false;
      if (!query.trim()) return true;
      const haystack = `${record.title} ${record.creator} ${record.genre}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [records, filter, query]);

  return (
    <div className="record-list">
      <div className="record-list__search">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="제목, 감독/작가/연출로 검색"
          aria-label="기록 검색"
        />
      </div>

      <div className="record-list__filters" role="tablist" aria-label="종류 필터">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={filter === item.key}
            className={filter === item.key ? 'is-active' : ''}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="record-list__empty">
          <span aria-hidden="true">🎞️📺📚</span>
          <p>{records.length === 0 ? '아직 기록이 없어요.\n첫 감상을 남겨보세요!' : '검색 결과가 없어요.'}</p>
        </div>
      ) : (
        <ul className="record-list__items">
          {filtered.map((record) => (
            <li key={record.id}>
              <RecordCard record={record} onClick={() => onSelect(record.id)} />
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="record-list__fab" onClick={onAdd} aria-label="새 기록 추가">
        +
      </button>
    </div>
  );
}
