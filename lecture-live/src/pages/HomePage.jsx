import { Archive, MonitorPlay, PenLine, Radio } from 'lucide-react';
import { formatDateKey, todayKey } from '../lib/dates';

// 첫 화면: 역할(발표 화면 / 참여하기 / 지난 기록) 선택
export default function HomePage() {
  return (
    <div className="home">
      <div className="home-card">
        <span className="home-mark">
          <Radio className="icon" size={20} strokeWidth={2} />
        </span>
        <h1 className="home-title">강의 라이브 보드</h1>
        <p className="home-date">{formatDateKey(todayKey())}</p>
        <p className="home-desc">
          QR 코드로 접속한 참여자들의 글이 발표 화면에 실시간으로 표시됩니다.
          글은 날짜별로 자동 저장됩니다.
        </p>
        <nav className="home-nav">
          <a className="home-btn primary" href="#/screen">
            <MonitorPlay className="icon" size={20} strokeWidth={1.75} />
            <span className="home-btn-body">
              발표 화면 열기
              <small>프로젝터·모니터에 띄우는 화면 (QR 코드 포함)</small>
            </span>
          </a>
          <a className="home-btn" href="#/write">
            <PenLine className="icon" size={20} strokeWidth={1.75} />
            <span className="home-btn-body">
              참여자로 글쓰기
              <small>이름과 글을 입력하면 화면에 바로 표시됩니다</small>
            </span>
          </a>
          <a className="home-btn" href="#/archive">
            <Archive className="icon" size={20} strokeWidth={1.75} />
            <span className="home-btn-body">
              지난 기록 보기
              <small>날짜별 글 모아보기 · 파일로 저장</small>
            </span>
          </a>
        </nav>
      </div>
    </div>
  );
}
