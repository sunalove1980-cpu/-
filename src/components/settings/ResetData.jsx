import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import './ResetData.css';

// 실수로 전체 삭제하는 일이 없도록 2단계 확인을 거친다.
export default function ResetData() {
  const { resetAll } = useApp();
  const [confirmStep, setConfirmStep] = useState(0);

  const handleClick = async () => {
    if (confirmStep === 0) {
      setConfirmStep(1);
      return;
    }
    if (!window.confirm('정말로 모든 기록을 삭제할까요? 이 작업은 되돌릴 수 없습니다.')) {
      setConfirmStep(0);
      return;
    }
    await resetAll();
    setConfirmStep(0);
  };

  return (
    <div className="reset-data">
      <p className="reset-data__desc">모든 기록과 첨부 사진을 이 기기에서 영구적으로 삭제합니다.</p>
      <button type="button" className="reset-data__button" onClick={handleClick}>
        {confirmStep === 0 ? '전체 기록 삭제' : '정말로 삭제하려면 다시 눌러주세요'}
      </button>
    </div>
  );
}
