import { useMemo, useState } from 'react';
import { AppProvider, useApp } from './state/AppContext.jsx';
import AppShell from './components/layout/AppShell.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import SaveToast from './components/layout/SaveToast.jsx';
import RecordListScreen from './components/list/RecordListScreen.jsx';
import RecordDetailScreen from './components/detail/RecordDetailScreen.jsx';
import RecordFormScreen from './components/form/RecordFormScreen.jsx';
import SettingsScreen from './components/settings/SettingsScreen.jsx';

// 라우팅 라이브러리 없이 화면 상태만으로 전환한다: 목록 / 상세 / 작성·수정 / 설정
function AppContent() {
  const { status, errorMessage, records } = useApp();
  const [activeTab, setActiveTab] = useState('list');
  const [view, setView] = useState({ name: 'list' });

  const selectedRecord = useMemo(() => {
    if (view.name !== 'detail' && view.name !== 'edit') return null;
    return records.find((record) => record.id === view.id) || null;
  }, [records, view]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setView({ name: tab === 'list' ? 'list' : 'settings' });
  };

  if (status === 'loading') {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <span className="app-loading__spinner" aria-hidden="true" />
        <p>감상노트를 불러오는 중입니다…</p>
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

  let screen;
  if (view.name === 'form') {
    screen = (
      <RecordFormScreen
        onDone={() => {
          setActiveTab('list');
          setView({ name: 'list' });
        }}
        onCancel={() => setView({ name: 'list' })}
      />
    );
  } else if (view.name === 'edit' && selectedRecord) {
    screen = (
      <RecordFormScreen
        record={selectedRecord}
        onDone={() => setView({ name: 'detail', id: selectedRecord.id })}
        onCancel={() => setView({ name: 'detail', id: selectedRecord.id })}
      />
    );
  } else if (view.name === 'detail' && selectedRecord) {
    screen = (
      <RecordDetailScreen
        record={selectedRecord}
        onEdit={() => setView({ name: 'edit', id: selectedRecord.id })}
        onBack={() => setView({ name: 'list' })}
      />
    );
  } else if (view.name === 'settings') {
    screen = <SettingsScreen />;
  } else {
    screen = (
      <RecordListScreen
        onSelect={(id) => setView({ name: 'detail', id })}
        onAdd={() => setView({ name: 'form' })}
      />
    );
  }

  return (
    <>
      <AppShell nav={<BottomNav activeTab={activeTab} onChangeTab={changeTab} />}>{screen}</AppShell>
      <SaveToast />
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
