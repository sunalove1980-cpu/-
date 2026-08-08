import { useRef, useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { blobToDataUrl, dataUrlToBlob } from '../../utils/imageUtils.js';
import './BackupRestore.css';

const BACKUP_VERSION = 1;

export default function BackupRestore() {
  const { records, importAllRecords } = useApp();
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    setIsBusy(true);
    try {
      const serialized = await Promise.all(
        records.map(async (record) => ({
          ...record,
          images: await Promise.all(
            (record.images || []).map(async (img) => ({
              id: img.id,
              caption: img.caption,
              addedAt: img.addedAt,
              dataUrl: await blobToDataUrl(img.blob),
            })),
          ),
        })),
      );

      const payload = { version: BACKUP_VERSION, exportedAt: Date.now(), records: serialized };
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `gamsang-note-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      window.alert(err.message || '백업 파일을 만들지 못했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!window.confirm('복원하면 현재 기기에 저장된 기록이 백업 파일 내용으로 모두 교체됩니다. 계속할까요?')) {
      return;
    }

    setIsBusy(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const records = (payload.records || []).map((record) => ({
        ...record,
        images: (record.images || []).map((img) => ({
          id: img.id,
          caption: img.caption,
          addedAt: img.addedAt,
          blob: dataUrlToBlob(img.dataUrl),
        })),
      }));
      await importAllRecords(records);
    } catch {
      window.alert('백업 파일을 읽지 못했습니다. 파일이 올바른지 확인해 주세요.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="backup-restore">
      <p className="backup-restore__desc">
        사진을 포함한 모든 기록을 파일 하나로 내보내거나, 다른 기기에서 불러올 수 있어요.
        기기를 바꾸거나 앱을 재설치하기 전에 백업해 두는 걸 추천해요.
      </p>
      <div className="backup-restore__buttons">
        <button type="button" onClick={handleExport} disabled={isBusy || records.length === 0}>
          내보내기 (백업)
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isBusy}>
          가져오기 (복원)
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImportFile}
        className="visually-hidden"
      />
    </div>
  );
}
