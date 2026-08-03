import { useState } from 'react';
import { AppProvider, useApp } from './state/AppContext.jsx';
import AppShell from './components/layout/AppShell.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import SaveToast from './components/layout/SaveToast.jsx';
import BadgeToast from './components/layout/BadgeToast.jsx';
import UpdatePrompt from './components/layout/UpdatePrompt.jsx';
import TodayQuestScreen from './components/today/TodayQuestScreen.jsx';
import GrowthScreen from './components/growth/GrowthScreen.jsx';
import RecordsScreen from './components/records/RecordsScreen.jsx';
import WeeklyBossScreen from './components/weeklyBoss/WeeklyBossScreen.jsx';
import SettingsScreen from './components/settings/SettingsScreen.jsx';

const SCREENS = {
  today: TodayQuestScreen,
  growth: GrowthScreen,
  records: RecordsScreen,
  boss: WeeklyBossScreen,
  settings: SettingsScreen,
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('today');
  const { status, errorMessage } = useApp();
  const ActiveScreen = SCREENS[activeTab];

  if (status === 'loading') {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <span className="app-loading__spinner" aria-hidden="true" />
        <p>건강 퀘스트를 불러오는 중입니다…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="app-loading app-loading--error" role="alert">
        <p>앱을 불러오지 못했습니다.</p>
        <p className="app-loading__detail">{errorMessage}</p>
        <button type="button" onClick={() => window.location.reload()}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <>
      <AppShell nav={<BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />}>
        <ActiveScreen />
      </AppShell>
      <SaveToast />
      <BadgeToast />
      <UpdatePrompt />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
