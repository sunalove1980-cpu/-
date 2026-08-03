import { useRef, useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import './BackupRestore.css';

export default function BackupRestore() {
  const { actions } = useApp();
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState(null);

  const handleExport = () => {
    const data = actions.buildBackupData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-quest-backup-${data.exportedAt}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const confirmed = window.confirm(
      '백업 파일을 불러오면 현재 기기에 저장된 모든 기록을 덮어씁니다. 계속할까요?',
    );
    if (!confirmed) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await actions.restoreFromBackup(data);
    } catch (err) {
      setImportError(err?.message || '백업 파일을 읽는 중 오류가 발생했습니다.');
    }
  };

  return (
    <section aria-labelledby="backup-heading" className="backup-restore">
      <h2 id="backup-heading" className="section-title">
        백업 &amp; 복원
      </h2>
      <p className="backup-restore__desc">
        모든 습관, 날짜별 기록, 레벨과 배지 정보를 JSON 파일로 저장하거나 불러올 수 있어요.
      </p>
      <div className="backup-restore__actions">
        <button type="button" onClick={handleExport} className="backup-restore__btn">
          📤 내보내기 (백업)
        </button>
        <button type="button" onClick={handleImportClick} className="backup-restore__btn backup-restore__btn--outline">
          📥 불러오기 (복원)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="visually-hidden"
          onChange={handleFileChange}
          aria-label="백업 JSON 파일 선택"
        />
      </div>
      {importError && (
        <p className="backup-restore__error" role="alert">
          {importError}
        </p>
      )}
    </section>
  );
}
