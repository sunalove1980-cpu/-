// 건강기록 버튼이 어느 날짜를 향할지 고르는 작은 드롭다운.
// 자정을 넘겨서야 전날 목표를 채우는 경우가 많아, 최근 며칠 중 원하는 날짜를 골라
// 그 날짜의 기록에 더하거나 취소할 수 있게 해준다.
import { useState } from 'react';
import { PAST_DAYS_SELECTABLE, recentDateKeys, todayKey, yesterdayKeyOf } from './storage.js';
import './DateSwitcher.css';

function labelFor(dateKey, today) {
  if (dateKey === today) return '오늘';
  if (dateKey === yesterdayKeyOf(today)) return '어제';
  const [, m, d] = dateKey.split('-');
  return `${Number(m)}/${Number(d)}`;
}

export default function DateSwitcher({ selectedDate, onSelect, recordsByDate }) {
  const [open, setOpen] = useState(false);
  const today = todayKey();
  const isToday = selectedDate === today;
  const days = recentDateKeys(PAST_DAYS_SELECTABLE);

  return (
    <div className="date-switcher">
      <button
        type="button"
        className={`date-switcher__trigger${isToday ? '' : ' date-switcher__trigger--past'}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        📅 {labelFor(selectedDate, today)} 기록
        <span className="date-switcher__chevron">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <>
          <div className="date-switcher__backdrop" onClick={() => setOpen(false)} />
          <div className="date-switcher__menu">
            {days.map((key) => {
              const hasRecord = Object.values(recordsByDate[key] || {}).some((count) => count > 0);
              return (
                <button
                  key={key}
                  type="button"
                  className={`date-switcher__option${key === selectedDate ? ' date-switcher__option--selected' : ''}`}
                  onClick={() => {
                    onSelect(key);
                    setOpen(false);
                  }}
                >
                  <span>{labelFor(key, today)}</span>
                  {hasRecord && <span className="date-switcher__dot" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
