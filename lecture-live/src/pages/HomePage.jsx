import { Archive, ChevronRight, MonitorPlay, PenLine } from 'lucide-react';
import { formatDateKey, todayKey } from '../lib/dates';

const ROWS = [
  {
    href: '#/screen',
    icon: MonitorPlay,
    title: '발표 화면 열기',
    desc: '프로젝터·모니터에 띄우는 화면 (QR 코드 포함)',
  },
  {
    href: '#/write',
    icon: PenLine,
    title: '참여자로 글쓰기',
    desc: '이름과 글을 입력하면 화면에 바로 표시됩니다',
  },
  {
    href: '#/archive',
    icon: Archive,
    title: '지난 기록 보기',
    desc: '날짜별 글 모아보기 · 파일로 저장',
  },
];

// 첫 화면: 역할(발표 화면 / 참여하기 / 지난 기록) 선택
export default function HomePage() {
  return (
    <div className="home">
      <header className="home-topbar">
        <span className="home-topbar-mark" />
        <span className="home-topbar-name">강의 라이브 보드</span>
      </header>

      <div className="home-body">
        <p className="home-eyebrow">{formatDateKey(todayKey())}</p>
        <h1 className="home-heading">오늘 진행할 세션을 선택하세요</h1>
        <p className="home-desc">
          QR 코드로 접속한 참여자들의 글이 발표 화면에 실시간으로 표시됩니다.
          글은 날짜별로 자동 저장됩니다.
        </p>

        <nav className="home-list">
          {ROWS.map(({ href, icon: Icon, title, desc }) => (
            <a key={href} className="home-row" href={href}>
              <Icon className="icon" size={18} strokeWidth={1.75} />
              <span className="home-row-body">
                <span className="home-row-title">{title}</span>
                <span className="home-row-desc">{desc}</span>
              </span>
              <ChevronRight className="icon home-row-chevron" size={16} strokeWidth={2} />
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
