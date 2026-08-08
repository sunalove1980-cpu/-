// 기록 종류(영화/드라마/책)별 표시 정보를 한 곳에서 관리한다.
// 새 종류를 추가하고 싶으면 이 배열에 한 줄만 추가하면 폼/목록/상세 화면에 모두 반영된다.
export const RECORD_TYPES = [
  { key: 'movie', emoji: '🎬', label: '영화', creatorLabel: '감독', dateLabel: '관람일', titlePlaceholder: '영화 제목' },
  { key: 'drama', emoji: '📺', label: '드라마', creatorLabel: '연출', dateLabel: '시청일', titlePlaceholder: '드라마 제목' },
  { key: 'book', emoji: '📖', label: '책', creatorLabel: '작가', dateLabel: '완독일', titlePlaceholder: '책 제목' },
];

export function getTypeMeta(key) {
  return RECORD_TYPES.find((type) => type.key === key) || RECORD_TYPES[0];
}
