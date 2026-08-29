import './ActionBar.css';

export default function ActionBar({ onOpenLunch, onOpenIcebreaker }) {
  return (
    <div className="action-bar">
      <button type="button" className="action-bar__btn action-bar__btn--lunch" onClick={onOpenLunch}>
        <span className="action-bar__emoji">🍱</span>
        <span>
          <strong>점심 룰렛</strong>
          <small>오늘 뭐 먹지?</small>
        </span>
      </button>

      <button type="button" className="action-bar__btn action-bar__btn--icebreaker" onClick={onOpenIcebreaker}>
        <span className="action-bar__emoji">💬</span>
        <span>
          <strong>아이스브레이커</strong>
          <small>질문 카드 뽑기</small>
        </span>
      </button>
    </div>
  );
}
