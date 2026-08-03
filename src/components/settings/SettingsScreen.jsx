import HabitManager from './HabitManager.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import BackupRestore from './BackupRestore.jsx';
import ResetData from './ResetData.jsx';
import Disclaimer from './Disclaimer.jsx';

export default function SettingsScreen() {
  return (
    <section aria-labelledby="settings-heading">
      <h1 id="settings-heading" className="visually-hidden">
        설정
      </h1>
      <HabitManager />
      <ThemeToggle />
      <BackupRestore />
      <ResetData />
      <Disclaimer />
    </section>
  );
}
