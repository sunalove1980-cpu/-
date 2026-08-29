// F 모드 / T 모드 캐릭터 성격 정의.
// - reactions: 캐릭터를 톡톡 건드렸을 때 보여줄 짧은 반응 대사
// AI 호출 없이, 모드에 따라 미리 써둔 대사 중 하나를 골라 보여주는 방식이라 비용이 들지 않는다.

export const MODES = {
  F: 'F',
  T: 'T',
};

export const MODE_META = {
  F: {
    label: 'F 모드',
    subLabel: '다정형',
    description: '적당히 다정하게 챙겨줘요',
    accent: '#e98a9c',
  },
  T: {
    label: 'T 모드',
    subLabel: '팩폭형',
    description: '군더더기 없이 팩트로 던져요',
    accent: '#5b8bd8',
  },
};

export const REACTIONS = {
  F: [
    '앗, 간지러워! 왜 불렀어~',
    '헤헷, 반가워! 오늘 점심 뭐 먹을지 골라줄까?',
    '오구, 나 쓰다듬는 거야? 좋아!',
    '오늘도 하루 잘 버티고 있네, 대단해!',
  ],
  T: [
    '왜 찔러. 볼일 있으면 버튼 눌러.',
    '장난칠 시간에 점심이나 정해.',
    '터치할 시간에 결정이나 해.',
    '귀찮게 하지 말고 용건만 눌러.',
  ],
};

export function pickReaction(mode) {
  const list = REACTIONS[mode] ?? REACTIONS.F;
  return list[Math.floor(Math.random() * list.length)];
}

// 여러 대사 뱅크(점심 룰렛, 아이스브레이커 등)에서 공통으로 쓰는 랜덤 선택 유틸.
// 직전과 같은 항목이 다시 뽑히는 걸 최대한 피해서 "또 이거야?" 하는 느낌을 줄인다.
export function pickRandom(list, exclude) {
  if (list.length <= 1) return list[0];
  let pick = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (pick === exclude && guard < 10) {
    pick = list[Math.floor(Math.random() * list.length)];
    guard++;
  }
  return pick;
}

export function pickLine(bank, mode) {
  const list = bank[mode] ?? bank.F;
  return list[Math.floor(Math.random() * list.length)];
}
