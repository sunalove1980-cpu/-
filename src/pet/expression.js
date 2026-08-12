// 현재 활동(activity) + 눈 깜빡임 상태를 화면에 그릴 "표정/포즈" 정보로 변환한다.
// Pet 컴포넌트는 이 값만 보고 그리면 되므로, 시뮬레이션 로직과 렌더링을 분리한다.

export function getExpression(activity, isBlinking) {
  const type = activity.type;

  const base = {
    eyes: 'open', // open | closed | happy | sleepy | squint | wide
    pupilShift: 0, // -1(왼쪽) ~ 1(오른쪽)
    mouth: 'smile', // smile | small | open | yawn | grin | flat
    earDroop: false,
    tailWag: false,
    showZzz: false,
    showHearts: false,
    headTilt: 0, // deg
    pose: 'stand', // stand | walk | sleep | drink | stretch | bounce
  };

  switch (type) {
    case 'lookAround':
      base.pupilShift = activity.glanceDir || 0;
      base.headTilt = (activity.glanceDir || 0) * 6;
      base.mouth = 'small';
      break;
    case 'walk':
      base.pose = 'walk';
      base.mouth = 'small';
      break;
    case 'yawn':
      base.eyes = 'squint';
      base.mouth = 'yawn';
      base.headTilt = -4;
      break;
    case 'stretch':
      base.pose = 'stretch';
      base.mouth = 'smile';
      break;
    case 'sad':
      base.eyes = 'sleepy';
      base.earDroop = true;
      base.mouth = 'flat';
      base.headTilt = 3;
      break;
    case 'sleep':
      base.eyes = 'closed';
      base.mouth = 'flat';
      base.showZzz = true;
      base.pose = 'sleep';
      base.headTilt = 6;
      break;
    case 'drink':
      base.eyes = 'squint';
      base.mouth = 'small';
      base.pose = 'drink';
      base.headTilt = -8;
      break;
    case 'tapLook':
      base.eyes = 'wide';
      base.mouth = 'small';
      base.headTilt = 0;
      break;
    case 'tapHappy':
      base.eyes = 'happy';
      base.mouth = 'grin';
      base.showHearts = true;
      base.tailWag = true;
      base.pose = 'bounce';
      break;
    case 'idle':
    default:
      base.mouth = 'small';
      break;
  }

  // 자거나 하품할 땐 이미 눈이 감겨/찡그려 있으므로 깜빡임을 덧씌우지 않는다.
  if (isBlinking && type !== 'sleep' && type !== 'yawn' && type !== 'tapHappy') {
    base.eyes = 'closed';
  }

  return base;
}
