// 현재 활동(activity) + 눈 깜빡임 상태를 화면에 그릴 "표정/포즈" 정보로 변환한다.
// Pet 컴포넌트는 이 값만 보고 그리면 되므로, 시뮬레이션 로직과 렌더링을 분리한다.
import { ACTION_XP } from './storage.js';

const EYES_ALREADY_SET = new Set(['sleep', 'yawn', 'actionYawn', 'lonely', 'daydream']);

export function getExpression(activity, isBlinking) {
  const type = activity.type;

  const base = {
    eyes: 'open', // open | closed | happy | sleepy | squint | wide | teary | dreamy
    pupilShift: 0, // -1(왼쪽) ~ 1(오른쪽)
    mouth: 'smile', // smile | small | yawn | grin | flat
    earDroop: false,
    tailWag: false,
    showZzz: false,
    celebration: null, // { shape, color } — 축하 파티클
    reward: null, // { icon, xp } — 건강기록 보상(먹이) 연출
    wearingPajama: false,
    gloom: false, // 많이 외로울 때 머리 위 먹구름 + 눈물
    headTilt: 0, // deg
    pose: 'stand', // stand | walk | sleep | drink | stretch | bounce | spin | sniff | lonely | follow
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
    case 'follow':
      base.pose = 'walk';
      base.eyes = 'wide';
      base.mouth = 'grin';
      break;
    case 'yawn':
    case 'actionYawn':
      base.eyes = 'squint';
      base.mouth = 'yawn';
      base.headTilt = -4;
      break;
    case 'stretch':
      base.pose = 'stretch';
      base.mouth = 'smile';
      break;
    case 'sniff':
      base.pose = 'sniff';
      base.eyes = 'squint';
      base.mouth = 'small';
      base.headTilt = -10;
      break;
    case 'daydream':
      base.eyes = 'dreamy';
      base.mouth = 'small';
      base.headTilt = -8;
      break;
    case 'playHop':
      base.pose = 'bounce';
      base.eyes = 'happy';
      base.mouth = 'grin';
      base.tailWag = true;
      break;
    case 'sad':
      base.eyes = 'sleepy';
      base.earDroop = true;
      base.mouth = 'flat';
      base.headTilt = 3;
      break;
    case 'lonely':
      base.eyes = 'teary';
      base.earDroop = true;
      base.mouth = 'flat';
      base.headTilt = 6;
      base.pose = 'lonely';
      base.gloom = true;
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
    case 'tapReact':
      applyReactionKind(base, activity.kind);
      break;
    case 'actionReceive':
      base.eyes = 'wide';
      base.mouth = 'small';
      base.reward = { icon: activity.icon, xp: ACTION_XP };
      break;
    case 'actionCelebrate':
      base.eyes = 'happy';
      base.mouth = 'grin';
      base.celebration = activity.particle ?? null;
      base.tailWag = true;
      base.pose = 'bounce';
      base.wearingPajama = Boolean(activity.pajama);
      break;
    case 'idle':
    default:
      base.mouth = 'small';
      break;
  }

  // 자거나 하품하거나 시무룩할 땐 이미 눈이 감겨/찡그려 있으므로 깜빡임을 덧씌우지 않는다.
  if (isBlinking && !EYES_ALREADY_SET.has(type) && type !== 'tapReact') {
    base.eyes = 'closed';
  }

  return base;
}

function applyReactionKind(base, kind) {
  switch (kind) {
    case 'spin':
      base.eyes = 'happy';
      base.mouth = 'grin';
      base.celebration = { shape: 'star', color: '#ffb648' };
      base.tailWag = true;
      base.pose = 'spin';
      break;
    case 'nuzzle':
      base.eyes = 'happy';
      base.mouth = 'smile';
      base.celebration = { shape: 'heart', color: '#ff9db3' };
      base.headTilt = -10;
      break;
    case 'wiggle':
      base.eyes = 'happy';
      base.mouth = 'grin';
      base.celebration = { shape: 'sparkle', color: '#ffd166' };
      base.tailWag = true;
      base.pose = 'wiggle';
      break;
    case 'happy':
    default:
      base.eyes = 'happy';
      base.mouth = 'grin';
      base.celebration = { shape: 'heart', color: '#ff6f91' };
      base.tailWag = true;
      base.pose = 'bounce';
      break;
  }
}

export const TAP_REACTION_KINDS = ['happy', 'spin', 'nuzzle', 'wiggle'];
