// 점심 룰렛에 쓰는 메뉴 목록과, 결과에 대한 캐릭터의 F/T 모드별 코멘트.
// 전부 로컬 데이터 + 랜덤 선택이라 API 호출이 전혀 없다.

export const LUNCH_CATEGORIES = [
  { key: 'all', label: '전체', emoji: '🍽️' },
  { key: 'korean', label: '한식', emoji: '🍚' },
  { key: 'chinese', label: '중식', emoji: '🥡' },
  { key: 'japanese', label: '일식', emoji: '🍣' },
  { key: 'western', label: '양식', emoji: '🍝' },
  { key: 'snack', label: '분식', emoji: '🍢' },
  { key: 'healthy', label: '샐러드/헬시', emoji: '🥗' },
  { key: 'meat', label: '든든하게', emoji: '🥩' },
];

export const LUNCH_ITEMS = [
  { name: '김치찌개', category: 'korean', emoji: '🍲' },
  { name: '된장찌개', category: 'korean', emoji: '🍲' },
  { name: '순두부찌개', category: 'korean', emoji: '🍲' },
  { name: '제육볶음', category: 'korean', emoji: '🍖' },
  { name: '비빔밥', category: 'korean', emoji: '🍚' },
  { name: '갈비탕', category: 'korean', emoji: '🍖' },
  { name: '삼계탕', category: 'korean', emoji: '🍗' },
  { name: '냉면', category: 'korean', emoji: '🍜' },
  { name: '칼국수', category: 'korean', emoji: '🍜' },
  { name: '백반정식', category: 'korean', emoji: '🍱' },
  { name: '짜장면', category: 'chinese', emoji: '🍜' },
  { name: '짬뽕', category: 'chinese', emoji: '🍜' },
  { name: '탕수육', category: 'chinese', emoji: '🍖' },
  { name: '마라탕', category: 'chinese', emoji: '🌶️' },
  { name: '마라샹궈', category: 'chinese', emoji: '🌶️' },
  { name: '중국식 볶음밥', category: 'chinese', emoji: '🍚' },
  { name: '초밥', category: 'japanese', emoji: '🍣' },
  { name: '규동', category: 'japanese', emoji: '🍚' },
  { name: '라멘', category: 'japanese', emoji: '🍜' },
  { name: '우동', category: 'japanese', emoji: '🍜' },
  { name: '돈카츠', category: 'japanese', emoji: '🍖' },
  { name: '가라아게 덮밥', category: 'japanese', emoji: '🍗' },
  { name: '파스타', category: 'western', emoji: '🍝' },
  { name: '스테이크', category: 'western', emoji: '🥩' },
  { name: '리조또', category: 'western', emoji: '🍚' },
  { name: '피자', category: 'western', emoji: '🍕' },
  { name: '샌드위치', category: 'western', emoji: '🥪' },
  { name: '브런치 세트', category: 'western', emoji: '🍳' },
  { name: '떡볶이', category: 'snack', emoji: '🍢' },
  { name: '김밥', category: 'snack', emoji: '🍙' },
  { name: '라면', category: 'snack', emoji: '🍜' },
  { name: '순대', category: 'snack', emoji: '🍢' },
  { name: '튀김 모둠', category: 'snack', emoji: '🍤' },
  { name: '샐러드', category: 'healthy', emoji: '🥗' },
  { name: '포케', category: 'healthy', emoji: '🥗' },
  { name: '닭가슴살 도시락', category: 'healthy', emoji: '🍗' },
  { name: '두부 정식', category: 'healthy', emoji: '🍲' },
  { name: '삼겹살', category: 'meat', emoji: '🥓' },
  { name: '곱창', category: 'meat', emoji: '🍖' },
  { name: '족발', category: 'meat', emoji: '🍖' },
  { name: '보쌈', category: 'meat', emoji: '🍖' },
];

export const LUNCH_LINES = {
  intro: {
    F: [
      '오늘은 뭐가 좋을까~ 같이 골라보자!',
      '배고프지? 내가 한번 골라볼게!',
      '룰렛 돌려서 정해볼까? 기대된다~',
    ],
    T: [
      '고민하지 말고 그냥 돌려. 결정장애 그만.',
      '메뉴 못 정하는 것도 시간 낭비야. 돌린다.',
      '선택은 내가 대신 해줄게. 토 달지 마.',
    ],
  },
  result: {
    F: [
      '오늘은 이거 어때? 다 같이 먹으면 더 맛있을 거야!',
      '왠지 오늘이랑 잘 어울리는 것 같아.',
      '이거 나왔다! 맛있게 먹고 오후도 힘내자.',
    ],
    T: [
      '고민 끝. 그냥 가서 먹어.',
      '이견 있어도 안 받아. 이걸로 확정이야.',
      '더 볼 것도 없어. 이거 먹고 일이나 하자.',
    ],
  },
};

export function pickLunch(items) {
  return items[Math.floor(Math.random() * items.length)];
}
