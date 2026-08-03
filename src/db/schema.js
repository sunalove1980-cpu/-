/**
 * IndexedDB 데이터 스키마 정의
 * ------------------------------------------------------------
 * DB 이름: health-quest-db (버전: DB_VERSION)
 *
 * [스토어 1] habits  (keyPath: 'id')
 *   습관(퀘스트) "정의" 목록. 실제 완료 여부는 여기 저장하지 않는다.
 *   - id          : string, 습관 고유 ID (생성 시 crypto.randomUUID())
 *   - name        : string, 습관 이름 (예: "물 1L 이상 마시기")
 *   - icon        : string, 이모지 아이콘
 *   - type        : 'check' | 'number' | 'note'
 *                   'check'  = 체크박스형 (완료/미완료)
 *                   'number' = 숫자 입력형 (예: 체중 kg)
 *                   'note'   = 메모 입력형 (텍스트)
 *   - unit        : string, number 타입일 때 단위 (예: 'kg'). 그 외 빈 문자열
 *   - order       : number, 오늘의 퀘스트 화면에서의 정렬 순서
 *   - active      : boolean, 현재 사용 중인 습관인지 여부
 *   - createdAt   : number, 생성 시각(epoch ms)
 *   - archivedAt  : number | null, 삭제(보관) 시각. 삭제해도 과거 기록 보존을
 *                   위해 실제로 행을 지우지 않고 active=false, archivedAt만 채운다.
 *
 * [스토어 2] dailyRecords  (keyPath: 'date', 형식 'YYYY-MM-DD', 로컬 타임존 기준)
 *   날짜별 습관 실천 기록. 같은 날짜 키에 항상 put(덮어쓰기)하므로
 *   동일 날짜 레코드가 중복 생성되지 않는다.
 *   - date         : string, 'YYYY-MM-DD'
 *   - habitEntries : { [habitId]: HabitEntry }
 *       HabitEntry = {
 *         completed : boolean        // check 타입 완료 여부
 *         value     : number | null  // number 타입 입력값 (예: 체중)
 *         note      : string         // note 타입 또는 부가 메모 텍스트
 *       }
 *   - totalScore   : number, 그 날 획득한 총 점수 (완료 습관 수 * 10)
 *   - xpEarned     : number, 그 날 획득한 총 경험치
 *   - coinsEarned  : number, 그 날 획득한 총 코인
 *   - updatedAt    : number, 마지막 저장 시각(epoch ms)
 *
 * [스토어 3] meta  (keyPath: 'key', 단순 key-value 저장소)
 *   - key: 'badges'     -> Array<{ id, unlockedAt }>  (달성 시각을 보존해야 하므로 직접 저장)
 *   - key: 'weeklyBoss' -> { weekStart, tier }  (연승 난이도(tier)만 저장, 나머지는 계산으로 도출)
 *   - key: 'settings'   -> { theme: 'light' | 'dark' | 'system' }
 *
 *   레벨/경험치/코인/스트릭/보스 체력 등은 별도로 저장하지 않는다.
 *   dailyRecords 전체를 항상 신뢰 가능한 단일 소스로 두고 그때그때
 *   합산/계산해서 구하기 때문에, 기록을 가져오기(import)하거나 습관을
 *   수정/삭제해도 항상 실제 기록과 일치하는 값을 보여줄 수 있다.
 *
 * 백업 파일(JSON)은 위 세 스토어의 전체 내용을 그대로 담은
 * { version, exportedAt, habits, dailyRecords, meta } 형태로 내보낸다.
 */

export const DB_NAME = 'health-quest-db';
export const DB_VERSION = 1;

export const STORE_HABITS = 'habits';
export const STORE_DAILY_RECORDS = 'dailyRecords';
export const STORE_META = 'meta';

// 앱 최초 실행 시 자동으로 만들어지는 기본 건강 습관 8종
export const DEFAULT_HABITS = [
  { name: '물 1L 이상 마시기', icon: '💧', type: 'check' },
  { name: '20분 이상 걷기', icon: '🚶', type: 'check' },
  { name: '스트레칭', icon: '🤸', type: 'check' },
  { name: '야식 먹지 않기', icon: '🌙', type: 'check' },
  { name: '자정 전 취침', icon: '😴', type: 'check' },
  { name: '약 복용 확인', icon: '💊', type: 'check' },
  { name: '체중 기록', icon: '⚖️', type: 'number', unit: 'kg' },
  { name: '과음하지 않기', icon: '🚫', type: 'check' },
];

export const MAX_HABIT_NAME_LENGTH = 30;
export const MAX_NOTE_LENGTH = 300;
