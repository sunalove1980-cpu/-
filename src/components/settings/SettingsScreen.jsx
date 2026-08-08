import ThemeToggle from './ThemeToggle.jsx';
import BackupRestore from './BackupRestore.jsx';
import ResetData from './ResetData.jsx';
import './SettingsScreen.css';

export default function SettingsScreen() {
  return (
    <div className="settings-screen">
      <section>
        <h2 className="section-title">화면 테마</h2>
        <ThemeToggle />
      </section>

      <section>
        <h2 className="section-title">백업 / 복원</h2>
        <BackupRestore />
      </section>

      <section>
        <h2 className="section-title">데이터 초기화</h2>
        <ResetData />
      </section>

      <section>
        <h2 className="section-title">안내</h2>
        <p className="settings-screen__notice">
          이 앱은 서버나 계정 없이 이 기기(브라우저)에만 기록을 저장합니다. 브라우저 데이터를 지우거나
          앱을 삭제하면 기록도 함께 사라질 수 있으니, 중요한 기록은 설정 화면의 백업 기능으로 주기적으로
          저장해 두는 것을 권장합니다.
        </p>
      </section>
    </div>
  );
}
