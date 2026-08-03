import { useApp } from '../../state/AppContext.jsx';
import './ResetData.css';

export default function ResetData() {
  const { actions } = useApp();

  const handleReset = async () => {
    const firstConfirm = window.confirm(
      '정말 모든 기록을 초기화할까요? 습관, 날짜별 기록, 레벨, 배지가 모두 사라지고 되돌릴 수 없습니다.',
    );
    if (!firstConfirm) return;

    const secondConfirm = window.confirm('마지막 확인입니다. 정말로 전체 데이터를 삭제하시겠어요?');
    if (!secondConfirm) return;

    await actions.resetAllData();
  };

  return (
    <section aria-labelledby="reset-heading" className="reset-data">
      <h2 id="reset-heading" className="section-title">
        데이터 초기화
      </h2>
      <p className="reset-data__desc">
        모든 습관, 기록, 레벨, 배지를 완전히 삭제하고 처음 상태로 되돌립니다. 이 작업은 되돌릴 수 없어요.
      </p>
      <button type="button" className="reset-data__btn" onClick={handleReset}>
        전체 데이터 초기화
      </button>
    </section>
  );
}
