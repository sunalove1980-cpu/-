import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { todayString } from '../../utils/date.js';
import StarRatingInput from './StarRatingInput.jsx';
import VoiceTextarea from './VoiceTextarea.jsx';
import ImageAttachments from './ImageAttachments.jsx';
import './RecordFormScreen.css';

const EMPTY_FORM = {
  type: 'movie',
  title: '',
  creator: '',
  genre: '',
  watchedOn: todayString(),
  rating: 0,
  synopsis: '',
  review: '',
  memorableScene: '',
  images: [],
};

export default function RecordFormScreen({ record, onDone, onCancel }) {
  const { addRecord, editRecord } = useApp();
  const isEdit = Boolean(record);
  const [form, setForm] = useState(() => (record ? { ...EMPTY_FORM, ...record } : EMPTY_FORM));
  const [isSaving, setIsSaving] = useState(false);
  const [titleError, setTitleError] = useState('');

  const update = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setTitleError('제목을 입력해 주세요.');
      return;
    }
    setTitleError('');
    setIsSaving(true);
    try {
      if (isEdit) {
        await editRecord(record.id, form);
      } else {
        await addRecord(form);
      }
      onDone();
    } catch (err) {
      window.alert(err.message || '저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      <div className="record-form__type-toggle" role="radiogroup" aria-label="종류 선택">
        <button
          type="button"
          className={form.type === 'movie' ? 'is-active' : ''}
          onClick={() => update('type')('movie')}
        >
          🎬 영화
        </button>
        <button
          type="button"
          className={form.type === 'book' ? 'is-active' : ''}
          onClick={() => update('type')('book')}
        >
          📖 책
        </button>
      </div>

      <label className="record-form__field">
        <span>제목 *</span>
        <input
          type="text"
          value={form.title}
          onChange={(event) => update('title')(event.target.value)}
          placeholder={form.type === 'movie' ? '영화 제목' : '책 제목'}
        />
        {titleError && <em className="record-form__error">{titleError}</em>}
      </label>

      <div className="record-form__row">
        <label className="record-form__field">
          <span>{form.type === 'movie' ? '감독' : '작가'}</span>
          <input type="text" value={form.creator} onChange={(event) => update('creator')(event.target.value)} />
        </label>
        <label className="record-form__field">
          <span>{form.type === 'movie' ? '관람일' : '완독일'}</span>
          <input type="date" value={form.watchedOn} onChange={(event) => update('watchedOn')(event.target.value)} />
        </label>
      </div>

      <label className="record-form__field">
        <span>장르 / 태그</span>
        <input
          type="text"
          value={form.genre}
          onChange={(event) => update('genre')(event.target.value)}
          placeholder="예: 드라마, 성장, SF"
        />
      </label>

      <StarRatingInput value={form.rating} onChange={update('rating')} />

      <VoiceTextarea
        id="synopsis"
        label="줄거리"
        value={form.synopsis}
        onChange={update('synopsis')}
        placeholder="어떤 이야기였나요?"
      />

      <VoiceTextarea
        id="memorableScene"
        label="인상 깊었던 장면"
        value={form.memorableScene}
        onChange={update('memorableScene')}
        placeholder="가장 기억에 남는 장면이나 대사를 적어 보세요."
        hint="말로 설명하고 싶다면 마이크 버튼을 눌러보세요."
      />

      <ImageAttachments images={form.images} onChange={update('images')} />

      <VoiceTextarea
        id="review"
        label="나의 총평"
        value={form.review}
        onChange={update('review')}
        placeholder="느낀 점, 추천 여부 등을 자유롭게 남겨보세요."
        rows={5}
      />

      <div className="record-form__actions">
        <button type="button" className="record-form__cancel" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="record-form__submit" disabled={isSaving}>
          {isSaving ? '저장 중…' : isEdit ? '수정 완료' : '기록 저장'}
        </button>
      </div>
    </form>
  );
}
