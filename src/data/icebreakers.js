// 아이스브레이커 질문 카드 목록과, 카드 뽑기에 대한 캐릭터의 F/T 모드별 코멘트.

export const ICEBREAKER_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'light', label: '가벼운 잡담' },
  { key: 'balance', label: '밸런스 게임' },
  { key: 'work', label: '업무/팀' },
  { key: 'taste', label: '취향' },
];

export const ICEBREAKERS = [
  { text: '주말에 뭐 하셨어요?', category: 'light' },
  { text: '요즘 제일 재밌게 보는 거 있어요?', category: 'light' },
  { text: '점심 메뉴 중에 절대 안 먹는 거 있어요?', category: 'light' },
  { text: '최근에 새로 산 물건 중에 제일 만족스러운 거는요?', category: 'light' },
  { text: '오늘 아침에 뭐 드셨어요?', category: 'light' },
  { text: '커피 vs 차, 뭐 드세요?', category: 'balance' },
  { text: '아침형 인간 vs 저녁형 인간, 어느 쪽이세요?', category: 'balance' },
  { text: '재택근무 vs 출근, 뭐가 더 좋으세요?', category: 'balance' },
  { text: '여름 vs 겨울, 더 좋아하는 계절은요?', category: 'balance' },
  { text: '평생 한 가지 음식만 먹어야 한다면 뭘 고르시겠어요?', category: 'balance' },
  { text: '복권 10억 당첨되면 회사는 계속 다니실 건가요?', category: 'balance' },
  { text: '이번 주 업무 중에 제일 뿌듯했던 거 있어요?', category: 'work' },
  { text: '요즘 제일 손이 안 가는 업무는 뭐예요?', category: 'work' },
  { text: '같이 일하면서 제일 편한 동료 유형은요?', category: 'work' },
  { text: '입사하고 나서 가장 놀랐던 회사 문화가 있다면?', category: 'work' },
  { text: '이번 프로젝트 끝나면 제일 먼저 하고 싶은 거는요?', category: 'work' },
  { text: '요즘 꽂혀있는 취미가 있어요?', category: 'taste' },
  { text: '최애 여행지 한 곳만 꼽으면요?', category: 'taste' },
  { text: '요즘 즐겨 듣는 노래나 플레이리스트 있어요?', category: 'taste' },
  { text: '넷플릭스/유튜브 최근 정주행한 거 있어요?', category: 'taste' },
  { text: 'MBTI 믿으시는 편이에요, 안 믿으시는 편이에요?', category: 'taste' },
  { text: '스트레스 풀 때 뭐 하세요?', category: 'light' },
  { text: '이번 달에 제일 기대되는 일정 있어요?', category: 'light' },
  { text: '만약 오늘 하루 휴가라면 뭐 하고 싶으세요?', category: 'balance' },
  { text: '같이 점심 먹을 때 대화 vs 조용히 먹기, 뭐가 더 편하세요?', category: 'balance' },
  { text: '최근에 웃겼던 에피소드 하나만 풀어주세요.', category: 'light' },
  { text: '팀에서 자기만 알고 있는 꿀팁 있어요?', category: 'work' },
  { text: '재택근무할 때 자리 세팅 어떻게 하세요?', category: 'work' },
  { text: '최근에 산 것 중에 돈 값 못한 거 있어요?', category: 'light' },
  { text: '주말과 평일 중 시간이 더 빨리 가는 건 언제예요?', category: 'balance' },
];

export const ICEBREAKER_LINES = {
  intro: {
    F: [
      '가볍게 물어볼 질문 하나 뽑아줄게~',
      '다 같이 편하게 얘기할 수 있는 걸로 골라볼게.',
      '분위기 풀리는 질문, 하나 뽑아줄까?',
    ],
    T: [
      '어색한 거 못 참지. 질문 하나 던진다.',
      '침묵 깨는 건 내 전문이야. 뽑는다.',
      '잡담 못 하는 티 나. 이거라도 물어봐.',
    ],
  },
  result: {
    F: [
      '이 질문 어때? 편하게 답해도 되고, 안 해도 괜찮아!',
      '다들 재밌어할 것 같아. 한번 던져봐!',
      '이 정도면 분위기 풀리기 딱 좋을 거야.',
    ],
    T: [
      '이거 던지고 반응 봐. 어색하면 니 탓 아니야.',
      '질문은 줬다. 활용은 니 몫.',
      '이걸로 안 풀리면 그냥 포기해.',
    ],
  },
};

export function pickIcebreaker(items) {
  return items[Math.floor(Math.random() * items.length)];
}
