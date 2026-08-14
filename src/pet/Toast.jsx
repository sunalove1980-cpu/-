// 화면 하단에 잠깐 떴다 사라지는 짧은 안내 문구. 지난 날짜에 기록을 남겼을 때처럼,
// 펫이 반응하지 않는 조용한 액션의 결과를 알려줄 때 쓴다.
import './Toast.css';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="toast" role="status">
      {message}
    </div>
  );
}
