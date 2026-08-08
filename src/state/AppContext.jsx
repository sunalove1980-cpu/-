import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { listRecords, createRecord, updateRecord, deleteRecord, replaceAllRecords } from '../db/recordsRepo.js';
import { getOne, putOne, clearAllStores, STORE_META } from '../db/db.js';

const AppContext = createContext(null);

const THEME_KEY = 'theme';

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function AppProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [records, setRecords] = useState([]);
  const [theme, setThemeState] = useState('system');
  const [toast, setToast] = useState(null);

  const refresh = useCallback(async () => {
    const all = await listRecords();
    setRecords(all);
    return all;
  }, []);

  useEffect(() => {
    let cancelled = false;

    // 브라우저에 "이 사이트의 저장 데이터를 지우지 말아 달라"고 요청한다.
    // 승인되면 기기 저장공간이 부족해도 IndexedDB의 기록이 자동 삭제 대상에서 제외된다.
    // (지원하지 않는 브라우저에서는 조용히 무시된다)
    if (navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {});
    }

    (async () => {
      try {
        await refresh();
        const savedTheme = await getOne(STORE_META, THEME_KEY);
        if (!cancelled) {
          if (savedTheme?.value) {
            setThemeState(savedTheme.value);
            applyTheme(savedTheme.value);
          }
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err.message || String(err));
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const showToast = useCallback((message) => {
    setToast({ id: Date.now(), message });
  }, []);

  const addRecord = useCallback(
    async (data) => {
      const record = await createRecord(data);
      await refresh();
      showToast('기록을 저장했어요');
      return record;
    },
    [refresh, showToast],
  );

  const editRecord = useCallback(
    async (id, patch) => {
      const record = await updateRecord(id, patch);
      await refresh();
      showToast('수정 내용을 저장했어요');
      return record;
    },
    [refresh, showToast],
  );

  const removeRecord = useCallback(
    async (id) => {
      await deleteRecord(id);
      await refresh();
      showToast('기록을 삭제했어요');
    },
    [refresh, showToast],
  );

  const setTheme = useCallback(async (next) => {
    setThemeState(next);
    applyTheme(next);
    await putOne(STORE_META, { key: THEME_KEY, value: next });
  }, []);

  const importAllRecords = useCallback(
    async (importedRecords) => {
      await replaceAllRecords(importedRecords);
      await refresh();
      showToast('기록을 복원했어요');
    },
    [refresh, showToast],
  );

  const resetAll = useCallback(async () => {
    await clearAllStores();
    await refresh();
    showToast('모든 기록을 삭제했어요');
  }, [refresh, showToast]);

  const value = useMemo(
    () => ({
      status,
      errorMessage,
      records,
      refresh,
      addRecord,
      editRecord,
      removeRecord,
      importAllRecords,
      resetAll,
      theme,
      setTheme,
      toast,
      clearToast: () => setToast(null),
    }),
    [
      status,
      errorMessage,
      records,
      refresh,
      addRecord,
      editRecord,
      removeRecord,
      importAllRecords,
      resetAll,
      theme,
      setTheme,
      toast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp은 AppProvider 내부에서만 사용할 수 있습니다.');
  return ctx;
}
